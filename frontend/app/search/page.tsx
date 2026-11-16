"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { getStoredListings, ExchangeItem } from "../lib/store";
import { searchWithAI, AISearchResult, AISearchMatch } from "../lib/ai-service";

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [result, setResult] = useState<AISearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<ExchangeItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load listings một lần
  useEffect(() => {
    setListings(getStoredListings());
  }, []);

  // Chạy AI search mỗi khi query thay đổi
  useEffect(() => {
    if (!query.trim() || listings.length === 0) return;
    setLoading(true);
    searchWithAI(query, listings)
      .then((r) => setResult(r))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, listings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setQuery(inputValue);
    router.replace(`/search?q=${encodeURIComponent(inputValue)}`);
  };

  const matches = result?.matches ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Thanh tìm kiếm sticky */}
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b, #065f46)",
          padding: "20px 24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span style={{ fontSize: "20px" }}>🤖</span>
            <span style={{ fontWeight: "800", fontSize: "15px", color: "#ffffff" }}>
              Trợ Lý AI — Tìm Kiếm Thiết Bị
            </span>
            <Link
              href="/"
              style={{
                marginLeft: "auto",
                fontSize: "12px",
                color: "#a7f3d0",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              ← Về trang chủ
            </Link>
          </div>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px" }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Hỏi AI bất kỳ điều gì (VD: "Laptop mỏng nhẹ dưới 20 triệu", "Điện thoại đổi MacBook"...)'
              style={{
                flex: 1,
                padding: "13px 18px",
                borderRadius: "12px",
                border: "none",
                fontSize: "14px",
                outline: "none",
                background: "#ffffff",
                color: "#0f172a",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                border: "none",
                padding: "13px 24px",
                borderRadius: "12px",
                fontWeight: "800",
                fontSize: "14px",
                cursor: loading ? "wait" : "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
              }}
            >
              {loading ? "🔍 Đang tìm..." : "⚡ Tìm ngay"}
            </button>
          </form>

          {/* Gợi ý mẫu */}
          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
            {[
              "Laptop văn phòng mỏng nhẹ dưới 20 triệu",
              "PC Gaming RTX chơi GTA V mượt",
              "Điện thoại chụp ảnh đẹp đổi iPhone",
              "MacBook làm đồ họa",
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setInputValue(s);
                  setQuery(s);
                  router.replace(`/search?q=${encodeURIComponent(s)}`);
                }}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#f1f5f9",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "11.5px",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nội dung kết quả */}
      <main style={{ maxWidth: "1100px", margin: "32px auto", padding: "0 20px", flex: 1, width: "100%" }}>

        {/* Trạng thái loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🔍</div>
            <p style={{ fontSize: "16px", fontWeight: "700", color: "#059669" }}>
              AI đang phân tích và tìm kiếm sản phẩm phù hợp nhất...
            </p>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>
              Đang đối chiếu {listings.length} thiết bị trong hệ thống
            </p>
          </div>
        )}

        {/* Chưa nhập query */}
        {!loading && !query && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🤖</div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              Hỏi AI để tìm thiết bị phù hợp
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              Nhập yêu cầu của bạn vào ô tìm kiếm phía trên — AI sẽ gợi ý ngay những thiết bị tốt nhất cho bạn.
            </p>
          </div>
        )}

        {/* Có kết quả */}
        {!loading && result && (
          <>
            {/* Banner tư vấn AI */}
            <div
              style={{
                background: "#ecfdf5",
                border: "1.5px solid #6ee7b7",
                borderRadius: "16px",
                padding: "18px 22px",
                marginBottom: "28px",
                boxShadow: "0 4px 16px rgba(5, 150, 105, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>💡</span>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "14px", color: "#065f46", marginBottom: "4px" }}>
                    Phân tích của Trợ Lý AI
                  </div>
                  <p style={{ fontSize: "14px", color: "#14532d", lineHeight: "1.6", margin: 0 }}>
                    {result.aiAdvice}
                  </p>
                  {/* Tiêu chí phát hiện */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                    {result.detectedCriteria.category && (
                      <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                        📂 {result.detectedCriteria.category.toUpperCase()}
                      </span>
                    )}
                    {result.detectedCriteria.maxPrice && (
                      <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                        💰 ≤ {(result.detectedCriteria.maxPrice / 1_000_000).toFixed(0)} triệu
                      </span>
                    )}
                    {result.detectedCriteria.intent && (
                      <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                        🎯 {result.detectedCriteria.intent}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tiêu đề kết quả */}
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px" }}>
                {matches.length > 0
                  ? `${matches.length} thiết bị phù hợp nhất với "${query}"`
                  : `Không tìm thấy kết quả cho "${query}"`}
              </h2>
              {matches.length > 0 && (
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  Sắp xếp theo độ tương thích AI giảm dần
                </p>
              )}
            </div>

            {/* Không có kết quả */}
            {matches.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "52px", marginBottom: "12px" }}>😔</div>
                <p style={{ fontSize: "15px", color: "#475569", marginBottom: "16px" }}>
                  AI chưa tìm thấy thiết bị khớp. Hãy thử nới lỏng yêu cầu hoặc tìm theo tên dòng máy.
                </p>
                <Link
                  href="/"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Xem tất cả thiết bị
                </Link>
              </div>
            )}

            {/* Grid sản phẩm */}
            {matches.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {matches.map((match, idx) => (
                  <SearchResultCard key={match.item.id} match={match} rank={idx + 1} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SearchResultCard({ match, rank }: { match: AISearchMatch; rank: number }) {
  const router = useRouter();
  const { item, matchScore, matchReason, recommendation } = match;

  const scoreColor =
    matchScore >= 85 ? "#059669" : matchScore >= 70 ? "#d97706" : "#64748b";

  return (
    <article
      onClick={() => router.push(`/product/${item.id}`)}
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        overflow: "hidden",
        border: matchScore >= 85 ? "2px solid #10b981" : "1px solid #e2e8f0",
        boxShadow:
          matchScore >= 85
            ? "0 8px 28px rgba(16, 185, 129, 0.15)"
            : "0 4px 16px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          matchScore >= 85
            ? "0 8px 28px rgba(16, 185, 129, 0.15)"
            : "0 4px 16px rgba(0,0,0,0.06)";
      }}
    >
      {/* Banner */}
      <div
        style={{
          background: item.gradientBg,
          height: "130px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Huy hiệu hạng */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : rank === 3 ? "#cd7c54" : "rgba(0,0,0,0.35)",
            color: "#fff",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "900",
            fontSize: "13px",
          }}
        >
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
        </div>

        <span style={{ fontSize: "56px" }}>{item.deviceIcon}</span>

        {/* Badge loại trao đổi */}
        <span
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: item.type === "Đổi ngang" ? "#10b981" : "#f59e0b",
            color: "#fff",
            padding: "3px 10px",
            borderRadius: "9999px",
            fontSize: "11px",
            fontWeight: "800",
          }}
        >
          {item.type}
        </span>
      </div>

      {/* Thân card */}
      <div style={{ padding: "16px 18px" }}>
        {/* Điểm tương thích */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "8px 12px",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
            🎯 Độ tương thích AI
          </span>
          <span
            style={{
              fontWeight: "900",
              fontSize: "16px",
              color: scoreColor,
            }}
          >
            {matchScore}%
          </span>
        </div>

        {/* Tiêu đề */}
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "800",
            color: "#0f172a",
            margin: "0 0 6px",
            lineHeight: "1.4",
          }}
        >
          {item.title}
        </h3>

        {/* Lý do phù hợp */}
        <p
          style={{
            fontSize: "11.5px",
            color: "#059669",
            fontWeight: "600",
            lineHeight: "1.4",
            margin: "0 0 10px",
          }}
        >
          💡 {matchReason}
        </p>

        {/* Giá */}
        <div
          style={{
            fontSize: "17px",
            fontWeight: "900",
            color: "#059669",
            marginBottom: "10px",
          }}
        >
          {item.estimatedValue}
        </div>

        {/* Nhu cầu trao đổi */}
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "8px 10px",
            fontSize: "12px",
            color: "#14532d",
            fontWeight: "600",
            marginBottom: "12px",
            lineHeight: "1.4",
          }}
        >
          ⇄ {item.targetDemand}
        </div>

        {/* Chủ sở hữu & địa điểm */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#64748b",
            marginBottom: "14px",
          }}
        >
          <span>
            👤 <strong style={{ color: "#334155" }}>{item.ownerName}</strong>
            {" "}⭐ {item.rating}
          </span>
          <span>📍 {item.location.split(",")[0]}</span>
        </div>

        {/* Nút CTA */}
        <button
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            border: "none",
            padding: "11px 16px",
            borderRadius: "10px",
            fontWeight: "800",
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
          }}
        >
          Xem chi tiết &amp; Đề xuất đổi →
        </button>
      </div>
    </article>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#64748b" }}>Đang tải...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
