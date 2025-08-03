// Lokasi File: app/admin/layout.tsx (SUDAH DIPERBAIKI)

import AdminAuthWrapper from './AdminAuthWrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout ini sekarang hanya bertugas membungkus konten dengan komponen otentikasi klien.
  // Semua logika 'cookies' dan data fetching sudah dipindahkan.
  return (
    <AdminAuthWrapper>
      {children}
    </AdminAuthWrapper>
  );
}