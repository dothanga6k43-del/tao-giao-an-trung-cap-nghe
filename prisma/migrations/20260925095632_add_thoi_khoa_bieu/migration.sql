-- CreateTable
CREATE TABLE "ThoiKhoaBieu" (
    "id" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "tuanThu" INTEGER,
    "ngayBatDau" TIMESTAMP(3),
    "ngayKetThuc" TIMESTAMP(3),
    "buoiHoc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThoiKhoaBieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThoiKhoaBieuDong" (
    "id" TEXT NOT NULL,
    "thoiKhoaBieuId" TEXT NOT NULL,
    "lop" TEXT NOT NULL,
    "diaDiem" TEXT,
    "tietBlock" TEXT NOT NULL,
    "thu" INTEGER NOT NULL,
    "monHoc" TEXT,
    "soGioLuyKe" DOUBLE PRECISION,
    "giaoVien" TEXT,
    "ghiChu" TEXT,

    CONSTRAINT "ThoiKhoaBieuDong_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ThoiKhoaBieuDong" ADD CONSTRAINT "ThoiKhoaBieuDong_thoiKhoaBieuId_fkey" FOREIGN KEY ("thoiKhoaBieuId") REFERENCES "ThoiKhoaBieu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
