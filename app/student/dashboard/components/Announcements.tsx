// LOKASI FILE: app/student/dashboard/components/Announcements.tsx
'use client';

import React from 'react';

// Definisikan tipe untuk setiap pengumuman
interface AnnouncementItem {
  id: number;
  title: string;
  description: string;
  color: string; // Warna tema (blue, green, etc.)
}

// Data dummy untuk pengumuman
const announcements: AnnouncementItem[] = [
  {
    id: 1,
    title: "Libur Semester",
    description: "Libur semester dimulai tanggal 20 Januari 2024",
    color: "blue"
  },
  {
    id: 2,
    title: "Pendaftaran Ekstrakurikuler",
    description: "Batas pendaftaran: 18 Januari 2024",
    color: "green"
  },
  {
    id: 3,
    title: "Kerja Bakti Sekolah",
    description: "Wajib diikuti seluruh siswa pada hari Sabtu ini.",
    color: "orange"
  }
];

export default function Announcements() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Pengumuman</h3>
      <div className="space-y-3">
        {announcements.map((item) => (
          <div key={item.id} className={`p-3 bg-${item.color}-50 rounded-lg border-l-4 border-${item.color}-500`}>
            <p className={`font-medium text-${item.color}-800 text-sm`}>{item.title}</p>
            <p className={`text-xs text-${item.color}-700 mt-1`}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}