// LOKASI FILE: app/student/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

// Helper & Komponen Siswa
import { calculateDistance } from '@/utils/helpers';
import Header from './components/Header';
import Welcome from './components/Welcome';
import QuickStats from './components/QuickStats';
import Attendance from './components/Attendance';
import Schedule from './components/Schedule';
import Assignments from './components/Assignments';
import GroupChat from './components/GroupChat';
import Announcements from './components/Announcements';
import QuickActions from './components/QuickActions';

// Interface UserProfile sudah baik
interface UserProfile {
  full_name: string | null;
  school: string | null;
  role: string | null;
  classes: {
    name: string | null;
  } | null; 
}
// Interface ini akan kita gunakan untuk memperbaiki error
interface SchoolCoordinates { [key: string]: { lat: number; lng: number }; }
interface LocationMessage { text: string; color: string; }
type AttendanceStatus = 'NOT_CLOCKED_IN' | 'CLOCKED_IN' | 'COMPLETED';

// ====================================================================
// === KOMPONEN UTAMA HALAMAN DASBOR SISWA ===
// ====================================================================
export default function StudentDashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [locationMessage, setLocationMessage] = useState<LocationMessage>({ text: 'Mendeteksi lokasi...', color: 'text-gray-500' });
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('NOT_CLOCKED_IN');
  const [todaysAttendanceId, setTodaysAttendanceId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const checkLocation = useCallback(async (profile: UserProfile) => {
    if (!navigator.geolocation) {
      setLocationMessage({ text: 'Geolocation tidak didukung.', color: 'text-yellow-600' });
      return;
    }
    
    const { data: settings } = await supabase.from('settings').select('setting_value').eq('setting_key', 'school_coordinates').single();
    if (!settings || !profile.school) return;

    // --- PERBAIKAN UTAMA: Ganti 'as any' dengan tipe yang sudah didefinisikan ---
    const schoolCoordsData = settings.setting_value as SchoolCoordinates;
    
    const userSchoolKey = profile.school.toLowerCase().includes('smp') ? 'smp' : 'smk';
    const schoolCoords = schoolCoordsData[userSchoolKey];
    if (!schoolCoords) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const dist = calculateDistance(position.coords.latitude, position.coords.longitude, schoolCoords.lat, schoolCoords.lng);
        // Radius diperbesar sedikit menjadi 100m untuk toleransi
        if (dist <= 100) { 
          setIsWithinRadius(true);
          setLocationMessage({ text: 'Anda berada di area sekolah.', color: 'text-green-600' });
        } else {
          setIsWithinRadius(false);
          setLocationMessage({ text: `Anda ${dist.toFixed(0)}m dari sekolah.`, color: 'text-red-600' });
        }
      },
      () => {
        setIsWithinRadius(false);
        setLocationMessage({ text: 'Izin lokasi dibutuhkan.', color: 'text-yellow-600' });
      }
    );
  }, [supabase]);

  const fetchAttendanceStatus = useCallback(async (userId: string) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    
    const { data, error } = await supabase.from('absensi').select('id, check_in_time, check_out_time').eq('user_id', userId).gte('check_in_time', startOfDay).limit(1).maybeSingle();

    if (error) {
        console.error("Error fetching attendance:", error);
        return;
    }

    if (data) {
      setTodaysAttendanceId(data.id as number);
      setAttendanceStatus(data.check_out_time ? 'COMPLETED' : 'CLOCKED_IN');
    } else {
      setAttendanceStatus('NOT_CLOCKED_IN');
    }
  }, [supabase]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Query ini sudah sangat baik
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select(`
            full_name, 
            school, 
            role,
            classes ( name )
        `)
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        toast.error("Gagal memuat profil pengguna.");
        setLoading(false);
        return;
      }

      if (profileData) {
        setUserProfile(profileData as UserProfile);
        await fetchAttendanceStatus(user.id);
        await checkLocation(profileData as UserProfile); 
      }
      setLoading(false);
    };
    fetchInitialData();
    const clockInterval = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, [router, supabase, fetchAttendanceStatus, checkLocation]);

  useEffect(() => {
    if (userProfile) {
      const locationInterval = setInterval(() => checkLocation(userProfile), 10000);
      return () => clearInterval(locationInterval);
    }
  }, [userProfile, checkLocation]);

  const handleClockIn = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Mencatat absen masuk...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Gagal mendapatkan ID pengguna.', { id: toastId }); setIsProcessing(false); return; }
    const { error } = await supabase.from('absensi').insert({ user_id: user.id, status: 'Hadir', check_in_time: new Date().toISOString() });
    if (error) { toast.error('Gagal: ' + error.message, { id: toastId }); } 
    else { toast.success('Absen masuk berhasil!', { id: toastId }); await fetchAttendanceStatus(user.id); }
    setIsProcessing(false);
  };

  const handleClockOut = async () => {
    if (!todaysAttendanceId) { toast.error("Tidak ditemukan data absen masuk."); return; }
    setIsProcessing(true);
    const toastId = toast.loading("Mencatat absen pulang...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Gagal mendapatkan ID pengguna.', { id: toastId }); setIsProcessing(false); return; }
    const { error } = await supabase.from('absensi').update({ check_out_time: new Date().toISOString() }).eq('id', todaysAttendanceId);
    if (error) { toast.error('Gagal: ' + error.message, { id: toastId }); } 
    else { toast.success('Absen pulang berhasil!', { id: toastId }); await fetchAttendanceStatus(user.id); }
    setIsProcessing(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-50">Memuat dasbor siswa...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header userProfile={userProfile} onLogout={async () => { await supabase.auth.signOut(); router.push('/login'); }} />
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <Welcome userProfile={userProfile} currentDate={currentDate} />
        <QuickStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <Attendance 
              isWithinRadius={isWithinRadius}
              locationMessage={locationMessage}
              attendanceStatus={attendanceStatus}
              isProcessing={isProcessing}
              currentDate={currentDate}
              handleClockIn={handleClockIn}
              handleClockOut={handleClockOut}
            />
            <Schedule />
            <Assignments />
          </div>
          <div className="space-y-8">
            <GroupChat />
            <Announcements />
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}