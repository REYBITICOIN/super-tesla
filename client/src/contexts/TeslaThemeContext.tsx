import React, { createContext, useContext, useState, useEffect } from 'react';

export type TeslaTheme = 'black' | 'white' | 'gray' | 'electricity';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  electricBlue: string;
  electricViolet: string;
}

const TESLA_THEMES: Record<TeslaTheme, ThemeColors> = {
  // Tema Preto - Trajes formais de Tesla
  black: {
    primary: '#000000',
    secondary: '#1a1a1a',
    accent: '#4a9eff',
    background: '#0a0a0a',
    surface: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    border: '#333333',
    electricBlue: '#4a9eff',
    electricViolet: '#7c3aed',
  },
  // Tema Branco - Camisas brancas de Tesla
  white: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    accent: '#0066cc',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#000000',
    textSecondary: '#555555',
    border: '#e0e0e0',
    electricBlue: '#0066cc',
    electricViolet: '#6b21a8',
  },
  // Tema Cinza - Luvas cinzas de Tesla
  gray: {
    primary: '#808080',
    secondary: '#a9a9a9',
    accent: '#4a9eff',
    background: '#2a2a2a',
    surface: '#3a3a3a',
    text: '#f0f0f0',
    textSecondary: '#c0c0c0',
    border: '#555555',
    electricBlue: '#4a9eff',
    electricViolet: '#7c3aed',
  },
  // Tema Eletricidade - Azul/Violeta das bobinas Tesla
  electricity: {
    primary: '#4a9eff',
    secondary: '#7c3aed',
    accent: '#06b6d4',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#334155',
    electricBlue: '#4a9eff',
    electricViolet: '#7c3aed',
  },
};

interface TeslaThemeContextType {
  theme: TeslaTheme;
  setTheme: (theme: TeslaTheme) => void;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const TeslaThemeContext = createContext<TeslaThemeContextType | undefined>(undefined);

export const TeslaThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<TeslaTheme>(() => {
    // Recuperar tema salvo do localStorage
    const saved = localStorage.getItem('tesla-theme');
    return (saved as TeslaTheme) || 'black';
  });

  const setTheme = (newTheme: TeslaTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('tesla-theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const themes: TeslaTheme[] = ['black', 'white', 'gray', 'electricity'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const applyTheme = (selectedTheme: TeslaTheme) => {
    const colors = TESLA_THEMES[selectedTheme];
    const root = document.documentElement;

    // Aplicar cores como variáveis CSS
    root.style.setProperty('--tesla-primary', colors.primary);
    root.style.setProperty('--tesla-secondary', colors.secondary);
    root.style.setProperty('--tesla-accent', colors.accent);
    root.style.setProperty('--tesla-background', colors.background);
    root.style.setProperty('--tesla-surface', colors.surface);
    root.style.setProperty('--tesla-text', colors.text);
    root.style.setProperty('--tesla-text-secondary', colors.textSecondary);
    root.style.setProperty('--tesla-border', colors.border);
    root.style.setProperty('--tesla-electric-blue', colors.electricBlue);
    root.style.setProperty('--tesla-electric-violet', colors.electricViolet);

    // Aplicar ao body
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text;
  };

  // Aplicar tema ao montar
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const colors = TESLA_THEMES[theme];

  return (
    <TeslaThemeContext.Provider value={{ theme, setTheme, colors, toggleTheme }}>
      {children}
    </TeslaThemeContext.Provider>
  );
};

export const useTeslaTheme = () => {
  const context = useContext(TeslaThemeContext);
  if (!context) {
    throw new Error('useTeslaTheme must be used within TeslaThemeProvider');
  }
  return context;
};
