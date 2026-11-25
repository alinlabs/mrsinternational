import type { EntriAuditDrive } from './aset';
import type { IdSkenarioAnggaran } from './iklan';
import type { PeranPengguna } from './status';

export type StatusAkunTim = 'aktif' | 'menunggu-persetujuan' | 'dinonaktifkan';

export interface AnggotaTimAkses {
  id: string;
  email: string;
  namaTampilan: string;
  peran: PeranPengguna;
  statusAkun: StatusAkunTim;
  sumberPendaftaran: 'allowlist' | 'oidc-request' | 'admin-invite';
  disetujuiOleh: string;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface PengaturanEventSistem {
  namaEvent: string;
  tanggalEvent: string;
  zonaWaktu: string;
  kotaWilayahPublik: string;
  labelAksesPublik: 'Kuota Terbatas';
  lokasiPrivat: string;
  catatanKeamananPublik: string;
  diperbaruiOleh: string;
  diperbaruiPada: string;
}

export interface HandleSosialPengaturan {
  id: string;
  platform: 'Instagram' | 'Facebook' | 'TikTok';
  handle: string;
  urlProfil: string;
  statusKonfirmasi: 'contoh-belum-dikonfirmasi' | 'terkonfirmasi-owner';
  catatan: string;
}

export interface KontakResmiPengaturan {
  emailPress: string;
  whatsappKemitraan: string;
  emailBisnis: string;
  statusKonfirmasi: 'belum-diisi' | 'terkonfirmasi-owner';
  diperbaruiOleh: string;
  diperbaruiPada: string;
}

export interface PengaturanAnggaranSistem {
  skenarioTarget: IdSkenarioAnggaran;
  plafonDisetujuiIdr: number | null;
  disetujuiOleh: string;
  tanggalDisetujui: string;
  catatanPersetujuan: string;
}

export interface PengaturanIntegrasiPublik {
  appsScriptWebAppUrl: string;
  appsScriptWebAppTerkonfigurasiServer: boolean;
  sharedSecretTerkonfigurasi: boolean;
  googleDriveFolderUrl: string;
  googleClientId: string;
  domainAllowlist: string[];
  emailAllowlistTerkonfigurasi: number;
  batasProxyUploadBytes: number;
}

export interface DataPengaturanTerotorisasi {
  event: PengaturanEventSistem;
  handleSosial: HandleSosialPengaturan[];
  kontakResmi: KontakResmiPengaturan;
  anggaran: PengaturanAnggaranSistem;
  integrasi: PengaturanIntegrasiPublik;
  daftarTim: AnggotaTimAkses[];
  aksesTerbatasPenuh: boolean;
}

export interface EntriAuditTerstruktur extends EntriAuditDrive {
  entitas?: string;
  recordId?: string;
  ringkasanSebelum?: string;
  ringkasanSesudah?: string;
}

export interface ItemMatriksIzinPeran {
  id: string;
  sumberDaya: string;
  deskripsi: string;
  izinPerPeran: Record<PeranPengguna, string>;
}
