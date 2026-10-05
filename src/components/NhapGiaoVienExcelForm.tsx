"use client";

import { useActionState } from "react";
import {
  phanTichFileGiaoVien,
  luuGiaoVienTuFile,
  type TrangThaiPhanTichGiaoVien,
} from "@/lib/actions/nhap-giao-vien-lop";
import { UploadCloud, AlertCircle, CheckCircle2, Loader2, Save, GraduationCap } from "lucide-react";

const TRANG_THAI_BAN_DAU: TrangThaiPhanTichGiaoVien = { data: null, error: null };

export default function NhapGiaoVienExcelForm() {
  const [state, formAction, pending] = useActionState(
    phanTichFileGiaoVien,
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
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
              <UploadCloud className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
              File danh sách giáo viên (.xlsx)
            </label>
            <input
              type="file"
              name="file"
              accept=".xlsx,.xls"
              required
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
            <p className="text-xs text-slate-400 mt-2">
              File cần có dòng tiêu đề với cột &quot;Họ tên&quot; (bắt buộc) và
              &quot;Số điện thoại&quot; (không bắt buộc). Giáo viên trùng họ
              tên với giáo viên đã có sẽ được bỏ qua.
            </p>
          </div>
          {state.error && (
            <p className="flex items-start gap-1.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                Đang đọc file...
              </>
            ) : (
              "Đọc file"
            )}
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
  data: NonNullable<TrangThaiPhanTichGiaoVien["data"]>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
        <CheckCircle2 className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
        Đọc được {data.length} giáo viên. Xem lại bên dưới trước khi lưu.
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {data.map((gv, idx) => (
          <div key={idx} className="flex items-start gap-3 p-4">
            <GraduationCap className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" strokeWidth={1.75} />
            <div>
              <p className="font-medium text-slate-900">{gv.hoTen}</p>
              {gv.soDienThoai && (
                <p className="text-sm text-slate-500">{gv.soDienThoai}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        action={luuGiaoVienTuFile}
        className="bg-white border border-slate-200 rounded-lg p-6"
      >
        <input type="hidden" name="duLieuJson" value={JSON.stringify(data)} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-emerald-500"
        >
          <Save className="h-4 w-4" strokeWidth={1.75} />
          Lưu vào hệ thống
        </button>
      </form>
    </div>
  );
}
