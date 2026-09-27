"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { soanGiaoAnBangAI } from "@/lib/giaoan/generate";
import { parseNoiDungGiaoAn } from "@/lib/giaoan/schema";

export async function taoGiaoAnBangAI(formData: FormData) {
  const buoiDayId = String(formData.get("buoiDayId"));
  const giaoAn = await soanGiaoAnBangAI(buoiDayId);
  revalidatePath(`/giao-an/${giaoAn.id}`);
  redirect(`/giao-an/${giaoAn.id}`);
}

export async function soanLaiBangAI(formData: FormData) {
  const id = String(formData.get("id"));
  const buoiDayId = String(formData.get("buoiDayId"));
  await soanGiaoAnBangAI(buoiDayId);
  revalidatePath(`/giao-an/${id}`);
}

export async function capNhatThongTinChung(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.giaoAn.update({
    where: { id },
    data: {
      tenBai: String(formData.get("tenBai") ?? "").trim(),
      kienThuc: String(formData.get("kienThuc") ?? "").trim() || null,
      kyNang: String(formData.get("kyNang") ?? "").trim() || null,
      nangLucTuChu: String(formData.get("nangLucTuChu") ?? "").trim() || null,
      doDungThietBi: String(formData.get("doDungThietBi") ?? "").trim() || null,
      hinhThucToChuc: String(formData.get("hinhThucToChuc") ?? "").trim() || null,
    },
  });
  revalidatePath(`/giao-an/${id}`);
}

export async function suaMuc(formData: FormData) {
  const id = String(formData.get("id"));
  const khungIndex = Number(formData.get("khungIndex"));
  const mucIndex = Number(formData.get("mucIndex"));

  const giaoAn = await prisma.giaoAn.findUniqueOrThrow({ where: { id } });
  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);
  const khung = noiDung.khungMuc[khungIndex];
  if (!khung || !khung.items[mucIndex]) throw new Error("Mục không tồn tại");

  khung.items[mucIndex] = {
    tieuDe: String(formData.get("tieuDe") ?? "").trim(),
    thoiGianPhut: Number(formData.get("thoiGianPhut") ?? 0),
    noiDung: String(formData.get("noiDung") ?? "").trim(),
    hoatDongGV: String(formData.get("hoatDongGV") ?? "").trim(),
    hoatDongHS: String(formData.get("hoatDongHS") ?? "").trim(),
  };

  await prisma.giaoAn.update({
    where: { id },
    data: { noiDungJson: JSON.stringify(noiDung) },
  });
  revalidatePath(`/giao-an/${id}`);
}

export async function themMuc(formData: FormData) {
  const id = String(formData.get("id"));
  const khungIndex = Number(formData.get("khungIndex"));

  const giaoAn = await prisma.giaoAn.findUniqueOrThrow({ where: { id } });
  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);
  const khung = noiDung.khungMuc[khungIndex];
  if (!khung) throw new Error("Khung mục không tồn tại");

  khung.items.push({
    tieuDe: "Mục mới",
    thoiGianPhut: 0,
    noiDung: "",
    hoatDongGV: "",
    hoatDongHS: "",
  });

  await prisma.giaoAn.update({
    where: { id },
    data: { noiDungJson: JSON.stringify(noiDung) },
  });
  revalidatePath(`/giao-an/${id}`);
}

export async function xoaMuc(formData: FormData) {
  const id = String(formData.get("id"));
  const khungIndex = Number(formData.get("khungIndex"));
  const mucIndex = Number(formData.get("mucIndex"));

  const giaoAn = await prisma.giaoAn.findUniqueOrThrow({ where: { id } });
  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);
  const khung = noiDung.khungMuc[khungIndex];
  if (!khung) throw new Error("Khung mục không tồn tại");
  if (khung.items.length <= 1) {
    throw new Error("Không thể xóa dòng cuối cùng của một mục");
  }
  khung.items.splice(mucIndex, 1);

  await prisma.giaoAn.update({
    where: { id },
    data: { noiDungJson: JSON.stringify(noiDung) },
  });
  revalidatePath(`/giao-an/${id}`);
}

export async function hoanThienGiaoAn(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.giaoAn.update({ where: { id }, data: { trangThai: "FINAL" } });
  revalidatePath(`/giao-an/${id}`);
}

export async function moLaiGiaoAn(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.giaoAn.update({ where: { id }, data: { trangThai: "DRAFT" } });
  revalidatePath(`/giao-an/${id}`);
}

export async function xoaGiaoAn(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.giaoAn.delete({ where: { id } });
  revalidatePath("/giao-an");
  redirect("/giao-an");
}
