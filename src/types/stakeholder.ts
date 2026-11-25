export type KategoriStakeholder =
  | 'commercial'
  | 'influence'
  | 'institution'
  | 'cultural-ecosystem'
  | 'public-awareness';

export type PrioritasStakeholder = 'A' | 'B' | 'C';

export type StatusPipelineOutreach =
  | 'identified'
  | 'qualified'
  | 'contacted'
  | 'replied'
  | 'meeting-requested'
  | 'ongoing'
  | 'closed-lost';

export type ChannelOutreach =
  | 'email'
  | 'whatsapp'
  | 'instagram-dm'
  | 'telepon'
  | 'pertemuan'
  | 'lainnya';

export interface KomponenSkorStakeholder {
  relevansi: number; // 1..5 (bobot 7 = maks 35)
  influence: number; // 1..5 (bobot 7 = maks 35)
  peluangNyata: number; // 1..5 (bobot 4 = maks 20)
  kedekatanHubungan: number; // 1..5 (bobot 2 = maks 10)
}

export interface SkorRelasiStakeholder extends KomponenSkorStakeholder {
  totalSkor: number; // 20..100
  penjelasanSkor: string;
}

export interface LogOutreachStakeholder {
  id: string;
  tanggal: string; // YYYY-MM-DD
  channel: ChannelOutreach;
  pic: string;
  ringkasan: string;
  respon: string;
  nextStep: string;
  dicatatPada: string;
}

export interface RecordStakeholder {
  id: string;
  namaLengkap: string;
  jabatanOrganisasi: string;
  kategori: KategoriStakeholder;
  prioritas: PrioritasStakeholder;
  relevansi: string;
  relationshipOwner: string;
  sumberKontak: string;
  channelUtama: ChannelOutreach;
  contactValue: string;
  konteksRelasi: string;
  consentToPublish: boolean;
  statusPipeline: StatusPipelineOutreach;
  lastOutreachAt: string;
  responTerakhir: string;
  nextAction: string;
  dueDate: string;
  catatanPrivat: string;
  kontakTersensor: boolean;
  skor: SkorRelasiStakeholder;
  logOutreach: LogOutreachStakeholder[];
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface InputStakeholderBaru {
  namaLengkap: string;
  jabatanOrganisasi: string;
  kategori: KategoriStakeholder;
  prioritas: PrioritasStakeholder;
  relevansi: string;
  relationshipOwner: string;
  sumberKontak: string;
  channelUtama: ChannelOutreach;
  contactValue: string;
  konteksRelasi: string;
  consentToPublish: boolean;
  statusPipeline: StatusPipelineOutreach;
  lastOutreachAt?: string;
  responTerakhir?: string;
  nextAction: string;
  dueDate: string;
  catatanPrivat: string;
  komponenSkor: KomponenSkorStakeholder;
}

export interface RingkasanDashboardStakeholder {
  total: number;
  prioritasA: number;
  contacted: number;
  replied: number;
  meetingRequested: number;
  overdue: number;
}

export type UrutanStakeholder =
  | 'skor-tertinggi'
  | 'prioritas-a-ke-c'
  | 'tenggat-terdekat'
  | 'nama-az';

export interface FilterStakeholder {
  kataKunci: string;
  kategori: KategoriStakeholder | 'semua';
  prioritas: PrioritasStakeholder | 'semua';
  statusPipeline: StatusPipelineOutreach | 'semua';
  urutan: UrutanStakeholder;
}
