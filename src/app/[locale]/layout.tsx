import { locales } from "@/i18n/dictionaries";
import SetLang from "@/components/SetLang";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  return (
    <>
      <SetLang locale={locale} />
      {children}
    </>
  );
}
