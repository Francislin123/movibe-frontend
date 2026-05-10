/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Theme Color Tokens ─────────────────────────────────────────────────────
      colors: {
        // Dynamic theme colors (will be overridden by CSS variables)
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primaryHover)',
        'primary-light': 'var(--color-primaryLight)',
        'primary-dark': 'var(--color-primaryDark)',
        
        background: 'var(--color-background)',
        'bg-secondary': 'var(--color-backgroundSecondary)',
        'bg-tertiary': 'var(--color-backgroundTertiary)',
        
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surfaceHover)',
        'surface-border': 'var(--color-surfaceBorder)',
        
        'text-primary': 'var(--color-textPrimary)',
        'text-secondary': 'var(--color-textSecondary)',
        'text-tertiary': 'var(--color-textTertiary)',
        'text-inverse': 'var(--color-textInverse)',
        
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accentHover)',
        
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        
        // Static colors for fallbacks
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      
      // ─── Component-specific Styles ───────────────────────────────────────────────
      boxShadow: {
        'theme': 'var(--color-shadow)',
        'theme-light': 'var(--color-shadowLight)',
      },
      
      // ─── Animation and Transitions ───────────────────────────────────────────────
      transitionProperty: {
        'theme': 'background-color, border-color, color, box-shadow',
      },
      
      // ─── Border Radius ───────────────────────────────────────────────────────────
      borderRadius: {
        'theme': '0.5rem',
        'theme-lg': '0.75rem',
        'theme-xl': '1rem',
      },
      
      // ─── Spacing ────────────────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // ─── Typography ─────────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      
      // ─── Animation Keyframes ───────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
