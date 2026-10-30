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
} from "./lib/store";
import { api, formatMoney, getAccessToken, moneyToNumber } from "./lib/api";

export default function HomePage() {
  const [listings, setListings] = useState<ExchangeItem[]>([]);
  const [siteConfig, setSiteConfig] = useState<WebsiteConfig>(defaultWebsiteConfig);

  // Trạng thái bộ lọc danh mục
  const [activeCategory, setActiveCategory] = useState<string>("all");
  // Tìm kiếm thiết bị
  const [searchHave, setSearchHave] = useState<string>("");
  const [searchWant, setSearchWant] = useState<string>("");

  // Trạng thái Modal Đề xuất đổi máy
  const [selectedItem, setSelectedItem] = useState<ExchangeItem | null>(null);
  const [proposalNote, setProposalNote] = useState<string>("");
  const [proposalDevice, setProposalDevice] = useState<string>("");
  const [proposalCompensation, setProposalCompensation] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Trạng thái Modal Đánh giá & Bình luận sản phẩm
  const [selectedReviewItem, setSelectedReviewItem] = useState<ExchangeItem | null>(null);

  // Trạng thái Máy tính định giá bù trừ thông minh
  const [deviceA, setDeviceA] = useState<number>(0);
  const [deviceB, setDeviceB] = useState<number>(0);

  // Tải tin đăng và cấu hình từ backend; không dùng dữ liệu sản phẩm mẫu trong trình duyệt.
  useEffect(() => {
    let cancelled = false;
    const refreshData = async () => {
      try {
        const [listingResult, config] = await Promise.all([
          api<any>("/listings?limit=50", { auth: false }),
          api<Partial<WebsiteConfig> | null>("/settings", { auth: false }),
        ]);
        if (cancelled) return;
        const rows = Array.isArray(listingResult) ? listingResult : listingResult?.items || [];
        const mappedListings: ExchangeItem[] = rows.map((item: any) => ({
          ...item,
          id: String(item.id),
          category: item.category || "laptop",
          title: item.title || "Thiết bị chưa có tên",
          gradientBg: item.gradientBg || "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
          deviceIcon: item.deviceIcon || "💻",
          images: Array.isArray(item.images)
            ? item.images
                .map((image: any) => typeof image === "string" ? { url: image } : image)
                .filter((image: any) => typeof image?.url === "string" && image.url.length > 0)
                .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
            : [],
          categoryName: item.categoryName || item.category || "Thiết bị",
          type: item.type || (item.exchangeType === "even" ? "Đổi ngang" : "Bù trừ"),
          specs: Array.isArray(item.specs) ? item.specs : Object.entries(item.specs || {}).map(([k, v]) => `${k}: ${v}`),
          valNumber: Number(item.valNumber ?? item.estimated_value ?? 0),
          estimatedValue: item.estimatedValue || formatMoney(Number(item.valNumber ?? item.estimated_value ?? 0)),
          targetDemand: item.targetDemand || item.target_demand || "Chưa nêu yêu cầu đổi",
          location: item.location || "Chưa cập nhật địa điểm",
          ownerName: item.ownerName || "Thành viên CEP",
          rating: Number(item.rating || 0),
          dealCount: Number(item.dealCount || 0),
          reviewCount: Number(item.reviewCount || 0),
        }));
        setListings(mappedListings);
        if (mappedListings.length > 0) {
          setDeviceA((current) => current || mappedListings[0].valNumber);
          setDeviceB((current) => current || mappedListings[Math.min(1, mappedListings.length - 1)].valNumber);
        }
        if (config) setSiteConfig({ ...defaultWebsiteConfig, ...config });
      } catch (error) {
        console.error("Không tải được tin đăng từ backend", error);
        if (!cancelled) setListings([]);
      }
    };
    void refreshData();
    return () => { cancelled = true; };
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

  // Lọc sản phẩm
  const filteredListings = listings.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) {
      return false;
    }
    if (searchHave && !item.targetDemand.toLowerCase().includes(searchHave.toLowerCase())) {
      // nếu người dùng nhập máy họ có, tìm xem có tin nào muốn đổi máy đó không
      return false;
    }
    if (searchWant && !item.title.toLowerCase().includes(searchWant.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleSwapInputs = () => {
    const temp = searchHave;
    setSearchHave(searchWant);
    setSearchWant(temp);
  };

  const calculateDifference = () => {
    if (listings.length === 0 || deviceA <= 0 || deviceB <= 0) return { text: "Chưa có đủ tin đăng từ backend để tính bù trừ", type: "even" };
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
              Đăng Tin Thiết Bị
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
            Hiển thị <strong>{filteredListings.length}</strong> thiết bị đang chờ giao lưu
          </div>
        </div>
      </section>

      {/* ========================================================
          4. DANH SÁCH BÀI ĐĂNG TRAO ĐỔI (CARDS GRID)
          ======================================================== */}
      <main className={styles.mainContentSection}>
        <div className={styles.sectionHeading}>
          <div>
            <h2 className={styles.headingTitle}>Thiết Bị Nổi Bật Đang Chờ Trao Đổi</h2>
            <p className={styles.headingSubtitle}>
              Khám phá các đề xuất giao lưu thiết bị có giá trị tương đương hoặc bù trừ hợp lý.
            </p>
          </div>
        </div>

        {filteredListings.length === 0 && <div style={{ margin: "20px 0", padding: "36px 24px", textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: 18, background: "#fff", color: "#64748b" }}>Chưa có tin đăng nào được backend duyệt hoặc không có kết quả phù hợp. Hãy quay lại sau khi thành viên đăng tin và quản trị viên duyệt.</div>}
        <div className={styles.productGrid}>
          {filteredListings.map((item) => (
            <article key={item.id} className={styles.productCard}>
              {/* Phần hình ảnh & badge */}
              <div className={styles.cardVisualBanner} style={{ background: item.gradientBg, position: "relative", overflow: "hidden" }}>
                {item.images && item.images.length > 0 ? (
                  <>
                    <img
                      src={item.images[0].url}
                      alt={`Ảnh ${item.title}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                    {item.images.length > 1 && (
                      <span style={{ position: "absolute", right: 12, bottom: 12, zIndex: 2, padding: "5px 9px", borderRadius: 20, color: "#fff", background: "rgba(15,23,42,.78)", fontSize: 12 }}>
                        +{item.images.length - 1} ảnh
                      </span>
                    )}
                  </>
                ) : (
                  <div className={styles.deviceIconPlaceholder}>{item.deviceIcon}</div>
                )}
                <span className={styles.typeBadge}>{item.categoryName}</span>
                <span
                  className={`${styles.exchangeTypeBadge} ${
                    item.type === "Đổi ngang" ? styles.badgeEven : styles.badgePlus
                  }`}
                >
                  {item.type}
                </span>
              </div>

              {/* Phần thân thẻ sản phẩm */}
              <div className={styles.cardBody}>
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
                    <span>💬</span> Đánh giá ({item.reviewCount || 0})
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
                {listings.map((item) => <option key={item.id} value={item.valNumber}>{item.title} ({item.valNumber.toLocaleString("vi-VN")} đ)</option>)}
                {listings.length === 0 && <option value={0}>Chưa có thiết bị từ API</option>}
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
                {listings.map((item) => <option key={item.id} value={item.valNumber}>{item.title} ({item.valNumber.toLocaleString("vi-VN")} đ)</option>)}
                {listings.length === 0 && <option value={0}>Chưa có thiết bị từ API</option>}
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
                      placeholder="Nhập số tiền bạn bù thêm, ví dụ 2000000"
                      value={proposalCompensation}
                      onChange={(e) => setProposalCompensation(e.target.value)}
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
                    onClick={async () => {
                      if (!getAccessToken()) {
                        alert("Vui lòng đăng nhập trước khi gửi đề xuất trao đổi.");
                        return;
                      }
                      if (!proposalDevice.trim()) {
                        alert("Vui lòng nhập tên thiết bị bạn muốn mang ra đổi!");
                        return;
                      }
                      try {
                        await api("/trades", { method: "POST", body: JSON.stringify({
                          listingId: selectedItem.id,
                          offeredDeviceName: proposalDevice.trim(),
                          offeredDeviceSpecs: {},
                          compensationType: moneyToNumber(proposalCompensation) > 0 ? "proposer_adds" : "even",
                          compensationAmount: moneyToNumber(proposalCompensation),
                          note: proposalNote,
                        }) });
                        setIsSubmitted(true);
                      } catch (error) {
                        alert(error instanceof Error ? error.message : "Không thể gửi đề xuất.");
                      }
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
