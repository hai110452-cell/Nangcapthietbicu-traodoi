"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import {
  ExchangeItem,
  getStoredListings,
  initialExchangeListings,
} from "../../lib/store";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState<ExchangeItem | null>(null);
  const [proposalNote, setProposalNote] = useState("");
  const [proposalDevice, setProposalDevice] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const all = getStoredListings();
    const found = all.find((x) => x.id === id);
    setItem(found ?? null);
  }, [id]);

  if (!item) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "40px 20px",
          }}
        >
          <span style={{ fontSize: "60px" }}>🔍</span>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>
            Không tìm thấy sản phẩm
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Sản phẩm này có thể đã được giao dịch hoặc bị xóa.
          </p>
          <Link
            href="/"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: "10px",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            ← Về trang chủ
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ maxWidth: "960px", margin: "32px auto", padding: "0 20px", flex: 1, width: "100%" }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b" }}>
          <Link href="/" style={{ color: "#059669", fontWeight: "600", textDecoration: "none" }}>
            Trang chủ
          </Link>
          <span>›</span>
          <span style={{ color: "#94a3b8" }}>{item.categoryName}</span>
          <span>›</span>
          <span style={{ color: "#0f172a", fontWeight: "600", maxWidth: "360px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.title}
          </span>
        </div>

        {/* Card chính */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            marginBottom: "32px",
          }}
        >
          {/* Banner hình ảnh */}
          <div
            style={{
              background: item.gradientBg,
              height: "220px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <span style={{ fontSize: "90px" }}>{item.deviceIcon}</span>
            <span
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "700",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {item.categoryName}
            </span>
            <span
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: item.type === "Đổi ngang" ? "#10b981" : "#f59e0b",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "800",
              }}
            >
              {item.type}
            </span>
          </div>

          {/* Nội dung */}
          <div style={{ padding: "28px 32px" }}>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "900",
                color: "#0f172a",
                marginBottom: "8px",
                lineHeight: "1.3",
              }}
            >
              {item.title}
            </h1>

            {/* Giá trị & chủ sở hữu */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "2px" }}>
                  Định giá tham khảo
                </div>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, #059669, #047857)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {item.estimatedValue}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#f8fafc",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: "16px",
                  }}
                >
                  {item.ownerName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a" }}>
                    {item.ownerName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    ⭐ {item.rating} &nbsp;•&nbsp; {item.dealCount} lần đổi thành công
                  </div>
                </div>
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#334155", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                📋 Thông số kỹ thuật
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {item.specs.map((spec, i) => (
                  <span
                    key={i}
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      color: "#334155",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Nhu cầu trao đổi */}
            <div
              style={{
                background: "#ecfdf5",
                border: "1.5px solid #a7f3d0",
                borderRadius: "14px",
                padding: "16px 20px",
                marginBottom: "24px",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#047857", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ⇄ Nhu cầu muốn trao đổi
              </div>
              <div style={{ fontSize: "15px", color: "#14532d", fontWeight: "600" }}>
                {item.targetDemand}
              </div>
            </div>

            {/* Địa điểm */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b", marginBottom: "28px" }}>
              <span>📍</span>
              <span>{item.location}</span>
            </div>

            {/* Nút hành động */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => { setSubmitted(false); document.getElementById("proposal-form")?.scrollIntoView({ behavior: "smooth" }); }}
                style={{
                  flex: 1,
                  minWidth: "160px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  border: "none",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "15px",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.35)",
                }}
              >
                💬 Đề xuất đổi máy ngay
              </button>
              <button
                onClick={() => router.back()}
                style={{
                  background: "#f1f5f9",
                  border: "1.5px solid #e2e8f0",
                  color: "#475569",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                ← Quay lại
              </button>
            </div>
          </div>
        </div>

        {/* Form đề xuất đổi máy */}
        <div
          id="proposal-form"
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "28px 32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "6px" }}>
            🤝 Gửi đề xuất trao đổi đến {item.ownerName}
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>
            Điền thông tin thiết bị bạn muốn đề xuất trao đổi. Chúng tôi sẽ chuyển đến chủ máy trong vài phút.
          </p>

          {submitted ? (
            <div
              style={{
                background: "#ecfdf5",
                border: "1.5px solid #6ee7b7",
                borderRadius: "14px",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#065f46", marginBottom: "8px" }}>
                Đề xuất đã được gửi thành công!
              </h3>
              <p style={{ fontSize: "13px", color: "#047857" }}>
                {item.ownerName} sẽ phản hồi bạn trong vòng 24 giờ. Theo dõi tại trang Giao dịch của bạn.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
                <Link
                  href="/trades"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "13px",
                    textDecoration: "none",
                  }}
                >
                  Xem giao dịch
                </Link>
                <Link
                  href="/"
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "13px",
                    textDecoration: "none",
                  }}
                >
                  Tiếp tục xem
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!proposalDevice.trim()) return;
                setSubmitted(true);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px", display: "block" }}>
                  Thiết bị bạn muốn đề xuất trao đổi *
                </label>
                <input
                  type="text"
                  placeholder="VD: MacBook Air M2, iPhone 15 Pro 256GB..."
                  value={proposalDevice}
                  onChange={(e) => setProposalDevice(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#059669")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px", display: "block" }}>
                  Ghi chú thêm (tình trạng, mức bù trừ dự kiến...)
                </label>
                <textarea
                  placeholder="VD: Máy đẹp 98%, pin 90%, sẵn bù thêm 1 triệu nếu cần..."
                  value={proposalNote}
                  onChange={(e) => setProposalNote(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#059669")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  border: "none",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "15px",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.35)",
                }}
              >
                Gửi đề xuất ➔
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
