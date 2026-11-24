import { Body, Controller, Injectable, Module, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Public } from '../common/auth';
import { DatabaseService } from '../db/database.service';

export class GeneratePostDto {
  @IsString()
  @MinLength(2)
  prompt!: string;
}

export class ModeratePostDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valNumber?: number;

  @IsString()
  @IsOptional()
  targetDemand?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specs?: string[];

  @IsString()
  @IsOptional()
  conditionDesc?: string;
}

export class AiSearchDto {
  @IsString()
  @MinLength(1)
  query!: string;
}

const TECH_KB = [
  {
    keywords: ['macbook pro 14', 'm2 pro', 'macbook m2', 'mac pro 14'],
    category: 'laptop',
    categoryName: 'Laptop Apple',
    deviceIcon: '💻',
    gradientBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    defaultTitle: 'MacBook Pro 14 M2 Pro (16GB / 512GB SSD) Space Gray',
    specs: ['Apple M2 Pro (10-Core CPU, 16-Core GPU)', 'RAM 16GB Unified Memory', 'SSD 512GB', 'Màn hình 14.2 inch Liquid Retina XDR 120Hz', 'Pin 95%'],
    typicalValue: 28500000,
    suggestedExchange: 'Muốn đổi: iPhone 15 Pro Max hoặc bù trừ dàn PC Gaming tương đương',
    condition: 'Ngoại hình 98.5%, không cấn móp, đầy đủ củ sạc MagSafe 3 67W chính hãng',
  },
  {
    keywords: ['macbook air m2', 'mac air m2', 'air m2'],
    category: 'laptop',
    categoryName: 'Laptop Apple',
    deviceIcon: '💻',
    gradientBg: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    defaultTitle: 'MacBook Air M2 13.6 inch Midnight (8GB / 256GB SSD)',
    specs: ['Chip Apple M2', 'RAM 8GB Unified', 'SSD 256GB NVMe', 'Màn hình Liquid Retina 500 nits', 'Pin 93%'],
    typicalValue: 19500000,
    suggestedExchange: 'Muốn đổi: iPad Pro M1/M2 kèm bàn phím hoặc iPhone 14 Pro Max',
    condition: 'Đẹp 99% keng, màu Midnight sang trọng, dán bảo vệ full thân máy',
  },
  {
    keywords: ['macbook air m1', 'mac m1', 'air m1'],
    category: 'laptop',
    categoryName: 'Laptop Apple',
    deviceIcon: '💻',
    gradientBg: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    defaultTitle: 'MacBook Air M1 2020 Space Gray (8GB / 256GB)',
    specs: ['Apple M1 8 nhân', 'RAM 8GB', 'SSD 256GB', 'Màn Retina 13.3 inch DCI-P3', 'Pin 91%'],
    typicalValue: 13800000,
    suggestedExchange: 'Muốn đổi: Laptop Windows mỏng nhẹ hoặc điện thoại Android cao cấp',
    condition: 'Nguyên bản 100% chưa qua sửa chữa, bàn phím gõ êm',
  },
  {
    keywords: ['iphone 15 pro max', 'ip 15 prm', '15 pro max', '15prm'],
    category: 'iphone',
    categoryName: 'Điện thoại iOS',
    deviceIcon: '📱',
    gradientBg: 'linear-gradient(135deg, #4c1d95 0%, #581c87 100%)',
    defaultTitle: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên VN/A',
    specs: ['Chip Apple A17 Pro 3nm', 'Bộ nhớ 256GB', 'Camera Tele 5x', 'Pin 96% nguyên zin áp suất'],
    typicalValue: 26500000,
    suggestedExchange: 'Muốn đổi: MacBook Pro M2/M3 hoặc Samsung S24 Ultra bù trừ',
    condition: 'Đẹp keng 99%, fullbox cáp zin, còn bảo hành chính hãng',
  },
  {
    keywords: ['iphone 14 pro', 'ip 14', '14 pro max', '14prm'],
    category: 'iphone',
    categoryName: 'Điện thoại iOS',
    deviceIcon: '📱',
    gradientBg: 'linear-gradient(135deg, #5b21b6 0%, #3b0764 100%)',
    defaultTitle: 'iPhone 14 Pro Max 128GB Tím Deep Purple VN/A',
    specs: ['Chip Apple A16 Bionic', 'Màn 120Hz Dynamic Island', 'Camera 48MP', 'Pin 89%'],
    typicalValue: 18500000,
    suggestedExchange: 'Muốn đổi: Laptop mỏng nhẹ văn phòng hoặc iPad Pro',
    condition: 'Ngoại hình 98%, màn zin chưa ép kính, Face ID nhạy',
  },
  {
    keywords: ['s24 ultra', 'samsung s24', 'galaxy s24'],
    category: 'android',
    categoryName: 'Điện thoại Android',
    deviceIcon: '📱',
    gradientBg: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
    defaultTitle: 'Samsung Galaxy S24 Ultra 12GB/256GB Titan Xám SSVN',
    specs: ['Snapdragon 8 Gen 3 for Galaxy', 'RAM 12GB / 256GB', 'Bút S-Pen tích hợp', 'Camera Zoom 100x Galaxy AI'],
    typicalValue: 21500000,
    suggestedExchange: 'Muốn đổi: iPhone 15 Pro / 15 Pro Max hoặc MacBook Air M2',
    condition: 'Máy đẹp 99% như mới, chính hãng SSVN 2 SIM',
  },
  {
    keywords: ['pc gaming', 'rtx 4060', 'rtx 3080', 'rtx 3060', 'case pc'],
    category: 'pc',
    categoryName: 'Máy tính bàn & PC Gaming',
    deviceIcon: '🖥️',
    gradientBg: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
    defaultTitle: 'Case PC Gaming Core i5-13400F / RTX 4060 8GB / RAM 32GB',
    specs: ['Intel Core i5-13400F (10 nhân 16 luồng)', 'VGA RTX 4060 8GB GDDR6', 'RAM 32GB DDR4 3200MHz', 'SSD NVMe 1TB Gen4'],
    typicalValue: 20500000,
    suggestedExchange: 'Muốn đổi: Laptop Gaming di động hoặc MacBook Pro',
    condition: 'Linh kiện còn bảo hành chính hãng 24 tháng, vệ sinh sạch sẽ',
  },
];

const SPAM_PATTERNS = [
  'lừa đảo',
  'chuyển khoản trước',
  'cọc trước 100%',
  'hack',
  'crack',
  'cờ bạc',
  'vay tiền',
  'bán thận',
  'test spam',
  'zalo 09',
];

@Injectable()
export class AiService {
  constructor(private db: DatabaseService) {}

  generatePost(prompt: string) {
    const lower = prompt.toLowerCase();
    const matched = TECH_KB.find((item) => item.keywords.some((k) => lower.includes(k)));

    const category =
      matched?.category ||
      (lower.includes('iphone') || lower.includes('ipad')
        ? 'iphone'
        : lower.includes('samsung') || lower.includes('xiaomi') || lower.includes('android') || lower.includes('pixel')
        ? 'android'
        : lower.includes('pc') || lower.includes('case') || lower.includes('rtx') || lower.includes('gtx')
        ? 'pc'
        : 'laptop');

    const categoryNameMap: Record<string, string> = {
      laptop: 'Laptop & MacBook',
      pc: 'Máy tính bàn & PC Gaming',
      iphone: 'Điện thoại iOS',
      android: 'Điện thoại Android',
    };

    const valNumber = matched?.typicalValue || 15000000;
    const estimatedValue = new Intl.NumberFormat('vi-VN').format(valNumber) + ' đ';

    return {
      title: matched ? matched.defaultTitle : prompt.trim().slice(0, 90),
      category,
      categoryName: matched?.categoryName || categoryNameMap[category],
      type: lower.includes('đổi ngang') ? 'Đổi ngang' : 'Bù trừ',
      specs: matched?.specs || ['Tình trạng hoạt động ổn định', 'Nguyên bản chưa sửa chữa', 'Bao test tại CEP Care Hub'],
      estimatedValue,
      valNumber,
      targetDemand: matched?.suggestedExchange || 'Muốn đổi sang thiết bị công nghệ tương đương hoặc bù trừ hợp lý',
      conditionDesc: matched?.condition || 'Ngoại hình đẹp, chức năng đầy đủ, ưu tiên giao dịch trực tiếp qua CEP Care',
      deviceIcon: matched?.deviceIcon || (category === 'pc' ? '🖥️' : category === 'laptop' ? '💻' : '📱'),
      gradientBg: matched?.gradientBg || 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
      aiConfidence: matched ? 96 : 86,
      aiSummary: matched
        ? `AI nhận diện đúng dòng ${matched.defaultTitle} và đề xuất mức định giá tham khảo ${estimatedValue}.`
        : 'AI đã chuẩn hóa thông tin bài đăng và gợi ý cấu trúc trao đổi an toàn.',
    };
  }

  moderatePost(input: {
    title: string;
    category?: string;
    valNumber?: number;
    targetDemand?: string;
    specs?: string[];
    conditionDesc?: string;
  }) {
    const fullText = `${input.title} ${input.targetDemand || ''} ${input.conditionDesc || ''} ${(input.specs || []).join(' ')}`.toLowerCase();
    const checks: Array<{ name: string; passed: boolean; score: number; details: string }> = [];

    const foundSpam = SPAM_PATTERNS.filter((w) => fullText.includes(w));
    const safetyPassed = foundSpam.length === 0;
    checks.push({
      name: 'Kiểm tra an toàn & chống lừa đảo',
      passed: safetyPassed,
      score: safetyPassed ? 35 : 0,
      details: safetyPassed ? 'Không phát hiện từ khóa lừa đảo, spam hoặc giao dịch ngoài sàn.' : `Phát hiện từ khóa rủi ro: ${foundSpam.join(', ')}.`,
    });

    const titleOk = input.title.trim().length >= 10;
    checks.push({
      name: 'Chất lượng tiêu đề thiết bị',
      passed: titleOk,
      score: titleOk ? 20 : 8,
      details: titleOk ? 'Tiêu đề rõ ràng, có tên dòng thiết bị.' : 'Tiêu đề hơi ngắn, nên bổ sung đời máy / cấu hình.',
    });

    const price = Number(input.valNumber || 0);
    const priceOk = price >= 500000 && price <= 250000000;
    checks.push({
      name: 'Tính hợp lý của định giá',
      passed: priceOk,
      score: priceOk ? 20 : 5,
      details: priceOk ? 'Mức định giá nằm trong biên độ thị trường thiết bị công nghệ.' : 'Giá trị ước tính bất thường, cần kiểm tra lại.',
    });

    const specsOk = (input.specs || []).filter(Boolean).length >= 2 || (input.conditionDesc || '').trim().length >= 15;
    checks.push({
      name: 'Độ đầy đủ thông số & mô tả',
      passed: specsOk,
      score: specsOk ? 15 : 6,
      details: specsOk ? 'Thông số kỹ thuật đầy đủ giúp người đổi dễ đối chiếu.' : 'Thiếu thông số kỹ thuật chi tiết.',
    });

    const demandOk = (input.targetDemand || '').trim().length >= 6;
    checks.push({
      name: 'Nhu cầu trao đổi rõ ràng',
      passed: demandOk,
      score: demandOk ? 10 : 4,
      details: demandOk ? 'Đã nêu rõ thiết bị mong muốn đổi.' : 'Nên ghi rõ dòng máy bạn muốn đổi sang.',
    });

    const score = Math.min(100, checks.reduce((sum, c) => sum + c.score, 0));
    const verdict: 'approved' | 'needs_review' | 'rejected' =
      !safetyPassed || score < 55 ? 'rejected' : score >= 88 ? 'approved' : 'needs_review';

    return {
      score,
      verdict,
      safetyLevel: verdict === 'approved' ? 'high' : verdict === 'needs_review' ? 'medium' : 'low',
      summary:
        verdict === 'approved'
          ? `Đạt chuẩn tin cậy AI (${score}/100) — Đủ điều kiện tự động phê duyệt lên sàn.`
          : verdict === 'needs_review'
          ? `Cần quản trị viên kiểm duyệt thêm (${score}/100) — Bổ sung thêm thông số để đạt chuẩn tự duyệt.`
          : `Từ chối tự động (${score}/100) — Phát hiện nội dung không hợp lệ hoặc rủi ro an toàn.`,
      suggestedAction:
        verdict === 'approved' ? 'Tự động duyệt ngay' : verdict === 'needs_review' ? 'Chuyển hàng đợi duyệt thủ công' : 'Từ chối tin đăng',
      checks,
      priceAssessment: priceOk
        ? `Định giá ${new Intl.NumberFormat('vi-VN').format(price)} đ hợp lý với phân khúc ${input.category || 'thiết bị'}.`
        : 'Cần xác minh lại mức giá thị trường.',
    };
  }

  async semanticSearch(query: string) {
    const q = query.toLowerCase().trim();
    const rows = await this.db.query(
      `SELECT l.id, l.title, l.description, l.device_icon AS "deviceIcon", c.code AS category, c.name AS "categoryName",
              l.specs, l.estimated_value AS "valNumber", l.exchange_type AS "exchangeType", l.target_demand AS "targetDemand",
              l.location, l.ai_confidence AS "aiConfidence", u.id AS "ownerId", u.full_name AS "ownerName",
              COALESCE((SELECT ROUND(AVG(rv.rating)::numeric,1) FROM reviews rv JOIN listings lx ON lx.id=rv.listing_id WHERE lx.owner_id=u.id),0) AS rating,
              (SELECT COUNT(*)::int FROM trades t WHERE t.listing_id=l.id AND t.status='completed') AS "dealCount",
              (SELECT COUNT(*)::int FROM reviews rv WHERE rv.listing_id=l.id) AS "reviewCount",
              COALESCE((SELECT json_agg(json_build_object('id',im.id,'url',im.image_url,'sortOrder',im.sort_order) ORDER BY im.sort_order) FROM listing_images im WHERE im.listing_id=l.id),'[]'::json) AS images
       FROM listings l
       JOIN categories c ON c.id = l.category_id
       JOIN users u ON u.id = l.owner_id
       WHERE l.deleted_at IS NULL AND l.status = 'approved'
       ORDER BY l.created_at DESC LIMIT 50`
    );

    let detectedCategory: string | undefined;
    if (q.includes('laptop') || q.includes('macbook') || q.includes('mỏng nhẹ')) detectedCategory = 'laptop';
    else if (q.includes('pc') || q.includes('case') || q.includes('rtx') || q.includes('gta')) detectedCategory = 'pc';
    else if (q.includes('iphone') || q.includes('ipad') || q.includes('ios')) detectedCategory = 'iphone';
    else if (q.includes('android') || q.includes('samsung') || q.includes('xiaomi') || q.includes('galaxy')) detectedCategory = 'android';

    const priceMatch = q.match(/(\d+)\s*(triệu|trieu|tr|củ|cu)/i);
    const maxPrice = priceMatch ? Number(priceMatch[1]) * 1000000 : undefined;

    const keywords = q.split(/\s+/).filter((w) => w.length >= 2);
    const matches = rows.rows
      .map((r: any) => {
        const specsList = Array.isArray(r.specs) ? r.specs : Object.entries(r.specs || {}).map(([k, v]) => `${k}: ${v}`);
        const haystack = `${r.title} ${r.description} ${r.categoryName} ${r.targetDemand} ${specsList.join(' ')}`.toLowerCase();
        let score = 45;
        const reasons: string[] = [];

        if (detectedCategory && r.category === detectedCategory) {
          score += 25;
          reasons.push(`Khớp danh mục ${r.categoryName}`);
        }
        const valNumber = Number(r.valNumber || 0);
        if (maxPrice && valNumber > 0 && valNumber <= maxPrice) {
          score += 15;
          reasons.push(`Trong ngân sách ≤ ${(maxPrice / 1000000).toFixed(0)} triệu`);
        }
        const matchedWords = keywords.filter((kw) => haystack.includes(kw));
        score += Math.min(20, matchedWords.length * 5);
        if (matchedWords.length > 0) reasons.push(`Khớp từ khóa: ${matchedWords.slice(0, 3).join(', ')}`);

        return {
          item: {
            ...r,
            valNumber,
            estimatedValue: new Intl.NumberFormat('vi-VN').format(valNumber) + ' đ',
            type: r.exchangeType === 'even' ? 'Đổi ngang' : 'Bù trừ',
            specs: specsList,
            gradientBg:
              ({
                laptop: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                pc: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
                iphone: 'linear-gradient(135deg, #4c1d95 0%, #581c87 100%)',
                android: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
              } as Record<string, string>)[r.category] || 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
            rating: Number(r.rating || 0),
          },
          matchScore: Math.min(99, score),
          matchReason: reasons.join(' • ') || 'Gợi ý tương đồng theo hệ sinh thái thiết bị',
          highlightSpecs: specsList.slice(0, 3),
        };
      })
      .filter((m) => m.matchScore >= 55)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 12);

    return {
      matches,
      aiAdvice:
        matches.length > 0
          ? `AI đã phân tích ${rows.rows.length} tin đăng đã duyệt trong cơ sở dữ liệu và chọn ra ${matches.length} thiết bị phù hợp nhất với yêu cầu "${query}".`
          : `Hiện chưa có tin đăng nào khớp hoàn toàn với "${query}". Bạn có thể nới rộng ngân sách hoặc xem tất cả thiết bị đang chờ đổi.`,
      detectedCriteria: {
        category: detectedCategory,
        maxPrice,
        intent: q.includes('gaming') || q.includes('gta') ? 'Chơi game / Hiệu năng cao' : q.includes('đồ họa') ? 'Thiết kế đồ họa' : 'Trao đổi nâng cấp',
        keywords: keywords.slice(0, 6),
      },
    };
  }
}

@ApiTags('AI')
@Controller('ai')
class AiController {
  constructor(private ai: AiService) {}

  @Public()
  @Post('generate-post')
  generatePost(@Body() dto: GeneratePostDto) {
    return this.ai.generatePost(dto.prompt);
  }

  @Public()
  @Post('moderate')
  moderate(@Body() dto: ModeratePostDto) {
    return this.ai.moderatePost(dto);
  }

  @Public()
  @Post('search')
  search(@Body() dto: AiSearchDto) {
    return this.ai.semanticSearch(dto.query);
  }
}

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

