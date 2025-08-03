// Buat file baru di: app/HomePageClient.tsx
'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
// PERBAIKAN: Mengubah path impor ke lokasi halaman login yang benar
import LoginPage from '@/app/login/page'; 

export default function HomePageClient() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Jika pengguna sudah login, arahkan ke dashboard admin
        // Ganti '/admin' dengan '/dashboard' jika itu halaman utama Anda setelah login
        router.replace('/dashboard');
      }
      // Jika tidak ada sesi, jangan lakukan apa-apa, biarkan halaman login ditampilkan
    };

    checkSessionAndRedirect();
  }, [router, supabase]);

  // Komponen ini akan menampilkan halaman login secara default.
  // useEffect di atas akan menangani pengalihan jika pengguna sudah login.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      {/* Menggunakan komponen halaman login yang sudah diimpor */}
      <LoginPage />
    </div>
  );
}
