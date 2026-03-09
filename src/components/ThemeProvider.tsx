import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDark: false,
  setTheme: () => {},
});

const getSystemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (theme: Theme) => {
  const isDark = theme === 'dark' || (theme === 'system' && getSystemDark());
  // Ionic Framework uses 'ion-palette-dark' on the html element
  document.documentElement.classList.toggle('ion-palette-dark', isDark);
  // Also add our own class for custom CSS
  document.body.classList.toggle('dark', isDark);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('billease-theme') as Theme) ?? 'system';
  });

  const isDark = theme === 'dark' || (theme === 'system' && getSystemDark());

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('billease-theme', t);
    applyTheme(t);
  };

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // React to system preference changes when in 'system' mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
