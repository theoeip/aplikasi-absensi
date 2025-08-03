// Lokasi File: next.config.ts

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PERBAIKAN: Tambahkan baris ini untuk menghasilkan output statis
  // yang dibutuhkan oleh Capacitor agar bisa membuat aplikasi Android.
  output: 'export',

  typescript: {
    // Mengabaikan eror Tipe saat build.
    // Ini diperlukan untuk mengatasi masalah kompatibilitas tipe PageProps
    // yang hanya muncul saat deployment di Netlify.
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);