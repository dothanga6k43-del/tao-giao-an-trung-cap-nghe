import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import {
  parseCauTrucMau,
  type NoiDungGiaoAn,
  type MucGiaoAn,
  type KhungMucMau,
} from "./schema";

function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function model() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
}

// Phan bo thoi gian cho tung khung muc bang cong thuc don gian (khong can goi
// AI - giu cho buoc nay khong lam cham duong dan toi han). Khung dau/cuoi coi
// la mo dau/ket thuc nen duoc cap thoi gian ngan, phan con lai chia deu cho
// cac khung o giua (thuong la noi dung chinh cua bai).
function tinhPhanBoThoiGian(
  khungMau: KhungMucMau[],
  tongPhut: number
): Map<string, number> {
  const ket = new Map<string, number>();
  if (khungMau.length <= 2) {
    const moiKhung = Math.floor(tongPhut / khungMau.length);
    khungMau.forEach((k, i) => {
      ket.set(k.tieuDe, i === khungMau.length - 1 ? tongPhut - moiKhung * i : moiKhung);
    });
    return ket;
  }

  const soKhungDau = 1;
  const soKhungCuoi = khungMau.length > 4 ? 2 : 1;
  const phutMoiKhungBia = Math.min(5, Math.floor(tongPhut * 0.05) || 2);
  const khungGiua = khungMau.slice(soKhungDau, khungMau.length - soKhungCuoi);
  const tongPhutBia = phutMoiKhungBia * (soKhungDau + soKhungCuoi);
  const phutConLai = Math.max(tongPhut - tongPhutBia, khungGiua.length);
  const phutMoiKhungGiua = Math.floor(phutConLai / khungGiua.length);

  let daCap = 0;
  khungMau.forEach((k, i) => {
    const laBia = i < soKhungDau || i >= khungMau.length - soKhungCuoi;
    const laCuoiCung = i === khungMau.length - 1;
    const phut = laBia ? phutMoiKhungBia : phutMoiKhungGiua;
    ket.set(k.tieuDe, laCuoiCung ? tongPhut - daCap : phut);
    daCap += phut;
  });
  return ket;
}

// Ghi chu ve toc do: moi lenh goi AI o day sinh khoang 70-90 token/giay bat
// ke do phuc tap cua prompt, nen thoi gian cham chu yeu do SO LUONG TOKEN
// DAU RA quyet dinh. De giu moi lenh trong gioi han ~30s cua Vercel gateway,
// tach thanh nhieu lenh song song (1 lenh/khung muc) VA gioi han max_tokens
// + yeu cau AI viet ngan gon cho tung lenh.

// ---- Lenh goi 1 (nhanh, song song voi cac lenh o duoi): thong tin chung ----

const TEN_CONG_CU_LOI = "luu_thong_tin_chung_giao_an";

type ThongTinChung = {
  kienThuc: string;
  kyNang: string;
  nangLucTuChu: string;
  hinhThucToChuc: string;
};

const SCHEMA_LOI = {
  type: "object" as const,
  properties: {
    kienThuc: { type: "string", description: "Mục tiêu về kiến thức, dạng gạch đầu dòng, ngắn gọn" },
    kyNang: { type: "string", description: "Mục tiêu về kỹ năng, dạng gạch đầu dòng, ngắn gọn" },
    nangLucTuChu: {
      type: "string",
      description: "Mục tiêu về năng lực tự chủ và tự chịu trách nhiệm, ngắn gọn",
    },
    hinhThucToChuc: {
      type: "string",
      description: "Hình thức tổ chức dạy học cho buổi dạy này, ngắn gọn",
    },
  },
  required: ["kienThuc", "kyNang", "nangLucTuChu", "hinhThucToChuc"],
};

async function trichXuatThongTinChung(boiCanh: string): Promise<ThongTinChung> {
  const prompt = `${boiCanh}

Hãy soạn ngắn gọn, súc tích: mục tiêu (kiến thức, kỹ năng, năng lực tự chủ) và hình thức tổ chức dạy học cho buổi dạy này. Gọi công cụ ${TEN_CONG_CU_LOI}.`;

  const message = await client().messages.create({
    model: model(),
    max_tokens: 700,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: TEN_CONG_CU_LOI,
        description: "Lưu thông tin chung của giáo án",
        input_schema: SCHEMA_LOI,
      },
    ],
    tool_choice: { type: "tool", name: TEN_CONG_CU_LOI },
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("AI không trả về kết quả hợp lệ, vui lòng thử lại");
  }
  return toolUse.input as ThongTinChung;
}

// ---- Lenh goi 2 (song song, 1 lenh cho moi khung muc): noi dung chi tiet ----

const TEN_CONG_CU_MUC = "luu_noi_dung_khung_muc";

const MUC_SCHEMA = {
  type: "object" as const,
  properties: {
    tieuDe: { type: "string" },
    thoiGianPhut: { type: "number" },
    noiDung: {
      type: "string",
      description:
        "Nội dung trình bày, ngắn gọn dạng gạch đầu dòng (tối đa 4-5 dòng). Để chuỗi rỗng nếu mục này không cần trình bày nội dung riêng.",
    },
    hoatDongGV: {
      type: "string",
      description: "Hoạt động của giáo viên, ngắn gọn dạng gạch đầu dòng (tối đa 3-4 dòng)",
    },
    hoatDongHS: {
      type: "string",
      description: "Hoạt động của học sinh, ngắn gọn dạng gạch đầu dòng (tối đa 3-4 dòng)",
    },
  },
  required: ["tieuDe", "thoiGianPhut", "noiDung", "hoatDongGV", "hoatDongHS"],
};

async function soanMotKhungMuc(
  boiCanh: string,
  khung: KhungMucMau,
  thoiGianPhut: number
): Promise<MucGiaoAn[]> {
  const prompt = `${boiCanh}

Hãy soạn nội dung cho PHẦN "${khung.tieuDe}"${khung.moTa ? ` (${khung.moTa})` : ""} của giáo án, với tổng thời gian đúng bằng ${thoiGianPhut} phút. Viết NGẮN GỌN, súc tích (đây là 1 phần trong giáo án, không phải toàn bộ). Nếu phần này cần chia thành nhiều mục nhỏ (ví dụ để trình bày lý thuyết liên quan, trình tự thực hiện, thực hành riêng biệt) thì tạo tối đa 2-3 dòng, mỗi dòng thời gian riêng nhưng tổng phải đúng ${thoiGianPhut} phút; nếu là mục đơn giản thì chỉ cần 1 dòng. Chỉ soạn nội dung của PHẦN NÀY, không soạn các phần khác. Gọi công cụ ${TEN_CONG_CU_MUC}.`;

  const mucDuPhong: MucGiaoAn[] = [
    {
      tieuDe: khung.tieuDe,
      thoiGianPhut,
      noiDung: "",
      hoatDongGV: "",
      hoatDongHS: "",
    },
  ];

  const message = await client().messages.create({
    model: model(),
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: TEN_CONG_CU_MUC,
        description: "Lưu nội dung của một phần trong giáo án",
        input_schema: {
          type: "object",
          properties: {
            items: { type: "array", items: MUC_SCHEMA, minItems: 1, maxItems: 3 },
          },
          required: ["items"],
        },
      },
    ],
    tool_choice: { type: "tool", name: TEN_CONG_CU_MUC },
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return mucDuPhong;
  }
  const items = (toolUse.input as { items?: unknown }).items;
  if (!Array.isArray(items) || items.length === 0) {
    return mucDuPhong;
  }
  return items as MucGiaoAn[];
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
  const phutTheoKhung = tinhPhanBoThoiGian(khungMau, tongPhut);

  const boiCanh = `Bạn là giáo viên trung cấp nghề đang soạn một "Giáo án trình giảng" cho một buổi dạy.

Thông tin buổi dạy:
- Môn học: ${buoiDay.lichTrinh.monHoc.tenMonHoc}
- Lớp: ${buoiDay.lichTrinh.lop.tenLop}
- Tên bài: ${tenBaiList.join(", ")}
- Tổng thời gian buổi dạy: ${tongPhut} phút (không tính 1 phút ổn định lớp)
- Thiết bị đã chuẩn bị: ${buoiDay.thietBi ?? "(chưa ghi, hãy tự đề xuất phù hợp)"}

Nội dung chi tiết cần dạy trong buổi này (đã được phân bổ thời gian theo tiết, 1 tiết = ${buoiDay.lichTrinh.soPhutMoiTiet} phút):
${dsNoiDung}

Hãy soạn nội dung bằng tiếng Việt, văn phong sư phạm, cụ thể với nội dung chuyên môn ở trên (không viết chung chung, nhưng cũng không viết dài dòng).`;

  const [thongTinChung, ketQuaKhung] = await Promise.all([
    trichXuatThongTinChung(boiCanh),
    Promise.all(
      khungMau.map((khung) =>
        soanMotKhungMuc(boiCanh, khung, phutTheoKhung.get(khung.tieuDe) ?? 0)
      )
    ),
  ]);

  const noiDungJson: NoiDungGiaoAn = {
    khungMuc: khungMau.map((khung, idx) => ({
      khungMucTieuDe: khung.tieuDe,
      items: ketQuaKhung[idx],
    })),
  };

  const giaoAn = await prisma.giaoAn.upsert({
    where: { buoiDayId },
    create: {
      buoiDayId,
      tenBai: tenBaiList.join(", "),
      kienThuc: thongTinChung.kienThuc,
      kyNang: thongTinChung.kyNang,
      nangLucTuChu: thongTinChung.nangLucTuChu,
      doDungThietBi: buoiDay.thietBi,
      hinhThucToChuc: thongTinChung.hinhThucToChuc,
      noiDungJson: JSON.stringify(noiDungJson),
    },
    update: {
      tenBai: tenBaiList.join(", "),
      kienThuc: thongTinChung.kienThuc,
      kyNang: thongTinChung.kyNang,
      nangLucTuChu: thongTinChung.nangLucTuChu,
      doDungThietBi: buoiDay.thietBi,
      hinhThucToChuc: thongTinChung.hinhThucToChuc,
      noiDungJson: JSON.stringify(noiDungJson),
    },
  });

  return giaoAn;
}
