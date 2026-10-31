import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  X,
} from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface EventsPageProps {
  lang: 'VI' | 'EN';
  isPhone: boolean;
  onBackHome: () => void;
}

type EventYear = '2024' | '2025' | '2026';

interface YearEventItem {
  id: string;
  date: string;
  typeVI: string;
  typeEN: string;
  titleVI: string;
  titleEN: string;
  summaryVI: string;
  summaryEN: string;
  bannerImg: string;
  accentColor: 'cyan' | 'fuchsia' | 'amber';
  linkUrl?: string;
}

interface YearArchiveData {
  year: EventYear;
  codenameVI: string;
  codenameEN: string;
  subtitleVI: string;
  subtitleEN: string;
  descVI: string;
  descEN: string;
  coverImg: string;
  badgeTextVI: string;
  badgeTextEN: string;
  glowClass: string;
  borderClass: string;
  accentHex: string;
  events: YearEventItem[];
}

const YEAR_ARCHIVES: YearArchiveData[] = [
  {
    year: '2024',
    codenameVI: 'KHỞI NGUYÊN ÁNH SAO',
    codenameEN: 'DAWN OF STARLIGHT',
    subtitleVI: 'Hành Trình Đầu Tiên Tại Thành Phố Linkon',
    subtitleEN: 'First Resonance in Linkon City',
    descVI:
      'Nơi cuộc gặp gỡ định mệnh bắt đầu và mở ra những rung động đầu tiên',
    descEN:
      'Where our destined encounter began and awakened the very first heartbeats.',
    coverImg: '/assets/aistudio/anec1_1db1b7ec.webp',
    badgeTextVI: '13 SỰ KIỆN',
    badgeTextEN: '13 EVENTS',
    glowClass: 'from-cyan-500/30 via-purple-900/40 to-[#090414]/95',
    borderClass: 'border-cyan-400/50 hover:border-cyan-300',
    accentHex: '#22d3ee',
    events: [
      {
        id: '2023-0',
        date: '2/11/2023',
        typeVI: 'MỞ ĐĂNG KÝ TRƯỚC',
        typeEN: 'PRE-ORDER',
        titleVI: 'Pre-Order Starts! — Mở Đăng Ký Trước Toàn Cầu',
        titleEN: 'Pre-Order Starts!',
        summaryVI:
          'Chính thức mở cổng đăng ký trước toàn cầu cho Love and Deepspace. Thợ Săn Không Gian Sâu tại Thành phố Linkon có thể ghi danh sớm để mở khóa các phần thưởng cột mốc đặc biệt khi trò chơi ra mắt.',
        summaryEN:
          'Global pre-registration for Love and Deepspace officially opens. Deepspace Hunters across Linkon City can sign up early to unlock exclusive milestone rewards at launch.',
        bannerImg: '/assets/aistudio/2023-0_bf6464f9.webp',
        accentColor: 'amber',
      },
      {
        id: '2023-1',
        date: '15/12/2023',
        typeVI: 'CLOSED BETA',
        typeEN: 'CLOSED BETA',
        titleVI: 'Closed Beta Test Starts — Khởi Động Thử Nghiệm Giới Hạn',
        titleEN: 'Closed Beta Test Starts',
        summaryVI:
          'Đợt thử nghiệm giới hạn Closed Beta chính thức khởi động, hé lộ những chương cốt truyện đầu tiên tại Thành phố Linkon và cuộc chạm trán định mệnh cùng Xavier.',
        summaryEN:
          'The limited Closed Beta Test officially begins, unveiling the opening chapters in Linkon City and the destined first encounter with Xavier.',
        bannerImg: '/assets/aistudio/2023-1_3e7ad1aa.webp',
        accentColor: 'cyan',
      },
      {
        id: '2023-2',
        date: '29/12/2023',
        typeVI: 'CỘT MỐC ĐĂNG KÝ',
        typeEN: 'PRE-REGISTRATION',
        titleVI: '10,000,000 Pre-Registrations Achieved — Đạt Mốc 10 Triệu Đăng Ký',
        titleEN: '10,000,000 Pre-Registrations Achieved',
        summaryVI:
          'Cột mốc 10.000.000 Thợ Săn đăng ký trước trên toàn cầu đã hoàn thành, mở khóa toàn bộ phần thưởng khởi hành, vé Ước Nguyện và thẻ ký ức kỷ niệm.',
        summaryEN:
          'The milestone of 10,000,000 global pre-registrations is achieved, unlocking all departure rewards, Wish tickets, and commemorative Memory rewards.',
        bannerImg: '/assets/aistudio/2023-2_36069f06.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2024-1',
        date: '18/1/2024',
        typeVI: 'RA MẮT CHÍNH THỨC',
        typeEN: 'OFFICIAL RELEASE',
        titleVI: 'All About The Official Release — Chính Thức Ra Mắt Toàn Cầu',
        titleEN: 'All About The Official Release',
        summaryVI:
          'Love and Deepspace chính thức phát hành toàn cầu vào ngày 18/01/2024. Mở màn hành trình Deepspace Hunter và sát cánh chiến đấu cùng Xavier bằng Evol Ánh Sáng.',
        summaryEN:
          'Love and Deepspace officially launches worldwide on January 18, 2024. Embark on your journey as a Deepspace Hunter and fight alongside Xavier wielding his Light Evol.',
        bannerImg: '/assets/aistudio/2024-1_a14d6c79.webp',
        accentColor: 'amber',
      },
      {
        id: '2024-2',
        date: '18/1/2024 - 4/2/2024',
        typeVI: 'SỰ KIỆN GIỚI HẠN',
        typeEN: 'LIMITED EVENT',
        titleVI: 'Heartbeat Ripples — Rung Động Đầu Tiên',
        titleEN: 'Heartbeat Ripples',
        summaryVI:
          'Sự kiện giới hạn mở màn kỷ niệm ra mắt chính thức với ký ức 5 sao đầu tiên của Xavier: Heartstring Symphony — giai điệu violon ngân vang trong đêm tuyết rơi.',
        summaryEN:
          "Launch celebration limited event featuring Xavier's debut limited 5-Star Memory: Heartstring Symphony — a tender violin melody echoing through a snowy night.",
        bannerImg: '/assets/aistudio/2024-2_ace68036.webp',
        accentColor: 'cyan',
      },
      {
        id: '2024-3',
        date: '5/2/2024 - 19/2/2024',
        typeVI: 'ƯỚC NGUYỆN GIỚI HẠN',
        typeEN: 'LIMITED WISH POOL',
        titleVI: 'Veiled Whispers — Lời Thì Thầm Sau Màn Sương',
        titleEN: 'Veiled Whispers',
        summaryVI:
          'Hồ Ước Nguyện Giới Hạn mùa Lễ Tình Nhân ra mắt ký ức 5 sao Xavier: Tender Night — khoảnh khắc ngọt ngào, ấm áp và lãng mạn trong đêm hội.',
        summaryEN:
          "Valentine's season Limited Wish Pool featuring the 5-Star Memory Xavier: Tender Night — an intimate, romantic evening shared together.",
        bannerImg: '/assets/aistudio/2024-3_55836304.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2024-4',
        date: '21/2/2024 - 10/3/2024',
        typeVI: 'LA BÀN CHIÊM TINH',
        typeEN: 'ORACLE OF STARS',
        titleVI: 'Oracle of Stars: Traversing Deepspace — La Bàn Chiêm Tinh',
        titleEN: 'Oracle of Stars: Traversing Deepspace',
        summaryVI:
          'Sự kiện La Bàn Chiêm Tinh giới hạn xuyên qua Không Gian Sâu, mang đến ký ức 4 sao đặc biệt cùng phụ kiện và vật phẩm nâng cấp quý hiếm.',
        summaryEN:
          'Limited Oracle of Stars event traversing Deepspace, offering exclusive 4-Star Memories, special accessories, and rare enhancement materials.',
        bannerImg: '/assets/aistudio/2024-4_fd0c88ab.webp',
        accentColor: 'amber',
      },
      {
        id: '2024-5',
        date: '11/3/2024 - 23/3/2024',
        typeVI: 'ƯỚC NGUYỆN GIỚI HẠN',
        typeEN: 'LIMITED WISH POOL',
        titleVI: 'Lingering Gaze — Ánh Nhìn Vương Vấn',
        titleEN: 'Lingering Gaze',
        summaryVI:
          'Sự kiện Ước Nguyện Giới Hạn ra mắt loạt ký ức 5 sao lưu giữ những ánh nhìn dịu dàng và khoảnh khắc gần gũi khó quên bên người thương.',
        summaryEN:
          'Limited Wish Pool debuting 5-Star Memories that capture gentle gazes and unforgettable moments of closeness.',
        bannerImg: '/assets/aistudio/2024-5_536e6c22.webp',
        accentColor: 'cyan',
      },
      {
        id: '2024-6',
        date: '17/3/2024 - 14/5/2024',
        typeVI: 'KHẾ ƯỚC BÍ MẬT',
        typeEN: 'SECRET PROMISE',
        titleVI: 'Promise — Khế Ước Bí Mật Cùng Xavier',
        titleEN: 'Promise — Xavier',
        summaryVI:
          'Mùa Khế Ước Bí Mật (Secret Promise) hoàn thành nhiệm vụ định kỳ để mở khóa ký ức 4 sao giới hạn của Xavier cùng vé Ước Nguyện Vàng và tài nguyên giá trị.',
        summaryEN:
          'Secret Promise season where completing periodic tasks unlocks an exclusive 4-Star Xavier Memory, Deepspace Wishes, and abundant progression resources.',
        bannerImg: '/assets/aistudio/2024-6_c7f6c7a0.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2024-7',
        date: '20/3/2024 - 3/4/2024',
        typeVI: 'QUÀ TẶNG CHÂN THÀNH',
        typeEN: 'HEARTFELT GIFT',
        titleVI: 'Unique Aftertaste — Dư Vị Độc Nhất Cùng Xavier',
        titleEN: 'Unique Aftertaste',
        summaryVI:
          'Sự kiện Quà Tặng Chân Thành (Heartfelt Gift) đăng nhập tích lũy nhận hoàn toàn miễn phí ký ức 5 sao Xavier: Unique Aftertaste cùng lượng lớn Kim Cương Đỏ.',
        summaryEN:
          'Heartfelt Gift check-in welfare event granting the 5-Star Memory Xavier: Unique Aftertaste and generous Diamonds completely for free.',
        bannerImg: '/assets/aistudio/2024-7_17dbb66c.webp',
        accentColor: 'amber',
      },
      {
        id: '2024-8',
        date: '8/4/2024',
        typeVI: 'BIÊN NIÊN SỬ NGẦM',
        typeEN: 'WORLD UNDERNEATH',
        titleVI: 'World Underneath: The Unseen Side — Góc Khuất Chưa Kể',
        titleEN: 'World Underneath: The Unseen Side',
        summaryVI:
          'Cập nhật chương Biên Niên Sử Ngầm (World Underneath), lật mở những hồ sơ mật về hành tinh Philos, phi đội Backtrackers và lời thề thầm lặng xuyên thế kỷ của Xavier.',
        summaryEN:
          "World Underneath lore update uncovering classified records about planet Philos, the Backtrackers, and Xavier's silent centuries-long vigil.",
        bannerImg: '/assets/aistudio/2024-8_dfe7485c.webp',
        accentColor: 'cyan',
      },
      {
        id: '2024-9',
        date: '19/4/2024 - 29/4/2024',
        typeVI: 'ƯỚC NGUYỆN GIỚI HẠN',
        typeEN: 'LIMITED WISH POOL',
        titleVI: 'Xavier: Faint Sensation — Xúc Cảm Mơ Hồ',
        titleEN: 'Xavier: Faint Sensation',
        summaryVI:
          'Hồ Ước Nguyện Giới Hạn độc quyền của Xavier với ký ức 5 sao Faint Sensation, khắc họa những rung cảm tinh tế, gần gũi và sâu lắng.',
        summaryEN:
          "Xavier's solo Limited Wish Pool featuring the 5-Star Memory Faint Sensation, portraying delicate and heartfelt close encounters.",
        bannerImg: '/assets/aistudio/2024-9_ff88a4b0.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2024-10',
        date: '26/4/2024 - 10/5/2024',
        typeVI: 'SỰ KIỆN PHÚC LỢI',
        typeEN: 'WELFARE EVENT',
        titleVI: 'Heartwork Routine — Nhịp Điệu Thường Ngày',
        titleEN: 'Heartwork Routine',
        summaryVI:
          'Sự kiện phúc lợi hoàn thành nhiệm vụ hàng ngày để nhận miễn phí ký ức 4 sao của Xavier, phụ kiện Photo Studio và nhiều vật phẩm bồi dưỡng.',
        summaryEN:
          'Welfare event where completing daily tasks rewards a free 4-Star Xavier Memory, Photo Studio props, and generous upgrade supplies.',
        bannerImg: '/assets/aistudio/2024-10_7072fee6.webp',
        accentColor: 'amber',
      },
    ],
  },
  {
    year: '2025',
    codenameVI: 'VỌNG ÂM VƯỢT THỜI GIAN',
    codenameEN: 'CHRONO RESONANCE',
    subtitleVI: 'Kỷ Nguyên Giao Thoa Giữa Mộng Và Thực',
    subtitleEN: 'Convergence of Dreams and Reality',
    descVI:
      'Hành trình lật mở những mảnh ghép quá khứ và đắm chìm vào vũ trụ song song',
    descEN:
      'A journey uncovering fragments of the past and immersing in parallel universes.',
    coverImg: '/assets/aistudio/fallingforyou2_359eb888.webp',
    badgeTextVI: '04 SỰ KIỆN',
    badgeTextEN: '04 EVENTS',
    glowClass: 'from-fuchsia-500/35 via-purple-900/45 to-[#090414]/95',
    borderClass: 'border-fuchsia-400/60 hover:border-pink-300',
    accentHex: '#e879f9',
    events: [
      {
        id: '2025-01',
        date: '2025.02',
        typeVI: 'ƯỚC HẸN MÙA XUÂN',
        typeEN: 'VALENTINE CHRONICLE',
        titleVI: 'Lời Thì Thầm Nơi Vườn Tinh Vân',
        titleEN: 'Whispers in the Nebula Garden',
        summaryVI:
          'Hành trình khám phá nhà kính thực vật phát sáng trong đêm Cyberpunk cùng bộ sưu tập trang phục đôi giới hạn.',
        summaryEN:
          'Exploring a bioluminescent botanical conservatory in the Cyberpunk night with limited couple outfits.',
        bannerImg: '/assets/aistudio/fallingforyou2_359eb888.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2025-02',
        date: '2025.06',
        typeVI: 'NHIỆM VỤ KHÔNG GIAN',
        typeEN: 'DEEPSPACE EXPEDITION',
        titleVI: 'Mật Mã Tàu Traceback II',
        titleEN: 'Traceback II Core Cipher',
        summaryVI:
          'Giải mã hộp đen điều hướng của con tàu cổ đại đang trôi dạt giữa biển mây tím ngoài rìa thiên hà.',
        summaryEN:
          'Decrypting the navigation blackbox of the ancient vessel drifting amidst violet clouds at the galaxy edge.',
        bannerImg: '/assets/aistudio/anec3_e3831a87.webp',
        accentColor: 'cyan',
      },
      {
        id: '2025-03',
        date: '2025.10.16',
        typeVI: 'SINH NHẬT XAVIER',
        typeEN: 'BIRTHDAY SPECIAL',
        titleVI: 'Ánh Trăng Chạm Ngõ Giấc Mơ',
        titleEN: 'Moonlight Across Your Dreams',
        summaryVI:
          'Chuyến du hành bằng tàu bay qua biển mây phát sáng và nghi thức ước nguyện dưới chòm sao hộ mệnh.',
        summaryEN:
          'An airship voyage across luminous cloud seas and a wishing ritual beneath the guardian constellation.',
        bannerImg: '/assets/aistudio/photo3_b824d30d.webp',
        accentColor: 'amber',
      },
      {
        id: '2025-04',
        date: '2025.12',
        typeVI: 'KỶ NIỆM NIÊN ĐẠI',
        typeEN: 'ANNIVERSARY GALA',
        titleVI: 'Giao Thừa Giữa Vạn Vì Sao',
        titleEN: 'New Year Eve Among Myriad Stars',
        summaryVI:
          'Sự kiện tổng kết hành trình năm 2025 với bộ ảnh Photo Studio đặc biệt và kỷ vật hoa Uluru vĩnh cửu.',
        summaryEN:
          '2025 finale event featuring special Photo Studio templates and eternal Uluru flower keepsakes.',
        bannerImg: '/assets/aistudio/journal2_bbfb2f85.webp',
        accentColor: 'fuchsia',
      },
    ],
  },
  {
    year: '2026',
    codenameVI: 'CHÂN TRỜI VĨNH CỬU',
    codenameEN: 'ETERNAL HORIZON',
    subtitleVI: 'Tương Lai Đang Tiếp Diễn Cùng Ánh Trăng',
    subtitleEN: 'Unfolding Future Beneath the Moon',
    descVI:
      'Xuyên qua các chiều không gian để viết tiếp chuyện tình vượt mọi thời không',
    descEN:
      'Crossing dimensions to continue writing a love story beyond all time and space.',
    coverImg: '/assets/aistudio/2026-0_2827aa15.webp',
    badgeTextVI: '19 SỰ KIỆN',
    badgeTextEN: '19 EVENTS',
    glowClass: 'from-pink-500/35 via-indigo-900/45 to-[#090414]/95',
    borderClass: 'border-pink-400/55 hover:border-cyan-300',
    accentHex: '#f472b6',
    events: [
      {
        id: '2026-0',
        date: '18/12/2025 - 2/1/2026',
        typeVI: 'QUÀ TẶNG CHÂN THÀNH',
        typeEN: 'HEARTFELT GIFT',
        titleVI: 'Xavier: Precious Moment — Khoảnh Khắc Trân Quý',
        titleEN: 'Xavier: Precious Moment',
        summaryVI:
          'Sự kiện phúc lợi Quà Tặng Chân Thành (Heartfelt Gift) mở đầu mùa lễ hội cuối năm, đăng nhập nhận miễn phí ký ức 5 sao Xavier: Precious Moment cùng nhiều phần thưởng kỷ niệm.',
        summaryEN:
          'Year-end Heartfelt Gift welfare event where logging in grants the free 5-Star Memory Xavier: Precious Moment alongside festive rewards.',
        bannerImg: '/assets/aistudio/2026-0_2827aa15.webp',
        accentColor: 'amber',
      },
      {
        id: '2026-1',
        date: '31/12/2025 - 21/1/2026',
        typeVI: 'ƯỚC NGUYỆN GIỚI HẠN',
        typeEN: 'LIMITED WISH POOL',
        titleVI: 'Throne of Eros — Ngai Vương Thần Tình Ái',
        titleEN: 'Throne of Eros',
        summaryVI:
          'Đại sự kiện Ước Nguyện Giới Hạn kỷ niệm mở màn năm mới với chuỗi ký ức 5 sao chủ đề thần thoại hoàng gia đầy quyến rũ và tráng lệ.',
        summaryEN:
          'Grand New Year Anniversary Limited Wish Pool featuring majestic 5-Star Memories inspired by royal mythology and timeless devotion.',
        bannerImg: '/assets/aistudio/2026-1_3ceb6d94.webp',
        accentColor: 'cyan',
      },
      {
        id: '2026-2',
        date: '31/12/2025 - 21/1/2026',
        typeVI: 'SỰ KIỆN HỢP TÁC',
        typeEN: 'COLLABORATION',
        titleVI: 'Eternal Love Carved Into Every Papercutting — Nghệ Thuật Cắt Giấy Cổ Truyền',
        titleEN: 'Eternal Love Carved Into Every Papercutting',
        summaryVI:
          'Sự kiện hợp tác di sản văn hóa phi vật thể, khắc họa hình ảnh Xavier và bạn qua những tác phẩm nghệ thuật cắt giấy thủ công tinh xảo.',
        summaryEN:
          'Intangible cultural heritage collaboration celebrating traditional papercutting artistry, immortalizing tender moments with Xavier.',
        bannerImg: '/assets/aistudio/2026-2_546c08f6.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2026-3',
        date: '31/12/2025 - 21/1/2026',
        typeVI: 'SỰ KIỆN GIỚI HẠN',
        typeEN: 'LIMITED EVENT',
        titleVI: 'Illusia Locus — Ảo Cảnh Giao Thoa',
        titleEN: 'Illusia Locus',
        summaryVI:
          'Sự kiện khám phá không gian ảo ảnh đặc biệt đi kèm chuỗi minigame tương tác, cốt truyện lễ hội và cửa hàng quy đổi vật phẩm giới hạn.',
        summaryEN:
          'Special illusion-realm exploration event featuring festive storylines, interactive minigames, and a limited-time exchange shop.',
        bannerImg: '/assets/aistudio/2026-3_8e530349.webp',
        accentColor: 'amber',
      },
      {
        id: '2026-4',
        date: '31/12/2025 - 27/2/2026',
        typeVI: 'KHẾ ƯỚC BÍ MẬT',
        typeEN: 'SECRET PROMISE',
        titleVI: 'Xavier: Firelit Embrace — Vòng Tay Bên Ánh Lửa',
        titleEN: 'Xavier: Firelit Embrace',
        summaryVI:
          'Mùa Khế Ước Bí Mật (Secret Promise) đầu năm 2026 với ký ức 4 sao giới hạn Xavier: Firelit Embrace — hơi ấm dịu dàng sưởi ấm đêm đông.',
        summaryEN:
          'Early 2026 Secret Promise season featuring the exclusive 4-Star Memory Xavier: Firelit Embrace — a cozy, firelit winter embrace.',
        bannerImg: '/assets/aistudio/2026-4_6f8aaeac.webp',
        accentColor: 'cyan',
      },
      {
        id: '2026-5',
        date: '2/1/2026',
        typeVI: 'CỐT TRUYỆN CHÍNH',
        typeEN: 'MAIN STORY',
        titleVI: 'To Our Yesterday — Gửi Ngày Hôm Qua Của Chúng Ta',
        titleEN: 'To Our Yesterday',
        summaryVI:
          'Cập nhật chương cốt truyện chính mới đầy kịch tính, hé lộ những nút thắt quan trọng nối liền quá khứ xa xôi và thực tại tại Thành phố Linkon.',
        summaryEN:
          'Major Main Story update unveiling pivotal revelations that bridge forgotten yesterdays with the unfolding present in Linkon City.',
        bannerImg: '/assets/aistudio/2026-5_10de9061.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2026-6',
        date: '10/2/2026 - 27/2/2026',
        typeVI: 'ƯỚC NGUYỆN GIỚI HẠN',
        typeEN: 'LIMITED WISH POOL',
        titleVI: "Mortality's Tenderness — Sự Dịu Dàng Nơi Trần Thế",
        titleEN: "Mortality's Tenderness",
        summaryVI:
          'Sự kiện Ước Nguyện Giới Hạn mùa Lễ Tình Nhân và Tết Nguyên Đán, tôn vinh những rung động dịu dàng và sợi dây gắn kết vượt qua năm tháng.',
        summaryEN:
          'Valentine and Lunar New Year Limited Wish Pool celebrating tender mortal warmth and bonds that transcend eternity.',
        bannerImg: '/assets/aistudio/2026-6_5a9eaaf3.webp',
        accentColor: 'amber',
      },
      {
        id: '2026-7',
        date: '10/2/2026 - 27/2/2026',
        typeVI: 'SỰ KIỆN PHÚC LỢI',
        typeEN: 'WELFARE EVENT',
        titleVI: 'Wealth Overflow Chibi — Lộc Xuân Tràn Đầy',
        titleEN: 'Wealth Overflow Chibi',
        summaryVI:
          'Sự kiện phúc lợi đầu xuân với tạo hình Chibi đáng yêu, tặng Kim Cương Đỏ, trang phục lễ hội và phụ kiện trang trí đặc sắc.',
        summaryEN:
          'Festive spring welfare event with adorable Chibi adventures, rewarding generous Diamonds, holiday outfits, and decorative keepsakes.',
        bannerImg: '/assets/aistudio/2026-7_cf4d624c.webp',
        accentColor: 'cyan',
      },
      {
        id: '2026-8',
        date: '9/3/2026 - 18/3/2026',
        typeVI: 'ƯỚC NGUYỆN GIỚI HẠN',
        typeEN: 'LIMITED WISH POOL',
        titleVI: 'Xavier: Tranquil Moments — Phút Giây Bình Yên',
        titleEN: 'Xavier: Tranquil Moments',
        summaryVI:
          'Hồ Ước Nguyện Giới Hạn độc quyền của Xavier mang đến ký ức 5 sao Tranquil Moments — khoảng lặng bình yên và ngọt ngào giữa đời thường.',
        summaryEN:
          "Xavier's solo Limited Wish Pool debuting the 5-Star Memory Tranquil Moments — a serene, heartwarming slice of everyday bliss.",
        bannerImg: '/assets/aistudio/2026-8_cb087df8.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2026-9',
        date: '9/3/2026 - 18/3/2026',
        typeVI: 'SỰ KIỆN GIỚI HẠN',
        typeEN: 'LIMITED EVENT',
        titleVI: 'Warming Solace Ceremony — Nghi Thức Sưởi Ấm Tâm Hồn',
        titleEN: 'Warming Solace Ceremony',
        summaryVI:
          'Sự kiện lễ hội lâu đài cổ tích rực rỡ pháo hoa cùng Bunbun và Xavier Chibi, mở khóa nhiều phần thưởng kỷ niệm và nội thất dễ thương.',
        summaryEN:
          'Fairytale castle ceremony under sparkling fireworks with Chibi Xavier and Bunbun, unlocking commemorative rewards and cozy decor.',
        bannerImg: '/assets/aistudio/2026-9_b3292cd3.webp',
        accentColor: 'amber',
      },
      {
        id: '2026-10',
        date: '21/4/2026 - 29/4/2026',
        typeVI: 'SỰ KIỆN PHÚC LỢI',
        typeEN: 'WELFARE EVENT',
        titleVI: 'Tiptap Hop: Whimsical Bounce Toward the Heart — Bước Nhảy Chạm Trái Tim',
        titleEN: 'Tiptap Hop: Whimsical Bounce Toward the Heart',
        summaryVI:
          'Sự kiện phúc lợi minigame vui nhộn tặng 1.000 Kim Cương Đỏ, thiết kế nội thất [Good Meowning] và bộ sưu tập huy hiệu Chibi đáng yêu.',
        summaryEN:
          'Playful welfare minigame event rewarding 1,000 Diamonds, the [Good Meowning] furniture design, and collectible Chibi badges.',
        bannerImg: '/assets/aistudio/2026-10_8b88cb28.webp',
        accentColor: 'cyan',
      },
      {
        id: '2026-11',
        date: '20/4/2026',
        typeVI: 'BIÊN NIÊN SỬ NGẦM',
        typeEN: 'WORLD UNDERNEATH',
        titleVI: 'World Underneath: Shadows Underneath — Những Bóng Hình Ẩn Khuất',
        titleEN: 'World Underneath: Shadows Underneath',
        summaryVI:
          "Cập nhật các chương Biên Niên Sử Ngầm (World Underneath) mới từ Chương 25 đến 30: Light into Dust, Good Night Frostmere, và Fairnight's Edge.",
        summaryEN:
          "New World Underneath lore chapters (25–30) including Light into Dust, Good Night Frostmere, and Fairnight's Edge.",
        bannerImg: '/assets/aistudio/2026-11_c7e46c0d.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2026-12',
        date: '30/4/2026 - 15/5/2026',
        typeVI: 'ƯỚC NGUYỆN GIỚI HẠN',
        typeEN: 'LIMITED WISH POOL',
        titleVI: 'Lingering Lust — Khát Khao Vương Vấn',
        titleEN: 'Lingering Lust',
        summaryVI:
          'Sự kiện Ước Nguyện Giới Hạn quy tụ loạt ký ức 5 sao với bầu không khí lãng mạn, nồng nhiệt và đầy cuốn hút.',
        summaryEN:
          'Limited Wish Pool event showcasing captivating 5-Star Memories steeped in passionate, unforgettable romance.',
        bannerImg: '/assets/aistudio/2026-12_b1d866b0.webp',
        accentColor: 'cyan',
      },
      {
        id: '2026-13',
        date: '31/5/2026 - 18/6/2026',
        typeVI: 'SỰ KIỆN PHÚC LỢI',
        typeEN: 'WELFARE EVENT',
        titleVI: '10 Days With You: Moments Refined — 10 Ngày Bên Xavier',
        titleEN: '10 Days With You: Moments Refined',
        summaryVI:
          'Sự kiện điểm danh 10 Days With You nhận miễn phí ký ức 4 sao của Xavier: Moments Refined — buổi chiều nắng ấm cùng anh tỉ mỉ sửa chữa chiếc loa cổ điển.',
        summaryEN:
          '10 Days With You check-in event granting the free 4-Star Memory Xavier: Moments Refined — a sunlit afternoon tinkering with a vintage speaker together.',
        bannerImg: '/assets/aistudio/2026-13_127448c1.webp',
        accentColor: 'amber',
      },
      {
        id: '2026-14',
        date: '17/6/2026 - 2/7/2026',
        typeVI: 'ƯỚC NGUYỆN GIỚI HẠN',
        typeEN: 'LIMITED WISH POOL',
        titleVI: 'Once Upon A Frame — Chuyện Kể Trong Từng Khung Hình',
        titleEN: 'Once Upon A Frame',
        summaryVI:
          'Sự kiện Ước Nguyện Giới Hạn chủ đề điện ảnh cổ điển (Deepspace First Film Festival), nơi Xavier hóa thân trong bộ phim lãng mạn "Runaway Hearts".',
        summaryEN:
          'Cinematic Limited Wish Pool (Deepspace First Film Festival) where Xavier stars in the classic romantic feature "Runaway Hearts".',
        bannerImg: '/assets/aistudio/2026-14_94413d6b.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2026-15',
        date: '17/9/2026 - 1/10/2026',
        typeVI: 'SỰ KIỆN HỢP TÁC',
        typeEN: 'COLLABORATION',
        titleVI: 'A Scented Sachet — A Love That Endures (Túi Thơm Lưu Hương)',
        titleEN: 'A Scented Sachet — A Love That Endures',
        summaryVI:
          'Sự kiện hợp tác văn hóa truyền thống chế tác túi thơm thêu tay, gửi gắm lời chúc bình an và tình cảm gắn bó dài lâu bên Xavier.',
        summaryEN:
          'Traditional cultural craft collaboration centered on hand-embroidered scented sachets, carrying timeless blessings and enduring affection.',
        bannerImg: '/assets/aistudio/2026-15_0e1c69bf.webp',
        accentColor: 'cyan',
      },
      {
        id: '2026-16',
        date: '22/9/2026 - 10/10/2026',
        typeVI: 'ƯỚC NGUYỆN GIỚI HẠN',
        typeEN: 'LIMITED WISH POOL',
        titleVI: 'A Night That Never Ends — Đêm Bất Tận',
        titleEN: 'A Night That Never Ends',
        summaryVI:
          'Sự kiện Ước Nguyện Giới Hạn mùa thu với những ký ức 5 sao huyền ảo trong màn đêm bất tận giữa ánh trăng và tinh tú.',
        summaryEN:
          'Autumn Limited Wish Pool featuring enchanting 5-Star Memories set within a starlit, never-ending night.',
        bannerImg: '/assets/aistudio/2026-16_1338705f.webp',
        accentColor: 'amber',
      },
      {
        id: '2026-17',
        date: '11/10/2026 - 18/10/2026',
        typeVI: 'SINH NHẬT XAVIER',
        typeEN: "XAVIER'S BIRTHDAY EVENT",
        titleVI: 'Lingering Light — Mừng Sinh Nhật Xavier (16/10)',
        titleEN: 'Lingering Light',
        summaryVI:
          'Sự kiện đặc biệt mừng sinh nhật Xavier (16/10) với ký ức 5 sao giới hạn Lingering Light, cốt truyện hẹn hò sinh nhật và không gian trang trí ngập tràn ánh sao.',
        summaryEN:
          "Xavier's special Birthday Celebration event (October 16) featuring the limited 5-Star Memory Lingering Light, birthday date storyline, and starlight festivities.",
        bannerImg: '/assets/aistudio/2026-17_87503d5e.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2026-18',
        date: '19/10/2026 - 5/11/2026',
        typeVI: 'SỰ KIỆN HỢP TÁC',
        typeEN: 'COLLABORATION',
        titleVI: 'Love and Deepspace × Blade Runner 2049: Love Is Real',
        titleEN: 'Love and Deepspace × Blade Runner 2049: Love Is Real',
        summaryVI:
          'Sự kiện hợp tác bom tấn giữa Love and Deepspace và tuyệt tác Cyberpunk Blade Runner 2049 với thông điệp "Love is real. All for you." giữa ánh đèn neon tím rực rỡ.',
        summaryEN:
          'Blockbuster crossover collaboration between Love and Deepspace and the sci-fi masterpiece Blade Runner 2049 — "Love is real. All for you." bathed in neon cyberpunk light.',
        bannerImg: '/assets/aistudio/2026-18_613eacc6.webp',
        accentColor: 'cyan',
      },
    ],
  },
];

export const EventsPage: React.FC<EventsPageProps> = ({
  lang,
  isPhone,
  onBackHome,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const yearSectionRef = useRef<HTMLElement | null>(null);
  const hudContainerRef = useRef<HTMLDivElement | null>(null);
  const heroShipRef = useRef<HTMLDivElement | null>(null);
  const bgCloudsRef = useRef<HTMLDivElement | null>(null);
  const fgCloudsRef = useRef<HTMLDivElement | null>(null);
  const orbitTrackRef = useRef<HTMLDivElement | null>(null);
  const orbitShipRef = useRef<HTMLDivElement | null>(null);
  const orbitWakeRef = useRef<HTMLDivElement | null>(null);
  const orbitShipYRef = useRef<number>(0);
  const orbitShipAppearedRef = useRef<boolean>(false);
  const eventRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const enterTimerRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);

  // Selected year ('2024' | '2025' | '2026' | null) when user clicks one of the 3 year cards
  const [selectedYear, setSelectedYear] = useState<EventYear | null>(null);
  // Selected event index inside activeYearData.events for the Event Dossier Modal
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  // Controls the "appear from top bar down to current position" animation of Traceback II
  const [orbitShipAppeared, setOrbitShipAppeared] = useState<boolean>(false);
  const [orbitShipEntering, setOrbitShipEntering] = useState<boolean>(false);
  // Tracks which event rows Traceback II has reached along the vertical axis
  const [reachedEventMap, setReachedEventMap] = useState<Record<number, boolean>>({});

  const syncSection1DomNodes = useCallback(
    (scrollTopPx: number, scrollProgress: number) => {
      const hudTranslateY = scrollTopPx * 0.32;
      const hudOpacity = Math.max(0, 1 - scrollProgress * 1.45);
      if (hudContainerRef.current) {
        hudContainerRef.current.style.transform = `translate3d(0, ${hudTranslateY.toFixed(1)}px, 0)`;
        hudContainerRef.current.style.opacity = hudOpacity.toFixed(3);
        hudContainerRef.current.style.visibility = hudOpacity > 0.01 ? 'visible' : 'hidden';
      }

      const shipRotateDeg = scrollProgress * 78;
      const shipScale = 1 + scrollProgress * 0.12;
      const shipTranslateX = isPhone ? 0 : -scrollProgress * 26;
      const shipTranslateY = scrollTopPx * 0.78;
      const fadeOutFactor = Math.max(0, Math.min(1, (scrollProgress - 0.88) / 0.12));
      const shipOpacity = Math.max(0, 1 - fadeOutFactor);

      if (heroShipRef.current) {
        heroShipRef.current.style.transform = `translate3d(${shipTranslateX.toFixed(1)}px, ${shipTranslateY.toFixed(1)}px, 0) rotate(${shipRotateDeg.toFixed(2)}deg) scale(${shipScale.toFixed(3)})`;
        heroShipRef.current.style.opacity = shipOpacity.toFixed(3);
        heroShipRef.current.style.visibility = shipOpacity > 0.01 ? 'visible' : 'hidden';
      }

      const cloudsVisible = scrollProgress < 0.99;
      if (bgCloudsRef.current) {
        bgCloudsRef.current.style.visibility = cloudsVisible ? 'visible' : 'hidden';
      }
      if (fgCloudsRef.current) {
        fgCloudsRef.current.style.visibility = cloudsVisible ? 'visible' : 'hidden';
      }
    },
    [isPhone]
  );

  const syncOrbitDomNodes = useCallback(
    (y: number, appeared: boolean) => {
      if (orbitShipRef.current) {
        orbitShipRef.current.style.transform = appeared
          ? `translate3d(-50%, ${y.toFixed(1)}px, 0) scale(1)`
          : 'translate3d(-50%, -56px, 0) scale(0.86)';
        orbitShipRef.current.style.opacity = appeared ? '1' : '0';
      }
      if (orbitWakeRef.current) {
        const wakeH = appeared ? Math.max(isPhone ? 24 : 38, y + (isPhone ? 20 : 34)) : 0;
        orbitWakeRef.current.style.height = `${wakeH.toFixed(1)}px`;
        orbitWakeRef.current.style.opacity = appeared ? '1' : '0';
      }
    },
    [isPhone]
  );

  const computeAndSyncOrbit = useCallback(
    (el: HTMLDivElement) => {
      if (!orbitTrackRef.current) return;
      // 1. READ ALL DOM GEOMETRY FIRST (Avoid Forced Synchronous Layout / Thrashing)
      const viewportH = el.clientHeight || window.innerHeight || 800;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const trackRect = orbitTrackRef.current.getBoundingClientRect();
      const containerRect = el.getBoundingClientRect();
      const trackTopInContainer = trackRect.top - containerRect.top;

      const shipH = isPhone ? 96 : 165;
      const maxScroll = Math.max(1, scrollHeight - viewportH);
      const bottomZone = viewportH * 0.45;
      const nearBottomRatio = Math.max(
        0,
        Math.min(1, (scrollTop - (maxScroll - bottomZone)) / Math.max(1, bottomZone))
      );
      const anchorY = viewportH * (0.48 + nearBottomRatio * 0.34);
      const rawOrbitY = anchorY - trackTopInContainer;
      const maxOrbitY = Math.max(0, trackRect.height - shipH);
      const clampedOrbitY = Math.max(0, Math.min(maxOrbitY, rawOrbitY));

      // Read event row positions before mutating any styles
      const shipFrontY = clampedOrbitY + (isPhone ? 68 : 112);
      const nextReached: Record<number, boolean> = {};
      eventRowRefs.current.forEach((rowEl, idx) => {
        if (!rowEl) return;
        const parentOffsetTop = (rowEl.offsetParent as HTMLElement)?.offsetTop || 0;
        const rowTopInTrack = parentOffsetTop + rowEl.offsetTop;
        const rowTriggerY = rowTopInTrack + Math.min(rowEl.offsetHeight * 0.18, isPhone ? 32 : 52);
        if (idx === 0 || shipFrontY + (isPhone ? 45 : 85) >= rowTriggerY) {
          nextReached[idx] = true;
        }
      });

      // 2. WRITE DOM STYLES & STATE AFTER ALL READS COMPLETE
      const isTrackVisible =
        trackTopInContainer < viewportH * 0.92 && trackRect.bottom > containerRect.top + 20;
      let appearedNow = orbitShipAppearedRef.current;
      if (isTrackVisible && !appearedNow) {
        appearedNow = true;
        orbitShipAppearedRef.current = true;
        setOrbitShipAppeared(true);
        setOrbitShipEntering(true);
        if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
        enterTimerRef.current = window.setTimeout(() => {
          setOrbitShipEntering(false);
        }, 680);
      }

      orbitShipYRef.current = clampedOrbitY;
      syncOrbitDomNodes(clampedOrbitY, appearedNow);

      setReachedEventMap((prev) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(nextReached);
        if (
          prevKeys.length === nextKeys.length &&
          nextKeys.every((k) => prev[Number(k)] === nextReached[Number(k)])
        ) {
          return prev;
        }
        return nextReached;
      });
    },
    [isPhone, syncOrbitDomNodes]
  );

  // When selectedYear changes, reset and play the "appear from top bar down to current position" animation
  useEffect(() => {
    if (enterTimerRef.current) {
      window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    eventRowRefs.current = [];
    setReachedEventMap({});
    setSelectedEventIndex(null);
    orbitShipAppearedRef.current = false;
    orbitShipYRef.current = 0;
    setOrbitShipAppeared(false);
    setOrbitShipEntering(false);

    if (!selectedYear) {
      return;
    }

    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          computeAndSyncOrbit(scrollContainerRef.current);
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        const viewportH = el.clientHeight || window.innerHeight || 800;
        const top = el.scrollTop;
        const maxSection1Scroll = viewportH * 1.15;
        const clampedTop = Math.min(top, maxSection1Scroll);
        const rawProgress = top / (viewportH * 1.05);
        const clampedProgress = Math.max(0, Math.min(1, rawProgress));

        // Direct DOM update for Section 1 (0 React re-renders during scroll)
        syncSection1DomNodes(clampedTop, clampedProgress);

        // Update Traceback II vertical orbit position & progressive event reveal along the central axis
        computeAndSyncOrbit(el);
      });
    },
    [computeAndSyncOrbit, syncSection1DomNodes]
  );

  const scrollToTopSection = useCallback(() => {
    soundFx.playSelect();
    setSelectedYear(null);
    orbitShipAppearedRef.current = false;
    orbitShipYRef.current = 0;
    setOrbitShipAppeared(false);
    setReachedEventMap({});
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const CLOUD3_SRC = '/assets/aistudio/cloud3_ca9fa321.webp';
  const TRACEBACK_SRC = '/assets/aistudio/tracebackii_6e3cf5cf.webp';

  const activeYearData = YEAR_ARCHIVES.find((y) => y.year === selectedYear) ?? null;
  const activeModalEvent =
    activeYearData && selectedEventIndex !== null
      ? activeYearData.events[selectedEventIndex] ?? null
      : null;

  // Keyboard support for Event Dossier Modal (Escape to close modal first, Left/Right arrows to switch event)
  useEffect(() => {
    if (selectedEventIndex === null || !activeYearData) return;

    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        soundFx.playBack();
        setSelectedEventIndex(null);
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        e.preventDefault();
        soundFx.playHover();
        setSelectedEventIndex((prev) =>
          prev === null
            ? 0
            : (prev - 1 + activeYearData.events.length) % activeYearData.events.length
        );
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation();
        e.preventDefault();
        soundFx.playHover();
        setSelectedEventIndex((prev) =>
          prev === null ? 0 : (prev + 1) % activeYearData.events.length
        );
      }
    };

    window.addEventListener('keydown', handleModalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleModalKeyDown, { capture: true });
  }, [selectedEventIndex, activeYearData]);

  return (
    <div className="relative z-20 flex h-full w-full flex-col overflow-hidden bg-[#090315]">
      {/* MAIN SCROLLABLE CONTAINER (No scroll-smooth class so mouse wheel & trackpad on laptop scroll natively at 60-120fps without lag) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="cyber-events-scroll relative z-10 flex-1 overflow-y-auto overflow-x-hidden"
      >
        {/* =====================================================================
            SECTION 1: TRACEBACK II, LEFT SCI-FI FLIGHT HUD & NATURAL CLOUD SEA
            Ends at the bottom of the cloud bed in pure white (#ffffff) matching
            the reference screenshots, without excessive blank white tail.
           ===================================================================== */}
        <section
          aria-label="Traceback II Cloud Orbit"
          className="relative h-[94dvh] sm:h-[98dvh] w-full overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, #1b1534 0%, #35335c 38%, #5e6d98 68%, #96add0 86%, #ffffff 100%)',
          }}
        >
          {/* TOP TRANSPARENT BREADCRUMB NAVIGATION BAR (Does NOT follow scroll) */}
          <header className="absolute inset-x-0 top-0 z-40 px-3.5 pt-3.5 pb-2 sm:px-7 sm:pt-4 md:px-9 md:pt-5 lg:px-12 lg:pt-7">
            <div className="mr-16 sm:mr-24 flex flex-wrap items-center justify-between gap-2 border-b border-fuchsia-300/25 bg-transparent px-1 py-1.5 sm:px-2 sm:py-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                {/* Breadcrumb 1: TRĂNG SOI DẶM TRƯỜNG / MOONSTRIDE (Click to return Home) */}
                <button
                  type="button"
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={() => {
                    soundFx.playBack();
                    onBackHome();
                  }}
                  className="cursor-pointer text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-semibold tracking-[0.08em] sm:tracking-[0.14em] text-purple-200/85 uppercase transition-all duration-150 hover:text-white hover:drop-shadow-[0_0_10px_#e879f9] focus:outline-none"
                >
                  {lang === 'VI' ? 'TRĂNG SOI DẶM TRƯỜNG' : 'MOONSTRIDE'}
                </button>

                {/* Cyberpunk `>` Separator */}
                <ChevronRight
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 shrink-0 text-fuchsia-400 drop-shadow-[0_0_6px_#e879f9]"
                  aria-hidden="true"
                />

                {/* Breadcrumb 2: SỰ KIỆN / EVENTS */}
                <button
                  type="button"
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={scrollToTopSection}
                  className="cursor-pointer text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-bold tracking-[0.1em] sm:tracking-[0.15em] text-white uppercase drop-shadow-[0_0_8px_rgba(232,121,249,0.75)] transition-colors focus:outline-none"
                >
                  {lang === 'VI' ? 'SỰ KIỆN' : 'EVENTS'}
                </button>
              </div>
            </div>
          </header>

          {/* =================================================================
              1. BACKGROUND CLOUD3 CLUSTERS (Behind Traceback II, z-10)
              Culled automatically via ref when scrolled completely past Section 1
             ================================================================= */}
          <div
            ref={bgCloudsRef}
            className="pointer-events-none absolute inset-0 z-10 select-none"
            aria-hidden="true"
          >
            {/* Upper-Right Deep Violet Nebula Cloud Wisp */}
            <img
              src={CLOUD3_SRC}
              alt=""
              decoding="async"
              className="cyber-cloud-slow absolute top-[5dvh] right-[-4%] w-[52vw] max-w-[520px] sm:w-[34rem] opacity-30 object-contain"
              style={{
                transform: 'scale(1.32, 0.76) rotate(-7deg)',
              }}
            />

            {/* Distant Left-Center Soft Violet Mist Layer */}
            <img
              src={CLOUD3_SRC}
              alt=""
              decoding="async"
              className="cyber-cloud-reverse absolute top-[38dvh] left-[-12%] w-[64vw] max-w-[620px] sm:w-[40rem] opacity-25 object-contain"
              style={{
                transform: 'scale(-1.45, 0.68) rotate(6deg)',
              }}
            />

            {/* Right-Side Towering Lavender-Blue Cumulus Plume */}
            <img
              src={CLOUD3_SRC}
              alt=""
              decoding="async"
              className="cyber-cloud-reverse absolute top-[22dvh] right-[-18%] w-[72vw] max-w-[720px] sm:w-[46rem] opacity-65 object-contain"
              style={{
                transform: 'scale(-1.18, 1.24) rotate(-19deg)',
              }}
            />

            {/* Mid-Right Soft Ice-Blue Billow (behind the right wing of Traceback II) */}
            <img
              src={CLOUD3_SRC}
              alt=""
              decoding="async"
              className="cyber-cloud-slow absolute top-[40dvh] right-[-8%] w-[76vw] max-w-[740px] sm:w-[48rem] opacity-85 object-contain"
              style={{
                transform: 'scale(1.28, -0.92) rotate(11deg)',
              }}
            />

            {/* Lower-Right Soft Atmospheric Cushion */}
            <img
              src={CLOUD3_SRC}
              alt=""
              decoding="async"
              className="cyber-cloud-reverse absolute top-[50dvh] right-[10%] w-[70vw] max-w-[680px] sm:w-[44rem] opacity-85 object-contain"
              style={{
                transform: 'scale(-1.35, 0.85) rotate(-5deg)',
              }}
            />
          </div>

          {/* =================================================================
              2. LEFT-SIDE CYBERPUNK FLIGHT JOURNAL HUD (z-25)
             ================================================================= */}
          <div
            ref={hudContainerRef}
            className={`pointer-events-none absolute z-25 will-change-transform ${
              isPhone
                ? 'inset-x-0 mx-auto top-[11.5dvh] w-[86vw] max-w-[335px]'
                : 'inset-x-0 mx-auto top-[11.5dvh] w-[84vw] max-w-[335px] sm:inset-x-auto sm:mx-0 sm:left-[3.5vw] md:left-[4vw] lg:left-[4.5vw] sm:top-[15dvh] md:top-[17dvh] lg:top-[19dvh] sm:w-[39vw] md:w-[38vw] lg:w-[38vw] xl:w-[37vw] sm:max-w-[700px]'
            }`}
            style={{
              transform: 'translate3d(0, 0px, 0)',
              opacity: 1,
            }}
          >
            <div className="relative flex flex-col justify-between overflow-hidden border border-cyan-400/40 bg-[#120624]/55 px-4.5 py-3.5 sm:p-4 md:p-5 lg:p-[1.6vw] shadow-[0_8px_30px_rgba(12,4,28,0.35),0_0_24px_rgba(232,121,249,0.2)]">
              {/* Semi-transparent Blade Runner Gradient Overlay matching Year Event Cards */}
              <div
                className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-purple-900/35 via-purple-950/15 to-transparent"
                aria-hidden="true"
              />

              {/* Top-Left & Bottom-Right Cyberpunk Corner Brackets matching Year Event Cards */}
              <span
                className="pointer-events-none absolute top-2 left-2 z-10 h-3 w-3 lg:h-3.5 lg:w-3.5 border-t-2 border-l-2 border-cyan-300/80"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute bottom-2 right-2 z-10 h-3 w-3 lg:h-3.5 lg:w-3.5 border-b-2 border-r-2 border-fuchsia-400/80"
                aria-hidden="true"
              />

              {/* Card Top Row: Telemetry Index matching Year Cards */}
              <div className="relative z-10 mb-1.5 sm:mb-2 lg:mb-[0.55vw] flex w-full items-center justify-between gap-2">
                <span className="font-mono text-[9px] sm:text-[10px] lg:text-xs tracking-[0.22em] text-cyan-300/90 uppercase">
                  FLIGHT LOG // TB-II
                </span>
              </div>

              {/* Single-Line Coordinates Confirmed Title (Never wraps on any view) */}
              <div className="relative z-10 flex flex-col">
                <h1
                  className="whitespace-nowrap text-[clamp(8.8px,2.5vw,11.5px)] sm:text-[clamp(9.5px,1.15vw,21px)] font-bold tracking-[0.03em] sm:tracking-[0.06em] uppercase leading-tight text-white"
                  style={{
                    textShadow:
                      '0 0 14px rgba(34, 211, 238, 0.55), 0 0 28px rgba(232, 121, 249, 0.45)',
                  }}
                >
                  {lang === 'VI'
                    ? 'Traceback II: Đã xác nhận tọa độ'
                    : 'Traceback II: Coordinates Confirmed'}
                </h1>

                {/* Cyan-to-Fuchsia Gradient Divider Line matching Year Event Cards */}
                <div
                  className="mt-2 mb-2 sm:mt-2.5 sm:mb-2.5 lg:mt-[0.65vw] lg:mb-[0.65vw] h-[1px] w-full bg-gradient-to-r from-cyan-400/70 via-fuchsia-400/50 to-transparent"
                  aria-hidden="true"
                />

                {/* Flight Journal Description matching Year Event Cards */}
                <p className="text-[11px] sm:text-xs md:text-[13px] lg:text-[clamp(0.85rem,1.02vw,1.15rem)] leading-relaxed text-purple-100/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
                  {lang === 'VI'
                    ? 'Mọi sự kiện và cột mốc gắn liền với Thẩm Tinh Hồi đều đã được lưu vào nhật ký phi hành.'
                    : 'Every event and milestone shared with Xavier has been logged into the flight journal.'}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================================
              3. THE TRACEBACK II SPACESHIP (z-20 — Between Background & Foreground Clouds)
             ================================================================= */}
          <div
            ref={heroShipRef}
            className="pointer-events-none absolute inset-x-0 mx-auto top-[31.5dvh] sm:mx-0 sm:top-[9dvh] md:top-[7.5dvh] lg:top-[6dvh] sm:left-[45.5vw] md:left-[45vw] lg:left-[45.5vw] sm:right-[2vw] md:right-[3vw] lg:right-[3.5vw] z-20 flex items-center justify-center will-change-transform"
            style={{
              transform: 'translate3d(0px, 0px, 0) rotate(0deg) scale(1)',
              transformOrigin: '50% 52%',
              opacity: 1,
            }}
          >
            {/* Floating Traceback II Vessel Image (No shadow) */}
            <div className="traceback-ship-float relative flex items-center justify-center">
              <img
                src={TRACEBACK_SRC}
                alt="Tàu Traceback II"
                decoding="async"
                className="w-[78vw] max-w-[310px] max-h-[38dvh] sm:w-[45vw] sm:max-w-[380px] sm:max-h-[44dvh] md:w-[46vw] md:max-w-[480px] md:max-h-[52dvh] lg:w-[48vw] lg:max-w-[780px] lg:max-h-[64dvh] xl:w-[48vw] xl:max-w-[900px] xl:max-h-[68dvh] h-auto object-contain select-none"
              />
            </div>
          </div>

          {/* =================================================================
              4. FOREGROUND WHITE CLOUD3 SEA (z-30 — In Front of Traceback II)
             ================================================================= */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[50dvh] sm:top-[52dvh] z-30 select-none"
            aria-hidden="true"
          >
            {/* White Cloud Base behind the lower cloud puffs */}
            <div
              className="absolute inset-x-0 top-[14dvh] bottom-0 z-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.78) 45%, #ffffff 85%, #ffffff 100%)',
              }}
            />

            <div ref={fgCloudsRef} className="absolute inset-0 z-10">
              {/* Layer A: Soft Semi-Transparent Crown Wisps along the top ridge */}
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-slow absolute right-[-14%] top-[-2dvh] z-10 w-[66vw] max-w-[650px] sm:w-[43rem] opacity-75 object-contain"
                style={{
                  transform: 'scale(-1.28, -0.86) rotate(-15deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-reverse absolute left-[-15%] top-[9dvh] z-10 w-[68vw] max-w-[660px] sm:w-[44rem] opacity-72 object-contain"
                style={{
                  transform: 'scale(1.36, -0.78) rotate(11deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-slow absolute left-[24%] top-[13dvh] z-10 w-[58vw] max-w-[560px] sm:w-[37rem] opacity-70 object-contain"
                style={{
                  transform: 'scale(-1.42, 0.72) rotate(-6deg)',
                }}
              />

              {/* Layer B: Main Sculpted Cumulus Billows (varied flips, rotations & stretches) */}
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-reverse absolute right-[-18%] top-[5dvh] z-10 w-[78vw] max-w-[760px] sm:w-[50rem] opacity-95 object-contain"
                style={{
                  transform: 'scale(-1.18, 1.05) rotate(-12deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-slow absolute right-[8%] top-[13dvh] z-10 w-[68vw] max-w-[660px] sm:w-[44rem] opacity-92 object-contain"
                style={{
                  transform: 'scale(1.32, -0.88) rotate(8deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-reverse absolute left-[14%] top-[18dvh] z-10 w-[74vw] max-w-[720px] sm:w-[48rem] opacity-95 object-contain"
                style={{
                  transform: 'scale(-1.38, 0.84) rotate(-4deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-slow absolute left-[-6%] top-[15dvh] z-10 w-[64vw] max-w-[620px] sm:w-[41rem] opacity-90 object-contain"
                style={{
                  transform: 'scale(1.15, -0.94) rotate(14deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-reverse absolute left-[-22%] top-[12dvh] z-10 w-[76vw] max-w-[740px] sm:w-[49rem] opacity-95 object-contain"
                style={{
                  transform: 'scale(1.26, 0.96) rotate(7deg)',
                }}
              />
            </div>

            {/* Layer C: Deep Foreground Cloud Bed */}
            <img
              src={CLOUD3_SRC}
              alt=""
              className="absolute left-[-14%] top-[18dvh] z-10 w-[84vw] max-w-[820px] sm:w-[54rem] opacity-100 object-contain"
              style={{
                transform: 'scale(-1.45, 0.9) rotate(-3deg)',
              }}
            />
            <img
              src={CLOUD3_SRC}
              alt=""
              className="absolute left-[20%] top-[17dvh] z-10 w-[86vw] max-w-[840px] sm:w-[56rem] opacity-100 object-contain"
              style={{
                transform: 'scale(1.48, -0.92) rotate(4deg)',
              }}
            />
            <img
              src={CLOUD3_SRC}
              alt=""
              className="absolute right-[-16%] top-[15dvh] z-10 w-[84vw] max-w-[820px] sm:w-[54rem] opacity-100 object-contain"
              style={{
                transform: 'scale(-1.4, 0.95) rotate(-5deg)',
              }}
            />

            {/* Smooth pure-white floor blend at the bottom edge of Section 1 */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[15dvh]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.88) 55%, #ffffff 100%)',
              }}
            />
          </div>
        </section>

        {/* =====================================================================
            SECTION 2: COMPACT WHITE RADAR ZONE -> SMOOTH EASE-IN-OUT GRADIENT -> PURPLE YEAR PORTALS
           ===================================================================== */}
        <section
          ref={yearSectionRef}
          aria-label="Events By Year 2024 2025 2026"
          className="relative z-40 flex w-full flex-col overflow-hidden"
          style={{
            background: activeYearData
              ? `linear-gradient(
                  180deg,
                  #ffffff 0px,
                  #fdfbff 18px,
                  #faf5ff 36px,
                  #f4ebff 56px,
                  #ede0ff 78px,
                  #e3d0ff 102px,
                  #d6bdfa 128px,
                  #c7a7f5 156px,
                  #b58fed 186px,
                  #a176e3 218px,
                  #8c5dd6 252px,
                  #7746c7 288px,
                  #6232b4 326px,
                  #4e219f 366px,
                  #3b1587 408px,
                  #2b0d6e 452px,
                  #1f0856 498px,
                  #170640 546px,
                  #13052f 598px,
                  #100424 660px,
                  #0d031d 740px,
                  #0b0217 100%
                )`
              : `linear-gradient(
                  180deg,
                  #ffffff 0%,
                  #ffffff 5%,
                  #fdfbff 8%,
                  #f7f0ff 11%,
                  #ece0ff 14%,
                  #dcc6ff 17%,
                  #c5a5fa 20%,
                  #a97ef0 23%,
                  #8855df 26%,
                  #6632c0 29%,
                  #471c99 32%,
                  #2f106e 35%,
                  #1f094a 38%,
                  #160634 42%,
                  #120526 47%,
                  #120526 100%
                )`,
          }}
        >
          {/* -----------------------------------------------------------------
              PART 2A: TOP WHITE ZONE — CYBER SYSTEM NOTIFICATION
              Compact top & bottom spacing so there is no dead whitespace above or below.
             ----------------------------------------------------------------- */}
          <div className="relative z-10 flex w-full flex-col items-center justify-start px-8 pt-0 pb-2 sm:px-6 sm:pt-1 sm:pb-3">
            <div className="relative flex w-full max-w-[82vw] sm:max-w-[94vw] flex-col items-center text-center">
              {/* Main Cyber System Notification Text on the White Background (Single line on tablet/laptop/PC) */}
              <p
                className="font-mono text-xs sm:whitespace-nowrap sm:text-[clamp(11.5px,1.5vw,23px)] font-bold tracking-[0.08em] sm:tracking-[0.11em] text-[#1e1038] uppercase leading-relaxed"
                style={{
                  textShadow:
                    '0 2px 16px rgba(139, 92, 246, 0.22), 0 0 1px rgba(30, 16, 56, 0.3)',
                }}
              >
                {lang === 'VI'
                  ? 'Hãy điều chỉnh radar và chọn tọa độ để đáp xuống!'
                  : 'Adjust your radar and select a coordinate for landing!'}
                <span className="ml-2 inline-block h-3.5 w-2 sm:h-4 sm:w-2.5 align-middle bg-[#6d28d9] shadow-[0_0_8px_rgba(109,40,217,0.6)] animate-pulse" />
              </p>

              {/* Subtle Cyber Divider & Smaller Coordinate Readout */}
              <div className="mt-1.5 sm:mt-2 flex items-center gap-2 sm:gap-2.5 text-[7.5px] sm:text-[9px] font-mono tracking-[0.22em] sm:tracking-[0.26em] text-[#5b21b6]/60 uppercase">
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent via-[#7c3aed]/35 to-[#7c3aed]/65" />
                <span>// COORD: 2024 · 2025 · 2026 //</span>
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent via-[#7c3aed]/35 to-[#7c3aed]/65" />
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------
              PART 2B: COMPACT GRADIENT TRANSITION ZONE (WHITE -> PURPLE)
             ----------------------------------------------------------------- */}
          <div
            className={`pointer-events-none w-full select-none ${
              activeYearData ? 'h-[5dvh] sm:h-[7dvh]' : 'h-[11dvh] sm:h-[14dvh]'
            }`}
            aria-hidden="true"
          />

          {/* -----------------------------------------------------------------
              PART 2C: THE PURPLE ZONE — 3 CYBERPUNK YEAR PORTALS (2024, 2025, 2026)
              Starts immediately after the compact transition with no excess top gap.
             ----------------------------------------------------------------- */}
          <div className="relative flex w-full flex-col items-center justify-start px-4 pt-3 pb-14 sm:px-8 sm:pt-5 sm:pb-18 md:px-12 lg:px-16">
            {/* Soft Centered Ambient Glow (strictly away from top edge so zero seam) */}
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 55%, rgba(168, 85, 247, 0.16) 0%, transparent 50%),
                  radial-gradient(circle at 20% 72%, rgba(34, 211, 238, 0.09) 0%, transparent 40%),
                  radial-gradient(circle at 80% 75%, rgba(236, 72, 153, 0.11) 0%, transparent 40%)
                `,
              }}
              aria-hidden="true"
            />

          {/* =================================================================
              VIEW MODE A: THE 3 YEAR PORTAL CARDS (2024, 2025, 2026)
             ================================================================= */}
          {!activeYearData ? (
            <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 md:gap-7">
              {YEAR_ARCHIVES.map((item, idx) => (
                <button
                  key={item.year}
                  type="button"
                  onMouseEnter={() => {
                    soundFx.playHover();
                    // Warm up the first 4 event banners of this year so timeline opens with zero image pop-in
                    item.events.slice(0, 4).forEach((ev) => {
                      const img = new Image();
                      img.src = ev.bannerImg;
                    });
                  }}
                  onClick={() => {
                    soundFx.playSelect();
                    orbitShipYRef.current = 0;
                    orbitShipAppearedRef.current = false;
                    setSelectedYear(item.year);
                  }}
                  className={`group relative flex h-full flex-col overflow-hidden border bg-[#120624]/85 text-left transition-all duration-300 hover:-translate-y-1.5 focus:outline-none ${
                    isPhone ? 'min-h-[190px] p-4' : 'min-h-[260px] sm:min-h-[280px] p-5 md:p-6'
                  } ${item.borderClass} shadow-[0_10px_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_32px_rgba(232,121,249,0.45)]`}
                >
                  {/* Pure Color Blade Runner Gradient Overlay */}
                  <div
                    className={`pointer-events-none absolute inset-0 z-1 bg-gradient-to-t ${item.glowClass}`}
                    aria-hidden="true"
                  />

                  {/* Top-Left & Bottom-Right Cyberpunk Corner Brackets */}
                  <span
                    className="pointer-events-none absolute top-2 left-2 z-10 h-3 w-3 border-t-2 border-l-2 border-cyan-300/80 transition-all group-hover:h-4 group-hover:w-4 group-hover:border-white"
                    aria-hidden="true"
                  />
                  <span
                    className="pointer-events-none absolute bottom-2 right-2 z-10 h-3 w-3 border-b-2 border-r-2 border-fuchsia-400/80 transition-all group-hover:h-4 group-hover:w-4 group-hover:border-white"
                    aria-hidden="true"
                  />

                  {/* Card Top Row: Sector Index & Event Count Badge */}
                  <div className="relative z-10 flex w-full shrink-0 items-center justify-between gap-2">
                    <span className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-cyan-300/90 uppercase">
                      {`CHRONO // 0${idx + 1}`}
                    </span>
                    <span className="border border-fuchsia-300/45 bg-purple-950/75 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-[0.16em] text-pink-200 uppercase backdrop-blur-sm">
                      {`${String(item.events.length).padStart(2, '0')} ${
                        lang === 'VI' ? 'SỰ KIỆN' : 'EVENTS'
                      }`}
                    </span>
                  </div>

                  {/* Card Center/Bottom: Giant Year Number (2024 / 2025 / 2026) locked at identical top offset */}
                  <div className="relative z-10 mt-6 sm:mt-16 md:mt-20 flex flex-1 flex-col">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="font-bold tracking-[0.12em] text-white transition-all duration-300 group-hover:tracking-[0.16em]"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: isPhone ? '2.5rem' : 'clamp(2.75rem, 4.2vw, 4rem)',
                          lineHeight: 1,
                          textShadow: `0 0 18px ${item.accentHex}, 0 0 36px rgba(232,121,249,0.45)`,
                        }}
                      >
                        {item.year}
                      </span>
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </div>

                    <div className="mt-2 h-[1px] w-full shrink-0 bg-gradient-to-r from-cyan-400/70 via-fuchsia-400/50 to-transparent" />

                    <p className="mt-2.5 flex-1 text-xs sm:text-[13px] leading-relaxed text-purple-100/90">
                      {lang === 'VI' ? item.descVI : item.descEN}
                    </p>

                    <div className="mt-auto pt-3 inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-cyan-300 uppercase group-hover:text-white">
                      <span>
                        {lang === 'VI' ? 'MỞ HỒ SƠ SỰ KIỆN' : 'ACCESS YEAR ARCHIVE'}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* =================================================================
               VIEW MODE B: VERTICAL ORBIT TIMELINE FOR SELECTED YEAR (2024 / 2025 / 2026)
               - No NIÊN ĐẠI banner header.
               - Starts with Traceback II centered at the top of the vertical orbit axis;
                 as the user scrolls down, Traceback II travels straight down the axis
                 (without rotation) while timeline events alternate on Left & Right sides.
               ================================================================= */
            <div className="relative z-10 flex w-full max-w-7xl flex-col gap-6">
              {/* Top Year Switcher Bar (2024 | 2025 | 2026 + Close back to 3 cards) */}
              <div className="flex flex-wrap items-center justify-between gap-3 border border-fuchsia-400/40 bg-[#15072c]/90 px-4 py-3 shadow-[0_0_25px_rgba(192,38,211,0.25)] backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {YEAR_ARCHIVES.map((yr) => {
                    const isCurrent = yr.year === activeYearData.year;
                    return (
                      <button
                        key={yr.year}
                        type="button"
                        onMouseEnter={() => {
                          if (!isCurrent) soundFx.playHover();
                        }}
                        onClick={() => {
                          soundFx.playSelect();
                          orbitShipAppearedRef.current = false;
                          orbitShipYRef.current = 0;
                          setSelectedYear(yr.year);
                        }}
                        className={`cursor-pointer px-3.5 py-1.5 text-xs sm:text-sm font-bold tracking-[0.18em] uppercase transition-all focus:outline-none ${
                          isCurrent
                            ? 'border border-cyan-300 bg-fuchsia-600/45 text-white shadow-[0_0_15px_rgba(34,211,238,0.55)]'
                            : 'border border-fuchsia-400/25 bg-purple-950/40 text-purple-200/75 hover:border-pink-300/60 hover:text-white'
                        }`}
                      >
                        {yr.year}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={() => {
                    soundFx.playBack();
                    orbitShipAppearedRef.current = false;
                    orbitShipYRef.current = 0;
                    setSelectedYear(null);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 border border-pink-300/40 bg-purple-950/60 px-3 py-1.5 text-[11px] sm:text-xs font-semibold tracking-[0.15em] text-pink-200 uppercase transition-all hover:border-cyan-300 hover:bg-fuchsia-900/50 hover:text-white focus:outline-none"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>{lang === 'VI' ? 'CHỌN LẠI NĂM' : 'ALL YEARS'}</span>
                </button>
              </div>

              {/* VERTICAL ORBIT TIMELINE TRACK — CYBERPUNK COSMOS AESTHETIC */}
              <div
                ref={orbitTrackRef}
                className={`relative w-full ${
                  isPhone
                    ? 'pt-24 pb-16'
                    : 'pt-28 pb-20 sm:pt-36 sm:pb-28 md:pt-44 md:pb-32'
                }`}
              >
                {/* Unexplored Star-Chart Vertical Axis Line (Left axis on Phone, Center axis on Tablet/PC) */}
                <div
                  className={`pointer-events-none absolute top-8 bottom-8 z-0 -translate-x-1/2 flex flex-col items-center opacity-45 ${
                    isPhone ? 'left-4' : 'left-1/2'
                  }`}
                  aria-hidden="true"
                >
                  <div className="h-full w-[1.5px] bg-gradient-to-b from-cyan-400/50 via-fuchsia-400/40 to-purple-400/25 shadow-[0_0_8px_rgba(192,38,211,0.35)]" />
                </div>

                {/* Progressive Cyberpunk Cosmos Quantum Wake — Reveals as Traceback II moves down */}
                <div
                  ref={orbitWakeRef}
                  className={`pointer-events-none absolute z-10 -translate-x-1/2 flex flex-col items-center ${
                    isPhone ? 'top-6 left-4' : 'top-6 sm:top-10 left-1/2'
                  }`}
                  style={{
                    height: `${
                      orbitShipAppeared
                        ? Math.max(isPhone ? 24 : 38, orbitShipYRef.current + (isPhone ? 20 : 34)).toFixed(1)
                        : '0'
                    }px`,
                    opacity: orbitShipAppeared ? 1 : 0,
                  }}
                  aria-hidden="true"
                >
                  {/* Top Astral Origin Star (✦) & Coordinate Tag */}
                  <div className="relative flex flex-col items-center shrink-0">
                    {!isPhone && (
                      <span className="mb-1 font-mono text-[7px] sm:text-[8px] tracking-[0.28em] text-cyan-200/70 uppercase whitespace-nowrap">
                        00.0 // ORIGIN
                      </span>
                    )}
                    <span className="text-[10px] sm:text-xs leading-none text-cyan-200 drop-shadow-[0_0_8px_#22d3ee]">
                      ✦
                    </span>
                  </div>

                  {/* Multi-Layered Cyberpunk Cosmos Conduit & Stardust Wake */}
                  <div className="relative flex-1 w-8 sm:w-12 flex justify-center overflow-hidden">
                    {/* 1. Soft Cosmic Nebula Aura */}
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-5 sm:w-7 bg-gradient-to-b from-purple-500/5 via-fuchsia-500/20 to-cyan-400/30 blur-md" />

                    {/* 2. Twin Parallel Cyber-Telemetry Micro-Rails */}
                    <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-3.5 sm:w-4.5 border-x border-dashed border-cyan-300/20" />

                    {/* 3. Main Glowing Starlight Conduit Core */}
                    <div className="relative h-full w-[1.5px] bg-gradient-to-b from-purple-300/20 via-fuchsia-300/80 to-cyan-200 shadow-[0_0_10px_rgba(232,121,249,0.8),0_0_20px_rgba(34,211,238,0.65)]" />

                    {/* 4. Stardust Nodes along the Revealed Wake */}
                    <span className="absolute top-[28%] left-1/2 -translate-x-1/2 text-[7px] text-fuchsia-200/80 drop-shadow-[0_0_6px_#e879f9]">
                      ✦
                    </span>
                    <span className="absolute top-[62%] left-1/2 -translate-x-1/2 text-[8px] text-cyan-200/85 drop-shadow-[0_0_6px_#22d3ee]">
                      ✦
                    </span>
                  </div>

                  {/* Leading Quantum Flare right at Traceback II's core */}
                  <span className="h-2 w-2 shrink-0 rotate-45 bg-cyan-200 shadow-[0_0_12px_#22d3ee,0_0_24px_#e879f9]" />
                </div>

                {/* TRACEBACK II SPACESHIP ON THE VERTICAL ORBIT AXIS
                    - Left axis (left-4) on Phone, Center axis (left-1/2) on Tablet/PC
                    - No flanking stars, no circle, zero rotation
                    - Appears by gliding down from the top switcher bar (-56px) to its current position (orbitShipYRef) */}
                <div
                  ref={orbitShipRef}
                  className={`pointer-events-none absolute top-0 z-30 flex flex-col items-center select-none ${
                    isPhone ? 'left-4' : 'left-1/2'
                  }`}
                  style={{
                    transform: orbitShipAppeared
                      ? `translate3d(-50%, ${orbitShipYRef.current.toFixed(1)}px, 0) scale(1)`
                      : 'translate3d(-50%, -56px, 0) scale(0.86)',
                    opacity: orbitShipAppeared ? 1 : 0,
                    transition: orbitShipEntering
                      ? 'transform 680ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease-out'
                      : 'opacity 320ms ease-out',
                    willChange: 'transform, opacity',
                  }}
                >
                  {/* Ion Starlight Plume above the ship */}
                  <div
                    className="mb-0.5 flex flex-col items-center"
                    aria-hidden="true"
                  >
                    <div className="h-4 sm:h-6 w-[1.5px] bg-gradient-to-t from-cyan-200 via-fuchsia-300/60 to-transparent shadow-[0_0_10px_#22d3ee]" />
                  </div>

                  <img
                    src={TRACEBACK_SRC}
                    alt="Tàu Traceback II Orbit"
                    decoding="async"
                    className={`${
                      isPhone ? 'w-14' : 'w-20 sm:w-28 md:w-36 lg:w-44'
                    } h-auto object-contain select-none`}
                  />
                </div>

                {/* TIMELINE EVENT POINTS — All on Right for Phone; Alternating Left & Right for Tablet/PC */}
                <div className="relative z-20 flex flex-col">
                  {activeYearData.events.map((ev, idx) => {
                    const isLeft = !isPhone && idx % 2 === 0;
                    const isReached = Boolean(reachedEventMap[idx]);
                    return (
                      <div
                        key={ev.id}
                        ref={(el) => {
                          eventRowRefs.current[idx] = el;
                        }}
                        className={`relative flex w-full items-center transition-all duration-500 ease-out ${
                          isLeft ? 'justify-start' : 'justify-end'
                        } ${
                          idx > 0
                            ? isPhone
                              ? 'mt-5'
                              : '-mt-4 sm:-mt-10 md:-mt-16 lg:-mt-24'
                            : ''
                        } ${
                          isReached
                            ? 'opacity-100 translate-y-0 scale-100'
                            : 'pointer-events-none opacity-0 translate-y-6 scale-95'
                        }`}
                      >
                        {/* Cyberpunk Cosmos Diamond Node on the Axis */}
                        <div
                          className={`pointer-events-none absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${
                            isPhone ? 'left-4' : 'left-1/2'
                          }`}
                          aria-hidden="true"
                        >
                          <span className="h-3 w-3 sm:h-3.5 sm:w-3.5 rotate-45 border border-cyan-300/70 bg-[#14072b] shadow-[0_0_12px_rgba(34,211,238,0.6),0_0_20px_rgba(232,121,249,0.45)] flex items-center justify-center">
                            <span className="h-1 w-1 bg-fuchsia-200 shadow-[0_0_6px_#fff]" />
                          </span>
                        </div>

                        {/* Cyber-Cosmos Telemetry Bridge between Axis and Event Card */}
                        <div
                          className={`pointer-events-none absolute top-1/2 z-10 flex flex-col -translate-y-1/2 ${
                            isPhone
                              ? 'left-4 w-6 items-start'
                              : `${
                                  isLeft
                                    ? 'right-1/2 items-end'
                                    : 'left-1/2 items-start'
                                } w-[52px] sm:w-[82px] md:w-[106px] lg:w-[130px]`
                          }`}
                          aria-hidden="true"
                        >
                          <div
                            className={`h-[1px] w-full ${
                              isLeft
                                ? 'bg-gradient-to-l from-cyan-300/80 via-fuchsia-400/50 to-purple-300/15'
                                : 'bg-gradient-to-r from-cyan-300/80 via-fuchsia-400/50 to-purple-300/15'
                            } shadow-[0_0_8px_rgba(34,211,238,0.45)]`}
                          />
                        </div>

                        {/* Event Card: Full width to the right of left-axis on Phone; Half-width alternating on Tablet/PC */}
                        <article
                          role="button"
                          tabIndex={0}
                          aria-label={lang === 'VI' ? ev.titleVI : ev.titleEN}
                          onMouseEnter={() => {
                            if (isReached) soundFx.playHover();
                          }}
                          onClick={() => {
                            soundFx.playSelect();
                            setSelectedEventIndex(idx);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              soundFx.playSelect();
                              setSelectedEventIndex(idx);
                            }
                          }}
                          className={`group relative flex cursor-pointer flex-col overflow-hidden border border-purple-300/35 bg-[#120626]/95 shadow-[0_10px_30px_rgba(0,0,0,0.75)] transition-all duration-300 [content-visibility:auto] [contain-intrinsic-size:auto_220px] hover:-translate-y-1 hover:border-cyan-300/80 hover:shadow-[0_0_26px_rgba(34,211,238,0.35)] focus:outline-none focus:border-cyan-300 ${
                            isPhone
                              ? 'w-[calc(100%-44px)]'
                              : 'w-[calc(50%-52px)] sm:w-[calc(50%-82px)] md:w-[calc(50%-106px)] lg:w-[calc(50%-130px)]'
                          }`}
                        >
                          {/* Top-Left & Bottom-Right Cyberpunk Corner Brackets */}
                          <span
                            className="pointer-events-none absolute top-1.5 left-1.5 z-20 h-2.5 w-2.5 sm:h-3 sm:w-3 border-t-2 border-l-2 border-cyan-300/85"
                            aria-hidden="true"
                          />
                          <span
                            className="pointer-events-none absolute bottom-1.5 right-1.5 z-20 h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-r-2 border-fuchsia-400/85"
                            aria-hidden="true"
                          />

                          {/* Event Illustration Image — aspect-[16/9] reserves exact height before lazy decode */}
                          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1a0933]">
                            <img
                              src={ev.bannerImg}
                              alt={lang === 'VI' ? ev.titleVI : ev.titleEN}
                              loading={idx < 4 ? 'eager' : 'lazy'}
                              decoding="async"
                              onLoad={() => {
                                if (scrollContainerRef.current) {
                                  computeAndSyncOrbit(scrollContainerRef.current);
                                }
                              }}
                              className="block h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          </div>

                          {/* Event Time Bar Below Illustration */}
                          <div className="flex items-center justify-center gap-1.5 border-t border-fuchsia-400/25 bg-[#120626]/95 px-2.5 py-2 sm:px-4 sm:py-2.5">
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-cyan-300" />
                            <span className="font-mono text-[10px] sm:text-xs md:text-[13px] font-semibold tracking-[0.18em] text-purple-100 uppercase group-hover:text-cyan-200 transition-colors">
                              {ev.date}
                            </span>
                          </div>
                        </article>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

            {/* Back to Top (Traceback II Orbit) Button */}
            <div className="relative z-10 mt-8 sm:mt-10 flex justify-center">
              <button
                type="button"
                onMouseEnter={() => soundFx.playHover()}
                onClick={scrollToTopSection}
                className="inline-flex cursor-pointer items-center gap-2 border border-fuchsia-400/40 bg-[#16082e]/80 px-4 py-2 text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-purple-200 uppercase transition-all hover:border-cyan-300 hover:bg-fuchsia-950/70 hover:text-white hover:shadow-[0_0_18px_rgba(34,211,238,0.4)] focus:outline-none"
              >
                <span>{lang === 'VI' ? '▲ QUỸ ĐẠO' : '▲ ORBIT'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          EVENT DOSSIER MODAL (BẢNG THÔNG TIN SỰ KIỆN)
          Opens when user clicks any event card on the timeline
         ===================================================================== */}
      {activeModalEvent && activeYearData && selectedEventIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'VI' ? activeModalEvent.titleVI : activeModalEvent.titleEN}
          onClick={() => {
            soundFx.playBack();
            setSelectedEventIndex(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#06020f]/85 p-3 sm:p-5 md:p-8 backdrop-blur-md animate-[fadeIn_180ms_ease-out]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden border border-cyan-300/60 bg-[#110524]/95 shadow-[0_0_45px_rgba(34,211,238,0.25),0_0_80px_rgba(192,38,211,0.3)]"
          >
            {/* Cyberpunk Corner Brackets */}
            <span
              className="pointer-events-none absolute top-2 left-2 z-30 h-3.5 w-3.5 border-t-2 border-l-2 border-cyan-300"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute top-2 right-2 z-30 h-3.5 w-3.5 border-t-2 border-r-2 border-fuchsia-400"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute bottom-2 left-2 z-30 h-3.5 w-3.5 border-b-2 border-l-2 border-fuchsia-400"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute bottom-2 right-2 z-30 h-3.5 w-3.5 border-b-2 border-r-2 border-cyan-300"
              aria-hidden="true"
            />

            {/* Top Dossier Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-fuchsia-400/35 bg-[#190934]/95 px-4 py-3 sm:px-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span
                  className={`border px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-[0.16em] uppercase ${
                    activeModalEvent.accentColor === 'cyan'
                      ? 'border-cyan-300/60 bg-cyan-950/60 text-cyan-200'
                      : activeModalEvent.accentColor === 'amber'
                      ? 'border-amber-300/60 bg-amber-950/60 text-amber-200'
                      : 'border-fuchsia-300/60 bg-fuchsia-950/60 text-pink-200'
                  }`}
                >
                  {lang === 'VI' ? activeModalEvent.typeVI : activeModalEvent.typeEN}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline-block mr-1 font-mono text-[11px] tracking-[0.18em] text-purple-200/70">
                  {`${String(selectedEventIndex + 1).padStart(2, '0')} / ${String(
                    activeYearData.events.length
                  ).padStart(2, '0')}`}
                </span>

                <button
                  type="button"
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={() => {
                    soundFx.playSelect();
                    setSelectedEventIndex(
                      (selectedEventIndex - 1 + activeYearData.events.length) %
                        activeYearData.events.length
                    );
                  }}
                  title={lang === 'VI' ? 'Sự kiện trước' : 'Previous event'}
                  aria-label={lang === 'VI' ? 'Sự kiện trước' : 'Previous event'}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center border border-purple-300/35 bg-purple-950/60 text-purple-100 transition-all hover:border-cyan-300 hover:bg-fuchsia-900/50 hover:text-white focus:outline-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={() => {
                    soundFx.playSelect();
                    setSelectedEventIndex(
                      (selectedEventIndex + 1) % activeYearData.events.length
                    );
                  }}
                  title={lang === 'VI' ? 'Sự kiện tiếp theo' : 'Next event'}
                  aria-label={lang === 'VI' ? 'Sự kiện tiếp theo' : 'Next event'}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center border border-purple-300/35 bg-purple-950/60 text-purple-100 transition-all hover:border-cyan-300 hover:bg-fuchsia-900/50 hover:text-white focus:outline-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={() => {
                    soundFx.playBack();
                    setSelectedEventIndex(null);
                  }}
                  title={lang === 'VI' ? 'Đóng hồ sơ (ESC)' : 'Close dossier (ESC)'}
                  aria-label={lang === 'VI' ? 'Đóng hồ sơ' : 'Close dossier'}
                  className="ml-1 flex h-7 w-7 cursor-pointer items-center justify-center border border-pink-300/50 bg-fuchsia-950/70 text-pink-200 transition-all hover:border-cyan-300 hover:bg-fuchsia-800/80 hover:text-white focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <div className="cyber-events-scroll flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Full Event Banner Showcase */}
              <div className="relative aspect-[16/9] w-full overflow-hidden border border-purple-300/30 bg-[#0b0318] shadow-[0_8px_28px_rgba(0,0,0,0.8)]">
                <img
                  src={activeModalEvent.bannerImg}
                  alt={lang === 'VI' ? activeModalEvent.titleVI : activeModalEvent.titleEN}
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Event Title, Time (on new line below title), and External Link Button */}
              <div className="mt-4 sm:mt-5 flex flex-col gap-4">
                <div className="flex flex-col items-start gap-2.5 border-b border-fuchsia-400/25 pb-3.5">
                  <h3
                    className="text-base sm:text-xl md:text-2xl font-bold tracking-[0.06em] text-white"
                    style={{
                      textShadow: '0 0 16px rgba(34,211,238,0.45)',
                    }}
                  >
                    {lang === 'VI' ? activeModalEvent.titleVI : activeModalEvent.titleEN}
                  </h3>

                  <div className="inline-flex items-center gap-1.5 border border-cyan-300/40 bg-[#180833]/90 px-3 py-1">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                    <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.16em] text-cyan-100 uppercase">
                      {activeModalEvent.date}
                    </span>
                  </div>
                </div>

                {/* External Link Button (replaces HỒ SƠ CHI TIẾT SỰ KIỆN) */}
                <div className="flex items-center justify-start">
                  <a
                    href={activeModalEvent.linkUrl || '#'}
                    target={
                      activeModalEvent.linkUrl && activeModalEvent.linkUrl !== '#'
                        ? '_blank'
                        : undefined
                    }
                    rel={
                      activeModalEvent.linkUrl && activeModalEvent.linkUrl !== '#'
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    onMouseEnter={() => soundFx.playHover()}
                    onClick={(e) => {
                      soundFx.playSelect();
                      if (!activeModalEvent.linkUrl || activeModalEvent.linkUrl === '#') {
                        e.preventDefault();
                      }
                    }}
                    className="group relative inline-flex w-full sm:w-auto cursor-pointer items-center justify-center gap-2.5 border border-cyan-300/65 bg-gradient-to-r from-[#1d093d] via-[#2e0c5e] to-[#1d093d] px-5 py-2.5 text-xs sm:text-sm font-bold tracking-[0.18em] text-cyan-100 uppercase shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all duration-300 hover:border-cyan-200 hover:from-fuchsia-900/70 hover:via-purple-800/80 hover:to-cyan-900/70 hover:text-white hover:shadow-[0_0_28px_rgba(34,211,238,0.5)] focus:outline-none"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0 text-cyan-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <span>
                      {lang === 'VI'
                        ? 'XEM CHI TIẾT SỰ KIỆN'
                        : 'VIEW EVENT DETAILS'}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-fuchsia-300 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
