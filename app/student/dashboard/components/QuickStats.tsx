// File: app/student/dashboard/components/QuickStats.tsx
import React from 'react';

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
        <i className={`fas ${icon} text-${color}-600 text-xl`}></i>
      </div>
    </div>
  </div>
);

export default function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Kehadiran Bulan Ini" value="95%" icon="fa-check-circle" color="green" />
      <StatCard title="Tugas Pending" value="3" icon="fa-tasks" color="orange" />
      <StatCard title="Rata-rata Nilai" value="87.5" icon="fa-chart-line" color="blue" />
      <StatCard title="Pesan Baru" value="7" icon="fa-comments" color="purple" />
    </div>
  );
}