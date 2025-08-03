// File: supabase/functions/admin-update-user-password/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Interface untuk memastikan tipe data yang masuk benar
interface UserUpdatePayload {
  userId: string;
  newPassword?: string;
}

console.log("Fungsi 'admin-update-user-password' diinisialisasi.");

Deno.serve(async (req) => {
  // Menangani preflight request dari browser untuk CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Ambil data dari body request yang dikirim dari frontend
    const { userId, newPassword }: UserUpdatePayload = await req.json();

    // Validasi input dasar
    if (!userId || !newPassword) {
      throw new Error("User ID dan password baru wajib diisi.");
    }
    if (newPassword.length < 6) {
        throw new Error("Password minimal harus 6 karakter.");
    }

    // 2. Buat Supabase Admin Client.
    // Client ini menggunakan SERVICE_ROLE_KEY untuk mendapatkan hak akses penuh (bypass RLS)
    // Ini aman karena kode ini berjalan di server Supabase, bukan di browser.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Mencoba mengubah password untuk user ID: ${userId}`);

    // 3. Gunakan metode admin untuk mengubah password pengguna berdasarkan ID
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      console.error('Error dari Supabase Auth Admin:', error.message);
      throw error; // Lemparkan error agar bisa ditangkap di blok catch
    }

    console.log(`Password untuk user ID: ${userId} berhasil diubah.`);

    // Kirim respons sukses kembali ke frontend
    return new Response(JSON.stringify({ message: `Password untuk pengguna berhasil diubah.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Terjadi error di dalam Edge Function:", error.message);
    // Kirim respons error kembali ke frontend
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Status 'Bad Request' cocok untuk error input/proses
    });
  }
});