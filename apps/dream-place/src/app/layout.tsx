import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { LanguageSelector } from "@dreamhub/ui";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { BottomNav } from "@/components/layout/BottomNav";
import { CafeToast } from "@/components/cafe/CafeToast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Dream Place | Dream Hub",
  description: "Find your dream team. Match with complementary dreamers worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${inter.className}`}>
      <body className="min-h-screen pb-16 antialiased">
        <SessionProvider>
          <LanguageSelector />
          {children}
          <BottomNav />
          <CafeToast />
        </SessionProvider>
      </body>
    </html>
  );
}
