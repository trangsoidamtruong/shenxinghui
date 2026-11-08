export interface FanficItem {
  t: string;
  sub?: string;
  c: string;
  done: boolean;
  ch: number;
  au?: string;
  img?: string;
  url: string;
}

export const FANFIC_LIST: FanficItem[] = [
  {
    t: 'Đêm trăng',
    sub: 'Cưới rồng hái sao',
    c: '#CFB1F1',
    done: true,
    ch: 32,
    au: 'Trăng Soi Dặm Trường',
    img: '/assets/aistudio/fanfic-dem-trang.webp',
    url: '/fanfic/dem-trang',
  },
  {
    t: 'Tính dâm của loài thỏ',
    c: '#A964F7',
    done: true,
    ch: 18,
    au: 'Trăng Soi Dặm Trường',
    img: '/assets/aistudio/tinhdam_7377defd.webp',
    url: '/fanfic/tinh-dam-cua-loai-tho',
  },
  {
    t: 'Tiệm sách đường số 17',
    c: '#B983FF',
    done: true,
    ch: 24,
    au: 'Trăng Soi Dặm Trường',
    img: '/assets/aistudio/tiemsach_ecf4f8c7.webp',
    url: '/fanfic/tiem-sach-duong-so-17',
  },
  {
    t: 'Cùng người chung bữa',
    c: '#9356E8',
    done: true,
    ch: 20,
    au: 'Trăng Soi Dặm Trường',
    img: '/assets/aistudio/chungbua_213530dd.webp',
    url: '/fanfic/cung-nguoi-chung-bua',
  },
];

