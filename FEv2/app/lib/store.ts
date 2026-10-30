// Kiểu dữ liệu dùng chung cho frontend CEP.EXCHANGE

export type UserRole = "user" | "admin" | "moderator";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  greenPoints?: number;
  dealCount: number;
  rating: number;
  status?: "active" | "locked";
}

export interface ExchangeItem {
  id: string;
  category: "laptop" | "pc" | "iphone" | "android";
  title: string;
  gradientBg: string;
  deviceIcon: string;
  /** Ảnh Cloudinary của tin đăng, do API /listings trả về */
  images?: Array<{ id?: string; url: string; sortOrder?: number }>;
  categoryName: string;
  type: "Đổi ngang" | "Bù trừ";
  specs: string[];
  estimatedValue: string;
  valNumber: number;
  targetDemand: string;
  location: string;
  ownerName: string;
  rating: number;
  dealCount: number;
  reviewCount?: number;
  ownerId?: string;
}

export interface WebsiteConfig {
  brandName: string;
  brandSlogan: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  heroBadgeText: string;
  hotline: string;
  supportEmail: string;
  inspectionAddress: string;
  announcementBanner: string;
  announcementActive: boolean;
}

export const defaultWebsiteConfig: WebsiteConfig = {
  brandName: "CEP.EXCHANGE",
  brandSlogan: "Nền Tảng Trao Đổi Máy Tính & Điện Thoại",
  heroTitle: "Nâng Cấp Thiết Bị Cũ — Trao Đổi",
  heroHighlight: "Máy Tính & Điện Thoại Thông Minh",
  heroDescription:
    "Nền tảng kết nối trực tiếp những người dùng có nhu cầu chuyển đổi giữa Laptop, PC Gaming, MacBook, iPhone và Android. Ứng dụng AI Computer Vision tự động nhận diện thiết bị và bảo chứng giao dịch an toàn.",
  heroBadgeText: "Hơn 2.500+ lượt đổi thành công tháng này • Bảo chứng chất lượng CEP Care Escrow",
  hotline: "1900 6868",
  supportEmail: "hotro@cep-exchange.vn",
  inspectionAddress: "Trung tâm CEP Care: 123 Nguyễn Huệ, Quận 1, TP.HCM & 45 Cầu Giấy, Hà Nội",
  announcementBanner: "",
  announcementActive: false,
};

const CONFIG_STORAGE_KEY = "cep_website_config_v2";
const ROLE_STORAGE_KEY = "cep_current_user_role";

export function getStoredConfig(): WebsiteConfig {
  if (typeof window === "undefined") return defaultWebsiteConfig;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    return raw ? { ...defaultWebsiteConfig, ...JSON.parse(raw) } : defaultWebsiteConfig;
  } catch { return defaultWebsiteConfig; }
}

export function saveStoredConfig(cfg: WebsiteConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event("cep_config_updated"));
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

const AUTH_USER_KEY = "cep_current_auth_user";

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    if (!localStorage.getItem("cep_access_token") && !localStorage.getItem("cep_refresh_token")) {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveStoredAuthUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.setItem(ROLE_STORAGE_KEY, "user");
  } else {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(ROLE_STORAGE_KEY, user.role);
  }
  window.dispatchEvent(new Event("cep_auth_updated"));
  window.dispatchEvent(new Event("cep_role_updated"));
}

export function getStoredRole(): UserRole {
  if (typeof window === "undefined") return "user";
  const user = getStoredAuthUser();
  return user ? user.role : "user";
}

export function saveStoredRole(role: UserRole): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_STORAGE_KEY, role);
  window.dispatchEvent(new Event("cep_role_updated"));
}

export interface ChatMessage {
  id: string;
  dealId?: string;
  senderName: string;
  senderRole: "user" | "moderator" | "partner";
  text: string;
  time: string;
  isMe: boolean;
  image?: string;
}

export interface TradeDeal {
  id: string;
  listingId: string;
  listingTitle: string;
  targetDeviceName: string;
  offeredDeviceName: string;
  proposerName: string;
  proposerId: string;
  receiverName: string;
  receiverId: string;
  compensationType: "even" | "proposer_adds" | "receiver_adds";
  compensationAmount: number;
  currentStep: 1 | 2 | 3 | 4 | 5;
  status: "pending" | "agreed" | "inspecting" | "completed" | "rejected";
  updatedAt: string;
  note: string;
}

export interface EcoReward {
  id: string;
  title: string;
  costPoints: number;
  category: "voucher" | "service" | "gift";
  icon: string;
  description: string;
  discountValue: string;
}

