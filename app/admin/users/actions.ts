// Lokasi File: app/admin/users/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'; // <-- PERBAIKAN 1: Impor cookies

export async function addUser(formData: FormData) {
  // Log untuk debugging, akan muncul di Edge Function Log
  console.log("--- Add User Action Triggered ---");
  console.log("Is service key present in env?", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  // PERBAIKAN 2: Gunakan cookies saat memanggil createClient
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const adminRole = session?.user?.user_metadata?.role;

    if (!adminRole) {
      console.error("Add User Failed: Admin role not found in session.");
      return { success: false, message: 'Akses ditolak: Peran admin tidak ditemukan.' };
    }

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      full_name: formData.get('full_name') as string,
      role: formData.get('role') as string,
      school: formData.get('school') as string,
    };

    // Validasi input dasar
    if (!data.email || !data.password || !data.full_name || !data.role || !data.school) {
        return { success: false, message: 'Semua kolom wajib diisi.' };
    }

    if (adminRole === 'AdminSMP' && data.school !== 'SMP BUDI BAKTI UTAMA') {
      return { success: false, message: 'Admin SMP hanya bisa menambah pengguna untuk SMP.' };
    }
    if (adminRole === 'AdminSMK' && data.school !== 'SMK BUDI BAKTI UTAMA') {
      return { success: false, message: 'Admin SMK hanya bisa menambah pengguna untuk SMK.' };
    }
    if ((adminRole === 'AdminSMP' || adminRole === 'AdminSMK') && (data.role.includes('Admin'))) {
        return { success: false, message: 'Admin sekolah tidak dapat membuat pengguna admin lain.' };
    }

    console.log("Creating user with email:", data.email);
    const { data: newUserData, error } = await supabaseAdmin.auth.admin.createUser({
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
      console.error("Supabase Admin createUser Error:", error.message);
      return { success: false, message: error.message };
    }

    console.log("User created successfully. Revalidating path...");
    revalidatePath('/admin/users');
    return { success: true, message: `Pengguna ${data.full_name} berhasil dibuat.` };

  } catch (e) {
    console.error("FATAL ERROR in addUser action:", e);
    return { success: false, message: 'Terjadi kesalahan tak terduga di server.' };
  }
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
  revalidatePath(`/admin/users/${userId}/edit`);
  redirect('/admin/users');
}
