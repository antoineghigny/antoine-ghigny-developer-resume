import {createNavigation} from 'next-intl/navigation';

export const locales = ['en', 'fr', 'nl'] as const;

export const {Link, redirect, usePathname, useRouter} = createNavigation({
  locales,
  localePrefix: 'always'
});
