import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpenText, FileUp, Plus, ChevronRight } from "lucide-react";

export default async function ChuongTrinhListPage() {
  const danhSach = await prisma.monHoc.findMany({
    orderBy: { createdAt: "desc" },
    include: { giaoVien: true, baiHoc: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
            <BookOpenText className="h-6 w-6 text-slate-500" strokeWidth={1.75} />
            Chương trình môn học
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Quản lý chương trình môn học, nội dung tổng quát và nội dung chi tiết.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/chuong-trinh/nhap-file"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <FileUp className="h-4 w-4" strokeWidth={2} />
            Nhập từ file Word
          </Link>
          <Link
            href="/chuong-trinh/moi"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Thêm môn học
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <div className="p-10 text-center">
            <BookOpenText className="mx-auto h-9 w-9 text-slate-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-slate-500">
              Chưa có môn học nào. Nhấn “Thêm môn học” để bắt đầu.
            </p>
          </div>
        )}
        {danhSach.map((mon) => (
          <Link
            key={mon.id}
            href={`/chuong-trinh/${mon.id}`}
            className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"
          >
            <div className="flex items-start gap-3">
              <BookOpenText className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.75} />
              <div>
                <p className="font-medium text-slate-900">
                  {mon.tenMonHoc}
                  {mon.maMonHoc ? (
                    <span className="text-slate-400 font-normal"> · {mon.maMonHoc}</span>
                  ) : null}
                </p>
                <p className="text-sm text-slate-500">
                  {mon.tongSoGio} giờ (LT {mon.lyThuyetGio} · TH {mon.thucHanhGio} · KT{" "}
                  {mon.kiemTraGio}) · {mon.baiHoc.length} bài
                  {mon.giaoVien ? ` · GV: ${mon.giaoVien.hoTen}` : ""}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
          </Link>
        ))}
      </div>
    </div>
  );
}
