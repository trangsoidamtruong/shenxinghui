import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SiteHeader } from './SiteHeader';
import { soundFx } from '../utils/soundFx';
import {
  CREDITS,
  ABOUT_SOCIAL_LINKS,
  ABOUT_FEEDBACK_ENDPOINT,
  type CreditTuple,
} from '../data/aboutData';

interface AboutPageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  skipBoot?: boolean;
  onToggleLang?: () => void;
  onBackHome: () => void;
}

type WindowId = 'w-host' | 'w-cred' | 'w-disc' | 'w-node' | 'w-dos';

interface WindowState {
  open: boolean;
  collapsed: boolean;
  maximized: boolean;
  full: boolean;
  zIndex: number;
  x: number | null;
  y: number | null;
  placed: boolean;
}

const INITIAL_REL_POS: Record<WindowId, { rx: number; ry: number; width: number }> = {
  'w-host': { rx: 0.12, ry: 0.06, width: 420 },
  'w-cred': { rx: 0.22, ry: 0.08, width: 500 },
  'w-disc': { rx: 0.2, ry: 0.12, width: 460 },
  'w-node': { rx: 0.26, ry: 0.16, width: 420 },
  'w-dos': { rx: 0.45, ry: 0.25, width: 340 },
};

const WINDOW_IDS: WindowId[] = ['w-host', 'w-cred', 'w-disc', 'w-node', 'w-dos'];

function createNoiseDataUri(seed: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='${seed}'/><feColorMatrix values='0 0 0 0 .8 0 0 0 0 .85 0 0 0 0 1 0 0 0 -2.2 1.5'/></filter><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.012' numOctaves='3' seed='${seed + 9}'/><feColorMatrix values='0 0 0 0 .1 0 0 0 0 .1 0 0 0 0 .2 0 0 0 -3 1.6'/></filter><rect width='200' height='200' fill='#111'/><rect width='200' height='200' filter='url(#g)'/><rect width='200' height='200' filter='url(#f)'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function getCreditAvatarBg(item: CreditTuple, index: number): string {
  const customUrl = item[5]?.trim();
  if (customUrl) {
    return `url("${customUrl}") center/cover`;
  }
  return `${createNoiseDataUri(index * 7 + 11)} center/cover`;
}

const HOST_AVATAR_BG =
  'url("/assets/aistudio/Moonstrider_b7751767.webp") center/contain no-repeat, radial-gradient(circle at 50% 50%, #1c163c 0%, #0d0a22 100%)';
const WALLPAPER_SRC = '/assets/aistudio/wallpaper-xavier.webp';

const I18N = {
  VI: {
    crumbRoot: 'TSDT',
    crumbPage: 'GIỚI THIỆU',
    bootLines: [
      'KHỞI TẠO KÊNH GIỚI THIỆU [HOÀN TẤT]',
      'TẢI HỒ SƠ CHỦ TRẠM [HOÀN TẤT]',
      'DỰNG GIAO DIỆN CỬA SỔ [HOÀN TẤT]',
      'QUÉT CÁC NÚT [HOÀN TẤT]',
    ],
    desktopNavAria: 'Tệp trên màn hình',
    dblClickHint: 'Nhấp đúp để mở',
    icons: {
      host: 'Giới thiệu',
      cred: 'Danh đề',
      disc: 'Chú ý',
      node: 'Kết nối',
    },
    winCtrl: {
      min: 'Thu nhỏ',
      max: 'Phóng to',
      close: 'Đóng',
    },
    host: {
      aria: 'Giới thiệu',
      title: 'Giới thiệu',
      intro:
        'Admin: Lys.\nMột trạm dừng nhỏ lưu giữ ánh sáng của Thẩm Tinh Hồi giữa dải ngân hà rộng lớn.',
      status: 'TRẠNG THÁI: HOẠT ĐỘNG',
    },
    cred: {
      aria: 'Danh đề',
      thanks:
        'Chân thành cảm ơn mọi người đã đóng góp tư liệu và tình yêu dành cho Thẩm Tinh Hồi để thắp sáng góc nhỏ này.',
      countSuffix: 'hồ sơ',
      statusHint: 'Chọn một hồ sơ để mở',
    },
    disc: {
      aria: 'Tuyên bố miễn trừ',
      title: 'Tuyên bố miễn trừ',
      p1: 'Trang này là sản phẩm do người hâm mộ tự làm, phi thương mại và không liên kết với nhà phát hành Love and Deepspace.',
      p2: 'Hình ảnh, âm thanh, tên nhân vật và mọi tài sản liên quan đến Love and Deepspace thuộc về chủ sở hữu hợp pháp của chúng. Nội dung đóng góp thuộc về từng tác giả được ghi ở mục Danh đề.',
      status: 'TRẠNG THÁI: ĐÃ ĐỌC',
    },
    node: {
      aria: 'Kết nối',
      title: 'Kênh liên lạc',
      feedbackLabel: 'Hòm thư góp ý',
      placeholder: 'Viết góp ý, báo lỗi hoặc lời nhắn…',
      sendBtn: 'GỬI TÍN HIỆU',
      sendingBtn: 'ĐANG GỬI...',
      status: 'KÊNH: MỞ',
      emptyToast: 'Hòm thư đang trống.',
      demoToast: 'Đã gửi tín hiệu (bản demo).',
      sentToast: 'Đã gửi tín hiệu thành công!',
      errToast: 'Không thể gửi tín hiệu lúc này, vui lòng thử lại sau.',
      linkPendingToast: 'Liên kết đang được cập nhật.',
    },
    dos: {
      aria: 'Hồ sơ',
      openLink: 'MỞ LIÊN KẾT ↗',
    },
  },
  EN: {
    crumbRoot: 'MOONSTRIDE',
    crumbPage: 'ABOUT',
    bootLines: [
      'INITIALIZING ABOUT CHANNEL [DONE]',
      'LOADING STATION HOST PROFILE [DONE]',
      'BUILDING WINDOW INTERFACE [DONE]',
      'SCANNING NODES [DONE]',
    ],
    desktopNavAria: 'Desktop files',
    dblClickHint: 'Double-click to open',
    icons: {
      host: 'About',
      cred: 'Credits',
      disc: 'Disclaimer',
      node: 'Node',
    },
    winCtrl: {
      min: 'Minimize',
      max: 'Maximize',
      close: 'Close',
    },
    host: {
      aria: 'About',
      title: 'About',
      intro:
        "Admin: Lys.\nA small relay station preserving Xavier's light amidst the vast galaxy.",
      status: 'STATUS: ONLINE',
    },
    cred: {
      aria: 'Credits',
      thanks:
        'Heartfelt thanks to everyone who contributed materials and love for Xavier to light up this little corner.',
      countSuffix: 'dossiers',
      statusHint: 'Select a dossier to open',
    },
    disc: {
      aria: 'Disclaimer',
      title: 'Disclaimer',
      p1: 'This website is a non-commercial, fan-made project and is not affiliated with the official publisher of Love and Deepspace.',
      p2: 'All images, audio, character names, and assets related to Love and Deepspace belong to their respective rightful owners. Contributed works belong to each credited creator listed in Credits.',
      status: 'STATUS: ACKNOWLEDGED',
    },
    node: {
      aria: 'Node',
      title: 'Communication Node',
      feedbackLabel: 'Feedback Mailbox',
      placeholder: 'Write feedback, bug reports, or a message…',
      sendBtn: 'SEND SIGNAL',
      sendingBtn: 'TRANSMITTING...',
      status: 'CHANNEL: OPEN',
      emptyToast: 'Mailbox is empty.',
      demoToast: 'Signal transmitted (demo mode).',
      sentToast: 'Signal transmitted successfully!',
      errToast: 'Could not transmit signal right now, please try again.',
      linkPendingToast: 'Link will be updated soon.',
    },
    dos: {
      aria: 'Dossier',
      openLink: 'OPEN LINK ↗',
    },
  },
} as const;

export const AboutPage: React.FC<AboutPageProps> = ({
  lang,
  isPhone = false,
  skipBoot = false,
  onToggleLang,
  onBackHome,
}) => {
  const t = I18N[lang];

  const [reducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [isCompactLayout, setIsCompactLayout] = useState<boolean>(() => {
    if (isPhone) return true;
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 899px)').matches;
  });

  const [showBoot, setShowBoot] = useState<boolean>(() => !reducedMotion && !skipBoot);
  const [bootLinesVisible, setBootLinesVisible] = useState<number>(0);

  const [selectedIcon, setSelectedIcon] = useState<WindowId | null>(null);
  const [activeWinId, setActiveWinId] = useState<WindowId | null>(null);
  const zCounterRef = useRef<number>(10);

  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(() => ({
    'w-host': {
      open: false,
      collapsed: false,
      maximized: false,
      full: false,
      zIndex: 10,
      x: null,
      y: null,
      placed: false,
    },
    'w-cred': {
      open: false,
      collapsed: false,
      maximized: false,
      full: false,
      zIndex: 10,
      x: null,
      y: null,
      placed: false,
    },
    'w-disc': {
      open: false,
      collapsed: false,
      maximized: false,
      full: false,
      zIndex: 10,
      x: null,
      y: null,
      placed: false,
    },
    'w-node': {
      open: false,
      collapsed: false,
      maximized: false,
      full: false,
      zIndex: 10,
      x: null,
      y: null,
      placed: false,
    },
    'w-dos': {
      open: false,
      collapsed: false,
      maximized: false,
      full: false,
      zIndex: 10,
      x: null,
      y: null,
      placed: false,
    },
  }));

  const [activeDossierIndex, setActiveDossierIndex] = useState<number>(0);
  const [hostTypedDone, setHostTypedDone] = useState<boolean>(false);
  const [hostTypedCount, setHostTypedCount] = useState<number>(0);
  const [hostStartedTyping, setHostStartedTyping] = useState<boolean>(false);

  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [isSendingFeedback, setIsSendingFeedback] = useState<boolean>(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const deskRef = useRef<HTMLElement | null>(null);
  const wallRef = useRef<HTMLDivElement | null>(null);
  const wallImgRef = useRef<HTMLImageElement | null>(null);

  const iconBtnRefs = useRef<Partial<Record<WindowId, HTMLButtonElement | null>>>({});
  const creditItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const winRefs = useRef<Partial<Record<WindowId, HTMLElement | null>>>({});
  const lastLauncherRef = useRef<HTMLElement | null>(null);

  const dragStateRef = useRef<{
    winId: WindowId;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastText(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastText(null);
      toastTimerRef.current = null;
    }, 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const computeDefaultPosition = useCallback(
    (id: WindowId) => {
      const desk = deskRef.current;
      const cfg = INITIAL_REL_POS[id];
      if (!desk) {
        return { x: 40, y: 24 };
      }
      const winEl = winRefs.current[id];
      const mw = winEl?.offsetWidth || cfg.width || 400;
      const x = Math.max(
        10,
        Math.min(desk.clientWidth * cfg.rx, desk.clientWidth - mw - 10)
      );
      const y = Math.max(8, desk.clientHeight * cfg.ry - 20);
      return { x, y };
    },
    []
  );

  const placeUnplacedWindows = useCallback(() => {
    if (isCompactLayout) return;
    setWindows((prev) => {
      let changed = false;
      const next = { ...prev };
      WINDOW_IDS.forEach((id) => {
        if (!next[id].placed) {
          const pos = computeDefaultPosition(id);
          next[id] = { ...next[id], x: pos.x, y: pos.y, placed: true };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [computeDefaultPosition, isCompactLayout]);

  useEffect(() => {
    const updateLayoutMode = () => {
      const compact =
        isPhone ||
        (typeof window !== 'undefined' &&
          window.matchMedia('(max-width: 899px)').matches);
      setIsCompactLayout(compact);
      if (compact) {
        setWindows((prev) => {
          const next = { ...prev };
          WINDOW_IDS.forEach((id) => {
            next[id] = {
              ...next[id],
              collapsed: false,
              full: next[id].open,
            };
          });
          return next;
        });
      } else {
        setWindows((prev) => {
          const next = { ...prev };
          WINDOW_IDS.forEach((id) => {
            next[id] = { ...next[id], collapsed: false, full: false };
          });
          return next;
        });
      }
    };

    updateLayoutMode();
    window.addEventListener('resize', updateLayoutMode);
    return () => window.removeEventListener('resize', updateLayoutMode);
  }, [isPhone]);

  useEffect(() => {
    if (!isCompactLayout) {
      placeUnplacedWindows();
    }
  }, [isCompactLayout, placeUnplacedWindows]);

  useEffect(() => {
    if (!showBoot) return;
    const timers: number[] = [];
    for (let i = 0; i < 4; i++) {
      timers.push(
        window.setTimeout(() => {
          setBootLinesVisible(i + 1);
        }, i * 260)
      );
    }
    timers.push(
      window.setTimeout(() => {
        setShowBoot(false);
      }, 1500)
    );
    timers.push(
      window.setTimeout(() => {
        setShowBoot(false);
      }, 4000)
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [showBoot]);

  useEffect(() => {
    if (!hostStartedTyping || hostTypedDone) return;
    if (reducedMotion) {
      setHostTypedDone(true);
      setHostTypedCount(t.host.intro.length);
      return;
    }

    const targetLen = t.host.intro.length;
    const iv = window.setInterval(() => {
      setHostTypedCount((prev) => {
        const next = prev + 1;
        if (next >= targetLen) {
          window.clearInterval(iv);
          setHostTypedDone(true);
          return targetLen;
        }
        return next;
      });
    }, 22);

    return () => window.clearInterval(iv);
  }, [hostStartedTyping, hostTypedDone, reducedMotion, t.host.intro.length]);

  const bringToFront = useCallback((id: WindowId) => {
    zCounterRef.current += 1;
    const nextZ = zCounterRef.current;
    setActiveWinId(id);
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        zIndex: nextZ,
      },
    }));
  }, []);

  const openWindow = useCallback(
    (id: WindowId, launcherEl?: HTMLElement | null) => {
      soundFx.playSelect();
      if (launcherEl) {
        lastLauncherRef.current = launcherEl;
      }
      zCounterRef.current += 1;
      const nextZ = zCounterRef.current;
      setActiveWinId(id);

      setWindows((prev) => {
        const cur = prev[id];
        const pos = cur.placed ? { x: cur.x, y: cur.y } : computeDefaultPosition(id);
        return {
          ...prev,
          [id]: {
            ...cur,
            open: true,
            collapsed: false,
            full: isCompactLayout,
            zIndex: nextZ,
            x: pos.x,
            y: pos.y,
            placed: true,
          },
        };
      });

      if (id === 'w-host' && !hostStartedTyping) {
        setHostStartedTyping(true);
        if (reducedMotion) {
          setHostTypedDone(true);
          setHostTypedCount(t.host.intro.length);
        } else {
          setHostTypedCount(1);
        }
      }

      if (isCompactLayout && deskRef.current) {
        deskRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }

      window.requestAnimationFrame(() => {
        const winEl = winRefs.current[id];
        const closeBtn = winEl?.querySelector<HTMLButtonElement>('.about-tb-cl');
        closeBtn?.focus({ preventScroll: true });
      });
    },
    [
      computeDefaultPosition,
      hostStartedTyping,
      isCompactLayout,
      reducedMotion,
      t.host.intro.length,
    ]
  );

  const closeWindow = useCallback((id: WindowId) => {
    soundFx.playBack();
    setWindows((prev) => {
      const next = {
        ...prev,
        [id]: {
          ...prev[id],
          open: false,
          full: false,
        },
      };
      const remaining = WINDOW_IDS.filter((k) => next[k].open).sort(
        (a, b) => next[b].zIndex - next[a].zIndex
      );
      setActiveWinId(remaining[0] ?? null);
      return next;
    });

    window.requestAnimationFrame(() => {
      if (id === 'w-dos') {
        creditItemRefs.current[activeDossierIndex]?.focus({ preventScroll: true });
      } else {
        iconBtnRefs.current[id]?.focus({ preventScroll: true });
      }
    });
  }, [activeDossierIndex]);

  const handleOpenDossier = useCallback(
    (index: number, el: HTMLElement | null) => {
      setActiveDossierIndex(index);
      openWindow('w-dos', el);
    },
    [openWindow]
  );

  const hasAnyWindowOpen = WINDOW_IDS.some((id) => windows[id].open);
  const isCompactWindowOpenRef = useRef<boolean>(false);
  isCompactWindowOpenRef.current = isCompactLayout && hasAnyWindowOpen;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const openList = WINDOW_IDS.filter((id) => windows[id].open).sort(
        (a, b) => windows[b].zIndex - windows[a].zIndex
      );
      if (openList.length > 0) {
        e.stopPropagation();
        e.preventDefault();
        closeWindow(openList[0]);
      } else {
        e.stopPropagation();
        e.preventDefault();
        soundFx.playBack();
        onBackHome();
      }
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [windows, closeWindow, onBackHome]);

  useEffect(() => {
    if (reducedMotion) return;
    const wall = wallRef.current;
    const img = wallImgRef.current;
    if (!wall || !img) return;

    const cv = document.createElement('canvas');
    const g = cv.getContext('2d');
    const bl = document.createElement('canvas');
    const blCtx = bl.getContext('2d');
    if (!g || !blCtx) return;

    let W = 0;
    let H = 0;
    let D = 1;
    let iw = 0;
    let ih = 0;
    let last = 0;
    let fl = 0;
    let nf = 4;
    let rafId: number | null = null;
    let mounted = true;

    interface MatrixCol {
      x: number;
      headY: number;
      speed: number;
      len: number;
      seed: number;
    }

    interface GlitchSlice {
      y0: number;
      h: number;
      offsetX: number;
      ghostX: number;
    }

    const MATRIX_CHARS = '0101792468013579ABCDEF01';
    const ALPHA_BUCKETS = 16;
    const HEAD_STYLES = Array.from({ length: ALPHA_BUCKETS }, (_, b) => {
      const a = ((b + 1) / ALPHA_BUCKETS) * 0.92;
      return `rgba(226, 224, 248, ${a.toFixed(2)})`;
    });
    const MID_STYLES = Array.from({ length: ALPHA_BUCKETS }, (_, b) => {
      const a = ((b + 1) / ALPHA_BUCKETS) * 0.86;
      return `rgba(182, 176, 226, ${a.toFixed(2)})`;
    });
    const TAIL_STYLES = Array.from({ length: ALPHA_BUCKETS }, (_, b) => {
      const a = ((b + 1) / ALPHA_BUCKETS) * 0.76;
      return `rgba(124, 118, 182, ${a.toFixed(2)})`;
    });

    let matrixCols: MatrixCol[] = [];
    let glitchSlices: GlitchSlice[] = [];
    let glitchTimer = 0;
    let nextGlitchWait = 1.1;

    let cachedLeftGrad: CanvasGradient | null = null;
    let cachedRightGrad: CanvasGradient | null = null;
    let cachedTopGrad: CanvasGradient | null = null;
    let cachedLeftFadeEnd = 0;
    let cachedRightFadeStart = 0;
    let cachedTopFadeEnd = 0;
    let cachedFont = '';
    let cachedCellH = 11;
    let cachedMaxRow = 60;

    const spawnGlitchSlices = () => {
      const count = 2 + Math.floor(Math.random() * 3);
      const slices: GlitchSlice[] = [];
      for (let i = 0; i < count; i++) {
        const y0 = (0.08 + Math.random() * 0.82) * H;
        const h = (10 + Math.random() * 38) * D;
        const dir = Math.random() < 0.5 ? -1 : 1;
        const mag = (7 + Math.random() * 16) * D * dir;
        slices.push({
          y0,
          h,
          offsetX: mag,
          ghostX: -mag * 0.45,
        });
      }
      glitchSlices = slices;
      glitchTimer = 0.09 + Math.random() * 0.14;
      nextGlitchWait = 1.0 + Math.random() * 1.8;
    };

    const fit = () => {
      if (!wall) return;
      D = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(1, Math.round(wall.clientWidth * D));
      H = Math.max(1, Math.round(wall.clientHeight * D));
      cv.width = W;
      cv.height = H;

      cachedCellH = Math.max(10, Math.round(11 * D));
      cachedMaxRow = Math.ceil(H / cachedCellH) + 28;
      cachedFont = `600 ${Math.round(10.5 * D)}px "JetBrains Mono", monospace`;

      const stepX = Math.max(8, Math.round(10 * D));
      const numCols = Math.ceil(W / stepX);
      const rows = cachedMaxRow + 4;
      const streams: MatrixCol[] = [];
      for (let i = 0; i < numCols; i++) {
        const x = i * stepX + Math.round(stepX * 0.5);
        const len1 = 16 + ((i * 13) % 16);
        const len2 = 14 + ((i * 19 + 5) % 16);
        streams.push({
          x,
          headY: ((i * 17 + 7) % rows) - 8,
          speed: 5.5 + ((i * 31) % 10) * 0.75,
          len: len1,
          seed: i * 97 + 11,
        });
        streams.push({
          x,
          headY: ((i * 17 + 7 + Math.floor(rows * 0.52)) % rows) - 12,
          speed: 5.0 + ((i * 23 + 3) % 10) * 0.7,
          len: len2,
          seed: i * 131 + 53,
        });
      }
      matrixCols = streams;

      if (iw > 0 && ih > 0) {
        const m = window.innerWidth < 900 || isPhone;
        const baseScale = m
          ? Math.max(W / iw, (H / ih) * 0.88)
          : Math.min(W / iw, H / ih);
        const dw0 = iw * baseScale;
        const dh0 = ih * baseScale;
        const ox0 = (W - dw0) * 0.5;
        const oy0 = (H - dh0) * (m ? 0.92 : 1.0);
        const fadeW = Math.max(48 * D, dw0 * 0.14);

        cachedLeftFadeEnd = ox0 + fadeW;
        cachedLeftGrad = g.createLinearGradient(ox0 - 12 * D, 0, cachedLeftFadeEnd, 0);
        cachedLeftGrad.addColorStop(0, '#05040f');
        cachedLeftGrad.addColorStop(0.28, '#05040f');
        cachedLeftGrad.addColorStop(1, 'rgba(5, 4, 15, 0)');

        cachedRightFadeStart = ox0 + dw0 - fadeW;
        cachedRightGrad = g.createLinearGradient(
          cachedRightFadeStart,
          0,
          ox0 + dw0 + 12 * D,
          0
        );
        cachedRightGrad.addColorStop(0, 'rgba(5, 4, 15, 0)');
        cachedRightGrad.addColorStop(0.72, '#05040f');
        cachedRightGrad.addColorStop(1, '#05040f');

        if (oy0 > 0) {
          const topFadeH = Math.max(28 * D, dh0 * 0.08);
          cachedTopFadeEnd = oy0 + topFadeH;
          cachedTopGrad = g.createLinearGradient(0, oy0 - 4 * D, 0, cachedTopFadeEnd);
          cachedTopGrad.addColorStop(0, '#05040f');
          cachedTopGrad.addColorStop(1, 'rgba(5, 4, 15, 0)');
        } else {
          cachedTopGrad = null;
          cachedTopFadeEnd = 0;
        }
      }
    };

    const frame = (tNow: number) => {
      if (!mounted) return;
      rafId = window.requestAnimationFrame(frame);
      if (
        document.hidden ||
        isCompactWindowOpenRef.current ||
        W === 0 ||
        H === 0 ||
        iw === 0 ||
        ih === 0
      ) {
        return;
      }
      if (tNow - last < 33) return;
      const dt = Math.min(0.1, (tNow - last) / 1000);
      last = tNow;
      const s = tNow / 1000;

      const m = window.innerWidth < 900 || isPhone;
      const baseScale = m
        ? Math.max(W / iw, (H / ih) * 0.88)
        : Math.min(W / iw, H / ih);
      const sc = baseScale * (1.0 + 0.006 * Math.sin(s * 0.17));
      const dw = iw * sc;
      const dh = ih * sc;
      const ox = (W - dw) * 0.5 + Math.sin(s * 0.11) * 5 * D;
      const oy = (H - dh) * (m ? 0.92 : 1.0) + Math.cos(s * 0.09) * 3 * D;

      nf -= dt;
      if (nf <= 0) {
        fl = 1;
        nf = 3.5 + Math.random() * 4.5;
      }
      fl = Math.max(0, fl - dt * 2.8);

      if (glitchTimer > 0) {
        glitchTimer -= dt;
        if (glitchTimer <= 0) {
          glitchSlices = [];
        }
      } else {
        nextGlitchWait -= dt;
        if (nextGlitchWait <= 0) {
          spawnGlitchSlices();
        }
      }

      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      g.fillStyle = '#05040f';
      g.fillRect(0, 0, W, H);

      g.drawImage(img, 0, 0, iw, ih, ox, oy, dw, dh);

      for (let k = 0; k < glitchSlices.length; k++) {
        const sl = glitchSlices[k];
        const sy = (sl.y0 - oy) / sc;
        const sh = sl.h / sc;
        if (sy + sh <= 0 || sy >= ih) continue;
        const clampedSy = Math.max(0, Math.min(ih - 1, sy));
        const clampedSh = Math.max(1, Math.min(ih - clampedSy, sh));
        const destY = oy + clampedSy * sc;
        const destH = clampedSh * sc;

        g.drawImage(
          img,
          0,
          clampedSy,
          iw,
          clampedSh,
          ox + sl.offsetX,
          destY,
          dw,
          destH
        );
        g.globalAlpha = 0.24;
        g.drawImage(
          img,
          0,
          clampedSy,
          iw,
          clampedSh,
          ox + sl.ghostX,
          destY,
          dw,
          destH
        );
        g.globalAlpha = 1;
      }

      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = Math.max(
        0,
        0.13 + 0.09 * Math.sin(s * 0.9) + fl * 0.08
      );
      g.drawImage(bl, ox, oy, dw, dh);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;

      if (cachedLeftGrad) {
        g.fillStyle = cachedLeftGrad;
        g.fillRect(0, 0, cachedLeftFadeEnd, H);
      }
      if (cachedRightGrad) {
        g.fillStyle = cachedRightGrad;
        g.fillRect(cachedRightFadeStart, 0, W - cachedRightFadeStart, H);
      }
      if (cachedTopGrad && cachedTopFadeEnd > 0) {
        g.fillStyle = cachedTopGrad;
        g.fillRect(0, 0, W, cachedTopFadeEnd);
      }

      const tick = Math.floor(s * 12);
      g.font = cachedFont;
      g.textAlign = 'center';

      const imgLeftEdge = ox + dw * 0.14;
      const imgRightEdge = ox + dw * 0.86;
      const coreLeft = ox + dw * 0.32;
      const coreRight = ox + dw * 0.68;

      for (let i = 0; i < matrixCols.length; i++) {
        const col = matrixCols[i];
        col.headY += col.speed * dt;
        if (col.headY - col.len > cachedMaxRow) {
          col.headY = -2 - ((col.seed + tick) % 10);
        }

        let zoneWeight = 1.0;
        if (col.x > coreLeft && col.x < coreRight) {
          zoneWeight = 0.12;
        } else if (col.x >= imgLeftEdge && col.x <= coreLeft) {
          const tEdge = (coreLeft - col.x) / Math.max(1, coreLeft - imgLeftEdge);
          zoneWeight = 0.2 + 0.8 * tEdge;
        } else if (col.x >= coreRight && col.x <= imgRightEdge) {
          const tEdge = (col.x - coreRight) / Math.max(1, imgRightEdge - coreRight);
          zoneWeight = 0.2 + 0.8 * tEdge;
        }

        const headRow = Math.floor(col.headY);
        for (let k = 0; k < col.len; k++) {
          const row = headRow - k;
          const py = row * cachedCellH;
          if (py < -cachedCellH || py > H + cachedCellH) continue;

          const falloff = 1 - k / col.len;
          const alpha = Math.pow(falloff, 1.45) * zoneWeight;
          if (alpha < 0.03) continue;

          const bucket = Math.min(
            ALPHA_BUCKETS - 1,
            Math.max(0, Math.floor(alpha * ALPHA_BUCKETS))
          );

          const charIdx =
            Math.abs(col.seed + row * 13 + (k === 0 ? tick : Math.floor(tick / 4))) %
            MATRIX_CHARS.length;
          const ch = MATRIX_CHARS[charIdx];

          if (k === 0) {
            g.fillStyle = HEAD_STYLES[bucket];
          } else if (k < 4) {
            g.fillStyle = MID_STYLES[bucket];
          } else {
            g.fillStyle = TAIL_STYLES[bucket];
          }
          g.fillText(ch, col.x, py);
        }
      }
    };

    const build = () => {
      if (!mounted || !img.naturalWidth || !img.naturalHeight) return;
      iw = img.naturalWidth;
      ih = img.naturalHeight;
      bl.width = Math.max(1, Math.round(iw / 8));
      bl.height = Math.max(1, Math.round(ih / 8));
      blCtx.drawImage(img, 0, 0, bl.width, bl.height);
      fit();
      wall.appendChild(cv);
      img.style.visibility = 'hidden';
      window.addEventListener('resize', fit);
      rafId = window.requestAnimationFrame(frame);
    };

    if (img.complete && img.naturalWidth) {
      build();
    } else {
      img.addEventListener('load', build, { once: true });
    }

    return () => {
      mounted = false;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', fit);
      img.removeEventListener('load', build);
      if (cv.parentNode === wall) {
        wall.removeChild(cv);
      }
      img.style.visibility = '';
    };
  }, [reducedMotion, isPhone]);

  const handleTitleBarPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    id: WindowId
  ) => {
    if ((e.target as HTMLElement).closest('button')) return;
    bringToFront(id);
    if (isCompactLayout) {
      return;
    }
    const winState = windows[id];
    if (winState.maximized) return;
    const winEl = winRefs.current[id];
    if (!winEl) return;

    dragStateRef.current = {
      winId: id,
      startX: e.clientX,
      startY: e.clientY,
      origX: winState.x ?? winEl.offsetLeft,
      origY: winState.y ?? winEl.offsetTop,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleTitleBarPointerMove = (
    e: React.PointerEvent<HTMLDivElement>,
    id: WindowId
  ) => {
    const drag = dragStateRef.current;
    if (!drag || drag.winId !== id) return;
    const desk = deskRef.current;
    const winEl = winRefs.current[id];
    if (!desk || !winEl) return;

    const nextX = Math.max(
      -winEl.offsetWidth + 80,
      Math.min(drag.origX + e.clientX - drag.startX, desk.clientWidth - 80)
    );
    const nextY = Math.max(
      0,
      Math.min(drag.origY + e.clientY - drag.startY, desk.clientHeight - 30)
    );

    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        x: nextX,
        y: nextY,
        placed: true,
      },
    }));
  };

  const handleTitleBarPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current) {
      dragStateRef.current = null;
      e.currentTarget.style.cursor = '';
    }
  };

  const handleIconClick = (id: WindowId, btnEl: HTMLButtonElement) => {
    const isCoarsePointer =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches;

    if (isCompactLayout || isCoarsePointer) {
      openWindow(id, btnEl);
      return;
    }
    soundFx.playHover();
    setSelectedIcon(id);
  };

  const handleSendFeedback = async () => {
    const trimmed = feedbackMsg.trim();
    if (!trimmed) {
      soundFx.playBack();
      showToast(t.node.emptyToast);
      return;
    }

    soundFx.playSelect();
    if (!ABOUT_FEEDBACK_ENDPOINT) {
      setFeedbackMsg('');
      showToast(t.node.demoToast);
      return;
    }

    try {
      setIsSendingFeedback(true);
      const res = await fetch(ABOUT_FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ message: trimmed, source: 'TSDT About Node' }),
      });
      if (!res.ok) throw new Error('Request failed');
      setFeedbackMsg('');
      showToast(t.node.sentToast);
    } catch {
      showToast(t.node.errToast);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const activeDossier: CreditTuple = CREDITS[activeDossierIndex] ?? CREDITS[0];
  const activeDossierRole =
    lang === 'EN' ? activeDossier[7] || activeDossier[3] : activeDossier[3];
  const activeDossierDesc =
    lang === 'EN' ? activeDossier[8] || activeDossier[4] : activeDossier[4];
  const activeDossierLinks = activeDossier[9]?.length
    ? activeDossier[9]
    : [{ label: t.dos.openLink, href: activeDossier[6] || '#' }];

  const getWindowStyle = (id: WindowId, defaultWidth: number): React.CSSProperties => {
    const st = windows[id];
    if (isCompactLayout) {
      return { zIndex: st.zIndex };
    }
    return {
      width: `${defaultWidth}px`,
      left: st.x !== null ? `${st.x}px` : undefined,
      top: st.y !== null ? `${st.y}px` : undefined,
      zIndex: st.zIndex,
    };
  };

  const getWindowClassName = (id: WindowId) => {
    const st = windows[id];
    return [
      'about-win',
      !st.open ? 'off' : '',
      activeWinId === id ? 'act' : '',
      st.collapsed ? 'col' : '',
      st.maximized ? 'max' : '',
      st.full ? 'full' : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  const displayedHostIntro = hostTypedDone
    ? t.host.intro
    : t.host.intro.slice(0, hostTypedCount);

  return (
    <div
      id="page-about"
      className={`about-page-root relative z-20 flex h-full w-full flex-col overflow-hidden bg-[var(--void)] text-[var(--text-1)] ${
        hasAnyWindowOpen ? 'has-win' : ''
      }`}
    >
      {showBoot && (
        <div id="about-boot" role="status" aria-live="polite">
          <div>
            {t.bootLines.slice(0, bootLinesVisible).map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
      )}

      <SiteHeader
        breadcrumbs={[
          {
            label: t.crumbRoot,
            onClick: onBackHome,
          },
          {
            label: t.crumbPage,
          },
        ]}
        langLabel={onToggleLang ? lang : undefined}
        langTitle={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        langAriaLabel={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        onToggleLang={onToggleLang}
      />

      <main
        id="about-desk"
        ref={deskRef}
        onPointerDown={(e) => {
          if (!(e.target as HTMLElement).closest('.about-ic')) {
            setSelectedIcon(null);
          }
        }}
      >
        <div className="about-wall" ref={wallRef} aria-hidden="true">
          <img
            ref={wallImgRef}
            src={WALLPAPER_SRC}
            alt=""
            width={1500}
            height={844}
            decoding="async"
          />
        </div>

        <div className="about-cyber-fx" aria-hidden="true">
          <div className="about-cyber-scanlines" />
          <div className="about-cyber-beam" />
          <div className="about-cyber-vignette" />
          <div className="about-cyber-hud-corners">
            <span className="about-cyber-corner tl" />
            <span className="about-cyber-corner tr" />
            <span className="about-cyber-corner bl" />
            <span className="about-cyber-corner br" />
          </div>
        </div>

        <nav id="about-icons" aria-label={t.desktopNavAria}>
          <button
            type="button"
            data-w="w-host"
            ref={(el) => {
              iconBtnRefs.current['w-host'] = el;
            }}
            className={`about-ic ${selectedIcon === 'w-host' ? 'sel' : ''}`}
            title={t.dblClickHint}
            onClick={(e) => handleIconClick('w-host', e.currentTarget)}
            onDoubleClick={(e) => openWindow('w-host', e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                openWindow('w-host', e.currentTarget);
              }
            }}
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M8 6h32v36H8z" />
              <circle cx="24" cy="19" r="6" />
              <path d="M12 38c2-8 7-10 12-10s10 2 12 10" />
            </svg>
            <span>{t.icons.host}</span>
          </button>

          <button
            type="button"
            data-w="w-cred"
            ref={(el) => {
              iconBtnRefs.current['w-cred'] = el;
            }}
            className={`about-ic ${selectedIcon === 'w-cred' ? 'sel' : ''}`}
            title={t.dblClickHint}
            onClick={(e) => handleIconClick('w-cred', e.currentTarget)}
            onDoubleClick={(e) => openWindow('w-cred', e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                openWindow('w-cred', e.currentTarget);
              }
            }}
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M6 12h14l4 5h18v23H6z" />
              <path d="M6 20h36" />
            </svg>
            <span>{t.icons.cred}</span>
          </button>

          <button
            type="button"
            data-w="w-disc"
            ref={(el) => {
              iconBtnRefs.current['w-disc'] = el;
            }}
            className={`about-ic ${selectedIcon === 'w-disc' ? 'sel' : ''}`}
            title={t.dblClickHint}
            onClick={(e) => handleIconClick('w-disc', e.currentTarget)}
            onDoubleClick={(e) => openWindow('w-disc', e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                openWindow('w-disc', e.currentTarget);
              }
            }}
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M10 5h20l8 8v30H10z" />
              <path d="M30 5v8h8" />
              <path d="M16 24h16M16 30h16M16 36h10" />
            </svg>
            <span>{t.icons.disc}</span>
          </button>

          <button
            type="button"
            data-w="w-node"
            ref={(el) => {
              iconBtnRefs.current['w-node'] = el;
            }}
            className={`about-ic ${selectedIcon === 'w-node' ? 'sel' : ''}`}
            title={t.dblClickHint}
            onClick={(e) => handleIconClick('w-node', e.currentTarget)}
            onDoubleClick={(e) => openWindow('w-node', e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                openWindow('w-node', e.currentTarget);
              }
            }}
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="4" />
              <circle cx="10" cy="12" r="3" />
              <circle cx="38" cy="12" r="3" />
              <circle cx="12" cy="38" r="3" />
              <circle cx="37" cy="37" r="3" />
              <path d="M13 14l8 7M35 14l-8 7M14 35l7-8M34 34l-7-7" />
            </svg>
            <span>{t.icons.node}</span>
          </button>
        </nav>

        <section
          ref={(el) => {
            winRefs.current['w-host'] = el;
          }}
          className={getWindowClassName('w-host')}
          id="w-host"
          role="dialog"
          aria-label={t.host.aria}
          style={getWindowStyle('w-host', 420)}
          onPointerDown={() => bringToFront('w-host')}
        >
          <div
            className="about-tb"
            onPointerDown={(e) => handleTitleBarPointerDown(e, 'w-host')}
            onPointerMove={(e) => handleTitleBarPointerMove(e, 'w-host')}
            onPointerUp={handleTitleBarPointerUp}
            onPointerCancel={handleTitleBarPointerUp}
          >
            <span className="about-tt">ABOUT.exe</span>
            <button
              type="button"
              className="about-tb-mn"
              disabled
              tabIndex={-1}
              aria-hidden="true"
            >
              _
            </button>
            <button
              type="button"
              className="about-tb-mx"
              disabled
              tabIndex={-1}
              aria-hidden="true"
            >
              □
            </button>
            <button
              type="button"
              className="about-tb-cl"
              aria-label={t.winCtrl.close}
              onClick={(e) => {
                e.stopPropagation();
                closeWindow('w-host');
              }}
            >
              ✕
            </button>
          </div>
          <div className="about-bd">
            <div className="about-host">
              <div
                className="about-av"
                style={{ background: HOST_AVATAR_BG }}
              />
              <div>
                <h2>{t.host.title}</h2>
                <p className={`whitespace-pre-line ${!hostTypedDone ? 'about-cur' : ''}`}>
                  {displayedHostIntro}
                </p>
              </div>
            </div>
          </div>
          <div className="about-sbar">
            <span>{t.host.status}</span>
            <span>SH-000</span>
          </div>
        </section>

        <section
          ref={(el) => {
            winRefs.current['w-cred'] = el;
          }}
          className={getWindowClassName('w-cred')}
          id="w-cred"
          role="dialog"
          aria-label={t.cred.aria}
          style={getWindowStyle('w-cred', 500)}
          onPointerDown={() => bringToFront('w-cred')}
        >
          <div
            className="about-tb"
            onPointerDown={(e) => handleTitleBarPointerDown(e, 'w-cred')}
            onPointerMove={(e) => handleTitleBarPointerMove(e, 'w-cred')}
            onPointerUp={handleTitleBarPointerUp}
            onPointerCancel={handleTitleBarPointerUp}
          >
            <span className="about-tt">CREDITS.explorer</span>
            <button
              type="button"
              className="about-tb-mn"
              disabled
              tabIndex={-1}
              aria-hidden="true"
            >
              _
            </button>
            <button
              type="button"
              className="about-tb-mx"
              disabled
              tabIndex={-1}
              aria-hidden="true"
            >
              □
            </button>
            <button
              type="button"
              className="about-tb-cl"
              aria-label={t.winCtrl.close}
              onClick={(e) => {
                e.stopPropagation();
                closeWindow('w-cred');
              }}
            >
              ✕
            </button>
          </div>
          <div className="about-bd">
            <p className="about-thx">{t.cred.thanks}</p>
            <div className="about-list">
              {CREDITS.map((item, idx) => {
                const roleLabel =
                  lang === 'EN' ? item[7] || item[3] : item[3];
                return (
                  <div
                    key={`${item[0]}-${idx}`}
                    ref={(el) => {
                      creditItemRefs.current[idx] = el;
                    }}
                    role="button"
                    tabIndex={0}
                    className="about-it"
                    onClick={(e) => handleOpenDossier(idx, e.currentTarget)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenDossier(idx, e.currentTarget);
                      }
                    }}
                  >
                    <div
                      className="about-av"
                      style={{ background: getCreditAvatarBg(item, idx) }}
                    />
                    {item[1]}
                    <small>{roleLabel}</small>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="about-sbar">
            <span>
              {CREDITS.length} {t.cred.countSuffix}
            </span>
            <span>{t.cred.statusHint}</span>
          </div>
        </section>

        <section
          ref={(el) => {
            winRefs.current['w-disc'] = el;
          }}
          className={getWindowClassName('w-disc')}
          id="w-disc"
          role="dialog"
          aria-label={t.disc.aria}
          style={getWindowStyle('w-disc', 460)}
          onPointerDown={() => bringToFront('w-disc')}
        >
          <div
            className="about-tb"
            onPointerDown={(e) => handleTitleBarPointerDown(e, 'w-disc')}
            onPointerMove={(e) => handleTitleBarPointerMove(e, 'w-disc')}
            onPointerUp={handleTitleBarPointerUp}
            onPointerCancel={handleTitleBarPointerUp}
          >
            <span className="about-tt">DISCLAIMER.txt</span>
            <button
              type="button"
              className="about-tb-mn"
              disabled
              tabIndex={-1}
              aria-hidden="true"
            >
              _
            </button>
            <button
              type="button"
              className="about-tb-mx"
              disabled
              tabIndex={-1}
              aria-hidden="true"
            >
              □
            </button>
            <button
              type="button"
              className="about-tb-cl"
              aria-label={t.winCtrl.close}
              onClick={(e) => {
                e.stopPropagation();
                closeWindow('w-disc');
              }}
            >
              ✕
            </button>
          </div>
          <div className="about-bd">
            <h2>{t.disc.title}</h2>
            <p>{t.disc.p1}</p>
            <p>{t.disc.p2}</p>
          </div>
          <div className="about-sbar">
            <span>{t.disc.status}</span>
            <span>SH-D01</span>
          </div>
        </section>

        <section
          ref={(el) => {
            winRefs.current['w-node'] = el;
          }}
          className={getWindowClassName('w-node')}
          id="w-node"
          role="dialog"
          aria-label={t.node.aria}
          style={getWindowStyle('w-node', 420)}
          onPointerDown={() => bringToFront('w-node')}
        >
          <div
            className="about-tb"
            onPointerDown={(e) => handleTitleBarPointerDown(e, 'w-node')}
            onPointerMove={(e) => handleTitleBarPointerMove(e, 'w-node')}
            onPointerUp={handleTitleBarPointerUp}
            onPointerCancel={handleTitleBarPointerUp}
          >
            <span className="about-tt">NODE.net</span>
            <button
              type="button"
              className="about-tb-mn"
              disabled
              tabIndex={-1}
              aria-hidden="true"
            >
              _
            </button>
            <button
              type="button"
              className="about-tb-mx"
              disabled
              tabIndex={-1}
              aria-hidden="true"
            >
              □
            </button>
            <button
              type="button"
              className="about-tb-cl"
              aria-label={t.winCtrl.close}
              onClick={(e) => {
                e.stopPropagation();
                closeWindow('w-node');
              }}
            >
              ✕
            </button>
          </div>
          <div className="about-bd">
            <h2>{t.node.title}</h2>
            {ABOUT_SOCIAL_LINKS.map((link) => {
              const isPlaceholder = !link.href || link.href === '#';
              return (
                <a
                  key={link.id}
                  className="about-lk"
                  href={link.href || '#'}
                  target={isPlaceholder ? undefined : '_blank'}
                  rel={isPlaceholder ? undefined : 'noopener noreferrer'}
                  onClick={(e) => {
                    if (isPlaceholder) {
                      e.preventDefault();
                      soundFx.playSelect();
                      showToast(t.node.linkPendingToast);
                    }
                  }}
                >
                  <span>{link.label}</span>
                  <span>↗</span>
                </a>
              );
            })}
            <div className="about-mono about-feedback-label">
              {t.node.feedbackLabel}
            </div>
            <textarea
              className="about-fi"
              rows={4}
              value={feedbackMsg}
              onChange={(e) => setFeedbackMsg(e.target.value)}
              placeholder={t.node.placeholder}
            />
            <button
              type="button"
              className="about-lnk about-fb"
              disabled={isSendingFeedback}
              onClick={handleSendFeedback}
            >
              {isSendingFeedback ? t.node.sendingBtn : t.node.sendBtn}
            </button>
          </div>
          <div className="about-sbar">
            <span>{t.node.status}</span>
            <span>SH-N01</span>
          </div>
        </section>

        <section
          ref={(el) => {
            winRefs.current['w-dos'] = el;
          }}
          className={getWindowClassName('w-dos')}
          id="w-dos"
          role="dialog"
          aria-label={t.dos.aria}
          style={getWindowStyle('w-dos', 340)}
          onPointerDown={() => bringToFront('w-dos')}
        >
          <div
            className="about-tb"
            onPointerDown={(e) => handleTitleBarPointerDown(e, 'w-dos')}
            onPointerMove={(e) => handleTitleBarPointerMove(e, 'w-dos')}
            onPointerUp={handleTitleBarPointerUp}
            onPointerCancel={handleTitleBarPointerUp}
          >
            <span className="about-tt">{activeDossier[0]}</span>
            <button
              type="button"
              className="about-tb-cl"
              aria-label={t.winCtrl.close}
              onClick={(e) => {
                e.stopPropagation();
                closeWindow('w-dos');
              }}
            >
              ✕
            </button>
          </div>
          <div className="about-bd">
            <div
              className="about-av about-dos-av"
              style={{ background: getCreditAvatarBg(activeDossier, activeDossierIndex) }}
            />
            <h2 className="about-dos-name">{activeDossier[1]}</h2>
            <div className="about-mono about-dos-role">{activeDossierRole}</div>
            <p>{activeDossierDesc}</p>
            <div className="flex flex-wrap gap-2.5">
              {activeDossierLinks.map((lnk) => {
                const href = lnk.href || '#';
                const isPlaceholder = href === '#';
                return (
                  <a
                    key={lnk.label}
                    className="about-lnk"
                    href={href}
                    target={isPlaceholder ? undefined : '_blank'}
                    rel={isPlaceholder ? undefined : 'noopener noreferrer'}
                    onClick={(e) => {
                      if (isPlaceholder) {
                        e.preventDefault();
                        soundFx.playSelect();
                        showToast(t.node.linkPendingToast);
                      }
                    }}
                  >
                    {lnk.label}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {toastText && (
        <div id="about-toast" role="status" aria-live="polite">
          {toastText}
        </div>
      )}
    </div>
  );
};
