"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { api, getAccessToken, moneyToNumber } from "../lib/api";

interface SampleImage {
  name: string;
  icon: string;
  previewUrl: string;
  brand: string;
  category: "laptop" | "pc" | "iphone" | "android";
  model: string;
  specs: string[];
  suggestedPrice: string;
  condition: string;
}

const samplePresets: SampleImage[] = [];

export default function PostItemPage() {
  const [selectedPreset, setSelectedPreset] = useState<SampleImage | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

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

  // Kích hoạt mô phỏng quét AI Computer Vision
  const handleTriggerAIScan = (preset: SampleImage) => {
    setSelectedPreset(preset);
    setIsScanning(true);
    setScanStep(1);
    setAiConfidence(null);
    setTimeout(() => setScanStep(2), 700);
    setTimeout(() => setScanStep(3), 1500);
    setTimeout(() => {
      setScanStep(4);
      setAiConfidence(98.6);
      setIsScanning(false);
      setTitle(preset.model);
      setCategory(preset.category);
      setEstimatedValue(preset.suggestedPrice);
      setSpecsText(preset.specs.join("\n"));
      setConditionDesc(preset.condition);
      setTargetDemand("Muốn đổi: Laptop hoặc điện thoại ngang tầm giá trị, có bù trừ linh hoạt");
    }, 2200);
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
      }) });
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể gửi tin đăng lên máy chủ.");
    } finally {
      setIsSubmitting(false);
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
                  setSelectedPreset(null);
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
            {/* Cột trái: Khu vực tải ảnh & Quét AI */}
            <div>
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  padding: "24px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📸</span> Ảnh Thiết Bị (chưa hỗ trợ tải lên)
                </h3>

                {/* Khung quét AI */}
                <div
                  style={{
                    height: "240px",
                    borderRadius: "14px",
                    background: selectedPreset ? selectedPreset.previewUrl : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    border: isScanning ? "2px solid #059669" : "2px dashed #cbd5e1",
                    color: selectedPreset ? "#ffffff" : "#64748b",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isScanning && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(5, 150, 105, 0.25)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <div
                        style={{
                          width: "80%",
                          height: "3px",
                          background: "#34d399",
                          boxShadow: "0 0 20px 6px #10b981",
                          animation: "scanningBeam 1s infinite alternate ease-in-out",
                          marginBottom: "16px",
                        }}
                      ></div>
                      <div style={{ background: "rgba(15, 23, 42, 0.85)", padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", color: "#fff" }}>
                        {scanStep === 1 && "🔍 [1/3] Quét đường viền & Nhận diện vật thể..."}
                        {scanStep === 2 && "🧠 [2/3] Đối chiếu thư viện phần cứng AI..."}
                        {scanStep === 3 && "✨ [3/3] Đánh giá ngoại quan & Khuyến nghị giá..."}
                      </div>
                    </div>
                  )}

                  {selectedPreset ? (
                    <div style={{ textAlign: "center", padding: "16px" }}>
                      <div style={{ fontSize: "64px", marginBottom: "8px" }}>{selectedPreset.icon}</div>
                      <div style={{ fontWeight: "800", fontSize: "16px" }}>{selectedPreset.name}</div>
                      <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "4px" }}>
                        {selectedPreset.brand} • Nhận diện hoàn tất
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <div style={{ fontSize: "40px", marginBottom: "8px" }}>📷</div>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "#334155" }}>
                        Nhập thông tin thiết bị ở biểu mẫu bên cạnh
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                        Backend hiện chưa có API tải ảnh; bạn có thể đăng thông tin thiết bị bằng biểu mẫu.
                      </div>
                    </div>
                  )}
                </div>

                {/* Kết quả phân tích AI */}
                {aiConfidence && (
                  <div
                    className="aiResultAnim"
                    style={{
                      marginTop: "16px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "12px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "#166534" }}>
                        ĐỘ CHÍNH XÁC MÔ PHỎNG: {aiConfidence}%
                      </span>
                      <span style={{ fontSize: "11px", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "9999px", fontWeight: "700" }}>
                        Xác thực thị giác
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#14532d", lineHeight: "1.4" }}>
                      AI đã tự động phân loại và điền thông số cho máy vào form bên cạnh. Bạn có thể kiểm tra lại trước khi đăng!
                    </div>
                  </div>
                )}

                {/* Chọn ảnh mẫu demo để AI quét ngay lập tức */}
                <div style={{ marginTop: "18px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "10px" }}>
                    👉 Nhận diện AI chưa được kết nối với backend. Vui lòng nhập thông tin thiết bị thủ công.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {samplePresets.map((preset) => {
                      const isSelected = selectedPreset?.name === preset.name;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleTriggerAIScan(preset)}
                          disabled={isScanning}
                          className="presetCardBtn"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: isSelected ? "1.5px solid #059669" : "1px solid #e2e8f0",
                            background: isSelected ? "#ecfdf5" : "#f8fafc",
                            cursor: isScanning ? "not-allowed" : "pointer",
                            textAlign: "left",
                            transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>{preset.icon}</span>
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
                              {preset.name}
                            </div>
                            <div style={{ fontSize: "10px", color: "#059669", fontWeight: "600" }}>Quét AI ngay ⚡</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
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