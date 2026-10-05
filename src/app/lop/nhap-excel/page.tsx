import Link from "next/link";
import NhapLopExcelForm from "@/components/NhapLopExcelForm";
import { ChevronLeft } from "lucide-react";

export default function NhapExcelLopPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm text-slate-500">
          <Link href="/lop" className="inline-flex items-center gap-1 hover:underline">
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Lớp học
          </Link>
        </p>
        <h1 className="text-2xl font-semibold mt-1">Nhập lớp học từ file Excel</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Tải lên file Excel (.xlsx) danh sách lớp học để thêm nhanh nhiều lớp
          cùng lúc.
        </p>
      </div>

      <NhapLopExcelForm />
    </div>
  );
}
