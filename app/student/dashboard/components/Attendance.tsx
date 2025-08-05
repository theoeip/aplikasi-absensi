// LOKASI FILE: app/student/dashboard/components/Attendance.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface AttendanceProps {
  isWithinRadius: boolean;
  locationMessage: { text: string; color: string; };
  attendanceStatus: 'NOT_CLOCKED_IN' | 'CLOCKED_IN' | 'COMPLETED';
  isProcessing: boolean;
  currentDate: Date;
  handleClockIn: () => void;
  handleClockOut: () => void;
}

export default function Attendance({ 
  isWithinRadius, 
  locationMessage, 
  attendanceStatus, 
  isProcessing,
  currentDate,
  handleClockIn,
  handleClockOut,
}: AttendanceProps) {
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Absensi Hari Ini</h3>
      
      {/* Konten yang dipusatkan */}
      <div className="flex flex-col items-center gap-4">
        
        {/* Jam dan Tanggal */}
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-800">
            {currentDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-gray-600 text-sm">
            {currentDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        {/* Pesan Lokasi */}
        <div className={`text-sm font-medium flex items-center justify-center gap-2 p-2 rounded-md w-full max-w-xs text-center ${locationMessage.color}`}>
            <i className="fas fa-map-marker-alt"></i>
            <span>{locationMessage.text}</span>
        </div>

        {/* Tombol Absen */}
        <div className="flex gap-4 w-full">
          <Button 
            className="flex-1 bg-green-500 hover:bg-green-600" 
            disabled={!isWithinRadius || isProcessing || attendanceStatus !== 'NOT_CLOCKED_IN'} 
            onClick={handleClockIn}
          >
            {attendanceStatus !== 'NOT_CLOCKED_IN' ? 'Sudah Absen Masuk' : 'Absen Masuk'}
          </Button>
          <Button 
            className="flex-1 bg-red-500 hover:bg-red-600" 
            disabled={!isWithinRadius || isProcessing || attendanceStatus !== 'CLOCKED_IN'} 
            onClick={handleClockOut}
          >
            {attendanceStatus === 'COMPLETED' ? 'Sudah Absen Pulang' : 'Absen Pulang'}
          </Button>
        </div>
        
        {/* Status Absen */}
        <div className="mt-2 p-3 bg-gray-100 rounded-lg text-center text-gray-600 w-full">
          Status: {
            attendanceStatus === 'NOT_CLOCKED_IN' ? 'Belum absen hari ini' :
            attendanceStatus === 'CLOCKED_IN' ? 'Sudah absen masuk' :
            'Absensi hari ini selesai'
          }
        </div>
      </div>
    </div>
  );
}
