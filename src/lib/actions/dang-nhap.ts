"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { kiemTraMatKhau } from "@/lib/auth/mat-khau";
import { taoPhien, xoaPhienHienTai } from "@/lib/auth/session";

export type TrangThaiDangNhap = { error: string | null };

export async function dangNhap(
  _prevState: TrangThaiDangNhap,
  formData: FormData
): Promise<TrangThaiDangNhap> {
  const tenDangNhap = String(formData.get("tenDangNhap") ?? "").trim();
  const matKhau = String(formData.get("matKhau") ?? "");
  const tiep = String(formData.get("tiep") ?? "").trim();

  if (!tenDangNhap || !matKhau) {
    return { error: "Vui lòng nhập tên đăng nhập và mật khẩu" };
  }

  const taiKhoan = await prisma.taiKhoan.findUnique({ where: { tenDangNhap } });
  if (!taiKhoan) {
    return { error: "Tên đăng nhập hoặc mật khẩu không đúng" };
  }

  const dung = await kiemTraMatKhau(matKhau, taiKhoan.matKhauHash);
  if (!dung) {
    return { error: "Tên đăng nhập hoặc mật khẩu không đúng" };
  }

  await taoPhien(taiKhoan.id);

  const diTiep = tiep && tiep.startsWith("/") && !tiep.startsWith("//") ? tiep : "/";
  redirect(diTiep);
}

export async function dangXuat() {
  await xoaPhienHienTai();
  redirect("/dang-nhap");
}
