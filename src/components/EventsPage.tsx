import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
} from 'lucide-react';
import { soundFx } from '../utils/soundFx';
import { SiteHeader } from './SiteHeader';

const TYPEWRITER_CHAR_DELAY_MS = 32;
const CARD_REVEAL_DURATION_MS = 300;
const YEAR_CARD_STAGGER_MS = 90;
const EVENT_CARD_STAGGER_MS = 80;

const GLITCH_STAGGER_MS = 90;
const GLITCH_DURATION_MS = 350;
const GLITCH_PHASE_END_MS = 700;
const LOCK_COORD_DURATION_MS = 800;
const TIMELINE_REVEAL_MS = 1500; // GLITCH_PHASE_END_MS (700) + LOCK_COORD_DURATION_MS (800)

const REDUCED_FADE_DURATION_MS = 150;
const REDUCED_LOCK_DURATION_MS = 400;
const REDUCED_TIMELINE_REVEAL_MS = 550; // 150 + 400

let hasRadarTypedOnPageLoad = false;

interface EventsPageProps {
  lang: 'VI' | 'EN';
  isPhone: boolean;
  activeYear?: '2024' | '2025' | '2026' | null;
  activeEventId?: string | null;
  skipTransition?: boolean;
  onNavigate?: (slug: string, options?: { skipRouterTransition?: boolean }) => void;
  onToggleLang?: () => void;
  onBackHome: () => void;
}

type EventYear = '2024' | '2025' | '2026';
type YearTransitionPhase = 'idle' | 'glitching' | 'locking' | 'timeline';

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
  isClickable?: boolean;
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Mở Đặt Trước Toàn Cầu',
        titleEN: 'Pre-Order',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Thử Nghiệm Giới Hạn',
        titleEN: 'Closed Beta Test',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Đạt Mốc 10 Triệu Đăng Ký',
        titleEN: '10000000 Pre-Registrations',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Chính Thức Ra Mắt',
        titleEN: 'Official Release',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Rung Động Đầu Tiên',
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
        typeVI: 'MULTI',
        typeEN: 'MULTI',
        titleVI: 'Lời Trao Thầm Kín',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'La Bàn Chiêm Tinh',
        titleEN: 'Oracle of Stars',
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
        typeVI: 'MULTI',
        typeEN: 'MULTI',
        titleVI: 'Ánh Nhìn Vấn Vương',
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
        typeVI: 'Secret Promise',
        typeEN: 'Secret Promise',
        titleVI: 'Đốn Ngã',
        titleEN: 'Succumb',
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
        typeVI: 'Heartfelt Gift',
        typeEN: 'Heartfelt Gift',
        titleVI: 'Dư Vị Đặc Biệt',
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
        typeVI: 'Story',
        typeEN: 'Story',
        titleVI: 'Thế Giới Ngầm',
        titleEN: 'World Underneath',
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
        typeVI: 'SOLO',
        typeEN: 'SOLO',
        titleVI: 'Xúc Cảm Mơ Hồ',
        titleEN: 'Faint Sensation',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Nhịp Điệu Thường Ngày',
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
    coverImg: '/assets/aistudio/2025-0_059a465e.webp',
    badgeTextVI: '03 SỰ KIỆN',
    badgeTextEN: '03 EVENTS',
    glowClass: 'from-fuchsia-500/35 via-purple-900/45 to-[#090414]/95',
    borderClass: 'border-fuchsia-400/60 hover:border-pink-300',
    accentHex: '#e879f9',
    events: [
      {
        id: '2025-0',
        date: '31/12/2024 - 19/1/2025',
        typeVI: 'MULTI',
        typeEN: 'MULTI',
        titleVI: 'Điểm Hẹn Đêm Khuya',
        titleEN: 'Nightly Rendezvous',
        summaryVI:
          'Đại sự kiện Ước Nguyện Giới Hạn mở màn kỷ niệm 1 năm ra mắt với chuỗi ký ức 5 sao nồng nhiệt và quyến rũ, bao gồm ký ức giới hạn Xavier: Misty Silhouette.',
        summaryEN:
          '1st Anniversary Limited Wish Pool showcasing passionate 5-Star Memories, featuring the limited Memory Xavier: Misty Silhouette.',
        bannerImg: '/assets/aistudio/2025-0_059a465e.webp',
        accentColor: 'fuchsia',
      },
      {
        id: '2025-1',
        date: '31/12/2024 - 19/1/2025',
        typeVI: 'SỰ KIỆN KỶ NIỆM',
        typeEN: 'ANNIVERSARY EVENT',
        titleVI: 'Hành Trình Yêu Thương',
        titleEN: 'Touring In Love',
        summaryVI:
          'Sự kiện lễ hội kỷ niệm đặc biệt Touring In Love với hành trình du ngoạn Chibi, cốt truyện kỷ niệm ngọt ngào và cửa hàng phúc lợi đổi miễn phí ký ức 4 sao cùng nhiều vật phẩm giới hạn.',
        summaryEN:
          'Special Anniversary festival event Touring In Love featuring Chibi travel adventures, commemorative stories, and an event shop with free 4-Star Memories and limited rewards.',
        bannerImg: '/assets/aistudio/2025-1_553abbad.webp',
        accentColor: 'amber',
      },
      {
        id: '2025-2',
        date: '31/12/2024 - 19/1/2025',
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Hội Chứng Tương Tư',
        titleEN: 'Love Syndrome',
        summaryVI:
          'Ký ức 4 sao phúc lợi Xavier: Love Syndrome nhận miễn phí trong sự kiện kỷ niệm Touring In Love — khoảnh khắc bình yên khi cùng anh tựa đầu chìm vào giấc ngủ ấm áp.',
        summaryEN:
          'Free welfare 4-Star Memory Xavier: Love Syndrome obtainable during the Touring In Love event — a tender, cozy moment dozing off together side by side.',
        bannerImg: '/assets/aistudio/2025-2_df0a0e0f.webp',
        accentColor: 'cyan',
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
    badgeTextVI: '20 SỰ KIỆN',
    badgeTextEN: '20 EVENTS',
    glowClass: 'from-pink-500/35 via-indigo-900/45 to-[#090414]/95',
    borderClass: 'border-pink-400/55 hover:border-cyan-300',
    accentHex: '#f472b6',
    events: [
      {
        id: '2026-0',
        date: '18/12/2025 - 2/1/2026',
        typeVI: 'Heartfelt Gift',
        typeEN: 'Heartfelt Gift',
        titleVI: 'Khoảnh Khắc Trân Quý',
        titleEN: 'Precious Moment',
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
        typeVI: 'MULTI',
        typeEN: 'MULTI',
        titleVI: 'Ngai Thần Tình Ái',
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
        typeVI: 'Collaboration',
        typeEN: 'Collaboration',
        titleVI: 'Hình Tượng Thi Ca',
        titleEN: 'Poetic Figures',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Ảo Cảnh Giao Thoa',
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
        typeVI: 'Secret Promise',
        typeEN: 'Secret Promise',
        titleVI: 'Vòng Tay Ánh Lửa',
        titleEN: 'Firelit Embrace',
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
        typeVI: 'Story',
        typeEN: 'Story',
        titleVI: 'Gửi Ngày Hôm Qua Của Chúng Ta',
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
        typeVI: 'MULTI',
        typeEN: 'MULTI',
        titleVI: 'Sự Dịu Dàng Nơi Trần Thế',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Lộc Xuân Tràn Đầy',
        titleEN: 'Wealth Overflow',
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
        typeVI: 'SOLO',
        typeEN: 'SOLO',
        titleVI: 'Phút Giây Bình Yên',
        titleEN: 'Tranquil Moments',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Sưởi Ấm Tâm Hồn',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Bước Nhảy Tí Tách',
        titleEN: 'Tiptap Hop',
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
        typeVI: 'Story',
        typeEN: 'Story',
        titleVI: 'Thế Giới Ngầm',
        titleEN: 'World Underneath',
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
        typeVI: 'MULTI',
        typeEN: 'MULTI',
        titleVI: 'Khát Khao Vương Vấn',
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
        typeVI: 'Event',
        typeEN: 'Event',
        titleVI: 'Trau Chuốt Tháng Năm',
        titleEN: 'Moments Refined',
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
        typeVI: 'MULTI',
        typeEN: 'MULTI',
        titleVI: 'Thuở Ấy Qua Từng Khung Hình',
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
        typeVI: 'Collaboration',
        typeEN: 'Collaboration',
        titleVI: 'Túi Gấm Đơm Hương',
        titleEN: 'A Scented Sachet',
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
        typeVI: 'MULTI',
        typeEN: 'MULTI',
        titleVI: 'Đêm Bất Tận',
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
        typeVI: 'Sinh nhật',
        typeEN: 'Birthday',
        titleVI: 'Vệt Sáng Vấn Vương',
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
        typeVI: 'Collaboration',
        typeEN: 'Collaboration',
        titleVI: 'Tình Là Thật',
        titleEN: 'Love Is Real',
        summaryVI:
          'Sự kiện hợp tác bom tấn giữa Love and Deepspace và tuyệt tác Cyberpunk Blade Runner 2049 với thông điệp "Love is real. All for you." giữa ánh đèn neon tím rực rỡ.',
        summaryEN:
          'Blockbuster crossover collaboration between Love and Deepspace and the sci-fi masterpiece Blade Runner 2049 — "Love is real. All for you." bathed in neon cyberpunk light.',
        bannerImg: '/assets/aistudio/2026-18_613eacc6.webp',
        accentColor: 'cyan',
        isClickable: true,
      },
      {
        id: '2026-20',
        date: '11/2026',
        typeVI: 'MULTI',
        typeEN: 'MULTI',
        titleVI: 'Tái Sinh Ước Mộng',
        titleEN: 'Rebooting Dreams',
        summaryVI:
          'Đại sự kiện Ước Nguyện Giới Hạn chủ đề Cyberpunk viễn tưởng, nơi Xavier xuất hiện trong tạo hình chiến thuật tương lai sắc lạnh giữa thế giới công nghệ tái sinh.',
        summaryEN:
          'Futuristic Cyberpunk Limited Wish Pool featuring Xavier in a sleek cyber-tactical persona amidst a world of rebooted dreams.',
        bannerImg: '/assets/aistudio/2026-20_df313ead.webp',
        accentColor: 'fuchsia',
      },
    ],
  },
];

export const EventsPage: React.FC<EventsPageProps> = ({
  lang,
  isPhone,
  activeYear: externalYear = null,
  activeEventId: externalEventId = null,
  skipTransition = false,
  onNavigate,
  onToggleLang,
  onBackHome,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const yearSectionRef = useRef<HTMLElement | null>(null);
  const timelineHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const hudContainerRef = useRef<HTMLDivElement | null>(null);
  const heroShipRef = useRef<HTMLDivElement | null>(null);
  const bgCloudsRef = useRef<HTMLDivElement | null>(null);
  const fgCloudsRef = useRef<HTMLDivElement | null>(null);
  const orbitTrackRef = useRef<HTMLDivElement | null>(null);
  const orbitShipRef = useRef<HTMLDivElement | null>(null);
  const orbitWakeRef = useRef<HTMLDivElement | null>(null);
  const orbitAltLabelRef = useRef<HTMLSpanElement | null>(null);
  const orbitShipYRef = useRef<number>(0);
  const orbitShipAppearedRef = useRef<boolean>(false);
  const eventRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const enterTimerRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const measureRafRef = useRef<number | null>(null);

  // Smooth inertial scroll tracking for Section 1 Ship & Clouds + Timeline Orbit
  const targetScrollTopRef = useRef<number>(0);
  const smoothScrollTopRef = useRef<number>(0);
  const cloudsPausedRef = useRef<boolean>(false);

  // Cached Timeline DOM geometry so scrolling performs 0 layout reads per frame
  const orbitMetricsRef = useRef<{
    viewportH: number;
    scrollHeight: number;
    sectionTop: number;
    trackTopInScroll: number;
    trackHeight: number;
    rowTriggerYs: number[];
  } | null>(null);

  const isTransitioningRef = useRef<boolean>(false);
  const typewriterIntervalRef = useRef<number | null>(null);
  const cardRevealSettleTimerRef = useRef<number | null>(null);
  const glitchPhaseTimerRef = useRef<number | null>(null);
  const revealTimelineTimerRef = useRef<number | null>(null);
  const eventStaggerDoneTimerRef = useRef<number | null>(null);

  const isReducedMotionPreferred = useCallback(() => {
    return (
      typeof window !== 'undefined' &&
      Boolean(
        window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
    );
  }, []);

  // Selected year ('2024' | '2025' | '2026' | null) when user clicks one of the 3 year cards
  const [selectedYear, setSelectedYear] = useState<EventYear | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<YearTransitionPhase>('idle');
  // Selected event index inside activeYearData.events for the Event Dossier Modal
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  // Controls the "appear from top bar down to current position" animation of Traceback II
  const [orbitShipAppeared, setOrbitShipAppeared] = useState<boolean>(false);
  const [orbitShipEntering, setOrbitShipEntering] = useState<boolean>(false);
  // Tracks which event rows Traceback II has reached along the vertical axis
  const [reachedEventMap, setReachedEventMap] = useState<Record<number, boolean>>({});
  const [timelineEventsStaggering, setTimelineEventsStaggering] = useState<boolean>(false);

  const radarBodyText =
    lang === 'VI'
      ? 'Hãy điều chỉnh radar và chọn tọa độ để đáp xuống.'
      : 'Adjust your radar and select a coordinate for landing.';
  const radarBodyTextRef = useRef<string>(radarBodyText);
  radarBodyTextRef.current = radarBodyText;

  const [typedCharCount, setTypedCharCount] = useState<number>(() =>
    hasRadarTypedOnPageLoad ? radarBodyText.length : 0
  );
  const [isRadarTypedDone, setIsRadarTypedDone] = useState<boolean>(
    () => hasRadarTypedOnPageLoad
  );
  const [yearCardsRevealStage, setYearCardsRevealStage] = useState<
    'hidden' | 'revealing' | 'settled'
  >(() => (hasRadarTypedOnPageLoad ? 'settled' : 'hidden'));

  const lockPageScroll = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.overflowY = 'hidden';
    }
  }, []);

  const unlockPageScroll = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.overflowY = '';
    }
  }, []);

  const clearAllTransitionTimers = useCallback(() => {
    if (glitchPhaseTimerRef.current !== null) {
      window.clearTimeout(glitchPhaseTimerRef.current);
      glitchPhaseTimerRef.current = null;
    }
    if (revealTimelineTimerRef.current !== null) {
      window.clearTimeout(revealTimelineTimerRef.current);
      revealTimelineTimerRef.current = null;
    }
    if (eventStaggerDoneTimerRef.current !== null) {
      window.clearTimeout(eventStaggerDoneTimerRef.current);
      eventStaggerDoneTimerRef.current = null;
    }
    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
  }, []);

  const clearTypewriterTimers = useCallback(() => {
    if (typewriterIntervalRef.current !== null) {
      window.clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }
    if (cardRevealSettleTimerRef.current !== null) {
      window.clearTimeout(cardRevealSettleTimerRef.current);
      cardRevealSettleTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearAllTransitionTimers();
      clearTypewriterTimers();
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      if (measureRafRef.current !== null) {
        window.cancelAnimationFrame(measureRafRef.current);
        measureRafRef.current = null;
      }
      unlockPageScroll();
      isTransitioningRef.current = false;
    };
  }, [clearAllTransitionTimers, clearTypewriterTimers, unlockPageScroll]);

  useEffect(() => {
    if (isRadarTypedDone || hasRadarTypedOnPageLoad) {
      setTypedCharCount(radarBodyText.length);
    }
  }, [lang, radarBodyText.length, isRadarTypedDone]);

  useEffect(() => {
    const sectionEl = yearSectionRef.current;
    if (!sectionEl) return;

    if (hasRadarTypedOnPageLoad || isReducedMotionPreferred()) {
      hasRadarTypedOnPageLoad = true;
      setTypedCharCount(radarBodyTextRef.current.length);
      setIsRadarTypedDone(true);
      setYearCardsRevealStage('settled');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || !entry.isIntersecting) return;

        observer.disconnect();

        if (hasRadarTypedOnPageLoad || isReducedMotionPreferred()) {
          hasRadarTypedOnPageLoad = true;
          setTypedCharCount(radarBodyTextRef.current.length);
          setIsRadarTypedDone(true);
          setYearCardsRevealStage('settled');
          return;
        }

        hasRadarTypedOnPageLoad = true;
        let currentIdx = 0;
        setTypedCharCount(0);

        typewriterIntervalRef.current = window.setInterval(() => {
          currentIdx += 1;
          const totalLen = radarBodyTextRef.current.length;
          setTypedCharCount(currentIdx);

          if (currentIdx >= totalLen) {
            if (typewriterIntervalRef.current !== null) {
              window.clearInterval(typewriterIntervalRef.current);
              typewriterIntervalRef.current = null;
            }
            setIsRadarTypedDone(true);
            setYearCardsRevealStage('revealing');

            cardRevealSettleTimerRef.current = window.setTimeout(() => {
              setYearCardsRevealStage('settled');
              cardRevealSettleTimerRef.current = null;
            }, CARD_REVEAL_DURATION_MS + YEAR_ARCHIVES.length * YEAR_CARD_STAGGER_MS + 40);
          }
        }, TYPEWRITER_CHAR_DELAY_MS);
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.25,
      }
    );

    observer.observe(sectionEl);

    return () => {
      observer.disconnect();
    };
  }, [isReducedMotionPreferred]);

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
      const shouldPauseClouds = !cloudsVisible || document.hidden;
      if (cloudsPausedRef.current !== shouldPauseClouds) {
        cloudsPausedRef.current = shouldPauseClouds;
        if (bgCloudsRef.current) {
          bgCloudsRef.current.style.visibility = cloudsVisible ? 'visible' : 'hidden';
          bgCloudsRef.current.classList.toggle('events-clouds-paused', shouldPauseClouds);
        }
        if (fgCloudsRef.current) {
          fgCloudsRef.current.style.visibility = cloudsVisible ? 'visible' : 'hidden';
          fgCloudsRef.current.classList.toggle('events-clouds-paused', shouldPauseClouds);
        }
        if (heroShipRef.current) {
          heroShipRef.current.classList.toggle('events-clouds-paused', shouldPauseClouds);
        }
      }
    },
    [isPhone]
  );

  // Pause cloud & ship CSS animations when the browser tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      const pause = document.hidden || cloudsPausedRef.current;
      bgCloudsRef.current?.classList.toggle('events-clouds-paused', pause);
      fgCloudsRef.current?.classList.toggle('events-clouds-paused', pause);
      heroShipRef.current?.classList.toggle('events-clouds-paused', pause);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    targetScrollTopRef.current = 0;
    smoothScrollTopRef.current = 0;
    cloudsPausedRef.current = false;
    if (scrollContainerRef.current && !externalYear) {
      scrollContainerRef.current.scrollTop = 0;
    }
    syncSection1DomNodes(0, 0);
  }, [syncSection1DomNodes, externalYear]);

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
      if (orbitAltLabelRef.current) {
        const altVal = Math.max(0, y / 42).toFixed(1).padStart(4, '0');
        orbitAltLabelRef.current.textContent = `ALT ${altVal}`;
      }
    },
    [isPhone]
  );

  // Measure and cache Timeline DOM geometry once on open / resize / image load (never during scroll)
  const measureTimelineMetrics = useCallback(() => {
    const el = scrollContainerRef.current;
    const trackEl = orbitTrackRef.current;
    if (!el || !trackEl) {
      orbitMetricsRef.current = null;
      return;
    }

    const viewportH = el.clientHeight || window.innerHeight || 800;
    const scrollHeight = el.scrollHeight;
    const scrollTop = el.scrollTop;
    const trackRect = trackEl.getBoundingClientRect();
    const containerRect = el.getBoundingClientRect();
    const trackTopInScroll = trackRect.top - containerRect.top + scrollTop;
    const trackHeight = trackRect.height;
    const sectionTop = yearSectionRef.current ? yearSectionRef.current.offsetTop : 0;

    const rowTriggerYs: number[] = [];
    eventRowRefs.current.forEach((rowEl, idx) => {
      if (!rowEl) return;
      const parentOffsetTop = (rowEl.offsetParent as HTMLElement)?.offsetTop || 0;
      const rowTopInTrack = parentOffsetTop + rowEl.offsetTop;
      rowTriggerYs[idx] =
        rowTopInTrack + Math.min(rowEl.offsetHeight * 0.18, isPhone ? 32 : 52);
    });

    orbitMetricsRef.current = {
      viewportH,
      scrollHeight,
      sectionTop,
      trackTopInScroll,
      trackHeight,
      rowTriggerYs,
    };
  }, [isPhone]);

  const computeAndSyncOrbit = useCallback(
    (el: HTMLDivElement, currentScrollTop?: number) => {
      if (!orbitTrackRef.current) return;
      if (!orbitMetricsRef.current) {
        measureTimelineMetrics();
      }
      const metrics = orbitMetricsRef.current;
      if (!metrics) return;

      const scrollTop = currentScrollTop ?? el.scrollTop;
      const { viewportH, scrollHeight, sectionTop, trackTopInScroll, trackHeight, rowTriggerYs } =
        metrics;
      const trackTopInContainer = trackTopInScroll - scrollTop;
      const trackBottomInContainer = trackTopInContainer + trackHeight;

      const shipH = isPhone ? 96 : 165;
      const maxScroll = Math.max(1, scrollHeight - viewportH);
      const bottomZone = viewportH * 0.45;
      const nearBottomRatio = Math.max(
        0,
        Math.min(1, (scrollTop - (maxScroll - bottomZone)) / Math.max(1, bottomZone))
      );
      const anchorY = viewportH * (0.48 + nearBottomRatio * 0.34);
      const rawOrbitY = anchorY - trackTopInContainer;
      const maxOrbitY = Math.max(0, trackHeight - shipH);

      const timelineScrollDelta = Math.max(0, scrollTop - sectionTop);
      const rampRatio = Math.min(1, timelineScrollDelta / Math.max(1, viewportH * 0.25));
      const clampedOrbitY = Math.max(0, Math.min(maxOrbitY, rawOrbitY * rampRatio));

      // Pure math comparison against cached rowTriggerYs (0 DOM reads)
      const shipFrontY = clampedOrbitY + (isPhone ? 68 : 112);
      const viewportReachY = Math.max(
        shipFrontY + (isPhone ? 45 : 85),
        viewportH - trackTopInContainer - 40
      );
      const nextReached: Record<number, boolean> = {};
      for (let idx = 0; idx < rowTriggerYs.length; idx++) {
        const triggerY = rowTriggerYs[idx];
        if (triggerY !== undefined && (idx === 0 || viewportReachY >= triggerY)) {
          nextReached[idx] = true;
        }
      }

      const isTrackVisible =
        trackTopInContainer < viewportH * 0.92 && trackBottomInContainer > 20;
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
    [isPhone, measureTimelineMetrics, syncOrbitDomNodes]
  );

  const scheduleMeasureAndSyncOrbit = useCallback(() => {
    if (measureRafRef.current !== null) return;
    measureRafRef.current = window.requestAnimationFrame(() => {
      measureRafRef.current = null;
      measureTimelineMetrics();
      if (scrollContainerRef.current) {
        computeAndSyncOrbit(scrollContainerRef.current);
      }
    });
  }, [computeAndSyncOrbit, measureTimelineMetrics]);

  // Keep cached timeline metrics automatically updated on container or track resize
  useEffect(() => {
    if (transitionPhase !== 'timeline') {
      orbitMetricsRef.current = null;
      return;
    }

    scheduleMeasureAndSyncOrbit();
    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      scheduleMeasureAndSyncOrbit();
    });

    if (orbitTrackRef.current) ro.observe(orbitTrackRef.current);
    if (scrollContainerRef.current) ro.observe(scrollContainerRef.current);

    return () => {
      ro.disconnect();
    };
  }, [transitionPhase, selectedYear, scheduleMeasureAndSyncOrbit]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      targetScrollTopRef.current = el.scrollTop;

      if (scrollRafRef.current !== null) return;

      const stepSmoothScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) {
          scrollRafRef.current = null;
          return;
        }

        const targetTop = targetScrollTopRef.current;
        const currentSmooth = smoothScrollTopRef.current;
        const diff = targetTop - currentSmooth;
        const reduced = isReducedMotionPreferred();

        // Snap immediately on reduced motion, tiny sub-pixel delta, or large programmatic jump
        let nextTop: number;
        let shouldContinue = false;
        if (reduced || Math.abs(diff) < 0.25 || Math.abs(diff) > 650) {
          nextTop = targetTop;
        } else {
          nextTop = currentSmooth + diff * 0.26;
          shouldContinue = true;
        }
        smoothScrollTopRef.current = nextTop;

        const viewportH =
          orbitMetricsRef.current?.viewportH ||
          container.clientHeight ||
          window.innerHeight ||
          800;
        const maxSection1Scroll = viewportH * 1.15;
        const clampedTop = Math.min(nextTop, maxSection1Scroll);
        const rawProgress = nextTop / (viewportH * 1.05);
        const clampedProgress = Math.max(0, Math.min(1, rawProgress));

        // Direct DOM update for Section 1 (0 React re-renders during scroll)
        syncSection1DomNodes(clampedTop, clampedProgress);

        // Update Traceback II vertical orbit position & progressive event reveal along the central axis
        computeAndSyncOrbit(container, nextTop);

        if (shouldContinue) {
          scrollRafRef.current = window.requestAnimationFrame(stepSmoothScroll);
        } else {
          scrollRafRef.current = null;
        }
      };

      scrollRafRef.current = window.requestAnimationFrame(stepSmoothScroll);
    },
    [computeAndSyncOrbit, isReducedMotionPreferred, syncSection1DomNodes]
  );

  const scrollToTopSection = useCallback(() => {
    soundFx.playSelect();
    clearAllTransitionTimers();
    clearTypewriterTimers();
    unlockPageScroll();
    isTransitioningRef.current = false;

    hasRadarTypedOnPageLoad = true;
    setTypedCharCount(radarBodyTextRef.current.length);
    setIsRadarTypedDone(true);
    setYearCardsRevealStage('settled');
    setTimelineEventsStaggering(false);

    setTransitionPhase('idle');
    setSelectedYear(null);
    setSelectedEventIndex(null);
    eventRowRefs.current = [];
    orbitShipAppearedRef.current = false;
    orbitShipYRef.current = 0;
    setOrbitShipAppeared(false);
    setOrbitShipEntering(false);
    setReachedEventMap({});

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (onNavigate) {
      onNavigate('events', { skipRouterTransition: true });
    }
  }, [clearAllTransitionTimers, clearTypewriterTimers, onNavigate, unlockPageScroll]);

  const handleSelectYearCard = useCallback(
    (yr: EventYear, updateUrl = true) => {
      if (isTransitioningRef.current || transitionPhase !== 'idle') {
        return;
      }

      if (updateUrl) {
        soundFx.playSelect();
        if (onNavigate) {
          onNavigate(`events/${yr}`, { skipRouterTransition: true });
        }
      }

      isTransitioningRef.current = true;
      clearAllTransitionTimers();
      clearTypewriterTimers();

      hasRadarTypedOnPageLoad = true;
      setTypedCharCount(radarBodyTextRef.current.length);
      setIsRadarTypedDone(true);
      setYearCardsRevealStage('settled');

      setSelectedYear(yr);
      setSelectedEventIndex(null);
      eventRowRefs.current = [];
      setReachedEventMap({});
      orbitShipAppearedRef.current = false;
      orbitShipYRef.current = 0;
      setOrbitShipAppeared(false);
      setOrbitShipEntering(false);
      lockPageScroll();

      const reduced = isReducedMotionPreferred();
      const glitchPhaseEnd = reduced ? REDUCED_FADE_DURATION_MS : GLITCH_PHASE_END_MS;
      const timelineRevealAt = reduced ? REDUCED_TIMELINE_REVEAL_MS : TIMELINE_REVEAL_MS;

      setTransitionPhase('glitching');

      glitchPhaseTimerRef.current = window.setTimeout(() => {
        glitchPhaseTimerRef.current = null;
        setTransitionPhase('locking');
      }, glitchPhaseEnd);

      revealTimelineTimerRef.current = window.setTimeout(() => {
        revealTimelineTimerRef.current = null;
        unlockPageScroll();
        isTransitioningRef.current = false;

        orbitShipAppearedRef.current = true;
        orbitShipYRef.current = 0;
        setOrbitShipAppeared(true);
        setOrbitShipEntering(!reduced);
        setTimelineEventsStaggering(!reduced);
        setTransitionPhase('timeline');

        if (!reduced) {
          enterTimerRef.current = window.setTimeout(() => {
            setOrbitShipEntering(false);
            enterTimerRef.current = null;
          }, 680);

          eventStaggerDoneTimerRef.current = window.setTimeout(() => {
            setTimelineEventsStaggering(false);
            eventStaggerDoneTimerRef.current = null;
          }, CARD_REVEAL_DURATION_MS + 4 * EVENT_CARD_STAGGER_MS + 80);
        }

        window.requestAnimationFrame(() => {
          if (scrollContainerRef.current && yearSectionRef.current) {
            const targetY = yearSectionRef.current.offsetTop;
            targetScrollTopRef.current = targetY;
            smoothScrollTopRef.current = targetY;
            scrollContainerRef.current.scrollTo({
              top: targetY,
              behavior: 'auto',
            });
            measureTimelineMetrics();
            computeAndSyncOrbit(scrollContainerRef.current, targetY);
          }
          timelineHeadingRef.current?.focus({ preventScroll: true });
        });
      }, timelineRevealAt);
    },
    [
      clearAllTransitionTimers,
      clearTypewriterTimers,
      computeAndSyncOrbit,
      isReducedMotionPreferred,
      lockPageScroll,
      measureTimelineMetrics,
      onNavigate,
      transitionPhase,
      unlockPageScroll,
    ]
  );

  const handleSelectYearTab = useCallback(
    (yr: EventYear | null, updateUrl = true) => {
      if (updateUrl) {
        soundFx.playSelect();
        if (onNavigate) {
          onNavigate(yr ? `events/${yr}` : 'events', { skipRouterTransition: true });
        }
      }
      clearAllTransitionTimers();
      unlockPageScroll();
      isTransitioningRef.current = false;

      if (yr === null) {
        hasRadarTypedOnPageLoad = true;
        setTypedCharCount(radarBodyTextRef.current.length);
        setIsRadarTypedDone(true);
        setYearCardsRevealStage('settled');
        setTimelineEventsStaggering(false);
        setTransitionPhase('idle');
        setSelectedYear(null);
        setSelectedEventIndex(null);
        eventRowRefs.current = [];
        orbitShipAppearedRef.current = false;
        orbitShipYRef.current = 0;
        setOrbitShipAppeared(false);
        setReachedEventMap({});
        return;
      }

      const reduced = isReducedMotionPreferred() || !updateUrl;
      setSelectedYear(yr);
      setSelectedEventIndex(null);
      eventRowRefs.current = [];
      setReachedEventMap({});
      orbitShipAppearedRef.current = true;
      orbitShipYRef.current = 0;
      setOrbitShipAppeared(true);
      setOrbitShipEntering(!reduced);
      setTimelineEventsStaggering(!reduced);
      setTransitionPhase('timeline');

      if (!reduced) {
        eventStaggerDoneTimerRef.current = window.setTimeout(() => {
          setTimelineEventsStaggering(false);
          eventStaggerDoneTimerRef.current = null;
        }, CARD_REVEAL_DURATION_MS + 4 * EVENT_CARD_STAGGER_MS + 80);
      }

      window.requestAnimationFrame(() => {
        if (scrollContainerRef.current && yearSectionRef.current) {
          const targetY = yearSectionRef.current.offsetTop;
          targetScrollTopRef.current = targetY;
          smoothScrollTopRef.current = targetY;
          scrollContainerRef.current.scrollTo({
            top: targetY,
            behavior: 'auto',
          });
          measureTimelineMetrics();
          computeAndSyncOrbit(scrollContainerRef.current, targetY);
        }
        timelineHeadingRef.current?.focus({ preventScroll: true });
      });
    },
    [
      clearAllTransitionTimers,
      computeAndSyncOrbit,
      isReducedMotionPreferred,
      measureTimelineMetrics,
      onNavigate,
      unlockPageScroll,
    ]
  );

  useEffect(() => {
    if (externalYear !== selectedYear) {
      if (externalYear === null) {
        handleSelectYearTab(null, false);
      } else if (skipTransition) {
        handleSelectYearTab(externalYear, false);
      } else if (transitionPhase === 'idle' && !isTransitioningRef.current) {
        if (scrollContainerRef.current && yearSectionRef.current) {
          const targetY = yearSectionRef.current.offsetTop;
          targetScrollTopRef.current = targetY;
          smoothScrollTopRef.current = targetY;
          scrollContainerRef.current.scrollTo({ top: targetY, behavior: 'auto' });
        }
        handleSelectYearCard(externalYear, false);
      }
    }
  }, [
    externalYear,
    selectedYear,
    skipTransition,
    transitionPhase,
    handleSelectYearTab,
    handleSelectYearCard,
  ]);

  useEffect(() => {
    if (!externalEventId) {
      if (selectedEventIndex !== null) {
        setSelectedEventIndex(null);
      }
      return;
    }
    const yrData = YEAR_ARCHIVES.find((y) => y.year === (externalYear ?? selectedYear));
    if (!yrData) return;
    const evIdx = yrData.events.findIndex((e) => e.id === externalEventId && e.isClickable);
    if (evIdx >= 0 && evIdx !== selectedEventIndex) {
      setSelectedEventIndex(evIdx);
    }
  }, [externalEventId, externalYear, selectedYear, selectedEventIndex]);

  const handleCloseEventModal = useCallback(() => {
    soundFx.playBack();
    setSelectedEventIndex(null);
    if (onNavigate && selectedYear) {
      onNavigate(`events/${selectedYear}`, { skipRouterTransition: true });
    }
  }, [onNavigate, selectedYear]);

  const CLOUD3_SRC = '/assets/aistudio/cloud3_ca9fa321.webp';
  const TRACEBACK_SRC = '/assets/aistudio/tracebackii_6e3cf5cf.webp';

  const activeYearData = YEAR_ARCHIVES.find((y) => y.year === selectedYear) ?? null;
  const isTimelineVisible = transitionPhase === 'timeline' && activeYearData !== null;

  const clickableEventIndices = activeYearData
    ? activeYearData.events.reduce<number[]>((acc, ev, idx) => {
        if (ev.isClickable) acc.push(idx);
        return acc;
      }, [])
    : [];
  const activeModalEvent =
    activeYearData &&
    selectedEventIndex !== null &&
    activeYearData.events[selectedEventIndex]?.isClickable
      ? activeYearData.events[selectedEventIndex] ?? null
      : null;

  // Keyboard support for Event Dossier Modal (Escape to close modal first, Left/Right arrows to switch among clickable events)
  useEffect(() => {
    if (selectedEventIndex === null || !activeYearData) return;

    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        handleCloseEventModal();
      } else if (e.key === 'ArrowLeft' && clickableEventIndices.length > 1) {
        e.stopPropagation();
        e.preventDefault();
        soundFx.playHover();
        setSelectedEventIndex((prev) => {
          if (prev === null) return clickableEventIndices[0];
          const curPos = clickableEventIndices.indexOf(prev);
          const nextPos =
            (curPos - 1 + clickableEventIndices.length) % clickableEventIndices.length;
          return clickableEventIndices[nextPos];
        });
      } else if (e.key === 'ArrowRight' && clickableEventIndices.length > 1) {
        e.stopPropagation();
        e.preventDefault();
        soundFx.playHover();
        setSelectedEventIndex((prev) => {
          if (prev === null) return clickableEventIndices[0];
          const curPos = clickableEventIndices.indexOf(prev);
          const nextPos = (curPos + 1) % clickableEventIndices.length;
          return clickableEventIndices[nextPos];
        });
      }
    };

    window.addEventListener('keydown', handleModalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleModalKeyDown, { capture: true });
  }, [selectedEventIndex, activeYearData, clickableEventIndices, handleCloseEventModal]);

  const fullRadarPromptText = `> ${radarBodyText}`;
  const visibleRadarBodySlice = isRadarTypedDone
    ? radarBodyText
    : radarBodyText.slice(0, typedCharCount);

  const decodedFilesSubtitle = activeYearData
    ? lang === 'VI'
      ? `> ${String(activeYearData.events.length).padStart(2, '0')} tệp đã giải mã.`
      : `> ${String(activeYearData.events.length).padStart(2, '0')} files decoded.`
    : '';

  const reducedMotionActive = isReducedMotionPreferred();

  return (
    <div
      id="page-events"
      className="relative z-20 flex h-full w-full flex-col overflow-hidden bg-[var(--void)] text-[var(--text-1)]"
    >
      {/* SVG Duotone Color-Grading Filters for Spaceship & Volumetric Clouds:
          Interpolates shadows (0.04, 0.02, 0.07) to violet highlights (0.85, 0.70, 1.0 -> hue ~270°) */}
      <svg
        width="0"
        height="0"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <defs>
          <filter id="traceback-purple-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.04 0.85" />
              <feFuncG type="table" tableValues="0.02 0.70" />
              <feFuncB type="table" tableValues="0.07 1" />
            </feComponentTransfer>
          </filter>

          <filter id="cloud-purple-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.04 0.85" />
              <feFuncG type="table" tableValues="0.02 0.70" />
              <feFuncB type="table" tableValues="0.07 1" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* MAIN SCROLLABLE CONTAINER */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="cyber-events-scroll relative z-10 flex-1 overflow-y-auto overflow-x-hidden bg-[var(--void)]"
      >
        {/* =====================================================================
            SHARED HEADER (.site-header)
           ===================================================================== */}
        <SiteHeader
          breadcrumbs={[
            {
              label: lang === 'VI' ? 'TSDT' : 'MOONSTRIDE',
              onClick: onBackHome,
            },
            {
              label: lang === 'VI' ? 'SỰ KIỆN' : 'EVENTS',
            },
          ]}
          langLabel={onToggleLang ? lang : undefined}
          langTitle={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          langAriaLabel={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          onToggleLang={onToggleLang}
        />

        {/* =====================================================================
            SECTION 1: TRACEBACK II, LEFT FLIGHT LOG HUD CARD & PURPLE CLOUD SEA
            Preserves all scroll transforms, ship rotation/descent, and cloud layers.
           ===================================================================== */}
        <section
          aria-label="Traceback II Cloud Orbit"
          className="relative h-[88dvh] sm:h-[90dvh] w-full overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, var(--void) 0%, var(--deep) 35%, #1a1233 72%, var(--void) 100%)',
          }}
        >
          {/* Subtle atmospheric horizon glow behind the cloud bed */}
          <div
            className="pointer-events-none absolute inset-0 z-1"
            style={{
              background:
                'radial-gradient(ellipse 90% 55% at 55% 78%, rgba(58, 47, 107, 0.28) 0%, rgba(26, 18, 51, 0.18) 52%, rgba(7, 6, 15, 0) 80%)',
            }}
            aria-hidden="true"
          />

          {/* 1. BACKGROUND CLOUD3 CLUSTERS (Behind Traceback II, z-10)
              Group filter on container instead of 5 separate image filters */}
          <div
            ref={bgCloudsRef}
            className="events-cloud-layer-filter pointer-events-none absolute inset-0 z-10 select-none"
            aria-hidden="true"
          >
            <img
              src={CLOUD3_SRC}
              alt=""
              decoding="async"
              className="cyber-cloud-slow events-cloud-img absolute top-[4dvh] right-[-4%] w-[52vw] max-w-[520px] sm:w-[34rem] opacity-35 object-contain"
              style={{
                transform: 'scale(1.32, 0.76) rotate(-7deg)',
              }}
            />

            <img
              src={CLOUD3_SRC}
              alt=""
              decoding="async"
              className="cyber-cloud-reverse events-cloud-img absolute top-[18dvh] left-[-10%] w-[64vw] max-w-[620px] sm:w-[40rem] opacity-55 object-contain"
              style={{
                transform: 'scale(-1.45, 0.78) rotate(6deg)',
              }}
            />

            <img
              src={CLOUD3_SRC}
              alt=""
              decoding="async"
              className="cyber-cloud-reverse events-cloud-img absolute top-[20dvh] right-[-18%] w-[72vw] max-w-[720px] sm:w-[46rem] opacity-45 object-contain"
              style={{
                transform: 'scale(-1.18, 1.24) rotate(-19deg)',
              }}
            />

            <img
              src={CLOUD3_SRC}
              alt=""
              decoding="async"
              className="cyber-cloud-slow events-cloud-img absolute top-[38dvh] right-[-8%] w-[76vw] max-w-[740px] sm:w-[48rem] opacity-65 object-contain"
              style={{
                transform: 'scale(1.28, -0.92) rotate(11deg)',
              }}
            />

            <img
              src={CLOUD3_SRC}
              alt=""
              decoding="async"
              className="cyber-cloud-reverse events-cloud-img absolute top-[42dvh] left-[28%] w-[56vw] max-w-[520px] sm:w-[33rem] opacity-60 object-contain"
              style={{
                transform: 'scale(-1.22, 0.88) rotate(-4deg)',
              }}
            />
          </div>

          {/* 2. LEFT-SIDE FLIGHT LOG HUD CARD (z-35) — Matches reference image */}
          <div
            ref={hudContainerRef}
            className={`pointer-events-none absolute z-35 will-change-transform ${
              isPhone
                ? 'inset-x-0 mx-auto top-[3dvh] w-[88vw] max-w-[345px]'
                : 'inset-x-0 mx-auto top-[3.5dvh] w-[86vw] max-w-[360px] sm:inset-x-auto sm:mx-0 sm:left-[max(var(--gutter),calc((100%-1300px)/2))] sm:top-[7dvh] md:top-[8.5dvh] lg:top-[10dvh] sm:w-[42vw] md:w-[40vw] lg:w-[450px]'
            }`}
            style={{
              transform: 'translate3d(0, 0px, 0)',
              opacity: 1,
            }}
          >
            <div className="relay-card flex flex-col justify-between bg-[var(--deep)]/90 px-5 py-4 sm:px-7 sm:py-6">
              {/* Top Mono Label */}
              <div className="mb-3 flex w-full items-center justify-between gap-2">
                <span className="font-[var(--font-mono)] text-[10px] sm:text-[12px] uppercase tracking-[0.22em] text-[var(--lilac)]">
                  FLIGHT LOG // TB-II
                </span>
              </div>

              {/* Card Title & Description */}
              <div className="flex flex-col">
                <h2 className="font-[var(--font-sans)] text-[18px] sm:text-[22px] md:text-[24px] font-bold leading-[1.28] text-[var(--text-1)]">
                  {lang === 'VI'
                    ? 'Traceback II: Đã xác nhận tọa độ'
                    : 'Traceback II: Coordinates Confirmed'}
                </h2>

                <p className="mt-3 sm:mt-3.5 font-[var(--font-sans)] text-xs sm:text-[14px] leading-relaxed text-[var(--text-2)]">
                  {lang === 'VI'
                    ? 'Mọi sự kiện và cột mốc gắn liền với Thẩm Tinh Hồi đều đã được lưu vào nhật ký phi hành.'
                    : 'Every event and milestone shared with Xavier has been logged into the flight journal.'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. THE TRACEBACK II SPACESHIP (z-25 — Between Background & Foreground Clouds) */}
          <div
            ref={heroShipRef}
            className="pointer-events-none absolute inset-x-0 mx-auto top-[24dvh] sm:mx-0 sm:top-[1dvh] md:top-[0dvh] lg:top-[-1dvh] sm:left-[44vw] md:left-[43vw] lg:left-[43.5vw] sm:right-[2vw] md:right-[3vw] lg:right-[3.5vw] z-25 flex items-center justify-center will-change-transform"
            style={{
              transform: 'translate3d(0px, 0px, 0) rotate(0deg) scale(1)',
              transformOrigin: '50% 52%',
              opacity: 1,
            }}
          >
            <div className="traceback-ship-float relative flex items-center justify-center">
              <img
                src={TRACEBACK_SRC}
                alt="Tàu Traceback II"
                decoding="async"
                fetchPriority="high"
                className="events-ship-img w-[78vw] max-w-[310px] max-h-[38dvh] sm:w-[46vw] sm:max-w-[400px] sm:max-h-[46dvh] md:w-[48vw] md:max-w-[520px] md:max-h-[56dvh] lg:w-[50vw] lg:max-w-[820px] lg:max-h-[68dvh] xl:w-[50vw] xl:max-w-[920px] xl:max-h-[72dvh] h-auto object-contain select-none"
              />
            </div>
          </div>

          {/* 4. FOREGROUND VOLUMETRIC CLOUD3 SEA (z-30 — In Front of Traceback II)
              Group filter on fgCloudsRef instead of 11 separate image filters */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[44dvh] sm:top-[46dvh] z-30 select-none"
            aria-hidden="true"
          >
            {/* Dark indigo atmospheric base behind lower clouds */}
            <div
              className="absolute inset-x-0 top-[12dvh] bottom-0 z-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(14, 11, 28, 0) 0%, rgba(26, 18, 51, 0.65) 45%, var(--deep) 88%, var(--void) 100%)',
              }}
            />

            <div
              ref={fgCloudsRef}
              className="events-cloud-layer-filter absolute inset-0 z-10"
            >
              {/* Layer A: Crown Wisps */}
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-slow events-cloud-img absolute right-[-14%] top-[-2dvh] z-10 w-[66vw] max-w-[650px] sm:w-[43rem] opacity-75 object-contain"
                style={{
                  transform: 'scale(-1.28, -0.86) rotate(-15deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-reverse events-cloud-img absolute left-[-15%] top-[6dvh] z-10 w-[68vw] max-w-[660px] sm:w-[44rem] opacity-70 object-contain"
                style={{
                  transform: 'scale(1.36, -0.78) rotate(11deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-slow events-cloud-img absolute left-[22%] top-[11dvh] z-10 w-[58vw] max-w-[560px] sm:w-[37rem] opacity-70 object-contain"
                style={{
                  transform: 'scale(-1.42, 0.72) rotate(-6deg)',
                }}
              />

              {/* Layer B: Main Cumulus Billows */}
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-reverse events-cloud-img absolute right-[-18%] top-[5dvh] z-10 w-[78vw] max-w-[760px] sm:w-[50rem] opacity-85 object-contain"
                style={{
                  transform: 'scale(-1.18, 1.05) rotate(-12deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-slow events-cloud-img absolute right-[8%] top-[13dvh] z-10 w-[68vw] max-w-[660px] sm:w-[44rem] opacity-80 object-contain"
                style={{
                  transform: 'scale(1.32, -0.88) rotate(8deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-reverse events-cloud-img absolute left-[14%] top-[16dvh] z-10 w-[74vw] max-w-[720px] sm:w-[48rem] opacity-85 object-contain"
                style={{
                  transform: 'scale(-1.38, 0.84) rotate(-4deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-slow events-cloud-img absolute left-[-6%] top-[14dvh] z-10 w-[64vw] max-w-[620px] sm:w-[41rem] opacity-80 object-contain"
                style={{
                  transform: 'scale(1.15, -0.94) rotate(14deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="cyber-cloud-reverse events-cloud-img absolute left-[-22%] top-[11dvh] z-10 w-[76vw] max-w-[740px] sm:w-[49rem] opacity-80 object-contain"
                style={{
                  transform: 'scale(1.26, 0.96) rotate(7deg)',
                }}
              />

              {/* Layer C: Deep Foreground Cloud Bed */}
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="events-cloud-img absolute left-[-14%] top-[18dvh] z-10 w-[84vw] max-w-[820px] sm:w-[54rem] opacity-85 object-contain"
                style={{
                  transform: 'scale(-1.45, 0.9) rotate(-3deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="events-cloud-img absolute left-[20%] top-[17dvh] z-10 w-[86vw] max-w-[840px] sm:w-[56rem] opacity-85 object-contain"
                style={{
                  transform: 'scale(1.48, -0.92) rotate(4deg)',
                }}
              />
              <img
                src={CLOUD3_SRC}
                alt=""
                decoding="async"
                className="events-cloud-img absolute right-[-16%] top-[15dvh] z-10 w-[84vw] max-w-[820px] sm:w-[54rem] opacity-85 object-contain"
                style={{
                  transform: 'scale(-1.4, 0.95) rotate(-5deg)',
                }}
              />
            </div>

            {/* Smooth --void floor blend at the bottom edge of Section 1 */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[22dvh]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(7, 6, 15, 0) 0%, rgba(7, 6, 15, 0.85) 68%, var(--void) 100%)',
              }}
            />
          </div>

          {/* 5. FULL-SCENE HORIZONTAL CRT SCANLINE OVERLAY (z-32) */}
          <div
            className="events-hero-scanlines pointer-events-none absolute inset-0 z-32 select-none"
            aria-hidden="true"
          />

          {/* 6. BOTTOM SCROLL PROMPT: [ SCROLL TO DESCEND ] (z-35) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[3dvh] z-35 flex items-center justify-center select-none">
            <span className="font-[var(--font-mono)] text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[var(--text-3)]">
              {lang === 'VI' ? '[ CUỘN XUỐNG ĐỂ HẠ CÁNH ]' : '[ SCROLL TO DESCEND ]'}
            </span>
          </div>
        </section>

        {/* =====================================================================
            SECTION 2: COORDINATES & YEAR ARCHIVES / VERTICAL ORBIT TIMELINE
            Pure --void background, max-w-[1306px] container, left-aligned heading.
           ===================================================================== */}
        <section
          ref={yearSectionRef}
          aria-label="Events By Year 2024 2025 2026"
          className="relative z-40 flex w-full flex-col bg-[var(--void)] pb-10 sm:pb-14"
        >
          <div className="wrap flex flex-col pt-5 sm:pt-8">
            <div className="mb-6 sm:mb-8 lg:mb-10">
              {isTimelineVisible && activeYearData ? (
                <>
                  <h1
                    ref={timelineHeadingRef}
                    tabIndex={-1}
                    className="font-bold tracking-[-0.01em] text-[var(--text-1)] text-3xl sm:text-5xl lg:text-[54px] leading-none focus:outline-none"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {lang === 'VI'
                      ? `Sự kiện ${activeYearData.year}`
                      : `Events ${activeYearData.year}`}
                  </h1>

                  <p
                    aria-label={decodedFilesSubtitle}
                    className="mt-3 sm:mt-3.5 text-[17px] leading-[1.5] text-[var(--text-2)]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    <span aria-hidden="true">
                      <span className="text-[var(--violet)]">&gt; </span>
                      <span>
                        {lang === 'VI'
                          ? `${String(activeYearData.events.length).padStart(2, '0')} tệp đã giải mã.`
                          : `${String(activeYearData.events.length).padStart(2, '0')} files decoded.`}
                      </span>
                    </span>
                    <span className="events-hard-cursor" aria-hidden="true" />
                  </p>
                </>
              ) : (
                <>
                  <h1
                    className="font-bold tracking-[-0.01em] text-[var(--text-1)] text-3xl sm:text-5xl lg:text-[54px] leading-none"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {lang === 'VI' ? 'Tọa độ' : 'Coordinates'}
                  </h1>

                  <p
                    aria-label={fullRadarPromptText}
                    className="relative mt-3 sm:mt-3.5 text-[17px] leading-[1.5] text-[var(--text-2)]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    <span
                      className="invisible block select-none pointer-events-none"
                      aria-hidden="true"
                    >
                      {fullRadarPromptText}
                      <span className="inline-block w-[8px] h-[15px] ml-[3px]" />
                    </span>

                    <span
                      className="absolute inset-0 block"
                      aria-hidden="true"
                    >
                      <span className="text-[var(--violet)]">&gt; </span>
                      <span>{visibleRadarBodySlice}</span>
                      <span className="events-hard-cursor" />
                    </span>
                  </p>
                </>
              )}
            </div>

            {/* =================================================================
                VIEW MODE A: THE 3 YEAR PORTAL CARDS & LOCKING COORDINATE STEP
               ================================================================= */}
            {!isTimelineVisible ? (
              <>
                <div
                  style={{
                    display: transitionPhase === 'locking' ? 'none' : undefined,
                  }}
                  className={`grid w-full grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-6 lg:gap-[34px] ${
                    transitionPhase !== 'idle' ? 'pointer-events-none' : ''
                  }`}
                >
                  {YEAR_ARCHIVES.map((item, idx) => {
                    const isGlitching = transitionPhase === 'glitching';
                    const cardAnimClass = isGlitching
                      ? 'year-card-glitch-out'
                      : yearCardsRevealStage === 'hidden'
                        ? 'events-card-pre-reveal'
                        : yearCardsRevealStage === 'revealing'
                          ? 'events-card-reveal-anim'
                          : '';

                    const cardAnimStyle: React.CSSProperties | undefined = isGlitching
                      ? {
                          animationDuration: `${
                            reducedMotionActive
                              ? REDUCED_FADE_DURATION_MS
                              : GLITCH_DURATION_MS
                          }ms`,
                          animationDelay: `${
                            reducedMotionActive ? 0 : idx * GLITCH_STAGGER_MS
                          }ms`,
                        }
                      : yearCardsRevealStage === 'revealing'
                        ? {
                            animationDuration: `${CARD_REVEAL_DURATION_MS}ms`,
                            animationDelay: `${idx * YEAR_CARD_STAGGER_MS}ms`,
                          }
                        : undefined;

                    return (
                      <button
                        key={item.year}
                        type="button"
                        disabled={transitionPhase !== 'idle'}
                        onMouseEnter={() => {
                          if (transitionPhase !== 'idle') return;
                          soundFx.playHover();
                          item.events.slice(0, 3).forEach((ev) => {
                            const img = new Image();
                            img.decoding = 'async';
                            img.src = ev.bannerImg;
                            img.decode?.().catch(() => {});
                          });
                        }}
                        onClick={() => handleSelectYearCard(item.year)}
                        style={cardAnimStyle}
                        className={`relay-card relay-card-interactive group flex min-h-[250px] sm:min-h-[280px] flex-col justify-between overflow-hidden p-6 sm:p-7 text-left cursor-pointer ${cardAnimClass}`}
                      >
                        {/* Faint Radar Circles Motif (opacity ~0.2) */}
                        <svg
                          viewBox="0 0 240 240"
                          fill="none"
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-12 -bottom-12 h-56 w-56 opacity-20 transition-opacity duration-200 group-hover:opacity-30"
                        >
                          <circle cx="120" cy="120" r="36" stroke="var(--line)" strokeWidth="1" />
                          <circle
                            cx="120"
                            cy="120"
                            r="68"
                            stroke="var(--line)"
                            strokeWidth="1"
                            strokeDasharray="3 4"
                          />
                          <circle cx="120" cy="120" r="102" stroke="var(--line)" strokeWidth="1" />
                          <line x1="120" y1="6" x2="120" y2="234" stroke="var(--line)" strokeWidth="1" />
                          <line x1="6" y1="120" x2="234" y2="120" stroke="var(--line)" strokeWidth="1" />
                        </svg>

                        <div className="relative z-10 flex w-full flex-col">
                          {/* (1) Top Row: "CHRONO // 01" left + Event count tag right */}
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="font-[var(--font-mono)] text-[11px] sm:text-[12px] uppercase tracking-[0.2em] text-[var(--lilac)]">
                              {`CHRONO // 0${idx + 1}`}
                            </span>
                            <span className="site-badge px-2 py-0.5 font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.14em]">
                              {`${String(item.events.length).padStart(2, '0')} ${
                                lang === 'VI' ? 'SỰ KIỆN' : 'EVENTS'
                              }`}
                            </span>
                          </div>

                          {/* (2) Giant Year Number (~68px, display font, --text-1, no glow) */}
                          <div className="mt-4 sm:mt-5">
                            <span
                              className="block font-bold leading-none tracking-[0.04em] text-[var(--text-1)] text-[54px] sm:text-[64px] lg:text-[68px]"
                              style={{ fontFamily: 'var(--font-display)' }}
                            >
                              {item.year}
                            </span>
                          </div>

                          {/* (3) Thin divider line --line + short 1-2 line description (14px, --text-2) */}
                          <div className="my-4 h-[1px] w-full bg-[var(--line)]" aria-hidden="true" />

                          <p className="font-[var(--font-sans)] text-[14px] leading-relaxed text-[var(--text-2)] line-clamp-2">
                            {lang === 'VI' ? item.descVI : item.descEN}
                          </p>
                        </div>

                        {/* (4) Footer link "ACCESS YEAR ARCHIVE >" */}
                        <div className="relative z-10 mt-6 inline-flex items-center gap-1.5 font-[var(--font-mono)] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--lilac)] transition-colors duration-150 group-hover:text-[var(--text-1)]">
                          <span>
                            {lang === 'VI' ? 'MỞ HỒ SƠ SỰ KIỆN >' : 'ACCESS YEAR ARCHIVE >'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {transitionPhase === 'locking' && selectedYear && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-[18px] sm:mt-[22px] min-h-[180px] font-[var(--font-mono)] text-[14px] tracking-[0.16em] text-[var(--text-2)]"
                  >
                    <span className="text-[var(--violet)]">&gt; </span>
                    <span>{`Locking coordinate // `}</span>
                    <span className="text-[var(--lilac)]">{selectedYear}</span>
                    <span>{` ...`}</span>
                    <span className="events-hard-cursor" aria-hidden="true" />
                  </div>
                )}
              </>
            ) : (
              /* =================================================================
                 VIEW MODE B: VERTICAL ORBIT TIMELINE FOR SELECTED YEAR (2024 / 2025 / 2026)
                 ================================================================= */
              <div className="relative z-10 flex w-full flex-col">
                {/* Timeline Sub-Tab Bar (sticky below .site-header, 44px height, 1px var(--line) bottom border) */}
                <div className="sticky top-[48px] min-[761px]:top-[56px] z-40 h-[44px] border-b border-[var(--line)] bg-[rgba(7,6,15,0.88)] backdrop-blur-[10px]">
                  <nav
                    aria-label="Year Archive Tabs"
                    className="site-subtabs-nav"
                  >
                    {YEAR_ARCHIVES.map((yr) => {
                      const isCurrent = yr.year === activeYearData.year;
                      return (
                        <button
                          key={yr.year}
                          type="button"
                          onMouseEnter={() => {
                            if (!isCurrent) soundFx.playHover();
                          }}
                          onClick={() => handleSelectYearTab(yr.year)}
                          className={`site-subtab-btn ${isCurrent ? 'is-active' : ''}`}
                        >
                          {yr.year}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onMouseEnter={() => soundFx.playHover()}
                      onClick={() => handleSelectYearTab(null)}
                      className="site-subtab-btn"
                    >
                      {lang === 'VI' ? 'Tất cả các năm' : 'All years'}
                    </button>
                  </nav>
                </div>

                {/* VERTICAL ORBIT TIMELINE TRACK */}
                <div
                  ref={orbitTrackRef}
                  className={`relative w-full ${
                    isPhone
                      ? 'pt-24 pb-16'
                      : 'pt-28 pb-20 sm:pt-36 sm:pb-28 md:pt-44 md:pb-32'
                  }`}
                >
                  {/* Unexplored Vertical Axis Line (Left axis on Phone <760px, Center axis on Desktop) */}
                  <div
                    className={`pointer-events-none absolute top-8 bottom-8 z-0 -translate-x-1/2 flex flex-col items-center ${
                      isPhone ? 'left-4' : 'left-4 md:left-1/2'
                    }`}
                    aria-hidden="true"
                  >
                    <div className="h-full w-[1px] bg-[var(--line)]" />
                  </div>

                  {/* Progressive Revealed Axis Line — Reveals as Traceback II moves down */}
                  <div
                    ref={orbitWakeRef}
                    className={`pointer-events-none absolute z-10 -translate-x-1/2 flex flex-col items-center ${
                      isPhone ? 'top-6 left-4' : 'top-6 sm:top-10 left-4 md:left-1/2'
                    }`}
                    style={{
                      height: `${
                        orbitShipAppeared
                          ? Math.max(
                              isPhone ? 24 : 38,
                              orbitShipYRef.current + (isPhone ? 20 : 34)
                            ).toFixed(1)
                          : '0'
                      }px`,
                      opacity: orbitShipAppeared ? 1 : 0,
                    }}
                    aria-hidden="true"
                  >
                    {/* Top Origin Coordinate Tag ("ALT 00.0") */}
                    <div className="relative flex flex-col items-center shrink-0">
                      <span
                        ref={orbitAltLabelRef}
                        className="mb-1 font-[var(--font-mono)] text-[9px] tracking-[0.2em] text-[var(--lilac)] uppercase whitespace-nowrap"
                      >
                        ALT 00.0
                      </span>
                      <span className="text-[10px] leading-none text-[var(--lilac)]">
                        ✦
                      </span>
                    </div>

                    {/* Revealed 1px --violet Conduit Line */}
                    <div className="relative flex-1 w-6 flex justify-center overflow-hidden">
                      <div className="relative h-full w-[1px] bg-[var(--violet)]" />
                    </div>

                    {/* Leading Diamond Node at Traceback II's core */}
                    <span className="h-2 w-2 shrink-0 rotate-45 border border-[var(--lilac)] bg-[var(--violet-d)]" />
                  </div>

                  {/* TRACEBACK II SPACESHIP ON THE VERTICAL ORBIT AXIS */}
                  <div
                    ref={orbitShipRef}
                    className={`pointer-events-none absolute top-0 z-30 flex flex-col items-center select-none ${
                      isPhone ? 'left-4' : 'left-4 md:left-1/2'
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
                    <div className="mb-0.5 flex flex-col items-center" aria-hidden="true">
                      <div className="h-4 sm:h-6 w-[1px] bg-gradient-to-t from-[var(--lilac)] to-transparent" />
                    </div>

                    <img
                      src={TRACEBACK_SRC}
                      alt="Tàu Traceback II Orbit"
                      decoding="async"
                      className={`events-ship-img ${
                        isPhone ? 'w-14' : 'w-16 sm:w-24 md:w-36 lg:w-44'
                      } h-auto object-contain select-none`}
                    />
                  </div>

                  {/* TIMELINE EVENT CARDS */}
                  <div className="relative z-20 flex flex-col">
                    {activeYearData.events.map((ev, idx) => {
                      const isLeft = !isPhone && idx % 2 === 0;
                      const isReached = Boolean(reachedEventMap[idx]);
                      const isClickable = Boolean(ev.isClickable);
                      const eventTitle = lang === 'VI' ? ev.titleVI : ev.titleEN;
                      const eventType = lang === 'VI' ? ev.typeVI : ev.typeEN;
                      const shouldStaggerInViewport =
                        timelineEventsStaggering && idx < 4 && !reducedMotionActive;

                      return (
                        <div
                          key={ev.id}
                          ref={(el) => {
                            eventRowRefs.current[idx] = el;
                          }}
                          style={
                            shouldStaggerInViewport
                              ? {
                                  animationDuration: `${CARD_REVEAL_DURATION_MS}ms`,
                                  animationDelay: `${idx * EVENT_CARD_STAGGER_MS}ms`,
                                }
                              : undefined
                          }
                          className={`relative flex w-full items-center transition-all duration-500 ease-out justify-end ${
                            isLeft ? 'md:justify-start' : 'md:justify-end'
                          } ${
                            idx > 0
                              ? isPhone
                                ? 'mt-6'
                                : 'mt-6 md:-mt-14 lg:-mt-20'
                              : ''
                          } ${
                            shouldStaggerInViewport
                              ? 'events-card-reveal-anim'
                              : isReached
                                ? 'opacity-100 translate-y-0'
                                : 'pointer-events-none opacity-0 translate-y-6'
                          }`}
                        >
                          {/* Flat Square Diamond Node on the Axis */}
                          <div
                            className={`pointer-events-none absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${
                              isPhone ? 'left-4' : 'left-4 md:left-1/2'
                            }`}
                            aria-hidden="true"
                          >
                            <span className="flex h-3 w-3 rotate-45 items-center justify-center border border-[var(--line)] bg-[var(--void)]">
                              <span className="h-1 w-1 bg-[var(--accent)]" />
                            </span>
                          </div>

                          {/* 1px Horizontal Telemetry Bridge between Axis and Event Card */}
                          <div
                            className={`pointer-events-none absolute top-1/2 z-10 flex flex-col -translate-y-1/2 ${
                              isPhone
                                ? 'left-4 w-6 items-start'
                                : `left-4 w-6 md:w-[88px] lg:w-[116px] ${
                                    isLeft
                                      ? 'md:left-auto md:right-1/2 md:items-end'
                                      : 'md:left-1/2 md:items-start'
                                  }`
                            }`}
                            aria-hidden="true"
                          >
                            <div className="h-[1px] w-full bg-[var(--line)]" />
                          </div>

                          {/* SHARED RELAY CARD FOR TIMELINE EVENT */}
                          <article
                            role={isClickable ? 'button' : undefined}
                            tabIndex={isClickable ? 0 : undefined}
                            aria-label={eventTitle}
                            onMouseEnter={
                              isClickable
                                ? () => {
                                    if (isReached) soundFx.playHover();
                                  }
                                : undefined
                            }
                            onClick={
                              isClickable
                                ? () => {
                                    soundFx.playSelect();
                                    setSelectedEventIndex(idx);
                                    if (onNavigate && activeYearData) {
                                      onNavigate(`events/${activeYearData.year}/${ev.id}`, {
                                        skipRouterTransition: true,
                                      });
                                    }
                                  }
                                : undefined
                            }
                            onKeyDown={
                              isClickable
                                ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      soundFx.playSelect();
                                      setSelectedEventIndex(idx);
                                      if (onNavigate && activeYearData) {
                                        onNavigate(`events/${activeYearData.year}/${ev.id}`, {
                                          skipRouterTransition: true,
                                        });
                                      }
                                    }
                                  }
                                : undefined
                            }
                            className={`relay-card relay-card-interactive group flex flex-col overflow-hidden [content-visibility:auto] [contain-intrinsic-size:auto_260px] ${
                              !isReached ? 'is-locked' : ''
                            } ${
                              isClickable
                                ? 'cursor-pointer'
                                : 'cursor-default'
                            } ${
                              isPhone
                                ? 'w-[calc(100%-40px)]'
                                : 'w-[calc(100%-40px)] md:w-[calc(50%-88px)] lg:w-[calc(50%-116px)]'
                            }`}
                          >
                            {/* Event Banner Image with Global Dark-Blended Treatment */}
                            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--void)]">
                              <img
                                src={ev.bannerImg}
                                alt={eventTitle}
                                loading={idx < 2 ? 'eager' : 'lazy'}
                                decoding="async"
                                onLoad={scheduleMeasureAndSyncOrbit}
                                className="anecdote-card-img block h-full w-full object-cover"
                              />
                              <div
                                className="events-img-multiply pointer-events-none absolute inset-0"
                                aria-hidden="true"
                              />
                              <div
                                className="events-img-scanlines pointer-events-none absolute inset-0"
                                aria-hidden="true"
                              />
                            </div>

                            {/* Bottom Info Area */}
                            <div className="flex flex-col justify-between gap-2 border-t border-[var(--line)] bg-[var(--void)] px-3.5 py-3 sm:px-4 sm:py-3.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate font-[var(--font-mono)] text-[10px] sm:text-[12px] uppercase tracking-[0.2em] text-[var(--lilac)]">
                                  {ev.date}
                                </span>
                                <span className="site-badge shrink-0 px-2 py-0.5 font-[var(--font-mono)] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em]">
                                  {eventType}
                                </span>
                              </div>

                              <h3 className="font-[var(--font-sans)] text-[15px] sm:text-[18px] font-semibold leading-snug text-[var(--text-1)]">
                                {eventTitle}
                              </h3>
                            </div>
                          </article>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Back to Top / Year Selection ("[ ▲ ORBIT ]") Button */}
            <div className="relative z-10 mt-8 sm:mt-10 flex justify-center">
              <button
                type="button"
                onMouseEnter={() => soundFx.playHover()}
                onClick={scrollToTopSection}
                className="relay-card relay-card-interactive inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 font-[var(--font-mono)] text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--lilac)] transition-colors hover:text-[var(--text-1)]"
              >
                <span>{lang === 'VI' ? '[ ▲ QUỸ ĐẠO ]' : '[ ▲ ORBIT ]'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          EVENT DOSSIER MODAL (Unified with .relay-card and purple/amber tokens)
         ===================================================================== */}
      {activeModalEvent && activeYearData && selectedEventIndex !== null && (
        <div
          id={`view-events-${activeModalEvent.id}`}
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'VI' ? activeModalEvent.titleVI : activeModalEvent.titleEN}
          onClick={handleCloseEventModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--void)]/85 p-3 sm:p-5 md:p-8 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relay-card flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden bg-[var(--deep)]"
          >
            {/* Top Dossier Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--void)] px-4 py-3 sm:px-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-[var(--font-mono)] text-[11px] sm:text-[12px] uppercase tracking-[0.2em] text-[var(--lilac)]">
                  {activeModalEvent.date}
                </span>
                <span className="site-badge px-2 py-0.5 font-[var(--font-mono)] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {lang === 'VI' ? activeModalEvent.typeVI : activeModalEvent.typeEN}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {clickableEventIndices.length > 1 && (
                  <>
                    <span className="hidden sm:inline-block mr-1 font-[var(--font-mono)] text-[11px] tracking-[0.18em] text-[var(--text-3)]">
                      {`${String(
                        clickableEventIndices.indexOf(selectedEventIndex) + 1
                      ).padStart(2, '0')} / ${String(clickableEventIndices.length).padStart(
                        2,
                        '0'
                      )}`}
                    </span>

                    <button
                      type="button"
                      onMouseEnter={() => soundFx.playHover()}
                      onClick={() => {
                        soundFx.playSelect();
                        const curPos = clickableEventIndices.indexOf(selectedEventIndex);
                        const prevPos =
                          (curPos - 1 + clickableEventIndices.length) %
                          clickableEventIndices.length;
                        setSelectedEventIndex(clickableEventIndices[prevPos]);
                      }}
                      title={lang === 'VI' ? 'Sự kiện trước' : 'Previous event'}
                      aria-label={lang === 'VI' ? 'Sự kiện trước' : 'Previous event'}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center border border-[var(--line)] bg-[var(--void)] text-[var(--text-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-1)] focus:outline-none"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onMouseEnter={() => soundFx.playHover()}
                      onClick={() => {
                        soundFx.playSelect();
                        const curPos = clickableEventIndices.indexOf(selectedEventIndex);
                        const nextPos = (curPos + 1) % clickableEventIndices.length;
                        setSelectedEventIndex(clickableEventIndices[nextPos]);
                      }}
                      title={lang === 'VI' ? 'Sự kiện tiếp theo' : 'Next event'}
                      aria-label={lang === 'VI' ? 'Sự kiện tiếp theo' : 'Next event'}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center border border-[var(--line)] bg-[var(--void)] text-[var(--text-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-1)] focus:outline-none"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={handleCloseEventModal}
                  title={lang === 'VI' ? 'Đóng hồ sơ (ESC)' : 'Close dossier (ESC)'}
                  aria-label={lang === 'VI' ? 'Đóng hồ sơ' : 'Close dossier'}
                  className="ml-1 flex h-7 w-7 cursor-pointer items-center justify-center border border-[var(--line)] bg-[var(--void)] text-[var(--text-1)] transition-colors hover:border-[var(--accent)] focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <div className="cyber-events-scroll flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Full Event Banner Showcase — True original color when opened */}
              <div className="relative aspect-[16/9] w-full overflow-hidden border border-[var(--line)] bg-[var(--void)]">
                <img
                  src={activeModalEvent.bannerImg}
                  alt={lang === 'VI' ? activeModalEvent.titleVI : activeModalEvent.titleEN}
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Event Title, Summary & External Link Button */}
              <div className="mt-4 sm:mt-5 flex flex-col gap-4">
                <div className="flex flex-col items-start gap-2 border-b border-[var(--line)] pb-4">
                  <h3 className="font-[var(--font-sans)] text-lg sm:text-xl font-semibold text-[var(--text-1)]">
                    {lang === 'VI' ? activeModalEvent.titleVI : activeModalEvent.titleEN}
                  </h3>
                  <p className="font-[var(--font-sans)] text-xs sm:text-[14px] leading-relaxed text-[var(--text-2)]">
                    {lang === 'VI' ? activeModalEvent.summaryVI : activeModalEvent.summaryEN}
                  </p>
                </div>

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
                    className="inline-flex w-full sm:w-auto cursor-pointer items-center justify-center gap-2 border border-[var(--line)] bg-[var(--void)] px-5 py-2.5 font-[var(--font-mono)] text-xs font-bold uppercase tracking-[0.18em] text-[var(--lilac)] transition-colors hover:border-[var(--violet)] hover:text-[var(--text-1)] focus:outline-none"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {lang === 'VI'
                        ? 'XEM CHI TIẾT SỰ KIỆN >'
                        : 'VIEW EVENT DETAILS >'}
                    </span>
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
