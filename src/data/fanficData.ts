export interface FanficItem {
  /** Tên truyện */
  t: string;
  /** Phụ đề (nếu có) */
  sub?: string;
  /** Màu nhấn của gáy (mã hex) */
  c: string;
  /** true = hoàn, false = đang viết (gáy có chấm nháy) */
  done: boolean;
  /** Số chương (quyết định độ dày gáy và số nhỏ ở đáy gáy) */
  ch: number;
  /** Tác giả */
  au?: string;
  /** Đường dẫn ảnh bìa (tỉ lệ 3:5); nếu chưa có sẽ dùng bìa SVG dự phòng */
  img?: string;
  /** Đường dẫn trang đọc truyện */
  url: string;
}

/**
 * Danh sách fanfic trên kệ sách.
 * Để thêm fanfic mới, chỉ cần thêm 1 dòng object vào mảng FANFIC_LIST bên dưới.
 */
export const FANFIC_LIST: FanficItem[] = [
  {
    t: 'Đêm trăng',
    sub: 'Cưới rồng hái sao',
    c: '#f3b24c',
    done: true,
    ch: 32,
    au: 'Trăng Soi Dặm Trường',
    img: '/assets/aistudio/fanfic-dem-trang.webp',
    url: '/fanfic/dem-trang',
  },
  {
    t: 'Tính dâm của loài thỏ',
    c: '#7dd3fc',
    done: true,
    ch: 18,
    au: 'Trăng Soi Dặm Trường',
    img: '/assets/aistudio/tinhdam_7377defd.webp',
    url: '/fanfic/tinh-dam-cua-loai-tho',
  },
  {
    t: 'Tiệm sách đường số 17',
    c: '#a78bfa',
    done: true,
    ch: 24,
    au: 'Trăng Soi Dặm Trường',
    img: '/assets/aistudio/tiemsach_ecf4f8c7.webp',
    url: '/fanfic/tiem-sach-duong-so-17',
  },
  {
    t: 'Cùng người chung bữa',
    c: '#f472b6',
    done: true,
    ch: 20,
    au: 'Trăng Soi Dặm Trường',
    img: '/assets/aistudio/chungbua_213530dd.webp',
    url: '/fanfic/cung-nguoi-chung-bua',
  },
];

