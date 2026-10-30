"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { api, getAccessToken, moneyToNumber } from "../lib/api";

interface SelectedImage { file: File; previewUrl: string; id: string; }

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Không thể đọc tệp ảnh."));
    reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh."));
    reader.readAsDataURL(file);
  });
}

export default function PostItemPage() {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("laptop");
  const [type, setType] = useState<"Đổi ngang" | "Bù trừ">("Bù trừ");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [specsText, setSpecsText] = useState("");
  const [targetDemand, setTargetDemand] = useState("");
  const [location, setLocation] = useState("");
  const [conditionDesc, setConditionDesc] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectImages = (files: FileList | null) => {
    if (!files) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const incoming = Array.from(files);
    const remaining = 6 - selectedImages.length;
    if (remaining <= 0) { setSubmitError("Bạn chỉ có thể tải tối đa 6 ảnh cho mỗi tin đăng."); return; }
    const valid: SelectedImage[] = [];
    for (const file of incoming.slice(0, remaining)) {
      if (!allowed.includes(file.type)) { setSubmitError(`Tệp ${file.name} không đúng định dạng. Chỉ nhận JPEG, PNG, WebP hoặc AVIF.`); continue; }
      if (file.size > 5 * 1024 * 1024) { setSubmitError(`Ảnh ${file.name} vượt quá dung lượng 5 MB.`); continue; }
      valid.push({ file, previewUrl: URL.createObjectURL(file), id: `${file.name}-${file.lastModified}-${Math.random()}` });
    }
    if (incoming.length > remaining) setSubmitError("Chỉ có thể chọn tối đa 6 ảnh.");
    if (valid.length) { setSelectedImages((current) => [...current, ...valid]); setSubmitError(""); }
  };

  const removeSelectedImage = (id: string) => {
    setSelectedImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.id !== id);
    });
  };

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!getAccessToken()) {
      setSubmitError("Bạn cần đăng nhập trước khi đăng tin.");
      return;
    }
    const price = moneyToNumber(estimatedValue);
    if (!title.trim() || price <= 0 || !location.trim()) {
      setSubmitError("Vui lòng nhập tiêu đề, giá trị ước tính hợp lệ và địa điểm.");
      return;
    }
    setIsSubmitting(true);
    try {
      const specs = specsText.split("\n").reduce<Record<string, string>>((result, line, index) => { const value = line.trim(); if (value) result[String(index + 1)] = value; return result; }, {});
      const imageUrls: string[] = [];
      for (let index = 0; index < selectedImages.length; index++) {
        setUploadProgress(`Đang tải ảnh ${index + 1}/${selectedImages.length} lên Cloudinary...`);
        const data = await fileToDataUrl(selectedImages[index].file);
        const uploaded = await api<{ url: string }>("/uploads/images", { method: "POST", body: JSON.stringify({ fileName: selectedImages[index].file.name, mimeType: selectedImages[index].file.type, data }) });
        imageUrls.push(uploaded.url);
      }
      setUploadProgress("Đang lưu tin đăng...");
      await api("/listings", { method: "POST", body: JSON.stringify({
        title: title.trim(),
        description: conditionDesc.trim(),
        category,
        deviceIcon: category === "laptop" ? "💻" : category === "pc" ? "🖥️" : "📱",
        specs,
        estimatedValue: price,
        exchangeType: type === "Đổi ngang" ? "even" : "compensation",
        targetDemand: targetDemand.trim(),
        location: location.trim(),
        images: imageUrls,
      }) });
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể gửi tin đăng lên máy chủ.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="pageWrapper">
      <Navbar />
      <main style={{ maxWidth: "1100px", margin: "40px auto 80px", padding: "0 24px" }}>
        {/* Tiêu đề & Giới thiệu AI */}
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
            <span>⚡ Đăng tin CEP.EXCHANGE</span> • Lưu trực tiếp vào backend
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
            Đăng Tin Thanh Lý & Trao Đổi Thiết Bị
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "680px", margin: "8px auto 0" }}>
            Nhập thông tin thiết bị của bạn. Tin đăng sẽ được lưu vào cơ sở dữ liệu và chuyển sang trạng thái chờ quản trị viên duyệt.
          </p>
        </div>

        {isSuccess ? (
          <div
            className="successCardAnim"
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "50px 30px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>
              Đăng Tin Đổi Máy Thành Công!
            </h2>
            <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "560px", margin: "0 auto 24px" }}>
              Tin đăng <strong>{title}</strong> đã được gửi lên hệ thống. Tin đăng đang chờ quản trị viên duyệt. Trạng thái và điểm thưởng sẽ được cập nhật theo dữ liệu backend.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link
                href="/trades"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: "700",
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                  transition: "transform 0.2s",
                }}
              >
                Quản lý đề xuất đổi
              </Link>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
                  setSelectedImages([]);
                  setTitle("");
                }}
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                Đăng thêm thiết bị khác
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "32px", alignItems: "start" }}>
            {/* Cột trái: Chọn ảnh thiết bị */}
            <div>
              <div style={{ background: "#ffffff", borderRadius: "18px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📸</span> Ảnh thiết bị
                </h3>
                <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "14px", lineHeight: 1.6 }}>Tải tối đa 6 ảnh, mỗi ảnh không quá 5 MB. Hỗ trợ JPG, PNG, WebP và AVIF. Ảnh sẽ được lưu trên Cloudinary.</p>
                <label htmlFor="listing-images" style={{ minHeight: "150px", borderRadius: "14px", background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #86efac", color: "#047857", cursor: "pointer", padding: "20px", textAlign: "center" }}>
                  <span style={{ fontSize: "38px", marginBottom: "8px" }}>☁️</span>
                  <strong style={{ fontSize: "14px" }}>Chọn ảnh từ thiết bị</strong>
                  <span style={{ fontSize: "12px", marginTop: "5px", color: "#64748b" }}>Nhấn để chọn ảnh từ máy tính hoặc điện thoại</span>
                </label>
                <input id="listing-images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={isSubmitting || selectedImages.length >= 6} onChange={(e) => { handleSelectImages(e.target.files); e.currentTarget.value = ""; }} style={{ display: "none" }} />
                {selectedImages.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginTop: "16px" }}>
                    {selectedImages.map((image, index) => (
                      <div key={image.id} style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc", aspectRatio: "4 / 3" }}>
                        <img src={image.previewUrl} alt={`Ảnh thiết bị ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <span style={{ position: "absolute", left: 7, bottom: 7, padding: "3px 7px", borderRadius: 6, background: "rgba(15,23,42,.75)", color: "white", fontSize: 11 }}>{index === 0 ? "Ảnh đại diện" : `Ảnh ${index + 1}`}</span>
                        <button type="button" aria-label="Xóa ảnh" disabled={isSubmitting} onClick={() => removeSelectedImage(image.id)} style={{ position: "absolute", top: 7, right: 7, width: 27, height: 27, border: 0, borderRadius: "50%", background: "rgba(15,23,42,.78)", color: "white", cursor: "pointer", fontSize: 17 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "12px" }}>{selectedImages.length}/6 ảnh đã chọn</div>
              </div>
            </div>

            {/* Cột phải: Form thông tin bài đăng */}
            <form
              onSubmit={handleSubmit}
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "28px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                Thông Tin Chi Tiết Bài Đăng
              </h3>
              {uploadProgress && <div role="status" style={{ color: "#047857", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, padding: 12, fontSize: 13 }}>{uploadProgress}</div>}
              {submitError && <div role="alert" style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 12, fontSize: 13 }}>{submitError}</div>}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Tiêu đề bài đăng
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: MacBook Pro 14 M2 Pro 16GB / 512GB SSD..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#059669")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Phân loại danh mục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "14px",
                      background: "#ffffff",
                      outline: "none",
                    }}
                  >
                    <option value="laptop">💻 Laptop & MacBook</option>
                    <option value="pc">🖥️ Máy tính bàn & PC Gaming</option>
                    <option value="iphone">📱 iPhone / iPad</option>
                    <option value="android">🤖 Điện thoại Android</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Hình thức giao lưu
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "Đổi ngang" | "Bù trừ")}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "14px",
                      background: "#ffffff",
                      outline: "none",
                    }}
                  >
                    <option value="Đổi ngang">Đổi ngang giá trị</option>
                    <option value="Bù trừ">Có bù trừ chênh lệch</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Giá trị ước tính (VNĐ)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 25.000.000"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#059669")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Khu vực giao dịch
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#059669")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Thông số kỹ thuật chính (Mỗi dòng 1 thông số)
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Chip M2 Pro&#10;RAM 16GB&#10;Pin 95%"
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#059669")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Tình trạng ngoại quan & Linh kiện
                </label>
                <input
                  type="text"
                  placeholder="Mô tả xước xát, màn hình, phụ kiện..."
                  value={conditionDesc}
                  onChange={(e) => setConditionDesc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#059669")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#059669", marginBottom: "6px" }}>
                  ⇄ Nhu cầu bạn muốn đổi sang thiết bị nào?
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Muốn đổi sang iPhone 15 Pro Max hoặc bù trừ PC Gaming"
                  value={targetDemand}
                  onChange={(e) => setTargetDemand(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #a7f3d0",
                    background: "#ecfdf5",
                    fontSize: "14px",
                    outline: "none",
                    color: "#065f46",
                    fontWeight: "600",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: "8px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  border: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.35)",
                  transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px) scale(1.01)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0) scale(1)")}
              >
                Xác Nhận {isSubmitting ? "Đang gửi tin..." : "Đăng Tin Trao Đổi Ngay"}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Hiệu ứng chuyển động mượt mà */}
      <style jsx global>{`
        @keyframes scanningBeam {
          0% { transform: translateY(-70px); opacity: 0.4; }
          50% { opacity: 1; }
          100% { transform: translateY(70px); opacity: 0.4; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .aiResultAnim {
          animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .successCardAnim {
          animation: fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .presetCardBtn:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: #a7f3d0 !important;
          box-shadow: 0 6px 16px -4px rgba(5, 150, 105, 0.15);
        }
      `}</style>
    </div>
  );
}