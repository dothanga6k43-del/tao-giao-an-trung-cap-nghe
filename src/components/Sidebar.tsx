"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { dangXuat } from "@/lib/actions/dang-nhap";
import type { TaiKhoanHienTai } from "@/lib/auth/session";
import IconBadge from "@/components/IconBadge";
import {
  BookOpenText,
  Users,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  FileText,
  KeyRound,
  Menu,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";
import {
  MAU_CHUONG_TRINH,
  MAU_LOP,
  MAU_GIAO_VIEN,
  MAU_THOI_KHOA_BIEU,
  MAU_LICH_TRINH,
  MAU_GIAO_AN,
  MAU_TAI_KHOAN,
} from "@/lib/section-colors";

const NAV_ITEMS = [
  { href: "/chuong-trinh", label: "Chương trình môn học", icon: BookOpenText, mau: MAU_CHUONG_TRINH },
  { href: "/lop", label: "Lớp học", icon: Users, mau: MAU_LOP },
  { href: "/giao-vien", label: "Giáo viên", icon: GraduationCap, mau: MAU_GIAO_VIEN },
  { href: "/thoi-khoa-bieu", label: "Thời khóa biểu", icon: CalendarDays, mau: MAU_THOI_KHOA_BIEU },
  { href: "/lich-trinh", label: "Lịch trình giảng dạy", icon: ClipboardList, mau: MAU_LICH_TRINH },
  { href: "/giao-an", label: "Giáo án", icon: FileText, mau: MAU_GIAO_AN },
];

const DUONG_DAN_AN_SIDEBAR = ["/dang-nhap", "/thiet-lap-admin"];

export default function Sidebar({ taiKhoan }: { taiKhoan: TaiKhoanHienTai | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname && DUONG_DAN_AN_SIDEBAR.includes(pathname)) {
    return null;
  }

  const navItems = taiKhoan?.vaiTro === "ADMIN"
    ? [...NAV_ITEMS, { href: "/tai-khoan", label: "Tài khoản", icon: KeyRound, mau: MAU_TAI_KHOAN }]
    : NAV_ITEMS;

  return (
    <>
      <header className="no-print md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-slate-900"
          onClick={() => setOpen(false)}
        >
          <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
          </span>
          Soạn giáo án TCN
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở menu"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 md:static md:z-auto md:min-h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-200 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-slate-900"
            onClick={() => setOpen(false)}
          >
            <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5">
              <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
            </span>
            Soạn giáo án TCN
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
            className="md:hidden rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4.5 w-4.5" strokeWidth={2} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm ${
                  active
                    ? `${item.mau.bg} ${item.mau.text} font-semibold`
                    : "text-slate-600 font-medium hover:bg-slate-50"
                }`}
              >
                <IconBadge icon={item.icon} mau={item.mau} size="sm" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {taiKhoan && (
          <div className="mt-auto border-t border-slate-200 p-3">
            <p className="px-3 text-xs text-slate-400 truncate">
              {taiKhoan.giaoVienHoTen ?? taiKhoan.tenDangNhap}
              {taiKhoan.vaiTro === "ADMIN" ? " · Admin" : ""}
            </p>
            <form action={dangXuat}>
              <button
                type="submit"
                className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
                Đăng xuất
              </button>
            </form>
          </div>
        )}
      </aside>
    </>
  );
}
