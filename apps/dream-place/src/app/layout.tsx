import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" className={inter.className}>
      <body className="min-h-screen pb-16 antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
