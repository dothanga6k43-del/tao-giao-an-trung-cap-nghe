"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LoaiNoiDung } from "@prisma/client";

function numOr0(v: FormDataEntryValue | null) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function taoMonHoc(formData: FormData) {
  const tenMonHoc = String(formData.get("tenMonHoc") ?? "").trim();
  if (!tenMonHoc) throw new Error("Vui lòng nhập tên môn học");

  const mon = await prisma.monHoc.create({
    data: {
      tenMonHoc,
      maMonHoc: String(formData.get("maMonHoc") ?? "").trim() || null,
      tongSoGio: numOr0(formData.get("tongSoGio")),
      lyThuyetGio: numOr0(formData.get("lyThuyetGio")),
      thucHanhGio: numOr0(formData.get("thucHanhGio")),
      kiemTraGio: numOr0(formData.get("kiemTraGio")),
      viTriTinhChat: String(formData.get("viTriTinhChat") ?? "").trim() || null,
      mucTieu: String(formData.get("mucTieu") ?? "").trim() || null,
      dieuKienThucHien:
        String(formData.get("dieuKienThucHien") ?? "").trim() || null,
      phuongPhapDanhGia:
        String(formData.get("phuongPhapDanhGia") ?? "").trim() || null,
      taiLieuThamKhao:
        String(formData.get("taiLieuThamKhao") ?? "").trim() || null,
      giaoVienId: String(formData.get("giaoVienId") ?? "").trim() || null,
    },
  });

  revalidatePath("/chuong-trinh");
  revalidatePath("/lich-trinh/moi");
  redirect(`/chuong-trinh/${mon.id}`);
}

export async function capNhatMonHoc(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.monHoc.update({
    where: { id },
    data: {
      tenMonHoc: String(formData.get("tenMonHoc") ?? "").trim(),
      maMonHoc: String(formData.get("maMonHoc") ?? "").trim() || null,
      tongSoGio: numOr0(formData.get("tongSoGio")),
      lyThuyetGio: numOr0(formData.get("lyThuyetGio")),
      thucHanhGio: numOr0(formData.get("thucHanhGio")),
      kiemTraGio: numOr0(formData.get("kiemTraGio")),
      viTriTinhChat: String(formData.get("viTriTinhChat") ?? "").trim() || null,
      mucTieu: String(formData.get("mucTieu") ?? "").trim() || null,
      dieuKienThucHien:
        String(formData.get("dieuKienThucHien") ?? "").trim() || null,
      phuongPhapDanhGia:
        String(formData.get("phuongPhapDanhGia") ?? "").trim() || null,
      taiLieuThamKhao:
        String(formData.get("taiLieuThamKhao") ?? "").trim() || null,
      giaoVienId: String(formData.get("giaoVienId") ?? "").trim() || null,
    },
  });
  revalidatePath(`/chuong-trinh/${id}`);
}

export async function xoaMonHoc(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.monHoc.delete({ where: { id } });
  revalidatePath("/chuong-trinh");
  revalidatePath("/lich-trinh/moi");
  redirect("/chuong-trinh");
}

export async function taoBaiHoc(formData: FormData) {
  const monHocId = String(formData.get("monHocId"));
  const tenBai = String(formData.get("tenBai") ?? "").trim();
  if (!tenBai) throw new Error("Vui lòng nhập tên bài");

  const soBaiHienTai = await prisma.baiHoc.count({ where: { monHocId } });

  const bai = await prisma.baiHoc.create({
    data: {
      monHocId,
      thuTu: soBaiHienTai + 1,
      tenBai,
      tongSoGio: numOr0(formData.get("tongSoGio")),
      lyThuyetGio: numOr0(formData.get("lyThuyetGio")),
      thucHanhGio: numOr0(formData.get("thucHanhGio")),
      kiemTraGio: numOr0(formData.get("kiemTraGio")),
      mucTieu: String(formData.get("mucTieu") ?? "").trim() || null,
    },
  });

  revalidatePath(`/chuong-trinh/${monHocId}`);
  redirect(`/chuong-trinh/${monHocId}/bai/${bai.id}`);
}

export async function capNhatBaiHoc(formData: FormData) {
  const id = String(formData.get("id"));
  const monHocId = String(formData.get("monHocId"));
  await prisma.baiHoc.update({
    where: { id },
    data: {
      tenBai: String(formData.get("tenBai") ?? "").trim(),
      tongSoGio: numOr0(formData.get("tongSoGio")),
      lyThuyetGio: numOr0(formData.get("lyThuyetGio")),
      thucHanhGio: numOr0(formData.get("thucHanhGio")),
      kiemTraGio: numOr0(formData.get("kiemTraGio")),
      mucTieu: String(formData.get("mucTieu") ?? "").trim() || null,
    },
  });
  revalidatePath(`/chuong-trinh/${monHocId}`);
  revalidatePath(`/chuong-trinh/${monHocId}/bai/${id}`);
}

export async function xoaBaiHoc(formData: FormData) {
  const id = String(formData.get("id"));
  const monHocId = String(formData.get("monHocId"));
  await prisma.baiHoc.delete({ where: { id } });
  revalidatePath(`/chuong-trinh/${monHocId}`);
  redirect(`/chuong-trinh/${monHocId}`);
}

export async function taoNoiDungMuc(formData: FormData) {
  const baiHocId = String(formData.get("baiHocId"));
  const monHocId = String(formData.get("monHocId"));
  const parentId = String(formData.get("parentId") ?? "").trim() || null;
  const tieuDe = String(formData.get("tieuDe") ?? "").trim();
  if (!tieuDe) throw new Error("Vui lòng nhập tiêu đề đề mục");

  const soMucHienTai = await prisma.noiDungMuc.count({
    where: { baiHocId, parentId },
  });

  const thoiGianRaw = String(formData.get("thoiGianTiet") ?? "").trim();
  const loaiRaw = String(formData.get("loai") ?? "LT") as LoaiNoiDung;

  await prisma.noiDungMuc.create({
    data: {
      baiHocId,
      parentId,
      thuTu: soMucHienTai + 1,
      tieuDe,
      loai: loaiRaw,
      thoiGianTiet: thoiGianRaw ? Number(thoiGianRaw) : null,
    },
  });

  revalidatePath(`/chuong-trinh/${monHocId}/bai/${baiHocId}`);
}

export async function capNhatNoiDungMuc(formData: FormData) {
  const id = String(formData.get("id"));
  const baiHocId = String(formData.get("baiHocId"));
  const monHocId = String(formData.get("monHocId"));
  const thoiGianRaw = String(formData.get("thoiGianTiet") ?? "").trim();
  const loaiRaw = String(formData.get("loai") ?? "LT") as LoaiNoiDung;

  await prisma.noiDungMuc.update({
    where: { id },
    data: {
      tieuDe: String(formData.get("tieuDe") ?? "").trim(),
      loai: loaiRaw,
      thoiGianTiet: thoiGianRaw ? Number(thoiGianRaw) : null,
    },
  });

  revalidatePath(`/chuong-trinh/${monHocId}/bai/${baiHocId}`);
}

export async function xoaNoiDungMuc(formData: FormData) {
  const id = String(formData.get("id"));
  const baiHocId = String(formData.get("baiHocId"));
  const monHocId = String(formData.get("monHocId"));
  await prisma.noiDungMuc.delete({ where: { id } });
  revalidatePath(`/chuong-trinh/${monHocId}/bai/${baiHocId}`);
}
