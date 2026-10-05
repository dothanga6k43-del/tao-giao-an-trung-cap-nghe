"use client";

import { useActionState } from "react";
import {
  thietLapAdmin,
  type TrangThaiThietLapAdmin,
} from "@/lib/actions/thiet-lap-admin";
import { AlertCircle, ShieldCheck, Loader2 } from "lucide-react";

const TRANG_THAI_BAN_DAU: TrangThaiThietLapAdmin = { error: null };

export default function ThietLapAdminForm() {
  const [state, formAction, pending] = useActionState(
    thietLapAdmin,
    TRANG_THAI_BAN_DAU
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tên đăng nhập
        </label>
        <input
          name="tenDangNhap"
          required
          autoFocus
          autoComplete="username"
          placeholder="admin"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Mật khẩu
        </label>
        <input
          name="matKhau"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <p className="text-xs text-slate-400 mt-1">Ít nhất 8 ký tự.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Xác nhận mật khẩu
        </label>
        <input
          name="xacNhanMatKhau"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
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
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Đang tạo...
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
            Tạo tài khoản Admin
          </>
        )}
      </button>
    </form>
  );
}
