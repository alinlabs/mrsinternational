import {
  CHANNEL_OUTREACH_KANONIK,
  KATEGORI_STAKEHOLDER_KANONIK,
  PIPELINE_OUTREACH_KANONIK,
} from '../data/stakeholder-kanonik';
import type {
  ChannelOutreach,
  FilterStakeholder,
  KategoriStakeholder,
  KomponenSkorStakeholder,
  PrioritasStakeholder,
  RecordStakeholder,
  RingkasanDashboardStakeholder,
  SkorRelasiStakeholder,
  StatusPipelineOutreach,
} from '../types/stakeholder';

function clampSkor(nilai: number): number {
  if (!Number.isFinite(nilai)) return 3;
  return Math.max(1, Math.min(5, Math.round(nilai)));
}

export function hitungSkorRelasiStakeholder(
  komponen: KomponenSkorStakeholder,
): SkorRelasiStakeholder {
  const relevansi = clampSkor(komponen.relevansi);
  const influence = clampSkor(komponen.influence);
  const peluangNyata = clampSkor(komponen.peluangNyata);
  const kedekatanHubungan = clampSkor(komponen.kedekatanHubungan);

  const pRelevansi = relevansi * 7; // maks 35
  const pInfluence = influence * 7; // maks 35
  const pPeluang = peluangNyata * 4; // maks 20
  const pKedekatan = kedekatanHubungan * 2; // maks 10
  const totalSkor = pRelevansi + pInfluence + pPeluang + pKedekatan;

  return {
    relevansi,
    influence,
    peluangNyata,
    kedekatanHubungan,
    totalSkor,
    penjelasanSkor: `Relevansi ${relevansi}/5 (${pRelevansi} poin) + Influence ${influence}/5 (${pInfluence} poin) + Peluang ${peluangNyata}/5 (${pPeluang} poin) + Kedekatan ${kedekatanHubungan}/5 (${pKedekatan} poin)`,
  };
}

export function dapatkanLabelKategoriStakeholder(
  kategori: KategoriStakeholder,
): string {
  return (
    KATEGORI_STAKEHOLDER_KANONIK.find((k) => k.nilai === kategori)?.label ??
    kategori
  );
}

export function dapatkanInfoStatusPipeline(
  status: StatusPipelineOutreach,
): {
  label: string;
  nada: 'netral' | 'emas' | 'maroon' | 'hijau' | 'peringatan' | 'bahaya';
} {
  return (
    PIPELINE_OUTREACH_KANONIK.find((p) => p.nilai === status) ?? {
      label: status,
      nada: 'netral',
    }
  );
}

export function dapatkanLabelChannelOutreach(channel: ChannelOutreach): string {
  return (
    CHANNEL_OUTREACH_KANONIK.find((c) => c.nilai === channel)?.label ?? channel
  );
}

export function hitungRingkasanStakeholder(
  daftar: RecordStakeholder[],
  tanggalAcuanIso: string = new Date().toISOString().slice(0, 10),
): RingkasanDashboardStakeholder {
  const total = daftar.length;
  const prioritasA = daftar.filter((s) => s.prioritas === 'A').length;
  const contacted = daftar.filter((s) =>
    ['contacted', 'replied', 'meeting-requested', 'ongoing'].includes(
      s.statusPipeline,
    ),
  ).length;
  const replied = daftar.filter((s) =>
    ['replied', 'meeting-requested', 'ongoing'].includes(s.statusPipeline),
  ).length;
  const meetingRequested = daftar.filter(
    (s) => s.statusPipeline === 'meeting-requested',
  ).length;
  const overdue = daftar.filter(
    (s) =>
      Boolean(s.dueDate) &&
      s.dueDate < tanggalAcuanIso &&
      s.statusPipeline !== 'closed-lost' &&
      s.statusPipeline !== 'ongoing',
  ).length;

  return {
    total,
    prioritasA,
    contacted,
    replied,
    meetingRequested,
    overdue,
  };
}

export function filterDanUrutkanStakeholder(
  daftar: RecordStakeholder[],
  filter: FilterStakeholder,
): RecordStakeholder[] {
  const kata = filter.kataKunci.trim().toLowerCase();

  const tersaring = daftar.filter((item) => {
    if (filter.kategori !== 'semua' && item.kategori !== filter.kategori) {
      return false;
    }
    if (filter.prioritas !== 'semua' && item.prioritas !== filter.prioritas) {
      return false;
    }
    if (
      filter.statusPipeline !== 'semua' &&
      item.statusPipeline !== filter.statusPipeline
    ) {
      return false;
    }
    if (kata) {
      const gabungan = [
        item.namaLengkap,
        item.jabatanOrganisasi,
        item.relevansi,
        item.relationshipOwner,
        item.nextAction,
        item.konteksRelasi,
      ]
        .join(' ')
        .toLowerCase();
      if (!gabungan.includes(kata)) return false;
    }
    return true;
  });

  const bobotPrioritas: Record<PrioritasStakeholder, number> = {
    A: 1,
    B: 2,
    C: 3,
  };

  return [...tersaring].sort((a, b) => {
    switch (filter.urutan) {
      case 'skor-tertinggi':
        return b.skor.totalSkor - a.skor.totalSkor;
      case 'prioritas-a-ke-c':
        return (
          bobotPrioritas[a.prioritas] - bobotPrioritas[b.prioritas] ||
          b.skor.totalSkor - a.skor.totalSkor
        );
      case 'tenggat-terdekat':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      case 'nama-az':
        return a.namaLengkap.localeCompare(b.namaLengkap, 'id-ID');
    }
  });
}

export function paginasiStakeholder(
  daftar: RecordStakeholder[],
  halaman: number,
  perHalaman = 10,
): {
  itemHalaman: RecordStakeholder[];
  totalHalaman: number;
  halamanAman: number;
} {
  const totalHalaman = Math.max(1, Math.ceil(daftar.length / perHalaman));
  const halamanAman = Math.max(1, Math.min(halaman, totalHalaman));
  const mulai = (halamanAman - 1) * perHalaman;
  return {
    itemHalaman: daftar.slice(mulai, mulai + perHalaman),
    totalHalaman,
    halamanAman,
  };
}

export function validasiInputStakeholder(input: {
  namaLengkap: string;
  jabatanOrganisasi: string;
  relevansi: string;
  relationshipOwner: string;
}): { valid: boolean; pesanGalat: string } {
  if (!input.namaLengkap.trim()) {
    return { valid: false, pesanGalat: 'Nama stakeholder wajib diisi.' };
  }
  if (!input.jabatanOrganisasi.trim()) {
    return {
      valid: false,
      pesanGalat: 'Jabatan atau organisasi stakeholder wajib diisi.',
    };
  }
  if (!input.relevansi.trim()) {
    return {
      valid: false,
      pesanGalat: 'Alasan relevansi dengan kolaborasi Melfarina Sianipar × Raden Sirait (MRS) wajib diisi.',
    };
  }
  if (!input.relationshipOwner.trim()) {
    return {
      valid: false,
      pesanGalat: 'PIC pengelola relasi (Relationship Owner) wajib diisi.',
    };
  }
  return { valid: true, pesanGalat: '' };
}

export function validasiLogOutreach(input: {
  tanggal: string;
  pic: string;
  ringkasan: string;
}): { valid: boolean; pesanGalat: string } {
  if (!input.tanggal.trim()) {
    return { valid: false, pesanGalat: 'Tanggal outreach wajib diisi.' };
  }
  if (!input.pic.trim()) {
    return { valid: false, pesanGalat: 'Nama PIC outreach wajib diisi.' };
  }
  if (!input.ringkasan.trim()) {
    return { valid: false, pesanGalat: 'Ringkasan kontak/pesan wajib diisi.' };
  }
  return { valid: true, pesanGalat: '' };
}

const SET_KATEGORI = new Set<KategoriStakeholder>([
  'commercial',
  'influence',
  'institution',
  'cultural-ecosystem',
  'public-awareness',
]);

const SET_PRIORITAS = new Set<PrioritasStakeholder>(['A', 'B', 'C']);

const SET_PIPELINE = new Set<StatusPipelineOutreach>([
  'identified',
  'qualified',
  'contacted',
  'replied',
  'meeting-requested',
  'ongoing',
  'closed-lost',
]);

const SET_CHANNEL = new Set<ChannelOutreach>([
  'email',
  'whatsapp',
  'instagram-dm',
  'telepon',
  'pertemuan',
  'lainnya',
]);

export interface BarisPreviewCsvStakeholder {
  nomorBaris: number;
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
  nextAction: string;
  dueDate: string;
}

export function uraiCsvStakeholder(teksCsv: string): {
  barisValid: BarisPreviewCsvStakeholder[];
  galatBaris: string[];
} {
  const barisList = teksCsv
    .split(/\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (barisList.length === 0) {
    return {
      barisValid: [],
      galatBaris: ['Teks CSV masih kosong. Tempel header + baris data stakeholder.'],
    };
  }

  const barisValid: BarisPreviewCsvStakeholder[] = [];
  const galatBaris: string[] = [];

  for (let i = 0; i < barisList.length; i++) {
    const kolom = barisList[i].split(',').map((k) => k.trim());
    if (
      i === 0 &&
      kolom[0].toLowerCase() === 'nama' &&
      (kolom[2]?.toLowerCase() ?? '').includes('kategori')
    ) {
      continue;
    }

    if (kolom.length < 6) {
      galatBaris.push(
        `Baris ${i + 1}: minimal 6 kolom wajib (nama,jabatan_organisasi,kategori,prioritas,relevansi_catatan,pic_relasi).`,
      );
      continue;
    }

    const [
      namaLengkap,
      jabatanOrganisasi,
      kategoriRaw,
      prioritasRaw,
      relevansi,
      relationshipOwner,
      sumberKontak = '',
      channelRaw = 'email',
      contactValue = '',
      konteksRelasi = '',
      izinRaw = 'tidak',
      pipelineRaw = 'identified',
      nextAction = '',
      dueDate = '',
    ] = kolom;

    const cekDasar = validasiInputStakeholder({
      namaLengkap,
      jabatanOrganisasi,
      relevansi,
      relationshipOwner,
    });
    if (!cekDasar.valid) {
      galatBaris.push(`Baris ${i + 1}: ${cekDasar.pesanGalat}`);
      continue;
    }

    const kategori = kategoriRaw.toLowerCase() as KategoriStakeholder;
    if (!SET_KATEGORI.has(kategori)) {
      galatBaris.push(
        `Baris ${i + 1}: kategori "${kategoriRaw}" tidak dikenal (gunakan commercial|influence|institution|cultural-ecosystem|public-awareness).`,
      );
      continue;
    }

    const prioritas = prioritasRaw.toUpperCase() as PrioritasStakeholder;
    if (!SET_PRIORITAS.has(prioritas)) {
      galatBaris.push(`Baris ${i + 1}: prioritas "${prioritasRaw}" harus A, B, atau C.`);
      continue;
    }

    const channelUtama = (channelRaw.toLowerCase() || 'email') as ChannelOutreach;
    if (!SET_CHANNEL.has(channelUtama)) {
      galatBaris.push(`Baris ${i + 1}: channel "${channelRaw}" tidak valid.`);
      continue;
    }

    const statusPipeline = (
      pipelineRaw.toLowerCase() || 'identified'
    ) as StatusPipelineOutreach;
    if (!SET_PIPELINE.has(statusPipeline)) {
      galatBaris.push(`Baris ${i + 1}: status pipeline "${pipelineRaw}" tidak valid.`);
      continue;
    }

    const consentToPublish = ['ya', 'true', '1', 'yes'].includes(
      izinRaw.toLowerCase(),
    );

    barisValid.push({
      nomorBaris: i + 1,
      namaLengkap,
      jabatanOrganisasi,
      kategori,
      prioritas,
      relevansi,
      relationshipOwner,
      sumberKontak,
      channelUtama,
      contactValue,
      konteksRelasi,
      consentToPublish,
      statusPipeline,
      nextAction,
      dueDate,
    });
  }

  return { barisValid, galatBaris };
}

function amankanSelCsv(nilai: string): string {
  const bersih = String(nilai ?? '').replace(/\r?\n/g, ' ');
  const amanFormula = /^[=+\-@\t\r]/.test(bersih) ? `'${bersih}` : bersih;
  return `"${amanFormula.replace(/"/g, '""')}"`;
}

export function bangunCsvEksporStakeholder(
  daftar: RecordStakeholder[],
  mode: 'public' | 'internal',
): string {
  const header =
    mode === 'public'
      ? ['Nama/Peran', 'Organisasi', 'Kategori', 'Prioritas', 'Status Pipeline', 'Izin Publikasi']
      : [
          'Nama Lengkap',
          'Jabatan/Organisasi',
          'Kategori',
          'Prioritas',
          'Skor Relasi',
          'PIC Relasi',
          'Channel',
          'Nilai Kontak (Privat)',
          'Sumber Kontak',
          'Status Pipeline',
          'Tindakan Berikutnya',
          'Tenggat Follow-up',
        ];

  const baris = daftar.map((item) => {
    if (mode === 'public') {
      return [
        amankanSelCsv(item.consentToPublish ? item.namaLengkap : 'Disamarkan (Privat)'),
        amankanSelCsv(item.consentToPublish ? item.jabatanOrganisasi : 'Dirahasiakan'),
        amankanSelCsv(item.kategori),
        amankanSelCsv(item.prioritas),
        amankanSelCsv(item.statusPipeline),
        amankanSelCsv(item.consentToPublish ? 'Ya' : 'Tidak'),
      ].join(',');
    }

    return [
      amankanSelCsv(item.namaLengkap),
      amankanSelCsv(item.jabatanOrganisasi),
      amankanSelCsv(item.kategori),
      amankanSelCsv(item.prioritas),
      amankanSelCsv(String(item.skor.totalSkor)),
      amankanSelCsv(item.relationshipOwner),
      amankanSelCsv(item.channelUtama),
      amankanSelCsv(item.contactValue),
      amankanSelCsv(item.sumberKontak),
      amankanSelCsv(item.statusPipeline),
      amankanSelCsv(item.nextAction),
      amankanSelCsv(item.dueDate),
    ].join(',');
  });

  return [header.join(','), ...baris].join('\n');
}
