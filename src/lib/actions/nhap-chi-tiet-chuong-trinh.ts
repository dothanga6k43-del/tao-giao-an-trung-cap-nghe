"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  docHtmlTuDocx,
  phanTichChuongTrinhBangAI,
  type ChuongTrinhTrichXuat,
} from "@/lib/chuongtrinh/import";
import { vanBanTuExcel } from "@/lib/thoikhoabieu/import";

export type TrangThaiPhanTichChiTiet = {
  data: ChuongTrinhTrichXuat | null;
  error: string | null;
};

export async function phanTichFileChiTiet(
  _prevState: TrangThaiPhanTichChiTiet,
  formData: FormData
): Promise<TrangThaiPhanTichChiTiet> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { data: null, error: "Vui lòng chọn một file (.docx hoặc .xlsx)" };
  }

  const ten = file.name.toLowerCase();

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (ten.endsWith(".docx")) {
      const html = await docHtmlTuDocx(buffer);
      if (!html.trim()) {
        return { data: null, error: "Không đọc được nội dung từ file này" };
      }
      const data = await phanTichChuongTrinhBangAI(html);
      return { data, error: null };
    }

    if (ten.endsWith(".xlsx") || ten.endsWith(".xls")) {
      const noiDung = await vanBanTuExcel(buffer);
      if (!noiDung.trim()) {
        return { data: null, error: "Không đọc được nội dung từ file này" };
      }
      const data = await phanTichChuongTrinhBangAI(noiDung);
      return { data, error: null };
    }

    return { data: null, error: "Chỉ hỗ trợ file Word (.docx) hoặc Excel (.xlsx)" };
  } catch (e) {
    return {
      data: null,
      error:
        e instanceof Error
          ? `Lỗi khi phân tích file: ${e.message}`
          : "Lỗi không xác định khi phân tích file",
    };
  }
}

export async function luuChiTietTuFile(formData: FormData) {
  const monHocId = String(formData.get("monHocId") ?? "");
  const raw = String(formData.get("duLieuJson") ?? "");
  if (!monHocId) throw new Error("Thiếu môn học");
  if (!raw) throw new Error("Không có dữ liệu để lưu");

  const data = JSON.parse(raw) as ChuongTrinhTrichXuat;

  await prisma.$transaction(async (tx) => {
    const baiHienCo = await tx.baiHoc.findMany({ where: { monHocId } });
    let soThuTuKeTiep = baiHienCo.length + 1;

    for (const bai of data.baiHoc) {
      const trung = baiHienCo.find(
        (b) => b.tenBai.trim().toLowerCase() === bai.tenBai.trim().toLowerCase()
      );

      const baiHocId = trung
        ? trung.id
        : (
            await tx.baiHoc.create({
              data: {
                monHocId,
                thuTu: soThuTuKeTiep++,
                tenBai: bai.tenBai,
                tongSoGio: bai.tongSoGio,
                lyThuyetGio: bai.lyThuyetGio,
                thucHanhGio: bai.thucHanhGio,
                kiemTraGio: bai.kiemTraGio,
                mucTieu: bai.mucTieu,
              },
            })
          ).id;

      if (trung) {
        await tx.baiHoc.update({
          where: { id: trung.id },
          data: {
            tongSoGio: bai.tongSoGio,
            lyThuyetGio: bai.lyThuyetGio,
            thucHanhGio: bai.thucHanhGio,
            kiemTraGio: bai.kiemTraGio,
            mucTieu: bai.mucTieu ?? trung.mucTieu,
          },
        });
        // Xoa noi dung chi tiet cu de thay bang du lieu moi tu file
        await tx.noiDungMuc.deleteMany({ where: { baiHocId } });
      }

      for (const [mucIdx, muc] of bai.noiDungMuc.entries()) {
        const chaRow = await tx.noiDungMuc.create({
          data: {
            baiHocId,
            thuTu: mucIdx + 1,
            tieuDe: muc.tieuDe,
            loai: muc.loai,
            thoiGianTiet: muc.thoiGianTiet,
          },
        });

        for (const [conIdx, con] of (muc.children ?? []).entries()) {
          await tx.noiDungMuc.create({
            data: {
              baiHocId,
              parentId: chaRow.id,
              thuTu: conIdx + 1,
              tieuDe: con.tieuDe,
              loai: con.loai,
              thoiGianTiet: con.thoiGianTiet,
            },
          });
        }
      }
    }
  });

  revalidatePath(`/chuong-trinh/${monHocId}`);
  redirect(`/chuong-trinh/${monHocId}`);
}
