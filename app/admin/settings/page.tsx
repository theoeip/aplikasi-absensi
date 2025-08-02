// Lokasi File: app/admin/settings/page.tsx

import { supabaseAdmin } from "@/utils/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsForm from "./SettingsForm";

// PERBAIKAN 1: Membuat interface untuk mendefinisikan bentuk data yang diharapkan dari database.
interface SchoolCoordinate {
  lat: number;
  lng: number;
}

interface SchoolSettings {
  smp?: SchoolCoordinate;
  smk?: SchoolCoordinate;
}

export default async function SettingsPage() {
  // Ambil data pengaturan koordinat sekolah dari database
  const { data: schoolCoordsData, error: coordsError } = await supabaseAdmin
    .from('settings')
    .select('setting_value')
    .eq('setting_key', 'school_coordinates')
    .single();

  if (coordsError) {
    return <p className="text-red-500">Gagal memuat pengaturan: {coordsError.message}</p>
  }

  // PERBAIKAN 2: Mengganti 'any' dengan tipe 'SchoolSettings' yang lebih spesifik.
  // Menambahkan '|| {}' sebagai fallback jika data dari DB kosong, untuk mencegah error.
  const initialCoordinates = (schoolCoordsData?.setting_value || {}) as SchoolSettings;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pengaturan Aplikasi</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Titik Koordinat GPS Sekolah</CardTitle>
          <CardDescription>
            Ini akan menjadi titik pusat untuk validasi radius absensi. Dapatkan koordinat dari Google Maps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Melemparkan data awal ke komponen form */}
          <SettingsForm initialData={initialCoordinates} />
        </CardContent>
      </Card>
    </div>
  );
}