import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from './pt-BR.json';
import enUS from './en-US.json';
import esES from './es-ES.json';

const resources = {
  'pt-BR': { translation: ptBR.app },
  'en-US': { translation: enUS.app },
  'es-ES': { translation: esES.app },
  'pt': { translation: ptBR.app },
  'en': { translation: enUS.app },
  'es': { translation: esES.app },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'movibe-language',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
