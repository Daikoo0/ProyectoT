import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function LangSelector() {
    const { i18n } = useTranslation();
    const [lang, setLang] = useState("en");

    const getUserBrowserLanguage = () => {
        const lang = window.navigator.language;

        if (lang.includes("es")) return "es";
        if (lang.includes("en")) return "en";

        return "en";
    };

    const handleLangSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLang = event.target.value;
        i18n.changeLanguage(selectedLang);
        setLang(selectedLang);
        localStorage.setItem("user-lang", selectedLang);  
    };

    useEffect(() => {
        const storedLang = localStorage.getItem("user-lang");
        if (storedLang) {
            i18n.changeLanguage(storedLang);
            setLang(storedLang);
        } else {
            const userBrowserLang = getUserBrowserLanguage();
            i18n.changeLanguage(userBrowserLang);
            setLang(userBrowserLang);
            localStorage.setItem("user-lang", userBrowserLang);  
        }
    }, []);

    return (
        <select className="select select-primary w-full max-w-xs" value={lang} onChange={handleLangSelect}>
            <option value="en">EN</option>
            <option value="es">ES</option>
        </select>
    );
}

export default LangSelector;
