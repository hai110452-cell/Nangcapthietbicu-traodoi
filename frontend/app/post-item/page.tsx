"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { submitNewListing, getAIAutoApprovalSetting } from "../lib/store";
import { generateAIPost, moderatePostWithAI, AIModerationResult } from "../lib/ai-service";

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

const samplePresets: SampleImage[] = [
  {
    name: "MacBook Pro 14 M2 Pro",
    icon: "💻",
    previewUrl: "linear-gradient(135deg, #064e3b, #065f46)",
    brand: "Apple",
    category: "laptop",
    model: "MacBook Pro 14 inch (Chip M2 Pro / 16GB / 512GB)",
    specs: ["Apple M2 Pro (10 Core CPU / 16 Core GPU)", "RAM 16GB Unified", "SSD 512GB Tốc độ cao", "Màn Liquid Retina XDR 120Hz ProMotion"],
    suggestedPrice: "28.500.000",
    condition: "Ngoại hình 98%, pin 95%, không cấn móp, màn hình hoàn hảo",
  },
  {
    name: "iPhone 15 Pro Max 256GB",
    icon: "📱",
    previewUrl: "linear-gradient(135deg, #065f46, #047857)",
    brand: "Apple",
    category: "iphone",
    model: "iPhone 15 Pro Max 256GB Titan Tự Nhiên VN/A",
    specs: ["Màn hình 6.7 inch OLED Super Retina XDR", "Chip Apple A17 Pro (3nm)", "Khung viền Titanium cao cấp", "Pin 93%, Hỗ trợ Type-C USB 3.0"],
    suggestedPrice: "24.800.000",
    condition: "Nguyên zin 100%, chưa qua sửa chữa, đầy đủ hộp phụ kiện",
  },
  {
    name: "PC Gaming i5-13400F RTX 3060Ti",
    icon: "🖥️",
    previewUrl: "linear-gradient(135deg, #022c22, #064e3b)",
    brand: "Custom Gaming",
    category: "pc",
    model: "Dàn PC Gaming i5-13400F / RTX 3060Ti / 32GB RAM",
    specs: ["Intel Core i5-13400F 10 nhân 16 luồng", "VGA MSI RTX 3060Ti Gaming X 8GB", "RAM Corsair 32GB DDR4", "Tản nhiệt nước AIO 240 RGB"],
    suggestedPrice: "16.200.000",
    condition: "Linh kiện chính hãng còn bảo hành 14 tháng, chạy êm mát",
  },
  {
    name: "Galaxy S24 Ultra 256GB",
    icon: "🤖",
    previewUrl: "linear-gradient(135deg, #065f46, #022c22)",
    brand: "Samsung",
    category: "android",
    model: "Samsung Galaxy S24 Ultra 256GB Gray Titanium",
    specs: ["Màn Dynamic AMOLED 2X 120Hz phẳng", "Snapdragon 8 Gen 3 for Galaxy", "Camera 200MP Zoom 100x", "Kèm bút S-Pen tích hợp Galaxy AI"],
    suggestedPrice: "22.500.000",
    condition: "Đẹp keng 99.5%, bảo hành Samsung Care+ 10/2026",
  },
];

export default function PostItemPage() {
  const [selectedPreset, setSelectedPreset] = useState<SampleImage | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  // AI Prompt Generator
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"laptop" | "pc" | "iphone" | "android">("laptop");
  const [type, setType] = useState<"Đổi ngang" | "Bù trừ">("Bù trừ");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [specsText, setSpecsText] = useState("");
  const [targetDemand, setTargetDemand] = useState("");
  const [location, setLocation] = useState("Quận 1, TP. Hồ Chí Minh");
  const [conditionDesc, setConditionDesc] = useState("");
  const [ownerName, setOwnerName] = useState("Thành viên CEP");

  // Kết quả sau khi Đăng bài & Kiểm duyệt AI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [moderationResult, setModerationResult] = useState<AIModerationResult | null>(null);
  const [wasAutoApproved, setWasAutoApproved] = useState(false);

  // Xử lý AI Tự Động Viết Bài & Điền Thông Tin
  const handleAIGeneratePost = async (customPrompt?: string) => {
    const textToUse = customPrompt || aiPrompt;
    if (!textToUse.trim()) return;

    setIsGeneratingWithAI(true);
    try {
      const generated = await generateAIPost(textToUse, category);
      setTitle(generated.title);
      setCategory(generated.category);
      setType(generated.type);
      setEstimatedValue(generated.valNumber.toLocaleString("vi-VN"));
      setSpecsText(generated.specs.join("\n"));
      setConditionDesc(generated.conditionDesc);
      setTargetDemand(generated.targetDemand);
      setAiConfidence(generated.aiConfidence);
    } catch (err) {
      console.error("Lỗi khi sinh nội dung bằng AI:", err);
    } finally {
      setIsGeneratingWithAI(false);
    }
  };

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

  // Xử lý nộp bài và xét duyệt bằng AI
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const specsArray = specsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const valClean = parseInt(estimatedValue.replace(/\D/g, "") || "15000000", 10);

      // 1. Chạy AI Xét duyệt & Chấm điểm an toàn (Trust Score)
      const modResult = await moderatePostWithAI({
        title,
        category,
        estimatedValue: `${valClean.toLocaleString("vi-VN")} đ`,
        valNumber: valClean,
        specs: specsArray.length > 0 ? specsArray : ["Chính hãng nguyên bản", "Hoạt động hoàn hảo"],
        targetDemand,
        conditionDesc,
        ownerName,
      });

      setModerationResult(modResult);

      const categoryNames: Record<string, string> = {
        laptop: "Laptop & MacBook",
        pc: "Máy tính bàn PC",
        iphone: "Điện thoại iOS",
        android: "Điện thoại Android",
      };

      const deviceIcons: Record<string, string> = {
        laptop: "💻",
        pc: "🖥️",
        iphone: "📱",
        android: "🤖",
      };

      const gradients: Record<string, string> = {
        laptop: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        pc: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
        iphone: "linear-gradient(135deg, #4c1d95 0%, #3b0764 100%)",
        android: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
      };

      // 2. Lưu trữ bài đăng và kích hoạt tự động duyệt nếu đủ tiêu chuẩn
      const { isAutoApproved } = submitNewListing({
        title,
        category,
        categoryName: categoryNames[category] || "Thiết bị công nghệ",
        type,
        specs: specsArray.length > 0 ? specsArray : ["Chính hãng", "Đẹp 98%"],
        estimatedValue: `${valClean.toLocaleString("vi-VN")} đ`,
        valNumber: valClean,
        targetDemand,
        location,
        ownerName,
        gradientBg: selectedPreset?.previewUrl || gradients[category] || "linear-gradient(135deg, #1e293b, #0f172a)",
        deviceIcon: selectedPreset?.icon || deviceIcons[category] || "💻",
        aiScore: modResult.score,
        aiSummary: modResult.summary,
      });

      setWasAutoApproved(isAutoApproved);
      setIsSuccess(true);
    } catch (err) {
      console.error("Lỗi khi đăng bài:", err);
      alert("Đã xảy ra sự cố khi kiểm duyệt bài đăng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pageWrapper">
      <Navbar />
      <main style={{ maxWidth: "1100px", margin: "40px auto 80px", padding: "0 24px" }}>
        {/* Tiêu đề & Giới thiệu AI */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
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
            <span>⚡ AI Moderation & Auto-Pilot 2.0</span> • Tự động viết & xét duyệt bài đăng 24/7
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
            Đăng Tin Thanh Lý & Trao Đổi Thiết Bị
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "700px", margin: "8px auto 0" }}>
            Sử dụng <strong>Trợ Lý AI Tự Động Viết Bài</strong> hoặc tải ảnh để hệ thống nhận diện.
            Mọi bài đăng đều được <strong>AI Kiểm Định & Xét Duyệt Tức Thì</strong> giúp tin lên sàn trong tích tắc!
          </p>
        </div>

        {/* Thanh công cụ: AI Tự Động Viết Bài & Điền Form */}
        {!isSuccess && (
          <div
            style={{
              background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
              borderRadius: "20px",
              padding: "24px 28px",
              marginBottom: "32px",
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(6, 95, 70, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>✨</span>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", margin: 0 }}>
                    AI Trợ Lý: Tự Động Soạn Thảo & Điền Bài Đăng Trong 1 Giây
                  </h3>
                  <div style={{ fontSize: "12.5px", opacity: 0.85, marginTop: "2px" }}>
                    Nhập tên thiết bị bạn muốn trao đổi (ví dụ: &quot;MacBook Air M2 16GB pin 95%&quot;), AI sẽ tự tạo tiêu đề, cấu hình, định giá và nhu cầu đổi!
                  </div>
                </div>
              </div>
              <span style={{ background: "rgba(255, 255, 255, 0.2)", padding: "4px 12px", borderRadius: "9999px", fontSize: "11.5px", fontWeight: "700" }}>
                AI Generator v2.5
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <input
                type="text"
                placeholder="Nhập máy bạn cần đăng (VD: MacBook Air M2 16GB, iPhone 15 Pro Max 256GB, PC i5 RTX 3060...)"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAIGeneratePost();
                  }
                }}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "14px",
                  outline: "none",
                  color: "#0f172a",
                  background: "#ffffff",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              />
              <button
                type="button"
                onClick={() => handleAIGeneratePost()}
                disabled={isGeneratingWithAI}
                style={{
                  background: "#ffffff",
                  color: "#065f46",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "14px",
                  cursor: isGeneratingWithAI ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  transition: "all 0.2s",
                }}
              >
                {isGeneratingWithAI ? "🤖 Đang viết..." : "⚡ AI Viết Ngay"}
              </button>
            </div>

            {/* Các nút bấm nhanh */}
            <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11.5px", opacity: 0.85, fontWeight: "600" }}>Gợi ý mẫu nhanh:</span>
              {[
                "MacBook Air M2 16GB Midnight",
                "iPhone 15 Pro Max 256GB Titan",
                "Dàn PC Gaming i5-13400F RTX 3060Ti",
                "Samsung Galaxy S24 Ultra 256GB",
                "Dell XPS 13 Plus OLED",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setAiPrompt(suggestion);
                    handleAIGeneratePost(suggestion);
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#ffffff",
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Màn hình kết quả sau khi đăng bài & AI xét duyệt */}
        {isSuccess ? (
          <div
            className="successCardAnim"
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "44px 32px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "56px", marginBottom: "12px" }}>
                {wasAutoApproved ? "🚀" : "⏳"}
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                {wasAutoApproved
                  ? "🎉 AI Đã Duyệt Tự Động & Đăng Tin Thành Công!"
                  : "Đã Tiếp Nhận Bài Đăng Chờ Duyệt"}
              </h2>
              <p style={{ color: "#64748b", fontSize: "15.5px", maxWidth: "600px", margin: "0 auto" }}>
                {wasAutoApproved ? (
                  <>
                    Bài đăng <strong>&quot;{title}&quot;</strong> đạt điểm an toàn xuất sắc và đã được
                    <span style={{ color: "#059669", fontWeight: "700" }}> AI Tự Động Xuất Bản Trực Tiếp</span> lên trang chủ sàn giao dịch!
                  </>
                ) : (
                  <>
                    Bài đăng <strong>&quot;{title}&quot;</strong> đã được ghi nhận vào hệ thống và đang trong hàng đợi kiểm duyệt của Ban Quản Trị.
                  </>
                )}
              </p>
            </div>

            {/* Bảng phân tích chi tiết của AI Moderation */}
            {moderationResult && (
              <div
                style={{
                  background: wasAutoApproved ? "#f0fdf4" : "#fefce8",
                  border: wasAutoApproved ? "1px solid #86efac" : "1px solid #fef08a",
                  borderRadius: "16px",
                  padding: "24px",
                  marginBottom: "28px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "22px" }}>🛡️</span>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "800", color: wasAutoApproved ? "#14532d" : "#713f12" }}>
                        Báo Cáo Kiểm Định Trí Tuệ Nhân Tạo (AI Trust Report)
                      </div>
                      <div style={{ fontSize: "12px", color: wasAutoApproved ? "#15803d" : "#854d0e" }}>
                        {moderationResult.suggestedAction}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      background: wasAutoApproved ? "#166534" : "#ca8a04",
                      color: "#ffffff",
                      padding: "6px 14px",
                      borderRadius: "10px",
                      fontWeight: "800",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🎯 Điểm An Toàn:</span>
                    <span>{moderationResult.score}%</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {moderationResult.checks.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        background: "#ffffff",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{c.passed ? "✅" : "⚠️"}</span>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: "#0f172a" }}>{c.name}:</strong>{" "}
                        <span style={{ color: "#475569" }}>{c.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Các nút hành động */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
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
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🏠 Xem Tin Trên Trang Chủ
              </Link>
              <Link
                href="/admin"
                style={{
                  background: "#0f172a",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🛡️ Xem Trong Quản Trị Admin
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedPreset(null);
                  setTitle("");
                  setAiPrompt("");
                  setModerationResult(null);
                }}
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Đăng thêm bài khác
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
                  <span>📸</span> Tải Lên Ảnh Thiết Bị & Quét AI
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
                        Kéo thả ảnh hoặc chọn máy demo bên dưới
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                        Hỗ trợ định dạng JPG, PNG, HEIC tối đa 15MB
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
                        🎯 ĐỘ CHÍNH XÁC AI: {aiConfidence}%
                      </span>
                      <span style={{ fontSize: "11px", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "9999px", fontWeight: "700" }}>
                        Xác thực thông minh
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#14532d", lineHeight: "1.4" }}>
                      AI đã tự động điền đầy đủ cấu hình và định giá vào form. Khi bạn bấm đăng, AI sẽ kiểm duyệt an toàn tức thì!
                    </div>
                  </div>
                )}

                {/* Chọn ảnh mẫu demo để AI quét ngay lập tức */}
                <div style={{ marginTop: "18px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "10px" }}>
                    👉 Hoặc bấm quét ảnh thiết bị mẫu có sẵn:
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Thông Tin Chi Tiết Bài Đăng
                </h3>
                <span style={{ fontSize: "12px", color: "#059669", fontWeight: "700", background: "#ecfdf5", padding: "4px 10px", borderRadius: "8px" }}>
                  🛡️ Có AI Xét Duyệt An Toàn
                </span>
              </div>

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
                    onChange={(e) => setCategory(e.target.value as any)}
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
                  background: isSubmitting ? "#94a3b8" : "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  border: "none",
                  padding: "15px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "800",
                  cursor: isSubmitting ? "wait" : "pointer",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.transform = "translateY(-1px) scale(1.01)")}
                onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.transform = "translateY(0) scale(1)")}
              >
                {isSubmitting ? (
                  <>
                    <span>🤖</span> AI Đang Kiểm Định & Xét Duyệt Bài Viết...
                  </>
                ) : (
                  <>
                    <span>🚀</span> Xác Nhận Đăng Tin (Có AI Xét Duyệt Tức Thì)
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Hiệu ứng chuyển động */}
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
