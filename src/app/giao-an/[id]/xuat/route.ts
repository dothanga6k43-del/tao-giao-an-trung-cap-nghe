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

  const hangCoDinh = (
    stt: string,
    tieuDe: string,
    gv: string,
    hs: string,
    phut: number
  ) =>
    new TableRow({
      children: [
        oO(stt, { width: 6 }),
        oO(tieuDe, { width: 30, bold: true }),
        oO(gv, { width: 27 }),
        oO(hs, { width: 27 }),
        oO(`${phut} phút`, { width: 10 }),
      ],
    });

  const hangGiaiQuyet = noiDung.giaiQuyetVanDe.map((m) =>
    new TableRow({
      children: [
        oO("", { width: 6 }),
        oO(`${m.tieuDe}\n${m.noiDung}`, { width: 30 }),
        oO(m.hoatDongGV, { width: 27 }),
        oO(m.hoatDongHS, { width: 27 }),
        oO(`${m.thoiGianPhut} phút`, { width: 10 }),
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
              hangCoDinh(
                "1",
                noiDung.danNhap.tieuDe || "Dẫn nhập",
                noiDung.danNhap.hoatDongGV,
                noiDung.danNhap.hoatDongHS,
                noiDung.danNhap.thoiGianPhut
              ),
              hangCoDinh(
                "2",
                noiDung.gioiThieuChuDe.tieuDe || "Giới thiệu chủ đề",
                noiDung.gioiThieuChuDe.hoatDongGV,
                noiDung.gioiThieuChuDe.hoatDongHS,
                noiDung.gioiThieuChuDe.thoiGianPhut
              ),
              new TableRow({
                children: [
                  oO("3", { width: 6 }),
                  oO("Giải quyết vấn đề", { width: 30, bold: true }),
                  oO("", { width: 27 }),
                  oO("", { width: 27 }),
                  oO(
                    `${noiDung.giaiQuyetVanDe.reduce((s, m) => s + m.thoiGianPhut, 0)} phút`,
                    { width: 10 }
                  ),
                ],
              }),
              ...hangGiaiQuyet,
              hangCoDinh(
                "4",
                noiDung.ketThucVanDe.tieuDe || "Kết thúc vấn đề",
                noiDung.ketThucVanDe.hoatDongGV,
                noiDung.ketThucVanDe.hoatDongHS,
                noiDung.ketThucVanDe.thoiGianPhut
              ),
              hangCoDinh(
                "5",
                noiDung.huongDanTuHoc.tieuDe || "Hướng dẫn tự học",
                noiDung.huongDanTuHoc.hoatDongGV,
                noiDung.huongDanTuHoc.hoatDongHS,
                noiDung.huongDanTuHoc.thoiGianPhut
              ),
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
