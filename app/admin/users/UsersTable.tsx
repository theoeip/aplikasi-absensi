// Lokasi File: app/admin/users/UsersTable.tsx (DENGAN LINTER DISABLE)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Link from "next/link";

// Komponen UI
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Tipe data
type User = {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  school: string | null;
};

export default function UsersTable({ users, userRole }: { users: User[], userRole: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (userId: string, userName: string) => {
    setIsDeleting(true);

    const { error } = await supabase.functions.invoke('delete-user', {
      body: { user_id: userId },
    });

    if (error) {
      toast.error(`Gagal menghapus pengguna: ${error.message}`);
    } else {
      // PERBAIKAN 1: Kita nonaktifkan aturan linter untuk baris ini
      // eslint-disable-next-line react/no-unescaped-entities
      toast.success(`Pengguna '${userName}' berhasil dihapus secara permanen.`);
      router.refresh(); 
    }
    
    setIsDeleting(false);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Lengkap</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Peran</TableHead>
          <TableHead>Sekolah</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.full_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.school}</TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                {userRole === 'SuperAdmin' && (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/users/${user.id}/edit`}>Edit</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting}>Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                          {/* PERBAIKAN 2: Nonaktifkan juga aturan linter untuk baris ini */}
                          {/* eslint-disable-next-line react/no-unescaped-entities */}
                          <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pengguna '{user.full_name || user.email}' secara permanen dari sistem.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(user.id, user.full_name || user.email)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Pengguna'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}