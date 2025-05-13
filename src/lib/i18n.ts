import i18next from 'i18next';

// Importar las traducciones directamente
import enTranslations from '@/locales/en/translation.json';
import esTranslations from '@/locales/es/translation.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

await i18next.init({
  lng: 'es',
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export const t = i18next.t;

export default i18next;
