import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SiteHeader } from './SiteHeader';

/**
 * Biến MEDIA_BASE trỏ tới Cloudinary của web.
 * Mọi đường dẫn tương đối dạng "memoria/mem_01/..." sẽ tự động nối với MEDIA_BASE.
 */
export const MEDIA_BASE = 'https://res.cloudinary.com/trangsoidamtruong/image/upload';

export interface MemoriaMapNode {
  id: string;
  title: string;
  next?: string[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  kind?: 'start' | 'normal';
  hasBg?: boolean;
  translated?: boolean;
  end?: boolean;
}

export interface MemoriaChapterContent {
  title: string;
  lines: Array<[string, string, string]>;
}

export interface MemoriaTranslationData {
  id: string;
  title: string;
  titleEn?: string;
  stars?: number;
  accent?: string;
  bgImage?: string;
  poster?: string;
  youtube?: string;
  totalChapters?: number;
  nodes: MemoriaMapNode[];
  chapters: Record<string, MemoriaChapterContent>;
}

interface MemoriaTranslationPageProps {
  lang: 'VI' | 'EN';
  cardId: number;
  onNavigate: (slug: string) => void;
  onToggleLang?: () => void;
  onBackHome: () => void;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function resolveMediaUrl(path?: string, fallback = ''): string {
  const clean = (path || '').trim();
  if (!clean) return fallback;
  if (/^https?:\/\//i.test(clean) || clean.startsWith('/')) {
    return clean;
  }
  return `${MEDIA_BASE.replace(/\/+$/, '')}/${clean.replace(/^\/+/, '')}`;
}

function extractYoutubeId(input?: string): string | null {
  const raw = (input || '').trim();
  if (!raw) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  const match = raw.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

interface ComputedNode extends MemoriaMapNode {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Tự động tính toán tọa độ các nút (nếu file JSON không ghi sẵn x, y, w, h)
 * và tạo đường nối SVG từ mảng nhánh `next` của từng chương.
 */
function buildStoryMapGeometry(nodes: MemoriaMapNode[]): {
  computedNodes: ComputedNode[];
  svgPaths: string[];
  svgDots: Array<{ cx: number; cy: number }>;
  mapHeight: number;
} {
  const computedNodes: ComputedNode[] = nodes.map((n, idx) => {
    const isStart = n.kind === 'start' || n.id === 'start';
    const w = n.w ?? (n.hasBg ? 200 : n.end && idx === nodes.length - 1 ? 210 : 150);
    const h = n.h ?? (isStart ? 30 : n.hasBg ? 64 : 34);
    const x = n.x ?? Math.round((300 - w) / 2);
    const y = n.y ?? idx * 64;
    return { ...n, x, y, w, h };
  });

  const byId = new Map<string, ComputedNode>();
  computedNodes.forEach((n) => byId.set(n.id, n));

  const svgPaths: string[] = [];
  const dotKeySet = new Set<string>();
  const svgDots: Array<{ cx: number; cy: number }> = [];

  const addDot = (cx: number, cy: number) => {
    const key = `${Math.round(cx)}:${Math.round(cy)}`;
    if (!dotKeySet.has(key)) {
      dotKeySet.add(key);
      svgDots.push({ cx, cy });
    }
  };

  computedNodes.forEach((u) => {
    const nextIds = u.next || [];
    nextIds.forEach((targetId) => {
      const v = byId.get(targetId);
      if (!v) return;
      const ux = u.x + u.w / 2;
      const uy = u.y + u.h;
      const vx = v.x + v.w / 2;
      const vy = v.y;

      addDot(ux, uy);
      addDot(vx, vy);

      if (Math.abs(ux - vx) < 1) {
        svgPaths.push(`M${ux} ${uy}V${vy}`);
      } else {
        const midY = Math.round(uy + (vy - uy) / 2);
        const r = Math.min(10, Math.abs(vx - ux) / 2, Math.abs(vy - uy) / 2);
        const dir = vx > ux ? 1 : -1;
        svgPaths.push(
          `M${ux} ${uy}V${midY - r}Q${ux} ${midY} ${ux + dir * r} ${midY}H${
            vx - dir * r
          }Q${vx} ${midY} ${vx} ${midY + r}V${vy}`
        );
      }
    });
  });

  const maxBottom = computedNodes.reduce(
    (acc, n) => Math.max(acc, n.y + n.h + 16),
    590
  );

  return {
    computedNodes,
    svgPaths,
    svgDots,
    mapHeight: Math.max(590, maxBottom),
  };
}

export const MemoriaTranslationPage: React.FC<MemoriaTranslationPageProps> = ({
  lang,
  cardId,
  onNavigate,
  onToggleLang,
  onBackHome,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const cardKey = `mem_${pad2(cardId)}`;
  const storageKey = `moonstride_memoria_read_${cardKey}`;

  const [data, setData] = useState<MemoriaTranslationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);

  const [currentChapterId, setCurrentChapterId] = useState<string>('ep1');
  const [visited, setVisited] = useState<Record<string, boolean>>({ ep1: true });
  const [fontSize, setFontSize] = useState<number>(17);
  const [mapOpen, setMapOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [posterUseFallback, setPosterUseFallback] = useState<boolean>(false);

  // Tải trạng thái "đã đọc" của thẻ từ localStorage (bọc try/catch)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setVisited(parsed as Record<string, boolean>);
          return;
        }
      }
    } catch {
      // Trình duyệt chặn localStorage -> dùng state tạm
    }
    setVisited({ ep1: true });
  }, [storageKey]);

  const markVisited = useCallback(
    (chapId: string) => {
      setVisited((prev) => {
        const next = { ...prev, [chapId]: true };
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // Bỏ qua nếu trình duyệt chặn localStorage
        }
        return next;
      });
    },
    [storageKey]
  );

  // Chỉ tải đúng file JSON của thẻ đang xem (/data/memoria/mem_01.json)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setIsPlaying(false);
    setMapOpen(false);
    setPosterUseFallback(false);

    fetch(`/data/memoria/${cardKey}.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json() as Promise<MemoriaTranslationData>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        const firstTranslated =
          json.nodes.find((n) => n.translated && json.chapters[n.id])?.id ||
          Object.keys(json.chapters)[0] ||
          'ep1';
        setCurrentChapterId(firstTranslated);
        markVisited(firstTranslated);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cardKey, markVisited]);

  // Danh sách các chương đã có bản dịch theo thứ tự trong nodes
  const translatedOrder = useMemo(() => {
    if (!data) return [];
    const fromNodes = data.nodes
      .filter((n) => n.translated && data.chapters[n.id])
      .map((n) => n.id);
    return fromNodes.length > 0 ? fromNodes : Object.keys(data.chapters);
  }, [data]);

  const totalChapters = useMemo(() => {
    if (!data) return 8;
    if (typeof data.totalChapters === 'number' && data.totalChapters > 0) {
      return data.totalChapters;
    }
    return data.nodes.filter((n) => n.kind !== 'start' && n.id !== 'start').length || 8;
  }, [data]);

  const currentIdx = Math.max(0, translatedOrder.indexOf(currentChapterId));
  const currentChapter = data?.chapters[currentChapterId] ?? null;

  const goToChapter = useCallback(
    (chapId: string) => {
      if (!data || !data.chapters[chapId]) return;
      setCurrentChapterId(chapId);
      markVisited(chapId);
      setIsPlaying(false);
      setMapOpen(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    },
    [data, markVisited]
  );

  // Phím tắt: M (bật/tắt mục lục), Esc (đóng mục lục hoặc quay lại Memoria), mũi tên trái/phải (chuyển chương)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea, select')) return;

      if (e.key === 'Escape') {
        e.stopPropagation();
        if (mapOpen) {
          setMapOpen(false);
        } else {
          onNavigate(`dating/falling-for-you/memoria/mem${cardId}`);
        }
        return;
      }

      if (
        e.key.toLowerCase() === 'm' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setMapOpen((prev) => !prev);
        return;
      }

      if (e.key === 'ArrowLeft' && currentIdx > 0) {
        e.preventDefault();
        goToChapter(translatedOrder[currentIdx - 1]);
      } else if (
        e.key === 'ArrowRight' &&
        currentIdx >= 0 &&
        currentIdx < translatedOrder.length - 1
      ) {
        e.preventDefault();
        goToChapter(translatedOrder[currentIdx + 1]);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [mapOpen, currentIdx, translatedOrder, goToChapter, onNavigate, cardId]);

  const { computedNodes, svgPaths, svgDots, mapHeight } = useMemo(() => {
    if (!data) {
      return {
        computedNodes: [],
        svgPaths: [],
        svgDots: [],
        mapHeight: 590,
      };
    }
    return buildStoryMapGeometry(data.nodes);
  }, [data]);

  const cardDisplayTitle = useMemo(() => {
    if (!data) return `MEM_${pad2(cardId)}`;
    return lang === 'EN' && data.titleEn ? data.titleEn : data.title;
  }, [data, lang, cardId]);

  const breadcrumbs = useMemo(
    () => [
      {
        label: lang === 'VI' ? 'TRĂNG SOI DẶM TRƯỜNG' : 'MOONSTRIDE',
        title: lang === 'VI' ? 'Quay về trang chủ' : 'Back to Home',
        onClick: onBackHome,
      },
      {
        label: lang === 'VI' ? 'HẸN HÒ' : 'DATING',
        title: lang === 'VI' ? 'Quay lại Hẹn hò' : 'Back to Dating',
        onClick: () => onNavigate('dating/falling-for-you'),
      },
      {
        label: 'MEMORIA',
        title: lang === 'VI' ? 'Quay lại Memoria' : 'Back to Memoria',
        onClick: () => onNavigate(`dating/falling-for-you/memoria/mem${cardId}`),
      },
      {
        label: cardDisplayTitle.toUpperCase(),
        title: cardDisplayTitle,
      },
    ],
    [lang, onBackHome, onNavigate, cardId, cardDisplayTitle]
  );

  const bgImageUrl = resolveMediaUrl(
    data?.bgImage,
    'https://res.cloudinary.com/trangsoidamtruong/image/upload/v1793886550/bound-by-starlight.webp'
  );
  const youtubeId = extractYoutubeId(data?.youtube);
  const youtubeThumbUrl = youtubeId
    ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    : bgImageUrl;
  const primaryPosterUrl = resolveMediaUrl(data?.poster, youtubeThumbUrl);
  const activePosterUrl = posterUseFallback ? bgImageUrl : primaryPosterUrl;
  const progressPct = Math.min(
    100,
    Math.round(((currentIdx + 1) / Math.max(1, totalChapters)) * 100)
  );

  return (
    <div
      id={`view-memoria-dich-${pad2(cardId)}`}
      className={`memoria-dich-page${mapOpen ? ' map-open' : ''}`}
      style={
        {
          '--accent': data?.accent || '#9d7bff',
          '--fs': `${fontSize}px`,
        } as React.CSSProperties
      }
    >
      {/* Ảnh nền nghệ thuật (bound-by-starlight.webp) phủ toàn trang theo concept tím ngân hà */}
      <div className="md-bg-stage" aria-hidden="true">
        {bgImageUrl && (
          <img
            src={bgImageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="md-bg-img"
          />
        )}
        <div className="md-bg-tint" />
        <div className="md-bg-scan" />
      </div>

      {/* Header dùng chung của web (chứa breadcrumb & nút đổi ngôn ngữ VI/EN ở góc phải trên) */}
      <SiteHeader
        breadcrumbs={breadcrumbs}
        langLabel={lang}
        langTitle={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        langAriaLabel={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        onToggleLang={onToggleLang}
      />

      {/* Thanh tiến độ chương */}
      <div className="progress" aria-hidden="true">
        <i id="md-bar" style={{ width: `${progressPct}%` }} />
      </div>

      <div ref={scrollContainerRef} className="md-scroll">
        {loading ? (
          <div className="head">
            <div className="chap">&gt; ĐANG TẢI BẢN DỊCH...</div>
          </div>
        ) : loadError || !data ? (
          <div className="head">
            <h1>Chưa tìm thấy dữ liệu bản dịch ({cardKey}.json)</h1>
            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  onNavigate(`dating/falling-for-you/memoria/mem${cardId}`)
                }
              >
                &lt; QUAY LẠI MEMORIA
              </button>
            </div>
          </div>
        ) : (
          <>
            <section className="head">
              <div className="head-row">
                <div>
                  <h1>{cardDisplayTitle}</h1>
                </div>
                <div className="tools">
                  <button
                    type="button"
                    className={`btn${mapOpen ? ' on' : ''}`}
                    id="md-mapBtn"
                    aria-expanded={mapOpen}
                    aria-controls="md-drawer"
                    onClick={() => setMapOpen((prev) => !prev)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <path d="M2 4h12M2 8h12M2 12h12" />
                    </svg>
                    {lang === 'VI' ? 'MỤC LỤC' : 'STORY MAP'}
                  </button>
                  <div className="group">
                    <button
                      type="button"
                      className="btn"
                      id="md-fMinus"
                      aria-label={lang === 'VI' ? 'Giảm cỡ chữ' : 'Decrease font size'}
                      onClick={() => setFontSize((fs) => Math.max(14, fs - 1))}
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      className="btn"
                      id="md-fPlus"
                      aria-label={lang === 'VI' ? 'Tăng cỡ chữ' : 'Increase font size'}
                      onClick={() => setFontSize((fs) => Math.min(24, fs + 1))}
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <main className="main">
              {/* Cột trái: Video dọc 9:16 cố định khi cuộn chữ (YouTube Facade) */}
              <div className="video-col">
                <div className="halo" />
                <div
                  className={`frame${isPlaying ? ' playing' : ''}`}
                  id="md-frame"
                >
                  <div className="poster">
                    {activePosterUrl && (
                      <img
                        src={activePosterUrl}
                        alt={cardDisplayTitle}
                        loading="lazy"
                        decoding="async"
                        onError={() => {
                          if (!posterUseFallback && bgImageUrl) {
                            setPosterUseFallback(true);
                          }
                        }}
                      />
                    )}
                  </div>
                  <div className="play-wrap">
                    <button
                      type="button"
                      className="play"
                      id="md-playBtn"
                      aria-label={lang === 'VI' ? 'Phát video' : 'Play video'}
                      onClick={() => setIsPlaying(true)}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="#f1edff"
                        aria-hidden="true"
                      >
                        <path d="M8 5l12 7-12 7z" />
                      </svg>
                    </button>
                    <div className="play-hint">
                      {lang === 'VI' ? 'BẤM ĐỂ TẢI VIDEO' : 'CLICK TO LOAD VIDEO'}
                    </div>
                  </div>

                  {/* Chỉ gắn iframe YouTube khi người xem bấm phát (isPlaying === true) */}
                  <div className={`player${youtubeId ? ' has-iframe' : ''}`}>
                    {isPlaying && youtubeId ? (
                      <>
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
                          title={cardDisplayTitle}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        <button
                          type="button"
                          className="btn stop-floating"
                          onClick={() => setIsPlaying(false)}
                        >
                          {lang === 'VI' ? 'QUAY LẠI ẢNH BÌA' : 'BACK TO COVER'}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="a">
                          {lang === 'VI' ? (
                            <>
                              [ TRÌNH PHÁT YOUTUBE
                              <br />
                              SẼ TẢI Ở ĐÂY ]
                            </>
                          ) : (
                            <>
                              [ YOUTUBE PLAYER
                              <br />
                              LOADS HERE ]
                            </>
                          )}
                        </div>
                        <div className="b">
                          {lang === 'VI' ? (
                            <>
                              Video chỉ được tải khi
                              <br />
                              người xem bấm phát.
                            </>
                          ) : (
                            <>
                              Video is only loaded when
                              <br />
                              you click play.
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn"
                          style={{ fontSize: 11 }}
                          onClick={() => setIsPlaying(false)}
                        >
                          {lang === 'VI' ? 'QUAY LẠI ẢNH BÌA' : 'BACK TO COVER'}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="scan" />
                  <div className="hud tl">
                    <i>●</i> REC
                  </div>
                  <div className="hud bt">
                    <span>00:00</span>
                    <span>09:16</span>
                  </div>
                  <div className="corner a" />
                  <div className="corner b" />
                  <div className="corner c" />
                  <div className="corner d" />
                </div>
              </div>

              {/* Cột phải: Nội dung bản dịch từng chương chạy trực tiếp trên nền ảnh Bound By Starlight */}
              <div className="text-col">
                <div className="corner a" aria-hidden="true" />
                <div className="corner b" aria-hidden="true" />
                <div className="corner c" aria-hidden="true" />
                <div className="corner d" aria-hidden="true" />

                <div className="text-head">
                  <div className="chap" id="md-chapTitle">
                    {currentChapter?.title || currentChapterId.toUpperCase()}
                  </div>
                </div>

                <div className="lines" id="md-lines">
                  {(currentChapter?.lines || []).map(([who, vi, en], idx) => {
                    const rawWho = (who || '').trim();
                    const upperWho = rawWho.toUpperCase();
                    const lineText = lang === 'VI' ? vi : en || vi;

                    // Dòng dẫn truyện hoặc chú thích (*) không có tên người nói
                    if (!rawWho) {
                      const isNote = lineText.trim().startsWith('(*)');
                      return (
                        <div
                          key={idx}
                          className={`line ${isNote ? 'note' : 'narr'}`}
                        >
                          <div className="say">{lineText}</div>
                        </div>
                      );
                    }

                    const isXavier =
                      upperWho === 'XAVIER' || upperWho === 'THẨM TINH HỒI';
                    const isPlayer =
                      upperWho === 'TÔI' ||
                      upperWho === 'BẠN' ||
                      upperWho === 'MC' ||
                      upperWho === 'YOU' ||
                      upperWho === 'ME';

                    let speakerLabel = rawWho.toUpperCase();
                    if (lang === 'EN') {
                      if (upperWho === 'TÔI') speakerLabel = 'ME';
                      else if (upperWho === 'BẠN') speakerLabel = 'YOU';
                      else if (upperWho === 'CHÀNG TRAI') speakerLabel = 'YOUNG MAN';
                      else if (upperWho === 'CHÚ CỪU NHỎ') speakerLabel = 'LITTLE LAMB';
                      else if (upperWho === 'NGƯỜI ĐÀN ÔNG') speakerLabel = 'MAN';
                    }

                    const whoClass = isXavier ? 'x' : isPlayer ? 'y' : 'npc';

                    return (
                      <div key={idx} className="line">
                        <div className={`who ${whoClass}`}>
                          {speakerLabel} &gt;
                        </div>
                        <div className="say">{lineText}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="pager">
                  <button
                    type="button"
                    className="btn"
                    id="md-prevBtn"
                    disabled={currentIdx <= 0}
                    onClick={() => {
                      if (currentIdx > 0) {
                        goToChapter(translatedOrder[currentIdx - 1]);
                      }
                    }}
                  >
                    &lt; {lang === 'VI' ? 'CHƯƠNG TRƯỚC' : 'PREV CHAPTER'}
                  </button>
                  <button
                    type="button"
                    className="btn next"
                    id="md-nextBtn"
                    disabled={currentIdx >= translatedOrder.length - 1}
                    onClick={() => {
                      if (currentIdx < translatedOrder.length - 1) {
                        goToChapter(translatedOrder[currentIdx + 1]);
                      }
                    }}
                  >
                    {lang === 'VI' ? 'CHƯƠNG SAU' : 'NEXT CHAPTER'} &gt;
                  </button>
                </div>
              </div>
            </main>
          </>
        )}
      </div>

      {/* Mục lục (Story Map): Drawer bên phải trên PC, Bottom Sheet trên điện thoại */}
      <div
        className="scrim"
        id="md-scrim"
        onClick={() => setMapOpen(false)}
      />
      <aside
        className="drawer"
        id="md-drawer"
        aria-label={lang === 'VI' ? 'Mục lục chương' : 'Chapter Story Map'}
      >
        <div className="drawer-head">
          <button
            type="button"
            className="btn"
            id="md-mapClose"
            aria-label={lang === 'VI' ? 'Đóng mục lục' : 'Close story map'}
            onClick={() => setMapOpen(false)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              style={{ margin: 0 }}
              aria-hidden="true"
            >
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>
        <div className="drawer-body">
          <div
            className="map"
            id="md-map"
            style={{ height: `${mapHeight}px` }}
          >
            <svg
              width="300"
              height={mapHeight}
              viewBox={`0 0 300 ${mapHeight}`}
              fill="none"
              stroke="#6a58c8"
              strokeWidth="1.4"
              aria-hidden="true"
            >
              {svgPaths.map((d, i) => (
                <path key={i} d={d} />
              ))}
              <g fill="#b9a7ff" stroke="none">
                {svgDots.map((dot, i) => (
                  <circle key={i} cx={dot.cx} cy={dot.cy} r="2.6" />
                ))}
              </g>
            </svg>

            {computedNodes.map((n) => {
              const isStart = n.kind === 'start' || n.id === 'start';
              const isLocked = isStart || !n.translated;
              const isCurrent = n.id === currentChapterId;
              const isDone = Boolean(visited[n.id]) && !isCurrent;

              const cls = [
                'node',
                n.hasBg ? 'img' : '',
                isStart ? 'start' : '',
                isCurrent ? 'cur' : '',
                isDone ? 'done' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={n.id}
                  type="button"
                  className={cls}
                  style={{
                    left: `${n.x}px`,
                    top: `${n.y}px`,
                    width: `${n.w}px`,
                    height: `${n.h}px`,
                  }}
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked) goToChapter(n.id);
                  }}
                >
                  <span>{n.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
};
