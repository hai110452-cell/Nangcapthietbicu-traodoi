"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { EcoReward } from "../lib/store";
import { api, getAccessToken } from "../lib/api";

interface HistoryItem {
  id: string;
  action: string;
  points: number;
  date: string;
  impactDesc: string;
}



export default function GreenPointsPage() {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [rewards, setRewards] = useState<EcoReward[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    api<any[]>("/rewards", { auth: false }).then((rows) => setRewards(rows.map((r) => ({ ...r, costPoints: Number(r.costPoints), discountValue: r.discountValue || "" })))).catch((e) => console.error(e));
    if (!getAccessToken()) return;
    api<{points:number}>("/rewards/me/points").then((r) => setCurrentPoints(Number(r.points || 0))).catch((e) => console.error(e));
    api<any[]>("/rewards/me/history").then((rows) => setHistory(rows.map((r) => ({ id: r.id, action: r.description || r.transactionType, points: Number(r.points), date: new Date(r.createdAt).toLocaleDateString("vi-VN"), impactDesc: r.transactionType || "Giao dịch điểm" })))).catch((e) => console.error(e));
  }, []);
  const [selectedReward, setSelectedReward] = useState<EcoReward | null>(null);
  const [rewardCode, setRewardCode] = useState<string | null>(null);

  const handleRedeem = async (reward: EcoReward) => {
    if (!getAccessToken()) { alert("Vui lòng đăng nhập để sử dụng Điểm Xanh."); return; }
    if (currentPoints < reward.costPoints) {
      alert(`Bạn còn thiếu ${reward.costPoints - currentPoints} Điểm Xanh để đổi ưu đãi này.`);
      return;
    }
    try {
      const result = await api<any>(`/rewards/${reward.id}/redeem`, { method: "POST", body: JSON.stringify({}) });
      setCurrentPoints(Number(result.remainingPoints ?? currentPoints - reward.costPoints));
      setRewardCode(result.redemption?.redemption_code || result.redemption?.redemptionCode || null);
      setSelectedReward(reward);
      const rows = await api<any[]>("/rewards/me/history");
      setHistory(rows.map((r) => ({ id: r.id, action: r.description || r.transactionType, points: Number(r.points), date: new Date(r.createdAt).toLocaleDateString("vi-VN"), impactDesc: r.transactionType || "Giao dịch điểm" })));
    } catch (error) { alert(error instanceof Error ? error.message : "Không thể đổi phần thưởng."); }
  };

  return (
    <div className="pageWrapper">
      <Navbar />
      <main style={{ maxWidth: "1240px", margin: "40px auto 80px", padding: "0 24px" }}>
        {!getAccessToken() && <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: "#fff7ed", color: "#9a3412" }}>Đăng nhập để xem số dư và lịch sử Điểm Xanh của bạn.</div>}
        {/* Banner Tổng Quan Ví Điểm Xanh */}
        <div
          style={{
            background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
            borderRadius: "24px",
            padding: "44px 36px",
            color: "#ffffff",
            boxShadow: "0 20px 40px -10px rgba(6, 95, 70, 0.4)",
            position: "relative",
            overflow: "hidden",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-20px",
              bottom: "-30px",
              fontSize: "180px",
              opacity: 0.12,
              pointerEvents: "none",
            }}
          >
            🌿
          </div>
          <div style={{ maxWidth: "720px", position: "relative", zIndex: 2 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                padding: "6px 16px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "16px",
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}
            >
              🌱 Hệ Thống Điểm Thưởng Xanh (Eco-Credit)
            </div>
            <h1 style={{ fontSize: "36px", fontWeight: "800", lineHeight: "1.25", marginBottom: "12px" }}>
              Cùng Đổi Đồ Cũ — Bảo Vệ Hành Tinh Xanh
            </h1>
            <p style={{ color: "#a7f3d0", fontSize: "16px", lineHeight: "1.6", marginBottom: "28px" }}>
              Mỗi chiếc điện thoại hay máy tính được tái sử dụng qua CEP Platform giúp ngăn chặn trung bình <strong>45kg CO2</strong> phát thải
              và giữ lại hàng ngàn linh kiện kim loại quý không bị chôn lấp ra môi trường.
            </p>
            {/* Các thẻ chỉ số */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.1)", padding: "16px 20px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.18)" }}>
                <div style={{ fontSize: "12px", color: "#a7f3d0", textTransform: "uppercase", fontWeight: "700" }}>Số Dư Điểm Xanh</div>
                <div style={{ fontSize: "32px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>
                  {currentPoints.toLocaleString("vi-VN")} <span>pts</span>
                </div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.1)", padding: "16px 20px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.18)" }}>
                <div style={{ fontSize: "12px", color: "#a7f3d0", textTransform: "uppercase", fontWeight: "700" }}>CO2 Đã Giảm Thiểu</div>
                <div style={{ fontSize: "32px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>
                  125.4 <span>kg</span>
                </div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.1)", padding: "16px 20px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.18)" }}>
                <div style={{ fontSize: "12px", color: "#a7f3d0", textTransform: "uppercase", fontWeight: "700" }}>Cấp Bậc Thành Viên</div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", marginTop: "10px" }}>
                  🏅 Hiệp Sĩ Xanh
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Thông báo nhận mã ưu đãi thành công */}
        {selectedReward && rewardCode && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(6px)",
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              className="modalWindowAnim"
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "36px",
                maxWidth: "480px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ fontSize: "56px", marginBottom: "12px" }}>🎁</div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                Đổi Ưu Đãi Thành Công!
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                Bạn đã đổi <strong>{selectedReward.costPoints} Điểm Xanh</strong> để lấy {selectedReward.title}.
              </p>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "2px dashed #86efac",
                  padding: "16px",
                  borderRadius: "12px",
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#166534",
                  letterSpacing: "2px",
                  marginBottom: "20px",
                }}
              >
                {rewardCode}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>
                * Xuất trình mã này cho kỹ thuật viên hoặc nhập vào bước thanh toán giao dịch trao đổi.
              </div>
              <button
                onClick={() => {
                  setSelectedReward(null);
                  setRewardCode(null);
                }}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  border: "none",
                  padding: "12px 28px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Đóng & Tiếp tục khám phá
              </button>
            </div>
          </div>
        )}

        {/* 2 Khối: Gian hàng đổi thưởng & Lịch sử tích lũy */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "32px", alignItems: "start" }}>
          {/* Cột trái: Gian hàng ưu đãi */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>Gian Hàng Quy Đổi Ưu Đãi</h2>
                <p style={{ fontSize: "14px", color: "#64748b" }}>Sử dụng Điểm Xanh để nhận dịch vụ miễn phí và quà tặng giá trị</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {rewards.map((reward) => {
                const canAfford = currentPoints >= reward.costPoints;
                return (
                  <div
                    key={reward.id}
                    className="rewardCardItem"
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1.5px solid #e2e8f0",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                      transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: "#f0fdf4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        {reward.icon}
                      </div>
                      <div
                        style={{
                          background: "#ecfdf5",
                          color: "#059669",
                          padding: "4px 12px",
                          borderRadius: "9999px",
                          fontSize: "13px",
                          fontWeight: "800",
                          border: "1px solid #a7f3d0",
                        }}
                      >
                        {reward.costPoints} Điểm
                      </div>
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                      {reward.title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5", marginBottom: "16px", flex: 1 }}>
                      {reward.description}
                    </p>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#059669", marginBottom: "16px" }}>
                      ✨ {reward.discountValue}
                    </div>
                    <button
                      onClick={() => handleRedeem(reward)}
                      style={{
                        background: canAfford
                          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                          : "#f1f5f9",
                        color: canAfford ? "#ffffff" : "#94a3b8",
                        border: "none",
                        padding: "11px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: canAfford ? "pointer" : "not-allowed",
                        boxShadow: canAfford ? "0 4px 10px rgba(16, 185, 129, 0.3)" : "none",
                        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                      onMouseEnter={(e) => {
                        if (canAfford) e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
                      }}
                      onMouseLeave={(e) => {
                        if (canAfford) e.currentTarget.style.transform = "translateY(0) scale(1)";
                      }}
                    >
                      {canAfford ? "Đổi Ưu Đãi Ngay" : `Cần thêm ${reward.costPoints - currentPoints} điểm`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Lịch sử tích lũy & Tiêu dùng điểm */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              padding: "26px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "18px" }}>
              Lịch Sử Tích Lũy Điểm Xanh
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #f1f5f9",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "13px", color: "#0f172a", flex: 1 }}>{item.action}</strong>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: item.points > 0 ? "#10b981" : "#ef4444",
                        marginLeft: "8px",
                      }}
                    >
                      {item.points > 0 ? `+${item.points}` : item.points} pts
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#059669", marginBottom: "4px" }}>
                    {item.impactDesc}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Hiệu ứng tương tác bổ sung */}
      <style jsx global>{`
        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .modalWindowAnim {
          animation: modalScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .rewardCardItem:hover {
          transform: translateY(-4px) scale(1.01) !important;
          box-shadow: 0 12px 30px -8px rgba(5, 150, 105, 0.15) !important;
          border-color: #a7f3d0 !important;
        }
      `}</style>
    </div>
  );
}