"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  phanTichMauGiaoAnTuDocx,
  phanTichMauGiaoAnTuPdf,
} from "@/lib/giaoanmau/import";
import type { KhungMucMau } from "@/lib/giaoan/schema";

export type TrangThaiPhanTichMau = {
  data: KhungMucMau[] | null;
  tenFile: string | null;
  error: string | null;
};

export async function phanTichFileMauGiaoAn(
  _prevState: TrangThaiPhanTichMau,
  formData: FormData
): Promise<TrangThaiPhanTichMau> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { data: null, tenFile: null, error: "Vui lòng chọn một file (.docx hoặc .pdf)" };
  }

  const ten = file.name.toLowerCase();

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (ten.endsWith(".docx")) {
      const data = await phanTichMauGiaoAnTuDocx(buffer);
      return { data, tenFile: file.name, error: null };
    }

    if (ten.endsWith(".pdf")) {
      const data = await phanTichMauGiaoAnTuPdf(buffer);
      return { data, tenFile: file.name, error: null };
    }

    return { data: null, tenFile: null, error: "Chỉ hỗ trợ file Word (.docx) hoặc PDF (.pdf)" };
  } catch (e) {
    return {
      data: null,
      tenFile: null,
      error:
        e instanceof Error
          ? `Lỗi khi phân tích file: ${e.message}`
          : "Lỗi không xác định khi phân tích file",
    };
  }
}

export async function luuMauGiaoAn(formData: FormData) {
  const monHocId = String(formData.get("monHocId") ?? "");
  const tenFile = String(formData.get("tenFile") ?? "").trim() || null;
  const raw = String(formData.get("duLieuJson") ?? "");
  if (!monHocId) throw new Error("Thiếu môn học");
  if (!raw) throw new Error("Không có dữ liệu để lưu");

  const khungMuc = JSON.parse(raw) as KhungMucMau[];

  await prisma.monHoc.update({
    where: { id: monHocId },
    data: {
      mauGiaoAnTenFile: tenFile,
      mauGiaoAnCauTrucJson: JSON.stringify(khungMuc),
    },
  });

  revalidatePath(`/chuong-trinh/${monHocId}`);
  redirect(`/chuong-trinh/${monHocId}`);
}

export async function xoaMauGiaoAn(formData: FormData) {
  const monHocId = String(formData.get("monHocId") ?? "");
  if (!monHocId) throw new Error("Thiếu môn học");

  await prisma.monHoc.update({
    where: { id: monHocId },
    data: { mauGiaoAnTenFile: null, mauGiaoAnCauTrucJson: null },
  });

  revalidatePath(`/chuong-trinh/${monHocId}`);
}
