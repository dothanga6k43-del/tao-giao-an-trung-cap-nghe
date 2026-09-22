import mammoth from "mammoth";
import Anthropic from "@anthropic-ai/sdk";

export type NoiDungMucTrichXuat = {
  tieuDe: string;
  loai: "LT" | "TH" | "KT";
  thoiGianTiet: number | null;
  children?: NoiDungMucTrichXuat[];
};

export type BaiHocTrichXuat = {
  thuTu: number;
  tenBai: string;
  tongSoGio: number;
  lyThuyetGio: number;
  thucHanhGio: number;
  kiemTraGio: number;
  mucTieu: string | null;
  noiDungMuc: NoiDungMucTrichXuat[];
};

export type ChuongTrinhTrichXuat = {
  tenMonHoc: string;
  maMonHoc: string | null;
  tongSoGio: number;
  lyThuyetGio: number;
  thucHanhGio: number;
  kiemTraGio: number;
  viTriTinhChat: string | null;
  mucTieu: string | null;
  dieuKienThucHien: string | null;
  phuongPhapDanhGia: string | null;
  taiLieuThamKhao: string | null;
  baiHoc: BaiHocTrichXuat[];
};

const TEN_CONG_CU = "luu_chuong_trinh_mon_hoc";

const MUC_SCHEMA_LA = {
  type: "object" as const,
  properties: {
    tieuDe: { type: "string" },
    loai: { type: "string", enum: ["LT", "TH", "KT"] },
    thoiGianTiet: {
      type: ["number", "null"],
      description:
        "Số giờ/tiết CHỈ khi văn bản gốc nêu rõ cho đúng đề mục này. Nếu không có, để null (người dùng sẽ tự gán sau).",
    },
  },
  required: ["tieuDe", "loai", "thoiGianTiet"],
};

const SCHEMA_CONG_CU = {
  type: "object" as const,
  properties: {
    tenMonHoc: { type: "string" },
    maMonHoc: { type: ["string", "null"] },
    tongSoGio: { type: "number" },
    lyThuyetGio: { type: "number" },
    thucHanhGio: { type: "number" },
    kiemTraGio: { type: "number" },
    viTriTinhChat: { type: ["string", "null"] },
    mucTieu: { type: ["string", "null"] },
    dieuKienThucHien: { type: ["string", "null"] },
    phuongPhapDanhGia: { type: ["string", "null"] },
    taiLieuThamKhao: { type: ["string", "null"] },
    baiHoc: {
      type: "array",
      items: {
        type: "object",
        properties: {
          thuTu: { type: "number" },
          tenBai: { type: "string" },
          tongSoGio: { type: "number" },
          lyThuyetGio: { type: "number" },
          thucHanhGio: { type: "number" },
          kiemTraGio: { type: "number" },
          mucTieu: { type: ["string", "null"] },
          noiDungMuc: {
            type: "array",
            description:
              "Đề mục lớn (1, 2, 3...) trong phần Nội dung chi tiết của bài này",
            items: {
              ...MUC_SCHEMA_LA,
              properties: {
                ...MUC_SCHEMA_LA.properties,
                children: {
                  type: "array",
                  description: "Đề mục con (1.1, 1.2...) nếu có",
                  items: MUC_SCHEMA_LA,
                },
              },
            },
          },
        },
        required: [
          "thuTu",
          "tenBai",
          "tongSoGio",
          "lyThuyetGio",
          "thucHanhGio",
          "kiemTraGio",
          "mucTieu",
          "noiDungMuc",
        ],
      },
    },
  },
  required: [
    "tenMonHoc",
    "maMonHoc",
    "tongSoGio",
    "lyThuyetGio",
    "thucHanhGio",
    "kiemTraGio",
    "viTriTinhChat",
    "mucTieu",
    "dieuKienThucHien",
    "phuongPhapDanhGia",
    "taiLieuThamKhao",
    "baiHoc",
  ],
};

export async function docHtmlTuDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.convertToHtml({ buffer });
  return result.value;
}

export async function phanTichChuongTrinhBangAI(
  html: string
): Promise<ChuongTrinhTrichXuat> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  const prompt = `Đây là nội dung HTML trích xuất từ file Word "Chương trình môn học" theo mẫu đào tạo trung cấp nghề Việt Nam. Hãy đọc và trích xuất thành dữ liệu có cấu trúc, gọi công cụ ${TEN_CONG_CU}.

Yêu cầu quan trọng:
- Giữ nguyên văn bản tiếng Việt, không dịch, không rút gọn nội dung mục tiêu/điều kiện thực hiện/tài liệu tham khảo.
- Phần "Nội dung tổng quát và phân phối thời gian" (bảng đầu) cho biết Tổng số/Lý thuyết/Thực hành/Kiểm tra của TỪNG BÀI và của CẢ MÔN HỌC — dùng đúng các số này.
- Phần "Nội dung chi tiết" liệt kê đề mục phân cấp cho từng bài (dạng 1., 1.1., 1.2... hoặc tương tự). Với mỗi bài, trích xuất đúng cấu trúc cây 2 cấp: đề mục lớn (children rỗng nếu không có mục con) và đề mục con.
- Xác định "loai" (LT/TH/KT) dựa vào ngữ cảnh: mặc định LT trừ khi đề mục rõ ràng là thực hành (TH) hoặc kiểm tra (KT).
- TUYỆT ĐỐI KHÔNG tự bịa số giờ cho từng đề mục chi tiết nếu văn bản không nói rõ — để thoiGianTiet = null trong trường hợp đó. Chỉ điền thoiGianTiet khi có con số tường minh gắn với đúng đề mục.
- Nếu văn bản có sai lệch nhỏ giữa các con số (ví dụ tổng không khớp lý thuyết+thực hành), cứ trích xuất đúng như những gì đọc được ở phần chi tiết nhất (đoạn mô tả "Thời gian: Xh (LT: Yh; TH: Zh)" của từng bài đáng tin hơn bảng tổng quát nếu có mâu thuẫn).

Nội dung HTML:
${html}`;

  const message = await client.messages.create({
    model,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: TEN_CONG_CU,
        description: "Lưu dữ liệu chương trình môn học đã trích xuất",
        input_schema: SCHEMA_CONG_CU,
      },
    ],
    tool_choice: { type: "tool", name: TEN_CONG_CU },
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("AI không trả về kết quả hợp lệ, vui lòng thử lại");
  }

  return toolUse.input as ChuongTrinhTrichXuat;
}
