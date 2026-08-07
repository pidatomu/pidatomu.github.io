import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Pidatomu — Asisten Naskah Pidato Islami",
  description:
    "Buat naskah khutbah, kultum, dan pidato islami berkualitas tinggi dalam hitungan detik. Export ke Word, PDF, atau TXT.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${spaceGrotesk.variable} ${inter.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
