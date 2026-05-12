import React from 'react';
import { colors, purpleGlassmorphism, purpleShadows } from '../../styles/purple-design-system';

interface PremiumInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  type?: 'text' | 'email' | 'search'
  icon?: React.ReactNode
  loading?: boolean
  disabled?: boolean
}

export default function PremiumInput({ 
  placeholder, 
  value, 
  onChange, 
  onFocus, 
  onBlur,
  type = 'text',
  icon,
  loading = false,
  disabled = false 
}: PremiumInputProps) {
  const [focused, setFocused] = React.useState(false);

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  return (
    <div className="relative">
      {/* Glow effect on focus */}
      <div 
        className={`
          absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
          ${focused ? 'opacity-100' : ''}
        `}
        style={{
          background: focused ? purpleGlassmorphism.glow.medium : 'transparent',
          boxShadow: focused ? purpleShadows.inputFocus : 'none',
        }}
      />
      
      {/* Input container with glassmorphism */}
      <div 
        className={`
          relative overflow-hidden rounded-xl
          ${purpleGlassmorphism.light.background}
          ${purpleGlassmorphism.light.backdropFilter}
          ${purpleGlassmorphism.light.border}
          ${purpleShadows.input}
          transition-all duration-300
          ${focused ? 'border-purple-500/40' : 'hover:border-purple-500/20'}
        `}
      >
        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 z-10 text-purple-400">
            {icon}
          </div>
        )}
        
        {/* Input field */}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pl-12 pr-4
            bg-transparent text-white placeholder:text-purple-300
            border-0 outline-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            transition-all duration-300
          `}
          style={{
            fontSize: '0.875rem',
            letterSpacing: '0.025em',
          }}
        />
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-4 top-1/2">
            <div 
              className="w-4 h-4 border-2 border-purple-500/30 border-t-transparent border-r-transparent rounded-full"
              style={{
                borderTopColor: colors.purple.DEFAULT,
                borderRightColor: colors.purple.DEFAULT,
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
        )}
      </div>
      
      {/* Subtle focus ring */}
      {focused && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: `0 0 0 3px ${colors.purple.DEFAULT}40`,
          }}
        />
      )}
    </div>
  );
}
