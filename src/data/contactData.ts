
import {
  resolveLocalizedText,
  type ContactAppId,
  type LocalizedText,
} from './contactRouteMeta';

export { resolveLocalizedText, type ContactAppId, type LocalizedText };
export type LocalizedParagraphs = string[] | { vi: string[]; en: string[] };

export type ContactAppKey = 'PUB' | 'SNS' | 'MSG' | 'VID' | 'TEL';
export type ContactIconType = 'pub' | 'sns' | 'msg' | 'vid' | 'tel';

export interface ContactComment {
  user: string;
  text: LocalizedText;
}

export interface ContactItem {
  id: string;
  title: LocalizedText;
  date: string;
  meta?: LocalizedText;

  account?: LocalizedText;
  avatar?: string;
  banner?: string;
  unread?: boolean;
  body?: LocalizedParagraphs;
  comments?: ContactComment[];
}

export interface ContactAppConfig {
  id: ContactAppId;
  name: string;
  key: ContactAppKey;
  icon: ContactIconType;
  disabled?: boolean;
  items: ContactItem[];
}

export function resolveLocalizedParagraphs(
  value: LocalizedParagraphs | undefined,
  lang: 'VI' | 'EN'
): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return lang === 'EN' ? value.en : value.vi;
}

export const CONTACT_APPS: ContactAppConfig[] = [
  {
    id: 'public-account',
    name: 'PUBLIC ACCOUNT',
    key: 'PUB',
    icon: 'pub',
    disabled: true,
    items: [
      {
        id: 'pub-01',
        title: {
          vi: 'Mùa quan sát sao băng đã bắt đầu! Đã đến lúc bứt phá ...',
          en: 'Meteor shower observation season has begun! Time to break through...',
        },
        date: '12.2025',
        meta: '↗ 3.4K',
        account: {
          vi: 'Trạm Chuyển Tiếp',
          en: 'Relay Station',
        },
        banner: '/assets/aistudio/2026-14_94413d6b.webp',
        unread: true,
        body: {
          vi: [
            'Mùa quan sát sao băng năm nay chính thức khai mạc. Từ tối nay, các điểm quan sát trên tuyến bay sẽ mở cửa đón mọi người.',
            'Hãy chuẩn bị sẵn áo ấm, một chỗ ngồi thoải mái và đừng quên ước một điều ước trước khi ánh sáng cuối cùng tắt đi.',
          ],
          en: [
            'This year’s meteor shower observation season has officially opened. Starting tonight, observation points along the flight route will welcome everyone.',
            'Bring a warm coat, find a comfortable spot, and do not forget to make a wish before the last streak of light fades away.',
          ],
        },
        comments: [
          {
            user: '@nguoi_dung_01',
            text: {
              vi: 'Tuyệt quá, cuối cùng cũng được xem bản tin này!',
              en: 'Wonderful, finally got to read this bulletin!',
            },
          },
          {
            user: '@sao_bang',
            text: {
              vi: 'Đọc xong mà háo hức muốn vào ngay.',
              en: 'Reading this makes me so excited to head out right away.',
            },
          },
          {
            user: '@dem_trang',
            text: {
              vi: 'Ảnh minh hoạ đẹp thật, mong có thêm bài như vậy.',
              en: 'The illustration is gorgeous, hoping for more posts like this.',
            },
          },
        ],
      },
      {
        id: 'pub-02',
        title: {
          vi: 'Một hồ sơ nhiệm vụ mới vừa được mở khoá ngay hôm nay',
          en: 'A new mission dossier has just been unlocked today',
        },
        date: '01.2026',
        meta: '↗ 2.1K',
        account: {
          vi: 'Bản Tin Đêm Sao',
          en: 'Starry Night Bulletin',
        },
        banner: '/assets/aistudio/2026-15_0e1c69bf.webp',
        unread: true,
        body: {
          vi: [
            'Hồ sơ nhiệm vụ mới đã được mở khoá và sẵn sàng để đọc. Mỗi chương đều ẩn chứa những manh mối nhỏ về hành trình phía trước.',
            'Chúc bạn có một đêm đọc thật trọn vẹn.',
          ],
          en: [
            'The new mission dossier has been unlocked and is ready to read. Every chapter holds subtle clues about the journey ahead.',
            'Wishing you a fulfilling night of reading.',
          ],
        },
        comments: [
          {
            user: '@nguoi_dung_01',
            text: {
              vi: 'Tuyệt quá, cuối cùng cũng được xem bản tin này!',
              en: 'Wonderful, finally got to read this bulletin!',
            },
          },
          {
            user: '@sao_bang',
            text: {
              vi: 'Đọc xong mà háo hức muốn vào ngay.',
              en: 'Reading this makes me so excited to head out right away.',
            },
          },
          {
            user: '@dem_trang',
            text: {
              vi: 'Ảnh minh hoạ đẹp thật, mong có thêm bài như vậy.',
              en: 'The illustration is gorgeous, hoping for more posts like this.',
            },
          },
        ],
      },
      {
        id: 'pub-03',
        title: {
          vi: 'Săn ánh hoàng hôn trên đỉnh Greensprings',
          en: 'Chasing sunset glow atop Greensprings peak',
        },
        date: '03.2026',
        meta: '↗ 2.8K',
        account: {
          vi: 'Nhật Ký Nhiệm Vụ',
          en: 'Mission Logbook',
        },
        banner: '/assets/aistudio/2026-17_87503d5e.webp',
        unread: false,
        body: {
          vi: [
            'Sau buổi làm việc dài, không gì tuyệt hơn việc dừng lại ngắm hoàng hôn trên đỉnh đồi. Ánh sáng cam phủ lên những tán lá, nhẹ nhàng như một lời chào.',
            'Đây là điểm dừng chân yêu thích của nhiều người trên tuyến.',
          ],
          en: [
            'After a long shift, nothing beats pausing to watch the sunset from the hilltop. Warm amber light drapes over the canopy like a gentle greeting.',
            'It remains a favorite resting spot for many along the route.',
          ],
        },
        comments: [
          {
            user: '@nguoi_dung_01',
            text: {
              vi: 'Tuyệt quá, cuối cùng cũng được xem bản tin này!',
              en: 'Wonderful, finally got to read this bulletin!',
            },
          },
          {
            user: '@sao_bang',
            text: {
              vi: 'Đọc xong mà háo hức muốn vào ngay.',
              en: 'Reading this makes me so excited to head out right away.',
            },
          },
          {
            user: '@dem_trang',
            text: {
              vi: 'Ảnh minh hoạ đẹp thật, mong có thêm bài như vậy.',
              en: 'The illustration is gorgeous, hoping for more posts like this.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'sns',
    name: 'SNS',
    key: 'SNS',
    icon: 'sns',
    disabled: true,
    items: [
      {
        id: 'sns-01',
        title: {
          vi: 'Bầu trời sao hôm nay',
          en: 'Tonight’s starry sky',
        },
        date: '12.2025',
        meta: '♡ 1.2K',
      },
      {
        id: 'sns-02',
        title: {
          vi: 'Nhiệm vụ mới bắt đầu',
          en: 'A new mission begins',
        },
        date: '01.2026',
        meta: '♡ 980',
      },
      {
        id: 'sns-03',
        title: {
          vi: 'Con phố về đêm',
          en: 'Streets at night',
        },
        date: '03.2026',
        meta: '♡ 1.5K',
      },
    ],
  },
  {
    id: 'message',
    name: 'MESSAGE',
    key: 'MSG',
    icon: 'msg',
    disabled: true,
    items: [
      {
        id: 'msg-01',
        title: {
          vi: 'Lời chúc ngủ ngon',
          en: 'Goodnight message',
        },
        date: '12.2025',
        meta: {
          vi: '24 dòng',
          en: '24 lines',
        },
      },
      {
        id: 'msg-02',
        title: {
          vi: 'Trước giờ làm nhiệm vụ',
          en: 'Before the mission starts',
        },
        date: '01.2026',
        meta: {
          vi: '18 dòng',
          en: '18 lines',
        },
      },
      {
        id: 'msg-03',
        title: {
          vi: 'Ảnh bầu trời đêm',
          en: 'Night sky photo',
        },
        date: '02.2026',
        meta: {
          vi: '9 dòng',
          en: '9 lines',
        },
      },
      {
        id: 'msg-04',
        title: {
          vi: 'Chuyện vặt hằng ngày',
          en: 'Daily small talk',
        },
        date: '03.2026',
        meta: {
          vi: '31 dòng',
          en: '31 lines',
        },
      },
    ],
  },
  {
    id: 'video-call',
    name: 'VIDEO CALL',
    key: 'VID',
    icon: 'vid',
    disabled: true,
    items: [
      {
        id: 'vid-01',
        title: {
          vi: 'Cuộc gọi đêm khuya',
          en: 'Late-night call',
        },
        date: '12.2025',
        meta: '00:12:40',
      },
      {
        id: 'vid-02',
        title: {
          vi: 'Cùng xem sao băng',
          en: 'Watching meteors together',
        },
        date: '01.2026',
        meta: '00:08:05',
      },
      {
        id: 'vid-03',
        title: {
          vi: 'Chúc mừng sinh nhật',
          en: 'Birthday wishes',
        },
        date: '03.2026',
        meta: '00:15:22',
      },
    ],
  },
  {
    id: 'phone-call',
    name: 'PHONE CALL',
    key: 'TEL',
    icon: 'tel',
    disabled: true,
    items: [
      {
        id: 'tel-01',
        title: {
          vi: 'Giọng nói trước khi ngủ',
          en: 'Voice before sleep',
        },
        date: '12.2025',
        meta: '00:03:10',
      },
      {
        id: 'tel-02',
        title: {
          vi: 'Báo bình an',
          en: 'Safe and sound check-in',
        },
        date: '02.2026',
        meta: '00:01:45',
      },
      {
        id: 'tel-03',
        title: {
          vi: 'Hát cho em nghe',
          en: 'Singing for you',
        },
        date: '04.2026',
        meta: '00:05:30',
      },
    ],
  },
];
