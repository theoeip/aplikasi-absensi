// File: app/admin/users/[id]/edit/EditUserForm.tsx

'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateUserAndPotentiallyPassword } from '../../actions';

// Definisikan tipe data untuk props
interface UserData {
  id: string;
  full_name: string | null;
  email: string | undefined;
  role: string | null;
  school: string | null;
}

export default function EditUserForm({ userData }: { userData: UserData }) {
  const router = useRouter();

  // State untuk setiap input form
  const [fullName, setFullName] = useState(userData.full_name || '');
  const [role, setRole] = useState(userData.role || '');
  const [school, setSchool] = useState(userData.school || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // --- STATE BARU UNTUK MENAMPILKAN PASSWORD ---
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi handleSubmit Anda tidak perlu diubah, sudah benar.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok!');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('role', role);
    formData.append('school', school);
    
    if (newPassword) {
      formData.append('newPassword', newPassword);
      formData.append('confirmPassword', confirmPassword);
    }
    
    const result = await updateUserAndPotentiallyPassword(userData.id, formData);

    if (result.success) {
      toast.success(result.message);
      setNewPassword('');
      setConfirmPassword('');
      router.refresh();
    } else {
      toast.error(result.message);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ... Input Nama Lengkap, Email, Peran & Sekolah (Tidak ada perubahan di sini) ... */}
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
      <div>
        <label className="block font-medium">Email</label>
        <input 
          type="email" 
          value={userData.email || ''} 
          className="w-full p-2 border rounded bg-gray-100" 
          readOnly 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Peran</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded" 
            required 
            disabled={isSubmitting}
          >
            <option value="">Pilih Peran</option>
            <option value="Admin">Admin</option>
            <option value="Guru">Guru</option>
            <option value="Siswa">Siswa</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Sekolah</label>
          <select 
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full p-2 border rounded" 
            required 
            disabled={isSubmitting}
          >
            <option value="">Pilih Sekolah</option>
            <option value="SMP BUDI BAKTI UTAMA">SMP BUDI BAKTI UTAMA</option>
            <option value="SMK BUDI BAKTI UTAMA">SMK BUDI BAKTI UTAMA</option>
          </select>
        </div>
      </div>
      
      {/* --- BAGIAN UBAH PASSWORD (DENGAN PENAMBAHAN CHECKBOX) --- */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900">Ubah Password</h3>
                <p className="mt-1 text-sm text-gray-600">Isi hanya jika Anda ingin mengubah password pengguna ini.</p>
            </div>
            {/* === CHECKBOX BARU === */}
            <div className="flex items-center">
              <input
                id="edit-show-password"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="edit-show-password" className="ml-2 block text-sm text-gray-900">
                Tampilkan
              </label>
            </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block font-medium">Password Baru</label>
                <input
                    // === PERUBAHAN TIPE INPUT ===
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded" 
                    disabled={isSubmitting}
                    autoComplete="new-password"
                />
            </div>
            <div>
                <label className="block font-medium">Konfirmasi Password Baru</label>
                <input
                    // === PERUBAHAN TIPE INPUT ===
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border rounded" 
                    disabled={isSubmitting}
                    autoComplete="new-password"
                />
            </div>
        </div>
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