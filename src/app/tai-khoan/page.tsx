import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { goiYTenDangNhap } from "@/lib/auth/ten-dang-nhap";
import TaoTaiKhoanForm from "@/components/TaoTaiKhoanForm";
import TaiKhoanRow from "@/components/TaiKhoanRow";
import { KeyRound } from "lucide-react";

export default async function TaiKhoanPage() {
  const hienTai = await layTaiKhoanHienTai();
  if (!hienTai || hienTai.vaiTro !== "ADMIN") {
    redirect("/");
  }

  const [taiKhoan, giaoVien] = await Promise.all([
    prisma.taiKhoan.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.giaoVien.findMany({ orderBy: { hoTen: "asc" } }),
  ]);

  const giaoVienChuaCoTk = giaoVien
    .filter((gv) => !taiKhoan.some((tk) => tk.giaoVienId === gv.id))
    .map((gv) => ({ id: gv.id, hoTen: gv.hoTen, goiYTenDangNhap: goiYTenDangNhap(gv.hoTen) }));

  const giaoVienOption = giaoVien.map((gv) => ({ id: gv.id, hoTen: gv.hoTen }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
          <KeyRound className="h-6 w-6 text-slate-500" strokeWidth={1.75} />
          Tài khoản
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Quản lý tài khoản đăng nhập cho Admin và giáo viên.
        </p>
      </div>

      <TaoTaiKhoanForm giaoVienChuaCoTk={giaoVienChuaCoTk} />

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {taiKhoan.length === 0 && (
          <p className="p-5 text-sm text-slate-500">Chưa có tài khoản nào.</p>
        )}
        {taiKhoan.map((tk) => (
          <TaiKhoanRow
            key={tk.id}
            taiKhoan={{
              id: tk.id,
              tenDangNhap: tk.tenDangNhap,
              vaiTro: tk.vaiTro,
              giaoVienId: tk.giaoVienId,
              createdAt: tk.createdAt.toISOString(),
            }}
            giaoVienOption={giaoVienOption}
            laTaiKhoanHienTai={tk.id === hienTai.id}
          />
        ))}
      </div>
    </div>
  );
}
