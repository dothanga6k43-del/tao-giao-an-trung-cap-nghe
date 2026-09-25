import { prisma } from "@/lib/prisma";
import { taoMonHoc } from "@/lib/actions/chuong-trinh";

export default async function MonHocMoiPage() {
  const giaoVien = await prisma.giaoVien.findMany({ orderBy: { hoTen: "asc" } });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Thêm môn học</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Nhập thông tin tổng quan của chương trình môn học (theo mẫu Chương
          trình môn học TCN).
        </p>
      </div>

      <form action={taoMonHoc} className="space-y-5 bg-white border border-slate-200 rounded-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên môn học
            </label>
            <input
              name="tenMonHoc"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="KHÍ CỤ ĐIỆN"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mã môn học
            </label>
            <input
              name="maMonHoc"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="MH11"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Giáo viên phụ trách
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
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tổng số giờ
            </label>
            <input
              name="tongSoGio"
              type="number"
              step="0.5"
              defaultValue={0}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lý thuyết
            </label>
            <input
              name="lyThuyetGio"
              type="number"
              step="0.5"
              defaultValue={0}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Thực hành
            </label>
            <input
              name="thucHanhGio"
              type="number"
              step="0.5"
              defaultValue={0}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kiểm tra
            </label>
            <input
              name="kiemTraGio"
              type="number"
              step="0.5"
              defaultValue={0}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Vị trí, tính chất của môn học
          </label>
          <textarea
            name="viTriTinhChat"
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mục tiêu môn học
          </label>
          <textarea
            name="mucTieu"
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder={"- Nhận dạng và phân loại được các loại khí cụ điện.\n- ..."}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Điều kiện thực hiện môn học
          </label>
          <textarea
            name="dieuKienThucHien"
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phương pháp và nội dung đánh giá
          </label>
          <textarea
            name="phuongPhapDanhGia"
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tài liệu tham khảo
          </label>
          <textarea
            name="taiLieuThamKhao"
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-700"
          >
            Lưu và tiếp tục thêm bài học
          </button>
        </div>
      </form>
    </div>
  );
}
