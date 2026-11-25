import type { DefinisiFolderDrive, FilterAsetDrive, KategoriAset, VisibilitasAset } from '../types/aset';
import type { PeranPengguna } from '../types/status';

export const DAFTAR_FOLDER_DRIVE_KANONIK: DefinisiFolderDrive[] = [
  {
    kode: '01_Brief',
    nama: '01_Brief',
    deskripsi: 'One-page brief, naskah panduan, formulir persetujuan talent, dan dokumen strategi.',
    kategoriUtama: 'document',
  },
  {
    kode: '02_Logo',
    nama: '02_Logo',
    deskripsi: 'Logo resmi kolaborasi Melfarina Sianipar × Raden Sirait (MRS), Vany Songket, template desain maroon/gold, dan panduan identitas.',
    kategoriUtama: 'design',
  },
  {
    kode: '03_Interview_Raw',
    nama: '03_Interview_Raw',
    deskripsi: 'Footage mentah wawancara Melfarina Sianipar, Raden Sirait, Ghivany, dan room tone.',
    kategoriUtama: 'raw-video',
  },
  {
    kode: '04_Broll',
    nama: '04_Broll',
    deskripsi: 'Klip B-roll kain motif Batak Ragi Hotang, detail jahitan, proses desain, dan ruang kerja.',
    kategoriUtama: 'raw-video',
  },
  {
    kode: '05_Edit_Review',
    nama: '05_Edit_Review',
    deskripsi: 'Draft edit yang menunggu review Owner, Raden Sirait, atau QA Digital Manager.',
    kategoriUtama: 'edited-video',
  },
  {
    kode: '06_Final_Export',
    nama: '06_Final_Export',
    deskripsi: 'Master final 9:16 siap publikasi (MRS_YYYYMMDD_PLATFORM_PILLAR_TOPIC_V01.mp4) & cover PNG.',
    kategoriUtama: 'edited-video',
  },
  {
    kode: '07_Ads',
    nama: '07_Ads',
    deskripsi: 'Hero Ad 45–60 detik, cutdown 15 dtk / 6 dtk, dan materi iklan berlisensi komersial.',
    kategoriUtama: 'edited-video',
  },
  {
    kode: '08_Reports',
    nama: '08_Reports',
    deskripsi: 'Arsip ekspor laporan PDF, media clipping, dan ringkasan performa kampanye.',
    kategoriUtama: 'document',
  },
];

export const DAFTAR_KATEGORI_ASET: { nilai: KategoriAset; label: string }[] = [
  { nilai: 'raw-video', label: 'Video Mentah (Raw)' },
  { nilai: 'edited-video', label: 'Video Edit / Final' },
  { nilai: 'image', label: 'Foto / Gambar' },
  { nilai: 'design', label: 'Desain / Carousel / Logo' },
  { nilai: 'document', label: 'Dokumen / Brief / PDF' },
  { nilai: 'audio', label: 'Audio / Voice Over' },
  { nilai: 'other', label: 'Lainnya' },
];

export const DAFTAR_VISIBILITAS_ASET: { nilai: VisibilitasAset; label: string }[] = [
  { nilai: 'internal', label: 'Internal Tim (Default Privat)' },
  { nilai: 'owner-only', label: 'Khusus Owner & Admin' },
  { nilai: 'approved-for-public', label: 'Disetujui untuk Materi Publik' },
];

export const FILTER_ASET_DEFAULT: FilterAsetDrive = {
  kataKunci: '',
  folderKode: 'semua',
  kategori: 'semua',
  visibility: 'semua',
  kontenTertaut: '',
  sesiShootingId: '',
  uploader: '',
  tanggal: '',
};

export const DAFTAR_PERAN_RBAC_KANONIK: {
  nilai: PeranPengguna;
  label: string;
  ringkasanAkses: string;
}[] = [
  {
    nilai: 'owner',
    label: 'Owner (Melfarina Sianipar)',
    ringkasanAkses: 'Akses penuh seluruh folder, upload, edit metadata, persetujuan publik, dan hapus aset.',
  },
  {
    nilai: 'admin',
    label: 'Admin Sistem',
    ringkasanAkses: 'Akses operasional penuh aset, manajemen folder, dan pemeriksaan log audit.',
  },
  {
    nilai: 'digital-manager',
    label: 'Digital Manager',
    ringkasanAkses: 'Upload, baca, edit metadata, dan tautkan aset ke kalender/tugas di 8 folder.',
  },
  {
    nilai: 'editor',
    label: 'Editor / Videografer',
    ringkasanAkses: 'Upload & perbarui folder kerja (03_Interview_Raw s.d. 06_Final_Export); tidak dapat menghapus arsip final.',
  },
  {
    nilai: 'stakeholder-pic',
    label: 'PIC Stakeholder',
    ringkasanAkses: 'Akses materi press/brief (01_Brief, 02_Logo, 08_Reports) tanpa akses data mentah internal.',
  },
  {
    nilai: 'viewer',
    label: 'Viewer (Read-Only)',
    ringkasanAkses: 'Hanya pratinjau aset yang diizinkan; tidak dapat mengunggah, mengubah, atau menghapus aset.',
  },
];

export const BATAS_UPLOAD_PROXY_DEFAULT_BYTES = 4 * 1024 * 1024; // 4 MiB aman di bawah batas 4.5 MB Vercel

export const MIME_DIIZINKAN_ASET: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'video/mp4': ['.mp4'],
};
