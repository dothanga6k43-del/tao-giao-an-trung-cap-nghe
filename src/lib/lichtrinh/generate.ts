// Thuat toan xep "Noi dung chi tiet" (co thoi gian duoc gan) vao cac buoi day
// theo khung tiet hang tuan, bat dau tu mot ngay cho truoc, bo qua ngay nghi.

export type LoaiND = "LT" | "TH" | "KT";

export type MucChiTiet = {
  id: string;
  baiHocId: string;
  tenBai: string;
  tieuDe: string;
  loai: LoaiND;
  gioTiet: number;
};

export type KhungTiet = {
  thu: number; // 2..8 (2 = Thu Hai ... 7 = Thu Bay, 8 = Chu Nhat)
  tietBatDau: number;
  soTiet: number;
};

export type BuoiDaySinh = {
  thuTu: number;
  ngayThucHien: Date;
  tietBatDau: number;
  tongTiet: number;
  lyThuyetTiet: number;
  thucHanhTiet: number;
  kiemTraTiet: number;
  items: { noiDungMucId: string; soTiet: number; laTiepTuc: boolean }[];
};

function thuTrongTuan(d: Date): number {
  // JS: 0=CN,1=T2,...,6=T7  ->  quy uoc cua ta: 2=T2..7=T7,8=CN
  const js = d.getDay();
  return js === 0 ? 8 : js + 1;
}

function ngayToKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function sinhLichTrinh(
  danhSachMuc: MucChiTiet[],
  khungTietTuan: KhungTiet[],
  ngayBatDau: Date,
  ngayNghi: Date[],
  gioiHanSoNgay = 1000
): BuoiDaySinh[] {
  const ngayNghiSet = new Set(ngayNghi.map(ngayToKey));
  const khungTheoThu = new Map<number, KhungTiet>();
  for (const k of khungTietTuan) {
    if (!khungTheoThu.has(k.thu)) khungTheoThu.set(k.thu, k);
  }

  const queue = danhSachMuc
    .filter((m) => m.gioTiet > 0)
    .map((m) => ({ ...m, conLai: m.gioTiet, daBatDau: false }));

  const ketQua: BuoiDaySinh[] = [];
  let thuTu = 0;
  const conMucNaoChua = () => queue.some((m) => m.conLai > 0);

  let ngayHienTai = new Date(ngayBatDau);
  let soNgayDaXet = 0;

  while (conMucNaoChua() && soNgayDaXet < gioiHanSoNgay) {
    soNgayDaXet++;
    const thu = thuTrongTuan(ngayHienTai);
    const khung = khungTheoThu.get(thu);
    const key = ngayToKey(ngayHienTai);

    if (khung && !ngayNghiSet.has(key)) {
      let succonLai = khung.soTiet;
      const items: BuoiDaySinh["items"] = [];
      let lyThuyetTiet = 0;
      let thucHanhTiet = 0;
      let kiemTraTiet = 0;

      for (const muc of queue) {
        if (succonLai <= 0) break;
        if (muc.conLai <= 0) continue;

        const lay = Math.min(muc.conLai, succonLai);
        items.push({
          noiDungMucId: muc.id,
          soTiet: lay,
          laTiepTuc: muc.daBatDau,
        });
        if (muc.loai === "LT") lyThuyetTiet += lay;
        else if (muc.loai === "TH") thucHanhTiet += lay;
        else kiemTraTiet += lay;

        muc.conLai -= lay;
        muc.daBatDau = true;
        succonLai -= lay;
      }

      if (items.length > 0) {
        thuTu++;
        ketQua.push({
          thuTu,
          ngayThucHien: new Date(ngayHienTai),
          tietBatDau: khung.tietBatDau,
          tongTiet: khung.soTiet - succonLai,
          lyThuyetTiet,
          thucHanhTiet,
          kiemTraTiet,
          items,
        });
      }
    }

    ngayHienTai = new Date(ngayHienTai);
    ngayHienTai.setDate(ngayHienTai.getDate() + 1);
  }

  return ketQua;
}
