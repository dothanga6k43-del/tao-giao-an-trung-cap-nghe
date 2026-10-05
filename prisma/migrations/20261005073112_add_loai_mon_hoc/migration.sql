-- CreateEnum
CREATE TYPE "LoaiMonHoc" AS ENUM ('NGHE', 'VAN_HOA');

-- AlterTable
ALTER TABLE "MonHoc" ADD COLUMN     "loaiMon" "LoaiMonHoc" NOT NULL DEFAULT 'NGHE';
