"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { soanGiaoAnBangAI } from "@/lib/giaoan/generate";
import { parseNoiDungGiaoAn, type NoiDungGiaoAn, type MucGiaoAn } from "@/lib/giaoan/schema";

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

const KHOA_CO_DINH = [
  "danNhap",
  "gioiThieuChuDe",
  "ketThucVanDe",
  "huongDanTuHoc",
] as const;
type KhoaCoDinh = (typeof KHOA_CO_DINH)[number];

function laKhoaCoDinh(v: string): v is KhoaCoDinh {
  return (KHOA_CO_DINH as readonly string[]).includes(v);
}

export async function suaMucCoDinh(formData: FormData) {
  const id = String(formData.get("id"));
  const khoa = String(formData.get("khoa") ?? "");
  if (!laKhoaCoDinh(khoa)) throw new Error("Mục không hợp lệ");

  const giaoAn = await prisma.giaoAn.findUniqueOrThrow({ where: { id } });
  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);

  const muc: MucGiaoAn = {
    tieuDe: String(formData.get("tieuDe") ?? "").trim(),
    thoiGianPhut: Number(formData.get("thoiGianPhut") ?? 0),
    hoatDongGV: String(formData.get("hoatDongGV") ?? "").trim(),
    hoatDongHS: String(formData.get("hoatDongHS") ?? "").trim(),
  };
  noiDung[khoa] = muc;

  await prisma.giaoAn.update({
    where: { id },
    data: { noiDungJson: JSON.stringify(noiDung) },
  });
  revalidatePath(`/giao-an/${id}`);
}

export async function suaMucGiaiQuyet(formData: FormData) {
  const id = String(formData.get("id"));
  const index = Number(formData.get("index"));

  const giaoAn = await prisma.giaoAn.findUniqueOrThrow({ where: { id } });
  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);
  if (!noiDung.giaiQuyetVanDe[index]) throw new Error("Mục không tồn tại");

  noiDung.giaiQuyetVanDe[index] = {
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

export async function themMucGiaiQuyet(formData: FormData) {
  const id = String(formData.get("id"));
  const giaoAn = await prisma.giaoAn.findUniqueOrThrow({ where: { id } });
  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);

  noiDung.giaiQuyetVanDe.push({
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

export async function xoaMucGiaiQuyet(formData: FormData) {
  const id = String(formData.get("id"));
  const index = Number(formData.get("index"));
  const giaoAn = await prisma.giaoAn.findUniqueOrThrow({ where: { id } });
  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);
  noiDung.giaiQuyetVanDe.splice(index, 1);

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
