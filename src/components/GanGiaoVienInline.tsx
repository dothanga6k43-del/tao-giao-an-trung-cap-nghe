"use client";

import { useState } from "react";
import { UserCog, PencilLine, X } from "lucide-react";

export default function GanGiaoVienInline({
  id,
  giaoVienHienTaiId,
  giaoVienOptions,
  action,
}: {
  id: string;
  giaoVienHienTaiId: string | null;
  giaoVienOptions: { id: string; hoTen: string }[];
  action: (formData: FormData) => void;
}) {
  const [dangSua, setDangSua] = useState(false);
  const hienTai = giaoVienOptions.find((g) => g.id === giaoVienHienTaiId);

  if (!dangSua) {
    return (
      <button
        type="button"
        onClick={() => setDangSua(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full hover:opacity-80 ${
          hienTai ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"
        }`}
      >
        <UserCog className="h-3.5 w-3.5" strokeWidth={2} />
        {hienTai ? `GV: ${hienTai.hoTen}` : "Chưa gán giáo viên"}
        <PencilLine className="h-3 w-3" strokeWidth={2} />
      </button>
    );
  }

  return (
    <form action={action} className="inline-flex items-center gap-1.5">
      <input type="hidden" name="id" value={id} />
      <select
        name="giaoVienId"
        defaultValue={giaoVienHienTaiId ?? ""}
        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
      >
        <option value="">-- Chưa gán --</option>
        {giaoVienOptions.map((g) => (
          <option key={g.id} value={g.id}>
            {g.hoTen}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-slate-900 text-white px-2 py-1 text-xs font-medium hover:bg-slate-700"
      >
        Lưu
      </button>
      <button
        type="button"
        onClick={() => setDangSua(false)}
        className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </form>
  );
}
