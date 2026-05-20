import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// ─── Language Selector Component ───────────────────────────────────────────────

type Lang = 'pt-BR' | 'en-US' | 'es-ES';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'pt-BR', label: 'Português' },
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Español' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
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

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-2 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-zinc-400 hover:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all shadow-md active:scale-95 w-full"
        title="Language"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {LANGS.find(l => l.code === currentLang)?.label || 'Language'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-32 bg-zinc-950 border border-zinc-800/80 rounded-xl p-1.5 shadow-2xl z-50">
          {LANGS.map((lang) => {
            const isActive = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-zinc-400 hover:bg-purple-500/10 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
