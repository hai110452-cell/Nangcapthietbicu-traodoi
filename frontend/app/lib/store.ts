// Types & Mock State cho Nền tảng Trao đổi CEP

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

export const initialExchangeListings: ExchangeItem[] = [
  {
    id: "ex-1",
    category: "laptop",
    title: "MacBook Pro 14 M2 Pro (16GB / 512GB SSD)",
    gradientBg: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
    deviceIcon: "💻",
    categoryName: "Laptop Apple",
    type: "Bù trừ",
    specs: ["Màu Xám Không Gian", "Pin 96%", "Fullbox Chính Hãng", "Đẹp 99%"],
    estimatedValue: "28.500.000 đ",
    valNumber: 28500000,
    targetDemand: "Muốn đổi: iPhone 15 Pro Max 256GB hoặc bù trừ PC Gaming",
    location: "Quận 1, TP. Hồ Chí Minh",
    ownerName: "Tuấn Anh",
    rating: 4.9,
    dealCount: 18,
    reviewCount: 3,
  },
  {
    id: "ex-2",
    category: "iphone",
    title: "iPhone 14 Pro 128GB Tím Deep Purple VN/A",
    gradientBg: "linear-gradient(135deg, #4c1d95 0%, #581c87 100%)",
    deviceIcon: "📱",
    categoryName: "Điện thoại iOS",
    type: "Đổi ngang",
    specs: ["VN/A Hết bảo hành", "Pin 89%", "Chưa qua sửa chữa", "Kèm sạc cáp"],
    estimatedValue: "16.800.000 đ",
    valNumber: 16800000,
    targetDemand: "Muốn đổi: ThinkPad P14s / Dell XPS 13 ngang tầm giá",
    location: "Cầu Giấy, Hà Nội",
    ownerName: "Minh Hoàng",
    rating: 5.0,
    dealCount: 12,
    reviewCount: 2,
  },
  {
    id: "ex-3",
    category: "pc",
    title: "Dàn PC Gaming i5-13400F / RTX 3060Ti / 32GB RAM",
    gradientBg: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)",
    deviceIcon: "🖥️",
    categoryName: "Máy tính bàn PC",
    type: "Bù trừ",
    specs: ["VGA MSI Gaming X", "Nguồn 650W Bronze", "SSD 1TB NVMe", "Tản AIO RGB"],
    estimatedValue: "15.500.000 đ",
    valNumber: 15500000,
    targetDemand: "Muốn đổi: MacBook Air M1/M2 gọn nhẹ hoặc iPad Pro",
    location: "Hải Châu, Đà Nẵng",
    ownerName: "Đức Trọng",
    rating: 4.8,
    dealCount: 7,
    reviewCount: 1,
  },
  {
    id: "ex-4",
    category: "android",
    title: "Samsung Galaxy S24 Ultra 256GB Titan Xám",
    gradientBg: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)",
    deviceIcon: "📱",
    categoryName: "Điện thoại Android",
    type: "Bù trừ",
    specs: ["Bảo hành Care+ 10/2026", "Đẹp keng 99.9%", "Có bút S-Pen", "Fullbox"],
    estimatedValue: "22.800.000 đ",
    valNumber: 22800000,
    targetDemand: "Muốn đổi: Laptop Gaming ASUS ROG Zephyrus hoặc Legion 5",
    location: "Bình Thạnh, TP. Hồ Chí Minh",
    ownerName: "Thanh Tùng",
    rating: 5.0,
    dealCount: 29,
    reviewCount: 1,
  },
  {
    id: "ex-5",
    category: "laptop",
    title: "Dell XPS 13 Plus 9320 OLED 3.5K Touch",
    gradientBg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    deviceIcon: "💻",
    categoryName: "Laptop Ultrabook",
    type: "Đổi ngang",
    specs: ["Core i7 1360P", "RAM 16GB", "SSD 512GB", "Màn hình OLED 3.5K Cảm ứng"],
    estimatedValue: "23.500.000 đ",
    valNumber: 23500000,
    targetDemand: "Muốn đổi: iPhone 15 Pro hoặc Galaxy Z Fold5 tương đương",
    location: "Đống Đa, Hà Nội",
    ownerName: "Văn Khang",
    rating: 4.9,
    dealCount: 14,
    reviewCount: 2,
  },
  {
    id: "ex-6",
    category: "pc",
    title: "PC Gaming mini ITX Ryzen 7 5700X / RTX 4060",
    gradientBg: "linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)",
    deviceIcon: "🖥️",
    categoryName: "Máy tính mini ITX",
    type: "Bù trừ",
    specs: ["Case ITX K39", "RAM 32GB 3600MHz", "Gọn nhẹ bỏ ba lô", "Nguồn SFX 600W"],
    estimatedValue: "17.200.000 đ",
    valNumber: 17200000,
    targetDemand: "Muốn đổi: Laptop văn phòng mỏng nhẹ hoặc iPad Air 5",
    location: "Ninh Kiều, Cần Thơ",
    ownerName: "Quốc Huy",
    rating: 4.7,
    dealCount: 9,
    reviewCount: 1,
  },
];

export const initialUsers: UserProfile[] = [
  {
    id: "usr-1",
    name: "Tuấn Anh (Tôi)",
    email: "tuananh.dev@gmail.com",
    avatar: "👨‍💻",
    role: "user",
    dealCount: 18,
    rating: 4.9,
    status: "active",
  },
  {
    id: "usr-2",
    name: "Minh Hoàng",
    email: "minhhoang.tech@gmail.com",
    avatar: "📱",
    role: "user",
    dealCount: 12,
    rating: 5.0,
    status: "active",
  },
  {
    id: "usr-admin",
    name: "Quản Trị Viên CEP",
    email: "admin@cep-exchange.vn",
    avatar: "🛡️",
    role: "admin",
    dealCount: 45,
    rating: 5.0,
    status: "active",
  },
];

// Helper functions for localStorage synchronization
const LISTINGS_STORAGE_KEY = "cep_exchange_listings_v2";
const CONFIG_STORAGE_KEY = "cep_website_config_v2";
const ROLE_STORAGE_KEY = "cep_current_user_role";

export function getStoredListings(): ExchangeItem[] {
  if (typeof window === "undefined") return initialExchangeListings;
  try {
    const raw = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(initialExchangeListings));
      return initialExchangeListings;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialExchangeListings;
  } catch (e) {
    console.error("Error reading listings from localStorage", e);
    return initialExchangeListings;
  }
}

export function saveStoredListings(listings: ExchangeItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listings));
    window.dispatchEvent(new Event("cep_listings_updated"));
  } catch (e) {
    console.error("Error saving listings to localStorage", e);
  }
}

export function getStoredConfig(): WebsiteConfig {
  if (typeof window === "undefined") return defaultWebsiteConfig;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(defaultWebsiteConfig));
      return defaultWebsiteConfig;
    }
    return { ...defaultWebsiteConfig, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Error reading config from localStorage", e);
    return defaultWebsiteConfig;
  }
}

export function saveStoredConfig(cfg: WebsiteConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new Event("cep_config_updated"));
  } catch (e) {
    console.error("Error saving config to localStorage", e);
  }
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

const AUTH_USER_KEY = "cep_current_auth_user";

export const defaultRegularUser: AuthUser = {
  id: "usr-regular",
  name: "Thành viên CEP",
  email: "nguoidung@gmail.com",
  role: "user",
  avatar: "👤",
};

export const adminUserAccount: AuthUser = {
  id: "usr-admin",
  name: "Quản Trị Viên CEP",
  email: "admin@cep-exchange.vn",
  role: "admin",
  avatar: "🛡️",
};

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return defaultRegularUser;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultRegularUser));
      return defaultRegularUser;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultRegularUser;
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

export const initialDeals: TradeDeal[] = [
  {
    id: "deal-101",
    listingId: "ex-1",
    listingTitle: "MacBook Pro 14 M2 Pro (16GB / 512GB SSD)",
    targetDeviceName: "MacBook Pro 14 M2 Pro",
    offeredDeviceName: "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
    proposerName: "Tuấn Anh",
    proposerId: "usr-1",
    receiverName: "Đức Trọng",
    receiverId: "usr-3",
    compensationType: "proposer_adds",
    compensationAmount: 2000000,
    currentStep: 3,
    status: "inspecting",
    updatedAt: "Hôm nay, 08:15",
    note: "Đã mang qua trung tâm kỹ thuật CEP Care để kiểm định pin và mainboard.",
  },
  {
    id: "deal-102",
    listingId: "ex-2",
    listingTitle: "iPhone 14 Pro 128GB Tím Deep Purple VN/A",
    targetDeviceName: "iPhone 14 Pro 128GB",
    offeredDeviceName: "ThinkPad T14s Gen 3 AMD 6850U",
    proposerName: "Minh Hoàng",
    proposerId: "usr-2",
    receiverName: "Tuấn Anh",
    receiverId: "usr-1",
    compensationType: "even",
    compensationAmount: 0,
    currentStep: 2,
    status: "agreed",
    updatedAt: "Hôm qua, 16:30",
    note: "Hai bên đã thống nhất đổi ngang, hẹn gặp tại Coffee House Cầu Giấy.",
  },
];

export interface EcoReward {
  id: string;
  title: string;
  costPoints: number;
  category: "voucher" | "service" | "gift";
  icon: string;
  description: string;
  discountValue: string;
}

export const initialEcoRewards: EcoReward[] = [
  {
    id: "rew-1",
    title: "Voucher Miễn Phí Kiểm Định Kỹ Thuật",
    costPoints: 200,
    category: "service",
    icon: "🔍",
    description: "Kỹ thuật viên CEP kiểm tra chuyên sâu phần cứng, màn hình và pin miễn phí tại điểm giao dịch.",
    discountValue: "Trị giá 150.000 đ",
  },
  {
    id: "rew-2",
    title: "Voucher Giảm 50% Phí Vận Chuyển Đảm Bảo",
    costPoints: 150,
    category: "voucher",
    icon: "🚚",
    description: "Giảm 50% cước giao hàng liên tỉnh có bảo hiểm thiết bị công nghệ nguyên vẹn 100%.",
    discountValue: "Giảm tối đa 100.000 đ",
  },
];
