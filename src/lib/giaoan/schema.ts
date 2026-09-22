// Cau truc noi dung giao an trinh giang, luu trong GiaoAn.noiDungJson

export type MucGiaoAn = {
  tieuDe: string;
  thoiGianPhut: number;
  hoatDongGV: string;
  hoatDongHS: string;
};

export type MucGiaiQuyetVanDe = MucGiaoAn & {
  noiDung: string; // noi dung chi tiet trinh bay (ly thuyet / trinh tu / thuc hanh)
};

export type NoiDungGiaoAn = {
  danNhap: MucGiaoAn;
  gioiThieuChuDe: MucGiaoAn;
  giaiQuyetVanDe: MucGiaiQuyetVanDe[];
  ketThucVanDe: MucGiaoAn;
  huongDanTuHoc: MucGiaoAn;
};

export function parseNoiDungGiaoAn(json: string): NoiDungGiaoAn {
  return JSON.parse(json) as NoiDungGiaoAn;
}

export function tongPhutNoiDung(n: NoiDungGiaoAn): number {
  return (
    n.danNhap.thoiGianPhut +
    n.gioiThieuChuDe.thoiGianPhut +
    n.giaiQuyetVanDe.reduce((s, m) => s + m.thoiGianPhut, 0) +
    n.ketThucVanDe.thoiGianPhut +
    n.huongDanTuHoc.thoiGianPhut
  );
}
