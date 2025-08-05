// LOKASI FILE: app/student/dashboard/components/Header.tsx
'use client';

import React from 'react';

// Terima props userProfile dan onLogout
interface HeaderProps {
  userProfile: {
    full_name: string | null;
  } | null;
  onLogout: () => void;
}

export default function Header({ userProfile, onLogout }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <i className="fas fa-graduation-cap text-purple-600 text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">EduPortal</h1>
              <p className="text-purple-100 text-sm">Dashboard Siswa</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <i className="fas fa-bell text-xl cursor-pointer hover:text-purple-200 transition-colors"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-purple-600"></span>
            </div>
            <div className="flex items-center space-x-2">
              <img 
                src={`https://ui-avatars.com/api/?name=${userProfile?.full_name || 'Siswa'}&background=f3f4f6&color=374151`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full" 
              />
              {/* Tampilkan nama dari props */}
              <span className="font-medium">{userProfile?.full_name || 'Memuat...'}</span>
            </div>
            <button onClick={onLogout} title="Logout" className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
