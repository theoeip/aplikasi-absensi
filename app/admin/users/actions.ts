// File: app/admin/users/actions.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Tipe untuk hasil kembalian agar seragam di semua fungsi
type ActionResult = {
  success: boolean;
  message: string;
};

// =========================================================================
// FUNGSI ANDA YANG SUDAH ADA (TIDAK DIUBAH)
// =========================================================================

export async function addUser(formData: FormData): Promise<ActionResult> {
  console.log("--- Add User Action Triggered ---");
  console.log("Is service key present in env?", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

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
      console.error("Supabase Admin createUser Error:", error.message);
      return { success: false, message: error.message };
    }

    console.log("User created successfully. Revalidating path...");
    revalidatePath('/admin/users');
    return { success: true, message: `Pengguna ${data.full_name} berhasil dibuat.` };

  } catch (e: any) {
    console.error("FATAL ERROR in addUser action:", e);
    return { success: false, message: 'Terjadi kesalahan tak terduga di server.' };
  }
}

export async function deleteUser(formData: FormData): Promise<ActionResult> {
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

// =========================================================================
// FUNGSI BARU UNTUK UPDATE PROFIL BESERTA PASSWORD
// Ini yang akan dipanggil dari EditUserForm.tsx Anda
// =========================================================================
export async function updateUserAndPotentiallyPassword(userId: string, formData: FormData): Promise<ActionResult> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Ambil semua data dari form
  const fullName = formData.get('full_name') as string;
  const role = formData.get('role') as string;
  const school = formData.get('school') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // 1. Logika untuk mengubah password (hanya jika diisi)
  if (newPassword) {
    if (newPassword !== confirmPassword) {
      return { success: false, message: 'Password baru dan konfirmasi tidak cocok!' };
    }
    if (newPassword.length < 6) {
      return { success: false, message: 'Password minimal harus 6 karakter.' };
    }

    // Panggil Edge Function 'admin-update-user-password' yang sudah di-deploy
    // Perhatikan: kita menggunakan client Supabase biasa di sini untuk memanggil function.
    const { error: functionError } = await supabase.functions.invoke('admin-update-user-password', {
      body: {
        userId: userId,
        newPassword: newPassword,
      },
    });

    if (functionError) {
      console.error("Error saat memanggil Edge Function:", functionError);
      return { success: false, message: `Gagal mengubah password: ${functionError.message}` };
    }
  }

  // 2. Logika untuk mengubah data lain (full_name, role, school)
  // Kita gunakan supabaseAdmin agar bisa mengubah data user lain.
  const dataToUpdate = {
    full_name: fullName,
    role: role,
    school: school,
  };

  // Update data di tabel 'users' (atau 'profiles')
  const { error: profileError } = await supabaseAdmin
    .from('users') // GANTI NAMA TABEL JIKA PERLU
    .update(dataToUpdate)
    .eq('id', userId);

  if (profileError) {
    return { success: false, message: `Gagal update profil: ${profileError.message}` };
  }

  // Update juga metadata di Auth agar sinkron
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: dataToUpdate }
  );
  
  if (authError) {
    // Meskipun profil berhasil diubah, metadata gagal. Ini harus dilaporkan.
    return { success: false, message: `Gagal update auth metadata: ${authError.message}` };
  }

  // 3. Revalidasi path agar data di UI langsung ter-update
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}/edit`);

  const successMessage = newPassword 
    ? 'Data profil dan password berhasil diperbarui.' 
    : 'Data profil berhasil diperbarui.';

  return { success: true, message: successMessage };
}