import { NextRequest } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  VerticalAlign,
} from "docx";
import { prisma } from "@/lib/prisma";
import { parseNoiDungGiaoAn } from "@/lib/giaoan/schema";
import { layHangBangNoiDung } from "@/lib/giaoan/bang-noi-dung";

const O_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 2, color: "999999" },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: "999999" },
  left: { style: BorderStyle.SINGLE, size: 2, color: "999999" },
  right: { style: BorderStyle.SINGLE, size: 2, color: "999999" },
};

function oChu(text: string, opts: { bold?: boolean; size?: number } = {}) {
  return new TextRun({ text, bold: opts.bold, size: opts.size });
}

function oDoan(text: string, opts: { bold?: boolean; heading?: boolean } = {}) {
  return new Paragraph({
    children: [oChu(text, { bold: opts.bold })],
    heading: opts.heading ? HeadingLevel.HEADING_2 : undefined,
    spacing: { after: 120 },
  });
}

function oO(
  text: string,
  opts: { width?: number; bold?: boolean; header?: boolean } = {}
) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    borders: O_BORDER,
    verticalAlign: VerticalAlign.TOP,
    shading: opts.header ? { fill: "F1F5F9" } : undefined,
    children: text
      .split("\n")
      .map(
        (dong) =>
          new Paragraph({
            children: [oChu(dong, { bold: opts.bold })],
          })
      ),
  });
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/giao-an/[id]/xuat">
) {
  const { id } = await ctx.params;

  const giaoAn = await prisma.giaoAn.findUnique({
    where: { id },
    include: {
      buoiDay: {
        include: { lichTrinh: { include: { lop: true, monHoc: true, giaoVien: true } } },
      },
    },
  });

  if (!giaoAn) {
    return new Response("Không tìm thấy giáo án", { status: 404 });
  }

  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);
  const giaoVien = giaoAn.buoiDay.lichTrinh.giaoVien;

  const hangKhungMuc = layHangBangNoiDung(noiDung).map(
    (h) =>
      new TableRow({
        children: [
          oO(h.stt, { width: 6 }),
          oO(h.tieuDe, { width: 30, bold: h.boldTieuDe }),
          oO(h.gv, { width: 27 }),
          oO(h.hs, { width: 27 }),
          oO(`${h.phut} phút`, { width: 10 }),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          oDoan("Tên bài trình giảng:"),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [oChu(giaoAn.tenBai.toUpperCase(), { bold: true, size: 28 })],
          }),

          oDoan("MỤC TIÊU CỦA BÀI:", { bold: true }),
          oDoan("Sau khi học xong bài này người học có khả năng:"),
          oDoan(`- Kiến thức: ${giaoAn.kienThuc ?? ""}`),
          oDoan(`- Kỹ năng: ${giaoAn.kyNang ?? ""}`),
          oDoan(`- Năng lực tự chủ và tự chịu trách nhiệm: ${giaoAn.nangLucTuChu ?? ""}`),

          oDoan("ĐỒ DÙNG VÀ TRANG THIẾT BỊ DẠY HỌC:", { bold: true }),
          oDoan(giaoAn.doDungThietBi ?? ""),

          oDoan("HÌNH THỨC TỔ CHỨC DẠY HỌC:", { bold: true }),
          oDoan(giaoAn.hinhThucToChuc ?? ""),

          oDoan("I. ỔN ĐỊNH LỚP HỌC:                              Thời gian: 01 phút", {
            bold: true,
          }),
          oDoan("- Kiểm tra sĩ số học sinh."),
          oDoan("- Ổn định tổ chức cho buổi học."),

          oDoan("II. THỰC HIỆN BÀI HỌC:", { bold: true }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  oO("TT", { width: 6, header: true, bold: true }),
                  oO("NỘI DUNG", { width: 30, header: true, bold: true }),
                  oO("HOẠT ĐỘNG CỦA GIÁO VIÊN", { width: 27, header: true, bold: true }),
                  oO("HOẠT ĐỘNG CỦA HỌC SINH", { width: 27, header: true, bold: true }),
                  oO("THỜI GIAN", { width: 10, header: true, bold: true }),
                ],
              }),
              ...hangKhungMuc,
            ],
          }),

          new Paragraph({ text: "", spacing: { before: 400 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [oChu("TRƯỞNG KHOA", { bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [oChu("Thái Nguyên, ngày...... tháng...... năm......")],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [oChu("GIÁO VIÊN", { bold: true })],
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [oChu(giaoVien?.hoTen ?? "")],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const tenFile = encodeURIComponent(`GiaoAn_${giaoAn.tenBai}.docx`);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename*=UTF-8''${tenFile}`,
    },
  });
}
