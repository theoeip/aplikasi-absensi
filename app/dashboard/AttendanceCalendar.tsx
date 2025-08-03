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

// Impor CSS wajib untuk react-big-calendar
import 'react-big-calendar/lib/css/react-big-calendar.css';
// Impor file CSS custom kita (akan kita buat di langkah berikutnya)
import './calendar-custom.css'; 

const locales = {
  'id': id,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Minggu dimulai hari Senin
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("Tidak ada sesi, data absensi tidak diambil.");
        return;
      }

      const { data, error } = await supabase
        .from('absensi')
        .select('check_in_time, status')
        .eq('user_id', session.user.id);

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
    if (event.status === 'Hadir') backgroundColor = '#22c55e'; // Green
    if (event.status === 'Izin') backgroundColor = '#3b82f6';  // Blue
    if (event.status === 'Sakit') backgroundColor = '#f59e0b'; // Amber

    const style = {
      backgroundColor,
      borderRadius: '4px',
      color: 'white',
      border: 'none',
      fontSize: '0.75rem',
      padding: '2px 4px',
    };
    return { style };
  };

  // HANYA RENDER KALENDER, TANPA DIV PEMBUNGKUS DAN JUDUL
  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        culture='id'
        views={['month']} // Hanya menampilkan view bulan agar lebih simpel
        messages={{
          next: "›",
          previous: "‹",
          today: "Hari Ini",
          month: "Bulan",
        }}
      />
    </div>
  );
}