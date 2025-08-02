// app/admin/users/AddUserForm.tsx
'use client';

import { addUser } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRef, useState } from 'react';

export default function AddUserForm({ userRole }: { userRole: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async (formData: FormData) => {
    setIsSubmitting(true);
    const result = await addUser(formData);
    if (result.success) {
      toast.success(result.message);
      ref.current?.reset();
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
        <form ref={ref} action={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" name="full_name" placeholder="Nama Lengkap" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Email" required disabled={isSubmitting} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Password" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label>Peran</Label>
              <Select name="role" required disabled={isSubmitting}>
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
              <Select name="school" required disabled={isSubmitting}>
                <SelectTrigger><SelectValue placeholder="Pilih Sekolah" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMP BUDI BAKTI UTAMA">SMP BUDI BAKTI UTAMA</SelectItem>
                  <SelectItem value="SMK BUDI BAKTI UTAMA">SMK BUDI BAKTI UTAMA</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <>
                <Input
                  value={userRole === 'AdminSMP' ? 'SMP BUDI BAKTI UTAMA' : 'SMK BUDI BAKTI UTAMA'}
                  className="bg-gray-100 dark:bg-slate-700"
                  readOnly
                />
                <input
                  type="hidden"
                  name="school"
                  value={userRole === 'AdminSMP' ? 'SMP BUDI BAKTI UTAMA' : 'SMK BUDI BAKTI UTAMA'}
                />
              </>
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