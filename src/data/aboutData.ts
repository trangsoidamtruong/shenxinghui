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
