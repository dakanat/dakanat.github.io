"use client";

import Link from "next/link";
import { useEffect } from "react";
import { pickLocale } from "@/i18n/dictionaries";

/**
 * The site is a static export, so the language choice happens in the browser: Japanese
 * visitors go to /ja/, everyone else to /en/. Without JavaScript, the links below remain.
 */
export default function RootPage() {
  useEffect(() => {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    window.location.replace(`/${pickLocale(langs)}/`);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center gap-4 font-mono text-sm">
      <Link href="/en/">English</Link>
      <span className="text-rule">/</span>
      <Link href="/ja/">日本語</Link>
    </main>
  );
}
