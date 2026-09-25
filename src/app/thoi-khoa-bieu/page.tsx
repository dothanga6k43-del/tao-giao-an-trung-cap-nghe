import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ThoiKhoaBieuListPage() {
  const danhSach = await prisma.thoiKhoaBieu.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { dong: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Thời khóa biểu</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Quản lý thời khóa biểu theo tuần để biết mỗi lớp học bao nhiêu
            tiết/ngày.
          </p>
        </div>
        <Link
          href="/thoi-khoa-bieu/nhap"
          className="self-start rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          + Nhập thời khóa biểu
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <p className="p-5 text-sm text-slate-500">
            Chưa có thời khóa biểu nào. Nhấn “Nhập thời khóa biểu” để tải lên
            ảnh, file Excel hoặc file Word.
          </p>
        )}
        {danhSach.map((tkb) => (
          <Link
            key={tkb.id}
            href={`/thoi-khoa-bieu/${tkb.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <div>
              <p className="font-medium text-slate-900">{tkb.tieuDe}</p>
              <p className="text-sm text-slate-500">
                {tkb.tuanThu ? `Tuần ${tkb.tuanThu} · ` : ""}
                {tkb.ngayBatDau && tkb.ngayKetThuc
                  ? `${tkb.ngayBatDau.toLocaleDateString("vi-VN")} - ${tkb.ngayKetThuc.toLocaleDateString("vi-VN")} · `
                  : ""}
                {tkb._count.dong} dòng
              </p>
            </div>
            <span className="text-slate-400 text-sm">Xem chi tiết →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
