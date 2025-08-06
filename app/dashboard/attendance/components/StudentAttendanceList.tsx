// Lokasi File: app/dashboard/attendance/components/StudentAttendanceList.tsx
'use client';

import React, { useState, useMemo } from 'react';

// Tipe data
interface Student {
  id: string;
  name: string;
  status: 'hadir' | 'tidak_hadir' | 'belum';
  alasan?: string;
}

interface StudentAttendanceListProps {
  students: Student[];
  sessionActive: boolean;
  onStatusChange: (studentId: string, newStatus: 'hadir' | 'tidak_hadir', reason?: string) => void;
  onSave: () => void;
}

export default function StudentAttendanceList({ students, sessionActive, onStatusChange, onSave }: StudentAttendanceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- PERBAIKAN 1: Tambahkan state untuk mengelola modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reason, setReason] = useState('Alpha'); // Alasan default

  const filteredStudents = useMemo(() => 
    students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [students, searchTerm]
  );

  // Fungsi untuk membuka modal saat tombol "Tidak Hadir" diklik
  const handleMarkAbsentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // Fungsi untuk menyimpan alasan dari modal
  const handleSaveReason = () => {
    if (selectedStudent) {
      onStatusChange(selectedStudent.id, 'tidak_hadir', reason);
      setIsModalOpen(false);
      setSelectedStudent(null);
      setReason('Alpha'); // Reset alasan untuk penggunaan berikutnya
    }
  };

  const markAllAsPresent = () => {
    students.forEach(student => onStatusChange(student.id, 'hadir'));
  };

  const resetAll = () => {
    students.forEach(student => onStatusChange(student.id, 'belum'));
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 text-white p-2 rounded-lg"><i className="fas fa-user-graduate"></i></div>
            <h2 className="text-xl font-bold text-gray-800">Absen Siswa</h2>
          </div>
          <div className="flex space-x-2">
            <button onClick={markAllAsPresent} disabled={!sessionActive} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200 disabled:bg-gray-300">
              <i className="fas fa-check-double mr-1"></i> Semua Hadir
            </button>
            <button onClick={resetAll} disabled={!sessionActive} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200 disabled:bg-gray-300">
              <i className="fas fa-undo mr-1"></i> Reset
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Cari nama siswa..." 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!sessionActive}
          />
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {!sessionActive ? (
              <p className="text-center text-gray-500 py-10">Mulai sesi untuk menampilkan daftar siswa.</p>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">{student.name}</span>
                      {/* Tampilkan alasan jika ada */}
                      {student.status === 'tidak_hadir' && student.alasan && (
                        <p className="text-xs text-red-600 mt-1"><i className="fas fa-info-circle mr-1"></i>{student.alasan}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button 
                      onClick={() => onStatusChange(student.id, 'hadir')} 
                      className={`px-3 py-1 rounded-full text-sm font-medium transition duration-200 ${student.status === 'hadir' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
                    >
                      <i className="fas fa-check mr-1"></i>Hadir
                    </button>
                    {/* --- PERBAIKAN 2: Tombol ini sekarang membuka modal --- */}
                    <button 
                      onClick={() => handleMarkAbsentClick(student)} 
                      className={`px-3 py-1 rounded-full text-sm font-medium transition duration-200 ${student.status === 'tidak_hadir' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100'}`}
                    >
                      <i className="fas fa-times mr-1"></i>Tidak Hadir
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">Tidak ada siswa yang cocok dengan pencarian.</p>
            )}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button onClick={onSave} disabled={!sessionActive} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 disabled:bg-gray-300 disabled:transform-none">
            <i className="fas fa-save mr-2"></i>
            Simpan Data Absensi
          </button>
        </div>
      </div>

      {/* --- PERBAIKAN 3: Tambahkan JSX untuk Modal --- */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Alasan Tidak Hadir</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Siswa: <span className="font-semibold">{selectedStudent.name}</span></p>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih alasan:</label>
              <select 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Alpha">Alpha</option>
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                Batal
              </button>
              <button onClick={handleSaveReason} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
