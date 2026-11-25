import type { PeranPengguna } from './status';

export type KodeFolderDrive =
  | '01_Brief'
  | '02_Logo'
  | '03_Interview_Raw'
  | '04_Broll'
  | '05_Edit_Review'
  | '06_Final_Export'
  | '07_Ads'
  | '08_Reports';

export interface DefinisiFolderDrive {
  kode: KodeFolderDrive;
  nama: string;
  deskripsi: string;
  kategoriUtama: KategoriAset;
}

export type KategoriAset =
  | 'raw-video'
  | 'edited-video'
  | 'image'
  | 'design'
  | 'document'
  | 'audio'
  | 'other';

export type VisibilitasAset =
  | 'internal'
  | 'owner-only'
  | 'approved-for-public';

export type StatusSinkronAset =
  | 'tersinkron-drive'
  | 'unggah-eksternal-menunggu-sinkronisasi';

export interface AsetDrive {
  id: string;
  driveFileId: string;
  driveUrl: string;
  folderKode: KodeFolderDrive;
  folderId: string;
  namaAsli: string;
  namaTampilan: string;
  mimeType: string;
  sizeBytes: number;
  kategori: KategoriAset;
  tags: string[];
  kontenTertaut: string[];
  tugasTertaut: string[];
  sesiShootingId: '' | 'shoot-hari-1' | 'shoot-hari-2' | 'shoot-hari-3' | 'pra-event';
  visibility: VisibilitasAset;
  statusSinkron: StatusSinkronAset;
  uploadedBy: string;
  uploadedAt: string;
  checksum: string;
  thumbnailUrl: string;
  catatan: string;
}

export interface FilterAsetDrive {
  kataKunci: string;
  folderKode: KodeFolderDrive | 'semua';
  kategori: KategoriAset | 'semua';
  visibility: VisibilitasAset | 'semua';
  kontenTertaut: string;
  sesiShootingId: string;
  uploader: string;
  tanggal: string;
}

export type StatusKoneksiDrive =
  | 'connected'
  | 'degraded'
  | 'not-configured'
  | 'disconnected';

export interface StatusKesehatanDrive {
  status: StatusKoneksiDrive;
  terkonfigurasi: boolean;
  pesan: string;
  namaFolderInduk: string;
  tautanFolderTerkontrol: string;
  batasUploadBytes: number;
  mendukungUploadVideoBesar: boolean;
  lastCheckedAt: string;
  requestId: string;
}

export interface EntriAuditDrive {
  id: string;
  requestId: string;
  waktu: string;
  aktor: string;
  peran: PeranPengguna;
  aksi: string;
  target: string;
  status: 'sukses' | 'ditolak' | 'gagal';
  ringkasan: string;
}

export interface StatusBootstrapSesi {
  terkonfigurasiEnv: boolean;
  perluBootstrapAdmin: boolean;
  oidcTerkonfigurasi?: boolean;
  googleClientId?: string;
  domainDiizinkan?: string[];
  daftarPeranTersedia: { nilai: PeranPengguna; label: string; ringkasanAkses: string }[];
}
