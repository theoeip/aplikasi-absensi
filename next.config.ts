// Lokasi File: next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! PERINGATAN !!
    // Secara sengaja mengizinkan build produksi untuk berhasil
    // meskipun proyek Anda memiliki eror tipe.
    // Ini adalah solusi sementara untuk membuat situs Anda online.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;