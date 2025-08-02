// app/dashboard/AttendanceCalendar.tsx
'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import id from 'date-fns/locale/id'; // Import locale Bahasa Indonesia
import { createClient } from '@/utils/supabase/client';

// Import CSS wajib untuk react-big-calendar
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Konfigurasi localizer untuk menggunakan date-fns dengan locale Indonesia
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

// Definisikan tipe untuk data absensi kita
interface AttendanceEvent extends Event {
  status: string; // 'Hadir', 'Izin', 'Sakit', 'Alpha'
}

export default function AttendanceCalendar() {
  const supabase = createClient();
  const [events, setEvents] = useState<AttendanceEvent[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ambil data absensi untuk user yang sedang login
      const { data, error } = await supabase
        .from('absensi')
        .select('check_in_time, status')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching attendance:', error);
        return;
      }

      // Ubah data dari Supabase menjadi format yang dimengerti kalender
      const formattedEvents = data.map(att => {
        const checkInDate = new Date(att.check_in_time);
        return {
          title: att.status, // Judul event adalah statusnya
          start: checkInDate,
          end: checkInDate, // Untuk event satu hari, start dan end sama
          allDay: true,
          status: att.status,
        };
      });

      setEvents(formattedEvents);
    };

    fetchAttendance();
  }, [supabase]);

  // Fungsi untuk memberi warna pada event berdasarkan status
  const eventStyleGetter = (event: AttendanceEvent) => {
    let backgroundColor = '#808080'; // Default (Alpha)
    if (event.status === 'Hadir') backgroundColor = '#22c55e'; // Hijau
    if (event.status === 'Izin') backgroundColor = '#3b82f6';  // Biru
    if (event.status === 'Sakit') backgroundColor = '#f59e0b'; // Kuning

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
          culture='id' // Gunakan kultur Bahasa Indonesia
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