// File: next.config.ts

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

// Cek apakah kita sedang dalam mode build untuk Android/Capacitor
const isAndroidBuild = process.env.BUILD_MODE === 'android';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hanya gunakan 'export' jika kita sedang build untuk Android
  output: isAndroidBuild ? 'export' : undefined,

  typescript: {
    // Mengabaikan eror Tipe saat build.
    ignoreBuildErrors: true,
  },
};

console.log(`Build mode: ${isAndroidBuild ? 'Static Export for Android' : 'Server-side for Web'}`);

export default withPWA(nextConfig);