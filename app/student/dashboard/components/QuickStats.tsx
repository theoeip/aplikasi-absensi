// File: app/student/dashboard/components/QuickStats.tsx
'use client';

import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'; // Impor tipe untuk ikon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTasks, faChartLine, faComments } from '@fortawesome/free-solid-svg-icons';

// --- PERBAIKAN 1: Definisikan interface untuk props ---
interface StatCardProps {
  title: string;
  value: string;
  icon: IconDefinition; // Gunakan tipe yang benar, bukan 'any'
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
        {/* Gunakan komponen FontAwesomeIcon */}
        <FontAwesomeIcon icon={icon} className={`text-${color}-600 text-xl`} />
      </div>
    </div>
  </div>
);

export default function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Kehadiran Bulan Ini" value="95%" icon={faCheckCircle} color="green" />
      <StatCard title="Tugas Pending" value="3" icon={faTasks} color="orange" />
      <StatCard title="Rata-rata Nilai" value="87.5" icon={faChartLine} color="blue" />
      <StatCard title="Pesan Baru" value="7" icon={faComments} color="purple" />
    </div>
  );
}
