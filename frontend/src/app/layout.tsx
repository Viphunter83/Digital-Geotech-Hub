import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import { fetchSingleton } from "@/lib/directus-fetch";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSingleton('site_settings', {
    fields: ['meta_title', 'meta_description']
  });

  return {
    title: settings?.meta_title || "Terra Expert | B2B Инженерные решения",
    description: settings?.meta_description || "B2B-платформа для строительной компании Terra Expert. Погружение шпунта, аренда спецтехники, AI-расчет смет.",
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
