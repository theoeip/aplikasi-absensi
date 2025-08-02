// app/admin/attendance/[id]/edit/page.tsx
import { supabaseAdmin } from "@/utils/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import EditAttendanceForm from "./EditAttendanceForm";

export default async function EditAttendancePage({ params }: { params: { id: string } }) {
  const attendanceId = params.id;

  const { data: attendance, error } = await supabaseAdmin
    .from('absensi')
    .select(`*, users!inner(full_name, school)`)
    .eq('id', attendanceId)
    .single();

  if (error || !attendance) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="text-red-500">Gagal memuat data absensi: {error?.message || 'Data tidak ditemukan.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Status Absensi</h1>
      <Card>
        <CardHeader>
          <CardTitle>{attendance.users.full_name}</CardTitle>
          <CardDescription>
            Mengubah status kehadiran untuk tanggal {new Date(attendance.check_in_time).toLocaleDateString('id-ID', { dateStyle: 'full' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditAttendanceForm attendanceData={attendance} />
        </CardContent>
      </Card>
    </div>
  );
}