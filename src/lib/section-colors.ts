// Mau sac theo tung khu vuc chuc nang cua app - dung chung giua Sidebar va
// cac tieu de trang de giao dien nhat quan, de nhan biet module dang xem.
export type MauKhuVuc = {
  bg: string;
  text: string;
  bgActive: string;
};

export const MAU_CHUONG_TRINH: MauKhuVuc = {
  bg: "bg-indigo-50",
  text: "text-indigo-600",
  bgActive: "bg-indigo-600",
};
export const MAU_LOP: MauKhuVuc = {
  bg: "bg-emerald-50",
  text: "text-emerald-600",
  bgActive: "bg-emerald-600",
};
export const MAU_GIAO_VIEN: MauKhuVuc = {
  bg: "bg-amber-50",
  text: "text-amber-600",
  bgActive: "bg-amber-600",
};
export const MAU_THOI_KHOA_BIEU: MauKhuVuc = {
  bg: "bg-sky-50",
  text: "text-sky-600",
  bgActive: "bg-sky-600",
};
export const MAU_LICH_TRINH: MauKhuVuc = {
  bg: "bg-violet-50",
  text: "text-violet-600",
  bgActive: "bg-violet-600",
};
export const MAU_GIAO_AN: MauKhuVuc = {
  bg: "bg-rose-50",
  text: "text-rose-600",
  bgActive: "bg-rose-600",
};
export const MAU_TAI_KHOAN: MauKhuVuc = {
  bg: "bg-teal-50",
  text: "text-teal-600",
  bgActive: "bg-teal-600",
};
