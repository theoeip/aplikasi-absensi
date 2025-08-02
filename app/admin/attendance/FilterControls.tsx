// app/admin/attendance/FilterControls.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Komponen sekarang menerima userRole
export default function FilterControls({ userRole }: { userRole: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState(searchParams.get('start') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end') || '');
  const [school, setSchool] = useState(searchParams.get('school') || 'semua');

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    // Hanya tambahkan parameter sekolah jika yang login adalah SuperAdmin
    if (userRole === 'SuperAdmin' && school && school !== 'semua') {
      params.set('school', school);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg flex flex-wrap items-end gap-4">
      <div>
        <Label className="block text-sm font-medium mb-1">Tanggal Mulai</Label>
        <Input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div>
        <Label className="block text-sm font-medium mb-1">Tanggal Selesai</Label>
        <Input 
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      {/* Tampilkan dropdown sekolah HANYA untuk SuperAdmin */}
      {userRole === 'SuperAdmin' && (
        <div>
          <Label className="block text-sm font-medium mb-1">Sekolah</Label>
          <Select value={school} onValueChange={setSchool}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Pilih Sekolah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Sekolah</SelectItem>
              <SelectItem value="SMP BUDI BAKTI UTAMA">SMP BUDI BAKTI UTAMA</SelectItem>
              <SelectItem value="SMK BUDI BAKTI UTAMA">SMK BUDI BAKTI UTAMA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <Button onClick={handleFilter}>
        Filter
      </Button>
    </div>
  );
}