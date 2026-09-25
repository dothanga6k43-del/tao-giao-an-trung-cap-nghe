"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/chuong-trinh", label: "Chương trình môn học" },
  { href: "/lop", label: "Lớp học" },
  { href: "/giao-vien", label: "Giáo viên" },
  { href: "/thoi-khoa-bieu", label: "Thời khóa biểu" },
  { href: "/lich-trinh", label: "Lịch trình giảng dạy" },
  { href: "/giao-an", label: "Giáo án" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900" onClick={() => setOpen(false)}>
          Soạn giáo án TCN
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở menu"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
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
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 md:static md:z-auto md:min-h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-200 flex items-center justify-between">
          <Link href="/" className="font-semibold text-slate-900" onClick={() => setOpen(false)}>
            Soạn giáo án TCN
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
            className="md:hidden rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
