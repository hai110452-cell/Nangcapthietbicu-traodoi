// CEP AI Engine - Dịch vụ Trí Tuệ Nhân Tạo:
// 1. Tự động sinh nội dung & đăng bài (AI Auto-Poster)
// 2. Xét duyệt & kiểm định an toàn bài đăng (AI Moderation & Trust Score)
// 3. Tìm kiếm ngữ nghĩa & tư vấn thiết bị thông minh (AI Semantic Search)

import { ExchangeItem } from "./store";

export interface AIPostGenerationResult {
  title: string;
  category: "laptop" | "pc" | "iphone" | "android";
  categoryName: string;
  type: "Đổi ngang" | "Bù trừ";
  specs: string[];
  estimatedValue: string;
  valNumber: number;
  targetDemand: string;
  conditionDesc: string;
  deviceIcon: string;
  gradientBg: string;
  aiConfidence: number;
  aiSummary: string;
}

export interface ModerationCheckItem {
  name: string;
  passed: boolean;
  score: number;
  details: string;
}

export interface AIModerationResult {
  score: number; // 0 - 100%
  verdict: "approved" | "needs_review" | "rejected";
  summary: string;
  safetyLevel: "high" | "medium" | "low";
  suggestedAction: string;
  checks: ModerationCheckItem[];
  detectedSpecs: string[];
  priceAssessment: string;
}

export interface AISearchMatch {
  item: ExchangeItem;
  matchScore: number; // 0 - 100
  matchReason: string;
  recommendation: string;
  highlightSpecs: string[];
}

export interface AISearchResult {
  matches: AISearchMatch[];
  aiAdvice: string;
  detectedCriteria: {
    category?: string;
    maxPrice?: number;
    minPrice?: number;
    intent?: string;
    targetTrade?: string;
    keywords: string[];
  };
}

// Bảng dữ liệu thiết bị thông minh (Smart Tech Knowledge Base)
const TECH_KNOWLEDGE_BASE: Array<{
  keywords: string[];
  category: "laptop" | "pc" | "iphone" | "android";
  categoryName: string;
  deviceIcon: string;
  gradientBg: string;
  defaultTitle: string;
  specs: string[];
  typicalValue: number;
  valueStr: string;
  suggestedExchange: string;
  condition: string;
}> = [
  {
    keywords: ["macbook pro 14", "m2 pro", "macbook m2", "mac pro 14"],
    category: "laptop",
    categoryName: "Laptop Apple",
    deviceIcon: "💻",
    gradientBg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    defaultTitle: "MacBook Pro 14 M2 Pro (16GB / 512GB SSD) Space Gray",
    specs: ["Apple M2 Pro (10-Core CPU, 16-Core GPU)", "RAM 16GB Unified Memory", "SSD 512GB Tốc độ cao", "Màn hình 14.2 inch Liquid Retina XDR 120Hz ProMotion", "Pin 95%, sạc 45 lần"],
    typicalValue: 28500000,
    valueStr: "28.500.000 đ",
    suggestedExchange: "Muốn đổi: iPhone 15 Pro Max hoặc bù trừ dàn PC Gaming tương đương",
    condition: "Ngoại hình 98.5%, không cấn móp, đầy đủ củ sạc MagSafe 3 67W chính hãng",
  },
  {
    keywords: ["macbook air m2", "mac air m2", "air m2"],
    category: "laptop",
    categoryName: "Laptop Apple",
    deviceIcon: "💻",
    gradientBg: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
    defaultTitle: "MacBook Air M2 13.6 inch Midnight (8GB / 256GB SSD)",
    specs: ["Chip Apple M2 (8-Core CPU, 8-Core GPU)", "RAM 8GB Unified", "SSD 256GB NVMe", "Màn hình Liquid Retina 500 nits siêu nét", "Pin 93%, dùng văn phòng 10-12 tiếng"],
    typicalValue: 19500000,
    valueStr: "19.500.000 đ",
    suggestedExchange: "Muốn đổi: iPad Pro M1/M2 kèm bàn phím hoặc iPhone 14 Pro Max",
    condition: "Đẹp 99% keng, màu Midnight sang trọng, dán bảo vệ full thân máy từ lúc mua",
  },
  {
    keywords: ["macbook air m1", "mac m1", "air m1"],
    category: "laptop",
    categoryName: "Laptop Apple",
    deviceIcon: "💻",
    gradientBg: "linear-gradient(135deg, #475569 0%, #334155 100%)",
    defaultTitle: "MacBook Air M1 2020 Space Gray (8GB / 256GB)",
    specs: ["Apple M1 8 nhân mạnh mẽ", "RAM 8GB", "SSD 256GB", "Màn Retina 13.3 inch chuẩn màu DCI-P3", "Pin 91% còn rất tốt"],
    typicalValue: 13800000,
    valueStr: "13.800.000 đ",
    suggestedExchange: "Muốn đổi: Laptop Windows mỏng nhẹ hoặc điện thoại Android cao cấp",
    condition: "Nguyên bản 100% chưa qua bảo hành sửa chữa, bàn phím gõ êm",
  },
  {
    keywords: ["iphone 15 pro max", "ip 15 prm", "15 pro max", "15prm"],
    category: "iphone",
    categoryName: "Điện thoại iOS",
    deviceIcon: "📱",
    gradientBg: "linear-gradient(135deg, #475569 0%, #1e293b 100%)",
    defaultTitle: "iPhone 15 Pro Max 256GB Titan Tự Nhiên VN/A",
    specs: ["Màn hình 6.7 inch Super Retina XDR 120Hz ProMotion", "Chip Apple A17 Pro tiến trình 3nm", "Khung viền Titanium chuẩn hàng không", "Pin 94%, cổng USB-C 3.0", "Camera tiềm vọng 5x Zoom quang"],
    typicalValue: 24800000,
    valueStr: "24.800.000 đ",
    suggestedExchange: "Muốn đổi: MacBook Pro M-Series hoặc Galaxy S24 Ultra có bù trừ",
    condition: "Máy đẹp 99%, hàng chính hãng VN/A hết bảo hành, đầy đủ hộp trùng imei",
  },
  {
    keywords: ["iphone 14 pro", "ip 14 pro", "14 pro max", "iphone 14"],
    category: "iphone",
    categoryName: "Điện thoại iOS",
    deviceIcon: "📱",
    gradientBg: "linear-gradient(135deg, #581c87 0%, #3b0764 100%)",
    defaultTitle: "iPhone 14 Pro 128GB Deep Purple VN/A Pin 89%",
    specs: ["Màn hình Dynamic Island 120Hz mượt mà", "Chip Apple A16 Bionic cực mạnh", "Camera chính 48MP chụp sắc nét", "Pin 89% nguyên zin 3uTools xanh"],
    typicalValue: 16800000,
    valueStr: "16.800.000 đ",
    suggestedExchange: "Muốn đổi: ThinkPad T14 / Dell XPS 13 đổi ngang hoặc bù trừ nhẹ",
    condition: "Ngoại hình 98%, viền bóng phẩy nhẹ theo thời gian, màn hình dán cường lực KingKong",
  },
  {
    keywords: ["samsung s24 ultra", "s24 ultra", "galaxy s24", "s24u"],
    category: "android",
    categoryName: "Điện thoại Android",
    deviceIcon: "📱",
    gradientBg: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
    defaultTitle: "Samsung Galaxy S24 Ultra 256GB Titanium Gray Chính Hãng",
    specs: ["Snapdragon 8 Gen 3 for Galaxy", "Màn hình Dynamic AMOLED 2X phẳng 2600 nits", "Camera 200MP Zoom 100x với Galaxy AI", "Bút S-Pen tích hợp bên trong thân máy", "Bảo hành Samsung Care+ dài hạn"],
    typicalValue: 22800000,
    valueStr: "22.800.000 đ",
    suggestedExchange: "Muốn đổi: Laptop Gaming ASUS ROG / Legion 5 hoặc iPhone 15 Pro",
    condition: "Đẹp như mới 99.9%, còn bảo hành chính hãng đến 2026, kèm 2 ốp lưng chính hãng",
  },
  {
    keywords: ["pc gaming", "rtx 3060", "i5 13400f", "dàn pc", "máy tính bàn"],
    category: "pc",
    categoryName: "Máy tính bàn PC",
    deviceIcon: "🖥️",
    gradientBg: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
    defaultTitle: "Dàn PC Gaming Core i5-13400F / RTX 3060Ti 8GB / 32GB RAM",
    specs: ["CPU Intel Core i5-13400F (10 nhân 16 luồng)", "Card đồ họa MSI RTX 3060Ti Gaming X 8GB", "RAM Corsair Vengeance RGB 32GB (2x16GB) 3200MHz", "SSD Kingston NV2 1TB NVMe Gen4", "Nguồn Cooler Master 650W 80 Plus Bronze", "Tản nhiệt nước AIO 240 RGB"],
    typicalValue: 15500000,
    valueStr: "15.500.000 đ",
    suggestedExchange: "Muốn đổi: MacBook Air M1/M2 gọn nhẹ hoặc iPad Pro cho công việc",
    condition: "Linh kiện mua mới tại An Phát còn bảo hành chính hãng 18 tháng, chạy mát ổn định",
  },
  {
    keywords: ["dell xps", "xps 13", "dell xps 13", "xps 9320"],
    category: "laptop",
    categoryName: "Laptop Ultrabook",
    deviceIcon: "💻",
    gradientBg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    defaultTitle: "Dell XPS 13 Plus 9320 Core i7-1360P / 16GB / OLED 3.5K",
    specs: ["Intel Core i7-1360P thế hệ 13 EVO", "RAM 16GB LPDDR5 6000MHz", "SSD 512GB PCIe 4.0", "Màn hình 13.4 inch OLED 3.5K Cảm ứng siêu rực rỡ", "Thanh cảm ứng Touch Bar điện dung hiện đại"],
    typicalValue: 23500000,
    valueStr: "23.500.000 đ",
    suggestedExchange: "Muốn đổi: iPhone 15 Pro hoặc Galaxy Z Fold5 / Z Flip5",
    condition: "Ngoại hình keng 99%, pin 55Whr dùng 7-8 tiếng, bàn phím và touchpad tàng hình cực chất",
  },
  {
    keywords: ["rtx 4060", "pc mini", "itx", "ryzen 7"],
    category: "pc",
    categoryName: "Máy tính mini ITX",
    deviceIcon: "🖥️",
    gradientBg: "linear-gradient(135deg, #7c2d12 0%, #431407 100%)",
    defaultTitle: "PC Gaming Mini ITX Ryzen 7 5700X / RTX 4060 8GB / Case Nhôm Nhỏ Gọn",
    specs: ["AMD Ryzen 7 5700X (8 nhân 16 luồng)", "VGA Zotac RTX 4060 8GB Twin Edge", "RAM 32GB DDR4 3600MHz Kingston Fury", "Vỏ Case nhôm ITX K39 kích thước bằng hộp giày", "Nguồn SFX Corsair SF600 Platinum"],
    typicalValue: 17200000,
    valueStr: "17.200.000 đ",
    suggestedExchange: "Muốn đổi: Laptop văn phòng mỏng nhẹ hoặc iPad Air 5 / iPad Pro",
    condition: "Build tỉ mỉ, đi dây gọn đẹp, bỏ vừa ba lô đi lại tiện lợi, nhiệt độ full load dưới 72 độ",
  },
  {
    keywords: ["thinkpad", "t14", "x1 carbon", "thinkpad x1"],
    category: "laptop",
    categoryName: "Laptop Doanh Nhân",
    deviceIcon: "💻",
    gradientBg: "linear-gradient(135deg, #27272a 0%, #18181b 100%)",
    defaultTitle: "ThinkPad X1 Carbon Gen 10 Core i7-1260P / 16GB / 512GB",
    specs: ["Intel Core i7-1260P vPro", "RAM 16GB LPDDR5", "SSD 512GB OPAL", "Màn 14 inch 2.2K chống chói 100% sRGB", "Bàn phím ThinkPad trứ danh bấm êm nhất phân khúc"],
    typicalValue: 18500000,
    valueStr: "18.500.000 đ",
    suggestedExchange: "Muốn đổi: iPhone 14 Pro Max hoặc MacBook Air M2",
    condition: "Máy tuyển chọn đẹp 98.5%, bàn phím chuẩn US chưa bóng, pin 94%",
  },
];

// Từ khóa nhạy cảm / spam / lừa đảo cần kiểm tra
const BANNED_PATTERNS = [
  /chuyển khoản trước/i,
  /đặt cọc trước/i,
  /cọc trước mới/i,
  /bắn tiền trước/i,
  /ship cod cọc/i,
  /zalo kín/i,
  /inbox kín/i,
  /telegram/i,
  /vào nhóm zalo/i,
  /click link/i,
  /nhấp vào link/i,
  /icloud ẩn/i,
  /máy dính icloud/i,
  /máy trộm/i,
  /máy cắp/i,
  /máy nhặt được/i,
  /bypass không nghe gọi/i,
  /hàng lậu/i,
  /bán tháo/i,
];

// ============================================================================
// 1. CHỨC NĂNG: AI TỰ ĐỘNG TẠO BÀI ĐĂNG (AI POST GENERATOR)
// ============================================================================
export async function generateAIPost(
  prompt: string,
  categoryHint?: "laptop" | "pc" | "iphone" | "android"
): Promise<AIPostGenerationResult> {
  const cleanPrompt = prompt.trim().toLowerCase();

  // Tìm mẫu khớp trong cơ sở tri thức công nghệ
  let matched = TECH_KNOWLEDGE_BASE.find((k) =>
    k.keywords.some((kw) => cleanPrompt.includes(kw))
  );

  // Nếu không khớp từ khóa cụ thể nhưng có gợi ý danh mục
  if (!matched && categoryHint) {
    matched = TECH_KNOWLEDGE_BASE.find((k) => k.category === categoryHint);
  }

  // Nếu vẫn không khớp, chọn ngẫu nhiên một mẫu phù hợp nhất
  if (!matched) {
    if (cleanPrompt.includes("laptop") || cleanPrompt.includes("máy tính xách tay")) {
      matched = TECH_KNOWLEDGE_BASE[0];
    } else if (cleanPrompt.includes("pc") || cleanPrompt.includes("case") || cleanPrompt.includes("máy bàn")) {
      matched = TECH_KNOWLEDGE_BASE[6];
    } else if (cleanPrompt.includes("iphone") || cleanPrompt.includes("apple") || cleanPrompt.includes("ios")) {
      matched = TECH_KNOWLEDGE_BASE[3];
    } else if (cleanPrompt.includes("android") || cleanPrompt.includes("samsung") || cleanPrompt.includes("xiaomi")) {
      matched = TECH_KNOWLEDGE_BASE[5];
    } else {
      // Mặc định chọn MacBook Pro hoặc random
      matched = TECH_KNOWLEDGE_BASE[Math.floor(Math.random() * TECH_KNOWLEDGE_BASE.length)];
    }
  }

  // Tùy biến tiêu đề & thông số nếu người dùng nhập thông tin cụ thể
  let finalTitle = matched.defaultTitle;
  let finalSpecs = [...matched.specs];
  let finalValue = matched.typicalValue;
  let finalCondition = matched.condition;

  // Trích xuất số GB / RAM nếu có trong prompt
  if (cleanPrompt) {
    if (cleanPrompt.includes("256gb") && !finalTitle.includes("256GB")) {
      finalTitle = finalTitle.replace(/\d+GB/, "256GB");
    } else if (cleanPrompt.includes("512gb") && !finalTitle.includes("512GB")) {
      finalTitle = finalTitle.replace(/\d+GB/, "512GB");
    } else if (cleanPrompt.includes("1tb") && !finalTitle.includes("1TB")) {
      finalTitle = finalTitle.replace(/\d+GB/, "1TB");
    }

    // Trích xuất tình trạng nếu nhắc đến pin
    const pinMatch = cleanPrompt.match(/pin\s*(\d+)%/i);
    if (pinMatch) {
      finalSpecs.push(`Pin thực tế: ${pinMatch[1]}%`);
      finalCondition += ` • Pin zin theo máy ${pinMatch[1]}%`;
    }

    // Trích xuất độ mới nếu nhắc đến 99% hay 98%
    const condMatch = cleanPrompt.match(/(9\d)%/);
    if (condMatch) {
      finalCondition = `Ngoại hình đẹp ${condMatch[1]}%, giữ gìn cẩn thận, đã dán bảo vệ`;
    }
  }

  return {
    title: finalTitle,
    category: matched.category,
    categoryName: matched.categoryName,
    type: "Bù trừ",
    specs: finalSpecs,
    estimatedValue: `${finalValue.toLocaleString("vi-VN")} đ`,
    valNumber: finalValue,
    targetDemand: matched.suggestedExchange,
    conditionDesc: finalCondition,
    deviceIcon: matched.deviceIcon,
    gradientBg: matched.gradientBg,
    aiConfidence: 98.8,
    aiSummary: `AI đã nhận diện thiết bị "${matched.defaultTitle}", tự động trích xuất thông số kỹ thuật chuẩn hãng và đề xuất mức giá thị trường tối ưu ${finalValue.toLocaleString("vi-VN")} đ.`,
  };
}

// ============================================================================
// 2. CHỨC NĂNG: AI XÉT DUYỆT & KIỂM ĐỊNH NỘI DUNG (AI MODERATION)
// ============================================================================
export async function moderatePostWithAI(post: {
  title: string;
  category: string;
  estimatedValue: string;
  valNumber?: number;
  specs: string[];
  targetDemand: string;
  conditionDesc?: string;
  ownerName?: string;
}): Promise<AIModerationResult> {
  const textCorpus = [
    post.title,
    post.category,
    post.specs.join(" "),
    post.targetDemand,
    post.conditionDesc || "",
  ].join(" ");

  const checks: ModerationCheckItem[] = [];
  let score = 100;

  // 1. Kiểm tra từ khóa cấm & lừa đảo
  let foundBanned = false;
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(textCorpus)) {
      foundBanned = true;
      score -= 45;
      checks.push({
        name: "Kiểm tra từ khóa an toàn & gian lận",
        passed: false,
        score: -45,
        details: `Phát hiện dấu hiệu rủi ro cao hoặc từ khóa nhạy cảm: "${pattern.source}". Không được yêu cầu cọc hay lôi kéo sang nền tảng ngoài.`,
      });
      break;
    }
  }
  if (!foundBanned) {
    checks.push({
      name: "Kiểm tra từ khóa an toàn & gian lận",
      passed: true,
      score: 30,
      details: "Nội dung bài viết chuẩn mực, không chứa từ khóa lừa đảo, cọc tiền hay link đáng ngờ.",
    });
  }

  // 2. Kiểm tra tính hợp lý của giá trị thiết bị (Price Plausibility)
  const valNum =
    post.valNumber ||
    parseInt(post.estimatedValue.replace(/\D/g, "") || "0", 10);

  let priceOk = true;
  let priceNote = "Mức định giá hoàn toàn phù hợp với mặt bằng thị trường đồ công nghệ cũ.";

  if (valNum < 500000) {
    score -= 30;
    priceOk = false;
    priceNote = `Mức giá quá thấp (${valNum.toLocaleString("vi-VN")} đ) đối với thiết bị công nghệ chính hãng, có nguy cơ là giá ảo để câu tương tác.`;
  } else if (valNum > 150000000) {
    score -= 25;
    priceOk = false;
    priceNote = `Mức giá quá cao (${valNum.toLocaleString("vi-VN")} đ) vượt khung kiểm định an toàn của sàn.`;
  } else if (
    (post.title.toLowerCase().includes("iphone 15 pro max") ||
      post.title.toLowerCase().includes("s24 ultra")) &&
    valNum < 12000000
  ) {
    score -= 35;
    priceOk = false;
    priceNote = `Cảnh báo giá bất thường: Dòng máy cao cấp như ${post.title} nhưng định giá quá thấp (${valNum.toLocaleString("vi-VN")} đ). Nghi ngờ hàng nhái hoặc lừa đảo.`;
  }

  checks.push({
    name: "Phân tích giá thị trường (AI Price Valuation)",
    passed: priceOk,
    score: priceOk ? 25 : -25,
    details: priceNote,
  });

  // 3. Kiểm tra tính đầy đủ của thông số kỹ thuật (Specs Completeness)
  const hasSpecs = post.specs && post.specs.length >= 2;
  const specText = post.specs.join(" ").toLowerCase();
  const hasHardwareDetails =
    specText.includes("ram") ||
    specText.includes("ssd") ||
    specText.includes("pin") ||
    specText.includes("chip") ||
    specText.includes("cpu") ||
    specText.includes("vga") ||
    specText.includes("màn");

  if (!hasSpecs || !hasHardwareDetails) {
    score -= 20;
    checks.push({
      name: "Xác thực thông số kỹ thuật (Hardware Specs)",
      passed: false,
      score: -20,
      details: "Bài viết còn thiếu thông số kỹ thuật cơ bản (RAM, ổ cứng, tình trạng pin/ngoại hình).",
    });
  } else {
    checks.push({
      name: "Xác thực thông số kỹ thuật (Hardware Specs)",
      passed: true,
      score: 25,
      details: `Thông số đầy đủ (${post.specs.length} mục chi tiết), có thông tin cấu hình phần cứng rõ ràng.`,
    });
  }

  // 4. Kiểm tra nhu cầu trao đổi (Exchange Demand Clarity)
  const hasDemand = post.targetDemand && post.targetDemand.trim().length >= 10;
  if (!hasDemand) {
    score -= 10;
    checks.push({
      name: "Độ rõ ràng của nhu cầu trao đổi",
      passed: false,
      score: -10,
      details: "Nhu cầu trao đổi quá ngắn hoặc chung chung. Nên nêu rõ muốn đổi máy gì.",
    });
  } else {
    checks.push({
      name: "Độ rõ ràng của nhu cầu trao đổi",
      passed: true,
      score: 20,
      details: "Nhu cầu giao lưu và tiêu chí bù trừ được trình bày rõ ràng, minh bạch.",
    });
  }

  // Chuẩn hóa điểm 0 - 100
  score = Math.max(10, Math.min(99.5, score));

  // Kết luận xét duyệt
  let verdict: "approved" | "needs_review" | "rejected" = "approved";
  let safetyLevel: "high" | "medium" | "low" = "high";
  let suggestedAction = "Duyệt ngay lên sàn giao dịch";

  if (score >= 88) {
    verdict = "approved";
    safetyLevel = "high";
    suggestedAction = "Đủ điều kiện AI Tự Động Duyệt (Auto-Approval) lập tức lên sàn";
  } else if (score >= 60) {
    verdict = "needs_review";
    safetyLevel = "medium";
    suggestedAction = "Cần chuyển cho Điều phối viên/Admin rà soát trước khi xuất bản";
  } else {
    verdict = "rejected";
    safetyLevel = "low";
    suggestedAction = "Từ chối bài đăng do vi phạm chính sách minh bạch hoặc phát hiện rủi ro";
  }

  // Trích xuất thông số tóm tắt
  const detectedSpecs = post.specs.slice(0, 4);

  return {
    score: Number(score.toFixed(1)),
    verdict,
    summary:
      verdict === "approved"
        ? `Đạt chuẩn kiểm duyệt AI (${score.toFixed(1)}%). Thiết bị hợp lệ, giá chuẩn, thông số minh bạch.`
        : verdict === "needs_review"
        ? `Cần xem xét thêm (${score.toFixed(1)}%). Có một số điểm cần xác minh như giá hoặc mô tả cấu hình.`
        : `Không đạt tiêu chuẩn kiểm duyệt (${score.toFixed(1)}%). Phát hiện rủi ro an toàn nội dung.`,
    safetyLevel,
    suggestedAction,
    checks,
    detectedSpecs,
    priceAssessment: priceNote,
  };
}

// ============================================================================
// 3. CHỨC NĂNG: AI TÌM KIẾM THÔNG MINH & TƯ VẤN SẢN PHẨM (AI SMART SEARCH)
// ============================================================================
export async function searchWithAI(
  query: string,
  items: ExchangeItem[]
): Promise<AISearchResult> {
  const q = query.toLowerCase().trim();

  // 1. Nhận diện danh mục
  let categoryFilter: string | undefined = undefined;
  if (q.includes("macbook") || q.includes("laptop") || q.includes("máy xách tay") || q.includes("ultrabook")) {
    categoryFilter = "laptop";
  } else if (q.includes("pc") || q.includes("máy bàn") || q.includes("case") || q.includes("gaming desktop")) {
    categoryFilter = "pc";
  } else if (q.includes("iphone") || q.includes("ios") || q.includes("apple phone")) {
    categoryFilter = "iphone";
  } else if (q.includes("android") || q.includes("samsung") || q.includes("galaxy") || q.includes("xiaomi")) {
    categoryFilter = "android";
  }

  // 2. Nhận diện khoảng giá (Price budget)
  let maxPrice: number | undefined = undefined;
  let minPrice: number | undefined = undefined;

  // Pattern: "dưới 20 triệu", "dưới 20tr", "< 25tr"
  const underMatch = q.match(/(dưới|<|tam|tầm|khoảng)\s*(\d+)\s*(triệu|tr)/i);
  if (underMatch) {
    maxPrice = parseInt(underMatch[2], 10) * 1000000;
  }

  // Pattern: "trên 15 triệu", "> 15tr"
  const aboveMatch = q.match(/(trên|>)\s*(\d+)\s*(triệu|tr)/i);
  if (aboveMatch) {
    minPrice = parseInt(aboveMatch[2], 10) * 1000000;
  }

  // Pattern: "từ 15 đến 25 triệu"
  const rangeMatch = q.match(/từ\s*(\d+)\s*(đến|-)\s*(\d+)\s*(triệu|tr)/i);
  if (rangeMatch) {
    minPrice = parseInt(rangeMatch[1], 10) * 1000000;
    maxPrice = parseInt(rangeMatch[3], 10) * 1000000;
  }

  // 3. Nhận diện mục đích sử dụng (Intent)
  const intents: string[] = [];
  if (q.includes("game") || q.includes("chơi mượt") || q.includes("gta") || q.includes("valorant") || q.includes("fps")) {
    intents.push("gaming");
  }
  if (q.includes("đồ họa") || q.includes("edit video") || q.includes("photoshop") || q.includes("premiere") || q.includes("render")) {
    intents.push("creative");
  }
  if (q.includes("lập trình") || q.includes("code") || q.includes("developer") || q.includes("dev")) {
    intents.push("coding");
  }
  if (q.includes("văn phòng") || q.includes("mỏng nhẹ") || q.includes("học tập") || q.includes("sinh viên")) {
    intents.push("office");
  }
  if (q.includes("chụp ảnh") || q.includes("quay phim") || q.includes("camera") || q.includes("sống ảo")) {
    intents.push("camera");
  }
  if (q.includes("pin trâu") || q.includes("pin khỏe") || q.includes("pin lâu")) {
    intents.push("battery");
  }

  // 4. Nhận diện nhu cầu trao đổi hai chiều
  let targetTrade: string | undefined = undefined;
  if (q.includes("đổi iphone") || q.includes("lấy iphone")) targetTrade = "iPhone";
  else if (q.includes("đổi laptop") || q.includes("lấy laptop") || q.includes("lấy macbook")) targetTrade = "Laptop";
  else if (q.includes("đổi pc") || q.includes("lấy pc")) targetTrade = "PC";
  else if (q.includes("đổi android") || q.includes("lấy samsung")) targetTrade = "Android";

  // 5. Chấm điểm sự phù hợp cho từng sản phẩm
  const scoredItems: AISearchMatch[] = items.map((item) => {
    let matchScore = 50; // base score
    const reasons: string[] = [];
    const highlights: string[] = [];

    const itemFullText = [
      item.title,
      item.categoryName,
      item.category,
      item.specs.join(" "),
      item.targetDemand,
    ].join(" ").toLowerCase();

    // Khớp danh mục
    if (categoryFilter) {
      if (item.category === categoryFilter) {
        matchScore += 25;
        reasons.push(`Thuộc đúng danh mục ${item.categoryName}`);
      } else {
        matchScore -= 20;
      }
    }

    // Khớp khoảng giá
    if (maxPrice !== undefined) {
      if (item.valNumber <= maxPrice) {
        matchScore += 15;
        reasons.push(`Giá ${item.estimatedValue} nằm gọn trong ngân sách của bạn (≤ ${(maxPrice / 1000000).toFixed(0)} triệu)`);
      } else if (item.valNumber <= maxPrice * 1.15) {
        matchScore += 5;
        reasons.push(`Giá ${item.estimatedValue} chỉ nhỉnh hơn một chút so với ngân sách đề xuất`);
      } else {
        matchScore -= 25;
      }
    }

    if (minPrice !== undefined) {
      if (item.valNumber >= minPrice) {
        matchScore += 10;
      } else {
        matchScore -= 15;
      }
    }

    // Khớp mục đích sử dụng
    if (intents.includes("gaming")) {
      if (itemFullText.includes("rtx") || itemFullText.includes("gaming") || itemFullText.includes("vga")) {
        matchScore += 25;
        reasons.push("Trang bị card đồ họa mạnh mẽ, sẵn sàng gánh mượt các tựa game nặng");
        highlights.push("GPU Gaming chuyên dụng");
      }
    }
    if (intents.includes("coding") || intents.includes("creative")) {
      if (itemFullText.includes("m2") || itemFullText.includes("m1") || itemFullText.includes("i7") || itemFullText.includes("16gb") || itemFullText.includes("32gb")) {
        matchScore += 20;
        reasons.push("Cấu hình CPU nhiều nhân và RAM từ 16GB trở lên tối ưu cho lập trình & đồ họa");
        highlights.push("RAM/CPU hiệu năng cao");
      }
    }
    if (intents.includes("office")) {
      if (itemFullText.includes("mỏng nhẹ") || itemFullText.includes("air") || itemFullText.includes("xps") || itemFullText.includes("ultrabook")) {
        matchScore += 20;
        reasons.push("Thiết kế mỏng nhẹ tinh tế, thời lượng pin ấn tượng thích hợp mang đi học, đi làm");
        highlights.push("Mỏng nhẹ cơ động");
      }
    }
    if (intents.includes("camera")) {
      if (itemFullText.includes("pro max") || itemFullText.includes("ultra") || itemFullText.includes("200mp") || itemFullText.includes("camera")) {
        matchScore += 25;
        reasons.push("Cụm camera đỉnh cao hàng đầu hiện nay, chụp zoom quang học và quay video sắc nét");
        highlights.push("Camera chuyên nghiệp");
      }
    }

    // Khớp từ khóa tự do
    const queryWords = q.split(/\s+/).filter((w) => w.length >= 2);
    let matchedWords = 0;
    for (const word of queryWords) {
      if (itemFullText.includes(word)) {
        matchedWords++;
      }
    }
    if (matchedWords > 0) {
      matchScore += Math.min(20, matchedWords * 5);
    }

    // Khớp nhu cầu đổi thiết bị của chủ bài đăng
    if (targetTrade) {
      if (item.targetDemand.toLowerCase().includes(targetTrade.toLowerCase())) {
        matchScore += 20;
        reasons.push(`Chủ sở hữu (${item.ownerName}) đang rất muốn đổi lấy ${targetTrade} của bạn!`);
        highlights.push(`Đổi ưu tiên: ${targetTrade}`);
      }
    }

    matchScore = Math.max(15, Math.min(99, matchScore));

    return {
      item,
      matchScore,
      matchReason:
        reasons.length > 0
          ? reasons.join(" • ")
          : "Sản phẩm công nghệ cấu hình tốt, phù hợp cân nhắc trong tầm giá",
      recommendation:
        matchScore >= 85
          ? "🌟 Lựa chọn hàng đầu được AI đánh giá khớp nhất"
          : matchScore >= 70
          ? "👍 Lựa chọn thay thế rất đáng tiền"
          : "Cân nhắc thêm nếu linh hoạt về nhu cầu",
      highlightSpecs: highlights.length > 0 ? highlights : item.specs.slice(0, 2),
    };
  });

  // Sắp xếp theo điểm số giảm dần
  scoredItems.sort((a, b) => b.matchScore - a.matchScore);

  // Lọc lấy các kết quả có điểm >= 40 (tối đa 6 sản phẩm)
  const topMatches = scoredItems.filter((m) => m.matchScore >= 40).slice(0, 6);

  // Sinh lời tư vấn tổng quan
  let advice = "";
  if (topMatches.length === 0) {
    advice = `AI đã phân tích truy vấn "${query}" nhưng chưa tìm thấy thiết bị khớp hoàn toàn. Bạn có thể thử nới lỏng ngân sách hoặc tìm theo tên dòng máy như "MacBook", "iPhone 15", "PC Gaming RTX".`;
  } else {
    const best = topMatches[0];
    advice = `AI đã tìm thấy ${topMatches.length} thiết bị phù hợp nhất cho bạn! Trong đó, chiếc **${best.item.title}** (${best.item.estimatedValue}) là đề xuất hàng đầu với độ tương thích **${best.matchScore}%** nhờ ${best.matchReason.toLowerCase()}.`;
  }

  return {
    matches: topMatches,
    aiAdvice: advice,
    detectedCriteria: {
      category: categoryFilter,
      maxPrice,
      minPrice,
      intent: intents.join(", "),
      targetTrade,
      keywords: q.split(/\s+/).filter((w) => w.length >= 3),
    },
  };
}

