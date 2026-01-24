"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import enTranslations from "@/messages/en.json";
import arTranslations from "@/messages/ar.json";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  direction: "ltr" | "rtl";
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, any>> = {
  en: enTranslations,
  ar: arTranslations,
};

// Translation function
function translate(
  key: string,
  lang: Language,
  params?: Record<string, string | number>
): string {
  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      value = translations.en;
      for (const k2 of keys) {
        if (value && typeof value === "object" && k2 in value) {
          value = value[k2];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }

  if (typeof value !== "string") {
    return key;
  }

  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }

  return value;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language;
      // Default to Arabic, convert English to Arabic if saved
      if (saved === "en" || saved === "ar") {
        return saved === "en" ? "ar" : saved;
      }
      return "ar";
    }
    return "ar";
  });

  const direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
      document.documentElement.setAttribute("dir", direction);
      document.documentElement.setAttribute("lang", language);
    }
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(key, language, params);
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
