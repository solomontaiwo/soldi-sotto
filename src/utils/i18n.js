// i18n.js - i18next configuration for React internationalization
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from '../locales/en/translation.json';
import translationIT from '../locales/it/translation.json';

// The translations
const resources = {
  en: { translation: translationEN },
  it: { translation: translationIT },
};

// Initialize i18next
// This will detect the user's language and fallback to Italian if not found
// You can add more options as needed

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n; 