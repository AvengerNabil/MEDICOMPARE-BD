'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, translations } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof translations.en;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('medicompare_locale') as Locale;
    if (saved === 'en' || saved === 'bn') {
      setLocale(saved);
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('medicompare_locale', newLocale);
  };

  const toggleLocale = () => {
    const next = locale === 'en' ? 'bn' : 'en';
    handleSetLocale(next);
  };

  const t = translations[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
