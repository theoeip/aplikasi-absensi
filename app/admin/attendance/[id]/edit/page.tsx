// Lokasi File: app/admin/attendance/[id]/edit/page.tsx

import { supabaseAdmin } from "@/utils/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import EditAttendanceForm from "./EditAttendanceForm";

// ====================================================================
// BAGIAN PENTING: Fungsi untuk generate halaman statis absensi
// ====================================================================
export async function generateStaticParams() {
  console.log("Mengambil ID absensi untuk generateStaticParams...");

  // DISESUAIKAN: Menggunakan nama tabel 'absensi' sesuai kode Anda.
  const { data: attendances, error } = await supabaseAdmin.from('absensi').select('id');

  if (error) {
    console.error('Gagal mengambil ID absensi dari Supabase saat build:', error);
    return [];
  }

  if (!attendances || attendances.length === 0) {
    console.log('Tidak ada data absensi ditemukan untuk dibuatkan halaman statis.');
    return [];
  }

  console.log(`Ditemukan ${attendances.length} data absensi. Membuat halaman...`);

  return attendances.map((attendance) => ({
    id: attendance.id.toString(),
  }));
}
// ====================================================================
// Akhir dari bagian penting
// ====================================================================


// Tipe data yang Anda definisikan
type PageProps = {
  params: { id: string };
};

interface AttendanceWithUser {
  id: string;
  check_in_time: string;
  status: string;
  users: {
    full_name: string;
  } | null;
}

// Komponen halaman Anda yang sudah diperbarui
export default async function EditAttendancePage({ params }: PageProps) {
  const attendanceId = params.id;

  const { data: attendance, error } = await supabaseAdmin
    .from('absensi')
    .select(`*, users!inner(full_name, school)`)
    .eq('id', attendanceId)
    .single();

  const typedAttendance = attendance as AttendanceWithUser | null;

  if (error || !typedAttendance) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="text-red-500">Gagal memuat data absensi: {error?.message || 'Data tidak ditemukan.'}</p>
      </div>
    );
  }
  
  if (!typedAttendance.users) {
     return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="text-red-500">Data pengguna terkait absensi ini tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Status Absensi</h1>
      <Card>
        <CardHeader>
          <CardTitle>{typedAttendance.users.full_name}</CardTitle>
          <CardDescription>
            Mengubah status kehadiran untuk tanggal {new Date(typedAttendance.check_in_time).toLocaleDateString('id-ID', { dateStyle: 'full' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditAttendanceForm attendanceData={typedAttendance} />
        </CardContent>
      </Card>
    </div>
  );
}