'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = (pref: ThemePreference) => {
    let resolved: 'light' | 'dark' = 'light';
    if (pref === 'dark') {
      resolved = 'dark';
    } else if (pref === 'light') {
      resolved = 'light';
    } else {
      // system
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  };

  // On mount: load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('talehue_theme') as ThemePreference | null;
    const pref = saved || 'system';
    setThemeState(pref);
    applyTheme(pref);

    // Listen to OS theme changes when in system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const current = localStorage.getItem('talehue_theme') as ThemePreference | null;
      if (!current || current === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = (pref: ThemePreference) => {
    setThemeState(pref);
    localStorage.setItem('talehue_theme', pref);
    applyTheme(pref);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
