export const i18nConfig = {
  locales: ['ru', 'en', 'de'],
  defaultLocale: 'ru'
};

export type Locale = (typeof i18nConfig)['locales'][number];
