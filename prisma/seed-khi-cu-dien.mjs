// Du lieu mau that: mon "KHI CU DIEN" (MH11), lay tu chuong trinh mon hoc,
// lich trinh giang day va giao vien ban cung cap.
// Chay: node prisma/seed-khi-cu-dien.mjs
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const giaoVien = await prisma.giaoVien.create({
    data: { hoTen: "Đỗ Văn Đức Thắng", soDienThoai: "0374958991" },
  });

  const lop = await prisma.lop.create({
    data: { tenLop: "Điện CN K23", khoa: "Điện - May thời trang", namThu: 1 },
  });

  const monHoc = await prisma.monHoc.create({
    data: {
      tenMonHoc: "KHÍ CỤ ĐIỆN",
      maMonHoc: "MH11",
      tongSoGio: 31,
      lyThuyetGio: 14,
      thucHanhGio: 15,
      kiemTraGio: 2,
      giaoVienId: giaoVien.id,
      viTriTinhChat:
        "- Vị trí: Mô đun này học sau các môn học và mô đun: An toàn lao động; Mạch điện, có thể học song song với môn Vật liệu điện.\n- Tính chất: Là mô đun kỹ thuật cơ sở, thuộc các môn học đào tạo nghề bắt buộc.",
      mucTieu:
        "- Nhận dạng và phân loại được các loại khí cụ điện.\n- Trình bày được cấu tạo và nguyên lý hoạt động của các loại khí cụ điện thông dụng.\n- Tính chọn được các loại khí cụ điện theo yêu cầu của phụ tải.\n- Rèn luyện tính nghiêm túc, tỉ mỉ, chính xác trong học tập và trong thực hiện công việc.",
      dieuKienThucHien:
        "Bảng gắn các loại khí cụ điện; dây dẫn điện; đầu cốt các cỡ; bộ đồ nghề điện, cơ khí cầm tay; VOM, Tera, Ampe kìm; bộ mô hình dàn trải các loại khí cụ điện hoạt động được; PC, projector, máy chiếu vật thể ba chiều.",
      phuongPhapDanhGia:
        "Kiểm tra viết hoặc trắc nghiệm. Trọng tâm: công dụng, cấu tạo, nguyên lý, phạm vi sử dụng; tính chọn khí cụ điện theo yêu cầu kỹ thuật; lắp đặt, sử dụng, tháo lắp, xác định hư hỏng.",
      taiLieuThamKhao:
        "[1] Nguyễn Xuân Phú, Khí cụ Điện - Kết cấu, sử dụng và sửa chữa, NXB KH&KT, 2000.\n[2] Phạm Văn Chới, Bùi Tín Hữu, Khí cụ điện, NXB KHKT, 2000.",
    },
  });

  async function themBai({ thuTu, tenBai, tongSoGio, lyThuyetGio, thucHanhGio, kiemTraGio, mucTieu, dsNoiDung }) {
    const bai = await prisma.baiHoc.create({
      data: { monHocId: monHoc.id, thuTu, tenBai, tongSoGio, lyThuyetGio, thucHanhGio, kiemTraGio, mucTieu },
    });
    let thuTuMuc = 1;
    for (const nd of dsNoiDung) {
      if (nd.children) {
        const cha = await prisma.noiDungMuc.create({
          data: { baiHocId: bai.id, thuTu: thuTuMuc++, tieuDe: nd.tieuDe, loai: "LT" },
        });
        let thuTuCon = 1;
        for (const con of nd.children) {
          await prisma.noiDungMuc.create({
            data: {
              baiHocId: bai.id,
              parentId: cha.id,
              thuTu: thuTuCon++,
              tieuDe: con.tieuDe,
              loai: con.loai,
              thoiGianTiet: con.gio,
            },
          });
        }
      } else {
        await prisma.noiDungMuc.create({
          data: {
            baiHocId: bai.id,
            thuTu: thuTuMuc++,
            tieuDe: nd.tieuDe,
            loai: nd.loai,
            thoiGianTiet: nd.gio,
          },
        });
      }
    }
    return bai;
  }

  await themBai({
    thuTu: 1,
    tenBai: "Bài 1: Khái niệm và công dụng của khí cụ điện",
    tongSoGio: 1,
    lyThuyetGio: 1,
    thucHanhGio: 0,
    kiemTraGio: 0,
    mucTieu:
      "- Phân loại được các loại khí cụ điện.\n- Hiểu được cách tiếp xúc điện, cách tạo hồ quang điện và dập tắt hồ quang điện.\n- Rèn luyện tính nghiêm túc trong học tập và trong thực hiện công việc.",
    dsNoiDung: [
      { tieuDe: "1. Khái niệm về khí cụ điện (sự phát nóng, tiếp xúc điện, hồ quang điện, lực điện động)", loai: "LT", gio: 0.5 },
      { tieuDe: "2. Công dụng và phân loại khí cụ điện", loai: "LT", gio: 0.5 },
    ],
  });

  await themBai({
    thuTu: 2,
    tenBai: "Bài 2: Khí cụ điện đóng cắt",
    tongSoGio: 10,
    lyThuyetGio: 5,
    thucHanhGio: 5,
    kiemTraGio: 0,
    mucTieu:
      "- Trình bày được cấu tạo và nguyên lý hoạt động của các loại khí cụ điện đóng cắt thường dùng trong công nghiệp và dân dụng.\n- Sử dụng thành thạo các loại khí cụ điện đóng cắt, đảm bảo an toàn cho người và thiết bị theo TCVN.\n- Tháo lắp, phán đoán và sửa chữa được hư hỏng, đạt các thông số kỹ thuật và đảm bảo an toàn.\n- Rèn luyện tính cẩn thận, tỉ mỉ, nghiêm túc trong công việc.",
    dsNoiDung: [
      {
        tieuDe: "1. Cầu dao",
        children: [
          { tieuDe: "Cấu tạo, ký hiệu, nguyên lý hoạt động", loai: "LT", gio: 1 },
          { tieuDe: "Thực hành lắp đặt, đấu nối, phán đoán và sửa chữa hư hỏng", loai: "TH", gio: 1 },
        ],
      },
      {
        tieuDe: "2. Nút điều khiển",
        children: [
          { tieuDe: "Cấu tạo, ký hiệu, nguyên lý hoạt động", loai: "LT", gio: 1 },
          { tieuDe: "Thực hành lắp đặt, sửa chữa hư hỏng", loai: "TH", gio: 1 },
        ],
      },
      { tieuDe: "3. Các loại công tắc (công tắc, công tắc xoay, công tắc hành trình)", loai: "LT", gio: 1 },
      {
        tieuDe: "4. Áp-tô-mát",
        children: [
          { tieuDe: "Cấu tạo, ký hiệu, nguyên lý hoạt động, tính chọn áp-tô-mát", loai: "LT", gio: 1.5 },
          { tieuDe: "Thực hành lắp đặt, kiểm tra thông số, sửa chữa", loai: "TH", gio: 2 },
        ],
      },
      {
        tieuDe: "5. Dao cách ly",
        children: [
          { tieuDe: "Cấu tạo, nguyên lý hoạt động", loai: "LT", gio: 0.5 },
          { tieuDe: "Thực hành đấu nối, sửa chữa hư hỏng", loai: "TH", gio: 1 },
        ],
      },
    ],
  });

  await themBai({
    thuTu: 3,
    tenBai: "Bài 3: Khí cụ điện bảo vệ",
    tongSoGio: 10,
    lyThuyetGio: 4,
    thucHanhGio: 5,
    kiemTraGio: 1,
    mucTieu:
      "- Trình bày được cấu tạo và nguyên lý hoạt động của các loại khí cụ điện bảo vệ thường dùng trong công nghiệp và dân dụng.\n- Sử dụng thành thạo, đảm bảo an toàn cho người và thiết bị theo TCVN.\n- Tính chọn được các loại khí cụ điện bảo vệ thông dụng theo yêu cầu kỹ thuật cụ thể.\n- Tháo lắp, phán đoán và sửa chữa được hư hỏng.\n- Rèn luyện tính cẩn thận, tỉ mỉ, nghiêm túc trong công việc.",
    dsNoiDung: [
      {
        tieuDe: "1. Nam châm điện",
        children: [
          { tieuDe: "Cấu tạo, nguyên lý hoạt động, phân loại, ứng dụng", loai: "LT", gio: 1 },
          { tieuDe: "Thực hành nhận biết hư hỏng và sửa chữa", loai: "TH", gio: 1 },
        ],
      },
      {
        tieuDe: "2. Cầu chì",
        children: [
          { tieuDe: "Cấu tạo, ký hiệu, nguyên lý hoạt động, phân loại, tính chọn cầu chì", loai: "LT", gio: 1 },
          { tieuDe: "Thực hành lắp đặt, kiểm tra, sửa chữa hư hỏng", loai: "TH", gio: 1 },
        ],
      },
      {
        tieuDe: "3. Rơle nhiệt",
        children: [
          { tieuDe: "Cấu tạo, ký hiệu, nguyên lý hoạt động, phân loại, tính chọn rơle nhiệt", loai: "LT", gio: 1 },
          { tieuDe: "Thực hành chỉnh định, lắp đặt, sửa chữa hư hỏng", loai: "TH", gio: 1.5 },
        ],
      },
      {
        tieuDe: "4. Rơle điện từ (rơle dòng điện, rơle điện áp)",
        children: [
          { tieuDe: "Cấu tạo, nguyên lý hoạt động, ứng dụng", loai: "LT", gio: 1 },
          { tieuDe: "Thực hành lắp đặt, kiểm tra thông số", loai: "TH", gio: 1.5 },
        ],
      },
      { tieuDe: "5. Kiểm tra định kỳ", loai: "KT", gio: 1 },
    ],
  });

  await themBai({
    thuTu: 4,
    tenBai: "Bài 4: Khí cụ điện điều khiển",
    tongSoGio: 10,
    lyThuyetGio: 4,
    thucHanhGio: 5,
    kiemTraGio: 1,
    mucTieu:
      "- Trình bày được cấu tạo và nguyên lý hoạt động của các loại khí cụ điện điều khiển thường dùng trong công nghiệp và dân dụng.\n- Sử dụng thành thạo, đảm bảo an toàn cho người và thiết bị theo TCVN.\n- Tính chọn được các loại khí cụ điện điều khiển thông dụng theo yêu cầu kỹ thuật cụ thể.\n- Tháo lắp, phán đoán và sửa chữa được hư hỏng.\n- Rèn luyện tính cẩn thận, tỉ mỉ, nghiêm túc trong công việc.",
    dsNoiDung: [
      {
        tieuDe: "1. Công-tắc-tơ",
        children: [
          { tieuDe: "Cấu tạo, ký hiệu, nguyên lý hoạt động, tính chọn công tắc tơ", loai: "LT", gio: 1 },
          { tieuDe: "Thực hành lắp đặt, kiểm tra, sửa chữa hư hỏng", loai: "TH", gio: 2 },
        ],
      },
      {
        tieuDe: "2. Rơle thời gian",
        children: [
          { tieuDe: "Cấu tạo, ký hiệu, nguyên lý hoạt động", loai: "LT", gio: 1 },
          { tieuDe: "Thực hành chỉnh định, lắp đặt", loai: "TH", gio: 1.5 },
        ],
      },
      {
        tieuDe: "3. Rơle trung gian",
        children: [
          { tieuDe: "Khái niệm, cấu tạo, nguyên lý hoạt động", loai: "LT", gio: 1 },
          { tieuDe: "Thực hành lắp đặt, đấu nối mạch điều khiển", loai: "TH", gio: 1.5 },
        ],
      },
      { tieuDe: "4. Bộ khống chế (công dụng, phân loại, cấu tạo, ký hiệu)", loai: "LT", gio: 1 },
      { tieuDe: "5. Kiểm tra định kỳ", loai: "KT", gio: 1 },
    ],
  });

  const lichTrinh = await prisma.lichTrinhGiangDay.create({
    data: {
      lopId: lop.id,
      monHocId: monHoc.id,
      giaoVienId: giaoVien.id,
      hocKy: "Học kỳ III",
      ngayBatDau: new Date("2026-09-21"),
      soPhutMoiTiet: 45,
      khungTietTuan: {
        create: [
          { thu: 2, tietBatDau: 1, soTiet: 4, diaDiem: "X. Điện tử" },
          { thu: 3, tietBatDau: 1, soTiet: 4, diaDiem: "X. Điện tử" },
          { thu: 4, tietBatDau: 1, soTiet: 4, diaDiem: "X. Điện tử" },
          { thu: 5, tietBatDau: 1, soTiet: 4, diaDiem: "X. Điện tử" },
        ],
      },
    },
  });

  console.log("Đã tạo dữ liệu mẫu:");
  console.log("- GiaoVien:", giaoVien.id);
  console.log("- Lop:", lop.id);
  console.log("- MonHoc:", monHoc.id);
  console.log("- LichTrinhGiangDay:", lichTrinh.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
