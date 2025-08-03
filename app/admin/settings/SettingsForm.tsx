// Lokasi File: app/admin/settings/SettingsForm.tsx (SUDAH DIPERBAIKI)
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface SchoolCoordinates {
  lat: number | string;
  lng: number | string;
}

interface SettingsData {
  smp?: SchoolCoordinates;
  smk?: SchoolCoordinates;
}

export default function SettingsForm({ initialData }: { initialData: SettingsData }) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [smpLat, setSmpLat] = useState(initialData.smp?.lat || '');
  const [smpLng, setSmpLng] = useState(initialData.smp?.lng || '');
  const [smkLat, setSmkLat] = useState(initialData.smk?.lat || '');
  const [smkLng, setSmkLng] = useState(initialData.smk?.lng || '');

  // ====================================================================
  // === PERBAIKAN UTAMA ADA DI FUNGSI INI ===
  // ====================================================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Buat SATU objek JSON yang sesuai dengan struktur kolom 'setting_value'
    const updatedValue = {
      smp: { 
        lat: parseFloat(smpLat.toString()), 
        lng: parseFloat(smpLng.toString()) 
      },
      smk: { 
        lat: parseFloat(smkLat.toString()), 
        lng: parseFloat(smkLng.toString()) 
      }
    };

    // 2. Gunakan 'update' untuk mengubah baris yang sudah ada, bukan 'upsert'
    //    dan cari baris berdasarkan 'setting_key', bukan 'name'
    const { error } = await supabase
      .from('settings')
      .update({ setting_value: updatedValue }) // Perbarui kolom 'setting_value'
      .eq('setting_key', 'school_coordinates'); // Di mana 'setting_key' adalah 'school_coordinates'

    if (error) {
      toast.error(`Gagal menyimpan pengaturan: ${error.message}`);
    } else {
      toast.success('Pengaturan berhasil disimpan!');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-medium text-lg mb-2">SMP BUDI BAKTI UTAMA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smp_lat">Latitude SMP</Label>
            <Input 
              id="smp_lat"
              type="number" 
              step="any"
              value={smpLat}
              onChange={(e) => setSmpLat(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smp_lng">Longitude SMP</Label>
            <Input
              id="smp_lng"
              type="number" 
              step="any"
              value={smpLng}
              onChange={(e) => setSmpLng(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-lg mb-2">SMK BUDI BAKTI UTAMA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smk_lat">Latitude SMK</Label>
            <Input
              id="smk_lat"
              type="number" 
              step="any"
              value={smkLat}
              onChange={(e) => setSmkLat(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smk_lng">Longitude SMK</Label>
            <Input
              id="smk_lng"
              type="number" 
              step="any"
              value={smkLng}
              onChange={(e) => setSmkLng(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </form>
  );
}