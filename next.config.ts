// Lokasi File: next.config.ts

// Impor 'withPWA' dari pustaka yang baru diinstall
const withPWA = require('next-pwa')({
  dest: 'public', // Ini akan menyimpan file service worker di folder public
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' // Nonaktifkan PWA saat development
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Jika Anda punya konfigurasi lain, letakkan di sini.
  // Misalnya, jika Anda punya masalah TypeScript lagi, Anda bisa tambahkan:
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

// PERBAIKAN: Bungkus 'nextConfig' Anda dengan 'withPWA' saat mengekspornya.
// Inilah yang sebenarnya mengaktifkan fungsionalitas PWA di aplikasi Anda.
export default withPWA(nextConfig);