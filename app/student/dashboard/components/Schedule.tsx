// File: app/student/dashboard/components/Schedule.tsx
import React from 'react';

export default function Schedule() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Jadwal Hari Ini</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">Matematika</p>
            <p className="text-sm text-gray-600">Pak Budi • Ruang 12A</p>
          </div>
          <span className="text-sm font-medium text-blue-600">07:30 - 09:00</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">Fisika</p>
            <p className="text-sm text-gray-600">Bu Sari • Lab Fisika</p>
          </div>
          <span className="text-sm font-medium text-green-600">09:15 - 10:45</span>
        </div>
      </div>
    </div>
  );
}