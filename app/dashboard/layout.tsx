// Lokasi File: app/dashboard/layout.tsx

import DashboardAuthWrapper from './DashboardAuthWrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Membungkus semua halaman di bawah /dashboard dengan logika otentikasi
  return (
    <DashboardAuthWrapper>
      {children}
    </DashboardAuthWrapper>
  );
}