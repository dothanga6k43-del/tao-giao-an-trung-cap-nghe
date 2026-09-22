"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function taoLop(formData: FormData) {
  const tenLop = String(formData.get("tenLop") ?? "").trim();
  const khoa = String(formData.get("khoa") ?? "").trim();
  const namThuRaw = String(formData.get("namThu") ?? "").trim();
  if (!tenLop) throw new Error("Vui lòng nhập tên lớp");

  await prisma.lop.create({
    data: {
      tenLop,
      khoa: khoa || null,
      namThu: namThuRaw ? Number(namThuRaw) : null,
    },
  });

  revalidatePath("/lop");
  redirect("/lop");
}

export async function xoaLop(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.lop.delete({ where: { id } });
  revalidatePath("/lop");
}
