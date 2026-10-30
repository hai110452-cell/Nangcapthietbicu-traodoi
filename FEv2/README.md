# CEP.EXCHANGE — Frontend

Frontend Next.js của CEP.EXCHANGE đã được nối với REST API của backend NestJS. Danh sách tin đăng, đăng nhập/đăng ký, đề xuất trao đổi, tiến trình giao dịch, đánh giá, chat, Điểm Xanh và trang quản trị đều lấy/ghi dữ liệu qua API thay vì dùng dữ liệu sản phẩm demo trong `localStorage`.

## Yêu cầu

- Node.js 20 trở lên
- Backend NestJS chạy tại `http://localhost:3001`
- PostgreSQL đã được cấu hình và migration/seed backend đã chạy xong

## Cấu hình API

Trong thư mục frontend, tạo file `.env.local` từ `.env.example`:

**PowerShell (Windows):**

```powershell
Copy-Item .env.example .env.local
```

Nội dung mặc định:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Nếu backend chạy ở địa chỉ/cổng khác, sửa biến trên cho đúng. Sau khi sửa `.env.local`, khởi động lại frontend.

## Chạy ở chế độ phát triển

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Chạy chế độ production

```bash
npm install
npm run build
npm start
```

## Quy trình chạy cả hệ thống

1. Khởi động PostgreSQL.
2. Trong thư mục backend, cấu hình `DATABASE_URL` trong `.env`.
3. Chạy `npm run db:migrate` và `npm run db:seed` (chỉ seed lần đầu hoặc khi cần dữ liệu danh mục/phần thưởng mặc định).
4. Khởi động backend bằng `npm start`; kiểm tra `http://localhost:3001/api/health` và tài liệu API tại `http://localhost:3001/docs`.
5. Trong thư mục frontend, cấu hình `.env.local` và chạy `npm run dev`.

## Lưu ý quan trọng

- Tin đăng mới sẽ ở trạng thái chờ duyệt; chúng chỉ xuất hiện ở trang khám phá sau khi quản trị viên duyệt.
- Đăng ký tài khoản thường không tự cấp quyền quản trị. Để dùng trang `/admin`: đăng ký một tài khoản trước, sau đó chạy SQL trong pgAdmin/psql (thay email bằng email vừa đăng ký):

  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'admin-cua-ban@example.com';
  ```

  Đăng xuất rồi đăng nhập lại để frontend nhận quyền mới.
- Backend hiện chưa cung cấp API tải ảnh lên hoặc xử lý AI Computer Vision. Giao diện giữ phong cách hiện tại, nhưng form đăng tin lưu dữ liệu văn bản và không giả lập việc đã tải ảnh/phân tích AI.
- Chat chỉ hoạt động với hội thoại được backend tạo cho giao dịch; không có tin nhắn giả lập.
- Cần kết nối backend/PostgreSQL thật để kiểm thử tích hợp. Nếu API không chạy, frontend sẽ hiển thị trạng thái rỗng hoặc thông báo lỗi thay vì tự chèn sản phẩm mẫu.
