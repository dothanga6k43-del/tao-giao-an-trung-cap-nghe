import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { dieuKienTheoGiaoVien } from "@/lib/auth/pham-vi";
import { FileText, Search, ChevronRight, CheckCircle2, PencilLine } from "lucide-react";

const TRANG_THAI_LABEL: Record<string, string> = {
  DRAFT: "Nháp",
  FINAL: "Hoàn thiện",
};

const TRANG_THAI_ICON: Record<string, typeof CheckCircle2> = {
  DRAFT: PencilLine,
  FINAL: CheckCircle2,
};

export default async function GiaoAnListPage(
  props: PageProps<"/giao-an">
) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  const hienTai = await layTaiKhoanHienTai();
  const danhSach = await prisma.giaoAn.findMany({
    where: {
      buoiDay: { lichTrinh: dieuKienTheoGiaoVien(hienTai) },
      ...(q
        ? {
            OR: [
              { tenBai: { contains: q, mode: "insensitive" as const } },
              {
                buoiDay: {
                  lichTrinh: {
                    monHoc: { tenMonHoc: { contains: q, mode: "insensitive" as const } },
                  },
                },
              },
              {
                buoiDay: {
                  lichTrinh: {
                    lop: { tenLop: { contains: q, mode: "insensitive" as const } },
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      buoiDay: {
        include: { lichTrinh: { include: { lop: true, monHoc: true } } },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
          <FileText className="h-6 w-6 text-slate-500" strokeWidth={1.75} />
          Giáo án
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Toàn bộ giáo án đã soạn từ các lịch trình giảng dạy.
        </p>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tên bài, môn học, lớp..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700">
          <Search className="h-4 w-4" strokeWidth={2} />
          Tìm
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <div className="p-10 text-center">
            <FileText className="mx-auto h-9 w-9 text-slate-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-slate-500">Không tìm thấy giáo án nào.</p>
          </div>
        )}
        {danhSach.map((ga) => {
          const TrangThaiIcon = TRANG_THAI_ICON[ga.trangThai] ?? PencilLine;
          return (
            <Link
              key={ga.id}
              href={`/giao-an/${ga.id}`}
              className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"
            >
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.75} />
                <div>
                  <p className="font-medium text-slate-900">{ga.tenBai}</p>
                  <p className="text-sm text-slate-500">
                    {ga.buoiDay.lichTrinh.monHoc.tenMonHoc} ·{" "}
                    {ga.buoiDay.lichTrinh.lop.tenLop} · Buổi {ga.buoiDay.thuTu} ·{" "}
                    {new Date(ga.buoiDay.ngayThucHien).toISOString().slice(0, 10)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    ga.trangThai === "FINAL"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  <TrangThaiIcon className="h-3.5 w-3.5" strokeWidth={2} />
                  {TRANG_THAI_LABEL[ga.trangThai]}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" strokeWidth={2} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
