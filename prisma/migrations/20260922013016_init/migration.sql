-- CreateTable
CREATE TABLE "GiaoVien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoTen" TEXT NOT NULL,
    "soDienThoai" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenLop" TEXT NOT NULL,
    "khoa" TEXT,
    "namThu" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MonHoc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenMonHoc" TEXT NOT NULL,
    "maMonHoc" TEXT,
    "tongSoGio" REAL NOT NULL,
    "lyThuyetGio" REAL NOT NULL,
    "thucHanhGio" REAL NOT NULL,
    "kiemTraGio" REAL NOT NULL,
    "viTriTinhChat" TEXT,
    "mucTieu" TEXT,
    "dieuKienThucHien" TEXT,
    "phuongPhapDanhGia" TEXT,
    "taiLieuThamKhao" TEXT,
    "giaoVienId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonHoc_giaoVienId_fkey" FOREIGN KEY ("giaoVienId") REFERENCES "GiaoVien" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BaiHoc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monHocId" TEXT NOT NULL,
    "thuTu" INTEGER NOT NULL,
    "tenBai" TEXT NOT NULL,
    "tongSoGio" REAL NOT NULL,
    "lyThuyetGio" REAL NOT NULL,
    "thucHanhGio" REAL NOT NULL,
    "kiemTraGio" REAL NOT NULL,
    "mucTieu" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BaiHoc_monHocId_fkey" FOREIGN KEY ("monHocId") REFERENCES "MonHoc" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NoiDungMuc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baiHocId" TEXT NOT NULL,
    "parentId" TEXT,
    "thuTu" INTEGER NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "loai" TEXT NOT NULL DEFAULT 'LT',
    "thoiGianTiet" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NoiDungMuc_baiHocId_fkey" FOREIGN KEY ("baiHocId") REFERENCES "BaiHoc" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NoiDungMuc_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NoiDungMuc" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "LichTrinhGiangDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lopId" TEXT NOT NULL,
    "monHocId" TEXT NOT NULL,
    "giaoVienId" TEXT,
    "hocKy" TEXT,
    "ngayBatDau" DATETIME NOT NULL,
    "soPhutMoiTiet" INTEGER NOT NULL DEFAULT 45,
    "trangThai" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LichTrinhGiangDay_lopId_fkey" FOREIGN KEY ("lopId") REFERENCES "Lop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LichTrinhGiangDay_monHocId_fkey" FOREIGN KEY ("monHocId") REFERENCES "MonHoc" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LichTrinhGiangDay_giaoVienId_fkey" FOREIGN KEY ("giaoVienId") REFERENCES "GiaoVien" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KhungTietTuan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lichTrinhId" TEXT NOT NULL,
    "thu" INTEGER NOT NULL,
    "tietBatDau" INTEGER NOT NULL,
    "soTiet" INTEGER NOT NULL,
    "diaDiem" TEXT,
    CONSTRAINT "KhungTietTuan_lichTrinhId_fkey" FOREIGN KEY ("lichTrinhId") REFERENCES "LichTrinhGiangDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NgayNghi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lichTrinhId" TEXT NOT NULL,
    "ngay" DATETIME NOT NULL,
    "ghiChu" TEXT,
    CONSTRAINT "NgayNghi_lichTrinhId_fkey" FOREIGN KEY ("lichTrinhId") REFERENCES "LichTrinhGiangDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuoiDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lichTrinhId" TEXT NOT NULL,
    "thuTu" INTEGER NOT NULL,
    "ngayThucHien" DATETIME NOT NULL,
    "tietBatDau" INTEGER NOT NULL,
    "tongTiet" REAL NOT NULL,
    "lyThuyetTiet" REAL NOT NULL DEFAULT 0,
    "thucHanhTiet" REAL NOT NULL DEFAULT 0,
    "baiTapTiet" REAL NOT NULL DEFAULT 0,
    "kiemTraTiet" REAL NOT NULL DEFAULT 0,
    "thietBi" TEXT,
    "ghiChu" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BuoiDay_lichTrinhId_fkey" FOREIGN KEY ("lichTrinhId") REFERENCES "LichTrinhGiangDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuoiDayNoiDung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buoiDayId" TEXT NOT NULL,
    "noiDungMucId" TEXT NOT NULL,
    "thuTu" INTEGER NOT NULL,
    "soTiet" REAL NOT NULL,
    "laTiepTuc" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BuoiDayNoiDung_buoiDayId_fkey" FOREIGN KEY ("buoiDayId") REFERENCES "BuoiDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BuoiDayNoiDung_noiDungMucId_fkey" FOREIGN KEY ("noiDungMucId") REFERENCES "NoiDungMuc" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiaoAn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buoiDayId" TEXT NOT NULL,
    "tenBai" TEXT NOT NULL,
    "kienThuc" TEXT,
    "kyNang" TEXT,
    "nangLucTuChu" TEXT,
    "doDungThietBi" TEXT,
    "hinhThucToChuc" TEXT,
    "noiDungJson" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GiaoAn_buoiDayId_fkey" FOREIGN KEY ("buoiDayId") REFERENCES "BuoiDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GiaoAn_buoiDayId_key" ON "GiaoAn"("buoiDayId");
