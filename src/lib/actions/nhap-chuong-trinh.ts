"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  docHtmlTuDocx,
  phanTichChuongTrinhBangAI,
  type ChuongTrinhTrichXuat,
} from "@/lib/chuongtrinh/import";

export type TrangThaiPhanTich = {
  data: ChuongTrinhTrichXuat | null;
  error: string | null;
};

export async function phanTichFileWord(
  _prevState: TrangThaiPhanTich,
  formData: FormData
): Promise<TrangThaiPhanTich> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { data: null, error: "Vui lòng chọn một file .docx" };
  }
  if (!file.name.toLowerCase().endsWith(".docx")) {
    return { data: null, error: "Chỉ hỗ trợ file .docx (Word)" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const html = await docHtmlTuDocx(buffer);
    if (!html.trim()) {
      return { data: null, error: "Không đọc được nội dung từ file này" };
    }
    const data = await phanTichChuongTrinhBangAI(html);
    return { data, error: null };
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

export async function luuChuongTrinhTuFile(formData: FormData) {
  const raw = String(formData.get("duLieuJson") ?? "");
  const giaoVienId = String(formData.get("giaoVienId") ?? "").trim() || null;
  if (!raw) throw new Error("Không có dữ liệu để lưu");

  const data = JSON.parse(raw) as ChuongTrinhTrichXuat;

  const monId = await prisma.$transaction(async (tx) => {
    const mon = await tx.monHoc.create({
      data: {
        tenMonHoc: data.tenMonHoc,
        maMonHoc: data.maMonHoc,
        tongSoGio: data.tongSoGio,
        lyThuyetGio: data.lyThuyetGio,
        thucHanhGio: data.thucHanhGio,
        kiemTraGio: data.kiemTraGio,
        viTriTinhChat: data.viTriTinhChat,
        mucTieu: data.mucTieu,
        dieuKienThucHien: data.dieuKienThucHien,
        phuongPhapDanhGia: data.phuongPhapDanhGia,
        taiLieuThamKhao: data.taiLieuThamKhao,
        giaoVienId,
      },
    });

    for (const [baiIdx, bai] of data.baiHoc.entries()) {
      const baiRow = await tx.baiHoc.create({
        data: {
          monHocId: mon.id,
          thuTu: bai.thuTu || baiIdx + 1,
          tenBai: bai.tenBai,
          tongSoGio: bai.tongSoGio,
          lyThuyetGio: bai.lyThuyetGio,
          thucHanhGio: bai.thucHanhGio,
          kiemTraGio: bai.kiemTraGio,
          mucTieu: bai.mucTieu,
        },
      });

      for (const [mucIdx, muc] of bai.noiDungMuc.entries()) {
        const chaRow = await tx.noiDungMuc.create({
          data: {
            baiHocId: baiRow.id,
            thuTu: mucIdx + 1,
            tieuDe: muc.tieuDe,
            loai: muc.loai,
            thoiGianTiet: muc.thoiGianTiet,
          },
        });

        for (const [conIdx, con] of (muc.children ?? []).entries()) {
          await tx.noiDungMuc.create({
            data: {
              baiHocId: baiRow.id,
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

    return mon.id;
  });

  revalidatePath("/chuong-trinh");
  revalidatePath("/lich-trinh/moi");
  redirect(`/chuong-trinh/${monId}`);
}
