"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { ChatMessage, getStoredAuthUser } from "../lib/store";
import { api, getAccessToken } from "../lib/api";

interface Conversation {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  tradeItem: string;
  compensation: string;
  online: boolean;
  messages: ChatMessage[];
}



export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const loadConversations = async () => {
    if (!getAccessToken()) { setConversations([]); setActiveConvId(""); return; }
    try {
      const rows = await api<any[]>("/chat/conversations");
      const mapped: Conversation[] = rows.map((r) => ({
        id: r.id, partnerName: "Đối tác trao đổi", partnerAvatar: "👤", lastMessage: r.lastMessage || "Chưa có tin nhắn",
        time: r.lastMessageAt ? new Date(r.lastMessageAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "",
        unread: Number(r.unreadCount || 0), tradeItem: r.listingTitle || "Giao dịch trao đổi",
        compensation: r.tradeStatus || "Đang trao đổi", online: false, messages: [],
      }));
      setConversations(mapped);
      setActiveConvId((old) => mapped.some((c) => c.id === old) ? old : mapped[0]?.id || "");
    } catch (error) { console.error("Không tải được hội thoại", error); }
  };

  useEffect(() => {
    setCurrentUserId(getStoredAuthUser()?.id || "");
    void loadConversations();
  }, []);

  useEffect(() => {
    if (!activeConvId || !getAccessToken()) return;
    api<any[]>(`/chat/conversations/${activeConvId}/messages`).then((rows) => {
      const messages: ChatMessage[] = rows.map((r) => ({
        id: r.id, text: r.content, time: new Date(r.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        isMe: r.senderId === currentUserId, senderName: r.senderName || (r.senderId === currentUserId ? "Tôi" : "Đối tác"),
        senderRole: r.senderId === currentUserId ? "user" : "partner",
      }));
      setConversations((prev) => prev.map((c) => c.id === activeConvId ? { ...c, messages } : c));
    }).catch((error) => console.error("Không tải được tin nhắn", error));
  }, [activeConvId, currentUserId]);

  const currentConv = conversations.find((c) => c.id === activeConvId) || {
    id: "", partnerName: "Chọn hội thoại", partnerAvatar: "👤", lastMessage: "", time: "", unread: 0,
    tradeItem: "Chưa có giao dịch", compensation: "", online: false, messages: [] as ChatMessage[],
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!getAccessToken()) { alert("Vui lòng đăng nhập để nhắn tin."); return; }
    if (!activeConvId) { alert("Chỉ có thể nhắn tin trong hội thoại của một giao dịch đã được mở."); return; }
    try {
      await api(`/chat/conversations/${activeConvId}/messages`, { method: "POST", body: JSON.stringify({ content: inputText.trim() }) });
      setInputText("");
      const rows = await api<any[]>(`/chat/conversations/${activeConvId}/messages`);
      const messages: ChatMessage[] = rows.map((r) => ({ id: r.id, text: r.content, time: new Date(r.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }), isMe: r.senderId === currentUserId, senderName: r.senderName || "Đối tác", senderRole: r.senderId === currentUserId ? "user" : "partner" }));
      setConversations((prev) => prev.map((c) => c.id === activeConvId ? { ...c, messages, lastMessage: inputText.trim(), time: "Vừa xong" } : c));
    } catch (error) { alert(error instanceof Error ? error.message : "Không thể gửi tin nhắn."); }
  };

  const handleQuickTemplate = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="pageWrapper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ maxWidth: "1280px", margin: "24px auto", padding: "0 20px", flex: 1, width: "100%" }}>
        {!getAccessToken() && <div style={{ marginBottom: 16, padding: 14, background: "#fff7ed", color: "#9a3412", borderRadius: 12 }}>Vui lòng đăng nhập để xem hội thoại.</div>}
        {getAccessToken() && conversations.length === 0 && <div style={{ marginBottom: 16, padding: 14, background: "#f8fafc", color: "#475569", borderRadius: 12 }}>Chưa có hội thoại. Hội thoại sẽ xuất hiện khi một đề xuất trao đổi được chấp nhận.</div>}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            minHeight: "720px",
            overflow: "hidden",
          }}
        >
          {/* Cột trái: Danh sách cuộc trò chuyện */}
          <div style={{ borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Trò Chuyện Trực Tuyến</h2>
                <span style={{ fontSize: "11px", background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "9999px", fontWeight: "700" }}>
                  Real-time Active
                </span>
              </div>
              <input
                type="text"
                placeholder="Tìm người dùng hoặc dòng máy..."
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  background: "#ffffff",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#059669")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
              />
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #f1f5f9",
                      background: isActive ? "#ecfdf5" : "transparent",
                      borderLeft: isActive ? "3.5px solid #059669" : "3.5px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            background: "#e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            transition: "transform 0.2s",
                          }}
                        >
                          {conv.partnerAvatar}
                        </div>
                        {conv.online && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "0",
                              right: "0",
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: "#10b981",
                              border: "2px solid #fff",
                            }}
                          ></div>
                        )}
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{conv.partnerName}</strong>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>{conv.time}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#059669", fontWeight: "700", marginBottom: "4px" }}>
                          {conv.tradeItem}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {conv.lastMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Cửa sổ chat */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#ffffff" }}>
            {/* Thanh tiêu đề đối tác */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "#ecfdf5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  {currentConv.partnerAvatar}
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                    {currentConv.partnerName}
                  </h3>
                  <div style={{ fontSize: "12px", color: currentConv.online ? "#10b981" : "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: currentConv.online ? "#10b981" : "#94a3b8" }}></span>
                    {currentConv.online ? "Đang trực tuyến" : "Ngoại tuyến"}
                  </div>
                </div>
              </div>
              {/* Thông tin thương lượng giao lưu */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  textAlign: "right",
                }}
              >
                <div style={{ fontSize: "11px", color: "#64748b" }}>Thương lượng đổi:</div>
                <strong style={{ fontSize: "13px", color: "#059669" }}>{currentConv.tradeItem}</strong>
              </div>
            </div>

            {/* Danh sách tin nhắn */}
            <div
              style={{
                flex: 1,
                padding: "24px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                background: "radial-gradient(circle at 50% 50%, #f8fafc 0%, #ffffff 100%)",
              }}
            >
              <div style={{ textAlign: "center", margin: "8px 0" }}>
                <span style={{ fontSize: "11px", background: "#ecfdf5", color: "#047857", padding: "4px 12px", borderRadius: "9999px", border: "1px solid #a7f3d0" }}>
                  🔒 Cuộc trò chuyện được bảo vệ bởi CEP Care Security
                </span>
              </div>
              {currentConv.messages.map((m) => (
                <div
                  key={m.id}
                  className="chatMessageAnimation"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: m.isMe ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px", padding: "0 6px" }}>
                    {m.isMe ? "Tôi" : m.senderName} • {m.time}
                  </div>
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "12px 18px",
                      borderRadius: m.isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: m.isMe ? "linear-gradient(135deg, #10b981, #059669)" : "#f1f5f9",
                      color: m.isMe ? "#ffffff" : "#0f172a",
                      fontSize: "14px",
                      lineHeight: "1.45",
                      boxShadow: m.isMe ? "0 4px 12px rgba(16, 185, 129, 0.25)" : "none",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Khung gợi ý câu trả lời nhanh */}
            <div style={{ padding: "8px 24px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", gap: "8px", overflowX: "auto" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", alignSelf: "center", whiteSpace: "nowrap" }}>
                Gợi ý:
              </span>
              {[
                "Máy bạn pin còn bao nhiêu %?",
                "Có kèm củ sạc và hộp không bạn?",
                "Hẹn gặp ở Coffee House Cầu Giấy nhé!",
                "Bạn bù trừ bao nhiêu để mình chốt?",
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => handleQuickTemplate(template)}
                  className="quickTemplateBtn"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#334155",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                >
                  {template}
                </button>
              ))}
            </div>

            {/* Thanh nhập tin nhắn */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() => alert("Chức năng gửi ảnh chưa được backend hỗ trợ.")}
                title="Đính kèm ảnh test máy"
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              >
                📎
              </button>
              <input
                type="text"
                placeholder="Nhập tin nhắn thỏa thuận với đối tác..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#059669")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
              />
              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
                  transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                }}
              >
                Gửi ➔
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Hiệu ứng chuyển động keyframes trực tiếp */}
      <style jsx global>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .chatMessageAnimation {
          animation: fadeInSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .quickTemplateBtn:hover {
          background: #ecfdf5 !important;
          color: #059669 !important;
          border-color: #a7f3d0 !important;
        }
      `}</style>
    </div>
  );
}