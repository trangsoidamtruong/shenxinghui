import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { X } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

const loadMemoriaPage = () => import('./MemoriaPage');
const MemoriaPage = lazy(() =>
  loadMemoriaPage().then((m) => ({ default: m.MemoriaPage }))
);

interface DatingPageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  onToggleLang?: () => void;
  onBackHome: () => void;
}

const DATING_TABS = [
  {
    id: 'BY YOUR SIDE',
    labelVI: 'Kề bên người',
    labelEN: 'By your side',
    subtitleVI: '> Chọn tệp để giải mã.',
    subtitleEN: '> Select a file to decode.',
  },
  {
    id: 'FALLING FOR YOU',
    labelVI: 'Ước hẹn rung động',
    labelEN: 'Falling for you',
    subtitleVI: '> Chọn tệp để giải mã.',
    subtitleEN: '> Select a file to decode.',
  },
  {
    id: 'ANECDOTES',
    labelVI: 'Giai thoại',
    labelEN: 'Anecdotes',
    subtitleVI: '> Chọn tệp để giải mã.',
    subtitleEN: '> Select a file to decode.',
  },
  {
    id: 'JOURNAL',
    labelVI: 'Sổ tay',
    labelEN: 'Journal',
    subtitleVI: '> Chọn tệp để giải mã.',
    subtitleEN: '> Select a file to decode.',
  },
  {
    id: 'PLAYTIME',
    labelVI: 'Dạo chơi',
    labelEN: 'Playtime',
    subtitleVI: '> Chọn tệp để giải mã.',
    subtitleEN: '> Select a file to decode.',
  },
  {
    id: 'PHOTO STUDIO',
    labelVI: 'Chụp ảnh',
    labelEN: 'Photo studio',
    subtitleVI: '> Chọn tệp để giải mã.',
    subtitleEN: '> Select a file to decode.',
  },
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

/**
 * Subtle Star Particles & Very Light Falling Meteors on #05040f
 */
const SubtleStarfieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number | null = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Small static/slow-twinkling star specks
    const stars = Array.from({ length: 36 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.55 + Math.random() * 0.85,
      baseAlpha: 0.12 + Math.random() * 0.32,
      phase: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.014,
    }));

    // 2 very light, sparse falling meteors
    const angle = 28 * (Math.PI / 180);
    const createFaintMeteor = (initial = false) => {
      const spd = 2.4 + Math.random() * 1.4;
      return {
        x: initial ? Math.random() * width : width * 0.35 + Math.random() * width * 0.8,
        y: initial ? Math.random() * height * 0.6 : -30,
        vx: -Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        len: 42 + Math.random() * 38,
        life: 0,
        maxLife: 130 + Math.floor(Math.random() * 90),
        delay: initial ? Math.floor(Math.random() * 120) : 140 + Math.floor(Math.random() * 220),
        maxAlpha: 0.16 + Math.random() * 0.12,
      };
    };

    const meteors = [createFaintMeteor(true), createFaintMeteor(true)];

    const render = () => {
      if (document.hidden) {
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw tiny star specks (--text-2 #a79fc7)
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.speed;
        const alpha = s.baseAlpha + Math.sin(s.phase) * 0.08;
        ctx.fillStyle = `rgba(167, 159, 199, ${Math.max(0.04, Math.min(0.45, alpha))})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw very light falling meteors (--text-1 #e6e2f5 -> --text-2 #a79fc7)
      for (let i = 0; i < meteors.length; i++) {
        const m = meteors[i];
        if (m.delay > 0) {
          m.delay--;
          continue;
        }

        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        const p = m.life / m.maxLife;
        const alpha =
          p < 0.2
            ? (p / 0.2) * m.maxAlpha
            : p > 0.75
            ? ((1 - p) / 0.25) * m.maxAlpha
            : m.maxAlpha;

        if (alpha > 0.01) {
          const spd = Math.hypot(m.vx, m.vy) || 1;
          const tx = m.x - (m.vx / spd) * m.len;
          const ty = m.y - (m.vy / spd) * m.len;

          const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
          grad.addColorStop(0, `rgba(230, 226, 245, ${alpha})`);
          grad.addColorStop(1, 'rgba(167, 159, 199, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }

        if (m.life >= m.maxLife || m.x < -80 || m.y > height + 80) {
          meteors[i] = createFaintMeteor(false);
        }
      }

      animId = requestAnimationFrame(render);
    };

    const handleVis = () => {
      if (!document.hidden && animId === null) {
        animId = requestAnimationFrame(render);
      } else if (document.hidden && animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    document.addEventListener('visibilitychange', handleVis);
    animId = requestAnimationFrame(render);

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
};

export const DatingPage: React.FC<DatingPageProps> = ({
  lang,
  isPhone = false,
  onToggleLang,
  onBackHome,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DatingSubTab>('ANECDOTES');
  const [selectedCard, setSelectedCard] = useState<AnecdoteCard | null>(null);
  const [isMemoriaGalleryOpen, setIsMemoriaGalleryOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.startsWith('/memoria');
  });

  // Preload active tab images immediately, then warm up remaining tab images during browser idle time
  useEffect(() => {
    const activeImages = new Set(ANECDOTE_CARDS.map((c) => c.image));
    activeImages.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });

    const preloadRemaining = () => {
      ALL_CARD_IMAGES.forEach((src) => {
        if (activeImages.has(src)) return;
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      });
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(preloadRemaining, { timeout: 1500 });
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timerId = window.setTimeout(preloadRemaining, 450);
    return () => window.clearTimeout(timerId);
  }, []);

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

  const activeTabObj =
    DATING_TABS.find((t) => t.id === activeSubTab) ?? DATING_TABS[2];
  const activeTabTitle =
    lang === 'VI' ? activeTabObj.labelVI : activeTabObj.labelEN;
  const activeTabSubtitle =
    lang === 'VI' ? activeTabObj.subtitleVI : activeTabObj.subtitleEN;

  if (isMemoriaGalleryOpen) {
    return (
      <div className="relative z-20 h-full w-full overflow-hidden bg-[var(--void)]">
        <Suspense fallback={<div className="h-full w-full bg-[var(--void)]" />}>
          <MemoriaPage
            lang={lang}
            isPhone={isPhone}
            onToggleLang={onToggleLang}
            onBackHome={() => {
              try {
                if (window.location.pathname !== '/') {
                  window.history.pushState({ page: 'home' }, '', '/');
                }
              } catch {
                // ignore
              }
              onBackHome();
            }}
            onBackToDating={() => {
              try {
                if (window.location.pathname !== '/') {
                  window.history.pushState({ page: 'dating' }, '', '/');
                }
              } catch {
                // ignore
              }
              setIsMemoriaGalleryOpen(false);
              setActiveSubTab('FALLING FOR YOU');
            }}
            onClose={() => {
              try {
                if (window.location.pathname !== '/') {
                  window.history.pushState({ page: 'dating' }, '', '/');
                }
              } catch {
                // ignore
              }
              setIsMemoriaGalleryOpen(false);
            }}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="cyber-events-scroll relative z-20 flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-[var(--void)] text-[var(--text-1)]">
      {/* Subtle Star Specks & Very Light Falling Meteors */}
      <SubtleStarfieldCanvas />

      {/* TOP BAR: BREADCRUMB & TAB BAR */}
      <header className="relative z-10 shrink-0">
        {/* Row 1: Breadcrumb (left) + Language Toggle Button (right, does not follow scroll) */}
        <div className="border-b border-[var(--line)]">
          <div className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-2.5 px-4 py-2.5 sm:px-8 sm:py-3.5 md:px-12">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onMouseEnter={() => soundFx.playHover()}
                onClick={() => {
                  soundFx.playBack();
                  onBackHome();
                }}
                className="cursor-pointer font-[var(--font-mono)] text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-2)] transition-colors duration-150 hover:text-[var(--text-1)] focus:outline-none"
              >
                {lang === 'VI' ? 'TRĂNG SOI DẶM TRƯỜNG' : 'MOONSTRIDE'}
              </button>

              <span
                className="font-[var(--font-mono)] text-[10px] sm:text-[11px] text-[var(--violet)]"
                aria-hidden="true"
              >
                &gt;
              </span>

              <button
                type="button"
                onMouseEnter={() => soundFx.playHover()}
                onClick={() => {
                  soundFx.playSelect();
                  setActiveSubTab('ANECDOTES');
                }}
                className="cursor-pointer font-[var(--font-mono)] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-1)] transition-colors duration-150 hover:text-[var(--lilac)] focus:outline-none"
              >
                {lang === 'VI' ? 'HẸN HÒ' : 'DATING'}
              </button>
            </div>

            {onToggleLang && (
              <div className="flex shrink-0 items-stretch border border-[var(--line)] bg-[var(--deep)]/85">
                <button
                  type="button"
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={() => {
                    soundFx.playSelect();
                    onToggleLang();
                  }}
                  title={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                  aria-label={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                  className="hud-mono-text flex h-7 sm:h-8 items-center justify-center px-2.5 sm:px-3 cursor-pointer rounded-none text-[var(--text-2)] transition-colors duration-200 hover:bg-[var(--violet-d)]/35 hover:text-[var(--text-1)] focus:outline-none"
                >
                  {lang}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Tab Bar (regular case, active tab only has --violet underline, no box fill) */}
        <div className="border-b border-[var(--line)]">
          <nav
            aria-label="Dating Sub Navigation"
            className="mx-auto flex w-full max-w-[1140px] flex-wrap items-center gap-x-4 gap-y-0.5 px-4 py-1 sm:gap-x-7 sm:gap-y-1 sm:px-8 sm:py-0 md:gap-x-9 md:px-12"
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
                    setSelectedCard(null);
                  }}
                  className={`relative sm:-mb-[1px] shrink-0 cursor-pointer border-b-2 py-1 sm:py-3 font-[var(--font-mono)] text-[11px] sm:text-[12px] tracking-[0.04em] whitespace-nowrap transition-colors duration-150 focus:outline-none ${
                    isTabActive
                      ? 'border-[var(--violet)] font-medium text-[var(--text-1)]'
                      : 'border-transparent font-normal text-[var(--text-2)] hover:text-[var(--text-1)]'
                  }`}
                >
                  {tabText}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex flex-1 w-full max-w-[1140px] flex-col justify-center px-4 py-6 sm:px-8 sm:py-8 md:px-12 lg:py-10">
          {/* Page Title & Command-line Subtitle */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <h1 className="font-[var(--font-mono)] text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold tracking-[-0.02em] text-[var(--text-1)]">
              {activeTabTitle}
            </h1>
            <p className="mt-2 sm:mt-2.5 font-[var(--font-sans)] text-xs sm:text-[13px] md:text-[14px] tracking-[0.01em] text-[var(--text-2)]">
              {activeTabSubtitle}
            </p>
          </div>

          {/* Cards Grid:
              - Mobile: 1-2 columns preserving vertical aspect ratio
              - Tablet & Desktop: 4 columns single row matching reference layout */}
          <div className="grid w-full grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-3 md:gap-4 lg:gap-6">
            {activeDeck.map((card) => {
              const cardTitle = lang === 'VI' ? card.titleVI : card.titleEN;
              return (
                <button
                  key={card.id}
                  type="button"
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={() => {
                    soundFx.playSelect();
                    if (
                      card.id === 'ffy-2' ||
                      (activeSubTab === 'FALLING FOR YOU' &&
                        (card.titleEN === 'Memoria' || card.titleVI === 'Tư Niệm'))
                    ) {
                      setIsMemoriaGalleryOpen(true);
                      return;
                    }
                    setSelectedCard(card);
                  }}
                  className="group relative flex aspect-[10/14] w-full cursor-pointer flex-col rounded-none border border-[var(--line)] bg-[var(--void)] text-left transition-colors duration-[400ms] ease-in-out hover:border-[var(--accent)] focus:border-[var(--accent)] focus:outline-none [content-visibility:auto] [contain-intrinsic-size:auto_320px]"
                >
                  {/* 2 Corner Brackets: Top-Left & Bottom-Right */}
                  <span
                    className="pointer-events-none absolute -top-[1px] -left-[1px] z-20 h-2.5 w-2.5 border-t-2 border-l-2 border-[var(--text-2)] transition-colors duration-[400ms] ease-in-out group-hover:border-[var(--accent)]"
                    aria-hidden="true"
                  />
                  <span
                    className="pointer-events-none absolute -right-[1px] -bottom-[1px] z-20 h-2.5 w-2.5 border-r-2 border-b-2 border-[var(--text-2)] transition-colors duration-[400ms] ease-in-out group-hover:border-[var(--accent)]"
                    aria-hidden="true"
                  />

                  {/* Top ~75%: Image Area with Global Dark-Blended Treatment */}
                  <div className="relative h-[75%] w-full overflow-hidden bg-[var(--void)]">
                    <img
                      src={card.image}
                      alt={cardTitle}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="anecdote-card-img h-full w-full object-cover object-top"
                    />

                    {/* Subtle #1a1233 multiply overlay (15% -> 3% on hover) */}
                    <div
                      className="anecdote-card-tint pointer-events-none absolute inset-0"
                      aria-hidden="true"
                    />

                    {/* Bottom 55% dark gradient to #07060f */}
                    <div
                      className="anecdote-card-gradient pointer-events-none absolute inset-0"
                      aria-hidden="true"
                    />

                    {/* Scanlines (hidden unless card has .is-locked) */}
                    <div
                      className="anecdote-card-scanlines pointer-events-none absolute inset-0"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Bottom ~25%: Info Area Inside the Same Card Frame */}
                  <div className="flex h-[25%] w-full flex-col justify-between border-t border-[var(--line)] bg-[var(--void)] px-3 py-2.5 sm:px-2.5 sm:py-1.5 md:px-3 md:py-2 lg:px-4 lg:py-3">
                    {/* Top Info Row: ANECDOTE // 01 (or GIAI THOẠI // 01) + bordered OPEN / MỞ label */}
                    <div className="flex items-center justify-between gap-1.5 lg:gap-2">
                      <span className="truncate font-[var(--font-mono)] text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.12em] lg:tracking-[0.18em] text-[var(--text-2)]">
                        {lang === 'VI' ? card.chapterCodeVI : card.chapterCodeEN}
                      </span>
                      <span className="site-badge shrink-0 rounded-none px-1.5 py-0.5 lg:px-2 font-[var(--font-mono)] text-[9px] lg:text-[10px] uppercase tracking-[0.12em] lg:tracking-[0.14em]">
                        {lang === 'VI' ? 'MỞ' : 'OPEN'}
                      </span>
                    </div>

                    {/* Bottom Info Row: Anecdote Title in clean sans-serif, --text-1, medium-bold */}
                    <div className="truncate font-[var(--font-sans)] text-[13px] sm:text-[12px] md:text-[13px] lg:text-[15px] font-semibold text-[var(--text-1)]">
                      {cardTitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decoded Memory Detail Modal when a card is clicked */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={() => {
            soundFx.playBack();
            setSelectedCard(null);
          }}
        >
          <div
            className="relative flex w-full max-w-lg flex-col sm:flex-row gap-5 rounded-none border border-[var(--line)] bg-[var(--deep)] p-5 text-[var(--text-1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner brackets on modal */}
            <span
              className="pointer-events-none absolute -top-[1px] -left-[1px] h-3 w-3 border-t-2 border-l-2 border-[var(--lilac)]"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -right-[1px] -bottom-[1px] h-3 w-3 border-r-2 border-b-2 border-[var(--lilac)]"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={() => {
                soundFx.playBack();
                setSelectedCard(null);
              }}
              className="absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-none border border-[var(--line)] bg-[var(--void)] text-[var(--text-2)] transition-colors hover:border-[var(--violet)] hover:text-[var(--text-1)]"
              aria-label="Close detail"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="site-media-frame mx-auto w-36 sm:w-44 shrink-0 overflow-hidden rounded-none border border-[var(--line)]">
              <img
                src={selectedCard.image}
                alt={lang === 'VI' ? selectedCard.titleVI : selectedCard.titleEN}
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center pr-4">
              <div className="mb-1.5 font-[var(--font-mono)] text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[var(--lilac)]">
                {lang === 'VI' ? selectedCard.chapterCodeVI : selectedCard.chapterCodeEN}
              </div>
              <h3 className="mb-2.5 font-[var(--font-sans)] text-lg font-semibold text-[var(--text-1)]">
                {lang === 'VI' ? selectedCard.titleVI : selectedCard.titleEN}
              </h3>
              <p className="font-[var(--font-sans)] text-xs sm:text-sm leading-relaxed text-[var(--text-2)]">
                {lang === 'VI' ? selectedCard.summaryVI : selectedCard.summaryEN}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
