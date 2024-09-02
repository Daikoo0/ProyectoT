//import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import editorEN from './locales/en/Editor.json';
import homeEN from './locales/en/Home.json';
import editorES from './locales/es/Editor.json';
import homeES from './locales/es/Home.json';
import pdfES from './locales/es/PDF.json';
import pdfEN from './locales/en/PDF.json';
import loginES from './locales/es/Login.json';
import loginEN from './locales/en/Login.json';
import DescriptionES from './locales/es/Description.json';
import DescriptionEN from './locales/en/Description.json';
import PatternsES from './locales/es/Patterns.json';
import PatternsEN from './locales/en/Patterns.json';
import PerfilES from './locales/es/Perfil.json';
import PerfilEN from './locales/en/Perfil.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      Editor: editorEN,
      Home: homeEN,
      PDF : pdfEN,
      Login : loginEN,
      Description : DescriptionEN,
      Patterns : PatternsEN,
      Perfil: PerfilEN
    },
    es: {
        Editor: editorES,
        Home: homeES,
        PDF : pdfES,
        Login : loginES,
        Description : DescriptionES,
        Patterns : PatternsES,
        Perfil: PerfilES
    },
  },
    fallbackLng: "en",
    ns: ['PDF', 'Home','Editor','Login','Description','Patterns','Perfil'],
    interpolation: {
        escapeValue: false
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
    <App />,
 // </React.StrictMode>
)
