// ─── Purple Premium Design System Tokens ───────────────────────────────────────────

// ─── Purple Dark Color Palette ───────────────────────────────────────────────

export const colors = {
  // Primary Purple Palette
  primary: {
    50: '#F3F0FF',
    100: '#E9D5FF',
    200: '#D8B4FE',
    300: '#C084FC',
    400: '#A855F7',
    500: '#9333EA',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#312E81',
  },

  // Background Colors
  background: {
    primary: '#07070A',      // Main background
    secondary: '#0D0D12',    // Secondary background (cards, sidebar)
    tertiary: '#111118',     // Tertiary background (hover states)
    elevated: '#181824',     // Elevated backgrounds (modals, dropdowns)
  },

  // Surface Colors
  surface: {
    primary: '#0D0D12',      // Main surface (cards)
    secondary: '#111118',    // Secondary surface
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',        // Main text
    secondary: '#A1A1AA',   // Secondary text
    tertiary: '#6B7280',    // Tertiary text
    disabled: '#4B5563',    // Disabled text
  },

  // Purple Variants for UI Elements
  purple: {
    light: '#D8B4FE',
    DEFAULT: '#7C3AED',
    dark: '#6D28D9',
    glow: 'rgba(124, 58, 237, 0.35)',
    glowStrong: 'rgba(124, 58, 237, 0.6)',
    hover: '#8B5CF6',
    active: '#A855F7',
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

// ─── Purple Glassmorphism Presets ─────────────────────────────────────────────

export const purpleGlassmorphism = {
  // Light glassmorphism for cards
  light: {
    background: 'rgba(124, 58, 237, 0.08)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(124, 58, 237, 0.12)',
    shadow: '0 8px 32px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.06)',
  },

  // Medium glassmorphism for interactive elements
  medium: {
    background: 'rgba(124, 58, 237, 0.12)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(124, 58, 237, 0.18)',
    shadow: '0 12px 40px rgba(124, 58, 237, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  },
  darkMedium: {
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    shadow: '0 12px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  },

  // Heavy glassmorphism for focused/active states
  heavy: {
    background: 'rgba(124, 58, 237, 0.18)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(124, 58, 237, 0.25)',
    shadow: '0 16px 48px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  },

  // Glow effects
  glow: {
    subtle: '0 0 20px rgba(124, 58, 237, 0.3)',
    medium: '0 0 30px rgba(124, 58, 237, 0.4)',
    strong: '0 0 40px rgba(124, 58, 237, 0.5)',
  },
};

// ─── Purple Gradients ─────────────────────────────────────────────────────

export const purpleGradients = {
  primary: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A855F7 100%)',
  primaryDark: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
  primarySubtle: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
  
  // Animated gradients
  animated: {
    pulse: 'linear-gradient(270deg, #7C3AED, #8B5CF6, #7C3AED)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.1), transparent)',
    wave: 'linear-gradient(45deg, #7C3AED, #A855F7, #8B5CF6, #7C3AED)',
  },

  // Card gradients
  card: {
    default: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
    hover: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
    active: 'linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(139, 92, 246, 0.08) 100%)',
  },

  // Background gradients
  background: {
    subtle: 'radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.05) 0%, transparent 50%)',
    mesh: 'linear-gradient(135deg, #07070A 0%, #0D0D12 50%, #111118 100%)',
  },
};

// ─── Purple Animation Presets ─────────────────────────────────────────────

export const purpleAnimations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing functions
  easing: {
    purple: 'cubic-bezier(0.4, 0, 0.2, 1)', // Custom purple easing
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Keyframes
  keyframes: {
    glow: {
      '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
      '50%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.5)' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.7' },
    },
    shimmer: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
  },
};

// ─── Purple Shadow System ─────────────────────────────────────────────────────

export const purpleShadows = {
  // Base shadows
  none: 'none',
  sm: '0 2px 8px rgba(124, 58, 237, 0.1)',
  md: '0 4px 16px rgba(124, 58, 237, 0.15)',
  lg: '0 8px 32px rgba(124, 58, 237, 0.2)',
  xl: '0 16px 48px rgba(124, 58, 237, 0.25)',
  '2xl': '0 24px 64px rgba(124, 58, 237, 0.3)',

  // Component-specific shadows
  card: '0 8px 32px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.06)',
  cardHover: '0 12px 40px rgba(124, 58, 237, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  button: '0 4px 12px rgba(124, 58, 237, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06)',
  buttonHover: '0 8px 24px rgba(124, 58, 237, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  input: '0 2px 8px rgba(124, 58, 237, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.04)',
  inputFocus: '0 4px 16px rgba(124, 58, 237, 0.2), 0 0 0 1px rgba(124, 58, 237, 0.4)',
  modal: '0 24px 48px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  sidebar: '4px 0 24px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.06)',
};

// ─── Export Purple Design System Object ─────────────────────────────────────────

export const purpleDesignSystem = {
  colors,
  purpleGlassmorphism,
  purpleGradients,
  purpleAnimations,
  purpleShadows,
};

export default purpleDesignSystem;
