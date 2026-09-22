# Soạn giáo án Trung cấp nghề

Ứng dụng web hỗ trợ quy trình soạn giáo án cho giáo viên trung cấp nghề:

1. **Chương trình môn học** — nhập môn học, các bài học và nội dung chi tiết
   phân cấp; tự gán số giờ (tiết) cho từng đề mục.
2. **Lịch trình giảng dạy** — khai báo khung tiết theo thời khóa biểu (thứ
   nào có bao nhiêu tiết), số phút/tiết, ngày bắt đầu và ngày nghỉ. Hệ
   thống tự động xếp các đề mục đã gán thời gian vào từng buổi dạy, cho
   phép chỉnh sửa (ngày, thiết bị, ghi chú) rồi **duyệt**.
3. **Giáo án** — sau khi lịch trình được duyệt, AI (Claude) soạn giáo án
   trình giảng cho từng buổi theo đúng khung mẫu TCN (Dẫn nhập, Giới thiệu
   chủ đề, Giải quyết vấn đề, Kết thúc vấn đề, Hướng dẫn tự học). Có thể
   chỉnh sửa tay, đánh dấu hoàn thiện và **xuất ra file Word (.docx)**.

## Công nghệ

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack)
- [Prisma 7](https://www.prisma.io) + SQLite (qua driver adapter
  `@prisma/adapter-better-sqlite3`) — dễ đổi sang PostgreSQL khi cần nhiều
  người dùng đồng thời
- [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk) (Claude)
  để soạn nội dung giáo án
- [docx](https://www.npmjs.com/package/docx) để xuất file Word

## Cài đặt & chạy thử

```bash
npm install
npx prisma migrate deploy   # hoặc: npx prisma migrate dev
npm run dev
```

Mở http://localhost:3000.

## Biến môi trường

Sao chép `.env.example` thành `.env` và điền:

```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="sk-ant-..."   # bắt buộc để dùng tính năng "Soạn giáo án bằng AI"
```

Không có `ANTHROPIC_API_KEY`, toàn bộ ứng dụng vẫn hoạt động bình thường
(chương trình môn học, lịch trình giảng dạy, xuất Word) — chỉ riêng nút
"Soạn giáo án bằng AI" / "Soạn lại bằng AI" sẽ báo lỗi.

## Quy ước dữ liệu quan trọng

- **1 giờ trong chương trình môn học = 1 tiết trong thời khóa biểu.**
  Số phút thực tế của 1 tiết được cấu hình riêng cho từng lịch trình giảng
  dạy (mặc định 45 phút).
- Trong "Nội dung chi tiết" của một bài, chỉ những đề mục **có gán thời
  gian** mới được xếp vào lịch trình. Một đề mục cha có mục con thì thời
  gian nằm ở các mục con (mục cha chỉ là tiêu đề nhóm).
- Thuật toán xếp lịch trình (`src/lib/lichtrinh/generate.ts`) dồn các đề
  mục theo đúng thứ tự trong chương trình vào các buổi dạy theo khung tiết
  tuần đã khai báo, tách "(Tiếp)" khi một đề mục kéo dài qua nhiều buổi, và
  bỏ qua các ngày nghỉ.
- Sau khi lịch trình được **duyệt**, không thể sinh lại hoặc sửa ngày/nội
  dung các buổi (phải "Mở duyệt lại" trước).

## Cấu trúc thư mục chính

```
prisma/schema.prisma        Mô hình dữ liệu
src/lib/lichtrinh/generate.ts   Thuật toán xếp lịch trình (hàm thuần, có thể test độc lập)
src/lib/giaoan/generate.ts      Gọi Claude API để soạn giáo án
src/lib/actions/*.ts             Server Actions (mutate dữ liệu qua form)
src/app/*                        Các trang (App Router)
```
