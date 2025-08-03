// File: app/admin/users/AddUserForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

// Menggunakan komponen UI dari kode Anda
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddUserForm({ userRole }: { userRole: string }) {
  const supabase = createClient();
  const router = useRouter();

  // --- State untuk mengelola semua input form ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [school, setSchool] = useState('');
  
  // --- STATE BARU UNTUK FITUR TAMBAHAN ---
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- EFEK BARU: Untuk membuat email secara otomatis ---
  useEffect(() => {
    const normalizeName = (name: string) => name.toLowerCase().replace(/\s+/g, '');
    const getSchoolDomain = (sch: string) => {
      if (sch === 'SMP BUDI BAKTI UTAMA') return 'smpbbu.id';
      if (sch === 'SMK BUDI BAKTI UTAMA') return 'smkbbu.id';
      return '';
    };

    // Tentukan nilai sekolah yang akan digunakan untuk membuat email
    const effectiveSchool = userRole === 'SuperAdmin' 
      ? school 
      : (userRole === 'AdminSMP' ? 'SMP BUDI BAKTI UTAMA' : 'SMK BUDI BAKTI UTAMA');

    // Buat email hanya jika semua field yang dibutuhkan sudah diisi
    if (fullName && role && effectiveSchool) {
      const namePart = normalizeName(fullName);
      const rolePart = role.toLowerCase();
      const schoolPart = getSchoolDomain(effectiveSchool);
      
      if (namePart && rolePart && schoolPart) {
        setEmail(`${namePart}@${rolePart}.${schoolPart}`);
      }
    } else {
      setEmail('');
    }
  }, [fullName, role, school, userRole]); // Jalankan ulang saat nilai-nilai ini berubah

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email) {
      toast.error("Email tidak dapat dibuat. Pastikan semua kolom terisi.");
      setIsSubmitting(false);
      return;
    }

    // Panggil API Supabase dengan data dari state
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          // Gunakan nilai sekolah yang sudah ditentukan
          school: userRole === 'SuperAdmin' ? school : (userRole === 'AdminSMP' ? 'SMP BUDI BAKTI UTAMA' : 'SMK BUDI BAKTI UTAMA'),
        }
      }
    });

    if (error) {
      toast.error(`Gagal menambahkan pengguna: ${error.message}`);
    } else {
      toast.success('Pengguna baru berhasil ditambahkan!');
      // Reset form fields
      setFullName('');
      setPassword('');
      setRole('');
      setSchool('');
      router.refresh();
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Pengguna Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama Lengkap" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} className="bg-gray-100 dark:bg-slate-700" readOnly />
              <p className="text-xs text-gray-500 dark:text-gray-400">Email akan dibuat secara otomatis.</p>
            </div>
          </div>
          <div className="grid grid-cols-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="show-password-add" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="h-4 w-4" />
                    <Label htmlFor="show-password-add" className="text-sm font-normal">Tampilkan</Label>
                </div>
              </div>
              <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={isSubmitting} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Peran</Label>
              <Select value={role} onValueChange={setRole} required disabled={isSubmitting}>
                <SelectTrigger><SelectValue placeholder="Pilih Peran" /></SelectTrigger>
                <SelectContent>
                  {userRole === 'SuperAdmin' && (
                    <>
                      <SelectItem value="AdminSMP">Admin SMP</SelectItem>
                      <SelectItem value="AdminSMK">Admin SMK</SelectItem>
                    </>
                  )}
                  <SelectItem value="Guru">Guru</SelectItem>
                  <SelectItem value="Siswa">Siswa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sekolah</Label>
              {userRole === 'SuperAdmin' ? (
                <Select value={school} onValueChange={setSchool} required disabled={isSubmitting}>
                  <SelectTrigger><SelectValue placeholder="Pilih Sekolah" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMP BUDI BAKTI UTAMA">SMP BUDI BAKTI UTAMA</SelectItem>
                    <SelectItem value="SMK BUDI BAKTI UTAMA">SMK BUDI BAKTI UTAMA</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={userRole === 'AdminSMP' ? 'SMP BUDI BAKTI UTAMA' : 'SMK BUDI BAKTI UTAMA'}
                  className="bg-gray-100 dark:bg-slate-700"
                  readOnly
                />
              )}
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting || !email || !password}>
            {isSubmitting ? 'Menambahkan...' : 'Tambah Pengguna'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}