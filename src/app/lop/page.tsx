import { prisma } from "@/lib/prisma";
import { taoLop, xoaLop } from "@/lib/actions/lop";

export default async function LopPage() {
  const danhSach = await prisma.lop.findMany({ orderBy: { tenLop: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Lớp học</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Danh sách lớp dùng để tạo lịch trình giảng dạy.
        </p>
      </div>

      <form
        action={taoLop}
        className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-end gap-4"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tên lớp
          </label>
          <input
            name="tenLop"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Điện CN K23"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Khoa
          </label>
          <input
            name="khoa"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Điện - May thời trang"
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Năm thứ
          </label>
          <input
            name="namThu"
            type="number"
            min={1}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="1"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          Thêm lớp
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <p className="p-5 text-sm text-slate-500">Chưa có lớp nào.</p>
        )}
        {danhSach.map((lop) => (
          <div key={lop.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-slate-900">{lop.tenLop}</p>
              <p className="text-sm text-slate-500">
                {[lop.khoa, lop.namThu ? `Năm thứ ${lop.namThu}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <form action={xoaLop}>
              <input type="hidden" name="id" value={lop.id} />
              <button
                type="submit"
                className="text-sm text-red-600 hover:underline"
              >
                Xóa
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
