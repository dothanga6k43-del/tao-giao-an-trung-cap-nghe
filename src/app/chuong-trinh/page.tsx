import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ChuongTrinhListPage() {
  const danhSach = await prisma.monHoc.findMany({
    orderBy: { createdAt: "desc" },
    include: { giaoVien: true, baiHoc: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Chương trình môn học</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Quản lý chương trình môn học, nội dung tổng quát và nội dung chi tiết.
          </p>
        </div>
        <Link
          href="/chuong-trinh/moi"
          className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          + Thêm môn học
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <p className="p-5 text-sm text-slate-500">
            Chưa có môn học nào. Nhấn “Thêm môn học” để bắt đầu.
          </p>
        )}
        {danhSach.map((mon) => (
          <Link
            key={mon.id}
            href={`/chuong-trinh/${mon.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50"
          >
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
            <span className="text-slate-400 text-sm">Xem chi tiết →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
