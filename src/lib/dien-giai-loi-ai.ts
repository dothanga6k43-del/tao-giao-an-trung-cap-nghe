// Dien giai loi tu Anthropic API sang thong bao tieng Viet de hieu, thay vi
// de lo JSON loi tho ra giao dien.
export function dienGiaiLoiAI(e: unknown, fallbackPrefix = "Lỗi khi phân tích file"): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (raw.includes("prompt is too long") || raw.includes("too many tokens")) {
    return "File quá lớn để AI đọc (vượt giới hạn dung lượng nội dung). Vui lòng chọn file nhỏ hơn hoặc tách bớt nội dung rồi thử lại.";
  }
  if (raw.includes("credit balance is too low")) {
    return "Tài khoản AI đã hết credit. Vui lòng nạp thêm credit tại console.anthropic.com rồi thử lại.";
  }
  return `${fallbackPrefix}: ${raw}`;
}
