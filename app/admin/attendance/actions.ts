// app/admin/attendance/actions.ts
'use server';

import { supabaseAdmin } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Action untuk mengupdate status absensi yang sudah ada
export async function updateAttendanceStatus(formData: FormData) {
  const attendanceId = formData.get('attendanceId');
  const newStatus = formData.get('status') as string;

  if (!attendanceId || !newStatus) {
    return { success: false, message: 'Data tidak lengkap.' };
  }

  const { error } = await supabaseAdmin
    .from('absensi')
    .update({ status: newStatus })
    .eq('id', attendanceId);

  if (error) {
    return { success: false, message: `Gagal memperbarui: ${error.message}` };
  }

  revalidatePath('/admin/attendance');
  redirect('/admin/attendance');
}