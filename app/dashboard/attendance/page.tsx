// Lokasi File: app/dashboard/attendance/page.tsx
'use client';

// --- PERBAIKAN: Tambahkan koma yang hilang setelah 'useState' ---
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Impor semua komponen
import Header from './components/Header';
import InfoCards from './components/InfoCards';
import TeacherAttendanceForm from './components/TeacherAttendanceForm';
import StudentAttendanceList from './components/StudentAttendanceList';
import AttendanceHistory from './components/AttendanceHistory';

// --- Tipe Data ---
interface UserProfile {
  full_name: string | null;
  role: string | null;
  school: string | null;
}

interface Student {
  id: string;
  name: string;
  status: 'hadir' | 'tidak_hadir' | 'belum';
  alasan?: string;
}

interface AttendanceSession {
  subject: string;
  className: string;
}

interface HistoryEntry {
    time: string;
    subject: string;
    className: string;
    present: number;
    absent: number;
}

export default function TeacherAttendancePage() {
  const supabase = createClient();
  const router = useRouter();

  // --- State Management ---
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Mengambil data guru yang login
  const fetchUserData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, role, school')
      .eq('id', user.id)
      .single();
    
    setUserProfile(profile);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Fungsi untuk memulai sesi absensi
  const handleStartSession = async (subject: string, className: string) => {
    if (!userProfile?.school) {
        toast.error("Tidak dapat menentukan sekolah guru.");
        return;
    }
    toast.info(`Memuat daftar siswa untuk kelas ${className}...`);
    
    // Ambil daftar siswa dari database berdasarkan kelas dan sekolah guru
    const { data: studentData, error } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'Siswa')
      .eq('school', userProfile.school)
      .eq('class_name', className);

    if (error) {
      toast.error(`Gagal memuat siswa: ${error.message}`);
      return;
    }

    if (studentData.length === 0) {
        toast.warning(`Tidak ada siswa yang ditemukan di kelas ${className}.`);
    }

    const formattedStudents = studentData.map(s => ({
      id: s.id,
      name: s.full_name || 'Tanpa Nama',
      status: 'belum' as const
    }));
    
    setStudents(formattedStudents);
    setSession({ subject, className });
    toast.success(`Sesi untuk ${subject} di kelas ${className} dimulai.`);
  };

  // Fungsi untuk mengubah status absensi per siswa
  const handleStudentStatusChange = (studentId: string, newStatus: 'hadir' | 'tidak_hadir', reason?: string) => {
    setStudents(prevStudents => 
      prevStudents.map(s => 
        s.id === studentId ? { ...s, status: newStatus, alasan: reason } : s
      )
    );
  };
  
  // Fungsi untuk menyimpan data absensi ke database
  const handleSaveAttendance = async () => {
    if (!session) {
        toast.error("Sesi belum dimulai. Pilih mata pelajaran dan kelas terlebih dahulu.");
        return;
    }

    const attendanceRecords = students
      .filter(s => s.status !== 'belum')
      .map(s => ({
        user_id: s.id,
        status: s.status === 'hadir' ? 'Hadir' : (s.alasan || 'Tidak Hadir'),
        check_in_time: new Date().toISOString(), // Simpan waktu saat ini
      }));

    if (attendanceRecords.length === 0) {
        toast.warning("Tidak ada data absensi untuk disimpan.");
        return;
    }

    const { error } = await supabase.from('absensi').insert(attendanceRecords);

    if (error) {
        toast.error(`Gagal menyimpan data: ${error.message}`);
    } else {
        toast.success("Data absensi berhasil disimpan!");
        const presentCount = students.filter(s => s.status === 'hadir').length;
        const absentCount = students.filter(s => s.status === 'tidak_hadir').length;
        const newHistoryEntry = {
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            subject: session.subject,
            className: session.className,
            present: presentCount,
            absent: absentCount,
        };
        setHistory(prev => [newHistoryEntry, ...prev]);
        // Reset sesi
        setSession(null);
        setStudents([]);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Memuat data guru...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans">
      <Header userProfile={userProfile} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InfoCards students={students} sessionActive={!!session} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1">
            <TeacherAttendanceForm onStartSession={handleStartSession} />
          </div>

          <div className="lg:col-span-2">
            <StudentAttendanceList 
              students={students} 
              onStatusChange={handleStudentStatusChange}
              onSave={handleSaveAttendance}
              sessionActive={!!session}
            />
          </div>
        </div>

        <div className="mt-8">
          <AttendanceHistory history={history} />
        </div>
      </main>
    </div>
  );
}
