// Lokasi File: app/admin/layout.tsx

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminNavigation from "./AdminNavigation";
import SignOutButton from "./SignOutButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield } from "@fortawesome/free-solid-svg-icons";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Pemeriksaan peran yang andal dari database
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  // ===================================================================
  // ===          BAGIAN INI YANG DIPERBAIKI UNTUK MENCEGAH ERROR      ===
  // ===================================================================
  // Jika profil pengguna atau perannya tidak ditemukan di tabel 'users',
  // langsung alihkan ke dashboard untuk menghindari crash.
  if (!profile || !profile.role) {
    console.error(`Peringatan: Profil atau peran tidak ditemukan untuk pengguna ID: ${user.id}. Mengalihkan ke dashboard.`);
    return redirect('/dashboard');
  }
  // ===================================================================
  // ===================================================================


  const userRole = profile.role; // Sekarang dijamin 'userRole' tidak akan kosong
  const isAdmin = userRole === 'SuperAdmin' || userRole === 'AdminSMP' || userRole === 'AdminSMK';
  
  if (!isAdmin) {
    return redirect('/dashboard');
  }

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