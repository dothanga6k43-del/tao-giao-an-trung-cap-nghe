import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseNoiDungGiaoAn } from "@/lib/giaoan/schema";
import { layHangBangNoiDung } from "@/lib/giaoan/bang-noi-dung";
import TrangXemTruocWord from "@/components/TrangXemTruocWord";
import { layTaiKhoanHienTai } from "@/lib/auth/session";
import { yeuCauQuyenXem } from "@/lib/auth/pham-vi";

export default async function GiaoAnXemTruocPage(
  props: PageProps<"/giao-an/[id]/xem-truoc">
) {
  const { id } = await props.params;

  const giaoAn = await prisma.giaoAn.findUnique({
    where: { id },
    include: {
      buoiDay: {
        include: { lichTrinh: { include: { lop: true, monHoc: true, giaoVien: true } } },
      },
    },
  });

  if (!giaoAn) notFound();

  const hienTai = await layTaiKhoanHienTai();
  yeuCauQuyenXem(hienTai, giaoAn.buoiDay.lichTrinh.giaoVienId);

  const noiDung = parseNoiDungGiaoAn(giaoAn.noiDungJson);
  const hang = layHangBangNoiDung(noiDung);
  const giaoVien = giaoAn.buoiDay.lichTrinh.giaoVien;

  return (
    <TrangXemTruocWord
      backHref={`/giao-an/${giaoAn.id}`}
      backLabel={giaoAn.tenBai}
      exportHref={`/giao-an/${giaoAn.id}/xuat`}
    >
      <p>Tên bài trình giảng:</p>
      <p className="text-center font-bold text-[15px] mt-2 mb-6 uppercase">
        {giaoAn.tenBai}
      </p>

      <p className="font-bold">MỤC TIÊU CỦA BÀI:</p>
      <p>Sau khi học xong bài này người học có khả năng:</p>
      <p className="whitespace-pre-line">- Kiến thức: {giaoAn.kienThuc ?? ""}</p>
      <p className="whitespace-pre-line">- Kỹ năng: {giaoAn.kyNang ?? ""}</p>
      <p className="whitespace-pre-line">
        - Năng lực tự chủ và tự chịu trách nhiệm: {giaoAn.nangLucTuChu ?? ""}
      </p>

      <p className="font-bold mt-4">ĐỒ DÙNG VÀ TRANG THIẾT BỊ DẠY HỌC:</p>
      <p className="whitespace-pre-line">{giaoAn.doDungThietBi ?? ""}</p>

      <p className="font-bold mt-4">HÌNH THỨC TỔ CHỨC DẠY HỌC:</p>
      <p className="whitespace-pre-line">{giaoAn.hinhThucToChuc ?? ""}</p>

      <p className="font-bold mt-4">
        I. ỔN ĐỊNH LỚP HỌC: <span className="font-normal float-right">Thời gian: 01 phút</span>
      </p>
      <p>- Kiểm tra sĩ số học sinh.</p>
      <p>- Ổn định tổ chức cho buổi học.</p>

      <p className="font-bold mt-6">II. THỰC HIỆN BÀI HỌC:</p>
      <table className="mt-2">
        <thead>
          <tr>
            <th style={{ width: "6%" }}>TT</th>
            <th style={{ width: "30%" }}>NỘI DUNG</th>
            <th style={{ width: "27%" }}>HOẠT ĐỘNG CỦA GIÁO VIÊN</th>
            <th style={{ width: "27%" }}>HOẠT ĐỘNG CỦA HỌC SINH</th>
            <th style={{ width: "10%" }}>THỜI GIAN</th>
          </tr>
        </thead>
        <tbody>
          {hang.map((h, idx) => (
            <tr key={idx}>
              <td>{h.stt}</td>
              <td className={`whitespace-pre-line ${h.boldTieuDe ? "font-bold" : ""}`}>
                {h.tieuDe}
              </td>
              <td className="whitespace-pre-line">{h.gv}</td>
              <td className="whitespace-pre-line">{h.hs}</td>
              <td>{h.phut} phút</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="mt-10" style={{ border: "none" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", textAlign: "center", border: "none" }}>
              <p className="font-bold">TRƯỞNG KHOA</p>
            </td>
            <td style={{ width: "50%", textAlign: "center", border: "none" }}>
              <p>Thái Nguyên, ngày...... tháng...... năm......</p>
              <p className="font-bold">GIÁO VIÊN</p>
              <p className="mt-10">{giaoVien?.hoTen ?? ""}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </TrangXemTruocWord>
  );
}
