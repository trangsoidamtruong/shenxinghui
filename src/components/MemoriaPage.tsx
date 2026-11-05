import React, { useEffect, useRef } from 'react';
import { mountMemoria, type MountedMemoria } from '../memoria/memoria';
import '../memoria/memoria.css';
import { SiteHeader } from './SiteHeader';

interface MemoriaPageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  skipBoot?: boolean;
  selectedCardId?: number | null;
  onSelectCard?: (cardId: number) => void;
  onOpenTranslation?: (cardId: number, url: string) => void;
  onToggleLang?: () => void;
  onClose: () => void;
  onBackHome?: () => void;
  onBackToDating?: () => void;
}

export const MemoriaPage: React.FC<MemoriaPageProps> = ({
  lang,
  skipBoot = false,
  selectedCardId = null,
  onSelectCard,
  onOpenTranslation,
  onToggleLang,
  onClose,
  onBackHome,
  onBackToDating,
}) => {
  const memoriaRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<MountedMemoria | null>(null);
  const initialLangRef = useRef<'VI' | 'EN'>(lang);
  const initialSkipBootRef = useRef<boolean>(skipBoot);
  const initialCardIdRef = useRef<number | null>(selectedCardId);
  const onSelectCardRef = useRef(onSelectCard);
  onSelectCardRef.current = onSelectCard;
  const onOpenTranslationRef = useRef(onOpenTranslation);
  onOpenTranslationRef.current = onOpenTranslation;

  useEffect(() => {
    const el = memoriaRef.current;
    if (!el) return;
    const mounted = mountMemoria(el, initialLangRef.current, {
      skipBoot: initialSkipBootRef.current,
      initialCardId: initialCardIdRef.current,
      onSelectCard: (cardId) => {
        onSelectCardRef.current?.(cardId);
      },
      onOpenTranslation: (cardId, url) => {
        onOpenTranslationRef.current?.(cardId, url);
      },
    });
    instanceRef.current = mounted;
    return () => {
      mounted.unmount();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    instanceRef.current?.setLang(lang);
  }, [lang]);

  useEffect(() => {
    instanceRef.current?.selectCardById(selectedCardId ?? null);
  }, [selectedCardId]);

  return (
    <div
      id="page-dating-memoria"
      className="cyber-events-scroll relative z-20 flex h-full w-full flex-col overflow-y-auto min-[821px]:overflow-y-hidden overflow-x-hidden bg-[var(--void)]"
    >
      {/* Header dùng chung (.site-header) */}
      <SiteHeader
        breadcrumbs={[
          {
            label: lang === 'VI' ? 'TRĂNG SOI DẶM TRƯỜNG' : 'MOONSTRIDE',
            onClick: () => {
              if (onBackHome) onBackHome();
              else onClose();
            },
          },
          {
            label: lang === 'VI' ? 'HẸN HÒ' : 'DATING',
            onClick: () => {
              if (onBackToDating) onBackToDating();
              else onClose();
            },
          },
          {
            label: 'MEMORIA',
          },
        ]}
        langLabel={onToggleLang ? lang : undefined}
        langTitle={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        langAriaLabel={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        onToggleLang={onToggleLang}
      />

      {/* Vùng chứa .memoria có chiều cao xác định trên PC (màn hình trừ header 56px), trên điện thoại tự cao theo nội dung */}
      <div className="min-[821px]:flex-1 min-[821px]:min-h-0 min-[821px]:h-[calc(100dvh-56px)] max-[820px]:h-auto max-[820px]:flex-none">
        <div ref={memoriaRef} className="memoria"></div>
      </div>
    </div>
  );
};

