import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SiteHeader, type BreadcrumbItem } from './SiteHeader';
import {
  CONTACT_APPS,
  resolveLocalizedText,
  resolveLocalizedParagraphs,
  type ContactAppId,
  type ContactIconType,
} from '../data/contactData';
import { soundFx } from '../utils/soundFx';

interface ContactPageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  activeAppId?: ContactAppId | null;
  activeItemId?: string | null;
  onNavigate: (slug: string) => void;
  onToggleLang?: () => void;
  onBackHome: () => void;
}

const SESSION_UNLOCK_KEY = 'moonstride_contact_unlocked';
const PATTERN_SEQ = [2, 1, 0, 3, 4, 5, 8, 7, 6];
const MOON_PHASES = [
  'inset 0 0 0 16px #05040f',
  'inset -11px 0 0 #05040f',
  'inset -6px 0 0 #05040f',
  'none',
  'inset 6px 0 0 #05040f',
  'inset 11px 0 0 #05040f',
];

const pad2 = (n: number) => String(n).padStart(2, '0');
const pad3 = (n: number) => String(n).padStart(3, '0');

const UI_STRINGS = {
  VI: {
    crumbRoot: 'TRĂNG SOI DẶM TRƯỜNG',
    crumbContact: 'LIÊN LẠC',
    pageTitle: 'Liên lạc',
    deniedSub: '> Truy cập bị khoá. Cần xác thực mẫu hình.',
    retryBtn: '[ THỬ LẠI ]',
    lockTitleBar: 'VẼ MẪU HÌNH ĐỂ MỞ KHOÁ',
    lockStatusIdle: 'SYS_AUTH: Ký tự khởi đầu [Shen Xinghui]',
    lockStatusOk: '> mẫu hình khớp // truy cập được cấp',
    lockStatusBad: '> mẫu hình không khớp',
    cancelBtn: '[ HUỶ ]',
    popTitle: 'THÀNH CÔNG',
    popLine1: 'XÁC THỰC THÀNH CÔNG.',
    popLine2: 'ĐANG GIẢI MÃ HỒ SƠ',
    lockLogs: [
      'KHỞI TẠO KÊNH LIÊN LẠC [HOÀN TẤT]',
      'TẢI MÔ-ĐUN KHOÁ MÀN HÌNH [HOÀN TẤT]',
      'DỰNG GIAO DIỆN ĐỒ HOẠ [HOÀN TẤT]',
      'QUÉT CÁC NÚT [HOÀN TẤT]',
    ],
    bootLines: [
      '> KHỞI ĐỘNG THIẾT BỊ [OK]',
      '> KẾT NỐI RELAY // XAVIER [OK]',
      '> ĐỒNG BỘ DỮ LIỆU [OK]',
    ],
    homeHint: '> chạm một ứng dụng để mở',
    featuredComments: 'BÌNH LUẬN NỔI BẬT',
    replayTitle: '[ TRANG TÁI HIỆN ]',
    replaySub: 'nội dung sẽ được thêm vào sau',
    padAriaLabel: 'Lưới vẽ mẫu hình chữ S gồm 9 nút',
  },
  EN: {
    crumbRoot: 'MOONSTRIDE',
    crumbContact: 'CONTACT',
    pageTitle: 'Contact',
    deniedSub: '> Access locked. Pattern authentication required.',
    retryBtn: '[ RETRY ]',
    lockTitleBar: 'DRAW PATTERN TO UNLOCK',
    lockStatusIdle: 'SYS_AUTH: Ký tự khởi đầu [Shen Xinghui]',
    lockStatusOk: '> pattern matched // access granted',
    lockStatusBad: '> pattern mismatch',
    cancelBtn: '[ CANCEL ]',
    popTitle: 'SUCCESS',
    popLine1: 'AUTHENTICATION SUCCESSFUL.',
    popLine2: 'DECRYPTING ARCHIVE',
    lockLogs: [
      'INITIALIZING CONTACT CHANNEL [DONE]',
      'LOADING LOCK SCREEN MODULE [DONE]',
      'RENDERING GRAPHICAL INTERFACE [DONE]',
      'SCANNING NODES [DONE]',
    ],
    bootLines: [
      '> BOOTING DEVICE [OK]',
      '> CONNECTING RELAY // XAVIER [OK]',
      '> SYNCING DATA [OK]',
    ],
    homeHint: '> tap an application to open',
    featuredComments: 'FEATURED COMMENTS',
    replayTitle: '[ REPLAY PAGE ]',
    replaySub: 'content will be added later',
    padAriaLabel: '9-node S-pattern unlock grid',
  },
} as const;

function renderAppIcon(icon: ContactIconType) {
  switch (icon) {
    case 'pub':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="2" />
          <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
        </svg>
      );
    case 'sns':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="8" strokeDasharray="2 3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case 'msg':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 5h18v11H9l-4 4v-4H3z" />
          <path d="M7 9h10M7 12h6" />
        </svg>
      );
    case 'vid':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="6" width="12" height="12" />
          <path d="M15 10l6-3v10l-6-3z" />
        </svg>
      );
    case 'tel':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />
        </svg>
      );
  }
}

export const ContactPage: React.FC<ContactPageProps> = ({
  lang,
  activeAppId = null,
  activeItemId = null,
  onNavigate,
  onToggleLang,
  onBackHome,
}) => {
  const T = UI_STRINGS[lang];
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const [initiallyUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem(SESSION_UNLOCK_KEY) === '1';
    } catch {
      return false;
    }
  });

  // Lock states: 'locking' (pattern modal open) | 'denied' (cancelled/locked screen) | 'unlocked'
  const [lockState, setLockState] = useState<'locking' | 'denied' | 'unlocked'>(
    initiallyUnlocked ? 'unlocked' : 'locking'
  );

  // Device boot sequence runs once immediately after unlocking in this session
  const [isBootingDevice, setIsBootingDevice] = useState<boolean>(false);
  const [visibleBootCount, setVisibleBootCount] = useState<number>(0);

  // Lock screen logs (top-left)
  const [visibleLogCount, setVisibleLogCount] = useState<number>(0);

  // Pattern drawing state
  const [path, setPath] = useState<number[]>([]);
  const [patternStatus, setPatternStatus] = useState<'idle' | 'ok' | 'bad'>('idle');
  const [ghostPoint, setGhostPoint] = useState<[number, number] | null>(null);

  const padRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isDraggingRef = useRef<boolean>(false);
  const pathRef = useRef<number[]>([]);
  const patternDoneRef = useRef<boolean>(false);

  const timersRef = useRef<number[]>([]);
  const registerTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Scroll to top when route tier changes
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [activeAppId, activeItemId, lockState, isBootingDevice]);

  const resetPattern = useCallback(() => {
    pathRef.current = [];
    patternDoneRef.current = false;
    isDraggingRef.current = false;
    setPath([]);
    setGhostPoint(null);
    setPatternStatus('idle');
  }, []);

  // Start the 4 top-left log lines whenever the lock overlay opens
  useEffect(() => {
    if (lockState !== 'locking') return;
    resetPattern();

    if (reducedMotion) {
      setVisibleLogCount(4);
      return;
    }

    setVisibleLogCount(0);
    const ids: number[] = [];
    for (let i = 0; i < 4; i++) {
      const id = window.setTimeout(() => {
        setVisibleLogCount(i + 1);
      }, (i + 1) * 220);
      ids.push(id);
    }
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, [lockState, reducedMotion, resetPattern]);

  // Trigger device boot sequence (3 lines, 300ms apart, then enter screen after 1250ms)
  const startDeviceBoot = useCallback(() => {
    setIsBootingDevice(true);
    if (reducedMotion) {
      setVisibleBootCount(3);
      registerTimeout(() => {
        setIsBootingDevice(false);
      }, 150);
      return;
    }

    setVisibleBootCount(0);
    for (let i = 0; i < 3; i++) {
      registerTimeout(() => {
        setVisibleBootCount(i + 1);
      }, i * 300);
    }
    registerTimeout(() => {
      setIsBootingDevice(false);
    }, 1250);
  }, [reducedMotion, registerTimeout]);

  // Verify current path against S-pattern (forward or reverse)
  const verifyPattern = useCallback(
    (candidatePath: number[]) => {
      if (candidatePath.length < 2) {
        resetPattern();
        return;
      }

      const isMatch =
        candidatePath.length === 9 &&
        (candidatePath.every((v, i) => v === PATTERN_SEQ[i]) ||
          candidatePath.every((v, i) => v === PATTERN_SEQ[8 - i]));

      if (isMatch) {
        patternDoneRef.current = true;
        setPatternStatus('ok');
        soundFx.playSelect();
        try {
          window.sessionStorage.setItem(SESSION_UNLOCK_KEY, '1');
        } catch {
          // ignore storage errors
        }
        registerTimeout(
          () => {
            setLockState('unlocked');
            resetPattern();
            startDeviceBoot();
          },
          reducedMotion ? 280 : 1700
        );
      } else {
        patternDoneRef.current = true;
        setPatternStatus('bad');
        soundFx.playBack();
        registerTimeout(
          () => {
            resetPattern();
          },
          reducedMotion ? 250 : 650
        );
      }
    },
    [reducedMotion, registerTimeout, resetPattern, startDeviceBoot]
  );

  const getNodeCenter = useCallback((idx: number): [number, number] => {
    const el = nodeRefs.current[idx];
    if (!el) {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      return [col * 100 + 28, row * 100 + 28];
    }
    return [el.offsetLeft + 28, el.offsetTop + 28];
  }, []);

  const handlePointerMoveOnPad = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDraggingRef.current || patternDoneRef.current) return;
      const padEl = padRef.current;
      if (!padEl) return;
      const rect = padEl.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      setGhostPoint([px, py]);

      let changed = false;
      const nextPath = [...pathRef.current];
      for (let i = 0; i < 9; i++) {
        if (!nextPath.includes(i)) {
          const [cx, cy] = getNodeCenter(i);
          if (Math.hypot(px - cx, py - cy) < 30) {
            nextPath.push(i);
            changed = true;
          }
        }
      }
      if (changed) {
        pathRef.current = nextPath;
        setPath(nextPath);
        soundFx.playHover();
      }
    },
    [getNodeCenter]
  );

  const onPadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (patternDoneRef.current) return;
    resetPattern();
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    handlePointerMoveOnPad(e.clientX, e.clientY);
  };

  const onPadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    handlePointerMoveOnPad(e.clientX, e.clientY);
  };

  const onPadPointerUpOrCancel = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setGhostPoint(null);
    verifyPattern(pathRef.current);
  };

  // Keyboard support on the 9 pattern nodes
  const handleNodeKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (patternDoneRef.current) return;

    const row = Math.floor(idx / 3);
    const col = idx % 3;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = row * 3 + ((col + 1) % 3);
      nodeRefs.current[nextIdx]?.focus();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextIdx = row * 3 + ((col + 2) % 3);
      nodeRefs.current[nextIdx]?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = ((row + 1) % 3) * 3 + col;
      nodeRefs.current[nextIdx]?.focus();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = ((row + 2) % 3) * 3 + col;
      nodeRefs.current[nextIdx]?.focus();
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (pathRef.current.length > 0) {
        const nextPath = pathRef.current.slice(0, -1);
        pathRef.current = nextPath;
        setPath(nextPath);
      }
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const current = pathRef.current;
      if (!current.includes(idx)) {
        const nextPath = [...current, idx];
        pathRef.current = nextPath;
        setPath(nextPath);
        soundFx.playHover();
        if (nextPath.length === 9) {
          verifyPattern(nextPath);
        }
      } else if (e.key === 'Enter' && current.length >= 2) {
        verifyPattern(current);
      }
    }
  };

  // Handle Escape when lock modal is open -> cancel lock modal (show denied state)
  useEffect(() => {
    if (lockState !== 'locking') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        clearAllTimers();
        resetPattern();
        setLockState('denied');
      }
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [lockState, clearAllTimers, resetPattern]);

  const handleCancelLock = () => {
    soundFx.playBack();
    clearAllTimers();
    resetPattern();
    setLockState('denied');
  };

  const handleRetryLock = () => {
    soundFx.playSelect();
    clearAllTimers();
    resetPattern();
    setLockState('locking');
  };

  // Resolve current app & item from props
  const currentApp = useMemo(
    () => (activeAppId ? CONTACT_APPS.find((a) => a.id === activeAppId) ?? null : null),
    [activeAppId]
  );

  const currentItemIndex = useMemo(() => {
    if (!currentApp || !activeItemId) return -1;
    return currentApp.items.findIndex(
      (it) => it.id.toLowerCase() === activeItemId.toLowerCase()
    );
  }, [currentApp, activeItemId]);

  const currentItem =
    currentApp && currentItemIndex >= 0 ? currentApp.items[currentItemIndex] : null;

  // Build Breadcrumbs per Section 5:
  // - Lock screen or /contact: MOONSTRIDE > CONTACT
  // - /contact/[app]:          MOONSTRIDE > CONTACT > APP NAME (current)
  // - /contact/[app]/[id]:     MOONSTRIDE > CONTACT > APP NAME (clickable + bold/white current style)
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      {
        label: T.crumbRoot,
        onClick: onBackHome,
      },
    ];

    if (lockState !== 'unlocked' || isBootingDevice || !currentApp) {
      items.push({
        label: T.crumbContact,
      });
      return items;
    }

    // Tier 2 or Tier 3: CONTACT is clickable to go back to /contact
    items.push({
      label: T.crumbContact,
      onClick: () => onNavigate('contact'),
    });

    if (currentItem) {
      // Tier 3: App name is the final item AND remains clickable (returns to /contact/[app])
      items.push({
        label: currentApp.name,
        onClick: () => onNavigate(`contact/${currentApp.id}`),
      });
    } else {
      // Tier 2: App name is current non-clickable item
      items.push({
        label: currentApp.name,
      });
    }

    return items;
  }, [T, lockState, isBootingDevice, currentApp, currentItem, onBackHome, onNavigate]);

  const statusText =
    patternStatus === 'ok'
      ? T.lockStatusOk
      : patternStatus === 'bad'
      ? T.lockStatusBad
      : T.lockStatusIdle;

  return (
    <div
      id="page-contact"
      ref={scrollContainerRef}
      className="cyber-events-scroll relative z-20 flex h-full w-full flex-col overflow-y-auto overflow-x-hidden"
    >
      {/* 0. NGUYÊN TẮC SỐ MỘT: DÙNG LẠI THANH ĐIỀU HƯỚNG (<SiteHeader />) CỦA WEB */}
      <SiteHeader
        breadcrumbs={breadcrumbs}
        langLabel={onToggleLang ? lang : undefined}
        langTitle={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        langAriaLabel={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        onToggleLang={onToggleLang}
      />

      {/* NỘI DUNG TRANG CONTACT */}
      <main className="wrap ct-wrap flex-1">
        {/* Trạng thái bị từ chối sau khi bấm HUỶ hoặc Esc trên màn khoá */}
        {lockState === 'denied' && (
          <div id="denied">
            <h1 className="ct-t">{T.pageTitle}</h1>
            <p className="ct-sub">
              {T.deniedSub}
              <span className="ct-cur" aria-hidden="true" />
            </p>
            <button
              type="button"
              className="ct-btn"
              style={{ marginTop: '30px' }}
              onClick={handleRetryLock}
            >
              {T.retryBtn}
            </button>
          </div>
        )}

        {/* Nội dung chính chỉ hiện sau khi đã mở khoá */}
        {lockState === 'unlocked' && (
          <div id="con" className="ct-con">
            {/* Mặt trăng dither bên phải, nằm dưới nội dung, không chặn click */}
            <div className="ct-wpm" aria-hidden="true" />

            <h1 className="ct-t">{T.pageTitle}</h1>

            <div id="sc">
              {isBootingDevice ? (
                /* 3. KHỞI ĐỘNG THIẾT BỊ (3 dòng mono cách nhau 300ms, chỉ chạy 1 lần ngay sau khi mở khoá) */
                <div className="ct-bt" id="bt" aria-live="polite">
                  {T.bootLines.slice(0, visibleBootCount).map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              ) : !currentApp ? (
                /* TẦNG 1 (/contact): MÀN HÌNH CHÍNH 5 ỨNG DỤNG */
                <>
                  <div className="ct-hn">{T.homeHint}</div>
                  <div className="ct-apps">
                    {CONTACT_APPS.map((app) => {
                      const isAppDisabled = Boolean(app.disabled);
                      return (
                        <button
                          key={app.id}
                          type="button"
                          disabled={isAppDisabled}
                          aria-disabled={isAppDisabled || undefined}
                          tabIndex={isAppDisabled ? -1 : 0}
                          className={`ct-app ct-tk ${
                            isAppDisabled ? 'pointer-events-none cursor-default' : ''
                          }`}
                          onMouseEnter={() => {
                            if (isAppDisabled) return;
                            soundFx.playHover();
                          }}
                          onClick={() => {
                            if (isAppDisabled) return;
                            soundFx.playSelect();
                            onNavigate(`contact/${app.id}`);
                          }}
                        >
                          <span className="ct-bd">{pad2(app.items.length)}</span>
                          {renderAppIcon(app.icon)}
                          <span className="ct-lab">{app.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : !currentItem ? (
                /* TẦNG 2 (/contact/[app]): DANH SÁCH CÁC MẨU CỦA MỘT ỨNG DỤNG */
                <>
                  <div className="ct-ab">
                    <b>{currentApp.name}</b>
                    <span className="ct-pill">{pad2(currentApp.items.length)}</span>
                  </div>

                  {currentApp.key === 'PUB' ? (
                    /* 4A) PUBLIC ACCOUNT: Danh sách bài đăng với avatar, tên tài khoản, ngày, banner 21:8 */
                    <div className="ct-ls0">
                      {currentApp.items.map((item) => {
                        const titleText = resolveLocalizedText(item.title, lang);
                        const accountName = resolveLocalizedText(item.account, lang);
                        const initialChar = accountName ? accountName.charAt(0).toUpperCase() : 'P';

                        return (
                          <button
                            key={item.id}
                            type="button"
                            className="ct-po"
                            onMouseEnter={() => soundFx.playHover()}
                            onClick={() => {
                              soundFx.playSelect();
                              onNavigate(`contact/${currentApp.id}/${item.id}`);
                            }}
                          >
                            <div className="ct-pa">
                              <span
                                className={`ct-av ${item.avatar ? 'has-img' : ''}`}
                                aria-hidden="true"
                              >
                                {item.avatar ? (
                                  <img
                                    src={item.avatar}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : (
                                  initialChar
                                )}
                              </span>
                              <b>{accountName}</b>
                              <span className="ct-lab">{item.date}</span>
                            </div>

                            <div className="ct-pb">
                              {item.banner && (
                                <img
                                  src={item.banner}
                                  alt=""
                                  width={700}
                                  height={267}
                                  loading="lazy"
                                  decoding="async"
                                />
                              )}
                              <div className="ct-cp">{titleText}</div>
                              {item.unread && (
                                <i
                                  className="ct-dt"
                                  aria-label={lang === 'VI' ? 'Chưa đọc' : 'Unread'}
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* 4B) SNS, MESSAGE, VIDEO CALL, PHONE CALL */
                    <div className="ct-ls ct-tk">
                      {currentApp.items.map((item, j) => {
                        const titleText = resolveLocalizedText(item.title, lang);
                        const metaText = resolveLocalizedText(item.meta, lang);
                        const showCodeLabel = currentApp.key === 'SNS';

                        return (
                          <button
                            key={item.id}
                            type="button"
                            className="ct-rw"
                            onMouseEnter={() => soundFx.playHover()}
                            onClick={() => {
                              soundFx.playSelect();
                              onNavigate(`contact/${currentApp.id}/${item.id}`);
                            }}
                          >
                            <i
                              className="ct-mn"
                              style={{ '--sh': MOON_PHASES[j % 6] } as React.CSSProperties}
                              aria-hidden="true"
                            />
                            <span className="ct-tx">
                              {showCodeLabel && (
                                <span className="ct-lab">
                                  {currentApp.key} // {pad3(j + 1)}
                                </span>
                              )}
                              <b>{titleText}</b>
                            </span>
                            <span className="ct-mt">
                              <span>{item.date}</span>
                              {metaText && <span>{metaText}</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* TẦNG 3 (/contact/[app]/[id]): TRANG CHI TIẾT / TÁI HIỆN */
                <>
                  {currentApp.key === 'PUB' ? (
                    /* 6A) PUBLIC ACCOUNT CHI TIẾT */
                    (() => {
                      const titleText = resolveLocalizedText(currentItem.title, lang);
                      const accountName = resolveLocalizedText(currentItem.account, lang);
                      const initialChar = accountName ? accountName.charAt(0).toUpperCase() : 'P';
                      const paragraphs = resolveLocalizedParagraphs(currentItem.body, lang);
                      const comments = currentItem.comments ?? [];

                      return (
                        <article className="ct-pst">
                          <h2>{titleText}</h2>
                          <div className="ct-by">
                            <span
                              className={`ct-av ${currentItem.avatar ? 'has-img' : ''}`}
                              aria-hidden="true"
                            >
                              {currentItem.avatar ? (
                                <img
                                  src={currentItem.avatar}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                initialChar
                              )}
                            </span>
                            <b>{accountName}</b>
                            <span>{currentItem.date}</span>
                          </div>

                          <div className="ct-bd2">
                            {paragraphs.map((p, idx) => (
                              <p key={idx}>{p}</p>
                            ))}
                          </div>

                          <div className="ct-fc">
                            <h3>{T.featuredComments}</h3>
                            {comments.map((cm, idx) => (
                              <div key={idx} className="ct-cm">
                                <div className="ct-u">{cm.user}</div>
                                <p>{resolveLocalizedText(cm.text, lang)}</p>
                              </div>
                            ))}
                          </div>
                        </article>
                      );
                    })()
                  ) : (
                    /* 6B) SNS, MESSAGE, VIDEO CALL, PHONE CALL (KHUNG GIỮ CHỖ TRANG TÁI HIỆN) */
                    (() => {
                      const titleText = resolveLocalizedText(currentItem.title, lang);
                      const metaText = resolveLocalizedText(currentItem.meta, lang);
                      return (
                        <div className="ct-rpv">
                          <h2>{titleText}</h2>
                          <div className="ct-m">
                            {currentItem.date}
                            {metaText ? ` · ${metaText}` : ''}
                          </div>
                          <div className="ct-rpb">
                            <div>
                              {T.replayTitle}
                              <br />
                              {T.replaySub}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 2. MÀN KHOÁ CHỮ S (phủ toàn màn hình kể cả header khi chưa mở khoá) */}
      {lockState === 'locking' && (
        <div className="ct-ov" id="ov" role="dialog" aria-modal="true" aria-labelledby="ct-lock-title">
          {/* 4 dòng log góc trên trái (ẩn trên mobile) */}
          <div className="ct-lg" id="lg" aria-hidden="true">
            {T.lockLogs.slice(0, visibleLogCount).map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>

          <div
            className={`ct-win ct-tk ${
              patternStatus === 'ok' ? 'ok' : patternStatus === 'bad' ? 'bad' : ''
            }`}
            id="win"
          >
            <div className="ct-tb">
              <span id="ct-lock-title">{T.lockTitleBar}</span>
            </div>

            {/* Lưới 3x3 nút 56x56px */}
            <div
              ref={padRef}
              className="ct-pad"
              id="pad"
              role="group"
              aria-label={T.padAriaLabel}
              onPointerDown={onPadPointerDown}
              onPointerMove={onPadPointerMove}
              onPointerUp={onPadPointerUpOrCancel}
              onPointerCancel={onPadPointerUpOrCancel}
            >
              <svg id="ln" aria-hidden="true">
                {path.map((nodeIdx, k) => {
                  if (k === 0) return null;
                  const [x1, y1] = getNodeCenter(path[k - 1]);
                  const [x2, y2] = getNodeCenter(nodeIdx);
                  return (
                    <line
                      key={`${path[k - 1]}-${nodeIdx}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                    />
                  );
                })}
                {ghostPoint && path.length > 0 && (
                  <line
                    className="ct-gh"
                    x1={getNodeCenter(path[path.length - 1])[0]}
                    y1={getNodeCenter(path[path.length - 1])[1]}
                    x2={ghostPoint[0]}
                    y2={ghostPoint[1]}
                  />
                )}
              </svg>

              {Array.from({ length: 9 }, (_, i) => {
                const isSelected = path.includes(i);
                const row = Math.floor(i / 3) + 1;
                const col = (i % 3) + 1;
                return (
                  <button
                    key={i}
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    type="button"
                    className={`ct-nd ${isSelected ? 'on' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={
                      lang === 'VI'
                        ? `Nút ${i + 1} (hàng ${row}, cột ${col})`
                        : `Node ${i + 1} (row ${row}, col ${col})`
                    }
                    onKeyDown={(e) => handleNodeKeyDown(e, i)}
                  />
                );
              })}
            </div>

            {/* Dòng trạng thái dưới lưới */}
            <div className="ct-st" id="st" aria-live="polite">
              {statusText}
            </div>

            <button
              type="button"
              className="ct-btn"
              id="cancel"
              onClick={handleCancelLock}
            >
              {T.cancelBtn}
            </button>

            {/* Cửa sổ nhỏ màu hổ phách chồng lên mép phải khi xác thực thành công */}
            <div className="ct-pop" role="status" aria-live="assertive">
              <div className="ct-tb">
                <span>{T.popTitle}</span>
              </div>
              <p>
                {T.popLine1}
                <br />
                {T.popLine2}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
