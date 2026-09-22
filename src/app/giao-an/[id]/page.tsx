import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseNoiDungGiaoAn, tongPhutNoiDung } from "@/lib/giaoan/schema";
import {
  capNhatThongTinChung,
  suaMucCoDinh,
  suaMucGiaiQuyet,
  themMucGiaiQuyet,
  xoaMucGiaiQuyet,
  soanLaiBangAI,
  hoanThienGiaoAn,
  moLaiGiaoAn,
  xoaGiaoAn,
} from "@/lib/actions/giao-an";

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

  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);
  const tongPhutSoan = tongPhutNoiDung(noiDung);
  const tongPhutBuoi = giaoAn.buoiDay.tongTiet * giaoAn.buoiDay.lichTrinh.soPhutMoiTiet;
  const daHoanThien = giaoAn.trangThai === "FINAL";
  const ngay = new Date(giaoAn.buoiDay.ngayThucHien);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            <Link href={`/lich-trinh/${giaoAn.buoiDay.lichTrinhId}`} className="hover:underline">
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
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              daHoanThien ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {daHoanThien ? "Hoàn thiện" : "Nháp"}
          </span>
          <a
            href={`/giao-an/${giaoAn.id}/xuat`}
            className="text-sm rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
          >
            Xuất Word
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {!daHoanThien && (
          <form action={soanLaiBangAI}>
            <input type="hidden" name="id" value={giaoAn.id} />
            <input type="hidden" name="buoiDayId" value={giaoAn.buoiDayId} />
            <button className="text-sm rounded-md bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-500">
              Soạn lại bằng AI
            </button>
          </form>
        )}
        {daHoanThien ? (
          <form action={moLaiGiaoAn}>
            <input type="hidden" name="id" value={giaoAn.id} />
            <button className="text-sm rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
              Mở lại để sửa
            </button>
          </form>
        ) : (
          <form action={hoanThienGiaoAn}>
            <input type="hidden" name="id" value={giaoAn.id} />
            <button className="text-sm rounded-md bg-emerald-600 text-white px-3 py-1.5 hover:bg-emerald-500">
              Đánh dấu hoàn thiện
            </button>
          </form>
        )}
        {!daHoanThien && (
          <form action={xoaGiaoAn}>
            <input type="hidden" name="id" value={giaoAn.id} />
            <button className="text-sm text-red-600 hover:underline">Xóa giáo án</button>
          </form>
        )}
      </div>

      <details className="bg-white border border-slate-200 rounded-lg p-5" open>
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">
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
            <button className="text-sm rounded-md bg-slate-100 text-slate-700 px-3 py-1.5 hover:bg-slate-200">
              Lưu
            </button>
          </fieldset>
        </form>
      </details>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">I. Ổn định lớp học</h2>
        <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-lg p-4">
          Thời gian: 01 phút — Kiểm tra sĩ số học sinh, ổn định tổ chức cho
          buổi học.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">II. Thực hiện bài học</h2>

        <MucCoDinhForm
          giaoAnId={giaoAn.id}
          khoa="danNhap"
          nhan="1. Dẫn nhập"
          muc={noiDung.danNhap}
          disabled={daHoanThien}
        />
        <MucCoDinhForm
          giaoAnId={giaoAn.id}
          khoa="gioiThieuChuDe"
          nhan="2. Giới thiệu chủ đề"
          muc={noiDung.gioiThieuChuDe}
          disabled={daHoanThien}
        />

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
          <p className="text-sm font-semibold text-slate-800">
            3. Giải quyết vấn đề (
            {noiDung.giaiQuyetVanDe.reduce((s, m) => s + m.thoiGianPhut, 0)} phút)
          </p>
          {noiDung.giaiQuyetVanDe.map((muc, idx) => (
            <form
              key={idx}
              action={suaMucGiaiQuyet}
              className="border border-slate-100 rounded-md p-3 space-y-2"
            >
              <input type="hidden" name="id" value={giaoAn.id} />
              <input type="hidden" name="index" value={idx} />
              <fieldset disabled={daHoanThien} className="space-y-2">
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
                  placeholder="Nội dung trình bày"
                  className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
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
                  <button className="text-xs rounded-md bg-slate-100 text-slate-700 px-2.5 py-1.5 hover:bg-slate-200">
                    Lưu
                  </button>
                  <button
                    formAction={xoaMucGiaiQuyet}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Xóa mục
                  </button>
                </div>
              </fieldset>
            </form>
          ))}
          {!daHoanThien && (
            <form action={themMucGiaiQuyet}>
              <input type="hidden" name="id" value={giaoAn.id} />
              <button className="text-xs rounded-md bg-slate-900 text-white px-3 py-1.5 hover:bg-slate-700">
                + Thêm mục
              </button>
            </form>
          )}
        </div>

        <MucCoDinhForm
          giaoAnId={giaoAn.id}
          khoa="ketThucVanDe"
          nhan="4. Kết thúc vấn đề"
          muc={noiDung.ketThucVanDe}
          disabled={daHoanThien}
        />
        <MucCoDinhForm
          giaoAnId={giaoAn.id}
          khoa="huongDanTuHoc"
          nhan="5. Hướng dẫn tự học"
          muc={noiDung.huongDanTuHoc}
          disabled={daHoanThien}
        />
      </section>
    </div>
  );
}

function MucCoDinhForm({
  giaoAnId,
  khoa,
  nhan,
  muc,
  disabled,
}: {
  giaoAnId: string;
  khoa: "danNhap" | "gioiThieuChuDe" | "ketThucVanDe" | "huongDanTuHoc";
  nhan: string;
  muc: { tieuDe: string; thoiGianPhut: number; hoatDongGV: string; hoatDongHS: string };
  disabled: boolean;
}) {
  return (
    <form
      action={suaMucCoDinh}
      className="bg-white border border-slate-200 rounded-lg p-4 space-y-2"
    >
      <input type="hidden" name="id" value={giaoAnId} />
      <input type="hidden" name="khoa" value={khoa} />
      <fieldset disabled={disabled} className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 flex-1">{nhan}</p>
          <input
            name="thoiGianPhut"
            type="number"
            defaultValue={muc.thoiGianPhut}
            className="w-20 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          />
          <span className="text-xs text-slate-400">phút</span>
        </div>
        <input type="hidden" name="tieuDe" value={muc.tieuDe} />
        <div className="grid grid-cols-2 gap-2">
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
        <button className="text-xs rounded-md bg-slate-100 text-slate-700 px-2.5 py-1.5 hover:bg-slate-200">
          Lưu
        </button>
      </fieldset>
    </form>
  );
}
