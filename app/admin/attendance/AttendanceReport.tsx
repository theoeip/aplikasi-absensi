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

// LANGKAH 1: Perbarui Interface
interface AttendanceRecord {
  id: string;
  check_in_time: string;
  check_out_time: string | null; // Ditambahkan
  status: string;
  users: {
    full_name: string;
    school: string;
  } | null;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

function AttendanceReportComponent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
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

      // LANGKAH 2: Perbarui Query Supabase
      let query = supabase
        .from('absensi')
        .select(`id, check_in_time, check_out_time, status, users!inner(full_name, school)`); // check_out_time ditambahkan

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
        setAttendanceData([]);
      } else {
        setAttendanceData(data as AttendanceRecord[]);
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
            <ExportButton data={attendanceData} filename={filename} />
          </div>
          <div className="border rounded-md">
            {/* LANGKAH 3: Perbarui Tabel JSX */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pengguna</TableHead>
                  <TableHead>Sekolah</TableHead>
                  <TableHead>Waktu Masuk</TableHead>
                  <TableHead>Waktu Pulang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((absen) => (
                    <TableRow key={absen.id}>
                      <TableCell className="font-medium">{absen.users?.full_name}</TableCell>
                      <TableCell>{absen.users?.school}</TableCell>
                      <TableCell>{formatDate(absen.check_in_time)}</TableCell>
                      <TableCell>
                        {absen.check_out_time ? formatDate(absen.check_out_time) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          absen.status === 'Hadir' ? 'default' :
                          absen.status === 'Izin' ? 'secondary' :
                          absen.status === 'Sakit' ? 'warning' : 'destructive'
                        }>
                          {absen.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/attendance/${absen.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center"> {/* colSpan diubah jadi 6 */}
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