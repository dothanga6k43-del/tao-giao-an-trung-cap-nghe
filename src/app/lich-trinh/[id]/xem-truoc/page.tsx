import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TrangXemTruocWord from "@/components/TrangXemTruocWord";

function formatNgay(d: Date) {
  return new Date(d).toLocaleDateString("vi-VN");
}

export default async function LichTrinhXemTruocPage(
  props: PageProps<"/lich-trinh/[id]/xem-truoc">
) {
  const { id } = await props.params;

  const lichTrinh = await prisma.lichTrinhGiangDay.findUnique({
    where: { id },
    include: {
      lop: true,
      monHoc: true,
      giaoVien: true,
      buoiDay: {
        orderBy: { thuTu: "asc" },
        include: {
          noiDung: {
            orderBy: { thuTu: "asc" },
            include: { noiDungMuc: { include: { baiHoc: true } } },
          },
        },
      },
    },
  });

  if (!lichTrinh) notFound();

  const tongTiet = lichTrinh.buoiDay.reduce((s, b) => s + b.tongTiet, 0);
  const tongLT = lichTrinh.buoiDay.reduce((s, b) => s + b.lyThuyetTiet, 0);
  const tongTH = lichTrinh.buoiDay.reduce((s, b) => s + b.thucHanhTiet, 0);
  const tongKT = lichTrinh.buoiDay.reduce((s, b) => s + b.kiemTraTiet, 0);

  return (
    <TrangXemTruocWord
      backHref={`/lich-trinh/${lichTrinh.id}`}
      backLabel={`${lichTrinh.monHoc.tenMonHoc} · ${lichTrinh.lop.tenLop}`}
    >
      <p className="text-center font-bold text-[16px] uppercase">
        Lịch trình giảng dạy
      </p>
      <p className="text-center mb-6">
        Môn học: <span className="font-bold">{lichTrinh.monHoc.tenMonHoc}</span>
      </p>

      <table className="mt-2" style={{ border: "none" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", border: "none", padding: "2px 0" }}>
              Lớp: <span className="font-bold">{lichTrinh.lop.tenLop}</span>
            </td>
            <td style={{ width: "50%", border: "none", padding: "2px 0" }}>
              Giáo viên: <span className="font-bold">{lichTrinh.giaoVien?.hoTen ?? ""}</span>
            </td>
          </tr>
          <tr>
            <td style={{ border: "none", padding: "2px 0" }}>
              Học kỳ: {lichTrinh.hocKy ?? ""}
            </td>
            <td style={{ border: "none", padding: "2px 0" }}>
              Ngày bắt đầu: {formatNgay(lichTrinh.ngayBatDau)}
            </td>
          </tr>
          <tr>
            <td style={{ border: "none", padding: "2px 0" }}>
              Số phút/tiết: {lichTrinh.soPhutMoiTiet}
            </td>
            <td style={{ border: "none", padding: "2px 0" }}>
              Tổng: {lichTrinh.buoiDay.length} buổi · {tongTiet} tiết (LT {tongLT} · TH{" "}
              {tongTH} · KT {tongKT})
            </td>
          </tr>
        </tbody>
      </table>

      <table className="mt-6">
        <thead>
          <tr>
            <th style={{ width: "6%" }}>Buổi</th>
            <th style={{ width: "12%" }}>Ngày thực hiện</th>
            <th style={{ width: "48%" }}>Nội dung</th>
            <th style={{ width: "18%" }}>Số tiết</th>
            <th style={{ width: "16%" }}>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {lichTrinh.buoiDay.map((b) => {
            const theoBai = new Map<string, { tenBai: string; muc: string[] }>();
            for (const nd of b.noiDung) {
              const bai = nd.noiDungMuc.baiHoc;
              if (!theoBai.has(bai.id)) {
                theoBai.set(bai.id, { tenBai: bai.tenBai, muc: [] });
              }
              theoBai
                .get(bai.id)!
                .muc.push(nd.noiDungMuc.tieuDe + (nd.laTiepTuc ? " (Tiếp)" : ""));
            }

            return (
              <tr key={b.id}>
                <td>{b.thuTu}</td>
                <td>{formatNgay(b.ngayThucHien)}</td>
                <td>
                  {Array.from(theoBai.values()).map((v, idx) => (
                    <p key={idx}>
                      <span className="font-bold">{v.tenBai}:</span> {v.muc.join("; ")}
                    </p>
                  ))}
                </td>
                <td>
                  {b.tongTiet} tiết (LT {b.lyThuyetTiet} · TH {b.thucHanhTiet} · KT{" "}
                  {b.kiemTraTiet})
                </td>
                <td className="whitespace-pre-line">
                  {[b.thietBi, b.ghiChu].filter(Boolean).join("\n")}
                </td>
              </tr>
            );
          })}
          {lichTrinh.buoiDay.length === 0 && (
            <tr>
              <td colSpan={5}>Chưa có buổi dạy nào.</td>
            </tr>
          )}
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
              <p className="mt-10">{lichTrinh.giaoVien?.hoTen ?? ""}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </TrangXemTruocWord>
  );
}
