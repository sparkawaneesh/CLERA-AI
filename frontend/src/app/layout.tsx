
import type { Metadata } from "next";
import { Inter, Rajdhani, Lexend } from "next/font/google";
// @ts-ignore: global CSS import handled by Next.js
import "./globals.css";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-rajdhani" });
const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" });

export const metadata: Metadata = {
  title: "AIDOC – Your AI Doctor",
  description: "24/7 AI health consultant. Understands English & Hindi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${rajdhani.variable} ${lexend.variable} font-sans bg-[#0A0D14] text-white`}>
    
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}