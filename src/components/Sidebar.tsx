import Link from "next/link";

const NAV_ITEMS = [
  { href: "/chuong-trinh", label: "Chương trình môn học" },
  { href: "/lop", label: "Lớp học" },
  { href: "/giao-vien", label: "Giáo viên" },
  { href: "/lich-trinh", label: "Lịch trình giảng dạy" },
  { href: "/giao-an", label: "Giáo án" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white min-h-screen">
      <div className="px-5 py-5 border-b border-slate-200">
        <Link href="/" className="font-semibold text-slate-900">
          Soạn giáo án TCN
        </Link>
      </div>
      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
