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

// Interface data, tidak ada perubahan
interface AttendanceRecord {
  id: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  users: {
    full_name: string;
    school: string;
    role: string;
    classes: {
      name: string | null;
    } | null;
  } | null;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

function AttendanceReportComponent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

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

      // --- PERBAIKAN UTAMA: Query disederhanakan ---
      // Kita tidak perlu lagi logika filter peran di sini.
      // RLS di database akan menangani penyaringan data secara otomatis dan aman.
      let query = supabase
        .from('absensi')
        .select(`
          id, 
          check_in_time, 
          check_out_time, 
          status, 
          users!inner(
            full_name, 
            school, 
            role,
            classes(name) 
          )
        `);

      // Filter sekolah dari UI HANYA berlaku untuk SuperAdmin.
      // Jika AdminSMP/AdminSMK mencoba menambahkan parameter ini di URL, RLS tetap akan memblokirnya.
      if (role === 'SuperAdmin' && schoolFilter && schoolFilter !== 'semua') {
        // Filter ini menggunakan nama sekolah lengkap dari URL, contoh: "SMK BUDI BAKTI UTAMA"
        query = query.eq('users.school', schoolFilter);
      }

      // Filter tanggal tetap diperlukan karena ini adalah logika bisnis, bukan keamanan.
      if (startDate) {
        query = query.gte('check_in_time', new Date(startDate).toISOString());
      }
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('check_in_time', nextDay.toISOString());
      }

      // Jalankan query yang sudah jauh lebih bersih
      const { data, error } = await query.order('check_in_time', { ascending: false });

      if (error) {
        console.error("Gagal memuat data absensi:", error.message);
        setAllAttendanceData([]);
      } else {
        const allData = data as AttendanceRecord[];
        setAllAttendanceData(allData);

        setStudentData(allData.filter(record => record.users?.role === 'Siswa'));
        setTeacherData(allData.filter(record => record.users?.role === 'Guru'));
        
        // Perbaikan pada nama file agar lebih dinamis
        const newFilename = `Rekap_Absensi_${schoolFilter || 'Semua_Data'}_${startDate || 'awal'}_sd_${endDate || 'akhir'}`;
        setFilename(newFilename);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [searchParams, supabase]);

  if (isLoading) {
    return <div>Memuat data laporan...</div>;
  }

  // --- TIDAK ADA PERUBAHAN PADA BAGIAN RENDER DI BAWAH INI ---
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Laporan Absensi</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <FilterControls userRole={adminRole} />
            <ExportButton data={allAttendanceData} filename={filename} />
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pengguna</TableHead>
                  <TableHead>Sekolah</TableHead>
                  <TableHead>Kelas</TableHead>
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
                    <TableCell>{absen.users?.classes?.name || '-'}</TableCell>
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
                    <TableCell>-</TableCell>
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
                      Tidak ada data absensi yang ditemukan untuk filter yang dipilih.
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
        <Suspense fallback={<div>Memuat Laporan...</div>}>
            <AttendanceReportComponent />
        </Suspense>
    )
}