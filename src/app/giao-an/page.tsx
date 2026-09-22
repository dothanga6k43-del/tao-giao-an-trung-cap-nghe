import Link from "next/link";
import { prisma } from "@/lib/prisma";

const TRANG_THAI_LABEL: Record<string, string> = {
  DRAFT: "Nháp",
  FINAL: "Hoàn thiện",
};

export default async function GiaoAnListPage(
  props: PageProps<"/giao-an">
) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  const danhSach = await prisma.giaoAn.findMany({
    where: q
      ? {
          OR: [
            { tenBai: { contains: q } },
            {
              buoiDay: {
                lichTrinh: { monHoc: { tenMonHoc: { contains: q } } },
              },
            },
            {
              buoiDay: {
                lichTrinh: { lop: { tenLop: { contains: q } } },
              },
            },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      buoiDay: {
        include: { lichTrinh: { include: { lop: true, monHoc: true } } },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Giáo án</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Toàn bộ giáo án đã soạn từ các lịch trình giảng dạy.
        </p>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tên bài, môn học, lớp..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700">
          Tìm
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {danhSach.length === 0 && (
          <p className="p-5 text-sm text-slate-500">
            Không tìm thấy giáo án nào.
          </p>
        )}
        {danhSach.map((ga) => (
          <Link
            key={ga.id}
            href={`/giao-an/${ga.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <div>
              <p className="font-medium text-slate-900">{ga.tenBai}</p>
              <p className="text-sm text-slate-500">
                {ga.buoiDay.lichTrinh.monHoc.tenMonHoc} ·{" "}
                {ga.buoiDay.lichTrinh.lop.tenLop} · Buổi {ga.buoiDay.thuTu} ·{" "}
                {new Date(ga.buoiDay.ngayThucHien).toISOString().slice(0, 10)}
              </p>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                ga.trangThai === "FINAL"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {TRANG_THAI_LABEL[ga.trangThai]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
