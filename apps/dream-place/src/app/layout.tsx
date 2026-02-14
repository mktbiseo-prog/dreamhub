import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
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
  const authEnabled = !!process.env.DATABASE_URL;
  const content = (
    <>
      {children}
      <BottomNav />
      <CafeToast />
    </>
  );

  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${inter.className}`}>
      <body className="min-h-screen pb-16 antialiased">
        {authEnabled ? <SessionProvider>{content}</SessionProvider> : content}
      </body>
    </html>
  );
}
