// Lokasi File: app/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { calculateDistance } from '@/utils/helpers';
import AttendanceCalendar from './AttendanceCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Ikon
import { FaGraduationCap, FaSignOutAlt, FaMapMarkerAlt, FaExclamationTriangle, FaBell, FaUsers, FaTasks } from 'react-icons/fa';
import { BsFillGrid3X3GapFill, BsCalendarEvent, BsUpload, BsChatDotsFill, BsBarChartFill, BsPencilSquare } from "react-icons/bs";
import { IoIosDocument } from "react-icons/io";

// --- Interface ---
interface UserProfile { full_name: string | null; role: string | null; school: string | null; }
interface SchoolCoordinates { [key:string]: { lat: number, lng: number }; }
interface LocationMessage { text: string; color: string; icon: React.ElementType; }
type AttendanceStatus = 'NOT_CLOCKED_IN' | 'CLOCKED_IN' | 'COMPLETED';

// ====================================================================
// === KOMPONEN UI ===
// ====================================================================

const DashboardHeader = ({ userProfile, onLogout }: { userProfile: UserProfile | null, onLogout: () => void }) => (
    <header className="bg-purple-700 text-white shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                    <FaGraduationCap size={24} />
                    <span className="text-xl font-bold">EduAttend - Dashboard Guru</span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="font-semibold">Selamat datang, {userProfile?.full_name || '...'}</p>
                        <p className="text-sm opacity-90">{userProfile?.role || 'Guru'}</p>
                    </div>
                    <button onClick={onLogout} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <FaSignOutAlt size={20} />
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const AppMenuCard = () => {
    // --- PERBAIKAN UTAMA DI SINI ---
    const menuItems = [
        // Link ini diubah dari /admin/attendance menjadi /dashboard/attendance
        { icon: BsFillGrid3X3GapFill, title: "Absensi Siswa", desc: "Kelola absensi per kelas", href: "/dashboard/attendance" },
        { icon: IoIosDocument, title: "Data Kelas", desc: "Kelola data kelas", href: "/admin/classes" },
        { icon: BsPencilSquare, title: "Ulangan", desc: "Buat & kelola ujian", href: "/admin/exams" },
        { icon: BsUpload, title: "Upload Soal", desc: "Upload bank soal", href: "/admin/questions" },
        { icon: FaTasks, title: "Tugas", desc: "Kelola tugas siswa", href: "/admin/assignments" },
        { icon: BsChatDotsFill, title: "Group Chat", desc: "Chat per kelas", href: "/admin/chat" },
        { icon: BsCalendarEvent, title: "Jadwal", desc: "Jadwal mengajar", href: "/admin/schedule" },
        { icon: BsBarChartFill, title: "Nilai", desc: "Input & lihat nilai", href: "/admin/grades" },
        { icon: IoIosDocument, title: "Laporan", desc: "Generate laporan", href: "/admin/reports" },
    ];
    return (
        <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><BsFillGrid3X3GapFill/> Menu Aplikasi</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {menuItems.map(item => (
                        <Link href={item.href} key={item.title} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg flex flex-col items-center text-center gap-2 transition-colors">
                            <item.icon size={28} className="text-purple-600"/>
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-gray-500 hidden md:block">{item.desc}</p>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const StatsBar = () => {
    const stats = [
        { value: "156", label: "Total Siswa", icon: FaUsers, color: "text-blue-500" },
        { value: "8", label: "Kelas Aktif", icon: FaGraduationCap, color: "text-green-500" },
        { value: "24", label: "Tugas Pending", icon: FaTasks, color: "text-yellow-500" },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map(stat => (
                <Card key={stat.label}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <stat.icon size={36} className={stat.color} />
                        <div>
                            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-gray-600">{stat.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

// ====================================================================
// === KOMPONEN UTAMA HALAMAN ===
// ====================================================================
export default function DashboardPage() {
    const supabase = createClient();
    const router = useRouter();
  
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isWithinRadius, setIsWithinRadius] = useState(false);
    const [loading, setLoading] = useState(true);
    const [locationMessage, setLocationMessage] = useState<LocationMessage>({ text: 'Mendeteksi lokasi...', color: 'text-gray-500', icon: FaMapMarkerAlt });
    const [clock, setClock] = useState(new Date());
    const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('NOT_CLOCKED_IN');
    const [todaysAttendanceId, setTodaysAttendanceId] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const checkLocation = useCallback(async () => {
        if (!userProfile) return; 
        if (!navigator.geolocation) { setLocationMessage({text: 'Geolocation tidak didukung.', color: 'text-yellow-600', icon: FaExclamationTriangle}); return; }
        const { data: settings } = await supabase.from('settings').select('setting_value').eq('setting_key', 'school_coordinates').single();
        if (!settings || !userProfile.school) return;
        const schoolCoordsData = settings.setting_value as SchoolCoordinates;
        const userSchoolKey = userProfile.school.toLowerCase().includes('smp') ? 'smp' : 'smk';
        const schoolCoords = schoolCoordsData[userSchoolKey];
        if (!schoolCoords) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const dist = calculateDistance(position.coords.latitude, position.coords.longitude, schoolCoords.lat, schoolCoords.lng);
                if (dist <= 55) { setIsWithinRadius(true); setLocationMessage({text: 'Anda berada di area sekolah.', color: 'text-green-600', icon: FaMapMarkerAlt});
                } else { setIsWithinRadius(false); setLocationMessage({text: `Anda ${dist.toFixed(0)}m dari sekolah.`, color: 'text-red-600', icon: FaMapMarkerAlt}); }
            }, () => { setIsWithinRadius(false); setLocationMessage({text: 'Izin lokasi dibutuhkan.', color: 'text-yellow-600', icon: FaExclamationTriangle}); }
        );
    }, [userProfile, supabase]);
  
    const fetchAttendanceStatus = useCallback(async (userId: string) => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    
        const { data, error } = await supabase
            .from('absensi')
            .select('id, check_in_time, check_out_time')
            .eq('user_id', userId)
            .gte('check_in_time', startOfDay)
            .order('check_in_time', { ascending: false })
            .limit(1);

        if (error) {
            console.error("Gagal memeriksa status absensi:", error);
            toast.error("Gagal memeriksa status absensi: " + error.message);
            setAttendanceStatus('NOT_CLOCKED_IN');
            return;
        }

        if (data && data.length > 0) {
            const latestAttendance = data[0];
            setTodaysAttendanceId(latestAttendance.id);
            setAttendanceStatus(latestAttendance.check_out_time ? 'COMPLETED' : 'CLOCKED_IN');
        } else {
            setAttendanceStatus('NOT_CLOCKED_IN');
        }
    }, [supabase]);

    useEffect(() => {
        const clockInterval = setInterval(() => setClock(new Date()), 1000);
        const fetchInitialData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }
            const { data: profile } = await supabase.from('users').select('full_name, role, school').eq('id', user.id).single();
            if (profile) {
                setUserProfile(profile);
                await fetchAttendanceStatus(user.id);
            } else {
                toast.error("Gagal memuat profil pengguna.");
            }
            setLoading(false);
        };
        fetchInitialData();
        return () => clearInterval(clockInterval);
    }, [router, supabase, fetchAttendanceStatus]);

    useEffect(() => {
        if (userProfile) { checkLocation(); const locationInterval = setInterval(checkLocation, 5000); return () => clearInterval(locationInterval); }
    }, [userProfile, checkLocation]);

    const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };
    const handleClockIn = async () => {
        setIsProcessing(true);
        const toastId = toast.loading("Mencatat absen masuk...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { toast.error('Gagal mendapatkan ID pengguna.', { id: toastId }); setIsProcessing(false); return; }
        const { error } = await supabase.from('absensi').insert({ user_id: user.id, status: 'Hadir', check_in_time: new Date().toISOString() });
        if (error) { toast.error('Gagal mencatat absen masuk: ' + error.message, { id: toastId }); } else { toast.success('Absen masuk berhasil dicatat!', { id: toastId }); await fetchAttendanceStatus(user.id); }
        setIsProcessing(false);
    };
    const handleClockOut = async () => {
        if (!todaysAttendanceId) { toast.error("Tidak ditemukan data absen masuk untuk hari ini."); return; }
        setIsProcessing(true);
        const toastId = toast.loading("Mencatat absen pulang...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { toast.error('Gagal mendapatkan ID pengguna.', { id: toastId }); setIsProcessing(false); return; }
        const { error } = await supabase.from('absensi').update({ check_out_time: new Date().toISOString() }).eq('id', todaysAttendanceId);
        if (error) { toast.error('Gagal mencatat absen pulang: ' + error.message, { id: toastId }); } else { toast.success('Absen pulang berhasil dicatat!', { id: toastId }); await fetchAttendanceStatus(user.id); }
        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <DashboardHeader userProfile={userProfile} onLogout={handleLogout} />
            <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex flex-col gap-6 w-full lg:w-1/3">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><FaBell/> Jam Absensi</CardTitle></CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="text-center">
                                    <p className="text-5xl font-bold text-gray-800">{clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                    <p className="text-gray-600">{clock.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className={`text-sm font-medium flex items-center justify-center gap-2 p-2 rounded-md w-full text-center ${locationMessage.color}`}><locationMessage.icon /><span>{locationMessage.text}</span></div>
                                <div className="flex gap-4 w-full">
                                    <Button className="flex-1 bg-green-500 hover:bg-green-600" disabled={!isWithinRadius || loading || isProcessing || attendanceStatus !== 'NOT_CLOCKED_IN'} onClick={handleClockIn}>{attendanceStatus !== 'NOT_CLOCKED_IN' ? 'Sudah Absen Masuk' : 'Absen Masuk'}</Button>
                                    <Button className="flex-1 bg-red-500 hover:bg-red-600" disabled={!isWithinRadius || loading || isProcessing || attendanceStatus !== 'CLOCKED_IN'} onClick={handleClockOut}>{attendanceStatus === 'COMPLETED' ? 'Sudah Absen Pulang' : 'Absen Pulang'}</Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><BsCalendarEvent/> Kalender</CardTitle></CardHeader>
                            <CardContent><AttendanceCalendar /></CardContent>
                        </Card>
                    </div>
                    <div className="w-full lg:w-2/3"><AppMenuCard /></div>
                </div>
                <StatsBar />
            </main>
        </div>
    );
}
