"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function WireframePage() {
  const [activeScreenTab, setActiveScreenTab] = useState<number>(0);

  const screens = [
    {
      title: "01. Trang Chủ Feed",
      subtitle: "Khám phá & Tiến trình đang đổi",
      render: (
        <div style={mockupInnerStyle}>
          {/* Top Status */}
          <div style={statusBarStyle}>
            <span>9:41</span>
            <span style={{ letterSpacing: "2px" }}>● ▰ ▰</span>
          </div>

          {/* App Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <span style={{ fontSize: "10px", color: "#059669", fontWeight: "800", letterSpacing: "0.5px" }}>CEP.EXCHANGE</span>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>Xin chào, Tuấn Anh 👋</div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={circleIconStyle}>🔔</div>
              <div style={circleIconStyle}>👤</div>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>
            <span>🔍</span> Tìm máy, thông số, mức bù trừ...
          </div>

          {/* Đang trao đổi widget */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
              <strong style={{ color: "#0f172a" }}>Đang giao dịch</strong>
              <span style={{ color: "#059669", fontWeight: "700" }}>01 đề xuất</span>
            </div>
            <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "8px 10px", borderRadius: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "20px" }}>💻</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#065f46", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  MacBook Pro ⇄ iPhone 15 PRM
                </div>
                <div style={{ fontSize: "9.5px", color: "#047857" }}>Hẹn: 14:00 ngày mai tại Trạm Q.1</div>
              </div>
              <span style={{ fontSize: "10px", background: "#10b981", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>Bước 3/5</span>
            </div>
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "12px", overflowX: "auto" }}>
            {["Tất cả", "Laptop", "PC", "iPhone"].map((cat, i) => (
              <span
                key={cat}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: "700",
                  background: i === 0 ? "#059669" : "#f1f5f9",
                  color: i === 0 ? "#fff" : "#475569",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Featured Items */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px" }}>
            <strong style={{ color: "#0f172a" }}>Thiết bị nổi bật</strong>
            <span style={{ color: "#64748b", fontSize: "10px" }}>Xem tất cả</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {[
              { name: "iPhone 14 Pro", val: "16.8tr", type: "Đổi ngang", icon: "📱", bg: "#f3e8ff" },
              { name: "MacBook Air M2", val: "19.5tr", type: "Bù trừ", icon: "💻", bg: "#e0f2fe" },
              { name: "PC Gaming i5", val: "15.5tr", type: "Bù trừ", icon: "🖥️", bg: "#dcfce7" },
              { name: "Galaxy S24 Ultra", val: "22.8tr", type: "Đổi ngang", icon: "🤖", bg: "#fef9c3" },
            ].map((d, idx) => (
              <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px" }}>
                <div style={{ height: "45px", background: d.bg, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "6px" }}>
                  {d.icon}
                </div>
                <div style={{ fontSize: "10.5px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {d.name}
                </div>
                <div style={{ fontSize: "10px", color: "#059669", fontWeight: "800" }}>{d.val}</div>
                <span style={{ fontSize: "8.5px", background: "#f1f5f9", padding: "1px 4px", borderRadius: "4px", color: "#475569" }}>
                  {d.type}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Nav */}
          <div style={bottomNavStyle}>
            <span style={{ color: "#059669", fontWeight: "800" }}>🏠 Home</span>
            <span>🔍 Tìm</span>
            <span>⇄ Đổi</span>
            <span>💬 Chat</span>
          </div>
        </div>
      ),
    },
    {
      title: "02. Chi Tiết Thiết Bị",
      subtitle: "Thông số, thẩm định giá & nhu cầu đổi",
      render: (
        <div style={mockupInnerStyle}>
          <div style={statusBarStyle}>
            <span>9:41</span>
            <span>● ▰ ▰</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px" }}>←</span>
            <strong style={{ fontSize: "12px" }}>Chi tiết thiết bị</strong>
            <span style={{ fontSize: "13px" }}>🔖</span>
          </div>

          {/* Large Image Box */}
          <div style={{ height: "110px", background: "linear-gradient(135deg, #1e293b, #0f172a)", borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", marginBottom: "10px" }}>
            <span style={{ fontSize: "36px" }}>💻</span>
            <span style={{ fontSize: "10px", opacity: 0.8 }}>MacBook Pro 14 M2 Pro</span>
          </div>

          <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
            MacBook Pro 14 M2 Pro (16GB / 512GB)
          </div>
          <div style={{ fontSize: "10px", color: "#64748b", margin: "2px 0 6px" }}>
            Chủ máy: <strong>Tuấn Anh</strong> • <span style={{ color: "#eab308" }}>⭐ 4.9/5</span> (18 lần đổi)
          </div>

          {/* Stock & Location */}
          <div style={{ fontSize: "10px", background: "#ecfdf5", color: "#047857", padding: "4px 8px", borderRadius: "6px", marginBottom: "8px", fontWeight: "700" }}>
            ● Sẵn sàng đổi • Kiểm định tại Trạm Q.1
          </div>

          {/* Specs Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", marginBottom: "8px", textAlign: "center" }}>
            <div style={specBoxStyle}>
              <div style={{ fontSize: "9px", color: "#64748b" }}>RAM</div>
              <strong style={{ fontSize: "11px" }}>16GB</strong>
            </div>
            <div style={specBoxStyle}>
              <div style={{ fontSize: "9px", color: "#64748b" }}>SSD</div>
              <strong style={{ fontSize: "11px" }}>512GB</strong>
            </div>
            <div style={specBoxStyle}>
              <div style={{ fontSize: "9px", color: "#64748b" }}>Pin</div>
              <strong style={{ fontSize: "11px" }}>96%</strong>
            </div>
          </div>

          {/* Target Demand Box */}
          <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", padding: "8px", borderRadius: "8px", marginBottom: "10px" }}>
            <div style={{ fontSize: "10px", fontWeight: "800", color: "#059669" }}>⇄ Nhu cầu muốn đổi:</div>
            <div style={{ fontSize: "9.5px", color: "#334155", marginTop: "2px", lineHeight: "1.3" }}>
              Muốn đổi iPhone 15 Pro Max hoặc bù trừ PC Gaming tương đương
            </div>
          </div>

          <div style={{ fontSize: "9px", color: "#64748b", background: "#fefce8", padding: "4px 8px", borderRadius: "4px", marginBottom: "12px" }}>
            🛡️ Bảo chứng CEP Escrow: Test mainboard & pin miễn phí.
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}>
              Xem đánh giá
            </button>
            <button style={{ flex: 1.5, padding: "8px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontSize: "10px", fontWeight: "800", cursor: "pointer" }}>
              Đề xuất đổi máy ngay
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "03. Máy Tính Bù Trừ",
      subtitle: "Khớp máy hai chiều & tính tiền chênh lệch",
      render: (
        <div style={mockupInnerStyle}>
          <div style={statusBarStyle}>
            <span>9:41</span>
            <span>● ▰ ▰</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px" }}>←</span>
            <strong style={{ fontSize: "12px" }}>Đề xuất trao đổi máy</strong>
          </div>

          {/* Device A */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "8px", marginBottom: "6px" }}>
            <div style={{ fontSize: "9px", color: "#64748b" }}>THIẾT BỊ BẠN MUỐN NHẬN:</div>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#0f172a" }}>💻 MacBook Pro 14 M2 Pro</div>
            <div style={{ fontSize: "10.5px", color: "#059669", fontWeight: "700" }}>28.500.000 đ</div>
          </div>

          <div style={{ textAlign: "center", fontSize: "12px", color: "#059669", margin: "2px 0" }}>⇄ HOÁN ĐỔI VỚI</div>

          {/* Device B */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "8px", marginBottom: "10px" }}>
            <div style={{ fontSize: "9px", color: "#64748b" }}>THIẾT BỊ BẠN MANG ĐỔI:</div>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#0f172a" }}>📱 iPhone 14 Pro 128GB VN/A</div>
            <div style={{ fontSize: "10.5px", color: "#059669", fontWeight: "700" }}>16.800.000 đ</div>
          </div>

          {/* AI Calculation Result */}
          <div style={{ background: "#ecfdf5", border: "1.5px solid #6ee7b7", padding: "10px", borderRadius: "10px", marginBottom: "10px" }}>
            <div style={{ fontSize: "10px", fontWeight: "800", color: "#065f46" }}>🧠 AI TÍNH TOÁN BÙ TRỪ:</div>
            <div style={{ fontSize: "9.5px", color: "#047857", marginTop: "2px" }}>Chênh lệch: 11.700.000 đ</div>
            <div style={{ fontSize: "12px", fontWeight: "900", color: "#059669", marginTop: "2px" }}>
              👉 Bạn cần bù thêm: 11.700.000 đ
            </div>
          </div>

          {/* Choose Location */}
          <div style={{ fontSize: "10px", fontWeight: "700", marginBottom: "4px" }}>Địa điểm kiểm định:</div>
          <div style={{ fontSize: "9.5px", background: "#f1f5f9", padding: "6px 8px", borderRadius: "6px", marginBottom: "10px", color: "#334155" }}>
            📍 Trạm CEP Care: 123 Nguyễn Huệ, Quận 1, TP.HCM
          </div>

          {/* Note Input */}
          <div style={{ fontSize: "10px", fontWeight: "700", marginBottom: "4px" }}>Lời nhắn:</div>
          <div style={{ fontSize: "9px", background: "#fff", border: "1px solid #cbd5e1", padding: "6px 8px", borderRadius: "6px", color: "#64748b", marginBottom: "12px" }}>
            Máy mình đẹp 98%, pin 91%, sẵn sàng bù 11.7tr nhé!
          </div>

          <button style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}>
            Xác Nhận & Gửi Đề Xuất
          </button>
        </div>
      ),
    },
    {
      title: "04. Mã QR & Phiếu Đổi",
      subtitle: "Phiếu hẹn kiểm định tại trạm CEP Care",
      render: (
        <div style={mockupInnerStyle}>
          <div style={statusBarStyle}>
            <span>9:41</span>
            <span>● ▰ ▰</span>
          </div>

          <div style={{ textAlign: "center", margin: "10px 0 8px" }}>
            <span style={{ fontSize: "36px" }}>🎉</span>
            <div style={{ fontSize: "13px", fontWeight: "900", color: "#0f172a" }}>Gửi Đề Xuất Thành Công!</div>
            <div style={{ fontSize: "9.5px", color: "#64748b", marginTop: "2px" }}>
              Vui lòng xuất trình mã QR này tại quầy kiểm định CEP Care
            </div>
          </div>

          {/* QR Code Container */}
          <div style={{ background: "#ffffff", border: "1.5px solid #cbd5e1", borderRadius: "10px", padding: "10px", textAlign: "center", margin: "0 auto 10px", width: "140px" }}>
            <div style={{ fontSize: "9px", fontWeight: "800", color: "#64748b", marginBottom: "4px" }}>MÃ GIAO DỊCH</div>
            <div style={{ width: "90px", height: "90px", background: "#0f172a", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "28px", borderRadius: "6px" }}>
              QR
            </div>
            <div style={{ fontSize: "10px", fontWeight: "900", color: "#059669", marginTop: "4px" }}>
              #CEP-2026-889
            </div>
          </div>

          {/* Details list */}
          <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", fontSize: "9.5px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
              <span style={{ color: "#64748b" }}>Giao lưu:</span>
              <strong>MacBook ⇄ iPhone 14 Pro</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
              <span style={{ color: "#64748b" }}>Địa điểm:</span>
              <strong>CEP Care Q.1, TP.HCM</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Thời hạn:</span>
              <strong style={{ color: "#059669" }}>Trong vòng 24 giờ</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", fontSize: "9.5px", fontWeight: "700" }}>
              Tủ đồ của tôi
            </button>
            <button style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: "#059669", color: "#fff", fontSize: "9.5px", fontWeight: "800" }}>
              Về trang chủ
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "05. Hoàn Tất Giao Dịch",
      subtitle: "Biên bản bàn giao & đánh giá giao dịch",
      render: (
        <div style={mockupInnerStyle}>
          <div style={statusBarStyle}>
            <span>9:41</span>
            <span>● ▰ ▰</span>
          </div>

          <div style={{ textAlign: "center", margin: "14px 0 10px" }}>
            <span style={{ fontSize: "38px" }}>✅</span>
            <div style={{ fontSize: "13.5px", fontWeight: "900", color: "#0f172a" }}>Đổi Máy Hoàn Tất!</div>
            <div style={{ fontSize: "9.5px", color: "#64748b", marginTop: "2px" }}>
              Thiết bị đã được kỹ thuật viên phê duyệt & bàn giao
            </div>
          </div>

          {/* Escrow Certificate */}
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "10px", borderRadius: "10px", marginBottom: "12px", textAlign: "left" }}>
            <div style={{ fontSize: "10px", fontWeight: "800", color: "#065f46", marginBottom: "4px" }}>
              BIÊN BẢN BẢO CHỨNG CEP ESCROW
            </div>
            <div style={{ fontSize: "9.5px", color: "#047857", lineHeight: "1.4" }}>
              • Mã số: #TXN-99214<br />
              • Kiểm định phần cứng: Đạt chuẩn 100%<br />
              • Bảo hành đổi trả: 7 ngày tại CEP Care
            </div>
          </div>

          {/* Trade Success Box */}
          <div style={{ background: "linear-gradient(135deg, #065f46, #047857)", color: "#fff", padding: "12px", borderRadius: "10px", textAlign: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "20px" }}>🤝</span>
            <div style={{ fontSize: "13px", fontWeight: "900" }}>GIAO DỊCH THÀNH CÔNG</div>
            <div style={{ fontSize: "9px", opacity: 0.9, marginTop: "2px" }}>
              Hai bên đã hoàn tất nhận thiết bị và đối soát thông số an toàn.
            </div>
          </div>

          <button style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "#0f172a", color: "#fff", fontSize: "10px", fontWeight: "800", cursor: "pointer" }}>
            Đánh Giá Đối Tác Trao Đổi
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      <Navbar />

      <main style={{ maxWidth: "1440px", margin: "30px auto 80px", padding: "0 24px" }}>
        {/* Banner tiêu đề */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              padding: "6px 16px",
              borderRadius: "9999px",
              fontSize: "13px",
              fontWeight: "700",
              color: "#059669",
              marginBottom: "12px",
            }}
          >
            <span>📐 UI/UX Design System</span> • Chuyển hóa mô hình từ trong1.pdf
          </div>
          <h1 style={{ fontSize: "34px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.5px" }}>
            Bản Thiết Kế Kiến Trúc & Wireframe CEP.EXCHANGE
          </h1>
          <p style={{ color: "#64748b", fontSize: "15.5px", maxWidth: "780px", margin: "8px auto 0" }}>
            Hệ thống kiến trúc thông tin (Information Architecture), Sơ đồ luồng giao lưu hai chiều (User Flow)
            và Bộ khung dây Mobile Wireframe 5 màn hình hoàn chỉnh.
          </p>
        </div>

        {/* ========================================================
            PHẦN 1 & 2: SƠ ĐỒ CẤU TRÚC CHỨC NĂNG & USER FLOW
            ======================================================== */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: "24px", marginBottom: "40px" }}>
          {/* CỘT 1: KIẾN TRÚC THÔNG TIN (01 - 04) */}
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
              <span style={{ fontSize: "24px" }}>🏛️</span>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Kiến Trúc Thông Tin 4 Khối (Sitemap)
                </h3>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Tương đương Cột 1 trong tài liệu tham chiếu</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                {
                  id: "01",
                  title: "Trang chủ",
                  items: ["Thanh tìm kiếm nhanh AI", "Thiết bị nổi bật (Featured Items)", "Danh mục (Laptop, PC, iOS, Android)", "Trạng thái giao dịch đang thực hiện"],
                  bg: "#ecfdf5",
                  border: "#a7f3d0",
                  color: "#065f46",
                },
                {
                  id: "02",
                  title: "Tra cứu thiết bị",
                  items: ["Tìm kiếm ngữ nghĩa AI (NLP Search)", "Bộ lọc: Hãng, Tầm giá, Tình trạng 99%", "Danh sách kết quả & Điểm phù hợp %", "Trang Chi tiết thiết bị & Đánh giá sao"],
                  bg: "#eff6ff",
                  border: "#bfdbfe",
                  color: "#1e40af",
                },
                {
                  id: "03",
                  title: "Quản lý đổi đồ / Tủ máy",
                  items: ["Thiết bị của tôi đang niêm yết", "Đề xuất đổi máy (Nhận & Gửi)", "Tiến trình đổi 5 bước (Trade Steps)", "Mã QR định danh giao dịch Escrow"],
                  bg: "#fefce8",
                  border: "#fde047",
                  color: "#854d0e",
                },
                {
                  id: "04",
                  title: "Thông báo & Lịch hẹn",
                  items: ["Xác nhận đề xuất đổi máy", "Nhắc lịch kiểm định tại Trạm CEP Care", "Cảnh báo an toàn & Xác thực đối tác"],
                  bg: "#fdf2f8",
                  border: "#fbcfe8",
                  color: "#9d174d",
                },
              ].map((mod) => (
                <div key={mod.id} style={{ background: mod.bg, border: `1px solid ${mod.border}`, padding: "12px 14px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", fontSize: "13.5px", color: mod.color, marginBottom: "6px" }}>
                    <span style={{ background: "#ffffff", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>{mod.id}</span>
                    {mod.title}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                    {mod.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: "11.5px", color: "#334155" }}>
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT 2: SƠ ĐỒ LUỒNG NGƯỜI DÙNG (USER FLOW) */}
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
              <span style={{ fontSize: "24px" }}>🔀</span>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Sơ Đồ Luồng Trao Đổi Máy (User Flow)
                </h3>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Tương đương Cột 2 trong tài liệu tham chiếu</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
              <div style={flowStepStyle}>
                <strong>1. Đăng nhập / Xác thực tài khoản</strong>
              </div>
              <div style={{ color: "#059669", fontWeight: "900" }}>↓</div>
              <div style={flowStepStyle}>
                <strong>2. Tìm kiếm thiết bị muốn đổi (MacBook Pro 14 M2)</strong>
              </div>
              <div style={{ color: "#059669", fontWeight: "900" }}>↓</div>
              <div style={flowStepStyle}>
                <strong>3. Xem Chi tiết máy & Đánh giá uy tín chủ sở hữu</strong>
              </div>
              <div style={{ color: "#059669", fontWeight: "900" }}>↓</div>

              {/* Hộp quyết định rẽ 2 nhánh */}
              <div style={{ background: "#064e3b", color: "#fff", padding: "10px 20px", borderRadius: "12px", fontWeight: "800", fontSize: "13px", textAlign: "center", width: "100%" }}>
                4. Kiểm tra hình thức giao lưu giữa 2 bên
              </div>

              {/* 2 Nhánh song song */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "100%", marginTop: "4px" }}>
                {/* Nhánh 1: Đổi ngang */}
                <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", padding: "12px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#166534", marginBottom: "6px" }}>
                    🌿 NHÁNH 1: ĐỔI NGANG
                  </div>
                  <div style={{ fontSize: "11px", color: "#14532d", lineHeight: "1.5" }}>
                    • Bấm <strong>&quot;Đề xuất đổi ngang&quot;</strong><br />
                    • Chọn thiết bị có giá tương đương<br />
                    • Xác nhận điều kiện máy<br />
                    • <strong>Nhận thông báo xác nhận & Mã QR Phiếu Đổi</strong>
                  </div>
                </div>

                {/* Nhánh 2: Bù trừ */}
                <div style={{ background: "#eff6ff", border: "1.5px solid #93c5fd", padding: "12px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#1e40af", marginBottom: "6px" }}>
                    💰 NHÁNH 2: BÙ TRỪ
                  </div>
                  <div style={{ fontSize: "11px", color: "#1e3a8a", lineHeight: "1.5" }}>
                    • Bấm <strong>&quot;Tính toán bù trừ&quot;</strong><br />
                    • Máy tính AI tính tiền chênh lệch<br />
                    • Thống nhất số tiền bù trừ<br />
                    • <strong>Nhận thông báo xác nhận & Mã QR Escrow</strong>
                  </div>
                </div>
              </div>

              <div style={{ color: "#059669", fontWeight: "900" }}>↓</div>

              {/* Bước cuối chung */}
              <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: "10px 16px", borderRadius: "10px", fontSize: "12px", textAlign: "center", width: "100%" }}>
                <strong>5. Xuất trình mã QR tại Trạm CEP Care</strong> → Kỹ thuật viên kiểm tra phần cứng → Bàn giao máy & Nhận Điểm Thưởng Xanh
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            PHẦN 3: BỘ KHUNG DÂY WIREFRAME 5 MÀN HÌNH MOBILE
            ======================================================== */}
        <div style={{ background: "#ffffff", borderRadius: "24px", padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                Khung Dây Giao Diện Mobile (5 Màn Hình Chuẩn 9:41)
              </h2>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                Mô phỏng chân thực chuỗi màn hình điện thoại từ khám phá đến xuất mã QR nhận máy
              </div>
            </div>

            {/* Quick Screen Tabs */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {screens.map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveScreenTab(idx)}
                  style={{
                    background: activeScreenTab === idx ? "#059669" : "#f1f5f9",
                    color: activeScreenTab === idx ? "#ffffff" : "#475569",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {sc.title}
                </button>
              ))}
            </div>
          </div>

          {/* Hiển thị toàn bộ 5 màn hình theo phong cách Poster trong1.pdf */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            {screens.map((sc, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  outline: activeScreenTab === idx ? "2px solid #059669" : "none",
                  borderRadius: "28px",
                  padding: "8px",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontWeight: "800", fontSize: "13px", color: "#0f172a", marginBottom: "2px" }}>
                  {sc.title}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px", textAlign: "center" }}>
                  {sc.subtitle}
                </div>

                {/* Vỏ điện thoại Mobile Frame */}
                <div style={phoneFrameStyle}>
                  {sc.render}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút quay về trang chủ hoặc đến các tính năng */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "36px" }}>
          <Link
            href="/"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "14px",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
            }}
          >
            🏠 Trải Nghiệm Trang Chủ Trực Tiếp
          </Link>
          <Link
            href="/post-item"
            style={{
              background: "#0f172a",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            ✍️ Thử Nghiệm Đăng Tin AI
          </Link>
        </div>
      </main>
    </div>
  );
}

// Styles cho khung điện thoại & các thành phần
const cardSectionStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "20px",
  padding: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
};

const flowStepStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1.5px solid #cbd5e1",
  padding: "8px 16px",
  borderRadius: "10px",
  fontSize: "12.5px",
  color: "#0f172a",
  textAlign: "center",
  width: "100%",
};

const phoneFrameStyle: React.CSSProperties = {
  width: "250px",
  height: "500px",
  background: "#0f172a",
  borderRadius: "32px",
  padding: "8px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px #334155",
};

const mockupInnerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  background: "#ffffff",
  borderRadius: "24px",
  padding: "10px 12px",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  position: "relative",
};

const statusBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "10px",
  fontWeight: "800",
  color: "#0f172a",
  marginBottom: "8px",
};

const circleIconStyle: React.CSSProperties = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
};

const specBoxStyle: React.CSSProperties = {
  background: "#f1f5f9",
  padding: "4px",
  borderRadius: "6px",
};

const bottomNavStyle: React.CSSProperties = {
  marginTop: "auto",
  display: "flex",
  justifyContent: "space-around",
  borderTop: "1px solid #f1f5f9",
  paddingTop: "6px",
  fontSize: "9.5px",
  color: "#64748b",
};

