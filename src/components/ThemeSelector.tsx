import { useState, useRef, useEffect } from 'react';
import { useTheme, type ThemeName } from '../contexts/ThemeContext';

// ─── Theme Selector Component ─────────────────────────────────────────────────

export function ThemeSelector() {
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-2 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-zinc-400 hover:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all shadow-md active:scale-95 w-full"
        title="Theme"
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {currentTheme.displayName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-40 bg-zinc-950 border border-zinc-800/80 rounded-xl p-1.5 shadow-2xl z-50">
          {availableThemes.map((theme) => {
            const isActive = themeName === theme.name;
            return (
              <button
                key={theme.name}
                onClick={() => handleThemeChange(theme.name)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-zinc-400 hover:bg-purple-500/10 hover:text-white'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full border border-zinc-700"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                  }}
                />
                {theme.displayName}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
