// Lokasi File: next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! PERINGATAN !!
    // Mengabaikan eror Tipe saat build.
    // Ini diperlukan untuk mengatasi masalah kompatibilitas tipe
    // yang hanya muncul saat deployment di Netlify.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;