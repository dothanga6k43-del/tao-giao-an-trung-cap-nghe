import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseNoiDungGiaoAn, tongPhutNoiDung, type MucGiaoAn } from "@/lib/giaoan/schema";
import {
  capNhatThongTinChung,
  suaMuc,
  themMuc,
  xoaMuc,
  soanLaiBangAI,
  hoanThienGiaoAn,
  moLaiGiaoAn,
  xoaGiaoAn,
} from "@/lib/actions/giao-an";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { yeuCauQuyenXem } from "@/lib/auth/pham-vi";
import {
  ChevronLeft,
  FileDown,
  Eye,
  Sparkles,
  Unlock,
  CheckCircle2,
  PencilLine,
  Trash2,
  Save,
  Plus,
  ClipboardCheck,
  BookOpen,
} from "lucide-react";

export const maxDuration = 60;

export default async function GiaoAnDetailPage(
  props: PageProps<"/giao-an/[id]">
) {
  const { id } = await props.params;

  const giaoAn = await prisma.giaoAn.findUnique({
    where: { id },
    include: {
      buoiDay: {
        include: {
          lichTrinh: { include: { lop: true, monHoc: true, giaoVien: true } },
        },
      },
    },
  });

  if (!giaoAn) notFound();

  const hienTai = await layTaiKhoanHienTai();
  yeuCauQuyenXem(hienTai, giaoAn.buoiDay.lichTrinh.giaoVienId);

  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);
  const tongPhutSoan = tongPhutNoiDung(noiDung);
  const tongPhutBuoi = giaoAn.buoiDay.tongTiet * giaoAn.buoiDay.lichTrinh.soPhutMoiTiet;
  const daHoanThien = giaoAn.trangThai === "FINAL";
  const ngay = new Date(giaoAn.buoiDay.ngayThucHien);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link
              href={`/lich-trinh/${giaoAn.buoiDay.lichTrinhId}`}
              className="inline-flex items-center gap-1 hover:underline"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
              {giaoAn.buoiDay.lichTrinh.monHoc.tenMonHoc} · {giaoAn.buoiDay.lichTrinh.lop.tenLop}
            </Link>
          </p>
          <h1 className="text-2xl font-semibold mt-1">{giaoAn.tenBai}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Buổi {giaoAn.buoiDay.thuTu} · {ngay.toISOString().slice(0, 10)} ·{" "}
            {giaoAn.buoiDay.tongTiet} tiết ({tongPhutBuoi} phút) · Đã soạn:{" "}
            {1 + tongPhutSoan} phút
            {1 + tongPhutSoan !== tongPhutBuoi && (
              <span className="text-amber-600"> (chưa khớp tổng thời gian buổi dạy)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
              daHoanThien ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {daHoanThien ? (
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <PencilLine className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {daHoanThien ? "Hoàn thiện" : "Nháp"}
          </span>
          <Link
            href={`/giao-an/${giaoAn.id}/xem-truoc`}
            className="inline-flex items-center gap-1.5 text-sm rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" strokeWidth={1.75} />
            Xem trước
          </Link>
          <a
            href={`/giao-an/${giaoAn.id}/xuat`}
            className="inline-flex items-center gap-1.5 text-sm rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" strokeWidth={1.75} />
            Xuất Word
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {!daHoanThien && (
          <form action={soanLaiBangAI}>
            <input type="hidden" name="id" value={giaoAn.id} />
            <input type="hidden" name="buoiDayId" value={giaoAn.buoiDayId} />
            <button className="inline-flex items-center gap-1.5 text-sm rounded-md bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-500">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              Soạn lại bằng AI
            </button>
          </form>
        )}
        {daHoanThien ? (
          <form action={moLaiGiaoAn}>
            <input type="hidden" name="id" value={giaoAn.id} />
            <button className="inline-flex items-center gap-1.5 text-sm rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
              <Unlock className="h-4 w-4" strokeWidth={1.75} />
              Mở lại để sửa
            </button>
          </form>
        ) : (
          <form action={hoanThienGiaoAn}>
            <input type="hidden" name="id" value={giaoAn.id} />
            <button className="inline-flex items-center gap-1.5 text-sm rounded-md bg-emerald-600 text-white px-3 py-1.5 hover:bg-emerald-500">
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
              Đánh dấu hoàn thiện
            </button>
          </form>
        )}
        {!daHoanThien && (
          <form action={xoaGiaoAn}>
            <input type="hidden" name="id" value={giaoAn.id} />
            <button className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline">
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              Xóa giáo án
            </button>
          </form>
        )}
      </div>

      <details className="bg-white border border-slate-200 rounded-lg p-5" open>
        <summary className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold text-slate-800">
          <ClipboardCheck className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
          Mục tiêu, đồ dùng thiết bị, hình thức tổ chức
        </summary>
        <form action={capNhatThongTinChung} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={giaoAn.id} />
          <fieldset disabled={daHoanThien} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tên bài trình giảng
              </label>
              <input
                name="tenBai"
                defaultValue={giaoAn.tenBai}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kiến thức
              </label>
              <textarea
                name="kienThuc"
                rows={2}
                defaultValue={giaoAn.kienThuc ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kỹ năng
              </label>
              <textarea
                name="kyNang"
                rows={2}
                defaultValue={giaoAn.kyNang ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Năng lực tự chủ và tự chịu trách nhiệm
              </label>
              <textarea
                name="nangLucTuChu"
                rows={2}
                defaultValue={giaoAn.nangLucTuChu ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Đồ dùng và trang thiết bị dạy học
              </label>
              <textarea
                name="doDungThietBi"
                rows={2}
                defaultValue={giaoAn.doDungThietBi ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hình thức tổ chức dạy học
              </label>
              <textarea
                name="hinhThucToChuc"
                rows={3}
                defaultValue={giaoAn.hinhThucToChuc ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 text-sm rounded-md bg-slate-100 text-slate-700 px-3 py-1.5 hover:bg-slate-200">
              <Save className="h-4 w-4" strokeWidth={1.75} />
              Lưu
            </button>
          </fieldset>
        </form>
      </details>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ClipboardCheck className="h-5 w-5 text-slate-500" strokeWidth={1.75} />
          I. Ổn định lớp học
        </h2>
        <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-lg p-4">
          Thời gian: 01 phút — Kiểm tra sĩ số học sinh, ổn định tổ chức cho
          buổi học.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="h-5 w-5 text-slate-500" strokeWidth={1.75} />
          II. Thực hiện bài học
        </h2>

        {noiDung.khungMuc.map((khung, khungIndex) => (
          <KhungMucBlock
            key={khungIndex}
            giaoAnId={giaoAn.id}
            khungIndex={khungIndex}
            soThuTu={khungIndex + 1}
            tieuDe={khung.khungMucTieuDe}
            items={khung.items}
            disabled={daHoanThien}
          />
        ))}
      </section>
    </div>
  );
}

function KhungMucBlock({
  giaoAnId,
  khungIndex,
  soThuTu,
  tieuDe,
  items,
  disabled,
}: {
  giaoAnId: string;
  khungIndex: number;
  soThuTu: number;
  tieuDe: string;
  items: MucGiaoAn[];
  disabled: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
      <p className="text-sm font-semibold text-slate-800">
        {soThuTu}. {tieuDe} (
        {items.reduce((s, m) => s + m.thoiGianPhut, 0)} phút)
      </p>
      {items.map((muc, mucIndex) => (
        <form
          key={mucIndex}
          action={suaMuc}
          className="border border-slate-100 rounded-md p-3 space-y-2"
        >
          <input type="hidden" name="id" value={giaoAnId} />
          <input type="hidden" name="khungIndex" value={khungIndex} />
          <input type="hidden" name="mucIndex" value={mucIndex} />
          <fieldset disabled={disabled} className="space-y-2">
            <div className="flex gap-2">
              <input
                name="tieuDe"
                defaultValue={muc.tieuDe}
                className="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-medium"
              />
              <input
                name="thoiGianPhut"
                type="number"
                defaultValue={muc.thoiGianPhut}
                className="w-24 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
              />
              <span className="text-xs text-slate-400 self-center">phút</span>
            </div>
            <textarea
              name="noiDung"
              rows={3}
              defaultValue={muc.noiDung}
              placeholder="Nội dung trình bày (nếu có)"
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <textarea
                name="hoatDongGV"
                rows={2}
                defaultValue={muc.hoatDongGV}
                placeholder="Hoạt động của giáo viên"
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
              />
              <textarea
                name="hoatDongHS"
                rows={2}
                defaultValue={muc.hoatDongHS}
                placeholder="Hoạt động của học sinh"
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
              />
            </div>
            <div className="flex justify-between">
              <button className="inline-flex items-center gap-1 text-xs rounded-md bg-slate-100 text-slate-700 px-2.5 py-1.5 hover:bg-slate-200">
                <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
                Lưu
              </button>
              {items.length > 1 && (
                <button
                  formAction={xoaMuc}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Xóa mục
                </button>
              )}
            </div>
          </fieldset>
        </form>
      ))}
      {!disabled && (
        <form action={themMuc}>
          <input type="hidden" name="id" value={giaoAnId} />
          <input type="hidden" name="khungIndex" value={khungIndex} />
          <button className="inline-flex items-center gap-1 text-xs rounded-md bg-slate-900 text-white px-3 py-1.5 hover:bg-slate-700">
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            Thêm mục
          </button>
        </form>
      )}
    </div>
  );
}
