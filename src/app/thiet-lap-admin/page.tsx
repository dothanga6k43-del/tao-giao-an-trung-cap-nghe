import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ThietLapAdminForm from "@/components/ThietLapAdminForm";
import { ShieldCheck } from "lucide-react";

// Trang nay kiem tra so tai khoan hien co MOI LAN truy cap (chi dung khi he
// thong chua co ai) - khong duoc cache tinh, neu khong se lo "dong bang" ket
// qua cua lan build va khong bao gio tu dong ngung cho phep truy cap nua.
export const dynamic = "force-dynamic";

export default async function ThietLapAdminPage() {
  const soTaiKhoan = await prisma.taiKhoan.count();
  if (soTaiKhoan > 0) {
    redirect("/dang-nhap");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="h-8 w-8 text-slate-700" strokeWidth={1.75} />
          <h1 className="text-xl font-semibold">Khởi tạo tài khoản Admin</h1>
          <p className="text-sm text-slate-500">
            Đây là lần đầu thiết lập hệ thống. Tạo tài khoản quản trị cao
            nhất — tài khoản này sẽ quản lý mọi tài khoản khác sau này.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <ThietLapAdminForm />
        </div>
      </div>
    </div>
  );
}
