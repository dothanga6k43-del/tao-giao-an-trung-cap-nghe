"use client";

import { useActionState } from "react";
import {
  phanTichFileMauGiaoAn,
  luuMauGiaoAn,
  type TrangThaiPhanTichMau,
} from "@/lib/actions/giao-an-mau";

const TRANG_THAI_BAN_DAU: TrangThaiPhanTichMau = {
  data: null,
  tenFile: null,
  error: null,
};

export default function NhapMauGiaoAnForm({ monHocId }: { monHocId: string }) {
  const [state, formAction, pending] = useActionState(
    phanTichFileMauGiaoAn,
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
              File giáo án mẫu (.docx hoặc .pdf)
            </label>
            <input
              type="file"
              name="file"
              accept=".docx,.pdf"
              required
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
            <p className="text-xs text-slate-400 mt-2">
              AI sẽ đọc file và trích xuất cấu trúc các mục trong phần
              &quot;Thực hiện bài học&quot; (tên và ý nghĩa từng mục), dùng
              làm khung mẫu khi soạn giáo án cho môn học này sau này.
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

      {state.data && (
        <XemTruocVaLuu
          data={state.data}
          tenFile={state.tenFile}
          monHocId={monHocId}
        />
      )}
    </div>
  );
}

function XemTruocVaLuu({
  data,
  tenFile,
  monHocId,
}: {
  data: NonNullable<TrangThaiPhanTichMau["data"]>;
  tenFile: string | null;
  monHocId: string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
        Đã phân tích xong. Xem lại cấu trúc các mục bên dưới trước khi lưu.
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {data.map((khung, idx) => (
          <div key={idx} className="p-4">
            <p className="font-medium text-slate-900">
              {idx + 1}. {khung.tieuDe}
            </p>
            {khung.moTa && (
              <p className="text-sm text-slate-500 mt-0.5">{khung.moTa}</p>
            )}
          </div>
        ))}
      </div>

      <form
        action={luuMauGiaoAn}
        className="bg-white border border-slate-200 rounded-lg p-6"
      >
        <input type="hidden" name="monHocId" value={monHocId} />
        <input type="hidden" name="tenFile" value={tenFile ?? ""} />
        <input type="hidden" name="duLieuJson" value={JSON.stringify(data)} />
        <button
          type="submit"
          className="rounded-md bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-emerald-500"
        >
          Lưu làm mẫu giáo án cho môn học này
        </button>
      </form>
    </div>
  );
}
