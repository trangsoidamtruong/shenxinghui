export type CreditCategory = 'data' | 'trans' | 'img' | 'aud';

export interface CreditDossierLink {
  label: string;
  href: string;
}

export type CreditTuple = [
  code: string,
  name: string,
  category: CreditCategory,
  roleVI: string,
  descVI: string,
  avatar: string,
  linkUrl?: string,
  roleEN?: string,
  descEN?: string,
  links?: CreditDossierLink[],
];

export const CREDITS: CreditTuple[] = [
  [
    'Amber-TTFS',
    'To the fallen star',
    'trans',
    'Dịch thuật',
    'Dịch cốt truyện và thoại nhân vật sang tiếng Việt.',
    '/assets/aistudio/Amber_2f5e0e50.webp',
    '#',
    'Translation',
    'Translated storylines and character voice lines into Vietnamese.',
    [
      { label: 'Facebook', href: '#' },
      { label: 'Website', href: '#' },
    ],
  ],
  [
    'HT-BMKT',
    'Bánh Mì Kẹp Thỏ',
    'img',
    'HỖ TRỢ',
    'Đóng góp tư liệu hình ảnh & video để làm tài nguyên minigame, tương tác.',
    '/assets/aistudio/image-1651479609961606_f67bedab.jpg',
    '#',
    'SUPPORT',
    'Contributed image & video materials for minigame and interactive resources.',
    [
      { label: 'Facebook', href: '#' },
    ],
  ],
  [
    'BI-LHDQ',
    'Bi',
    'data',
    'KỸ THUẬT',
    'Cố vấn kỹ thuật và giúp phát triển lập trình, rất nghiêm túc lắng nghe và cùng giải quyết vấn đề web gặp phải.',
    '/assets/aistudio/71489498_376483293241450_6352408105690595328_n_340f2f07.jpg',
    '#',
    'TECHNICAL',
    'Technical advisor and programming contributor, attentively listening and working together to solve web issues.',
    [
      { label: 'ẨN DANH', href: '#' },
    ],
  ],
];

export interface AboutSocialLink {
  id: string;
  label: string;
  href: string;
}

export const ABOUT_SOCIAL_LINKS: AboutSocialLink[] = [
  { id: 'facebook', label: 'Facebook', href: '#' },
  { id: 'youtube', label: 'YouTube', href: '#' },
  { id: 'notion', label: 'Notion', href: '#' },
];

export const ABOUT_FEEDBACK_ENDPOINT = '';
