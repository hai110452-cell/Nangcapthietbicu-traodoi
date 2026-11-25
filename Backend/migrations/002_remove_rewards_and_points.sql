-- Migration 002: Bỏ tính năng Điểm Xanh & Phần thưởng
DROP TABLE IF EXISTS user_points_transactions CASCADE;
DROP TABLE IF EXISTS reward_redemptions CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
