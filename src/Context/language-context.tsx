import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextProps {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  availableLanguages: string[];
}

const languages = ['es', 'en']; // Lista de idiomas disponibles
const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const localLanguagePreference = localStorage.getItem('language') || 'es';
  const [currentLanguage, setCurrentLanguage] = useState<string>(localLanguagePreference);

  const changeLanguageTexts = async (lang: string) => {
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
    localStorage.setItem('language', currentLanguage);
    changeLanguageTexts(currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setCurrentLanguage(lang);
    } else {
      console.warn(`El idioma '${lang}' no es reconocido. Utilizando idioma por defecto.`);
      setCurrentLanguage('en');
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, availableLanguages: languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
