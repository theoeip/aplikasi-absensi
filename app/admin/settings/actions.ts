// Lokasi File: app/admin/settings/actions.ts
'use server';

import { supabaseAdmin } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from 'zod';

// Skema validasi sederhana menggunakan Zod
const NameSchema = z.string().min(3, { message: "Nama harus memiliki minimal 3 karakter." });

/**
 * Memperbarui koordinat GPS sekolah di tabel settings.
 */
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
    return { success: false, message: `Gagal menyimpan koordinat: ${error.message}` };
  }

  revalidatePath('/admin/settings');
  return { success: true, message: 'Koordinat berhasil disimpan!' };
}

/**
 * Menambahkan kelas (rombel) baru ke database.
 */
export async function addClass(formData: FormData) {
    const className = formData.get('class_name') as string;
    const school = formData.get('school') as string;

    const validation = NameSchema.safeParse(className);
    if (!validation.success) {
        return { success: false, message: validation.error.errors[0].message };
    }

    const { error } = await supabaseAdmin
        .from('classes')
        .insert({ name: className, school: school });

    if (error) {
        console.error("Error adding class:", error);
        return { success: false, message: `Gagal menambah kelas: ${error.message}` };
    }

    revalidatePath('/admin/settings');
    return { success: true, message: 'Kelas berhasil ditambahkan!' };
}

/**
 * Menambahkan mata pelajaran baru ke database.
 */
export async function addSubject(formData: FormData) {
    const subjectName = formData.get('subject_name') as string;

    const validation = NameSchema.safeParse(subjectName);
    if (!validation.success) {
        return { success: false, message: validation.error.errors[0].message };
    }

    const { error } = await supabaseAdmin
        .from('subjects')
        .insert({ name: subjectName });

    if (error) {
        console.error("Error adding subject:", error);
        return { success: false, message: `Gagal menambah mapel: ${error.message}` };
    }

    revalidatePath('/admin/settings');
    return { success: true, message: 'Mata pelajaran berhasil ditambahkan!' };
}

/**
 * Menghapus item dari tabel tertentu berdasarkan ID.
 * Bisa untuk kelas, mata pelajaran, atau jadwal.
 */
export async function deleteItem(id: string, tableName: 'classes' | 'subjects' | 'schedules') {
    if (!id || !tableName) {
        return { success: false, message: 'ID atau nama tabel tidak valid.' };
    }

    const { error } = await supabaseAdmin
        .from(tableName)
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        return { success: false, message: `Gagal menghapus: ${error.message}` };
    }

    revalidatePath('/admin/settings');
    return { success: true, message: 'Data berhasil dihapus.' };
}

// --- PERUBAHAN UTAMA ADA DI SINI ---

/**
 * Memperbarui data kelas (rombel) termasuk nama dan sekolahnya.
 * Menggantikan fungsi updateItemName yang lama untuk rombel.
 */
export async function updateClass(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const school = formData.get('school') as string;

    // Validasi sederhana
    if (!id || !name || !school) {
        return { success: false, message: 'Data tidak lengkap untuk pembaruan.' };
    }
    const validation = NameSchema.safeParse(name);
    if (!validation.success) {
        return { success: false, message: validation.error.errors[0].message };
    }

    const { error } = await supabaseAdmin
        .from('classes')
        .update({ name: name, school: school }) // Update nama dan sekolah
        .eq('id', id);
    
    if (error) {
        console.error(`Error updating class:`, error);
        return { success: false, message: `Gagal memperbarui: ${error.message}` };
    }

    revalidatePath('/admin/settings');
    return { success: true, message: 'Rombel berhasil diperbarui.' };
}

/**
 * Memperbarui nama mata pelajaran berdasarkan ID.
 * Menggantikan fungsi updateItemName yang lama untuk mapel.
 */
export async function updateSubject(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;

    // Validasi sederhana
    if (!id || !name) {
        return { success: false, message: 'Data tidak lengkap untuk pembaruan.' };
    }
    const validation = NameSchema.safeParse(name);
    if (!validation.success) {
        return { success: false, message: validation.error.errors[0].message };
    }

    const { error } = await supabaseAdmin
        .from('subjects')
        .update({ name: name })
        .eq('id', id);
    
    if (error) {
        console.error(`Error updating subject:`, error);
        return { success: false, message: `Gagal memperbarui: ${error.message}` };
    }

    revalidatePath('/admin/settings');
    return { success: true, message: 'Mata pelajaran berhasil diperbarui.' };
}