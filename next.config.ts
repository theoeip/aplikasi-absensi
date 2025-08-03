// File: next.config.ts

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const isAndroidBuild = process.env.BUILD_MODE === 'android';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isAndroidBuild ? 'export' : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);