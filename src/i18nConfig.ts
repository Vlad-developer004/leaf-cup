export const i18nConfig = {
  locales: ['ru', 'en', 'de'],
  defaultLocale: 'ru',

  serverSetCookie: 'never' as const
};

export type Locale = (typeof i18nConfig)['locales'][number];
