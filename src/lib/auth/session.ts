import { cache } from "react";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export const TEN_COOKIE_PHIEN = "phien";
const SO_NGAY_HET_HAN = 30;

// Xuat de proxy.ts (khong dung duoc next/headers cookies()) dung chung logic bam.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function taoPhien(taiKhoanId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const hetHan = new Date(Date.now() + SO_NGAY_HET_HAN * 24 * 60 * 60 * 1000);

  await prisma.phienDangNhap.create({
    data: { taiKhoanId, tokenHash: hashToken(token), hetHan },
  });

  const cookieStore = await cookies();
  cookieStore.set(TEN_COOKIE_PHIEN, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: hetHan,
    path: "/",
  });
}

export async function xoaPhienHienTai(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEN_COOKIE_PHIEN)?.value;
  if (token) {
    await prisma.phienDangNhap
      .delete({ where: { tokenHash: hashToken(token) } })
      .catch(() => {});
  }
  cookieStore.delete(TEN_COOKIE_PHIEN);
}

export type TaiKhoanHienTai = {
  id: string;
  tenDangNhap: string;
  vaiTro: "ADMIN" | "GIAO_VIEN";
  giaoVienId: string | null;
  giaoVienHoTen: string | null;
};

// Chi doc, khong redirect - dung de hien thi UI (ten nguoi dung, an/hien nut
// theo vai tro). Viec bat buoc dang nhap cho tung trang do proxy.ts dam nhiem;
// cac hanh dong rieng (actions) can quyen Admin tu kiem tra lai vai tro.
export const layTaiKhoanHienTai = cache(async (): Promise<TaiKhoanHienTai | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEN_COOKIE_PHIEN)?.value;
  if (!token) return null;

  const phien = await prisma.phienDangNhap.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { taiKhoan: { include: { giaoVien: true } } },
  });

  if (!phien || phien.hetHan < new Date()) return null;

  return {
    id: phien.taiKhoan.id,
    tenDangNhap: phien.taiKhoan.tenDangNhap,
    vaiTro: phien.taiKhoan.vaiTro,
    giaoVienId: phien.taiKhoan.giaoVienId,
    giaoVienHoTen: phien.taiKhoan.giaoVien?.hoTen ?? null,
  };
});

// Dung trong cac Server Action quan ly tai khoan - khong duoc chi dua vao
// proxy.ts (co the bi vo hieu neu matcher thay doi sau nay).
export async function yeuCauAdmin(): Promise<TaiKhoanHienTai> {
  const taiKhoan = await layTaiKhoanHienTai();
  if (!taiKhoan || taiKhoan.vaiTro !== "ADMIN") {
    throw new Error("Chỉ tài khoản Admin mới được thực hiện thao tác này");
  }
  return taiKhoan;
}
