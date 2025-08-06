// Lokasi File: app/admin/schedules/ScheduleManagementClientPage.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveSchedule, deleteSchedule } from './actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Tipe data yang dibutuhkan
type Schedule = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  classes: { name: string | null } | null;
  subjects: { name: string | null } | null;
  users: { full_name: string | null } | null;
};
type Class = { id: string; name: string; };
type Subject = { id: string; name: string; };
type Teacher = { id: string; full_name: string | null; };

interface ScheduleManagementClientPageProps {
  initialSchedules: Schedule[];
  availableClasses: Class[];
  availableSubjects: Subject[];
  availableTeachers: Teacher[];
}

export default function ScheduleManagementClientPage({ 
    initialSchedules, 
    availableClasses, 
    availableSubjects, 
    availableTeachers 
}: ScheduleManagementClientPageProps) {
  const [isPending, startTransition] = useTransition();
  const [editingSchedule, setEditingSchedule] = useState<Partial<Schedule> | null>(null);
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const handleSaveAction = async (formData: FormData) => {
    startTransition(async () => {
      const result = await saveSchedule(formData);
      if (result.success) {
        toast.success(result.message);
        setEditingSchedule(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDeleteAction = (id: string) => {
    startTransition(async () => {
        const result = await deleteSchedule(id);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Jadwal</h1>
        <Button onClick={() => setEditingSchedule({})}>Tambah Jadwal</Button>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Daftar Jadwal</CardTitle>
            <CardDescription>Tambah, edit, atau hapus jadwal pelajaran.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hari</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Rombel</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSchedules.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Belum ada jadwal yang diatur.</TableCell></TableRow>
              ) : (
                initialSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{days[schedule.day_of_week - 1]}</TableCell>
                    <TableCell>{schedule.start_time} - {schedule.end_time}</TableCell>
                    <TableCell>{schedule.classes?.name}</TableCell>
                    <TableCell>{schedule.subjects?.name}</TableCell>
                    <TableCell>{schedule.users?.full_name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingSchedule(schedule)}>Edit</Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Hapus</Button></AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Anda yakin?</AlertDialogTitle></AlertDialogHeader>
                              <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteAction(schedule.id)}>Ya, Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingSchedule} onOpenChange={() => setEditingSchedule(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingSchedule?.id ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</DialogTitle>
          </DialogHeader>
          <form action={handleSaveAction}>
            {editingSchedule?.id && <input type="hidden" name="id" value={editingSchedule.id} />}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="day_of_week" className="text-right">Hari</Label>
                <Select name="day_of_week" defaultValue={editingSchedule?.day_of_week?.toString()} required>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih hari..."/></SelectTrigger>
                    <SelectContent>{days.map((day, i) => <SelectItem key={i} value={(i + 1).toString()}>{day}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_time" className="text-right">Jam Mulai</Label>
                <Input id="start_time" name="start_time" type="time" defaultValue={editingSchedule?.start_time} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_time" className="text-right">Jam Selesai</Label>
                <Input id="end_time" name="end_time" type="time" defaultValue={editingSchedule?.end_time} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="class_id" className="text-right">Rombel</Label>
                <Select name="class_id" defaultValue={editingSchedule?.class_id} required>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih rombel..."/></SelectTrigger>
                    <SelectContent>{availableClasses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject_id" className="text-right">Mapel</Label>
                <Select name="subject_id" defaultValue={editingSchedule?.subject_id} required>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih mapel..."/></SelectTrigger>
                    <SelectContent>{availableSubjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {/* --- INI BAGIAN PERBAIKANNYA --- */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teacher_id" className="text-right">Guru</Label>
                <Select name="teacher_id" defaultValue={editingSchedule?.teacher_id} required>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Pilih guru..."/></SelectTrigger>
                    <SelectContent>
                        {availableTeachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
              <Button type="submit" disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}