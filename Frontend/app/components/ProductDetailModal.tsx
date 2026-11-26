"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api, formatMoney } from "../lib/api";
import { ExchangeItem } from "../lib/store";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ExchangeItem | null;
  isLoggedIn?: boolean;
  onProposeTrade: (item: ExchangeItem) => void;
  onOpenReviews: (item: ExchangeItem) => void;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeImages(rawImages: any): Array<{ id?: string; url: string; sortOrder?: number }> {
  if (!Array.isArray(rawImages)) return [];
  return rawImages
    .map((img: any, index: number) =>
      typeof img === "string"
        ? { id: `img-${index}`, url: img, sortOrder: index }
        : {
            id: img?.id || `img-${index}`,
            url: img?.url || img?.image_url || "",
            sortOrder: Number(img?.sortOrder ?? img?.sort_order ?? index),
          }
    )
    .filter((img) => typeof img.url === "string" && img.url.trim().length > 0)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
}

function normalizeListingDetail(raw: any, fallback: ExchangeItem): ExchangeItem {
  const valNumber = Number(raw?.valNumber ?? raw?.estimated_value ?? fallback.valNumber ?? 0);
  const specs = Array.isArray(raw?.specs)
    ? raw.specs.map(String)
    : raw?.specs && typeof raw.specs === "object"
      ? Object.entries(raw.specs).map(([k, v]) => `${k}: ${v}`)
      : fallback.specs || [];

  return {
    ...fallback,
    ...raw,
    id: String(raw?.id || fallback.id),
    title: raw?.title || fallback.title,
    description: raw?.description ?? fallback.description ?? "",
    category: raw?.category || fallback.category,
    categoryName: raw?.categoryName || fallback.categoryName,
    deviceIcon: raw?.deviceIcon || raw?.device_icon || fallback.deviceIcon || "💻",
    gradientBg: raw?.gradientBg || fallback.gradientBg || "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
    images: normalizeImages(raw?.images),
    type:
      raw?.type ||
      (raw?.exchangeType === "even" || raw?.exchange_type === "even" ? "Đổi ngang" : "Bù trừ"),
    exchangeType: raw?.exchangeType || raw?.exchange_type || fallback.exchangeType,
    specs,
    valNumber,
    estimatedValue: raw?.estimatedValue || formatMoney(valNumber),
    targetDemand: raw?.targetDemand || raw?.target_demand || fallback.targetDemand || "Chưa nêu yêu cầu đổi",
    location: raw?.location || fallback.location || "Chưa cập nhật địa điểm",
    ownerName: raw?.ownerName || fallback.ownerName || "Thành viên CEP",
    ownerAvatar: raw?.ownerAvatar ?? fallback.ownerAvatar ?? null,
    rating: Number(raw?.rating ?? fallback.rating ?? 0),
    dealCount: Number(raw?.dealCount ?? fallback.dealCount ?? 0),
    reviewCount: Number(raw?.reviewCount ?? fallback.reviewCount ?? 0),
    createdAt: raw?.createdAt || raw?.created_at || fallback.createdAt,
    updatedAt: raw?.updatedAt || raw?.updated_at || fallback.updatedAt,
    aiConfidence:
      raw?.aiConfidence !== undefined && raw?.aiConfidence !== null
        ? Number(raw.aiConfidence)
        : fallback.aiConfidence ?? null,
    aiDetectedInfo: raw?.aiDetectedInfo ?? fallback.aiDetectedInfo ?? null,
  };
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  item,
  isLoggedIn = false,
  onProposeTrade,
  onOpenReviews,
}: ProductDetailModalProps) {
  const [detail, setDetail] = useState<ExchangeItem | null>(item);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Tải chi tiết sản phẩm & danh sách hình ảnh từ bảng listing_images qua backend API
  useEffect(() => {
    if (!isOpen || !item) return;

    let cancelled = false;
    setDetail(item);
    setActiveImageIdx(0);
    setFailedUrls({});
    setIsLightboxOpen(false);
    setErrorMsg(null);

    if (!UUID_REGEX.test(item.id)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api<any>(`/listings/${encodeURIComponent(item.id)}`, { auth: false })
      .then((data) => {
        if (cancelled) return;
        setDetail(normalizeListingDetail(data, item));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Không tải được chi tiết sản phẩm từ backend:", err);
        setErrorMsg(err instanceof Error ? err.message : "Không thể tải chi tiết sản phẩm từ backend.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, item]);

  const validImages = useMemo(() => {
    const list = normalizeImages(detail?.images);
    return list.filter((img) => !failedUrls[img.url]);
  }, [detail?.images, failedUrls]);

  // Giữ chỉ số ảnh hợp lệ khi danh sách ảnh thay đổi
  useEffect(() => {
    if (activeImageIdx >= validImages.length && validImages.length > 0) {
      setActiveImageIdx(0);
    }
  }, [activeImageIdx, validImages.length]);

  // Hỗ trợ phím tắt ESC / ArrowLeft / ArrowRight
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowRight" && validImages.length > 1) {
        setActiveImageIdx((prev) => (prev + 1) % validImages.length);
      } else if (e.key === "ArrowLeft" && validImages.length > 1) {
        setActiveImageIdx((prev) => (prev - 1 + validImages.length) % validImages.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLightboxOpen, validImages.length, onClose]);

  if (!isOpen || !detail) return null;

  const currentImage = validImages[activeImageIdx] || null;
  const formattedCreatedAt = detail.createdAt
    ? new Date(detail.createdAt).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const handleMarkImageFailed = (url: string) => {
    setFailedUrls((prev) => ({ ...prev, [url]: true }));
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15, 23, 42, 0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "980px",
          maxHeight: "92vh",
          background: "#ffffff",
          borderRadius: "24px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 30px 70px -15px rgba(2, 26, 20, 0.45)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                background: "#0f172a",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                padding: "5px 11px",
                borderRadius: "8px",
              }}
            >
              {detail.categoryName}
            </span>
            <span
              style={{
                background:
                  detail.type === "Đổi ngang"
                    ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                    : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#ffffff",
                fontSize: "11.5px",
                fontWeight: 800,
                padding: "5px 12px",
                borderRadius: "9999px",
              }}
            >
              {detail.type}
            </span>
            {detail.aiConfidence !== null && detail.aiConfidence !== undefined && (
              <span
                style={{
                  background: "#ecfdf5",
                  color: "#047857",
                  border: "1px solid #a7f3d0",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "9999px",
                }}
              >
                ✓ AI kiểm duyệt {Math.round(detail.aiConfidence)}/100
              </span>
            )}
            {loading && (
              <span style={{ fontSize: "12px", color: "#047857", fontWeight: 600 }}>
                Đang đồng bộ dữ liệu từ backend...
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết sản phẩm"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Nội dung chính (cuộn được) */}
        <div
          style={{
            overflowY: "auto",
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
            alignItems: "start",
          }}
        >
          {/* CỘT TRÁI: GALLERY HÌNH ẢNH TỪ listing_images */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "18px",
                overflow: "hidden",
                background: currentImage ? "#0f172a" : detail.gradientBg,
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {currentImage ? (
                <>
                  <img
                    src={currentImage.url}
                    alt={`${detail.title} - ảnh ${activeImageIdx + 1}`}
                    referrerPolicy="no-referrer"
                    onClick={() => setIsLightboxOpen(true)}
                    onError={() => handleMarkImageFailed(currentImage.url)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      cursor: "zoom-in",
                      background: "#0f172a",
                    }}
                  />

                  {/* Bộ đếm số ảnh */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      background: "rgba(15, 23, 42, 0.78)",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "5px 11px",
                      borderRadius: "9999px",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {activeImageIdx + 1} / {validImages.length} ảnh
                  </span>

                  {/* Nút phóng to */}
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    title="Phóng to ảnh"
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      background: "rgba(15, 23, 42, 0.78)",
                      color: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "5px 11px",
                      borderRadius: "9999px",
                      cursor: "pointer",
                    }}
                  >
                    🔍 Phóng to
                  </button>

                  {/* Nút chuyển ảnh Trước / Sau */}
                  {validImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Ảnh trước"
                        onClick={() =>
                          setActiveImageIdx((prev) => (prev - 1 + validImages.length) % validImages.length)
                        }
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          border: "1px solid rgba(255,255,255,0.3)",
                          background: "rgba(15, 23, 42, 0.72)",
                          color: "#ffffff",
                          fontSize: "18px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        aria-label="Ảnh tiếp theo"
                        onClick={() => setActiveImageIdx((prev) => (prev + 1) % validImages.length)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          border: "1px solid rgba(255,255,255,0.3)",
                          background: "rgba(15, 23, 42, 0.72)",
                          color: "#ffffff",
                          fontSize: "18px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", color: "#ffffff", padding: "24px" }}>
                  <div style={{ fontSize: "76px", marginBottom: "10px" }}>{detail.deviceIcon || "💻"}</div>
                  <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: 600 }}>
                    {loading ? "Đang tải hình ảnh sản phẩm..." : "Tin đăng chưa có hình ảnh thực tế"}
                  </div>
                </div>
              )}
            </div>

            {/* Thanh thumbnail các ảnh trong listing_images */}
            {validImages.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                }}
              >
                {validImages.map((img, idx) => {
                  const isActive = idx === activeImageIdx;
                  return (
                    <button
                      key={img.id || img.url || idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      style={{
                        width: "74px",
                        height: "58px",
                        padding: 0,
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: isActive ? "2.5px solid #059669" : "1.5px solid #cbd5e1",
                        boxShadow: isActive ? "0 0 0 3px rgba(5, 150, 105, 0.2)" : "none",
                        cursor: "pointer",
                        flexShrink: 0,
                        background: "#0f172a",
                        opacity: isActive ? 1 : 0.75,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <img
                        src={img.url}
                        alt={`Ảnh thu nhỏ ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        onError={() => handleMarkImageFailed(img.url)}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Thông tin chủ sở hữu */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {detail.ownerAvatar ? (
                  <img
                    src={detail.ownerAvatar}
                    alt={detail.ownerName}
                    referrerPolicy="no-referrer"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #ffffff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "16px",
                    }}
                  >
                    {detail.ownerName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a" }}>
                    {detail.ownerName}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                    <span style={{ color: "#f59e0b", fontWeight: 700 }}>⭐ {detail.rating}</span> •{" "}
                    {detail.dealCount} lần đổi thành công • {detail.reviewCount || 0} đánh giá
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "12.5px", color: "#475569", fontWeight: 600 }}>
                📍 {detail.location}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM TỪ BACKEND */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {errorMsg && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                }}
              >
                ⚠️ {errorMsg} (Đang hiển thị thông tin đã tải trước đó)
              </div>
            )}

            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#0f172a",
                  margin: "0 0 8px",
                  lineHeight: 1.3,
                  letterSpacing: "-0.4px",
                }}
              >
                {detail.title}
              </h2>
              {formattedCreatedAt && (
                <div style={{ fontSize: "12.5px", color: "#64748b" }}>
                  🕒 Đăng lúc: {formattedCreatedAt}
                </div>
              )}
            </div>

            {/* Định giá tham khảo */}
            <div
              style={{
                background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
                border: "1px solid #a7f3d0",
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "13.5px", color: "#065f46", fontWeight: 700 }}>
                Định giá tham khảo
              </span>
              <span style={{ fontSize: "24px", fontWeight: 900, color: "#047857" }}>
                {detail.estimatedValue}
              </span>
            </div>

            {/* Nhu cầu muốn đổi */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderLeft: "4px solid #059669",
                borderRadius: "12px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 800,
                  color: "#047857",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "6px",
                }}
              >
                ⇄ Nhu cầu muốn đổi
              </div>
              <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                {detail.targetDemand}
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            {detail.specs && detail.specs.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#334155",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "10px",
                  }}
                >
                  ⚙️ Thông số & chi tiết kỹ thuật
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {detail.specs.map((spec, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "12.5px",
                        background: "#f1f5f9",
                        color: "#334155",
                        padding: "6px 11px",
                        borderRadius: "8px",
                        fontWeight: 600,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mô tả chi tiết từ người đăng */}
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#334155",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "8px",
                }}
              >
                📝 Mô tả tình trạng thiết bị
              </div>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  fontSize: "14px",
                  color: detail.description?.trim() ? "#334155" : "#94a3b8",
                  lineHeight: 1.65,
                  whiteSpace: "pre-line",
                }}
              >
                {detail.description?.trim()
                  ? detail.description
                  : "Người đăng chưa bổ sung mô tả chi tiết cho sản phẩm này."}
              </div>
            </div>

            {/* Nút hành động */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isLoggedIn ? "1fr auto" : "1fr",
                gap: "12px",
                paddingTop: "8px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProposeTrade(detail);
                  }}
                  style={{
                    background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "13px 20px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(4, 120, 87, 0.28)",
                  }}
                >
                  ⇄ Đề xuất đổi máy
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReviews(detail);
                }}
                style={{
                  background: "#f0fdf4",
                  color: "#065f46",
                  border: "1px solid rgba(16, 185, 129, 0.45)",
                  padding: "13px 18px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>💬</span> Đánh giá ({detail.reviewCount || 0})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox phóng to hình ảnh */}
      {isLightboxOpen && currentImage && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            background: "rgba(2, 6, 23, 0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(15,23,42,0.8)",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIdx((prev) => (prev - 1 + validImages.length) % validImages.length);
                }}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(15,23,42,0.8)",
                  color: "#ffffff",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIdx((prev) => (prev + 1) % validImages.length);
                }}
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(15,23,42,0.8)",
                  color: "#ffffff",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ›
              </button>
            </>
          )}

          <img
            src={currentImage.url}
            alt={`${detail.title} - phóng to ${activeImageIdx + 1}`}
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "92vw",
              maxHeight: "88vh",
              objectFit: "contain",
              borderRadius: "12px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      )}
    </div>
  );
}

