// LOKASI FILE: app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

// Semua metadata PWA dan halaman utama terpusat di sini
export const metadata: Metadata = {
  // Info Dasar
  title: "Aplikasi Absensi",
  description: "Sistem Absensi Budi Bakti Utama",
  
  // Konfigurasi PWA
  manifest: "/manifest.json",
  themeColor: "#4f46e5", // Memindahkan meta theme-color ke sini
  
  // Ikon untuk perangkat Apple
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Absensi BBU",
  },
  
  // Penting untuk tampilan mobile yang benar
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      {/* Anda tidak perlu menulis <head> di sini, Next.js akan membuatnya secara otomatis dari objek metadata di atas */}
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}