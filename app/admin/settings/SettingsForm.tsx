// Lokasi File: app/admin/settings/SettingsForm.tsx
'use client';

import { updateSettings } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

// PERBAIKAN: Membuat interface untuk mendefinisikan bentuk data pengaturan.
// Ini menggantikan tipe 'any' dan membuat kode lebih aman.
interface SchoolCoordinates {
  lat: number | string;
  lng: number | string;
}

interface SettingsData {
  smp?: SchoolCoordinates;
  smk?: SchoolCoordinates;
}

// PERBAIKAN: Menggunakan interface 'SettingsData' sebagai tipe untuk prop.
export default function SettingsForm({ initialData }: { initialData: SettingsData }) {

  // Fungsi ini akan dipanggil saat form disubmit
  const handleUpdateSettings = async (formData: FormData) => {
    const result = await updateSettings(formData);
    
    if (result && result.success) {
      toast.success(result.message);
    } else if (result) {
      toast.error(result.message);
    }
  };

  return (
    <form action={handleUpdateSettings} className="space-y-6">
      {/* Pengaturan untuk SMP */}
      <div>
        <h3 className="font-medium text-lg mb-2">SMP BUDI BAKTI UTAMA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smp_lat">Latitude SMP</Label>
            <Input 
              id="smp_lat"
              type="number" 
              step="any"
              name="smp_lat" 
              defaultValue={initialData.smp?.lat}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smp_lng">Longitude SMP</Label>
            <Input
              id="smp_lng"
              type="number" 
              step="any"
              name="smp_lng" 
              defaultValue={initialData.smp?.lng}
              required
            />
          </div>
        </div>
      </div>

      {/* Pengaturan untuk SMK */}
      <div>
        <h3 className="font-medium text-lg mb-2">SMK BUDI BAKTI UTAMA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smk_lat">Latitude SMK</Label>
            <Input
              id="smk_lat"
              type="number" 
              step="any"
              name="smk_lat" 
              defaultValue={initialData.smk?.lat}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smk_lng">Longitude SMK</Label>
            <Input
              id="smk_lng"
              type="number" 
              step="any"
              name="smk_lng" 
              defaultValue={initialData.smk?.lng}
              required
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit">Simpan Pengaturan</Button>
      </div>
    </form>
  );
}