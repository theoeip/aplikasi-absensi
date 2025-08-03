// Buat file baru di: app/dashboard/DashboardAuthWrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardAuthWrapper({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      // 1. Ambil sesi pengguna
      const { data: { session } } = await supabase.auth.getSession();

      // Jika karena alasan aneh tidak ada sesi, kirim kembali ke login
      if (!session) {
        router.replace('/login');
        return;
      }

      // 2. Periksa peran pengguna
      const role = session.user.user_metadata?.role;
      const isAdmin = role === 'SuperAdmin' || role === 'AdminSMP' || role === 'AdminSMK';

      // 3. Logika Pengalihan
      if (isAdmin) {
        // JIKA PENGGUNA ADALAH ADMIN, arahkan ke halaman pertama panel admin
        router.replace('/admin/users'); 
      } else {
        // JIKA BUKAN ADMIN, izinkan untuk melihat dashboard
        setIsLoading(false);
      }
    };

    checkRoleAndRedirect();
  }, [supabase, router]);

  // Selama loading, tampilkan pesan singkat
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            Memuat...
        </div>
    );
  }

  // Jika bukan admin dan sudah selesai loading, tampilkan halaman dashboard biasa
  return <>{children}</>;
}