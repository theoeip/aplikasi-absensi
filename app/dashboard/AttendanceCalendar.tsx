// app/dashboard/AttendanceCalendar.tsx

'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import id from 'date-fns/locale/id';
import { createClient } from '@/utils/supabase/client';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'id': id,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface AttendanceEvent extends Event {
  status: string;
}

export default function AttendanceCalendar() {
  const supabase = createClient();
  const [events, setEvents] = useState<AttendanceEvent[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      // PERBAIKAN: Gunakan getSession() untuk mendapatkan sesi yang aktif
      const { data: { session } } = await supabase.auth.getSession();
      
      // Jika tidak ada sesi (pengguna tidak login), hentikan eksekusi
      if (!session) {
        console.log("Tidak ada sesi, data absensi tidak diambil.");
        return;
      }

      // Ambil data absensi untuk user yang sedang login
      const { data, error } = await supabase
        .from('absensi')
        .select('check_in_time, status')
        .eq('user_id', session.user.id); // Gunakan ID dari sesi

      if (error) {
        console.error('Error fetching attendance:', error);
        return;
      }

      const formattedEvents = data.map(att => {
        const checkInDate = new Date(att.check_in_time);
        return {
          title: att.status,
          start: checkInDate,
          end: checkInDate,
          allDay: true,
          status: att.status,
        };
      });

      setEvents(formattedEvents);
    };

    fetchAttendance();
  }, [supabase]);

  const eventStyleGetter = (event: AttendanceEvent) => {
    let backgroundColor = '#808080';
    if (event.status === 'Hadir') backgroundColor = '#22c55e';
    if (event.status === 'Izin') backgroundColor = '#3b82f6';
    if (event.status === 'Sakit') backgroundColor = '#f59e0b';

    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style: style,
    };
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-center mb-4">Kalender Kehadiran</h2>
      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          eventPropGetter={eventStyleGetter}
          culture='id'
          messages={{
            next: "Berikutnya",
            previous: "Sebelumnya",
            today: "Hari Ini",
            month: "Bulan",
            week: "Minggu",
            day: "Hari",
            agenda: "Agenda",
            date: "Tanggal",
            time: "Waktu",
            event: "Acara",
          }}
        />
      </div>
    </div>
  );
}