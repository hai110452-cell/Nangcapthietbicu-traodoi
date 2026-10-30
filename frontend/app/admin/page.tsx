"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import {
  ExchangeItem,
  WebsiteConfig,
  UserProfile,
  UserRole,
  defaultWebsiteConfig,
  getStoredConfig,
  saveStoredConfig,
  getStoredListings,
  saveStoredListings,
  getStoredRole,
  saveStoredRole,
  initialUsers,
} from "../lib/store";
import { ProductReview } from "../components/ProductReviewModal";

interface PendingPost {
  id: string;
  title: string;
  category: string;
  ownerName: string;
  val: string;
  demand: string;
  aiScore: number;
  aiDetected: string;
  status: "pending" | "approved" | "rejected";
  time: string;
}

const initialPendingPosts: PendingPost[] = [
  {
    id: "post-801",
    title: "MacBook Air M2 8GB/256GB Midnight Đẹp Keng",
    category: "Laptop Apple",
    ownerName: "Hải Đăng",
    val: "19.500.000 đ",
    demand: "Muốn đổi: iPad Pro M1 11 inch hoặc iPhone 14 Pro Max",
    aiScore: 99.1,
    aiDetected: "Xác thực đúng MacBook Air M2 (A2681), không trầy xước",
    status: "pending",
    time: "10 phút trước",
  },
  {
    id: "post-802",
    title: "Case PC Gaming i7-12700K / RTX 3080 10GB Tản Nước",
    category: "PC Gaming",
    ownerName: "Bảo Long",
    val: "23.000.000 đ",
    demand: "Muốn đổi: Laptop Gaming ASUS ROG hoặc Dell XPS 15",
    aiScore: 97.4,
    aiDetected: "Nhận diện VGA MSI RTX 3080 & Vỏ Corsair 4000D",
    status: "pending",
    time: "35 phút trước",
  },
  {
    id: "post-803",
    title: "iPhone 13 128GB Xanh Lá VN/A Pin 87%",
    category: "Điện thoại iOS",
    ownerName: "Thùy Linh",
    val: "11.200.000 đ",
    demand: "Muốn đổi: Laptop văn phòng mỏng nhẹ đời mới",
    aiScore: 98.8,
    aiDetected: "Xác thực camera kép chéo, màn zin chưa ép kính",
    status: "approved",
    time: "2 giờ trước",
  },
];

export default function AdminPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"listings" | "site_config" | "comments" | "pending_posts" | "users">("listings");

  // Dữ liệu sản phẩm (CRUD)
  const [listings, setListings] = useState<ExchangeItem[]>([]);
  const [searchListing, setSearchListing] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // State Modal Thêm/Sửa sản phẩm
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExchangeItem | null>(null);
  const [itemForm, setItemForm] = useState({
    title: "",
    category: "laptop" as "laptop" | "pc" | "iphone" | "android",
    categoryName: "Laptop Apple",
    type: "Bù trừ" as "Đổi ngang" | "Bù trừ",
    estimatedValue: "20.000.000 đ",
    valNumber: 20000000,
    targetDemand: "",
    specsText: "",
    location: "Quận 1, TP. Hồ Chí Minh",
    ownerName: "Ban Quản Trị CEP",
    rating: 5.0,
    deviceIcon: "💻",
    gradientBg: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
  });

  // State Cấu hình website
  const [siteConfig, setSiteConfig] = useState<WebsiteConfig>(defaultWebsiteConfig);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // State Quản lý bình luận
  const [allReviews, setAllReviews] = useState<{ productId: string; productTitle: string; review: ProductReview }[]>([]);
  const [reviewSearch, setReviewSearch] = useState("");
  const [editingReview, setEditingReview] = useState<{ productId: string; review: ProductReview } | null>(null);
  const [editReviewText, setEditReviewText] = useState("");

  // State Bài đăng chờ duyệt & Người dùng
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>(initialPendingPosts);
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);

  // Load toàn bộ dữ liệu khi mount
  useEffect(() => {
    setCurrentRole(getStoredRole());
    setListings(getStoredListings());
    setSiteConfig(getStoredConfig());
    loadAllReviews(getStoredListings());

    const handleRoleUpdate = () => setCurrentRole(getStoredRole());
    window.addEventListener("cep_role_updated", handleRoleUpdate);
    return () => window.removeEventListener("cep_role_updated", handleRoleUpdate);
  }, []);

  // Đọc toàn bộ bình luận từ localStorage của từng sản phẩm
  const loadAllReviews = (currentListings: ExchangeItem[]) => {
    if (typeof window === "undefined") return;
    const combined: { productId: string; productTitle: string; review: ProductReview }[] = [];
    currentListings.forEach((item) => {
      const saved = localStorage.getItem(`cep_reviews_${item.id}`);
      if (saved) {
        try {
          const parsed: ProductReview[] = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach((rev) => {
              combined.push({
                productId: item.id,
                productTitle: item.title,
                review: rev,
              });
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
    setAllReviews(combined);
  };

  // --- CRUD SẢN PHẨM ---
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemForm({
      title: "",
      category: "laptop",
      categoryName: "Laptop Apple",
      type: "Bù trừ",
      estimatedValue: "18.500.000 đ",
      valNumber: 18500000,
      targetDemand: "Muốn đổi sang iPhone hoặc Laptop khác",
      specsText: "Pin 95%\nNgoại hình 99%\nĐầy đủ phụ kiện chính hãng",
      location: "Quận 1, TP. Hồ Chí Minh",
      ownerName: "Quản Trị Viên CEP",
      rating: 5.0,
      deviceIcon: "💻",
      gradientBg: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)",
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: ExchangeItem) => {
    setEditingItem(item);
    setItemForm({
      title: item.title,
      category: item.category,
      categoryName: item.categoryName,
      type: item.type,
      estimatedValue: item.estimatedValue,
      valNumber: item.valNumber,
      targetDemand: item.targetDemand,
      specsText: item.specs.join("\n"),
      location: item.location,
      ownerName: item.ownerName,
      rating: item.rating,
      deviceIcon: item.deviceIcon,
      gradientBg: item.gradientBg,
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title.trim()) {
      alert("Vui lòng nhập tên thiết bị!");
      return;
    }

    const specsArray = itemForm.specsText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const categoryGradients: Record<string, { icon: string; name: string; bg: string }> = {
      laptop: { icon: "💻", name: "Laptop Ultrabook", bg: "linear-gradient(135deg, #334155 0%, #1e293b 100%)" },
      iphone: { icon: "📱", name: "Điện thoại iOS", bg: "linear-gradient(135deg, #4c1d95 0%, #581c87 100%)" },
      pc: { icon: "🖥️", name: "Máy tính bàn PC", bg: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)" },
      android: { icon: "📱", name: "Điện thoại Android", bg: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)" },
    };

    const catMeta = categoryGradients[itemForm.category] || categoryGradients.laptop;

    if (editingItem) {
      // Sửa sản phẩm
      const updatedList = listings.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              title: itemForm.title.trim(),
              category: itemForm.category,
              categoryName: itemForm.categoryName || catMeta.name,
              type: itemForm.type,
              estimatedValue: itemForm.estimatedValue,
              valNumber: itemForm.valNumber,
              targetDemand: itemForm.targetDemand.trim(),
              specs: specsArray.length > 0 ? specsArray : ["Đầy đủ phụ kiện"],
              location: itemForm.location.trim(),
              ownerName: itemForm.ownerName.trim(),
              deviceIcon: catMeta.icon,
              gradientBg: catMeta.bg,
            }
          : it
      );
      setListings(updatedList);
      saveStoredListings(updatedList);
      loadAllReviews(updatedList);
      alert("Đã cập nhật thông tin sản phẩm thành công!");
    } else {
      // Thêm sản phẩm mới
      const newItem: ExchangeItem = {
        id: `ex-${Date.now()}`,
        title: itemForm.title.trim(),
        category: itemForm.category,
        categoryName: itemForm.categoryName || catMeta.name,
        type: itemForm.type,
        estimatedValue: itemForm.estimatedValue,
        valNumber: itemForm.valNumber,
        targetDemand: itemForm.targetDemand.trim(),
        specs: specsArray.length > 0 ? specsArray : ["Máy đẹp 99%", "Bảo hành đầy đủ"],
        location: itemForm.location.trim(),
        ownerName: itemForm.ownerName.trim(),
        rating: 5.0,
        dealCount: 1,
        reviewCount: 0,
        deviceIcon: catMeta.icon,
        gradientBg: catMeta.bg,
      };
      const updatedList = [newItem, ...listings];
      setListings(updatedList);
      saveStoredListings(updatedList);
      loadAllReviews(updatedList);
      alert("Đã thêm sản phẩm mới vào website thành công!");
    }

    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (itemId: string, itemTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn XÓA sản phẩm "${itemTitle}" khỏi website không?`)) {
      return;
    }
    const updated = listings.filter((it) => it.id !== itemId);
    setListings(updated);
    saveStoredListings(updated);
    localStorage.removeItem(`cep_reviews_${itemId}`);
    loadAllReviews(updated);
    alert(`Đã xóa sản phẩm "${itemTitle}" thành công!`);
  };

  // --- QUẢN LÝ CẤU HÌNH WEBSITE ---
  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredConfig(siteConfig);
    setSaveSuccessMsg("Đã lưu và áp dụng toàn bộ cấu hình mới cho website!");
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  const handleResetSiteConfig = () => {
    if (!confirm("Bạn có muốn khôi phục lại cấu hình mặc định ban đầu không?")) return;
    setSiteConfig(defaultWebsiteConfig);
    saveStoredConfig(defaultWebsiteConfig);
    setSaveSuccessMsg("Đã khôi phục cài đặt mặc định thành công!");
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  // --- QUẢN LÝ BÌNH LUẬN ---
  const handleDeleteReview = (productId: string, reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;
    const storageKey = `cep_reviews_${productId}`;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed: ProductReview[] = JSON.parse(raw);
      const filtered = parsed.filter((r) => r.id !== reviewId);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      loadAllReviews(listings);
      alert("Đã xóa bình luận thành công!");
    }
  };

  const handleSaveEditedReview = () => {
    if (!editingReview) return;
    const storageKey = `cep_reviews_${editingReview.productId}`;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed: ProductReview[] = JSON.parse(raw);
      const updated = parsed.map((r) =>
        r.id === editingReview.review.id ? { ...r, comment: editReviewText.trim() } : r
      );
      localStorage.setItem(storageKey, JSON.stringify(updated));
      loadAllReviews(listings);
      setEditingReview(null);
      setEditReviewText("");
      alert("Đã sửa nội dung bình luận thành công!");
    }
  };

  // --- QUẢN LÝ BÀI ĐĂNG CHỜ & USER ---
  const handleApprovePost = (postId: string) => {
    setPendingPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "approved" } : p)));
    alert("Đã duyệt tin đăng!");
  };

  const handleRejectPost = (postId: string) => {
    setPendingPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "rejected" } : p)));
    alert("Đã từ chối tin đăng!");
  };

  const handleToggleUserRole = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newRole = u.role === "admin" ? "user" : "admin";
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  // Lọc sản phẩm hiển thị trong bảng Admin
  const filteredListings = listings.filter((it) => {
    if (categoryFilter !== "all" && it.category !== categoryFilter) return false;
    if (searchListing && !it.title.toLowerCase().includes(searchListing.toLowerCase())) return false;
    return true;
  });

  // KIỂM TRA PHÂN QUYỀN NGHIÊM NGẶT: Người dùng thường KHÔNG ĐƯỢC PHÉP truy cập trang quản trị
  if (currentRole !== "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
        <Navbar />

        <main style={{ maxWidth: "620px", margin: "70px auto", padding: "0 24px", textAlign: "center" }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "48px 36px",
              border: "1.5px solid #fee2e2",
              boxShadow: "0 20px 50px -15px rgba(239, 68, 68, 0.12)",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🚫</div>

            <div
              style={{
                display: "inline-block",
                background: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                padding: "4px 14px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: "800",
                marginBottom: "14px",
              }}
            >
              403 FORBIDDEN — TRUY CẬP BỊ TỪ CHỐI
            </div>

            <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "12px" }}>
              Tài Khoản Người Dùng Không Có Quyền Quản Trị!
            </h1>

            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.65", marginBottom: "28px" }}>
              Trang Quản Trị Hệ Thống (Master CMS) này chỉ dành riêng cho <strong>Ban Quản Trị Viên</strong>.
              Tài khoản Người Dùng thường tuyệt đối không có quyền xem, sửa, thêm hoặc xóa thông tin của website.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/"
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  padding: "12px 22px",
                  borderRadius: "12px",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ← Quay Lại Trang Chủ Người Dùng
              </Link>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  background: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontSize: "13.5px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(5, 150, 105, 0.3)",
                }}
              >
                <span>🔑</span> Đăng Nhập Quản Trị Viên (Admin)
              </button>
            </div>
          </div>
        </main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentRole={currentRole}
          onRoleChange={(role) => setCurrentRole(role)}
          defaultAdminLogin={true}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      <Navbar />

      <main style={{ maxWidth: "1320px", margin: "24px auto 80px", padding: "0 24px" }}>
        {/* Tiêu đề Cổng Quản Trị */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#ecfdf5",
                color: "#059669",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "800",
                marginBottom: "8px",
                border: "1px solid #a7f3d0",
              }}
            >
              🛡️ CỔNG QUẢN TRỊ VIÊN HỆ THỐNG (MASTER ADMIN CMS)
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
              Quản Trị Toàn Bộ Thông Tin & Dữ Liệu Website
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0 0" }}>
              Toàn quyền Thêm, Sửa, Xóa sản phẩm, duyệt bình luận, thay đổi giao diện và cấu hình website.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/"
              style={{
                background: "#ffffff",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                padding: "10px 18px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "700",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
            >
              <span>↗</span> Xem Web Người Dùng
            </Link>
            <button
              onClick={handleOpenAddModal}
              style={{
                background: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
                color: "#ffffff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "12px",
                fontSize: "13.5px",
                fontWeight: "800",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(5, 150, 105, 0.35)",
              }}
            >
              <span>➕</span> Thêm Sản Phẩm Mới
            </button>
          </div>
        </div>

        {/* 5 Tab Quản trị dạng Khung Viền Sang Trọng */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "24px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "14px",
            overflowX: "auto",
          }}
        >
          {[
            { id: "listings", label: `📱 Quản Lý Sản Phẩm (${listings.length})`, icon: "📦" },
            { id: "site_config", label: "🌐 Sửa Thông Tin Website", icon: "✏️" },
            { id: "comments", label: `💬 Quản Lý Bình Luận (${allReviews.length})`, icon: "💬" },
            { id: "pending_posts", label: `📋 Duyệt Tin Đăng (${pendingPosts.filter((p) => p.status === "pending").length})`, icon: "⏳" },
            { id: "users", label: `👥 Thành Viên (${users.length})`, icon: "👥" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: isActive ? "1.5px solid #059669" : "1.5px solid #e2e8f0",
                  background: isActive ? "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)" : "#ffffff",
                  color: isActive ? "#065f46" : "#475569",
                  fontWeight: isActive ? "800" : "600",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap",
                  boxShadow: isActive ? "0 4px 12px rgba(5, 150, 105, 0.15)" : "0 1px 3px rgba(0,0,0,0.03)",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: QUẢN LÝ SẢN PHẨM (CRUD TOÀN DIỆN)
            ======================================================== */}
        {activeTab === "listings" && (
          <div>
            {/* Thanh công cụ tìm kiếm và lọc */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#ffffff",
                padding: "16px 20px",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                marginBottom: "20px",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "10px", flex: 1, minWidth: "260px" }}>
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm sản phẩm theo tên..."
                  value={searchListing}
                  onChange={(e) => setSearchListing(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 600 }}>Danh mục:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">Tất cả ({listings.length})</option>
                  <option value="laptop">Laptop Apple / Windows</option>
                  <option value="iphone">iPhone iOS</option>
                  <option value="android">Điện thoại Android</option>
                  <option value="pc">PC Gaming</option>
                </select>
              </div>
            </div>

            {/* Bảng danh sách sản phẩm */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "12.5px", color: "#64748b" }}>
                    <th style={{ padding: "16px 20px" }}>Thiết bị</th>
                    <th style={{ padding: "16px 20px" }}>Danh mục & Kiểu đổi</th>
                    <th style={{ padding: "16px 20px" }}>Định giá</th>
                    <th style={{ padding: "16px 20px" }}>Nhu cầu muốn đổi</th>
                    <th style={{ padding: "16px 20px" }}>Chủ máy & Vị trí</th>
                    <th style={{ padding: "16px 20px", textAlign: "right" }}>Thao tác Quản trị</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        Không tìm thấy sản phẩm nào.
                      </td>
                    </tr>
                  ) : (
                    filteredListings.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13.5px" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                background: item.gradientBg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px",
                                color: "#fff",
                              }}
                            >
                              {item.deviceIcon}
                            </div>
                            <div>
                              <strong style={{ color: "#0f172a", fontSize: "14px" }}>{item.title}</strong>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>
                                ⭐ {item.rating} ({item.reviewCount || 0} đánh giá)
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              background: "#ecfdf5",
                              color: "#047857",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontWeight: 700,
                            }}
                          >
                            {item.categoryName}
                          </span>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>{item.type}</div>
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: "700", color: "#047857" }}>
                          {item.estimatedValue}
                        </td>
                        <td style={{ padding: "16px 20px", maxWidth: "260px", color: "#334155" }}>
                          {item.targetDemand}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <strong>{item.ownerName}</strong>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>📍 {item.location}</div>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              style={{
                                background: "#f8fafc",
                                border: "1px solid #cbd5e1",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "12.5px",
                                fontWeight: "700",
                                color: "#0369a1",
                                cursor: "pointer",
                              }}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.title)}
                              style={{
                                background: "#fef2f2",
                                border: "1px solid #fecaca",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "12.5px",
                                fontWeight: "700",
                                color: "#b91c1c",
                                cursor: "pointer",
                              }}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: SỬA THÔNG TIN & CẤU HÌNH TOÀN BỘ WEBSITE
            ======================================================== */}
        {activeTab === "site_config" && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "32px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
              maxWidth: "960px",
              margin: "0 auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Chỉnh Sửa Toàn Bộ Thông Tin Hiển Thị Trên Website
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                  Mọi thay đổi tại đây sẽ được đồng bộ và cập nhật trực tiếp lên trang chủ của Người dùng.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetSiteConfig}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  color: "#475569",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                🔄 Khôi phục mặc định
              </button>
            </div>

            {saveSuccessMsg && (
              <div
                style={{
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  color: "#15803d",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  marginBottom: "20px",
                }}
              >
                🎉 {saveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveSiteConfig}>
              {/* Thương hiệu & Slogan */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Tên thương hiệu website (Brand Name):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.brandName}
                    onChange={(e) => setSiteConfig({ ...siteConfig, brandName: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Khẩu hiệu / Slogan logo:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.brandSlogan}
                    onChange={(e) => setSiteConfig({ ...siteConfig, brandSlogan: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    required
                  />
                </div>
              </div>

              {/* Tiêu đề Hero Banner */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Tiêu đề chính Banner Trang chủ:
                </label>
                <input
                  type="text"
                  value={siteConfig.heroTitle}
                  onChange={(e) => setSiteConfig({ ...siteConfig, heroTitle: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "10px" }}
                  required
                />
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Phần chữ làm nổi bật (Highlight):
                </label>
                <input
                  type="text"
                  value={siteConfig.heroHighlight}
                  onChange={(e) => setSiteConfig({ ...siteConfig, heroHighlight: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  required
                />
              </div>

              {/* Đoạn mô tả giới thiệu */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Đoạn mô tả giới thiệu (Hero Description):
                </label>
                <textarea
                  rows={3}
                  value={siteConfig.heroDescription}
                  onChange={(e) => setSiteConfig({ ...siteConfig, heroDescription: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", lineHeight: "1.6" }}
                  required
                />
              </div>

              {/* Hotline, Email & Địa chỉ kiểm định */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Hotline hỗ trợ 24/7:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.hotline}
                    onChange={(e) => setSiteConfig({ ...siteConfig, hotline: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Email hỗ trợ:
                  </label>
                  <input
                    type="email"
                    value={siteConfig.supportEmail}
                    onChange={(e) => setSiteConfig({ ...siteConfig, supportEmail: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Địa chỉ trung tâm kiểm định & giao dịch an toàn:
                </label>
                <input
                  type="text"
                  value={siteConfig.inspectionAddress}
                  onChange={(e) => setSiteConfig({ ...siteConfig, inspectionAddress: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 6px 18px rgba(5, 150, 105, 0.3)",
                }}
              >
                <span>💾</span> Lưu & Xuất Bản Toàn Bộ Thông Tin Website
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB 3: QUẢN LÝ BÌNH LUẬN & ĐÁNH GIÁ (REVIEWS CMS)
            ======================================================== */}
        {activeTab === "comments" && (
          <div>
            <div
              style={{
                background: "#ffffff",
                padding: "18px 22px",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Kiểm Soát & Quản Trị Bình Luận Toàn Bộ Hệ Thống
                </h3>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                  Admin có thể chỉnh sửa nội dung phản hồi không phù hợp hoặc xóa bình luận spam/vi phạm.
                </p>
              </div>
              <input
                type="text"
                placeholder="🔍 Tìm theo tên người bình luận hoặc nội dung..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  width: "320px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {allReviews.filter((item) =>
                reviewSearch
                  ? item.review.userName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                    item.review.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                    item.productTitle.toLowerCase().includes(reviewSearch.toLowerCase())
                  : true
              ).length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "16px", color: "#64748b" }}>
                  Chưa có bình luận nào phù hợp.
                </div>
              ) : (
                allReviews
                  .filter((item) =>
                    reviewSearch
                      ? item.review.userName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                        item.review.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                        item.productTitle.toLowerCase().includes(reviewSearch.toLowerCase())
                      : true
                  )
                  .map((item) => (
                    <div
                      key={item.review.id}
                      style={{
                        background: "#ffffff",
                        padding: "20px 24px",
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <strong style={{ fontSize: "14px", color: "#0f172a" }}>{item.review.userName}</strong>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                              đánh giá trên sản phẩm: <strong style={{ color: "#047857" }}>{item.productTitle}</strong>
                            </span>
                            {item.review.verifiedTrade && (
                              <span style={{ fontSize: "10px", background: "#ecfdf5", color: "#047857", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                                ✓ Đã giao lưu
                              </span>
                            )}
                          </div>
                          <div style={{ color: "#f59e0b", fontSize: "14px", marginTop: "3px" }}>
                            {"★".repeat(item.review.rating)}
                            {"☆".repeat(5 - item.review.rating)}
                            <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "8px" }}>{item.review.createdAt}</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => {
                              setEditingReview({ productId: item.productId, review: item.review });
                              setEditReviewText(item.review.comment);
                            }}
                            style={{
                              background: "#f0f9ff",
                              border: "1px solid #bae6fd",
                              color: "#0369a1",
                              padding: "5px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            ✏️ Sửa nội dung
                          </button>
                          <button
                            onClick={() => handleDeleteReview(item.productId, item.review.id)}
                            style={{
                              background: "#fef2f2",
                              border: "1px solid #fecaca",
                              color: "#b91c1c",
                              padding: "5px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            🗑️ Xóa bình luận
                          </button>
                        </div>
                      </div>

                      <p style={{ margin: "0 0 10px 0", fontSize: "13.5px", color: "#334155", lineHeight: "1.6" }}>
                        {item.review.comment}
                      </p>

                      {/* Modal chỉnh sửa bình luận nhanh */}
                      {editingReview && editingReview.review.id === item.review.id && (
                        <div style={{ marginTop: "12px", background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>
                            Chỉnh sửa nội dung bình luận (Admin):
                          </label>
                          <textarea
                            rows={3}
                            value={editReviewText}
                            onChange={(e) => setEditReviewText(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "8px" }}
                          />
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button
                              onClick={() => setEditingReview(null)}
                              style={{ background: "#f1f5f9", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
                            >
                              Hủy
                            </button>
                            <button
                              onClick={handleSaveEditedReview}
                              style={{ background: "#065f46", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                            >
                              Lưu thay đổi
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: DUYỆT BÀI ĐĂNG CHỜ (PENDING POSTS)
            ======================================================== */}
        {activeTab === "pending_posts" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "12.5px", color: "#64748b" }}>
                  <th style={{ padding: "16px 20px" }}>Bài đăng & Người gửi</th>
                  <th style={{ padding: "16px 20px" }}>Danh mục</th>
                  <th style={{ padding: "16px 20px" }}>Định giá</th>
                  <th style={{ padding: "16px 20px" }}>Độ tin cậy AI</th>
                  <th style={{ padding: "16px 20px" }}>Trạng thái</th>
                  <th style={{ padding: "16px 20px", textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pendingPosts.map((post) => (
                  <tr key={post.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13.5px" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <strong>{post.title}</strong>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Gửi bởi: {post.ownerName} • {post.time}</div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>{post.category}</td>
                    <td style={{ padding: "16px 20px", fontWeight: "700", color: "#047857" }}>{post.val}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ color: post.aiScore >= 95 ? "#059669" : "#eab308", fontWeight: "700" }}>
                        {post.aiScore}%
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: post.status === "approved" ? "#dcfce7" : post.status === "rejected" ? "#fee2e2" : "#fef9c3",
                          color: post.status === "approved" ? "#166534" : post.status === "rejected" ? "#991b1b" : "#854d0e",
                        }}
                      >
                        {post.status === "approved" ? "Đã duyệt" : post.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          onClick={() => handleApprovePost(post.id)}
                          style={{ background: "#059669", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleRejectPost(post.id)}
                          style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================
            TAB 5: QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN
            ======================================================== */}
        {activeTab === "users" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "12.5px", color: "#64748b" }}>
                  <th style={{ padding: "16px 20px" }}>Thành viên</th>
                  <th style={{ padding: "16px 20px" }}>Email</th>
                  <th style={{ padding: "16px 20px" }}>Giao dịch thành công</th>
                  <th style={{ padding: "16px 20px" }}>Vai trò hiện tại</th>
                  <th style={{ padding: "16px 20px", textAlign: "right" }}>Hành động phân quyền</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13.5px" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>{u.avatar}</span>
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", color: "#64748b" }}>{u.email}</td>
                    <td style={{ padding: "16px 20px", fontWeight: "700" }}>{u.dealCount} lần</td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: u.role === "admin" ? "#dcfce7" : "#f1f5f9",
                          color: u.role === "admin" ? "#166534" : "#475569",
                        }}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <button
                        onClick={() => handleToggleUserRole(u.id)}
                        style={{
                          background: u.role === "admin" ? "#fef2f2" : "#ecfdf5",
                          border: u.role === "admin" ? "1px solid #fecaca" : "1px solid #a7f3d0",
                          color: u.role === "admin" ? "#b91c1c" : "#047857",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        {u.role === "admin" ? "Hạ xuống Người Dùng" : "Nâng cấp lên Quản Trị"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ========================================================
          MODAL THÊM / SỬA SẢN PHẨM (CRUD MODAL)
          ======================================================== */}
      {isItemModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsItemModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.3)",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                {editingItem ? "✏️ Sửa Thông Tin Sản Phẩm" : "➕ Thêm Sản Phẩm Mới Vào Website"}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              {/* Tên sản phẩm */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Tên sản phẩm / thiết bị:
                </label>
                <input
                  type="text"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  placeholder="VD: MacBook Pro 14 M2 Pro 16GB/512GB"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  required
                />
              </div>

              {/* Danh mục & Kiểu trao đổi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Phân loại danh mục:
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option value="laptop">Laptop Apple / Windows</option>
                    <option value="iphone">iPhone iOS</option>
                    <option value="android">Điện thoại Android</option>
                    <option value="pc">PC Gaming</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Hình thức trao đổi:
                  </label>
                  <select
                    value={itemForm.type}
                    onChange={(e) => setItemForm({ ...itemForm, type: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option value="Bù trừ">Bù trừ linh hoạt</option>
                    <option value="Đổi ngang">Đổi ngang giá trị</option>
                  </select>
                </div>
              </div>

              {/* Giá trị định giá & Nhu cầu đổi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Giá trị định giá (Hiển thị):
                  </label>
                  <input
                    type="text"
                    value={itemForm.estimatedValue}
                    onChange={(e) => setItemForm({ ...itemForm, estimatedValue: e.target.value })}
                    placeholder="VD: 25.000.000 đ"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Chủ máy / Người đăng:
                  </label>
                  <input
                    type="text"
                    value={itemForm.ownerName}
                    onChange={(e) => setItemForm({ ...itemForm, ownerName: e.target.value })}
                    placeholder="VD: Tuấn Anh, Ban Quản Trị..."
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    required
                  />
                </div>
              </div>

              {/* Nhu cầu muốn đổi */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Nhu cầu muốn đổi của chủ máy:
                </label>
                <input
                  type="text"
                  value={itemForm.targetDemand}
                  onChange={(e) => setItemForm({ ...itemForm, targetDemand: e.target.value })}
                  placeholder="VD: Muốn đổi iPhone 15 Pro Max hoặc bù trừ PC Gaming"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  required
                />
              </div>

              {/* Thông số kỹ thuật (specs) */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Thông số kỹ thuật tóm tắt (Mỗi thông số 1 dòng):
                </label>
                <textarea
                  rows={4}
                  value={itemForm.specsText}
                  onChange={(e) => setItemForm({ ...itemForm, specsText: e.target.value })}
                  placeholder="Màu Xám Không Gian&#10;Pin 96%&#10;Fullbox Chính Hãng&#10;Đẹp 99%"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", lineHeight: "1.5" }}
                  required
                />
              </div>

              {/* Địa điểm */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Khu vực / Địa điểm giao dịch:
                </label>
                <input
                  type="text"
                  value={itemForm.location}
                  onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                  placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  style={{ background: "#f1f5f9", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  {editingItem ? "Lưu Thông Tin Thay Đổi" : "Xuất Bản Sản Phẩm Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}