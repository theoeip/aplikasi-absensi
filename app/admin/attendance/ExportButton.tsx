// app/admin/attendance/ExportButton.tsx
    'use client';

    import * as XLSX from 'xlsx';

    // Definisikan tipe untuk data absensi yang akan diekspor
    type AttendanceData = {
      users: {
        full_name: string | null;
        school: string | null;
      } | null;
      check_in_time: string;
      status: string;
    };

    // Komponen ini menerima data yang akan diekspor sebagai 'prop'
    export default function ExportButton({ data, filename }: { data: AttendanceData[], filename: string }) {
      
      const exportToExcel = () => {
        // 1. Ubah data kita menjadi format yang lebih datar dan ramah Excel
        const flattenedData = data.map(item => ({
          'Nama Lengkap': item.users?.full_name || 'N/A',
          'Sekolah': item.users?.school || 'N/A',
          'Waktu Absen': new Date(item.check_in_time).toLocaleString('id-ID'),
          'Status': item.status,
        }));

        // 2. Buat 'worksheet' dari data yang sudah di-flatten
        const worksheet = XLSX.utils.json_to_sheet(flattenedData);

        // 3. Buat 'workbook' baru dan tambahkan worksheet ke dalamnya
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi'); // Nama sheet

        // 4. Atur lebar kolom agar tidak terlalu sempit (opsional)
        worksheet['!cols'] = [
            { wch: 25 }, // Lebar kolom 'Nama Lengkap'
            { wch: 25 }, // Lebar kolom 'Sekolah'
            { wch: 25 }, // Lebar kolom 'Waktu Absen'
            { wch: 10 }, // Lebar kolom 'Status'
        ];

        // 5. Buat file Excel dan picu unduhan di browser
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