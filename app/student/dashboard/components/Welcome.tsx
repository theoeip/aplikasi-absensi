// LOKASI FILE: app/student/dashboard/components/Welcome.tsx
'use client';

import React from 'react';

// --- PERBAIKAN 1: Perbarui interface agar sesuai dengan data dari parent ---
interface WelcomeProps {
  userProfile: {
    full_name: string | null;
    classes: { // Diubah dari class_name
      name: string | null;
    } | null;
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
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Selamat Datang, {userProfile?.full_name || 'Siswa'}! 👋
      </h2>
      <p className="text-gray-600">
        {/* --- PERBAIKAN 2: Ubah cara menampilkan nama kelas --- */}
        {userProfile?.classes?.name || 'Kelas Belum Diatur'} • Hari ini: <span className="font-medium text-purple-600">{formattedDate}</span>
      </p>
    </div>
  );
}