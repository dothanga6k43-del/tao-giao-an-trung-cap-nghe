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
  const prompt = `Đây là nội dung HTML trích xuất từ file Word "Chương trình môn học" theo mẫu đào tạo trung cấp nghề Việt Nam. Chỉ trích xuất: tên môn học, mã môn học, tổng số giờ (và LT/TH/KT), và danh sách các bài từ bảng "Nội dung tổng quát và phân phối thời gian" (tên bài, số giờ mỗi bài). KHÔNG cần các đoạn văn bản dài như mục tiêu/điều kiện thực hiện/tài liệu tham khảo, và KHÔNG cần nội dung chi tiết (1., 1.1...) của từng bài. Gọi công cụ ${TEN_CONG_CU_LOI}.

Lưu ý: nếu đoạn mô tả chi tiết từng bài ("Thời gian: Xh (LT: Yh; TH: Zh)") có số khác với bảng tổng quát, ưu tiên đoạn mô tả chi tiết.

Nội dung HTML:
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
  const prompt = `Đây là nội dung HTML trích xuất từ file Word "Chương trình môn học". Hãy trích xuất nguyên văn (không dịch, không rút gọn) các đoạn sau nếu có: ${cacDoan}. Gọi công cụ ${TEN_CONG_CU_MO_TA}. Nếu không có đoạn nào đó, để null.

Nội dung HTML:
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
  const prompt = `Đây là nội dung HTML của file Word "Chương trình môn học". Trong phần "Nội dung chi tiết", hãy tìm đúng phần của bài có tên "${tenBai}" và trích xuất TOÀN BỘ đề mục phân cấp (dạng 1., 1.1., 1.2...) của RIÊNG bài này, gọi công cụ ${TEN_CONG_CU_CHI_TIET}. Bỏ qua nội dung chi tiết của các bài khác.

Yêu cầu:
- Giữ nguyên văn bản tiếng Việt.
- Trích xuất đúng cấu trúc cây 2 cấp: đề mục lớn và đề mục con (children rỗng nếu không có mục con).
- Trích xuất ĐẦY ĐỦ tất cả đề mục lớn và đề mục con có trong phần chi tiết của bài này, không bỏ sót.
- Xác định "loai" (LT/TH/KT) dựa vào ngữ cảnh: mặc định LT trừ khi rõ ràng là thực hành (TH) hoặc kiểm tra (KT).
- TUYỆT ĐỐI KHÔNG tự bịa số giờ cho từng đề mục — để thoiGianTiet = null nếu văn bản không nói rõ số giờ cho đúng đề mục đó.

Nội dung HTML:
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

export async function phanTichChuongTrinhBangAI(
  html: string
): Promise<ChuongTrinhTrichXuat> {
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
