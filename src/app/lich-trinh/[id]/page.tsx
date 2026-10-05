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
import { ganGiaoVienChoLichTrinh } from "@/lib/actions/gan-giao-vien";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { yeuCauQuyenXem } from "@/lib/auth/pham-vi";
import GanGiaoVienInline from "@/components/GanGiaoVienInline";
import {
  ChevronLeft,
  Trash2,
  Table2,
  CalendarOff,
  Plus,
  ClipboardList,
  RefreshCw,
  FileText,
  Eye,
  Sparkles,
  Save,
  Unlock,
  CheckCircle2,
  PencilLine,
} from "lucide-react";

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

export const maxDuration = 60;

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

  const hienTai = await layTaiKhoanHienTai();
  yeuCauQuyenXem(hienTai, lichTrinh.giaoVienId);
  const laAdmin = hienTai?.vaiTro === "ADMIN";
  const giaoVienOptions = laAdmin
    ? await prisma.giaoVien.findMany({ orderBy: { hoTen: "asc" } })
    : [];

  const daDuyet = lichTrinh.trangThai === "APPROVED";
  const tongTietDaXep = lichTrinh.buoiDay.reduce((s, b) => s + b.tongTiet, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href="/lich-trinh" className="inline-flex items-center gap-1 hover:underline">
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Lịch trình giảng dạy
            </Link>
          </p>
          <h1 className="text-2xl font-semibold mt-1">
            {lichTrinh.monHoc.tenMonHoc} · {lichTrinh.lop.tenLop}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {!laAdmin && lichTrinh.giaoVien ? `GV: ${lichTrinh.giaoVien.hoTen} · ` : ""}
            Bắt đầu {formatNgay(lichTrinh.ngayBatDau)} · {lichTrinh.soPhutMoiTiet}{" "}
            phút/tiết
            {lichTrinh.hocKy ? ` · ${lichTrinh.hocKy}` : ""}
          </p>
          {laAdmin && (
            <div className="mt-2">
              <GanGiaoVienInline
                key={lichTrinh.giaoVienId ?? "none"}
                id={lichTrinh.id}
                giaoVienHienTaiId={lichTrinh.giaoVienId}
                giaoVienOptions={giaoVienOptions}
                action={ganGiaoVienChoLichTrinh}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
              daDuyet
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {daDuyet ? (
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <PencilLine className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {daDuyet ? "Đã duyệt" : "Nháp"}
          </span>
          {lichTrinh.buoiDay.length > 0 && (
            <Link
              href={`/lich-trinh/${lichTrinh.id}/xem-truoc`}
              className="inline-flex items-center gap-1.5 text-sm rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" strokeWidth={1.75} />
              Xem trước
            </Link>
          )}
          {!daDuyet && (
            <form action={xoaLichTrinh}>
              <input type="hidden" name="id" value={lichTrinh.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                Xóa
              </button>
            </form>
          )}
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-3">
            <Table2 className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
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
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-3">
            <CalendarOff className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
            Ngày nghỉ
          </h2>
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
                    <button className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
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
            <form action={themNgayNghi} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="lichTrinhId" value={lichTrinh.id} />
              <input
                type="date"
                name="ngay"
                required
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm sm:flex-none"
              />
              <input
                name="ghiChu"
                placeholder="Lý do"
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
              <button className="inline-flex items-center gap-1 text-xs rounded-md bg-slate-100 px-3 py-1.5 hover:bg-slate-200">
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                Thêm
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ClipboardList className="h-5 w-5 text-slate-500" strokeWidth={1.75} />
            Các buổi dạy ({lichTrinh.buoiDay.length} buổi · {tongTietDaXep} tiết)
          </h2>
          {!daDuyet && (
            <form action={sinhBuoiDay}>
              <input type="hidden" name="lichTrinhId" value={lichTrinh.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
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
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex-1 min-w-0">
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
                        className="inline-flex items-center gap-1.5 mt-2 text-sm text-blue-600 hover:underline"
                      >
                        <FileText className="h-4 w-4" strokeWidth={1.75} />
                        Xem giáo án
                      </Link>
                    ) : (
                      daDuyet && (
                        <form action={taoGiaoAnBangAI} className="mt-2">
                          <input type="hidden" name="buoiDayId" value={b.id} />
                          <button className="inline-flex items-center gap-1.5 text-sm rounded-md bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-500">
                            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                            Soạn giáo án bằng AI
                          </button>
                        </form>
                      )
                    )}
                  </div>

                  <form
                    action={suaBuoiDay}
                    className="w-full space-y-2 lg:w-72 lg:shrink-0"
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
                        <button className="inline-flex items-center gap-1.5 text-xs rounded-md bg-slate-100 px-3 py-1.5 hover:bg-slate-200">
                          <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Lưu
                        </button>
                        <button
                          formAction={xoaBuoiDay}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
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
              <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                <Unlock className="h-4 w-4" strokeWidth={1.75} />
                Mở duyệt lại
              </button>
            </form>
          ) : (
            <form action={duyetLichTrinh}>
              <input type="hidden" name="id" value={lichTrinh.id} />
              <button className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-emerald-500">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                Duyệt lịch trình
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
