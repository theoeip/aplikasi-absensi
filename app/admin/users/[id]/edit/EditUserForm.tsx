// Buat file baru di: app/admin/users/[id]/edit/EditUserForm.tsx

'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

// Definisikan tipe data untuk props, agar kode lebih aman dan jelas
interface UserData {
  id: string;
  full_name: string | null;
  email: string | undefined;
  role: string | null;
  school: string | null;
}

export default function EditUserForm({ userData }: { userData: UserData }) {
  const supabase = createClient();
  const router = useRouter();

  // State untuk setiap input form dan status loading
  const [fullName, setFullName] = useState(userData.full_name || '');
  const [role, setRole] = useState(userData.role || '');
  const [school, setSchool] = useState(userData.school || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Data yang akan diupdate di tabel 'users'
    const { error } = await supabase
      .from('users')
      .update({ 
        full_name: fullName,
        role: role,
        school: school,
      })
      .eq('id', userData.id);

    if (error) {
      toast.error(`Gagal memperbarui pengguna: ${error.message}`);
    } else {
      toast.success('Data pengguna berhasil diperbarui!');
      router.refresh(); // Segarkan data di halaman
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Input Nama Lengkap */}
      <div>
        <label className="block font-medium">Nama Lengkap</label>
        <input 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded" 
          required 
          disabled={isSubmitting}
        />
      </div>

      {/* Input Email (Read-Only) */}
      <div>
        <label className="block font-medium">Email</label>
        <input 
          type="email" 
          value={userData.email || ''} 
          className="w-full p-2 border rounded bg-gray-100" 
          readOnly 
        />
        <p className="text-xs text-gray-500">Email tidak dapat diubah.</p>
      </div>

      {/* Input Peran */}
      <div>
        <label className="block font-medium">Peran</label>
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded" 
          required 
          disabled={isSubmitting}
        >
          <option value="Admin">Admin</option>
          <option value="Guru">Guru</option>
          <option value="Siswa">Siswa</option>
        </select>
      </div>

      {/* Input Sekolah */}
      <div>
        <label className="block font-medium">Sekolah</label>
        <select 
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="w-full p-2 border rounded" 
          required 
          disabled={isSubmitting}
        >
          <option value="SMP BUDI BAKTI UTAMA">SMP BUDI BAKTI UTAMA</option>
          <option value="SMK BUDI BAKTI UTAMA">SMK BUDI BAKTI UTAMA</option>
        </select>
      </div>
      
      <button 
        type="submit" 
        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}
