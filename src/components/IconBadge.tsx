import type { LucideIcon } from "lucide-react";
import type { MauKhuVuc } from "@/lib/section-colors";

export default function IconBadge({
  icon: Icon,
  mau,
  size = "md",
}: {
  icon: LucideIcon;
  mau: MauKhuVuc;
  size?: "sm" | "md" | "lg";
}) {
  const kichThuocHop = size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2";
  const kichThuocIcon = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <span className={`inline-flex items-center justify-center rounded-lg shrink-0 ${mau.bg} ${kichThuocHop}`}>
      <Icon className={`${kichThuocIcon} ${mau.text}`} strokeWidth={2} />
    </span>
  );
}
