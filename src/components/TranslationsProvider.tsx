'use client';

import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ReactNode } from 'react';
import { i18nConfig } from '@/i18nConfig';

export default function TranslationsProvider({
  children,
  locale,
  namespaces,
  resources
}: {
  children: ReactNode;
  locale: string;
  namespaces: string[];
  resources: any;
}) {
  const i18n = createInstance();

  i18n.use(initReactI18next).init({
    lng: locale,
    resources,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales
  });

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
