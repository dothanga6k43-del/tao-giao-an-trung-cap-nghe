"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hashMatKhau } from "@/lib/auth/mat-khau";
import { taoPhien } from "@/lib/auth/session";

export type TrangThaiThietLapAdmin = { error: string | null };

export async function thietLapAdmin(
  _prevState: TrangThaiThietLapAdmin,
  formData: FormData
): Promise<TrangThaiThietLapAdmin> {
  // Chi cho phep khi CHUA co tai khoan nao - tranh ai do tao them Admin sau nay
  // qua duong nay (trang chi danh cho lan khoi tao dau tien).
  const soTaiKhoan = await prisma.taiKhoan.count();
  if (soTaiKhoan > 0) {
    return { error: "Hệ thống đã có tài khoản quản trị. Vui lòng đăng nhập." };
  }

  const tenDangNhap = String(formData.get("tenDangNhap") ?? "").trim();
  const matKhau = String(formData.get("matKhau") ?? "");
  const xacNhanMatKhau = String(formData.get("xacNhanMatKhau") ?? "");

  if (!tenDangNhap || tenDangNhap.length < 3) {
    return { error: "Tên đăng nhập cần ít nhất 3 ký tự" };
  }
  if (!/^[a-z0-9._-]+$/i.test(tenDangNhap)) {
    return { error: "Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới/ngang" };
  }
  if (matKhau.length < 8) {
    return { error: "Mật khẩu cần ít nhất 8 ký tự" };
  }
  if (matKhau !== xacNhanMatKhau) {
    return { error: "Mật khẩu xác nhận không khớp" };
  }

  const taiKhoan = await prisma.taiKhoan.create({
    data: {
      tenDangNhap,
      matKhauHash: await hashMatKhau(matKhau),
      vaiTro: "ADMIN",
    },
  });

  await taoPhien(taiKhoan.id);
  redirect("/");
}
