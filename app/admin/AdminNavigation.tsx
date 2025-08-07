'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, 
  faChartBar, 
  faCog, 
  faUserGraduate,
  faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";

// --- PERBAIKAN UTAMA ADA DI SINI ---
// Kita menambahkan peran 'AdminSMP' dan 'AdminSMK' ke dalam daftar yang diizinkan
// untuk setiap menu yang relevan.
const navLinks = [
  { href: "/admin/users", label: "Kelola User", icon: faUsers, roles: ['SuperAdmin', 'AdminSMP', 'AdminSMK'] },
  { href: "/admin/students", label: "Manajemen Siswa", icon: faUserGraduate, roles: ['SuperAdmin', 'AdminSMP', 'AdminSMK'] },
  { href: "/admin/schedules", label: "Manajemen Jadwal", icon: faCalendarAlt, roles: ['SuperAdmin', 'AdminSMP', 'AdminSMK'] },
  
  // Menu di bawah ini tidak perlu diubah
  { href: "/admin/attendance", label: "Laporan Absensi", icon: faChartBar }, // Bisa dilihat semua
  { href: "/admin/settings", label: "Pengaturan", icon: faCog, roles: ['SuperAdmin', 'AdminSMP', 'AdminSMK'] }, // Hanya SuperAdmin
];

export default function AdminNavigation({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  
  // Logika filter di bawah ini sudah benar dan tidak perlu diubah.
  // Ia akan bekerja dengan benar setelah kita memperbaiki array 'navLinks' di atas.
  const filteredNavLinks = navLinks.filter(link => {
    return !link.roles || link.roles.includes(userRole);
  });

  // Bagian render di bawah ini juga tidak perlu diubah.
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