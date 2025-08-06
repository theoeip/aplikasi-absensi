// Lokasi File: app/dashboard/attendance/components/AttendanceHistory.tsx
'use client';

import React from 'react';

export default function AttendanceHistory() {
  // Data riwayat ini nantinya akan diambil dari database
  const historyData = [
    // { time: '07:45', subject: 'Matematika', className: 'VII-A', present: 24, absent: 1 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-500 text-white p-2 rounded-lg">
          <i className="fas fa-history"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Riwayat Absensi Hari Ini</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Waktu</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mata Pelajaran</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kelas</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hadir</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tidak Hadir</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {historyData.length === 0 ? (
              <tr className="border-b border-gray-200">
                <td className="px-4 py-8 text-center text-sm text-gray-600" colSpan={6}>
                  Belum ada data absensi yang disimpan hari ini.
                </td>
              </tr>
            ) : (
              historyData.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{item.time}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{item.subject}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{item.className}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{item.present}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">{item.absent}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Tersimpan</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
