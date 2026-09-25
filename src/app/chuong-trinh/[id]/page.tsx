import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { taoBaiHoc, xoaBaiHoc, xoaMonHoc } from "@/lib/actions/chuong-trinh";

export default async function MonHocDetailPage(props: PageProps<"/chuong-trinh/[id]">) {
  const { id } = await props.params;

  const mon = await prisma.monHoc.findUnique({
    where: { id },
    include: {
      giaoVien: true,
      baiHoc: { orderBy: { thuTu: "asc" }, include: { noiDungMuc: true } },
    },
  });

  if (!mon) notFound();

  const tongGioBai = mon.baiHoc.reduce((s, b) => s + b.tongSoGio, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/chuong-trinh" className="hover:underline">
              Chương trình môn học
            </Link>{" "}
            / {mon.tenMonHoc}
          </p>
          <h1 className="text-2xl font-semibold mt-1">
            {mon.tenMonHoc}
            {mon.maMonHoc ? (
              <span className="text-slate-400 font-normal"> · {mon.maMonHoc}</span>
            ) : null}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mon.tongSoGio} giờ (LT {mon.lyThuyetGio} · TH {mon.thucHanhGio} · KT{" "}
            {mon.kiemTraGio}){mon.giaoVien ? ` · GV: ${mon.giaoVien.hoTen}` : ""}
          </p>
        </div>
        <form action={xoaMonHoc}>
          <input type="hidden" name="id" value={mon.id} />
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Xóa môn học
          </button>
        </form>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Nội dung tổng quát (các bài)
          </h2>
          <p className="text-sm text-slate-500">
            Tổng thời lượng các bài: {tongGioBai} / {mon.tongSoGio} giờ
            {tongGioBai !== mon.tongSoGio && (
              <span className="text-amber-600"> (chưa khớp tổng số giờ môn học)</span>
            )}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="p-3 w-10">TT</th>
                  <th className="p-3">Tên bài</th>
                  <th className="p-3 w-20 text-right">Tổng</th>
                  <th className="p-3 w-16 text-right">LT</th>
                  <th className="p-3 w-16 text-right">TH</th>
                  <th className="p-3 w-16 text-right">KT</th>
                  <th className="p-3 w-24 text-right">Đề mục</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mon.baiHoc.map((bai) => (
                  <tr key={bai.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{bai.thuTu}</td>
                    <td className="p-3">
                      <Link
                        href={`/chuong-trinh/${mon.id}/bai/${bai.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {bai.tenBai}
                      </Link>
                    </td>
                    <td className="p-3 text-right">{bai.tongSoGio}</td>
                    <td className="p-3 text-right">{bai.lyThuyetGio}</td>
                    <td className="p-3 text-right">{bai.thucHanhGio}</td>
                    <td className="p-3 text-right">{bai.kiemTraGio}</td>
                    <td className="p-3 text-right text-slate-500">
                      {bai.noiDungMuc.length}
                    </td>
                    <td className="p-3 text-right">
                      <form action={xoaBaiHoc}>
                        <input type="hidden" name="id" value={bai.id} />
                        <input type="hidden" name="monHocId" value={mon.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {mon.baiHoc.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-4 text-sm text-slate-500">
                      Chưa có bài nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <details className="bg-white border border-slate-200 rounded-lg p-5">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            + Thêm bài mới
          </summary>
          <form action={taoBaiHoc} className="mt-4 space-y-4">
            <input type="hidden" name="monHocId" value={mon.id} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tên bài
              </label>
              <input
                name="tenBai"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Bài 1: Khái niệm và công dụng của khí cụ điện"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tổng số giờ
                </label>
                <input
                  name="tongSoGio"
                  type="number"
                  step="0.5"
                  defaultValue={0}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lý thuyết
                </label>
                <input
                  name="lyThuyetGio"
                  type="number"
                  step="0.5"
                  defaultValue={0}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Thực hành
                </label>
                <input
                  name="thucHanhGio"
                  type="number"
                  step="0.5"
                  defaultValue={0}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kiểm tra (giờ)
              </label>
              <input
                name="kiemTraGio"
                type="number"
                step="0.5"
                defaultValue={0}
                className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mục tiêu bài học
              </label>
              <textarea
                name="mucTieu"
                rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
            >
              Thêm bài và soạn nội dung chi tiết
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}
