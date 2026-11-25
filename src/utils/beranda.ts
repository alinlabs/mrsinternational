import type { CatatanStatusKonten } from '../types/beranda';
import { formatRupiah } from './format';

export interface RingkasanProgresKonten {
  totalRencana: number;
  totalVideoRencana: number;
  totalDesainRencana: number;
  selesai: number;
  dalamProses: number;
  belumDimulai: number;
  persentaseSelesai: number;
}

export function hitungProgresKonten(
  daftarKonten: CatatanStatusKonten[],
): RingkasanProgresKonten {
  const totalRencana = daftarKonten.length;
  const totalVideoRencana = daftarKonten.filter((item) => item.jenis === 'video').length;
  const totalDesainRencana = daftarKonten.filter((item) => item.jenis === 'desain').length;

  const selesai = daftarKonten.filter(
    (item) => item.status === 'published' || item.status === 'approved',
  ).length;
  const dalamProses = daftarKonten.filter(
    (item) => item.status === 'in-progress',
  ).length;
  const belumDimulai = daftarKonten.filter(
    (item) => item.status === 'planned',
  ).length;

  const persentaseSelesai =
    totalRencana > 0 ? Math.round((selesai / totalRencana) * 100) : 0;

  return {
    totalRencana,
    totalVideoRencana,
    totalDesainRencana,
    selesai,
    dalamProses,
    belumDimulai,
    persentaseSelesai,
  };
}

export function formatEstimasiRupiah(
  nominal: number,
  perkiraan: boolean = false,
): string {
  const teks = formatRupiah(nominal);
  return perkiraan ? `±${teks}` : teks;
}
