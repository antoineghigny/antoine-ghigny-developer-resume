import React from "react";
import {NextIntlClientProvider} from "next-intl";
import {setRequestLocale} from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{ children: React.ReactNode; params: {locale: string} }>) {
  setRequestLocale(locale);
  const supported = ['en','fr','nl'] as const;
  const resolved = (supported as readonly string[]).includes(locale) ? locale : 'en';
  const messages = (await import(`@/messages/${resolved}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LanguageSwitcher />
      {children}
    </NextIntlClientProvider>
  );
}
