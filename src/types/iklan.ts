export type IdSkenarioAnggaran = 'hemat' | 'menengah' | 'agresif';

export type PlatformIklan = 'meta' | 'tiktok';

export type MataUangIklan = 'IDR' | 'USD';

export type StatusFlightIklan =
  | 'planned'
  | 'approved'
  | 'active'
  | 'paused'
  | 'completed';

export interface ItemBiayaProduksi {
  id: string;
  komponen: string;
  keterangan: string;
  hematIdr: number;
  menengahIdr: number;
  agresifIdr: number;
  hargaCoretHematIdr?: number;
  hargaCoretMenengahIdr?: number;
  hargaCoretAgresifIdr?: number;
}

export interface DetailSkenarioAnggaran {
  id: IdSkenarioAnggaran;
  nama: string;
  rekomendasi: boolean;
  ringkasanMedia: string;
  subtotalProduksiIdr: number;
  contingency10PersenIdr: number;
  totalProduksiIdr: number;
  adsSetupIdr: number;
  metaIdr: number;
  tiktokIdr: number;
  tiktokPerkiraan: boolean;
  totalMediaIdr: number;
  grandTotalIdr: number;
  grandTotalPerkiraan: boolean;
  asumsiKursNote: string;
}

export interface FlightKampanyeIklan {
  id: string;
  kodeFlight: string;
  namaCampaign: string;
  platform: PlatformIklan;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  anggaranHarian: number; // dalam currency terkait
  mataUang: MataUangIklan;
  jumlahAdGroup: number;
  cakupanSkenario: IdSkenarioAnggaran[];
  status: StatusFlightIklan;
  objective: string;
  targetAudiens: string;
  daftarKreatif: string[];
  catatanBilling: string;
  isOrganikSaja?: boolean;
}

export interface BarisCreativeMatrix {
  id: string;
  namaKreatif: string;
  durasi: string;
  format: string;
  pilar: 'hero' | 'founder' | 'designer' | 'product';
  platformUtama: string;
  hookUtama: string;
  isiCerita: string;
  ctaAman: string;
  kpiFokus: string;
  catatanKesiapan: string;
}

export interface PersetujuanAnggaran {
  id: string;
  skenarioDisetujui: IdSkenarioAnggaran;
  disetujuiOleh: string;
  peranApprover: string;
  plafonDisetujuiIdr: number;
  disetujuiPada: string; // ISO timestamp
  catatan: string;
}

export interface EntriBelanjaAktual {
  id: string;
  tanggalLaporan: string; // YYYY-MM-DD
  kategoriPos: 'meta-ads' | 'tiktok-ads' | 'produksi';
  idFlightTerkait?: string;
  sumberLaporan: string;
  nominalAktualIdr: number;
  catatan: string;
  dicatatOleh: string;
  dicatatPada: string; // ISO timestamp
}

export interface RingkasanPengendalianAnggaran {
  skenarioAktif: IdSkenarioAnggaran;
  estimasiProduksiIdr: number;
  estimasiAdsSetupIdr: number;
  estimasiMetaIdr: number;
  estimasiTiktokIdr: number;
  estimasiMediaIdr: number;
  estimasiGrandTotalIdr: number;
  estimasiPerkiraan: boolean;
  plafonDisetujuiIdr: number | null;
  totalAktualIdr: number | null;
  aktualMetaIdr: number;
  aktualTiktokIdr: number;
  aktualProduksiIdr: number;
  selisihTerhadapPlafonIdr: number | null;
  melebihiPlafon: boolean;
  persentaseSerapanPlafon: number | null;
  variansTerhadapEstimasiIdr: number | null;
  persentaseVarians: number | null;
}

export interface StateIklanAnggaran {
  skenarioAktif: IdSkenarioAnggaran;
  kursPlanningUsdIdr: number;
  daftarFlight: FlightKampanyeIklan[];
  creativeMatrix: BarisCreativeMatrix[];
  persetujuanAktif: PersetujuanAnggaran | null;
  riwayatPersetujuan: PersetujuanAnggaran[];
  daftarBelanjaAktual: EntriBelanjaAktual[];
}
