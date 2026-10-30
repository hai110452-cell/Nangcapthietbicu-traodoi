"use client";

import React, { useState, useEffect } from "react";

export interface ReviewReply {
  id: string;
  authorName: string;
  authorRole: "owner" | "moderator" | "user";
  content: string;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  helpfulCount: number;
  userLiked?: boolean;
  verifiedTrade: boolean;
  tradedDevice?: string;
  tags?: string[];
  replies?: ReviewReply[];
}

export interface ReviewModalItem {
  id: string;
  title: string;
  categoryName: string;
  gradientBg: string;
  deviceIcon: string;
  estimatedValue: string;
  targetDemand: string;
  specs: string[];
  location: string;
  ownerName: string;
  rating: number;
  dealCount: number;
}

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ReviewModalItem | null;
  onReviewsUpdated?: (productId: string, newAvgRating: number, totalReviews: number) => void;
}

// Dữ liệu đánh giá mẫu khởi tạo cho từng sản phẩm
const defaultReviewsMap: Record<string, ProductReview[]> = {
  "ex-1": [
    {
      id: "rev-101",
      productId: "ex-1",
      userName: "Hoàng Nam",
      userAvatar: "👨‍💼",
      rating: 5,
      comment: "Máy MacBook của Tuấn Anh cực kỳ đẹp và giữ gìn cẩn thận, pin còn nguyên 96% test coconutBattery chuẩn đét. Trao đổi tại quán cafe rất uy tín, hướng dẫn reset iCloud tận tình!",
      createdAt: "2 ngày trước",
      helpfulCount: 8,
      verifiedTrade: true,
      tradedDevice: "Đã giao lưu iPhone 15 Pro",
      tags: ["Máy đúng mô tả 💯", "Chủ máy nhiệt tình 👍", "Kiểm định đạt chuẩn ✅"],
      replies: [
        {
          id: "rep-101-1",
          authorName: "Tuấn Anh (Chủ máy)",
          authorRole: "owner",
          content: "Cảm ơn bạn Nam đã tin tưởng! Con iPhone 15 Pro bạn giao lưu dùng cũng rất ưng ý nhé.",
          createdAt: "1 ngày trước",
        },
      ],
    },
    {
      id: "rev-102",
      productId: "ex-1",
      userName: "Lê Minh Trí",
      userAvatar: "🧑‍💻",
      rating: 5,
      comment: "Đã test qua màn Liquid Retina XDR không hề có điểm chết, hiệu năng M2 Pro render video 4K siêu mượt. Giá trị bù trừ hợp lý, khuyên mọi người nên giao lưu với anh Tuấn Anh.",
      createdAt: "5 ngày trước",
      helpfulCount: 5,
      verifiedTrade: true,
      tags: ["Đổi ngang giá trị 🤝", "Giao dịch nhanh chóng ⚡"],
    },
    {
      id: "rev-103",
      productId: "ex-1",
      userName: "Quang Khải",
      userAvatar: "🎧",
      rating: 4,
      comment: "Máy đẹp, phụ kiện sạc MagSafe chính hãng zin theo hộp. Chỉ có một vết xước dăm siêu nhỏ ở đáy máy không đáng kể. Rất hài lòng!",
      createdAt: "1 tuần trước",
      helpfulCount: 2,
      verifiedTrade: false,
      tags: ["Máy đúng mô tả 💯"],
    },
  ],
  "ex-2": [
    {
      id: "rev-201",
      productId: "ex-2",
      userName: "Bảo Long",
      userAvatar: "📱",
      rating: 5,
      comment: "iPhone 14 Pro màu Deep Purple siêu sang, viền thép bóng loáng, màn hình 120Hz mượt mà. Minh Hoàng hỗ trợ test 3uTools xanh lè 100%. Rất an tâm!",
      createdAt: "Hôm qua",
      helpfulCount: 6,
      verifiedTrade: true,
      tradedDevice: "Đã đổi ThinkPad T14s",
      tags: ["Máy đúng mô tả 💯", "Chủ máy nhiệt tình 👍"],
    },
    {
      id: "rev-202",
      productId: "ex-2",
      userName: "Thế Vinh",
      userAvatar: "💻",
      rating: 5,
      comment: "Pin 89% dùng trọn 1 ngày thoải mái, camera chụp nét căng. Giao dịch trực tiếp tại Cầu Giấy nhanh chóng 15 phút.",
      createdAt: "3 ngày trước",
      helpfulCount: 3,
      verifiedTrade: false,
      tags: ["Giao dịch nhanh chóng ⚡"],
    },
  ],
  "ex-3": [
    {
      id: "rev-301",
      productId: "ex-3",
      userName: "Dương Nhật",
      userAvatar: "🎮",
      rating: 5,
      comment: "Dàn PC build rất gọn gàng, dây đi đẹp. VGA MSI Gaming X mát rượi full load chỉ 65 độ. Anh Đức Trọng còn tặng kèm cả bàn phím cơ cũ!",
      createdAt: "3 ngày trước",
      helpfulCount: 9,
      verifiedTrade: true,
      tradedDevice: "Đã đổi MacBook Air M1",
      tags: ["Chủ máy nhiệt tình 👍", "Máy đúng mô tả 💯"],
    },
  ],
  "ex-4": [
    {
      id: "rev-401",
      productId: "ex-4",
      userName: "Hải Đăng",
      userAvatar: "🦾",
      rating: 5,
      comment: "Galaxy S24 Ultra Titan Xám quá đẳng cấp. Camera zoom 100x và Galaxy AI dịch trực tiếp hoạt động hoàn hảo. Bảo hành Care+ dài yên tâm tuyệt đối.",
      createdAt: "4 ngày trước",
      helpfulCount: 11,
      verifiedTrade: true,
      tradedDevice: "Đã giao lưu ASUS ROG",
      tags: ["Máy đúng mô tả 💯", "Kiểm định đạt chuẩn ✅"],
    },
  ],
};

const SUGGESTED_TAGS = [
  "Máy đúng mô tả 💯",
  "Chủ máy nhiệt tình 👍",
  "Kiểm định đạt chuẩn ✅",
  "Đổi ngang giá trị 🤝",
  "Giao dịch nhanh chóng ⚡",
  "Bảo quản cẩn thận ✨",
];

export default function ProductReviewModal({
  isOpen,
  onClose,
  item,
  onReviewsUpdated,
}: ProductReviewModalProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [sortOption, setSortOption] = useState<"newest" | "highest" | "helpful">("newest");

  // Form State
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>("Tôi (Thành viên CEP)");
  const [commentText, setCommentText] = useState<string>("");
  const [tradedDevice, setTradedDevice] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Reply State
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  // Load reviews from localStorage or fallback
  useEffect(() => {
    if (!item) return;
    const storageKey = `cep_reviews_${item.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setReviews(JSON.parse(saved));
        return;
      } catch (err) {
        console.error("Failed to parse reviews:", err);
      }
    }
    const initialList = defaultReviewsMap[item.id] || [
      {
        id: `rev-${item.id}-default`,
        productId: item.id,
        userName: "Cộng đồng CEP",
        userAvatar: "🌟",
        rating: 5,
        comment: `Thiết bị ${item.title} được cộng đồng đánh giá rất cao về tính minh bạch và độ tin cậy phần cứng.`,
        createdAt: "3 ngày trước",
        helpfulCount: 4,
        verifiedTrade: true,
        tags: ["Máy đúng mô tả 💯", "Kiểm định đạt chuẩn ✅"],
      },
    ];
    setReviews(initialList);
    localStorage.setItem(storageKey, JSON.stringify(initialList));
  }, [item]);

  if (!isOpen || !item) return null;

  // Tính toán số liệu xếp hạng
  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1))
    : item.rating;

  const countByStar = (star: number) => reviews.filter((r) => r.rating === star).length;

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleHelpfulClick = (reviewId: string) => {
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        const isLiked = r.userLiked;
        return {
          ...r,
          userLiked: !isLiked,
          helpfulCount: isLiked ? r.helpfulCount - 1 : r.helpfulCount + 1,
        };
      }
      return r;
    });
    setReviews(updated);
    localStorage.setItem(`cep_reviews_${item.id}`, JSON.stringify(updated));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      alert("Vui lòng nhập nội dung đánh giá của bạn!");
      return;
    }

    setIsSubmitting(true);
    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: item.id,
      userName: authorName.trim() || "Thành viên CEP",
      userAvatar: "👤",
      rating: userRating,
      comment: commentText.trim(),
      createdAt: "Vừa xong",
      helpfulCount: 0,
      verifiedTrade: !!tradedDevice.trim(),
      tradedDevice: tradedDevice.trim() ? `Đã giao lưu ${tradedDevice.trim()}` : undefined,
      tags: selectedTags,
      replies: [],
    };

    setTimeout(() => {
      const updatedReviews = [newRev, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem(`cep_reviews_${item.id}`, JSON.stringify(updatedReviews));

      const newAvg = Number(
        (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
      );
      if (onReviewsUpdated) {
        onReviewsUpdated(item.id, newAvg, updatedReviews.length);
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setCommentText("");
      setTradedDevice("");
      setSelectedTags([]);

      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 400);
  };

  const handleAddReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    const newReply: ReviewReply = {
      id: `rep-${Date.now()}`,
      authorName: "Tuấn Anh (Chủ máy)",
      authorRole: "owner",
      content: replyText.trim(),
      createdAt: "Vừa xong",
    };

    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        return {
          ...r,
          replies: [...(r.replies || []), newReply],
        };
      }
      return r;
    });

    setReviews(updated);
    localStorage.setItem(`cep_reviews_${item.id}`, JSON.stringify(updated));
    setReplyingToId(null);
    setReplyText("");
  };

  // Lọc và sắp xếp
  const filteredReviews = reviews
    .filter((r) => (ratingFilter === "all" ? true : r.rating === ratingFilter))
    .sort((a, b) => {
      if (sortOption === "highest") return b.rating - a.rating;
      if (sortOption === "helpful") return b.helpfulCount - a.helpfulCount;
      return 0; // Mặc định thứ tự ban đầu (mới nhất trên cùng)
    });

  const getStarRatingLabel = (score: number) => {
    switch (score) {
      case 5: return "Tuyệt vời (5/5) — Cực kỳ hài lòng";
      case 4: return "Rất tốt (4/5) — Máy chuẩn, giao dịch tốt";
      case 3: return "Bình thường (3/5) — Đạt kỳ vọng cơ bản";
      case 2: return "Chưa hài lòng (2/5) — Có lỗi nhỏ phát sinh";
      case 1: return "Rất tệ (1/5) — Không đúng mô tả";
      default: return "";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "860px",
          maxHeight: "92vh",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          animation: "modalZoom 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: item.gradientBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                color: "#fff",
              }}
            >
              {item.deviceIcon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#059669",
                    background: "#ecfdf5",
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  {item.categoryName}
                </span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Đăng bởi: <strong>{item.ownerName}</strong>
                </span>
              </div>
              <h2
                style={{
                  fontSize: "19px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "4px 0 0 0",
                  lineHeight: "1.3",
                }}
              >
                {item.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              color: "#64748b",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Đóng cửa sổ"
          >
            ✕
          </button>
        </div>

        {/* Nội dung cuộn chính */}
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
          {/* Thông tin tóm tắt & Định giá */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginBottom: "24px",
              background: "#f8fafc",
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Định giá tham khảo:</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#047857" }}>{item.estimatedValue}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Nhu cầu muốn đổi:</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{item.targetDemand}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Địa điểm giao lưu:</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>📍 {item.location}</div>
            </div>
          </div>

          {/* KHỐI TỔNG QUAN XẾP HẠNG & ĐÁNH GIÁ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "240px 1fr",
              gap: "28px",
              padding: "24px",
              background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
              borderRadius: "20px",
              border: "1px solid rgba(167, 243, 208, 0.7)",
              marginBottom: "28px",
              alignItems: "center",
            }}
          >
            {/* Cột điểm trung bình */}
            <div style={{ textAlign: "center", borderRight: "1px solid rgba(16, 185, 129, 0.2)", paddingRight: "18px" }}>
              <div style={{ fontSize: "48px", fontWeight: 900, color: "#065f46", lineHeight: 1 }}>
                {avgRating}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "4px", margin: "8px 0" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: "20px",
                      color: star <= Math.round(avgRating) ? "#f59e0b" : "#cbd5e1",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div style={{ fontSize: "13px", color: "#047857", fontWeight: 700 }}>
                {totalReviewsCount} lượt đánh giá & bình luận
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                100% từ người dùng CEP đã giao dịch
              </div>
            </div>

            {/* Cột các thanh phần trăm sao */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = countByStar(star);
                const percent = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                return (
                  <div
                    key={star}
                    style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", cursor: "pointer" }}
                    onClick={() => setRatingFilter(ratingFilter === star ? "all" : star)}
                  >
                    <span style={{ width: "42px", fontWeight: 700, color: "#1e293b" }}>
                      {star} sao
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "8px",
                        background: "#e2e8f0",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: "100%",
                          background: star >= 4 ? "linear-gradient(90deg, #10b981, #059669)" : "#f59e0b",
                          borderRadius: "999px",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                    <span style={{ width: "36px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORM THÊM ĐÁNH GIÁ & BÌNH LUẬN */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              padding: "24px",
              marginBottom: "32px",
              boxShadow: "0 4px 16px -4px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "22px" }}>✍️</span>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Viết Đánh Giá & Nhận Xét Của Bạn
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                  Chia sẻ trải nghiệm trao đổi hoặc nhận xét độ chuẩn xác về thông số của thiết bị này.
                </p>
              </div>
            </div>

            {submitSuccess && (
              <div
                style={{
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  color: "#166534",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>🎉</span> Cảm ơn bạn! Đánh giá và bình luận của bạn đã được xuất bản thành công.
              </div>
            )}

            <form onSubmit={handleSubmitReview}>
              {/* Chọn số sao trực quan */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Đánh giá mức độ hài lòng:
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (hoverRating || userRating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setUserRating(star)}
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "30px",
                            color: isFilled ? "#f59e0b" : "#cbd5e1",
                            cursor: "pointer",
                            padding: "0 2px",
                            transition: "transform 0.15s ease",
                            transform: isFilled ? "scale(1.15)" : "scale(1)",
                          }}
                          title={`${star} sao`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#065f46", marginLeft: "10px" }}>
                    {getStarRatingLabel(hoverRating || userRating)}
                  </span>
                </div>
              </div>

              {/* Tên & Thiết bị đã đổi */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                    Họ tên hoặc Biệt danh hiển thị:
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="VD: Tuấn Anh, Minh Hoàng..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                    Thiết bị bạn từng mang ra giao lưu (Tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={tradedDevice}
                    onChange={(e) => setTradedDevice(e.target.value)}
                    placeholder="VD: iPhone 14 Pro, ThinkPad T14s..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Chọn Tag nhanh */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Điểm cộng nổi bật (Chọn nhanh nhãn):
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {SUGGESTED_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          border: isSelected ? "1px solid #059669" : "1px solid #e2e8f0",
                          background: isSelected ? "#ecfdf5" : "#f8fafc",
                          color: isSelected ? "#065f46" : "#475569",
                          fontSize: "12px",
                          fontWeight: isSelected ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ô nhập bình luận */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                  Nội dung nhận xét & bình luận:
                </label>
                <textarea
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Chia sẻ chi tiết về tình trạng ngoại hình, pin, màn hình, thái độ giao dịch của chủ máy hoặc cảm nhận trải nghiệm của bạn..."
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "12px 28px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(5, 150, 105, 0.35)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi Đánh Giá & Bình Luận ✨"}
                </button>
              </div>
            </form>
          </div>

          {/* KHU VỰC BỘ LỌC BÌNH LUẬN */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>Lọc theo:</span>
              <button
                type="button"
                onClick={() => setRatingFilter("all")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: ratingFilter === "all" ? 700 : 500,
                  border: "none",
                  background: ratingFilter === "all" ? "#065f46" : "#f1f5f9",
                  color: ratingFilter === "all" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                Tất cả ({reviews.length})
              </button>
              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingFilter(star)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: ratingFilter === star ? 700 : 500,
                    border: "none",
                    background: ratingFilter === star ? "#065f46" : "#f1f5f9",
                    color: ratingFilter === star ? "#ffffff" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {star} sao ({countByStar(star)})
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Sắp xếp:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  color: "#334155",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="newest">Mới nhất</option>
                <option value="helpful">Nhiều lượt thích nhất</option>
                <option value="highest">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          {/* DANH SÁCH BÌNH LUẬN & ĐÁNH GIÁ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredReviews.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  background: "#f8fafc",
                  borderRadius: "16px",
                  border: "1px dashed #cbd5e1",
                  color: "#64748b",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>💬</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>Chưa có bình luận nào ở mức sao này.</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Hãy là người đầu tiên để lại đánh giá cho sản phẩm này!</div>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    border: "1px solid #e2e8f0",
                    transition: "box-shadow 0.2s ease",
                  }}
                >
                  {/* Header của từng review */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "#e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: 700,
                        }}
                      >
                        {rev.userAvatar || rev.userName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{rev.userName}</strong>
                          {rev.verifiedTrade && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#047857",
                                background: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              ✓ Đã xác thực giao dịch
                            </span>
                          )}
                        </div>
                        {rev.tradedDevice && (
                          <div style={{ fontSize: "11px", color: "#2563eb", marginTop: "2px" }}>
                            ⇄ {rev.tradedDevice}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#f59e0b", fontSize: "15px", letterSpacing: "1px" }}>
                        {"★".repeat(rev.rating)}
                        {"☆".repeat(5 - rev.rating)}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                        {rev.createdAt}
                      </div>
                    </div>
                  </div>

                  {/* Tags đã chọn */}
                  {rev.tags && rev.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                      {rev.tags.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: "11px",
                            background: "#f1f5f9",
                            color: "#475569",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontWeight: 500,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Nội dung đánh giá */}
                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "#334155",
                      lineHeight: "1.65",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {rev.comment}
                  </p>

                  {/* Thanh tương tác Hữu ích & Trả lời */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(rev.id)}
                      style={{
                        background: rev.userLiked ? "#ecfdf5" : "transparent",
                        border: rev.userLiked ? "1px solid #86efac" : "1px solid #e2e8f0",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: rev.userLiked ? "#047857" : "#64748b",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>👍</span> Hữu ích ({rev.helpfulCount})
                    </button>

                    <button
                      type="button"
                      onClick={() => setReplyingToId(replyingToId === rev.id ? null : rev.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        fontSize: "12px",
                        color: "#2563eb",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>💬</span> {replyingToId === rev.id ? "Hủy trả lời" : "Trả lời"}
                    </button>
                  </div>

                  {/* Ô nhập phản hồi */}
                  {replyingToId === rev.id && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                        Phản hồi bình luận của {rev.userName}:
                      </div>
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Nhập nội dung phản hồi từ chủ máy..."
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12px",
                          marginBottom: "8px",
                          outline: "none",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "12px",
                            color: "#64748b",
                            cursor: "pointer",
                            padding: "4px 8px",
                          }}
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddReply(rev.id)}
                          style={{
                            background: "#065f46",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 14px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Gửi phản hồi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Danh sách các phản hồi (Replies) */}
                  {rev.replies && rev.replies.length > 0 && (
                    <div
                      style={{
                        marginTop: "12px",
                        paddingLeft: "16px",
                        borderLeft: "2px solid #a7f3d0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {rev.replies.map((reply) => (
                        <div
                          key={reply.id}
                          style={{
                            background: "#f0fdf4",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            fontSize: "12.5px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                            <strong style={{ color: "#065f46" }}>{reply.authorName}</strong>
                            <span
                              style={{
                                fontSize: "10px",
                                background: "#dcfce7",
                                color: "#15803d",
                                padding: "1px 5px",
                                borderRadius: "4px",
                                fontWeight: 700,
                              }}
                            >
                              Người đăng tin
                            </span>
                            <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "auto" }}>
                              {reply.createdAt}
                            </span>
                          </div>
                          <div style={{ color: "#1e293b", lineHeight: "1.5" }}>{reply.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            Hệ thống bình luận bảo mật bởi CEP Trust Engine 🛡️
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#0f172a",
              color: "#ffffff",
              border: "none",
              padding: "10px 24px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
