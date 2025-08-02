// Lokasi File: app/admin/users/page.tsx

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import AddUserForm from "./AddUserForm";
import UsersTable from "./UsersTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cookies } from "next/headers";

export default async function ManageUsersPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  const adminRole = session?.user?.user_metadata?.role;
  
  if (!adminRole) {
    return <p className="text-red-500">Tidak dapat memverifikasi peran pengguna.</p>;
  }

  let usersQuery = supabaseAdmin.from('users').select('*');
  
  if (adminRole === 'AdminSMP') {
    usersQuery = usersQuery.eq('school', 'SMP BUDI BAKTI UTAMA');
  } else if (adminRole === 'AdminSMK') {
    usersQuery = usersQuery.eq('school', 'SMK BUDI BAKTI UTAMA');
  }

  const { data: usersData, error: usersError } = await usersQuery;
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError || authError) {
    return <p className="text-red-500">Gagal memuat pengguna: {usersError?.message || authError?.message}</p>
  }

  const userIds = usersData.map(u => u.id);
  const relevantAuthUsers = authUsers.users.filter(u => userIds.includes(u.id));
  
  const combinedUsers = usersData.map(profile => {
    const authUser = relevantAuthUsers.find(u => u.id === profile.id);
    return {
      id: profile.id,
      full_name: profile.full_name,
      email: authUser?.email || 'N/A',
      role: profile.role,
      school: profile.school,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
      {<AddUserForm userRole={adminRole} />}
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