import { createInstance, i18n } from 'i18next';
import { i18nConfig } from '../i18nConfig';
import enCommon from '@/locales/en/common.json';
import deCommon from '@/locales/de/common.json';
import ruCommon from '@/locales/ru/common.json';

const staticResources = {
  ru: { common: ruCommon },
  en: { common: enCommon },
  de: { common: deCommon }
};

export default async function initTranslations(
  locale: string,
  namespaces: string[],
  i18nInstance?: i18n,
  resources?: any
) {
  i18nInstance = i18nInstance || createInstance();
  
  const finalResources = resources || staticResources;

  await i18nInstance.init({
    lng: locale,
    resources: finalResources,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales
  });

  return {
    i18n: i18nInstance,
    resources: i18nInstance.services.resourceStore.data,
    t: i18nInstance.t
  };
}
