// Lokasi File: app/dashboard/attendance/components/InfoCards.tsx
'use client';

import React from 'react';

// Komponen kecil untuk satu kartu
const Card = ({ title, value, icon, color, id }: { title: string, value: string, icon: string, color: string, id: string }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold" id={id}>{value}</p>
      </div>
      <i className={`fas ${icon} text-2xl`}></i>
    </div>
  </div>
);

export default function InfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card title="Siswa Hadir" value="0" icon="fa-user-check" color="border-green-500 text-green-600" id="siswaHadir" />
      <Card title="Siswa Tidak Hadir" value="0" icon="fa-user-times" color="border-red-500 text-red-600" id="siswaTidakHadir" />
      <Card title="Total Siswa" value="25" icon="fa-users" color="border-yellow-500 text-yellow-600" id="totalSiswa" />
      <Card title="Status Mengajar" value="Belum Absen" icon="fa-clipboard-check" color="border-blue-500 text-blue-600" id="statusMengajar" />
    </div>
  );
}
