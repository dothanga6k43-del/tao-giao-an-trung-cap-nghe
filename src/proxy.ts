import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { TEN_COOKIE_PHIEN, hashToken } from "@/lib/auth/session";

const DUONG_DAN_CONG_KHAI = ["/dang-nhap", "/thiet-lap-admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const laDuongDanCongKhai = DUONG_DAN_CONG_KHAI.includes(pathname);

  const token = request.cookies.get(TEN_COOKIE_PHIEN)?.value;
  let daDangNhap = false;

  if (token) {
    const phien = await prisma.phienDangNhap.findUnique({
      where: { tokenHash: hashToken(token) },
      select: { hetHan: true },
    });
    daDangNhap = !!phien && phien.hetHan > new Date();
  }

  if (!laDuongDanCongKhai && !daDangNhap) {
    const url = request.nextUrl.clone();
    url.pathname = "/dang-nhap";
    url.searchParams.set("tiep", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/dang-nhap" && daDangNhap) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
