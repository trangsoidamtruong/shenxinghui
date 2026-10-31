/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';
import { MeteorShowerCanvas } from './components/MeteorShowerCanvas';
import type { MenuActionId } from './components/GameModals';
import { soundFx } from './utils/soundFx';

const loadGameModals = () => import('./components/GameModals');
const loadDatingPage = () => import('./components/DatingPage');
const loadEventsPage = () => import('./components/EventsPage');

const GameModals = lazy(() =>
  loadGameModals().then((m) => ({ default: m.GameModals }))
);
const DatingPage = lazy(() =>
  loadDatingPage().then((m) => ({ default: m.DatingPage }))
);
const EventsPage = lazy(() =>
  loadEventsPage().then((m) => ({ default: m.EventsPage }))
);

const prefetchedAssets = new Set<string>();
function prefetchAssets(urls: string[]) {
  urls.forEach((url) => {
    if (prefetchedAssets.has(url)) return;
    prefetchedAssets.add(url);
    const img = new Image();
    img.src = url;
  });
}

const BGM_SRC =
  '/assets/aistudio/_______BGM_________________Xavier__Memoria_-_Heartstring_SymphonyLove_and_Deepspace_OST_BGM_0afc517b.mp3';

interface MenuItem {
  id: Exclude<MenuActionId, null>;
  labelVI: string;
  labelEN: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'home', labelVI: 'HỒ SƠ', labelEN: 'PROFILE' },
  { id: 'combat', labelVI: 'CHIẾN ĐẤU', labelEN: 'BATTLE' },
  { id: 'story', labelVI: 'CỐT TRUYỆN', labelEN: 'STORYLINE' },
  { id: 'dating', labelVI: 'HẸN HÒ', labelEN: 'DATING' },
  { id: 'gallery', labelVI: 'TRIỂN LÃM', labelEN: 'GALLERY' },
];

const SUB_MENU_ITEMS: MenuItem[] = [
  { id: 'events', labelVI: 'SỰ KIỆN', labelEN: 'EVENTS' },
  { id: 'contact', labelVI: 'LIÊN LẠC', labelEN: 'COMMS' },
  { id: 'interact', labelVI: 'TƯƠNG TÁC', labelEN: 'INTERACTION' },
  { id: 'about', labelVI: 'GIỚI THIỆU', labelEN: 'ABOUT' },
];

export default function App() {
  const [lang, setLang] = useState<'VI' | 'EN'>('VI');
  const [currentPage, setCurrentPage] = useState<'home' | 'dating' | 'events'>('home');
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [subMenuOpen, setSubMenuOpen] = useState<boolean>(false);
  const [hoveredSubIndex, setHoveredSubIndex] = useState<number | null>(null);
  const [clickedSubIndex, setClickedSubIndex] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<MenuActionId>(null);
  const [wallpaperMode, setWallpaperMode] = useState<boolean>(false);
  // Device & Orientation Lock state:
  // - Phone (shortest screen side < 600px): Always locked to Portrait view
  // - Tablet & Laptop (shortest screen side >= 600px): Always locked to Landscape view
  const [isPhoneDevice, setIsPhoneDevice] = useState<boolean>(false);
  const [isWindowPortrait, setIsWindowPortrait] = useState<boolean>(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const userManuallyPausedRef = useRef<boolean>(false);

  // Pause background video decoding when covered by the opaque EventsPage to save GPU/battery
  useEffect(() => {
    const vid = bgVideoRef.current;
    if (!vid) return;
    if (currentPage === 'events') {
      vid.pause();
    } else if (vid.paused) {
      vid.play().catch(() => {});
    }
  }, [currentPage]);

  useEffect(() => {
    const updateDeviceLock = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const minSide = Math.min(w, h);
      const phone = minSide < 600;
      setIsPhoneDevice(phone);
      setIsWindowPortrait(h > w);

      // Attempt native Screen Orientation API lock where supported by mobile/tablet browsers
      const orientationApi = (window.screen as unknown as {
        orientation?: { lock?: (mode: string) => Promise<void> };
      })?.orientation;
      if (orientationApi?.lock) {
        orientationApi.lock(phone ? 'portrait' : 'landscape').catch(() => {
          // Ignore if browser requires fullscreen before orientation lock
        });
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

  // Autoplay BGM on mount + unlock on first user click/tap/key if browser blocks initial unmuted autoplay
  useEffect(() => {
    const audio = bgmRef.current;
    if (!audio) return;
    audio.volume = 0.7;

    audio.play().catch(() => {
      // Browser blocked initial unmuted autoplay; will start on first interaction
    });

    const unlockEvents = ['click', 'touchend', 'keydown'];
    const handleUnlock = () => {
      if (userManuallyPausedRef.current) return;
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    };

    unlockEvents.forEach((ev) =>
      window.addEventListener(ev, handleUnlock, { passive: true })
    );

    return () => {
      unlockEvents.forEach((ev) =>
        window.removeEventListener(ev, handleUnlock)
      );
    };
  }, []);

  const handleToggleBgm = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = bgmRef.current;
    soundFx.playSelect();
    if (!audio) return;

    if (audio.paused) {
      userManuallyPausedRef.current = false;
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } else {
      userManuallyPausedRef.current = true;
      audio.pause();
    }
  }, []);

  const handleTriggerMenu = useCallback((index: number) => {
    const item = MENU_ITEMS[index];
    if (!item) return;
    setClickedIndex(index);
    setClickedSubIndex(null);
    soundFx.playSelect();

    if (item.id === 'dating') {
      setActiveModal(null);
      setCurrentPage('dating');
      return;
    }

    setActiveModal(item.id);
  }, []);

  const handleTriggerSubMenu = useCallback((item: MenuItem, index: number) => {
    setClickedSubIndex(index);
    setClickedIndex(null);
    soundFx.playSelect();

    if (item.id === 'events') {
      setActiveModal(null);
      setSubMenuOpen(false);
      setCurrentPage('events');
      return;
    }

    setActiveModal(item.id);
  }, []);

  // PC Game keyboard navigation (Up/Down/W/S, Enter/Space, Escape)
  useEffect(() => {
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
          setCurrentPage('home');
        }
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

      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        soundFx.playHover();
        setHoveredIndex((prev) => (prev === null ? 0 : (prev + 1) % MENU_ITEMS.length));
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        soundFx.playHover();
        setHoveredIndex((prev) =>
          prev === null ? MENU_ITEMS.length - 1 : (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length
        );
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (hoveredIndex !== null) {
          e.preventDefault();
          handleTriggerMenu(hoveredIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, currentPage, hoveredIndex, handleTriggerMenu, subMenuOpen, wallpaperMode]);

  // Determine if we need to constrain the viewport frame to enforce:
  // - Phone -> Always Portrait (9:16 vertical frame even if phone is rotated horizontally)
  // - Tablet & Laptop -> Always Landscape (16:10 horizontal frame even if tablet is held vertically)
  const enforcePhonePortraitBox = isPhoneDevice && !isWindowPortrait;
  const enforceTabletLandscapeBox = !isPhoneDevice && isWindowPortrait;

  const frameClassName = enforcePhonePortraitBox
    ? 'relative h-[100dvh] aspect-[9/16] max-w-[100vw] overflow-hidden bg-[#090414] border-x border-fuchsia-400/30 shadow-[0_0_50px_rgba(0,0,0,0.95)]'
    : enforceTabletLandscapeBox
    ? 'relative w-[100vw] aspect-[16/10] max-h-[100dvh] overflow-hidden bg-[#090414] border-y border-fuchsia-400/30 shadow-[0_0_50px_rgba(0,0,0,0.95)]'
    : 'relative h-[100dvh] w-screen overflow-hidden bg-[#090414]';

  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[#04010a] select-none">
      <div className={frameClassName}>
        {/* Background Music (Autoplay & Loop) */}
        <audio
          ref={bgmRef}
          src={BGM_SRC}
          autoPlay
          loop
          preload="metadata"
          onPlay={() => setIsBgmPlaying(true)}
          onPause={() => setIsBgmPlaying(false)}
          onEnded={(e) => {
            e.currentTarget.currentTime = 0;
            e.currentTarget.play().catch(() => {});
          }}
        />

        {/* 1. Looping Background Video
            On phone (always portrait), object-[62%_center] centers the giant character & bridge silhouette;
            On tablet & laptop (always landscape), object-center shows the full widescreen composition.
            Hidden on 'events' page because EventsPage has its own 100% opaque sky/cloud background. */}
        <video
          ref={bgVideoRef}
          src="/assets/aistudio/TR_NG_SOI_D_M_TR__NG_688d109f.mp4"
          poster="/assets/aistudio/home_poster.webp"
          autoPlay
          loop
          muted
          playsInline
          className={`pointer-events-none absolute inset-0 z-0 h-full w-full object-cover ${
            isPhoneDevice ? 'object-[62%_center]' : 'object-center'
          } ${currentPage === 'dating' ? 'cyber-bg-video-glitch' : ''} ${
            currentPage === 'events' ? 'hidden' : ''
          }`}
        />

        {/* Responsive atmospheric vignette */}
        <div
          className={`pointer-events-none absolute inset-0 z-5 ${
            isPhoneDevice
              ? 'bg-gradient-to-b from-[#090414]/45 via-transparent to-[#090414]/65'
              : 'bg-gradient-to-r from-[#0c041a]/55 via-transparent to-transparent'
          } ${currentPage === 'events' ? 'hidden' : ''}`}
          aria-hidden="true"
        />

        {/* 2. Sparse, thin, pale Right-to-Left Meteor Shower Canvas Overlay */}
        <MeteorShowerCanvas paused={currentPage !== 'home'} />

        {/* Top-Right Controls: Semi-transparent Language Toggle (VI / EN) + BGM Toggle + Eye / EyeOff Button */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 lg:top-9 lg:right-12 z-50 flex items-center gap-1.5 sm:gap-2">
          {!wallpaperMode && (
            <button
              type="button"
              onMouseEnter={() => soundFx.playHover()}
              onClick={() => {
                soundFx.playSelect();
                setLang((prev) => (prev === 'VI' ? 'EN' : 'VI'));
              }}
              title={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
              aria-label={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
              className="flex h-6 sm:h-7 items-center justify-center px-2 sm:px-2.5 cursor-pointer rounded-full border border-fuchsia-300/20 bg-purple-950/15 text-[10px] sm:text-[11px] font-semibold tracking-widest text-purple-200/55 backdrop-blur-[2px] opacity-60 transition-all duration-200 hover:opacity-100 hover:border-pink-300/60 hover:bg-fuchsia-900/35 hover:text-white focus:outline-none"
            >
              {lang}
            </button>
          )}

          <button
            type="button"
            onMouseEnter={() => soundFx.playHover()}
            onClick={handleToggleBgm}
            title={isBgmPlaying ? (lang === 'VI' ? 'Tắt nhạc nền (BGM)' : 'Mute BGM') : (lang === 'VI' ? 'Bật nhạc nền (BGM)' : 'Play BGM')}
            aria-label={isBgmPlaying ? 'Mute BGM' : 'Play BGM'}
            className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center cursor-pointer rounded-full border border-fuchsia-300/20 bg-purple-950/15 text-purple-200/55 backdrop-blur-[2px] opacity-60 transition-all duration-200 hover:opacity-100 hover:border-pink-300/60 hover:bg-fuchsia-900/35 hover:text-white focus:outline-none"
          >
            {isBgmPlaying ? (
              <Volume2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            ) : (
              <VolumeX className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            )}
          </button>

          {currentPage === 'home' && (
            <button
              type="button"
              onMouseEnter={() => soundFx.playHover()}
              onClick={() => {
                soundFx.playSelect();
                setActiveModal(null);
                setWallpaperMode((prev) => !prev);
              }}
              title={wallpaperMode ? (lang === 'VI' ? 'Hiện giao diện' : 'Show UI') : (lang === 'VI' ? 'Ẩn UI ngắm cảnh' : 'Hide UI')}
              aria-label={wallpaperMode ? 'Show UI' : 'Hide UI'}
              className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center cursor-pointer rounded-full border border-fuchsia-300/20 bg-purple-950/15 text-purple-200/55 backdrop-blur-[2px] opacity-60 transition-all duration-200 hover:opacity-100 hover:border-pink-300/60 hover:bg-fuchsia-900/35 hover:text-white focus:outline-none"
            >
              {wallpaperMode ? (
                <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              ) : (
                <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* 3A. DEDICATED DATING OR EVENTS PAGE (Lazy-loaded on demand) */}
        {currentPage === 'dating' ? (
          <Suspense fallback={<div className="relative z-20 h-full w-full bg-[#090315]/75" />}>
            <DatingPage
              lang={lang}
              isPhone={isPhoneDevice}
              onBackHome={() => setCurrentPage('home')}
            />
          </Suspense>
        ) : currentPage === 'events' ? (
          <Suspense fallback={<div className="relative z-20 h-full w-full bg-[#1b1534]" />}>
            <EventsPage
              lang={lang}
              isPhone={isPhoneDevice}
              onBackHome={() => setCurrentPage('home')}
            />
          </Suspense>
        ) : (
        /* 3B. MAIN HOME SCREEN */
        !wallpaperMode && (
          <main className="relative z-20 flex h-full w-full flex-col justify-between px-4 py-5 sm:px-12 sm:py-10 md:px-16 md:py-12 lg:px-20">
            {/* Top-Left Title: TRĂNG SOI DẶM TRƯỜNG (VI) / MOONSTRIDE (EN) */}
            <div className="flex items-start pr-24 sm:pr-0">
              <div className="relative pt-0.5 sm:pt-2">
                {lang === 'VI' ? (
                  <h1
                    className="cyber-title-wrapper"
                    aria-label="TRĂNG SOI DẶM TRƯỜNG"
                  >
                    <span
                      data-text="TRĂNG SOI"
                      className="cyber-title-line text-xl sm:text-3xl md:text-4xl lg:text-[2.75rem]"
                    >
                      TRĂNG SOI
                    </span>
                    <span
                      data-text="DẶM TRƯỜNG"
                      className="cyber-title-line mt-0.5 sm:mt-1 text-xl sm:text-3xl md:text-4xl lg:text-[2.75rem]"
                    >
                      DẶM TRƯỜNG
                    </span>
                  </h1>
                ) : (
                  <h1
                    className="cyber-title-wrapper"
                    aria-label="MOONSTRIDE"
                  >
                    <span
                      data-text="MOONSTRIDE"
                      className="cyber-title-line text-2xl sm:text-4xl md:text-5xl lg:text-[3.1rem]"
                    >
                      MOONSTRIDE
                    </span>
                  </h1>
                )}
              </div>
            </div>

            {/* Bottom Row: Left Main Menu + Right Cyberpunk Arrow `<` Slide-in Menu */}
            <div className="mb-1 sm:mb-4 md:mb-6 flex items-end justify-between gap-2">
              {/* Lower-Left Zone: PC Game Navigation Menu */}
              <nav
                aria-label="Game Main Menu"
                className="flex w-32 sm:w-52 flex-col gap-1 sm:gap-2"
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {MENU_ITEMS.map((item, idx) => {
                  const isActive =
                    hoveredIndex === idx ||
                    (hoveredIndex === null && clickedIndex === idx && activeModal !== null);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => {
                        if (hoveredIndex !== idx) {
                          soundFx.playHover();
                          setHoveredIndex(idx);
                        }
                        if (item.id === 'dating') {
                          loadDatingPage();
                        } else {
                          loadGameModals();
                        }
                      }}
                      onClick={() => handleTriggerMenu(idx)}
                      className={`game-menu-btn h-7 sm:h-9 w-full px-2 sm:px-3.5 text-left text-[11px] sm:text-[13px] tracking-[0.14em] sm:tracking-[0.24em] font-semibold uppercase whitespace-nowrap focus:outline-none ${
                        isActive ? 'game-menu-btn-active' : 'game-menu-btn-idle'
                      }`}
                    >
                      <span className="relative z-10">
                        {lang === 'VI' ? item.labelVI : item.labelEN}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Right Zone: Cyberpunk `<` Arrow Trigger + Frameless Slide-in Secondary Menu */}
              <div className="flex items-end sm:items-center gap-1.5 sm:gap-3">
                {/* Cyberpunk `<` Arrow Button */}
                <button
                  type="button"
                  onMouseEnter={() => {
                    soundFx.playHover();
                    loadEventsPage();
                    loadGameModals();
                  }}
                  onClick={() => {
                    soundFx.playSelect();
                    loadEventsPage();
                    prefetchAssets([
                      '/assets/aistudio/tracebackii_6e3cf5cf.webp',
                      '/assets/aistudio/cloud1_77474636.webp',
                    ]);
                    setSubMenuOpen((prev) => !prev);
                  }}
                  aria-expanded={subMenuOpen}
                  aria-label={subMenuOpen ? 'Đóng menu phụ' : 'Mở menu phụ'}
                  className="cyber-arrow-btn mb-0.5 sm:mb-0 h-8 w-8 sm:h-10 sm:w-10 shrink-0 cursor-pointer focus:outline-none"
                >
                  <svg
                    viewBox="0 0 36 36"
                    fill="none"
                    className={`h-6 w-6 sm:h-8 sm:w-8 transition-transform duration-300 ease-out ${
                      subMenuOpen ? 'rotate-180' : 'rotate-0'
                    }`}
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

                {/* Frameless Secondary Menu sliding in from the right */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    subMenuOpen
                      ? 'w-28 sm:w-48 translate-x-0 opacity-100'
                      : 'pointer-events-none w-0 translate-x-8 opacity-0'
                  }`}
                >
                  <nav
                    aria-label="Secondary Cyberpunk Menu"
                    className="flex w-28 sm:w-48 flex-col gap-1 sm:gap-2"
                    onMouseLeave={() => setHoveredSubIndex(null)}
                  >
                    {SUB_MENU_ITEMS.map((subItem, idx) => {
                      const isSubActive =
                        hoveredSubIndex === idx ||
                        (hoveredSubIndex === null &&
                          clickedSubIndex === idx &&
                          activeModal !== null);

                      return (
                        <button
                          key={subItem.id}
                          type="button"
                          onMouseEnter={() => {
                            if (hoveredSubIndex !== idx) {
                              soundFx.playHover();
                              setHoveredSubIndex(idx);
                            }
                            if (subItem.id === 'events') {
                              loadEventsPage();
                              prefetchAssets([
                                '/assets/aistudio/tracebackii_6e3cf5cf.webp',
                                '/assets/aistudio/cloud1_77474636.webp',
                              ]);
                            } else {
                              loadGameModals();
                            }
                          }}
                          onClick={() => handleTriggerSubMenu(subItem, idx)}
                          className={`game-menu-btn h-7 sm:h-9 w-full px-2 sm:px-3.5 text-right text-[11px] sm:text-[13px] tracking-[0.14em] sm:tracking-[0.24em] font-semibold uppercase whitespace-nowrap focus:outline-none ${
                            isSubActive ? 'game-menu-btn-active' : 'game-menu-btn-idle'
                          }`}
                        >
                          <span className="relative z-10">
                            {lang === 'VI' ? subItem.labelVI : subItem.labelEN}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </main>
        )
      )}

        {/* 4. Interactive Game Modals when other Menu or Sub-Menu Buttons are clicked */}
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
    </div>
  );
}
