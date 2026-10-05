import { prisma } from "@/lib/prisma";
import LichTrinhMoiForm from "@/components/LichTrinhMoiForm";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { dieuKienTheoGiaoVien } from "@/lib/auth/pham-vi";
import { ClipboardList } from "lucide-react";

export default async function LichTrinhMoiPage() {
  const hienTai = await layTaiKhoanHienTai();
  const dieuKien = dieuKienTheoGiaoVien(hienTai);
  const [lop, monHoc, giaoVien, thoiKhoaBieu] = await Promise.all([
    prisma.lop.findMany({ where: dieuKien, orderBy: { tenLop: "asc" } }),
    prisma.monHoc.findMany({ where: dieuKien, orderBy: { tenMonHoc: "asc" } }),
    prisma.giaoVien.findMany({ orderBy: { hoTen: "asc" } }),
    prisma.thoiKhoaBieu.findMany({
      where: dieuKien,
      orderBy: { createdAt: "desc" },
      include: {
        dong: {
          select: { lop: true, diaDiem: true, tietBlock: true, thu: true, monHoc: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
          <ClipboardList className="h-6 w-6 text-slate-500" strokeWidth={1.75} />
          Tạo lịch trình giảng dạy
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Chọn lớp, môn học và khung tiết theo thời khóa biểu. Sau khi tạo,
          bạn có thể thêm ngày nghỉ rồi bấm “Sinh lịch trình”.
        </p>
      </div>

      <LichTrinhMoiForm
        lop={lop}
        monHoc={monHoc}
        giaoVien={giaoVien}
        thoiKhoaBieu={thoiKhoaBieu}
        tenHienTaiNeuKhongPhaiAdmin={
          hienTai?.vaiTro === "ADMIN" ? undefined : (hienTai?.giaoVienHoTen ?? null)
        }
      />
    </div>
  );
}
