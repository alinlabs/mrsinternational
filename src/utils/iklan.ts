import {
  DETAIL_SKENARIO_ANGGARAN_KANONIK,
  KURS_PLANNING_USD_IDR_KANONIK,
} from '../data/iklan-kanonik';
import type {
  DetailSkenarioAnggaran,
  EntriBelanjaAktual,
  FlightKampanyeIklan,
  IdSkenarioAnggaran,
  PersetujuanAnggaran,
  RingkasanPengendalianAnggaran,
  StateIklanAnggaran,
  StatusFlightIklan,
} from '../types/iklan';

export function dapatkanDetailSkenario(
  id: IdSkenarioAnggaran,
): DetailSkenarioAnggaran {
  return (
    DETAIL_SKENARIO_ANGGARAN_KANONIK.find((item) => item.id === id) ??
    DETAIL_SKENARIO_ANGGARAN_KANONIK[1]
  );
}

export function hitungHariFlight(
  tanggalMulai: string,
  tanggalSelesai: string,
): number {
  const mulai = new Date(`${tanggalMulai}T00:00:00Z`).getTime();
  const selesai = new Date(`${tanggalSelesai}T00:00:00Z`).getTime();
  if (Number.isNaN(mulai) || Number.isNaN(selesai) || selesai < mulai) {
    return 0;
  }
  const selisihHari = Math.round((selesai - mulai) / (24 * 60 * 60 * 1000));
  return selisihHari + 1;
}

export function hitungEstimasiBiayaFlightIdr(
  flight: FlightKampanyeIklan,
  kursUsdIdr: number = KURS_PLANNING_USD_IDR_KANONIK,
): number {
  if (flight.isOrganikSaja || flight.anggaranHarian <= 0 || flight.jumlahAdGroup <= 0) {
    return 0;
  }
  const hari = hitungHariFlight(flight.tanggalMulai, flight.tanggalSelesai);
  if (hari <= 0) return 0;

  const totalMataUang = flight.anggaranHarian * hari * flight.jumlahAdGroup;
  if (flight.mataUang === 'USD') {
    return Math.round(totalMataUang * kursUsdIdr);
  }
  return Math.round(totalMataUang);
}

export function hitungRingkasanPengendalianAnggaran(
  state: StateIklanAnggaran,
): RingkasanPengendalianAnggaran {
  const skenario = dapatkanDetailSkenario(state.skenarioAktif);
  const estimasiProduksiIdr = skenario.totalProduksiIdr;
  const estimasiAdsSetupIdr = skenario.adsSetupIdr;

  const estimasiMetaIdr = state.daftarFlight
    .filter((f) => f.platform === 'meta')
    .reduce(
      (acc, f) => acc + hitungEstimasiBiayaFlightIdr(f, state.kursPlanningUsdIdr),
      0,
    );

  const estimasiTiktokIdr = state.daftarFlight
    .filter((f) => f.platform === 'tiktok')
    .reduce(
      (acc, f) => acc + hitungEstimasiBiayaFlightIdr(f, state.kursPlanningUsdIdr),
      0,
    );

  const estimasiMediaIdr = estimasiAdsSetupIdr + estimasiMetaIdr + estimasiTiktokIdr;
  const estimasiGrandTotalIdr = estimasiProduksiIdr + estimasiMediaIdr;
  const estimasiPerkiraan = state.daftarFlight.some(
    (f) => !f.isOrganikSaja && f.mataUang === 'USD' && f.anggaranHarian > 0,
  );

  const plafonDisetujuiIdr = state.persetujuanAktif
    ? state.persetujuanAktif.plafonDisetujuiIdr
    : null;

  const adaAktual = state.daftarBelanjaAktual.length > 0;
  const aktualMetaIdr = state.daftarBelanjaAktual
    .filter((a) => a.kategoriPos === 'meta-ads')
    .reduce((acc, a) => acc + a.nominalAktualIdr, 0);
  const aktualTiktokIdr = state.daftarBelanjaAktual
    .filter((a) => a.kategoriPos === 'tiktok-ads')
    .reduce((acc, a) => acc + a.nominalAktualIdr, 0);
  const aktualProduksiIdr = state.daftarBelanjaAktual
    .filter((a) => a.kategoriPos === 'produksi')
    .reduce((acc, a) => acc + a.nominalAktualIdr, 0);

  const totalAktualIdr = adaAktual
    ? aktualMetaIdr + aktualTiktokIdr + aktualProduksiIdr
    : null;

  const selisihTerhadapPlafonIdr =
    plafonDisetujuiIdr !== null
      ? estimasiGrandTotalIdr - plafonDisetujuiIdr
      : null;

  const melebihiPlafon =
    plafonDisetujuiIdr !== null &&
    (estimasiGrandTotalIdr > plafonDisetujuiIdr ||
      (totalAktualIdr !== null && totalAktualIdr > plafonDisetujuiIdr));

  const persentaseSerapanPlafon =
    plafonDisetujuiIdr !== null && plafonDisetujuiIdr > 0 && totalAktualIdr !== null
      ? Math.round((totalAktualIdr / plafonDisetujuiIdr) * 100)
      : null;

  // Varians HANYA dihitung bila data actual spend benar-benar ada
  const variansTerhadapEstimasiIdr =
    totalAktualIdr !== null ? totalAktualIdr - estimasiGrandTotalIdr : null;

  const persentaseVarians =
    variansTerhadapEstimasiIdr !== null && estimasiGrandTotalIdr > 0
      ? Number(((variansTerhadapEstimasiIdr / estimasiGrandTotalIdr) * 100).toFixed(1))
      : null;

  return {
    skenarioAktif: state.skenarioAktif,
    estimasiProduksiIdr,
    estimasiAdsSetupIdr,
    estimasiMetaIdr,
    estimasiTiktokIdr,
    estimasiMediaIdr,
    estimasiGrandTotalIdr,
    estimasiPerkiraan,
    plafonDisetujuiIdr,
    totalAktualIdr,
    aktualMetaIdr,
    aktualTiktokIdr,
    aktualProduksiIdr,
    selisihTerhadapPlafonIdr,
    melebihiPlafon,
    persentaseSerapanPlafon,
    variansTerhadapEstimasiIdr,
    persentaseVarians,
  };
}

export function dapatkanInfoStatusFlight(status: StatusFlightIklan): {
  label: string;
  nada: 'netral' | 'emas' | 'maroon' | 'hijau' | 'peringatan';
} {
  switch (status) {
    case 'planned':
      return { label: 'Rencana', nada: 'netral' };
    case 'approved':
      return { label: 'Disetujui', nada: 'emas' };
    case 'active':
      return { label: 'Sedang Tayang', nada: 'hijau' };
    case 'paused':
      return { label: 'Dijeda', nada: 'peringatan' };
    case 'completed':
      return { label: 'Selesai', nada: 'maroon' };
  }
}

export interface InputValidasiFlight {
  namaCampaign: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  anggaranHarian: number;
  jumlahAdGroup: number;
  objective: string;
  isOrganikSaja?: boolean;
}

export function validasiFormFlight(
  input: InputValidasiFlight,
): { valid: boolean; pesanGalat: string } {
  if (!input.namaCampaign.trim()) {
    return { valid: false, pesanGalat: 'Nama campaign wajib diisi.' };
  }
  if (!input.tanggalMulai || !input.tanggalSelesai) {
    return {
      valid: false,
      pesanGalat: 'Tanggal mulai dan selesai flight wajib diisi.',
    };
  }
  if (hitungHariFlight(input.tanggalMulai, input.tanggalSelesai) <= 0) {
    return {
      valid: false,
      pesanGalat: 'Tanggal selesai harus sama dengan atau setelah tanggal mulai.',
    };
  }
  if (!input.isOrganikSaja && input.anggaranHarian < 0) {
    return {
      valid: false,
      pesanGalat: 'Anggaran harian tidak boleh negatif.',
    };
  }
  if (!input.isOrganikSaja && input.jumlahAdGroup < 1) {
    return {
      valid: false,
      pesanGalat: 'Jumlah ad set / ad group minimal 1 untuk flight berbayar.',
    };
  }
  if (!input.objective.trim()) {
    return { valid: false, pesanGalat: 'Objective kampanye wajib diisi.' };
  }
  return { valid: true, pesanGalat: '' };
}

export function validasiPersetujuanAnggaran(input: {
  disetujuiOleh: string;
  plafonDisetujuiIdr: number;
}): { valid: boolean; pesanGalat: string } {
  if (!input.disetujuiOleh.trim()) {
    return {
      valid: false,
      pesanGalat: 'Nama penyetuju (Owner / Approver) wajib diisi.',
    };
  }
  if (!Number.isFinite(input.plafonDisetujuiIdr) || input.plafonDisetujuiIdr <= 0) {
    return {
      valid: false,
      pesanGalat: 'Plafon anggaran disetujui harus lebih besar dari Rp0.',
    };
  }
  return { valid: true, pesanGalat: '' };
}

export function validasiBelanjaAktual(input: {
  tanggalLaporan: string;
  sumberLaporan: string;
  nominalAktualIdr: number;
}): { valid: boolean; pesanGalat: string } {
  if (!input.tanggalLaporan.trim()) {
    return {
      valid: false,
      pesanGalat: 'Tanggal laporan wajib diisi untuk mencatat belanja aktual.',
    };
  }
  if (!input.sumberLaporan.trim()) {
    return {
      valid: false,
      pesanGalat:
        'Sumber laporan wajib diisi (mis. Meta Ads Manager CSV atau kuitansi produksi).',
    };
  }
  if (!Number.isFinite(input.nominalAktualIdr) || input.nominalAktualIdr <= 0) {
    return {
      valid: false,
      pesanGalat: 'Nominal belanja aktual harus lebih dari Rp0.',
    };
  }
  return { valid: true, pesanGalat: '' };
}

export function uraiCsvBelanjaAktual(
  teksCsv: string,
  dicatatOleh: string,
): { entri: EntriBelanjaAktual[]; galat: string } {
  const barisList = teksCsv
    .split(/\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (barisList.length === 0) {
    return { entri: [], galat: 'Teks CSV kosong. Tempel minimal satu baris data.' };
  }

  const hasil: EntriBelanjaAktual[] = [];
  for (let i = 0; i < barisList.length; i++) {
    const baris = barisList[i];
    const kolom = baris.split(',').map((k) => k.trim());
    // Lewati baris header jika terdeteksi
    if (
      i === 0 &&
      (kolom[0].toLowerCase().includes('tanggal') ||
        kolom[0].toLowerCase().includes('date'))
    ) {
      continue;
    }

    if (kolom.length < 4) {
      return {
        entri: [],
        galat: `Baris ke-${i + 1} tidak lengkap. Format wajib: tanggal(YYYY-MM-DD),kategori(meta-ads|tiktok-ads|produksi),nominal_idr,sumber_laporan,catatan`,
      };
    }

    const [tanggalLaporan, kategoriMentah, nominalMentah, sumberLaporan, ...sisa] =
      kolom;
    const kategoriPos =
      kategoriMentah === 'meta-ads' ||
      kategoriMentah === 'tiktok-ads' ||
      kategoriMentah === 'produksi'
        ? kategoriMentah
        : null;

    if (!kategoriPos) {
      return {
        entri: [],
        galat: `Baris ke-${i + 1}: kategori harus meta-ads, tiktok-ads, atau produksi.`,
      };
    }

    const nominalAktualIdr = Number(nominalMentah.replace(/[^0-9.-]/g, ''));
    const cek = validasiBelanjaAktual({
      tanggalLaporan,
      sumberLaporan,
      nominalAktualIdr,
    });
    if (!cek.valid) {
      return {
        entri: [],
        galat: `Baris ke-${i + 1}: ${cek.pesanGalat}`,
      };
    }

    hasil.push({
      id: `act-csv-${Date.now()}-${i}`,
      tanggalLaporan,
      kategoriPos,
      sumberLaporan,
      nominalAktualIdr: Math.round(nominalAktualIdr),
      catatan: sisa.join(', ').trim(),
      dicatatOleh: dicatatOleh.trim() || 'Digital Manager',
      dicatatPada: new Date().toISOString(),
    });
  }

  if (hasil.length === 0) {
    return {
      entri: [],
      galat: 'Tidak ada baris data valid di bawah header CSV.',
    };
  }

  return { entri: hasil, galat: '' };
}
