# Thiết kế cơ sở dữ liệu CEP.EXCHANGE (Đã lược bỏ Điểm Xanh & Phần thưởng)

Hệ quản trị: PostgreSQL, UUID primary keys, `TIMESTAMPTZ` cho thời gian, `NUMERIC(15,2)` cho giá trị tiền, `JSONB` cho thông số thiết bị thay đổi linh hoạt theo loại.

## Danh sách 16 bảng

### 1. Phân hệ Tài khoản & Xác thực (2 bảng)
1. `users`: Tài khoản người dùng, email, họ tên, password hash (bcrypt), vai trò (`user`, `moderator`, `admin`), trạng thái (`active`, `locked`).
2. `refresh_tokens`: Lưu trữ mã hash SHA-256 của refresh token, ngày hết hạn và mốc thời gian thu hồi (`revoked_at`).

### 2. Phân hệ Danh mục & Tin đăng (4 bảng)
3. `categories`: Danh mục thiết bị (mã code, tên danh mục, icon, thứ tự sắp xếp, trạng thái kích hoạt).
4. `listings`: Tin đăng trao đổi máy (chủ sở hữu, danh mục, tiêu đề, mô tả, thông số `JSONB`, định giá ước tính, kiểu trao đổi `even`/`compensation`, nhu cầu muốn đổi, địa điểm, trạng thái kiểm duyệt `pending`/`approved`/`rejected`/`hidden`/`completed`, điểm tin cậy AI).
5. `listing_images`: Quản lý danh sách nhiều ảnh liên kết với một tin đăng, thứ tự sắp xếp ảnh (`sort_order`).
6. `listing_moderation_history`: Lịch sử kiểm duyệt tin đăng (người duyệt, hành động `approved`/`rejected`/`hidden`/`restored`, lý do).

### 3. Phân hệ Trao đổi & Thương lượng (2 bảng)
7. `trades`: Đề xuất trao đổi giữa hai người dùng (`proposer_id`, `receiver_id`), thiết bị đề xuất, bù trừ (`compensation_type`, `compensation_amount`), bước hiện tại (1 đến 5), trạng thái (`pending`, `agreed`, `inspecting`, `completed`, `rejected`, `cancelled`).
8. `trade_status_history`: Nhật ký lưu vết từng bước chuyển đổi trạng thái của giao dịch, người thực hiện và ghi chú.

### 4. Phân hệ Đánh giá & Uy tín (3 bảng)
9. `reviews`: Đánh giá tin đăng và người bán (số sao 1-5, bình luận, thẻ tags, liên kết giao dịch đã xác minh `is_verified_trade`).
10. `review_replies`: Phản hồi của chủ tin đăng hoặc người dùng khác đối với đánh giá.
11. `review_helpful_votes`: Ghi nhận lượt bình chọn đánh giá hữu ích, khóa chính kép `(review_id, user_id)` ngăn chặn bình chọn trùng lặp.

### 5. Phân hệ Tin nhắn Trao đổi (3 bảng)
12: `conversations`: Phòng hội thoại 1:1 liên kết duy nhất với một giao dịch `trade_id`.
13: `conversation_participants`: Thành viên trong cuộc trò chuyện và mốc thời gian xem tin gần nhất (`last_read_at`) phục vụ tính số tin chưa đọc.
14: `messages`: Tin nhắn trong cuộc trò chuyện (văn bản hoặc hình ảnh).

### 6. Phân hệ Cấu hình & Giám sát Quản trị (2 bảng)
15: `website_settings`: Cấu hình thông tin thương hiệu, hotline, email hỗ trợ, địa chỉ kiểm định, banner thông báo (bản ghi singleton `id=1`).
16: `audit_logs`: Nhật ký kiểm toán mọi hoạt động quản trị của admin/moderator.

---

## Quan hệ chính giữa các bảng
- `users 1:N listings`; `categories 1:N listings`; `listings 1:N listing_images`.
- `listings 1:N trades`; `users 1:N trades` thông qua `proposer_id` và `receiver_id`.
- `trades 1:N trade_status_history`; `trades 1:1 conversations`.
- `reviews` tham chiếu đến `listings`, `users` và tùy chọn liên kết với `trades`; `reviews 1:N review_replies`.
- `review_helpful_votes` có khóa chính kép `(review_id, user_id)`.
- `conversations N:M users` thông qua `conversation_participants`; `conversations 1:N messages`.

---

## Quy tắc nghiệp vụ & Tính toàn vẹn
- **Quy trình kiểm duyệt tin**: Tin đăng mới tạo mặc định ở trạng thái `pending`. Chỉ tin `approved` mới được hiển thị công khai trên sàn.
- **Quyền hạn sở hữu**: Người dùng chỉ có quyền sửa/xóa tin đăng và giao dịch của chính mình. Admin và Moderator có quyền kiểm duyệt và xử lý tranh chấp.
- **Ràng buộc giao dịch**: Người dùng không thể tự đề xuất trao đổi với tin đăng của chính mình (`proposer_id <> receiver_id`).
- **An toàn giao dịch**: Mọi thay đổi trạng thái giao dịch (`trades`) đều sử dụng cơ chế khóa bi quan (`FOR UPDATE`) trong database transaction để loại bỏ hoàn toàn race condition.
- **Bảo mật xác thực**: Mật khẩu mã hóa Bcrypt 12 rounds; refresh token xoay vòng và chỉ lưu hash SHA-256; hỗ trợ đăng xuất thu hồi token ngay lập tức.
