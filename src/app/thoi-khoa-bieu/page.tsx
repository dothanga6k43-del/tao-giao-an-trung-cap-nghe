import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ganGiaoVienChoThoiKhoaBieu } from "@/lib/actions/gan-giao-vien";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { dieuKienTheoGiaoVien } from "@/lib/auth/pham-vi";
import GanGiaoVienInline from "@/components/GanGiaoVienInline";
import IconBadge from "@/components/IconBadge";
import { MAU_THOI_KHOA_BIEU } from "@/lib/section-colors";
import { CalendarDays, Plus, ChevronRight } from "lucide-react";

export default async function ThoiKhoaBieuListPage() {
  const hienTai = await layTaiKhoanHienTai();
  const laAdmin = hienTai?.vaiTro === "ADMIN";
  const [danhSach, giaoVienOptions] = await Promise.all([
    prisma.thoiKhoaBieu.findMany({
      where: dieuKienTheoGiaoVien(hienTai),
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { dong: true } } },
    }),
    laAdmin
      ? prisma.giaoVien.findMany({ orderBy: { hoTen: "asc" } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold">
            <IconBadge icon={CalendarDays} mau={MAU_THOI_KHOA_BIEU} size="lg" />
            Thời khóa biểu
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Quản lý thời khóa biểu theo tuần để biết mỗi lớp học bao nhiêu
            tiết/ngày.
          </p>
        </div>
        <Link
          href="/thoi-khoa-bieu/nhap"
          className="inline-flex items-center gap-2 self-start rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Nhập thời khóa biểu
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <div className="p-10 text-center">
            <div className="inline-flex">
              <IconBadge icon={CalendarDays} mau={MAU_THOI_KHOA_BIEU} size="lg" />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Chưa có thời khóa biểu nào. Nhấn “Nhập thời khóa biểu” để tải lên
              ảnh, file Excel hoặc file Word.
            </p>
          </div>
        )}
        {danhSach.map((tkb) => (
          <div key={tkb.id} className="flex items-center justify-between gap-3 p-4">
            <Link
              href={`/thoi-khoa-bieu/${tkb.id}`}
              className="flex flex-1 min-w-0 items-start gap-3 hover:opacity-80"
            >
              <IconBadge icon={CalendarDays} mau={MAU_THOI_KHOA_BIEU} size="sm" />
              <div>
                <p className="font-medium text-slate-900">{tkb.tieuDe}</p>
                <p className="text-sm text-slate-500">
                  {tkb.tuanThu ? `Tuần ${tkb.tuanThu} · ` : ""}
                  {tkb.ngayBatDau && tkb.ngayKetThuc
                    ? `${tkb.ngayBatDau.toLocaleDateString("vi-VN")} - ${tkb.ngayKetThuc.toLocaleDateString("vi-VN")} · `
                    : ""}
                  {tkb._count.dong} dòng
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-3 shrink-0">
              {laAdmin && (
                <GanGiaoVienInline
                  key={tkb.giaoVienId ?? "none"}
                  id={tkb.id}
                  giaoVienHienTaiId={tkb.giaoVienId}
                  giaoVienOptions={giaoVienOptions}
                  action={ganGiaoVienChoThoiKhoaBieu}
                />
              )}
              <Link href={`/thoi-khoa-bieu/${tkb.id}`}>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
