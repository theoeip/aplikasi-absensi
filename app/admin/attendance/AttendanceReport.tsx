// Lokasi File: app/admin/attendance/AttendanceReport.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from "next/link";

// Impor komponen UI Anda
import FilterControls from "./FilterControls";
import ExportButton from "./ExportButton";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- PERBAIKAN 1: Perbarui Interface ---
// Tambahkan 'role' dan 'class_name'
interface AttendanceRecord {
  id: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  users: {
    full_name: string;
    school: string;
    role: string;
    class_name: string | null;
  } | null;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

function AttendanceReportComponent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  // --- PERBAIKAN 2: Tambahkan state terpisah untuk siswa dan guru ---
  const [allAttendanceData, setAllAttendanceData] = useState<AttendanceRecord[]>([]);
  const [studentData, setStudentData] = useState<AttendanceRecord[]>([]);
  const [teacherData, setTeacherData] = useState<AttendanceRecord[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [adminRole, setAdminRole] = useState<string | undefined>(undefined);
  const [filename, setFilename] = useState('Rekap_Absensi');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.role;
      setAdminRole(role);

      if (!session || !role) {
        setIsLoading(false);
        return;
      }

      const startDate = searchParams.get('start');
      const endDate = searchParams.get('end');
      const schoolFilter = searchParams.get('school');

      // --- PERBAIKAN 3: Perbarui Query Supabase untuk mengambil 'role' dan 'class_name' ---
      let query = supabase
        .from('absensi')
        .select(`id, check_in_time, check_out_time, status, users!inner(full_name, school, role, class_name)`);

      let targetSchool = '';
      if (role === 'AdminSMP') {
        targetSchool = 'SMP BUDI BAKTI UTAMA';
      } else if (role === 'AdminSMK') {
        targetSchool = 'SMK BUDI BAKTI UTAMA';
      } else if (role === 'SuperAdmin' && schoolFilter && schoolFilter !== 'semua') {
        targetSchool = schoolFilter;
      }

      if (targetSchool) {
        query = query.eq('users.school', targetSchool);
      }
      if (startDate) {
        query = query.gte('check_in_time', new Date(startDate).toISOString());
      }
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('check_in_time', nextDay.toISOString());
      }

      const { data, error } = await query.order('check_in_time', { ascending: false });

      if (error) {
        console.error("Gagal memuat data absensi:", error.message);
        setAllAttendanceData([]);
      } else {
        const allData = data as AttendanceRecord[];
        setAllAttendanceData(allData); // Simpan semua data untuk export

        // --- PERBAIKAN 4: Pisahkan data berdasarkan peran ---
        setStudentData(allData.filter(record => record.users?.role === 'Siswa'));
        setTeacherData(allData.filter(record => record.users?.role === 'Guru'));
        
        const newFilename = `Rekap_Absensi_${targetSchool || 'Semua_Sekolah'}_${startDate || 'awal'}_sd_${endDate || 'akhir'}`;
        setFilename(newFilename);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [searchParams, supabase]);

  if (isLoading) {
    return <div>Memuat data laporan...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Laporan Absensi</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <FilterControls userRole={adminRole} />
            {/* Pastikan ExportButton menerima semua data */}
            <ExportButton data={allAttendanceData} filename={filename} />
          </div>
          <div className="border rounded-md">
            {/* --- PERBAIKAN 5: Perbarui struktur tabel --- */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pengguna</TableHead>
                  <TableHead>Sekolah</TableHead>
                  <TableHead>Kelas</TableHead> {/* Kolom Baru */}
                  <TableHead>Waktu Masuk</TableHead>
                  <TableHead>Waktu Pulang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Bagian Siswa */}
                {studentData.length > 0 && (
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableCell colSpan={7} className="font-bold text-gray-700">SISWA</TableCell>
                  </TableRow>
                )}
                {studentData.map((absen) => (
                  <TableRow key={`siswa-${absen.id}`}>
                    <TableCell className="font-medium">{absen.users?.full_name}</TableCell>
                    <TableCell>{absen.users?.school}</TableCell>
                    <TableCell>{absen.users?.class_name || '-'}</TableCell>
                    <TableCell>{formatDate(absen.check_in_time)}</TableCell>
                    <TableCell>{absen.check_out_time ? formatDate(absen.check_out_time) : '-'}</TableCell>
                    <TableCell><Badge variant={absen.status === 'Hadir' ? 'default' : 'destructive'}>{absen.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm"><Link href={`/admin/attendance/${absen.id}/edit`}>Edit</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Bagian Guru */}
                {teacherData.length > 0 && (
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableCell colSpan={7} className="font-bold text-gray-700">GURU</TableCell>
                  </TableRow>
                )}
                {teacherData.map((absen) => (
                  <TableRow key={`guru-${absen.id}`}>
                    <TableCell className="font-medium">{absen.users?.full_name}</TableCell>
                    <TableCell>{absen.users?.school}</TableCell>
                    <TableCell>-</TableCell> {/* Guru tidak punya kelas */}
                    <TableCell>{formatDate(absen.check_in_time)}</TableCell>
                    <TableCell>{absen.check_out_time ? formatDate(absen.check_out_time) : '-'}</TableCell>
                    <TableCell><Badge variant={absen.status === 'Hadir' ? 'default' : 'destructive'}>{absen.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm"><Link href={`/admin/attendance/${absen.id}/edit`}>Edit</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Pesan Jika Kosong */}
                {allAttendanceData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Tidak ada data absensi yang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AttendanceReportPageClient() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AttendanceReportComponent />
        </Suspense>
    )
}