// app/admin/schedules/page.tsx
import { supabaseAdmin } from '@/utils/supabase/admin';
import ScheduleManagementClientPage from './ScheduleManagementClientPage';

export default async function ScheduleManagementPage() {
  const schedulesPromise = supabaseAdmin.from('schedules').select('*, classes(id, name), subjects(id, name), users(id, full_name)').order('day_of_week').order('start_time');
  const classesPromise = supabaseAdmin.from('classes').select('id, name').order('name');
  const subjectsPromise = supabaseAdmin.from('subjects').select('id, name').order('name');
  const teachersPromise = supabaseAdmin.from('users').select('id, full_name').eq('role', 'teacher').order('full_name');
  
  const [
    { data: schedules, error: schedulesError },
    { data: classes, error: classesError },
    { data: subjects, error: subjectsError },
    { data: teachers, error: teachersError },
  ] = await Promise.all([schedulesPromise, classesPromise, subjectsPromise, teachersPromise]);

  if (schedulesError || classesError || subjectsError || teachersError) {
    return <p className='p-4'>Gagal memuat data. Cek log server untuk detail.</p>;
  }
  
  return (
    <ScheduleManagementClientPage
      initialSchedules={schedules || []}
      availableClasses={classes || []}
      availableSubjects={subjects || []}
      availableTeachers={teachers || []}
    />
  );
}