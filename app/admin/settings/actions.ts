// app/admin/settings/actions.ts
'use server';

import { supabaseAdmin } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  const newCoordinates = {
    smp: {
      lat: parseFloat(formData.get('smp_lat') as string),
      lng: parseFloat(formData.get('smp_lng') as string),
    },
    smk: {
      lat: parseFloat(formData.get('smk_lat') as string),
      lng: parseFloat(formData.get('smk_lng') as string),
    },
  };

  const { error } = await supabaseAdmin
    .from('settings')
    .update({ setting_value: newCoordinates })
    .eq('setting_key', 'school_coordinates');

  if (error) {
    console.error("Error updating settings:", error);
    return { success: false, message: `Gagal menyimpan: ${error.message}` };
  }

  revalidatePath('/admin/settings');
  return { success: true, message: 'Pengaturan berhasil disimpan!' };
}