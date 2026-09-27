// Chuan hoa ten bai de so khop: bo tien to "Bài 1:"/"Bài 1."/"1." nếu có,
// bo khoang trang thua, chu thuong - vi AI co the tra ve ten bai kem hoac
// khong kem tien to nay giua cac lan trich xuat khac nhau.
export function chuanHoaTenBai(ten: string): string {
  return ten
    .trim()
    .toLowerCase()
    .replace(/^(bài|bai)\s*\d+\s*[:.\-–]?\s*/i, "")
    .replace(/^\d+\s*[:.\-–]\s*/, "")
    .trim();
}
