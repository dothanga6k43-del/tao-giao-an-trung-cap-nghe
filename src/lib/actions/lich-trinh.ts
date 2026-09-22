"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sinhLichTrinh, type MucChiTiet, type KhungTiet } from "@/lib/lichtrinh/generate";

const THU_LIST = [2, 3, 4, 5, 6, 7] as const;

export async function taoLichTrinh(formData: FormData) {
  const lopId = String(formData.get("lopId") ?? "");
  const monHocId = String(formData.get("monHocId") ?? "");
  const giaoVienId = String(formData.get("giaoVienId") ?? "").trim() || null;
  const hocKy = String(formData.get("hocKy") ?? "").trim() || null;
  const ngayBatDauRaw = String(formData.get("ngayBatDau") ?? "");
  const soPhutMoiTiet = Number(formData.get("soPhutMoiTiet") ?? 45) || 45;

  if (!lopId || !monHocId || !ngayBatDauRaw) {
    throw new Error("Vui lòng chọn lớp, môn học và ngày bắt đầu");
  }

  const khungTietTuan = THU_LIST.map((thu) => {
    const tietBatDau = String(formData.get(`tiet_batdau_${thu}`) ?? "").trim();
    const soTiet = String(formData.get(`tiet_sotiet_${thu}`) ?? "").trim();
    if (!tietBatDau || !soTiet) return null;
    return {
      thu,
      tietBatDau: Number(tietBatDau),
      soTiet: Number(soTiet),
      diaDiem: String(formData.get(`tiet_diadiem_${thu}`) ?? "").trim() || null,
    };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const lichTrinh = await prisma.lichTrinhGiangDay.create({
    data: {
      lopId,
      monHocId,
      giaoVienId,
      hocKy,
      ngayBatDau: new Date(ngayBatDauRaw),
      soPhutMoiTiet,
      khungTietTuan: { create: khungTietTuan },
    },
  });

  revalidatePath("/lich-trinh");
  redirect(`/lich-trinh/${lichTrinh.id}`);
}

export async function themNgayNghi(formData: FormData) {
  const lichTrinhId = String(formData.get("lichTrinhId"));
  const ngay = String(formData.get("ngay") ?? "");
  const ghiChu = String(formData.get("ghiChu") ?? "").trim() || null;
  if (!ngay) throw new Error("Vui lòng chọn ngày nghỉ");

  await prisma.ngayNghi.create({
    data: { lichTrinhId, ngay: new Date(ngay), ghiChu },
  });
  revalidatePath(`/lich-trinh/${lichTrinhId}`);
}

export async function xoaNgayNghi(formData: FormData) {
  const id = String(formData.get("id"));
  const lichTrinhId = String(formData.get("lichTrinhId"));
  await prisma.ngayNghi.delete({ where: { id } });
  revalidatePath(`/lich-trinh/${lichTrinhId}`);
}

export async function xoaLichTrinh(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.lichTrinhGiangDay.delete({ where: { id } });
  revalidatePath("/lich-trinh");
  redirect("/lich-trinh");
}

export async function sinhBuoiDay(formData: FormData) {
  const lichTrinhId = String(formData.get("lichTrinhId"));

  const lichTrinh = await prisma.lichTrinhGiangDay.findUniqueOrThrow({
    where: { id: lichTrinhId },
    include: {
      khungTietTuan: true,
      ngayNghi: true,
      monHoc: {
        include: {
          baiHoc: {
            orderBy: { thuTu: "asc" },
            include: { noiDungMuc: { orderBy: { thuTu: "asc" } } },
          },
        },
      },
    },
  });

  if (lichTrinh.trangThai === "APPROVED") {
    throw new Error("Lịch trình đã duyệt, không thể sinh lại");
  }

  const danhSachMuc: MucChiTiet[] = [];
  for (const bai of lichTrinh.monHoc.baiHoc) {
    const mucCha = bai.noiDungMuc.filter((m) => !m.parentId);
    for (const mc of mucCha) {
      const con = bai.noiDungMuc.filter((m) => m.parentId === mc.id);
      if (con.length > 0) {
        for (const c of con) {
          if (c.thoiGianTiet && c.thoiGianTiet > 0) {
            danhSachMuc.push({
              id: c.id,
              baiHocId: bai.id,
              tenBai: bai.tenBai,
              tieuDe: c.tieuDe,
              loai: c.loai,
              gioTiet: c.thoiGianTiet,
            });
          }
        }
      } else if (mc.thoiGianTiet && mc.thoiGianTiet > 0) {
        danhSachMuc.push({
          id: mc.id,
          baiHocId: bai.id,
          tenBai: bai.tenBai,
          tieuDe: mc.tieuDe,
          loai: mc.loai,
          gioTiet: mc.thoiGianTiet,
        });
      }
    }
  }

  const khungTiet: KhungTiet[] = lichTrinh.khungTietTuan.map((k) => ({
    thu: k.thu,
    tietBatDau: k.tietBatDau,
    soTiet: k.soTiet,
  }));

  const ketQua = sinhLichTrinh(
    danhSachMuc,
    khungTiet,
    lichTrinh.ngayBatDau,
    lichTrinh.ngayNghi.map((n) => n.ngay)
  );

  await prisma.$transaction(async (tx) => {
    await tx.buoiDay.deleteMany({ where: { lichTrinhId } });
    for (const b of ketQua) {
      await tx.buoiDay.create({
        data: {
          lichTrinhId,
          thuTu: b.thuTu,
          ngayThucHien: b.ngayThucHien,
          tietBatDau: b.tietBatDau,
          tongTiet: b.tongTiet,
          lyThuyetTiet: b.lyThuyetTiet,
          thucHanhTiet: b.thucHanhTiet,
          kiemTraTiet: b.kiemTraTiet,
          noiDung: {
            create: b.items.map((it, idx) => ({
              noiDungMucId: it.noiDungMucId,
              soTiet: it.soTiet,
              laTiepTuc: it.laTiepTuc,
              thuTu: idx + 1,
            })),
          },
        },
      });
    }
  });

  revalidatePath(`/lich-trinh/${lichTrinhId}`);
}

export async function suaBuoiDay(formData: FormData) {
  const id = String(formData.get("id"));
  const lichTrinhId = String(formData.get("lichTrinhId"));
  const ngayThucHien = String(formData.get("ngayThucHien") ?? "");
  const thietBi = String(formData.get("thietBi") ?? "").trim() || null;
  const ghiChu = String(formData.get("ghiChu") ?? "").trim() || null;

  await prisma.buoiDay.update({
    where: { id },
    data: {
      ...(ngayThucHien ? { ngayThucHien: new Date(ngayThucHien) } : {}),
      thietBi,
      ghiChu,
    },
  });
  revalidatePath(`/lich-trinh/${lichTrinhId}`);
}

export async function xoaBuoiDay(formData: FormData) {
  const id = String(formData.get("id"));
  const lichTrinhId = String(formData.get("lichTrinhId"));
  await prisma.buoiDay.delete({ where: { id } });
  revalidatePath(`/lich-trinh/${lichTrinhId}`);
}

export async function duyetLichTrinh(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.lichTrinhGiangDay.update({
    where: { id },
    data: { trangThai: "APPROVED" },
  });
  revalidatePath(`/lich-trinh/${id}`);
}

export async function moDuyetLaiLichTrinh(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.lichTrinhGiangDay.update({
    where: { id },
    data: { trangThai: "DRAFT" },
  });
  revalidatePath(`/lich-trinh/${id}`);
}
