/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { SiteHeader } from './SiteHeader';

interface GalleryPageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  activeItem?: string | null;
  skipBoot?: boolean;
  onNavigate?: (slug: string) => void;
  onToggleLang?: () => void;
  onSetLang?: (nextLang: 'VI' | 'EN') => void;
  onBackHome: () => void;
}

type TermLang = 'vi' | 'en';

interface ArtItemData {
  p: string[];
  r: Array<Array<[number, string]>>;
}

type ArtDataMap = Record<string, ArtItemData>;

interface FaRecord {
  box: HTMLElement;
  d: ArtItemData;
  w: number;
  h: number;
  ready: boolean;
  on: boolean;
  m: { t0?: number; dir: 'in' | 'out'; o?: number[]; sp?: number } | null;
  S: HTMLCanvasElement | null;
  sm?: boolean;
  ch?: string[];
  ci?: number[][];
  cells?: number[];
  cv?: HTMLCanvasElement;
  cx?: CanvasRenderingContext2D;
}

interface ArchiveEntry {
  r: string;
  d: { vi: string; en: string };
  el?: HTMLAnchorElement;
}

interface MountOptions {
  initialLang: TermLang;
  initialItem?: string | null;
  skipBoot?: boolean;
  onLangChange?: (nextLang: TermLang) => void;
  onBackHome?: () => void;
  onNavigate?: (slug: string, href: string) => void;
}

interface MountedTerminal {
  setLang: (nextLang: TermLang, fromExternal?: boolean) => void;
  selectBySlug: (slug: string | null) => void;
  unmount: () => void;
}

let cachedArtDataPromise: Promise<ArtDataMap | null> | null = null;

export function fetchArtDataLazy(): Promise<ArtDataMap | null> {
  if (!cachedArtDataPromise) {
    cachedArtDataPromise = fetch('/assets/aistudio/trien-lam-artdata.json')
      .then((res) => (res.ok ? (res.json() as Promise<ArtDataMap>) : null))
      .catch(() => null);
  }
  return cachedArtDataPromise;
}

function mountExhibitionTerminal(
  container: HTMLElement,
  options: MountOptions
): MountedTerminal {
  const $ = function <T extends HTMLElement = HTMLElement>(s: string): T {
    return container.querySelector(s) as T;
  };

  let unmounted = false;
  const activeTimeouts = new Set<number>();
  const activeIntervals = new Set<number>();

  function setTrackedTimeout(fn: () => void, ms: number): number {
    const id = window.setTimeout(function () {
      activeTimeouts.delete(id);
      if (!unmounted) fn();
    }, ms);
    activeTimeouts.add(id);
    return id;
  }

  function setTrackedInterval(fn: () => void, ms: number): number {
    const id = window.setInterval(function () {
      if (!unmounted) fn();
    }, ms);
    activeIntervals.add(id);
    return id;
  }

  function clearTrackedInterval(id: number | undefined) {
    if (id !== undefined) {
      window.clearInterval(id);
      activeIntervals.delete(id);
    }
  }

  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const canHover = window.matchMedia('(hover:hover)').matches;
  const COLS = 56;
  const ROWS = 28;
  const OW = 46;
  const OH = 22;
  const RAMP = ' .,:;-=+*#%@';
  const NOISE = '#%@*+=-:.01/\\';

  function blank(w?: number, h?: number): string[][] {
    const width = w || OW;
    const height = h || OH;
    const a: string[][] = [];
    for (let j = 0; j < height; j++) a.push(new Array(width).fill(' '));
    return a;
  }

  function put(c: string[][], x: number, y: number, ch: string) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    if (ry >= 0 && ry < c.length && rx >= 0 && rx < c[0].length) c[ry][rx] = ch;
  }

  function str(c: string[][], x: number, y: number, s: string) {
    for (let i = 0; i < s.length; i++) if (s[i] !== ' ') put(c, x + i, y, s[i]);
  }

  function box(
    c: string[][],
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    h: string,
    v: string,
    k: string
  ) {
    for (let x = x0 + 1; x < x1; x++) {
      put(c, x, y0, h);
      put(c, x, y1, h);
    }
    for (let y = y0 + 1; y < y1; y++) {
      put(c, x0, y, v);
      put(c, x1, y, v);
    }
    put(c, x0, y0, k);
    put(c, x1, y0, k);
    put(c, x0, y1, k);
    put(c, x1, y1, k);
  }

  function ell(
    c: string[][],
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    ch: string
  ) {
    for (let a = 0; a < 6.29; a += 0.04)
      put(c, cx + rx * Math.cos(a), cy + ry * Math.sin(a), ch);
  }

  function fil(
    c: string[][],
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    ch: string
  ) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) put(c, x, y, ch);
      }
  }

  // Giữ tham chiếu các hàm tiện ích vẽ gốc
  void str;
  void box;
  void ell;
  void fil;

  // mặt trăng ASCII xoay
  const LX = -0.55;
  const LY = -0.3;
  const LZ = 0.78;
  function moon(t: number): string[][] {
    const c = blank(COLS, ROWS);
    const R = ROWS - 1;
    const spin = t * 0.22;
    let i: number;
    let j: number;
    for (i = 0; i < 22; i++) {
      const sx = (i * 37 + 11) % COLS;
      const sy = (i * 53 + 7) % ROWS;
      const dx = sx + 0.5 - COLS / 2;
      const dy = (sy + 0.5 - ROWS / 2) * 2;
      if (Math.sqrt(dx * dx + dy * dy) > R + 2)
        c[sy][sx] = Math.sin(t * 1.5 + i * 2.1) > 0.2 ? '+' : '.';
    }
    for (j = 0; j < ROWS; j++)
      for (i = 0; i < COLS; i++) {
        const X = (i + 0.5 - COLS / 2) / R;
        const Y = ((j + 0.5 - ROWS / 2) * 2) / R;
        const r2 = X * X + Y * Y;
        if (r2 > 1) continue;
        const Z = Math.sqrt(1 - r2);
        const d = X * LX + Y * LY + Z * LZ;
        const lon = Math.atan2(X, Z) + spin;
        const lat = Math.asin(Y);
        const tx =
          Math.sin(lon * 3 + 1) * Math.cos(lat * 2.5) +
          0.6 * Math.sin(lon * 7 + lat * 5) +
          0.4 * Math.sin(lon * 13 - lat * 3);
        const b =
          Math.max(0, d) * (0.78 - 0.22 * Math.max(0, Math.min(1, tx))) + 0.05;
        let ch = RAMP[Math.min(RAMP.length - 1, Math.floor(b * RAMP.length * 1.05))];
        if (ch === ' ' && r2 > 0.86) ch = '.';
        c[j][i] = ch;
      }
    return c;
  }

  function bf(): string[][] {
    return blank(COLS, ROWS);
  }

  const F: Record<string, (t: number) => string[][]> = {
    moon: moon,
    fanart: bf,
    fangame: bf,
    fanfic: bf,
    'official-art': bf,
    soundtracks: bf,
    'profile-design': bf,
  };

  const I: ArchiveEntry[] = [
    { r: 'fanart', d: { vi: 'Tranh vẽ của người hâm mộ.', en: 'Artwork drawn by fans.' } },
    { r: 'fangame', d: { vi: 'Những trò chơi do người hâm mộ làm.', en: 'Games made by fans.' } },
    {
      r: 'fanfic',
      d: {
        vi: 'Truyện do người hâm mộ sáng tác.',
        en: 'Stories written by fans.',
      },
    },
    { r: 'official-art', d: { vi: 'Tranh ảnh chính thức từ nhà phát hành game.', en: 'Official artwork from the game.' } },
    {
      r: 'soundtracks',
      d: {
        vi: 'Âm thanh, nhạc nền từ game.',
        en: 'Soundtrack from the game.',
      },
    },
    { r: 'profile-design', d: { vi: 'Thiết kế thẻ hồ sơ.', en: 'Profile card designs.' } },
  ];

  const S = {
    vi: {
      c: ['TRĂNG SOI DẶM TRƯỜNG', 'TRIỂN LÃM'],
      idle: 'Chọn một mục bằng ↑ ↓ (Enter để mở).',
      hint: '↑↓ chọn · Enter mở · Esc quay lại',
      tog: '[ màu / đơn sắc ]',
      capM: '// lõi mặt trăng · đang quay',
      capO: '// bản dựng: ',
      nf: ': không tìm thấy lệnh. gõ help để xem danh sách.',
      use: 'cách dùng: open <tên>   vd: open fanfic',
      done: 'đã kết nối /%.html',
      help: [
        'help           xem danh sách lệnh',
        'ls             liệt kê /archive',
        'open <tên>      mở một trang (hoặc: cd)',
        'cat <tên>       xem chi tiết',
        'moon            quay về mặt trăng',
        'clear           xóa màn hình',
        'lang vi|en     đổi ngôn ngữ',
      ],
      who: 'khách@moonstride',
      sudo: 'đừng thử nữa. quyền truy cập đã đủ.',
    },
    en: {
      c: ['MOONSTRIDE', 'GALLERY'],
      idle: 'Pick an entry with ↑ ↓ (Enter to open).',
      hint: '↑↓ select · Enter open · Esc back',
      tog: '[ color / mono ]',
      capM: '// lunar core · rotating',
      capO: '// render: ',
      nf: ': command not found. type help for the list.',
      use: 'usage: open <name>   e.g. open fanfic',
      done: 'connected /%.html',
      help: [
        'help           list commands',
        'ls             list /archive',
        'open <name>    open a page (or: cd)',
        'cat <name>     show details',
        'moon           back to the moon',
        'clear          clear the screen',
        'lang vi|en     switch language',
      ],
      who: 'visitor@moonstride',
      sudo: 'nice try. access is already enough.',
    },
  };

  let lang: TermLang = options.initialLang;
  let sel: number | null = null;
  let busy = false;
  let ready = false;
  let dt: number | undefined;
  let inView = true;

  // vẽ + chuyển hình
  const pre = $('#pre');
  const capEl = $('#cap');
  const descEl = $('#desc');
  const out = $('#out');
  const cli = $('#cli');
  const list = $('#list');
  const termEl = $<HTMLElement>('.term');
  const headerEl = $<HTMLElement>('.site-header');

  let mode = 'moon';
  let morph: { t0: number; from: string[]; d: number[] } | null = null;
  let last: string[] = [];
  let lastT = 0;
  let rafId: number | null = null;

  const AR: Record<string, FaRecord> = {};
  const faMono = false;
  const CW = 9;
  const CH = 15;
  let atlas: HTMLCanvasElement | null = null;

  function setMode(m: string) {
    if (m === mode) return;
    const d: number[] = [];
    for (let k = 0; k < COLS * ROWS; k++) d.push(Math.random() * 420);
    morph = { t0: performance.now(), from: last, d: d };
    const pm = mode;
    mode = m;
    pre.classList.toggle('obj', m !== 'moon');
    faSet(pm, m);
    cap();
  }

  function cap() {
    const D = S[lang];
    capEl.textContent = mode === 'moon' ? D.capM : '';
    capEl.hidden = mode !== 'moon';
  }

  function draw(now: number) {
    rafId = null;
    if (unmounted || document.hidden || !inView) return;

    if (now - lastT > 32) {
      lastT = now;
      const g = (F[mode] || bf)(reduce ? 0 : now / 1000);
      const m = morph;
      const outRows: string[] = [];
      for (let j = 0; j < ROWS; j++) {
        let row = '';
        for (let i = 0; i < COLS; i++) {
          let ch = g[j][i];
          if (m && m.from && m.from[j]) {
            const el = now - m.t0 - m.d[j * COLS + i];
            if (el < 0) ch = m.from[j][i];
            else if (el < 150 && (ch !== ' ' || m.from[j][i] !== ' '))
              ch = NOISE[(Math.random() * NOISE.length) | 0];
          }
          row += ch;
        }
        outRows.push(row);
      }
      if (m && now - m.t0 > 620) morph = null;
      last = outRows;
      pre.textContent = outRows.join('\n');
      faTick(now);
    }
    scheduleDraw();
  }

  function scheduleDraw() {
    if (unmounted || document.hidden || !inView || rafId !== null) return;
    rafId = window.requestAnimationFrame(draw);
  }

  function stopDraw() {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  (function initBootNoise() {
    const f: string[] = [];
    for (let j = 0; j < ROWS; j++) {
      let r = '';
      for (let i = 0; i < COLS; i++)
        r += Math.random() < 0.3 ? NOISE[(Math.random() * NOISE.length) | 0] : ' ';
      f.push(r);
    }
    last = f;
    const d: number[] = [];
    for (let k = 0; k < COLS * ROWS; k++) d.push(Math.random() * 700);
    morph = { t0: performance.now(), from: f, d: d };
  })();

  // (3e) Đợi font IBM Plex Mono trước khi dựng atlas canvas
  function atl(): HTMLCanvasElement {
    if (atlas) return atlas;
    atlas = document.createElement('canvas');
    atlas.width = NOISE.length * CW;
    atlas.height = CH;
    const c = atlas.getContext('2d')!;
    c.font = '400 ' + CH + 'px "IBM Plex Mono",monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#CFB1F1';
    for (let i = 0; i < NOISE.length; i++)
      c.fillText(NOISE[i], i * CW + CW / 2, CH / 2 + 1);
    return atlas;
  }

  function faInit(a: FaRecord) {
    if (a.ready) return;
    const chs: string[] = [];
    const ci: number[][] = [];
    const cells: number[] = [];
    a.d.r.forEach(function (row) {
      if (!Array.isArray(row)) return;
      let s = '';
      const cs: number[] = [];
      row.forEach(function (u) {
        for (let q = 0; q < u[1].length; q++) {
          s += u[1][q];
          cs.push(u[0]);
        }
      });
      chs.push(s);
      ci.push(cs);
    });
    for (let j = 0; j < a.h; j++)
      for (let i = 0; i < (chs[j] ? chs[j].length : 0); i++)
        if (chs[j][i] !== ' ') cells.push(j * a.w + i);
    a.ch = chs;
    a.ci = ci;
    a.cells = cells;
    a.cv = document.createElement('canvas');
    a.cv.width = a.w * CW;
    a.cv.height = a.h * CH;
    a.cx = a.cv.getContext('2d')!;
    a.box.appendChild(a.cv);
    a.ready = true;
  }

  function faBuildS(a: FaRecord) {
    const S_cv = a.S || (a.S = document.createElement('canvas'));
    const by: Record<string, number[]> = {};
    S_cv.width = a.w * CW;
    S_cv.height = a.h * CH;
    const c = S_cv.getContext('2d')!;
    c.font = '400 ' + CH + 'px "IBM Plex Mono",monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const cells = a.cells || [];
    const ci = a.ci || [];
    const ch = a.ch || [];
    for (let k = 0; k < cells.length; k++) {
      const idx = cells[k];
      const j = (idx / a.w) | 0;
      const i = idx % a.w;
      const key = String(faMono ? -2 : ci[j][i]);
      (by[key] || (by[key] = [])).push(idx);
    }
    for (const key in by) {
      c.fillStyle =
        key === '-2'
          ? '#F2E6C4'
          : key === '-1'
          ? '#ECE8F5'
          : a.d.p[Number(key)] || '#ECE8F5';
      by[key].forEach(function (id) {
        const jj = (id / a.w) | 0;
        const ii = id % a.w;
        c.fillText(ch[jj][ii], ii * CW + CW / 2, jj * CH + CH / 2 + 1);
      });
    }
    a.sm = faMono;
  }

  function cellFinal(a: FaRecord, id: number) {
    if (!a.cx || !a.S) return;
    const x = (id % a.w) * CW;
    const y = ((id / a.w) | 0) * CH;
    a.cx.clearRect(x, y, CW, CH);
    a.cx.drawImage(a.S, x, y, CW, CH, x, y, CW, CH);
  }

  function cellNoise(a: FaRecord, id: number) {
    if (!a.cx) return;
    const x = (id % a.w) * CW;
    const y = ((id / a.w) | 0) * CH;
    a.cx.clearRect(x, y, CW, CH);
    a.cx.drawImage(
      atl(),
      ((Math.random() * NOISE.length) | 0) * CW,
      0,
      CW,
      CH,
      x,
      y,
      CW,
      CH
    );
  }

  function cellClear(a: FaRecord, id: number) {
    if (!a.cx) return;
    a.cx.clearRect((id % a.w) * CW, ((id / a.w) | 0) * CH, CW, CH);
  }

  function faFinish(a: FaRecord) {
    if (!a.cx || !a.cv) return;
    const dir = a.m ? a.m.dir : a.on ? 'in' : 'out';
    a.cx.clearRect(0, 0, a.cv.width, a.cv.height);
    a.m = null;
    if (dir === 'in') {
      if (!a.S || a.sm !== faMono) faBuildS(a);
      if (a.S) a.cx.drawImage(a.S, 0, 0);
      a.on = true;
    } else {
      a.on = false;
      a.S = null;
    }
  }

  function faStart(a: FaRecord, dir: 'in' | 'out') {
    faInit(a);
    if (!a.S || a.sm !== faMono) faBuildS(a);
    const o = (a.cells || []).slice();
    const n = o.length;
    for (let k = n - 1; k > 0; k--) {
      const r = (Math.random() * (k + 1)) | 0;
      const t = o[k];
      o[k] = o[r];
      o[r] = t;
    }
    a.m = { t0: performance.now(), dir: dir, o: o, sp: 0 };
    if (a.cx && a.cv) {
      a.cx.clearRect(0, 0, a.cv.width, a.cv.height);
      if (dir === 'out' && a.S) a.cx.drawImage(a.S, 0, 0);
    }
  }

  function faStep(a: FaRecord, now: number) {
    const m = a.m;
    if (!m || !m.o || m.t0 === undefined || m.sp === undefined) return;
    const n = m.o.length;
    const el = now - m.t0;
    const st = Math.min(n, Math.max(0, Math.floor((el / 420) * n)));
    const sp = Math.min(n, Math.max(0, Math.floor(((el - 150) / 420) * n)));
    if (m.dir === 'in') {
      for (let k = m.sp; k < sp; k++) cellFinal(a, m.o[k]);
    } else {
      for (let k = m.sp; k < sp; k++) cellClear(a, m.o[k]);
    }
    for (let k = sp; k < st; k++) cellNoise(a, m.o[k]);
    m.sp = sp;
    if (el > 580) {
      m.dir === 'in' ? faFinishIn(a) : faFinishOut(a);
    }
  }

  function faFinishIn(a: FaRecord) {
    a.m = { dir: 'in' };
    faFinish(a);
  }

  function faFinishOut(a: FaRecord) {
    a.m = { dir: 'out' };
    faFinish(a);
  }

  function faSet(pm: string, m: string) {
    const a = AR[pm];
    const b = AR[m];
    for (const k in AR) {
      if (k !== pm && k !== m && AR[k].m) {
        AR[k].m = { dir: 'out' };
        faFinish(AR[k]);
      }
    }
    if (a && (a.on || a.m)) {
      if (a.m && a.m.dir === 'in') faFinishIn(a);
      faStart(a, 'out');
    }
    if (b) faStart(b, 'in');
  }

  function faTick(now: number) {
    for (const k in AR) {
      const a = AR[k];
      if (a.m) faStep(a, now);
    }
  }

  function faAll() {
    for (const k in AR) {
      const a = AR[k];
      if (a.ready && a.on && !a.m && a.cx && a.cv) {
        faBuildS(a);
        a.cx.clearRect(0, 0, a.cv.width, a.cv.height);
        if (a.S) a.cx.drawImage(a.S, 0, 0);
      } else if (a.S && a.sm !== faMono) {
        faBuildS(a);
      }
    }
  }

  // (3e) + (3h): Đợi font IBM Plex Mono và lazy-fetch artdata ~200KB không chặn hiển thị ban đầu
  const fontReadyPromise =
    typeof document !== 'undefined' && document.fonts && document.fonts.load
      ? document.fonts.load('400 15px "IBM Plex Mono"').catch(function () {})
      : Promise.resolve();

  Promise.all([fontReadyPromise, fetchArtDataLazy()]).then(function (results) {
    if (unmounted) return;
    const DATA = results[1];
    atlas = null; // đảm bảo atlas dựng bằng IBM Plex Mono đã tải xong
    if (!DATA) return;

    container.querySelectorAll<HTMLElement>('.fa').forEach(function (boxEl) {
      const key = boxEl.dataset.k;
      if (!key || !DATA[key]) return;
      const d = DATA[key];
      let w = 0;
      const validRows = d.r.filter(Array.isArray);
      validRows.forEach(function (row) {
        let L = 0;
        row.forEach(function (u) {
          L += u[1].length;
        });
        if (L > w) w = L;
      });
      boxEl.style.setProperty('--w', String(w));
      boxEl.style.setProperty('--h', String(validRows.length));
      AR[key] = {
        box: boxEl,
        d: { p: d.p, r: validRows },
        w: w,
        h: validRows.length,
        ready: false,
        on: false,
        m: null,
        S: null,
      };
    });

    if (mode !== 'moon' && AR[mode]) {
      faStart(AR[mode], 'in');
    }
  });

  // (3d) Danh sách: dùng <a class="it" href="..."> giữ nguyên style, hỗ trợ Ctrl/Cmd+Click mở tab mới
  I.forEach(function (o, i) {
    const li = document.createElement('li');
    const b = document.createElement('a');
    b.className = 'it';
    b.href = '/' + o.r + '.html';
    b.innerHTML =
      '<span class="ix">' +
      String(i + 1).padStart(2, '0') +
      '</span><span class="nm">' +
      o.r +
      '/</span><span class="rt">→ /' +
      o.r +
      '.html</span>';
    b.addEventListener('mouseenter', function () {
      if (ready && canHover) select(i);
    });
    b.addEventListener('focus', function () {
      if (ready) select(i);
    });
    b.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      e.preventDefault();
      if (!ready) return;
      if (canHover || sel === i) openItem(i);
      else select(i);
    });
    li.appendChild(b);
    list.appendChild(li);
    o.el = b;
  });

  function typeInto(el: HTMLElement, txt: string) {
    clearTrackedInterval(dt);
    let n = 0;
    if (reduce) {
      el.textContent = txt;
      return;
    }
    el.textContent = '';
    dt = setTrackedInterval(function () {
      n++;
      el.textContent = txt.slice(0, n);
      if (n >= txt.length) clearTrackedInterval(dt);
    }, 14);
  }

  function select(i: number | null) {
    sel = i;
    I.forEach(function (o, k) {
      if (o.el) o.el.classList.toggle('on', k === i);
    });
    setMode(i === null ? 'moon' : I[i].r);
    typeInto(descEl, i === null ? S[lang].idle : I[i].d[lang]);
  }

  function say(t: string, cls?: string): HTMLDivElement {
    const d = document.createElement('div');
    d.className = 'ln' + (cls ? ' ' + cls : '');
    d.textContent = t;
    out.appendChild(d);
    cli.scrollTop = cli.scrollHeight;
    return d;
  }

  function resolve(a?: string): number {
    if (!a) return -1;
    const clean = a.toLowerCase().replace(/^\/|\/$/g, '');
    if (/^\d+$/.test(clean)) {
      const n = +clean - 1;
      return n >= 0 && n < I.length ? n : -1;
    }
    let ex = -1;
    const pf: number[] = [];
    I.forEach(function (o, k) {
      if (o.r === clean) ex = k;
      else if (o.r.indexOf(clean) === 0) pf.push(k);
    });
    return ex > -1 ? ex : pf.length === 1 ? pf[0] : -1;
  }

  function openItem(i: number) {
    if (busy) return;
    busy = true;
    select(i);
    const o = I[i];
    const ln = say('', 'dim');
    let p = 0;
    const iv = setTrackedInterval(function () {
      p = Math.min(100, p + 8 + Math.random() * 10);
      const n = Math.round(p / 5);
      ln.textContent =
        '> open /' +
        o.r +
        '  [' +
        new Array(n + 1).join('#') +
        new Array(21 - n).join('-') +
        '] ' +
        Math.round(p) +
        '%';
      if (p >= 100) {
        clearTrackedInterval(iv);
        say('✓ ' + S[lang].done.replace('%', o.r), 'ok');
        busy = false;
        if (options.onNavigate) {
          options.onNavigate(o.r, '/' + o.r + '.html');
        }
      }
    }, 70);
  }

  function exec(line: string) {
    const D = S[lang];
    const p = line.trim().split(/\s+/);
    const cmd = (p[0] || '').toLowerCase();
    const a = p[1];
    let i: number;
    const e = document.createElement('div');
    e.className = 'ln';
    e.innerHTML = '<span class="ps">$</span> ';
    e.appendChild(document.createTextNode(line));
    out.appendChild(e);
    if (!cmd) return;
    if (cmd === 'help') D.help.forEach(function (h) { say(h, 'dim'); });
    else if (cmd === 'ls') say(I.map(function (o) { return o.r + '/'; }).join('  '), 'dim');
    else if (cmd === 'open' || cmd === 'cd' || cmd === 'go') {
      i = resolve(a);
      if (i < 0) say(D.use, 'err');
      else openItem(i);
    } else if (cmd === 'cat' || cmd === 'info') {
      i = resolve(a);
      if (i < 0) say(D.use.replace('open', 'cat'), 'err');
      else {
        select(i);
        say(I[i].d[lang], 'ok');
      }
    } else if (cmd === 'moon' || cmd === 'exit' || cmd === '..') {
      select(null);
    } else if (cmd === 'clear') {
      out.innerHTML = '';
    } else if (cmd === 'lang') {
      if (a === 'en' || a === 'vi') setLang(a, false);
      else say('lang vi|en', 'err');
    } else if (cmd === 'whoami') say(D.who, 'dim');
    else if (cmd === 'sudo') say(D.sudo, 'err');
    else say(cmd + D.nf, 'err');
    cli.scrollTop = cli.scrollHeight;
  }

  // (3a) Listener bàn phím toàn cục được cô lập theo focus trong .xt-root và trạng thái hiển thị
  function onWindowKeyDown(e: KeyboardEvent) {
    if (!ready) return;
    const active = document.activeElement;
    const focusInside = !!(active && container.contains(active));
    const isOtherInput =
      !!active &&
      !focusInside &&
      (active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.tagName === 'SELECT' ||
        (active as HTMLElement).isContentEditable);
    if (isOtherInput) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!focusInside && !inView) return;
      e.preventDefault();
      const n = I.length;
      const d = e.key === 'ArrowDown' ? 1 : -1;
      select(sel === null ? (d > 0 ? 0 : n - 1) : (sel + d + n) % n);
    } else if (e.key === 'Enter') {
      if (!focusInside && !inView) return;
      const isFocusedItem = !!(active && (active as HTMLElement).classList?.contains('it'));
      if (!isFocusedItem && sel !== null) {
        e.preventDefault();
        openItem(sel);
      }
    } else if (e.key === 'Escape') {
      if (!focusInside && !inView) return;
      select(null);
    }
  }
  window.addEventListener('keydown', onWindowKeyDown);

  // (3c) Đồng bộ ngôn ngữ hai chiều với web (không ghi đè localStorage hay document.documentElement.lang)
  function setLang(l: TermLang, fromExternal?: boolean) {
    const changed = lang !== l;
    lang = l;
    const D = S[l];
    $('#c0').textContent = D.c[0];
    $('#c1').textContent = D.c[1];
    $('#bl').textContent = l.toUpperCase();
    if (ready) typeInto(descEl, sel === null ? D.idle : I[sel].d[l]);
    cap();
    if (!fromExternal && changed && options.onLangChange) {
      options.onLangChange(l);
    }
  }

  function onLangBtnClick() {
    setLang(lang === 'vi' ? 'en' : 'vi', false);
  }
  $('#bl').addEventListener('click', onLangBtnClick);

  function onCrumbHomeClick() {
    if (options.onBackHome) options.onBackHome();
  }
  function onCrumbHomeKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (options.onBackHome) options.onBackHome();
    }
  }
  $('#c0').addEventListener('click', onCrumbHomeClick);
  $('#c0').addEventListener('keydown', onCrumbHomeKeyDown);

  setLang(lang, true);

  // (3b) Tạm dừng vòng lặp draw khi tab ẩn hoặc .term ra khỏi viewport
  function onVisibilityChange() {
    if (document.hidden) {
      stopDraw();
    } else {
      scheduleDraw();
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  let intersectionObs: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined' && termEl) {
    intersectionObs = new IntersectionObserver(
      function (entries) {
        const entry = entries[0];
        if (!entry) return;
        // Keep drawing if element is in DOM and visible
        inView = entry.isIntersecting || termEl.offsetParent !== null;
        if (inView) scheduleDraw();
        else stopDraw();
      },
      { threshold: 0.01 }
    );
    intersectionObs.observe(termEl);
  }

  // (3g) Đồng bộ chiều cao thực tế của header vào biến --header-h
  let resizeObs: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined' && headerEl) {
    resizeObs = new ResizeObserver(function () {
      const h = headerEl.offsetHeight;
      if (h > 0) {
        container.style.setProperty('--header-h', h + 'px');
      }
    });
    resizeObs.observe(headerEl);
  }

  scheduleDraw();

  function applyInitialOrTargetItem(slug: string | null | undefined) {
    if (!slug) {
      if (sel !== null) select(null);
      return;
    }
    const idx = I.findIndex(function (item) {
      return item.r === slug;
    });
    if (idx >= 0 && sel !== idx) {
      select(idx);
    }
  }

  // khởi động: gõ "ls /archive", danh sách hiện lần lượt (hoặc hiện ngay nếu skipBoot / reducedMotion)
  (function bootSequence() {
    const s = 'ls /archive';
    const el = $('#cmd0');
    const fast = Boolean(reduce || options.skipBoot);

    if (fast) {
      el.textContent = s;
      for (let k = 0; k < I.length; k++) {
        const itemEl = I[k].el;
        if (itemEl) itemEl.classList.add('show');
      }
      ready = true;
      if (options.initialItem) {
        applyInitialOrTargetItem(options.initialItem);
      } else {
        typeInto(descEl, S[lang].idle);
      }
      return;
    }

    let n = 0;
    function t() {
      el.textContent = s.slice(0, n) + (n < s.length ? '▌' : '');
      if (n++ < s.length) {
        setTrackedTimeout(t, 52);
      } else {
        let k = 0;
        (function nx() {
          if (k < I.length) {
            const itemEl = I[k++].el;
            if (itemEl) itemEl.classList.add('show');
            setTrackedTimeout(nx, 70);
          } else {
            ready = true;
            if (options.initialItem) {
              applyInitialOrTargetItem(options.initialItem);
            } else {
              typeInto(descEl, S[lang].idle);
            }
          }
        })();
      }
    }
    setTrackedTimeout(t, 280);
  })();

  function selectBySlug(slug: string | null) {
    if (!ready) {
      options.initialItem = slug;
      return;
    }
    applyInitialOrTargetItem(slug);
  }

  function unmount() {
    unmounted = true;
    stopDraw();
    activeTimeouts.forEach(function (id) {
      window.clearTimeout(id);
    });
    activeTimeouts.clear();
    activeIntervals.forEach(function (id) {
      window.clearInterval(id);
    });
    activeIntervals.clear();
    window.removeEventListener('keydown', onWindowKeyDown);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    $('#bl')?.removeEventListener('click', onLangBtnClick);
    $('#c0')?.removeEventListener('click', onCrumbHomeClick);
    $('#c0')?.removeEventListener('keydown', onCrumbHomeKeyDown);
    if (intersectionObs) {
      intersectionObs.disconnect();
      intersectionObs = null;
    }
    if (resizeObs) {
      resizeObs.disconnect();
      resizeObs = null;
    }
  }

  return {
    setLang,
    selectBySlug,
    unmount,
  };
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  lang,
  activeItem = null,
  skipBoot = false,
  onNavigate,
  onToggleLang,
  onSetLang,
  onBackHome,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<MountedTerminal | null>(null);
  const callbacksRef = useRef({
    onToggleLang,
    onSetLang,
    onBackHome,
    onNavigate,
    lang,
    activeItem,
    skipBoot,
  });

  useEffect(() => {
    callbacksRef.current = {
      onToggleLang,
      onSetLang,
      onBackHome,
      onNavigate,
      lang,
      activeItem,
      skipBoot,
    };
  }, [onToggleLang, onSetLang, onBackHome, onNavigate, lang, activeItem, skipBoot]);

  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;

    const initialTermLang: TermLang = callbacksRef.current.lang === 'EN' ? 'en' : 'vi';

    const instance = mountExhibitionTerminal(container, {
      initialLang: initialTermLang,
      initialItem: callbacksRef.current.activeItem,
      skipBoot: callbacksRef.current.skipBoot,
      onLangChange: (nextTermLang: TermLang) => {
        const targetAppLang = nextTermLang === 'en' ? 'EN' : 'VI';
        if (callbacksRef.current.onSetLang) {
          callbacksRef.current.onSetLang(targetAppLang);
        } else if (
          callbacksRef.current.onToggleLang &&
          callbacksRef.current.lang !== targetAppLang
        ) {
          callbacksRef.current.onToggleLang();
        }
      },
      onBackHome: () => {
        callbacksRef.current.onBackHome();
      },
      onNavigate: (slug: string) => {
        if (callbacksRef.current.onNavigate) {
          callbacksRef.current.onNavigate(`gallery/${slug}`);
        }
      },
    });

    terminalRef.current = instance;

    return () => {
      instance.unmount();
      terminalRef.current = null;
    };
  }, []);

  // Đồng bộ khi ngôn ngữ của web thay đổi từ bên ngoài
  useEffect(() => {
    const instance = terminalRef.current;
    if (!instance) return;
    instance.setLang(lang === 'EN' ? 'en' : 'vi', true);
  }, [lang]);

  // Đồng bộ khi mục con trong Gallery thay đổi qua URL / Back / Forward
  useEffect(() => {
    const instance = terminalRef.current;
    if (!instance) return;
    instance.selectBySlug(activeItem ?? null);
  }, [activeItem]);

  return (
    <div id="page-gallery" ref={rootRef} className="xt-root">
      {/* (3i) Tiêu đề trang ẩn trực quan cho SEO / trình đọc màn hình */}
      <h1 className="sr-only">{lang === 'VI' ? 'Triển lãm' : 'Exhibition'}</h1>

      <SiteHeader
        breadcrumbs={[
          {
            id: 'c0',
            label: lang === 'VI' ? 'TRĂNG SOI DẶM TRƯỜNG' : 'MOONSTRIDE',
            title: lang === 'VI' ? 'Quay về trang chủ' : 'Back to Home',
          },
          {
            id: 'c1',
            label: lang === 'VI' ? 'TRIỂN LÃM' : 'GALLERY',
          },
        ]}
        langButtonId="bl"
        langLabel={lang}
      />

      <main className="wrap">
        <section className="term" aria-label="Terminal">
          <div className="tbar mono">
            <span>moonstride@relay : ~/archive</span>
            <span className="dots" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
          </div>
          <div className="tbody">
            <div className="moonpane">
              <div className="stagew">
                <pre id="pre" aria-hidden="true"></pre>
                <div className="fa" data-k="fanart" aria-hidden="true"></div>
                <div className="fa" data-k="fangame" aria-hidden="true"></div>
                <div className="fa" data-k="soundtracks" aria-hidden="true"></div>
                <div className="fa" data-k="profile-design" aria-hidden="true"></div>
                <div className="fa" data-k="fanfic" aria-hidden="true"></div>
                <div className="fa" data-k="official-art" aria-hidden="true"></div>
              </div>
              <div className="cap mono" id="cap"></div>
            </div>
            <div className="cli" id="cli">
              <div className="ln">
                <span className="ps">
                  moonstride@relay<b>:~$</b>
                </span>{' '}
                <span className="cmd0" id="cmd0"></span>
              </div>
              <ul id="list"></ul>
              <div className="desc" id="desc"></div>
              <div id="out"></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
