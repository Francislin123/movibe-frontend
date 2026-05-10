// ─── Premium Design System Tokens ───────────────────────────────────────────────────

// ─── Spacing Scale ───────────────────────────────────────────────────────────────

export const spacing = {
  // Micro spacing (4px base)
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  '4xl': '2.5rem',  // 40px
  '5xl': '3rem',    // 48px
  '6xl': '4rem',    // 64px
  
  // Component specific
  cardPadding: '1.5rem',     // 24px
  cardGap: '1rem',           // 16px
  sectionGap: '2rem',        // 32px
  sidebarPadding: '1.5rem',  // 24px
  inputPadding: '0.75rem',   // 12px
  buttonPadding: '0.75rem',  // 12px
};

// ─── Border Radius Scale ───────────────────────────────────────────────────────

export const borderRadius = {
  // Micro radius
  xs: '0.25rem',    // 4px
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.25rem', // 20px
  '3xl': '1.5rem',  // 24px
  
  // Component specific
  button: '0.75rem',      // 12px
  card: '1rem',          // 16px
  modal: '1.25rem',      // 20px
  input: '0.75rem',      // 12px
  avatar: '0.75rem',     // 12px
  sidebarItem: '0.75rem', // 12px
  searchInput: '0.75rem', // 12px
};

// ─── Shadow System ───────────────────────────────────────────────────────────────

export const shadows = {
  // Base shadows
  none: 'none',
  
  // Premium shadows with glassmorphism
  sm: '0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.04)',
  md: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15)',
  '2xl': '0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)',
  
  // Component specific shadows
  card: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06)',
  cardHover: '0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  button: '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06)',
  buttonHover: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  modal: '0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15)',
  sidebar: '4px 0 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)',
  input: '0 2px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.04)',
  inputFocus: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(124, 58, 237, 0.4)',
  
  // Glow effects
  glowPrimary: '0 0 20px rgba(124, 58, 237, 0.4)',
  glowSuccess: '0 0 20px rgba(16, 185, 129, 0.4)',
  glowWarning: '0 0 20px rgba(245, 158, 11, 0.4)',
  glowError: '0 0 20px rgba(239, 68, 68, 0.4)',
  glowInfo: '0 0 20px rgba(59, 130, 246, 0.4)',
  
  // Combined shadows with glow
  cardGlow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(124, 58, 237, 0.35)',
  buttonGlow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 12px rgba(124, 58, 237, 0.35)',
  inputGlow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(124, 58, 237, 0.4), 0 0 12px rgba(124, 58, 237, 0.25)',
};

// ─── Typography Scale ───────────────────────────────────────────────────────────

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'monospace'],
    display: ['Inter', 'system-ui', 'sans-serif'],
  },
  
  // Font sizes
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],       // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
  },
  
  // Font weights
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ─── Animation Durations ─────────────────────────────────────────────────────────

export const animations = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// ─── Z-Index Scale ─────────────────────────────────────────────────────────────

export const zIndex = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  docked: '10',
  dropdown: '1000',
  sticky: '1100',
  banner: '1200',
  overlay: '1300',
  modal: '1400',
  popover: '1500',
  skipLink: '1600',
  toast: '1700',
  tooltip: '1800',
};

// ─── Breakpoints ───────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ─── Component Sizes ───────────────────────────────────────────────────────────

export const componentSizes = {
  // Button sizes
  button: {
    sm: {
      padding: '0.5rem 1rem',      // 8px 16px
      fontSize: '0.875rem',        // 14px
      borderRadius: '0.5rem',    // 8px
    },
    md: {
      padding: '0.75rem 1.5rem',   // 12px 24px
      fontSize: '0.875rem',        // 14px
      borderRadius: '0.75rem',    // 12px
    },
    lg: {
      padding: '1rem 2rem',        // 16px 32px
      fontSize: '1rem',            // 16px
      borderRadius: '0.75rem',    // 12px
    },
  },
  
  // Input sizes
  input: {
    sm: {
      padding: '0.5rem 0.75rem',   // 8px 12px
      fontSize: '0.875rem',        // 14px
      borderRadius: '0.5rem',    // 8px
    },
    md: {
      padding: '0.75rem 1rem',     // 12px 16px
      fontSize: '0.875rem',        // 14px
      borderRadius: '0.75rem',    // 12px
    },
    lg: {
      padding: '1rem 1.25rem',    // 16px 20px
      fontSize: '1rem',            // 16px
      borderRadius: '0.75rem',    // 12px
    },
  },
  
  // Card sizes
  card: {
    sm: {
      padding: '1rem',            // 16px
      borderRadius: '0.75rem',    // 12px
      gap: '0.75rem',             // 12px
    },
    md: {
      padding: '1.5rem',          // 24px
      borderRadius: '1rem',      // 16px
      gap: '1rem',               // 16px
    },
    lg: {
      padding: '2rem',            // 32px
      borderRadius: '1.25rem',    // 20px
      gap: '1.5rem',             // 24px
    },
  },
  
  // Avatar sizes
  avatar: {
    xs: { size: '1.5rem', fontSize: '0.625rem' },   // 24px, 10px
    sm: { size: '2rem', fontSize: '0.75rem' },      // 32px, 12px
    md: { size: '2.5rem', fontSize: '0.875rem' },   // 40px, 14px
    lg: { size: '3rem', fontSize: '1rem' },         // 48px, 16px
    xl: { size: '4rem', fontSize: '1.25rem' },      // 64px, 20px
    '2xl': { size: '6rem', fontSize: '1.5rem' },    // 96px, 24px
  },
};

// ─── Glassmorphism Presets ─────────────────────────────────────────────────────

export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  heavy: {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  darkMedium: {
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  darkHeavy: {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
};

// ─── Gradient Presets ───────────────────────────────────────────────────────────

export const gradients = {
  primary: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
  primaryDark: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
  error: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
  info: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  
  // Subtle gradients
  primarySubtle: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
  successSubtle: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
  warningSubtle: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(252, 211, 77, 0.05) 100%)',
  errorSubtle: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.05) 100%)',
  infoSubtle: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%)',
  
  // Special effects
  glow: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)',
  shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
};

// ─── Export Design System Object ─────────────────────────────────────────────────

export const designSystem = {
  spacing,
  borderRadius,
  shadows,
  typography,
  animations,
  zIndex,
  breakpoints,
  componentSizes,
  glassmorphism,
  gradients,
};

export default designSystem;
