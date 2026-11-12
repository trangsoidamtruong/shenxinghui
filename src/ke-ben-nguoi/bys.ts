/* Kể bên người — trang nghe audio kèm script.
   Dữ liệu các đoạn nằm trong /ke-ben-nguoi/tracks.json (xem README.md). */

/* true: đoạn chưa có file âm thanh (src: null) sẽ phát một tiếng nền thử để kiểm tra giao diện.
   Đặt false khi chạy thật: đoạn chưa có file sẽ mờ đi và không bấm được. */
export const DEMO_TONE = true;

export type LocalizedString = string | { vi?: string; en?: string; [k: string]: string | undefined };
export type LocalizedScript =
  | string[]
  | { vi?: string[]; en?: string[]; [k: string]: string[] | undefined };

export interface BysTrack {
  name: LocalizedString;
  desc: LocalizedString;
  dur: number;
  src: string | null;
  bg?: string | null;
  thumb: string | null;
  script: LocalizedScript;
}

export interface MountedBys {
  unmount: () => void;
}

function resolveBysAsset(p: string | null | undefined): string | null {
  if (!p) return null;
  if (
    p.startsWith('/') ||
    p.startsWith('http://') ||
    p.startsWith('https://') ||
    p.startsWith('data:')
  ) {
    return p;
  }
  return '/ke-ben-nguoi/' + p.replace(/^\.?\//, '');
}

export function mountByYourSide(
  root: HTMLElement,
  options?: { onExit?: () => void }
): MountedBys {
  if (!root) {
    return { unmount: () => {} };
  }

  root.innerHTML = `<main class="stage" id="stage">
 <div class="bgw"><img class="bg" id="bgimg" src="/ke-ben-nguoi/assets/byyourside.jpg" alt=""><i class="g tint"></i><i class="g left"></i><i class="g wash"></i><i class="g vig"></i><i class="g pulse" id="pulse"></i><i class="g scan"></i><i class="g noise"></i></div>
 <div class="sweep" id="sweep"></div>
 <div class="wrap ui">
  <section class="panel">
   <div class="lst">
    <div class="lh"><h1 data-ui="title">Kể bên người</h1><input class="srch" id="q" type="text" placeholder="> tìm đoạn..." data-ph="search" autocomplete="off" aria-label="Tìm đoạn" data-al="searchAl"></div>
    <div class="rows" id="rows"></div>
   </div>
   <div class="now">
    <h2 id="ntitle"></h2>
   </div>
  </section>
  <div class="script" id="sbody" aria-label="Script" data-al="scriptBox"></div>
  <div class="dock">
  <section class="bar" id="bar">
   <div class="ctl">
    <button class="ib" id="bprev" type="button" aria-label="Đoạn trước" data-al="prev"><svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg></button>
    <button class="ib big" id="bplay" type="button" aria-label="Phát / dừng" data-al="play"></button>
    <button class="ib" id="bnext" type="button" aria-label="Đoạn sau" data-al="next"><svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg></button>
   </div>
   <div class="seek"><span class="mono" id="tcur">00:00</span><div class="track" id="seek"><i id="fill"></i><b id="knob"></b></div><span class="mono" id="tdur">00:00</span></div>
   <div class="opt"><button class="chip ico" id="bscript" type="button" aria-pressed="false" aria-label="Xem toàn bộ script" data-al="scriptAl" title="Script" data-ti="script"><svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button><button class="chip ico" id="back" type="button" aria-label="Về danh sách" data-al="listAl" title="Danh sách" data-ti="list"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><button class="chip ico" id="brand" type="button" aria-label="Phát ngẫu nhiên đoạn khác" data-al="randAl" title="Phát ngẫu nhiên" data-ti="rand"><svg viewBox="0 0 24 24"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg></button></div>
  </section>
  </div>
 </div>
</main>
<audio id="au" preload="auto" playsinline></audio>`;

  let disposed = false;
  let cleanupInner: (() => void) | null = null;

  fetch('/ke-ben-nguoi/tracks.json', { cache: 'no-cache' })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((d: { tracks: BysTrack[] }) => {
      if (disposed) return;
      cleanupInner = bysStart(root, d.tracks || [], options?.onExit);
    })
    .catch((e) => {
      if (disposed) return;
      const r = root.querySelector<HTMLElement>('#rows');
      if (r) {
        r.innerHTML =
          '<div class="empty">> không tải được tracks.json. Hãy mở trang qua máy chủ (không mở trực tiếp file).</div>';
      }
      console.error(e);
    });

  return {
    unmount: () => {
      disposed = true;
      if (cleanupInner) {
        cleanupInner();
        cleanupInner = null;
      }
    },
  };
}

function bysStart(
  root: HTMLElement,
  TR: BysTrack[],
  onExit?: () => void
): () => void {
  const $ = <T extends HTMLElement = HTMLElement>(s: string): T =>
    root.querySelector(s) as T;
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  const UI: Record<'vi' | 'en', Record<string, string>> = {
    vi: {
      title: 'Kể bên người',
      search: '> tìm đoạn...',
      searchAl: 'Tìm đoạn',
      empty: '> không có đoạn nào khớp.',
      prev: 'Đoạn trước',
      play: 'Phát / dừng',
      next: 'Đoạn sau',
      scriptAl: 'Xem toàn bộ script',
      script: 'Script',
      listAl: 'Về danh sách',
      list: 'Danh sách',
      randAl: 'Phát ngẫu nhiên đoạn khác',
      rand: 'Phát ngẫu nhiên',
      scriptBox: 'Script',
    },
    en: {
      title: 'By your side',
      search: '> search tracks...',
      searchAl: 'Search tracks',
      empty: '> no matching track.',
      prev: 'Previous track',
      play: 'Play / pause',
      next: 'Next track',
      scriptAl: 'Show full script',
      script: 'Script',
      listAl: 'Back to track list',
      list: 'Track list',
      randAl: 'Play a random track',
      rand: 'Shuffle',
      scriptBox: 'Script',
    },
  };

  function lang(): 'vi' | 'en' {
    const raw = (document.documentElement.lang || 'vi').slice(0, 2).toLowerCase();
    return raw === 'en' ? 'en' : 'vi';
  }

  function U(k: string): string {
    const d = UI[lang()] || UI.vi;
    return d[k] !== undefined ? d[k] : UI.vi[k];
  }

  function T(v: LocalizedString): string {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    const l = lang();
    return v[l] || v.vi || v[Object.keys(v)[0]] || '';
  }

  function TScript(v: LocalizedScript): string[] {
    if (v == null) return [];
    if (Array.isArray(v)) return v;
    const l = lang();
    return v[l] || v.vi || v[Object.keys(v)[0]] || [];
  }

  /* ===== danh sách ===== */
  let played: Record<number, number> = {};
  try {
    played = JSON.parse(localStorage.getItem('bys-played') || '{}');
  } catch {
    // ignore
  }

  function fmt(s: number): string {
    const sec = Math.max(0, Math.floor(s));
    return (
      String(Math.floor(sec / 60)).padStart(2, '0') +
      ':' +
      String(sec % 60).padStart(2, '0')
    );
  }

  const rowsEl = $('#rows');
  let rowEls: HTMLButtonElement[] = [];
  const bgImgEl = $<HTMLImageElement>('#bgimg');
  const defaultBgSrc = bgImgEl ? bgImgEl.src : '/ke-ben-nguoi/assets/byyourside.jpg';

  function applyBgFocus(idx: number) {
    // Focal tuning so the character always sits in the bright right area (~70% screen width) on phone/tablet
    const FOCUS: {
      desk: string;
      tab: string;
      mob: string;
      shiftTab: string;
    }[] = [
      // 0: Galactic Harmony (character at x=27%)
      { desk: '36% 22%', tab: '0% 22%', mob: '3% 22%', shiftTab: '-16vw' },
      // 1: Spring Letter (Xavier at x=62%, MC at x=38%)
      { desk: '52% 35%', tab: '50% 34%', mob: '54% 34%', shiftTab: '0px' },
      // 2: Shining Traces (character at x=34%)
      { desk: '42% 24%', tab: '0% 24%', mob: '14% 24%', shiftTab: '-8vw' },
      // 3: Shining Light (character at x=53%)
      { desk: '50% 38%', tab: '32% 38%', mob: '43% 38%', shiftTab: '0px' },
      // 4: Heartfelt Guide (character at x=48%)
      { desk: '48% 28%', tab: '21% 28%', mob: '35% 26%', shiftTab: '0px' },
    ];
    const def = {
      desk: '68% 28%',
      tab: '64% 26%',
      mob: '65% 24%',
      shiftTab: '0px',
    };
    const f = idx >= 0 && idx < FOCUS.length ? FOCUS[idx] : def;
    root.style.setProperty('--bg-pos-desk', f.desk);
    root.style.setProperty('--bg-pos-tab', f.tab);
    root.style.setProperty('--bg-pos-mob', f.mob);
    root.style.setProperty('--bg-shift-tab', f.shiftTab);
  }

  if (bgImgEl) {
    document.documentElement.style.setProperty('--img', 'url("' + defaultBgSrc + '")');
    root.style.setProperty('--img', 'url("' + defaultBgSrc + '")');
    applyBgFocus(-1);
  }

  // Preload per-track background images for smooth transitions
  TR.forEach((t) => {
    const bgUrl = resolveBysAsset(t.bg || t.thumb);
    if (bgUrl) {
      const preloadImg = new Image();
      preloadImg.decoding = 'async';
      preloadImg.src = bgUrl;
    }
  });

  const THUMBS: [number, number, number][] = [
    [27, 22, 100],
    [55, 34, 100],
    [35, 24, 100],
    [53, 38, 100],
    [48, 28, 100],
  ];

  let cur = -1;
  let playing = false;
  let sT = 0;
  let last = 0;
  const auto = true;

  function buildRows(q?: string, focusTrack?: number) {
    rowsEl.innerHTML = '';
    rowEls = [];
    const query = (q || '').toLowerCase();
    let want: HTMLButtonElement | null = null;

    TR.forEach((t, i) => {
      if (
        query &&
        (T(t.name) + ' ' + T(t.desc)).toLowerCase().indexOf(query) < 0 &&
        String(i + 1).indexOf(query) < 0
      ) {
        return;
      }
      const b = document.createElement('button');
      const c = THUMBS[i % THUMBS.length];
      const thumbUrl = resolveBysAsset(t.thumb || t.bg);
      const ts = thumbUrl
        ? "--bi:url('" + thumbUrl + "');--bs:cover;--bp:" + c[0] + '% ' + c[1] + '%'
        : '--bs:' + c[2] + '%;--bp:' + c[0] + '% ' + c[1] + '%';
      b.type = 'button';
      b.className = 'row' + (played[i] ? ' done' : '');
      b.innerHTML =
        '<span class="thw" style="' +
        ts +
        '"><span class="th"><i class="c"></i></span></span><span class="tt"><span class="hd"><span class="no">' +
        String(i + 1).padStart(2, '0') +
        '</span><span class="nm"></span></span></span><span class="du">' +
        (t.dur > 0 ? fmt(t.dur) : '') +
        '</span>';
      const nmEl = b.querySelector('.nm');
      if (nmEl) nmEl.textContent = T(t.name);
      if (!(DEMO_TONE || t.src)) {
        b.disabled = true;
        b.classList.add('soon');
      }
      b.addEventListener('click', () => {
        select(i);
      });
      rowsEl.appendChild(b);
      rowEls.push(b);
      if (i === focusTrack) want = b;
    });

    if (!rowEls.length) {
      const e = document.createElement('div');
      e.className = 'empty';
      e.textContent = U('empty');
      rowsEl.appendChild(e);
    }
    rowsEl.scrollTop = want
      ? Math.max(
          0,
          (want as HTMLButtonElement).offsetTop -
            rowsEl.clientHeight / 2 +
            (want as HTMLButtonElement).offsetHeight / 2
        )
      : 0;
  }

  const onRowsKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const k = Math.max(
      0,
      Math.min(
        rowEls.length - 1,
        rowEls.indexOf(document.activeElement as HTMLButtonElement) +
          (e.key === 'ArrowDown' ? 1 : -1)
      )
    );
    if (rowEls[k]) rowEls[k].focus();
  };
  rowsEl.addEventListener('keydown', onRowsKeyDown);

  const qEl = $<HTMLInputElement>('#q');
  const onQInput = function (this: HTMLInputElement) {
    buildRows(this.value);
  };
  qEl.addEventListener('input', onQInput);

  /* ===== đa ngôn ngữ: đọc <html lang>; khi đổi ngôn ngữ, gọi document.dispatchEvent(new Event('langchange')) ===== */
  function nextPlayable(idx: number, d: number): number {
    const n = TR.length;
    if (!n) return -1;
    let k = 0;
    let i = ((idx % n) + n) % n;
    while (k++ < n && !DEMO_TONE && !TR[i].src) {
      i = (i + d + n) % n;
    }
    return k > n ? -1 : i;
  }

  function applyUI() {
    root.querySelectorAll<HTMLElement>('[data-ui]').forEach((e) => {
      if (e.dataset.ui) e.textContent = U(e.dataset.ui);
    });
    root.querySelectorAll<HTMLInputElement>('[data-ph]').forEach((e) => {
      if (e.dataset.ph) e.placeholder = U(e.dataset.ph);
    });
    root.querySelectorAll<HTMLElement>('[data-al]').forEach((e) => {
      if (e.dataset.al) e.setAttribute('aria-label', U(e.dataset.al));
    });
    root.querySelectorAll<HTMLElement>('[data-ti]').forEach((e) => {
      if (e.dataset.ti) e.title = U(e.dataset.ti);
    });
  }

  const onLangChange = () => {
    applyUI();
    buildRows(qEl.value, cur);
    if (cur >= 0) {
      $('#ntitle').textContent = T(TR[cur].name);
      buildScript();
    }
  };
  document.addEventListener('langchange', onLangChange);
  applyUI();
  buildRows();

  /* ===== âm thanh ===== */
  let AC: AudioContext | null = null;
  let master: GainNode | null = null;
  let an: AnalyserNode | null = null;
  let FD: Uint8Array<ArrayBuffer> | null = null;
  let TD: Uint8Array<ArrayBuffer> | null = null;
  const au = $<HTMLAudioElement>('#au');
  let fileEl = false;
  let synth: AudioScheduledSourceNode[] | null = null;
  const vol = 1.0;

  function ctx(): AudioContext {
    if (!AC) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      AC = new AudioCtx();
      master = AC.createGain();
      master.gain.value = 0;
      an = AC.createAnalyser();
      an.fftSize = 256;
      an.smoothingTimeConstant = 0.7;
      FD = new Uint8Array(new ArrayBuffer(an.frequencyBinCount));
      TD = new Uint8Array(new ArrayBuffer(an.fftSize));
      master.connect(an);
      an.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }

  function synthStart(i: number) {
    const c = ctx();
    if (!master) return;
    const base = [110, 98, 123.5, 87.3][i % 4];
    const g = c.createGain();
    const lfo = c.createOscillator();
    const lg = c.createGain();
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = base;
    o2.type = 'triangle';
    o2.frequency.value = base * 1.5 + 0.6;
    lfo.frequency.value = 0.11 + (i % 5) * 0.012;
    lg.gain.value = 0.3;
    g.gain.value = 0.5;
    lfo.connect(lg);
    lg.connect(g.gain);
    o1.connect(g);
    o2.connect(g);
    g.connect(master);

    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = buf.getChannelData(0);
    let lp = 0;
    for (let k = 0; k < d.length; k++) {
      lp = lp * 0.97 + (Math.random() * 2 - 1) * 0.03;
      d[k] = lp * 7;
    }
    const ns = c.createBufferSource();
    const bp = c.createBiquadFilter();
    const ng = c.createGain();
    const l2 = c.createOscillator();
    const l2g = c.createGain();
    ns.buffer = buf;
    ns.loop = true;
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 0.6;
    ng.gain.value = 0.45;
    l2.frequency.value = 0.2;
    l2g.gain.value = 0.35;
    l2.connect(l2g);
    l2g.connect(ng.gain);
    ns.connect(bp);
    bp.connect(ng);
    ng.connect(master);

    const all: AudioScheduledSourceNode[] = [o1, o2, lfo, ns, l2];
    all.forEach((n) => n.start());
    synth = all;
  }

  function synthStop() {
    if (synth) {
      synth.forEach((n) => {
        try {
          n.stop();
        } catch {
          // ignore
        }
      });
      synth = null;
    }
  }

  function fade(v: number, s: number) {
    if (!AC || !master) return;
    const t = AC.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(v, t + s);
  }

  /* ===== trạng thái phát ===== */
  function curTime(): number {
    return fileEl ? au.currentTime : sT;
  }
  function curDur(): number {
    if (fileEl && isFinite(au.duration) && au.duration > 0) return au.duration;
    return TR[cur].dur > 0 ? TR[cur].dur : 40;
  }
  const IC = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
  };

  const tcurEl = $<HTMLElement>('#tcur');
  const tdurEl = $<HTMLElement>('#tdur');
  const fillEl = $<HTMLElement>('#fill');
  const knobEl = $<HTMLElement>('#knob');
  const pulseEl = $<HTMLElement>('#pulse');
  const stageEl = $<HTMLElement>('#stage');
  const sweepEl = $<HTMLElement>('#sweep');
  const ntitleEl = $<HTMLElement>('#ntitle');
  const bplayEl = $<HTMLButtonElement>('#bplay');

  function setPlaying(p: boolean) {
    playing = p;
    bplayEl.innerHTML = p ? IC.pause : IC.play;
    if (p) {
      last = performance.now();
      if (fileEl) {
        au.muted = false;
        au.volume = 1.0;
        const playPromise = au.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Audio playback error:', err);
          });
        }
      } else {
        fade(vol * 0.7, 0.8);
      }
      ensureRaf();
    } else {
      if (fileEl) au.pause();
      fade(0, 0.3);
    }
  }

  function select(idx: number) {
    let i = idx;
    if (i < 0) i = TR.length-1;
    if (i >= TR.length) i = 0;
    i = nextPlayable(i, cur < 0 || i >= cur ? 1 : -1);
    if (i < 0) return;
    stopAll();
    cur = i;
    fileEl = false;
    sT = 0;
    lastFormattedSec = -1;
    lastPercent = -1;
    const trackBg = resolveBysAsset(TR[i].bg || TR[i].thumb) || defaultBgSrc;
    if (bgImgEl && bgImgEl.src !== trackBg) {
      bgImgEl.src = trackBg;
    }
    document.documentElement.style.setProperty('--img', 'url("' + trackBg + '")');
    root.style.setProperty('--img', 'url("' + trackBg + '")');
    applyBgFocus(i);
    stageEl.classList.add('play');
    sweepEl.classList.remove('go');
    void sweepEl.offsetWidth;
    sweepEl.classList.add('go');
    ntitleEl.textContent = T(TR[i].name);
    buildScript();
    setBarH();
    tdurEl.textContent = fmt(curDur());
    const resolvedSrc = resolveBysAsset(TR[i].src);
    if (resolvedSrc) {
      fileEl = true;
      synthStop();
      au.src = resolvedSrc;
      au.muted = false;
      au.volume = 1.0;
      attachFile();
    } else {
      fileEl = false;
      au.pause();
      synthStart(i);
    }
    setPlaying(true);
  }

  function stopAll() {
    synthStop();
    if (fileEl) {
      au.pause();
    }
    playing = false;
    fade(0, 0.2);
    if (!isScrubbing) {
      window.cancelAnimationFrame(rafId);
      isRafRunning = false;
    }
  }

  function back() {
    stopAll();
    const lc = cur;
    cur = -1;
    if (bgImgEl && bgImgEl.src !== defaultBgSrc) {
      bgImgEl.src = defaultBgSrc;
    }
    document.documentElement.style.setProperty('--img', 'url("' + defaultBgSrc + '")');
    root.style.setProperty('--img', 'url("' + defaultBgSrc + '")');
    applyBgFocus(-1);
    stageEl.classList.remove('play');
    buildRows(qEl.value, lc);
  }

  function markPlayed() {
    if (cur >= 0 && !played[cur]) {
      played[cur] = 1;
      try {
        localStorage.setItem('bys-played', JSON.stringify(played));
      } catch {
        // ignore
      }
    }
  }

  function attachFile() {
    // Native HTML5 audio playback ensures sound is clear, never silenced by CORS, and plays at 100% volume
    if (au) {
      au.muted = false;
      au.volume = 1.0;
    }
  }

  function onEnd() {
    markPlayed();
    if (auto) select(cur + 1);
    else setPlaying(false);
  }

  const onAudioEnded = () => onEnd();
  const onAudioError = () => {
    console.warn('Không tải được file âm thanh:', au.src);
    setPlaying(false);
  };
  au.addEventListener('ended', onAudioEnded);
  au.addEventListener('error', onAudioError);

  /* ===== vòng lặp ===== */
  let amp = 0;
  let rafId = 0;
  let isRafRunning = false;
  let lastFormattedSec = -1;
  let lastPercent = -1;

  function ensureRaf() {
    if (!isRafRunning) {
      isRafRunning = true;
      last = performance.now();
      rafId = window.requestAnimationFrame(frame);
    }
  }

  function frame(now: number) {
    if (cur >= 0) {
      const d = curDur();
      if (playing && !fileEl) {
        sT += (now - last) / 1000;
        if (sT >= d) {
          sT = d;
          onEnd();
        }
      }
      last = now;
      if (cur >= 0) {
        if (!isScrubbing) {
          const t = curTime();
          const durNow = curDur();
          const sec = Math.floor(t);
          if (sec !== lastFormattedSec) {
            lastFormattedSec = sec;
            tcurEl.textContent = fmt(t);
          }
          const p = durNow ? Math.min(1, t / durNow) : 0;
          if (Math.abs(p - lastPercent) > 0.0008) {
            lastPercent = p;
            const pctStr = (p * 100).toFixed(2) + '%';
            fillEl.style.width = pctStr;
            knobEl.style.left = pctStr;
          }
        }
        if (curTime() > 8) markPlayed();
        if (AC && an && FD && TD && playing && !fileEl) {
          an.getByteFrequencyData(FD);
          an.getByteTimeDomainData(TD);
          let sum = 0;
          for (let v = 0; v < TD.length; v++) {
            const x = (TD[v] - 128) / 128;
            sum += x * x;
          }
          amp = Math.min(1, Math.sqrt(sum / TD.length) * 5);
        } else if (fileEl && playing) {
          amp = 0.25 + 0.1 * Math.sin(now / 500);
        } else {
          amp *= 0.88;
        }
        pulseEl.style.opacity = String(reduce ? 0 : (0.18 + amp * 0.6) * (playing ? 1 : 0));
      }
    }
    if (playing || isScrubbing || amp > 0.01) {
      rafId = window.requestAnimationFrame(frame);
    } else {
      isRafRunning = false;
    }
  }

  /* ===== script nằm bên trái, không khung ===== */
  const sbody = $('#sbody');
  function buildScript() {
    sbody.innerHTML = '';
    const descText = T(TR[cur].desc);
    if (descText) {
      const descBlock = document.createElement('div');
      descBlock.className = 'desc-lead';
      descBlock.textContent = descText;
      sbody.appendChild(descBlock);
    }
    TScript(TR[cur].script).forEach((t) => {
      const p = document.createElement('p');
      p.textContent = t;
      sbody.appendChild(p);
    });
    sbody.scrollTop = 0;
  }

  function setBarH() {
    const uiEl = $('.ui');
    const barEl = $('#bar');
    if (uiEl && barEl) {
      uiEl.style.setProperty('--barh', barEl.offsetHeight + 'px');
    }
  }

  function showScript(o: boolean) {
    $('#stage').classList.toggle('noscript', !o);
    $('#bscript').classList.toggle('on', o);
    $('#bscript').setAttribute('aria-pressed', String(o));
  }

  $('#bscript').addEventListener('click', () => {
    showScript($('#stage').classList.contains('noscript'));
  });
  window.addEventListener('resize', setBarH);
  showScript(true);
  setBarH();

  /* ===== điều khiển ===== */
  $('#bplay').innerHTML = IC.play;
  $('#bplay').addEventListener('click', () => {
    if (cur < 0) return;
    if (!playing && !fileEl && sT >= curDur()) sT = 0;
    setPlaying(!playing);
  });
  $('#bprev').addEventListener('click', () => {
    if (curTime() > 4) {
      seekTo(0);
    } else {
      select(cur - 1);
    }
  });
  $('#bnext').addEventListener('click', () => {
    select(cur + 1);
  });
  $('#back').addEventListener('click', back);
  $('#brand').addEventListener('click', () => {
    const pl = TR.map((_, i) => i).filter(
      (i) => i !== cur && (DEMO_TONE || TR[i].src)
    );
    if (pl.length) {
      select(pl[Math.floor(Math.random() * pl.length)]);
    }
  });

  let isScrubbing = false;

  function seekTo(t: number) {
    if (cur < 0) return;
    const dur = curDur();
    const clamped = Math.max(0, Math.min(dur, t));
    if (fileEl) {
      try {
        au.currentTime = clamped;
      } catch (err) {
        console.warn('Error setting currentTime:', err);
      }
      au.muted = false;
      au.volume = 1.0;
      if (playing && au.paused) {
        au.play().catch(() => {});
      }
    } else {
      sT = clamped;
    }
    const p = dur > 0 ? clamped / dur : 0;
    const pctStr = (p * 100).toFixed(2) + '%';
    fillEl.style.width = pctStr;
    knobEl.style.left = pctStr;
    tcurEl.textContent = fmt(clamped);
    lastPercent = p;
    lastFormattedSec = Math.floor(clamped);
  }

  const seekEl = $('#seek');

  function getTimeFromPointer(e: PointerEvent): number {
    const r = seekEl.getBoundingClientRect();
    if (!r.width) return 0;
    const fraction = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    return fraction * curDur();
  }

  function updateScrubVisual(t: number) {
    const dur = curDur();
    const clamped = Math.max(0, Math.min(dur, t));
    const p = dur > 0 ? clamped / dur : 0;
    const pctStr = (p * 100).toFixed(2) + '%';
    fillEl.style.width = pctStr;
    knobEl.style.left = pctStr;
    tcurEl.textContent = fmt(clamped);
    lastPercent = p;
    lastFormattedSec = Math.floor(clamped);
  }

  const onPointerDown = (e: PointerEvent) => {
    if (cur < 0) return;
    isScrubbing = true;
    seekEl.classList.add('scrubbing');
    try {
      seekEl.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const t = getTimeFromPointer(e);
    updateScrubVisual(t);
    seekTo(t);
    ensureRaf();
  };

  let lastScrubSeek = 0;
  const onPointerMove = (e: PointerEvent) => {
    if (!isScrubbing) return;
    const t = getTimeFromPointer(e);
    updateScrubVisual(t);
    const now = performance.now();
    if (fileEl) {
      if (now - lastScrubSeek > 75) {
        lastScrubSeek = now;
        try {
          au.currentTime = t;
        } catch {
          // ignore
        }
      }
    } else {
      sT = t;
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isScrubbing) return;
    isScrubbing = false;
    seekEl.classList.remove('scrubbing');
    try {
      seekEl.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const t = getTimeFromPointer(e);
    seekTo(t);
  };

  seekEl.addEventListener('pointerdown', onPointerDown);
  seekEl.addEventListener('pointermove', onPointerMove);
  seekEl.addEventListener('pointerup', onPointerUp);
  seekEl.addEventListener('pointercancel', onPointerUp);

  const onWindowKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLInputElement | null;
    if (target && target.tagName === 'INPUT' && target.type !== 'range') return;
    if (e.key === 'Escape') {
      if (cur >= 0) {
        e.stopPropagation();
        e.preventDefault();
        back();
      } else if (onExit) {
        e.stopPropagation();
        e.preventDefault();
        onExit();
      }
      return;
    }
    if (cur < 0) return;
    if (e.key === ' ') {
      e.preventDefault();
      $('#bplay').click();
    } else if (e.key === 'ArrowRight') {
      seekTo(curTime() + 5);
    } else if (e.key === 'ArrowLeft') {
      seekTo(curTime() - 5);
    }
  };
  window.addEventListener('keydown', onWindowKeyDown, { capture: true });

  return () => {
    window.cancelAnimationFrame(rafId);
    window.removeEventListener('resize', setBarH);
    window.removeEventListener('keydown', onWindowKeyDown, { capture: true });
    document.removeEventListener('langchange', onLangChange);
    rowsEl.removeEventListener('keydown', onRowsKeyDown);
    qEl.removeEventListener('input', onQInput);
    seekEl.removeEventListener('pointerdown', onPointerDown);
    seekEl.removeEventListener('pointermove', onPointerMove);
    seekEl.removeEventListener('pointerup', onPointerUp);
    seekEl.removeEventListener('pointercancel', onPointerUp);
    au.removeEventListener('ended', onAudioEnded);
    au.removeEventListener('error', onAudioError);
    stopAll();
    if (AC) {
      AC.close().catch(() => {});
      AC = null;
    }
  };
}
