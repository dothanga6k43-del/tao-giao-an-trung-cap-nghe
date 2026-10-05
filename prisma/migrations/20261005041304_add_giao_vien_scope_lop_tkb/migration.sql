-- AlterTable
ALTER TABLE "Lop" ADD COLUMN     "giaoVienId" TEXT;

-- AlterTable
ALTER TABLE "ThoiKhoaBieu" ADD COLUMN     "giaoVienId" TEXT;

-- AddForeignKey
ALTER TABLE "Lop" ADD CONSTRAINT "Lop_giaoVienId_fkey" FOREIGN KEY ("giaoVienId") REFERENCES "GiaoVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThoiKhoaBieu" ADD CONSTRAINT "ThoiKhoaBieu_giaoVienId_fkey" FOREIGN KEY ("giaoVienId") REFERENCES "GiaoVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;
