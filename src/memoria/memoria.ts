/* MEMORIA – thư mục ký ức. Cần: memoria.css, data/cards.ts và 1 thẻ <div class="memoria"></div>.
   Toàn bộ HTML bên trong được tạo tự động. */

import { MEMORIA_CARDS, type MemoriaCard } from "./data/cards";

export interface MountedMemoria {
  unmount: () => void;
  setLang: (nextLang: "VI" | "EN") => void;
  selectCardById: (cardId: number | null) => void;
}

export interface MemoriaMountOptions {
  skipBoot?: boolean;
  initialCardId?: number | null;
  onSelectCard?: (cardId: number) => void;
  onOpenTranslation?: (cardId: number, url: string) => void;
}

export function mountMemoria(
  root: HTMLElement,
  initialLang: "VI" | "EN" = "VI",
  options: MemoriaMountOptions = {}
): MountedMemoria {
  if (!root) {
    return {
      unmount: () => {},
      setLang: () => {},
      selectCardById: () => {},
    };
  }

  let currentLang: "VI" | "EN" = initialLang;

  root.innerHTML = `<div id="boot"><pre id="log"></pre></div>
<div class="top"><h1>Memoria</h1><div class="sub" id="count"></div></div>
<main>
  <section class="pane" aria-label="Danh sách tệp">
    <div class="tools">
      <input id="q" type="search" placeholder="> tìm tệp..." aria-label="Tìm thẻ ký ức" autocomplete="off">
      <div class="chips" id="chips"></div>
    </div>
    <div id="list" role="listbox" aria-label="Thẻ ký ức"></div>
  </section>
  <section class="pane" id="view" aria-live="polite"></section>
</main>
<div id="toast" class="hud"></div>`;

  const cards: MemoriaCard[] = window.MEMORIA_CARDS || MEMORIA_CARDS || [];
  const N = cards.length;
  const $ = <T extends HTMLElement = HTMLElement>(s: string): T =>
    root.querySelector(s) as T;
  const pad = (n: number) => String(n).padStart(2, "0");

  let filter = "all";
  let term = "";
  let list: MemoriaCard[] = [];
  let cur = 0;

  function optimizeCloudinaryVideoUrl(url: string): string {
    if (!url) return "";
    return url.replace(
      /\/video\/upload\/(v\d+\/)/,
      "/video/upload/f_auto,q_auto,vc_auto,ac_none,w_720/$1"
    );
  }

  function deriveCloudinaryPosterUrl(
    videoUrl: string,
    existingImg?: string
  ): string {
    if (existingImg) return existingImg;
    if (!videoUrl || !videoUrl.includes("/video/upload/")) return "";
    return videoUrl
      .replace(
        /\/video\/upload\/(?:[^/]+\/)?(v\d+\/)/,
        "/video/upload/so_0,f_webp,q_auto,w_720/$1"
      )
      .replace(/\.(mp4|webm|mov)$/i, ".webp");
  }

  // Tải trước ảnh bìa và mồi luồng video cho các thẻ 5★ ngay khi vào trang Memoria
  cards.forEach((c) => {
    const posterUrl = deriveCloudinaryPosterUrl(c.src, c.img);
    if (posterUrl) {
      const img = new Image();
      img.decoding = "async";
      img.src = posterUrl;
    }
    if (c.type === "video" && c.src && typeof document !== "undefined") {
      const vUrl = optimizeCloudinaryVideoUrl(c.src);
      if (!document.head.querySelector(`link[data-vid-preload="${vUrl}"]`)) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "video";
        link.href = vUrl;
        link.crossOrigin = "anonymous";
        link.setAttribute("data-vid-preload", vUrl);
        document.head.appendChild(link);
      }
    }
  });

  function art(c: MemoriaCard): string {
    if (c.src) {
      if (c.type === "video") {
        const vSrc = optimizeCloudinaryVideoUrl(c.src);
        const posterSrc = deriveCloudinaryPosterUrl(c.src, c.img);
        return `<video src="${vSrc}" muted loop playsinline autoplay preload="auto" crossorigin="anonymous" poster="${posterSrc}"></video>`;
      }
      return `<img src="${c.src}" alt="" decoding="async">`;
    }
    if (c.img) return `<img src="${c.img}" alt="" decoding="async">`;
    const h = 258 + ((c.id * 7) % 15),
      mx = 25 + ((c.id * 29) % 50),
      my = 22 + ((c.id * 13) % 25),
      r = 26 + ((c.id * 7) % 16);
    let st = "";
    for (let k = 0; k < 14; k++)
      st += `<circle cx="${(c.id * 53 + k * 71) % 300}" cy="${(c.id * 31 + k * 97) % 400}" r="${(k % 3) * 0.5 + 0.7}" fill="#fff" opacity=".7"/>`;
    return `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="g" cx="50%" cy="30%" r="90%"><stop offset="0" stop-color="hsl(${h},48%,28%)"/><stop offset="1" stop-color="hsl(${h},45%,6%)"/></radialGradient></defs><rect width="300" height="400" fill="url(#g)"/>${st}<circle cx="${mx * 3}" cy="${my * 4}" r="${r}" fill="#e6e2f5" opacity=".92"/><circle cx="${mx * 3 + r * 0.4}" cy="${my * 4 - r * 0.2}" r="${r * 0.92}" fill="hsl(${h},45%,11%)" opacity="${c.done ? 0 : 0.9}"/><path d="M0 330 Q80 300 150 335 T300 320 V400 H0Z" fill="#07060f" opacity=".85"/></svg>`;
  }

  function filtered(): MemoriaCard[] {
    const t = term.trim().toLowerCase();
    return cards.filter(
      (c) =>
        (filter === "all" ||
          (filter === "video" && c.type === "video") ||
          (filter === "image" && c.type === "image") ||
          (filter === "todo" && !c.done)) &&
        (!t ||
          c.title.toLowerCase().includes(t) ||
          (c.titleEn && c.titleEn.toLowerCase().includes(t)) ||
          pad(c.id).includes(t))
    );
  }

  function renderList() {
    list = filtered();
    cur = Math.min(cur, Math.max(list.length - 1, 0));
    $("#list").innerHTML = list.length
      ? list
          .map((c, i) => {
            const rowTitle =
              currentLang === "EN" && c.titleEn ? c.titleEn : c.title;
            return `<div class="row${i === cur ? " on" : ""}" role="option" tabindex="-1" data-i="${i}" aria-selected="${i === cur}"><span class="n">${pad(c.id)}</span><span class="t">${rowTitle}</span><span class="m${c.done ? " d" : ""}" title="${c.done ? "Đã dịch" : "Chưa dịch"}"></span></div>`;
          })
          .join("")
      : `<div class="empty">> Không tìm thấy tệp nào khớp.</div>`;
    $("#count").textContent = `> ${list.length}/${N} tệp hiển thị`;
    renderView();
  }

  function select(i: number, scroll?: boolean, notify = false) {
    if (!list.length) return;
    cur = Math.max(0, Math.min(list.length - 1, i));
    root.querySelectorAll(".row").forEach((r, k) => {
      r.classList.toggle("on", k === cur);
      r.setAttribute("aria-selected", String(k === cur));
    });
    if (scroll !== false) {
      const r = root.querySelector(".row.on");
      if (r) r.scrollIntoView({ block: "nearest" });
    }
    renderView();
    if (notify && options.onSelectCard && list[cur]) {
      options.onSelectCard(list[cur].id);
    }
  }

  function renderView() {
    const c = list[cur];
    const v = $("#view");
    if (!c) {
      v.innerHTML = `<div class="empty">> Chưa chọn tệp nào.</div>`;
      return;
    }
    const primaryTitle =
      currentLang === "EN" && c.titleEn ? c.titleEn : c.title;
    const englishSubLine =
      currentLang === "VI" && c.titleEn && c.titleEn !== primaryTitle
        ? `<div class="en-sub">${c.titleEn}</div>`
        : "";

    v.innerHTML = `<div class="vb"><div class="media"><div class="a">${art(c)}</div><div class="scan"></div></div>
  <div class="txt"><h2>${primaryTitle}</h2>${englishSubLine}
  <dl class="meta"><dt>Trạng thái</dt><dd>${c.done ? "Đã dịch" : "Chưa dịch"}</dd><dt>Độ hiếm</dt><dd>${c.type === "video" ? "5★" : "4★"}</dd></dl>
  <p>${c.desc}</p><button class="go" ${c.done ? "" : "disabled"}>${c.done ? "[ ĐỌC THẺ ]" : "[ CHƯA CÓ BẢN DỊCH ]"}</button></div></div>`;
    const vid = v.querySelector<HTMLVideoElement>("video");
    if (vid) {
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.play().catch(() => {});
    }
    const b = v.querySelector<HTMLButtonElement>(".go");
    if (c.done && b) b.onclick = open;
  }

  function open() {
    const c = list[cur];
    if (c && c.done) {
      const targetUrl = c.url || `/memoria/mem_${pad(c.id)}/dich`;
      if (options.onOpenTranslation) {
        options.onOpenTranslation(c.id, targetUrl);
      } else if (targetUrl) {
        location.assign(targetUrl);
      } else {
        toast("Chưa gắn url cho thẻ này");
      }
    }
  }

  let tt: number | undefined;
  function toast(m: string) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = m;
    t.style.opacity = "1";
    window.clearTimeout(tt);
    tt = window.setTimeout(() => {
      t.style.opacity = "0";
    }, 2200);
  }

  // ---- Điều khiển ----
  const listEl = $("#list");
  const onListClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    const r = target?.closest<HTMLElement>(".row");
    if (r && r.dataset.i !== undefined) {
      select(+r.dataset.i, false, true);
    }
  };
  listEl.addEventListener("click", onListClick);

  const onKeyDown = (e: KeyboardEvent) => {
    if (!root.offsetParent) return;
    const typing = document.activeElement === $("#q");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      select(cur + 1, true, true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      select(cur - 1, true, true);
    } else if (
      e.key === "Enter" &&
      (!typing || list.length) &&
      document.activeElement?.tagName !== "BUTTON"
    ) {
      open();
    }
  };
  window.addEventListener("keydown", onKeyDown);

  const qInput = $<HTMLInputElement>("#q");
  const onSearchInput = (e: Event) => {
    term = (e.target as HTMLInputElement).value;
    cur = 0;
    renderList();
  };
  qInput.addEventListener("input", onSearchInput);

  (
    [
      ["all", "Tất cả"],
      ["video", "5★"],
      ["image", "4★"],
      ["todo", "Chưa dịch"],
    ] as const
  ).forEach(([k, t]) => {
    const b = document.createElement("button");
    b.className = "chip" + (k === "all" ? " on" : "");
    b.textContent = t;
    b.onclick = () => {
      filter = k;
      cur = 0;
      root.querySelectorAll(".chip").forEach((x) => x.classList.toggle("on", x === b));
      renderList();
    };
    $("#chips").appendChild(b);
  });

  // ---- Mở đầu: log khởi động (một lần) ----
  renderList();

  if (options.initialCardId) {
    const idx = list.findIndex((c) => c.id === options.initialCardId);
    if (idx >= 0) {
      select(idx, true, false);
    }
  }

  let bootRemoveTimeout: number | undefined;
  let tick: number | undefined;

  if (options.skipBoot || options.initialCardId) {
    const b = $("#boot");
    if (b) b.remove();
    renderView();
  } else {
    const lines = [
      "> KẾT NỐI KHO KÝ ỨC... OK",
      "> QUÉT THƯ MỤC /memoria... OK",
      "> TÌM THẤY " + N + " TỆP",
    ];
    let li = 0;
    const lg = $("#log");
    tick = window.setInterval(() => {
      if (li < lines.length) {
        lg.textContent += lines[li++] + "\n";
      } else {
        window.clearInterval(tick);
        const b = $("#boot");
        if (b) {
          b.style.opacity = "0";
          bootRemoveTimeout = window.setTimeout(() => {
            b.remove();
            renderView();
          }, 600);
        }
      }
    }, 380);
  }

  return {
    unmount: () => {
      window.removeEventListener("keydown", onKeyDown);
      listEl.removeEventListener("click", onListClick);
      qInput.removeEventListener("input", onSearchInput);
      if (tick !== undefined) window.clearInterval(tick);
      if (bootRemoveTimeout !== undefined) window.clearTimeout(bootRemoveTimeout);
      if (tt !== undefined) window.clearTimeout(tt);
    },
    setLang: (nextLang: "VI" | "EN") => {
      if (currentLang === nextLang) return;
      currentLang = nextLang;
      renderList();
    },
    selectCardById: (cardId: number | null) => {
      if (!cardId) return;
      const idx = list.findIndex((c) => c.id === cardId);
      if (idx >= 0 && idx !== cur) {
        select(idx, true, false);
      }
    },
  };
}
