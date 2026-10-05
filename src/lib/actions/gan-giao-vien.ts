"use server";

// Gan lai "giao vien phu trach" cho du lieu - chi Admin duoc dung, ke ca voi
// du lieu da co chu (khong chi du lieu "mo coi"). Dung rieng cho viec gan lai
// quyen so huu, khac voi cac action sua noi dung thong thuong (von chi can
// quyen cua chinh giao vien dang so huu).

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { yeuCauAdmin } from "@/lib/auth/session";

function layGiaoVienId(formData: FormData): string | null {
  return String(formData.get("giaoVienId") ?? "").trim() || null;
}

export async function ganGiaoVienChoLop(formData: FormData) {
  await yeuCauAdmin();
  const id = String(formData.get("id"));
  await prisma.lop.update({ where: { id }, data: { giaoVienId: layGiaoVienId(formData) } });
  revalidatePath("/lop");
}

export async function ganGiaoVienChoThoiKhoaBieu(formData: FormData) {
  await yeuCauAdmin();
  const id = String(formData.get("id"));
  await prisma.thoiKhoaBieu.update({
    where: { id },
    data: { giaoVienId: layGiaoVienId(formData) },
  });
  revalidatePath("/thoi-khoa-bieu");
  revalidatePath(`/thoi-khoa-bieu/${id}`);
}

export async function ganGiaoVienChoMonHoc(formData: FormData) {
  await yeuCauAdmin();
  const id = String(formData.get("id"));
  await prisma.monHoc.update({ where: { id }, data: { giaoVienId: layGiaoVienId(formData) } });
  revalidatePath("/chuong-trinh");
  revalidatePath(`/chuong-trinh/${id}`);
}

export async function ganGiaoVienChoLichTrinh(formData: FormData) {
  await yeuCauAdmin();
  const id = String(formData.get("id"));
  await prisma.lichTrinhGiangDay.update({
    where: { id },
    data: { giaoVienId: layGiaoVienId(formData) },
  });
  revalidatePath("/lich-trinh");
  revalidatePath(`/lich-trinh/${id}`);
}
