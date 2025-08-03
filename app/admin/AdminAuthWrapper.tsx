// Buat file baru di: app/admin/AdminAuthWrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// Impor komponen UI dari layout Anda
import AdminNavigation from "./AdminNavigation";
import SignOutButton from "./SignOutButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield } from "@fortawesome/free-solid-svg-icons";

export default function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Ambil sesi pengguna
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Jika tidak ada sesi, langsung arahkan ke halaman login
        router.replace('/login');
        return; // Hentikan eksekusi lebih lanjut
      }

      // 2. Ambil peran dari database
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      const role = profile?.role;
      const isAdmin = role === 'SuperAdmin' || role === 'AdminSMP' || role === 'AdminSMK';

      if (!isAdmin) {
        // Jika bukan admin, arahkan ke dashboard
        router.replace('/dashboard');
      } else {
        // Jika admin, simpan peran dan selesai loading
        setUserRole(role);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [supabase, router]);

  if (isLoading || !userRole) {
    // Tampilkan loading spinner atau halaman kosong selagi memeriksa
    return (
        <div className="flex items-center justify-center min-h-screen">
            Memverifikasi akses...
        </div>
    );
  }

  // Jika sudah terotentikasi sebagai admin, tampilkan layout dan konten halaman
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faUserShield} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sistem Absensi Budi Bakti Utama</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <AdminNavigation userRole={userRole} />
            <div className="p-6">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
}