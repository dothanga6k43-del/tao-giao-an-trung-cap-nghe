import Link from "next/link";
import NhapGiaoVienExcelForm from "@/components/NhapGiaoVienExcelForm";
import { ChevronLeft } from "lucide-react";

export default function NhapExcelGiaoVienPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm text-slate-500">
          <Link href="/giao-vien" className="inline-flex items-center gap-1 hover:underline">
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Giáo viên
          </Link>
        </p>
        <h1 className="text-2xl font-semibold mt-1">Nhập giáo viên từ file Excel</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Tải lên file Excel (.xlsx) danh sách giáo viên để thêm nhanh nhiều
          giáo viên cùng lúc.
        </p>
      </div>

      <NhapGiaoVienExcelForm />
    </div>
  );
}
