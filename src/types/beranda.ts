import type { StatusData } from './status';

export interface RingkasanOutcome {
  id: string;
  judul: string;
  definisi: string;
  buktiKeberhasilan: string;
}

export interface FaseKampanye {
  id: string;
  nama: string;
  rentangTanggal: string;
  fokus: string;
  status: StatusData;
}

export interface CatatanStatusKonten {
  id: string;
  jenis: 'video' | 'desain';
  status: 'planned' | 'in-progress' | 'approved' | 'published';
}

export interface SkenarioAnggaranRingkas {
  id: 'hemat' | 'menengah' | 'agresif';
  nama: string;
  rekomendasi: boolean;
  produksiIdr: number;
  adsSetupIdr: number;
  metaIdr: number;
  tiktokIdr: number;
  tiktokPerkiraan: boolean;
  totalIdr: number;
  totalPerkiraan: boolean;
  catatan: string;
}

export interface JadwalIklanRingkas {
  id: string;
  platform: 'Meta Ads' | 'TikTok Ads';
  namaFlight: string;
  rentangTanggal: string;
  cakupanSkenario: string;
  catatan: string;
  status: StatusData;
}

export interface AksiKritisItem {
  id: string;
  tenggat: string;
  judul: string;
  penanggungJawab: string;
  kritis: boolean;
  status: StatusData;
}

export interface RisikoKeputusanItem {
  id: string;
  judul: string;
  dampak: string;
  mitigasi: string;
}

export interface RingkasanKpiKelompok {
  id: string;
  kategori: string;
  indikatorUtama: string;
  nilaiAktual: string | null;
  status: StatusData;
}
