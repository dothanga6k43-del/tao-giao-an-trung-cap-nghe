"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { yeuCauAdmin } from "@/lib/auth/session";
import { hashMatKhau, taoMatKhauNgauNhien } from "@/lib/auth/mat-khau";

export type TrangThaiTaoTaiKhoan = {
  error: string | null;
  taiKhoanMoi: { tenDangNhap: string; matKhau: string } | null;
};

export async function taoTaiKhoan(
  _prevState: TrangThaiTaoTaiKhoan,
  formData: FormData
): Promise<TrangThaiTaoTaiKhoan> {
  await yeuCauAdmin();

  const tenDangNhap = String(formData.get("tenDangNhap") ?? "").trim();
  const giaoVienId = String(formData.get("giaoVienId") ?? "").trim() || null;
  const vaiTro = String(formData.get("vaiTro") ?? "GIAO_VIEN") === "ADMIN" ? "ADMIN" : "GIAO_VIEN";

  if (!tenDangNhap || tenDangNhap.length < 3) {
    return { error: "Tên đăng nhập cần ít nhất 3 ký tự", taiKhoanMoi: null };
  }
  if (!/^[a-z0-9._-]+$/i.test(tenDangNhap)) {
    return {
      error: "Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới/ngang",
      taiKhoanMoi: null,
    };
  }

  const trung = await prisma.taiKhoan.findUnique({ where: { tenDangNhap } });
  if (trung) {
    return { error: "Tên đăng nhập đã tồn tại", taiKhoanMoi: null };
  }

  if (giaoVienId) {
    const giaoVienDaCoTk = await prisma.taiKhoan.findUnique({ where: { giaoVienId } });
    if (giaoVienDaCoTk) {
      return { error: "Giáo viên này đã có tài khoản", taiKhoanMoi: null };
    }
  }

  const matKhau = taoMatKhauNgauNhien();

  await prisma.taiKhoan.create({
    data: {
      tenDangNhap,
      matKhauHash: await hashMatKhau(matKhau),
      vaiTro,
      giaoVienId,
    },
  });

  revalidatePath("/tai-khoan");
  revalidatePath("/giao-vien");
  return { error: null, taiKhoanMoi: { tenDangNhap, matKhau } };
}

export type TrangThaiDatLaiMatKhau = {
  error: string | null;
  ketQua: { taiKhoanId: string; tenDangNhap: string; matKhau: string } | null;
};

export async function datLaiMatKhau(
  _prevState: TrangThaiDatLaiMatKhau,
  formData: FormData
): Promise<TrangThaiDatLaiMatKhau> {
  await yeuCauAdmin();

  const id = String(formData.get("id") ?? "");
  const taiKhoan = await prisma.taiKhoan.findUnique({ where: { id } });
  if (!taiKhoan) {
    return { error: "Không tìm thấy tài khoản", ketQua: null };
  }

  const matKhau = taoMatKhauNgauNhien();
  await prisma.taiKhoan.update({
    where: { id },
    data: { matKhauHash: await hashMatKhau(matKhau) },
  });

  return {
    error: null,
    ketQua: { taiKhoanId: id, tenDangNhap: taiKhoan.tenDangNhap, matKhau },
  };
}

export type TrangThaiSuaTaiKhoan = { error: string | null };

export async function suaTaiKhoan(
  _prevState: TrangThaiSuaTaiKhoan,
  formData: FormData
): Promise<TrangThaiSuaTaiKhoan> {
  await yeuCauAdmin();

  const id = String(formData.get("id") ?? "");
  const tenDangNhap = String(formData.get("tenDangNhap") ?? "").trim();
  const giaoVienId = String(formData.get("giaoVienId") ?? "").trim() || null;
  const vaiTro = String(formData.get("vaiTro") ?? "GIAO_VIEN") === "ADMIN" ? "ADMIN" : "GIAO_VIEN";

  if (!id) return { error: "Thiếu id" };
  if (!tenDangNhap || tenDangNhap.length < 3) {
    return { error: "Tên đăng nhập cần ít nhất 3 ký tự" };
  }
  if (!/^[a-z0-9._-]+$/i.test(tenDangNhap)) {
    return { error: "Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới/ngang" };
  }

  const trung = await prisma.taiKhoan.findFirst({
    where: { tenDangNhap, NOT: { id } },
  });
  if (trung) return { error: "Tên đăng nhập đã tồn tại" };

  if (giaoVienId) {
    const giaoVienDaCoTk = await prisma.taiKhoan.findFirst({
      where: { giaoVienId, NOT: { id } },
    });
    if (giaoVienDaCoTk) return { error: "Giáo viên này đã có tài khoản khác" };
  }

  await prisma.taiKhoan.update({
    where: { id },
    data: { tenDangNhap, giaoVienId, vaiTro },
  });

  revalidatePath("/tai-khoan");
  revalidatePath("/giao-vien");
  return { error: null };
}

export async function xoaTaiKhoan(formData: FormData) {
  const hienTai = await yeuCauAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Thiếu id");
  if (id === hienTai.id) {
    throw new Error("Không thể tự xóa tài khoản đang đăng nhập");
  }

  await prisma.taiKhoan.delete({ where: { id } });

  revalidatePath("/tai-khoan");
  revalidatePath("/giao-vien");
}
