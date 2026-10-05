// Chuyen noi dung giao an (khungMuc) thanh cac hang cua bang "II. THUC HIEN
// BAI HOC" - dung chung cho ca ban xuat Word va ban xem truoc tren web, de
// hai noi khong bi lech nhau.

import type { NoiDungGiaoAn } from "./schema";

// Khung thong tin dau bai (GIAO AN SO, Thoi gian thuc hien, Lop day, Thuc
// hien ngay...) - theo dung thu tu/nhan cua Mau so 5 (So giao an ly thuyet)
// ban hanh kem Quyet dinh 62/2008/QD-BLDTBXH. Dung chung giua ban xuat Word
// va ban xem truoc de hai noi khong bi lech nhau.
export type ThongTinDauBai = {
  giaoAnSo: number;
  thoiGianThucHien: string;
  lopDay: string;
  ngay: number;
  thang: number;
  nam: number;
};

export function layThongTinDauBai(buoiDay: {
  thuTu: number;
  tongTiet: number;
  ngayThucHien: Date;
  lichTrinh: { soPhutMoiTiet: number; lop: { tenLop: string } };
}): ThongTinDauBai {
  const [nam, thang, ngay] = new Date(buoiDay.ngayThucHien)
    .toISOString()
    .slice(0, 10)
    .split("-")
    .map(Number);
  const tongPhut = Math.round(buoiDay.tongTiet * buoiDay.lichTrinh.soPhutMoiTiet);
  return {
    giaoAnSo: buoiDay.thuTu,
    thoiGianThucHien: `${buoiDay.tongTiet} tiết (${tongPhut} phút)`,
    lopDay: buoiDay.lichTrinh.lop.tenLop,
    ngay,
    thang,
    nam,
  };
}

export type HangBangNoiDung = {
  stt: string;
  tieuDe: string;
  gv: string;
  hs: string;
  phut: number;
  boldTieuDe: boolean;
};

export function layHangBangNoiDung(noiDung: NoiDungGiaoAn): HangBangNoiDung[] {
  return noiDung.khungMuc.flatMap((khung, idx) => {
    const stt = String(idx + 1);
    if (khung.items.length === 1) {
      const m = khung.items[0];
      return [
        {
          stt,
          tieuDe: m.tieuDe || khung.khungMucTieuDe,
          gv: m.hoatDongGV,
          hs: m.hoatDongHS,
          phut: m.thoiGianPhut,
          boldTieuDe: true,
        },
      ];
    }
    const tongPhutKhung = khung.items.reduce((s, m) => s + m.thoiGianPhut, 0);
    return [
      {
        stt,
        tieuDe: khung.khungMucTieuDe,
        gv: "",
        hs: "",
        phut: tongPhutKhung,
        boldTieuDe: true,
      },
      ...khung.items.map((m) => ({
        stt: "",
        tieuDe: `${m.tieuDe}\n${m.noiDung}`,
        gv: m.hoatDongGV,
        hs: m.hoatDongHS,
        phut: m.thoiGianPhut,
        boldTieuDe: false,
      })),
    ];
  });
}
