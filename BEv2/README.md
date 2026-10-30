# CEP.EXCHANGE Backend

Backend REST API cho frontend Next.js CEP.EXCHANGE. Stack: NestJS + TypeScript + PostgreSQL, sử dụng connection string `DATABASE_URL`, Swagger và SQL migration có kiểm soát.

## 1. Yêu cầu
- Node.js 20 trở lên
- PostgreSQL 14 trở lên
- npm

## 2. Cài đặt
```bash
npm install
```
Sao chép `.env.example` thành `.env`, sau đó chỉnh `DATABASE_URL` và các secret JWT.

Ví dụ PostgreSQL local:
```dotenv
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/cep_exchange
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
JWT_ACCESS_SECRET=replace_with_a_long_random_secret_at_least_32_chars
JWT_REFRESH_SECRET=replace_with_another_long_random_secret_at_least_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
DATABASE_SSL=false
```
Tạo database `cep_exchange` trước khi chạy migration. Nếu mật khẩu có ký tự đặc biệt trong URL, hãy URL-encode ký tự đó.

## 3. Tạo bảng và dữ liệu nền
```bash
npm run db:migrate
npm run db:seed
```
Migration tạo 19 bảng: `users`, `refresh_tokens`, `categories`, `listings`, `listing_images`, `listing_moderation_history`, `trades`, `trade_status_history`, `reviews`, `review_replies`, `review_helpful_votes`, `conversations`, `conversation_participants`, `messages`, `rewards`, `reward_redemptions`, `user_points_transactions`, `website_settings`, `audit_logs`.

## 4. Chạy backend
```bash
npm start
```
- API base: `http://localhost:3001/api`
- Swagger UI: `http://localhost:3001/docs`
- Health: `http://localhost:3001/api/health`
- Public website settings: `http://localhost:3001/api/settings`

Dev mode: `npm run start:dev`. Build: `npm run build`.

## 5. Xác thực
1. `POST /api/auth/register` với `{ "fullName": "Nguyen Van A", "email": "a@example.com", "password": "matkhau123" }`.
2. `POST /api/auth/login` với email/password.
3. Dùng `accessToken` làm header `Authorization: Bearer <accessToken>`.
4. `POST /api/auth/refresh` với `{ "refreshToken": "..." }` để xoay refresh token.
5. `POST /api/auth/logout` để thu hồi refresh token (gửi body `refreshToken`) hoặc toàn bộ refresh token của user nếu không gửi body.

Không có tài khoản admin mặc định. Đăng ký user bình thường, sau đó cấp role `admin` trực tiếp trong database trong môi trường phát triển:
```sql
UPDATE users SET role='admin' WHERE email='email-cua-ban@example.com';
```
Không chạy lệnh cấp quyền này cho người dùng không tin cậy trong môi trường production.

## 6. API chính
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Listings & categories
- `GET /api/categories`
- `GET /api/listings?page=1&limit=12&category=laptop&search=macbook`
- `GET /api/listings/:id`
- `GET /api/listings/mine/list`
- `POST /api/listings`
- `PATCH /api/listings/:id`
- `DELETE /api/listings/:id`
- `GET /api/listings/admin/pending` (admin/moderator)
- `PATCH /api/listings/:id/moderate` (admin/moderator; `{ "action":"approved", "reason":"..." }`)

### Trades
- `POST /api/trades`
- `GET /api/trades`
- `GET /api/trades/:id`
- `PATCH /api/trades/:id/respond` (body `action=agreed|rejected`)
- `PATCH /api/trades/:id/step` (body `{ "step": 3, "note": "..." }`)
- `PATCH /api/trades/:id/cancel`

### Reviews
- `GET /api/listings/:id/reviews?sort=recent|helpful|rating&rating=5`
- `POST /api/listings/:id/reviews`
- `PATCH /api/reviews/:id`
- `DELETE /api/reviews/:id`
- `POST /api/reviews/:id/replies`
- `PUT /api/reviews/:id/helpful`
- `DELETE /api/reviews/:id/helpful`

### Chat
- `GET /api/chat/conversations`
- `GET /api/chat/conversations/:id/messages`
- `POST /api/chat/conversations/:id/messages`
- `POST /api/chat/trades/:tradeId/open`

### Green Points
- `GET /api/rewards`
- `GET /api/rewards/me/points`
- `GET /api/rewards/me/history`
- `GET /api/rewards/me/redemptions`
- `POST /api/rewards/:id/redeem`
- `POST /api/rewards/admin` (admin)
- `POST /api/rewards/admin/points` (admin; cộng/trừ điểm thủ công, body `{ "userId": "uuid", "points": 100, "description": "..." }`)
- `PATCH /api/rewards/admin/:id` (admin)

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/settings`
- `PUT /api/admin/settings` (admin)
- `GET /api/admin/audit-logs` (admin)
- `GET /api/admin/listings`
- `GET /api/users` (admin/moderator)
- `PATCH /api/users/:id/status` (admin)

## 7. Lưu ý tích hợp frontend
Frontend hiện dùng kiểu dữ liệu localStorage/mock. Cần tạo một lớp `apiClient` trong Next.js để gọi các endpoint này và chuyển các trường response theo UI hiện tại (`type`, `estimatedValue`, `specs`, `ownerName`, v.v.). Không nên dùng localStorage làm nguồn dữ liệu nghiệp vụ sau khi tích hợp.

- `category` trong API dùng `laptop`, `pc`, `iphone`, `android`.
- `exchangeType` dùng `even` hoặc `compensation`; giao diện có thể hiển thị `Đổi ngang` hoặc `Bù trừ`.
- Tin mới tạo ở trạng thái `pending`, chỉ tin được duyệt mới xuất hiện công khai.
- Đổi điểm dùng transaction và khóa bản ghi phần thưởng; điểm chỉ phát sinh từ `user_points_transactions`.
- Chat hiện là REST API; WebSocket có thể được bổ sung ở giai đoạn sau nếu cần realtime.

## 8. Trạng thái triển khai
Đây là bản backend khởi tạo đầy đủ module và schema để bắt đầu tích hợp. Chưa chạy được migration/build với database của bạn trong môi trường hiện tại, vì vậy cần chạy các lệnh trên máy bạn và kiểm thử API. Một số endpoint trả lỗi nghiệp vụ dưới dạng `{ "error": "..." }`; trước khi production nên chuẩn hóa các trường hợp này thành exception HTTP và bổ sung test tự động.


## Upload ảnh lên Cloudinary

1. Tạo tài khoản Cloudinary và lấy Cloud name, API Key, API Secret trong Dashboard.
2. Điền `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` vào `.env` backend. Không đưa API Secret vào frontend hoặc biến `NEXT_PUBLIC_*`.
3. Khởi động lại backend. Frontend gửi ảnh tới `POST /api/uploads/images` (JWT Bearer), mỗi ảnh tối đa 5 MB; hỗ trợ JPEG, PNG, WebP và AVIF. Ảnh được lưu trong folder `cep-exchange/listings` trên Cloudinary. URL trả về được gửi cùng tin đăng và lưu vào bảng `listing_images`.


## Upload ảnh lên Cloudinary

1. Tạo tài khoản Cloudinary và lấy Cloud name, API Key, API Secret trong Dashboard.
2. Điền `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` vào `.env` backend. Không đưa API Secret vào frontend hoặc biến `NEXT_PUBLIC_*`.
3. Khởi động lại backend. Frontend gửi ảnh tới `POST /api/uploads/images` (JWT Bearer), mỗi ảnh tối đa 5 MB; hỗ trợ JPEG, PNG, WebP và AVIF. Ảnh được lưu trong folder `cep-exchange/listings` trên Cloudinary. URL trả về được gửi cùng tin đăng và lưu vào bảng `listing_images`.
