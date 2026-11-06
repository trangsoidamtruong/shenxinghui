import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SiteHeader } from './SiteHeader';
import { FANFIC_LIST, type FanficItem } from '../data/fanficData';

interface FanficPageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  activeStorySlug?: string | null;
  onNavigate: (slug: string) => void;
  onToggleLang?: () => void;
  onBackHome: () => void;
}

const HEIGHT_FACTORS = [1, 0.95, 0.98, 0.93, 0.97];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function getSpineWidth(ch: number): number {
  return Math.round(Math.min(74, Math.max(46, 40 + ch * 0.7)));
}

function FallbackCoverSvg({ item, index }: { item: FanficItem; index: number }) {
  return (
    <svg viewBox="0 0 300 500" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="500" fill="#130f26" />
      <rect
        x="12"
        y="12"
        width="276"
        height="476"
        fill="none"
        stroke={item.c}
        strokeOpacity=".55"
      />
      <text
        x="150"
        y="48"
        textAnchor="middle"
        fontFamily="Chakra Petch,sans-serif"
        fontSize="10"
        letterSpacing="4"
        fill={item.c}
      >
        {`FANFIC // ${pad2(index + 1)}`}
      </text>
      <text
        x="150"
        y="245"
        textAnchor="middle"
        fontFamily="Chakra Petch,sans-serif"
        fontSize="22"
        fontWeight="600"
        fill="#ece8f8"
      >
        {item.t}
      </text>
    </svg>
  );
}

export const FanficPage: React.FC<FanficPageProps> = ({
  lang,
  activeStorySlug = null,
  onNavigate,
  onToggleLang,
  onBackHome,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const shelfRef = useRef<HTMLDivElement | null>(null);
  const firstBookRef = useRef<HTMLButtonElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [canHover, setCanHover] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(hover: hover)').matches;
  });

  const [hov, setHov] = useState<number>(-1);
  const [pin, setPin] = useState<number>(-1);
  const [bookHeightPx, setBookHeightPx] = useState<number>(380);
  const [renderedCovers, setRenderedCovers] = useState<Record<number, boolean>>({ 0: true });
  const [canScrollPrev, setCanScrollPrev] = useState<boolean>(false);
  const [canScrollNext, setCanScrollNext] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // Preload lightweight WebP covers when entering FanficPage so pulling any book is instantaneous
  useEffect(() => {
    FANFIC_LIST.forEach((f) => {
      if (!f.img) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = f.img;
    });
  }, []);

  const activeIdx = pin >= 0 ? pin : hov;

  const activeStory = useMemo(() => {
    if (!activeStorySlug) return null;
    const cleanTarget = activeStorySlug.replace(/^\/+|\/+$/g, '').toLowerCase();
    return (
      FANFIC_LIST.find((f) => {
        const cleanUrl = f.url.replace(/^\/+|\/+$/g, '').toLowerCase();
        return cleanUrl === cleanTarget || cleanUrl === `fanfic/${cleanTarget}`;
      }) ?? null
    );
  }, [activeStorySlug]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  }, []);

  // Lazy cover initialization when a book is pulled out for the first time
  useEffect(() => {
    if (activeIdx >= 0 && !renderedCovers[activeIdx]) {
      setRenderedCovers((prev) => ({ ...prev, [activeIdx]: true }));
    }
  }, [activeIdx, renderedCovers]);

  const updateArrows = useCallback(() => {
    const sh = shelfRef.current;
    if (!sh) return;
    setCanScrollPrev(sh.scrollLeft >= 4);
    setCanScrollNext(sh.scrollLeft + sh.clientWidth < sh.scrollWidth - 4);
  }, []);

  const measure = useCallback(() => {
    const rootEl = rootRef.current;
    const stageEl = stageRef.current;
    if (!rootEl || !stageEl) return;

    // Phần kệ (padding-top 46px + --h) + floor (2px) + info (78px) = --h + 126px
    // Tính toán --h theo không gian thực tế còn lại dưới thanh điều hướng để không cuộn trang
    const availStageH = stageEl.clientHeight;
    const maxFromStage = availStageH - 134;
    const halfViewport = window.innerHeight * 0.5;
    const computedH = Math.round(
      Math.max(210, Math.min(470, halfViewport, maxFromStage > 180 ? maxFromStage : halfViewport))
    );

    rootEl.style.setProperty('--h', `${computedH}px`);
    if (firstBookRef.current && firstBookRef.current.offsetHeight > 0) {
      setBookHeightPx(firstBookRef.current.offsetHeight);
    } else {
      setBookHeightPx(computedH);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover)');
    const onMqChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mq.addEventListener?.('change', onMqChange);
    return () => mq.removeEventListener?.('change', onMqChange);
  }, []);

  useEffect(() => {
    measure();
    updateArrows();
    const raf = window.requestAnimationFrame(() => {
      measure();
      updateArrows();
    });

    const onResize = () => {
      measure();
      updateArrows();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [measure, updateArrows, activeStory]);

  // Mở sẵn cuốn đầu tiên ("Đêm trăng") lúc mới vào kệ để thấy hiệu ứng, giống demo
  useEffect(() => {
    if (activeStory) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    setHov(0);
    const t = window.setTimeout(() => {
      setHov((prev) => (pin < 0 && prev === 0 ? -1 : prev));
    }, 1800);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStory]);

  // Esc hoặc bấm ra ngoài kệ/info thì cất sách lại
  useEffect(() => {
    if (activeStory) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pin >= 0 || hov >= 0) {
          e.stopPropagation();
          setPin(-1);
          setHov(-1);
        }
      }
    };

    const onDocClick = (e: MouseEvent) => {
      if (pin < 0) return;
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('.book, .info')) {
        setPin(-1);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('click', onDocClick);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('click', onDocClick);
    };
  }, [pin, hov, activeStory]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleScrollShelf = (dir: -1 | 1) => {
    const sh = shelfRef.current;
    if (!sh) return;
    sh.scrollBy({ left: dir * sh.clientWidth * 0.7, behavior: 'smooth' });
  };

  const handleOpenStory = (item: FanficItem) => {
    if (!item.url) return;
    if (/^https?:\/\//i.test(item.url)) {
      window.location.href = item.url;
      return;
    }
    showToast(
      lang === 'VI' ? `Mở trang đọc: ${item.url}` : `Opening story: ${item.url}`
    );
    onNavigate(item.url);
  };

  const activeBook = activeIdx >= 0 ? FANFIC_LIST[activeIdx] : null;
  const activeSpineWidth = activeBook ? getSpineWidth(activeBook.ch) : 54;
  const coverWidth = bookHeightPx * 0.6;

  const breadcrumbs = useMemo(() => {
    const items = [
      {
        label: lang === 'VI' ? 'TSDT' : 'MOONSTRIDE',
        title: lang === 'VI' ? 'Quay về trang chủ' : 'Back to Home',
        onClick: onBackHome,
      },
      {
        label: lang === 'VI' ? 'TRIỂN LÃM' : 'GALLERY',
        title: lang === 'VI' ? 'Quay lại Triển lãm' : 'Back to Gallery',
        onClick: () => onNavigate('gallery'),
      },
    ];

    if (activeStory) {
      items.push({
        label: 'FANFIC',
        title: lang === 'VI' ? 'Quay lại kệ sách Fanfic' : 'Back to Fanfic shelf',
        onClick: () => onNavigate('fanfic'),
      });
      items.push({
        label: activeStory.t.toUpperCase(),
        title: activeStory.t,
        onClick: undefined as unknown as () => void,
      });
    } else {
      items.push({
        label: 'FANFIC',
        title: 'Fanfic',
        onClick: undefined as unknown as () => void,
      });
    }
    return items;
  }, [lang, onBackHome, onNavigate, activeStory]);

  const activeStoryIndex = activeStory ? FANFIC_LIST.indexOf(activeStory) : -1;

  return (
    <div id="page-fanfic" ref={rootRef} className="fanfic-shelf">
      <div className="moon" aria-hidden="true" />

      <SiteHeader
        breadcrumbs={breadcrumbs}
        langLabel={lang}
        onToggleLang={onToggleLang}
      />

      {activeStory ? (
        <div className="stage" style={{ padding: '24px 5vw' }}>
          <div
            style={{
              maxWidth: '760px',
              width: '100%',
              margin: '0 auto',
              border: '1px solid var(--line)',
              background: 'rgba(14, 11, 28, 0.85)',
              padding: 'clamp(20px, 4vw, 36px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: '120px',
                  aspectRatio: '3 / 5',
                  flexShrink: 0,
                  borderRadius: '2px 5px 5px 2px',
                  overflow: 'hidden',
                  border: `1px solid ${activeStory.c}`,
                }}
              >
                {activeStory.img ? (
                  <img
                    src={activeStory.img}
                    alt={`Bìa ${activeStory.t}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <FallbackCoverSvg
                    item={activeStory}
                    index={activeStoryIndex >= 0 ? activeStoryIndex : 0}
                  />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 220px' }}>
                <span className="hud" style={{ color: activeStory.c }}>
                  {`FANFIC // ${pad2((activeStoryIndex >= 0 ? activeStoryIndex : 0) + 1)}`}
                </span>
                <h1
                  style={{
                    margin: 0,
                    fontFamily: '"Chakra Petch", sans-serif',
                    fontSize: 'clamp(24px, 3.5vw, 34px)',
                    fontWeight: 600,
                    color: 'var(--silver)',
                  }}
                >
                  {activeStory.t}
                </h1>
                {activeStory.sub && (
                  <div style={{ color: 'var(--vio)', fontSize: '15px' }}>{activeStory.sub}</div>
                )}
                <div className="hud" style={{ marginTop: '4px' }}>
                  {activeStory.done
                    ? lang === 'VI'
                      ? 'HOÀN THÀNH'
                      : 'COMPLETED'
                    : lang === 'VI'
                      ? 'ĐANG VIẾT'
                      : 'ONGOING'}{' '}
                  · {activeStory.ch} {lang === 'VI' ? 'CHƯƠNG' : 'CHAPTERS'}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <button
                    type="button"
                    className="back"
                    onClick={() => onNavigate('fanfic')}
                  >
                    {lang === 'VI' ? '← QUAY LẠI KỆ SÁCH' : '← BACK TO SHELF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="top">
            <div>
              <h1>Fanfic</h1>
            </div>
            <div className="arrows">
              <button
                type="button"
                className="ar"
                id="ff-pv"
                disabled={!canScrollPrev}
                onClick={() => handleScrollShelf(-1)}
                aria-label={lang === 'VI' ? 'Cuộn trái' : 'Scroll left'}
              >
                ←
              </button>
              <button
                type="button"
                className="ar"
                id="ff-nx"
                disabled={!canScrollNext}
                onClick={() => handleScrollShelf(1)}
                aria-label={lang === 'VI' ? 'Cuộn phải' : 'Scroll right'}
              >
                →
              </button>
            </div>
          </div>

          <div className="stage" ref={stageRef}>
            <div
              className="shelf"
              id="ff-shelf"
              ref={shelfRef}
              onScroll={updateArrows}
              onMouseLeave={() => {
                if (canHover) setHov(-1);
              }}
            >
              <div className="row" id="ff-row">
                {FANFIC_LIST.map((f, i) => {
                  const w = getSpineWidth(f.ch);
                  const k = HEIGHT_FACTORS[i % 5];
                  const isAct = i === activeIdx;
                  const dx =
                    activeIdx < 0 || isAct
                      ? '0px'
                      : `${(i < activeIdx ? -1 : 1) * (coverWidth / 2 - activeSpineWidth / 2 + 8)}px`;
                  const isRendered = Boolean(renderedCovers[i]);

                  return (
                    <button
                      key={`${f.url}-${i}`}
                      ref={i === 0 ? firstBookRef : undefined}
                      type="button"
                      className={`book${isAct ? ' act' : ''}`}
                      data-i={i}
                      style={
                        {
                          '--c': f.c,
                          '--w': `${w}px`,
                          '--k': k,
                          '--dx': dx,
                          zIndex: isAct ? 6 : 1,
                        } as React.CSSProperties
                      }
                      aria-label={`${f.t} – ${f.done ? 'hoàn' : 'đang viết'}, ${f.ch} chương`}
                      onClick={() => {
                        setPin((prev) => (prev === i ? -1 : i));
                      }}
                      onFocus={() => {
                        if (pin < 0) setHov(i);
                      }}
                      onMouseEnter={() => {
                        if (canHover) setHov(i);
                      }}
                    >
                      <div className="spine">
                        <span className="tt">{f.t}</span>
                      </div>
                      <div className="cover">
                        {isRendered && (
                          <>
                            <div className="art">
                              {f.img ? (
                                <img
                                  src={f.img}
                                  alt={`Bìa ${f.t}`}
                                  loading="lazy"
                                />
                              ) : (
                                <FallbackCoverSvg item={f} index={i} />
                              )}
                              <div className="hinge" />
                            </div>
                            <div className="pages" />
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="floor" />

            <div className="info" id="ff-info">
              {activeBook ? (
                <>
                  <span className="n">{pad2(activeIdx + 1)}</span>
                  <span className="t">{activeBook.t}</span>
                  <button
                    type="button"
                    className="go is-disabled"
                    disabled
                    aria-disabled="true"
                    tabIndex={-1}
                  >
                    &gt; {lang === 'VI' ? 'ĐỌC TRUYỆN' : 'READ STORY'}
                  </button>
                  {pin >= 0 && (
                    <button
                      type="button"
                      className="back"
                      onClick={() => {
                        setPin(-1);
                        setHov(-1);
                      }}
                    >
                      {lang === 'VI' ? 'CẤT LẠI' : 'PUT BACK'}
                    </button>
                  )}
                </>
              ) : (
                <span className="m hud">
                  &gt; {FANFIC_LIST.length}{' '}
                  {lang === 'VI' ? 'fanfic trên kệ' : 'fanfics on shelf'}
                </span>
              )}
            </div>
          </div>
        </>
      )}

      <div
        id="ff-toast"
        className="hud ff-toast"
        style={{ opacity: toastVisible ? 1 : 0 }}
      >
        {toastMsg}
      </div>
    </div>
  );
};
