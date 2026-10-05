// Chuyen noi dung giao an (khungMuc) thanh cac hang cua bang "II. THUC HIEN
// BAI HOC" - dung chung cho ca ban xuat Word va ban xem truoc tren web, de
// hai noi khong bi lech nhau.

import type { NoiDungGiaoAn } from "./schema";

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
