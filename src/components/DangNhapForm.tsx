"use client";

import { useActionState } from "react";
import { dangNhap, type TrangThaiDangNhap } from "@/lib/actions/dang-nhap";
import { AlertCircle, LogIn, Loader2 } from "lucide-react";

const TRANG_THAI_BAN_DAU: TrangThaiDangNhap = { error: null };

export default function DangNhapForm({ tiep }: { tiep: string }) {
  const [state, formAction, pending] = useActionState(dangNhap, TRANG_THAI_BAN_DAU);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tiep" value={tiep} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tên đăng nhập
        </label>
        <input
          name="tenDangNhap"
          required
          autoFocus
          autoComplete="username"
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
          autoComplete="current-password"
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
            Đang đăng nhập...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" strokeWidth={1.75} />
            Đăng nhập
          </>
        )}
      </button>
    </form>
  );
}
