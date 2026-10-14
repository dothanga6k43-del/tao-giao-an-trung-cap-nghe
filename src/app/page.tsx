import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { dieuKienTheoGiaoVien } from "@/lib/auth/pham-vi";
import IconBadge from "@/components/IconBadge";
import {
  MAU_CHUONG_TRINH,
  MAU_LOP,
  MAU_GIAO_VIEN,
  MAU_THOI_KHOA_BIEU,
  MAU_LICH_TRINH,
  MAU_GIAO_AN,
  type MauKhuVuc,
} from "@/lib/section-colors";
import {
  BookOpenText,
  Users,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  FileText,
  Plus,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

function loiChao() {
  const gio = new Date().getHours();
  if (gio < 11) return "Chào buổi sáng";
  if (gio < 13) return "Chào buổi trưa";
  if (gio < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default async function TrangChuPage() {
  const hienTai = await layTaiKhoanHienTai();
  const dieuKien = dieuKienTheoGiaoVien(hienTai);

  const [soMonHoc, soLop, soGiaoVien, soThoiKhoaBieu, soLichTrinh, soGiaoAn] =
    await Promise.all([
      prisma.monHoc.count({ where: dieuKien }),
      prisma.lop.count({ where: dieuKien }),
      prisma.giaoVien.count(),
      prisma.thoiKhoaBieu.count({ where: dieuKien }),
      prisma.lichTrinhGiangDay.count({ where: dieuKien }),
      prisma.giaoAn.count({ where: { buoiDay: { lichTrinh: dieuKien } } }),
    ]);

  const theThongKe: {
    href: string;
    label: string;
    soLuong: number;
    icon: LucideIcon;
    mau: MauKhuVuc;
  }[] = [
    { href: "/chuong-trinh", label: "Môn học", soLuong: soMonHoc, icon: BookOpenText, mau: MAU_CHUONG_TRINH },
    { href: "/lop", label: "Lớp học", soLuong: soLop, icon: Users, mau: MAU_LOP },
    { href: "/giao-vien", label: "Giáo viên", soLuong: soGiaoVien, icon: GraduationCap, mau: MAU_GIAO_VIEN },
    { href: "/thoi-khoa-bieu", label: "Thời khóa biểu", soLuong: soThoiKhoaBieu, icon: CalendarDays, mau: MAU_THOI_KHOA_BIEU },
    { href: "/lich-trinh", label: "Lịch trình giảng dạy", soLuong: soLichTrinh, icon: ClipboardList, mau: MAU_LICH_TRINH },
    { href: "/giao-an", label: "Giáo án đã soạn", soLuong: soGiaoAn, icon: FileText, mau: MAU_GIAO_AN },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 sm:p-8 text-white">
        <p className="flex items-center gap-1.5 text-indigo-100 text-sm font-medium">
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          {loiChao()}
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold mt-1">
          {hienTai?.giaoVienHoTen ?? hienTai?.tenDangNhap ?? "Bạn"}
        </h1>
        <p className="text-indigo-100 mt-2 text-sm max-w-xl">
          Tổng quan chương trình, lịch trình giảng dạy và giáo án của bạn trong hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {theThongKe.map((the) => (
          <Link
            key={the.href}
            href={the.href}
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-slate-300 hover:shadow-sm transition"
          >
            <IconBadge icon={the.icon} mau={the.mau} size="lg" />
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-slate-900">{the.soLuong}</p>
              <p className="text-sm text-slate-500 truncate">{the.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 mb-3">Thao tác nhanh</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/chuong-trinh/moi"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Thêm môn học
          </Link>
          <Link
            href="/lich-trinh/moi"
            className="inline-flex items-center gap-2 rounded-md bg-violet-600 text-white px-4 py-2 text-sm font-medium hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Tạo lịch trình
          </Link>
          <Link
            href="/lop"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Thêm lớp
          </Link>
        </div>
      </div>
    </div>
  );
}
