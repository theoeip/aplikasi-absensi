// Lokasi File: app/admin/settings/page.tsx

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Kita akan buat komponen ini di langkah berikutnya
import SettingsClientPage from './SettingsClientPage';

// Definisikan tipe data untuk kejelasan
interface SchoolCoordinate {
  lat: number;
  lng: number;
}
interface SchoolSettings {
  smp?: SchoolCoordinate;
  smk?: SchoolCoordinate;
}

export default async function SettingsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Ambil data sesi pengguna
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }
  const adminRole = session.user.user_metadata?.role;

  // 2. Tentukan sekolah admin
  let adminSchool = '';
  if (adminRole === 'AdminSMP') {
    adminSchool = 'SMP BUDI BAKTI UTAMA';
  } else if (adminRole === 'AdminSMK') {
    adminSchool = 'SMK BUDI BAKTI UTAMA';
  }

  // 3. Ambil SEMUA data yang diperlukan untuk halaman pengaturan
  
  // a. Data Koordinat GPS (dari kode Anda sebelumnya)
  const { data: schoolCoordsData } = await supabase
    .from('settings')
    .select('setting_value')
    .eq('setting_key', 'school_coordinates')
    .single();
  const initialCoordinates = (schoolCoordsData?.setting_value || {}) as SchoolSettings;

  // b. Data Kelas (Rombel)
  let classesQuery = supabase.from('classes').select('*');
  if (adminSchool) {
    classesQuery = classesQuery.eq('school', adminSchool);
  }
  const { data: classes } = await classesQuery;

  // c. Data Mata Pelajaran
  const { data: subjects } = await supabase.from('subjects').select('*');
  
  // d. Data Jadwal
  // Ini adalah query yang lebih kompleks untuk mengambil nama guru, kelas, dan mapel
  let schedulesQuery = supabase.from('schedules').select(`
    id,
    day_of_week,
    start_time,
    end_time,
    users (full_name),
    classes (name, school),
    subjects (name)
  `);
  if (adminSchool) {
    schedulesQuery = schedulesQuery.eq('classes.school', adminSchool);
  }
  const { data: schedules } = await schedulesQuery;


  // e. Data Guru yang Tersedia untuk Jadwal
  let teachersQuery = supabase.from('users').select('id, full_name').eq('role', 'Guru');
  if (adminSchool) {
    teachersQuery = teachersQuery.eq('school', adminSchool);
  }
  const { data: teachers } = await teachersQuery;
  
  // 4. Kirim semua data ke komponen klien
  return (
    <div className="p-6 md:p-10">
      <SettingsClientPage
        initialCoordinates={initialCoordinates}
        initialClasses={classes || []}
        initialSubjects={subjects || []}
        initialSchedules={schedules || []}
        availableTeachers={teachers || []}
        adminRole={adminRole || ''}
        adminSchool={adminSchool}
      />
    </div>
  );
}
