-- CreateEnum
CREATE TYPE "VaiTro" AS ENUM ('ADMIN', 'GIAO_VIEN');

-- CreateTable
CREATE TABLE "TaiKhoan" (
    "id" TEXT NOT NULL,
    "tenDangNhap" TEXT NOT NULL,
    "matKhauHash" TEXT NOT NULL,
    "vaiTro" "VaiTro" NOT NULL DEFAULT 'GIAO_VIEN',
    "giaoVienId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaiKhoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhienDangNhap" (
    "id" TEXT NOT NULL,
    "taiKhoanId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "hetHan" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhienDangNhap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaiKhoan_tenDangNhap_key" ON "TaiKhoan"("tenDangNhap");

-- CreateIndex
CREATE UNIQUE INDEX "TaiKhoan_giaoVienId_key" ON "TaiKhoan"("giaoVienId");

-- CreateIndex
CREATE UNIQUE INDEX "PhienDangNhap_tokenHash_key" ON "PhienDangNhap"("tokenHash");

-- AddForeignKey
ALTER TABLE "TaiKhoan" ADD CONSTRAINT "TaiKhoan_giaoVienId_fkey" FOREIGN KEY ("giaoVienId") REFERENCES "GiaoVien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhienDangNhap" ADD CONSTRAINT "PhienDangNhap_taiKhoanId_fkey" FOREIGN KEY ("taiKhoanId") REFERENCES "TaiKhoan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
