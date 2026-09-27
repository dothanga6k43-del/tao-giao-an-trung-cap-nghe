// Cau truc noi dung giao an trinh giang, luu trong GiaoAn.noiDungJson.
// Tong quat hoa: giao an gom nhieu "khung muc" theo dung thu tu cua mau giao an
// (mac dinh la mau TCN 5 muc, hoac mau rieng cua tung mon hoc neu co tai len).
// Moi khung muc co the co 1 hoac nhieu dong noi dung (vd "Giai quyet van de"
// thuong co nhieu dong: ly thuyet lien quan, trinh tu thuc hien, thuc hanh...).

export type MucGiaoAn = {
  tieuDe: string;
  thoiGianPhut: number;
  noiDung: string;
  hoatDongGV: string;
  hoatDongHS: string;
};

export type KhungMucNoiDung = {
  khungMucTieuDe: string;
  items: MucGiaoAn[];
};

export type NoiDungGiaoAn = {
  khungMuc: KhungMucNoiDung[];
};

// Cau truc mau giao an (khai bao cac khung muc va thu tu cua chung).
// Dung chung mac dinh khi mon hoc chua tai len mau rieng.
export type KhungMucMau = {
  tieuDe: string;
  moTa: string | null;
};

export const KHUNG_MAU_MAC_DINH: KhungMucMau[] = [
  {
    tieuDe: "Dẫn nhập",
    moTa: "Dẫn dắt vào bài, tạo hứng thú cho người học, khoảng 2-3 phút",
  },
  {
    tieuDe: "Giới thiệu chủ đề",
    moTa: "Nêu tên bài và mục tiêu bài học",
  },
  {
    tieuDe: "Giải quyết vấn đề",
    moTa:
      "Chia thành nhiều mục nhỏ: Lý thuyết liên quan (theo các đề mục Lý thuyết), Trình tự thực hiện, Thực hành (theo các đề mục Thực hành/Kiểm tra)",
  },
  {
    tieuDe: "Kết thúc vấn đề",
    moTa: "Củng cố kiến thức, nhận xét, đánh giá buổi học",
  },
  {
    tieuDe: "Hướng dẫn tự học",
    moTa: "Giao nhiệm vụ tự học, tài liệu tham khảo",
  },
];

export function parseCauTrucMau(
  json: string | null | undefined
): KhungMucMau[] {
  if (!json) return KHUNG_MAU_MAC_DINH;
  try {
    const arr = JSON.parse(json) as KhungMucMau[];
    if (Array.isArray(arr) && arr.length > 0) return arr;
  } catch {
    // rơi xuống mặc định nếu JSON hỏng
  }
  return KHUNG_MAU_MAC_DINH;
}

// Dinh dang cu (truoc khi tong quat hoa theo mau rieng tung mon): cac truong
// co dinh danNhap/gioiThieuChuDe/giaiQuyetVanDe/ketThucVanDe/huongDanTuHoc.
type DinhDangCuMucDon = {
  tieuDe: string;
  thoiGianPhut: number;
  hoatDongGV: string;
  hoatDongHS: string;
};
type DinhDangCu = {
  danNhap: DinhDangCuMucDon;
  gioiThieuChuDe: DinhDangCuMucDon;
  giaiQuyetVanDe: (DinhDangCuMucDon & { noiDung: string })[];
  ketThucVanDe: DinhDangCuMucDon;
  huongDanTuHoc: DinhDangCuMucDon;
};

function chuyenMucDon(khungMucTieuDe: string, m: DinhDangCuMucDon): KhungMucNoiDung {
  return {
    khungMucTieuDe,
    items: [
      {
        tieuDe: m.tieuDe || khungMucTieuDe,
        thoiGianPhut: m.thoiGianPhut,
        noiDung: "",
        hoatDongGV: m.hoatDongGV,
        hoatDongHS: m.hoatDongHS,
      },
    ],
  };
}

function chuyenDoiDinhDangCu(old: DinhDangCu): NoiDungGiaoAn {
  return {
    khungMuc: [
      chuyenMucDon("Dẫn nhập", old.danNhap),
      chuyenMucDon("Giới thiệu chủ đề", old.gioiThieuChuDe),
      {
        khungMucTieuDe: "Giải quyết vấn đề",
        items: old.giaiQuyetVanDe.map((m) => ({
          tieuDe: m.tieuDe,
          thoiGianPhut: m.thoiGianPhut,
          noiDung: m.noiDung,
          hoatDongGV: m.hoatDongGV,
          hoatDongHS: m.hoatDongHS,
        })),
      },
      chuyenMucDon("Kết thúc vấn đề", old.ketThucVanDe),
      chuyenMucDon("Hướng dẫn tự học", old.huongDanTuHoc),
    ],
  };
}

export function parseNoiDungGiaoAn(json: string): NoiDungGiaoAn {
  const parsed = JSON.parse(json);
  if (parsed && Array.isArray(parsed.khungMuc)) {
    return parsed as NoiDungGiaoAn;
  }
  // Du lieu cu (truoc khi tong quat hoa theo mau) - tu dong chuyen doi khi doc,
  // se duoc luu lai theo dinh dang moi ngay lan sua/luu tiep theo.
  if (parsed && parsed.danNhap) {
    return chuyenDoiDinhDangCu(parsed as DinhDangCu);
  }
  return { khungMuc: [] };
}

export function tongPhutNoiDung(n: NoiDungGiaoAn): number {
  return n.khungMuc.reduce(
    (s, k) => s + k.items.reduce((s2, m) => s2 + m.thoiGianPhut, 0),
    0
  );
}
