import React, { useState } from 'react';
import {
  X,
  Home,
  Swords,
  BookOpen,
  Heart,
  Image as ImageIcon,
  Calendar,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';
import { soundFx } from '../utils/soundFx';

export type MenuActionId =
  | 'home'
  | 'combat'
  | 'story'
  | 'dating'
  | 'gallery'
  | 'events'
  | 'contact'
  | 'interact'
  | 'about'
  | null;

interface GameModalsProps {
  activeModal: MenuActionId;
  lang?: 'VI' | 'EN';
  onClose: () => void;
  onEnterWallpaperMode: () => void;
}

const STORY_SCENES = [
  {
    chapter: 'Chương IV · Trăng Soi Dặm Trường',
    speaker: 'Hệ Thống Quan Sát',
    line: 'Giữa biển đêm tím thẳm, những vệt sao băng mỏng manh vẫn lặng lẽ lướt ngang bầu trời từ phải sang trái như kim đồng hồ quay ngược về miền ký ức.',
  },
  {
    chapter: 'Chương IV · Trăng Soi Dặm Trường',
    speaker: 'Lữ Khách Đêm',
    line: '“Dẫu cách nhau vạn dặm trường, ánh trăng và vệt sao rơi đêm nay vẫn soi rõ bóng hình người phía bên kia chân trời...”',
  },
  {
    chapter: 'Chương IV · Trăng Soi Dặm Trường',
    speaker: 'Tín Hiệu Phản Hồi',
    line: 'Đường truyền đồng bộ đạt 99.8%. Mọi ký ức cốt truyện đều được lưu giữ nguyên vẹn.',
  },
];

const COMBAT_MISSIONS = [
  {
    code: 'SECTOR-01',
    name: 'Vành Đai Thiên Thạch',
    difficulty: 'Cấp Độ: Tinh Anh',
    desc: 'Vượt qua vùng nhiễu loạn trọng lực phía sau dải sao băng để thu hồi lõi năng lượng ánh trăng.',
  },
  {
    code: 'SECTOR-02',
    name: 'Pháo Đài Chân Trời Tím',
    difficulty: 'Cấp Độ: Ác Mộng',
    desc: 'Phá vỡ lớp rào chắn lượng tử và bảo vệ trạm truyền dẫn tín hiệu trên cầu vượt.',
  },
];

const DATING_MEMORIES = [
  {
    title: 'Đêm Ngắm Mưa Sao Băng',
    location: 'Cầu Vượt Tầng Không · 23:45',
    quote: '“Nếu mỗi vệt sao băng bay qua là một lời ước nguyện, anh đã ước hàng ngàn lần rằng khoảnh khắc này sẽ dừng lại mãi mãi.”',
  },
  {
    title: 'Dư Âm Ánh Trăng',
    location: 'Đài Quan Sát Tinh Vân · 01:15',
    quote: '“Đừng sợ lạc đường giữa ngân hà rộng lớn. Chỉ cần em ngước nhìn lên, ánh sáng của anh sẽ luôn ở đó.”',
  },
];

const GALLERY_ITEMS = [
  {
    id: 'EX-01',
    title: 'Ảo Ảnh Giữa Đêm Tím',
    meta: 'Bản Ghi Thị Giác 4K · Hồ Sơ Đặc Biệt',
    desc: 'Khoảnh khắc đối diện giữa thực tại và hình chiếu khổng lồ nơi chân trời.',
  },
  {
    id: 'EX-02',
    title: 'Vệt Sao Băng Ngược Gió',
    meta: 'Bản Ghi Thiên Văn · Tầng Khí Quyển Cao',
    desc: 'Những dải băng sáng xanh nhạt thanh mảnh lướt êm qua màn đêm tĩnh mịch.',
  },
  {
    id: 'EX-03',
    title: 'Trăng Soi Dặm Trường',
    meta: 'Bản Giao Hưởng Ánh Sáng · Bộ Sưu Tập Chính',
    desc: 'Bản lưu trữ toàn cảnh hành trình vượt qua hàng vạn năm ánh sáng.',
  },
];

const EVENT_ITEMS = [
  {
    tag: 'ĐANG DIỄN RA',
    title: 'Đêm Hội Sao Băng Vĩnh Cửu',
    time: 'Thời hạn: Chu kỳ 2149.10 – 2149.12',
    desc: 'Thu thập mảnh ánh trăng rơi dọc cầu vượt tầng không để mở khóa trang phục và kỷ vật giới hạn.',
  },
  {
    tag: 'SỰ KIỆN ĐẶC BIỆT',
    title: 'Tiếng Vọng Từ Tinh Vân',
    time: 'Thời hạn: Mở xuyên suốt mùa trăng',
    desc: 'Đồng bộ tần số tín hiệu mỗi đêm để nhận thông điệp bí ẩn từ phía bên kia ngân hà.',
  },
];

const CONTACT_MESSAGES = [
  {
    sender: 'Tần Số Ưu Tiên #01',
    time: 'Vừa xong',
    text: '“Đêm nay trời nhiều sao băng lắm, nhớ mặc ấm khi đứng trên cầu ngắm trăng nhé.”',
  },
  {
    sender: 'Trung Tâm Chỉ Huy Tinh Vân',
    time: '12 phút trước',
    text: 'Tất cả vệ tinh dẫn đường đã khóa tọa độ an toàn cho hành trình của bạn.',
  },
];

export const GameModals: React.FC<GameModalsProps> = ({
  activeModal,
  lang = 'VI',
  onClose,
}) => {
  const [storyIndex, setStoryIndex] = useState(0);
  const [selectedCombat, setSelectedCombat] = useState(0);
  const [selectedDating, setSelectedDating] = useState(0);
  const [selectedGallery, setSelectedGallery] = useState(0);
  const [interactPulse, setInteractPulse] = useState(0);

  if (!activeModal) return null;

  const handleClose = () => {
    soundFx.playBack();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-xl border border-fuchsia-400/70 bg-[#140726]/90 p-6 text-purple-50 shadow-[0_0_35px_rgba(217,70,239,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar inside modal */}
        <div className="mb-5 flex items-center justify-between border-b border-fuchsia-400/30 pb-3">
          <div className="flex items-center gap-2.5">
            {activeModal === 'home' && <Home className="h-5 w-5 text-fuchsia-400" />}
            {activeModal === 'combat' && <Swords className="h-5 w-5 text-fuchsia-400" />}
            {activeModal === 'story' && <BookOpen className="h-5 w-5 text-fuchsia-400" />}
            {activeModal === 'dating' && <Heart className="h-5 w-5 text-fuchsia-400" />}
            {activeModal === 'gallery' && <ImageIcon className="h-5 w-5 text-fuchsia-400" />}
            {activeModal === 'events' && <Calendar className="h-5 w-5 text-fuchsia-400" />}
            {activeModal === 'contact' && <MessageSquare className="h-5 w-5 text-fuchsia-400" />}
            {activeModal === 'interact' && <Sparkles className="h-5 w-5 text-fuchsia-400" />}
            {activeModal === 'about' && <Info className="h-5 w-5 text-fuchsia-400" />}
            <h2 className="text-lg font-bold tracking-wider text-white uppercase">
              {activeModal === 'home' && (lang === 'VI' ? 'Hồ Sơ' : 'Profile')}
              {activeModal === 'combat' && (lang === 'VI' ? 'Chiến Đấu' : 'Battle')}
              {activeModal === 'story' && (lang === 'VI' ? 'Cốt Truyện' : 'Storyline')}
              {activeModal === 'dating' && (lang === 'VI' ? 'Hẹn Hò' : 'Dating')}
              {activeModal === 'gallery' && (lang === 'VI' ? 'Triển Lãm' : 'Gallery')}
              {activeModal === 'events' && (lang === 'VI' ? 'Sự Kiện' : 'Events')}
              {activeModal === 'contact' && (lang === 'VI' ? 'Liên Lạc' : 'Comms')}
              {activeModal === 'interact' && (lang === 'VI' ? 'Tương Tác' : 'Interaction')}
              {activeModal === 'about' && (lang === 'VI' ? 'Giới Thiệu' : 'About')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center border border-fuchsia-400/50 bg-fuchsia-950/50 text-fuchsia-200 transition-colors hover:border-white hover:bg-fuchsia-600 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 1. HỒ SƠ */}
        {activeModal === 'home' && (
          <div className="space-y-4">
            <div className="border border-fuchsia-500/35 bg-purple-950/45 p-5">
              <div className="mb-1 text-xs font-bold tracking-wider text-pink-300 uppercase">
                Định Danh Quan Sát Viên
              </div>
              <div className="mb-3 text-base font-bold text-white">
                Lữ Khách Đêm · Trạm Tinh Vân #04
              </div>
              <p className="text-sm leading-relaxed text-purple-100">
                Hồ sơ lưu trữ hành trình <strong>Trăng Soi Dặm Trường</strong>. Trạng thái kết nối tâm thức và tần số ánh trăng đang duy trì ở mức ổn định 99.8%.
              </p>
            </div>
          </div>
        )}

        {/* 2. CHIẾN ĐẤU */}
        {activeModal === 'combat' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {COMBAT_MISSIONS.map((mission, idx) => (
                <button
                  key={mission.code}
                  onClick={() => {
                    soundFx.playHover();
                    setSelectedCombat(idx);
                  }}
                  className={`border px-4 py-3 text-left transition ${
                    selectedCombat === idx
                      ? 'border-pink-300 bg-fuchsia-700/40 text-white shadow-[0_0_12px_rgba(244,114,182,0.5)]'
                      : 'border-fuchsia-500/30 bg-purple-950/40 text-purple-200 hover:border-fuchsia-400/70'
                  }`}
                >
                  <div className="text-xs font-bold text-pink-300">{mission.code}</div>
                  <div className="text-sm font-semibold text-white">{mission.name}</div>
                </button>
              ))}
            </div>
            <div className="border border-fuchsia-500/35 bg-purple-950/45 p-5">
              <div className="mb-1 text-xs font-semibold text-pink-300">
                {COMBAT_MISSIONS[selectedCombat].difficulty}
              </div>
              <p className="text-sm leading-relaxed text-purple-100">
                {COMBAT_MISSIONS[selectedCombat].desc}
              </p>
            </div>
          </div>
        )}

        {/* 3. CỐT TRUYỆN */}
        {activeModal === 'story' && (
          <div className="space-y-5">
            <div className="border border-fuchsia-500/35 bg-purple-950/40 p-5">
              <div className="mb-2 flex items-center justify-between text-xs text-fuchsia-300/80">
                <span>{STORY_SCENES[storyIndex].chapter}</span>
                <span className="tabular-nums">0{storyIndex + 1} / 0{STORY_SCENES.length}</span>
              </div>
              <div className="mb-1 text-sm font-semibold text-pink-300">
                {STORY_SCENES[storyIndex].speaker}
              </div>
              <p className="text-base leading-relaxed text-purple-100">
                {STORY_SCENES[storyIndex].line}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  soundFx.playHover();
                  setStoryIndex((prev) => (prev > 0 ? prev - 1 : STORY_SCENES.length - 1));
                }}
                className="border border-fuchsia-400/50 bg-purple-950/60 px-4 py-2 text-xs font-semibold tracking-wider text-purple-100 uppercase transition hover:border-pink-300 hover:bg-fuchsia-900/60"
              >
                Đoạn Trước
              </button>
              <button
                onClick={() => {
                  soundFx.playSelect();
                  setStoryIndex((prev) => (prev + 1) % STORY_SCENES.length);
                }}
                className="border border-pink-300 bg-fuchsia-600/80 px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase shadow-[0_0_15px_rgba(236,72,153,0.6)] transition hover:bg-fuchsia-500"
              >
                Tiếp Theo
              </button>
            </div>
          </div>
        )}

        {/* 4. HẸN HÒ */}
        {activeModal === 'dating' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DATING_MEMORIES.map((mem, idx) => (
                <button
                  key={mem.title}
                  onClick={() => {
                    soundFx.playHover();
                    setSelectedDating(idx);
                  }}
                  className={`border px-4 py-3 text-left transition ${
                    selectedDating === idx
                      ? 'border-pink-300 bg-fuchsia-700/40 text-white shadow-[0_0_12px_rgba(244,114,182,0.5)]'
                      : 'border-fuchsia-500/30 bg-purple-950/40 text-purple-200 hover:border-fuchsia-400/70'
                  }`}
                >
                  <div className="text-sm font-bold text-white">{mem.title}</div>
                  <div className="text-xs text-pink-200/80">{mem.location}</div>
                </button>
              ))}
            </div>
            <div className="border border-fuchsia-500/35 bg-purple-950/45 p-5">
              <p className="text-base italic leading-relaxed text-pink-100">
                {DATING_MEMORIES[selectedDating].quote}
              </p>
            </div>
          </div>
        )}

        {/* 5. TRIỂN LÃM */}
        {activeModal === 'gallery' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {GALLERY_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFx.playHover();
                    setSelectedGallery(idx);
                  }}
                  className={`border px-3 py-2.5 text-left transition ${
                    selectedGallery === idx
                      ? 'border-pink-300 bg-fuchsia-700/40 text-white shadow-[0_0_12px_rgba(244,114,182,0.5)]'
                      : 'border-fuchsia-500/30 bg-purple-950/40 text-purple-200 hover:border-fuchsia-400/70'
                  }`}
                >
                  <div className="text-xs font-bold text-pink-300">{item.id}</div>
                  <div className="truncate text-xs text-purple-100">{item.title}</div>
                </button>
              ))}
            </div>
            <div className="border border-fuchsia-500/30 bg-purple-950/45 p-5">
              <div className="mb-1 text-sm font-bold text-white">
                {GALLERY_ITEMS[selectedGallery].title}
              </div>
              <div className="mb-2 text-xs text-pink-300/80">
                {GALLERY_ITEMS[selectedGallery].meta}
              </div>
              <p className="text-sm leading-relaxed text-purple-100/90">
                {GALLERY_ITEMS[selectedGallery].desc}
              </p>
            </div>
          </div>
        )}

        {/* 6. SỰ KIỆN */}
        {activeModal === 'events' && (
          <div className="space-y-3.5">
            {EVENT_ITEMS.map((ev) => (
              <div
                key={ev.title}
                className="border border-fuchsia-500/35 bg-purple-950/45 p-4"
              >
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-bold text-pink-300">{ev.tag}</span>
                  <span className="text-purple-200/75">{ev.time}</span>
                </div>
                <div className="mb-1 text-sm font-bold text-white">{ev.title}</div>
                <p className="text-xs leading-relaxed text-purple-100/90">{ev.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* 7. LIÊN LẠC */}
        {activeModal === 'contact' && (
          <div className="space-y-3.5">
            {CONTACT_MESSAGES.map((msg) => (
              <div
                key={msg.sender}
                className="border border-fuchsia-500/35 bg-purple-950/45 p-4"
              >
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-bold text-pink-300">{msg.sender}</span>
                  <span className="text-purple-200/75">{msg.time}</span>
                </div>
                <p className="text-sm leading-relaxed text-purple-100">{msg.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* 8. TƯƠNG TÁC */}
        {activeModal === 'interact' && (
          <div className="space-y-4">
            <div className="border border-fuchsia-500/35 bg-purple-950/45 p-5 text-center">
              <div className="mb-2 text-xs tracking-wider text-pink-300 uppercase">
                Mức Độ Đồng Bộ Nhịp Tim & Ánh Trăng
              </div>
              <div className="mb-3 text-2xl font-bold tabular-nums text-white">
                {92 + (interactPulse % 8)}.4%
              </div>
              <p className="mb-4 text-sm text-purple-100">
                {interactPulse === 0
                  ? 'Chạm vào nút gửi tín hiệu bên dưới để truyền sóng cộng hưởng qua bầu trời đêm.'
                  : 'Tín hiệu cộng hưởng đã được đáp lại từ phía bên kia cầu vượt!'}
              </p>
              <button
                onClick={() => {
                  soundFx.playSelect();
                  setInteractPulse((p) => p + 1);
                }}
                className="border border-pink-300 bg-fuchsia-600/80 px-5 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-[0_0_15px_rgba(236,72,153,0.65)] transition hover:bg-fuchsia-500"
              >
                Gửi Tín Hiệu Tương Tác
              </button>
            </div>
          </div>
        )}

        {/* 9. GIỚI THIỆU */}
        {activeModal === 'about' && (
          <div className="space-y-4">
            <div className="border border-fuchsia-500/35 bg-purple-950/45 p-5">
              <div className="mb-2 text-sm font-bold tracking-wider text-pink-300 uppercase">
                Trăng Soi Dặm Trường
              </div>
              <p className="text-sm leading-relaxed text-purple-100">
                Không gian trải nghiệm lấy cảm hứng từ giao diện màn hình chờ khoa học viễn tưởng lãng mạn, kết hợp hình chiếu toàn ảnh giữa màn đêm tím và những vệt sao băng thanh mảnh bay qua bầu trời.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
