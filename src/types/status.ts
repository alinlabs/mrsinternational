export type StatusData =
  | 'planned'
  | 'estimated'
  | 'approved'
  | 'actual'
  | 'sample'
  | 'not-configured';

export type PeranPengguna =
  | 'owner'
  | 'admin'
  | 'digital-manager'
  | 'editor'
  | 'stakeholder-pic'
  | 'viewer';

export interface SesiPengguna {
  terautentikasi: boolean;
  namaTampilan: string;
  email: string | null;
  peran: PeranPengguna | null;
  statusSesi: 'not-configured' | 'active';
}

export interface ItemNavigasi {
  id: string;
  jalur: string;
  judul: string;
  deskripsiSingkat: string;
  kelompok: 'ringkasan' | 'operasional' | 'analitik' | 'sistem';
  tahapImplementasi: string;
}
