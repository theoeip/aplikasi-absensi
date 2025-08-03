// Lokasi File: app/admin/users/AddUserForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

// Menggunakan komponen UI dari kode Anda
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddUserForm({ userRole }: { userRole: string }) {
  const supabase = createClient();
  const router = useRouter();

  // State untuk mengelola semua input form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [school, setSchool] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi yang dijalankan saat form dikirim
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Menentukan nilai sekolah berdasarkan peran pengguna yang sedang login
    const schoolValue = userRole === 'SuperAdmin' 
      ? school 
      : (userRole === 'AdminSMP' ? 'SMP BUDI BAKTI UTAMA' : 'SMK BUDI BAKTI UTAMA');

    if (!role || !schoolValue) {
        toast.error("Peran dan Sekolah harus diisi.");
        setIsSubmitting(false);
        return;
    }

    // Memanggil API Supabase langsung dari klien
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          school: schoolValue,
        }
      }
    });

    if (error) {
      toast.error(`Gagal menambahkan pengguna: ${error.message}`);
    } else {
      toast.success('Pengguna baru berhasil ditambahkan!');
      // Reset form fields
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('');
      setSchool('');
      router.refresh(); // Refresh data di halaman daftar pengguna
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Pengguna Baru</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Menggunakan onSubmit, bukan 'action' */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama Lengkap" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isSubmitting} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label>Peran</Label>
              {/* Select sekarang dikontrol oleh state */}
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menambahkan...' : 'Tambah Pengguna'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}