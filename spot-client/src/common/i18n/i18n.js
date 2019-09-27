import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import englishTranslations from './en.json';

i18n.use(initReactI18next)
    .init({
        fallbackLng: 'en',
        resources: {
            en: {
                translation: englishTranslations
            }
        },
        lng: 'en',
        interpolation: {
            escapeValue: false // react already safe from xss
        }
    });

export default i18n;
