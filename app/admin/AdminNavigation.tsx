// app/admin/AdminNavigation.tsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Impor ikon baru
import { 
  faUsers, 
  faChartBar, 
  faCog, 
  faUserGraduate, // Ikon untuk siswa
  faCalendarAlt   // Ikon untuk jadwal
} from "@fortawesome/free-solid-svg-icons";

// --- PERBAIKAN 1: Tambahkan halaman baru & properti 'roles' ---
// Properti 'roles' berisi daftar peran yang BISA melihat menu tersebut.
// Jika 'roles' tidak ada, artinya semua peran bisa melihat.
const navLinks = [
  { href: "/admin/users", label: "Kelola User", icon: faUsers, roles: ['SuperAdmin', 'Admin'] },
  { href: "/admin/students", label: "Manajemen Siswa", icon: faUserGraduate, roles: ['SuperAdmin', 'Admin'] },
  { href: "/admin/schedules", label: "Manajemen Jadwal", icon: faCalendarAlt, roles: ['SuperAdmin', 'Admin'] },
  { href: "/admin/attendance", label: "Laporan Absensi", icon: faChartBar }, // Bisa dilihat semua
  { href: "/admin/settings", label: "Pengaturan", icon: faCog, roles: ['SuperAdmin'] }, // Hanya SuperAdmin
];

export default function AdminNavigation({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  
  // --- PERBAIKAN 2: Logika filter yang lebih skalabel ---
  const filteredNavLinks = navLinks.filter(link => {
    // Jika link tidak punya properti 'roles', tampilkan untuk semua.
    // Jika ada, periksa apakah 'userRole' saat ini termasuk di dalamnya.
    return !link.roles || link.roles.includes(userRole);
  });

  return (
    <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
      {filteredNavLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-4 sm:px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
              isActive
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            }`}
          >
            <FontAwesomeIcon icon={link.icon} className="mr-2 h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}