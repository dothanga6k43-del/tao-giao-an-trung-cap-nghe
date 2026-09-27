import Anthropic from "@anthropic-ai/sdk";
import { docHtmlTuDocx } from "@/lib/chuongtrinh/import";
import type { KhungMucMau } from "@/lib/giaoan/schema";

function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function model() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
}

const TEN_CONG_CU = "luu_cau_truc_mau_giao_an";

const SCHEMA = {
  type: "object" as const,
  properties: {
    khungMuc: {
      type: "array",
      description:
        "Danh sách các phần/mục lớn trong bảng 'Thực hiện bài học' của mẫu giáo án này, theo đúng thứ tự xuất hiện (vd Dẫn nhập, Giới thiệu chủ đề, Giải quyết vấn đề / Hướng dẫn ban đầu, Hướng dẫn thường xuyên, Hướng dẫn kết thúc, Hướng dẫn tự học...). KHÔNG lấy nội dung ví dụ cụ thể trong file mẫu, chỉ lấy TÊN và Ý NGHĨA của từng phần.",
      items: {
        type: "object",
        properties: {
          tieuDe: { type: "string", description: "Tên phần/mục, giữ nguyên văn" },
          moTa: {
            type: ["string", "null"],
            description: "Mô tả ngắn gọn (1 câu) nội dung/ý nghĩa của phần này để AI soạn giáo án sau này tham khảo",
          },
        },
        required: ["tieuDe", "moTa"],
      },
      minItems: 1,
    },
  },
  required: ["khungMuc"],
};

const HUONG_DAN = `Đây là một file giáo án mẫu (đã soạn sẵn) của trường trung cấp nghề Việt Nam. Hãy đọc phần "Thực hiện bài học" (bảng có các cột như Nội dung/Hoạt động giáo viên/Hoạt động học sinh/Thời gian) và trích xuất ra danh sách các phần/mục lớn theo đúng thứ tự xuất hiện trong file (ví dụ: Dẫn nhập, Giới thiệu chủ đề, Giải quyết vấn đề, Kết thúc vấn đề, Hướng dẫn tự học - hoặc một cấu trúc khác nếu mẫu này khác, ví dụ mẫu giáo án thực hành có thể có Hướng dẫn ban đầu/Hướng dẫn thường xuyên/Hướng dẫn kết thúc).

Chỉ lấy TÊN và mô tả ngắn ý nghĩa của từng phần - đây là dùng để làm khung mẫu áp dụng cho các bài học khác, không phải để chép lại nội dung ví dụ cụ thể trong file này. Gọi công cụ ${TEN_CONG_CU}.`;

async function goiAITrichXuat(
  content: Anthropic.MessageParam["content"]
): Promise<KhungMucMau[]> {
  const message = await client().messages.create({
    model: model(),
    max_tokens: 2000,
    messages: [{ role: "user", content }],
    tools: [
      {
        name: TEN_CONG_CU,
        description: "Lưu cấu trúc các mục của mẫu giáo án",
        input_schema: SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: TEN_CONG_CU },
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("AI không trả về kết quả hợp lệ, vui lòng thử lại");
  }
  const ket = toolUse.input as { khungMuc?: KhungMucMau[] };
  if (!ket.khungMuc || !Array.isArray(ket.khungMuc) || ket.khungMuc.length === 0) {
    throw new Error("AI không trích xuất được cấu trúc mẫu, vui lòng thử lại");
  }
  return ket.khungMuc;
}

export async function phanTichMauGiaoAnTuDocx(buffer: Buffer): Promise<KhungMucMau[]> {
  const html = await docHtmlTuDocx(buffer);
  if (!html.trim()) {
    throw new Error("Không đọc được nội dung từ file này");
  }
  return goiAITrichXuat([{ type: "text", text: `${HUONG_DAN}\n\nNội dung HTML:\n${html}` }]);
}

export async function phanTichMauGiaoAnTuPdf(buffer: Buffer): Promise<KhungMucMau[]> {
  const base64 = buffer.toString("base64");
  return goiAITrichXuat([
    {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: base64 },
    },
    { type: "text", text: HUONG_DAN },
  ]);
}
