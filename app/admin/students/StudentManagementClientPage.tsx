// app/admin/students/StudentManagementClientPage.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { assignClassToStudent } from './actions';

// Tipe data diperbarui: email dihapus
type Student = {
  id: string;
  full_name: string | null;
  classes: { id: string; name: string } | null;
};
type Class = {
  id: string;
  name: string;
};

interface StudentManagementClientPageProps {
  initialStudents: Student[];
  availableClasses: Class[];
}

export default function StudentManagementClientPage({ initialStudents, availableClasses }: StudentManagementClientPageProps) {
  const [isPending, startTransition] = useTransition();
  const [assignTarget, setAssignTarget] = useState<Student | null>(null);

  const handleAssignAction = async (formData: FormData) => {
    startTransition(async () => {
      const result = await assignClassToStudent(formData);
      if (result.success) {
        toast.success(result.message);
        setAssignTarget(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Rombel Siswa</h1>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>Tetapkan rombongan belajar untuk setiap siswa.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lengkap</TableHead>
                {/* Kolom Email dihapus */}
                <TableHead>Rombel Saat Ini</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialStudents.length === 0 ? (
                <TableRow>
                  {/* colSpan diubah menjadi 3 */}
                  <TableCell colSpan={3} className="h-24 text-center">
                    Belum ada data siswa.
                  </TableCell>
                </TableRow>
              ) : (
                initialStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.full_name}</TableCell>
                    {/* Kolom Email dihapus */}
                    <TableCell>{student.classes?.name || <span className="text-gray-400">Belum diatur</span>}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setAssignTarget(student)}>
                        Atur Rombel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!assignTarget} onOpenChange={() => setAssignTarget(null)}>
        {/* ... Isi Dialog tetap sama, tidak perlu diubah ... */}
        <DialogContent><DialogHeader><DialogTitle>Atur Rombel untuk {assignTarget?.full_name}</DialogTitle></DialogHeader><form action={handleAssignAction}><input type="hidden" name="studentId" value={assignTarget?.id} /><div className="py-4"><Label htmlFor="classId" className="mb-2 block">Pilih Rombel</Label><Select name="classId" defaultValue={assignTarget?.classes?.id} required><SelectTrigger><SelectValue placeholder="Pilih rombel..." /></SelectTrigger><SelectContent>{availableClasses.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent></Select></div><DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose><Button type="submit" disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter></form></DialogContent>
      </Dialog>
    </div>
  );
}