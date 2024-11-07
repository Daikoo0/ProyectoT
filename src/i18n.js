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
import AboutES from './locales/es/About.json';
import AboutEN from './locales/en/About.json';
import createProjectES from './locales/es/create_project.json';
import createProjectEN from './locales/en/create_project.json';
import InvitationES from './locales/es/Invitation.json';
import InvitationEN from './locales/en/Invitation.json';
import FossilsEN from './locales/en/fossils.json';
import FossilsES from './locales/es/fossils.json';

i18n
.use(initReactI18next).init({
    resources: {
        en: {
            Editor: editorEN,
            Home: homeEN,
            PDF: pdfEN,
            Login: loginEN,
            Description: DescriptionEN,
            Patterns: PatternsEN,
            Perfil: PerfilEN,
            About: AboutEN,
            CProject: createProjectEN,
            Invitation: InvitationEN,
            Fossils: FossilsEN,
        },
        es: {
            Editor: editorES,
            Home: homeES,
            PDF: pdfES,
            Login: loginES,
            Description: DescriptionES,
            Patterns: PatternsES,
            Perfil: PerfilES,
            About: AboutES,
            CProject: createProjectES,
            Invitation: InvitationES,
            Fossils: FossilsES,
        },
    },
    fallbackLng: localStorage.getItem("user-lang") || 'es',
    ns: ['PDF', 'Home', 'Editor', 'Login', 'Description', 'Patterns', 'Perfil', 'About', 'CProject', 'Invitation', 'Fossils'],
    interpolation: {
        escapeValue: false
    },
});

export default i18n;