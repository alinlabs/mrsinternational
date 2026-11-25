import type { AsetDrive } from './aset';
import type { StateIklanAnggaran } from './iklan';
import type { KonsepKonten } from './kalender';
import type { StateKpiMonitoring } from './kpi';
import type { StatusStateProduksi } from './produksi';
import type { RecordStakeholder } from './stakeholder';
import type { SesiPengguna, StatusData } from './status';

export type JenisLaporanId =
  | 'executive-brief'
  | 'content-calendar'
  | 'production-approval'
  | 'ad-flight-budget'
  | 'stakeholder-pipeline'
  | 'kpi-monitoring'
  | 'post-event-recap';

export type OrientasiLaporan = 'portrait' | 'landscape';

export type LabelIntegritasLaporan =
  | 'Rencana'
  | 'Estimasi'
  | 'Disetujui'
  | 'Aktual'
  | 'Belum diisi'
  | 'Data contoh';

export interface DefinisiJenisLaporan {
  id: JenisLaporanId;
  judul: string;
  kodeNamaFile: string;
  ringkasan: string;
  orientasiDefault: OrientasiLaporan;
  mendukungFilterTanggal: boolean;
  mendukungFilterPlatform: boolean;
  mendukungFilterStatus: boolean;
  mendukungFilterKategori: boolean;
  memuatPotensiPii: boolean;
}

export interface KonfigurasiLaporan {
  jenis: JenisLaporanId;
  tanggalMulai: string;
  tanggalSelesai: string;
  platform: string;
  statusFilter: string;
  kategoriFilter: string;
  orientasi: OrientasiLaporan;
  sertakanCatatanInternal: boolean;
  sertakanKontakPribadiStakeholder: boolean;
}

export interface RingkasanMetrikLaporan {
  label: string;
  nilai: string;
  labelStatus: LabelIntegritasLaporan;
  statusData: StatusData;
}

export interface BagianTabelLaporan {
  id: string;
  judul: string;
  deskripsi?: string;
  labelStatus: LabelIntegritasLaporan;
  kolom: string[];
  baris: string[][];
  kolomRataKanan?: number[];
}

export interface DokumenLaporanTerbangun {
  jenis: JenisLaporanId;
  judul: string;
  subjudul: string;
  orientasi: OrientasiLaporan;
  dibuatPadaIso: string;
  dibuatPadaLabelWib: string;
  dibuatOleh: string;
  namaFile: string;
  parameterAktif: string[];
  catatanIntegritas: string[];
  ringkasanMetrik: RingkasanMetrikLaporan[];
  bagian: BagianTabelLaporan[];
  piiDisertakan: boolean;
  catatanInternalDisertakan: boolean;
  jumlahBarisData: number;
}

export interface SumberDataLaporan {
  konfigurasi: KonfigurasiLaporan;
  sesi: SesiPengguna;
  daftarKonten: KonsepKonten[];
  stateProduksi: StatusStateProduksi;
  stateIklan: StateIklanAnggaran;
  stateKpi: StateKpiMonitoring;
  modeContohKpi?: boolean;
  daftarStakeholder?: RecordStakeholder[];
  daftarAset?: AsetDrive[];
  waktuSekarang?: Date;
}
