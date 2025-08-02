// Lokasi File: app/admin/attendance/page.tsx

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import FilterControls from "./FilterControls";
import ExportButton from "./ExportButton";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers"; // <-- PERBAIKAN 1: Impor cookies

const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

export default async function AttendanceReportPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies(); // <-- PERBAIKAN 2: Dapatkan cookie store
  const supabase = createClient(cookieStore); // <-- PERBAIKAN 3: Berikan ke createClient
  
  const { data: { session } } = await supabase.auth.getSession();
  const adminRole = session?.user?.user_metadata?.role;

  const startDate = searchParams?.start as string;
  const endDate = searchParams?.end as string;
  const schoolFilter = searchParams?.school as string;

  let query = supabaseAdmin
    .from('absensi')
    .select(`id, check_in_time, status, users!inner(full_name, school)`);

  let targetSchool = '';
  if (adminRole === 'AdminSMP') {
    targetSchool = 'SMP BUDI BAKTI UTAMA';
  } else if (adminRole === 'AdminSMK') {
    targetSchool = 'SMK BUDI BAKTI UTAMA';
  } else if (adminRole === 'SuperAdmin' && schoolFilter && schoolFilter !== 'semua') {
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

  const { data: attendanceData, error } = await query.order('check_in_time', { ascending: false });

  if (error) {
    return <p className="text-red-500">Gagal memuat data absensi: {error.message}</p>;
  }

  const filename = `Rekap_Absensi_${targetSchool || 'Semua_Sekolah'}_${startDate || 'awal'}_sd_${endDate || 'akhir'}`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Laporan Absensi</h1>
      <Card>
        <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <FilterControls userRole={adminRole} />
                <ExportButton data={attendanceData || []} filename={filename} />
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Pengguna</TableHead>
                            <TableHead>Sekolah</TableHead>
                            <TableHead>Waktu Absen</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceData && attendanceData.length > 0 ? (
                        attendanceData.map((absen: any) => (
                            <TableRow key={absen.id}>
                                <TableCell className="font-medium">{absen.users.full_name}</TableCell>
                                <TableCell>{absen.users.school}</TableCell>
                                <TableCell>{formatDate(absen.check_in_time)}</TableCell>
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
                            <TableCell colSpan={5} className="h-24 text-center">
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