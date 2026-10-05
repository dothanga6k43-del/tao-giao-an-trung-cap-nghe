"use client";

import { useActionState } from "react";
import {
  phanTichFileChiTiet,
  luuChiTietTuFile,
  type TrangThaiPhanTichChiTiet,
} from "@/lib/actions/nhap-chi-tiet-chuong-trinh";
import { chuanHoaTenBai } from "@/lib/chuongtrinh/ten-bai";
import {
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  RefreshCw,
  Plus,
} from "lucide-react";

const TRANG_THAI_BAN_DAU: TrangThaiPhanTichChiTiet = { data: null, error: null };

const LOAI_LABEL: Record<string, string> = {
  LT: "Lý thuyết",
  TH: "Thực hành",
  KT: "Kiểm tra",
};

export default function NhapChiTietChuongTrinhForm({
  monHocId,
  tenBaiHienCo,
}: {
  monHocId: string;
  tenBaiHienCo: string[];
}) {
  const [state, formAction, pending] = useActionState(
    phanTichFileChiTiet,
    TRANG_THAI_BAN_DAU
  );

  return (
    <div className="space-y-6">
      {!state.data && (
        <form action={formAction} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
              <UploadCloud className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
              File chương trình chi tiết (.docx hoặc .xlsx)
            </label>
            <input
              type="file"
              name="file"
              accept=".docx,.xlsx,.xls"
              required
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
            <p className="text-xs text-slate-400 mt-2">
              AI sẽ đọc file và trích xuất các bài cùng nội dung chi tiết (kèm
              thời gian nếu có). Bài trùng tên với bài đã có sẽ được cập nhật
              (thay thế nội dung chi tiết cũ), bài chưa có sẽ được tạo mới.
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
                Đang phân tích...
              </>
            ) : (
              "Phân tích file"
            )}
          </button>
        </form>
      )}

      {state.data && (
        <XemTruocVaLuu data={state.data} monHocId={monHocId} tenBaiHienCo={tenBaiHienCo} />
      )}
    </div>
  );
}

function XemTruocVaLuu({
  data,
  monHocId,
  tenBaiHienCo,
}: {
  data: NonNullable<TrangThaiPhanTichChiTiet["data"]>;
  monHocId: string;
  tenBaiHienCo: string[];
}) {
  const tenHienCoChuanHoa = tenBaiHienCo.map(chuanHoaTenBai);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
        <CheckCircle2 className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
        Đã phân tích xong. Xem lại nội dung bên dưới trước khi lưu.
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">
          Các bài trong file ({data.baiHoc.length})
        </h3>
        {data.baiHoc.map((bai, idx) => {
          const daCo = tenHienCoChuanHoa.includes(chuanHoaTenBai(bai.tenBai));
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="font-medium text-slate-900">
                {bai.tenBai}{" "}
                <span
                  className={`inline-flex items-center gap-1 text-xs font-normal px-2 py-0.5 rounded-full ${
                    daCo ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {daCo ? (
                    <RefreshCw className="h-3 w-3" strokeWidth={2} />
                  ) : (
                    <Plus className="h-3 w-3" strokeWidth={2.25} />
                  )}
                  {daCo ? "Sẽ cập nhật bài đã có" : "Sẽ tạo bài mới"}
                </span>{" "}
                <span className="text-slate-400 font-normal text-sm">
                  ({bai.tongSoGio} giờ — LT {bai.lyThuyetGio} · TH {bai.thucHanhGio} · KT{" "}
                  {bai.kiemTraGio})
                </span>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {bai.noiDungMuc.map((muc, midx) => (
                  <li key={midx}>
                    <span className="text-slate-400">[{LOAI_LABEL[muc.loai]}]</span>{" "}
                    {muc.tieuDe}
                    {muc.thoiGianTiet != null ? ` (${muc.thoiGianTiet}h)` : ""}
                    {muc.children && muc.children.length > 0 && (
                      <ul className="pl-5 mt-1 space-y-0.5">
                        {muc.children.map((con, cidx) => (
                          <li key={cidx}>
                            <span className="text-slate-400">[{LOAI_LABEL[con.loai]}]</span>{" "}
                            {con.tieuDe}
                            {con.thoiGianTiet != null ? ` (${con.thoiGianTiet}h)` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <form
        action={luuChiTietTuFile}
        className="bg-white border border-slate-200 rounded-lg p-6"
      >
        <input type="hidden" name="monHocId" value={monHocId} />
        <input type="hidden" name="duLieuJson" value={JSON.stringify(data)} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-emerald-500"
        >
          <Save className="h-4 w-4" strokeWidth={1.75} />
          Lưu vào chương trình môn học
        </button>
      </form>
    </div>
  );
}
