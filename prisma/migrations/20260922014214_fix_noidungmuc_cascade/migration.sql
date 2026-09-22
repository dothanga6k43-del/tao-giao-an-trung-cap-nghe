-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NoiDungMuc" (
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
    CONSTRAINT "NoiDungMuc_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NoiDungMuc" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
INSERT INTO "new_NoiDungMuc" ("baiHocId", "createdAt", "id", "loai", "parentId", "thoiGianTiet", "thuTu", "tieuDe", "updatedAt") SELECT "baiHocId", "createdAt", "id", "loai", "parentId", "thoiGianTiet", "thuTu", "tieuDe", "updatedAt" FROM "NoiDungMuc";
DROP TABLE "NoiDungMuc";
ALTER TABLE "new_NoiDungMuc" RENAME TO "NoiDungMuc";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
