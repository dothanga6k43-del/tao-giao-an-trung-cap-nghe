import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { dieuKienTheoGiaoVien } from "@/lib/auth/pham-vi";
import { CalendarDays, Plus, ChevronRight } from "lucide-react";

export default async function ThoiKhoaBieuListPage() {
  const hienTai = await layTaiKhoanHienTai();
  const danhSach = await prisma.thoiKhoaBieu.findMany({
    where: dieuKienTheoGiaoVien(hienTai),
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { dong: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
            <CalendarDays className="h-6 w-6 text-slate-500" strokeWidth={1.75} />
            Thời khóa biểu
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Quản lý thời khóa biểu theo tuần để biết mỗi lớp học bao nhiêu
            tiết/ngày.
          </p>
        </div>
        <Link
          href="/thoi-khoa-bieu/nhap"
          className="inline-flex items-center gap-2 self-start rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Nhập thời khóa biểu
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto h-9 w-9 text-slate-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-slate-500">
              Chưa có thời khóa biểu nào. Nhấn “Nhập thời khóa biểu” để tải lên
              ảnh, file Excel hoặc file Word.
            </p>
          </div>
        )}
        {danhSach.map((tkb) => (
          <Link
            key={tkb.id}
            href={`/thoi-khoa-bieu/${tkb.id}`}
            className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"
          >
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.75} />
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
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
          </Link>
        ))}
      </div>
    </div>
  );
}
