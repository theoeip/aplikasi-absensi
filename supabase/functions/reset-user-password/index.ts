// Buat file baru di dalam proyek Anda di: supabase/functions/reset-user-password/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Fungsi ini akan dijalankan ketika dipanggil
Deno.serve(async (req) => {
  // Tangani preflight request untuk CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Ambil userId dan newPassword dari body request
    const { userId, newPassword } = await req.json();
    if (!userId || !newPassword) {
      throw new Error("User ID dan password baru harus diisi.");
    }

    // Buat admin client yang aman di sisi server
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Gunakan fungsi admin untuk memperbarui data pengguna
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      throw error;
    }

    // Kirim kembali respons sukses
    return new Response(JSON.stringify({ message: "Sandi pengguna berhasil direset." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Kirim kembali respons error
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});