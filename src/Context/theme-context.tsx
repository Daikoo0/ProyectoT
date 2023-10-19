import { createContext, useState, useContext, ReactNode, useEffect } from "react";


type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const localThemePreference = localStorage.getItem('isDarkMode');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(localThemePreference ? JSON.parse(localThemePreference) : false);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      }
    
  }, [isDarkMode]);

  console.log(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
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


