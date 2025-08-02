// app/admin/users/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation'; // <-- Pastikan ini ada

export async function addUser(formData: FormData) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const adminRole = session?.user?.user_metadata?.role;

  if (!adminRole) {
    return { success: false, message: 'Akses ditolak.' };
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    full_name: formData.get('full_name') as string,
    role: formData.get('role') as string,
    school: formData.get('school') as string,
  };

  if (adminRole === 'AdminSMP' && data.school !== 'SMP BUDI BAKTI UTAMA') {
    return { success: false, message: 'Admin SMP hanya bisa menambah pengguna untuk SMP.' };
  }
  if (adminRole === 'AdminSMK' && data.school !== 'SMK BUDI BAKTI UTAMA') {
    return { success: false, message: 'Admin SMK hanya bisa menambah pengguna untuk SMK.' };
  }
  if ((adminRole === 'AdminSMP' || adminRole === 'AdminSMK') && (data.role.includes('Admin'))) {
      return { success: false, message: 'Admin sekolah tidak dapat membuat pengguna admin lain.' };
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      role: data.role,
      school: data.school,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }
  
  revalidatePath('/admin/users');
  return { success: true, message: `Pengguna ${data.full_name} berhasil dibuat.` };
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get('userId') as string;
  if (!userId) {
    return { success: false, message: 'User ID tidak ditemukan.' };
  }
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath('/admin/users');
  return { success: true, message: 'Pengguna berhasil dihapus.' };
}

// --- FUNGSI UPDATE YANG HILANG ---
export async function updateUser(formData: FormData) {
  const userId = formData.get('userId') as string;
  
  const dataToUpdate = {
    full_name: formData.get('full_name') as string,
    role: formData.get('role') as string,
    school: formData.get('school') as string,
  };

  const { error: profileError } = await supabaseAdmin
    .from('users')
    .update(dataToUpdate)
    .eq('id', userId);

  if (profileError) {
    return { success: false, message: profileError.message };
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: dataToUpdate }
  );
  
  if (authError) {
    return { success: false, message: authError.message };
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}/edit`); // Juga revalidasi halaman edit
  redirect('/admin/users');
}