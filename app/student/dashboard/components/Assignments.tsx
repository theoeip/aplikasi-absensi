// File: app/student/dashboard/components/Assignments.tsx
import React from 'react';

export default function Assignments() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Ujian & Tugas</h3>
      <div className="space-y-3">
        <div className="border-l-4 border-red-500 pl-4 py-2">
          <p className="font-medium text-gray-800">Ujian Matematika</p>
          <p className="text-sm text-gray-600">Batas waktu: Besok</p>
        </div>
        <div className="border-l-4 border-orange-500 pl-4 py-2">
          <p className="font-medium text-gray-800">Tugas Fisika</p>
          <p className="text-sm text-gray-600">Batas waktu: 3 hari lagi</p>
        </div>
      </div>
    </div>
  );
}