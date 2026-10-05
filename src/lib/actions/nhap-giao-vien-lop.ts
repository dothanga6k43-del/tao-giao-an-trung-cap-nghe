"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  phanTichGiaoVienTuExcel,
  phanTichLopTuExcel,
  type GiaoVienTuExcel,
  type LopTuExcel,
} from "@/lib/giaovien-lop/import";
import { dienGiaiLoiAI } from "@/lib/dien-giai-loi-ai";

export type TrangThaiPhanTichGiaoVien = {
  data: GiaoVienTuExcel[] | null;
  error: string | null;
};

export type TrangThaiPhanTichLop = {
  data: LopTuExcel[] | null;
  error: string | null;
};

function layFileExcel(formData: FormData): File | null {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return null;
  const ten = file.name.toLowerCase();
  if (!ten.endsWith(".xlsx") && !ten.endsWith(".xls")) return null;
  return file;
}

export async function phanTichFileGiaoVien(
  _prevState: TrangThaiPhanTichGiaoVien,
  formData: FormData
): Promise<TrangThaiPhanTichGiaoVien> {
  const file = layFileExcel(formData);
  if (!file) {
    return { data: null, error: "Vui lòng chọn một file Excel (.xlsx)" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await phanTichGiaoVienTuExcel(buffer);
    if (data.length === 0) {
      return {
        data: null,
        error:
          "Không đọc được dòng nào có họ tên. Hãy đảm bảo file có cột tiêu đề (ví dụ \"Họ tên\", \"Số điện thoại\").",
      };
    }
    return { data, error: null };
  } catch (e) {
    return { data: null, error: dienGiaiLoiAI(e, "Lỗi khi đọc file") };
  }
}

export async function luuGiaoVienTuFile(formData: FormData) {
  const raw = String(formData.get("duLieuJson") ?? "");
  if (!raw) throw new Error("Không có dữ liệu để lưu");
  const data = JSON.parse(raw) as GiaoVienTuExcel[];

  const hienCo = await prisma.giaoVien.findMany({ select: { hoTen: true } });
  const tenHienCo = new Set(hienCo.map((g) => g.hoTen.trim().toLowerCase()));

  const moi = data.filter((gv) => !tenHienCo.has(gv.hoTen.trim().toLowerCase()));
  const soTrung = data.length - moi.length;

  if (moi.length > 0) {
    await prisma.giaoVien.createMany({
      data: moi.map((gv) => ({ hoTen: gv.hoTen, soDienThoai: gv.soDienThoai })),
    });
  }

  revalidatePath("/giao-vien");
  revalidatePath("/lich-trinh/moi");
  const thamSo = `?daThem=${moi.length}${soTrung > 0 ? `&boQua=${soTrung}` : ""}`;
  redirect(`/giao-vien${thamSo}`);
}

export async function phanTichFileLop(
  _prevState: TrangThaiPhanTichLop,
  formData: FormData
): Promise<TrangThaiPhanTichLop> {
  const file = layFileExcel(formData);
  if (!file) {
    return { data: null, error: "Vui lòng chọn một file Excel (.xlsx)" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await phanTichLopTuExcel(buffer);
    if (data.length === 0) {
      return {
        data: null,
        error:
          "Không đọc được dòng nào có tên lớp. Hãy đảm bảo file có cột tiêu đề (ví dụ \"Tên lớp\", \"Khoa\", \"Năm thứ\").",
      };
    }
    return { data, error: null };
  } catch (e) {
    return { data: null, error: dienGiaiLoiAI(e, "Lỗi khi đọc file") };
  }
}

export async function luuLopTuFile(formData: FormData) {
  const raw = String(formData.get("duLieuJson") ?? "");
  if (!raw) throw new Error("Không có dữ liệu để lưu");
  const data = JSON.parse(raw) as LopTuExcel[];

  const hienCo = await prisma.lop.findMany({ select: { tenLop: true } });
  const tenHienCo = new Set(hienCo.map((l) => l.tenLop.trim().toLowerCase()));

  const moi = data.filter((l) => !tenHienCo.has(l.tenLop.trim().toLowerCase()));
  const soTrung = data.length - moi.length;

  if (moi.length > 0) {
    await prisma.lop.createMany({
      data: moi.map((l) => ({ tenLop: l.tenLop, khoa: l.khoa, namThu: l.namThu })),
    });
  }

  revalidatePath("/lop");
  revalidatePath("/lich-trinh/moi");
  const thamSo = `?daThem=${moi.length}${soTrung > 0 ? `&boQua=${soTrung}` : ""}`;
  redirect(`/lop${thamSo}`);
}
