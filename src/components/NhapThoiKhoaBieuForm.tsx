"use client";

import { useActionState } from "react";
import {
  phanTichFileThoiKhoaBieu,
  luuThoiKhoaBieuTuFile,
  type TrangThaiPhanTichTKB,
} from "@/lib/actions/nhap-thoi-khoa-bieu";

const TRANG_THAI_BAN_DAU: TrangThaiPhanTichTKB = { data: null, error: null };

const TEN_THU: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ nhật",
};

export default function NhapThoiKhoaBieuForm() {
  const [state, formAction, pending] = useActionState(
    phanTichFileThoiKhoaBieu,
    TRANG_THAI_BAN_DAU
  );

  return (
    <div className="space-y-6">
      {!state.data && (
        <form
          action={formAction}
          className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              File thời khóa biểu (ảnh, .xlsx hoặc .docx)
            </label>
            <input
              type="file"
              name="file"
              accept=".png,.jpg,.jpeg,.webp,.gif,.xlsx,.xls,.docx"
              required
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
            <p className="text-xs text-slate-400 mt-2">
              AI sẽ đọc file và trích xuất từng lớp, khối tiết, môn học theo
              từng thứ trong tuần.
            </p>
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? "Đang phân tích..." : "Phân tích file"}
          </button>
        </form>
      )}

      {state.data && <XemTruocVaLuu data={state.data} />}
    </div>
  );
}

function XemTruocVaLuu({
  data,
}: {
  data: NonNullable<TrangThaiPhanTichTKB["data"]>;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
        Đã phân tích xong. Xem lại nội dung bên dưới trước khi lưu.
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-1">
        <h2 className="text-lg font-semibold">{data.tieuDe}</h2>
        <p className="text-sm text-slate-600">
          {data.tuanThu ? `Tuần ${data.tuanThu} · ` : ""}
          {data.ngayBatDau && data.ngayKetThuc
            ? `${data.ngayBatDau} - ${data.ngayKetThuc} · `
            : ""}
          {data.buoiHoc ?? ""}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">
          Các lớp ({data.lopHoc.length})
        </h3>
        {data.lopHoc.map((lop, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <p className="font-medium text-slate-900">
              {lop.lop}
              {lop.diaDiem ? (
                <span className="text-slate-400 font-normal"> · {lop.diaDiem}</span>
              ) : null}
            </p>
            {lop.tietBlocks.map((khoi, kidx) => (
              <div key={kidx} className="text-sm">
                <p className="text-slate-500 font-medium">Tiết {khoi.tietBlock}</p>
                <ul className="mt-1 divide-y divide-slate-100">
                  {khoi.cacNgay.map((ngay, nidx) => (
                    <li key={nidx} className="py-1 flex gap-2">
                      <span className="w-20 shrink-0 text-slate-400">
                        {TEN_THU[ngay.thu] ?? `Thứ ${ngay.thu}`}
                      </span>
                      <span className="text-slate-700">
                        {ngay.monHoc ?? "—"}
                        {ngay.soGioLuyKe != null ? ` (${ngay.soGioLuyKe}h)` : ""}
                        {ngay.giaoVien ? ` - ${ngay.giaoVien}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {lop.ghiChuTongHop && (
              <p className="text-xs text-slate-400 whitespace-pre-line">
                Ghi chú: {lop.ghiChuTongHop}
              </p>
            )}
          </div>
        ))}
      </div>

      <form
        action={luuThoiKhoaBieuTuFile}
        className="bg-white border border-slate-200 rounded-lg p-6"
      >
        <input type="hidden" name="duLieuJson" value={JSON.stringify(data)} />
        <button
          type="submit"
          className="rounded-md bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-emerald-500"
        >
          Lưu vào hệ thống
        </button>
      </form>
    </div>
  );
}
