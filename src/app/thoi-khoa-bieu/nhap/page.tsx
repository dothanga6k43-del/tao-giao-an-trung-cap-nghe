import Link from "next/link";
import NhapThoiKhoaBieuForm from "@/components/NhapThoiKhoaBieuForm";

export const maxDuration = 60;

export default function NhapThoiKhoaBieuPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm text-slate-500">
          <Link href="/thoi-khoa-bieu" className="hover:underline">
            Thời khóa biểu
          </Link>
        </p>
        <h1 className="text-2xl font-semibold mt-1">Nhập thời khóa biểu</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Tải lên ảnh chụp, file Excel (.xlsx) hoặc file Word (.docx) của thời
          khóa biểu, AI sẽ đọc và tạo sẵn dữ liệu cho bạn.
        </p>
      </div>

      <NhapThoiKhoaBieuForm />
    </div>
  );
}
