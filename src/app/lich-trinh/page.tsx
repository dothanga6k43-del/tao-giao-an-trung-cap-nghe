import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { dieuKienTheoGiaoVien } from "@/lib/auth/pham-vi";
import { ClipboardList, Plus, CheckCircle2, PencilLine } from "lucide-react";

const TRANG_THAI_LABEL: Record<string, string> = {
  DRAFT: "Nháp",
  APPROVED: "Đã duyệt",
};

const TRANG_THAI_ICON: Record<string, typeof CheckCircle2> = {
  DRAFT: PencilLine,
  APPROVED: CheckCircle2,
};

export default async function LichTrinhListPage() {
  const hienTai = await layTaiKhoanHienTai();
  const danhSach = await prisma.lichTrinhGiangDay.findMany({
    where: dieuKienTheoGiaoVien(hienTai),
    orderBy: { createdAt: "desc" },
    include: { lop: true, monHoc: true, giaoVien: true, buoiDay: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
            <ClipboardList className="h-6 w-6 text-slate-500" strokeWidth={1.75} />
            Lịch trình giảng dạy
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Xếp nội dung chi tiết vào các buổi dạy theo thời khóa biểu, sau đó
            duyệt để tạo giáo án.
          </p>
        </div>
        <Link
          href="/lich-trinh/moi"
          className="inline-flex items-center gap-2 self-start rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Tạo lịch trình
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <div className="p-10 text-center">
            <ClipboardList className="mx-auto h-9 w-9 text-slate-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-slate-500">Chưa có lịch trình nào.</p>
          </div>
        )}
        {danhSach.map((lt) => {
          const TrangThaiIcon = TRANG_THAI_ICON[lt.trangThai] ?? PencilLine;
          return (
            <Link
              key={lt.id}
              href={`/lich-trinh/${lt.id}`}
              className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"
            >
              <div className="flex items-start gap-3">
                <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.75} />
                <div>
                  <p className="font-medium text-slate-900">
                    {lt.monHoc.tenMonHoc} · {lt.lop.tenLop}
                  </p>
                  <p className="text-sm text-slate-500">
                    {lt.giaoVien ? `GV: ${lt.giaoVien.hoTen} · ` : ""}
                    {lt.buoiDay.length} buổi dạy
                    {lt.hocKy ? ` · ${lt.hocKy}` : ""}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                  lt.trangThai === "APPROVED"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                <TrangThaiIcon className="h-3.5 w-3.5" strokeWidth={2} />
                {TRANG_THAI_LABEL[lt.trangThai]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
