// Lokasi File: app/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { calculateDistance } from '@/utils/helpers';
import AttendanceCalendar from './AttendanceCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// === PERBAIKAN: INI ADALAH BAGIAN YANG HILANG ===
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faGraduationCap, 
    faSignOutAlt,
    faMapMarkerAlt, 
    faExclamationTriangle, 
    faSignInAlt 
} from '@fortawesome/free-solid-svg-icons';
// ===============================================

// --- Interface yang Diperlukan ---
interface UserProfile {
  full_name: string | null;
  role: string | null;
  school: string | null;
}

interface SchoolCoordinates {
  [key: string]: { lat: number, lng: number };
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationMessage, setLocationMessage] = useState<{text: string; color: string; icon: IconDefinition}>({
    text: 'Mendeteksi lokasi...', color: 'text-gray-500', icon: faMapMarkerAlt
  });
  const [clock, setClock] = useState(new Date());

  const checkLocation = useCallback(async () => {
    if (!userProfile) return; 

    if (!navigator.geolocation) {
      setLocationMessage({text: 'Geolocation tidak didukung.', color: 'text-yellow-600', icon: faExclamationTriangle});
      return;
    }

    const { data: settings } = await supabase.from('settings').select('setting_value').eq('setting_key', 'school_coordinates').single();
    if (!settings || !userProfile.school) return;

    const schoolCoordsData = settings.setting_value as SchoolCoordinates;
    const userSchoolKey = userProfile.school.toLowerCase().includes('smp') ? 'smp' : 'smk';
    const schoolCoords = schoolCoordsData[userSchoolKey];

    if (!schoolCoords) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const dist = calculateDistance(position.coords.latitude, position.coords.longitude, schoolCoords.lat, schoolCoords.lng);
        if (dist <= 30) {
          setIsWithinRadius(true);
          setLocationMessage({text: 'Anda berada di area sekolah.', color: 'text-green-600', icon: faMapMarkerAlt});
        } else {
          setIsWithinRadius(false);
          setLocationMessage({text: `Anda ${dist.toFixed(0)}m dari sekolah.`, color: 'text-red-600', icon: faMapMarkerAlt});
        }
      },
      () => {
        setIsWithinRadius(false);
        setLocationMessage({text: 'Izin lokasi dibutuhkan.', color: 'text-yellow-600', icon: faExclamationTriangle});
      }
    );
  }, [userProfile, supabase]);

  useEffect(() => {
    const clockInterval = setInterval(() => setClock(new Date()), 1000);

    const fetchUserProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase.from('users').select('full_name, role, school').eq('id', user.id).single();
      if (profile) {
        setUserProfile(profile);
      } else {
        toast.error("Gagal memuat profil pengguna.");
      }
      setLoading(false);
    };
    
    fetchUserProfile();

    return () => clearInterval(clockInterval);
  }, [router, supabase]);

  useEffect(() => {
    if (userProfile) {
      checkLocation();
      const locationInterval = setInterval(checkLocation, 5000);
      return () => clearInterval(locationInterval);
    }
  }, [userProfile, checkLocation]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleAbsen = async () => {
    const toastId = toast.loading('Memproses absensi...');
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return toast.error('Gagal mendapatkan ID pengguna.', { id: toastId });

    const { error } = await supabase.from('absensi').insert({
      user_id: user.id,
      status: 'Hadir',
    });

    if (error) {
      toast.error(error.message.includes('duplicate key') ? 'Anda sudah absen hari ini.' : 'Gagal menyimpan absensi.', { id: toastId });
    } else {
      toast.success('Absensi berhasil dicatat!', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faGraduationCap} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sistem Absensi</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Budi Bakti Utama</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">{userProfile?.full_name || 'Memuat...'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{userProfile?.role || ''}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="text-xl text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardContent className="text-center p-6">
                <div className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mb-4">
                  {clock.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className={`text-sm font-medium flex items-center justify-center ${locationMessage.color}`}>
                  <FontAwesomeIcon icon={locationMessage.icon} className="mr-2" />
                  {locationMessage.text}
                </div>
              </CardContent>
            </Card>
            <Button
              className="w-full h-24 text-xl font-bold transition-transform transform hover:scale-105"
              disabled={!isWithinRadius || loading}
              onClick={handleAbsen}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="mr-3 text-2xl" />
              {isWithinRadius ? 'ABSEN SEKARANG' : 'DI LUAR JANGKAUAN'}
            </Button>
          </div>
          <div className="lg:col-span-1">
            <AttendanceCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}