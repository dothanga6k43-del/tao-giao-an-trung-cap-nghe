import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

export async function hashMatKhau(matKhau: string): Promise<string> {
  return bcrypt.hash(matKhau, 12);
}

export async function kiemTraMatKhau(matKhau: string, hash: string): Promise<boolean> {
  return bcrypt.compare(matKhau, hash);
}

// Bo chu/so de nham lan: 0/O, 1/l/I.
const BANG_CHU = "23456789abcdefghjkmnpqrstuvwxyz";

export function taoMatKhauNgauNhien(doDai = 10): string {
  let ket = "";
  for (let i = 0; i < doDai; i++) {
    ket += BANG_CHU[randomInt(BANG_CHU.length)];
  }
  return ket;
}
