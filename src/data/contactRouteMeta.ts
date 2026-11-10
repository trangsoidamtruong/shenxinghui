export type LocalizedText = string | { vi: string; en: string };

export type ContactAppId =
  | 'public-account'
  | 'sns'
  | 'message'
  | 'video-call'
  | 'phone-call';

export interface ContactRouteItemMeta {
  id: string;
  title: LocalizedText;
}

export interface ContactRouteAppMeta {
  id: ContactAppId;
  name: string;
  disabled?: boolean;
  items: ContactRouteItemMeta[];
}

export function resolveLocalizedText(
  value: LocalizedText | undefined,
  lang: 'VI' | 'EN'
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return lang === 'EN' ? value.en : value.vi;
}

export const CONTACT_ROUTE_APPS: ContactRouteAppMeta[] = [
  {
    id: 'public-account',
    name: 'PUBLIC ACCOUNT',
    disabled: true,
    items: [
      {
        id: 'pub-01',
        title: {
          vi: 'Mùa quan sát sao băng đã bắt đầu! Đã đến lúc bứt phá ...',
          en: 'Meteor shower observation season has begun! Time to break through...',
        },
      },
      {
        id: 'pub-02',
        title: {
          vi: 'Một hồ sơ nhiệm vụ mới vừa được mở khoá ngay hôm nay',
          en: 'A new mission dossier has just been unlocked today',
        },
      },
      {
        id: 'pub-03',
        title: {
          vi: 'Săn ánh hoàng hôn trên đỉnh Greensprings',
          en: 'Chasing sunset glow atop Greensprings peak',
        },
      },
    ],
  },
  {
    id: 'sns',
    name: 'SNS',
    disabled: true,
    items: [
      {
        id: 'sns-01',
        title: {
          vi: 'Bầu trời sao hôm nay',
          en: 'Tonight’s starry sky',
        },
      },
      {
        id: 'sns-02',
        title: {
          vi: 'Nhiệm vụ mới bắt đầu',
          en: 'A new mission begins',
        },
      },
      {
        id: 'sns-03',
        title: {
          vi: 'Con phố về đêm',
          en: 'Streets at night',
        },
      },
    ],
  },
  {
    id: 'message',
    name: 'MESSAGE',
    disabled: true,
    items: [
      {
        id: 'msg-01',
        title: {
          vi: 'Lời chúc ngủ ngon',
          en: 'Goodnight message',
        },
      },
      {
        id: 'msg-02',
        title: {
          vi: 'Trước giờ làm nhiệm vụ',
          en: 'Before the mission starts',
        },
      },
      {
        id: 'msg-03',
        title: {
          vi: 'Ảnh bầu trời đêm',
          en: 'Night sky photo',
        },
      },
      {
        id: 'msg-04',
        title: {
          vi: 'Chuyện vặt hằng ngày',
          en: 'Daily small talk',
        },
      },
    ],
  },
  {
    id: 'video-call',
    name: 'VIDEO CALL',
    disabled: true,
    items: [
      {
        id: 'vid-01',
        title: {
          vi: 'Cuộc gọi đêm khuya',
          en: 'Late-night call',
        },
      },
      {
        id: 'vid-02',
        title: {
          vi: 'Cùng xem sao băng',
          en: 'Watching meteors together',
        },
      },
      {
        id: 'vid-03',
        title: {
          vi: 'Chúc mừng sinh nhật',
          en: 'Birthday wishes',
        },
      },
    ],
  },
  {
    id: 'phone-call',
    name: 'PHONE CALL',
    disabled: true,
    items: [
      {
        id: 'tel-01',
        title: {
          vi: 'Giọng nói trước khi ngủ',
          en: 'Voice before sleep',
        },
      },
      {
        id: 'tel-02',
        title: {
          vi: 'Báo bình an',
          en: 'Safe and sound check-in',
        },
      },
      {
        id: 'tel-03',
        title: {
          vi: 'Hát cho em nghe',
          en: 'Singing for you',
        },
      },
    ],
  },
];
