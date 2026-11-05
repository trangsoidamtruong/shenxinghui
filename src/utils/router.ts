import type { MenuActionId } from '../components/GameModals';
import {
  CONTACT_APPS,
  resolveLocalizedText,
  type ContactAppId,
} from '../data/contactData';
import { FANFIC_LIST } from '../data/fanficData';
import { MEMORIA_CARDS } from '../memoria/data/cards';

export type DatingSubTabId =
  | 'BY YOUR SIDE'
  | 'FALLING FOR YOU'
  | 'ANECDOTES'
  | 'JOURNAL'
  | 'PLAYTIME'
  | 'PHOTO STUDIO';

export type MainPageId =
  | 'home'
  | 'dating'
  | 'events'
  | 'gallery'
  | 'contact'
  | 'fanfic'
  | 'fangame'
  | 'memoria-dich';

export interface RouteConfigEntry {
  /** Canonical slug (lowercase, no accents, no spaces, '/' for hierarchy) */
  slug: string;
  /** HTML container id (prefixed with 'page-' or 'view-' so browser never auto-scrolls on hash change) */
  domId: string;
  /** Which top-level page container to render */
  page: MainPageId;
  /** Optional modal to display when page === 'home' */
  modal?: Exclude<MenuActionId, null>;
  /** Sub-tab in DatingPage */
  datingSubTab?: DatingSubTabId;
  /** Specific card ID in DatingPage ('anec-1', 'bys-1', etc.) */
  datingCardId?: string;
  /** Whether Memoria sub-page inside DatingPage is open */
  memoriaOpen?: boolean;
  /** Specific Memoria card ID (1..6) */
  memoriaCardId?: number;
  /** Selected year in EventsPage ('2024' | '2025' | '2026') */
  eventsYear?: '2024' | '2025' | '2026';
  /** Selected clickable event ID in EventsPage (e.g. '2026-18') */
  eventsItemId?: string;
  /** Selected archive item in GalleryPage (e.g. 'fanart') */
  galleryItem?: string;
  /** Selected app in ContactPage ('public-account' | 'sns' | 'message' | 'video-call' | 'phone-call') */
  contactApp?: ContactAppId;
  /** Selected item ID in ContactPage (e.g. 'pub-01', 'sns-01') */
  contactItemId?: string;
  /** Selected story slug in FanficPage (e.g. 'fanfic/dem-trang') */
  fanficStorySlug?: string;
  /** Nearest logical parent slug (null for 'home') */
  parentSlug: string | null;
  /**
   * Whether entering this route triggers a transition/loading effect.
   * Easy to toggle per-route without modifying router logic.
   */
  hasTransition: boolean;
  /** Duration (ms) of the cyber transition lock when hasTransition === true */
  transitionDurationMs: number;
  /** Vietnamese document title segment */
  titleVI: string;
  /** English document title segment */
  titleEN: string;
}

export const SITE_TITLE_VI = 'Trăng Soi Dặm Trường';
export const SITE_TITLE_EN = 'Moonstride';

/**
 * Master Slug Configuration Table (`SLUG_MAP`)
 * - All slugs are lowercase, ASCII, no spaces.
 * - `domId` always uses `page-*` or `view-*` prefix to prevent native browser anchor scrolling.
 * - `hasTransition` controls whether the route plays its transition effect on menu click / direct entry.
 */
export const SLUG_MAP: Record<string, RouteConfigEntry> = {
  // ── 00. TRANG CHỦ ──────────────────────────────────────────────────────────
  home: {
    slug: 'home',
    domId: 'page-home',
    page: 'home',
    parentSlug: null,
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: SITE_TITLE_VI,
    titleEN: SITE_TITLE_EN,
  },

  // ── 01-03 & 07-09. CÁC MỤC TRÊN TRANG CHỦ / TRANG RIÊNG ────────────────────
  profile: {
    slug: 'profile',
    domId: 'page-modal-profile',
    page: 'home',
    modal: 'home',
    parentSlug: 'home',
    hasTransition: true,
    transitionDurationMs: 360,
    titleVI: `Hồ sơ | ${SITE_TITLE_VI}`,
    titleEN: `Profile | ${SITE_TITLE_EN}`,
  },
  combat: {
    slug: 'combat',
    domId: 'page-modal-combat',
    page: 'home',
    modal: 'combat',
    parentSlug: 'home',
    hasTransition: true,
    transitionDurationMs: 360,
    titleVI: `Chiến đấu | ${SITE_TITLE_VI}`,
    titleEN: `Battle | ${SITE_TITLE_EN}`,
  },
  story: {
    slug: 'story',
    domId: 'page-modal-story',
    page: 'home',
    modal: 'story',
    parentSlug: 'home',
    hasTransition: true,
    transitionDurationMs: 360,
    titleVI: `Cốt truyện | ${SITE_TITLE_VI}`,
    titleEN: `Storyline | ${SITE_TITLE_EN}`,
  },
  contact: {
    slug: 'contact',
    domId: 'page-contact',
    page: 'contact',
    parentSlug: 'home',
    hasTransition: true,
    transitionDurationMs: 360,
    titleVI: `Liên lạc | ${SITE_TITLE_VI}`,
    titleEN: `Contact | ${SITE_TITLE_EN}`,
  },
  interact: {
    slug: 'interact',
    domId: 'page-modal-interact',
    page: 'home',
    modal: 'interact',
    parentSlug: 'home',
    hasTransition: true,
    transitionDurationMs: 360,
    titleVI: `Tương tác | ${SITE_TITLE_VI}`,
    titleEN: `Interactions | ${SITE_TITLE_EN}`,
  },
  about: {
    slug: 'about',
    domId: 'page-modal-about',
    page: 'home',
    modal: 'about',
    parentSlug: 'home',
    hasTransition: true,
    transitionDurationMs: 360,
    titleVI: `Giới thiệu | ${SITE_TITLE_VI}`,
    titleEN: `About | ${SITE_TITLE_EN}`,
  },

  // ── 04. HẸN HÒ (DATING) & CÁC TAB CON / GIAI THOẠI ────────────────────────
  dating: {
    slug: 'dating',
    domId: 'page-dating',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    parentSlug: 'home',
    hasTransition: true,
    transitionDurationMs: 380,
    titleVI: `Hẹn hò | ${SITE_TITLE_VI}`,
    titleEN: `Dating | ${SITE_TITLE_EN}`,
  },

  // Tab 1: Kề bên người (By Your Side)
  'dating/by-your-side': {
    slug: 'dating/by-your-side',
    domId: 'page-dating-by-your-side',
    page: 'dating',
    datingSubTab: 'BY YOUR SIDE',
    parentSlug: 'dating',
    hasTransition: true,
    transitionDurationMs: 280,
    titleVI: `Kề bên người · Hẹn hò | ${SITE_TITLE_VI}`,
    titleEN: `By Your Side · Dating | ${SITE_TITLE_EN}`,
  },
  'dating/by-your-side/bys1': {
    slug: 'dating/by-your-side/bys1',
    domId: 'view-dating-bys1',
    page: 'dating',
    datingSubTab: 'BY YOUR SIDE',
    datingCardId: 'bys-1',
    parentSlug: 'dating/by-your-side',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Thầm Kín · Kề bên người | ${SITE_TITLE_VI}`,
    titleEN: `Secret Times · By Your Side | ${SITE_TITLE_EN}`,
  },
  'dating/by-your-side/bys2': {
    slug: 'dating/by-your-side/bys2',
    domId: 'view-dating-bys2',
    page: 'dating',
    datingSubTab: 'BY YOUR SIDE',
    datingCardId: 'bys-2',
    parentSlug: 'dating/by-your-side',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Dịu Dàng · Kề bên người | ${SITE_TITLE_VI}`,
    titleEN: `Tender Moments · By Your Side | ${SITE_TITLE_EN}`,
  },

  // Tab 2: Ước hẹn rung động (Falling For You) & Memoria
  'dating/falling-for-you': {
    slug: 'dating/falling-for-you',
    domId: 'page-dating-falling-for-you',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    parentSlug: 'dating',
    hasTransition: true,
    transitionDurationMs: 280,
    titleVI: `Ước hẹn rung động · Hẹn hò | ${SITE_TITLE_VI}`,
    titleEN: `Falling For You · Dating | ${SITE_TITLE_EN}`,
  },
  'dating/falling-for-you/ffy1': {
    slug: 'dating/falling-for-you/ffy1',
    domId: 'view-dating-ffy1',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    datingCardId: 'ffy-1',
    parentSlug: 'dating/falling-for-you',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Gắn Kết · Ước hẹn rung động | ${SITE_TITLE_VI}`,
    titleEN: `Bond · Falling For You | ${SITE_TITLE_EN}`,
  },
  'dating/falling-for-you/memoria': {
    slug: 'dating/falling-for-you/memoria',
    domId: 'page-dating-memoria',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    memoriaOpen: true,
    parentSlug: 'dating/falling-for-you',
    hasTransition: true,
    transitionDurationMs: 360,
    titleVI: `Memoria · Hẹn hò | ${SITE_TITLE_VI}`,
    titleEN: `Memoria · Dating | ${SITE_TITLE_EN}`,
  },
  'dating/falling-for-you/memoria/mem1': {
    slug: 'dating/falling-for-you/memoria/mem1',
    domId: 'view-memoria-1',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    memoriaOpen: true,
    memoriaCardId: 1,
    parentSlug: 'dating/falling-for-you/memoria',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Beachside Victory · Memoria | ${SITE_TITLE_VI}`,
    titleEN: `Beachside Victory · Memoria | ${SITE_TITLE_EN}`,
  },
  'dating/falling-for-you/memoria/mem2': {
    slug: 'dating/falling-for-you/memoria/mem2',
    domId: 'view-memoria-2',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    memoriaOpen: true,
    memoriaCardId: 2,
    parentSlug: 'dating/falling-for-you/memoria',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Firelit Embrace · Memoria | ${SITE_TITLE_VI}`,
    titleEN: `Firelit Embrace · Memoria | ${SITE_TITLE_EN}`,
  },
  'dating/falling-for-you/memoria/mem3': {
    slug: 'dating/falling-for-you/memoria/mem3',
    domId: 'view-memoria-3',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    memoriaOpen: true,
    memoriaCardId: 3,
    parentSlug: 'dating/falling-for-you/memoria',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Horizon's Pulse · Memoria | ${SITE_TITLE_VI}`,
    titleEN: `Horizon's Pulse · Memoria | ${SITE_TITLE_EN}`,
  },
  'dating/falling-for-you/memoria/mem4': {
    slug: 'dating/falling-for-you/memoria/mem4',
    domId: 'view-memoria-4',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    memoriaOpen: true,
    memoriaCardId: 4,
    parentSlug: 'dating/falling-for-you/memoria',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Moments Refined · Memoria | ${SITE_TITLE_VI}`,
    titleEN: `Moments Refined · Memoria | ${SITE_TITLE_EN}`,
  },
  'dating/falling-for-you/memoria/mem5': {
    slug: 'dating/falling-for-you/memoria/mem5',
    domId: 'view-memoria-5',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    memoriaOpen: true,
    memoriaCardId: 5,
    parentSlug: 'dating/falling-for-you/memoria',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Nocturnal Hunt · Memoria | ${SITE_TITLE_VI}`,
    titleEN: `Nocturnal Hunt · Memoria | ${SITE_TITLE_EN}`,
  },
  'dating/falling-for-you/memoria/mem6': {
    slug: 'dating/falling-for-you/memoria/mem6',
    domId: 'view-memoria-6',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    memoriaOpen: true,
    memoriaCardId: 6,
    parentSlug: 'dating/falling-for-you/memoria',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Twofold Heartbeat · Memoria | ${SITE_TITLE_VI}`,
    titleEN: `Twofold Heartbeat · Memoria | ${SITE_TITLE_EN}`,
  },
  'dating/falling-for-you/ffy3': {
    slug: 'dating/falling-for-you/ffy3',
    domId: 'view-dating-ffy3',
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    datingCardId: 'ffy-3',
    parentSlug: 'dating/falling-for-you',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Thần Thoại · Ước hẹn rung động | ${SITE_TITLE_VI}`,
    titleEN: `Myth · Falling For You | ${SITE_TITLE_EN}`,
  },

  // Tab 3: Giai thoại (Anecdotes) & 4 Giai thoại con (hasTransition: false)
  'dating/anecdotes': {
    slug: 'dating/anecdotes',
    domId: 'page-dating-anecdotes',
    page: 'dating',
    datingSubTab: 'ANECDOTES',
    parentSlug: 'dating',
    hasTransition: true,
    transitionDurationMs: 280,
    titleVI: `Giai thoại · Hẹn hò | ${SITE_TITLE_VI}`,
    titleEN: `Anecdotes · Dating | ${SITE_TITLE_EN}`,
  },
  'dating/anecdotes/anec1': {
    slug: 'dating/anecdotes/anec1',
    domId: 'view-dating-anec1',
    page: 'dating',
    datingSubTab: 'ANECDOTES',
    datingCardId: 'anec-1',
    parentSlug: 'dating',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Kỳ Nghỉ Đặc Biệt · Giai thoại | ${SITE_TITLE_VI}`,
    titleEN: `Exceptional Vacation · Anecdotes | ${SITE_TITLE_EN}`,
  },
  'dating/anecdotes/anec2': {
    slug: 'dating/anecdotes/anec2',
    domId: 'view-dating-anec2',
    page: 'dating',
    datingSubTab: 'ANECDOTES',
    datingCardId: 'anec-2',
    parentSlug: 'dating',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Thoáng Qua · Giai thoại | ${SITE_TITLE_VI}`,
    titleEN: `A Fleeting Glimpse · Anecdotes | ${SITE_TITLE_EN}`,
  },
  'dating/anecdotes/anec3': {
    slug: 'dating/anecdotes/anec3',
    domId: 'view-dating-anec3',
    page: 'dating',
    datingSubTab: 'ANECDOTES',
    datingCardId: 'anec-3',
    parentSlug: 'dating',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Khi Sao Băng Rơi · Giai thoại | ${SITE_TITLE_VI}`,
    titleEN: `When Shooting Stars Fall · Anecdotes | ${SITE_TITLE_EN}`,
  },
  'dating/anecdotes/anec4': {
    slug: 'dating/anecdotes/anec4',
    domId: 'view-dating-anec4',
    page: 'dating',
    datingSubTab: 'ANECDOTES',
    datingCardId: 'anec-4',
    parentSlug: 'dating',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Tiếng Vọng từ Tàn Tích · Giai thoại | ${SITE_TITLE_VI}`,
    titleEN: `Echoes from Ruins · Anecdotes | ${SITE_TITLE_EN}`,
  },

  // Tab 4: Sổ tay (Journal)
  'dating/journal': {
    slug: 'dating/journal',
    domId: 'page-dating-journal',
    page: 'dating',
    datingSubTab: 'JOURNAL',
    parentSlug: 'dating',
    hasTransition: true,
    transitionDurationMs: 280,
    titleVI: `Sổ tay · Hẹn hò | ${SITE_TITLE_VI}`,
    titleEN: `Journal · Dating | ${SITE_TITLE_EN}`,
  },
  'dating/journal/jn1': {
    slug: 'dating/journal/jn1',
    domId: 'view-dating-jn1',
    page: 'dating',
    datingSubTab: 'JOURNAL',
    datingCardId: 'jn-1',
    parentSlug: 'dating/journal',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Chủ Đề Dấu Ấn · Sổ tay | ${SITE_TITLE_VI}`,
    titleEN: `Stamp Theme · Journal | ${SITE_TITLE_EN}`,
  },
  'dating/journal/jn2': {
    slug: 'dating/journal/jn2',
    domId: 'view-dating-jn2',
    page: 'dating',
    datingSubTab: 'JOURNAL',
    datingCardId: 'jn-2',
    parentSlug: 'dating/journal',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Góc DIY · Sổ tay | ${SITE_TITLE_VI}`,
    titleEN: `Your DIY · Journal | ${SITE_TITLE_EN}`,
  },

  // Tab 5: Dạo chơi (Playtime)
  'dating/playtime': {
    slug: 'dating/playtime',
    domId: 'page-dating-playtime',
    page: 'dating',
    datingSubTab: 'PLAYTIME',
    parentSlug: 'dating',
    hasTransition: true,
    transitionDurationMs: 280,
    titleVI: `Dạo chơi · Hẹn hò | ${SITE_TITLE_VI}`,
    titleEN: `Playtime · Dating | ${SITE_TITLE_EN}`,
  },
  'dating/playtime/pt1': {
    slug: 'dating/playtime/pt1',
    domId: 'view-dating-pt1',
    page: 'dating',
    datingSubTab: 'PLAYTIME',
    datingCardId: 'pt-1',
    parentSlug: 'dating/playtime',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Máy Gắp Thú · Dạo chơi | ${SITE_TITLE_VI}`,
    titleEN: `Claw Machine · Playtime | ${SITE_TITLE_EN}`,
  },
  'dating/playtime/pt2': {
    slug: 'dating/playtime/pt2',
    domId: 'view-dating-pt2',
    page: 'dating',
    datingSubTab: 'PLAYTIME',
    datingCardId: 'pt-2',
    parentSlug: 'dating/playtime',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Bài Mèo · Dạo chơi | ${SITE_TITLE_VI}`,
    titleEN: `Kitty Cards · Playtime | ${SITE_TITLE_EN}`,
  },

  // Tab 6: Chụp ảnh (Photo Studio)
  'dating/photo-studio': {
    slug: 'dating/photo-studio',
    domId: 'page-dating-photo-studio',
    page: 'dating',
    datingSubTab: 'PHOTO STUDIO',
    parentSlug: 'dating',
    hasTransition: true,
    transitionDurationMs: 280,
    titleVI: `Chụp ảnh · Hẹn hò | ${SITE_TITLE_VI}`,
    titleEN: `Photo Studio · Dating | ${SITE_TITLE_EN}`,
  },
  'dating/photo-studio/ps1': {
    slug: 'dating/photo-studio/ps1',
    domId: 'view-dating-ps1',
    page: 'dating',
    datingSubTab: 'PHOTO STUDIO',
    datingCardId: 'ps-1',
    parentSlug: 'dating/photo-studio',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Buồng Chụp Liên Hoàn · Chụp ảnh | ${SITE_TITLE_VI}`,
    titleEN: `Snapshot · Photo Studio | ${SITE_TITLE_EN}`,
  },
  'dating/photo-studio/ps2': {
    slug: 'dating/photo-studio/ps2',
    domId: 'view-dating-ps2',
    page: 'dating',
    datingSubTab: 'PHOTO STUDIO',
    datingCardId: 'ps-2',
    parentSlug: 'dating/photo-studio',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Ánh Nhìn Rung Động · Chụp ảnh | ${SITE_TITLE_VI}`,
    titleEN: `Glint Photobooth · Photo Studio | ${SITE_TITLE_EN}`,
  },
  'dating/photo-studio/ps3': {
    slug: 'dating/photo-studio/ps3',
    domId: 'view-dating-ps3',
    page: 'dating',
    datingSubTab: 'PHOTO STUDIO',
    datingCardId: 'ps-3',
    parentSlug: 'dating/photo-studio',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Khoảnh Khắc AR · Chụp ảnh | ${SITE_TITLE_VI}`,
    titleEN: `AR Snapshot · Photo Studio | ${SITE_TITLE_EN}`,
  },
  'dating/photo-studio/ps4': {
    slug: 'dating/photo-studio/ps4',
    domId: 'view-dating-ps4',
    page: 'dating',
    datingSubTab: 'PHOTO STUDIO',
    datingCardId: 'ps-4',
    parentSlug: 'dating/photo-studio',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Nhật Ký Chân Dung · Chụp ảnh | ${SITE_TITLE_VI}`,
    titleEN: `Portrait Log · Photo Studio | ${SITE_TITLE_EN}`,
  },

  // ── 05. TRIỂN LÃM (GALLERY / EXHIBITION) ───────────────────────────────────
  gallery: {
    slug: 'gallery',
    domId: 'page-gallery',
    page: 'gallery',
    parentSlug: 'home',
    hasTransition: true,
    transitionDurationMs: 420,
    titleVI: `Triển lãm | ${SITE_TITLE_VI}`,
    titleEN: `Gallery | ${SITE_TITLE_EN}`,
  },
  'gallery/fanart': {
    slug: 'gallery/fanart',
    domId: 'view-gallery-fanart',
    page: 'gallery',
    galleryItem: 'fanart',
    parentSlug: 'gallery',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Fanart · Triển lãm | ${SITE_TITLE_VI}`,
    titleEN: `Fanart · Gallery | ${SITE_TITLE_EN}`,
  },
  'gallery/fangame': {
    slug: 'gallery/fangame',
    domId: 'page-fangame',
    page: 'fangame',
    parentSlug: 'gallery',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Fangame · Triển lãm | ${SITE_TITLE_VI}`,
    titleEN: `Fangame · Gallery | ${SITE_TITLE_EN}`,
  },
  'gallery/fanfic': {
    slug: 'gallery/fanfic',
    domId: 'page-fanfic',
    page: 'fanfic',
    parentSlug: 'gallery',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Fanfic · Triển lãm | ${SITE_TITLE_VI}`,
    titleEN: `Fanfic · Gallery | ${SITE_TITLE_EN}`,
  },
  'gallery/official-art': {
    slug: 'gallery/official-art',
    domId: 'view-gallery-official-art',
    page: 'gallery',
    galleryItem: 'official-art',
    parentSlug: 'gallery',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Official Art · Triển lãm | ${SITE_TITLE_VI}`,
    titleEN: `Official Art · Gallery | ${SITE_TITLE_EN}`,
  },
  'gallery/soundtracks': {
    slug: 'gallery/soundtracks',
    domId: 'view-gallery-soundtracks',
    page: 'gallery',
    galleryItem: 'soundtracks',
    parentSlug: 'gallery',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Soundtracks · Triển lãm | ${SITE_TITLE_VI}`,
    titleEN: `Soundtracks · Gallery | ${SITE_TITLE_EN}`,
  },
  'gallery/profile-design': {
    slug: 'gallery/profile-design',
    domId: 'view-gallery-profile-design',
    page: 'gallery',
    galleryItem: 'profile-design',
    parentSlug: 'gallery',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Profile Design · Triển lãm | ${SITE_TITLE_VI}`,
    titleEN: `Profile Design · Gallery | ${SITE_TITLE_EN}`,
  },

  // ── 06. SỰ KIỆN (EVENTS) & CÁC NĂM 2024 / 2025 / 2026 ─────────────────────
  events: {
    slug: 'events',
    domId: 'page-events',
    page: 'events',
    parentSlug: 'home',
    hasTransition: true,
    transitionDurationMs: 420,
    titleVI: `Sự kiện | ${SITE_TITLE_VI}`,
    titleEN: `Events | ${SITE_TITLE_EN}`,
  },
  'events/2024': {
    slug: 'events/2024',
    domId: 'page-events-2024',
    page: 'events',
    eventsYear: '2024',
    parentSlug: 'events',
    hasTransition: true,
    transitionDurationMs: 1500,
    titleVI: `Sự kiện 2024 | ${SITE_TITLE_VI}`,
    titleEN: `Events 2024 | ${SITE_TITLE_EN}`,
  },
  'events/2025': {
    slug: 'events/2025',
    domId: 'page-events-2025',
    page: 'events',
    eventsYear: '2025',
    parentSlug: 'events',
    hasTransition: true,
    transitionDurationMs: 1500,
    titleVI: `Sự kiện 2025 | ${SITE_TITLE_VI}`,
    titleEN: `Events 2025 | ${SITE_TITLE_EN}`,
  },
  'events/2026': {
    slug: 'events/2026',
    domId: 'page-events-2026',
    page: 'events',
    eventsYear: '2026',
    parentSlug: 'events',
    hasTransition: true,
    transitionDurationMs: 1500,
    titleVI: `Sự kiện 2026 | ${SITE_TITLE_VI}`,
    titleEN: `Events 2026 | ${SITE_TITLE_EN}`,
  },
  'events/2026/2026-18': {
    slug: 'events/2026/2026-18',
    domId: 'view-events-2026-18',
    page: 'events',
    eventsYear: '2026',
    eventsItemId: '2026-18',
    parentSlug: 'events/2026',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `Tình Là Thật · Sự kiện 2026 | ${SITE_TITLE_VI}`,
    titleEN: `Love Is Real · Events 2026 | ${SITE_TITLE_EN}`,
  },
};

/**
 * Alias table mapping convenient short/numeric/legacy slugs to canonical slugs in SLUG_MAP.
 * Ensures both `#dating/anecdotes/anec1` and `#dating/anecdotes/1` (or `#exhibition`) resolve cleanly.
 */
export const SLUG_ALIASES: Record<string, string> = {
  // Exhibition alias -> gallery
  exhibition: 'gallery',
  'exhibition/fanart': 'gallery/fanart',
  'exhibition/fangame': 'gallery/fangame',
  'exhibition/fanfic': 'gallery/fanfic',
  'exhibition/official-art': 'gallery/official-art',
  'exhibition/soundtracks': 'gallery/soundtracks',
  'exhibition/profile-design': 'gallery/profile-design',
  // Direct gallery archive slugs
  fanart: 'gallery/fanart',
  fangame: 'gallery/fangame',
  fanfic: 'gallery/fanfic',
  'official-art': 'gallery/official-art',
  soundtracks: 'gallery/soundtracks',
  'profile-design': 'gallery/profile-design',

  // Memoria aliases
  memoria: 'dating/falling-for-you/memoria',
  'dating/memoria': 'dating/falling-for-you/memoria',
  'dating/falling-for-you/ffy2': 'dating/falling-for-you/memoria',
  'dating/falling-for-you/ffy-2': 'dating/falling-for-you/memoria',
  'dating/falling-for-you/2': 'dating/falling-for-you/memoria',
  'dating/falling-for-you/02': 'dating/falling-for-you/memoria',
  'dating/falling-for-you/memoria/1': 'dating/falling-for-you/memoria/mem1',
  'dating/falling-for-you/memoria/2': 'dating/falling-for-you/memoria/mem2',
  'dating/falling-for-you/memoria/3': 'dating/falling-for-you/memoria/mem3',
  'dating/falling-for-you/memoria/4': 'dating/falling-for-you/memoria/mem4',
  'dating/falling-for-you/memoria/5': 'dating/falling-for-you/memoria/mem5',
  'dating/falling-for-you/memoria/6': 'dating/falling-for-you/memoria/mem6',
  'memoria/1': 'dating/falling-for-you/memoria/mem1',
  'memoria/2': 'dating/falling-for-you/memoria/mem2',
  'memoria/3': 'dating/falling-for-you/memoria/mem3',
  'memoria/4': 'dating/falling-for-you/memoria/mem4',
  'memoria/5': 'dating/falling-for-you/memoria/mem5',
  'memoria/6': 'dating/falling-for-you/memoria/mem6',

  // Anecdotes numeric & hyphenated aliases
  'dating/anecdotes/1': 'dating/anecdotes/anec1',
  'dating/anecdotes/01': 'dating/anecdotes/anec1',
  'dating/anecdotes/anec-1': 'dating/anecdotes/anec1',
  'dating/anecdotes/2': 'dating/anecdotes/anec2',
  'dating/anecdotes/02': 'dating/anecdotes/anec2',
  'dating/anecdotes/anec-2': 'dating/anecdotes/anec2',
  'dating/anecdotes/3': 'dating/anecdotes/anec3',
  'dating/anecdotes/03': 'dating/anecdotes/anec3',
  'dating/anecdotes/anec-3': 'dating/anecdotes/anec3',
  'dating/anecdotes/4': 'dating/anecdotes/anec4',
  'dating/anecdotes/04': 'dating/anecdotes/anec4',
  'dating/anecdotes/anec-4': 'dating/anecdotes/anec4',

  // By Your Side aliases
  'dating/by-your-side/1': 'dating/by-your-side/bys1',
  'dating/by-your-side/01': 'dating/by-your-side/bys1',
  'dating/by-your-side/bys-1': 'dating/by-your-side/bys1',
  'dating/by-your-side/2': 'dating/by-your-side/bys2',
  'dating/by-your-side/02': 'dating/by-your-side/bys2',
  'dating/by-your-side/bys-2': 'dating/by-your-side/bys2',

  // Falling For You aliases
  'dating/falling-for-you/1': 'dating/falling-for-you/ffy1',
  'dating/falling-for-you/01': 'dating/falling-for-you/ffy1',
  'dating/falling-for-you/ffy-1': 'dating/falling-for-you/ffy1',
  'dating/falling-for-you/3': 'dating/falling-for-you/ffy3',
  'dating/falling-for-you/03': 'dating/falling-for-you/ffy3',
  'dating/falling-for-you/ffy-3': 'dating/falling-for-you/ffy3',

  // Journal aliases
  'dating/journal/1': 'dating/journal/jn1',
  'dating/journal/01': 'dating/journal/jn1',
  'dating/journal/jn-1': 'dating/journal/jn1',
  'dating/journal/2': 'dating/journal/jn2',
  'dating/journal/02': 'dating/journal/jn2',
  'dating/journal/jn-2': 'dating/journal/jn2',

  // Playtime aliases
  'dating/playtime/1': 'dating/playtime/pt1',
  'dating/playtime/01': 'dating/playtime/pt1',
  'dating/playtime/pt-1': 'dating/playtime/pt1',
  'dating/playtime/2': 'dating/playtime/pt2',
  'dating/playtime/02': 'dating/playtime/pt2',
  'dating/playtime/pt-2': 'dating/playtime/pt2',

  // Photo Studio aliases
  'dating/photo-studio/1': 'dating/photo-studio/ps1',
  'dating/photo-studio/01': 'dating/photo-studio/ps1',
  'dating/photo-studio/ps-1': 'dating/photo-studio/ps1',
  'dating/photo-studio/2': 'dating/photo-studio/ps2',
  'dating/photo-studio/02': 'dating/photo-studio/ps2',
  'dating/photo-studio/ps-2': 'dating/photo-studio/ps2',
  'dating/photo-studio/3': 'dating/photo-studio/ps3',
  'dating/photo-studio/03': 'dating/photo-studio/ps3',
  'dating/photo-studio/ps-3': 'dating/photo-studio/ps3',
  'dating/photo-studio/4': 'dating/photo-studio/ps4',
  'dating/photo-studio/04': 'dating/photo-studio/ps4',
  'dating/photo-studio/ps-4': 'dating/photo-studio/ps4',

  // Events aliases
  'events/2026/18': 'events/2026/2026-18',

  // Contact app aliases
  'contact/pub': 'contact/public-account',
  'contact/public': 'contact/public-account',
  'contact/msg': 'contact/message',
  'contact/messages': 'contact/message',
  'contact/vid': 'contact/video-call',
  'contact/video': 'contact/video-call',
  'contact/tel': 'contact/phone-call',
  'contact/phone': 'contact/phone-call',

  // Legacy /memoria path aliases
  'memoria/mem-1': 'dating/falling-for-you/memoria/mem1',
  'memoria/mem-2': 'dating/falling-for-you/memoria/mem2',
  'memoria/mem-3': 'dating/falling-for-you/memoria/mem3',
  'memoria/mem-4': 'dating/falling-for-you/memoria/mem4',
  'memoria/mem-5': 'dating/falling-for-you/memoria/mem5',
  'memoria/mem-6': 'dating/falling-for-you/memoria/mem6',
  'memoria/mem1': 'dating/falling-for-you/memoria/mem1',
  'memoria/mem2': 'dating/falling-for-you/memoria/mem2',
  'memoria/mem3': 'dating/falling-for-you/memoria/mem3',
  'memoria/mem4': 'dating/falling-for-you/memoria/mem4',
  'memoria/mem5': 'dating/falling-for-you/memoria/mem5',
  'memoria/mem6': 'dating/falling-for-you/memoria/mem6',
};

// ── 07. LIÊN LẠC (CONTACT): TỰ ĐỘNG TẠO ROUTE 3 TẦNG TỪ DỮ LIỆU ──────────────
CONTACT_APPS.forEach((app) => {
  const appSlug = `contact/${app.id}`;
  SLUG_MAP[appSlug] = {
    slug: appSlug,
    domId: `page-contact-${app.id}`,
    page: 'contact',
    contactApp: app.id,
    parentSlug: 'contact',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `${app.name} · Liên lạc | ${SITE_TITLE_VI}`,
    titleEN: `${app.name} · Contact | ${SITE_TITLE_EN}`,
  };

  app.items.forEach((item, idx) => {
    const itemIdClean = item.id.trim().toLowerCase();
    const itemSlug = `${appSlug}/${itemIdClean}`;
    const titleVI = resolveLocalizedText(item.title, 'VI');
    const titleEN = resolveLocalizedText(item.title, 'EN');

    SLUG_MAP[itemSlug] = {
      slug: itemSlug,
      domId: `view-contact-${app.id}-${itemIdClean}`,
      page: 'contact',
      contactApp: app.id,
      contactItemId: item.id,
      parentSlug: appSlug,
      hasTransition: false,
      transitionDurationMs: 0,
      titleVI: `${titleVI} · ${app.name} | ${SITE_TITLE_VI}`,
      titleEN: `${titleEN} · ${app.name} | ${SITE_TITLE_EN}`,
    };

    // Convenient numeric and un-hyphenated aliases (e.g. /contact/public-account/1, 01, 001, pub01)
    const num1 = String(idx + 1);
    const num2 = num1.padStart(2, '0');
    const num3 = num1.padStart(3, '0');
    const noHyphen = itemIdClean.replace(/-/g, '');
    SLUG_ALIASES[`${appSlug}/${num1}`] = itemSlug;
    SLUG_ALIASES[`${appSlug}/${num2}`] = itemSlug;
    SLUG_ALIASES[`${appSlug}/${num3}`] = itemSlug;
    if (noHyphen !== itemIdClean) {
      SLUG_ALIASES[`${appSlug}/${noHyphen}`] = itemSlug;
    }
  });
});

// ── 08. FANFIC: TỰ ĐỘNG TẠO ROUTE ĐỌC TRUYỆN TỪ DỮ LIỆU FANFIC_LIST ──────────
FANFIC_LIST.forEach((story, idx) => {
  const cleanUrl = story.url.replace(/^[#/]+|[#/]+$/g, '').toLowerCase();
  const leafId = cleanUrl.replace(/^fanfic\//, '') || `truyen-${idx + 1}`;
  const canonicalSlug = `fanfic/${leafId}`;

  SLUG_MAP[canonicalSlug] = {
    slug: canonicalSlug,
    domId: `view-fanfic-${leafId}`,
    page: 'fanfic',
    fanficStorySlug: canonicalSlug,
    parentSlug: 'gallery/fanfic',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `${story.t} · Fanfic | ${SITE_TITLE_VI}`,
    titleEN: `${story.t} · Fanfic | ${SITE_TITLE_EN}`,
  };

  SLUG_ALIASES[`gallery/fanfic/${leafId}`] = canonicalSlug;
  SLUG_ALIASES[`exhibition/fanfic/${leafId}`] = canonicalSlug;
  const num1 = String(idx + 1);
  const num2 = num1.padStart(2, '0');
  SLUG_ALIASES[`fanfic/${num1}`] = canonicalSlug;
  SLUG_ALIASES[`fanfic/${num2}`] = canonicalSlug;
  SLUG_ALIASES[`gallery/fanfic/${num1}`] = canonicalSlug;
  SLUG_ALIASES[`gallery/fanfic/${num2}`] = canonicalSlug;
});

// ── 09. MEMORIA & TRANG BẢN DỊCH (/memoria/mem_XX/dich): TỰ ĐỘNG TẠO TỪ MEMORIA_CARDS ──
MEMORIA_CARDS.forEach((card) => {
  const num1 = String(card.id);
  const num2 = num1.padStart(2, '0');
  const cardSlug = `dating/falling-for-you/memoria/mem${num1}`;

  SLUG_MAP[cardSlug] = {
    slug: cardSlug,
    domId: `view-memoria-${num1}`,
    page: 'dating',
    datingSubTab: 'FALLING FOR YOU',
    memoriaOpen: true,
    memoriaCardId: card.id,
    parentSlug: 'dating/falling-for-you/memoria',
    hasTransition: false,
    transitionDurationMs: 0,
    titleVI: `${card.title} · Memoria | ${SITE_TITLE_VI}`,
    titleEN: `${card.titleEn || card.title} · Memoria | ${SITE_TITLE_EN}`,
  };

  SLUG_ALIASES[`dating/falling-for-you/memoria/${num1}`] = cardSlug;
  SLUG_ALIASES[`dating/falling-for-you/memoria/${num2}`] = cardSlug;
  SLUG_ALIASES[`dating/falling-for-you/memoria/mem_${num2}`] = cardSlug;
  SLUG_ALIASES[`memoria/${num1}`] = cardSlug;
  SLUG_ALIASES[`memoria/${num2}`] = cardSlug;
  SLUG_ALIASES[`memoria/mem-${num1}`] = cardSlug;
  SLUG_ALIASES[`memoria/mem-${num2}`] = cardSlug;
  SLUG_ALIASES[`memoria/mem_${num1}`] = cardSlug;
  SLUG_ALIASES[`memoria/mem_${num2}`] = cardSlug;
  SLUG_ALIASES[`memoria/mem${num1}`] = cardSlug;
  SLUG_ALIASES[`memoria/mem${num2}`] = cardSlug;

  // Route trang bản dịch (/memoria/mem_01/dich) — chỉ mở cho thẻ đã dịch (card.done === true)
  if (card.done) {
    const dichSlug = `memoria/mem_${num2}/dich`;
    SLUG_MAP[dichSlug] = {
      slug: dichSlug,
      domId: `page-memoria-dich-${num2}`,
      page: 'memoria-dich',
      memoriaCardId: card.id,
      parentSlug: cardSlug,
      hasTransition: false,
      transitionDurationMs: 0,
      titleVI: `${card.title} · Bản dịch Memoria | ${SITE_TITLE_VI}`,
      titleEN: `${card.titleEn || card.title} · Memoria Translation | ${SITE_TITLE_EN}`,
    };

    SLUG_ALIASES[`memoria/mem_${num1}/dich`] = dichSlug;
    SLUG_ALIASES[`memoria/mem-${num1}/dich`] = dichSlug;
    SLUG_ALIASES[`memoria/mem-${num2}/dich`] = dichSlug;
    SLUG_ALIASES[`memoria/mem${num1}/dich`] = dichSlug;
    SLUG_ALIASES[`memoria/mem${num2}/dich`] = dichSlug;
    SLUG_ALIASES[`memoria/${num1}/dich`] = dichSlug;
    SLUG_ALIASES[`memoria/${num2}/dich`] = dichSlug;
    SLUG_ALIASES[`dating/falling-for-you/memoria/mem${num1}/dich`] = dichSlug;
    SLUG_ALIASES[`dating/falling-for-you/memoria/mem_${num2}/dich`] = dichSlug;
    SLUG_ALIASES[`dating/falling-for-you/memoria/${num1}/dich`] = dichSlug;
  }
});

export const DATING_SUBTAB_TO_SLUG: Record<DatingSubTabId, string> = {
  'BY YOUR SIDE': 'dating/by-your-side',
  'FALLING FOR YOU': 'dating/falling-for-you',
  ANECDOTES: 'dating/anecdotes',
  JOURNAL: 'dating/journal',
  PLAYTIME: 'dating/playtime',
  'PHOTO STUDIO': 'dating/photo-studio',
};

export const DATING_CARD_ID_TO_SLUG: Record<string, string> = {
  'bys-1': 'dating/by-your-side/bys1',
  'bys-2': 'dating/by-your-side/bys2',
  'ffy-1': 'dating/falling-for-you/ffy1',
  'ffy-2': 'dating/falling-for-you/memoria',
  'ffy-3': 'dating/falling-for-you/ffy3',
  'anec-1': 'dating/anecdotes/anec1',
  'anec-2': 'dating/anecdotes/anec2',
  'anec-3': 'dating/anecdotes/anec3',
  'anec-4': 'dating/anecdotes/anec4',
  'jn-1': 'dating/journal/jn1',
  'jn-2': 'dating/journal/jn2',
  'pt-1': 'dating/playtime/pt1',
  'pt-2': 'dating/playtime/pt2',
  'ps-1': 'dating/photo-studio/ps1',
  'ps-2': 'dating/photo-studio/ps2',
  'ps-3': 'dating/photo-studio/ps3',
  'ps-4': 'dating/photo-studio/ps4',
};

export interface ResolvedHashRoute {
  entry: RouteConfigEntry;
  /** True if the raw slug was invalid, an alias, a legacy #hash, or had an invalid child segment and fell back */
  didFallback: boolean;
  /** Normalized input slug string */
  rawSlug: string;
}

/**
 * Normalizes a raw slug, pathname, or legacy hash string
 * (`"/dating/anecdotes/"` or `"#events/2024"` -> `"dating/anecdotes"` / `"events/2024"`).
 */
export function cleanRawHash(rawInput: string): string {
  if (!rawInput) return '';
  const cleaned = rawInput
    .replace(/^#+/, '')
    .replace(/^\/+|\/+$/g, '')
    .trim()
    .toLowerCase();
  if (cleaned === 'index.html') return '';
  return cleaned;
}

/**
 * Resolves a clean pathname (`location.pathname`), direct slug string, or legacy `location.hash`
 * into a valid `RouteConfigEntry`.
 * - Empty `/` or completely unknown top-level slug -> `SLUG_MAP.home`.
 * - If a child segment is invalid (e.g. `/dating/anecdotes/999` or `/dating/unknown`),
 *   falls back to the nearest valid parent page/route (`/dating`), never leaving a blank page.
 */
const TEMPORARILY_DISABLED_SLUGS = new Set([
  'profile',
  'combat',
  'story',
  'interact',
  'about',
]);

const TEMPORARILY_DISABLED_DATING_CARDS = new Set([
  'dating/by-your-side/bys1',
  'dating/by-your-side/bys2',
  'dating/falling-for-you/ffy1',
  'dating/falling-for-you/ffy3',
  'dating/anecdotes/anec1',
  'dating/anecdotes/anec2',
  'dating/anecdotes/anec3',
  'dating/anecdotes/anec4',
  'dating/journal/jn1',
  'dating/journal/jn2',
  'dating/playtime/pt1',
  'dating/playtime/pt2',
  'dating/photo-studio/ps1',
  'dating/photo-studio/ps2',
  'dating/photo-studio/ps3',
  'dating/photo-studio/ps4',
]);

export function resolveHashRoute(
  rawInput: string,
  pathname = ''
): ResolvedHashRoute {
  const fromLegacyHash = Boolean(rawInput && rawInput.startsWith('#'));
  const cleanedHash = cleanRawHash(rawInput);
  const cleanedPath = cleanRawHash(pathname);
  const cleaned = cleanedHash || cleanedPath;

  if (!cleaned || TEMPORARILY_DISABLED_SLUGS.has(cleaned)) {
    return {
      entry: SLUG_MAP.home,
      didFallback: fromLegacyHash || Boolean(cleaned),
      rawSlug: '',
    };
  }

  const canonicalCandidate = SLUG_ALIASES[cleaned] || cleaned;
  if (TEMPORARILY_DISABLED_DATING_CARDS.has(canonicalCandidate)) {
    const parentSlug = SLUG_MAP[canonicalCandidate]?.parentSlug || 'dating';
    return {
      entry: SLUG_MAP[parentSlug] ?? SLUG_MAP.dating,
      didFallback: true,
      rawSlug: cleaned,
    };
  }

  const candidateEntry = SLUG_MAP[canonicalCandidate];
  if (candidateEntry?.contactApp) {
    const appCfg = CONTACT_APPS.find((a) => a.id === candidateEntry.contactApp);
    if (appCfg?.disabled) {
      return {
        entry: SLUG_MAP.contact,
        didFallback: true,
        rawSlug: cleaned,
      };
    }
  }

  // 1. Direct match in SLUG_MAP
  if (SLUG_MAP[cleaned]) {
    return {
      entry: SLUG_MAP[cleaned],
      didFallback: fromLegacyHash || cleaned === 'home',
      rawSlug: cleaned,
    };
  }

  // 2. Alias match in SLUG_ALIASES
  const aliased = SLUG_ALIASES[cleaned];
  if (aliased && SLUG_MAP[aliased]) {
    return {
      entry: SLUG_MAP[aliased],
      didFallback: true,
      rawSlug: cleaned,
    };
  }

  // 3. Nearest-parent fallback for invalid child segments:
  // Example: `/dating/anecdotes/999` -> falls back to `/dating` (or nearest top-level parent if 3rd level under default tab)
  const segments = cleaned.split('/').filter(Boolean);
  if (segments.length > 1) {
    // Walk up segments from parent to root
    for (let len = segments.length - 1; len >= 1; len--) {
      const candidate = segments.slice(0, len).join('/');
      const candidateResolved = SLUG_ALIASES[candidate] || candidate;
      if (SLUG_MAP[candidateResolved]) {
        // When an invalid child is under `dating/anecdotes/...`, `/dating` is the canonical parent page for Anecdotes.
        if (candidateResolved === 'dating/anecdotes') {
          return {
            entry: SLUG_MAP.dating,
            didFallback: true,
            rawSlug: cleaned,
          };
        }
        return {
          entry: SLUG_MAP[candidateResolved],
          didFallback: true,
          rawSlug: cleaned,
        };
      }
    }
  }

  // 4. Completely invalid root slug -> fallback to home
  return {
    entry: SLUG_MAP.home,
    didFallback: true,
    rawSlug: cleaned,
  };
}

/**
 * Formats the browser URL string for a given canonical slug using clean pathnames (no `#`).
 * Example:
 * - `'home'` -> `'/'`
 * - `'events/2024'` -> `'/events/2024'`
 * - `'dating/anecdotes/anec1'` -> `'/dating/anecdotes/anec1'`
 */
export function buildUrlForSlug(slug: string): string {
  const cleanSlug = cleanRawHash(slug);
  const search =
    typeof window !== 'undefined' ? window.location.search || '' : '';
  if (!cleanSlug || cleanSlug === 'home') {
    return `/${search}`;
  }
  return `/${cleanSlug}${search}`;
}

/**
 * Updates `document.title` based on the active route entry and current language.
 */
export function syncDocumentTitle(
  entry: RouteConfigEntry,
  lang: 'VI' | 'EN'
): void {
  if (typeof document === 'undefined') return;
  document.title = lang === 'VI' ? entry.titleVI : entry.titleEN;
  document.documentElement.lang = lang === 'VI' ? 'vi' : 'en';
}
