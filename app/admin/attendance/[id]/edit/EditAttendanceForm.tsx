// Lokasi File: app/admin/attendance/[id]/edit/EditAttendanceForm.tsx

'use client'; // <-- PENTING! Tetap sebagai Komponen Klien

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; // <-- Gunakan Supabase sisi klien

// Menggunakan komponen UI dan toast dari kode Anda
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

// Menggunakan interface dari kode Anda
interface AttendanceData {
  id: string;
  status: string;
}

export default function EditAttendanceForm({ attendanceData }: { attendanceData: AttendanceData }) {
  const supabase = createClient();
  const router = useRouter();

  // State untuk mengendalikan nilai Select dan status loading
  const [status, setStatus] = useState(attendanceData.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi yang dijalankan saat form dikirim
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Mencegah reload halaman standar
    setIsSubmitting(true);

    // Memanggil API Supabase langsung dari klien
    const { error } = await supabase
      .from('absensi') // Pastikan nama tabel ini benar
      .update({ status: status })
      .eq('id', attendanceData.id);

    if (error) {
      // Jika ada galat, tampilkan pesan galat
      toast.error(`Gagal memperbarui: ${error.message}`);
    } else {
      // Jika berhasil, tampilkan pesan sukses dan segarkan data di halaman
      toast.success('Status absensi berhasil diperbarui!');
      router.refresh();
    }

    setIsSubmitting(false);
  };

  return (
    // Menggunakan onSubmit, bukan 'action'
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label>Ubah Status Kehadiran</Label>
        {/* Select sekarang dikendalikan oleh state 'status' */}
        <Select 
          value={status} 
          onValueChange={setStatus} // Perbarui state saat nilai berubah
          required 
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hadir">Hadir</SelectItem>
            <SelectItem value="Izin">Izin</SelectItem>
            <SelectItem value="Sakit">Sakit</SelectItem>
            <SelectItem value="Alpa">Alpa</SelectItem> 
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </form>
  );
}