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

function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function model() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
}

export async function docHtmlTuDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.convertToHtml({ buffer });
  return result.value;
}

// ---- Buoc 1 (nhanh): chi lay ten mon + danh sach bai (ten, so gio) ----
// Tach rieng khoi cac doan van ban dai de khong lam cham buoc nay,
// vi ten cac bai can co truoc de bat dau chay song song buoc 2 va 3.

const TEN_CONG_CU_LOI = "luu_thong_tin_loi";

const SCHEMA_LOI = {
  type: "object" as const,
  properties: {
    tenMonHoc: { type: "string" },
    maMonHoc: { type: ["string", "null"] },
    tongSoGio: { type: "number" },
    lyThuyetGio: { type: "number" },
    thucHanhGio: { type: "number" },
    kiemTraGio: { type: "number" },
    baiHoc: {
      type: "array",
      description:
        "Danh sách các bài lấy từ bảng 'Nội dung tổng quát và phân phối thời gian'",
      items: {
        type: "object",
        properties: {
          thuTu: { type: "number" },
          tenBai: { type: "string" },
          tongSoGio: { type: "number" },
          lyThuyetGio: { type: "number" },
          thucHanhGio: { type: "number" },
          kiemTraGio: { type: "number" },
          mucTieu: {
            type: ["string", "null"],
            description: "Mục tiêu riêng của bài này nếu có nêu trong phần Nội dung chi tiết",
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
    "baiHoc",
  ],
};

type ThongTinLoi = {
  tenMonHoc: string;
  maMonHoc: string | null;
  tongSoGio: number;
  lyThuyetGio: number;
  thucHanhGio: number;
  kiemTraGio: number;
  baiHoc: Omit<BaiHocTrichXuat, "noiDungMuc">[];
};

async function trichXuatThongTinLoi(html: string): Promise<ThongTinLoi> {
  const prompt = `Đây là nội dung trích xuất từ file "Chương trình môn học/mô đun" (Word hoặc Excel) theo mẫu đào tạo trung cấp nghề Việt Nam. Chỉ trích xuất: tên môn học/mô đun, mã số, tổng số giờ (và LT/TH/KT), và danh sách các bài (tên bài, số giờ mỗi bài). KHÔNG cần các đoạn văn bản dài như mục tiêu/điều kiện thực hiện/tài liệu tham khảo, và KHÔNG cần nội dung chi tiết (1., 1.1...) của từng bài.

Danh sách các bài có thể nằm ở MỘT trong hai dạng sau (tùy file, không phải lúc nào cũng có cả hai):
- Dạng có bảng tổng quát riêng: bảng "Nội dung tổng quát và phân phối thời gian" (hoặc tên tương tự), liệt kê TT/Tên bài/Tổng số/LT/TH/KT.
- Dạng không có bảng tổng quát (thường gặp ở chương trình mô đun): các bài được liệt kê trực tiếp dưới mục "Nội dung môn học"/"Nội dung mô đun" dạng tiêu đề "Bài 1: ...", "Bài 2: ..." kèm "Thời gian: X giờ" ngay trên tiêu đề - hãy lấy tên bài và tổng số giờ từ chính các tiêu đề này. Nếu không có số giờ LT/TH/KT riêng cho từng bài, chia tỉ lệ hợp lý theo tổng LT/TH/KT của toàn môn/mô đun, hoặc để 0 nếu không đủ căn cứ - KHÔNG được bỏ sót bài nào.

Gọi công cụ ${TEN_CONG_CU_LOI}.

Lưu ý: nếu đoạn mô tả chi tiết từng bài ("Thời gian: Xh (LT: Yh; TH: Zh)") có số khác với bảng tổng quát, ưu tiên đoạn mô tả chi tiết.

Nội dung:
${html}`;

  const message = await client().messages.create({
    model: model(),
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: TEN_CONG_CU_LOI,
        description: "Lưu thông tin cốt lõi của chương trình môn học",
        input_schema: SCHEMA_LOI,
      },
    ],
    tool_choice: { type: "tool", name: TEN_CONG_CU_LOI },
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("AI không trả về kết quả hợp lệ, vui lòng thử lại");
  }
  const ket = toolUse.input as Partial<ThongTinLoi>;
  if (!ket.baiHoc || !Array.isArray(ket.baiHoc) || ket.baiHoc.length === 0) {
    throw new Error(
      "AI không trích xuất được danh sách bài học, vui lòng thử lại"
    );
  }
  return ket as ThongTinLoi;
}

// ---- Buoc 2 (chay song song voi buoc 3): cac doan van ban dai ----
// Tach thanh 2 lenh goi rieng vi thoi gian sinh ti le voi tong so token dau
// ra - gop chung 5 truong vao 1 lenh mat gap doi thoi gian so voi tach doi.

const TEN_CONG_CU_MO_TA = "luu_mo_ta_dai";

type MoTaDai = {
  viTriTinhChat: string | null;
  mucTieu: string | null;
  dieuKienThucHien: string | null;
  phuongPhapDanhGia: string | null;
  taiLieuThamKhao: string | null;
};

async function trichXuatMoTaMotPhan<T extends Record<string, string | null>>(
  html: string,
  cacDoan: string,
  properties: Record<string, { type: string[] }>
): Promise<T> {
  const prompt = `Đây là nội dung trích xuất từ file "Chương trình môn học" (Word hoặc Excel). Hãy trích xuất nguyên văn (không dịch, không rút gọn) các đoạn sau nếu có: ${cacDoan}. Gọi công cụ ${TEN_CONG_CU_MO_TA}. Nếu không có đoạn nào đó, để null.

Nội dung:
${html}`;

  const required = Object.keys(properties);
  const message = await client().messages.create({
    model: model(),
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: TEN_CONG_CU_MO_TA,
        description: "Lưu các đoạn mô tả dài của chương trình môn học",
        input_schema: { type: "object", properties, required },
      },
    ],
    tool_choice: { type: "tool", name: TEN_CONG_CU_MO_TA },
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return Object.fromEntries(required.map((k) => [k, null])) as T;
  }
  return toolUse.input as T;
}

async function trichXuatMoTaDai(html: string): Promise<MoTaDai> {
  const [nhomA, nhomB] = await Promise.all([
    trichXuatMoTaMotPhan<Pick<MoTaDai, "dieuKienThucHien">>(
      html,
      `"Điều kiện thực hiện môn học"`,
      { dieuKienThucHien: { type: ["string", "null"] } }
    ),
    trichXuatMoTaMotPhan<
      Pick<MoTaDai, "viTriTinhChat" | "mucTieu" | "phuongPhapDanhGia" | "taiLieuThamKhao">
    >(
      html,
      `"Vị trí, tính chất của môn học", "Mục tiêu môn học", "Phương pháp và nội dung đánh giá", "Tài liệu tham khảo"`,
      {
        viTriTinhChat: { type: ["string", "null"] },
        mucTieu: { type: ["string", "null"] },
        phuongPhapDanhGia: { type: ["string", "null"] },
        taiLieuThamKhao: { type: ["string", "null"] },
      }
    ),
  ]);
  return { ...nhomA, ...nhomB };
}

// ---- Buoc 3 (chay song song, 1 lenh goi cho moi bai): noi dung chi tiet ----

const TEN_CONG_CU_CHI_TIET = "luu_noi_dung_chi_tiet";

const MUC_SCHEMA_LA = {
  type: "object" as const,
  properties: {
    tieuDe: { type: "string" },
    loai: { type: "string", enum: ["LT", "TH", "KT"] },
    thoiGianTiet: {
      type: ["number", "null"],
      description:
        "Số giờ/tiết CHỈ khi văn bản gốc nêu rõ cho đúng đề mục này. Nếu không có, để null.",
    },
  },
  required: ["tieuDe", "loai", "thoiGianTiet"],
};

const SCHEMA_CHI_TIET = {
  type: "object" as const,
  properties: {
    noiDungMuc: {
      type: "array",
      description: "Đề mục lớn (1, 2, 3...) trong phần Nội dung chi tiết của bài này",
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
  required: ["noiDungMuc"],
};

async function trichXuatChiTietMotBai(
  html: string,
  tenBai: string
): Promise<NoiDungMucTrichXuat[]> {
  const prompt = `Đây là nội dung trích xuất từ file "Chương trình môn học/mô đun" (Word hoặc Excel). Dù file có mục riêng gọi là "Nội dung chi tiết" hay không (có file gộp chung phần tổng quát và chi tiết trong một mục như "Nội dung môn học"/"Nội dung mô đun"), hãy tìm đúng phần nội dung của bài có tên "${tenBai}" và trích xuất TOÀN BỘ đề mục phân cấp (dạng 1., 1.1., 1.2... hoặc 2.1., 2.1.1...) của RIÊNG bài này, gọi công cụ ${TEN_CONG_CU_CHI_TIET}. Bỏ qua nội dung chi tiết của các bài khác.

Yêu cầu:
- Giữ nguyên văn bản tiếng Việt.
- Trích xuất đúng cấu trúc cây 2 cấp: đề mục lớn và đề mục con (children rỗng nếu không có mục con).
- Trích xuất ĐẦY ĐỦ tất cả đề mục lớn và đề mục con có trong phần chi tiết của bài này, không bỏ sót.
- Xác định "loai" (LT/TH/KT) dựa vào ngữ cảnh: mặc định LT trừ khi rõ ràng là thực hành (TH) hoặc kiểm tra (KT).
- TUYỆT ĐỐI KHÔNG tự bịa số giờ cho từng đề mục — để thoiGianTiet = null nếu văn bản không nói rõ số giờ cho đúng đề mục đó.

Nội dung:
${html}`;

  const message = await client().messages.create({
    model: model(),
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: TEN_CONG_CU_CHI_TIET,
        description: "Lưu nội dung chi tiết phân cấp của một bài",
        input_schema: SCHEMA_CHI_TIET,
      },
    ],
    tool_choice: { type: "tool", name: TEN_CONG_CU_CHI_TIET },
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return [];
  }
  return (toolUse.input as { noiDungMuc: NoiDungMucTrichXuat[] }).noiDungMuc;
}

// Gioi han kich thuoc noi dung dau vao. Ham nay chay 6 lenh goi AI song
// song, moi lenh deu gui lai TOAN BO noi dung - neu file qua lon, gioi han
// 1 trieu token/request cua Claude se bi vi pham o nhieu lenh cung luc. Bao
// loi ro rang som thay vi de API tra ve loi kho hieu sau khi da cho lau.
const GIOI_HAN_NOI_DUNG_KY_TU = 800_000;

export async function phanTichChuongTrinhBangAI(
  html: string
): Promise<ChuongTrinhTrichXuat> {
  if (html.length > GIOI_HAN_NOI_DUNG_KY_TU) {
    throw new Error(
      "File quá lớn để AI đọc (nội dung quá dài). Vui lòng tách file chương trình thành các phần nhỏ hơn (ví dụ từng môn học riêng) rồi nhập từng phần."
    );
  }
  const loi = await trichXuatThongTinLoi(html);

  const [moTaDai, ...noiDungTungBai] = await Promise.all([
    trichXuatMoTaDai(html),
    ...loi.baiHoc.map((bai) => trichXuatChiTietMotBai(html, bai.tenBai)),
  ]);

  return {
    tenMonHoc: loi.tenMonHoc,
    maMonHoc: loi.maMonHoc,
    tongSoGio: loi.tongSoGio,
    lyThuyetGio: loi.lyThuyetGio,
    thucHanhGio: loi.thucHanhGio,
    kiemTraGio: loi.kiemTraGio,
    ...moTaDai,
    baiHoc: loi.baiHoc.map((bai, idx) => ({
      ...bai,
      noiDungMuc: noiDungTungBai[idx],
    })),
  };
}
