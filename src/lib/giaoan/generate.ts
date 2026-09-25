import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import type { NoiDungGiaoAn } from "./schema";

const TEN_CONG_CU = "soan_giao_an";

const SCHEMA_CONG_CU = {
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
      description:
        "Hình thức tổ chức dạy học cho từng phần (dẫn nhập, giới thiệu chủ đề, lý thuyết liên quan, trình tự thực hiện, thực hành, kết thúc, hướng dẫn tự học)",
    },
    danNhap: {
      type: "object",
      properties: {
        tieuDe: { type: "string" },
        thoiGianPhut: { type: "number" },
        hoatDongGV: { type: "string" },
        hoatDongHS: { type: "string" },
      },
      required: ["tieuDe", "thoiGianPhut", "hoatDongGV", "hoatDongHS"],
    },
    gioiThieuChuDe: {
      type: "object",
      properties: {
        tieuDe: { type: "string" },
        thoiGianPhut: { type: "number" },
        hoatDongGV: { type: "string" },
        hoatDongHS: { type: "string" },
      },
      required: ["tieuDe", "thoiGianPhut", "hoatDongGV", "hoatDongHS"],
    },
    giaiQuyetVanDe: {
      type: "array",
      description:
        "Các mục trong phần 'Giải quyết vấn đề': I. Lý thuyết liên quan (theo từng đề mục Lý thuyết), II. Trình tự thực hiện, III. Thực hành (theo từng đề mục Thực hành/Kiểm tra). Tổng thời gian các mục này phải khớp với thời gian còn lại.",
      items: {
        type: "object",
        properties: {
          tieuDe: { type: "string" },
          thoiGianPhut: { type: "number" },
          noiDung: {
            type: "string",
            description: "Nội dung trình bày chi tiết (có thể xuống dòng, gạch đầu dòng)",
          },
          hoatDongGV: { type: "string" },
          hoatDongHS: { type: "string" },
        },
        required: ["tieuDe", "thoiGianPhut", "noiDung", "hoatDongGV", "hoatDongHS"],
      },
    },
    ketThucVanDe: {
      type: "object",
      properties: {
        tieuDe: { type: "string" },
        thoiGianPhut: { type: "number" },
        hoatDongGV: { type: "string" },
        hoatDongHS: { type: "string" },
      },
      required: ["tieuDe", "thoiGianPhut", "hoatDongGV", "hoatDongHS"],
    },
    huongDanTuHoc: {
      type: "object",
      properties: {
        tieuDe: { type: "string" },
        thoiGianPhut: { type: "number" },
        hoatDongGV: { type: "string" },
        hoatDongHS: { type: "string" },
      },
      required: ["tieuDe", "thoiGianPhut", "hoatDongGV", "hoatDongHS"],
    },
  },
  required: [
    "kienThuc",
    "kyNang",
    "nangLucTuChu",
    "hinhThucToChuc",
    "danNhap",
    "gioiThieuChuDe",
    "giaiQuyetVanDe",
    "ketThucVanDe",
    "huongDanTuHoc",
  ],
};

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
  const onDinhLop = 1;
  const danNhapGoi = tongPhut > 120 ? 3 : 2;
  const gioiThieuGoi = 3;
  const ketThucGoi = 3;
  const huongDanGoi = 2;
  const phutGiaiQuyet =
    tongPhut - onDinhLop - danNhapGoi - gioiThieuGoi - ketThucGoi - huongDanGoi;

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

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Bạn là giáo viên trung cấp nghề đang soạn một "Giáo án trình giảng" cho một buổi dạy, theo đúng mẫu giáo án trình giảng TCN (gồm phần Mục tiêu, Đồ dùng thiết bị, Hình thức tổ chức, và bảng Thực hiện bài học với các mục: Dẫn nhập, Giới thiệu chủ đề, Giải quyết vấn đề (I. Lý thuyết liên quan, II. Trình tự thực hiện, III. Thực hành), Kết thúc vấn đề, Hướng dẫn tự học).

Thông tin buổi dạy:
- Môn học: ${buoiDay.lichTrinh.monHoc.tenMonHoc}
- Lớp: ${buoiDay.lichTrinh.lop.tenLop}
- Tên bài: ${tenBaiList.join(", ")}
- Tổng thời gian buổi dạy: ${tongPhut} phút (không tính 1 phút ổn định lớp)
- Thiết bị đã chuẩn bị: ${buoiDay.thietBi ?? "(chưa ghi, hãy tự đề xuất phù hợp)"}

Nội dung chi tiết cần dạy trong buổi này (đã được phân bổ thời gian theo tiết, 1 tiết = ${buoiDay.lichTrinh.soPhutMoiTiet} phút):
${dsNoiDung}

Yêu cầu phân bổ thời gian (bắt buộc tuân theo, đơn vị phút):
- Dẫn nhập: khoảng ${danNhapGoi} phút
- Giới thiệu chủ đề: khoảng ${gioiThieuGoi} phút
- Giải quyết vấn đề (tổng các mục con): đúng ${phutGiaiQuyet} phút, chia theo tỉ lệ thời lượng của từng đề mục chi tiết ở trên (mục Lý thuyết liên quan cho các đề mục Lý thuyết, mục Trình tự thực hiện + Thực hành cho các đề mục Thực hành, có thể thêm mục Kiểm tra nếu có đề mục Kiểm tra)
- Kết thúc vấn đề: khoảng ${ketThucGoi} phút
- Hướng dẫn tự học: khoảng ${huongDanGoi} phút

Hãy soạn nội dung bằng tiếng Việt, văn phong sư phạm, cụ thể với nội dung chuyên môn ở trên (không viết chung chung). Gọi công cụ ${TEN_CONG_CU} với đầy đủ dữ liệu.`;

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  const message = await client.messages.create({
    model,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: TEN_CONG_CU,
        description: "Lưu nội dung giáo án trình giảng đã soạn",
        input_schema: SCHEMA_CONG_CU,
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
    danNhap: NoiDungGiaoAn["danNhap"];
    gioiThieuChuDe: NoiDungGiaoAn["gioiThieuChuDe"];
    giaiQuyetVanDe: NoiDungGiaoAn["giaiQuyetVanDe"];
    ketThucVanDe: NoiDungGiaoAn["ketThucVanDe"];
    huongDanTuHoc: NoiDungGiaoAn["huongDanTuHoc"];
  };

  const noiDungJson: NoiDungGiaoAn = {
    danNhap: ket.danNhap,
    gioiThieuChuDe: ket.gioiThieuChuDe,
    giaiQuyetVanDe: ket.giaiQuyetVanDe,
    ketThucVanDe: ket.ketThucVanDe,
    huongDanTuHoc: ket.huongDanTuHoc,
  };

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
