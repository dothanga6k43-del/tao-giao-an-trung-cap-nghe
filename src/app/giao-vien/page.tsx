import { prisma } from "@/lib/prisma";
import { taoGiaoVien, xoaGiaoVien } from "@/lib/actions/giao-vien";

export default async function GiaoVienPage() {
  const danhSach = await prisma.giaoVien.findMany({
    orderBy: { hoTen: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Giáo viên</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Danh sách giáo viên dùng để gán vào môn học và lịch trình giảng dạy.
        </p>
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
          className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          Thêm giáo viên
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <p className="p-5 text-sm text-slate-500">Chưa có giáo viên nào.</p>
        )}
        {danhSach.map((gv) => (
          <div key={gv.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-slate-900">{gv.hoTen}</p>
              {gv.soDienThoai && (
                <p className="text-sm text-slate-500">{gv.soDienThoai}</p>
              )}
            </div>
            <form action={xoaGiaoVien}>
              <input type="hidden" name="id" value={gv.id} />
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
