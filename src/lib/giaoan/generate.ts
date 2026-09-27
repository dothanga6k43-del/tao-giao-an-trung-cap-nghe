import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { parseCauTrucMau, type NoiDungGiaoAn, type MucGiaoAn } from "./schema";

const TEN_CONG_CU = "soan_giao_an";

const MUC_SCHEMA = {
  type: "object" as const,
  properties: {
    tieuDe: { type: "string" },
    thoiGianPhut: { type: "number" },
    noiDung: {
      type: "string",
      description:
        "Nội dung trình bày chi tiết (có thể xuống dòng, gạch đầu dòng). Để chuỗi rỗng nếu mục này không cần trình bày nội dung riêng.",
    },
    hoatDongGV: { type: "string" },
    hoatDongHS: { type: "string" },
  },
  required: ["tieuDe", "thoiGianPhut", "noiDung", "hoatDongGV", "hoatDongHS"],
};

function taoSchemaCongCu(tenCacKhung: string[]) {
  return {
    type: "object" as const,
    properties: {
      kienThuc: { type: "string", description: "Mục tiêu về kiến thức, dạng gạch đầu dòng" },
      kyNang: { type: "string", description: "Mục tiêu về kỹ năng, dạng gạch đầu dòng" },
      nangLucTuChu: {
        type: "string",
        description: "Mục tiêu về năng lực tự chủ và tự chịu trách nhiệm",
      },
      hinhThucToChuc: {
        type: "string",
        description: "Hình thức tổ chức dạy học cho buổi dạy này",
      },
      khungMuc: {
        type: "array",
        description: `Phải có đúng ${tenCacKhung.length} phần tử, theo đúng thứ tự sau (khungMucTieuDe phải khớp chính xác): ${tenCacKhung.map((t, i) => `${i + 1}. "${t}"`).join("; ")}.`,
        items: {
          type: "object",
          properties: {
            khungMucTieuDe: { type: "string", enum: tenCacKhung },
            items: {
              type: "array",
              description:
                "Một hoặc nhiều dòng nội dung cho phần này. Dùng nhiều dòng khi phần này cần chia nhỏ (ví dụ Lý thuyết liên quan / Trình tự thực hiện / Thực hành), một dòng nếu là mục đơn giản.",
              items: MUC_SCHEMA,
              minItems: 1,
            },
          },
          required: ["khungMucTieuDe", "items"],
        },
      },
    },
    required: ["kienThuc", "kyNang", "nangLucTuChu", "hinhThucToChuc", "khungMuc"],
  };
}

export async function soanGiaoAnBangAI(buoiDayId: string) {
  const buoiDay = await prisma.buoiDay.findUniqueOrThrow({
    where: { id: buoiDayId },
    include: {
      lichTrinh: { include: { monHoc: true, lop: true, giaoVien: true } },
      noiDung: {
        orderBy: { thuTu: "asc" },
        include: { noiDungMuc: { include: { baiHoc: true } } },
      },
    },
  });

  const tongPhut = buoiDay.tongTiet * buoiDay.lichTrinh.soPhutMoiTiet;

  const tenBaiList = Array.from(
    new Set(buoiDay.noiDung.map((n) => n.noiDungMuc.baiHoc.tenBai))
  );

  const dsNoiDung = buoiDay.noiDung
    .map((n) => {
      const loai =
        n.noiDungMuc.loai === "LT"
          ? "Lý thuyết"
          : n.noiDungMuc.loai === "TH"
            ? "Thực hành"
            : "Kiểm tra";
      return `- [${loai}, ${n.soTiet} tiết${n.laTiepTuc ? ", tiếp tục từ buổi trước" : ""}] ${n.noiDungMuc.tieuDe}`;
    })
    .join("\n");

  const khungMau = parseCauTrucMau(buoiDay.lichTrinh.monHoc.mauGiaoAnCauTrucJson);
  const tenCacKhung = khungMau.map((k) => k.tieuDe);
  const moTaKhung = khungMau
    .map(
      (k, i) => `${i + 1}. "${k.tieuDe}"${k.moTa ? ` — ${k.moTa}` : ""}`
    )
    .join("\n");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Bạn là giáo viên trung cấp nghề đang soạn một "Giáo án trình giảng" cho một buổi dạy, theo đúng mẫu giáo án của môn học này gồm phần Mục tiêu, Đồ dùng thiết bị, Hình thức tổ chức, và bảng Thực hiện bài học với các phần theo đúng thứ tự sau:
${moTaKhung}

Thông tin buổi dạy:
- Môn học: ${buoiDay.lichTrinh.monHoc.tenMonHoc}
- Lớp: ${buoiDay.lichTrinh.lop.tenLop}
- Tên bài: ${tenBaiList.join(", ")}
- Tổng thời gian buổi dạy: ${tongPhut} phút (không tính 1 phút ổn định lớp)
- Thiết bị đã chuẩn bị: ${buoiDay.thietBi ?? "(chưa ghi, hãy tự đề xuất phù hợp)"}

Nội dung chi tiết cần dạy trong buổi này (đã được phân bổ thời gian theo tiết, 1 tiết = ${buoiDay.lichTrinh.soPhutMoiTiet} phút):
${dsNoiDung}

Yêu cầu phân bổ thời gian (bắt buộc tuân theo, đơn vị phút):
- Tổng thời gian của TẤT CẢ các dòng trong khungMuc phải đúng bằng ${tongPhut} phút.
- Các phần mở đầu/kết thúc (dẫn nhập, giới thiệu, kết thúc, hướng dẫn tự học hoặc tương đương) nên ngắn gọn, khoảng 2-5 phút mỗi phần.
- Phần nội dung chính (thường là phần ở giữa, ví dụ "Giải quyết vấn đề" hoặc tương đương) chiếm phần lớn thời gian còn lại, chia theo đúng tỉ lệ thời lượng của từng đề mục chi tiết ở trên.

Hãy soạn nội dung bằng tiếng Việt, văn phong sư phạm, cụ thể với nội dung chuyên môn ở trên (không viết chung chung). Gọi công cụ ${TEN_CONG_CU} với đầy đủ dữ liệu, đúng thứ tự và tên các khungMucTieuDe đã nêu.`;

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  const message = await client.messages.create({
    model,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: TEN_CONG_CU,
        description: "Lưu nội dung giáo án trình giảng đã soạn",
        input_schema: taoSchemaCongCu(tenCacKhung),
      },
    ],
    tool_choice: { type: "tool", name: TEN_CONG_CU },
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("AI không trả về kết quả hợp lệ, vui lòng thử lại");
  }

  const ket = toolUse.input as {
    kienThuc: string;
    kyNang: string;
    nangLucTuChu: string;
    hinhThucToChuc: string;
    khungMuc: { khungMucTieuDe: string; items: MucGiaoAn[] }[];
  };

  if (!Array.isArray(ket.khungMuc) || ket.khungMuc.length === 0) {
    throw new Error("AI không soạn được nội dung giáo án, vui lòng thử lại");
  }

  const noiDungJson: NoiDungGiaoAn = { khungMuc: ket.khungMuc };

  const giaoAn = await prisma.giaoAn.upsert({
    where: { buoiDayId },
    create: {
      buoiDayId,
      tenBai: tenBaiList.join(", "),
      kienThuc: ket.kienThuc,
      kyNang: ket.kyNang,
      nangLucTuChu: ket.nangLucTuChu,
      doDungThietBi: buoiDay.thietBi,
      hinhThucToChuc: ket.hinhThucToChuc,
      noiDungJson: JSON.stringify(noiDungJson),
    },
    update: {
      tenBai: tenBaiList.join(", "),
      kienThuc: ket.kienThuc,
      kyNang: ket.kyNang,
      nangLucTuChu: ket.nangLucTuChu,
      doDungThietBi: buoiDay.thietBi,
      hinhThucToChuc: ket.hinhThucToChuc,
      noiDungJson: JSON.stringify(noiDungJson),
    },
  });

  return giaoAn;
}
