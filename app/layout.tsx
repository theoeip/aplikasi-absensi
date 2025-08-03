// LOKASI FILE: app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

// Anda bisa mendefinisikan metadata PWA di sini juga, tapi yang utama ada di manifest.json
export const metadata: Metadata = {
  title: "Aplikasi Absensi",
  description: "Sistem Absensi Budi Bakti Utama",
  manifest: "/manifest.json", // <-- Menambahkan link manifest di metadata
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      {/* PERBAIKAN: Menambahkan <head> untuk menaruh tag PWA */}
      <head>
        {/* Mengatur warna tema untuk address bar browser di HP */}
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" /> 
      </body>
    </html>
  );
}