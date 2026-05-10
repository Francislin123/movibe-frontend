import { useState } from 'react';
import { useTheme, type ThemeName } from '../contexts/ThemeContext';

// ─── Theme Selector Component ─────────────────────────────────────────────────

export function ThemeSelector() {
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-surfaceBorder bg-surface hover:bg-surfaceHover transition-all duration-200"
        title="Selecionar tema"
      >
        <div 
          className="w-4 h-4 rounded-full border border-surfaceBorder shadow-sm"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            boxShadow: `0 0 12px ${currentTheme.colors.shadowGlow}`
          }}
        />
        <span className="text-sm font-medium text-textSecondary group-hover:text-textPrimary transition-colors">
          {currentTheme.displayName}
        </span>
        <svg
          className={`w-4 h-4 text-textTertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-surfaceBorder rounded-2xl shadow-theme z-20 backdrop-blur-xl">
            <div className="py-2">
              {availableThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-surfaceHover transition-all duration-200 ${
                    themeName === theme.name 
                      ? 'bg-primary bg-opacity-10 text-primary border-l-2 border-primary' 
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                  style={{
                    boxShadow: themeName === theme.name ? `inset 0 0 0 1px ${theme.colors.primary}20` : 'none'
                  }}
                >
                  {/* Color Preview */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full border border-surfaceBorder shadow-sm"
                      style={{ 
                        backgroundColor: theme.colors.primary,
                        boxShadow: `0 0 8px ${theme.colors.shadowGlow}`
                      }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-surfaceBorder"
                      style={{ backgroundColor: theme.colors.background }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-surfaceBorder"
                      style={{ backgroundColor: theme.colors.surface }}
                    />
                  </div>
                  
                  {/* Theme Name */}
                  <span className="font-medium">{theme.displayName}</span>
                  
                  {/* Active Indicator */}
                  {themeName === theme.name && (
                    <svg
                      className="w-4 h-4 text-primary ml-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Compact Theme Toggle (for mobile/small spaces) ─────────────────────────

interface CompactThemeToggleProps {
  className?: string;
}

export function CompactThemeToggle({ className = '' }: CompactThemeToggleProps) {
  const { themeName, setTheme, availableThemes } = useTheme();
  
  const themes = Object.values(availableThemes);
  const currentIndex = themes.findIndex(t => t.name === themeName);
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  const handleToggle = () => {
    setTheme(nextTheme.name);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors ${className}`}
      title={`Tema atual: ${availableThemes[currentIndex]?.displayName}. Clique para alterar.`}
    >
      <div 
        className="w-3 h-3 rounded-full border border-gray-300"
        style={{ backgroundColor: availableThemes[currentIndex]?.colors.primary }}
      />
      <span className="text-xs font-medium text-gray-600">
        {availableThemes[currentIndex]?.displayName}
      </span>
    </button>
  );
}
