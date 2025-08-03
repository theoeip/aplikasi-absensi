// Buat file baru di: app/admin/users/UsersPageClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

// Impor komponen UI Anda
import AddUserForm from "./AddUserForm";
import UsersTable from "./UsersTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Definisikan tipe untuk data pengguna gabungan
type CombinedUser = {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  school: string | null;
};

export default function UsersPageClient() {
  const supabase = createClient();

  // State untuk data, loading, dan peran pengguna
  const [combinedUsers, setCombinedUsers] = useState<CombinedUser[]>([]);
  const [adminRole, setAdminRole] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // 1. Ambil sesi dan peran pengguna dari sisi klien
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.role;
      setAdminRole(role);

      if (sessionError || !role) {
        console.error("Error saat mengambil sesi atau peran:", sessionError?.message);
        setIsLoading(false);
        return;
      }

      // 2. Ambil data pengguna dari tabel 'users' berdasarkan peran
      let usersQuery = supabase.from('users').select('*');
      if (role === 'AdminSMP') {
        usersQuery = usersQuery.eq('school', 'SMP BUDI BAKTI UTAMA');
      } else if (role === 'AdminSMK') {
        usersQuery = usersQuery.eq('school', 'SMK BUDI BAKTI UTAMA');
      }

      const { data: usersData, error: usersError } = await usersQuery;

      if (usersError) {
        console.error("Gagal memuat data pengguna:", usersError.message);
        setIsLoading(false);
        return;
      }
      
      // Karena kita tidak bisa memanggil `listUsers` dari klien,
      // kita akan mengambil email dari sesi jika hanya ada satu pengguna atau menampilkannya sebagai 'N/A'.
      // Untuk aplikasi penuh, daftar email harus diambil melalui fungsi server (Edge Function).
      const combined = usersData.map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        email: 'N/A (Lihat di Supabase)', // Email tidak bisa diakses dengan aman dari klien
        role: profile.role,
        school: profile.school,
      }));

      setCombinedUsers(combined);
      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  if (isLoading) {
    return <div>Memuat data pengguna...</div>;
  }

  if (!adminRole) {
    return <p className="text-red-500">Tidak dapat memverifikasi peran pengguna. Silakan login kembali.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
      <AddUserForm userRole={adminRole} />
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            {adminRole === 'SuperAdmin' ? 'Menampilkan semua pengguna.' : `Menampilkan pengguna untuk ${adminRole === 'AdminSMP' ? 'SMP' : 'SMK'}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={combinedUsers} userRole={adminRole} />
        </CardContent>
      </Card>
    </div>
  );
}