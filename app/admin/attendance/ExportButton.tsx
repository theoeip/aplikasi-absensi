// app/admin/attendance/ExportButton.tsx
'use client';

import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';

// --- PERBAIKAN 1: Perbarui Tipe Data ---
// Sesuaikan dengan tipe data di AttendanceReport.tsx
type AttendanceData = {
  users: {
    full_name: string | null;
    school: string | null;
    role: string | null;
    class_name: string | null;
  } | null;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
};

// Komponen ini menerima data yang akan diekspor sebagai 'prop'
export default function ExportButton({ data, filename }: { data: AttendanceData[], filename: string }) {
  
  const exportToExcel = () => {
    // --- PERBAIKAN 2: Pisahkan data dan format untuk Excel ---
    
    // 1. Pisahkan data siswa dan guru
    const studentData = data.filter(item => item.users?.role === 'Siswa');
    const teacherData = data.filter(item => item.users?.role === 'Guru');

    // 2. Format data siswa
    const formattedStudentData = studentData.map(item => ({
      'Nama Pengguna': item.users?.full_name || 'N/A',
      'Sekolah': item.users?.school || 'N/A',
      'Kelas': item.users?.class_name || '-', // Tambahkan kolom kelas
      'Waktu Masuk': new Date(item.check_in_time).toLocaleString('id-ID'),
      'Waktu Pulang': item.check_out_time ? new Date(item.check_out_time).toLocaleString('id-ID') : '-',
      'Status': item.status,
    }));

    // 3. Format data guru
    const formattedTeacherData = teacherData.map(item => ({
      'Nama Pengguna': item.users?.full_name || 'N/A',
      'Sekolah': item.users?.school || 'N/A',
      'Kelas': '-', // Guru tidak punya kelas
      'Waktu Masuk': new Date(item.check_in_time).toLocaleString('id-ID'),
      'Waktu Pulang': item.check_out_time ? new Date(item.check_out_time).toLocaleString('id-ID') : '-',
      'Status': item.status,
    }));

    // 4. Gabungkan semua data dengan header pemisah
    const finalData = [];
    if (formattedStudentData.length > 0) {
      finalData.push({ 'Nama Pengguna': 'REKAP SISWA' }); // Header untuk siswa
      finalData.push(...formattedStudentData);
    }
    if (teacherData.length > 0) {
      finalData.push({}); // Baris kosong sebagai pemisah
      finalData.push({ 'Nama Pengguna': 'REKAP GURU' }); // Header untuk guru
      finalData.push(...formattedTeacherData);
    }

    // Buat 'worksheet' dari data yang sudah digabungkan
    const worksheet = XLSX.utils.json_to_sheet(finalData, {
        // Lewati header default karena kita sudah punya header kustom
        skipHeader: true 
    });

    // --- PERBAIKAN 3: Sisipkan header manual di baris pertama ---
    const headers = ['Nama Pengguna', 'Sekolah', 'Kelas', 'Waktu Masuk', 'Waktu Pulang', 'Status'];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

    // Atur lebar kolom
    worksheet['!cols'] = [
        { wch: 25 }, // Nama
        { wch: 25 }, // Sekolah
        { wch: 15 }, // Kelas
        { wch: 20 }, // Waktu Masuk
        { wch: 20 }, // Waktu Pulang
        { wch: 10 }, // Status
    ];

    // Buat 'workbook' baru dan tambahkan worksheet ke dalamnya
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi');

    // Buat file Excel dan picu unduhan di browser
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  return (
    <Button
      onClick={exportToExcel}
      disabled={data.length === 0}
      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      Unduh ke Excel
    </Button>
  );
}
