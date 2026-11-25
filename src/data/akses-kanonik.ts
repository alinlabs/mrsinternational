import type {
  HandleSosialPengaturan,
  ItemMatriksIzinPeran,
  KontakResmiPengaturan,
  PengaturanAnggaranSistem,
  PengaturanEventSistem,
} from '../types/pengaturan';

export const PENGATURAN_EVENT_KANONIK: PengaturanEventSistem = {
  namaEvent: 'MRs Plan — The Contemporary Heritage Reinterpretation (Melfarina × Raden Sirait)',
  tanggalEvent: '2026-12-18',
  zonaWaktu: 'Asia/Jakarta',
  kotaWilayahPublik: 'Balige, Toba',
  labelAksesPublik: 'Kuota Terbatas',
  lokasiPrivat: '',
  catatanKeamananPublik:
    'Penyampaian kampanye publik menggunakan konsep Kuota Terbatas tanpa menyebut verifikasi Admin. Secara internal di balik layar, Admin tetap menyaring pendaftar agar konfirmasi undangan & alamat rinci hanya dikirim kepada tamu berkepentingan strategis.',
  diperbaruiOleh: 'Seed Kanonik v1.0',
  diperbaruiPada: '2026-11-24T00:00:00.000Z',
};

export const HANDLE_SOSIAL_KANONIK: HandleSosialPengaturan[] = [
  {
    id: 'soc-ig',
    platform: 'Instagram',
    handle: '@mrs.melfarinaraden',
    urlProfil: '',
    statusKonfirmasi: 'contoh-belum-dikonfirmasi',
    catatan: 'Handle contoh dalam rencana brand MRS; tunggu verifikasi ketersediaan dari Owner.',
  },
  {
    id: 'soc-fb',
    platform: 'Facebook',
    handle: 'MRSMelfarinaRaden',
    urlProfil: '',
    statusKonfirmasi: 'contoh-belum-dikonfirmasi',
    catatan: 'Nama halaman contoh untuk MRS; tunggu konfirmasi tautan Facebook Page resmi.',
  },
  {
    id: 'soc-tt',
    platform: 'TikTok',
    handle: '@mrs.melfarinaraden',
    urlProfil: '',
    statusKonfirmasi: 'contoh-belum-dikonfirmasi',
    catatan: 'Handle contoh; tunggu verifikasi akun TikTok & Business Center.',
  },
];

export const KONTAK_RESMI_KANONIK: KontakResmiPengaturan = {
  emailPress: '',
  whatsappKemitraan: '',
  emailBisnis: '',
  statusKonfirmasi: 'belum-diisi',
  diperbaruiOleh: '',
  diperbaruiPada: '',
};

export const PENGATURAN_ANGGARAN_KANONIK: PengaturanAnggaranSistem = {
  skenarioTarget: 'menengah',
  plafonDisetujuiIdr: null,
  disetujuiOleh: '',
  tanggalDisetujui: '',
  catatanPersetujuan: 'Menunggu penetapan plafon resmi dari Owner.',
};

export const MATRIKS_IZIN_6_PERAN: ItemMatriksIzinPeran[] = [
  {
    id: 'perm-event',
    sumberDaya: 'Pengaturan Event & Venue Privat',
    deskripsi: 'Metadata acara 18 Des 2026, lokasi privat, kontak bisnis/press resmi.',
    izinPerPeran: {
      owner: 'Baca & Ubah Penuh',
      admin: 'Baca & Ubah Penuh',
      'digital-manager': 'Baca & Ubah Event',
      editor: 'Baca Publik (Lokasi Privat Tersensor)',
      'stakeholder-pic': 'Baca & Gunakan Kontak',
      viewer: 'Baca Publik (Tersensor)',
    },
  },
  {
    id: 'perm-kalender',
    sumberDaya: 'Kalender Konten & Produksi',
    deskripsi: '66 master konten (22 hari), agenda shooting 3 hari (25 Nov iklan; 30 Nov & 3 Des short konten), persetujuan kutipan.',
    izinPerPeran: {
      owner: 'Baca, Ubah & Approve Final',
      admin: 'Baca & Ubah',
      'digital-manager': 'Baca, Ubah & Approve Konten',
      editor: 'Baca & Update Tugas/Aset',
      'stakeholder-pic': 'Baca Saja',
      viewer: 'Baca Saja',
    },
  },
  {
    id: 'perm-aset',
    sumberDaya: 'Perpustakaan Aset & Google Drive',
    deskripsi: 'Unggah ke folder 01–08, visibilitas aset, soft delete, & pemulihan.',
    izinPerPeran: {
      owner: 'Penuh + Hapus Permanen',
      admin: 'Penuh + Hapus Permanen',
      'digital-manager': 'Baca, Unggah & Edit (Tanpa Hapus)',
      editor: 'Folder 03–06 Saja',
      'stakeholder-pic': 'Folder 01, 02, 08 Saja',
      viewer: 'Aset Approved-for-Public Saja',
    },
  },
  {
    id: 'perm-anggaran',
    sumberDaya: 'Plafon Anggaran & Paid Media',
    deskripsi: 'Penetapan skenario, persetujuan plafon disetujui Owner, & belanja aktual.',
    izinPerPeran: {
      owner: 'Approve Plafon & Penuh',
      admin: 'Approve Plafon & Penuh',
      'digital-manager': 'Kelola Flight & Aktual (Tidak Approve Plafon)',
      editor: 'Baca Ringkas (Tanpa Approve)',
      'stakeholder-pic': 'Baca Ringkas (Tanpa Approve)',
      viewer: 'Baca Estimasi Saja',
    },
  },
  {
    id: 'perm-stakeholder',
    sumberDaya: 'Stakeholder CRM & Kontak Privat (PII)',
    deskripsi: 'Daftar VIP/partner, nomor/email kontak pribadi, catatan relasi, & ekspor.',
    izinPerPeran: {
      owner: 'Penuh + Lihat & Ekspor PII',
      admin: 'Penuh + Lihat & Ekspor PII',
      'digital-manager': 'Penuh + Lihat & Ekspor PII',
      editor: 'Kontak Privat Tersensor',
      'stakeholder-pic': 'Kelola Outreach & Lihat PII',
      viewer: 'Kontak Privat Tersensor',
    },
  },
  {
    id: 'perm-tim-audit',
    sumberDaya: 'Manajemen Peran, Integrasi & Audit Log',
    deskripsi: 'Allowlist tim, promosi ke Owner/Admin, backup JSON, & rekam jejak sistem.',
    izinPerPeran: {
      owner: 'Penuh (Termasuk Grant Owner/Admin)',
      admin: 'Kelola Tim Non-Owner & Audit',
      'digital-manager': 'Baca Audit Log & Ekspor Backup',
      editor: 'Ditolak (403 Forbidden)',
      'stakeholder-pic': 'Ditolak (403 Forbidden)',
      viewer: 'Ditolak (403 Forbidden)',
    },
  },
];
