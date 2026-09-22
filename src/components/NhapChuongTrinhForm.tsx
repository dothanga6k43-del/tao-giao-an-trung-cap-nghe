"use client";

import { useActionState } from "react";
import {
  phanTichFileWord,
  luuChuongTrinhTuFile,
  type TrangThaiPhanTich,
} from "@/lib/actions/nhap-chuong-trinh";

const TRANG_THAI_BAN_DAU: TrangThaiPhanTich = { data: null, error: null };

const LOAI_LABEL: Record<string, string> = {
  LT: "Lý thuyết",
  TH: "Thực hành",
  KT: "Kiểm tra",
};

export default function NhapChuongTrinhForm({
  giaoVien,
}: {
  giaoVien: { id: string; hoTen: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    phanTichFileWord,
    TRANG_THAI_BAN_DAU
  );

  return (
    <div className="space-y-6">
      {!state.data && (
        <form action={formAction} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              File chương trình môn học (.docx)
            </label>
            <input
              type="file"
              name="file"
              accept=".docx"
              required
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
            <p className="text-xs text-slate-400 mt-2">
              AI sẽ đọc file và trích xuất tên môn học, các bài, nội dung chi
              tiết phân cấp. Thời gian của từng đề mục chi tiết (nếu văn bản
              không nói rõ) sẽ để trống — bạn tự gán sau khi lưu.
            </p>
          </div>
          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? "Đang phân tích..." : "Phân tích file"}
          </button>
        </form>
      )}

      {state.data && (
        <XemTruocVaLuu data={state.data} giaoVien={giaoVien} />
      )}
    </div>
  );
}

function XemTruocVaLuu({
  data,
  giaoVien,
}: {
  data: NonNullable<TrangThaiPhanTich["data"]>;
  giaoVien: { id: string; hoTen: string }[];
}) {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
        Đã phân tích xong. Xem lại nội dung bên dưới trước khi lưu — sau khi
        lưu bạn vẫn có thể chỉnh sửa từng phần trong trang chi tiết môn học.
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
        <h2 className="text-lg font-semibold">
          {data.tenMonHoc}
          {data.maMonHoc ? (
            <span className="text-slate-400 font-normal"> · {data.maMonHoc}</span>
          ) : null}
        </h2>
        <p className="text-sm text-slate-600">
          {data.tongSoGio} giờ (LT {data.lyThuyetGio} · TH {data.thucHanhGio} ·
          KT {data.kiemTraGio})
        </p>
        {data.mucTieu && (
          <p className="text-sm text-slate-600 whitespace-pre-line">
            <span className="font-medium">Mục tiêu: </span>
            {data.mucTieu}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">
          Các bài ({data.baiHoc.length})
        </h3>
        {data.baiHoc.map((bai, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900">
              {bai.tenBai}{" "}
              <span className="text-slate-400 font-normal text-sm">
                ({bai.tongSoGio} giờ — LT {bai.lyThuyetGio} · TH{" "}
                {bai.thucHanhGio} · KT {bai.kiemTraGio})
              </span>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {bai.noiDungMuc.map((muc, midx) => (
                <li key={midx}>
                  <span className="text-slate-400">[{LOAI_LABEL[muc.loai]}]</span>{" "}
                  {muc.tieuDe}
                  {muc.children && muc.children.length > 0 && (
                    <ul className="pl-5 mt-1 space-y-0.5">
                      {muc.children.map((con, cidx) => (
                        <li key={cidx}>
                          <span className="text-slate-400">
                            [{LOAI_LABEL[con.loai]}]
                          </span>{" "}
                          {con.tieuDe}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <form
        action={luuChuongTrinhTuFile}
        className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
      >
        <input type="hidden" name="duLieuJson" value={JSON.stringify(data)} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Giáo viên phụ trách
          </label>
          <select
            name="giaoVienId"
            className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">-- Chưa chọn --</option>
            {giaoVien.map((gv) => (
              <option key={gv.id} value={gv.id}>
                {gv.hoTen}
              </option>
            ))}
          </select>
        </div>
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
