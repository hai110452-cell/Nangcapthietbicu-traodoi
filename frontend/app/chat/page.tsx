"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { ChatMessage } from "../lib/store";

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

const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    partnerName: "Minh Hoàng",
    partnerAvatar: "📱",
    lastMessage: "Mình mang máy ra cửa hàng Coffee House kiểm tra nhé!",
    time: "10:14",
    unread: 1,
    tradeItem: "iPhone 14 Pro 128GB ⇄ ThinkPad T14s",
    compensation: "Đổi ngang giá trị",
    online: true,
    messages: [
      { id: "m1", text: "Chào Tuấn Anh! Mình thấy bạn đang tìm đổi MacBook hoặc ThinkPad ngang giá iPhone 14 Pro?", time: "10:02", isMe: false, senderName: "Minh Hoàng", senderRole: "partner" },
      { id: "m2", text: "Đúng rồi bạn, máy bạn ThinkPad T14s chạy chip AMD 6850U đúng không? Pin còn bao nhiêu %?", time: "10:05", isMe: true, senderName: "Tôi", senderRole: "user" },
      { id: "m3", text: "Pin 96%, còn bảo hành chính hãng đến 11/2026 bạn nhé. Máy đẹp không xước.", time: "10:08", isMe: false, senderName: "Minh Hoàng", senderRole: "partner" },
      { id: "m4", text: "Thế thì hợp lý quá, hai bên đổi ngang nhé. Mình hẹn nhau test phần cứng ở đâu?", time: "10:11", isMe: true, senderName: "Tôi", senderRole: "user" },
      { id: "m5", text: "Mình mang máy ra cửa hàng Coffee House kiểm tra nhé!", time: "10:14", isMe: false, senderName: "Minh Hoàng", senderRole: "partner" },
    ],
  },
  {
    id: "conv-2",
    partnerName: "Đức Trọng",
    partnerAvatar: "💻",
    lastMessage: "Kỹ thuật viên CEP Care vừa test xong phần cứng rồi bạn nhé.",
    time: "09:30",
    unread: 0,
    tradeItem: "MacBook Pro 14 M2 Pro ⇄ iPhone 15 Pro Max",
    compensation: "Tuấn Anh bù 2.000.000 đ",
    online: false,
    messages: [
      { id: "m21", text: "Chào bạn, MacBook Pro 14 M2 Pro của bạn đẹp quá, mình muốn giao lưu với iPhone 15 Pro Max 256GB Titan Tự Nhiên.", time: "Hôm qua", isMe: false, senderName: "Đức Trọng", senderRole: "partner" },
      { id: "m22", text: "Chào Trọng, máy mình định giá 28.5tr, iPhone của bạn khoảng 26.5tr, bạn bù 2tr được không?", time: "Hôm qua", isMe: true, senderName: "Tôi", senderRole: "user" },
      { id: "m23", text: "OK bạn, mình đồng ý mức bù 2 triệu. Mình đặt lịch kiểm định qua CEP Care nhé.", time: "Hôm qua", isMe: false, senderName: "Đức Trọng", senderRole: "partner" },
      { id: "m24", text: "Kỹ thuật viên CEP Care vừa test xong phần cứng rồi bạn nhé.", time: "09:30", isMe: false, senderName: "Đức Trọng", senderRole: "partner" },
    ],
  },
  {
    id: "conv-3",
    partnerName: "Thanh Tùng",
    partnerAvatar: "🤖",
    lastMessage: "Cảm ơn bạn nhé, máy dùng rất mượt!",
    time: "24/10",
    unread: 0,
    tradeItem: "Galaxy S24 Ultra ⇄ ROG Zephyrus G14",
    compensation: "Đã hoàn tất",
    online: false,
    messages: [
      { id: "m31", text: "Đã giao dịch thành công tại chi nhánh TP.HCM.", time: "24/10", isMe: false, senderName: "Thanh Tùng", senderRole: "partner" },
      { id: "m32", text: "Cảm ơn bạn nhé, máy dùng rất mượt!", time: "24/10", isMe: false, senderName: "Thanh Tùng", senderRole: "partner" },
    ],
  },
];

export default function ChatPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/trades");
  }, [router]);

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState<string>("conv-1");
  const [inputText, setInputText] = useState("");

  const currentConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      senderName: "Tôi",
      senderRole: "user",
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastMessage: inputText,
            time: "Vừa xong",
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText("");

    // Giả lập đối tác trả lời tự động sau 1.5 giây
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        text: "Tuyệt vời! Mình đã lưu thông tin và sẽ chuẩn bị máy kèm đầy đủ phụ kiện theo đúng thỏa thuận.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: false,
        senderName: currentConv.partnerName,
        senderRole: "partner",
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              lastMessage: replyMsg.text,
              time: "Vừa xong",
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  const handleQuickTemplate = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="pageWrapper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ maxWidth: "1280px", margin: "24px auto", padding: "0 20px", flex: 1, width: "100%" }}>
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
                onClick={() => alert("Đã mở trình chọn ảnh chụp máy thực tế và kết quả test 3uTools/Geekbench!")}
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