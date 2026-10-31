import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface DatingPageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  onBackHome: () => void;
}

const DATING_TABS = [
  { id: 'BY YOUR SIDE', labelVI: 'KỀ BÊN NGƯỜI', labelEN: 'BY YOUR SIDE' },
  { id: 'FALLING FOR YOU', labelVI: 'ƯỚC HẸN RUNG ĐỘNG', labelEN: 'FALLING FOR YOU' },
  { id: 'ANECDOTES', labelVI: 'GIAI THOẠI', labelEN: 'ANECDOTES' },
  { id: 'JOURNAL', labelVI: 'SỔ TAY', labelEN: 'JOURNAL' },
  { id: 'PLAYTIME', labelVI: 'DẠO CHƠI', labelEN: 'PLAYTIME' },
  { id: 'PHOTO STUDIO', labelVI: 'CHỤP ẢNH', labelEN: 'PHOTO STUDIO' },
] as const;

type DatingSubTab = (typeof DATING_TABS)[number]['id'];

interface AnecdoteCard {
  id: string;
  image: string;
  titleVI: string;
  titleEN: string;
  chapterCodeVI: string;
  chapterCodeEN: string;
  summaryVI: string;
  summaryEN: string;
}

const ANECDOTE_CARDS: AnecdoteCard[] = [
  {
    id: 'anec-1',
    image: '/assets/aistudio/anec1_1db1b7ec.webp',
    titleVI: 'Kỳ Nghỉ Đặc Biệt',
    titleEN: 'A Special Vacation',
    chapterCodeVI: 'GIAI THOẠI // 01',
    chapterCodeEN: 'ANECDOTE // 01',
    summaryVI:
      'Một kỳ nghỉ hiếm hoi giữa nhịp sống hối hả của thành phố, nơi những khoảnh khắc bình yên bất ngờ mở ra góc nhìn mới về người đồng hành trầm lặng.',
    summaryEN:
      'A rare holiday amidst the bustling city rhythm, where quiet moments unexpectedly reveal a new side of your silent companion.',
  },
  {
    id: 'anec-2',
    image: '/assets/aistudio/anec2_f9b49633.webp',
    titleVI: 'Thoáng Qua',
    titleEN: 'Passing By',
    chapterCodeVI: 'GIAI THOẠI // 02',
    chapterCodeEN: 'ANECDOTE // 02',
    summaryVI:
      'Những cuộc lướt qua tưởng chừng tình cờ dưới hàng cây rợp bóng, nhưng lại là sự dõi theo âm thầm qua biết bao mùa nắng gió.',
    summaryEN:
      'Seemingly chance encounters beneath the shaded avenues that were, in truth, a silent vigil across countless seasons.',
  },
  {
    id: 'anec-3',
    image: '/assets/aistudio/anec3_e3831a87.webp',
    titleVI: 'Khi Sao Băng Rơi',
    titleEN: 'When Shooting Stars Fall',
    chapterCodeVI: 'GIAI THOẠI // 03',
    chapterCodeEN: 'ANECDOTE // 03',
    summaryVI:
      'Thời niên thiếu dưới mái trường và lời hứa thầm lặng khi ngước nhìn cơn mưa sao băng đầu tiên xé ngang bầu trời đêm.',
    summaryEN:
      'Youthful days in uniform and an unspoken promise made while gazing up at the first meteor shower streaking across the night sky.',
  },
  {
    id: 'anec-4',
    image: '/assets/aistudio/anec4_54b2635d.webp',
    titleVI: 'Tiếng Vọng từ Tàn Tích',
    titleEN: 'Echoes of the Ruins',
    chapterCodeVI: 'GIAI THOẠI // 04',
    chapterCodeEN: 'ANECDOTE // 04',
    summaryVI:
      'Dư âm vọng về từ tàn tích cổ xưa, nơi chiếc mặt nạ bạc và lưỡi kiếm ánh sáng khắc ghi sứ mệnh vượt qua hàng vạn năm ánh sáng.',
    summaryEN:
      'Echoes resonating from ancient ruins, where the silver mask and blade of light bear witness to a mission spanning ten thousand light-years.',
  },
];

const BY_YOUR_SIDE_CARDS: AnecdoteCard[] = [
  {
    id: 'bys-1',
    image: '/assets/aistudio/byyourside1_d43f3af9.webp',
    titleVI: 'Phút Giây Bí Mật',
    titleEN: 'Secret Times',
    chapterCodeVI: 'KỀ BÊN NGƯỜI // 01',
    chapterCodeEN: 'BY YOUR SIDE // 01',
    summaryVI:
      'Những giây phút riêng tư tĩnh lặng dưới ánh đèn ấm áp, nơi hơi ấm từ bàn tay đan chặt và nhịp thở dịu dàng xua tan mọi khoảng cách.',
    summaryEN:
      'Quiet, intimate moments beneath warm lights, where interlocked hands and gentle breathing melt away every distance.',
  },
  {
    id: 'bys-2',
    image: '/assets/aistudio/byyourside2_a0e2baeb.webp',
    titleVI: 'Khoảnh Khắc Dịu Dàng',
    titleEN: 'Tender Moments',
    chapterCodeVI: 'KỀ BÊN NGƯỜI // 02',
    chapterCodeEN: 'BY YOUR SIDE // 02',
    summaryVI:
      'Buổi chiều nắng nhẹ bên trang sách mở và giai điệu êm đềm qua chiếc tai nghe, lưu giữ ánh nhìn dịu dàng chỉ dành riêng cho bạn.',
    summaryEN:
      'A sunlit afternoon beside an open book and soft melodies through headphones, capturing a tender gaze meant only for you.',
  },
];

const FALLING_FOR_YOU_CARDS: AnecdoteCard[] = [
  {
    id: 'ffy-1',
    image: '/assets/aistudio/fallingforyou1_2766b618.webp',
    titleVI: 'Gắn Bó',
    titleEN: 'Bond',
    chapterCodeVI: 'ƯỚC HẸN RUNG ĐỘNG // 01',
    chapterCodeEN: 'FALLING FOR YOU // 01',
    summaryVI:
      'Sợi dây gắn kết vô hình được dệt nên từ sự tin tưởng và những khoảnh khắc đời thường bình dị nhưng sâu sắc bên nhau.',
    summaryEN:
      'An unseen bond woven from trust and quiet, heartfelt everyday moments shared together.',
  },
  {
    id: 'ffy-2',
    image: '/assets/aistudio/fallingforyou2_359eb888.webp',
    titleVI: 'Tư Niệm',
    titleEN: 'Memoria',
    chapterCodeVI: 'ƯỚC HẸN RUNG ĐỘNG // 02',
    chapterCodeEN: 'FALLING FOR YOU // 02',
    summaryVI:
      'Không gian ngập tràn ánh nắng ban mai, nơi từng mảnh ký ức dịu dàng được lưu giữ nguyên vẹn theo năm tháng.',
    summaryEN:
      'A sunlit sanctuary where every tender fragment of memory is preserved untouched through time.',
  },
  {
    id: 'ffy-3',
    image: '/assets/aistudio/fallingforyou3_8f1d3a70.webp',
    titleVI: 'Truyền Thuyết',
    titleEN: 'Myths',
    chapterCodeVI: 'ƯỚC HẸN RUNG ĐỘNG // 03',
    chapterCodeEN: 'FALLING FOR YOU // 03',
    summaryVI:
      'Thánh đường cổ kính dưới ánh trăng bạc, nơi huyền thoại vượt qua hàng vạn năm ánh sáng bắt đầu và khắc ghi lời thề vĩnh cửu.',
    summaryEN:
      'An ancient moonlit cathedral where a myth spanning ten thousand light-years unfolds and etches an eternal vow.',
  },
];

const PHOTO_STUDIO_CARDS: AnecdoteCard[] = [
  {
    id: 'ps-1',
    image: '/assets/aistudio/photo1_bd8c8fe9.webp',
    titleVI: 'Bộ Sưu Tập',
    titleEN: 'Outfit Collection',
    chapterCodeVI: 'CHỤP ẢNH // 01',
    chapterCodeEN: 'PHOTO STUDIO // 01',
    summaryVI:
      'Bộ sưu tập trang phục chiến đấu và thường phục tinh xảo, tôn lên phong thái thanh lịch trong từng khung hình kỷ niệm.',
    summaryEN:
      'An exquisite collection of combat attire and casual outfits, highlighting elegance in every commemorative frame.',
  },
  {
    id: 'ps-2',
    image: '/assets/aistudio/photo2_82afac44.webp',
    titleVI: 'Phông Nền',
    titleEN: 'Backgrounds',
    chapterCodeVI: 'CHỤP ẢNH // 02',
    chapterCodeEN: 'PHOTO STUDIO // 02',
    summaryVI:
      'Đa dạng phông nền nghệ thuật từ sảnh đường ngập nắng đến bầu trời đêm huyền ảo đượm sắc tím ngân hà.',
    summaryEN:
      'Diverse artistic backdrops ranging from sunlit halls to dreamy night skies bathed in cosmic violet hues.',
  },
  {
    id: 'ps-3',
    image: '/assets/aistudio/photo3_b824d30d.webp',
    titleVI: 'Pô Ảnh',
    titleEN: 'Poses',
    chapterCodeVI: 'CHỤP ẢNH // 03',
    chapterCodeEN: 'PHOTO STUDIO // 03',
    summaryVI:
      'Những dáng chụp độc đáo từ khoảnh khắc trầm tư giữa dải ngân hà đến cử chỉ ăn ý khi sánh bước bên nhau.',
    summaryEN:
      'Expressive poses ranging from contemplative moments amidst the cosmos to harmonious gestures side by side.',
  },
  {
    id: 'ps-4',
    image: '/assets/aistudio/photo4_04a87982.webp',
    titleVI: 'Mẫu Ảnh',
    titleEN: 'Templates',
    chapterCodeVI: 'CHỤP ẢNH // 04',
    chapterCodeEN: 'PHOTO STUDIO // 04',
    summaryVI:
      'Những mẫu thiết kế khung hình và phụ kiện nghệ thuật có sẵn, giúp tái hiện trọn vẹn thần thái điện ảnh chỉ trong một chạm.',
    summaryEN:
      'Curated artistic templates and accessory presets that capture cinematic poise and atmosphere in a single tap.',
  },
];

const JOURNAL_CARDS: AnecdoteCard[] = [
  {
    id: 'jn-1',
    image: '/assets/aistudio/journal1_40ca89cb.webp',
    titleVI: 'Lưu Trữ',
    titleEN: 'Archive',
    chapterCodeVI: 'SỔ TAY // 01',
    chapterCodeEN: 'JOURNAL // 01',
    summaryVI:
      'Kho lưu trữ những dấu ấn, bức vẽ và kỷ vật đặc biệt khắc ghi lời hứa vĩnh cửu qua từng chặng đường bên nhau.',
    summaryEN:
      'An archive of cherished keepsakes, sketches, and milestones etching an eternal promise across every shared journey.',
  },
  {
    id: 'jn-2',
    image: '/assets/aistudio/journal2_bbfb2f85.webp',
    titleVI: 'Góc DIY',
    titleEN: 'Your DIY',
    chapterCodeVI: 'SỔ TAY // 02',
    chapterCodeEN: 'JOURNAL // 02',
    summaryVI:
      'Không gian sáng tạo mang đậm dấu ấn cá nhân, nơi từng trang sổ tay được trang trí bằng sticker, ruy băng và những món quà kỷ niệm đáng yêu.',
    summaryEN:
      'A creative personal space where every journal page is decorated with stickers, ribbons, and adorable commemorative gifts.',
  },
];

const PLAYTIME_CARDS: AnecdoteCard[] = [
  {
    id: 'pt-1',
    image: '/assets/aistudio/playtime1_35dbcaeb.webp',
    titleVI: 'Máy Gắp Thú',
    titleEN: 'Claw Machine',
    chapterCodeVI: 'DẠO CHƠI // 01',
    chapterCodeEN: 'PLAYTIME // 01',
    summaryVI:
      'Những giờ phút vui nhộn bên máy gắp thú bông, cùng nhau mang về bộ sưu tập thú nhồi bông đáng yêu.',
    summaryEN:
      'Playful moments by the claw machine, teaming up to win an adorable collection of plushies.',
  },
  {
    id: 'pt-2',
    image: '/assets/aistudio/playtime2_4c251c41.webp',
    titleVI: 'Bài Mèo',
    titleEN: 'Kitty Cards',
    chapterCodeVI: 'DẠO CHƠI // 02',
    chapterCodeEN: 'PLAYTIME // 02',
    summaryVI:
      'Những ván Bài Mèo đầy kịch tính nhưng không kém phần đáng yêu bên tách trà chiều ấm áp.',
    summaryEN:
      'Lively and endearing rounds of Kitty Cards shared over a warm afternoon cup of tea.',
  },
];

const ALL_CARD_IMAGES = [
  ...ANECDOTE_CARDS,
  ...BY_YOUR_SIDE_CARDS,
  ...FALLING_FOR_YOU_CARDS,
  ...JOURNAL_CARDS,
  ...PHOTO_STUDIO_CARDS,
  ...PLAYTIME_CARDS,
].map((c) => c.image);

export const DatingPage: React.FC<DatingPageProps> = ({
  lang,
  isPhone = false,
  onBackHome,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DatingSubTab>('BY YOUR SIDE');
  const [selectedCard, setSelectedCard] = useState<AnecdoteCard | null>(null);
  // Slide index for Phone 1-card portrait carousel mode
  const [carouselIdx, setCarouselIdx] = useState<number>(0);

  // Preload all lightweight WebP card images in the background so switching tabs or slides is instantaneous
  useEffect(() => {
    ALL_CARD_IMAGES.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, []);

  // Phone is always locked to Portrait 1-card view; Tablet & Laptop are always locked to Landscape multi-card view
  const isSingleCardView = isPhone;

  const activeDeck =
    activeSubTab === 'BY YOUR SIDE'
      ? BY_YOUR_SIDE_CARDS
      : activeSubTab === 'FALLING FOR YOU'
      ? FALLING_FOR_YOU_CARDS
      : activeSubTab === 'JOURNAL'
      ? JOURNAL_CARDS
      : activeSubTab === 'PHOTO STUDIO'
      ? PHOTO_STUDIO_CARDS
      : activeSubTab === 'PLAYTIME'
      ? PLAYTIME_CARDS
      : ANECDOTE_CARDS;
  const safeCarouselIdx = Math.min(carouselIdx, activeDeck.length - 1);
  const maxIdx = activeDeck.length - 1;

  const handlePrevCard = () => {
    setCarouselIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNextCard = () => {
    setCarouselIdx((prev) => Math.min(maxIdx, prev + 1));
  };

  const visibleCards = isSingleCardView
    ? activeDeck.slice(safeCarouselIdx, safeCarouselIdx + 1)
    : activeDeck;

  const activeTabObj =
    DATING_TABS.find((t) => t.id === activeSubTab) ?? DATING_TABS[0];
  const activeTabLabel =
    lang === 'VI' ? activeTabObj.labelVI : activeTabObj.labelEN;

  return (
    <div className="relative z-20 flex h-full w-full flex-col justify-between overflow-hidden bg-[#090315]/75 px-3.5 py-3.5 sm:px-7 sm:py-4 md:px-9 md:py-5 lg:px-12 lg:py-7 backdrop-blur-[4px]">
      {/* Subtle Cyberpunk Scanline & Interference Glitch Overlay in Background */}
      <div className="cyber-dating-glitch-overlay" aria-hidden="true" />

      {/* TOP CYBERPUNK BREADCRUMB NAVIGATION & TABS */}
      <header className="relative z-10 flex shrink-0 flex-col gap-2 sm:gap-2.5 lg:gap-3.5">
        {/* Cyberpunk Breadcrumb Path: TRĂNG SOI DẶM TRƯỜNG > HẸN HÒ > [ACTIVE_TAB]
            Right padding reserves space only on this top row for the top-right VI + BGM buttons */}
        <div className="mr-16 sm:mr-24 flex flex-wrap items-center gap-1.5 sm:gap-2.5 border-b border-fuchsia-400/35 bg-gradient-to-r from-[#1e0938]/85 via-[#2d0e52]/55 to-transparent px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-[0_4px_20px_rgba(192,38,211,0.22)]">
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

          {/* Breadcrumb 2: HẸN HÒ / DATING */}
          <button
            type="button"
            onMouseEnter={() => soundFx.playHover()}
            onClick={() => {
              soundFx.playSelect();
              setActiveSubTab('BY YOUR SIDE');
              setCarouselIdx(0);
            }}
            className="cursor-pointer text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-semibold tracking-[0.08em] sm:tracking-[0.14em] text-pink-200 uppercase transition-colors hover:text-white focus:outline-none"
          >
            {lang === 'VI' ? 'HẸN HÒ' : 'DATING'}
          </button>

          {/* Cyberpunk `>` Separator */}
          <ChevronRight
            className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 shrink-0 text-cyan-300 drop-shadow-[0_0_6px_#67e8f9]"
            aria-hidden="true"
          />

          {/* Breadcrumb 3: Active Tab Name (Unframed plain text) */}
          <span className="text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-bold tracking-[0.1em] sm:tracking-[0.15em] text-white uppercase">
            {activeTabLabel}
          </span>
        </div>

        {/* 6 Sub-Navigation Tabs: Full width with comfortable, legible text on phone, tablet, and PC */}
        <nav
          aria-label="Dating Sub Navigation"
          className="flex w-full flex-wrap items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 overflow-hidden"
        >
          {DATING_TABS.map((tab) => {
            const isTabActive = activeSubTab === tab.id;
            const tabText = lang === 'VI' ? tab.labelVI : tab.labelEN;
            return (
              <button
                key={tab.id}
                type="button"
                onMouseEnter={() => {
                  if (!isTabActive) soundFx.playHover();
                }}
                onClick={() => {
                  soundFx.playSelect();
                  setActiveSubTab(tab.id);
                  setCarouselIdx(0);
                  setSelectedCard(null);
                }}
                className={`shrink-0 cursor-pointer px-2.5 py-1 sm:px-3 sm:py-1 md:px-3.5 md:py-1.5 lg:px-4 text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-semibold tracking-[0.08em] sm:tracking-[0.12em] lg:tracking-[0.15em] uppercase transition-all whitespace-nowrap focus:outline-none ${
                  isTabActive
                    ? 'border border-pink-300/85 bg-fuchsia-600/35 text-white shadow-[0_0_12px_rgba(232,121,249,0.55)]'
                    : 'border border-transparent text-purple-200/75 hover:border-fuchsia-400/40 hover:text-white'
                }`}
              >
                {tabText}
              </button>
            );
          })}
        </nav>
      </header>

      {/* MAIN TAB CONTENT AREA (No scrollbar, centered in remaining viewport height) */}
      <div className="relative z-10 flex flex-1 min-h-0 items-center justify-center overflow-hidden">
        {/* ALL 6 TABS: ANECDOTES (4 cards), BY YOUR SIDE (2 cards), FALLING FOR YOU (3 cards), JOURNAL (2 cards), PHOTO STUDIO (3 cards), PLAYTIME (2 cards)
            - Phone (Always Portrait, isSingleCardView): Shows 1 well-proportioned card at a time with Left/Right cyberpunk arrows
            - Tablet & Laptop (Always Landscape, !isSingleCardView): Shows all cards in a single centered row */}
        <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-2.5 sm:gap-4">
            <div className="flex w-full items-center justify-center gap-4 sm:gap-6 md:gap-8">
              {/* Left Cyberpunk `<` Arrow Button (Hidden on first image, shown on subsequent images in Phone Portrait View) */}
              {isSingleCardView && (
                <button
                  type="button"
                  onClick={handlePrevCard}
                  disabled={safeCarouselIdx <= 0}
                  aria-hidden={safeCarouselIdx <= 0}
                  aria-label={lang === 'VI' ? 'Hình trước' : 'Previous image'}
                  className={`cyber-arrow-btn h-10 w-10 shrink-0 focus:outline-none ${
                    safeCarouselIdx <= 0
                      ? 'invisible pointer-events-none'
                      : 'cursor-pointer'
                  }`}
                >
                  <svg
                    viewBox="0 0 36 36"
                    fill="none"
                    className="h-7 w-7"
                  >
                    {/* Outer sharp cyberpunk `<` chevron */}
                    <path
                      d="M23 5L9 18L23 31"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="square"
                    />
                    {/* Inner secondary cyber echo `<` line */}
                    <path
                      d="M28 10L19.5 18L28 26"
                      stroke="#67e8f9"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                      strokeOpacity="0.85"
                    />
                    {/* Tiny cyber diamond node at vertex */}
                    <rect
                      x="4.5"
                      y="16.5"
                      width="3"
                      height="3"
                      transform="rotate(45 6 18)"
                      fill="#f0abfc"
                    />
                  </svg>
                </button>
              )}

              {/* Cards Grid: 1 column on Phone (Portrait), 2 / 3 / 4 columns on Tablet & Laptop (Landscape) */}
              <div
                className={`grid place-items-center ${
                  isSingleCardView
                    ? 'grid-cols-1'
                    : activeSubTab === 'BY YOUR SIDE' ||
                      activeSubTab === 'JOURNAL' ||
                      activeSubTab === 'PLAYTIME'
                    ? 'grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12'
                    : activeSubTab === 'FALLING FOR YOU'
                    ? 'grid-cols-3 gap-5 sm:gap-6 md:gap-8 lg:gap-10'
                    : 'w-full grid-cols-4 gap-3 sm:gap-3.5 md:gap-4 lg:gap-6 xl:gap-7'
                }`}
              >
                {visibleCards.map((card) => {
                  const cardTitle = lang === 'VI' ? card.titleVI : card.titleEN;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onMouseEnter={() => soundFx.playHover()}
                      onClick={() => {
                        soundFx.playSelect();
                        setSelectedCard(card);
                      }}
                      className="group relative flex flex-col items-center text-center cursor-pointer focus:outline-none"
                    >
                      {/* Card Image Container */}
                      <div
                        className={`relative aspect-[9/15.5] overflow-hidden rounded-lg border border-fuchsia-400/45 bg-[#140726] shadow-[0_6px_22px_rgba(0,0,0,0.65)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-pink-300 group-hover:shadow-[0_0_24px_rgba(232,121,249,0.65)] ${
                          isSingleCardView
                            ? 'h-[45vh] max-h-[320px] max-w-[56vw]'
                            : 'h-[40vh] max-h-[235px] md:h-[42vh] md:max-h-[255px] lg:h-[48vh] lg:max-h-[340px] xl:h-[54vh] xl:max-h-[410px]'
                        }`}
                      >
                        <img
                          src={card.image}
                          alt={cardTitle}
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Subtle bottom gradient for polish */}
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0d041a]/75 via-transparent to-transparent"
                          aria-hidden="true"
                        />
                      </div>

                      {/* Title below each image */}
                      <span
                        className={`font-semibold tracking-wide text-purple-100 transition-colors duration-200 group-hover:text-white group-hover:drop-shadow-[0_0_8px_#e879f9] ${
                          isSingleCardView
                            ? 'mt-2 text-[13px]'
                            : 'mt-1.5 md:mt-2 lg:mt-2.5 text-[11px] md:text-xs lg:text-[14px] xl:text-[15px]'
                        }`}
                      >
                        {cardTitle}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Cyberpunk `>` Arrow Button (Hidden on last image, shown on earlier images in Phone Portrait View) */}
              {isSingleCardView && (
                <button
                  type="button"
                  onClick={handleNextCard}
                  disabled={safeCarouselIdx >= maxIdx}
                  aria-hidden={safeCarouselIdx >= maxIdx}
                  aria-label={lang === 'VI' ? 'Hình sau' : 'Next image'}
                  className={`cyber-arrow-btn h-10 w-10 shrink-0 focus:outline-none ${
                    safeCarouselIdx >= maxIdx
                      ? 'invisible pointer-events-none'
                      : 'cursor-pointer'
                  }`}
                >
                  <svg
                    viewBox="0 0 36 36"
                    fill="none"
                    className="h-7 w-7 rotate-180"
                  >
                    {/* Outer sharp cyberpunk `<` chevron */}
                    <path
                      d="M23 5L9 18L23 31"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="square"
                    />
                    {/* Inner secondary cyber echo `<` line */}
                    <path
                      d="M28 10L19.5 18L28 26"
                      stroke="#67e8f9"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                      strokeOpacity="0.85"
                    />
                    {/* Tiny cyber diamond node at vertex */}
                    <rect
                      x="4.5"
                      y="16.5"
                      width="3"
                      height="3"
                      transform="rotate(45 6 18)"
                      fill="#f0abfc"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Subtle Indicator Dots for Phone 1-Card View */}
            {isSingleCardView && (
              <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
                {activeDeck.map((card, idx) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setCarouselIdx(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 sm:h-2 transition-all duration-200 cursor-pointer rounded-full ${
                      safeCarouselIdx === idx
                        ? 'w-6 sm:w-7 bg-pink-300 shadow-[0_0_8px_#e879f9]'
                        : 'w-2 sm:w-2.5 bg-purple-400/35 hover:bg-purple-300/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
      </div>

      {/* Anecdote Card Detail Modal when a portrait card is clicked */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
          onClick={() => {
            soundFx.playBack();
            setSelectedCard(null);
          }}
        >
          <div
            className="relative flex w-full max-w-lg flex-col sm:flex-row gap-5 border border-fuchsia-400/70 bg-[#140726]/95 p-5 text-purple-50 shadow-[0_0_35px_rgba(217,70,239,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                soundFx.playBack();
                setSelectedCard(null);
              }}
              className="absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center border border-fuchsia-400/50 bg-fuchsia-950/60 text-fuchsia-200 hover:border-white hover:text-white"
              aria-label="Close detail"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto w-36 sm:w-44 shrink-0 overflow-hidden rounded-md border border-pink-300/60">
              <img
                src={selectedCard.image}
                alt={lang === 'VI' ? selectedCard.titleVI : selectedCard.titleEN}
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-1 text-[11px] font-bold tracking-widest text-pink-300 uppercase">
                {lang === 'VI' ? selectedCard.chapterCodeVI : selectedCard.chapterCodeEN}
              </div>
              <h3 className="mb-2.5 text-lg font-bold text-white">
                {lang === 'VI' ? selectedCard.titleVI : selectedCard.titleEN}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-purple-100/90">
                {lang === 'VI' ? selectedCard.summaryVI : selectedCard.summaryEN}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
