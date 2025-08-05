// LOKASI FILE: app/student/dashboard/components/QuickActions.tsx
'use client';

import React from 'react';
import Link from 'next/link';

// Definisikan tipe untuk setiap tombol aksi
interface ActionButton {
  id: number;
  label: string;
  icon: string;
  color: string;
  href: string; // Link tujuan
}

// Data untuk tombol-tombol
const actions: ActionButton[] = [
  { id: 1, label: "Nilai", icon: "fa-chart-bar", color: "blue", href: "/student/grades" },
  { id: 2, label: "Jadwal", icon: "fa-calendar-alt", color: "green", href: "/student/schedule" },
  { id: 3, label: "Perpus", icon: "fa-book", color: "purple", href: "/student/library" },
  { id: 4, label: "Profil", icon: "fa-user-cog", color: "orange", href: "/student/profile" },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link href={action.href} key={action.id}>
            <div className={`p-4 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-lg text-center transition-colors cursor-pointer`}>
              <i className={`fas ${action.icon} text-${action.color}-600 text-2xl mb-2`}></i>
              <p className={`text-sm font-medium text-${action.color}-800`}>{action.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}