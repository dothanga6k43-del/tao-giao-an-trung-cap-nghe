// Doc file Excel danh sach giao vien / lop hoc. Du lieu don gian (vai cot
// co dinh) nen doc truc tiep bang exceljs, khong can goi AI.

import ExcelJS from "exceljs";

function chuanHoaTieuDeCot(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function oGiaTriO(cell: ExcelJS.Cell): string {
  const v = cell.value as unknown;
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && "text" in (v as Record<string, unknown>)) {
    return String((v as { text: unknown }).text);
  }
  if (typeof v === "object" && "richText" in (v as Record<string, unknown>)) {
    const rt = (v as { richText: { text: string }[] }).richText;
    return rt.map((r) => r.text).join("");
  }
  if (typeof v === "object" && "result" in (v as Record<string, unknown>)) {
    return String((v as { result: unknown }).result ?? "");
  }
  return String(v).trim();
}

async function docBangExcel(
  buffer: Buffer
): Promise<{ header: string[]; rows: string[][] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return { header: [], rows: [] };

  // Tim hang tieu de: hang dau tien co it nhat mot o khac rong.
  let hangTieuDeIdx = 1;
  for (let i = 1; i <= Math.min(sheet.rowCount, 10); i++) {
    const row = sheet.getRow(i);
    let coDuLieu = false;
    row.eachCell({ includeEmpty: true }, (cell) => {
      if (oGiaTriO(cell).trim()) coDuLieu = true;
    });
    if (coDuLieu) {
      hangTieuDeIdx = i;
      break;
    }
  }

  const header: string[] = [];
  sheet.getRow(hangTieuDeIdx).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    header[colNumber] = oGiaTriO(cell);
  });

  const rows: string[][] = [];
  for (let i = hangTieuDeIdx + 1; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    const oGia: string[] = [];
    let coDuLieu = false;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const t = oGiaTriO(cell);
      oGia[colNumber] = t;
      if (t.trim()) coDuLieu = true;
    });
    if (coDuLieu) rows.push(oGia);
  }

  return { header, rows };
}

// Khop ten cot trong file voi cac truong can, uu tien khop chinh xac truoc,
// sau do khop mot phan cho nhung truong con thieu - moi cot chi duoc dung 1 lan.
function khopCotTheoTen(
  header: string[],
  mapCot: Record<string, string[]>
): Record<string, number> {
  const chuanHoa = header.map((h) => (h ? chuanHoaTieuDeCot(h) : ""));
  const ketQua: Record<string, number> = {};
  const daDung = new Set<number>();

  for (const [truong, aliases] of Object.entries(mapCot)) {
    for (const alias of aliases) {
      const idx = chuanHoa.findIndex((h, i) => i > 0 && h === alias && !daDung.has(i));
      if (idx > 0) {
        ketQua[truong] = idx;
        daDung.add(idx);
        break;
      }
    }
  }

  for (const [truong, aliases] of Object.entries(mapCot)) {
    if (ketQua[truong] !== undefined) continue;
    for (const alias of aliases) {
      const idx = chuanHoa.findIndex((h, i) => i > 0 && h.includes(alias) && !daDung.has(i));
      if (idx > 0) {
        ketQua[truong] = idx;
        daDung.add(idx);
        break;
      }
    }
  }

  return ketQua;
}

export type GiaoVienTuExcel = { hoTen: string; soDienThoai: string | null };

export async function phanTichGiaoVienTuExcel(buffer: Buffer): Promise<GiaoVienTuExcel[]> {
  const { header, rows } = await docBangExcel(buffer);
  const cot = khopCotTheoTen(header, {
    hoTen: ["hoten", "hovaten", "tengiaovien", "ten"],
    soDienThoai: ["sodienthoai", "dienthoai", "sdt", "sodt", "phone"],
  });
  const cotTen = cot.hoTen ?? 1;

  return rows
    .map((r) => ({
      hoTen: (r[cotTen] ?? "").trim(),
      soDienThoai: cot.soDienThoai !== undefined ? (r[cot.soDienThoai] ?? "").trim() || null : null,
    }))
    .filter((r) => r.hoTen);
}

export type LopTuExcel = { tenLop: string; khoa: string | null; namThu: number | null };

export async function phanTichLopTuExcel(buffer: Buffer): Promise<LopTuExcel[]> {
  const { header, rows } = await docBangExcel(buffer);
  const cot = khopCotTheoTen(header, {
    tenLop: ["tenlop", "lop", "lophoc"],
    khoa: ["khoa"],
    namThu: ["namthu", "nam"],
  });
  const cotTen = cot.tenLop ?? 1;

  return rows
    .map((r) => {
      const namRaw = cot.namThu !== undefined ? (r[cot.namThu] ?? "").trim() : "";
      const nam = namRaw ? Number(namRaw.replace(/[^\d.]/g, "")) : NaN;
      return {
        tenLop: (r[cotTen] ?? "").trim(),
        khoa: cot.khoa !== undefined ? (r[cot.khoa] ?? "").trim() || null : null,
        namThu: Number.isFinite(nam) && nam > 0 ? nam : null,
      };
    })
    .filter((r) => r.tenLop);
}
