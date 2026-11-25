import type { PilarKonten } from './kalender';

export type GrupKpi =
  | 'awareness'
  | 'interest'
  | 'trust'
  | 'relationship'
  | 'brand-readiness';

export type PlatformKpi =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'meta-ads'
  | 'tiktok-ads'
  | 'direct-outreach'
  | 'analytics';

export type SatuanMetrikKpi = 'angka' | 'persen' | 'detik' | 'idr' | 'rasio';

export type ModeAgregasiKpi = 'jumlah' | 'rata-rata';

export interface DefinisiMetrikKpi {
  kode: string;
  nama: string;
  grup: GrupKpi;
  satuan: SatuanMetrikKpi;
  agregasi: ModeAgregasiKpi;
  keterangan: string;
}

export interface SnapshotKpiAktual {
  id: string;
  grup: GrupKpi;
  kodeMetrik: string;
  platform: PlatformKpi;
  periode: string; // YYYY-MM-DD (tanggal periode atau tanggal akhir periode)
  periodePembanding?: string;
  kampanyeAtauKonten: string;
  pilar?: PilarKonten;
  nilai: number;
  source: string;
  reportedAt: string; // YYYY-MM-DD atau ISO
  importedAt: string; // ISO
  pic: string;
  notes: string;
  dataContoh?: boolean;
}

export interface Baseline72Jam {
  medianReachOrganikPerPost: number | null;
  averageWatchTimeDetik: number | null;
  profileVisitsPer1000Reach: number | null;
  saveShareRatePersen: number | null;
  cpmAktualIdr: number | null;
  costPerThruPlayIdr: number | null;
  source: string;
  reportedAt: string;
  dicatatOleh: string;
  diperbaruiPada: string;
  catatan: string;
}

export interface InquiryKualifikasi {
  id: string;
  tanggal: string; // YYYY-MM-DD
  pengirimOrganisasi: string;
  kanal: 'dm-instagram' | 'dm-tiktok' | 'facebook' | 'email' | 'whatsapp' | 'media-inbound';
  kategoriStakeholder: string;
  ringkasanPesan: string;
  terkualifikasi: boolean;
  alasanKualifikasi: string;
  dinilaiOleh: string;
  dinilaiPada: string;
}

export interface FilterKpiMonitoring {
  tanggalMulai: string;
  tanggalSelesai: string;
  platform: PlatformKpi | 'semua';
  pilar: PilarKonten | 'semua';
  kampanyeAtauKonten: string;
  source: string;
}

export interface PemetaanKolomCsvKpi {
  metrik: string;
  platform: string;
  periode: string;
  nilai: string;
  source: string;
  reportedAt: string;
  kampanyeAtauKonten: string;
  pilar: string;
  pic: string;
  notes: string;
}

export interface BarisValidCsvKpi {
  nomorBaris: number;
  grup: GrupKpi;
  kodeMetrik: string;
  namaMetrik: string;
  platform: PlatformKpi;
  periode: string;
  nilai: number;
  source: string;
  reportedAt: string;
  kampanyeAtauKonten: string;
  pilar?: PilarKonten;
  pic: string;
  notes: string;
  duplikatDengan: 'existing' | 'csv' | null;
}

export interface HasilPratinjauCsvKpi {
  headerCsv: string[];
  barisValid: BarisValidCsvKpi[];
  galatBaris: string[];
  jumlahDuplikat: number;
}

export interface StatusKesegaranData {
  memilikiData: boolean;
  tanggalLaporanTerakhir: string | null;
  sumberTerakhir: string | null;
  diperbaruiTerakhir: string | null;
  jamSejakLaporan: number | null;
  usang: boolean;
  pesan: string;
}

export interface HasilKalkulatorKpi {
  reachEstimasi: number | null;
  targetProfileVisits: number | null;
  targetQualifiedInquiries: number | null;
  catatanValidasi: string | null;
}

export interface StateKpiMonitoring {
  daftarSnapshot: SnapshotKpiAktual[];
  baseline72Jam: Baseline72Jam | null;
  daftarInquiry: InquiryKualifikasi[];
}
