import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NhapMauGiaoAnForm from "@/components/NhapMauGiaoAnForm";
import { ChevronLeft, FileCheck2 } from "lucide-react";

export const maxDuration = 60;

export default async function MauGiaoAnPage(
  props: PageProps<"/chuong-trinh/[id]/mau-giao-an">
) {
  const { id } = await props.params;

  const mon = await prisma.monHoc.findUnique({ where: { id } });
  if (!mon) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm text-slate-500">
          <Link
            href={`/chuong-trinh/${mon.id}`}
            className="inline-flex items-center gap-1 hover:underline"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            {mon.tenMonHoc}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold mt-1">Mẫu giáo án riêng cho môn học</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Mỗi môn học có thể có mẫu giáo án riêng (khác cấu trúc mục so với
          khung mặc định). Tải lên một file giáo án mẫu (.docx hoặc .pdf), AI
          sẽ đọc và ghi nhớ cấu trúc các mục để áp dụng khi soạn giáo án cho
          các buổi dạy của môn này.
        </p>
        {mon.mauGiaoAnTenFile && (
          <p className="flex items-center gap-1.5 text-sm text-slate-600 mt-2">
            <FileCheck2 className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
            Đang dùng mẫu: <span className="font-medium">{mon.mauGiaoAnTenFile}</span>
          </p>
        )}
      </div>

      <NhapMauGiaoAnForm monHocId={mon.id} />
    </div>
  );
}
