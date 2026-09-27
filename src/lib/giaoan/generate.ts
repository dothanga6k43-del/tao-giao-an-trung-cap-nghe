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

type MucCoDinh = {
  tieuDe: string;
  loai: "LT" | "TH" | "KT";
  thoiGianPhut: number;
};

// Xac dinh chi so cac "khung giua" (noi dung chinh, khong phai mo dau/ket
// thuc) trong mau giao an - dung chung logic voi phan bo thoi gian: khung
// dau va 1-2 khung cuoi coi la bia (dan nhap/gioi thieu/ket thuc/huong dan
// tu hoc hoac tuong duong), con lai la noi dung chinh.
function xacDinhKhungGiua(khungMau: KhungMucMau[]): number[] {
  if (khungMau.length <= 2) return [];
  const soKhungDau = 1;
  const soKhungCuoi = khungMau.length > 4 ? 2 : 1;
  const ket: number[] = [];
  for (let i = soKhungDau; i < khungMau.length - soKhungCuoi; i++) ket.push(i);
  return ket;
}

// Phan cac de muc chi tiet (da co san tieu de + thoi gian chinh xac tu lich
// trinh) vao cac khung giua. Neu chi co 1 khung giua, tat ca de muc vao do.
// Neu co 2+ khung giua (vd mau thuc hanh: Huong dan ban dau / Huong dan
// thuong xuyen), tach theo loai: Ly thuyet + Kiem tra vao khung dau tien,
// Thuc hanh vao khung cuoi cung trong so cac khung giua.
function phanMucVaoKhungGiua(
  khungGiuaIdx: number[],
  dsMuc: MucCoDinh[]
): Map<number, MucCoDinh[]> {
  const ket = new Map<number, MucCoDinh[]>();
  if (khungGiuaIdx.length === 0) return ket;
  if (khungGiuaIdx.length === 1) {
    ket.set(khungGiuaIdx[0], dsMuc);
    return ket;
  }
  const dauTien = khungGiuaIdx[0];
  const cuoiCung = khungGiuaIdx[khungGiuaIdx.length - 1];
  const lyThuyetVaKiemTra = dsMuc.filter((m) => m.loai !== "TH");
  const thucHanh = dsMuc.filter((m) => m.loai === "TH");
  if (lyThuyetVaKiemTra.length > 0) ket.set(dauTien, lyThuyetVaKiemTra);
  if (thucHanh.length > 0) ket.set(cuoiCung, thucHanh);
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

// ---- Lenh goi 2a (song song, 1 lenh cho khung khong co de muc co dinh) ----
// Dung cho cac khung mo dau/ket thuc (Dan nhap, Ket thuc van de...) - AI tu
// do quyet dinh tieu de/so dong vi day chi la cac phan ngan, khong gan voi
// noi dung chi tiet cu the nao trong chuong trinh.

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

Hãy soạn nội dung cho PHẦN "${khung.tieuDe}"${khung.moTa ? ` (${khung.moTa})` : ""} của giáo án, với tổng thời gian đúng bằng ${thoiGianPhut} phút. Viết NGẮN GỌN, súc tích (đây là 1 phần trong giáo án, không phải toàn bộ). Nếu phần này cần chia thành nhiều mục nhỏ thì tạo tối đa 2-3 dòng, mỗi dòng thời gian riêng nhưng tổng phải đúng ${thoiGianPhut} phút; nếu là mục đơn giản thì chỉ cần 1 dòng. Chỉ soạn nội dung của PHẦN NÀY, không soạn các phần khác. Gọi công cụ ${TEN_CONG_CU_MUC}.`;

  const mucDuPhong: MucGiaoAn[] = [
    { tieuDe: khung.tieuDe, thoiGianPhut, noiDung: "", hoatDongGV: "", hoatDongHS: "" },
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

// ---- Lenh goi 2b (song song, 1 lenh cho khung noi dung chinh) ----
// Tieu de va thoi gian cua tung dong LAY DUNG tu de muc chi tiet + thoi gian
// da duoc phan bo trong lich trinh (khong de AI tu quyet dinh), AI chi viet
// noi dung trinh bay / hoat dong GV-HS cho dung cac de muc do - dam bao giao
// an bam sat chinh xac nhung gi lich trinh da xep.

const TEN_CONG_CU_NOI_DUNG = "luu_noi_dung_theo_de_muc";

async function soanNoiDungChoDeMucCoDinh(
  boiCanh: string,
  khung: KhungMucMau,
  dsMuc: MucCoDinh[]
): Promise<MucGiaoAn[]> {
  const danhSach = dsMuc
    .map((m, i) => `${i + 1}. [${m.loai}, ${m.thoiGianPhut} phút] ${m.tieuDe}`)
    .join("\n");

  const prompt = `${boiCanh}

Hãy soạn nội dung cho PHẦN "${khung.tieuDe}"${khung.moTa ? ` (${khung.moTa})` : ""} của giáo án. Phần này gồm ĐÚNG ${dsMuc.length} đề mục sau (đã có sẵn tiêu đề và thời gian từ lịch trình giảng dạy, KHÔNG được thay đổi tiêu đề hay thời gian):
${danhSach}

Với MỖI đề mục trên theo đúng thứ tự, hãy viết nội dung trình bày và hoạt động của giáo viên/học sinh, ngắn gọn súc tích, cụ thể với nội dung chuyên môn của đề mục đó (không viết chung chung). Gọi công cụ ${TEN_CONG_CU_NOI_DUNG} với đúng ${dsMuc.length} phần tử theo thứ tự đã cho.`;

  const mucDuPhong = (): MucGiaoAn[] =>
    dsMuc.map((m) => ({
      tieuDe: m.tieuDe,
      thoiGianPhut: m.thoiGianPhut,
      noiDung: "",
      hoatDongGV: "",
      hoatDongHS: "",
    }));

  const message = await client().messages.create({
    model: model(),
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        name: TEN_CONG_CU_NOI_DUNG,
        description: "Lưu nội dung trình bày cho từng đề mục đã cho, đúng thứ tự",
        input_schema: {
          type: "object",
          properties: {
            noiDungTungMuc: {
              type: "array",
              description: `Đúng ${dsMuc.length} phần tử, theo đúng thứ tự các đề mục đã cho`,
              items: {
                type: "object",
                properties: {
                  noiDung: {
                    type: "string",
                    description: "Nội dung trình bày, ngắn gọn dạng gạch đầu dòng (tối đa 4-5 dòng)",
                  },
                  hoatDongGV: {
                    type: "string",
                    description: "Hoạt động của giáo viên, ngắn gọn dạng gạch đầu dòng",
                  },
                  hoatDongHS: {
                    type: "string",
                    description: "Hoạt động của học sinh, ngắn gọn dạng gạch đầu dòng",
                  },
                },
                required: ["noiDung", "hoatDongGV", "hoatDongHS"],
              },
              minItems: dsMuc.length,
              maxItems: dsMuc.length,
            },
          },
          required: ["noiDungTungMuc"],
        },
      },
    ],
    tool_choice: { type: "tool", name: TEN_CONG_CU_NOI_DUNG },
  });

  const toolUse = message.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return mucDuPhong();
  }
  const noiDungTungMuc = (toolUse.input as { noiDungTungMuc?: unknown }).noiDungTungMuc;
  if (!Array.isArray(noiDungTungMuc)) {
    return mucDuPhong();
  }
  return dsMuc.map((m, i) => {
    const nd = noiDungTungMuc[i] as
      | { noiDung?: string; hoatDongGV?: string; hoatDongHS?: string }
      | undefined;
    return {
      tieuDe: m.tieuDe,
      thoiGianPhut: m.thoiGianPhut,
      noiDung: nd?.noiDung ?? "",
      hoatDongGV: nd?.hoatDongGV ?? "",
      hoatDongHS: nd?.hoatDongHS ?? "",
    };
  });
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
  const soPhutMoiTiet = buoiDay.lichTrinh.soPhutMoiTiet;

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

  // De muc chi tiet voi tieu de + thoi gian CHINH XAC tu lich trinh (khong
  // de AI tu quyet dinh) - day la can cu chinh de dam bao giao an bam sat
  // dung nhung gi lich trinh da phan bo.
  const dsMucCoDinh: MucCoDinh[] = buoiDay.noiDung.map((n) => ({
    tieuDe: n.noiDungMuc.tieuDe + (n.laTiepTuc ? " (Tiếp)" : ""),
    loai: n.noiDungMuc.loai,
    thoiGianPhut: Math.round(n.soTiet * soPhutMoiTiet),
  }));
  const tongPhutMucCoDinh = dsMucCoDinh.reduce((s, m) => s + m.thoiGianPhut, 0);

  const khungMau = parseCauTrucMau(buoiDay.lichTrinh.monHoc.mauGiaoAnCauTrucJson);
  const khungGiuaIdx = xacDinhKhungGiua(khungMau);
  const mucTheoKhungGiua = phanMucVaoKhungGiua(khungGiuaIdx, dsMucCoDinh);

  // Cac khung con lai (mo dau/ket thuc, hoac khung giua khong duoc gan de
  // muc nao) dung heuristic thoi gian ngan, phan con lai sau khi tru di
  // thoi gian chinh xac cua noi dung chinh.
  const khungCanHeuristic = khungMau
    .map((k, i) => i)
    .filter((i) => !mucTheoKhungGiua.has(i));
  const phutConLaiChoHeuristic = Math.max(tongPhut - tongPhutMucCoDinh, 0);
  const phutMoiKhungHeuristic =
    khungCanHeuristic.length > 0
      ? Math.floor(phutConLaiChoHeuristic / khungCanHeuristic.length)
      : 0;

  const boiCanh = `Bạn là giáo viên trung cấp nghề đang soạn một "Giáo án trình giảng" cho một buổi dạy.

Thông tin buổi dạy:
- Môn học: ${buoiDay.lichTrinh.monHoc.tenMonHoc}
- Lớp: ${buoiDay.lichTrinh.lop.tenLop}
- Tên bài: ${tenBaiList.join(", ")}
- Tổng thời gian buổi dạy: ${tongPhut} phút (không tính 1 phút ổn định lớp)
- Thiết bị đã chuẩn bị: ${buoiDay.thietBi ?? "(chưa ghi, hãy tự đề xuất phù hợp)"}

Nội dung chi tiết cần dạy trong buổi này (đã được phân bổ thời gian theo tiết, 1 tiết = ${soPhutMoiTiet} phút):
${dsNoiDung}

Hãy soạn nội dung bằng tiếng Việt, văn phong sư phạm, cụ thể với nội dung chuyên môn ở trên (không viết chung chung, nhưng cũng không viết dài dòng).`;

  const [thongTinChung, ketQuaKhung] = await Promise.all([
    trichXuatThongTinChung(boiCanh),
    Promise.all(
      khungMau.map((khung, idx) => {
        const dsMuc = mucTheoKhungGiua.get(idx);
        if (dsMuc && dsMuc.length > 0) {
          return soanNoiDungChoDeMucCoDinh(boiCanh, khung, dsMuc);
        }
        let phut = phutMoiKhungHeuristic;
        if (khungCanHeuristic.length > 0 && idx === khungCanHeuristic[khungCanHeuristic.length - 1]) {
          phut = phutConLaiChoHeuristic - phutMoiKhungHeuristic * (khungCanHeuristic.length - 1);
        }
        return soanMotKhungMuc(boiCanh, khung, Math.max(phut, 0));
      })
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
