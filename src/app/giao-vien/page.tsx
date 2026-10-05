import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { taoGiaoVien, xoaGiaoVien } from "@/lib/actions/giao-vien";
import { GraduationCap, Plus, Trash2, FileSpreadsheet, CheckCircle2 } from "lucide-react";

export default async function GiaoVienPage(props: PageProps<"/giao-vien">) {
  const searchParams = await props.searchParams;
  const daThem = typeof searchParams.daThem === "string" ? Number(searchParams.daThem) : null;
  const boQua = typeof searchParams.boQua === "string" ? Number(searchParams.boQua) : 0;

  const danhSach = await prisma.giaoVien.findMany({
    orderBy: { hoTen: "asc" },
  });

  return (
    <div className="space-y-8">
      {daThem !== null && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
          Đã thêm {daThem} giáo viên từ file Excel
          {boQua > 0 ? ` (bỏ qua ${boQua} giáo viên trùng tên đã có)` : ""}.
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
            <GraduationCap className="h-6 w-6 text-slate-500" strokeWidth={1.75} />
            Giáo viên
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Danh sách giáo viên dùng để gán vào môn học và lịch trình giảng dạy.
          </p>
        </div>
        <Link
          href="/giao-vien/nhap-excel"
          className="inline-flex items-center gap-2 self-start rounded-md border border-slate-300 text-slate-700 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
        >
          <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} />
          Nhập từ Excel
        </Link>
      </div>

      <form
        action={taoGiaoVien}
        className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-end gap-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Họ tên
          </label>
          <input
            name="hoTen"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Đỗ Văn Đức Thắng"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Số điện thoại
          </label>
          <input
            name="soDienThoai"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="0374958991"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Thêm giáo viên
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <div className="p-10 text-center">
            <GraduationCap className="mx-auto h-9 w-9 text-slate-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-slate-500">Chưa có giáo viên nào.</p>
          </div>
        )}
        {danhSach.map((gv) => (
          <div key={gv.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.75} />
              <div>
                <p className="font-medium text-slate-900">{gv.hoTen}</p>
                {gv.soDienThoai && (
                  <p className="text-sm text-slate-500">{gv.soDienThoai}</p>
                )}
              </div>
            </div>
            <form action={xoaGiaoVien}>
              <input type="hidden" name="id" value={gv.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                Xóa
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
