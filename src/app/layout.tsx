import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_JP } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans_JP({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-plex-sans",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Daiki Tanaka",
  description: "CV of Daiki Tanaka",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="bg-ink text-fg font-sans min-h-screen overflow-x-hidden leading-[1.9] text-[16px] selection:bg-accent selection:text-ink">
        {children}
      </body>
    </html>
  );
}
