import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

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
    <html lang="ja" className="dark">
      <body
        className={`${spaceGrotesk.className} bg-bg-dark text-slate-200 font-display min-h-screen overflow-x-hidden selection:bg-primary selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
