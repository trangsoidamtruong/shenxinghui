/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { MeteorShowerCanvas } from './components/MeteorShowerCanvas';
import type { MenuActionId } from './components/GameModals';
import { soundFx } from './utils/soundFx';

const loadGameModals = () => import('./components/GameModals');
const loadDatingPage = () => import('./components/DatingPage');
const loadEventsPage = () => import('./components/EventsPage');
const loadGalleryPage = () => import('./components/GalleryPage');

const GameModals = lazy(() =>
  loadGameModals().then((m) => ({ default: m.GameModals }))
);
const DatingPage = lazy(() =>
  loadDatingPage().then((m) => ({ default: m.DatingPage }))
);
const EventsPage = lazy(() =>
  loadEventsPage().then((m) => ({ default: m.EventsPage }))
);
const GalleryPage = lazy(() =>
  loadGalleryPage().then((m) => ({ default: m.GalleryPage }))
);

const prefetchedAssets = new Set<string>();
function prefetchAssets(urls: string[]) {
  urls.forEach((url) => {
    if (prefetchedAssets.has(url)) return;
    prefetchedAssets.add(url);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    img.decode?.().catch(() => {});
  });
}

const POSTER_SRC = '/assets/aistudio/home_poster.webp';
const VIDEO_MP4_SRC = '/assets/aistudio/TR_NG_SOI_D_M_TR__NG_688d109f.mp4';

interface MenuItem {
  id: Exclude<MenuActionId, null>;
  code: string;
  labelVI: string;
  labelEN: string;
  disabled?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'home', code: '01', labelVI: 'HỒ SƠ', labelEN: 'PROFILE', disabled: true },
  { id: 'combat', code: '02', labelVI: 'CHIẾN ĐẤU', labelEN: 'BATTLE', disabled: true },
  { id: 'story', code: '03', labelVI: 'CỐT TRUYỆN', labelEN: 'STORYLINE', disabled: true },
  { id: 'dating', code: '04', labelVI: 'HẸN HÒ', labelEN: 'DATING', disabled: false },
  { id: 'gallery', code: '05', labelVI: 'TRIỂN LÃM', labelEN: 'GALLERY', disabled: false },
];

const SUB_MENU_ITEMS: MenuItem[] = [
  { id: 'events', code: '06', labelVI: 'SỰ KIỆN', labelEN: 'EVENTS', disabled: false },
  { id: 'contact', code: '07', labelVI: 'LIÊN LẠC', labelEN: 'CONTACT', disabled: true },
  { id: 'interact', code: '08', labelVI: 'TƯƠNG TÁC', labelEN: 'INTERACTIONS', disabled: true },
  { id: 'about', code: '09', labelVI: 'GIỚI THIỆU', labelEN: 'ABOUT', disabled: true },
];

const BOOT_LINES_VI = [
  '> kết nối trạm tiếp sóng... ok',
  '> dò tín hiệu... ok',
  '> tín hiệu: thẩm tinh hồi',
];

const BOOT_LINES_EN = [
  '> connecting relay station... ok',
  '> scanning signal... ok',
  '> signal: xavier',
];

function getMoonPhaseChar(pct: number): string {
  if (pct >= 100) return '●';
  if (pct >= 75) return '◕';
  if (pct >= 50) return '◑';
  if (pct >= 25) return '◔';
  return '○';
}

export default function App() {
  // Detect prefers-reduced-motion once on initial mount
  const [reducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [lang, setLang] = useState<'VI' | 'EN'>('VI');
  const bootLangRef = useRef<'VI' | 'EN'>(lang);

  const isInitialMemoriaPath =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/memoria');

  const [currentPage, setCurrentPage] = useState<'home' | 'dating' | 'events' | 'gallery'>(
    isInitialMemoriaPath ? 'dating' : 'home'
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [subMenuOpen, setSubMenuOpen] = useState<boolean>(false);
  const [hoveredSubIndex, setHoveredSubIndex] = useState<number | null>(null);
  const [clickedSubIndex, setClickedSubIndex] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<MenuActionId>(null);
  const [wallpaperMode, setWallpaperMode] = useState<boolean>(false);

  const [isPhoneDevice, setIsPhoneDevice] = useState<boolean>(false);
  const [isWindowPortrait, setIsWindowPortrait] = useState<boolean>(false);

  // Boot & Landing Sequence States
  const [typedLines, setTypedLines] = useState<string[]>(['', '', '']);
  const [activeTypingLine, setActiveTypingLine] = useState<number>(-1);
  const [showProgressRow, setShowProgressRow] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);

  // Landing sub-stages:
  // 'booting' -> initial black screen + typing + progress bar
  // 'scan' -> 5a: scanline drops down (t = 0ms of landing)
  // 'fade' -> 5b: black overlay fades (1s), boot text fades (0.6s), video unblurs & fades in (1.4s) (t = 250ms of landing)
  // 'ui'   -> 5c: UI elements (logo, menu, HUD, top controls) become interactive and animate in (t = 1200ms of landing)
  // 'done' -> step 6: boot overlay removed from DOM (t = 2200ms of landing)
  const [landingStage, setLandingStage] = useState<'booting' | 'scan' | 'fade' | 'ui' | 'done'>(
    reducedMotion || isInitialMemoriaPath ? 'done' : 'booting'
  );
  const [videoFailed, setVideoFailed] = useState<boolean>(false);

  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaReadyRef = useRef<boolean>(reducedMotion);

  const ensureVideoPlaying = useCallback(() => {
    const vid = bgVideoRef.current;
    if (!vid || videoFailed) return;
    vid.defaultMuted = true;
    vid.muted = true;
    vid.loop = true;
    if (vid.paused) {
      vid.play().catch(() => {});
    }
  }, [videoFailed]);

  const markMediaReady = useCallback(() => {
    mediaReadyRef.current = true;
    ensureVideoPlaying();
  }, [ensureVideoPlaying]);

  // Check if video is already ready on mount + 6.5s failsafe timer
  useEffect(() => {
    if (reducedMotion) {
      mediaReadyRef.current = true;
      return;
    }

    // 6.5 second failsafe: never keep user stuck on black boot screen
    const failsafeTimer = window.setTimeout(() => {
      mediaReadyRef.current = true;
    }, 6500);

    const vid = bgVideoRef.current;
    if (vid && vid.readyState >= 2) {
      mediaReadyRef.current = true;
      if (vid.paused) {
        vid.play().catch(() => {});
      }
    }

    return () => {
      window.clearTimeout(failsafeTimer);
    };
  }, [reducedMotion]);

  // Step 1 & Step 2: Wait 500ms, then type the 3 boot lines (22ms per char, 180ms pause between lines)
  useEffect(() => {
    if (reducedMotion) return;

    const lines = bootLangRef.current === 'VI' ? BOOT_LINES_VI : BOOT_LINES_EN;
    let cancelled = false;
    const timeouts: number[] = [];

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timeouts.push(id);
    };

    const typeLine = (lineIdx: number, charIdx: number) => {
      if (cancelled) return;
      if (lineIdx >= lines.length) {
        // Finished typing all 3 lines -> show progress bar row (Step 3)
        setActiveTypingLine(-1);
        setShowProgressRow(true);
        return;
      }

      setActiveTypingLine(lineIdx);
      const targetStr = lines[lineIdx];

      if (charIdx <= targetStr.length) {
        setTypedLines((prev) => {
          const next = [...prev];
          next[lineIdx] = targetStr.slice(0, charIdx);
          return next;
        });

        if (charIdx < targetStr.length) {
          schedule(() => typeLine(lineIdx, charIdx + 1), 22);
        } else {
          // Completed current line; pause 180ms before next line (or finish after line 3)
          if (lineIdx < lines.length - 1) {
            schedule(() => typeLine(lineIdx + 1, 1), 180);
          } else {
            schedule(() => {
              setActiveTypingLine(-1);
              setShowProgressRow(true);
            }, 180);
          }
        }
      }
    };

    // Step 2 starts after 500ms on pure black screen
    schedule(() => typeLine(0, 1), 500);

    return () => {
      cancelled = true;
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [reducedMotion]);

  // Step 3, 4 & 5: Progress bar updates every 70ms after typing completes, tracking real video state
  useEffect(() => {
    if (reducedMotion || !showProgressRow) return;

    let cancelled = false;
    let floatPct = 0;
    let holdTimeoutId: number | null = null;
    const landingTimeouts: number[] = [];

    const startLandingSequence = () => {
      if (cancelled) return;
      // 5a: Scanline runs top to bottom in 1s (starts immediately at landing t = 0)
      setLandingStage('scan');

      // 5b: After 250ms, black overlay fades (1s), boot text fades (0.6s), video unblurs & fades in (1.4s)
      const t5b = window.setTimeout(() => {
        if (!cancelled) setLandingStage('fade');
      }, 250);

      // 5c: After 1200ms (1.2s from start of landing), reveal Logo, Menu, HUD, and Top Controls
      const t5c = window.setTimeout(() => {
        if (!cancelled) setLandingStage('ui');
      }, 1200);

      // Step 6: After all boot fade animations finish (2200ms), unmount boot overlay completely
      const tDone = window.setTimeout(() => {
        if (!cancelled) setLandingStage('done');
      }, 2200);

      landingTimeouts.push(t5b, t5c, tDone);
    };

    const intervalId = window.setInterval(() => {
      if (cancelled) return;

      if (!mediaReadyRef.current) {
        // Video not ready yet: advance 8% of remaining distance toward 88% and wait there
        floatPct += (88 - floatPct) * 0.08;
        const clamped = Math.min(88, Math.floor(floatPct));
        setProgressPct(clamped);
      } else {
        // Video is ready: advance 22% of remaining distance toward 100%
        floatPct += (100 - floatPct) * 0.22;
        if (floatPct >= 99.2) {
          floatPct = 100;
          setProgressPct(100);
          window.clearInterval(intervalId);
          // Step 5: Hold 100% for ~450ms, then begin landing
          holdTimeoutId = window.setTimeout(startLandingSequence, 450);
        } else {
          setProgressPct(Math.round(floatPct));
        }
      }
    }, 70);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      if (holdTimeoutId !== null) window.clearTimeout(holdTimeoutId);
      landingTimeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [reducedMotion, showProgressRow]);

  // Ensure background video plays on loop when landing starts/finishes and pause when covered by opaque pages or tab is hidden
  useEffect(() => {
    const vid = bgVideoRef.current;
    if (!vid || videoFailed) return;
    const isSubPage =
      currentPage === 'dating' || currentPage === 'events' || currentPage === 'gallery';

    if (isSubPage || document.hidden) {
      vid.pause();
      return;
    }

    ensureVideoPlaying();
    // Also trigger play slightly after opacity transitions above 0 in case browser deferred playback while opacity was 0
    const retryTimer = window.setTimeout(() => {
      if (!document.hidden) ensureVideoPlaying();
    }, 120);

    const handleVisibilityChange = () => {
      const v = bgVideoRef.current;
      if (!v) return;
      if (document.hidden || isSubPage) {
        v.pause();
      } else {
        ensureVideoPlaying();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentPage, landingStage, videoFailed, ensureVideoPlaying]);

  useEffect(() => {
    const updateDeviceLock = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const minSide = Math.min(w, h);
      const phone = minSide < 600;
      setIsPhoneDevice(phone);
      setIsWindowPortrait(h > w);

      const orientationApi = (window.screen as unknown as {
        orientation?: { lock?: (mode: string) => Promise<void> };
      })?.orientation;
      if (orientationApi?.lock) {
        orientationApi.lock(phone ? 'portrait' : 'landscape').catch(() => {});
      }
    };

    updateDeviceLock();
    window.addEventListener('resize', updateDeviceLock);
    window.addEventListener('orientationchange', updateDeviceLock);
    return () => {
      window.removeEventListener('resize', updateDeviceLock);
      window.removeEventListener('orientationchange', updateDeviceLock);
    };
  }, []);

  // Unlock background video playback on first user interaction if browser deferred initial autoplay
  useEffect(() => {
    const unlockEvents = ['click', 'touchend', 'keydown', 'pointerdown'];
    const handleUnlock = () => {
      ensureVideoPlaying();
    };

    unlockEvents.forEach((ev) =>
      window.addEventListener(ev, handleUnlock, { passive: true })
    );

    return () => {
      unlockEvents.forEach((ev) =>
        window.removeEventListener(ev, handleUnlock)
      );
    };
  }, [ensureVideoPlaying]);

  const navigateToPage = useCallback(
    (nextPage: 'home' | 'dating' | 'events' | 'gallery') => {
      setCurrentPage(nextPage);
      if (typeof window !== 'undefined' && window.history) {
        try {
          if (nextPage === 'home') {
            window.history.pushState({ page: 'home' }, '');
          } else {
            window.history.pushState({ page: nextPage }, '');
          }
        } catch {
          // Ignore history errors in restricted sandboxes
        }
      }
    },
    []
  );

  // Sync browser Back/Forward buttons & mobile edge-swipe with currentPage / activeModal
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!window.location.pathname.startsWith('/memoria')) {
        window.history.replaceState({ page: 'home' }, '');
      } else {
        window.history.replaceState({ page: 'dating', memoria: true }, '');
      }
    } catch {
      // Ignore
    }

    const handlePopState = (e: PopStateEvent) => {
      const statePage = e.state?.page as
        | 'home'
        | 'dating'
        | 'events'
        | 'gallery'
        | undefined;
      soundFx.playBack();
      setActiveModal(null);
      setSubMenuOpen(false);
      if (
        statePage === 'dating' ||
        statePage === 'events' ||
        statePage === 'gallery'
      ) {
        setCurrentPage(statePage);
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Preload & GPU-decode Events ship/cloud textures and sub-page chunks during browser idle time after boot
  useEffect(() => {
    if (landingStage !== 'done') return;

    const runIdleWarmup = () => {
      loadEventsPage();
      loadDatingPage();
      loadGalleryPage().then((m) => m.fetchArtDataLazy?.());
      prefetchAssets([
        '/assets/aistudio/tracebackii_6e3cf5cf.webp',
        '/assets/aistudio/cloud3_ca9fa321.webp',
      ]);
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(runIdleWarmup, { timeout: 1500 });
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timerId = window.setTimeout(runIdleWarmup, 650);
    return () => window.clearTimeout(timerId);
  }, [landingStage]);

  const handleTriggerMenu = useCallback(
    (index: number) => {
      const item = MENU_ITEMS[index];
      if (!item || item.disabled) return;
      setClickedIndex(index);
      setClickedSubIndex(null);
      soundFx.playSelect();

      if (item.id === 'dating') {
        setActiveModal(null);
        navigateToPage('dating');
        return;
      }

      if (item.id === 'gallery') {
        setActiveModal(null);
        navigateToPage('gallery');
        return;
      }

      setActiveModal(item.id);
    },
    [navigateToPage]
  );

  const handleTriggerSubMenu = useCallback(
    (item: MenuItem, index: number) => {
      if (item.disabled) return;
      setClickedSubIndex(index);
      setClickedIndex(null);
      soundFx.playSelect();

      if (item.id === 'events') {
        setActiveModal(null);
        setSubMenuOpen(false);
        navigateToPage('events');
        return;
      }

      setActiveModal(item.id);
    },
    [navigateToPage]
  );

  // PC Game keyboard navigation (only active once UI has landed at step 5c)
  const isUiRevealed = landingStage === 'ui' || landingStage === 'done';

  useEffect(() => {
    if (!isUiRevealed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (wallpaperMode) {
        if (e.key === 'Escape') {
          soundFx.playSelect();
          setWallpaperMode(false);
        }
        return;
      }

      if (currentPage === 'dating' || currentPage === 'events') {
        if (e.key === 'Escape') {
          soundFx.playBack();
          navigateToPage('home');
        }
        return;
      }

      if (currentPage === 'gallery') {
        return;
      }

      if (activeModal) {
        if (e.key === 'Escape') {
          soundFx.playBack();
          setActiveModal(null);
        }
        return;
      }

      if (e.key === 'Escape' && subMenuOpen) {
        soundFx.playBack();
        setSubMenuOpen(false);
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        if (hoveredIndex !== null && !MENU_ITEMS[hoveredIndex]?.disabled) {
          e.preventDefault();
          handleTriggerMenu(hoveredIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isUiRevealed,
    activeModal,
    currentPage,
    hoveredIndex,
    handleTriggerMenu,
    navigateToPage,
    subMenuOpen,
    wallpaperMode,
  ]);

  const enforcePhonePortraitBox = isPhoneDevice && !isWindowPortrait;
  const enforceTabletLandscapeBox = !isPhoneDevice && isWindowPortrait;

  const frameClassName = `${
    enforcePhonePortraitBox
      ? 'relative h-[100dvh] aspect-[9/16] max-w-[100vw] overflow-hidden bg-[var(--void)] border-x border-[var(--line)] shadow-[0_0_50px_rgba(0,0,0,0.95)]'
      : enforceTabletLandscapeBox
      ? 'relative w-[100vw] aspect-[16/10] max-h-[100dvh] overflow-hidden bg-[var(--void)] border-y border-[var(--line)] shadow-[0_0_50px_rgba(0,0,0,0.95)]'
      : 'relative h-[100dvh] w-screen overflow-hidden bg-[var(--void)]'
  } ${isPhoneDevice ? 'is-phone-frame' : ''}`;

  // Video unblur & fade-in begins at step 5b ('fade', 'ui', 'done')
  const isVideoUnblurring =
    landingStage === 'fade' || landingStage === 'ui' || landingStage === 'done';

  // Progress bar formatting: [moon phase] [20-cell █░ bar] [percentage]
  const filledCells = Math.round((progressPct / 100) * 20);
  const progressBarString = `${'█'.repeat(filledCells)}${'░'.repeat(20 - filledCells)}`;
  const moonChar = getMoonPhaseChar(progressPct);

  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[var(--void)] select-none">
      {/* Shared Duotone Purple Filter (Hue ~270° highlights, dark purple-black shadows) */}
      <svg
        width="0"
        height="0"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <defs>
          <filter id="purple-duotone-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.04 0.85" />
              <feFuncG type="table" tableValues="0.02 0.70" />
              <feFuncB type="table" tableValues="0.07 1" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <div className={frameClassName}>
        {/* =================================================================
            LAYER 1, 2 & 3: FALLBACK POSTER + LOOPING BACKGROUND VIDEO + .grade 5-LAYER COLOR GRADING
            Starts loading immediately on page open.
            During boot, stays at opacity 0 + blur(14px) brightness(1.4).
            At Step 5b (250ms into landing), transitions to filter: none & opacity 1 over 1.4s.
            ================================================================= */}
        <div
          className={`bg-video-stage z-0 ${
            currentPage === 'dating' || currentPage === 'events' || currentPage === 'gallery' ? 'hidden' : ''
          }`}
          style={{
            opacity: isVideoUnblurring ? 1 : 0,
            filter: isVideoUnblurring ? 'none' : 'blur(14px) brightness(1.4)',
            transition: reducedMotion
              ? 'none'
              : 'opacity 1.4s cubic-bezier(0.2, 0.8, 0.2, 1), filter 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
            willChange: isVideoUnblurring ? 'auto' : 'opacity, filter',
          }}
        >
          {/* Poster / Fallback Background Layer (underneath video) */}
          <div
            className="bg-video-poster"
            style={{ backgroundImage: `url(${POSTER_SRC})` }}
            aria-hidden="true"
          />

          {/* Video Element playing on infinite loop (no CSS filter on video itself) */}
          {!videoFailed && (
            <video
              ref={bgVideoRef}
              src={VIDEO_MP4_SRC}
              poster={POSTER_SRC}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={markMediaReady}
              onCanPlay={markMediaReady}
              onEnded={(e) => {
                e.currentTarget.currentTime = 0;
                e.currentTarget.play().catch(() => {});
              }}
              onError={() => {
                setVideoFailed(true);
                markMediaReady();
              }}
              className="bg-video-element"
            />
          )}

          {/* =================================================================
              LAYER 3: .grade 5-LAYER COLOR GRADING OVERLAY
              1) Phủ tím nhẹ (tint)
              2) Vignette (tối dần ra bốn góc, tâm 65% 45%)
              3) Dải tối bên trái (cho chữ menu; điện thoại đổi thành dải dọc)
              4) Dải tối bên phải (cho menu phụ; điện thoại ẩn)
              5) Scanline (chu kỳ 3px)
              ================================================================= */}
          <div className="grade" aria-hidden="true">
            <div className="grade-tint" />
            <div className="grade-vignette" />
            <div className="grade-left" />
            <div className="grade-right" />
            <div className="grade-scanline" />
          </div>
        </div>

        {/* Right-to-Left Meteor Shower Canvas Overlay */}
        <MeteorShowerCanvas paused={currentPage !== 'home' || !isUiRevealed} />

        {/* =================================================================
            LAYER 4: HUD / LOGO / MENU / TOP-RIGHT CONTROLS
            Completely hidden (visibility: hidden, pointer-events: none, inert)
            until Step 5c (1.2s after landing starts).
            ================================================================= */}
        <div
          inert={!isUiRevealed ? true : undefined}
          className={`relative z-20 h-full w-full ${
            isUiRevealed
              ? 'visible pointer-events-auto'
              : 'invisible pointer-events-none select-none'
          }`}
        >
          {/* Top-Right Controls: Sharp Rectangular HUD Box with ONLY EN/VI and Eye Button
              Rendered here only on the home screen; sub-pages render their own header inside .wrap */}
          {currentPage === 'home' && (
            <div
              className="absolute top-4 right-4 sm:top-6 sm:right-8 lg:top-9 lg:right-12 z-50 flex items-stretch border border-[var(--line)] bg-[var(--deep)]/80 backdrop-blur-[4px]"
              style={{
                opacity: isUiRevealed ? 1 : 0,
                transition: reducedMotion
                  ? 'none'
                  : 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s',
              }}
            >
              {!wallpaperMode && (
                <button
                  type="button"
                  tabIndex={isUiRevealed ? 0 : -1}
                  onMouseEnter={() => soundFx.playHover()}
                  onClick={() => {
                    soundFx.playSelect();
                    setLang((prev) => (prev === 'VI' ? 'EN' : 'VI'));
                  }}
                  title={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                  aria-label={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                  className="hud-mono-text flex h-7 sm:h-8 items-center justify-center px-2.5 sm:px-3 cursor-pointer rounded-none text-[var(--text-2)] transition-colors duration-200 hover:bg-[var(--violet-d)]/35 hover:text-[var(--text-1)] focus:outline-none border-r border-[var(--line)]"
                >
                  {lang}
                </button>
              )}

              <button
                type="button"
                tabIndex={isUiRevealed ? 0 : -1}
                onMouseEnter={() => soundFx.playHover()}
                onClick={() => {
                  soundFx.playSelect();
                  setActiveModal(null);
                  setWallpaperMode((prev) => !prev);
                }}
                title={
                  wallpaperMode
                    ? lang === 'VI'
                      ? 'Hiện giao diện'
                      : 'Show UI'
                    : lang === 'VI'
                      ? 'Ẩn UI ngắm cảnh'
                      : 'Hide UI'
                }
                aria-label={wallpaperMode ? 'Show UI' : 'Hide UI'}
                className="flex h-7 w-8 sm:h-8 sm:w-9 items-center justify-center cursor-pointer rounded-none text-[var(--text-2)] transition-colors duration-200 hover:bg-[var(--violet-d)]/35 hover:text-[var(--text-1)] focus:outline-none"
              >
                {wallpaperMode ? (
                  <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
          )}

          {/* DEDICATED SUB-PAGES (Dating, Events, Gallery) */}
          {currentPage === 'dating' ? (
            <Suspense fallback={<div className="relative z-20 h-full w-full bg-[var(--void)]" />}>
              <DatingPage
                lang={lang}
                isPhone={isPhoneDevice}
                onToggleLang={() => setLang((prev) => (prev === 'VI' ? 'EN' : 'VI'))}
                onBackHome={() => navigateToPage('home')}
              />
            </Suspense>
          ) : currentPage === 'events' ? (
            <Suspense fallback={<div className="relative z-20 h-full w-full bg-[var(--void)]" />}>
              <EventsPage
                lang={lang}
                isPhone={isPhoneDevice}
                onToggleLang={() => setLang((prev) => (prev === 'VI' ? 'EN' : 'VI'))}
                onBackHome={() => navigateToPage('home')}
              />
            </Suspense>
          ) : currentPage === 'gallery' ? (
            <Suspense fallback={<div className="relative z-20 h-full w-full bg-[var(--void)]" />}>
              <GalleryPage
                lang={lang}
                isPhone={isPhoneDevice}
                onToggleLang={() => setLang((prev) => (prev === 'VI' ? 'EN' : 'VI'))}
                onSetLang={setLang}
                onBackHome={() => navigateToPage('home')}
              />
            </Suspense>
          ) : (
            /* MAIN HOME SCREEN */
            !wallpaperMode && (
              <main className="relative z-20 flex h-full w-full flex-col justify-between px-4 py-5 sm:px-12 sm:py-10 md:px-16 md:py-12 lg:px-20">
                {/* HUD: FOUR CORNER BRACKETS (Fades in over 0.6s at Step 5c) */}
                <div
                  className="pointer-events-none absolute inset-2.5 sm:inset-5 md:inset-7 z-10"
                  style={{
                    opacity: isUiRevealed ? 1 : 0,
                    transition: reducedMotion
                      ? 'none'
                      : 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                  aria-hidden="true"
                >
                  {/* 4 Corner Frames */}
                  <div className="absolute top-0 left-0 h-3.5 w-3.5 border-t border-l border-[var(--line)]" />
                  <div className="absolute top-0 right-0 h-3.5 w-3.5 border-t border-r border-[var(--line)]" />
                  <div className="absolute bottom-0 left-0 h-3.5 w-3.5 border-b border-l border-[var(--line)]" />
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 border-b border-r border-[var(--line)]" />
                </div>

                {/* Top-Left Logo + Subtitle:
                    Step 5c: Logo opacity 0 -> 1 and slides from -8px to 0 over 0.8s */}
                <div
                  className="flex items-start pr-24 sm:pr-0"
                  style={{
                    opacity: isUiRevealed ? 1 : 0,
                    transform: isUiRevealed ? 'translateY(0px)' : 'translateY(-8px)',
                    transition: reducedMotion
                      ? 'none'
                      : 'opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <div className="relative pt-0.5 sm:pt-1">
                    {lang === 'VI' ? (
                      <h1 className="cyber-title-wrapper" aria-label="TRĂNG SOI DẶM TRƯỜNG">
                        <span
                          className={`cyber-title-line ${
                            isPhoneDevice ? 'cyber-title-line-phone' : ''
                          }`}
                        >
                          TRĂNG SOI
                        </span>
                        <span
                          className={`cyber-title-line mt-0.5 sm:mt-1 ${
                            isPhoneDevice ? 'cyber-title-line-phone' : ''
                          }`}
                        >
                          DẶM TRƯỜNG
                        </span>
                      </h1>
                    ) : (
                      <h1 className="cyber-title-wrapper" aria-label="MOONSTRIDE">
                        <span
                          className={`cyber-title-line ${
                            isPhoneDevice ? 'cyber-title-line-phone' : ''
                          }`}
                        >
                          MOONSTRIDE
                        </span>
                      </h1>
                    )}

                    {/* Subtitle under logo */}
                    <div className="mt-2 flex flex-col gap-0.5">
                      <p className="logo-sub-label">
                        {lang === 'VI'
                          ? 'THẨM TINH HỒI // TRẠM TIẾP SÓNG'
                          : 'XAVIER // DEEP SPACE RELAY'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right-Edge Docked Vertical Trigger: MENU // SUB */}
                <button
                  type="button"
                  tabIndex={isUiRevealed ? 0 : -1}
                  onMouseEnter={() => {
                    soundFx.playHover();
                    loadEventsPage();
                  }}
                  onClick={() => {
                    soundFx.playSelect();
                    loadEventsPage();
                    prefetchAssets([
                      '/assets/aistudio/tracebackii_6e3cf5cf.webp',
                      '/assets/aistudio/cloud3_ca9fa321.webp',
                    ]);
                    setSubMenuOpen((prev) => !prev);
                  }}
                  aria-expanded={subMenuOpen}
                  aria-label={subMenuOpen ? 'Đóng menu phụ' : 'Mở menu phụ'}
                  className="menu-sub-tab group absolute right-0 top-[38%] sm:top-[39%] z-30 cursor-pointer focus:outline-none"
                  style={{
                    opacity: isUiRevealed ? 1 : 0,
                    transition: reducedMotion
                      ? 'none'
                      : 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  {/* Chamfered 1px SVG Border following top-left 8px diagonal cut */}
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 30 82"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M30 0.5 L8 0.5 L0.5 8 L0.5 81.5 L30 81.5"
                      fill="none"
                      stroke="var(--line)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                      className="transition-colors duration-200 group-hover:stroke-[var(--violet)]"
                    />
                  </svg>

                  {/* Double Chevron Icon (« when closed, » when open) */}
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`relative z-10 h-3.5 w-3.5 text-[var(--lilac)] transition-transform duration-300 ease-out group-hover:text-[var(--text-1)] ${
                      subMenuOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                    aria-hidden="true"
                  >
                    <path
                      d="M7.5 3.5L3 8L7.5 12.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="square"
                    />
                    <path
                      d="M12.5 3.5L8 8L12.5 12.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="square"
                    />
                  </svg>

                  {/* Vertical Text: SUB */}
                  <span className="menu-sub-tab-label relative z-10">
                    SUB
                  </span>
                </button>

                {/* Bottom Row: Left Main Menu (01-05) + Right Secondary Menu (06-09) */}
                <div className="mb-2 sm:mb-5 md:mb-7 flex items-end justify-between gap-2">
                  {/* Lower-Left Zone: PC Game Navigation Menu (01-05)
                      Step 5c: Each item staggered by 70ms, opacity 0->1 and horizontal slide 14px */}
                  <nav
                    aria-label="Game Main Menu"
                    className="flex w-44 sm:w-56 md:w-60 flex-col gap-1.5 sm:gap-2.5"
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {MENU_ITEMS.map((item, idx) => {
                      const isActive =
                        hoveredIndex === idx ||
                        (hoveredIndex === null &&
                          clickedIndex === idx &&
                          activeModal !== null);

                      return (
                        <div
                          key={item.id}
                          style={{
                            opacity: isUiRevealed ? 1 : 0,
                            transform: isUiRevealed ? 'translateX(0px)' : 'translateX(-14px)',
                            transition: reducedMotion
                              ? 'none'
                              : `opacity 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) ${
                                  idx * 70
                                }ms, transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) ${idx * 70}ms`,
                          }}
                        >
                          <button
                            type="button"
                            tabIndex={isUiRevealed ? 0 : -1}
                            onMouseEnter={() => {
                              if (hoveredIndex !== idx) {
                                soundFx.playHover();
                                setHoveredIndex(idx);
                              }
                              if (item.id === 'dating') {
                                loadDatingPage();
                              } else if (item.id === 'gallery') {
                                loadGalleryPage().then((m) => m.fetchArtDataLazy?.());
                              }
                            }}
                            onClick={() => handleTriggerMenu(idx)}
                            className={`game-menu-btn ${
                              isPhoneDevice ? 'game-menu-btn-phone' : ''
                            } flex items-center gap-3 sm:gap-3.5 h-8 sm:h-10 md:h-11 w-full px-2.5 sm:px-4 text-left whitespace-nowrap cursor-pointer focus:outline-none ${
                              isActive ? 'game-menu-btn-active' : 'game-menu-btn-idle'
                            }`}
                          >
                            <span className="menu-item-index relative z-10 shrink-0">
                              {item.code}
                            </span>
                            <span className="relative z-10">
                              {lang === 'VI' ? item.labelVI : item.labelEN}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </nav>

                  {/* Lower-Right Zone: Staggered Game-Style Secondary Menu (06-09) */}
                  <nav
                    aria-label="Secondary Cyberpunk Menu"
                    aria-hidden={!subMenuOpen}
                    className={`flex w-40 sm:w-56 md:w-60 flex-col gap-1.5 sm:gap-2.5 ${
                      isUiRevealed && subMenuOpen
                        ? 'pointer-events-auto'
                        : 'pointer-events-none select-none'
                    }`}
                    onMouseLeave={() => setHoveredSubIndex(null)}
                  >
                    {SUB_MENU_ITEMS.map((subItem, idx) => {
                      const isSubActive =
                        hoveredSubIndex === idx ||
                        (hoveredSubIndex === null &&
                          clickedSubIndex === idx &&
                          activeModal !== null);

                      const isSubItemVisible = isUiRevealed && subMenuOpen;
                      const staggerDelay = isSubItemVisible
                        ? idx * 80
                        : (SUB_MENU_ITEMS.length - 1 - idx) * 45;
                      const duration = isSubItemVisible ? '0.45s' : '0.28s';

                      return (
                        <div
                          key={subItem.id}
                          style={{
                            opacity: isSubItemVisible ? 1 : 0,
                            transform: isSubItemVisible
                              ? 'translateX(0px)'
                              : 'translateX(18px)',
                            transition: reducedMotion
                              ? 'none'
                              : `opacity ${duration} cubic-bezier(0.2, 0.8, 0.2, 1) ${staggerDelay}ms, transform ${duration} cubic-bezier(0.2, 0.8, 0.2, 1) ${staggerDelay}ms`,
                          }}
                        >
                          <button
                            type="button"
                            tabIndex={isSubItemVisible ? 0 : -1}
                            onMouseEnter={() => {
                              if (hoveredSubIndex !== idx) {
                                soundFx.playHover();
                                setHoveredSubIndex(idx);
                              }
                              if (subItem.id === 'events') {
                                loadEventsPage();
                                prefetchAssets([
                                  '/assets/aistudio/tracebackii_6e3cf5cf.webp',
                                  '/assets/aistudio/cloud3_ca9fa321.webp',
                                ]);
                              }
                            }}
                            onClick={() => handleTriggerSubMenu(subItem, idx)}
                            className={`game-menu-btn ${
                              isPhoneDevice ? 'game-menu-btn-phone' : ''
                            } flex items-center justify-end gap-3 sm:gap-3.5 h-8 sm:h-10 md:h-11 w-full px-2.5 sm:px-4 text-right whitespace-nowrap cursor-pointer focus:outline-none ${
                              isSubActive ? 'game-menu-btn-active' : 'game-menu-btn-idle'
                            }`}
                          >
                            <span className="menu-item-index relative z-10 shrink-0">
                              {subItem.code}
                            </span>
                            <span className="relative z-10">
                              {lang === 'VI' ? subItem.labelVI : subItem.labelEN}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </nav>
                </div>
              </main>
            )
          )}

          {/* Interactive Game Modals */}
          {activeModal && (
            <Suspense fallback={null}>
              <GameModals
                activeModal={activeModal}
                lang={lang}
                onClose={() => setActiveModal(null)}
                onEnterWallpaperMode={() => setWallpaperMode(true)}
              />
            </Suspense>
          )}
        </div>

        {/* =================================================================
            LAYER 5, 6, 7: BOOT SCREEN OVERLAY (#000) + BOOT TEXT + SCANLINE
            Runs once per page load. Unmounts completely when landingStage === 'done'.
            ================================================================= */}
        {landingStage !== 'done' && (
          <div
            className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center overflow-hidden"
            aria-live="polite"
            aria-atomic="false"
          >
            {/* LAYER 5: Pure Black (#000) Overlay
                Step 5b: Fades out over 1.0s starting 250ms into landing */}
            <div
              className="absolute inset-0 bg-[#000000]"
              style={{
                opacity:
                  landingStage === 'fade' || landingStage === 'ui' ? 0 : 1,
                transition:
                  'opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              aria-hidden="true"
            />

            {/* LAYER 6: Centered Boot Text Block
                Monospace, 11px, uppercase, letter-spacing .14em, line-height 2, var(--lilac)
                Max-width 460px on desktop, 340px on phone, left-aligned inside centered block.
                Step 5b: Fades out over 0.6s starting 250ms into landing */}
            <div
              className="relative z-[85] w-full px-5 max-w-[340px] sm:max-w-[460px] text-left"
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                lineHeight: 2,
                color: 'var(--lilac)',
                opacity:
                  landingStage === 'fade' || landingStage === 'ui' ? 0 : 1,
                transition:
                  'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              aria-hidden="true"
            >
              {typedLines.map((lineText, idx) => (
                <div key={idx} className="min-h-[22px] whitespace-pre-wrap break-words">
                  <span>{lineText}</span>
                  {activeTypingLine === idx && (
                    <span className="inline-block ml-0.5 text-[var(--lilac)]">▌</span>
                  )}
                </div>
              ))}

              {/* Step 3 & 4: Real Video Progress Bar Row */}
              <div
                className="min-h-[22px] whitespace-pre font-mono"
                style={{
                  opacity: showProgressRow ? 1 : 0,
                }}
              >
                {showProgressRow && (
                  <span>
                    {moonChar} {progressBarString} {progressPct}%
                  </span>
                )}
              </div>
            </div>

            {/* Screen-reader polite summary (prevents reading character-by-character) */}
            <span className="sr-only">
              {bootLangRef.current === 'VI'
                ? 'Đang kết nối trạm tiếp sóng, dò tín hiệu Thẩm Tinh Hồi.'
                : 'Connecting relay station, scanning signal Xavier.'}
            </span>

            {/* LAYER 7: Scan Line (2px height, var(--violet), var(--glow) box-shadow)
                Step 5a: Sweeps from top to bottom in 1.0s with opacity 1 -> 0 at bottom */}
            <div
              className={`pointer-events-none absolute top-0 left-0 right-0 z-[90] h-[2px] bg-[var(--violet)] ${
                landingStage !== 'booting' ? 'boot-scanline-active' : 'opacity-0'
              }`}
              style={{
                boxShadow: '0 0 24px 8px var(--glow)',
              }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </div>
  );
}
