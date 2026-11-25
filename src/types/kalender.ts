export type StatusKontenOperasional =
  | 'planned'
  | 'briefed'
  | 'shooting'
  | 'editing'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'blocked'
  | 'cancelled';

export type PilarKonten = 'founder' | 'designer' | 'heritage' | 'product' | 'event';

export type KanalDistribusi = 'instagram' | 'facebook' | 'tiktok';

export type SlotKonten = 'video-a' | 'video-b' | 'design';

export type TujuanFunnelKonten =
  | 'Attention'
  | 'Interest'
  | 'Trust'
  | 'Relationship'
  | 'Launch readiness';

export interface DistribusiKanalKonten {
  kanal: KanalDistribusi;
  format: string;
  waktuUsulan: string;
}

export type StatusPersetujuanKonten =
  | 'belum-diajukan'
  | 'menunggu-review'
  | 'disetujui'
  | 'perlu-revisi';

export interface CatatanPersetujuanKonten {
  status: StatusPersetujuanKonten;
  disetujuiOleh: string;
  tanggalDisetujui: string;
  catatan: string;
}

export interface KonsepKonten {
  id: string;
  hariKe: number;
  tanggal: string; // YYYY-MM-DD
  labelTanggal: string; // e.g. '26 Nov'
  fase: string;
  slot: SlotKonten;
  jenisMaster: 'video' | 'desain';
  judul: string;
  hook: string;
  ringkasan: string;
  pilar: PilarKonten;
  tujuan: TujuanFunnelKonten;
  distribusiKanal: DistribusiKanalKonten[];
  waktuUsulanUtama: string;
  materiBukti: string;
  drafCaption: string;
  cta: string;
  status: StatusKontenOperasional;
  pic: string;
  catatan: string;
  persetujuan: CatatanPersetujuanKonten;
  asetTertaut: string;
  urlTerbit: string;
  tanggalTerbitAktual: string;
  adalahRencanaAwal: true;
}

export interface TambahanEditKonten {
  hook?: string;
  ringkasan?: string;
  materiBukti?: string;
  drafCaption?: string;
  cta?: string;
  status?: StatusKontenOperasional;
  pic?: string;
  catatan?: string;
  persetujuan?: CatatanPersetujuanKonten;
  asetTertaut?: string;
  urlTerbit?: string;
  tanggalTerbitAktual?: string;
  diperbaruiPada?: string;
}

export interface FilterKalenderKonten {
  kataKunci: string;
  tanggal: string;
  pilar: PilarKonten | 'semua';
  kanal: KanalDistribusi | 'semua';
  status: StatusKontenOperasional | 'semua';
  pic: string;
}

export interface BundelHariKalender {
  hariKe: number;
  tanggal: string;
  labelTanggal: string;
  fase: string;
  videoA: KonsepKonten | null;
  videoB: KonsepKonten | null;
  design: KonsepKonten | null;
  daftarItem: KonsepKonten[];
}
