// File: app/admin/users/UsersTable.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// Komponen UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

// Tipe data
type User = {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  school: string | null;
  class_name: string | null;
};

// Props yang diterima komponen
interface UsersTableProps {
  users: User[];
  userRole: string;
  sortConfig: { key: 'full_name'; direction: 'ascending' | 'descending' };
  requestSort: () => void;
}

export default function UsersTable({ users, userRole, sortConfig, requestSort }: UsersTableProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (userId: string, userName: string | null) => {
    setIsDeleting(true);
    const { error } = await supabase.functions.invoke('delete-user', { body: { user_id: userId } });
    if (error) {
      toast.error(`Gagal menghapus pengguna: ${error.message}`);
    } else {
      toast.success(`Pengguna "${userName || 'tanpa nama'}" berhasil dihapus.`);
      router.refresh();
    }
    setIsDeleting(false);
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={requestSort} className="px-2">
                Nama Lengkap
                <FontAwesomeIcon 
                  icon={sortConfig.direction === 'ascending' ? faSortUp : faSortDown} 
                  className="ml-2" 
                />
              </Button>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Peran</TableHead>
            <TableHead>Sekolah</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.school}</TableCell>
                <TableCell>{user.role === 'Siswa' ? user.class_name || '-' : '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  {userRole === 'SuperAdmin' && (
                    <>
                      <Button asChild variant="outline" size="sm"><Link href={`/admin/users/${user.id}/edit`}>Edit</Link></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isDeleting || user.role === 'SuperAdmin'}>Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                            {/* --- PERBAIKAN: Gunakan template literal (backtick) --- */}
                            <AlertDialogDescription>
                              {`Tindakan ini akan menghapus pengguna "${user.full_name || user.email}" secara permanen.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id, user.full_name)} disabled={isDeleting}>
                              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Tidak ada data pengguna yang cocok.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
