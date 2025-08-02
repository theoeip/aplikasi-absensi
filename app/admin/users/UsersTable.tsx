// app/admin/users/UsersTable.tsx
'use client';

import Link from "next/link";
import { deleteUser } from "./actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
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

type User = {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  school: string | null;
};

export default function UsersTable({ users, userRole }: { users: User[], userRole: string }) {
  
  const handleDelete = async (formData: FormData) => {
    const result = await deleteUser(formData);
    if (result.success) {
        toast.success(result.message);
    } else {
        toast.error(result.message);
    }
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
                        <Button variant="destructive" size="sm">Delete</Button>
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
                          <form action={handleDelete}>
                            <input type="hidden" name="userId" value={user.id} />
                            <AlertDialogAction type="submit">Lanjutkan</AlertDialogAction>
                          </form>
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