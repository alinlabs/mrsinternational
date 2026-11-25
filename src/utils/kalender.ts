import type { CatatanStatusKonten } from '../types/beranda';
import type {
  BundelHariKalender,
  FilterKalenderKonten,
  KanalDistribusi,
  KonsepKonten,
  PilarKonten,
  SlotKonten,
  StatusKontenOperasional,
  TambahanEditKonten,
} from '../types/kalender';

export const FILTER_KALENDER_DEFAULT: FilterKalenderKonten = {
  kataKunci: '',
  tanggal: '',
  pilar: 'semua',
  kanal: 'semua',
  status: 'semua',
  pic: '',
};

const LABEL_PILAR: Record<PilarKonten, string> = {
  founder: 'Founder / Melfarina',
  designer: 'Designer / Raden',
  heritage: 'Heritage / Motif Ragi Hotang',
  product: 'Product / Collection',
  event: 'Event / Vision',
};

const LABEL_SLOT: Record<SlotKonten, string> = {
  'video-a': 'Video A (Story / Authority)',
  'video-b': 'Video B (Visual / Short-form)',
  design: 'Design / Carousel',
};

const LABEL_KANAL: Record<KanalDistribusi, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
};

export interface InfoStatusKonten {
  label: string;
  nada: 'netral' | 'emas' | 'maroon' | 'hijau' | 'peringatan' | 'bahaya';
}

const PETA_STATUS_KONTEN: Record<StatusKontenOperasional, InfoStatusKonten> = {
  planned: { label: 'Rencana', nada: 'netral' },
  briefed: { label: 'Brief Siap', nada: 'emas' },
  shooting: { label: 'Shooting', nada: 'emas' },
  editing: { label: 'Editing', nada: 'emas' },
  review: { label: 'Review', nada: 'peringatan' },
  approved: { label: 'Disetujui', nada: 'hijau' },
  scheduled: { label: 'Terjadwal', nada: 'hijau' },
  published: { label: 'Terbit', nada: 'maroon' },
  blocked: { label: 'Tertahan', nada: 'bahaya' },
  cancelled: { label: 'Dibatalkan', nada: 'netral' },
};

export function dapatkanLabelPilar(pilar: PilarKonten): string {
  return LABEL_PILAR[pilar];
}

export function dapatkanLabelSlot(slot: SlotKonten): string {
  return LABEL_SLOT[slot];
}

export function dapatkanLabelKanal(kanal: KanalDistribusi): string {
  return LABEL_KANAL[kanal];
}

export function dapatkanInfoStatusKonten(status: StatusKontenOperasional): InfoStatusKonten {
  return PETA_STATUS_KONTEN[status];
}

export function gabungkanKonsepDenganEdit(
  dasar: KonsepKonten[],
  petaEdit: Record<string, TambahanEditKonten>,
): KonsepKonten[] {
  return dasar.map((item) => {
    const edit = petaEdit[item.id];
    if (!edit) return item;
    return {
      ...item,
      hook: edit.hook ?? item.hook,
      ringkasan: edit.ringkasan ?? item.ringkasan,
      materiBukti: edit.materiBukti ?? item.materiBukti,
      drafCaption: edit.drafCaption ?? item.drafCaption,
      cta: edit.cta ?? item.cta,
      status: edit.status ?? item.status,
      pic: edit.pic ?? item.pic,
      catatan: edit.catatan ?? item.catatan,
      persetujuan: edit.persetujuan ?? item.persetujuan,
      asetTertaut: edit.asetTertaut ?? item.asetTertaut,
      urlTerbit: edit.urlTerbit ?? item.urlTerbit,
      tanggalTerbitAktual: edit.tanggalTerbitAktual ?? item.tanggalTerbitAktual,
    };
  });
}

export function filterKonsepKonten(
  daftar: KonsepKonten[],
  filter: FilterKalenderKonten,
): KonsepKonten[] {
  const kata = filter.kataKunci.trim().toLowerCase();
  const picFilter = filter.pic.trim().toLowerCase();

  return daftar.filter((item) => {
    if (filter.tanggal && item.tanggal !== filter.tanggal) return false;
    if (filter.pilar !== 'semua' && item.pilar !== filter.pilar) return false;
    if (filter.status !== 'semua' && item.status !== filter.status) return false;
    if (
      filter.kanal !== 'semua' &&
      !item.distribusiKanal.some((dist) => dist.kanal === filter.kanal)
    ) {
      return false;
    }
    if (picFilter && !item.pic.toLowerCase().includes(picFilter)) return false;
    if (kata) {
      const gabungan = [
        item.judul,
        item.hook,
        item.ringkasan,
        item.cta,
        item.catatan,
        item.pic,
        item.labelTanggal,
      ]
        .join(' ')
        .toLowerCase();
      if (!gabungan.includes(kata)) return false;
    }
    return true;
  });
}

export function kelompokkanPerHari(daftar: KonsepKonten[]): BundelHariKalender[] {
  const peta = new Map<string, BundelHariKalender>();

  for (const item of daftar) {
    let bundel = peta.get(item.tanggal);
    if (!bundel) {
      bundel = {
        hariKe: item.hariKe,
        tanggal: item.tanggal,
        labelTanggal: item.labelTanggal,
        fase: item.fase,
        videoA: null,
        videoB: null,
        design: null,
        daftarItem: [],
      };
      peta.set(item.tanggal, bundel);
    }

    bundel.daftarItem.push(item);
    if (item.slot === 'video-a') bundel.videoA = item;
    if (item.slot === 'video-b') bundel.videoB = item;
    if (item.slot === 'design') bundel.design = item;
  }

  return Array.from(peta.values()).sort((a, b) => a.hariKe - b.hariKe);
}

export interface StatistikKalenderKonten {
  jumlahTanggal: number;
  totalMaster: number;
  totalVideo: number;
  totalDesain: number;
  selesai: number;
  dalamProses: number;
  masihRencana: number;
  tertahan: number;
}

export function hitungStatistikKalender(daftar: KonsepKonten[]): StatistikKalenderKonten {
  const tanggalUnik = new Set(daftar.map((item) => item.tanggal));
  const totalVideo = daftar.filter((item) => item.jenisMaster === 'video').length;
  const totalDesain = daftar.filter((item) => item.jenisMaster === 'desain').length;

  let selesai = 0;
  let dalamProses = 0;
  let masihRencana = 0;
  let tertahan = 0;

  for (const item of daftar) {
    if (item.status === 'approved' || item.status === 'scheduled' || item.status === 'published') {
      selesai += 1;
    } else if (item.status === 'planned') {
      masihRencana += 1;
    } else if (item.status === 'blocked' || item.status === 'cancelled') {
      tertahan += 1;
    } else {
      dalamProses += 1;
    }
  }

  return {
    jumlahTanggal: tanggalUnik.size,
    totalMaster: daftar.length,
    totalVideo,
    totalDesain,
    selesai,
    dalamProses,
    masihRencana,
    tertahan,
  };
}

export function konversiKeCatatanStatusBeranda(
  daftar: KonsepKonten[],
): CatatanStatusKonten[] {
  return daftar.map((item) => {
    let status: CatatanStatusKonten['status'] = 'planned';
    if (item.status === 'published') {
      status = 'published';
    } else if (item.status === 'approved' || item.status === 'scheduled') {
      status = 'approved';
    } else if (
      item.status === 'briefed' ||
      item.status === 'shooting' ||
      item.status === 'editing' ||
      item.status === 'review'
    ) {
      status = 'in-progress';
    }
    return {
      id: item.id,
      jenis: item.jenisMaster,
      status,
    };
  });
}

export function validasiPerubahanKonten(perubahan: TambahanEditKonten): Record<string, string> {
  const galat: Record<string, string> = {};

  if (perubahan.urlTerbit && perubahan.urlTerbit.trim().length > 0) {
    try {
      const parsed = new URL(perubahan.urlTerbit.trim());
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        galat.urlTerbit = 'URL terbit harus diawali http:// atau https://.';
      }
    } catch {
      galat.urlTerbit = 'Format URL terbit tidak valid (contoh: https://instagram.com/reel/...).';
    }
  }

  if (perubahan.status === 'published' && (!perubahan.urlTerbit || !perubahan.urlTerbit.trim())) {
    galat.urlTerbit = 'Status Terbit memerlukan tautan URL publikasi yang valid.';
  }

  if (
    (perubahan.status === 'approved' || perubahan.persetujuan?.status === 'disetujui') &&
    (!perubahan.persetujuan?.disetujuiOleh || !perubahan.persetujuan.disetujuiOleh.trim())
  ) {
    galat.disetujuiOleh = 'Nama/peran penyetuju wajib diisi jika konten berstatus Disetujui.';
  }

  if (
    (perubahan.status === 'approved' || perubahan.persetujuan?.status === 'disetujui') &&
    (!perubahan.persetujuan?.tanggalDisetujui || !perubahan.persetujuan.tanggalDisetujui.trim())
  ) {
    galat.tanggalDisetujui = 'Tanggal persetujuan wajib diisi jika konten berstatus Disetujui.';
  }

  const ctaKecil = (perubahan.cta ?? '').toLowerCase();
  if (
    ctaKecil.includes('beli tiket') ||
    ctaKecil.includes('jual tiket') ||
    ctaKecil.includes('datang sekarang')
  ) {
    galat.cta = 'CTA melanggar kebijakan acara (hindari ajakan beli/jual tiket atau datang langsung tanpa daftar kuota terbatas).';
  }

  return galat;
}
