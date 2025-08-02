// app/admin/AdminNavigation.tsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faChartBar, faCog } from "@fortawesome/free-solid-svg-icons";

const navLinks = [
  { href: "/admin/users", label: "Kelola User", icon: faUsers },
  { href: "/admin/attendance", label: "Laporan Absensi", icon: faChartBar },
  { href: "/admin/settings", label: "Pengaturan", icon: faCog },
];

export default function AdminNavigation({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  
  // Filter navigasi: hanya SuperAdmin yang bisa lihat 'Pengaturan'
  const filteredNavLinks = navLinks.filter(link => {
    if (link.label === 'Pengaturan' && userRole !== 'SuperAdmin') {
      return false;
    }
    return true;
  });

  return (
    <div className="flex border-b border-gray-200 dark:border-slate-700">
      {filteredNavLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-4 sm:px-6 py-3 font-medium text-sm sm:text-base transition-colors ${
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