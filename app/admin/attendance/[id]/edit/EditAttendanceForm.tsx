// Lokasi File: app/admin/attendance/[id]/edit/EditAttendanceForm.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { updateAttendanceStatus } from "../../actions";
import { useState } from "react";

// PERBAIKAN: Membuat interface untuk mendefinisikan struktur data.
// Ini menggantikan tipe 'any' dan membuat kode lebih aman dan jelas.
interface AttendanceData {
  id: string;
  status: string;
}

// PERBAIKAN: Menggunakan interface 'AttendanceData' sebagai tipe untuk prop.
export default function EditAttendanceForm({ attendanceData }: { attendanceData: AttendanceData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    setIsSubmitting(true);
    const result = await updateAttendanceStatus(formData);
    if (result?.success === false) { // Cek jika ada error
      toast.error(result.message);
    }
    // Jika berhasil, redirect akan terjadi di server, tidak perlu toast success di sini
    setIsSubmitting(false);
  };

  return (
    <form action={handleUpdate} className="space-y-4 max-w-sm">
      <input type="hidden" name="attendanceId" value={attendanceData.id} />
      <div className="space-y-2">
        <Label>Ubah Status Kehadiran</Label>
        <Select name="status" defaultValue={attendanceData.status} required disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hadir">Hadir</SelectItem>
            <SelectItem value="Izin">Izin</SelectItem>
            <SelectItem value="Sakit">Sakit</SelectItem>
            <SelectItem value="Alpha">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </form>
  );
}