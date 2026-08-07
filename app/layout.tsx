import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import DarkModeInit from "@/components/DarkModeInit";
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

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Pidatomu — Asisten Naskah Pidato Islami",
  description:
    "Buat naskah khutbah, kultum, dan pidato islami berkualitas tinggi dalam hitungan detik. Export ke Word, PDF, atau TXT.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pidatomu",
  },
};

const darkModeScript = `(function(){try{var m=localStorage.getItem('pidatomu_dark_mode');if(m==='true'||(m===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${inter.variable}`}>
        <DarkModeInit />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
