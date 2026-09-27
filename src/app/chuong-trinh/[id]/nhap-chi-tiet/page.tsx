import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NhapChiTietChuongTrinhForm from "@/components/NhapChiTietChuongTrinhForm";

export const maxDuration = 60;

export default async function NhapChiTietPage(
  props: PageProps<"/chuong-trinh/[id]/nhap-chi-tiet">
) {
  const { id } = await props.params;

  const mon = await prisma.monHoc.findUnique({
    where: { id },
    include: { baiHoc: { select: { tenBai: true } } },
  });
  if (!mon) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm text-slate-500">
          <Link href={`/chuong-trinh/${mon.id}`} className="hover:underline">
            {mon.tenMonHoc}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold mt-1">Nhập chương trình chi tiết từ file</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Tải lên file chương trình chi tiết (.docx hoặc .xlsx), AI sẽ đọc và
          bổ sung/cập nhật các bài cùng nội dung chi tiết cho môn học này.
        </p>
      </div>

      <NhapChiTietChuongTrinhForm
        monHocId={mon.id}
        tenBaiHienCo={mon.baiHoc.map((b) => b.tenBai)}
      />
    </div>
  );
}
