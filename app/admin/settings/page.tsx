// app/admin/settings/page.tsx
import { supabaseAdmin } from "@/utils/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsForm from "./SettingsForm"; // Kita akan buat komponen form terpisah

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

  // Parsing data JSON dari database
  const initialCoordinates = schoolCoordsData.setting_value as any;

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