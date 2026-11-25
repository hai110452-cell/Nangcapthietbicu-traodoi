// Kiểu dữ liệu dùng chung cho frontend CEP.EXCHANGE

export type UserRole = "user" | "admin" | "moderator";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  dealCount: number;
  rating: number;
  status?: "active" | "locked";
}

export interface Category {
  id: string;
  code: string;
  name: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
}

export const defaultCategories: Category[] = [
  { id: "cat-laptop", code: "laptop", name: "Laptop & MacBook", icon: "💻", sortOrder: 1, isActive: true },
  { id: "cat-pc", code: "pc", name: "Máy tính bàn PC Gaming", icon: "🖥️", sortOrder: 2, isActive: true },
  { id: "cat-iphone", code: "iphone", name: "Điện thoại iPhone / iPad", icon: "📱", sortOrder: 3, isActive: true },
  { id: "cat-android", code: "android", name: "Điện thoại Android", icon: "🤖", sortOrder: 4, isActive: true },
];

export interface ExchangeItem {
  id: string;
  category: string;
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
  status?: "approved" | "pending" | "rejected" | "hidden" | "completed";
}

export const fallbackExchangeItems: ExchangeItem[] = [
  {
    id: "sample-1",
    category: "laptop",
    title: "MacBook Pro 14 M2 Pro (16GB / 512GB SSD) Space Gray",
    categoryName: "Laptop Apple",
    deviceIcon: "💻",
    gradientBg: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
    type: "Bù trừ",
    specs: ["Chip Apple M2 Pro 10-Core", "RAM 16GB Unified", "SSD 512GB PCIe", "Màn hình Liquid Retina XDR 120Hz", "Pin 96% 62 chu kỳ"],
    valNumber: 28500000,
    estimatedValue: "28.500.000 đ",
    targetDemand: "Muốn đổi iPhone 15 Pro Max hoặc bù trừ dàn PC Gaming tương đương",
    location: "Quận 1, TP. Hồ Chí Minh",
    ownerName: "Anh Tuấn (Verified)",
    rating: 4.9,
    dealCount: 14,
    reviewCount: 8,
    status: "approved",
  },
  {
    id: "sample-2",
    category: "iphone",
    title: "iPhone 15 Pro Max 256GB Titan Tự Nhiên VN/A Fullbox",
    categoryName: "iPhone iOS",
    deviceIcon: "📱",
    gradientBg: "linear-gradient(135deg, #4c1d95 0%, #581c87 100%)",
    type: "Đổi ngang",
    specs: ["Màu Natural Titanium sang trọng", "Pin 98% còn bảo hành chính hãng", "Khung viền Titan siêu nhẹ", "Chip A17 Pro chơi game cực mượt"],
    valNumber: 24900000,
    estimatedValue: "24.900.000 đ",
    targetDemand: "Muốn đổi MacBook Pro M-Series hoặc Galaxy S24 Ultra có bù trừ hợp lý",
    location: "Cầu Giấy, Hà Nội",
    ownerName: "Hoàng Nam",
    rating: 5.0,
    dealCount: 9,
    reviewCount: 6,
    status: "approved",
  },
  {
    id: "sample-3",
    category: "pc",
    title: "Dàn PC Gaming i7 13700K / RTX 4070 12GB / 32GB DDR5 RGB",
    categoryName: "PC Gaming",
    deviceIcon: "🖥️",
    gradientBg: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)",
    type: "Bù trừ",
    specs: ["CPU Intel Core i7 13700K", "VGA RTX 4070 12GB OC Gaming", "RAM 32GB DDR5 6000MHz", "SSD NVMe 1TB Gen4", "Tản nhiệt nước AIO 360 ARGB"],
    valNumber: 32000000,
    estimatedValue: "32.000.000 đ",
    targetDemand: "Muốn đổi sang Laptop Gaming ASUS ROG / Legion 5 hoặc MacBook Pro",
    location: "Hải Châu, Đà Nẵng",
    ownerName: "Minh Đức",
    rating: 4.8,
    dealCount: 21,
    reviewCount: 12,
    status: "approved",
  },
  {
    id: "sample-4",
    category: "android",
    title: "Samsung Galaxy S24 Ultra 5G 12GB/256GB Titanium Gray",
    categoryName: "Điện thoại Android",
    deviceIcon: "📱",
    gradientBg: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)",
    type: "Bù trừ",
    specs: ["Bút S-Pen tích hợp Galaxy AI", "Màn hình 6.8 inch Dynamic AMOLED 2X", "Camera 200MP zoom quang 100x", "Khung viền Titanium nguyên khối"],
    valNumber: 21500000,
    estimatedValue: "21.500.000 đ",
    targetDemand: "Muốn đổi iPhone 15 Pro hoặc MacBook Air M2 phục vụ công việc",
    location: "Bình Thạnh, TP. Hồ Chí Minh",
    ownerName: "Quỳnh Nga",
    rating: 5.0,
    dealCount: 7,
    reviewCount: 5,
    status: "approved",
  },
  {
    id: "sample-5",
    category: "laptop",
    title: "MacBook Air M2 13.6 inch Midnight (8GB / 256GB SSD)",
    categoryName: "Laptop Apple",
    deviceIcon: "💻",
    gradientBg: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
    type: "Đổi ngang",
    specs: ["Chip Apple M2 8-Core", "Thiết kế siêu mỏng nhẹ 1.24kg", "Màn hình Liquid Retina tai thỏ", "Pin dùng thực tế 15 tiếng liên tục"],
    valNumber: 17800000,
    estimatedValue: "17.800.000 đ",
    targetDemand: "Muốn đổi iPad Pro M1/M2 kèm bàn phím hoặc iPhone 14 Pro Max",
    location: "Đống Đa, Hà Nội",
    ownerName: "Thanh Trúc",
    rating: 4.9,
    dealCount: 5,
    reviewCount: 4,
    status: "approved",
  },
  {
    id: "sample-6",
    category: "laptop",
    title: "ASUS ROG Zephyrus G14 (Ryzen 9 7940HS / RTX 4060 / 16GB)",
    categoryName: "Laptop Gaming",
    deviceIcon: "💻",
    gradientBg: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)",
    type: "Bù trừ",
    specs: ["Màn hình 14 inch QHD+ 165Hz ROG Nebula", "AMD Ryzen 9 7940HS", "NVIDIA RTX 4060 8GB", "Trọng lượng chỉ 1.65kg nhỏ gọn"],
    valNumber: 26000000,
    estimatedValue: "26.000.000 đ",
    targetDemand: "Muốn đổi MacBook Pro 14 M-Series hoặc iPad Pro M2",
    location: "Ninh Kiều, Cần Thơ",
    ownerName: "Lê Hữu Đạt",
    rating: 4.8,
    dealCount: 11,
    reviewCount: 7,
    status: "approved",
  },
];

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

