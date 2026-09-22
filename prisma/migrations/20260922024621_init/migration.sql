-- CreateEnum
CREATE TYPE "LoaiNoiDung" AS ENUM ('LT', 'TH', 'KT');

-- CreateEnum
CREATE TYPE "TrangThaiLichTrinh" AS ENUM ('DRAFT', 'APPROVED');

-- CreateEnum
CREATE TYPE "TrangThaiGiaoAn" AS ENUM ('DRAFT', 'FINAL');

-- CreateTable
CREATE TABLE "GiaoVien" (
    "id" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "soDienThoai" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiaoVien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lop" (
    "id" TEXT NOT NULL,
    "tenLop" TEXT NOT NULL,
    "khoa" TEXT,
    "namThu" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonHoc" (
    "id" TEXT NOT NULL,
    "tenMonHoc" TEXT NOT NULL,
    "maMonHoc" TEXT,
    "tongSoGio" DOUBLE PRECISION NOT NULL,
    "lyThuyetGio" DOUBLE PRECISION NOT NULL,
    "thucHanhGio" DOUBLE PRECISION NOT NULL,
    "kiemTraGio" DOUBLE PRECISION NOT NULL,
    "viTriTinhChat" TEXT,
    "mucTieu" TEXT,
    "dieuKienThucHien" TEXT,
    "phuongPhapDanhGia" TEXT,
    "taiLieuThamKhao" TEXT,
    "giaoVienId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonHoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaiHoc" (
    "id" TEXT NOT NULL,
    "monHocId" TEXT NOT NULL,
    "thuTu" INTEGER NOT NULL,
    "tenBai" TEXT NOT NULL,
    "tongSoGio" DOUBLE PRECISION NOT NULL,
    "lyThuyetGio" DOUBLE PRECISION NOT NULL,
    "thucHanhGio" DOUBLE PRECISION NOT NULL,
    "kiemTraGio" DOUBLE PRECISION NOT NULL,
    "mucTieu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaiHoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoiDungMuc" (
    "id" TEXT NOT NULL,
    "baiHocId" TEXT NOT NULL,
    "parentId" TEXT,
    "thuTu" INTEGER NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "loai" "LoaiNoiDung" NOT NULL DEFAULT 'LT',
    "thoiGianTiet" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoiDungMuc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LichTrinhGiangDay" (
    "id" TEXT NOT NULL,
    "lopId" TEXT NOT NULL,
    "monHocId" TEXT NOT NULL,
    "giaoVienId" TEXT,
    "hocKy" TEXT,
    "ngayBatDau" TIMESTAMP(3) NOT NULL,
    "soPhutMoiTiet" INTEGER NOT NULL DEFAULT 45,
    "trangThai" "TrangThaiLichTrinh" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LichTrinhGiangDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KhungTietTuan" (
    "id" TEXT NOT NULL,
    "lichTrinhId" TEXT NOT NULL,
    "thu" INTEGER NOT NULL,
    "tietBatDau" INTEGER NOT NULL,
    "soTiet" INTEGER NOT NULL,
    "diaDiem" TEXT,

    CONSTRAINT "KhungTietTuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NgayNghi" (
    "id" TEXT NOT NULL,
    "lichTrinhId" TEXT NOT NULL,
    "ngay" TIMESTAMP(3) NOT NULL,
    "ghiChu" TEXT,

    CONSTRAINT "NgayNghi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuoiDay" (
    "id" TEXT NOT NULL,
    "lichTrinhId" TEXT NOT NULL,
    "thuTu" INTEGER NOT NULL,
    "ngayThucHien" TIMESTAMP(3) NOT NULL,
    "tietBatDau" INTEGER NOT NULL,
    "tongTiet" DOUBLE PRECISION NOT NULL,
    "lyThuyetTiet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "thucHanhTiet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "baiTapTiet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kiemTraTiet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "thietBi" TEXT,
    "ghiChu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuoiDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuoiDayNoiDung" (
    "id" TEXT NOT NULL,
    "buoiDayId" TEXT NOT NULL,
    "noiDungMucId" TEXT NOT NULL,
    "thuTu" INTEGER NOT NULL,
    "soTiet" DOUBLE PRECISION NOT NULL,
    "laTiepTuc" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BuoiDayNoiDung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiaoAn" (
    "id" TEXT NOT NULL,
    "buoiDayId" TEXT NOT NULL,
    "tenBai" TEXT NOT NULL,
    "kienThuc" TEXT,
    "kyNang" TEXT,
    "nangLucTuChu" TEXT,
    "doDungThietBi" TEXT,
    "hinhThucToChuc" TEXT,
    "noiDungJson" TEXT NOT NULL,
    "trangThai" "TrangThaiGiaoAn" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiaoAn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiaoAn_buoiDayId_key" ON "GiaoAn"("buoiDayId");

-- AddForeignKey
ALTER TABLE "MonHoc" ADD CONSTRAINT "MonHoc_giaoVienId_fkey" FOREIGN KEY ("giaoVienId") REFERENCES "GiaoVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaiHoc" ADD CONSTRAINT "BaiHoc_monHocId_fkey" FOREIGN KEY ("monHocId") REFERENCES "MonHoc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoiDungMuc" ADD CONSTRAINT "NoiDungMuc_baiHocId_fkey" FOREIGN KEY ("baiHocId") REFERENCES "BaiHoc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoiDungMuc" ADD CONSTRAINT "NoiDungMuc_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NoiDungMuc"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LichTrinhGiangDay" ADD CONSTRAINT "LichTrinhGiangDay_lopId_fkey" FOREIGN KEY ("lopId") REFERENCES "Lop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichTrinhGiangDay" ADD CONSTRAINT "LichTrinhGiangDay_monHocId_fkey" FOREIGN KEY ("monHocId") REFERENCES "MonHoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichTrinhGiangDay" ADD CONSTRAINT "LichTrinhGiangDay_giaoVienId_fkey" FOREIGN KEY ("giaoVienId") REFERENCES "GiaoVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KhungTietTuan" ADD CONSTRAINT "KhungTietTuan_lichTrinhId_fkey" FOREIGN KEY ("lichTrinhId") REFERENCES "LichTrinhGiangDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NgayNghi" ADD CONSTRAINT "NgayNghi_lichTrinhId_fkey" FOREIGN KEY ("lichTrinhId") REFERENCES "LichTrinhGiangDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuoiDay" ADD CONSTRAINT "BuoiDay_lichTrinhId_fkey" FOREIGN KEY ("lichTrinhId") REFERENCES "LichTrinhGiangDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuoiDayNoiDung" ADD CONSTRAINT "BuoiDayNoiDung_buoiDayId_fkey" FOREIGN KEY ("buoiDayId") REFERENCES "BuoiDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuoiDayNoiDung" ADD CONSTRAINT "BuoiDayNoiDung_noiDungMucId_fkey" FOREIGN KEY ("noiDungMucId") REFERENCES "NoiDungMuc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiaoAn" ADD CONSTRAINT "GiaoAn_buoiDayId_fkey" FOREIGN KEY ("buoiDayId") REFERENCES "BuoiDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
