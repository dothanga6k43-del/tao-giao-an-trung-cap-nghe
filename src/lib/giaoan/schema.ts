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

// Mau "giao an ly thuyet" - mon/buoi day nghe co noi dung ly thuyet (hoac
// hon hop ly thuyet + thuc hanh). Dung cau truc 5 phan theo mau giao an GDNN
// (Quyet dinh 62/2008/QD-BLDTBXH, mau so 5 - So giao an ly thuyet).
export const KHUNG_MAU_NGHE_LY_THUYET: KhungMucMau[] = [
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

// Mau "giao an thuc hanh" - mon/buoi day nghe co noi dung THUAN THUC HANH
// (ren ky nang, khong co ly thuyet moi). Cau truc 6 phan theo mau giao an
// GDNN (Quyet dinh 62/2008/QD-BLDTBXH, mau so 6 - So giao an thuc hanh):
// them "Huong dan ban dau" (GV lam mau/thi pham) va "Huong dan thuong
// xuyen" (HS luyen tap, GV theo doi uon nan, luu y an toan lao dong) thay
// cho "Giai quyet van de" cua mau ly thuyet.
export const KHUNG_MAU_NGHE_THUC_HANH: KhungMucMau[] = [
  {
    tieuDe: "Dẫn nhập",
    moTa: "Dẫn dắt vào bài, tạo hứng thú cho người học, khoảng 2-3 phút",
  },
  {
    tieuDe: "Giới thiệu chủ đề",
    moTa: "Nêu tên bài, mục tiêu rèn luyện kỹ năng và yêu cầu sản phẩm cần đạt",
  },
  {
    tieuDe: "Hướng dẫn ban đầu",
    moTa:
      "Giáo viên thao tác mẫu/làm mẫu quy trình, hướng dẫn trình tự các bước thực hiện và tiêu chuẩn kỹ thuật cần đạt",
  },
  {
    tieuDe: "Hướng dẫn thường xuyên",
    moTa:
      "Học sinh luyện tập thực hành (theo các đề mục Thực hành/Kiểm tra); giáo viên quan sát, uốn nắn, nhắc nhở an toàn lao động trong suốt quá trình",
  },
  {
    tieuDe: "Hướng dẫn kết thúc",
    moTa:
      "Nhận xét kết quả thực hành, chỉ ra sai hỏng thường gặp và cách khắc phục, nhắc lại an toàn lao động",
  },
  {
    tieuDe: "Hướng dẫn tự học",
    moTa: "Giao nhiệm vụ luyện tập thêm, tài liệu tham khảo",
  },
];

// Mau "giao an mon van hoa/mon chung" (Toan, Ngu van, Tieng Anh, GDCD...)
// - khac han cau truc giao an nghe. Theo mau Ke hoach bai day, Phu luc IV
// Cong van 5512/BGDDT-GDTrH: 4 hoat dong, moi hoat dong gom Muc tieu - Noi
// dung - San pham - To chuc thuc hien (AI se viet long cac y nay vao phan
// "noi dung trinh bay" cua tung muc vi cau truc du lieu hien tai la dang
// phang, khong tach rieng 4 truong con).
export const KHUNG_MAU_VAN_HOA: KhungMucMau[] = [
  {
    tieuDe: "Hoạt động khởi động",
    moTa:
      "Gây hứng thú đầu giờ, kết nối kiến thức cũ với bài mới (nêu rõ Mục tiêu - Nội dung - Sản phẩm - Tổ chức thực hiện)",
  },
  {
    tieuDe: "Hoạt động hình thành kiến thức mới",
    moTa:
      "Tổ chức cho học sinh khám phá, phân tích, xây dựng kiến thức mới của bài học (nêu rõ Mục tiêu - Nội dung - Sản phẩm - Tổ chức thực hiện)",
  },
  {
    tieuDe: "Hoạt động luyện tập",
    moTa:
      "Rèn luyện, khắc sâu kiến thức vừa học qua bài tập, câu hỏi, tình huống cụ thể (nêu rõ Mục tiêu - Nội dung - Sản phẩm - Tổ chức thực hiện)",
  },
  {
    tieuDe: "Hoạt động vận dụng",
    moTa:
      "Học sinh vận dụng kiến thức, kỹ năng đã học vào tình huống/thực tiễn mới hoặc nhiệm vụ về nhà (nêu rõ Mục tiêu - Nội dung - Sản phẩm - Tổ chức thực hiện)",
  },
];

// Giu ten cu lam alias de tuong thich nguoc voi noi con dung truc tiep.
export const KHUNG_MAU_MAC_DINH = KHUNG_MAU_NGHE_LY_THUYET;

export function parseCauTrucMau(
  json: string | null | undefined,
  macDinh: KhungMucMau[] = KHUNG_MAU_NGHE_LY_THUYET
): KhungMucMau[] {
  if (!json) return macDinh;
  try {
    const arr = JSON.parse(json) as KhungMucMau[];
    if (Array.isArray(arr) && arr.length > 0) return arr;
  } catch {
    // rơi xuống mặc định nếu JSON hỏng
  }
  return macDinh;
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
