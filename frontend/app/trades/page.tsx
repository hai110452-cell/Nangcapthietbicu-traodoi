"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { initialDeals, TradeDeal } from "../lib/store";

export default function TradesPage() {
  const [deals, setDeals] = useState<TradeDeal[]>(initialDeals);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");
  const [selectedDeal, setSelectedDeal] = useState<TradeDeal | null>(initialDeals[0]);

  const stepLabels = [
    { num: 1, title: "Gửi đề xuất", desc: "Khởi tạo lời mời giao lưu" },
    { num: 2, title: "Thỏa thuận", desc: "Thống nhất mức bù trừ" },
    { num: 3, title: "Kiểm định", desc: "Test phần cứng độc lập" },
    { num: 4, title: "Bàn giao", desc: "Gặp mặt đổi máy & bù tiền" },
    { num: 5, title: "Hoàn tất", desc: "Xác nhận & Đánh giá uy tín" },
  ];

  const handleAdvanceStep = (dealId: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          const nextStep = Math.min(5, d.currentStep + 1) as 1 | 2 | 3 | 4 | 5;
          const newStatus = nextStep === 5 ? "completed" : nextStep === 3 ? "inspecting" : "agreed";
          return {
            ...d,
            currentStep: nextStep,
            status: newStatus,
            updatedAt: "Vừa xong",
          };
        }
        return d;
      })
    );
    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal((prev: TradeDeal | null) =>
        prev
          ? {
              ...prev,
              currentStep: Math.min(5, prev.currentStep + 1) as 1 | 2 | 3 | 4 | 5,
              status: prev.currentStep + 1 >= 5 ? "completed" : "agreed",
            }
          : null
      );
    }
  };

  const filteredDeals = deals.filter((d) => {
    if (activeTab === "active") return d.status !== "completed" && d.status !== "rejected";
    if (activeTab === "completed") return d.status === "completed";
    return true;
  });

  return (
    <div className="pageWrapper">
      <Navbar />
      <main style={{ maxWidth: "1280px", margin: "40px auto 80px", padding: "0 24px" }}>
        {/* Tiêu đề trang */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                color: "#047857",
                padding: "5px 14px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "800",
                marginBottom: "10px",
                border: "1px solid #a7f3d0",
                boxShadow: "0 2px 6px rgba(4, 120, 87, 0.08)",
                letterSpacing: "0.4px",
              }}
            >
              <span style={{ color: "#f59e0b" }}>✨</span> Quản Lý Đổi Đồ & Trao Đổi Cao Cấp
            </div>
            <h1 style={{ fontSize: "34px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.8px" }}>
              Tiến Trình Giao Dịch Trao Đổi
            </h1>
            <p style={{ color: "#64748b", fontSize: "15px", marginTop: "6px" }}>
              Theo dõi chi tiết 5 bước từ lúc đề xuất đổi máy đến khi kiểm định và nhận máy hoàn tất an toàn.
            </p>
          </div>
          <Link
            href="/post-item"
            className="btnPostTrade"
            style={{
              background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)",
              color: "#ffffff",
              padding: "12px 22px",
              borderRadius: "12px",
              fontWeight: "800",
              fontSize: "14px",
              textDecoration: "none",
              boxShadow: "0 6px 18px rgba(4, 120, 87, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: "#fef08a" }}>+</span> Đăng Thêm Thiết Bị Cần Đổi
          </Link>
        </div>

        {/* Tab Lọc Trạng Thái */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
          {(["all", "active", "completed"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labelMap = {
              all: `Tất cả giao dịch (${deals.length})`,
              active: `Đang tiến hành (${deals.filter((d) => d.status !== "completed").length})`,
              completed: `Đã hoàn tất (${deals.filter((d) => d.status === "completed").length})`,
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "9px 20px",
                  borderRadius: "9999px",
                  border: isActive ? "1px solid #064e3b" : "1px solid #cbd5e1",
                  background: isActive ? "linear-gradient(135deg, #064e3b 0%, #047857 100%)" : "#ffffff",
                  color: isActive ? "#ffffff" : "#475569",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: isActive ? "0 4px 14px rgba(4, 120, 87, 0.25)" : "none",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>

        {/* Bố cục 2 cột */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.5fr", gap: "28px", alignItems: "start" }}>
          {/* Cột trái: Danh sách thẻ giao dịch */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredDeals.map((deal) => {
              const isSelected = selectedDeal?.id === deal.id;
              return (
                <div
                  key={deal.id}
                  onClick={() => setSelectedDeal(deal)}
                  className="tradeCardItem"
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "20px",
                    border: isSelected ? "2px solid #059669" : "1px solid #e2e8f0",
                    boxShadow: isSelected
                      ? "0 12px 30px -8px rgba(5, 150, 105, 0.22)"
                      : "0 2px 6px rgba(0,0,0,0.02)",
                    cursor: "pointer",
                    transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease",
                    transform: isSelected ? "translateY(-3px) scale(1.01)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>MÃ: #{deal.id}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        background:
                          deal.status === "completed"
                            ? "#dcfce7"
                            : deal.status === "inspecting"
                            ? "#fef3c7"
                            : "#ecfdf5",
                        color:
                          deal.status === "completed"
                            ? "#15803d"
                            : deal.status === "inspecting"
                            ? "#b45309"
                            : "#047857",
                      }}
                    >
                      {deal.status === "completed"
                        ? "Đã hoàn tất"
                        : deal.status === "inspecting"
                        ? "Đang kiểm định phần cứng"
                        : "Đang đàm phán"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>
                    {deal.targetDeviceName}
                  </h3>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px dashed #cbd5e1",
                      fontSize: "13px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ color: "#64748b", fontSize: "11px" }}>Đổi với thiết bị:</div>
                    <strong style={{ color: "#1e293b" }}>{deal.offeredDeviceName}</strong>
                    <div style={{ color: "#059669", fontWeight: "700", fontSize: "12px", marginTop: "2px" }}>
                      {deal.compensationAmount > 0
                        ? `Bù trừ: +${deal.compensationAmount.toLocaleString("vi-VN")} đ`
                        : "Phương án: Đổi ngang giá trị"}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#64748b" }}>
                    <div>
                      Đối tác: <strong>{deal.proposerName === "Tuấn Anh" ? deal.receiverName : deal.proposerName}</strong>
                    </div>
                    <div>Bước {deal.currentStep}/5 • {deal.updatedAt}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cột phải: Chi tiết tiến trình 5 bước */}
          {selectedDeal && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                position: "sticky",
                top: "90px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Chi tiết giao dịch:</span>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
                    #{selectedDeal.id} — {selectedDeal.targetDeviceName}
                  </h2>
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                    color: "#047857",
                    border: "1px solid #a7f3d0",
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: "800",
                    boxShadow: "0 2px 8px rgba(5, 150, 105, 0.08)",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>🛡️</span> CEP Escrow Bảo Chứng
                </div>
              </div>

              {/* Hộp so sánh 2 chiều */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: "14px",
                  alignItems: "center",
                  background: "linear-gradient(to bottom, #f8fafc, #f1f5f9)",
                  padding: "18px",
                  borderRadius: "16px",
                  border: "1px solid #cbd5e1",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                  marginBottom: "28px",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Máy bên A:</div>
                  <strong style={{ fontSize: "13px", color: "#0f172a" }}>{selectedDeal.targetDeviceName}</strong>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Chủ: {selectedDeal.receiverName}</div>
                </div>
                <div
                  className="swapBadgeIcon"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "16px",
                    boxShadow: "0 2px 6px rgba(5, 150, 105, 0.2)",
                    cursor: "pointer",
                    transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease",
                  }}
                >
                  ⇄
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Máy bên B:</div>
                  <strong style={{ fontSize: "13px", color: "#0f172a" }}>{selectedDeal.offeredDeviceName}</strong>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Chủ: {selectedDeal.proposerName}</div>
                </div>
              </div>

              {/* TIMELINE TRACKING 5 BƯỚC */}
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "20px" }}>
                Tiến Trình Thực Hiện (5 Bước Đảm Bảo)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
                {stepLabels.map((step) => {
                  const isDone = selectedDeal.currentStep > step.num;
                  const isCurrent = selectedDeal.currentStep === step.num;
                  return (
                    <div key={step.num} style={{ display: "flex", gap: "16px", alignItems: "flex-start", position: "relative" }}>
                      {step.num < 5 && (
                        <div
                          style={{
                            position: "absolute",
                            left: "17px",
                            top: "36px",
                            width: "2px",
                            height: "calc(100% + 4px)",
                            background: selectedDeal.currentStep > step.num ? "#10b981" : "#e2e8f0",
                            zIndex: 1,
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: isDone
                            ? "#10b981"
                            : isCurrent
                            ? "linear-gradient(135deg, #10b981, #059669)"
                            : "#f1f5f9",
                          color: isDone || isCurrent ? "#ffffff" : "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "14px",
                          flexShrink: 0,
                          zIndex: 2,
                          boxShadow: isCurrent ? "0 0 0 6px rgba(16, 185, 129, 0.2), 0 4px 12px rgba(16, 185, 129, 0.35)" : "none",
                          animation: isCurrent ? "stepPulse 2.5s infinite" : "none",
                        }}
                      >
                        {isDone ? "✓" : step.num}
                      </div>
                      <div style={{ flex: 1, paddingTop: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: "15px",
                              fontWeight: "700",
                              color: isCurrent ? "#059669" : isDone ? "#0f172a" : "#64748b",
                            }}
                          >
                            Bước {step.num}: {step.title}
                          </span>
                          {isCurrent && (
                            <span style={{ fontSize: "11px", color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: "9999px", fontWeight: "700", border: "1px solid #a7f3d0" }}>
                              Đang thực hiện
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ghi chú & Nút chuyển bước */}
              <div
                style={{
                  marginTop: "28px",
                  padding: "16px",
                  background: "#ecfdf5",
                  borderRadius: "12px",
                  border: "1px solid #a7f3d0",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#047857", marginBottom: "4px" }}>
                  📌 Ghi chú hiện tại:
                </div>
                <div style={{ fontSize: "13px", color: "#064e3b", lineHeight: "1.4" }}>
                  {selectedDeal.note}
                </div>
              </div>

              <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                {selectedDeal.currentStep < 5 && (
                  <button
                    onClick={() => handleAdvanceStep(selectedDeal.id)}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#ffffff",
                      border: "none",
                      padding: "14px 24px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(16, 185, 129, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px) scale(1.01)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0) scale(1)")}
                  >
                    <span>Xác nhận hoàn tất Bước {selectedDeal.currentStep}</span>
                    <span style={{ fontSize: "16px" }}>→</span>
                  </button>
                )}
                {selectedDeal.currentStep === 5 && (
                  <div
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "14px",
                      background: "#dcfce7",
                      color: "#166534",
                      borderRadius: "12px",
                      fontWeight: "800",
                      fontSize: "14px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    🎉 Giao Dịch Hoàn Tất Thành Công!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Hiệu ứng keyframes bổ sung trực tiếp */}
      <style jsx global>{`
        @keyframes stepPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .swapBadgeIcon:hover {
          transform: rotate(180deg) scale(1.1) !important;
          background-color: #d1fae5 !important;
        }
      `}</style>
    </div>
  );
}