// Lokasi File: app/admin/settings/SettingsClientPage.tsx
'use client';

import React, { useState, createContext, useContext, useTransition } from 'react';
import { toast } from 'sonner';

// Import semua actions dari server yang sudah diperbarui
import { 
  updateSettings, 
  addClass, 
  addSubject, 
  deleteItem, 
  updateClass,
  updateSubject
} from './actions';

// Komponen UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

// --- Komponen Tabs Kustom (TETAP SAMA) ---
const TabsContext = createContext<{ activeTab: string; setActiveTab: (value: string) => void; }>({ activeTab: '', setActiveTab: () => {} });
const Tabs = ({ defaultValue, children, className }: { defaultValue: string; children: React.ReactNode; className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};
const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);
const TabsTrigger = ({ value, children }: { value: string; children: React.ReactNode; }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
};
const TabsContent = ({ value, children }: { value: string; children: React.ReactNode; }) => {
  const { activeTab } = useContext(TabsContext);
  return activeTab === value ? <div>{children}</div> : null;
};
// --- Akhir dari Komponen Tabs Kustom ---


// Tipe data (tidak berubah)
type SchoolCoordinate = { lat: number; lng: number; };
type SchoolSettings = { smp?: SchoolCoordinate; smk?: SchoolCoordinate; };
type Class = { id: string; name: string; school: string; };
type Subject = { id: string; name: string; };
type Schedule = { 
    id: string; 
    day_of_week: number; 
    start_time: string; 
    end_time: string;
    users: { full_name: string | null } | null;
    classes: { name: string | null, school: string | null } | null;
    subjects: { name: string | null } | null;
};

interface SettingsClientPageProps {
  initialCoordinates: SchoolSettings;
  initialClasses: Class[];
  initialSubjects: Subject[];
  initialSchedules: Schedule[];
  adminSchool: string;
}

export default function SettingsClientPage({
  initialCoordinates, initialClasses, initialSubjects, initialSchedules, adminSchool
}: SettingsClientPageProps) {
  const [isPending, startTransition] = useTransition();

  const [smpLat, setSmpLat] = useState(initialCoordinates.smp?.lat || '');
  const [smpLng, setSmpLng] = useState(initialCoordinates.smp?.lng || '');
  const [smkLat, setSmkLat] = useState(initialCoordinates.smk?.lat || '');
  const [smkLng, setSmkLng] = useState(initialCoordinates.smk?.lng || '');
  
  const addClassFormRef = React.useRef<HTMLFormElement>(null);
  const addSubjectFormRef = React.useRef<HTMLFormElement>(null);
  
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const [editItem, setEditItem] = useState<{ id: string; name: string; school?: string; type: 'classes' | 'subjects' } | null>(null);

  const handleFormAction = (action: () => Promise<{success: boolean, message: string}>, formRef?: React.RefObject<HTMLFormElement>) => {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(result.message);
        formRef?.current?.reset();
        setEditItem(null);
      } else {
        toast.error(result.message);
      }
    });
  }

  const handleAddClassAction = (formData: FormData) => handleFormAction(() => addClass(formData), addClassFormRef);
  const handleAddSubjectAction = (formData: FormData) => handleFormAction(() => addSubject(formData), addSubjectFormRef);
  const handleDeleteItem = (id: string, tableName: 'classes' | 'subjects' | 'schedules') => handleFormAction(() => deleteItem(id, tableName));
  
  const handleUpdateClassAction = (formData: FormData) => {
    if (!editItem) return;
    formData.append('id', editItem.id);
    handleFormAction(() => updateClass(formData));
  };
  
  const handleUpdateSubjectAction = (formData: FormData) => {
    if (!editItem) return;
    formData.append('id', editItem.id);
    handleFormAction(() => updateSubject(formData));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pengaturan Aplikasi</h1>
      
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-200 p-1 rounded-lg">
           <TabsTrigger value="classes">Rombel</TabsTrigger>
           <TabsTrigger value="subjects">Mata Pelajaran</TabsTrigger>
           <TabsTrigger value="schedules">Jadwal</TabsTrigger>
           <TabsTrigger value="gps">Koordinat GPS</TabsTrigger>
        </TabsList>
        <div className="mt-4">
            <TabsContent value="classes">
            <Card>
                <CardHeader>
                    <CardTitle>Manajemen Rombongan Belajar (Kelas)</CardTitle>
                    <CardDescription>Tambah, edit, atau hapus daftar kelas untuk sekolah Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form action={handleAddClassAction} ref={addClassFormRef} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input name="class_name" placeholder="Nama Kelas Baru (Contoh: X RPL 1)" required disabled={isPending} className="sm:col-span-1"/>
                        <Select name="school" required>
                            <SelectTrigger className="sm:col-span-1">
                                <SelectValue placeholder="Pilih Sekolah..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SMP BUDI BAKTI UTAMA">SMP BUDI BAKTI UTAMA</SelectItem>
                                <SelectItem value="SMK BUDI BAKTI UTAMA">SMK BUDI BAKTI UTAMA</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" disabled={isPending} className="sm:col-span-1">{isPending ? 'Menambah...' : 'Tambah Kelas'}</Button>
                    </form>
                    
                    {initialClasses.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
                            <p className="font-medium">Belum ada Rombel</p>
                            <p className="text-sm">Silakan tambahkan rombel baru di atas.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Nama Kelas</TableHead><TableHead>Sekolah</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>
                            {initialClasses.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell>{c.name}</TableCell>
                                    <TableCell>{c.school}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditItem({ id: c.id, name: c.name, school: c.school, type: 'classes' })} disabled={isPending}>
                                            Edit
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" disabled={isPending}>Hapus</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Anda yakin?</AlertDialogTitle><AlertDialogDescription>Aksi ini tidak dapat dibatalkan. Ini akan menghapus kelas secara permanen.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteItem(c.id, 'classes')} disabled={isPending}>
                                                        {isPending ? 'Menghapus...' : 'Ya, Hapus'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="subjects">
            <Card>
                <CardHeader>
                    <CardTitle>Manajemen Mata Pelajaran</CardTitle>
                    <CardDescription>Tambah, edit, atau hapus daftar mata pelajaran.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <form action={handleAddSubjectAction} ref={addSubjectFormRef} className="flex gap-2">
                        <Input name="subject_name" placeholder="Nama Mata Pelajaran Baru" required disabled={isPending} />
                        <Button type="submit" disabled={isPending}>{isPending ? 'Menambah...' : 'Tambah Mapel'}</Button>
                    </form>
                    {initialSubjects.length === 0 ? (
                         <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
                            <p className="font-medium">Belum ada Mata Pelajaran</p>
                        </div>
                    ) : (
                       <Table>
                            <TableHeader><TableRow><TableHead>Nama Mata Pelajaran</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>
                            {initialSubjects.map(s => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.name}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditItem({ id: s.id, name: s.name, type: 'subjects' })} disabled={isPending}>
                                            Edit
                                        </Button>
                                        <AlertDialog>
                                           <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" disabled={isPending}>Hapus</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Anda yakin?</AlertDialogTitle><AlertDialogDescription>Aksi ini tidak dapat dibatalkan. Ini akan menghapus mata pelajaran secara permanen.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteItem(s.id, 'subjects')} disabled={isPending}>
                                                        {isPending ? 'Menghapus...' : 'Ya, Hapus'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            </TabsContent>
            
            <TabsContent value="schedules">
              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Jadwal Mengajar</CardTitle>
                  <CardDescription>Daftar jadwal mengajar yang sudah diatur.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Table>
                    <TableHeader><TableRow><TableHead>Hari</TableHead><TableHead>Waktu</TableHead><TableHead>Guru</TableHead><TableHead>Kelas</TableHead><TableHead>Mata Pelajaran</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                    <TableBody>
                    {initialSchedules.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="h-24 text-center">Belum ada jadwal yang diatur.</TableCell></TableRow>
                    ) : (
                        initialSchedules.map(s => (
                            <TableRow key={s.id}>
                                <TableCell>{days[s.day_of_week - 1]}</TableCell>
                                <TableCell>{s.start_time} - {s.end_time}</TableCell>
                                <TableCell>{s.users?.full_name}</TableCell>
                                <TableCell>{s.classes?.name}</TableCell>
                                <TableCell>{s.subjects?.name}</TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm" disabled={isPending}>Hapus</Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Anda yakin?</AlertDialogTitle><AlertDialogDescription>Aksi ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteItem(s.id, 'schedules')} disabled={isPending}>
                                                    {isPending ? 'Menghapus...' : 'Ya, Hapus'}
                                                </AlertDialogAction>
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
            </TabsContent>

            <TabsContent value="gps">
            <Card>
                <CardHeader>
                    <CardTitle>Titik Koordinat GPS Sekolah</CardTitle>
                    <CardDescription>Ini akan menjadi titik pusat untuk validasi radius absensi.</CardDescription>
                </CardHeader>
                <CardContent>
                <form action={(formData) => handleFormAction(() => updateSettings(formData))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="smp_lat">Latitude SMP</Label>
                            <Input id="smp_lat" name="smp_lat" value={smpLat} onChange={(e) => setSmpLat(e.target.value)} placeholder="-6.12345" required type="number" step="any" disabled={isPending} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smp_lng">Longitude SMP</Label>
                            <Input id="smp_lng" name="smp_lng" value={smpLng} onChange={(e) => setSmpLng(e.target.value)} placeholder="106.12345" required type="number" step="any" disabled={isPending}/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="smk_lat">Latitude SMK</Label>
                            <Input id="smk_lat" name="smk_lat" value={smkLat} onChange={(e) => setSmkLat(e.target.value)} placeholder="-6.54321" required type="number" step="any" disabled={isPending} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smk_lng">Longitude SMK</Label>
                            <Input id="smk_lng" name="smk_lng" value={smkLng} onChange={(e) => setSmkLng(e.target.value)} placeholder="106.54321" required type="number" step="any" disabled={isPending} />
                        </div>
                    </div>
                    <Button type="submit" disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan Koordinat'}</Button>
                </form>
                </CardContent>
            </Card>
            </TabsContent>
        </div>
      </Tabs>
      
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit {editItem?.type === 'classes' ? 'Rombel' : 'Mata Pelajaran'}</DialogTitle>
            </DialogHeader>
            {editItem?.type === 'classes' && (
                <form action={handleUpdateClassAction}>
                    <div className="py-4 space-y-4">
                        <div className='space-y-2'>
                            <Label htmlFor="edit-class-name">Nama Rombel</Label>
                            <Input id="edit-class-name" name="name" defaultValue={editItem.name} required disabled={isPending} autoFocus/>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="edit-school">Sekolah</Label>
                            <Select name="school" defaultValue={editItem.school} required>
                                <SelectTrigger><SelectValue placeholder="Pilih sekolah..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SMP BUDI BAKTI UTAMA">SMP BUDI BAKTI UTAMA</SelectItem>
                                    <SelectItem value="SMK BUDI BAKTI UTAMA">SMK BUDI BAKTI UTAMA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            )}
            {editItem?.type === 'subjects' && (
                 <form action={handleUpdateSubjectAction}>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="edit-subject-name">Nama Mata Pelajaran</Label>
                        <Input id="edit-subject-name" name="name" defaultValue={editItem.name} required disabled={isPending} autoFocus/>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}