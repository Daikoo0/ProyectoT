//import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./lang/en.json";
import es from "./lang/es.json";

i18n.use(initReactI18next).init({
    resources: {
        en: en,
        es: es,
    },
    fallbackLng: "en",
    interpolation: {
        escapeValue: false
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
    <App />,
 // </React.StrictMode>
)
