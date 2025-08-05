// LOKASI FILE: app/student/dashboard/components/Welcome.tsx
'use client';

import React from 'react';

// Terima props userProfile dan currentDate
interface WelcomeProps {
  userProfile: {
    full_name: string | null;
    class_name?: string | null; // Kelas siswa
  } | null;
  currentDate: Date;
}

export default function Welcome({ userProfile, currentDate }: WelcomeProps) {
  // Format tanggal real-time
  const formattedDate = currentDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="mb-8">
      {/* Tampilkan nama dari props */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Selamat Datang, {userProfile?.full_name || 'Siswa'}! 👋
      </h2>
      {/* Tampilkan kelas dan tanggal real-time */}
      <p className="text-gray-600">
        {userProfile?.class_name || 'Kelas tidak ditemukan'} • Hari ini: <span className="font-medium text-purple-600">{formattedDate}</span>
      </p>
    </div>
  );
}
