// File: app/admin/users/UsersPageClient.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';

// Impor komponen UI Anda
import AddUserForm from "./AddUserForm";
import UsersTable from "./UsersTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipe data yang telah diperbarui untuk mencerminkan relasi
type CombinedUser = {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  school: string | null;
  classes: { // Diubah dari class_name menjadi classes (objek)
    name: string | null;
  } | null;
};

export default function UsersPageClient() {
  const supabase = createClient();

  // State untuk data mentah
  const [studentUsers, setStudentUsers] = useState<CombinedUser[]>([]);
  const [teacherUsers, setTeacherUsers] = useState<CombinedUser[]>([]);
  const [adminUsers, setAdminUsers] = useState<CombinedUser[]>([]);
  
  const [adminRole, setAdminRole] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const [classFilter, setClassFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: 'full_name'; direction: 'ascending' | 'descending' }>({ key: 'full_name', direction: 'ascending' });

  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const role = session?.user?.user_metadata?.role;
    setAdminRole(role);

    if (!role) {
      setIsLoading(false);
      return;
    }

    // Query telah diperbarui untuk melakukan JOIN ke tabel classes
    let usersQuery = supabase
        .from('users')
        .select(`
            id, full_name, role, school, 
            classes ( name )
        `);
    
    if (role === 'AdminSMP') {
      usersQuery = usersQuery.eq('school', 'SMP');
    } else if (role === 'AdminSMK') {
      usersQuery = usersQuery.eq('school', 'SMK');
    }

    const { data: usersData, error: usersError } = await usersQuery;

    if (usersError) {
      console.error("Gagal memuat data pengguna:", usersError.message);
      setIsLoading(false);
      return;
    }
    
    // Pemetaan data disesuaikan dengan hasil query baru
    const allUsers = usersData.map(profile => ({
      id: profile.id,
      full_name: profile.full_name,
      email: 'N/A (Lihat di Auth)', // Email tidak ada di tabel public.users
      role: profile.role,
      school: profile.school,
      classes: profile.classes, // Properti sekarang bernama 'classes'
    }));

    setStudentUsers(allUsers.filter(user => user.role === 'Siswa'));
    setTeacherUsers(allUsers.filter(user => user.role === 'Guru'));
    
    if (role === 'SuperAdmin') {
      setAdminUsers(allUsers.filter(user => user.role && ['AdminSMP', 'AdminSMK', 'SuperAdmin'].includes(user.role)));
    }

    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();

    const channel = supabase
      .channel('realtime users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, 
        () => { fetchData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData, supabase]);

  // Logika untuk filter dan sort disesuaikan
  const uniqueClasses = useMemo(() => {
    return [...new Set(studentUsers.filter(u => u.classes?.name).map(u => u.classes!.name!))];
  }, [studentUsers]);

  const sortUsers = (users: CombinedUser[]) => {
    return [...users].sort((a, b) => {
        if (!a.full_name || !b.full_name) return 0;
        if (a.full_name.toLowerCase() < b.full_name.toLowerCase()) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a.full_name.toLowerCase() > b.full_name.toLowerCase()) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });
  };

  const processedStudentUsers = useMemo(() => {
    const filtered = classFilter === 'all' 
      ? studentUsers 
      : studentUsers.filter(user => user.classes?.name === classFilter);
    return sortUsers(filtered);
  }, [studentUsers, classFilter, sortConfig]);

  const processedTeacherUsers = useMemo(() => sortUsers(teacherUsers), [teacherUsers, sortConfig]);
  const processedAdminUsers = useMemo(() => sortUsers(adminUsers), [adminUsers, sortConfig]);
  
  const requestSort = () => {
    const direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    setSortConfig({ key: 'full_name', direction });
  };


  if (isLoading) {
    return <div>Memuat data pengguna...</div>;
  }
  
  return ( 
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
      <AddUserForm userRole={adminRole!} />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>
            Menampilkan semua pengguna dengan peran Siswa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="Filter per kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tampilkan Semua Kelas</SelectItem>
                {uniqueClasses.map(className => (
                  <SelectItem key={className} value={className}>{className}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <UsersTable
            users={processedStudentUsers}
            userRole={adminRole!}
            sortConfig={sortConfig}
            requestSort={requestSort}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Guru</CardTitle>
          <CardDescription>
            Menampilkan semua pengguna dengan peran Guru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={processedTeacherUsers}
            userRole={adminRole!}
            sortConfig={sortConfig}
            requestSort={requestSort}
          />
        </CardContent>
      </Card>

      {adminRole === 'SuperAdmin' && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Admin</CardTitle>
            <CardDescription>
              Menampilkan semua pengguna dengan peran Admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable
              users={processedAdminUsers}
              userRole={adminRole}
              sortConfig={sortConfig}
              requestSort={requestSort}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}