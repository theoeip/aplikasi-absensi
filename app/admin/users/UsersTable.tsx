// Lokasi File: app/admin/users/UsersTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Link from "next/link";

// Menggunakan komponen UI dari kode Anda
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

// Tipe data dari kode Anda
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

  // Fungsi hapus yang baru, menggunakan metode sisi klien
  const handleDelete = async (userId: string) => {
    setIsDeleting(true);

    // PERHATIAN: Ini hanya menghapus data dari tabel 'users'.
    // Untuk menghapus dari Supabase Auth, diperlukan pemanggilan fungsi di server (Edge Function).
    // Kode ini fokus untuk menghilangkan error Server Action.
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      toast.error(`Gagal menghapus pengguna: ${error.message}`);
    } else {
      toast.success('Pengguna berhasil dihapus.');
      router.refresh(); // Segarkan data di tabel
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
                {/* Tombol Aksi hanya ditampilkan untuk SuperAdmin */}
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
                          <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pengguna secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          {/* Tombol ini sekarang memanggil fungsi handleDelete secara langsung */}
                          <AlertDialogAction 
                            onClick={() => handleDelete(user.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Menghapus...' : 'Lanjutkan'}
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