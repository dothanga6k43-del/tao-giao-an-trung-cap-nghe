// Phan quyen theo "giao vien phu trach/tao lap": Admin xem duoc tat ca, tai
// khoan Giao vien chi xem/sua duoc du lieu gan voi chinh ho so giao vien cua
// minh, khong thay du lieu cua giao vien khac.

import { notFound } from "next/navigation";
import type { TaiKhoanHienTai } from "./session";

export function coQuyenVoiGiaoVien(
  hienTai: TaiKhoanHienTai | null,
  giaoVienIdCuaBanGhi: string | null
): boolean {
  if (!hienTai) return false;
  if (hienTai.vaiTro === "ADMIN") return true;
  return hienTai.giaoVienId !== null && hienTai.giaoVienId === giaoVienIdCuaBanGhi;
}

// Dung cho where cua Prisma: Admin khong bi loc (xem tat ca), giao vien chi
// thay ban ghi co giaoVienId = chinh minh. Tai khoan giao vien chua gan ho so
// (giaoVienId null) dung mot gia tri khong bao gio ton tai, tranh vo tinh
// khop voi cac ban ghi giaoVienId = null cua nguoi khac/chua ai nhan.
export function dieuKienTheoGiaoVien(hienTai: TaiKhoanHienTai | null): {
  giaoVienId?: string;
} {
  if (hienTai?.vaiTro === "ADMIN") return {};
  return { giaoVienId: hienTai?.giaoVienId ?? "__khong_ton_tai__" };
}

// Dung trong trang chi tiet (Server Component) - tra ve 404 neu khong co quyen.
export function yeuCauQuyenXem(
  hienTai: TaiKhoanHienTai | null,
  giaoVienIdCuaBanGhi: string | null
): void {
  if (!coQuyenVoiGiaoVien(hienTai, giaoVienIdCuaBanGhi)) {
    notFound();
  }
}

// Dung trong Server Action khi sua/xoa - bao loi neu khong co quyen.
export function yeuCauQuyenSua(
  hienTai: TaiKhoanHienTai | null,
  giaoVienIdCuaBanGhi: string | null
): void {
  if (!coQuyenVoiGiaoVien(hienTai, giaoVienIdCuaBanGhi)) {
    throw new Error("Bạn không có quyền với dữ liệu này");
  }
}

// Dung o dau Server Action tao moi: tra ve gia tri giaoVienId can luu.
// - Admin: giu nguyen gia tri da chon tren form (co the de trong).
// - Giao vien: luon ep ve chinh ho so cua minh; neu tai khoan chua gan ho so
//   giao vien thi chan tao moi hoan toan - neu khong se tao ra du lieu
//   giaoVienId=null ma chinh ho cung khong xem lai duoc sau nay.
export function giaoVienIdKhiTao(
  hienTai: TaiKhoanHienTai | null,
  giaoVienIdDaChon: string | null
): string | null {
  if (hienTai?.vaiTro === "ADMIN") return giaoVienIdDaChon;
  if (!hienTai?.giaoVienId) {
    throw new Error(
      "Tài khoản của bạn chưa được gắn với hồ sơ giáo viên nào nên không thể tạo dữ liệu mới. Vui lòng liên hệ Admin để liên kết tài khoản."
    );
  }
  return hienTai.giaoVienId;
}
