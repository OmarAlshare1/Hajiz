'use client';

import { useLanguage } from '../contexts/LanguageContext';
import enTranslations from '../translations/en.json';
import arTranslations from '../translations/ar.json';

type TranslationKey = keyof typeof enTranslations;
type NestedTranslationKey<T> = T extends object ? keyof T : never;

export const useTranslations = (namespace?: string) => {
  const { language } = useLanguage();
  
  const translations = language === 'en' ? enTranslations : arTranslations;
  
  const t = (key: string, fallback?: string) => {
    try {
      if (namespace) {
        const namespaceTranslations = (translations as any)[namespace];
        if (namespaceTranslations && typeof namespaceTranslations === 'object') {
          return namespaceTranslations[key] || fallback || key;
        }
        return fallback || key;
      }
      
      // Handle nested keys like 'Common.home' or simple keys
      if (key.includes('.')) {
        const keys = key.split('.');
        let value: any = translations;
        
        for (const k of keys) {
          value = value?.[k];
          if (value === undefined) {
            return fallback || key; // Return fallback or key if translation not found
          }
        }
        
        return value || fallback || key;
      } else {
        // Simple key - direct access
        const value = (translations as any)[key];
        return value || fallback || key;
      }
    } catch (error) {
      console.error('Translation error:', error);
      return fallback || key;
    }
  };
  
  return { t };
};