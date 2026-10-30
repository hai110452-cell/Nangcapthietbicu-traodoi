"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import {
  UserRole,
  AuthUser,
  WebsiteConfig,
  defaultWebsiteConfig,
  getStoredConfig,
  getStoredRole,
  getStoredAuthUser,
  saveStoredAuthUser,
} from "../lib/store";
import { api, clearTokens } from "../lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>("user");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [siteConfig, setSiteConfig] = useState<WebsiteConfig>(defaultWebsiteConfig);

  useEffect(() => {
    const syncAuth = () => {
      const user = getStoredAuthUser();
      setAuthUser(user);
      setCurrentRole(user ? user.role : "user");
    };

    syncAuth();
    setSiteConfig(getStoredConfig());
    api<WebsiteConfig | null>("/settings", { auth: false }).then((cfg) => {
      if (cfg) setSiteConfig({ ...defaultWebsiteConfig, ...cfg });
    }).catch((error) => console.error("Không tải được cấu hình website từ API", error));

    const handleRoleUpdate = () => syncAuth();
    const handleAuthUpdate = () => syncAuth();
    const handleConfigUpdate = () => {
      api<WebsiteConfig | null>("/settings", { auth: false }).then((cfg) => {
        if (cfg) setSiteConfig({ ...defaultWebsiteConfig, ...cfg });
      }).catch(() => setSiteConfig(getStoredConfig()));
    };

    window.addEventListener("cep_role_updated", handleRoleUpdate);
    window.addEventListener("cep_auth_updated", handleAuthUpdate);
    window.addEventListener("cep_config_updated", handleConfigUpdate);

    return () => {
      window.removeEventListener("cep_role_updated", handleRoleUpdate);
      window.removeEventListener("cep_auth_updated", handleAuthUpdate);
      window.removeEventListener("cep_config_updated", handleConfigUpdate);
    };
  }, []);

  const handleLogout = () => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("cep_refresh_token") : null;
    api("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }).catch(() => undefined);
    clearTokens();
    saveStoredAuthUser(null);
    setAuthUser(null);
    setCurrentRole("user");
    alert("Đã đăng xuất tài khoản thành công!");
    if (pathname === "/admin") {
      window.location.href = "/";
    }
  };

  // Danh sách tính năng dựa theo vai trò (Người dùng KHÔNG THẤY mục Quản trị)
  const navItems = [
    { label: "Khám phá", href: "/" },
    { label: "Đổi đồ & Tiến trình", href: "/trades" },
    ...(currentRole === "admin"
      ? [{ label: "Quản trị Toàn Web", href: "/admin", isCMS: true }]
      : []),
  ];

  return (
    <>

      {/* Thanh Header chính */}
      <header
        className="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(20px) saturate(190%)",
          WebkitBackdropFilter: "blur(20px) saturate(190%)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.75)",
          boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <div
          className="headerContainer"
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          {/* Logo & Slogan */}
          <Link href="/" className="logoArea" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              className="logoIcon"
              style={{
                width: "42px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src="/logo.svg"
                alt="CEP.EXCHANGE"
                width={42}
                height={42}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 2px 8px rgba(16, 185, 129, 0.35))",
                }}
              />
            </div>
            <div className="logoText" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="brandName" style={{ fontSize: "17px", fontWeight: "900", letterSpacing: "-0.4px", color: "#0f172a" }}>
                  {siteConfig.brandName}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "800",
                    background: currentRole === "admin" ? "linear-gradient(135deg, #059669, #047857)" : "linear-gradient(135deg, #64748b, #475569)",
                    color: "#fff",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {currentRole === "admin" ? "QUẢN TRỊ VIÊN" : "NGƯỜI DÙNG"}
                </span>
              </div>
              <span className="brandSlogan" style={{ fontSize: "11px", color: "#047857", fontWeight: "600", letterSpacing: "0.2px" }}>
                {siteConfig.brandSlogan}
              </span>
            </div>
          </Link>

          {/* Menu Điều Hướng Giữa - Khung đóng riêng cho từng tính năng */}
          <nav className="navMenu" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`navLink ${isActive ? "navLinkActive" : ""}`}
                  style={{
                    color: isActive ? "#065f46" : "#334155",
                    fontWeight: isActive ? "800" : "600",
                    fontSize: "13.5px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    border: isActive ? "1.5px solid #059669" : "1.5px solid #e2e8f0",
                    background: isActive ? "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)" : "#ffffff",
                    boxShadow: isActive
                      ? "0 3px 12px rgba(5, 150, 105, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.9)"
                      : "0 1px 3px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <span>{item.label}</span>
                  {item.isCMS && (
                    <span
                      style={{
                        marginLeft: "2px",
                        fontSize: "9px",
                        background: isActive ? "#059669" : "#f1f5f9",
                        color: isActive ? "#ffffff" : "#047857",
                        border: isActive ? "1px solid #047857" : "1px solid #bbf7d0",
                        padding: "1px 6px",
                        borderRadius: "6px",
                        fontWeight: "800",
                        letterSpacing: "0.4px",
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Các nút hành động bên phải: Tài khoản & Đăng tin */}
          <div className="headerActions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Nút Đăng tin trao đổi */}
            <Link
              href="/post-item"
              className="btnPostTrade"
              style={{
                textDecoration: "none",
                background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 14px rgba(4, 120, 87, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Đăng tin
            </Link>

            {/* Thông tin tài khoản đăng nhập */}
            {authUser ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: currentRole === "admin" ? "#ecfdf5" : "#f8fafc",
                  padding: "4px 8px 4px 12px",
                  borderRadius: "12px",
                  border: currentRole === "admin" ? "1px solid #a7f3d0" : "1px solid #cbd5e1",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ lineHeight: "1.2" }}>
                    <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#0f172a" }}>
                      {authUser.name}
                    </div>
                    <div style={{ fontSize: "10px", color: currentRole === "admin" ? "#047857" : "#64748b", fontWeight: "700" }}>
                      {currentRole === "admin" ? "Quản Trị Viên" : "Người Dùng"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Đăng xuất khỏi tài khoản này"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    color: "#64748b",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    fontWeight: "700",
                    cursor: "pointer",
                    marginLeft: "4px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                >
                  Thoát
                </button>
              </div>
            ) : (
              <button
                className="btnLogin"
                onClick={() => setIsAuthOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#0f172a",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  transition: "all 0.2s ease",
                }}
              >
                <span>Đăng Nhập / Đăng Ký</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
      />
    </>
  );
}