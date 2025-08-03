// Lokasi File: capacitor.config.ts

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.absensi.budibaktiutama',
  appName: 'Absensi BBU',
  // PERBAIKAN: Ubah 'public' menjadi 'out'.
  // Ini memberitahu Capacitor untuk mengambil file web dari folder 'out'
  // yang dihasilkan oleh 'npm run build' dari Next.js.
  webDir: 'out'
};

export default config;