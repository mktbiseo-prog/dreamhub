import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { LanguageSelector } from "@dreamhub/ui";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
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
  title: "Dream Planner | Dream Hub",
  description: "Plan your dreams, track your goals, and make them reality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${inter.className}`}>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <StoreProvider>
            <LanguageSelector />
            {children}
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
