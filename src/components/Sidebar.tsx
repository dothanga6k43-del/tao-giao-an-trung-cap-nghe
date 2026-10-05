"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpenText,
  Users,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  FileText,
  Menu,
  X,
  LayoutGrid,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/chuong-trinh", label: "Chương trình môn học", icon: BookOpenText },
  { href: "/lop", label: "Lớp học", icon: Users },
  { href: "/giao-vien", label: "Giáo viên", icon: GraduationCap },
  { href: "/thoi-khoa-bieu", label: "Thời khóa biểu", icon: CalendarDays },
  { href: "/lich-trinh", label: "Lịch trình giảng dạy", icon: ClipboardList },
  { href: "/giao-an", label: "Giáo án", icon: FileText },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="no-print md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-slate-900"
          onClick={() => setOpen(false)}
        >
          <LayoutGrid className="h-5 w-5 text-slate-700" strokeWidth={2} />
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
        className={`no-print fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 md:static md:z-auto md:min-h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-200 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-slate-900"
            onClick={() => setOpen(false)}
          >
            <LayoutGrid className="h-5 w-5 text-slate-700" strokeWidth={2} />
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
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
