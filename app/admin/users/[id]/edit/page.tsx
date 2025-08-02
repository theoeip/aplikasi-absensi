// app/admin/users/[id]/edit/page.tsx
import { supabaseAdmin } from "@/utils/supabase/admin";
import { updateUser } from "../../actions"; // <-- IMPORT Server Action

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Pengguna: {profile.full_name}</h1>
      
      <div className="p-6 bg-white rounded-lg shadow-md">
        {/* Formulir sekarang terhubung ke Server Action 'updateUser' */}
        <form action={updateUser} className="space-y-4">
            
            {/* Input tersembunyi untuk mengirim ID pengguna */}
            <input type="hidden" name="userId" value={userId} />

            <div>
                <label className="block font-medium">Nama Lengkap</label>
                <input name="full_name" defaultValue={profile.full_name || ''} className="w-full p-2 border rounded" required />
            </div>
            <div>
                <label className="block font-medium">Email</label>
                <input name="email" type="email" defaultValue={authUser.user.email || ''} className="w-full p-2 border rounded bg-gray-100" readOnly />
                <p className="text-xs text-gray-500">Email tidak dapat diubah melalui form ini.</p>
            </div>
            <div>
                <label className="block font-medium">Peran</label>
                <select name="role" defaultValue={profile.role || ''} className="w-full p-2 border rounded" required>
                    <option value="Admin">Admin</option>
                    <option value="Guru">Guru</option>
                    <option value="Siswa">Siswa</option>
                </select>
            </div>
            <div>
                <label className="block font-medium">Sekolah</label>
                <select name="school" defaultValue={profile.school || ''} className="w-full p-2 border rounded" required>
                    <option value="SMP BUDI BAKTI UTAMA">SMP BUDI BAKTI UTAMA</option>
                    <option value="SMK BUDI BAKTI UTAMA">SMK BUDI BAKTI UTAMA</option>
                </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                Simpan Perubahan
            </button>
        </form>
      </div>
    </div>
  );
}