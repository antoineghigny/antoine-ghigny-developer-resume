import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  const supported = ['en', 'fr', 'nl'] as const;
  const fallback = 'en';
  const resolved = (locale && (supported as readonly string[]).includes(locale)) ? locale : fallback;

  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default
  };
});
