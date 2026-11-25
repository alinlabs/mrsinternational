import type { ItemNavigasi } from '../types/status';

export const PETA_NAVIGASI: ItemNavigasi[] = [
  {
    id: 'ide',
    jalur: '/',
    judul: 'Rencana Utama',
    deskripsiSingkat: 'Panduan lengkap gagasan, tahapan, pesan, target wilayah, KPI, dan hal yang dijaga.',
    kelompok: 'ringkasan',
    tahapImplementasi: 'Tahap 03',
  },
  {
    id: 'produksi',
    jalur: '/produksi',
    judul: 'Produksi & Shooting',
    deskripsiSingkat: 'Tugas tim, jadwal shooting, wawancara, dan persetujuan.',
    kelompok: 'operasional',
    tahapImplementasi: 'Tahap 05',
  },
  {
    id: 'kalender',
    jalur: '/kalender',
    judul: 'Kalender Konten',
    deskripsiSingkat: 'Jadwal tayang 22 hari untuk video dan desain.',
    kelompok: 'operasional',
    tahapImplementasi: 'Tahap 04',
  },
  {
    id: 'aset',
    jalur: '/aset',
    judul: 'Galeri & Aset Drive',
    deskripsiSingkat: 'Arsip foto, video, dan file di 8 folder Google Drive.',
    kelompok: 'operasional',
    tahapImplementasi: 'Tahap 06',
  },
  {
    id: 'stakeholder',
    jalur: '/stakeholder',
    judul: 'Relasi & Undangan VIP',
    deskripsiSingkat: 'Kurasi pendaftar, tamu prioritas berkepentingan, dan catatan tindak lanjut.',
    kelompok: 'operasional',
    tahapImplementasi: 'Tahap 08',
  },
  {
    id: 'iklan',
    jalur: '/iklan',
    judul: 'Iklan & Anggaran',
    deskripsiSingkat: 'Paket biaya, jadwal tayang iklan, dan belanja aktual.',
    kelompok: 'analitik',
    tahapImplementasi: 'Tahap 07',
  },
  {
    id: 'monitoring',
    jalur: '/monitoring',
    judul: 'KPI & Performa',
    deskripsiSingkat: 'Catatan capaian kampanye dan peluang relasi masuk.',
    kelompok: 'analitik',
    tahapImplementasi: 'Tahap 09',
  },
  {
    id: 'laporan',
    jalur: '/laporan',
    judul: 'Laporan PDF',
    deskripsiSingkat: 'Buat dan cetak laporan ringkasan ke PDF.',
    kelompok: 'analitik',
    tahapImplementasi: 'Tahap 10',
  },
  {
    id: 'pengaturan',
    jalur: '/pengaturan',
    judul: 'Pengaturan',
    deskripsiSingkat: 'Atur acara, akses tim, cadangan data, dan riwayat.',
    kelompok: 'sistem',
    tahapImplementasi: 'Tahap 11',
  },
];

export const LABEL_KELOMPOK_NAVIGASI: Record<ItemNavigasi['kelompok'], string> = {
  ringkasan: 'Panduan',
  operasional: 'Lini Pekerjaan',
  analitik: 'Anggaran & Hasil',
  sistem: 'Pengaturan',
};

export function cariRuteAktif(pathname: string): ItemNavigasi | undefined {
  if (pathname === '/' || pathname === '/rencana') {
    return PETA_NAVIGASI[0];
  }
  return PETA_NAVIGASI.find(
    (item) => item.jalur !== '/' && (pathname === item.jalur || pathname.startsWith(`${item.jalur}/`)),
  );
}
