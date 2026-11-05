import React from 'react';
import { soundFx } from '../utils/soundFx';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  id?: string;
  title?: string;
}

export interface SiteSubTabItem {
  id: string;
  label: string;
}

interface SiteHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  langLabel?: string;
  langButtonId?: string;
  langTitle?: string;
  langAriaLabel?: string;
  onToggleLang?: () => void;
  subTabs?: SiteSubTabItem[];
  activeSubTabId?: string;
  onSelectSubTab?: (id: string) => void;
  subTabsAriaLabel?: string;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  breadcrumbs,
  langLabel,
  langButtonId,
  langTitle,
  langAriaLabel,
  onToggleLang,
  subTabs,
  activeSubTabId,
  onSelectSubTab,
  subTabsAriaLabel = 'Sub Navigation',
}) => {
  const lastIndex = breadcrumbs.length - 1;

  return (
    <>
      <header className="site-header">
        <div className="wrap site-header-inner">
          <nav aria-label="Breadcrumb" className="site-crumb">
            {breadcrumbs.map((item, idx) => {
              const isCurrent = idx === lastIndex;
              const isRoot = idx === 0;

              if (isCurrent) {
                if (item.onClick) {
                  return (
                    <button
                      key={item.id || `${idx}-${item.label}`}
                      type="button"
                      id={item.id}
                      title={item.title}
                      onMouseEnter={() => soundFx.playHover()}
                      onClick={() => {
                        soundFx.playBack();
                        item.onClick?.();
                      }}
                      className="site-crumb-link site-crumb-current"
                    >
                      {item.label}
                    </button>
                  );
                }
                return (
                  <span
                    key={item.id || `${idx}-${item.label}`}
                    id={item.id}
                    aria-current="page"
                    className="site-crumb-current"
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <React.Fragment key={item.id || `${idx}-${item.label}`}>
                  <button
                    type="button"
                    id={item.id}
                    title={item.title}
                    onMouseEnter={() => soundFx.playHover()}
                    onClick={
                      item.onClick
                        ? () => {
                            soundFx.playBack();
                            item.onClick?.();
                          }
                        : undefined
                    }
                    className={`site-crumb-link ${isRoot ? 'site-crumb-root' : ''}`}
                  >
                    {item.label}
                  </button>
                  <span className="site-crumb-sep" aria-hidden="true">
                    &gt;
                  </span>
                </React.Fragment>
              );
            })}
          </nav>

          {langLabel !== undefined && (
            <button
              type="button"
              id={langButtonId}
              title={langTitle}
              aria-label={langAriaLabel}
              onMouseEnter={() => soundFx.playHover()}
              onClick={
                onToggleLang
                  ? () => {
                      soundFx.playSelect();
                      onToggleLang();
                    }
                  : undefined
              }
              className="site-lang-btn"
            >
              {langLabel}
            </button>
          )}
        </div>
      </header>

      {subTabs && subTabs.length > 0 && (
        <div className="site-subtabs">
          <div className="wrap h-full">
            <nav aria-label={subTabsAriaLabel} className="site-subtabs-nav">
              {subTabs.map((tab) => {
                const isActive = tab.id === activeSubTabId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onMouseEnter={() => {
                      if (!isActive) soundFx.playHover();
                    }}
                    onClick={() => {
                      soundFx.playSelect();
                      onSelectSubTab?.(tab.id);
                    }}
                    className={`site-subtab-btn ${isActive ? 'is-active' : ''}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
