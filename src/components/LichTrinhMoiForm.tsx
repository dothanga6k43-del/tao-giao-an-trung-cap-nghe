"use client";

import { useMemo, useRef, useState } from "react";
import { taoLichTrinh } from "@/lib/actions/lich-trinh";

const THU_LIST = [2, 3, 4, 5, 6, 7] as const;
const THU_LABEL: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
};

type DongTkb = {
  lop: string;
  diaDiem: string | null;
  tietBlock: string;
  thu: number;
  monHoc: string | null;
};

type ThoiKhoaBieuOption = {
  id: string;
  tieuDe: string;
  dong: DongTkb[];
};

// "1.2" -> { batDau: 1, soTiet: 2 }, "3.4.5" -> { batDau: 3, soTiet: 3 }
function phanTichTietBlock(tietBlock: string): { batDau: number; soTiet: number } | null {
  const so = tietBlock
    .split(".")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (so.length === 0) return null;
  return { batDau: Math.min(...so), soTiet: so.length };
}

export default function LichTrinhMoiForm({
  lop,
  monHoc,
  giaoVien,
  thoiKhoaBieu,
}: {
  lop: { id: string; tenLop: string }[];
  monHoc: { id: string; tenMonHoc: string; tongSoGio: number }[];
  giaoVien: { id: string; hoTen: string }[];
  thoiKhoaBieu: ThoiKhoaBieuOption[];
}) {
  const [tkbId, setTkbId] = useState("");
  const [tkbLop, setTkbLop] = useState("");
  const [tkbTietBlock, setTkbTietBlock] = useState("");
  const [thongBao, setThongBao] = useState("");

  const tietBatDauRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const tietSoTietRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const tietDiaDiemRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const tkbDaChon = useMemo(
    () => thoiKhoaBieu.find((t) => t.id === tkbId) ?? null,
    [thoiKhoaBieu, tkbId]
  );

  const dsLopTrongTkb = useMemo(() => {
    if (!tkbDaChon) return [];
    return [...new Set(tkbDaChon.dong.map((d) => d.lop))];
  }, [tkbDaChon]);

  const dsTietBlockTrongLop = useMemo(() => {
    if (!tkbDaChon || !tkbLop) return [];
    return [
      ...new Set(
        tkbDaChon.dong.filter((d) => d.lop === tkbLop).map((d) => d.tietBlock)
      ),
    ];
  }, [tkbDaChon, tkbLop]);

  function napKhungTiet() {
    if (!tkbDaChon || !tkbLop || !tkbTietBlock) return;
    const hang = tkbDaChon.dong.filter(
      (d) => d.lop === tkbLop && d.tietBlock === tkbTietBlock
    );
    const phanTich = phanTichTietBlock(tkbTietBlock);
    if (!phanTich) {
      setThongBao(`Không đọc được số tiết từ "${tkbTietBlock}"`);
      return;
    }

    let soNgayDaNap = 0;
    for (const thu of THU_LIST) {
      const oNgay = hang.find((d) => d.thu === thu);
      const coMonHoc = oNgay && oNgay.monHoc && oNgay.monHoc.trim() !== "";
      const batDauInput = tietBatDauRefs.current[thu];
      const soTietInput = tietSoTietRefs.current[thu];
      const diaDiemInput = tietDiaDiemRefs.current[thu];
      if (coMonHoc) {
        if (batDauInput) batDauInput.value = String(phanTich.batDau);
        if (soTietInput) soTietInput.value = String(phanTich.soTiet);
        if (diaDiemInput) diaDiemInput.value = oNgay?.diaDiem ?? "";
        soNgayDaNap++;
      } else {
        if (batDauInput) batDauInput.value = "";
        if (soTietInput) soTietInput.value = "";
        if (diaDiemInput) diaDiemInput.value = "";
      }
    }
    setThongBao(
      soNgayDaNap > 0
        ? `Đã nạp khung tiết cho ${soNgayDaNap} ngày trong tuần.`
        : `Khối tiết "${tkbTietBlock}" của lớp này không có môn học nào trong thời khóa biểu đã chọn.`
    );
  }

  return (
    <form
      action={taoLichTrinh}
      className="space-y-6 bg-white border border-slate-200 rounded-lg p-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Lớp
          </label>
          <select
            name="lopId"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">-- Chọn lớp --</option>
            {lop.map((l) => (
              <option key={l.id} value={l.id}>
                {l.tenLop}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Môn học
          </label>
          <select
            name="monHocId"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">-- Chọn môn học --</option>
            {monHoc.map((m) => (
              <option key={m.id} value={m.id}>
                {m.tenMonHoc} ({m.tongSoGio} giờ)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Giáo viên
          </label>
          <select
            name="giaoVienId"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">-- Chưa chọn --</option>
            {giaoVien.map((gv) => (
              <option key={gv.id} value={gv.id}>
                {gv.hoTen}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Học kỳ
          </label>
          <input
            name="hocKy"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Học kỳ I"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Ngày bắt đầu
          </label>
          <input
            name="ngayBatDau"
            type="date"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Số phút mỗi tiết
          </label>
          <input
            name="soPhutMoiTiet"
            type="number"
            defaultValue={45}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {thoiKhoaBieu.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Nạp khung tiết từ thời khóa biểu đã lưu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={tkbId}
              onChange={(e) => {
                setTkbId(e.target.value);
                setTkbLop("");
                setTkbTietBlock("");
                setThongBao("");
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn thời khóa biểu --</option>
              {thoiKhoaBieu.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tieuDe}
                </option>
              ))}
            </select>
            <select
              value={tkbLop}
              onChange={(e) => {
                setTkbLop(e.target.value);
                setTkbTietBlock("");
                setThongBao("");
              }}
              disabled={!tkbDaChon}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
            >
              <option value="">-- Chọn lớp trong TKB --</option>
              {dsLopTrongTkb.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={tkbTietBlock}
              onChange={(e) => {
                setTkbTietBlock(e.target.value);
                setThongBao("");
              }}
              disabled={!tkbLop}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
            >
              <option value="">-- Chọn khối tiết --</option>
              {dsTietBlockTrongLop.map((tb) => (
                <option key={tb} value={tb}>
                  Tiết {tb}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={napKhungTiet}
            disabled={!tkbTietBlock}
            className="rounded-md border border-slate-300 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-50"
          >
            Nạp khung tiết vào bảng bên dưới
          </button>
          {thongBao && <p className="text-xs text-slate-500">{thongBao}</p>}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          Khung tiết theo thời khóa biểu (để trống ngày không học môn này)
        </h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="p-2 w-24">Thứ</th>
                  <th className="p-2">Tiết bắt đầu</th>
                  <th className="p-2">Số tiết</th>
                  <th className="p-2">Địa điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {THU_LIST.map((thu) => (
                  <tr key={thu}>
                    <td className="p-2 font-medium">{THU_LABEL[thu]}</td>
                    <td className="p-2">
                      <input
                        ref={(el) => {
                          tietBatDauRefs.current[thu] = el;
                        }}
                        name={`tiet_batdau_${thu}`}
                        type="number"
                        min={1}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        ref={(el) => {
                          tietSoTietRefs.current[thu] = el;
                        }}
                        name={`tiet_sotiet_${thu}`}
                        type="number"
                        min={1}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        ref={(el) => {
                          tietDiaDiemRefs.current[thu] = el;
                        }}
                        name={`tiet_diadiem_${thu}`}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                        placeholder="X. Điện tử"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="rounded-md bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-700"
      >
        Tạo lịch trình
      </button>
    </form>
  );
}
