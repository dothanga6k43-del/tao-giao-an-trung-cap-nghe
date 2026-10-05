"use client";

import { useActionState, useRef, useState } from "react";
import { taoTaiKhoan, type TrangThaiTaoTaiKhoan } from "@/lib/actions/tai-khoan";
import { UserPlus, AlertCircle, CheckCircle2, Copy, Loader2 } from "lucide-react";

const TRANG_THAI_BAN_DAU: TrangThaiTaoTaiKhoan = { error: null, taiKhoanMoi: null };

type GiaoVienTuy = { id: string; hoTen: string; goiYTenDangNhap: string };

export default function TaoTaiKhoanForm({
  giaoVienChuaCoTk,
}: {
  giaoVienChuaCoTk: GiaoVienTuy[];
}) {
  const [state, formAction, pending] = useActionState(taoTaiKhoan, TRANG_THAI_BAN_DAU);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
        <UserPlus className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
        Tạo tài khoản mới
      </h2>

      {state.taiKhoanMoi && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800 space-y-2">
          <p className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Đã tạo tài khoản. Hãy sao chép mật khẩu ngay — sẽ không hiển thị lại.
          </p>
          <div className="flex flex-wrap items-center gap-2 bg-white border border-emerald-200 rounded-md px-3 py-2 font-mono text-sm">
            <span>{state.taiKhoanMoi.tenDangNhap}</span>
            <span className="text-slate-400">/</span>
            <span>{state.taiKhoanMoi.matKhau}</span>
            <button
              type="button"
              onClick={() =>
                navigator.clipboard?.writeText(
                  `Tên đăng nhập: ${state.taiKhoanMoi!.tenDangNhap}\nMật khẩu: ${state.taiKhoanMoi!.matKhau}`
                )
              }
              className="inline-flex items-center gap-1 ml-auto rounded-md border border-emerald-300 px-2 py-1 text-xs font-medium hover:bg-emerald-50"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              Sao chép
            </button>
          </div>
        </div>
      )}

      {/* key thay doi sau moi lan tao thanh cong -> component con mount lai,
          tu dong "reset" ca input khong-controlled lan state noi bo. */}
      <NoiDungForm
        key={state.taiKhoanMoi?.tenDangNhap ?? "form"}
        giaoVienChuaCoTk={giaoVienChuaCoTk}
        formAction={formAction}
        pending={pending}
        error={state.error}
      />
    </div>
  );
}

function NoiDungForm({
  giaoVienChuaCoTk,
  formAction,
  pending,
  error,
}: {
  giaoVienChuaCoTk: GiaoVienTuy[];
  formAction: (formData: FormData) => void;
  pending: boolean;
  error: string | null;
}) {
  const [giaoVienId, setGiaoVienId] = useState("");
  const tenDangNhapRef = useRef<HTMLInputElement>(null);

  function chonGiaoVien(id: string) {
    setGiaoVienId(id);
    const gv = giaoVienChuaCoTk.find((g) => g.id === id);
    if (gv && tenDangNhapRef.current && !tenDangNhapRef.current.value) {
      tenDangNhapRef.current.value = gv.goiYTenDangNhap;
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Gán cho giáo viên
          </label>
          <select
            name="giaoVienId"
            value={giaoVienId}
            onChange={(e) => chonGiaoVien(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">-- Tài khoản độc lập (không gắn giáo viên) --</option>
            {giaoVienChuaCoTk.map((gv) => (
              <option key={gv.id} value={gv.id}>
                {gv.hoTen}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Vai trò
          </label>
          <select
            name="vaiTro"
            defaultValue="GIAO_VIEN"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="GIAO_VIEN">Giáo viên</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tên đăng nhập
        </label>
        <input
          ref={tenDangNhapRef}
          name="tenDangNhap"
          required
          placeholder="vd. ddthang"
          className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      {error && (
        <p className="flex items-start gap-1.5 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Đang tạo...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" strokeWidth={1.75} />
            Tạo tài khoản
          </>
        )}
      </button>
    </form>
  );
}
