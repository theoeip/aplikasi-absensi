// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faUserGraduate, faChalkboardTeacher, faUserShield, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      toast.error('Email atau password salah.');
      setLoading(false);
      return;
    }

    const actualUserRole = data.session.user.user_metadata?.role;
    const isUserActuallyAdmin = actualUserRole === 'SuperAdmin' || actualUserRole === 'AdminSMP' || actualUserRole === 'AdminSMK';

    // --- LOGIKA VALIDASI PERAN YANG DIPERKETAT ---
    let isValidRole = false;
    
    // Kasus 1: Mencoba login sebagai "Admin"
    if (loginRole === 'Admin') {
        if (isUserActuallyAdmin) {
            isValidRole = true;
        }
    } 
    // Kasus 2: Mencoba login sebagai "Guru" atau "Siswa"
    else {
        // Cek apakah peran yang dipilih sama dengan peran asli, DAN peran asli BUKAN salah satu dari peran admin
        if (loginRole === actualUserRole && !isUserActuallyAdmin) {
            isValidRole = true;
        }
    }
    // ---------------------------------------------

    if (!isValidRole) {
      toast.error(`Login gagal. Akun ini tidak terdaftar atau tidak diizinkan untuk login sebagai ${loginRole}.`);
      await supabase.auth.signOut(); // Penting: Batalkan sesi yang setengah jadi
      setLoading(false);
      return;
    }
    
    toast.success('Login berhasil!');
    router.refresh(); // Biarkan middleware mengarahkan ke halaman yang benar
  };

  const backToMain = () => {
    setLoginRole(null);
    setEmail('');
    setPassword('');
  };

  // Tampilan pilihan peran
  if (!loginRole) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-bg p-4">
        <Card className="w-full max-w-sm text-center shadow-2xl">
          <CardHeader>
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faGraduationCap} className="text-white text-3xl" />
            </div>
            <CardTitle className="text-2xl font-bold">Sistem Absensi</CardTitle>
            <CardDescription>SMP & SMK Budi Bakti Utama</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full py-6 text-base" onClick={() => setLoginRole('Siswa')}>
              <FontAwesomeIcon icon={faUserGraduate} className="mr-2" />
              Login Siswa
            </Button>
            <Button className="w-full py-6 text-base bg-green-600 hover:bg-green-700" onClick={() => setLoginRole('Guru')}>
              <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-2" />
              Login Guru
            </Button>
            <Button className="w-full py-6 text-base bg-purple-600 hover:bg-purple-700" onClick={() => setLoginRole('Admin')}>
              <FontAwesomeIcon icon={faUserShield} className="mr-2" />
              Login Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tampilan form login
  return (
    <div className="flex items-center justify-center min-h-screen gradient-bg p-4">
        <Card className="w-full max-w-sm shadow-2xl relative">
            <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={backToMain}>
                <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            </Button>
            <CardHeader className="text-center pt-12">
                <CardTitle className="text-2xl font-bold">Login {loginRole}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="email@sekolah.id" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Memproses...' : 'Masuk'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}