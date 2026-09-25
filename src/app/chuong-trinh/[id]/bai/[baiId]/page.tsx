import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  capNhatBaiHoc,
  taoNoiDungMuc,
  capNhatNoiDungMuc,
  xoaNoiDungMuc,
} from "@/lib/actions/chuong-trinh";

const LOAI_LABEL: Record<string, string> = {
  LT: "Lý thuyết",
  TH: "Thực hành",
  KT: "Kiểm tra",
};

export default async function BaiHocDetailPage(
  props: PageProps<"/chuong-trinh/[id]/bai/[baiId]">
) {
  const { id, baiId } = await props.params;

  const bai = await prisma.baiHoc.findUnique({
    where: { id: baiId },
    include: {
      monHoc: true,
      noiDungMuc: {
        orderBy: { thuTu: "asc" },
      },
    },
  });

  if (!bai || bai.monHocId !== id) notFound();

  const mucCha = bai.noiDungMuc.filter((m) => !m.parentId);
  const conCuaCha = (chaId: string) =>
    bai.noiDungMuc.filter((m) => m.parentId === chaId);

  const tongThoiGianDaGan = bai.noiDungMuc.reduce(
    (s, m) => s + (m.thoiGianTiet ?? 0),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-slate-500">
          <Link href="/chuong-trinh" className="hover:underline">
            Chương trình môn học
          </Link>{" "}
          /{" "}
          <Link href={`/chuong-trinh/${id}`} className="hover:underline">
            {bai.monHoc.tenMonHoc}
          </Link>{" "}
          / {bai.tenBai}
        </p>
        <h1 className="text-2xl font-semibold mt-1">{bai.tenBai}</h1>
      </div>

      <details className="bg-white border border-slate-200 rounded-lg p-5" open={false}>
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          Sửa thông tin bài học
        </summary>
        <form action={capNhatBaiHoc} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={bai.id} />
          <input type="hidden" name="monHocId" value={id} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên bài
            </label>
            <input
              name="tenBai"
              defaultValue={bai.tenBai}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tổng số giờ
              </label>
              <input
                name="tongSoGio"
                type="number"
                step="0.5"
                defaultValue={bai.tongSoGio}
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
                defaultValue={bai.lyThuyetGio}
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
                defaultValue={bai.thucHanhGio}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kiểm tra
              </label>
              <input
                name="kiemTraGio"
                type="number"
                step="0.5"
                defaultValue={bai.kiemTraGio}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mục tiêu bài học
            </label>
            <textarea
              name="mucTieu"
              rows={3}
              defaultValue={bai.mucTieu ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
          >
            Lưu thay đổi
          </button>
        </form>
      </details>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nội dung chi tiết</h2>
          <p className="text-sm text-slate-500">
            Đã gán: {tongThoiGianDaGan} / {bai.tongSoGio} giờ
            {tongThoiGianDaGan !== bai.tongSoGio && (
              <span className="text-amber-600"> (chưa khớp tổng số giờ của bài)</span>
            )}
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Chỉ những đề mục có gán thời gian mới được dùng để xếp vào lịch
          trình giảng dạy. Đề mục cha không gán thời gian được coi là tiêu đề
          nhóm (thời gian nằm ở các đề mục con).
        </p>

        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {mucCha.length === 0 && (
            <p className="p-5 text-sm text-slate-500">Chưa có đề mục nào.</p>
          )}
          {mucCha.map((mc) => (
            <div key={mc.id} className="p-4 space-y-3">
              <DongNoiDung noiDung={mc} baiHocId={bai.id} monHocId={id} />
              <div className="pl-6 space-y-2 border-l-2 border-slate-100">
                {conCuaCha(mc.id).map((con) => (
                  <DongNoiDung
                    key={con.id}
                    noiDung={con}
                    baiHocId={bai.id}
                    monHocId={id}
                  />
                ))}
                <FormThemMoi
                  baiHocId={bai.id}
                  monHocId={id}
                  parentId={mc.id}
                  label="+ Thêm đề mục con"
                />
              </div>
            </div>
          ))}
        </div>

        <details className="bg-white border border-slate-200 rounded-lg p-5">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            + Thêm đề mục lớn
          </summary>
          <div className="mt-4">
            <FormThemMoi baiHocId={bai.id} monHocId={id} parentId={null} label="Thêm" />
          </div>
        </details>
      </section>
    </div>
  );
}

function DongNoiDung({
  noiDung,
  baiHocId,
  monHocId,
}: {
  noiDung: {
    id: string;
    tieuDe: string;
    loai: string;
    thoiGianTiet: number | null;
  };
  baiHocId: string;
  monHocId: string;
}) {
  return (
    <form
      action={capNhatNoiDungMuc}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="id" value={noiDung.id} />
      <input type="hidden" name="baiHocId" value={baiHocId} />
      <input type="hidden" name="monHocId" value={monHocId} />
      <input
        name="tieuDe"
        defaultValue={noiDung.tieuDe}
        className="flex-1 min-w-[220px] rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
      />
      <select
        name="loai"
        defaultValue={noiDung.loai}
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      >
        <option value="LT">{LOAI_LABEL.LT}</option>
        <option value="TH">{LOAI_LABEL.TH}</option>
        <option value="KT">{LOAI_LABEL.KT}</option>
      </select>
      <input
        name="thoiGianTiet"
        type="number"
        step="0.5"
        placeholder="Số giờ"
        defaultValue={noiDung.thoiGianTiet ?? ""}
        className="w-24 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
      />
      <button
        type="submit"
        className="text-xs rounded-md bg-slate-100 text-slate-700 px-2.5 py-1.5 hover:bg-slate-200"
      >
        Lưu
      </button>
      <button
        type="submit"
        formAction={xoaNoiDungMuc}
        className="text-xs text-red-600 hover:underline"
      >
        Xóa
      </button>
    </form>
  );
}

function FormThemMoi({
  baiHocId,
  monHocId,
  parentId,
  label,
}: {
  baiHocId: string;
  monHocId: string;
  parentId: string | null;
  label: string;
}) {
  return (
    <form action={taoNoiDungMuc} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="baiHocId" value={baiHocId} />
      <input type="hidden" name="monHocId" value={monHocId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <input
        name="tieuDe"
        required
        placeholder="Tiêu đề đề mục"
        className="flex-1 min-w-[220px] rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
      />
      <select
        name="loai"
        defaultValue="LT"
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      >
        <option value="LT">{LOAI_LABEL.LT}</option>
        <option value="TH">{LOAI_LABEL.TH}</option>
        <option value="KT">{LOAI_LABEL.KT}</option>
      </select>
      <input
        name="thoiGianTiet"
        type="number"
        step="0.5"
        placeholder="Số giờ"
        className="w-24 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
      />
      <button
        type="submit"
        className="text-xs rounded-md bg-slate-900 text-white px-3 py-1.5 hover:bg-slate-700"
      >
        {label}
      </button>
    </form>
  );
}
