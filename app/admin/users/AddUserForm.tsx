// File: app/admin/users/AddUserForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addUser } from './actions';

// Komponen UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddUserForm({ userRole }: { userRole: string }) {
  const router = useRouter();

  // --- PERBAIKAN 1: Tambahkan state untuk kelas ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [school, setSchool] = useState('');
  const [className, setClassName] = useState(''); // State baru untuk kelas
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const normalizeName = (name: string) => name.toLowerCase().replace(/\s+/g, '');
    const getSchoolDomain = (sch: string) => {
      if (sch === 'SMP BUDI BAKTI UTAMA') return 'smpbbu.id';
      if (sch === 'SMK BUDI BAKTI UTAMA') return 'smkbbu.id';
      return '';
    };
    const effectiveSchool = userRole === 'SuperAdmin' ? school : (userRole === 'AdminSMP' ? 'SMP BUDI BAKTI UTAMA' : 'SMK BUDI BAKTI UTAMA');
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
  }, [fullName, role, school, userRole]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    const schoolValue = userRole === 'SuperAdmin' ? school : (userRole === 'AdminSMP' ? 'SMP BUDI BAKTI UTAMA' : 'SMK BUDI BAKTI UTAMA');
    formData.append('school', schoolValue);

    // --- PERBAIKAN 2: Tambahkan data kelas ke FormData jika peran adalah Siswa ---
    if (role === 'Siswa') {
      formData.append('class_name', className);
    }

    const result = await addUser(formData);

    if (result.success) {
      toast.success(result.message);
      setFullName('');
      setPassword('');
      setRole('');
      setSchool('');
      setClassName(''); // Reset state kelas
      router.refresh();
    } else {
      toast.error(result.message);
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
          
          {/* --- PERBAIKAN 3: Tambahkan input kelas yang muncul secara kondisional --- */}
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

            {/* Kolom Kelas akan muncul jika peran adalah "Siswa" */}
            {role === 'Siswa' && (
              <div className="space-y-2">
                <Label htmlFor="class_name">Kelas</Label>
                <Input 
                  id="class_name" 
                  value={className} 
                  onChange={(e) => setClassName(e.target.value)} 
                  placeholder="Contoh: XII RPL 1" 
                  required 
                  disabled={isSubmitting} 
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1">
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
