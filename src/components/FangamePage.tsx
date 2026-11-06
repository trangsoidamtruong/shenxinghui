import React, { useEffect, useRef, useMemo } from 'react';
import { SiteHeader } from './SiteHeader';
import { FANGAME_LIST, type FangameItem } from '../data/fangameData';

interface FangamePageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  onNavigate: (slug: string) => void;
  onToggleLang?: () => void;
  onBackHome: () => void;
}

const SYMBOLS = ['✦', '◈', '❖', '✧', '❂', '✵'];
const MOONS = ['○', '◔', '◑', '◕', '●'];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function escHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function renderArtHtml(g: FangameItem, i: number, isFull: boolean): string {
  if (g.img) {
    return `<img src="${escHtml(g.img)}" alt="${escHtml(g.n)}" loading="lazy" decoding="async">`;
  }
  const sym = SYMBOLS[i % SYMBOLS.length];
  return `<div class="ph" style="--c:${escHtml(g.c)}"><i>${sym}</i>${
    isFull ? `<b>CHIP // ${pad2(i + 1)}</b>` : ''
  }</div>`;
}

export const FangamePage: React.FC<FangamePageProps> = ({
  lang,
  onNavigate,
  onToggleLang,
  onBackHome,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  const breadcrumbs = useMemo(
    () => [
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
      {
        label: 'FANGAME',
        title: 'Fangame',
      },
    ],
    [lang, onBackHome, onNavigate]
  );

  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;
    const rootEl: HTMLDivElement = container;

    const $ = <T extends HTMLElement = HTMLElement>(sel: string): T =>
      rootEl.querySelector(sel) as T;

    const rack = $<HTMLDivElement>('#fg-rack');
    const reader = $<HTMLDivElement>('#fg-reader');
    const screen = $<HTMLDivElement>('#fg-screen');
    const st = $<HTMLSpanElement>('#fg-st');
    const led = $<HTMLSpanElement>('#fg-led');
    const qInput = $<HTMLInputElement>('#fg-q');
    const cl = $<HTMLDivElement>('#fg-cl');
    const noneEl = $<HTMLDivElement>('#fg-none');
    const pvBtn = $<HTMLButtonElement>('#fg-pv');
    const nxBtn = $<HTMLButtonElement>('#fg-nx');
    const toastEl = $<HTMLDivElement>('#fg-toast');

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let unmounted = false;
    let cur = -1;
    let busy = false;
    let fly: HTMLElement | null = null;
    let flyW = 0;
    let flyH = 0;
    let activeAnim: Animation | null = null;
    let toastTimer: number | null = null;
    const timers = new Set<number>();

    const addTimer = (fn: () => void, ms: number): number => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (!unmounted) fn();
      }, ms);
      timers.add(id);
      return id;
    };

    const showToast = (msg: string) => {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.style.opacity = '1';
      if (toastTimer !== null) window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        if (!unmounted && toastEl) toastEl.style.opacity = '0';
      }, 2200);
    };

    // Khởi tạo danh sách chip dữ liệu trong giá chip
    rack.innerHTML = '';
    const slots: HTMLDivElement[] = FANGAME_LIST.map((g, i) => {
      const s = document.createElement('div');
      s.className = 'slot';
      s.dataset.q = norm(g.n);
      s.innerHTML = `<button type="button" class="chip" style="--c:${escHtml(
        g.c
      )}" aria-label="Nạp game ${escHtml(g.n)}">
        <div class="pins"></div>
        <div class="art">${renderArtHtml(g, i, false)}</div>
        <div class="lb"><span class="id">${pad2(i + 1)}</span><span class="nm">${escHtml(
        g.n
      )}</span></div>
      </button>`;
      const btn = s.firstElementChild as HTMLButtonElement;
      btn.addEventListener('click', () => pick(i));
      rack.appendChild(s);
      return s;
    });

    function showIdle() {
      screen.innerHTML = `<div class="idle">
        <div class="ring">◇</div>
        <div class="hud">CHƯA CÓ CHIP</div>
        <p>Hãy chọn một chip dữ liệu ở giá bên dưới</p>
      </div>`;
    }

    function fit() {
      const gi = screen.querySelector<HTMLElement>('.gi');
      if (!gi) return;
      gi.className = 'gi';
      if (
        window.innerWidth <= 700 ||
        Boolean(rootEl.closest('.is-phone-frame'))
      ) {
        return;
      }
      for (let k = 1; k <= 6; k++) {
        if (gi.scrollHeight <= gi.clientHeight + 1) break;
        gi.classList.add('t' + k);
      }
    }

    function getRelRect(el: HTMLElement) {
      const r = el.getBoundingClientRect();
      const rootRect = rootEl.getBoundingClientRect();
      return {
        left: r.left - rootRect.left + rootEl.scrollLeft,
        top: r.top - rootRect.top + rootEl.scrollTop,
        width: r.width,
        height: r.height,
      };
    }

    function dock(w: number, h: number) {
      const r = getRelRect(reader);
      return {
        x: r.left + r.width / 2 - w / 2,
        y: r.top - h * 0.24,
      };
    }

    function syncFlyDockPosition() {
      if (!fly || busy || cur < 0) return;
      const d = dock(flyW, flyH);
      fly.style.transform = `translate(${d.x}px, ${d.y}px)`;
    }

    function animateChip(
      el: HTMLElement,
      keyframes: Keyframe[],
      duration: number,
      done: () => void
    ) {
      const last = keyframes[keyframes.length - 1];
      const finalTransform =
        last && typeof last.transform === 'string' ? last.transform : '';

      if (reduce || typeof el.animate !== 'function') {
        if (finalTransform) {
          el.style.transform = finalTransform;
        }
        done();
        return;
      }
      const anim = el.animate(keyframes, {
        duration,
        easing: 'cubic-bezier(.22, .9, .24, 1)',
        fill: 'forwards',
      });
      activeAnim = anim;
      anim.onfinish = () => {
        if (activeAnim === anim) activeAnim = null;
        if (finalTransform) {
          el.style.transform = finalTransform;
        }
        anim.cancel();
        if (!unmounted) done();
      };
    }

    function runBoot(done: () => void) {
      if (reduce) {
        done();
        return;
      }
      screen.innerHTML = `<div class="boot hud">
        <div id="fg-b1">&gt; ĐỌC CHIP... OK</div>
        <div id="fg-b2">&gt; DÒ TÍN HIỆU... OK</div>
        <div id="fg-b3">&gt; TẢI TRÒ CHƠI <span class="ml" id="fg-ml">○</span></div>
      </div>`;
      const b1 = screen.querySelector<HTMLElement>('#fg-b1');
      const b2 = screen.querySelector<HTMLElement>('#fg-b2');
      const b3 = screen.querySelector<HTMLElement>('#fg-b3');
      const ml = screen.querySelector<HTMLElement>('#fg-ml');

      addTimer(() => b1?.classList.add('on'), 30);
      addTimer(() => b2?.classList.add('on'), 150);
      addTimer(() => {
        b3?.classList.add('on');
        MOONS.forEach((m, k) => {
          addTimer(() => {
            if (ml) ml.textContent = m;
          }, k * 55);
        });
      }, 270);
      addTimer(done, 540);
    }

    function showGame(i: number, g: FangameItem) {
      const lvMoons = '●'.repeat(g.lv) + '○'.repeat(3 - g.lv);
      const tagsHtml = g.g.map((t) => `<span>${escHtml(t)}</span>`).join('');
      const href = g.url || '#';

      screen.innerHTML = `<div class="game" style="--c:${escHtml(g.c)}">
        <div class="shot">${renderArtHtml(g, i, true)}</div>
        <div class="gi">
          <h2>${escHtml(g.n)}</h2>
          <div class="tags">${tagsHtml}</div>
          <dl>
            <div><dt>NỀN TẢNG</dt><dd>${escHtml(g.plat)}</dd></div>
            <div><dt>PHIÊN BẢN</dt><dd>${escHtml(g.v)}</dd></div>
            <div><dt>ĐỘ KHÓ</dt><dd class="lv" aria-label="Độ khó ${g.lv} trên 3">${lvMoons}</dd></div>
          </dl>
          <p>${escHtml(g.d)}</p>
          <div class="acts">
            <a class="play" href="${escHtml(href)}" id="fg-play">&gt; CHƠI</a>
            <button type="button" class="ej" id="fg-ej">THÁO CHIP</button>
          </div>
        </div>
      </div>`;

      fit();

      const playBtn = screen.querySelector<HTMLAnchorElement>('#fg-play');
      const ejBtn = screen.querySelector<HTMLButtonElement>('#fg-ej');

      playBtn?.addEventListener('click', (e) => {
        const targetUrl = (g.url || '').trim();
        if (/^https?:\/\//i.test(targetUrl)) {
          // Mở đường dẫn game ngoài trong tab mới (hoặc chuyển hướng)
          return;
        }
        e.preventDefault();
        showToast(`> Khởi động "${g.n}" (${g.v})...`);
      });

      ejBtn?.addEventListener('click', () => eject());
    }

    function applyFilter() {
      const k = norm(qInput.value.trim());
      let n = 0;
      slots.forEach((s, i) => {
        const hit = !k || (s.dataset.q || '').includes(k);
        if (hit) n++;
        // Nếu đang nạp một game mà lọc làm game đó không khớp thì slot của chip đó vẫn giữ để khi tháo chip bay về đúng chỗ
        s.hidden = !(hit || i === cur);
      });
      cl.textContent = k
        ? `> ${n}/${FANGAME_LIST.length} game khớp`
        : `> ${FANGAME_LIST.length} game trên kệ`;
      noneEl.hidden = n > 0;
      updateArrows();
    }

    function insert(i: number) {
      busy = true;
      cur = i;
      const g = FANGAME_LIST[i];
      const slot = slots[i];
      const chip = slot.firstElementChild as HTMLElement;
      const b0 = getRelRect(chip);

      slot.classList.add('empty');
      reader.style.setProperty('--c', g.c);
      reader.classList.remove('on');
      reader.classList.add('load');
      led.className = 'led load';
      st.textContent = 'ĐANG ĐỌC...';

      fly = chip.cloneNode(true) as HTMLElement;
      fly.classList.add('fly');
      flyW = b0.width;
      flyH = b0.height;
      fly.style.width = `${b0.width}px`;
      fly.style.height = `${b0.height}px`;
      rootEl.appendChild(fly);

      const d = dock(b0.width, b0.height);
      animateChip(
        fly,
        [
          { transform: `translate(${b0.left}px, ${b0.top}px) scale(1)` },
          {
            transform: `translate(${d.x}px, ${d.y - 26}px) scale(1.03)`,
            offset: 0.68,
          },
          { transform: `translate(${d.x}px, ${d.y}px) scale(1)` },
        ],
        460,
        () => {
          if (fly) {
            const latestDock = dock(flyW, flyH);
            fly.style.transform = `translate(${latestDock.x}px, ${latestDock.y}px)`;
          }
          runBoot(() => {
            reader.classList.remove('load');
            reader.classList.add('on');
            led.className = 'led on';
            st.textContent = `ĐÃ NẠP // ${pad2(i + 1)}`;
            showGame(i, g);
            busy = false;
            syncFlyDockPosition();
          });
        }
      );
    }

    function eject(done?: () => void) {
      if (cur < 0) {
        done?.();
        return;
      }
      busy = true;
      const i = cur;
      cur = -1;
      const slot = slots[i];
      const chip = slot.firstElementChild as HTMLElement;

      reader.classList.remove('on', 'load');
      led.className = 'led';
      st.textContent = 'CHỜ CHIP';
      showIdle();

      const finish = () => {
        if (fly) {
          fly.remove();
          fly = null;
        }
        slot.classList.remove('empty');
        applyFilter();
        busy = false;
        done?.();
      };

      if (!fly) {
        finish();
        return;
      }

      const b1 = getRelRect(chip);
      const d = dock(b1.width || flyW, b1.height || flyH);
      animateChip(
        fly,
        [
          { transform: `translate(${d.x}px, ${d.y}px)` },
          { transform: `translate(${d.x}px, ${d.y - 26}px)`, offset: 0.32 },
          { transform: `translate(${b1.left}px, ${b1.top}px)` },
        ],
        380,
        finish
      );
    }

    function pick(i: number) {
      if (busy) return;
      if (cur === i) {
        eject();
        return;
      }
      if (cur >= 0) {
        eject(() => insert(i));
      } else {
        insert(i);
      }
    }

    function updateArrows() {
      const over = rack.scrollWidth > rack.clientWidth + 4;
      pvBtn.hidden = !over || rack.scrollLeft < 4;
      nxBtn.hidden =
        !over || rack.scrollLeft + rack.clientWidth >= rack.scrollWidth - 4;
    }

    const onPrevClick = () => {
      rack.scrollBy({ left: -rack.clientWidth * 0.65, behavior: 'smooth' });
    };
    const onNextClick = () => {
      rack.scrollBy({ left: rack.clientWidth * 0.65, behavior: 'smooth' });
    };
    const onRackWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        rack.scrollLeft += e.deltaY;
      }
    };

    const onSearchInput = () => {
      applyFilter();
    };
    const onSearchKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const hit = slots.findIndex(
          (s) => !s.hidden && !s.classList.contains('empty')
        );
        if (hit >= 0) pick(hit);
      } else if (e.key === 'Escape' && qInput.value) {
        e.stopPropagation();
        qInput.value = '';
        applyFilter();
      }
    };

    const onWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy && cur >= 0) {
        if (document.activeElement === qInput && qInput.value) return;
        e.stopPropagation();
        eject();
      }
    };

    const onWindowResize = () => {
      updateArrows();
      fit();
      syncFlyDockPosition();
    };

    const onPageScroll = () => {
      syncFlyDockPosition();
    };

    pvBtn.addEventListener('click', onPrevClick);
    nxBtn.addEventListener('click', onNextClick);
    rack.addEventListener('scroll', updateArrows, { passive: true });
    rack.addEventListener('wheel', onRackWheel, { passive: false });
    qInput.addEventListener('input', onSearchInput);
    qInput.addEventListener('keydown', onSearchKeyDown);
    window.addEventListener('keydown', onWindowKeyDown);
    window.addEventListener('resize', onWindowResize);
    container.addEventListener('scroll', onPageScroll, { passive: true });

    showIdle();
    applyFilter();
    const initRaf = window.requestAnimationFrame(() => {
      updateArrows();
    });

    return () => {
      unmounted = true;
      window.cancelAnimationFrame(initRaf);
      if (activeAnim) {
        activeAnim.cancel();
        activeAnim = null;
      }
      if (fly) {
        fly.remove();
        fly = null;
      }
      if (toastTimer !== null) {
        window.clearTimeout(toastTimer);
      }
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();

      pvBtn.removeEventListener('click', onPrevClick);
      nxBtn.removeEventListener('click', onNextClick);
      rack.removeEventListener('scroll', updateArrows);
      rack.removeEventListener('wheel', onRackWheel);
      qInput.removeEventListener('input', onSearchInput);
      qInput.removeEventListener('keydown', onSearchKeyDown);
      window.removeEventListener('keydown', onWindowKeyDown);
      window.removeEventListener('resize', onWindowResize);
      container.removeEventListener('scroll', onPageScroll);
    };
  }, []);

  return (
    <div id="page-fangame" ref={rootRef} className="fangame-page">
      <SiteHeader
        breadcrumbs={breadcrumbs}
        langLabel={lang}
        onToggleLang={onToggleLang}
      />

      <div className="fg-body">
        <div className="top">
          <h1>Fangame</h1>
        </div>

        <div className="mid">
          <aside className="side">
            <label className="find" aria-label="Tìm kiếm fangame">
              <span className="hud">&gt;</span>
              <input
                id="fg-q"
                type="search"
                placeholder="Tìm tên game..."
                autoComplete="off"
              />
            </label>
            <div className="cnt hud" id="fg-cl">
              &gt; {FANGAME_LIST.length} game trên kệ
            </div>
          </aside>

          <section
            className="reader"
            id="fg-reader"
            aria-label="Máy đọc chip fangame"
          >
            <div className="slot-mouth" aria-hidden="true" />
            <div className="rbar hud">
              <span>MEMORY READER</span>
              <span className="st">
                <span className="led" id="fg-led" />
                <span id="fg-st">CHỜ CHIP</span>
              </span>
            </div>
            <div className="screen" id="fg-screen" aria-live="polite" />
          </section>
        </div>

        <section className="tray" aria-label="Giá chip dữ liệu">
          <div className="rack-wrap">
            <button
              type="button"
              className="ar pv"
              id="fg-pv"
              hidden
              aria-label="Cuộn trái"
            >
              ←
            </button>
            <div className="rack" id="fg-rack" />
            <div className="none hud" id="fg-none" hidden>
              &gt; Không tìm thấy game nào.
            </div>
            <button
              type="button"
              className="ar nx"
              id="fg-nx"
              hidden
              aria-label="Cuộn phải"
            >
              →
            </button>
          </div>
        </section>
      </div>

      <div id="fg-toast" className="hud fg-toast" />
    </div>
  );
};
