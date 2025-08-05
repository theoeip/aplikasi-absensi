// app/admin/attendance/ExportButton.tsx
'use client';

import * as XLSX from 'xlsx';

// 1. Perbarui Tipe Data
type AttendanceData = {
  users: {
    full_name: string | null;
    school: string | null;
  } | null;
  check_in_time: string;
  check_out_time: string | null; // Ditambahkan
  status: string;
};

// Komponen ini menerima data yang akan diekspor sebagai 'prop'
export default function ExportButton({ data, filename }: { data: AttendanceData[], filename: string }) {
  
  const exportToExcel = () => {
    // 2. Perbarui logika pemetaan data
    const flattenedData = data.map(item => ({
      'Nama Lengkap': item.users?.full_name || 'N/A',
      'Sekolah': item.users?.school || 'N/A',
      'Waktu Masuk': new Date(item.check_in_time).toLocaleString('id-ID'),
      'Waktu Pulang': item.check_out_time 
                      ? new Date(item.check_out_time).toLocaleString('id-ID') 
                      : '-', // Ditambahkan
      'Status': item.status,
    }));

    // Buat 'worksheet' dari data yang sudah di-flatten
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);

    // Buat 'workbook' baru dan tambahkan worksheet ke dalamnya
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi'); // Nama sheet

    // 3. Perbarui lebar kolom (opsional tapi disarankan)
    worksheet['!cols'] = [
        { wch: 25 }, // Nama Lengkap
        { wch: 25 }, // Sekolah
        { wch: 20 }, // Waktu Masuk
        { wch: 20 }, // Waktu Pulang
        { wch: 10 }, // Status
    ];

    // Buat file Excel dan picu unduhan di browser
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  return (
    <button
      onClick={exportToExcel}
      disabled={data.length === 0} // Nonaktifkan tombol jika tidak ada data
      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      Unduh ke Excel
    </button>
  );
}