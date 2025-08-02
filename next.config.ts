// next.config.ts
import type { NextConfig } from 'next';
import withPWAInit from "next-pwa";

// Konfigurasi PWA
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

// Konfigurasi utama Next.js
const nextConfig: NextConfig = {
  // Opsi Next.js lainnya bisa ditambahkan di sini
};

// Gabungkan kedua konfigurasi dan ekspor
export default withPWA(nextConfig);