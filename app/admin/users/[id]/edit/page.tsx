// Lokasi File: app/admin/users/[id]/edit/page.tsx

import { supabaseAdmin } from "@/utils/supabase/admin";
import EditUserForm from "./EditUserForm"; // <-- Impor komponen form baru

export async function generateStaticParams() {
  const { data: users, error } = await supabaseAdmin.from('users').select('id');
  if (error) {
    console.error('Gagal mengambil ID pengguna dari Supabase saat build:', error);
    return [];
  }
  return users?.map((user) => ({ id: user.id.toString() })) || [];
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const userId = params.id;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: authUser, error: authError } = await supabaseAdmin
    .auth.admin.getUserById(userId);
  
  if (profileError || authError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-red-500">Gagal memuat data pengguna: {profileError?.message || authError?.message}</p>
      </div>
    );
  }

  if (!profile || !authUser) {
    return (
        <div>
          <h1 className="text-2xl font-bold">Error</h1>
          <p>Pengguna dengan ID {userId} tidak ditemukan.</p>
        </div>
      );
  }

  // Gabungkan data untuk dikirim sebagai props
  const userData = {
    id: profile.id,
    full_name: profile.full_name,
    email: authUser.user.email,
    role: profile.role,
    school: profile.school,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Pengguna: {profile.full_name}</h1>
      <div className="p-6 bg-white rounded-lg shadow-md">
        {/* Gunakan komponen form baru di sini */}
        <EditUserForm userData={userData} />
      </div>
    </div>
  );
}