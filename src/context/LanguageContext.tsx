import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { hi } from '../locales/hi';
import { hinglish } from '../locales/hinglish';
import { storage } from '../storage/localStorage';

export type Language = 'en' | 'hi' | 'hinglish';

const translations: Record<Language, any> = {
  en,
  hi,
  hinglish,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'user_selected_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return storage.get<Language>(LANGUAGE_STORAGE_KEY, 'en');
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storage.set(LANGUAGE_STORAGE_KEY, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
    }
  }, [language]);

  /**
   * t('key.path', { param: 'val' }) helper
   */
  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');

    // Lookup in active language
    let current: any = translations[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }

    // Fallback to English if missing
    if (typeof current !== 'string') {
      let fallbackCurrent: any = translations.en;
      for (const key of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && key in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[key];
        } else {
          fallbackCurrent = undefined;
          break;
        }
      }
      current = typeof fallbackCurrent === 'string' ? fallbackCurrent : path;
    }

    let result = current as string;

    // Parameter interpolation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
