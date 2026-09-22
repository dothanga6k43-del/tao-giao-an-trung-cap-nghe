import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  sinhBuoiDay,
  suaBuoiDay,
  xoaBuoiDay,
  themNgayNghi,
  xoaNgayNghi,
  duyetLichTrinh,
  moDuyetLaiLichTrinh,
  xoaLichTrinh,
} from "@/lib/actions/lich-trinh";
import { taoGiaoAnBangAI } from "@/lib/actions/giao-an";

const THU_LABEL: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ nhật",
};

function formatNgay(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}

export default async function LichTrinhDetailPage(
  props: PageProps<"/lich-trinh/[id]">
) {
  const { id } = await props.params;

  const lichTrinh = await prisma.lichTrinhGiangDay.findUnique({
    where: { id },
    include: {
      lop: true,
      monHoc: true,
      giaoVien: true,
      khungTietTuan: { orderBy: { thu: "asc" } },
      ngayNghi: { orderBy: { ngay: "asc" } },
      buoiDay: {
        orderBy: { thuTu: "asc" },
        include: {
          giaoAn: true,
          noiDung: {
            orderBy: { thuTu: "asc" },
            include: { noiDungMuc: { include: { baiHoc: true } } },
          },
        },
      },
    },
  });

  if (!lichTrinh) notFound();

  const daDuyet = lichTrinh.trangThai === "APPROVED";
  const tongTietDaXep = lichTrinh.buoiDay.reduce((s, b) => s + b.tongTiet, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/lich-trinh" className="hover:underline">
              Lịch trình giảng dạy
            </Link>
          </p>
          <h1 className="text-2xl font-semibold mt-1">
            {lichTrinh.monHoc.tenMonHoc} · {lichTrinh.lop.tenLop}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lichTrinh.giaoVien ? `GV: ${lichTrinh.giaoVien.hoTen} · ` : ""}
            Bắt đầu {formatNgay(lichTrinh.ngayBatDau)} · {lichTrinh.soPhutMoiTiet}{" "}
            phút/tiết
            {lichTrinh.hocKy ? ` · ${lichTrinh.hocKy}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              daDuyet
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {daDuyet ? "Đã duyệt" : "Nháp"}
          </span>
          {!daDuyet && (
            <form action={xoaLichTrinh}>
              <input type="hidden" name="id" value={lichTrinh.id} />
              <button type="submit" className="text-sm text-red-600 hover:underline">
                Xóa
              </button>
            </form>
          )}
        </div>
      </div>

      <section className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Khung tiết theo thời khóa biểu
          </h2>
          <ul className="text-sm text-slate-600 space-y-1">
            {lichTrinh.khungTietTuan.map((k) => (
              <li key={k.id}>
                {THU_LABEL[k.thu]}: tiết {k.tietBatDau}–
                {k.tietBatDau + k.soTiet - 1} ({k.soTiet} tiết)
                {k.diaDiem ? ` · ${k.diaDiem}` : ""}
              </li>
            ))}
            {lichTrinh.khungTietTuan.length === 0 && (
              <li className="text-slate-400">Chưa có khung tiết nào.</li>
            )}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Ngày nghỉ</h2>
          <ul className="text-sm text-slate-600 space-y-1 mb-3">
            {lichTrinh.ngayNghi.map((n) => (
              <li key={n.id} className="flex items-center justify-between">
                <span>
                  {formatNgay(n.ngay)}
                  {n.ghiChu ? ` · ${n.ghiChu}` : ""}
                </span>
                {!daDuyet && (
                  <form action={xoaNgayNghi}>
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="lichTrinhId" value={lichTrinh.id} />
                    <button className="text-xs text-red-600 hover:underline">
                      Xóa
                    </button>
                  </form>
                )}
              </li>
            ))}
            {lichTrinh.ngayNghi.length === 0 && (
              <li className="text-slate-400">Chưa có ngày nghỉ.</li>
            )}
          </ul>
          {!daDuyet && (
            <form action={themNgayNghi} className="flex items-end gap-2">
              <input type="hidden" name="lichTrinhId" value={lichTrinh.id} />
              <input
                type="date"
                name="ngay"
                required
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                name="ghiChu"
                placeholder="Lý do"
                className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <button className="text-xs rounded-md bg-slate-100 px-3 py-1.5 hover:bg-slate-200">
                Thêm
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Các buổi dạy ({lichTrinh.buoiDay.length} buổi · {tongTietDaXep} tiết)
          </h2>
          {!daDuyet && (
            <form action={sinhBuoiDay}>
              <input type="hidden" name="lichTrinhId" value={lichTrinh.id} />
              <button
                type="submit"
                className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
              >
                {lichTrinh.buoiDay.length > 0 ? "Sinh lại lịch trình" : "Sinh lịch trình"}
              </button>
            </form>
          )}
        </div>

        <div className="space-y-3">
          {lichTrinh.buoiDay.map((b) => {
            const theoBai = new Map<string, { tenBai: string; muc: string[] }>();
            for (const nd of b.noiDung) {
              const bai = nd.noiDungMuc.baiHoc;
              if (!theoBai.has(bai.id)) {
                theoBai.set(bai.id, { tenBai: bai.tenBai, muc: [] });
              }
              theoBai
                .get(bai.id)!
                .muc.push(
                  nd.noiDungMuc.tieuDe + (nd.laTiepTuc ? " (Tiếp)" : "")
                );
            }

            return (
              <div
                key={b.id}
                className="bg-white border border-slate-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Buổi {b.thuTu} · {b.tongTiet} tiết (LT {b.lyThuyetTiet} · TH{" "}
                      {b.thucHanhTiet} · KT {b.kiemTraTiet})
                    </p>
                    <div className="mt-2 space-y-1">
                      {Array.from(theoBai.values()).map((v, idx) => (
                        <p key={idx} className="text-sm text-slate-600">
                          <span className="font-medium">{v.tenBai}:</span>{" "}
                          {v.muc.join("; ")}
                        </p>
                      ))}
                    </div>
                    {b.giaoAn ? (
                      <Link
                        href={`/giao-an/${b.giaoAn.id}`}
                        className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                      >
                        Xem giáo án →
                      </Link>
                    ) : (
                      daDuyet && (
                        <form action={taoGiaoAnBangAI} className="mt-2">
                          <input type="hidden" name="buoiDayId" value={b.id} />
                          <button className="text-sm rounded-md bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-500">
                            Soạn giáo án bằng AI
                          </button>
                        </form>
                      )
                    )}
                  </div>

                  <form
                    action={suaBuoiDay}
                    className="w-72 shrink-0 space-y-2"
                  >
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="lichTrinhId" value={lichTrinh.id} />
                    <div>
                      <label className="block text-xs text-slate-500 mb-0.5">
                        Ngày thực hiện
                      </label>
                      <input
                        type="date"
                        name="ngayThucHien"
                        defaultValue={formatNgay(b.ngayThucHien)}
                        disabled={daDuyet}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-0.5">
                        Thiết bị & đồ dùng dạy học
                      </label>
                      <input
                        name="thietBi"
                        defaultValue={b.thietBi ?? ""}
                        disabled={daDuyet}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-0.5">
                        Ghi chú
                      </label>
                      <input
                        name="ghiChu"
                        defaultValue={b.ghiChu ?? ""}
                        disabled={daDuyet}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50"
                      />
                    </div>
                    {!daDuyet && (
                      <div className="flex justify-between">
                        <button className="text-xs rounded-md bg-slate-100 px-3 py-1.5 hover:bg-slate-200">
                          Lưu
                        </button>
                        <button
                          formAction={xoaBuoiDay}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Xóa buổi
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            );
          })}
          {lichTrinh.buoiDay.length === 0 && (
            <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-lg p-5">
              Chưa có buổi dạy nào. Hãy đảm bảo môn học đã có nội dung chi
              tiết được gán thời gian, sau đó bấm “Sinh lịch trình”.
            </p>
          )}
        </div>
      </section>

      {lichTrinh.buoiDay.length > 0 && (
        <div className="flex justify-end gap-3">
          {daDuyet ? (
            <form action={moDuyetLaiLichTrinh}>
              <input type="hidden" name="id" value={lichTrinh.id} />
              <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                Mở duyệt lại
              </button>
            </form>
          ) : (
            <form action={duyetLichTrinh}>
              <input type="hidden" name="id" value={lichTrinh.id} />
              <button className="rounded-md bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-emerald-500">
                Duyệt lịch trình
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
