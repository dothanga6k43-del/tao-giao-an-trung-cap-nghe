import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NhapChuongTrinhForm from "@/components/NhapChuongTrinhForm";

export const maxDuration = 60;

export default async function NhapFilePage() {
  const giaoVien = await prisma.giaoVien.findMany({ orderBy: { hoTen: "asc" } });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm text-slate-500">
          <Link href="/chuong-trinh" className="hover:underline">
            Chương trình môn học
          </Link>
        </p>
        <h1 className="text-2xl font-semibold mt-1">Nhập từ file Word</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Tải lên file &quot;Chương trình môn học&quot; (.docx) theo mẫu, AI sẽ
          đọc và tạo sẵn môn học, các bài và nội dung chi tiết cho bạn.
        </p>
      </div>

      <NhapChuongTrinhForm giaoVien={giaoVien} />
    </div>
  );
}
