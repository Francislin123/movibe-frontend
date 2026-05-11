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
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-surfaceBorder bg-surface hover:bg-surfaceHover transition-all duration-200 w-full"
        title="Selecionar tema"
      >
        <div
          className="w-5 h-5 rounded-lg border border-surfaceBorder shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.accent} 100%)`,
            boxShadow: `0 0 12px ${currentTheme.colors.shadowGlow}`
          }}
        />
        <span className="text-sm font-semibold text-textSecondary group-hover:text-textPrimary transition-colors flex-1 text-left">
          {currentTheme.displayName}
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

      {/* Premium Dropdown Panel */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-surfaceBorder rounded-2xl shadow-premium-xl z-30 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-3 space-y-2">
            <p className="text-[10px] font-bold text-textTertiary uppercase tracking-widest px-1 mb-1">
              Tema Visual
            </p>
            {availableThemes.map((theme) => {
              const isActive = themeName === theme.name;
              return (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-surfaceHover border border-transparent'
                  }`}
                >
                  {/* Color Palette Preview */}
                  <div
                    className="w-10 h-10 rounded-lg border border-surfaceBorder shadow-sm shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: theme.colors.background }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1/2"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1/2"
                      style={{ backgroundColor: theme.colors.surface }}
                    />
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-textPrimary'}`}>
                      {theme.displayName}
                    </p>
                    <p className="text-[10px] text-textTertiary truncate">
                      {theme.colors.background === '#ffffff' || theme.colors.background === '#fafafa'
                        ? 'Light mode'
                        : 'Dark mode'}
                    </p>
                  </div>

                  {/* Active Indicator */}
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
