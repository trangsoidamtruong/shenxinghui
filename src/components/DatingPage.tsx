import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { X } from 'lucide-react';
import { soundFx } from '../utils/soundFx';
import { SiteHeader } from './SiteHeader';
import {
  DATING_SUBTAB_TO_SLUG,
  DATING_CARD_ID_TO_SLUG,
  type DatingSubTabId,
} from '../utils/router';

const loadMemoriaPage = () => import('./MemoriaPage');
const MemoriaPage = lazy(() =>
  loadMemoriaPage().then((m) => ({ default: m.MemoriaPage }))
);

interface DatingPageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  activeSubTab?: DatingSubTabId;
  activeCardId?: string | null;
  isMemoriaOpen?: boolean;
  activeMemoriaCardId?: number | null;
  skipTransition?: boolean;
  onNavigate?: (slug: string) => void;
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
  disabled?: boolean;
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: false,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
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
    disabled: true,
  },
];

const ALL_DATING_CARDS: AnecdoteCard[] = [
  ...ANECDOTE_CARDS,
  ...BY_YOUR_SIDE_CARDS,
  ...FALLING_FOR_YOU_CARDS,
  ...JOURNAL_CARDS,
  ...PHOTO_STUDIO_CARDS,
  ...PLAYTIME_CARDS,
];

const ALL_CARD_IMAGES = ALL_DATING_CARDS.map((c) => c.image);

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
  activeSubTab: externalSubTab,
  activeCardId: externalCardId,
  isMemoriaOpen: externalMemoriaOpen,
  activeMemoriaCardId = null,
  skipTransition = false,
  onNavigate,
  onToggleLang,
  onBackHome,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<DatingSubTab>(
    externalSubTab ?? 'FALLING FOR YOU'
  );
  const [internalCardId, setInternalCardId] = useState<string | null>(
    externalCardId ?? null
  );
  const [internalMemoriaOpen, setInternalMemoriaOpen] = useState<boolean>(
    Boolean(externalMemoriaOpen)
  );

  const activeSubTab: DatingSubTab = externalSubTab ?? internalSubTab;
  const currentCardId: string | null =
    externalCardId !== undefined ? externalCardId : internalCardId;
  const isMemoriaGalleryOpen: boolean =
    externalMemoriaOpen !== undefined ? externalMemoriaOpen : internalMemoriaOpen;

  const selectedCard: AnecdoteCard | null = currentCardId
    ? ALL_DATING_CARDS.find((c) => c.id === currentCardId) ?? null
    : null;

  const handleSelectSubTab = useCallback(
    (nextTab: DatingSubTab) => {
      soundFx.playSelect();
      setInternalSubTab(nextTab);
      setInternalCardId(null);
      setInternalMemoriaOpen(false);
      if (onNavigate) {
        onNavigate(DATING_SUBTAB_TO_SLUG[nextTab]);
      }
    },
    [onNavigate]
  );

  const handleCloseCardModal = useCallback(() => {
    soundFx.playBack();
    setInternalCardId(null);
    if (onNavigate) {
      onNavigate(DATING_SUBTAB_TO_SLUG[activeSubTab]);
    }
  }, [activeSubTab, onNavigate]);

  // Close card modal on Escape before page-level Escape returns home
  useEffect(() => {
    if (!selectedCard) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        handleCloseCardModal();
      }
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [selectedCard, handleCloseCardModal]);

  // Preload active tab images immediately, then warm up remaining tab images during browser idle time
  useEffect(() => {
    const activeImages = new Set(FALLING_FOR_YOU_CARDS.map((c) => c.image));
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
    DATING_TABS.find((t) => t.id === activeSubTab) ?? DATING_TABS[1];
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
            skipBoot={skipTransition || activeMemoriaCardId !== null}
            selectedCardId={activeMemoriaCardId}
            onSelectCard={(cardId) => {
              if (onNavigate) {
                onNavigate(`dating/falling-for-you/memoria/mem${cardId}`);
              }
            }}
            onOpenTranslation={(cardId, url) => {
              if (onNavigate) {
                const cleanSlug =
                  url.replace(/^[#/]+|[#/]+$/g, '') ||
                  `memoria/mem_${String(cardId).padStart(2, '0')}/dich`;
                onNavigate(cleanSlug);
              }
            }}
            onToggleLang={onToggleLang}
            onBackHome={onBackHome}
            onBackToDating={() => {
              setInternalMemoriaOpen(false);
              setInternalSubTab('FALLING FOR YOU');
              if (onNavigate) {
                onNavigate('dating/falling-for-you');
              }
            }}
            onClose={() => {
              setInternalMemoriaOpen(false);
              if (onNavigate) {
                onNavigate('dating/falling-for-you');
              }
            }}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div
      id="page-dating"
      className="cyber-events-scroll relative z-20 flex h-full w-full flex-col overflow-y-auto sm:overflow-y-hidden overflow-x-hidden bg-[var(--void)] text-[var(--text-1)]"
    >
      {/* Subtle Star Specks & Very Light Falling Meteors */}
      <SubtleStarfieldCanvas />

      {/* SHARED HEADER & SUB-TAB BAR */}
      <SiteHeader
        breadcrumbs={[
          {
            label: lang === 'VI' ? 'TRĂNG SOI DẶM TRƯỜNG' : 'MOONSTRIDE',
            onClick: onBackHome,
          },
          {
            label: lang === 'VI' ? 'HẸN HÒ' : 'DATING',
          },
        ]}
        langLabel={onToggleLang ? lang : undefined}
        langTitle={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        langAriaLabel={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        onToggleLang={onToggleLang}
        subTabs={DATING_TABS.map((tab) => ({
          id: tab.id,
          label: lang === 'VI' ? tab.labelVI : tab.labelEN,
        }))}
        activeSubTabId={activeSubTab}
        onSelectSubTab={(id) => {
          handleSelectSubTab(id as DatingSubTab);
        }}
        subTabsAriaLabel="Dating Sub Navigation"
      />

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 flex flex-1 min-h-0 flex-col">
        <div className="wrap flex flex-1 min-h-0 flex-col justify-center py-4 sm:py-[clamp(10px,1.8dvh,24px)]">
          {/* Page Title & Command-line Subtitle */}
          <div className="mb-4 sm:mb-[clamp(10px,1.8dvh,22px)] shrink-0">
            <h1 className="font-[var(--font-mono)] text-2xl sm:text-[clamp(24px,3.6dvh,38px)] font-bold tracking-[-0.02em] text-[var(--text-1)] leading-tight">
              {activeTabTitle}
            </h1>
            <p className="mt-1 sm:mt-[clamp(3px,0.6dvh,8px)] font-[var(--font-sans)] text-xs sm:text-[13px] md:text-[14px] tracking-[0.01em] text-[var(--text-2)]">
              {activeTabSubtitle}
            </p>
          </div>

          {/* Cards Grid:
              - Mobile: 1-2 columns preserving vertical aspect ratio
              - Tablet & Desktop: 4 columns single row sized to fit 100% within laptop/desktop viewport height */}
          <div className="grid w-full min-h-0 grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-4 sm:grid-rows-[minmax(0,1fr)] gap-3.5 sm:gap-3 md:gap-4 lg:gap-6">
            {activeDeck.map((card, idx) => {
              const cardTitle = lang === 'VI' ? card.titleVI : card.titleEN;
              const isCardDisabled = Boolean(card.disabled);
              return (
                <button
                  key={card.id}
                  type="button"
                  disabled={isCardDisabled}
                  aria-disabled={isCardDisabled || undefined}
                  tabIndex={isCardDisabled ? -1 : 0}
                  style={
                    !skipTransition
                      ? {
                          animationDuration: '280ms',
                          animationDelay: `${idx * 65}ms`,
                        }
                      : undefined
                  }
                  onMouseEnter={() => {
                    if (isCardDisabled) return;
                    soundFx.playHover();
                  }}
                  onClick={() => {
                    if (isCardDisabled) return;
                    soundFx.playSelect();
                    if (
                      card.id === 'ffy-2' ||
                      (activeSubTab === 'FALLING FOR YOU' &&
                        (card.titleEN === 'Memoria' || card.titleVI === 'Tư Niệm'))
                    ) {
                      setInternalMemoriaOpen(true);
                      if (onNavigate) {
                        onNavigate('dating/falling-for-you/memoria');
                      }
                      return;
                    }
                    setInternalCardId(card.id);
                    const targetSlug = DATING_CARD_ID_TO_SLUG[card.id];
                    if (onNavigate && targetSlug) {
                      onNavigate(targetSlug);
                    }
                  }}
                  className={` relative flex aspect-[10/14] sm:aspect-auto sm:h-[min(calc(100dvh-228px),35vw,420px)] w-full flex-col rounded-none border border-[var(--line)] bg-[var(--void)] text-left transition-colors duration-[400ms] ease-in-out focus:outline-none ${
                    isCardDisabled
                      ? 'pointer-events-none cursor-default'
                      : 'group cursor-pointer hover:border-[var(--accent)] focus:border-[var(--accent)]'
                  } ${
                    !skipTransition ? 'events-card-reveal-anim' : ''
                  }`}
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

                  {/* Top Image Area: Fills remaining card height cleanly */}
                  <div className="relative min-h-0 flex-1 w-full overflow-hidden bg-[var(--void)]">
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

                  {/* Bottom Info Area: shrink-0 so text & bottom border are never clipped */}
                  <div className="flex shrink-0 w-full flex-col justify-between gap-1.5 border-t border-[var(--line)] bg-[var(--void)] px-3 py-2.5 sm:px-2.5 sm:py-2 md:px-3 md:py-2.5 lg:px-4 lg:py-3">
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
          id={`view-dating-${selectedCard.id}`}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={handleCloseCardModal}
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
              onClick={handleCloseCardModal}
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
