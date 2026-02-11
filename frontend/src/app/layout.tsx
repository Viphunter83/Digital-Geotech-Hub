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

export const metadata: Metadata = {
  title: "Digital Geotech Hub | B2B Инженерные решения",
  description: "B2B-платформа для строительной компании ГеоТехнологии. Погружение шпунта, аренда спецтехники, AI-расчет смет.",
};

import { Navbar } from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans bg-background text-foreground`}
      >
        <div className="flex min-h-screen flex-col pt-20">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
