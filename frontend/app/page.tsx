"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import ProductReviewModal from "./components/ProductReviewModal";
import rawStyles from "./page.module.css";

// Đảm bảo class name luôn hoạt động mượt mà trong cả môi trường CSS Module lẫn Global CSS
const styles = new Proxy((rawStyles || {}) as Record<string, string>, {
  get(target, prop: string) {
    if (typeof prop !== "string") return undefined;
    const val = target[prop];
    return val ? `${val} ${prop}` : prop;
  },
});

import {
  ExchangeItem,
  WebsiteConfig,
  defaultWebsiteConfig,
  getStoredConfig,
  getStoredListings,
  initialExchangeListings,
} from "./lib/store";
import { searchWithAI, AISearchResult } from "./lib/ai-service";

export default function HomePage() {
  const [listings, setListings] = useState<ExchangeItem[]>(initialExchangeListings);
  const [siteConfig, setSiteConfig] = useState<WebsiteConfig>(defaultWebsiteConfig);

  // Trạng thái Tìm kiếm & Tư vấn bằng AI
  const [aiSearchQuery, setAiSearchQuery] = useState<string>("");
  const [isAISearching, setIsAISearching] = useState<boolean>(false);
  const [aiSearchResult, setAiSearchResult] = useState<AISearchResult | null>(null);

  // Trạng thái bộ lọc danh mục
  const [activeCategory, setActiveCategory] = useState<string>("all");
  // Tìm kiếm thiết bị
  const [searchHave, setSearchHave] = useState<string>("");
  const [searchWant, setSearchWant] = useState<string>("");

  // Trạng thái Modal Đề xuất đổi máy
  const [selectedItem, setSelectedItem] = useState<ExchangeItem | null>(null);
  const [proposalNote, setProposalNote] = useState<string>("");
  const [proposalDevice, setProposalDevice] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Trạng thái Modal Đánh giá & Bình luận sản phẩm
  const [selectedReviewItem, setSelectedReviewItem] = useState<ExchangeItem | null>(null);

  // Trạng thái Máy tính định giá bù trừ thông minh
  const [deviceA, setDeviceA] = useState<number>(28500000);
  const [deviceB, setDeviceB] = useState<number>(22800000);

  // Đồng bộ sản phẩm, đánh giá và cấu hình website theo thời gian thực
  useEffect(() => {
    const refreshData = () => {
      const stored = getStoredListings();
      const withRatings = stored.map((item) => {
        const saved = typeof window !== "undefined" ? localStorage.getItem(`cep_reviews_${item.id}`) : null;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const avg = Number(
                (parsed.reduce((acc: number, r: any) => acc + r.rating, 0) / parsed.length).toFixed(1)
              );
              return { ...item, rating: avg, reviewCount: parsed.length };
            }
          } catch (e) {
            console.error(e);
          }
        }
        return item;
      });
      setListings(withRatings);
      setSiteConfig(getStoredConfig());
    };

    refreshData();

    window.addEventListener("cep_listings_updated", refreshData);
    window.addEventListener("cep_config_updated", refreshData);

    return () => {
      window.removeEventListener("cep_listings_updated", refreshData);
      window.removeEventListener("cep_config_updated", refreshData);
    };
  }, []);

  const handleReviewsUpdated = (productId: string, newAvgRating: number, totalReviews: number) => {
    setListings((prev) =>
      prev.map((it) =>
        it.id === productId
          ? { ...it, rating: newAvgRating, reviewCount: totalReviews }
          : it
      )
    );
    if (selectedReviewItem && selectedReviewItem.id === productId) {
      setSelectedReviewItem((prev) =>
        prev ? { ...prev, rating: newAvgRating, reviewCount: totalReviews } : null
      );
    }
  };

  // Xử lý Tìm Kiếm Thông Minh Bằng AI
  const handleAISearch = async (customQuery?: string) => {
    const q = customQuery !== undefined ? customQuery : aiSearchQuery;
    if (!q.trim()) {
      setAiSearchResult(null);
      return;
    }
    setIsAISearching(true);
    try {
      const result = await searchWithAI(q, listings);
      setAiSearchResult(result);
      const el = document.getElementById("listings");
      el?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Lỗi tìm kiếm AI:", err);
    } finally {
      setIsAISearching(false);
    }
  };

  const handleClearAISearch = () => {
    setAiSearchResult(null);
    setAiSearchQuery("");
  };

  // Danh sách hiển thị: Nếu có AI Search thì ưu tiên kết quả AI, nếu không thì theo bộ lọc thông thường
  const displayListings: {
    item: ExchangeItem;
    matchScore?: number;
    matchReason?: string;
    highlightSpecs?: string[];
  }[] =
    aiSearchResult && aiSearchResult.matches.length > 0
      ? aiSearchResult.matches.map((m) => ({
          item: m.item,
          matchScore: m.matchScore,
          matchReason: m.matchReason,
          highlightSpecs: m.highlightSpecs,
        }))
      : listings
          .filter((item) => {
            if (activeCategory !== "all" && item.category !== activeCategory) {
              return false;
            }
            if (searchHave && !item.targetDemand.toLowerCase().includes(searchHave.toLowerCase())) {
              return false;
            }
            if (searchWant && !item.title.toLowerCase().includes(searchWant.toLowerCase())) {
              return false;
            }
            return true;
          })
          .map((item) => ({ item }));

  const handleSwapInputs = () => {
    const temp = searchHave;
    setSearchHave(searchWant);
    setSearchWant(temp);
  };

  const calculateDifference = () => {
    const diff = deviceA - deviceB;
    if (diff === 0) return { text: "Đổi ngang giá trị (Không cần bù trừ)", type: "even" };
    if (diff > 0) {
      return {
        text: `Bên muốn nhận cần bù thêm: ${diff.toLocaleString("vi-VN")} đ`,
        type: "plus",
      };
    }
    return {
      text: `Bạn cần bù thêm: ${Math.abs(diff).toLocaleString("vi-VN")} đ`,
      type: "minus",
    };
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ========================================================
          1. HEADER & THANH ĐIỀU HƯỚNG TOÀN CỤC
          ======================================================== */}
      <Navbar />

      {/* ========================================================
          2. BANNER HERO & TÌM KIẾM ĐỐI TÁC TRAO ĐỔI 2 CHIỀU
          ======================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>

          <h1 className={styles.heroTitle}>
            {siteConfig.heroTitle} <br />
            <span className={styles.heroHighlight}>{siteConfig.heroHighlight}</span>
          </h1>

          <p className={styles.heroDescription}>
            {siteConfig.heroDescription}
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "36px", flexWrap: "wrap" }}>
            <Link
              href="/post-item"
              style={{
                background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)",
                color: "#ffffff",
                padding: "13px 26px",
                borderRadius: "12px",
                fontWeight: "800",
                fontSize: "14px",
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(4, 120, 87, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Đăng Tin Bằng AI Computer Vision
            </Link>
            <Link
              href="/trades"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                padding: "13px 26px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "14px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Theo Dõi Tiến Trình Đổi Đồ
            </Link>
          </div>

          {/* Hộp tìm kiếm 2 chiều: Thiết bị có <-> Thiết bị muốn đổi */}
          <div className={styles.exchangeFinderCard}>
            <div className={styles.finderGroup}>
              <label className={styles.finderLabel}>Bạn đang có thiết bị gì?</label>
              <input
                type="text"
                className={styles.finderInput}
                placeholder="Ví dụ: iPhone 14, Dell XPS, PC Gaming..."
                value={searchHave}
                onChange={(e) => setSearchHave(e.target.value)}
              />
            </div>

            <button
              className={styles.swapIconWrapper}
              title="Hoán đổi mục tiêu tìm kiếm"
              onClick={handleSwapInputs}
            >
              ⇄
            </button>

            <div className={styles.finderGroup}>
              <label className={styles.finderLabel}>Bạn muốn đổi lấy thiết bị nào?</label>
              <input
                type="text"
                className={styles.finderInput}
                placeholder="Ví dụ: MacBook Pro, Galaxy S24 Ultra..."
                value={searchWant}
                onChange={(e) => setSearchWant(e.target.value)}
              />
            </div>

            <button
              className={styles.btnFindMatch}
              onClick={() => {
                const el = document.getElementById("listings");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Tìm người cần đổi
            </button>
          </div>

          {/* ========================================================
              THANH TÌM KIẾM & TƯ VẤN SẢN PHẨM BẰNG AI (AI SMART SEARCH)
              ======================================================== */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(6, 78, 59, 0.96), rgba(6, 95, 70, 0.96))",
              border: "1.5px solid rgba(52, 211, 153, 0.4)",
              borderRadius: "20px",
              padding: "20px 24px",
              maxWidth: "860px",
              margin: "24px auto 0",
              boxShadow: "0 15px 35px rgba(0, 0, 0, 0.25)",
              backdropFilter: "blur(12px)",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "22px" }}>🤖</span>
                <span style={{ fontWeight: "800", fontSize: "15px", color: "#ffffff" }}>
                  Trợ Lý AI Tìm Kiếm & Tư Vấn Đổi Máy Thông Minh
                </span>
              </div>
              <span style={{ background: "rgba(16, 185, 129, 0.3)", color: "#a7f3d0", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "999px", border: "1px solid rgba(52, 211, 153, 0.3)" }}>
                ⚡ Semantic Search & Matching
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Hỏi AI bất kỳ điều gì (VD: &quot;Tìm laptop mỏng nhẹ pin trâu dưới 20 triệu&quot;, &quot;Máy nào đổi ngang iPhone 14&quot;...)"
                value={aiSearchQuery}
                onChange={(e) => setAiSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAISearch();
                  }
                }}
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
                type="button"
                onClick={() => handleAISearch()}
                disabled={isAISearching}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  border: "none",
                  padding: "13px 24px",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "14px",
                  cursor: isAISearching ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                {isAISearching ? "🔍 Đang tìm..." : "⚡ Hỏi AI"}
              </button>
            </div>

            {/* Gợi ý câu hỏi mẫu */}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11.5px", color: "#a7f3d0", fontWeight: "600" }}>Gợi ý mẫu:</span>
              {[
                "Laptop văn phòng mỏng nhẹ dưới 20 triệu",
                "PC Gaming cấu hình cao chơi mượt GTA V",
                "Điện thoại Android chụp ảnh đẹp muốn đổi iPhone",
                "MacBook cấu hình mạnh làm đồ họa",
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setAiSearchQuery(sample);
                    handleAISearch(sample);
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    color: "#f1f5f9",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Các số liệu thống kê */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10.200+</div>
              <div className={styles.statLabel}>Thiết bị niêm yết</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>98.8%</div>
              <div className={styles.statLabel}>Hài lòng sau trao đổi</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>0đ Phí</div>
              <div className={styles.statLabel}>Giao dịch trực tiếp</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. THANH DANH MỤC LỌC THIẾT BỊ
          ======================================================== */}
      <section className={styles.categoryBarSection} id="listings">
        <div className={styles.categoryContainer}>
          <div className={styles.tabList}>
            <button
              className={`${styles.tabItem} ${activeCategory === "all" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              Tất cả thiết bị
            </button>
            <button
              className={`${styles.tabItem} ${activeCategory === "laptop" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveCategory("laptop")}
            >
              Laptop & MacBook
            </button>
            <button
              className={`${styles.tabItem} ${activeCategory === "pc" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveCategory("pc")}
            >
              Máy tính bàn & PC Gaming
            </button>
            <button
              className={`${styles.tabItem} ${activeCategory === "iphone" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveCategory("iphone")}
            >
              Điện thoại iPhone / iPad
            </button>
            <button
              className={`${styles.tabItem} ${activeCategory === "android" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveCategory("android")}
            >
              Điện thoại Android
            </button>
          </div>

          <div className={styles.searchSummary}>
            Hiển thị <strong>{displayListings.length}</strong> thiết bị {aiSearchResult ? "được AI đề xuất" : "đang chờ giao lưu"}
          </div>
        </div>
      </section>

      {/* ========================================================
          4. DANH SÁCH BÀI ĐĂNG TRAO ĐỔI (CARDS GRID)
          ======================================================== */}
      <main className={styles.mainContentSection}>
        {/* BANNER TƯ VẤN CỦA TRỢ LÝ AI (KHI ĐANG TÌM KIẾM BẰNG AI) */}
        {aiSearchResult && (
          <div
            style={{
              background: "#ecfdf5",
              border: "1.5px solid #6ee7b7",
              borderRadius: "18px",
              padding: "20px 24px",
              marginBottom: "32px",
              boxShadow: "0 6px 20px rgba(5, 150, 105, 0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "24px" }}>💡</span>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#065f46" }}>
                  Phân Tích & Tư Vấn Của Trợ Lý AI Cho Bạn
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearAISearch}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  color: "#475569",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ✕ Đóng gợi ý AI (Hiện tất cả {listings.length} máy)
              </button>
            </div>

            <p style={{ fontSize: "14.5px", color: "#14532d", margin: "0 0 12px", lineHeight: "1.6" }}>
              {aiSearchResult.aiAdvice}
            </p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#047857" }}>Tiêu chí đã phát hiện:</span>
              {aiSearchResult.detectedCriteria.category && (
                <span style={{ background: "#d1fae5", color: "#065f46", padding: "3px 8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "700" }}>
                  Danh mục: {aiSearchResult.detectedCriteria.category.toUpperCase()}
                </span>
              )}
              {aiSearchResult.detectedCriteria.maxPrice && (
                <span style={{ background: "#d1fae5", color: "#065f46", padding: "3px 8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "700" }}>
                  Ngân sách: ≤ {(aiSearchResult.detectedCriteria.maxPrice / 1000000).toFixed(0)} triệu
                </span>
              )}
              {aiSearchResult.detectedCriteria.intent && (
                <span style={{ background: "#d1fae5", color: "#065f46", padding: "3px 8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "700" }}>
                  Nhu cầu: {aiSearchResult.detectedCriteria.intent}
                </span>
              )}
            </div>
          </div>
        )}

        <div className={styles.sectionHeading}>
          <div>
            <h2 className={styles.headingTitle}>
              {aiSearchResult ? "Các Thiết Bị Phù Hợp Nhất Theo AI" : "Thiết Bị Nổi Bật Đang Chờ Trao Đổi"}
            </h2>
            <p className={styles.headingSubtitle}>
              {aiSearchResult
                ? `Tìm thấy ${displayListings.length} kết quả khớp với truy vấn của bạn, sắp xếp theo độ tương thích giảm dần.`
                : "Khám phá các đề xuất giao lưu thiết bị có giá trị tương đương hoặc bù trừ hợp lý."}
            </p>
          </div>
        </div>

        <div className={styles.productGrid}>
          {displayListings.map(({ item, matchScore, matchReason, highlightSpecs }) => (
            <article
              key={item.id}
              className={styles.productCard}
              style={{
                border: matchScore && matchScore >= 80 ? "2px solid #10b981" : undefined,
                boxShadow: matchScore && matchScore >= 80 ? "0 10px 30px rgba(16, 185, 129, 0.15)" : undefined,
              }}
            >
              {/* Phần hình ảnh & badge */}
              <div className={styles.cardVisualBanner} style={{ background: item.gradientBg }}>
                <span className={styles.typeBadge}>{item.categoryName}</span>
                <span
                  className={`${styles.exchangeTypeBadge} ${
                    item.type === "Đổi ngang" ? styles.badgeEven : styles.badgePlus
                  }`}
                >
                  {item.type}
                </span>
                <div className={styles.deviceIconPlaceholder}>{item.deviceIcon}</div>
              </div>

              {/* Phần thân thẻ sản phẩm */}
              <div className={styles.cardBody}>
                {/* Huy hiệu Độ tương thích AI nếu có */}
                {matchScore !== undefined && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, #059669, #047857)",
                      color: "#ffffff",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      marginBottom: "10px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "800", fontSize: "11px", letterSpacing: "0.5px" }}>
                        🎯 ĐỘ TƯƠNG THÍCH AI:
                      </span>
                      <span style={{ background: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>
                        {matchScore}%
                      </span>
                    </div>
                    {matchReason && (
                      <div style={{ fontSize: "11px", opacity: 0.95, marginTop: "4px", lineHeight: "1.3" }}>
                        💡 {matchReason}
                      </div>
                    )}
                  </div>
                )}

                <h3 className={styles.productTitle}>{item.title}</h3>

                {/* Thông số kỹ thuật tóm tắt */}
                <div className={styles.specsList}>
                  {item.specs.map((spec, idx) => (
                    <span key={idx} className={styles.specPill}>
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Ước tính giá trị thị trường */}
                <div className={styles.estimatedValue}>
                  Định giá tham khảo: <span className={styles.valAmount}>{item.estimatedValue}</span>
                </div>

                {/* Nhu cầu muốn đổi của chủ máy */}
                <div className={styles.targetExchangeBox}>
                  <div className={styles.targetLabel}>
                    <span>⇄</span> Nhu cầu muốn đổi:
                  </div>
                  <div className={styles.targetValue}>{item.targetDemand}</div>
                </div>

                {/* Thông tin chủ sở hữu */}
                <div className={styles.ownerInfo}>
                  <div
                    className={styles.ownerDetail}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedReviewItem(item)}
                    title="Nhấn để xem các bình luận & đánh giá uy tín"
                  >
                    <div className={styles.ownerAvatar}>{item.ownerName.charAt(0)}</div>
                    <div>
                      <strong>{item.ownerName}</strong> • <span style={{ color: "#f59e0b", fontWeight: 700 }}>⭐ {item.rating}</span> ({item.dealCount} lần đổi)
                    </div>
                  </div>
                  <div>📍 {item.location.split(",")[0]}</div>
                </div>

                {/* Nút hành động */}
                <div className={styles.cardActionButtons}>
                  <button
                    className={styles.btnProposeTrade}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsSubmitted(false);
                    }}
                  >
                    Đề xuất đổi máy
                  </button>
                  <button
                    className={styles.btnDetail}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      justifyContent: "center",
                      color: "#065f46",
                      fontWeight: 800,
                      borderColor: "rgba(16, 185, 129, 0.4)",
                      background: "#f0fdf4",
                    }}
                    onClick={() => {
                      setSelectedReviewItem(item);
                    }}
                    title="Xem chi tiết, viết nhận xét và chấm sao cho thiết bị này"
                  >
                    <span>💬</span> Đánh giá ({item.reviewCount || 1})
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* ========================================================
          5. CÔNG CỤ TÍNH BÙ TRỪ & ĐỊNH GIÁ GIAO LƯU THÔNG MINH
          ======================================================== */}
      <section className={styles.calculatorSection} id="valuation-calc">
        <div className={styles.calcContainer}>
          <div className={styles.calcTitleArea}>
            <h2 className={styles.calcHeading}>Công Cụ Ước Tính Chênh Lệch & Bù Trừ</h2>
            <p className={styles.calcDesc}>
              Chọn thiết bị bạn đang có và thiết bị bạn muốn nhận để tham khảo mức bù trừ ước tính.
            </p>
          </div>

          <div className={styles.calcGrid}>
            <div className={styles.calcCard}>
              <div className={styles.calcCardTitle}>📱 Thiết bị của bạn</div>
              <select
                className={styles.calcSelect}
                value={deviceA}
                onChange={(e) => setDeviceA(Number(e.target.value))}
              >
                <option value={28500000}>MacBook Pro 14 M2 Pro (28.500.000 đ)</option>
                <option value={16800000}>iPhone 14 Pro 128GB (16.800.000 đ)</option>
                <option value={15500000}>PC Gaming i5-13400F/RTX 3060Ti (15.500.000 đ)</option>
                <option value={22800000}>Galaxy S24 Ultra 256GB (22.800.000 đ)</option>
              </select>
              <div className={styles.calcPricePreview}>
                Giá trị quy đổi: <span className={styles.calcPriceVal}>{deviceA.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>

            <div className={styles.calcArrowCol}>
              <span>⇄</span>
            </div>

            <div className={styles.calcCard}>
              <div className={styles.calcCardTitle}>💻 Thiết bị bạn muốn đổi lấy</div>
              <select
                className={styles.calcSelect}
                value={deviceB}
                onChange={(e) => setDeviceB(Number(e.target.value))}
              >
                <option value={22800000}>Galaxy S24 Ultra 256GB (22.800.000 đ)</option>
                <option value={28500000}>MacBook Pro 14 M2 Pro (28.500.000 đ)</option>
                <option value={23500000}>Dell XPS 13 Plus 9320 (23.500.000 đ)</option>
                <option value={16800000}>iPhone 14 Pro 128GB (16.800.000 đ)</option>
              </select>
              <div className={styles.calcPricePreview}>
                Giá trị quy đổi: <span className={styles.calcPriceVal}>{deviceB.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>
          </div>

          <div className={styles.calcResultBox}>
            <div className={styles.calcResultLabel}>Kết quả ước tính giao lưu:</div>
            <div className={styles.calcResultDifference}>{calculateDifference().text}</div>
            <div className={styles.calcResultNote}>
              * Mức bù trừ thực tế có thể linh hoạt theo thỏa thuận về tình trạng pin, ngoại hình và phụ kiện đi kèm.
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. QUY TRÌNH 4 BƯỚC ĐỔI MÁY AN TOÀN
          ======================================================== */}
      <section className={styles.howItWorksSection} id="how-it-works">
        <h2 className={styles.headingTitle}>Quy Trình Trao Đổi 4 Bước Đơn Giản & An Toàn</h2>
        <p className={styles.headingSubtitle}>
          Không lo ép giá, dễ dàng tìm thấy đối tác có đúng thiết bị bạn đang tìm kiếm.
        </p>

        <div className={styles.stepGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h4 className={styles.stepTitle}>Đăng tin thiết bị</h4>
            <p className={styles.stepDescription}>
              Chụp ảnh máy tính hoặc điện thoại của bạn, mô tả tình trạng và nêu rõ dòng máy bạn muốn đổi sang.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h4 className={styles.stepTitle}>Ghép đôi & Thỏa thuận</h4>
            <p className={styles.stepDescription}>
              Nhận đề xuất giao lưu trực tiếp. Thống nhất phương án đổi ngang hoặc số tiền chênh lệch bù trừ.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h4 className={styles.stepTitle}>Kiểm định phần cứng</h4>
            <p className={styles.stepDescription}>
              Gặp mặt trực tiếp tại các điểm hẹn công cộng hoặc sử dụng dịch vụ kỹ thuật viên kiểm tra độc lập.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>4</div>
            <h4 className={styles.stepTitle}>Hoàn tất & Đánh giá</h4>
            <p className={styles.stepDescription}>
              Bàn giao thiết bị, nhận tiền bù trừ (nếu có) và đánh giá độ uy tín cho đối tác trên nền tảng.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. MODAL ĐỀ XUẤT ĐỔI MÁY (POPUP TRẢI NGHIỆM)
          ======================================================== */}
      {selectedItem && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Đề xuất trao đổi thiết bị</h3>
              <button className={styles.btnCloseModal} onClick={() => setSelectedItem(null)}>
                ✕
              </button>
            </div>

            {isSubmitted ? (
              <div className={styles.modalBody} style={{ textAlign: "center", padding: "40px 24px" }}>
                <div style={{ fontSize: "50px", marginBottom: "12px" }}>🎉</div>
                <h4 style={{ fontSize: "18px", color: "#0f172a", marginBottom: "8px" }}>
                  Đã gửi lời đề nghị thành công!
                </h4>
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  Chủ máy <strong>{selectedItem.ownerName}</strong> đã nhận được thông báo đề xuất từ bạn
                  và sẽ phản hồi trong giây lát.
                </p>
                <button
                  className={styles.btnFindMatch}
                  style={{ marginTop: "24px" }}
                  onClick={() => setSelectedItem(null)}
                >
                  Đóng cửa sổ
                </button>
              </div>
            ) : (
              <>
                <div className={styles.modalBody}>
                  <div style={{ background: "#f1f5f9", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Bạn đang muốn đổi lấy:</div>
                    <strong style={{ color: "#0f172a", fontSize: "15px" }}>{selectedItem.title}</strong>
                    <div style={{ fontSize: "12px", color: "#2563eb", marginTop: "4px" }}>
                      Yêu cầu của chủ máy: {selectedItem.targetDemand}
                    </div>
                  </div>

                  <div className={styles.modalFieldGroup}>
                    <label className={styles.modalLabel}>Thiết bị bạn muốn mang ra đổi:</label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      placeholder="VD: iPhone 13 Pro Max 128GB màu Xanh"
                      value={proposalDevice}
                      onChange={(e) => setProposalDevice(e.target.value)}
                    />
                  </div>

                  <div className={styles.modalFieldGroup}>
                    <label className={styles.modalLabel}>Đề xuất bù trừ tiền (nếu có):</label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      placeholder="VD: Mình đổi ngang hoặc mình bù thêm 2 triệu đ"
                    />
                  </div>

                  <div className={styles.modalFieldGroup}>
                    <label className={styles.modalLabel}>Tin nhắn kèm theo cho chủ máy:</label>
                    <textarea
                      rows={3}
                      className={styles.modalTextarea}
                      placeholder="Mô tả tình trạng máy, pin, phụ kiện và địa điểm bạn có thể giao dịch..."
                      value={proposalNote}
                      onChange={(e) => setProposalNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button className={styles.btnDetail} onClick={() => setSelectedItem(null)}>
                    Hủy bỏ
                  </button>
                  <button
                    className={styles.btnPostTrade}
                    onClick={() => {
                      if (!proposalDevice) {
                        alert("Vui lòng nhập tên thiết bị bạn muốn mang ra đổi!");
                        return;
                      }
                      setIsSubmitted(true);
                    }}
                  >
                    Gửi đề xuất giao lưu
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          7B. MODAL ĐÁNH GIÁ & BÌNH LUẬN SẢN PHẨM (COMMUNITY REVIEWS)
          ======================================================== */}
      {selectedReviewItem && (
        <ProductReviewModal
          isOpen={!!selectedReviewItem}
          onClose={() => setSelectedReviewItem(null)}
          item={selectedReviewItem}
          onReviewsUpdated={handleReviewsUpdated}
        />
      )}

      {/* ========================================================
          8. FOOTER CHÂN TRANG
          ======================================================== */}
      <footer className={styles.footer} id="community">
        <div className={styles.footerContainer}>
          <div className={styles.footerBrandCol}>
            <div className={styles.footerLogoText} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/logo.svg" alt="CEP.EXCHANGE Logo" width={30} height={30} style={{ width: "30px", height: "30px", objectFit: "contain" }} />
              <span>{siteConfig.brandName}</span>
            </div>
            <p style={{ fontSize: "13px", lineHeight: "1.6" }}>
              {siteConfig.brandSlogan} — Nền tảng trao đổi công nghệ minh bạch, văn minh và an toàn tại Việt Nam.
            </p>
            <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "10px", lineHeight: "1.7" }}>
              <div>📞 Hotline: <strong style={{ color: "#047857" }}>{siteConfig.hotline}</strong></div>
              <div>✉️ Hỗ trợ: <strong style={{ color: "#047857" }}>{siteConfig.supportEmail}</strong></div>
              <div>📍 {siteConfig.inspectionAddress}</div>
            </div>
          </div>

          <div>
            <h5 className={styles.footerColTitle}>Danh mục đổi máy</h5>
            <ul className={styles.footerLinks}>
              <li><a href="#listings">Đổi Laptop sang iPhone</a></li>
              <li><a href="#listings">Đổi PC Gaming sang MacBook</a></li>
              <li><a href="#listings">Đổi Android sang iPad</a></li>
              <li><a href="#listings">Linh kiện & Phụ kiện công nghệ</a></li>
            </ul>
          </div>

          <div>
            <h5 className={styles.footerColTitle}>An toàn & Hỗ trợ</h5>
            <ul className={styles.footerLinks}>
              <li><a href="#how-it-works">Quy định trao đổi an toàn</a></li>
              <li><a href="#how-it-works">Dịch vụ kiểm tra phần cứng</a></li>
              <li><a href="#how-it-works">Bảo hiểm giao dịch CEP Care</a></li>
              <li><a href="#how-it-works">Hotline: {siteConfig.hotline}</a></li>
            </ul>
          </div>

          <div>
            <h5 className={styles.footerColTitle}>Cổng quản trị</h5>
            <ul className={styles.footerLinks}>
              <li><Link href="/admin">Trang Quản Trị Hệ Thống (CMS)</Link></li>
              <li><Link href="/trades">Theo dõi tiến trình đổi</Link></li>
              <li><Link href="/post-item">Đăng tin trao đổi</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div>© 2026 CEP Platform - Trao Đổi Máy Tính & Điện Thoại. Bảo lưu mọi quyền.</div>
          <div>Cấu trúc mã nguồn: Cấu trúc HTML (JSX) & CSS Module phân tách độc lập</div>
        </div>
      </footer>
    </div>
  );
}
