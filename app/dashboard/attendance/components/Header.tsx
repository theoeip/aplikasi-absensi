// Lokasi File: app/dashboard/attendance/components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link'; // Impor Link untuk navigasi

// --- PERBAIKAN 1: Terima props userProfile ---
interface HeaderProps {
  userProfile: {
    full_name: string | null;
    role: string | null;
  } | null;
}

export default function Header({ userProfile }: HeaderProps) {
  return (
    <header className="bg-white shadow-lg border-b-4 border-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {/* --- PERBAIKAN 2: Tambahkan Tombol Kembali --- */}
            <Link href="/dashboard" className="text-gray-500 hover:text-blue-600 transition-colors" title="Kembali ke Dashboard Utama">
              <div className="bg-gray-100 p-3 rounded-full">
                  <i className="fas fa-arrow-left text-xl"></i>
              </div>
            </Link>
            <div className="bg-blue-500 text-white p-3 rounded-full">
              <i className="fas fa-chalkboard-teacher text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Absensi</h1>
              <p className="text-gray-600">Sistem Absensi Guru & Siswa</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Selamat datang,</p>
              {/* --- PERBAIKAN 3: Tampilkan nama guru dari props --- */}
              <p className="font-semibold text-gray-800">{userProfile?.full_name || 'Guru'}</p>
            </div>
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <i className="fas fa-user"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
