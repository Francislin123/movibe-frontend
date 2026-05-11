import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// ─── Language Selector Component ───────────────────────────────────────────────

type Lang = 'pt-BR' | 'en-US' | 'es-ES';

const LANGS: { code: Lang; flag: string; labelKey: string }[] = [
  { code: 'pt-BR', flag: '🇧🇷', labelKey: 'language.pt' },
  { code: 'en-US', flag: '🇺🇸', labelKey: 'language.en' },
  { code: 'es-ES', flag: '🇪🇸', labelKey: 'language.es' },
];

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language as Lang) || 'pt-BR';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleChange = (lang: Lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('movibe-language', lang);
    setIsOpen(false);
  };

  const active = LANGS.find((l) => l.code === currentLang) ?? LANGS[0];

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-2.5 rounded-xl border border-surfaceBorder bg-surface hover:bg-surfaceHover transition-all duration-200 w-full"
        title={t('language.label')}
      >
        <span className="text-base">{active.flag}</span>
        <span className="text-sm font-semibold text-textSecondary group-hover:text-textPrimary transition-colors flex-1 text-left">
          {t(active.labelKey)}
        </span>
        <svg
          className={`w-4 h-4 text-textTertiary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-surfaceBorder rounded-2xl shadow-premium-xl z-30 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-2 space-y-1">
            <p className="text-[10px] font-bold text-textTertiary uppercase tracking-widest px-2 mb-1">
              {t('language.label')}
            </p>
            {LANGS.map((lang) => {
              const isActive = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-surfaceHover border border-transparent'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className={`text-sm font-semibold flex-1 ${isActive ? 'text-primary' : 'text-textPrimary'}`}>
                    {t(lang.labelKey)}
                  </span>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
