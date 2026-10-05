// Goi y ten dang nhap tu ho ten, de Admin co the sua lai truoc khi luu.
export function goiYTenDangNhap(hoTen: string): string {
  return hoTen
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);
}
