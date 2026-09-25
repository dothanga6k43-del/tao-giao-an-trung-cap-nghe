"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  docHtmlTuDocx,
  vanBanTuExcel,
  phanTichThoiKhoaBieuTuAnh,
  phanTichThoiKhoaBieuTuVanBan,
  type ThoiKhoaBieuTrichXuat,
} from "@/lib/thoikhoabieu/import";

export type TrangThaiPhanTichTKB = {
  data: ThoiKhoaBieuTrichXuat | null;
  error: string | null;
};

const ANH_MIME: Record<string, "image/png" | "image/jpeg" | "image/webp" | "image/gif"> = {
  "image/png": "image/png",
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/webp": "image/webp",
  "image/gif": "image/gif",
};

export async function phanTichFileThoiKhoaBieu(
  _prevState: TrangThaiPhanTichTKB,
  formData: FormData
): Promise<TrangThaiPhanTichTKB> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { data: null, error: "Vui lòng chọn một file (ảnh, .xlsx hoặc .docx)" };
  }

  const ten = file.name.toLowerCase();

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (ANH_MIME[file.type] || /\.(png|jpe?g|webp|gif)$/.test(ten)) {
      const mediaType = ANH_MIME[file.type] || (ten.endsWith(".png")
        ? "image/png"
        : ten.endsWith(".webp")
          ? "image/webp"
          : ten.endsWith(".gif")
            ? "image/gif"
            : "image/jpeg");
      const base64 = buffer.toString("base64");
      const data = await phanTichThoiKhoaBieuTuAnh(base64, mediaType);
      return { data, error: null };
    }

    if (ten.endsWith(".xlsx") || ten.endsWith(".xls")) {
      const noiDung = await vanBanTuExcel(buffer);
      if (!noiDung.trim()) {
        return { data: null, error: "Không đọc được nội dung từ file này" };
      }
      const data = await phanTichThoiKhoaBieuTuVanBan(noiDung);
      return { data, error: null };
    }

    if (ten.endsWith(".docx")) {
      const html = await docHtmlTuDocx(buffer);
      if (!html.trim()) {
        return { data: null, error: "Không đọc được nội dung từ file này" };
      }
      const data = await phanTichThoiKhoaBieuTuVanBan(html);
      return { data, error: null };
    }

    return {
      data: null,
      error: "Chỉ hỗ trợ file ảnh (png/jpg/webp), Excel (.xlsx) hoặc Word (.docx)",
    };
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

export async function luuThoiKhoaBieuTuFile(formData: FormData) {
  const raw = String(formData.get("duLieuJson") ?? "");
  if (!raw) throw new Error("Không có dữ liệu để lưu");

  const data = JSON.parse(raw) as ThoiKhoaBieuTrichXuat;

  const id = await prisma.$transaction(async (tx) => {
    const tkb = await tx.thoiKhoaBieu.create({
      data: {
        tieuDe: data.tieuDe,
        tuanThu: data.tuanThu,
        ngayBatDau: data.ngayBatDau ? new Date(data.ngayBatDau) : null,
        ngayKetThuc: data.ngayKetThuc ? new Date(data.ngayKetThuc) : null,
        buoiHoc: data.buoiHoc,
      },
    });

    const dong = data.lopHoc.flatMap((lopItem) =>
      lopItem.tietBlocks.flatMap((khoi) =>
        khoi.cacNgay.map((ngay) => ({
          thoiKhoaBieuId: tkb.id,
          lop: lopItem.lop,
          diaDiem: lopItem.diaDiem,
          tietBlock: khoi.tietBlock,
          thu: ngay.thu,
          monHoc: ngay.monHoc,
          soGioLuyKe: ngay.soGioLuyKe,
          giaoVien: ngay.giaoVien,
          ghiChu: ngay.ghiChu ?? lopItem.ghiChuTongHop,
        }))
      )
    );

    if (dong.length > 0) {
      await tx.thoiKhoaBieuDong.createMany({ data: dong });
    }

    return tkb.id;
  });

  revalidatePath("/thoi-khoa-bieu");
  redirect(`/thoi-khoa-bieu/${id}`);
}

export async function xoaThoiKhoaBieu(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Thiếu id");
  await prisma.thoiKhoaBieu.delete({ where: { id } });
  revalidatePath("/thoi-khoa-bieu");
  redirect("/thoi-khoa-bieu");
}
