import Link from "next/link";
import { prisma } from "@/lib/prisma";

const TRANG_THAI_LABEL: Record<string, string> = {
  DRAFT: "Nháp",
  APPROVED: "Đã duyệt",
};

export default async function LichTrinhListPage() {
  const danhSach = await prisma.lichTrinhGiangDay.findMany({
    orderBy: { createdAt: "desc" },
    include: { lop: true, monHoc: true, giaoVien: true, buoiDay: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Lịch trình giảng dạy</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Xếp nội dung chi tiết vào các buổi dạy theo thời khóa biểu, sau đó
            duyệt để tạo giáo án.
          </p>
        </div>
        <Link
          href="/lich-trinh/moi"
          className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
        >
          + Tạo lịch trình
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <p className="p-5 text-sm text-slate-500">Chưa có lịch trình nào.</p>
        )}
        {danhSach.map((lt) => (
          <Link
            key={lt.id}
            href={`/lich-trinh/${lt.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <div>
              <p className="font-medium text-slate-900">
                {lt.monHoc.tenMonHoc} · {lt.lop.tenLop}
              </p>
              <p className="text-sm text-slate-500">
                {lt.giaoVien ? `GV: ${lt.giaoVien.hoTen} · ` : ""}
                {lt.buoiDay.length} buổi dạy
                {lt.hocKy ? ` · ${lt.hocKy}` : ""}
              </p>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                lt.trangThai === "APPROVED"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {TRANG_THAI_LABEL[lt.trangThai]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
