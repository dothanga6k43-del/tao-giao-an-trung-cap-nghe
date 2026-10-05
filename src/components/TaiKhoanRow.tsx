"use client";

import { useActionState, useState } from "react";
import {
  suaTaiKhoan,
  xoaTaiKhoan,
  datLaiMatKhau,
  type TrangThaiDatLaiMatKhau,
  type TrangThaiSuaTaiKhoan,
} from "@/lib/actions/tai-khoan";
import {
  ShieldCheck,
  GraduationCap,
  PencilLine,
  KeyRound,
  Trash2,
  Copy,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

type TaiKhoan = {
  id: string;
  tenDangNhap: string;
  vaiTro: "ADMIN" | "GIAO_VIEN";
  giaoVienId: string | null;
  createdAt: string;
};

const TRANG_THAI_BAN_DAU: TrangThaiDatLaiMatKhau = { error: null, ketQua: null };
const TRANG_THAI_SUA_BAN_DAU: TrangThaiSuaTaiKhoan = { error: null };

export default function TaiKhoanRow({
  taiKhoan,
  giaoVienOption,
  laTaiKhoanHienTai,
}: {
  taiKhoan: TaiKhoan;
  giaoVienOption: { id: string; hoTen: string }[];
  laTaiKhoanHienTai: boolean;
}) {
  const [dangSua, setDangSua] = useState(false);
  const [state, formAction, pending] = useActionState(datLaiMatKhau, TRANG_THAI_BAN_DAU);
  const [suaState, suaFormAction, suaPending] = useActionState(
    suaTaiKhoan,
    TRANG_THAI_SUA_BAN_DAU
  );
  const giaoVienLienKet = giaoVienOption.find((g) => g.id === taiKhoan.giaoVienId);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {taiKhoan.vaiTro === "ADMIN" ? (
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-500" strokeWidth={1.75} />
          ) : (
            <GraduationCap className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.75} />
          )}
          <div>
            <p className="font-medium text-slate-900 flex items-center gap-2">
              {taiKhoan.tenDangNhap}
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  taiKhoan.vaiTro === "ADMIN"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {taiKhoan.vaiTro === "ADMIN" ? "Admin" : "Giáo viên"}
              </span>
              {laTaiKhoanHienTai && (
                <span className="text-xs text-slate-400">(đang đăng nhập)</span>
              )}
            </p>
            <p className="text-sm text-slate-500">
              {giaoVienLienKet ? `Gắn với: ${giaoVienLienKet.hoTen}` : "Tài khoản độc lập"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setDangSua((v) => !v)}
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:underline"
          >
            {dangSua ? (
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <PencilLine className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            {dangSua ? "Hủy" : "Sửa"}
          </button>
          {!laTaiKhoanHienTai && (
            <form action={xoaTaiKhoan}>
              <input type="hidden" name="id" value={taiKhoan.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Xóa
              </button>
            </form>
          )}
        </div>
      </div>

      {dangSua && (
        <form
          action={suaFormAction}
          className="space-y-2 bg-slate-50 border border-slate-200 rounded-md p-3"
        >
          <input type="hidden" name="id" value={taiKhoan.id} />
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-0.5">Tên đăng nhập</label>
              <input
                name="tenDangNhap"
                defaultValue={taiKhoan.tenDangNhap}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-0.5">Vai trò</label>
              <select
                name="vaiTro"
                defaultValue={taiKhoan.vaiTro}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
              >
                <option value="GIAO_VIEN">Giáo viên</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-0.5">Gắn với giáo viên</label>
              <select
                name="giaoVienId"
                defaultValue={taiKhoan.giaoVienId ?? ""}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
              >
                <option value="">-- Không gắn --</option>
                {giaoVienOption.map((gv) => (
                  <option key={gv.id} value={gv.id}>
                    {gv.hoTen}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={suaPending}
              className="rounded-md bg-slate-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
            >
              {suaPending ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
          {suaState.error && (
            <p className="flex items-start gap-1.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
              {suaState.error}
            </p>
          )}
        </form>
      )}

      {state.ketQua && state.ketQua.taiKhoanId === taiKhoan.id ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-sm text-emerald-800">
          <p className="font-medium mb-1">
            Mật khẩu mới — sao chép ngay, sẽ không hiển thị lại:
          </p>
          <div className="flex flex-wrap items-center gap-2 bg-white border border-emerald-200 rounded-md px-3 py-2 font-mono">
            <span>{state.ketQua.matKhau}</span>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(state.ketQua!.matKhau)}
              className="inline-flex items-center gap-1 ml-auto rounded-md border border-emerald-300 px-2 py-1 text-xs font-medium hover:bg-emerald-50"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              Sao chép
            </button>
          </div>
        </div>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="id" value={taiKhoan.id} />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:underline disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <KeyRound className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            Đặt lại mật khẩu
          </button>
        </form>
      )}
    </div>
  );
}
