import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ─── Theme Types ───────────────────────────────────────────────────────────────

export type ThemeName = 
  | 'purple-dark'
  | 'purple-light'
  | 'black-purple'
  | 'white-purple'
  | 'neon-purple'
  | 'minimal-purple'
  | 'black-purple-premium';

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    // Primary purple variations
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primaryDark: string;
    
    // Background colors
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    
    // Surface colors (cards, modals)
    surface: string;
    surfaceHover: string;
    surfaceBorder: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    
    // Accent colors
    accent: string;
    accentHover: string;
    
    // State colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Shadow colors
    shadow: string;
    shadowLight: string;
    shadowGlow: string;
  };
}

// ─── Theme Definitions ─────────────────────────────────────────────────────────

export const themes: Record<ThemeName, Theme> = {
  'purple-dark': {
    name: 'purple-dark',
    displayName: 'Purple Dark',
    colors: {
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      primaryLight: '#a78bfa',
      primaryDark: '#5b21b6',
      
      background: '#0f0f0f',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#262626',
      
      surface: '#1f1f1f',
      surfaceHover: '#2a2a2a',
      surfaceBorder: '#333333',
      
      textPrimary: '#ffffff',
      textSecondary: '#a3a3a3',
      textTertiary: '#737373',
      textInverse: '#000000',
      
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowLight: 'rgba(0, 0, 0, 0.1)',
      shadowGlow: 'rgba(124, 58, 237, 0.2)',
    },
  },
  
  'purple-light': {
    name: 'purple-light',
    displayName: 'Purple Light',
    colors: {
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      primaryLight: '#a78bfa',
      primaryDark: '#5b21b6',
      
      background: '#fafafa',
      backgroundSecondary: '#ffffff',
      backgroundTertiary: '#f5f5f5',
      
      surface: '#ffffff',
      surfaceHover: '#f9fafb',
      surfaceBorder: '#e5e7eb',
      
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      textTertiary: '#9ca3af',
      textInverse: '#ffffff',
      
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowLight: 'rgba(0, 0, 0, 0.05)',
      shadowGlow: 'rgba(124, 58, 237, 0.15)',
    },
  },
  
  'black-purple': {
    name: 'black-purple',
    displayName: 'Black Purple',
    colors: {
      primary: '#9333ea',
      primaryHover: '#7e22ce',
      primaryLight: '#a855f7',
      primaryDark: '#6b21a8',
      
      background: '#000000',
      backgroundSecondary: '#111111',
      backgroundTertiary: '#1a1a1a',
      
      surface: '#0a0a0a',
      surfaceHover: '#1a1a1a',
      surfaceBorder: '#2a2a2a',
      
      textPrimary: '#ffffff',
      textSecondary: '#d1d5db',
      textTertiary: '#9ca3af',
      textInverse: '#000000',
      
      accent: '#a855f7',
      accentHover: '#9333ea',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      shadow: 'rgba(0, 0, 0, 0.5)',
      shadowLight: 'rgba(0, 0, 0, 0.2)',
      shadowGlow: 'rgba(147, 51, 234, 0.3)',
    },
  },
  
  'white-purple': {
    name: 'white-purple',
    displayName: 'White Purple',
    colors: {
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      primaryLight: '#a78bfa',
      primaryDark: '#5b21b6',
      
      background: '#ffffff',
      backgroundSecondary: '#fafafa',
      backgroundTertiary: '#f3f4f6',
      
      surface: '#ffffff',
      surfaceHover: '#f9fafb',
      surfaceBorder: '#e5e7eb',
      
      textPrimary: '#111827',
      textSecondary: '#4b5563',
      textTertiary: '#6b7280',
      textInverse: '#ffffff',
      
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      shadow: 'rgba(0, 0, 0, 0.08)',
      shadowLight: 'rgba(0, 0, 0, 0.03)',
      shadowGlow: 'rgba(124, 58, 237, 0.1)',
    },
  },
  
  'neon-purple': {
    name: 'neon-purple',
    displayName: 'Neon Purple',
    colors: {
      primary: '#e879f9',
      primaryHover: '#d946ef',
      primaryLight: '#f0abfc',
      primaryDark: '#c026d3',
      
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2a2a2a',
      
      surface: '#1a1a1a',
      surfaceHover: '#2a2a2a',
      surfaceBorder: '#3a3a3a',
      
      textPrimary: '#ffffff',
      textSecondary: '#e879f9',
      textTertiary: '#a855f7',
      textInverse: '#000000',
      
      accent: '#f0abfc',
      accentHover: '#e879f9',
      
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff0066',
      info: '#00ddff',
      
      shadow: 'rgba(232, 121, 249, 0.3)',
      shadowLight: 'rgba(232, 121, 249, 0.1)',
      shadowGlow: 'rgba(232, 121, 249, 0.4)',
    },
  },
  
  'minimal-purple': {
    name: 'minimal-purple',
    displayName: 'Minimal Purple',
    colors: {
      primary: '#6b7280',
      primaryHover: '#4b5563',
      primaryLight: '#9ca3af',
      primaryDark: '#374151',
      
      background: '#fafafa',
      backgroundSecondary: '#ffffff',
      backgroundTertiary: '#f9fafb',
      
      surface: '#ffffff',
      surfaceHover: '#f9fafb',
      surfaceBorder: '#f3f4f6',
      
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textTertiary: '#9ca3af',
      textInverse: '#ffffff',
      
      accent: '#7c3aed',
      accentHover: '#6d28d9',
      
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      shadow: 'rgba(0, 0, 0, 0.05)',
      shadowLight: 'rgba(0, 0, 0, 0.02)',
      shadowGlow: 'rgba(124, 58, 237, 0.08)',
    },
  },
  
  'black-purple-premium': {
    name: 'black-purple-premium',
    displayName: 'Black Purple Premium',
    colors: {
      // Primary purple variations - SaaS premium
      primary: '#7C3AED',
      primaryHover: '#8B5CF6',
      primaryLight: '#A78BFA',
      primaryDark: '#6D28D9',
      
      // Background colors - Dark luxury
      background: '#07070A',
      backgroundSecondary: '#0D0D12',
      backgroundTertiary: '#111118',
      
      // Surface colors - Glassmorphism
      surface: '#111118',
      surfaceHover: '#181824',
      surfaceBorder: 'rgba(255,255,255,0.06)',
      
      // Text colors - Premium contrast
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
      textTertiary: '#71717A',
      textInverse: '#000000',
      
      // Accent colors - Purple glow
      accent: '#8B5CF6',
      accentHover: '#7C3AED',
      
      // State colors - Enhanced visibility
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      
      // Shadow colors - Premium depth
      shadow: 'rgba(0, 0, 0, 0.4)',
      shadowLight: 'rgba(0, 0, 0, 0.1)',
      shadowGlow: 'rgba(124, 58, 237, 0.35)',
    },
  },
};

// ─── Theme Context ─────────────────────────────────────────────────────────────

interface ThemeContextType {
  currentTheme: Theme;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─── Theme Provider ───────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

export function ThemeProvider({ children, defaultTheme = 'purple-dark' }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    // Load theme from localStorage or use default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('movibe-theme') as ThemeName;
      return saved && themes[saved] ? saved : defaultTheme;
    }
    return defaultTheme;
  });

  const currentTheme = themes[themeName];

  const setTheme = (newTheme: ThemeName) => {
    setThemeName(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('movibe-theme', newTheme);
    }
  };

  // Apply theme colors to CSS variables
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const colors = currentTheme.colors;
      
      // Apply all theme colors as CSS variables
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      
      // Apply theme name as data attribute for additional styling
      root.setAttribute('data-theme', themeName);
    }
  }, [currentTheme, themeName]);

  const value: ThemeContextType = {
    currentTheme,
    themeName,
    setTheme,
    availableThemes: Object.values(themes),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook to use theme ─────────────────────────────────────────────────────────

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
