// app/admin/students/page.tsx
import { supabaseAdmin } from '@/utils/supabase/admin';
import StudentManagementClientPage from './StudentManagementClientPage';

export default async function StudentManagementPage() {
  // Panggil fungsi database 'get_students_with_class' yang sudah kita buat
  const studentsPromise = supabaseAdmin.rpc('get_students_with_class');

  // Ambil daftar kelas (ini tetap sama dan tidak bermasalah)
  const classesPromise = supabaseAdmin
    .from('classes')
    .select('id, name')
    .order('name', { ascending: true });

  const [
    { data: students, error: studentsError },
    { data: classes, error: classesError }
  ] = await Promise.all([studentsPromise, classesPromise]);

  if (studentsError || classesError) {
    const error = studentsError || classesError;
    
    // Ini akan mencetak semua detail error ke terminal Anda
    console.log("=========================================");
    console.log("         LOG ERROR SUPABASE DETAIL         ");
    console.log("=========================================");
    console.log("Pesan:", error.message);
    console.log("Kode:", error.code);
    console.log("Detail:", error.details);
    console.log("Hint:", error.hint);
    console.log("Objek Error Lengkap:", JSON.stringify(error, null, 2));
    console.log("=========================================");

    return <p className='p-4'>Gagal memuat data. Cek log server untuk detail.</p>;
  }

  // Sekarang data 'students' sudah dalam format yang benar, tidak perlu diubah lagi
  return <StudentManagementClientPage initialStudents={students || []} availableClasses={classes || []} />;
}