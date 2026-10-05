"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { giaoVienIdKhiTao, yeuCauQuyenSua } from "@/lib/auth/pham-vi";

export async function taoLop(formData: FormData) {
  const tenLop = String(formData.get("tenLop") ?? "").trim();
  const khoa = String(formData.get("khoa") ?? "").trim();
  const namThuRaw = String(formData.get("namThu") ?? "").trim();
  if (!tenLop) throw new Error("Vui lòng nhập tên lớp");

  const hienTai = await layTaiKhoanHienTai();
  const giaoVienId = giaoVienIdKhiTao(hienTai, null);

  await prisma.lop.create({
    data: {
      tenLop,
      khoa: khoa || null,
      namThu: namThuRaw ? Number(namThuRaw) : null,
      giaoVienId,
    },
  });

  revalidatePath("/lop");
  revalidatePath("/lich-trinh/moi");
  redirect("/lop");
}

export async function xoaLop(formData: FormData) {
  const id = String(formData.get("id"));
  const hienTai = await layTaiKhoanHienTai();
  const lop = await prisma.lop.findUniqueOrThrow({ where: { id } });
  yeuCauQuyenSua(hienTai, lop.giaoVienId);

  await prisma.lop.delete({ where: { id } });
  revalidatePath("/lop");
  revalidatePath("/lich-trinh/moi");
}
