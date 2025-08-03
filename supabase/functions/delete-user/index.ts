// File: supabase/functions/delete-user/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Menangani preflight request untuk CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Ambil ID pengguna yang akan dihapus dari body request
    const { user_id } = await req.json();
    if (!user_id) {
      throw new Error("User ID (user_id) harus disertakan.");
    }

    // Buat Supabase client dengan hak akses ADMIN (service_role)
    // Ini wajib dilakukan di server, JANGAN PERNAH di client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Hapus pengguna dari sistem otentikasi
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: `Pengguna dengan ID ${user_id} berhasil dihapus.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});