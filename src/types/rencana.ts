import type { StatusData } from './status';

export interface LevelFunnelStrategi {
  id: string;
  level: 'Attention' | 'Interest' | 'Trust' | 'Relationship' | 'Launch readiness';
  tujuanKomunikasi: string;
  aksiDiharapkan: string;
}

export interface SegmenStakeholderStrategi {
  id: string;
  prioritas: 'A' | 'B' | 'C';
  labelPrioritas: string;
  segmen: string;
  kepentinganPesan: string;
  jalurPendekatan: string;
}

export interface PesanIntiStrategi {
  id: string;
  judul: string;
  rumusan: string;
  buktiWajib: string;
}

export interface PilarKontenStrategi {
  id: 'founder' | 'designer' | 'heritage' | 'product' | 'event';
  nama: string;
  proporsiPersen: number;
  contohMateri: string;
  peranStrategis: string;
}

export interface DataKonfirmasiV11 {
  id: string;
  dataBelumAda: string;
  alasanPenting: string;
  pemilikData: string;
  status: StatusData;
}
