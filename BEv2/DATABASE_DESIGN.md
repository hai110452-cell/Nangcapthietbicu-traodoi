# Thiết kế cơ sở dữ liệu CEP.EXCHANGE

PostgreSQL, UUID primary keys, `TIMESTAMPTZ` cho thời gian, `NUMERIC(15,2)` cho giá trị tiền, `JSONB` cho thông số thiết bị thay đổi theo loại.

## Danh sách 19 bảng
1. `users`: tài khoản, email, password hash, role (`user`, `moderator`, `admin`), status.
2. `refresh_tokens`: hash refresh token, hạn dùng, thu hồi.
3. `categories`: danh mục laptop/PC/iPhone/Android.
4. `listings`: tin đăng, chủ sở hữu, danh mục, thông số, giá trị, loại trao đổi, trạng thái kiểm duyệt.
5. `listing_images`: nhiều ảnh cho một tin đăng.
6. `listing_moderation_history`: lịch sử duyệt/từ chối/ẩn tin.
7. `trades`: đề xuất trao đổi, hai người tham gia, thiết bị đề xuất, bù trừ và bước hiện tại.
8. `trade_status_history`: lịch sử trạng thái/bước giao dịch.
9. `reviews`: điểm, bình luận, thẻ và liên kết giao dịch đã xác minh.
10. `review_replies`: câu trả lời đánh giá.
11. `review_helpful_votes`: một lượt hữu ích cho mỗi user/review bằng khóa chính kép.
12. `conversations`: hội thoại gắn với giao dịch.
13. `conversation_participants`: thành viên hội thoại và thời điểm đọc gần nhất.
14. `messages`: tin nhắn.
15. `rewards`: danh mục phần thưởng.
16. `reward_redemptions`: mã và trạng thái đổi thưởng.
17. `user_points_transactions`: sổ cái cộng/trừ điểm; số dư là tổng các điểm phát sinh.
18. `website_settings`: cấu hình nội dung website, bản ghi singleton id=1.
19. `audit_logs`: nhật ký hoạt động quản trị.

## Quan hệ chính
- `users 1:N listings`; `categories 1:N listings`; `listings 1:N listing_images`.
- `listings 1:N trades`; `users 1:N trades` qua proposer/receiver.
- `trades 1:N trade_status_history`; `trades 1:1 conversations`.
- `reviews` tham chiếu `listings`, `users` và tùy chọn `trades`; `reviews 1:N review_replies`.
- `review_helpful_votes` có PK `(review_id,user_id)`.
- `conversations N:M users` qua `conversation_participants`; `conversations 1:N messages`.
- `users 1:N user_points_transactions` và `reward_redemptions`; `rewards 1:N reward_redemptions`.

## Quy tắc nghiệp vụ
- Tin đăng tạo mới bắt đầu ở `pending`; chỉ `approved` được công khai.
- Người dùng chỉ sửa/xóa tin của chính mình; moderator/admin kiểm duyệt.
- Giao dịch không cho tự đề xuất với tin của chính mình; chỉ người nhận mới chấp nhận/từ chối đề xuất.
- Điểm thưởng chỉ thay đổi qua `user_points_transactions`; đổi thưởng tạo redemption và trừ điểm trong cùng transaction.
- Mật khẩu được hash; refresh token lưu hash; không có tài khoản admin mặc định.
- Dùng parameterized SQL và transaction cho các thao tác nhiều bước.
