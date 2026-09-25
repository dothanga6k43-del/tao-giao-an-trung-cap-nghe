import { prisma } from "@/lib/prisma";
import LichTrinhMoiForm from "@/components/LichTrinhMoiForm";

export default async function LichTrinhMoiPage() {
  const [lop, monHoc, giaoVien, thoiKhoaBieu] = await Promise.all([
    prisma.lop.findMany({ orderBy: { tenLop: "asc" } }),
    prisma.monHoc.findMany({ orderBy: { tenMonHoc: "asc" } }),
    prisma.giaoVien.findMany({ orderBy: { hoTen: "asc" } }),
    prisma.thoiKhoaBieu.findMany({
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
        <h1 className="text-2xl font-semibold">Tạo lịch trình giảng dạy</h1>
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
      />
    </div>
  );
}
