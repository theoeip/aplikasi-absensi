// app/admin/students/actions.ts
'use server';

import { supabaseAdmin } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function assignClassToStudent(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const classId = formData.get('classId') as string;

  if (!studentId || !classId) {
    return { success: false, message: 'ID Siswa atau ID Kelas tidak ditemukan.' };
  }

  // Pastikan ada kolom 'class_id' di tabel 'users' Anda
  const { error } = await supabaseAdmin
    .from('users') 
    .update({ class_id: classId }) 
    .eq('id', studentId);

  if (error) {
    console.error("Error assigning class:", error);
    return { success: false, message: `Gagal menyimpan: ${error.message}` };
  }

  revalidatePath('/admin/students');
  return { success: true, message: 'Rombel siswa berhasil diperbarui!' };
}