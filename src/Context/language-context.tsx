import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextProps {
  language: string;
  changeLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('es'); 
 
  const changeLanguage = async (lang: string) => {
    setLanguage(lang);

    localStorage.setItem('language', lang);

    const requestJson = await fetch(`../../src/${lang}.json`);
    const texts = await requestJson.json();

    const textsToChange = document.querySelectorAll("[data-section]") as NodeListOf<HTMLElement>;
    
    textsToChange.forEach((textToChange) => {
      const section = textToChange.dataset.section as string;
      const value = textToChange.dataset.value as string;

      if (texts[section] && texts[section][value]) {
        textToChange.innerHTML = texts[section][value];
      }
    });
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'es';
    setLanguage(savedLanguage);
    changeLanguage(savedLanguage);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
