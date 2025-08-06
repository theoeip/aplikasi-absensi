// Lokasi File: app/dashboard/attendance/components/TeacherAttendanceForm.tsx
'use client';

import React from 'react';

export default function TeacherAttendanceForm() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-500 text-white p-2 rounded-lg">
          <i className="fas fa-user-tie"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Absen Guru</h2>
      </div>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Matematika</option>
            <option>Bahasa Indonesia</option>
            <option>IPA</option>
            <option>IPS</option>
            <option>Bahasa Inggris</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>VII-A</option>
            <option>VII-B</option>
            <option>VIII-A</option>
            <option>VIII-B</option>
            <option>IX-A</option>
            <option>IX-B</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Jam Pelajaran</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>07:00 - 07:40</option>
            <option>07:40 - 08:20</option>
            <option>08:20 - 09:00</option>
            <option>09:20 - 10:00</option>
            <option>10:00 - 10:40</option>
          </select>
        </div>
        
        <button type="button" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105">
          <i className="fas fa-check-circle mr-2"></i>
          Absen Mengajar
        </button>
      </form>
    </div>
  );
}
