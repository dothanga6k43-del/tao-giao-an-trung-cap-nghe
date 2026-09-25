import ExcelJS from "exceljs";
import Anthropic from "@anthropic-ai/sdk";
import { docHtmlTuDocx } from "@/lib/chuongtrinh/import";

export type NgayTrongTuanTrichXuat = {
  thu: number; // 2..8 (2 = Thu Hai, 8 = Chu Nhat)
  monHoc: string | null;
  soGioLuyKe: number | null;
  giaoVien: string | null;
  ghiChu: string | null;
};

export type KhoiTietTrichXuat = {
  tietBlock: string; // vd "1.2" hoac "3.4.5"
  cacNgay: NgayTrongTuanTrichXuat[];
};

export type LopHocTrichXuat = {
  lop: string;
  diaDiem: string | null;
  ghiChuTongHop: string | null;
  tietBlocks: KhoiTietTrichXuat[];
};

export type ThoiKhoaBieuTrichXuat = {
  tieuDe: string;
  tuanThu: number | null;
  ngayBatDau: string | null; // ISO yyyy-mm-dd
  ngayKetThuc: string | null;
  buoiHoc: string | null;
  lopHoc: LopHocTrichXuat[];
};

function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function model() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
}

export async function vanBanTuExcel(buffer: Buffer): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const phan: string[] = [];
  workbook.eachSheet((sheet) => {
    phan.push(`--- Sheet: ${sheet.name} ---`);
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const oGia = (row.values as unknown[]).slice(1).map((v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === "object" && v !== null && "text" in (v as Record<string, unknown>)) {
          return String((v as { text: unknown }).text);
        }
        if (typeof v === "object" && v !== null && "richText" in (v as Record<string, unknown>)) {
          const rt = (v as { richText: { text: string }[] }).richText;
          return rt.map((r) => r.text).join("");
        }
        return String(v);
      });
      phan.push(oGia.join(" | "));
    });
  });
  return phan.join("\n");
}

const TEN_CONG_CU = "luu_thoi_khoa_bieu";

const SCHEMA = {
  type: "object" as const,
  properties: {
    tieuDe: { type: "string", description: "Tiêu đề thời khóa biểu, vd 'THỜI KHÓA BIỂU HỌC KỲ III – KHÓA 22'" },
    tuanThu: { type: ["number", "null"], description: "Số thứ tự tuần nếu có nêu, vd 49" },
    ngayBatDau: { type: ["string", "null"], description: "Ngày bắt đầu tuần, định dạng YYYY-MM-DD, null nếu không có" },
    ngayKetThuc: { type: ["string", "null"], description: "Ngày kết thúc tuần, định dạng YYYY-MM-DD, null nếu không có" },
    buoiHoc: { type: ["string", "null"], description: "Buổi học nếu có ghi rõ, vd 'Học sáng'" },
    lopHoc: {
      type: "array",
      description: "Danh sách các lớp trong thời khóa biểu",
      items: {
        type: "object",
        properties: {
          lop: { type: "string" },
          diaDiem: { type: ["string", "null"] },
          ghiChuTongHop: {
            type: ["string", "null"],
            description:
              "Nội dung cột cuối (thường là SDT giáo viên / tổng số giờ môn học) áp dụng chung cho cả lớp này, giữ nguyên văn nếu có",
          },
          tietBlocks: {
            type: "array",
            description:
              "Mỗi lớp thường có nhiều khối tiết (vd '1.2' và '3.4' hoặc '3.4.5') - mỗi khối là 1 dòng riêng trong bảng gốc",
            items: {
              type: "object",
              properties: {
                tietBlock: {
                  type: "string",
                  description: "Chuỗi số tiết nguyên văn, vd '1.2' hoặc '3.4.5'",
                },
                cacNgay: {
                  type: "array",
                  description: "Nội dung của khối tiết này theo từng thứ trong tuần (chỉ các thứ có cột trong bảng)",
                  items: {
                    type: "object",
                    properties: {
                      thu: {
                        type: "number",
                        description: "2 = Thứ Hai, 3 = Thứ Ba ... 7 = Thứ Bảy, 8 = Chủ Nhật",
                      },
                      monHoc: {
                        type: ["string", "null"],
                        description: "Tên môn học hoặc nội dung ghi trong ô (vd 'Sinh hoạt lớp'), null nếu ô trống",
                      },
                      soGioLuyKe: {
                        type: ["number", "null"],
                        description: "Số giờ lũy kế ghi kèm trong ô (vd '80h' -> 80), null nếu không có",
                      },
                      giaoVien: {
                        type: ["string", "null"],
                        description: "Tên/ký hiệu giáo viên ghi kèm trong ô, vd 'C. Lê'",
                      },
                      ghiChu: { type: ["string", "null"] },
                    },
                    required: ["thu", "monHoc", "soGioLuyKe", "giaoVien", "ghiChu"],
                  },
                },
              },
              required: ["tietBlock", "cacNgay"],
            },
          },
        },
        required: ["lop", "diaDiem", "ghiChuTongHop", "tietBlocks"],
      },
    },
  },
  required: ["tieuDe", "tuanThu", "ngayBatDau", "ngayKetThuc", "buoiHoc", "lopHoc"],
};

const HUONG_DAN = `Đây là một thời khóa biểu tuần của trường trung cấp nghề Việt Nam. Bảng có các cột: Lớp, Địa điểm, Số giờ (khối tiết, có thể nhiều dòng cho 1 lớp vd "1.2" và "3.4"/"3.4.5"), rồi các cột Thứ 2 - Thứ 6/7 (mỗi ô thường có tên môn học và có thể kèm số giờ lũy kế + tên giáo viên viết tắt, vd "80h - C. Lê"), và cột cuối thường là SDT giáo viên/tổng số giờ môn học.

Hãy trích xuất TOÀN BỘ dữ liệu, giữ đúng cấu trúc: mỗi lớp có thể có nhiều khối tiết (tietBlocks), mỗi khối tiết có nội dung riêng theo từng thứ trong tuần (cacNgay). Giữ nguyên văn tiếng Việt, không tự suy diễn thêm dữ liệu không có trong bảng. Gọi công cụ ${TEN_CONG_CU}.`;

async function goiAITrichXuat(
  content: Anthropic.MessageParam["content"]
): Promise<ThoiKhoaBieuTrichXuat> {
  const message = await client().messages.create({
    model: model(),
    max_tokens: 4000,
    messages: [{ role: "user", content }],
    tools: [
      {
        name: TEN_CONG_CU,
        description: "Lưu dữ liệu thời khóa biểu đã trích xuất",
        input_schema: SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: TEN_CONG_CU },
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("AI không trả về kết quả hợp lệ, vui lòng thử lại");
  }
  const ket = toolUse.input as Partial<ThoiKhoaBieuTrichXuat>;
  if (!ket.lopHoc || !Array.isArray(ket.lopHoc) || ket.lopHoc.length === 0) {
    throw new Error("AI không trích xuất được danh sách lớp, vui lòng thử lại");
  }
  return ket as ThoiKhoaBieuTrichXuat;
}

export async function phanTichThoiKhoaBieuTuAnh(
  base64: string,
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif"
): Promise<ThoiKhoaBieuTrichXuat> {
  return goiAITrichXuat([
    {
      type: "image",
      source: { type: "base64", media_type: mediaType, data: base64 },
    },
    { type: "text", text: HUONG_DAN },
  ]);
}

export async function phanTichThoiKhoaBieuTuVanBan(
  noiDung: string
): Promise<ThoiKhoaBieuTrichXuat> {
  return goiAITrichXuat([
    { type: "text", text: `${HUONG_DAN}\n\nNội dung:\n${noiDung}` },
  ]);
}

export { docHtmlTuDocx };
