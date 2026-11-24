"use client";

import { useState } from "react";
import {
  UserRole,
  AuthUser,
  saveStoredAuthUser,
} from "../lib/store";
import { api, saveTokens } from "../lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  defaultAdminLogin?: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentRole,
  onRoleChange,
  defaultAdminLogin = false,
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!email.trim() || !password.trim() || (tab === "register" && !fullName.trim())) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await api<any>(tab === "register" ? "/auth/register" : "/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify(tab === "register"
          ? { fullName: fullName.trim(), email: email.trim(), password }
          : { email: email.trim(), password }),
      });
      saveTokens(result.accessToken, result.refreshToken);
      const raw = result.user || {};
      const user: AuthUser = {
        id: raw.id,
        name: raw.name || raw.fullName || fullName || email.split("@")[0],
        email: raw.email || email,
        role: raw.role === "admin" || raw.role === "moderator" ? raw.role : "user",
        avatar: raw.avatar || "👤",
      };
      saveStoredAuthUser(user);
      onRoleChange(user.role);
      setSuccessMsg(tab === "register" ? "Đăng ký và đăng nhập thành công!" : "Đăng nhập thành công!");
      setTimeout(() => { setSuccessMsg(""); onClose(); }, 900);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Không thể kết nối máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="authModalWindow"
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "480px",
          padding: "32px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4)",
          position: "relative",
          border: "1px solid #e2e8f0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            border: "none",
            background: "#f1f5f9",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            fontSize: "16px",
            color: "#64748b",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Tab Đăng Nhập / Đăng Ký */}
        <div
          style={{
            display: "flex",
            background: "#f1f5f9",
            borderRadius: "14px",
            padding: "4px",
            marginBottom: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "10px",
              background: tab === "login" ? "#ffffff" : "transparent",
              color: tab === "login" ? "#065f46" : "#64748b",
              fontWeight: tab === "login" ? "800" : "600",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: tab === "login" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "10px",
              background: tab === "register" ? "#ffffff" : "transparent",
              color: tab === "register" ? "#065f46" : "#64748b",
              fontWeight: tab === "register" ? "800" : "600",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: tab === "register" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            Đăng Ký Tài Khoản
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
            {tab === "login" ? "Chào Mừng Bạn Trở Lại!" : "Tạo Tài Khoản Người Dùng"}
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
            {tab === "login"
              ? "Đăng nhập để giao lưu, trao đổi máy và để lại đánh giá."
              : "Tài khoản đăng ký mặc định là Người Dùng (không có quyền quản trị)."}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: "#dcfce7",
              border: "1px solid #86efac",
              color: "#15803d",
              padding: "12px 16px",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: "700",
              marginBottom: "16px",
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === "register" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                Họ và tên của bạn:
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn An"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  outline: "none",
                }}
                required
              />
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
              Địa chỉ Email:
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "13.5px",
                outline: "none",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
              Mật khẩu:
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "13.5px",
                outline: "none",
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
              color: "#ffffff",
              border: "none",
              padding: "13px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(5, 150, 105, 0.35)",
              transition: "transform 0.2s ease",
            }}
          >
            {isSubmitting ? "Đang xử lý..." : tab === "login" ? "Đăng Nhập Ngay" : "Tạo Tài Khoản Người Dùng"}
          </button>
        </form>

        {/* Khung Hỗ Trợ Đăng Nhập Nhanh Cho Demo */}

      </div>
    </div>
  );
}