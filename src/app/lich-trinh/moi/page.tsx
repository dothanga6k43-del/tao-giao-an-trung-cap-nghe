import { prisma } from "@/lib/prisma";
import { taoLichTrinh } from "@/lib/actions/lich-trinh";

const THU_LABEL: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
};

export default async function LichTrinhMoiPage() {
  const [lop, monHoc, giaoVien] = await Promise.all([
    prisma.lop.findMany({ orderBy: { tenLop: "asc" } }),
    prisma.monHoc.findMany({ orderBy: { tenMonHoc: "asc" } }),
    prisma.giaoVien.findMany({ orderBy: { hoTen: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Tạo lịch trình giảng dạy</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Chọn lớp, môn học và khung tiết theo thời khóa biểu. Sau khi tạo,
          bạn có thể thêm ngày nghỉ rồi bấm “Sinh lịch trình”.
        </p>
      </div>

      <form
        action={taoLichTrinh}
        className="space-y-6 bg-white border border-slate-200 rounded-lg p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lớp
            </label>
            <select
              name="lopId"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn lớp --</option>
              {lop.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.tenLop}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Môn học
            </label>
            <select
              name="monHocId"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn môn học --</option>
              {monHoc.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.tenMonHoc} ({m.tongSoGio} giờ)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Giáo viên
            </label>
            <select
              name="giaoVienId"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chưa chọn --</option>
              {giaoVien.map((gv) => (
                <option key={gv.id} value={gv.id}>
                  {gv.hoTen}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Học kỳ
            </label>
            <input
              name="hocKy"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Học kỳ I"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ngày bắt đầu
            </label>
            <input
              name="ngayBatDau"
              type="date"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Số phút mỗi tiết
            </label>
            <input
              name="soPhutMoiTiet"
              type="number"
              defaultValue={45}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-2">
            Khung tiết theo thời khóa biểu (để trống ngày không học môn này)
          </h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="p-2 w-24">Thứ</th>
                  <th className="p-2">Tiết bắt đầu</th>
                  <th className="p-2">Số tiết</th>
                  <th className="p-2">Địa điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[2, 3, 4, 5, 6, 7].map((thu) => (
                  <tr key={thu}>
                    <td className="p-2 font-medium">{THU_LABEL[thu]}</td>
                    <td className="p-2">
                      <input
                        name={`tiet_batdau_${thu}`}
                        type="number"
                        min={1}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        name={`tiet_sotiet_${thu}`}
                        type="number"
                        min={1}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        name={`tiet_diadiem_${thu}`}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        placeholder="X. Điện tử"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-700"
        >
          Tạo lịch trình
        </button>
      </form>
    </div>
  );
}
