import { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ─── Premium Search Input Component ─────────────────────────────────────────────

interface PremiumSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

export function PremiumSearchInput({ 
  value, 
  onChange, 
  placeholder = "Buscar usuários...", 
  className = '',
  onClear 
}: PremiumSearchInputProps) {
  const { currentTheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div 
      className={`
        relative group bg-surface bg-opacity-60 backdrop-blur-xl rounded-2xl 
        border border-surfaceBorder transition-all duration-300
        ${isFocused ? 'border-primary shadow-lg' : 'shadow-theme'}
        ${className}
      `}
      style={{
        boxShadow: isFocused 
          ? `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px ${currentTheme.colors.primary}40, 0 0 20px ${currentTheme.colors.shadowGlow}`
          : '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Glow Effect */}
      {isFocused && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.colors.shadowGlow} 0%, transparent 50%)`,
            filter: 'blur(20px)'
          }}
        />
      )}

      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg 
          className="w-5 h-5 text-textTertiary transition-colors group-focus-within:text-primary"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-4 bg-transparent text-textPrimary placeholder-textTertiary rounded-2xl focus:outline-none transition-colors"
        style={{
          fontSize: '0.95rem'
        }}
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg text-textTertiary hover:text-primary hover:bg-surfaceHover transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Loading Indicator (optional) */}
      {/* <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div> */}
    </div>
  );
}

// ─── Compact Search Input for Sidebar ─────────────────────────────────────────────

interface CompactSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CompactSearchInput({ 
  value, 
  onChange, 
  placeholder = "Buscar...", 
  className = ''
}: CompactSearchInputProps) {
  const { currentTheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div 
      className={`
        relative bg-surface bg-opacity-40 backdrop-blur-md rounded-xl 
        border border-surfaceBorder transition-all duration-200
        ${isFocused ? 'border-primary bg-opacity-60' : ''}
        ${className}
      `}
      style={{
        boxShadow: isFocused 
          ? `0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px ${currentTheme.colors.primary}40`
          : '0 2px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.04)'
      }}
    >
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg 
          className="w-4 h-4 text-textTertiary transition-colors"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2.5 bg-transparent text-textPrimary placeholder-textTertiary rounded-xl focus:outline-none text-sm transition-colors"
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 rounded-md text-textTertiary hover:text-primary transition-all duration-200"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
