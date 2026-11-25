import type { StatusKontenOperasional } from '../types/kalender';
import type {
  FilterTugasProduksi,
  PertanyaanWawancara,
  PrioritasTugas,
  StatusDeliverable,
  StatusPersetujuanKutipan,
  StatusSlotShooting,
  StatusStateProduksi,
  StatusTugasProduksi,
  TugasProduksi,
} from '../types/produksi';

export const URUTAN_KANBAN_PRODUKSI: StatusTugasProduksi[] = [
  'brief',
  'ready-to-shoot',
  'shooting',
  'editing',
  'review',
  'approved',
  'scheduled',
  'published',
];

export const FILTER_TUGAS_DEFAULT: FilterTugasProduksi = {
  kataKunci: '',
  status: 'semua',
  prioritas: 'semua',
  assignee: '',
};

export interface InfoNadaTeks {
  label: string;
  nada: 'netral' | 'emas' | 'maroon' | 'hijau' | 'peringatan' | 'bahaya';
}

const PETA_STATUS_TUGAS: Record<StatusTugasProduksi, InfoNadaTeks> = {
  brief: { label: 'Brief Awal', nada: 'netral' },
  'ready-to-shoot': { label: 'Siap Rekam', nada: 'emas' },
  shooting: { label: 'Shooting', nada: 'emas' },
  editing: { label: 'Proses Edit', nada: 'emas' },
  review: { label: 'Menunggu Cek', nada: 'peringatan' },
  approved: { label: 'Disetujui', nada: 'hijau' },
  scheduled: { label: 'Terjadwal', nada: 'hijau' },
  published: { label: 'Sudah Tayang', nada: 'maroon' },
  blocked: { label: 'Tertahan', nada: 'bahaya' },
  cancelled: { label: 'Dibatalkan', nada: 'netral' },
};

const PETA_PRIORITAS: Record<PrioritasTugas, InfoNadaTeks> = {
  kritis: { label: 'Kritis', nada: 'bahaya' },
  tinggi: { label: 'Tinggi', nada: 'maroon' },
  sedang: { label: 'Sedang', nada: 'emas' },
  rendah: { label: 'Rendah', nada: 'netral' },
};

const PETA_STATUS_SLOT: Record<StatusSlotShooting, InfoNadaTeks> = {
  planned: { label: 'Rencana', nada: 'netral' },
  siap: { label: 'Siap', nada: 'emas' },
  selesai: { label: 'Selesai', nada: 'hijau' },
  tertunda: { label: 'Tertunda', nada: 'bahaya' },
};

const PETA_STATUS_KUTIPAN: Record<StatusPersetujuanKutipan, InfoNadaTeks> = {
  'belum-direkam': { label: 'Belum Direkam', nada: 'netral' },
  'tercatat-draft': { label: 'Catatan Awal', nada: 'emas' },
  'menunggu-approval': { label: 'Menunggu Persetujuan', nada: 'peringatan' },
  approved: { label: 'Disetujui', nada: 'hijau' },
  revisi: { label: 'Perlu Revisi', nada: 'bahaya' },
};

const PETA_STATUS_DELIVERABLE: Record<StatusDeliverable, InfoNadaTeks> = {
  planned: { label: 'Rencana', nada: 'netral' },
  editing: { label: 'Proses Edit', nada: 'emas' },
  review: { label: 'Menunggu Cek', nada: 'peringatan' },
  approved: { label: 'Disetujui', nada: 'hijau' },
  delivered: { label: 'Diserahkan', nada: 'maroon' },
};

export function dapatkanInfoStatusTugas(status: StatusTugasProduksi): InfoNadaTeks {
  return PETA_STATUS_TUGAS[status];
}

export function dapatkanInfoPrioritasTugas(prioritas: PrioritasTugas): InfoNadaTeks {
  return PETA_PRIORITAS[prioritas];
}

export function dapatkanInfoStatusSlot(status: StatusSlotShooting): InfoNadaTeks {
  return PETA_STATUS_SLOT[status];
}

export function dapatkanInfoStatusKutipan(status: StatusPersetujuanKutipan): InfoNadaTeks {
  return PETA_STATUS_KUTIPAN[status];
}

export function dapatkanInfoStatusDeliverable(status: StatusDeliverable): InfoNadaTeks {
  return PETA_STATUS_DELIVERABLE[status];
}

export function filterTugasProduksi(
  daftar: TugasProduksi[],
  filter: FilterTugasProduksi,
): TugasProduksi[] {
  const kata = filter.kataKunci.trim().toLowerCase();
  const assignee = filter.assignee.trim().toLowerCase();

  return daftar.filter((tugas) => {
    if (filter.status !== 'semua' && tugas.status !== filter.status) return false;
    if (filter.prioritas !== 'semua' && tugas.prioritas !== filter.prioritas) return false;
    if (assignee && !tugas.assignee.toLowerCase().includes(assignee)) return false;
    if (kata) {
      const gabungan = [
        tugas.judul,
        tugas.deskripsi,
        tugas.fase,
        tugas.assignee,
        tugas.catatan,
        tugas.alasanBlocked,
      ]
        .join(' ')
        .toLowerCase();
      if (!gabungan.includes(kata)) return false;
    }
    return true;
  });
}

export interface StatistikProduksi {
  totalTugas: number;
  tugasSelesai: number;
  tugasAktif: number;
  tugasBlocked: number;
  persentaseTugas: number;
  checklistSelesai: number;
  checklistTotal: number;
  kutipanTercatat: number;
  kutipanDisetujui: number;
  totalPertanyaan: number;
  deliverableSelesai: number;
  deliverableTotal: number;
}

export function hitungStatistikProduksi(state: StatusStateProduksi): StatistikProduksi {
  const totalTugas = state.daftarTugas.length;
  const tugasSelesai = state.daftarTugas.filter(
    (t) => t.status === 'approved' || t.status === 'scheduled' || t.status === 'published',
  ).length;
  const tugasBlocked = state.daftarTugas.filter((t) => t.status === 'blocked').length;
  const tugasAktif = state.daftarTugas.filter(
    (t) =>
      t.status !== 'approved' &&
      t.status !== 'scheduled' &&
      t.status !== 'published' &&
      t.status !== 'blocked' &&
      t.status !== 'cancelled',
  ).length;

  const persentaseTugas =
    totalTugas > 0 ? Math.round((tugasSelesai / totalTugas) * 100) : 0;

  const checklistSelesai = state.checklistShooting.filter((c) => c.selesai).length;
  const checklistTotal = state.checklistShooting.length;

  const kutipanTercatat = state.bankPertanyaan.filter(
    (q) => q.jawabanTercatat.trim().length > 0,
  ).length;
  const kutipanDisetujui = state.bankPertanyaan.filter(
    (q) => q.statusPersetujuan === 'approved',
  ).length;

  const deliverableSelesai = state.daftarDeliverables.filter(
    (d) => d.status === 'approved' || d.status === 'delivered',
  ).length;

  return {
    totalTugas,
    tugasSelesai,
    tugasAktif,
    tugasBlocked,
    persentaseTugas,
    checklistSelesai,
    checklistTotal,
    kutipanTercatat,
    kutipanDisetujui,
    totalPertanyaan: state.bankPertanyaan.length,
    deliverableSelesai,
    deliverableTotal: state.daftarDeliverables.length,
  };
}

export interface EvaluasiMilestone11Des {
  status: 'tuntas' | 'perlu-eskalasi';
  tugasKritisStatus: StatusTugasProduksi;
  sesiHari2Selesai: boolean;
  sesiHari3Selesai: boolean;
  pertanyaanWajibBelumSelesai: number;
  pesanPeringatan: string;
}

export function evaluasiMilestone11Desember(
  state: StatusStateProduksi,
): EvaluasiMilestone11Des {
  const tugasKritis = state.daftarTugas.find((t) => t.adalahMilestoneKritis11Des);
  const statusTugas = tugasKritis?.status ?? 'brief';
  const tugasTuntas =
    statusTugas === 'approved' ||
    statusTugas === 'scheduled' ||
    statusTugas === 'published';

  const sesi2 = state.daftarSesiShooting.find((s) => s.id === 'shoot-hari-2');
  const sesiHari2Selesai = sesi2?.statusKesiapan === 'selesai';
  const sesi3 = state.daftarSesiShooting.find((s) => s.id === 'shoot-hari-3');
  const sesiHari3Selesai = sesi3?.statusKesiapan === 'selesai';

  const pertanyaanPraBalige = state.bankPertanyaan.filter(
    (q) => q.narasumber === 'melfarina' || q.narasumber === 'ghivany',
  );
  const pertanyaanWajibBelumSelesai = pertanyaanPraBalige.filter(
    (q) => q.statusPersetujuan !== 'approved',
  ).length;

  if (tugasTuntas && sesiHari2Selesai && sesiHari3Selesai) {
    return {
      status: 'tuntas',
      tugasKritisStatus: statusTugas,
      sesiHari2Selesai,
      sesiHari3Selesai,
      pertanyaanWajibBelumSelesai,
      pesanPeringatan:
        'Semua rekaman 3 hari shooting dan persetujuan sebelum keberangkatan ke Balige pada 11 Desember sudah selesai.',
    };
  }

  return {
    status: 'perlu-eskalasi',
    tugasKritisStatus: statusTugas,
    sesiHari2Selesai,
    sesiHari3Selesai,
    pertanyaanWajibBelumSelesai,
    pesanPeringatan:
      'Batas 11 Des: Melfarina & Ghivany berangkat ke Balige. Semua rekaman (1 hari iklan + 2 hari short konten), video pendukung, suara narasi, dan persetujuan cerita harus beres sebelum 11 Desember.',
  };
}

export function validasiTugasProduksi(
  tugas: Pick<
    TugasProduksi,
    'judul' | 'status' | 'alasanBlocked' | 'approver'
  >,
): Record<string, string> {
  const galat: Record<string, string> = {};

  if (!tugas.judul.trim()) {
    galat.judul = 'Judul tugas wajib diisi.';
  }

  if (tugas.status === 'blocked' && !tugas.alasanBlocked.trim()) {
    galat.alasanBlocked = 'Alasan tertahan wajib diisi agar tim bisa segera menindaklanjuti.';
  }

  if (tugas.status === 'approved' && !tugas.approver.trim()) {
    galat.approver = 'Nama penyetuju wajib diisi sebelum menandai tugas Disetujui.';
  }

  return galat;
}

export function validasiPersetujuanKutipan(
  item: Pick<
    PertanyaanWawancara,
    'jawabanTercatat' | 'statusPersetujuan' | 'disetujuiOleh' | 'tanggalDisetujui'
  >,
): Record<string, string> {
  const galat: Record<string, string> = {};

  if (item.statusPersetujuan === 'approved') {
    if (!item.jawabanTercatat.trim()) {
      galat.jawabanTercatat =
        'Kutipan belum dapat disetujui sebelum rekaman kata asli dicatat.';
    }
    if (!item.disetujuiOleh.trim()) {
      galat.disetujuiOleh =
        'Nama penyetuju wajib diisi sebelum status Disetujui.';
    }
    if (!item.tanggalDisetujui.trim()) {
      galat.tanggalDisetujui =
        'Tanggal persetujuan wajib diisi.';
    }
  }

  return galat;
}

export function petakanStatusTugasKeKonten(
  statusTugas: StatusTugasProduksi,
): StatusKontenOperasional {
  switch (statusTugas) {
    case 'brief':
      return 'briefed';
    case 'ready-to-shoot':
    case 'shooting':
      return 'shooting';
    case 'editing':
      return 'editing';
    case 'review':
      return 'review';
    case 'approved':
      return 'approved';
    case 'scheduled':
      return 'scheduled';
    case 'published':
      return 'published';
    case 'blocked':
      return 'blocked';
    case 'cancelled':
      return 'cancelled';
  }
}
