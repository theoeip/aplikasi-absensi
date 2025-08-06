// app/admin/schedules/actions.ts
'use server';

import { supabaseAdmin } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function saveSchedule(formData: FormData) {
  const id = formData.get('id') as string | null;
  const scheduleData = {
    day_of_week: Number(formData.get('day_of_week')),
    start_time: formData.get('start_time') as string,
    end_time: formData.get('end_time') as string,
    class_id: formData.get('class_id') as string,
    subject_id: formData.get('subject_id') as string,
    teacher_id: formData.get('teacher_id') as string,
  };

  // Validasi sederhana
  for (const [key, value] of Object.entries(scheduleData)) {
    if (!value) {
      return { success: false, message: `Field ${key} tidak boleh kosong.` };
    }
  }

  let error;
  if (id) {
    // Update
    ({ error } = await supabaseAdmin.from('schedules').update(scheduleData).eq('id', id));
  } else {
    // Insert
    ({ error } = await supabaseAdmin.from('schedules').insert(scheduleData));
  }
  
  if (error) {
    console.error("Error saving schedule:", error);
    return { success: false, message: `Gagal menyimpan jadwal: ${error.message}` };
  }

  revalidatePath('/admin/schedules');
  return { success: true, message: 'Jadwal berhasil disimpan!' };
}

export async function deleteSchedule(scheduleId: string) {
    const { error } = await supabaseAdmin.from('schedules').delete().eq('id', scheduleId);
    if (error) {
        return { success: false, message: `Gagal menghapus jadwal: ${error.message}` };
    }
    revalidatePath('/admin/schedules');
    return { success: true, message: 'Jadwal berhasil dihapus.' };
}