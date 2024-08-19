import { createContext, useState, useContext, ReactNode, useEffect } from "react";

const themes = [
  "bumblebee","lofi","light", "cupcake", "emerald", "corporate", "synthwave",
  "retro", "cyberpunk", "valentine", "halloween", "garden", "black", "dracula",
  "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter",
  "dim", "nord", "sunset"
];

type ThemeContextType = {
  currentTheme: string;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
};

const ThemeContext = createContext<ThemeContextType>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const localThemePreference = localStorage.getItem('theme');
  const [currentTheme, setCurrentTheme] = useState<string>(localThemePreference || 'light');

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    const html = document.documentElement;
    html.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (themeName: string) => {
    if (themes.includes(themeName)) {
      setCurrentTheme(themeName);
    } else {
      console.warn(`El tema '${themeName}' no es reconocido. Utilizando tema por defecto.`);
      setCurrentTheme('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
};
