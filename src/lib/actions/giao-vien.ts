"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function taoGiaoVien(formData: FormData) {
  const hoTen = String(formData.get("hoTen") ?? "").trim();
  const soDienThoai = String(formData.get("soDienThoai") ?? "").trim();
  if (!hoTen) throw new Error("Vui lòng nhập họ tên giáo viên");

  await prisma.giaoVien.create({
    data: { hoTen, soDienThoai: soDienThoai || null },
  });

  revalidatePath("/giao-vien");
  redirect("/giao-vien");
}

export async function xoaGiaoVien(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.giaoVien.delete({ where: { id } });
  revalidatePath("/giao-vien");
}
