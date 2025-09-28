'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'modern' | 'colorful' | 'professional';

export interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    gradient: {
      primary: string;
      secondary: string;
      hero: string;
    };
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    duration: string;
    ease: string;
  };
}

export const themes: Record<ThemeType, ThemeConfig> = {
  modern: {
    name: 'modern',
    displayName: 'Modern Minimalist',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        accent: '#2563eb',
      },
      gradient: {
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
    },
    borderRadius: '0.75rem',
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    animations: {
      duration: '300ms',
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  colorful: {
    name: 'colorful',
    displayName: 'Colorful Playful',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#06d6a0',
      background: '#fef7ff',
      surface: '#ffffff',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#ec4899',
      },
      gradient: {
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        secondary: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        hero: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      },
    },
    fonts: {
      heading: 'Poppins, system-ui, sans-serif',
      body: 'Open Sans, system-ui, sans-serif',
    },
    borderRadius: '1rem',
    shadows: {
      sm: '0 1px 2px 0 rgb(236 72 153 / 0.05)',
      md: '0 4px 6px -1px rgb(236 72 153 / 0.1)',
      lg: '0 10px 15px -3px rgb(236 72 153 / 0.1)',
      xl: '0 20px 25px -5px rgb(236 72 153 / 0.1)',
    },
    animations: {
      duration: '400ms',
      ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
  professional: {
    name: 'professional',
    displayName: 'Professional Corporate',
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#059669',
      background: '#ffffff',
      surface: '#f9fafb',
      text: {
        primary: '#111827',
        secondary: '#4b5563',
        accent: '#1f2937',
      },
      gradient: {
        primary: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
        secondary: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
        hero: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      },
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Source Sans Pro, system-ui, sans-serif',
    },
    borderRadius: '0.375rem',
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    animations: {
      duration: '250ms',
      ease: 'ease-in-out',
    },
  },
};

interface ThemeContextType {
  theme: ThemeType;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeType) => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeType;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'modern',
  storageKey = 'dibeli-theme'
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeType>(defaultTheme);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as ThemeType;
    if (stored && themes[stored]) {
      setThemeState(stored);
    }
  }, [storageKey]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const value = {
    theme,
    themeConfig: themes[theme],
    setTheme,
    availableThemes: Object.values(themes),
  };

  return (
    <ThemeContext.Provider value={value}>
      <div
        className="theme-wrapper"
        style={{
          '--theme-primary': themes[theme].colors.primary,
          '--theme-secondary': themes[theme].colors.secondary,
          '--theme-accent': themes[theme].colors.accent,
          '--theme-background': themes[theme].colors.background,
          '--theme-surface': themes[theme].colors.surface,
          '--theme-text-primary': themes[theme].colors.text.primary,
          '--theme-text-secondary': themes[theme].colors.text.secondary,
          '--theme-text-accent': themes[theme].colors.text.accent,
          '--theme-gradient-primary': themes[theme].colors.gradient.primary,
          '--theme-gradient-secondary': themes[theme].colors.gradient.secondary,
          '--theme-gradient-hero': themes[theme].colors.gradient.hero,
          '--theme-font-heading': themes[theme].fonts.heading,
          '--theme-font-body': themes[theme].fonts.body,
          '--theme-border-radius': themes[theme].borderRadius,
          '--theme-shadow-sm': themes[theme].shadows.sm,
          '--theme-shadow-md': themes[theme].shadows.md,
          '--theme-shadow-lg': themes[theme].shadows.lg,
          '--theme-shadow-xl': themes[theme].shadows.xl,
          '--theme-animation-duration': themes[theme].animations.duration,
          '--theme-animation-ease': themes[theme].animations.ease,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}