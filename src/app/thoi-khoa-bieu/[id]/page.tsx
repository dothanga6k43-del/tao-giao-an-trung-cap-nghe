import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { xoaThoiKhoaBieu } from "@/lib/actions/nhap-thoi-khoa-bieu";

const TEN_THU: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ nhật",
};

export default async function ThoiKhoaBieuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tkb = await prisma.thoiKhoaBieu.findUnique({
    where: { id },
    include: { dong: true },
  });
  if (!tkb) notFound();

  const theoLop = new Map<
    string,
    { diaDiem: string | null; theoKhoi: Map<string, typeof tkb.dong> }
  >();
  for (const d of tkb.dong) {
    if (!theoLop.has(d.lop)) {
      theoLop.set(d.lop, { diaDiem: d.diaDiem, theoKhoi: new Map() });
    }
    const lopEntry = theoLop.get(d.lop)!;
    if (!lopEntry.theoKhoi.has(d.tietBlock)) {
      lopEntry.theoKhoi.set(d.tietBlock, []);
    }
    lopEntry.theoKhoi.get(d.tietBlock)!.push(d);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/thoi-khoa-bieu" className="hover:underline">
              Thời khóa biểu
            </Link>
          </p>
          <h1 className="text-2xl font-semibold mt-1">{tkb.tieuDe}</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {tkb.tuanThu ? `Tuần ${tkb.tuanThu} · ` : ""}
            {tkb.ngayBatDau && tkb.ngayKetThuc
              ? `${tkb.ngayBatDau.toLocaleDateString("vi-VN")} - ${tkb.ngayKetThuc.toLocaleDateString("vi-VN")} · `
              : ""}
            {tkb.buoiHoc ?? ""}
          </p>
        </div>
        <form action={xoaThoiKhoaBieu}>
          <input type="hidden" name="id" value={tkb.id} />
          <button
            type="submit"
            className="rounded-md border border-red-200 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50"
          >
            Xóa
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {[...theoLop.entries()].map(([tenLop, lopData]) => (
          <div key={tenLop} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <p className="font-medium text-slate-900">
              {tenLop}
              {lopData.diaDiem ? (
                <span className="text-slate-400 font-normal"> · {lopData.diaDiem}</span>
              ) : null}
            </p>
            {[...lopData.theoKhoi.entries()].map(([tietBlock, hang]) => (
              <div key={tietBlock} className="text-sm">
                <p className="text-slate-500 font-medium">Tiết {tietBlock}</p>
                <ul className="mt-1 divide-y divide-slate-100">
                  {hang
                    .sort((a, b) => a.thu - b.thu)
                    .map((d) => (
                      <li key={d.id} className="py-1 flex gap-2">
                        <span className="w-20 shrink-0 text-slate-400">
                          {TEN_THU[d.thu] ?? `Thứ ${d.thu}`}
                        </span>
                        <span className="text-slate-700">
                          {d.monHoc ?? "—"}
                          {d.soGioLuyKe != null ? ` (${d.soGioLuyKe}h)` : ""}
                          {d.giaoVien ? ` - ${d.giaoVien}` : ""}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
