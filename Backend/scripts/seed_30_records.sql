-- ============================================================================
-- CEP.EXCHANGE - DỮ LIỆU MẪU (30 BẢN GHI SẢN PHẨM + DỮ LIỆU LIÊN KẾT ĐẦY ĐỦ)
-- Tương thích: 001_initial_schema.sql & 002_remove_rewards_and_points.sql
-- Mật khẩu mặc định của tất cả tài khoản mẫu: 123456
-- Có thể chạy lặp lại an toàn (idempotent với ON CONFLICT DO NOTHING).
-- ============================================================================

BEGIN;

-- 1. CẤU HÌNH WEBSITE (1 bản ghi)
INSERT INTO website_settings (
  id, brand_name, brand_slogan, hero_title, hero_highlight, hero_description,
  hero_badge_text, hotline, support_email, inspection_address,
  announcement_banner, announcement_active
) VALUES (
  1,
  'CEP.EXCHANGE',
  'Nền Tảng Trao Đổi Máy Tính & Điện Thoại',
  'Nâng Cấp Thiết Bị Cũ — Trao Đổi',
  'Máy Tính & Điện Thoại Thông Minh',
  'Nền tảng kết nối trực tiếp những người dùng có nhu cầu chuyển đổi giữa Laptop, PC Gaming, MacBook, iPhone và Android. Ứng dụng AI tự động nhận diện thiết bị và bảo chứng giao dịch an toàn.',
  'Hơn 2.500+ lượt đổi thành công tháng này • Bảo chứng chất lượng CEP Care Escrow',
  '1900 6868',
  'hotro@cep-exchange.vn',
  'Trung tâm CEP Care: 123 Nguyễn Huệ, Quận 1, TP.HCM & 45 Cầu Giấy, Hà Nội',
  'Miễn phí kiểm định phần cứng tại trung tâm CEP Care trong tháng này!',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 2. DANH MỤC THIẾT BỊ (4 bản ghi)
INSERT INTO categories (id, code, name, icon, sort_order, is_active) VALUES
  ('11111111-1111-4111-8111-111111111101', 'laptop',  'Laptop & MacBook',       '💻', 1, TRUE),
  ('11111111-1111-4111-8111-111111111102', 'pc',      'Máy tính bàn PC Gaming', '🖥️', 2, TRUE),
  ('11111111-1111-4111-8111-111111111103', 'iphone',  'Điện thoại iPhone',      '📱', 3, TRUE),
  ('11111111-1111-4111-8111-111111111104', 'android', 'Điện thoại Android',     '🤖', 4, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 3. NGƯỜI DÙNG (10 bản ghi - mật khẩu: 123456)
INSERT INTO users (id, full_name, email, password_hash, avatar_url, role, status) VALUES
  ('22222222-2222-4222-8222-222222222201', 'Nguyễn Quản Trị',   'admin.demo@cep-exchange.vn', crypt('123456', gen_salt('bf', 10)), NULL, 'admin',     'active'),
  ('22222222-2222-4222-8222-222222222202', 'Trần Kiểm Duyệt',   'mod.demo@cep-exchange.vn',   crypt('123456', gen_salt('bf', 10)), NULL, 'moderator', 'active'),
  ('22222222-2222-4222-8222-222222222203', 'Nguyễn Minh Tuấn',  'minhtuan@example.com',       crypt('123456', gen_salt('bf', 10)), NULL, 'user',      'active'),
  ('22222222-2222-4222-8222-222222222204', 'Lê Hoàng Nam',      'hoangnam@example.com',       crypt('123456', gen_salt('bf', 10)), NULL, 'user',      'active'),
  ('22222222-2222-4222-8222-222222222205', 'Phạm Quỳnh Nga',    'quynhnga@example.com',       crypt('123456', gen_salt('bf', 10)), NULL, 'user',      'active'),
  ('22222222-2222-4222-8222-222222222206', 'Trần Minh Đức',     'minhduc@example.com',        crypt('123456', gen_salt('bf', 10)), NULL, 'user',      'active'),
  ('22222222-2222-4222-8222-222222222207', 'Võ Thanh Trúc',     'thanhtruc@example.com',      crypt('123456', gen_salt('bf', 10)), NULL, 'user',      'active'),
  ('22222222-2222-4222-8222-222222222208', 'Đặng Hữu Đạt',      'huudat@example.com',         crypt('123456', gen_salt('bf', 10)), NULL, 'user',      'active'),
  ('22222222-2222-4222-8222-222222222209', 'Bùi Gia Huy',       'giahuy@example.com',         crypt('123456', gen_salt('bf', 10)), NULL, 'user',      'active'),
  ('22222222-2222-4222-8222-222222222210', 'Hoàng Thảo Vy',     'thaovy@example.com',         crypt('123456', gen_salt('bf', 10)), NULL, 'user',      'active')
ON CONFLICT (email) DO NOTHING;

-- 4. 30 BẢN GHI TIN ĐĂNG SẢN PHẨM (listings)
INSERT INTO listings (
  id, owner_id, category_id, title, description, device_icon, specs,
  estimated_value, exchange_type, target_demand, location, status,
  ai_confidence, ai_detected_info, moderated_by, moderated_at, rejection_reason, created_at
) VALUES
-- 01
(
  '33333333-3333-4333-8333-333333333301',
  '22222222-2222-4222-8222-222222222203',
  (SELECT id FROM categories WHERE code = 'laptop'),
  'MacBook Pro 14 M2 Pro (16GB / 512GB SSD) Space Gray',
  'Máy mua chính hãng VN, ngoại hình 99% không cấn móp, pin 96% mới sạc 62 lần. Fullbox sạc cáp zin 67W, còn hóa đơn mua hàng.',
  '💻',
  '{"CPU":"Apple M2 Pro 10-Core","RAM":"16GB Unified","SSD":"512GB NVMe","Màn hình":"14.2 inch Liquid Retina XDR 120Hz","Pin":"96% (62 chu kỳ)"}'::jsonb,
  28500000, 'compensation',
  'Muốn đổi iPhone 15 Pro Max hoặc dàn PC Gaming RTX 4070 bù trừ hợp lý',
  'Quận 1, TP. Hồ Chí Minh', 'approved',
  95.50, '{"verdict":"approved","summary":"Thông số rõ ràng, giá sát thị trường"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '20 days', NULL, NOW() - INTERVAL '20 days'
),
-- 02
(
  '33333333-3333-4333-8333-333333333302',
  '22222222-2222-4222-8222-222222222204',
  (SELECT id FROM categories WHERE code = 'iphone'),
  'iPhone 15 Pro Max 256GB Titan Tự Nhiên VN/A Fullbox',
  'Máy bản VN/A chính hãng, pin 98%, chưa sửa chữa, nguyên áp suất. Tặng kèm ốp MagSafe và cường lực dán sẵn.',
  '📱',
  '{"Dung lượng":"256GB","Màu sắc":"Titan Tự Nhiên","Pin":"98%","Xuất xứ":"Chính hãng VN/A","Tình trạng":"99% Fullbox"}'::jsonb,
  24900000, 'even',
  'Muốn đổi ngang MacBook Air M3 16GB hoặc Galaxy S24 Ultra 512GB',
  'Cầu Giấy, Hà Nội', 'approved',
  94.00, '{"verdict":"approved","summary":"Mô tả đầy đủ, nguồn gốc minh bạch"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '19 days', NULL, NOW() - INTERVAL '19 days'
),
-- 03
(
  '33333333-3333-4333-8333-333333333303',
  '22222222-2222-4222-8222-222222222206',
  (SELECT id FROM categories WHERE code = 'pc'),
  'Dàn PC Gaming i7 13700K / RTX 4070 12GB / 32GB DDR5',
  'Dàn PC tự build còn bảo hành chính hãng 24 tháng tại GearVN. Chơi mượt mọi game 2K/4K, vệ sinh định kỳ, nhiệt độ mát.',
  '🖥️',
  '{"CPU":"Intel Core i7-13700K","VGA":"RTX 4070 12GB OC","RAM":"32GB DDR5 6000MHz","SSD":"1TB NVMe Gen4","Tản nhiệt":"AIO 360 ARGB"}'::jsonb,
  32000000, 'compensation',
  'Muốn đổi sang Laptop Gaming mỏng nhẹ ASUS ROG Zephyrus hoặc MacBook Pro',
  'Hải Châu, Đà Nẵng', 'approved',
  93.20, '{"verdict":"approved","summary":"Cấu hình chi tiết, định giá hợp lý"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '18 days', NULL, NOW() - INTERVAL '18 days'
),
-- 04
(
  '33333333-3333-4333-8333-333333333304',
  '22222222-2222-4222-8222-222222222205',
  (SELECT id FROM categories WHERE code = 'android'),
  'Samsung Galaxy S24 Ultra 5G 12GB/256GB Titanium Gray',
  'Hàng SSVN còn bảo hành Care+, bút S-Pen nhạy, màn hình đẹp không ám ố. Dùng kỹ từ lúc bóc seal.',
  '📱',
  '{"RAM":"12GB","Bộ nhớ":"256GB","Camera":"200MP Zoom 100x","Bút":"S-Pen tích hợp","Tình trạng":"99% Fullbox SSVN"}'::jsonb,
  21500000, 'compensation',
  'Muốn đổi iPhone 15 Pro hoặc MacBook Air M2 phục vụ công việc văn phòng',
  'Bình Thạnh, TP. Hồ Chí Minh', 'approved',
  96.10, '{"verdict":"approved","summary":"Tin đăng chuẩn xác, đầy đủ thông số"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '17 days', NULL, NOW() - INTERVAL '17 days'
),
-- 05
(
  '33333333-3333-4333-8333-333333333305',
  '22222222-2222-4222-8222-222222222207',
  (SELECT id FROM categories WHERE code = 'laptop'),
  'MacBook Air M2 13.6 inch Midnight (8GB / 256GB SSD)',
  'Máy nữ dùng văn phòng rất giữ gìn, pin 95%, bàn phím US sạch đẹp, không trầy xước. Đủ sạc MagSafe 3 zin.',
  '💻',
  '{"CPU":"Apple M2 8-Core","RAM":"8GB","SSD":"256GB","Trọng lượng":"1.24kg","Pin":"95%"}'::jsonb,
  17800000, 'even',
  'Muốn đổi ngang iPhone 14 Pro Max 256GB hoặc iPad Pro M1 kèm phím',
  'Đống Đa, Hà Nội', 'approved',
  92.50, '{"verdict":"approved","summary":"Thông tin minh bạch"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '16 days', NULL, NOW() - INTERVAL '16 days'
),
-- 06
(
  '33333333-3333-4333-8333-333333333306',
  '22222222-2222-4222-8222-222222222208',
  (SELECT id FROM categories WHERE code = 'laptop'),
  'ASUS ROG Zephyrus G14 (Ryzen 9 7940HS / RTX 4060 / 16GB)',
  'Laptop gaming siêu gọn 1.65kg, màn 14 inch QHD+ 165Hz chuẩn màu 100% DCI-P3, vừa học vừa chơi game đỉnh.',
  '💻',
  '{"CPU":"AMD Ryzen 9 7940HS","VGA":"RTX 4060 8GB","RAM":"16GB DDR5","SSD":"1TB NVMe","Màn hình":"14 inch QHD+ 165Hz"}'::jsonb,
  26000000, 'compensation',
  'Muốn đổi MacBook Pro 14 M2/M3 hoặc iPhone 15 Pro Max',
  'Ninh Kiều, Cần Thơ', 'approved',
  94.80, '{"verdict":"approved","summary":"Cấu hình rõ ràng, hợp lệ"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '15 days', NULL, NOW() - INTERVAL '15 days'
),
-- 07
(
  '33333333-3333-4333-8333-333333333307',
  '22222222-2222-4222-8222-222222222209',
  (SELECT id FROM categories WHERE code = 'laptop'),
  'Dell XPS 13 9315 (Core i7-1250U / 16GB / 512GB) Sky Blue',
  'Ultrabook siêu mỏng nhẹ vỏ nhôm nguyên khối, màn hình viền siêu mỏng InfinityEdge, pin dùng thực tế 8 tiếng.',
  '💻',
  '{"CPU":"Intel Core i7-1250U","RAM":"16GB LPDDR5","SSD":"512GB","Màn hình":"13.4 inch FHD+","Màu sắc":"Sky Blue"}'::jsonb,
  19500000, 'compensation',
  'Muốn đổi MacBook Air M2 16GB hoặc ThinkPad X1 Carbon Gen 10',
  'Quận 3, TP. Hồ Chí Minh', 'approved',
  91.40, '{"verdict":"approved","summary":"Đạt chuẩn duyệt"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '14 days', NULL, NOW() - INTERVAL '14 days'
),
-- 08
(
  '33333333-3333-4333-8333-333333333308',
  '22222222-2222-4222-8222-222222222210',
  (SELECT id FROM categories WHERE code = 'iphone'),
  'iPhone 14 Pro 256GB Deep Purple Quốc Tế Zin Áp',
  'Máy đẹp 98.5%, pin 91%, FaceID nhạy, màn 120Hz không vết xước. Kèm cáp zin và 2 ốp lưng đẹp.',
  '📱',
  '{"Dung lượng":"256GB","Màu sắc":"Deep Purple","Pin":"91%","Màn hình":"6.1 inch 120Hz","Tình trạng":"Zin nguyên bản"}'::jsonb,
  16500000, 'compensation',
  'Muốn lên đời iPhone 15 Pro hoặc đổi Samsung S24 Plus bù trừ',
  'Thanh Xuân, Hà Nội', 'approved',
  90.80, '{"verdict":"approved","summary":"Đủ thông tin và hình ảnh"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '13 days', NULL, NOW() - INTERVAL '13 days'
),
-- 09
(
  '33333333-3333-4333-8333-333333333309',
  '22222222-2222-4222-8222-222222222203',
  (SELECT id FROM categories WHERE code = 'pc'),
  'PC Workstation Ryzen 9 7900X / RTX 4070 Ti / 64GB RAM',
  'Chuyên dựng phim 4K, Blender, AI local. Case kính cường lực airflow tốt, nguồn 850W Gold bảo hành dài.',
  '🖥️',
  '{"CPU":"AMD Ryzen 9 7900X","VGA":"RTX 4070 Ti 12GB","RAM":"64GB DDR5","SSD":"2TB NVMe Gen4","Nguồn":"850W 80+ Gold"}'::jsonb,
  41500000, 'compensation',
  'Muốn đổi MacBook Pro 16 M2 Pro/Max hoặc Mac Studio M2 Max',
  'Quận 7, TP. Hồ Chí Minh', 'approved',
  95.00, '{"verdict":"approved","summary":"Cấu hình workstation rõ ràng"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '12 days', NULL, NOW() - INTERVAL '12 days'
),
-- 10
(
  '33333333-3333-4333-8333-333333333310',
  '22222222-2222-4222-8222-222222222204',
  (SELECT id FROM categories WHERE code = 'android'),
  'Xiaomi 14 Ultra 16GB/512GB Đen Da — Camera Leica',
  'Flagship chụp ảnh đỉnh cao cảm biến 1 inch Leica, kèm Photography Kit chính hãng, sạc 90W đầy trong 35 phút.',
  '📱',
  '{"RAM":"16GB","Bộ nhớ":"512GB","Chip":"Snapdragon 8 Gen 3","Camera":"Leica 50MP 1-inch","Phụ kiện":"Fullbox + Kit chụp ảnh"}'::jsonb,
  22800000, 'compensation',
  'Muốn đổi iPhone 15 Pro Max hoặc Samsung Galaxy Z Fold 5',
  'Ba Đình, Hà Nội', 'approved',
  93.60, '{"verdict":"approved","summary":"Thông tin chi tiết, hợp lệ"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '11 days', NULL, NOW() - INTERVAL '11 days'
),
-- 11
(
  '33333333-3333-4333-8333-333333333311',
  '22222222-2222-4222-8222-222222222205',
  (SELECT id FROM categories WHERE code = 'laptop'),
  'Lenovo Legion 5 Pro 2023 (i7-13700HX / RTX 4060 / 32GB)',
  'Màn hình 16 inch WQXGA 240Hz 500 nits siêu sáng, đã nâng cấp lên 32GB RAM, tản nhiệt Coldfront cực mát.',
  '💻',
  '{"CPU":"Intel Core i7-13700HX","VGA":"RTX 4060 8GB 140W","RAM":"32GB DDR5","SSD":"1TB NVMe","Màn hình":"16 inch 2K+ 240Hz"}'::jsonb,
  27500000, 'compensation',
  'Muốn đổi MacBook Pro 14 M2 Pro hoặc PC Gaming tương đương',
  'Thủ Đức, TP. Hồ Chí Minh', 'approved',
  94.20, '{"verdict":"approved","summary":"Cấu hình rõ, giá hợp lý"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '10 days', NULL, NOW() - INTERVAL '10 days'
),
-- 12
(
  '33333333-3333-4333-8333-333333333312',
  '22222222-2222-4222-8222-222222222206',
  (SELECT id FROM categories WHERE code = 'iphone'),
  'iPhone 13 Pro Max 128GB Sierra Blue Pin 89%',
  'Máy quốc tế nguyên zin chưa bung, màn hình đã fix xanh chuẩn không lỗi vặt, ngoại hình 98% đẹp keng.',
  '📱',
  '{"Dung lượng":"128GB","Màu sắc":"Sierra Blue","Pin":"89%","Màn hình":"6.7 inch ProMotion 120Hz","Tình trạng":"98% Nguyên bản"}'::jsonb,
  13800000, 'compensation',
  'Muốn đổi Samsung S23 Ultra hoặc bù thêm lên iPhone 14 Pro Max',
  'Sơn Trà, Đà Nẵng', 'approved',
  89.50, '{"verdict":"approved","summary":"Hợp lệ"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '9 days', NULL, NOW() - INTERVAL '9 days'
),
-- 13
(
  '33333333-3333-4333-8333-333333333313',
  '22222222-2222-4222-8222-222222222207',
  (SELECT id FROM categories WHERE code = 'android'),
  'Google Pixel 8 Pro 12GB/256GB Obsidian Quốc Tế',
  'Chạy Android gốc siêu mượt, nhận cập nhật 7 năm, chụp đêm cực đẹp. Máy quốc tế 2 SIM (1 vật lý + 1 eSIM).',
  '📱',
  '{"Chip":"Google Tensor G3","RAM":"12GB","Bộ nhớ":"256GB","Màn hình":"6.7 inch Super Actua 120Hz","Tình trạng":"99%"}'::jsonb,
  14200000, 'even',
  'Muốn đổi ngang iPhone 14 hoặc Samsung Galaxy S23 Plus',
  'Hai Bà Trưng, Hà Nội', 'approved',
  91.00, '{"verdict":"approved","summary":"Đầy đủ thông số"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '9 days', NULL, NOW() - INTERVAL '9 days'
),
-- 14
(
  '33333333-3333-4333-8333-333333333314',
  '22222222-2222-4222-8222-222222222208',
  (SELECT id FROM categories WHERE code = 'pc'),
  'PC Gaming Mini ITX i5-13400F / RTX 4060 / 16GB Nhỏ Gọn',
  'Case NR200P siêu gọn đặt bàn làm việc cực thẩm mỹ, chiến mượt Valorant, CS2, Cyberpunk 2077 thiết lập High.',
  '🖥️',
  '{"CPU":"Intel Core i5-13400F","VGA":"RTX 4060 8GB","RAM":"16GB DDR4 3200MHz","SSD":"512GB NVMe","Case":"Cooler Master NR200P"}'::jsonb,
  17500000, 'even',
  'Muốn đổi ngang MacBook Air M2 hoặc Laptop Gaming RTX 3060/4050',
  'Biên Hòa, Đồng Nai', 'approved',
  92.00, '{"verdict":"approved","summary":"Thông số tốt"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '8 days', NULL, NOW() - INTERVAL '8 days'
),
-- 15
(
  '33333333-3333-4333-8333-333333333315',
  '22222222-2222-4222-8222-222222222209',
  (SELECT id FROM categories WHERE code = 'laptop'),
  'ThinkPad X1 Carbon Gen 10 (i7-1260P / 16GB / 512GB)',
  'Dòng doanh nhân siêu bền nhẹ 1.12kg, bàn phím gõ sướng nhất phân khúc, màn hình 2.8K OLED sắc nét.',
  '💻',
  '{"CPU":"Intel Core i7-1260P","RAM":"16GB LPDDR5","SSD":"512GB Gen4","Màn hình":"14 inch 2.8K OLED","Trọng lượng":"1.12kg"}'::jsonb,
  22000000, 'compensation',
  'Muốn đổi MacBook Pro 14 M1/M2 Pro hoặc iPhone 15 Pro',
  'Quận 10, TP. Hồ Chí Minh', 'approved',
  94.10, '{"verdict":"approved","summary":"Chuẩn mực"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '8 days', NULL, NOW() - INTERVAL '8 days'
),
-- 16
(
  '33333333-3333-4333-8333-333333333316',
  '22222222-2222-4222-8222-222222222210',
  (SELECT id FROM categories WHERE code = 'android'),
  'Samsung Galaxy Z Fold 5 12GB/256GB Icy Blue SSVN',
  'Bản lề gập khít không khe hở, màn trong mượt đẹp không vết hằn, đa nhiệm 3 cửa sổ cực tiện cho công việc.',
  '📱',
  '{"Chip":"Snapdragon 8 Gen 2","RAM":"12GB","Bộ nhớ":"256GB","Màn hình":"7.6 inch Dynamic AMOLED 2X","Tình trạng":"98% Fullbox"}'::jsonb,
  20500000, 'compensation',
  'Muốn đổi iPhone 15 Pro Max hoặc Galaxy S24 Ultra',
  'Tân Bình, TP. Hồ Chí Minh', 'approved',
  93.00, '{"verdict":"approved","summary":"Hợp lệ"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '7 days', NULL, NOW() - INTERVAL '7 days'
),
-- 17
(
  '33333333-3333-4333-8333-333333333317',
  '22222222-2222-4222-8222-222222222203',
  (SELECT id FROM categories WHERE code = 'iphone'),
  'iPhone 15 Plus 128GB Hồng Pastel VN/A Pin 100%',
  'Máy mới kích hoạt 3 tháng, pin 100% sạc 28 lần, thời lượng pin trâu nhất dòng 15, dùng cổng Type-C tiện lợi.',
  '📱',
  '{"Dung lượng":"128GB","Màu sắc":"Hồng Pastel","Pin":"100% (28 lần sạc)","Cổng sạc":"USB-C","Bảo hành":"Còn 9 tháng Apple VN"}'::jsonb,
  18200000, 'compensation',
  'Muốn đổi MacBook Air M2 hoặc iPhone 15 Pro bù tiền',
  'Gò Vấp, TP. Hồ Chí Minh', 'approved',
  95.80, '{"verdict":"approved","summary":"Rất rõ ràng"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '7 days', NULL, NOW() - INTERVAL '7 days'
),
-- 18
(
  '33333333-3333-4333-8333-333333333318',
  '22222222-2222-4222-8222-222222222204',
  (SELECT id FROM categories WHERE code = 'laptop'),
  'HP Spectre x360 14 OLED Cảm Ứng (i7-1355U / 16GB / 1TB)',
  'Laptop xoay gập 360 độ kèm bút cảm ứng zin HP, màn hình 3K2K OLED cảm ứng siêu đẹp, loa Bang & Olufsen.',
  '💻',
  '{"CPU":"Intel Core i7-1355U","RAM":"16GB","SSD":"1TB NVMe","Màn hình":"13.5 inch 3K2K OLED Touch","Phụ kiện":"Bút cảm ứng + Bao da"}'::jsonb,
  24500000, 'even',
  'Muốn đổi ngang MacBook Pro 14 M1 Pro 16GB hoặc iPhone 15 Pro Max',
  'Nam Từ Liêm, Hà Nội', 'approved',
  92.90, '{"verdict":"approved","summary":"Mô tả chi tiết"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '6 days', NULL, NOW() - INTERVAL '6 days'
),
-- 19
(
  '33333333-3333-4333-8333-333333333319',
  '22222222-2222-4222-8222-222222222205',
  (SELECT id FROM categories WHERE code = 'pc'),
  'PC Gaming White Theme i5-13600K / RTX 3080 10GB / 32GB',
  'Full bộ màu trắng cực đẹp, tản nhiệt nước trắng có màn LCD hiển thị nhiệt độ, dây nối dài bọc dù gọn gàng.',
  '🖥️',
  '{"CPU":"Intel Core i5-13600K","VGA":"RTX 3080 10GB White","RAM":"32GB DDR4 RGB","SSD":"1TB NVMe","Tản nhiệt":"AIO 240 LCD White"}'::jsonb,
  25500000, 'compensation',
  'Muốn đổi Laptop Gaming Legion / ROG hoặc MacBook Pro',
  'Phú Nhuận, TP. Hồ Chí Minh', 'approved',
  91.70, '{"verdict":"approved","summary":"Đạt yêu cầu"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '6 days', NULL, NOW() - INTERVAL '6 days'
),
-- 20
(
  '33333333-3333-4333-8333-333333333320',
  '22222222-2222-4222-8222-222222222206',
  (SELECT id FROM categories WHERE code = 'android'),
  'OnePlus 12 16GB/512GB Flowy Emerald Sạc 100W',
  'Màn hình cong 2K 120Hz sáng 4500 nits, pin 5400mAh dùng 2 ngày, sạc nhanh SuperVOOC 100W kèm hộp đầy đủ.',
  '📱',
  '{"Chip":"Snapdragon 8 Gen 3","RAM":"16GB","Bộ nhớ":"512GB","Pin":"5400mAh Sạc 100W","Camera":"Hasselblad 50MP"}'::jsonb,
  15800000, 'even',
  'Muốn đổi ngang iPhone 14 Pro hoặc Samsung S23 Ultra',
  'Thanh Khê, Đà Nẵng', 'approved',
  92.30, '{"verdict":"approved","summary":"Rõ ràng"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '5 days', NULL, NOW() - INTERVAL '5 days'
),
-- 21
(
  '33333333-3333-4333-8333-333333333321',
  '22222222-2222-4222-8222-222222222207',
  (SELECT id FROM categories WHERE code = 'laptop'),
  'MacBook Pro 16 M1 Pro (16GB / 1TB SSD) Silver',
  'Màn 16.2 inch Mini-LED siêu đẹp, loa 6 speaker nghe nhạc cực hay, ổ cứng 1TB thoải mái lưu trữ video và code.',
  '💻',
  '{"CPU":"Apple M1 Pro 10-Core","RAM":"16GB","SSD":"1TB","Màn hình":"16.2 inch Liquid Retina XDR","Pin":"92%"}'::jsonb,
  29800000, 'compensation',
  'Muốn đổi xuống MacBook Air M3 13 inch nhỏ gọn + bù tiền',
  'Hoàn Kiếm, Hà Nội', 'approved',
  95.20, '{"verdict":"approved","summary":"Rất tốt"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '5 days', NULL, NOW() - INTERVAL '5 days'
),
-- 22
(
  '33333333-3333-4333-8333-333333333322',
  '22222222-2222-4222-8222-222222222208',
  (SELECT id FROM categories WHERE code = 'iphone'),
  'iPhone 16 Pro 256GB Desert Titanium VN/A Like New',
  'Mới dùng 1 tháng, pin 100% chu kỳ sạc dưới 20, nút Camera Control nhạy, fullbox đầy đủ hóa đơn CellphoneS.',
  '📱',
  '{"Dung lượng":"256GB","Màu sắc":"Desert Titanium","Pin":"100%","Chip":"Apple A18 Pro","Bảo hành":"11 tháng chính hãng"}'::jsonb,
  29200000, 'compensation',
  'Muốn đổi MacBook Pro 14 M3 Pro hoặc dàn PC RTX 4070 Super',
  'Quận 2, TP. Hồ Chí Minh', 'approved',
  97.00, '{"verdict":"approved","summary":"Tin chất lượng cao"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '4 days', NULL, NOW() - INTERVAL '4 days'
),
-- 23
(
  '33333333-3333-4333-8333-333333333323',
  '22222222-2222-4222-8222-222222222209',
  (SELECT id FROM categories WHERE code = 'pc'),
  'PC Gaming Giá Tốt Ryzen 5 5600 / RX 6600 8GB / 16GB',
  'Dàn máy quốc dân cho sinh viên, chạy mượt LOL, FIFA Online 4, Valorant, GTA V và các phần mềm đồ họa 2D.',
  '🖥️',
  '{"CPU":"AMD Ryzen 5 5600","VGA":"Radeon RX 6600 8GB","RAM":"16GB DDR4 3200MHz","SSD":"512GB NVMe","Nguồn":"650W Bronze"}'::jsonb,
  11200000, 'compensation',
  'Muốn đổi Laptop văn phòng mỏng nhẹ mang đi học',
  'Vũng Tàu, Bà Rịa - Vũng Tàu', 'approved',
  90.40, '{"verdict":"approved","summary":"Giá tốt, rõ cấu hình"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '4 days', NULL, NOW() - INTERVAL '4 days'
),
-- 24
(
  '33333333-3333-4333-8333-333333333324',
  '22222222-2222-4222-8222-222222222210',
  (SELECT id FROM categories WHERE code = 'android'),
  'OPPO Find X7 Ultra 16GB/256GB — 2 Camera Tiềm Vọng',
  'Chuyên gia chân dung Hasselblad, ngoại hình 99% lưng da hai tông màu sang trọng, sạc nhanh 100W.',
  '📱',
  '{"Chip":"Snapdragon 8 Gen 3","RAM":"16GB","Bộ nhớ":"256GB","Camera":"Dual Periscope Hasselblad","Pin":"5000mAh Sạc 100W"}'::jsonb,
  17900000, 'even',
  'Muốn đổi ngang Samsung Galaxy S24 Plus hoặc iPhone 14 Pro Max',
  'Long Biên, Hà Nội', 'approved',
  91.60, '{"verdict":"approved","summary":"Hợp lệ"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '3 days', NULL, NOW() - INTERVAL '3 days'
),
-- 25 (Đã hoàn tất giao dịch - completed)
(
  '33333333-3333-4333-8333-333333333325',
  '22222222-2222-4222-8222-222222222203',
  (SELECT id FROM categories WHERE code = 'laptop'),
  'Acer Predator Helios Neo 16 (i5-13500HX / RTX 4050 / 16GB)',
  'Máy gaming màn 16 inch 165Hz, còn bảo hành hãng, đã hoàn tất giao dịch đổi sang MacBook.',
  '💻',
  '{"CPU":"Intel Core i5-13500HX","VGA":"RTX 4050 6GB","RAM":"16GB DDR5","SSD":"512GB","Màn hình":"16 inch FHD+ 165Hz"}'::jsonb,
  19800000, 'compensation',
  'Muốn đổi MacBook Air M2 hoặc iPhone 15',
  'Quận 1, TP. Hồ Chí Minh', 'completed',
  92.00, '{"verdict":"approved","summary":"Đã hoàn tất trao đổi"}'::jsonb,
  '22222222-2222-4222-8222-222222222201', NOW() - INTERVAL '15 days', NULL, NOW() - INTERVAL '15 days'
),
-- 26 (Đã hoàn tất giao dịch - completed)
(
  '33333333-3333-4333-8333-333333333326',
  '22222222-2222-4222-8222-222222222205',
  (SELECT id FROM categories WHERE code = 'iphone'),
  'iPhone 13 128GB Starlight VN/A Pin 90% Fullbox',
  'Máy nhỏ gọn dùng làm máy phụ, ngoại hình đẹp không trầy, đã giao lưu thành công.',
  '📱',
  '{"Dung lượng":"128GB","Màu sắc":"Starlight","Pin":"90%","Xuất xứ":"VN/A"}'::jsonb,
  10500000, 'even',
  'Muốn đổi Xiaomi 13 hoặc Pixel 7 Pro',
  'Bình Thạnh, TP. Hồ Chí Minh', 'completed',
  90.00, '{"verdict":"approved","summary":"Đã hoàn tất trao đổi"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '12 days', NULL, NOW() - INTERVAL '12 days'
),
-- 27 (Chờ duyệt - pending)
(
  '33333333-3333-4333-8333-333333333327',
  '22222222-2222-4222-8222-222222222208',
  (SELECT id FROM categories WHERE code = 'laptop'),
  'MSI Katana 15 B13V (i7-13620H / RTX 4060 / 16GB / 1TB)',
  'Máy mới mua 5 tháng, còn tem bảo hành chính hãng MSI Việt Nam, phím RGB 4 vùng, chiến game cực ổn.',
  '💻',
  '{"CPU":"Intel Core i7-13620H","VGA":"RTX 4060 8GB","RAM":"16GB DDR5","SSD":"1TB NVMe","Màn hình":"15.6 inch 144Hz"}'::jsonb,
  23200000, 'compensation',
  'Muốn đổi MacBook Air M2 16GB hoặc iPhone 15 Pro',
  'Ninh Kiều, Cần Thơ', 'pending',
  87.50, '{"verdict":"review","summary":"Đang chờ quản trị viên kiểm tra hình ảnh thực tế"}'::jsonb,
  NULL, NULL, NULL, NOW() - INTERVAL '1 day'
),
-- 28 (Chờ duyệt - pending)
(
  '33333333-3333-4333-8333-333333333328',
  '22222222-2222-4222-8222-222222222209',
  (SELECT id FROM categories WHERE code = 'android'),
  'Samsung Galaxy S23 Ultra 12GB/512GB Xanh Botanic SSVN',
  'Dung lượng lớn 512GB thoải mái quay 4K, máy đẹp 98% viền có xước dăm nhẹ theo thời gian, pin vẫn rất khỏe.',
  '📱',
  '{"RAM":"12GB","Bộ nhớ":"512GB","Màu sắc":"Xanh Botanic","Camera":"200MP Zoom 100x"}'::jsonb,
  16900000, 'compensation',
  'Muốn đổi iPhone 14 Pro Max 256GB hoặc MacBook Air M1/M2',
  'Quận 5, TP. Hồ Chí Minh', 'pending',
  86.00, '{"verdict":"review","summary":"Chờ duyệt thủ công"}'::jsonb,
  NULL, NULL, NULL, NOW() - INTERVAL '12 hours'
),
-- 29 (Chờ duyệt - pending)
(
  '33333333-3333-4333-8333-333333333329',
  '22222222-2222-4222-8222-222222222210',
  (SELECT id FROM categories WHERE code = 'pc'),
  'PC Gaming Full Bộ i5-12400F / RTX 3060 12GB + Màn 27 inch 165Hz',
  'Bán hoặc đổi cả bộ kèm màn hình 27 inch IPS 165Hz, phím cơ và chuột không dây. Cắm điện là dùng ngay.',
  '🖥️',
  '{"CPU":"Intel Core i5-12400F","VGA":"RTX 3060 12GB","RAM":"16GB DDR4","SSD":"512GB NVMe","Màn hình":"27 inch IPS 165Hz"}'::jsonb,
  16500000, 'even',
  'Muốn đổi ngang Laptop Gaming hoặc MacBook Air M2',
  'Đống Đa, Hà Nội', 'pending',
  85.20, '{"verdict":"review","summary":"Chờ kiểm duyệt nội dung combo màn hình"}'::jsonb,
  NULL, NULL, NULL, NOW() - INTERVAL '6 hours'
),
-- 30 (Bị từ chối - rejected)
(
  '33333333-3333-4333-8333-333333333330',
  '22222222-2222-4222-8222-222222222204',
  (SELECT id FROM categories WHERE code = 'iphone'),
  'iPhone 12 Pro Max Lock chưa rõ tình trạng',
  'Máy cũ cần đổi nhanh.',
  '📱',
  '{"Dung lượng":"128GB"}'::jsonb,
  7500000, 'even',
  'Đổi điện thoại gì cũng được',
  'Hà Nội', 'rejected',
  42.00, '{"verdict":"rejected","summary":"Mô tả quá sơ sài, thiếu thông tin tình trạng pin và xuất xứ"}'::jsonb,
  '22222222-2222-4222-8222-222222222202', NOW() - INTERVAL '2 days',
  'Mô tả sản phẩm quá ngắn, thiếu thông số kỹ thuật và ảnh thực tế thiết bị.',
  NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- 5. HÌNH ẢNH SẢN PHẨM (listing_images - 2 ảnh/tin đăng cho 30 sản phẩm = 60 bản ghi)
INSERT INTO listing_images (id, listing_id, image_url, sort_order) VALUES
  -- Laptop listings
  ('44444444-4444-4444-8444-444444440101', '33333333-3333-4333-8333-333333333301', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444440102', '33333333-3333-4333-8333-333333333301', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444440201', '33333333-3333-4333-8333-333333333302', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444440202', '33333333-3333-4333-8333-333333333302', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444440301', '33333333-3333-4333-8333-333333333303', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444440302', '33333333-3333-4333-8333-333333333303', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444440401', '33333333-3333-4333-8333-333333333304', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444440402', '33333333-3333-4333-8333-333333333304', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444440501', '33333333-3333-4333-8333-333333333305', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444440502', '33333333-3333-4333-8333-333333333305', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444440601', '33333333-3333-4333-8333-333333333306', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444440602', '33333333-3333-4333-8333-333333333306', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444440701', '33333333-3333-4333-8333-333333333307', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444440702', '33333333-3333-4333-8333-333333333307', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444440801', '33333333-3333-4333-8333-333333333308', 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444440802', '33333333-3333-4333-8333-333333333308', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444440901', '33333333-3333-4333-8333-333333333309', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444440902', '33333333-3333-4333-8333-333333333309', 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444441001', '33333333-3333-4333-8333-333333333310', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444441002', '33333333-3333-4333-8333-333333333310', 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444441101', '33333333-3333-4333-8333-333333333311', 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444441102', '33333333-3333-4333-8333-333333333311', 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444441201', '33333333-3333-4333-8333-333333333312', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444441202', '33333333-3333-4333-8333-333333333312', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444441301', '33333333-3333-4333-8333-333333333313', 'https://images.unsplash.com/photo-1598327105854-c8674faddf79?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444441302', '33333333-3333-4333-8333-333333333313', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444441401', '33333333-3333-4333-8333-333333333314', 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444441402', '33333333-3333-4333-8333-333333333314', 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444441501', '33333333-3333-4333-8333-333333333315', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444441502', '33333333-3333-4333-8333-333333333315', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444441601', '33333333-3333-4333-8333-333333333316', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444441602', '33333333-3333-4333-8333-333333333316', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444441701', '33333333-3333-4333-8333-333333333317', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444441702', '33333333-3333-4333-8333-333333333317', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444441801', '33333333-3333-4333-8333-333333333318', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444441802', '33333333-3333-4333-8333-333333333318', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444441901', '33333333-3333-4333-8333-333333333319', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444441902', '33333333-3333-4333-8333-333333333319', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444442001', '33333333-3333-4333-8333-333333333320', 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444442002', '33333333-3333-4333-8333-333333333320', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444442101', '33333333-3333-4333-8333-333333333321', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444442102', '33333333-3333-4333-8333-333333333321', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444442201', '33333333-3333-4333-8333-333333333322', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444442202', '33333333-3333-4333-8333-333333333322', 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444442301', '33333333-3333-4333-8333-333333333323', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444442302', '33333333-3333-4333-8333-333333333323', 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444442401', '33333333-3333-4333-8333-333333333324', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444442402', '33333333-3333-4333-8333-333333333324', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444442501', '33333333-3333-4333-8333-333333333325', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444442502', '33333333-3333-4333-8333-333333333325', 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444442601', '33333333-3333-4333-8333-333333333326', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444442602', '33333333-3333-4333-8333-333333333326', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444442701', '33333333-3333-4333-8333-333333333327', 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444442702', '33333333-3333-4333-8333-333333333327', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444442801', '33333333-3333-4333-8333-333333333328', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444442802', '33333333-3333-4333-8333-333333333328', 'https://images.unsplash.com/photo-1598327105854-c8674faddf79?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444442901', '33333333-3333-4333-8333-333333333329', 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444442902', '33333333-3333-4333-8333-333333333329', 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1000&q=80', 1),
  ('44444444-4444-4444-8444-444444443001', '33333333-3333-4333-8333-333333333330', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80', 0),
  ('44444444-4444-4444-8444-444444443002', '33333333-3333-4333-8333-333333333330', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1000&q=80', 1)
ON CONFLICT (id) DO NOTHING;

-- 6. LỊCH SỬ KIỂM DUYỆT (listing_moderation_history)
INSERT INTO listing_moderation_history (id, listing_id, moderator_id, action, reason) VALUES
  ('55555555-5555-4555-8555-555555555501', '33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222201', 'approved', 'Tin đăng đạt chuẩn chất lượng CEP'),
  ('55555555-5555-4555-8555-555555555502', '33333333-3333-4333-8333-333333333302', '22222222-2222-4222-8222-222222222201', 'approved', 'AI Auto-Pilot tự duyệt (94/100)'),
  ('55555555-5555-4555-8555-555555555503', '33333333-3333-4333-8333-333333333303', '22222222-2222-4222-8222-222222222202', 'approved', 'Đã xác minh cấu hình PC'),
  ('55555555-5555-4555-8555-555555555504', '33333333-3333-4333-8333-333333333330', '22222222-2222-4222-8222-222222222202', 'rejected', 'Thiếu mô tả chi tiết tình trạng pin và ảnh thật')
ON CONFLICT (id) DO NOTHING;

-- 7. GIAO DỊCH TRAO ĐỔI (trades - đủ các trạng thái để test /trades)
INSERT INTO trades (
  id, listing_id, proposer_id, receiver_id, offered_device_name, offered_device_specs,
  compensation_type, compensation_amount, current_step, status, note, completed_at
) VALUES
  -- Pending (để test nút Chấp nhận / Từ chối / Hủy giao dịch)
  (
    '66666666-6666-4666-8666-666666666601',
    '33333333-3333-4333-8333-333333333301',
    '22222222-2222-4222-8222-222222222204',
    '22222222-2222-4222-8222-222222222203',
    'iPhone 15 Pro Max 256GB Titan Tự Nhiên VN/A',
    '{"Pin":"98%","Phụ kiện":"Fullbox"}'::jsonb,
    'proposer_adds', 3500000, 1, 'pending',
    'Mình mang iPhone 15 Pro Max bù thêm 3.5 triệu, gặp trực tiếp tại Quận 1 test máy.', NULL
  ),
  -- Agreed (Bước 2)
  (
    '66666666-6666-4666-8666-666666666602',
    '33333333-3333-4333-8333-333333333302',
    '22222222-2222-4222-8222-222222222205',
    '22222222-2222-4222-8222-222222222204',
    'Samsung Galaxy S24 Ultra 256GB SSVN',
    '{"Pin":"99%","Bảo hành":"Care+"}'::jsonb,
    'proposer_adds', 3000000, 2, 'agreed',
    'Đã thống nhất mức bù 3 triệu, hẹn thứ 7 kiểm định tại CEP Care.', NULL
  ),
  -- Inspecting (Bước 3)
  (
    '66666666-6666-4666-8666-666666666603',
    '33333333-3333-4333-8333-333333333303',
    '22222222-2222-4222-8222-222222222208',
    '22222222-2222-4222-8222-222222222206',
    'ASUS ROG Zephyrus G14 Ryzen 9 / RTX 4060',
    '{"RAM":"16GB","SSD":"1TB"}'::jsonb,
    'proposer_adds', 6000000, 3, 'inspecting',
    'Kỹ thuật viên đang chạy benchmark GPU và kiểm tra nhiệt độ CPU.', NULL
  ),
  -- Completed (Bước 5)
  (
    '66666666-6666-4666-8666-666666666604',
    '33333333-3333-4333-8333-333333333325',
    '22222222-2222-4222-8222-222222222207',
    '22222222-2222-4222-8222-222222222203',
    'MacBook Air M2 13.6 inch Midnight',
    '{"RAM":"8GB","SSD":"256GB"}'::jsonb,
    'proposer_adds', 2000000, 5, 'completed',
    'Giao dịch hoàn tất suôn sẻ, hai bên đều hài lòng.', NOW() - INTERVAL '10 days'
  ),
  -- Completed (Bước 5)
  (
    '66666666-6666-4666-8666-666666666605',
    '33333333-3333-4333-8333-333333333326',
    '22222222-2222-4222-8222-222222222209',
    '22222222-2222-4222-8222-222222222205',
    'Google Pixel 7 Pro 128GB',
    '{"Tình trạng":"98%"}'::jsonb,
    'even', 0, 5, 'completed',
    'Đổi ngang nhanh gọn tại trung tâm kiểm định.', NOW() - INTERVAL '8 days'
  ),
  -- Rejected (Bị từ chối)
  (
    '66666666-6666-4666-8666-666666666606',
    '33333333-3333-4333-8333-333333333304',
    '22222222-2222-4222-8222-222222222210',
    '22222222-2222-4222-8222-222222222205',
    'iPhone 13 128GB cũ',
    '{"Pin":"83%"}'::jsonb,
    'even', 0, 1, 'rejected',
    'Chênh lệch giá trị lớn nên chủ máy từ chối đổi ngang.', NULL
  ),
  -- Cancelled (Người đổi hủy)
  (
    '66666666-6666-4666-8666-666666666607',
    '33333333-3333-4333-8333-333333333306',
    '22222222-2222-4222-8222-222222222203',
    '22222222-2222-4222-8222-222222222208',
    'Dell XPS 13 9315 Core i7',
    '{"RAM":"16GB"}'::jsonb,
    'proposer_adds', 5000000, 1, 'cancelled',
    'Người đề xuất thay đổi kế hoạch nên chủ động hủy giao dịch.', NULL
  )
ON CONFLICT (id) DO NOTHING;

-- 8. LỊCH SỬ TRẠNG THÁI GIAO DỊCH (trade_status_history)
INSERT INTO trade_status_history (id, trade_id, actor_id, from_status, to_status, from_step, to_step, note) VALUES
  ('77777777-7777-4777-8777-777777777701', '66666666-6666-4666-8666-666666666601', '22222222-2222-4222-8222-222222222204', NULL, 'pending', NULL, 1, 'Tạo đề xuất trao đổi'),
  ('77777777-7777-4777-8777-777777777702', '66666666-6666-4666-8666-666666666602', '22222222-2222-4222-8222-222222222204', 'pending', 'agreed', 1, 2, 'Chủ tin chấp nhận đề xuất'),
  ('77777777-7777-4777-8777-777777777703', '66666666-6666-4666-8666-666666666603', '22222222-2222-4222-8222-222222222206', 'agreed', 'inspecting', 2, 3, 'Chuyển sang bước kiểm định phần cứng'),
  ('77777777-7777-4777-8777-777777777704', '66666666-6666-4666-8666-666666666604', '22222222-2222-4222-8222-222222222203', 'inspecting', 'completed', 4, 5, 'Hoàn tất bàn giao thiết bị')
ON CONFLICT (id) DO NOTHING;

-- 9. HỘI THOẠI & TIN NHẮN (conversations, conversation_participants, messages)
INSERT INTO conversations (id, trade_id) VALUES
  ('88888888-8888-4888-8888-888888888801', '66666666-6666-4666-8666-666666666602'),
  ('88888888-8888-4888-8888-888888888802', '66666666-6666-4666-8666-666666666603')
ON CONFLICT (trade_id) DO NOTHING;

INSERT INTO conversation_participants (conversation_id, user_id) VALUES
  ('88888888-8888-4888-8888-888888888801', '22222222-2222-4222-8222-222222222205'),
  ('88888888-8888-4888-8888-888888888801', '22222222-2222-4222-8222-222222222204'),
  ('88888888-8888-4888-8888-888888888802', '22222222-2222-4222-8222-222222222208'),
  ('88888888-8888-4888-8888-888888888802', '22222222-2222-4222-8222-222222222206')
ON CONFLICT DO NOTHING;

INSERT INTO messages (id, conversation_id, sender_id, content, message_type) VALUES
  ('99999999-9999-4999-8999-999999999901', '88888888-8888-4888-8888-888888888801', '22222222-2222-4222-8222-222222222205', 'Chào bạn, máy S24 Ultra của mình fullbox còn bảo hành, mình bù 3 triệu được không?', 'text'),
  ('99999999-9999-4999-8999-999999999902', '88888888-8888-4888-8888-888888888801', '22222222-2222-4222-8222-222222222204', 'Ok bạn nhé, cuối tuần mình gặp ở trung tâm CEP Care Cầu Giấy kiểm định luôn.', 'text'),
  ('99999999-9999-4999-8999-999999999903', '88888888-8888-4888-8888-888888888802', '22222222-2222-4222-8222-222222222208', 'Mình đã mang G14 qua điểm kiểm định, đang chờ kỹ thuật viên test VGA.', 'text'),
  ('99999999-9999-4999-8999-999999999904', '88888888-8888-4888-8888-888888888802', '22222222-2222-4222-8222-222222222206', 'Ok mình cũng đang trên đường mang thùng PC ra nhé!', 'text')
ON CONFLICT (id) DO NOTHING;

-- 10. ĐÁNH GIÁ & PHẢN HỒI (reviews, review_replies, review_helpful_votes)
INSERT INTO reviews (id, listing_id, user_id, trade_id, rating, comment, tags, is_verified_trade) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', '33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222204', NULL, 5, 'Máy MacBook thực tế còn mới hơn ảnh, chủ máy tư vấn rất nhiệt tình.', ARRAY['Máy đúng mô tả 💯','Chủ máy nhiệt tình 👍'], TRUE),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '33333333-3333-4333-8333-333333333302', '22222222-2222-4222-8222-222222222205', '66666666-6666-4666-8666-666666666602', 5, 'Kiểm định phần cứng đạt 100%, pin đúng 98%, rất uy tín!', ARRAY['Kiểm định đạt chuẩn ✅','Giao dịch nhanh chóng ⚡'], TRUE),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03', '33333333-3333-4333-8333-333333333303', '22222222-2222-4222-8222-222222222208', '66666666-6666-4666-8666-666666666603', 5, 'Dàn PC chạy cực êm và mát, dây đi gọn gàng.', ARRAY['Bảo quản cẩn thận ✨','Kiểm định đạt chuẩn ✅'], TRUE),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04', '33333333-3333-4333-8333-333333333304', '22222222-2222-4222-8222-222222222207', NULL, 4, 'S24 Ultra ngoại hình đẹp, bút S-Pen mượt, phản hồi tin nhắn nhanh.', ARRAY['Máy đúng mô tả 💯'], FALSE),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05', '33333333-3333-4333-8333-333333333325', '22222222-2222-4222-8222-222222222207', '66666666-6666-4666-8666-666666666604', 5, 'Đổi máy nhanh gọn, minh bạch, lần sau sẽ tiếp tục giao lưu trên CEP.', ARRAY['Giao dịch nhanh chóng ⚡','Đổi ngang giá trị 🤝'], TRUE),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06', '33333333-3333-4333-8333-333333333326', '22222222-2222-4222-8222-222222222209', '66666666-6666-4666-8666-666666666605', 5, 'Chủ máy thân thiện, máy đẹp nguyên zin đúng cam kết.', ARRAY['Chủ máy nhiệt tình 👍','Máy đúng mô tả 💯'], TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO review_replies (id, review_id, user_id, content) VALUES
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', '22222222-2222-4222-8222-222222222203', 'Cảm ơn bạn nhiều nhé, chúc bạn dùng máy ổn định!'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '22222222-2222-4222-8222-222222222204', 'Cảm ơn bạn đã tin tưởng giao lưu cùng mình.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO review_helpful_votes (review_id, user_id) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', '22222222-2222-4222-8222-222222222205'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', '22222222-2222-4222-8222-222222222206'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', '22222222-2222-4222-8222-222222222203')
ON CONFLICT DO NOTHING;

-- 11. NHẬT KÝ HỆ THỐNG (audit_logs)
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details) VALUES
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc01', '22222222-2222-4222-8222-222222222201', 'listing.approved', 'listing', '33333333-3333-4333-8333-333333333301', '{"note":"Duyệt tin đăng mẫu #01"}'::jsonb),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc02', '22222222-2222-4222-8222-222222222202', 'listing.rejected', 'listing', '33333333-3333-4333-8333-333333333330', '{"reason":"Mô tả quá ngắn"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

COMMIT;
