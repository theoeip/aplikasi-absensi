// LOKASI FILE: app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // <-- INI YANG PALING PENTING

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aplikasi Absensi",
  description: "Sistem Absensi Budi Bakti Utama",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        {/* Ini akan menjadi "layar" untuk menampilkan semua notifikasi */}
        <Toaster richColors position="top-right" /> 
      </body>
    </html>
  );
}