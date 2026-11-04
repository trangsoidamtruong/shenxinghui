import React, { useEffect, useRef } from 'react';
import { soundFx } from '../utils/soundFx';
import { mountMemoria, type MountedMemoria } from '../memoria/memoria';
import '../memoria/memoria.css';

interface MemoriaPageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  onToggleLang?: () => void;
  onClose: () => void;
  onBackHome?: () => void;
  onBackToDating?: () => void;
}

export const MemoriaPage: React.FC<MemoriaPageProps> = ({
  lang,
  onToggleLang,
  onClose,
  onBackHome,
  onBackToDating,
}) => {
  const memoriaRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<MountedMemoria | null>(null);
  const initialLangRef = useRef<'VI' | 'EN'>(lang);

  useEffect(() => {
    const el = memoriaRef.current;
    if (!el) return;
    const mounted = mountMemoria(el, initialLangRef.current);
    instanceRef.current = mounted;
    return () => {
      mounted.unmount();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    instanceRef.current?.setLang(lang);
  }, [lang]);

  return (
    <div className="relative z-20 flex h-full w-full flex-col bg-[var(--void)] max-[820px]:overflow-y-auto max-[820px]:overflow-x-hidden min-[821px]:overflow-hidden">
      {/* Header của web (thay cho .fake-nav trong file demo) */}
      <header className="relative z-10 flex h-[49px] shrink-0 items-center justify-between border-b border-[var(--line)] bg-[var(--void)] px-[5vw]">
        <div className="flex items-center gap-2.5 min-w-0 font-[var(--font-mono)] text-[10px] sm:text-[11px] tracking-[0.2em] text-[var(--text-2)]">
          <button
            type="button"
            onMouseEnter={() => soundFx.playHover()}
            onClick={() => {
              soundFx.playBack();
              if (onBackHome) onBackHome();
              else onClose();
            }}
            className="cursor-pointer font-medium uppercase text-[var(--text-2)] transition-colors duration-150 hover:text-[var(--text-1)] focus:outline-none"
          >
            {lang === 'VI' ? 'TRĂNG SOI DẶM TRƯỜNG' : 'MOONSTRIDE'}
          </button>

          <span className="text-[var(--violet)]" aria-hidden="true">
            &gt;
          </span>

          <button
            type="button"
            onMouseEnter={() => soundFx.playHover()}
            onClick={() => {
              soundFx.playBack();
              if (onBackToDating) onBackToDating();
              else onClose();
            }}
            className="cursor-pointer font-medium uppercase text-[var(--text-2)] transition-colors duration-150 hover:text-[var(--text-1)] focus:outline-none"
          >
            {lang === 'VI' ? 'HẸN HÒ' : 'DATING'}
          </button>

          <span className="text-[var(--violet)]" aria-hidden="true">
            &gt;
          </span>

          <span className="font-bold uppercase text-[var(--text-1)]">
            MEMORIA
          </span>
        </div>

        {onToggleLang && (
          <div className="flex shrink-0 items-stretch border border-[var(--line)] bg-[var(--deep)]/85">
            <button
              type="button"
              onMouseEnter={() => soundFx.playHover()}
              onClick={() => {
                soundFx.playSelect();
                onToggleLang();
              }}
              title={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
              aria-label={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
              className="hud-mono-text flex h-7 items-center justify-center px-2.5 cursor-pointer rounded-none text-[var(--text-2)] transition-colors duration-200 hover:bg-[var(--violet-d)]/35 hover:text-[var(--text-1)] focus:outline-none"
            >
              {lang}
            </button>
          </div>
        )}
      </header>

      {/* Vùng chứa .memoria có chiều cao xác định trên PC (màn hình trừ header 49px), trên điện thoại tự cao theo nội dung */}
      <div className="min-[821px]:flex-1 min-[821px]:min-h-0 min-[821px]:h-[calc(100dvh-49px)] max-[820px]:h-auto max-[820px]:flex-none">
        <div ref={memoriaRef} className="memoria"></div>
      </div>
    </div>
  );
};
