import type { PeranPengguna, StatusData } from '../types/status';

const FORMAT_RUPIAH = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const FORMAT_ANGKA = new Intl.NumberFormat('id-ID');

const FORMAT_TANGGAL_WIB = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

export function formatRupiah(nominal: number | null | undefined): string {
  if (nominal === null || nominal === undefined || Number.isNaN(nominal)) {
    return 'Belum diisi';
  }
  return FORMAT_RUPIAH.format(nominal);
}

export function formatAngka(nilai: number | null | undefined): string {
  if (nilai === null || nilai === undefined || Number.isNaN(nilai)) {
    return 'Belum diisi';
  }
  return FORMAT_ANGKA.format(nilai);
}

export function formatTanggalWib(tanggalIso: string | Date | null | undefined): string {
  if (!tanggalIso) {
    return 'Belum diisi';
  }
  const objekTanggal = typeof tanggalIso === 'string' ? new Date(tanggalIso) : tanggalIso;
  if (Number.isNaN(objekTanggal.getTime())) {
    return 'Tanggal tidak valid';
  }
  return FORMAT_TANGGAL_WIB.format(objekTanggal);
}

export interface InfoStatusData {
  label: string;
  nada: 'netral' | 'emas' | 'maroon' | 'hijau' | 'peringatan';
}

const PETA_STATUS: Record<StatusData, InfoStatusData> = {
  planned: { label: 'Rencana', nada: 'netral' },
  estimated: { label: 'Estimasi', nada: 'emas' },
  approved: { label: 'Disetujui', nada: 'hijau' },
  actual: { label: 'Aktual', nada: 'maroon' },
  sample: { label: 'Data contoh', nada: 'peringatan' },
  'not-configured': { label: 'Belum dikonfigurasi', nada: 'netral' },
};

export function dapatkanLabelStatus(status: StatusData): InfoStatusData {
  return PETA_STATUS[status];
}

const PETA_PERAN: Record<PeranPengguna, string> = {
  owner: 'Owner',
  admin: 'Admin',
  'digital-manager': 'Digital Manager',
  editor: 'Editor',
  'stakeholder-pic': 'PIC Stakeholder',
  viewer: 'Viewer',
};

export function dapatkanLabelPeran(peran: PeranPengguna | null): string {
  if (!peran) {
    return 'Belum terautentikasi';
  }
  return PETA_PERAN[peran];
}
