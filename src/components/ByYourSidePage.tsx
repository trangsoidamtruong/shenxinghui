import React, { useEffect, useRef } from 'react';
import { mountByYourSide, type MountedBys } from '../ke-ben-nguoi/bys';
import '../ke-ben-nguoi/bys.css';
import { SiteHeader } from './SiteHeader';

interface ByYourSidePageProps {
  lang: 'VI' | 'EN';
  isPhone?: boolean;
  onToggleLang?: () => void;
  onClose: () => void;
  onBackHome?: () => void;
  onBackToDating?: () => void;
}

export const ByYourSidePage: React.FC<ByYourSidePageProps> = ({
  lang,
  onToggleLang,
  onClose,
  onBackHome,
  onBackToDating,
}) => {
  const bysRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<MountedBys | null>(null);
  const onBackToDatingRef = useRef(onBackToDating);
  onBackToDatingRef.current = onBackToDating;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const el = bysRef.current;
    if (!el) return;
    document.documentElement.lang = lang === 'VI' ? 'vi' : 'en';
    const mounted = mountByYourSide(el, {
      onExit: () => {
        if (onBackToDatingRef.current) onBackToDatingRef.current();
        else onCloseRef.current();
      },
    });
    instanceRef.current = mounted;
    return () => {
      mounted.unmount();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'VI' ? 'vi' : 'en';
    document.dispatchEvent(new Event('langchange'));
  }, [lang]);

  return (
    <div
      id="page-dating-bys"
      className="relative z-20 flex h-full w-full flex-col overflow-hidden bg-[var(--void)]"
    >
      <SiteHeader
        breadcrumbs={[
          {
            label: lang === 'VI' ? 'TSDT' : 'MOONSTRIDE',
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
            label: lang === 'VI' ? 'KỂ BÊN NGƯỜI' : 'BY YOUR SIDE',
          },
        ]}
        langLabel={onToggleLang ? lang : undefined}
        langTitle={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        langAriaLabel={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        onToggleLang={onToggleLang}
      />

      <div ref={bysRef} className="bys-root flex-1 min-h-0" />
    </div>
  );
};
