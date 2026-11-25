import {
  FASE_KAMPANYE_KANONIK,
  IDENTITAS_EVENT_KANONIK,
  NARASI_EKSEKUTIF_KANONIK,
  SKENARIO_ANGGARAN_KANONIK,
  TIGA_OUTCOME_KANONIK,
} from '../data/beranda-kanonik';
import {
  DETAIL_SKENARIO_ANGGARAN_KANONIK,
  KURS_PLANNING_USD_IDR_KANONIK,
} from '../data/iklan-kanonik';
import {
  DEFINISI_METRIK_KPI_KANONIK,
  INFO_GRUP_KPI_KANONIK,
  SNAPSHOT_CONTOH_SIMULASI,
} from '../data/kpi-kanonik';
import {
  DATA_KONFIRMASI_V11_KANONIK,
  RISIKO_LENGKAP_KANONIK,
} from '../data/rencana-kanonik';
import { KATEGORI_STAKEHOLDER_KANONIK } from '../data/stakeholder-kanonik';
import type {
  BagianTabelLaporan,
  DefinisiJenisLaporan,
  DokumenLaporanTerbangun,
  JenisLaporanId,
  KonfigurasiLaporan,
  RingkasanMetrikLaporan,
  SumberDataLaporan,
} from '../types/laporan';
import type { PeranPengguna } from '../types/status';
import {
  dapatkanLabelPeran,
  formatAngka,
  formatRupiah,
  formatTanggalWib,
} from './format';
import {
  dapatkanDetailSkenario,
  dapatkanInfoStatusFlight,
  hitungEstimasiBiayaFlightIdr,
  hitungHariFlight,
  hitungRingkasanPengendalianAnggaran,
} from './iklan';
import {
  dapatkanInfoStatusKonten,
  dapatkanLabelKanal,
  dapatkanLabelPilar,
  dapatkanLabelSlot,
  hitungStatistikKalender,
} from './kalender';
import {
  dapatkanLabelPlatformKpi,
  evaluasiKesegaranData,
  filterSnapshotKpi,
  formatNilaiMetrik,
  hitungRingkasanMetrikGrup,
} from './kpi';
import {
  dapatkanInfoStatusDeliverable,
  dapatkanInfoStatusKutipan,
  dapatkanInfoStatusTugas,
  evaluasiMilestone11Desember,
  hitungStatistikProduksi,
} from './produksi';
import {
  dapatkanInfoStatusPipeline,
  dapatkanLabelChannelOutreach,
  dapatkanLabelKategoriStakeholder,
  hitungRingkasanStakeholder,
} from './stakeholder';

export const DAFTAR_JENIS_LAPORAN: DefinisiJenisLaporan[] = [
  {
    id: 'executive-brief',
    judul: 'Executive Brief',
    kodeNamaFile: 'ExecutiveBrief',
    ringkasan:
      'Ringkasan tujuan, fase, progres, skenario anggaran, risiko kritis, dan daftar keputusan yang dibutuhkan Owner.',
    orientasiDefault: 'portrait',
    mendukungFilterTanggal: false,
    mendukungFilterPlatform: false,
    mendukungFilterStatus: false,
    mendukungFilterKategori: false,
    memuatPotensiPii: false,
  },
  {
    id: 'content-calendar',
    judul: 'Content Calendar (22 Hari)',
    kodeNamaFile: 'KalenderKonten',
    ringkasan:
      'Daftar terstruktur 22 tanggal (44 video + 22 desain) lengkap dengan kanal distribusi, jam tayang usulan, status, dan PIC.',
    orientasiDefault: 'landscape',
    mendukungFilterTanggal: true,
    mendukungFilterPlatform: true,
    mendukungFilterStatus: true,
    mendukungFilterKategori: true,
    memuatPotensiPii: false,
  },
  {
    id: 'production-approval',
    judul: 'Production & Approval',
    kodeNamaFile: 'ProduksiApproval',
    ringkasan:
      'Agenda shooting 3 hari (25 Nov iklan; 30 Nov & 3 Des short konten), status tugas produksi, persetujuan kutipan wawancara, deliverables, dan tautan aset.',
    orientasiDefault: 'portrait',
    mendukungFilterTanggal: false,
    mendukungFilterPlatform: false,
    mendukungFilterStatus: true,
    mendukungFilterKategori: false,
    memuatPotensiPii: false,
  },
  {
    id: 'ad-flight-budget',
    judul: 'Ad Flight & Budget',
    kodeNamaFile: 'IklanAnggaran',
    ringkasan:
      'Jadwal flight Meta & TikTok Ads, perbandingan 3 skenario biaya, plafon disetujui, serta belanja aktual.',
    orientasiDefault: 'landscape',
    mendukungFilterTanggal: true,
    mendukungFilterPlatform: true,
    mendukungFilterStatus: true,
    mendukungFilterKategori: false,
    memuatPotensiPii: false,
  },
  {
    id: 'stakeholder-pipeline',
    judul: 'Stakeholder Pipeline',
    kodeNamaFile: 'StakeholderPipeline',
    ringkasan:
      'Rekap segmen strategis, prioritas, status outreach, dan tindak lanjut. Kontak pribadi (PII) disensor secara default.',
    orientasiDefault: 'landscape',
    mendukungFilterTanggal: false,
    mendukungFilterPlatform: false,
    mendukungFilterStatus: true,
    mendukungFilterKategori: true,
    memuatPotensiPii: true,
  },
  {
    id: 'kpi-monitoring',
    judul: 'KPI & Monitoring',
    kodeNamaFile: 'KpiMonitoring',
    ringkasan:
      'Ringkasan 5 grup KPI kanonik, kesegaran data 72 jam, catatan aktual berdasar sumber, dan log inquiry.',
    orientasiDefault: 'landscape',
    mendukungFilterTanggal: true,
    mendukungFilterPlatform: true,
    mendukungFilterStatus: false,
    mendukungFilterKategori: true,
    memuatPotensiPii: false,
  },
  {
    id: 'post-event-recap',
    judul: 'Post-Event Recap & Follow-Up',
    kodeNamaFile: 'RekapPascaAcara',
    ringkasan:
      'Rekap dokumentasi Gala Show 18 Des 2026, liputan/clipping media, tindak lanjut stakeholder, leads, dan rencana 30 hari.',
    orientasiDefault: 'portrait',
    mendukungFilterTanggal: false,
    mendukungFilterPlatform: false,
    mendukungFilterStatus: false,
    mendukungFilterKategori: false,
    memuatPotensiPii: true,
  },
];

export function dapatkanDefinisiLaporan(
  id: JenisLaporanId,
): DefinisiJenisLaporan {
  return (
    DAFTAR_JENIS_LAPORAN.find((item) => item.id === id) ??
    DAFTAR_JENIS_LAPORAN[0]
  );
}

export function buatKonfigurasiLaporanDefault(
  jenis: JenisLaporanId = 'executive-brief',
): KonfigurasiLaporan {
  const definisi = dapatkanDefinisiLaporan(jenis);
  return {
    jenis,
    tanggalMulai: '',
    tanggalSelesai: '',
    platform: 'semua',
    statusFilter: 'semua',
    kategoriFilter: 'semua',
    orientasi: definisi.orientasiDefault,
    sertakanCatatanInternal: false,
    sertakanKontakPribadiStakeholder: false,
  };
}

export function bolehLihatCatatanInternalLaporan(
  peran: PeranPengguna | null,
): boolean {
  return (
    peran === 'owner' ||
    peran === 'admin' ||
    peran === 'digital-manager' ||
    peran === 'stakeholder-pic'
  );
}

export function bolehEksporPiiStakeholder(
  peran: PeranPengguna | null,
): boolean {
  return (
    peran === 'owner' ||
    peran === 'admin' ||
    peran === 'digital-manager' ||
    peran === 'stakeholder-pic'
  );
}

export function buatTanggalIsoJakarta(waktu: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(waktu);
}

export function buatNamaFileLaporan(
  jenis: JenisLaporanId,
  waktu: Date = new Date(),
): string {
  const def = dapatkanDefinisiLaporan(jenis);
  const tanggal = buatTanggalIsoJakarta(waktu);
  return `RagiHotang-${def.kodeNamaFile}-${tanggal}.pdf`;
}

function formatJamWibLengkap(waktu: Date): string {
  const tanggal = formatTanggalWib(waktu);
  const jam = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(waktu);
  return `${tanggal}, ${jam} WIB`;
}

function ringkasParameterAktif(
  konfigurasi: KonfigurasiLaporan,
  catatanInternalAktif: boolean,
  piiAktif: boolean,
): string[] {
  const param: string[] = [];
  if (konfigurasi.tanggalMulai || konfigurasi.tanggalSelesai) {
    param.push(
      `Rentang Tanggal: ${konfigurasi.tanggalMulai || 'Awal'} s.d. ${konfigurasi.tanggalSelesai || 'Akhir'}`,
    );
  }
  if (konfigurasi.platform && konfigurasi.platform !== 'semua') {
    param.push(`Platform/Kanal: ${konfigurasi.platform}`);
  }
  if (konfigurasi.statusFilter && konfigurasi.statusFilter !== 'semua') {
    param.push(`Filter Status: ${konfigurasi.statusFilter}`);
  }
  if (konfigurasi.kategoriFilter && konfigurasi.kategoriFilter !== 'semua') {
    param.push(`Filter Kategori/Pilar: ${konfigurasi.kategoriFilter}`);
  }
  param.push(
    `Orientasi Cetak: A4 ${konfigurasi.orientasi === 'landscape' ? 'Landscape' : 'Portrait'}`,
  );
  param.push(
    `Catatan Internal: ${catatanInternalAktif ? 'Disertakan (terotorisasi)' : 'Disembunyikan'}`,
  );
  param.push(
    `Kontak Privat Stakeholder (PII): ${piiAktif ? 'Disertakan dengan konfirmasi' : 'Teredaksi (default aman)'}`,
  );
  return param;
}

export function bangunDokumenLaporan(
  sumber: SumberDataLaporan,
): DokumenLaporanTerbangun {
  const {
    konfigurasi,
    sesi,
    daftarKonten,
    stateProduksi,
    stateIklan,
    stateKpi,
    modeContohKpi = false,
    daftarStakeholder = [],
    daftarAset = [],
    waktuSekarang = new Date(),
  } = sumber;

  const def = dapatkanDefinisiLaporan(konfigurasi.jenis);
  const catatanInternalAktif =
    konfigurasi.sertakanCatatanInternal &&
    bolehLihatCatatanInternalLaporan(sesi.peran);
  const piiAktif =
    konfigurasi.sertakanKontakPribadiStakeholder &&
    bolehEksporPiiStakeholder(sesi.peran);

  const parameterAktif = ringkasParameterAktif(
    konfigurasi,
    catatanInternalAktif,
    piiAktif,
  );

  const statKalender = hitungStatistikKalender(daftarKonten);
  const statProduksi = hitungStatistikProduksi(stateProduksi);
  const eval11Des = evaluasiMilestone11Desember(stateProduksi);
  const ringkasanAnggaran = hitungRingkasanPengendalianAnggaran(stateIklan);
  const skenarioDipilih = dapatkanDetailSkenario(stateIklan.skenarioAktif);
  const ringkasanStakeholder = hitungRingkasanStakeholder(
    daftarStakeholder,
    buatTanggalIsoJakarta(waktuSekarang),
  );
  const kesegaranKpi = evaluasiKesegaranData(
    stateKpi.daftarSnapshot,
    waktuSekarang.toISOString(),
  );

  const snapshotDipakai = modeContohKpi
    ? SNAPSHOT_CONTOH_SIMULASI
    : stateKpi.daftarSnapshot;

  let ringkasanMetrik: RingkasanMetrikLaporan[] = [];
  let bagian: BagianTabelLaporan[] = [];
  let catatanIntegritas: string[] = [
    'Penandaan sumber data dipisahkan secara tegas: Rencana, Estimasi, Disetujui, Aktual, dan Belum diisi.',
    'Penyampaian kampanye publik menggunakan mekanisme Kuota Terbatas tanpa penjualan tiket (lokasi publik hanya dicantumkan sebagai Balige, Toba), sedangkan kurasi konfirmasi tamu dikelola Admin secara internal di balik layar.',
  ];

  if (konfigurasi.jenis === 'executive-brief') {
    ringkasanMetrik = [
      {
        label: 'Konten Disetujui / Terbit',
        nilai: `${statKalender.selesai} / ${statKalender.totalMaster} master`,
        labelStatus: statKalender.selesai > 0 ? 'Aktual' : 'Rencana',
        statusData: statKalender.selesai > 0 ? 'actual' : 'planned',
      },
      {
        label: `Estimasi Total (${skenarioDipilih.nama})`,
        nilai: `${skenarioDipilih.grandTotalPerkiraan ? '±' : ''}${formatRupiah(ringkasanAnggaran.estimasiGrandTotalIdr)}`,
        labelStatus: 'Estimasi',
        statusData: 'estimated',
      },
      {
        label: 'Plafon Disetujui Owner',
        nilai:
          ringkasanAnggaran.plafonDisetujuiIdr !== null
            ? formatRupiah(ringkasanAnggaran.plafonDisetujuiIdr)
            : 'Belum diisi',
        labelStatus:
          ringkasanAnggaran.plafonDisetujuiIdr !== null
            ? 'Disetujui'
            : 'Belum diisi',
        statusData:
          ringkasanAnggaran.plafonDisetujuiIdr !== null
            ? 'approved'
            : 'not-configured',
      },
      {
        label: 'Belanja Aktual & Snapshot KPI',
        nilai:
          ringkasanAnggaran.totalAktualIdr !== null
            ? formatRupiah(ringkasanAnggaran.totalAktualIdr)
            : `${stateKpi.daftarSnapshot.length} catatan KPI`,
        labelStatus:
          ringkasanAnggaran.totalAktualIdr !== null ||
          stateKpi.daftarSnapshot.length > 0
            ? 'Aktual'
            : 'Belum diisi',
        statusData:
          ringkasanAnggaran.totalAktualIdr !== null ||
          stateKpi.daftarSnapshot.length > 0
            ? 'actual'
            : 'not-configured',
      },
    ];

    bagian = [
      {
        id: 'exec-identitas',
        judul: '1. Identitas Event & Narasi Strategi',
        deskripsi: NARASI_EKSEKUTIF_KANONIK,
        labelStatus: 'Rencana',
        kolom: ['Komponen', 'Keterangan Kanonik'],
        baris: [
          ['Nama Event', IDENTITAS_EVENT_KANONIK.nama],
          ['Format & Tanggal', `${IDENTITAS_EVENT_KANONIK.format} — ${IDENTITAS_EVENT_KANONIK.tanggalEvent}`],
          ['Lokasi Publik', IDENTITAS_EVENT_KANONIK.lokasiPublik],
          ['Kolaborator', IDENTITAS_EVENT_KANONIK.kolaborator],
          ['Sifat Akses', IDENTITAS_EVENT_KANONIK.akses],
          ['Periode Kampanye', IDENTITAS_EVENT_KANONIK.periodeKampanye],
          [
            'Tiga Outcome Utama',
            TIGA_OUTCOME_KANONIK.map((o) => `${o.judul}: ${o.definisi}`).join(' | '),
          ],
        ],
      },
      {
        id: 'exec-fase',
        judul: '2. Peta Fase Kampanye & Status Milestone',
        labelStatus: 'Rencana',
        kolom: ['Fase', 'Rentang Tanggal', 'Fokus Strategis', 'Status'],
        baris: FASE_KAMPANYE_KANONIK.map((f) => [
          f.nama,
          f.rentangTanggal,
          f.fokus,
          f.status === 'planned' ? 'Rencana' : f.status,
        ]),
      },
      {
        id: 'exec-budget',
        judul: '3. Perbandingan 3 Skenario Anggaran (Estimasi Perencanaan)',
        deskripsi:
          'Seluruh nominal adalah estimasi perencanaan & target negosiasi; kurs kerja TikTok menggunakan asumsi Rp17.000/USD.',
        labelStatus: 'Estimasi',
        kolom: ['Skenario', 'Produksi', 'Ads Setup', 'Meta Ads', 'TikTok Ads', 'Grand Total', 'Keterangan'],
        kolomRataKanan: [1, 2, 3, 4, 5],
        baris: SKENARIO_ANGGARAN_KANONIK.map((s) => [
          `${s.nama}${s.rekomendasi ? ' (Rekomendasi)' : ''}${s.id === stateIklan.skenarioAktif ? ' [Aktif]' : ''}`,
          formatRupiah(s.produksiIdr),
          formatRupiah(s.adsSetupIdr),
          formatRupiah(s.metaIdr),
          `${s.tiktokPerkiraan ? '±' : ''}${formatRupiah(s.tiktokIdr)}`,
          `${s.totalPerkiraan ? '±' : ''}${formatRupiah(s.totalIdr)}`,
          s.catatan,
        ]),
      },
      {
        id: 'exec-risiko',
        judul: '4. Risiko Kritis & Mitigasi Utama',
        deskripsi: eval11Des.pesanPeringatan,
        labelStatus: 'Rencana',
        kolom: ['Risiko', 'Dampak', 'Mitigasi'],
        baris: RISIKO_LENGKAP_KANONIK.slice(0, 6).map((r) => [
          r.judul,
          r.dampak,
          r.mitigasi,
        ]),
      },
      {
        id: 'exec-keputusan',
        judul: '5. Keputusan & Data v1.1 yang Masih Menunggu Konfirmasi Owner',
        labelStatus: 'Belum diisi',
        kolom: ['Data yang Dibutuhkan', 'Alasan Penting', 'Pemilik Data', 'Status'],
        baris: DATA_KONFIRMASI_V11_KANONIK.map((d) => [
          d.dataBelumAda,
          d.alasanPenting,
          d.pemilikData,
          'Belum diisi',
        ]),
      },
    ];
  } else if (konfigurasi.jenis === 'content-calendar') {
    const tersaring = daftarKonten.filter((item) => {
      if (konfigurasi.tanggalMulai && item.tanggal < konfigurasi.tanggalMulai) {
        return false;
      }
      if (
        konfigurasi.tanggalSelesai &&
        item.tanggal > konfigurasi.tanggalSelesai
      ) {
        return false;
      }
      if (
        konfigurasi.platform !== 'semua' &&
        !item.distribusiKanal.some((d) => d.kanal === konfigurasi.platform)
      ) {
        return false;
      }
      if (
        konfigurasi.statusFilter !== 'semua' &&
        item.status !== konfigurasi.statusFilter
      ) {
        return false;
      }
      if (
        konfigurasi.kategoriFilter !== 'semua' &&
        item.pilar !== konfigurasi.kategoriFilter
      ) {
        return false;
      }
      return true;
    });

    const statSaring = hitungStatistikKalender(tersaring);
    ringkasanMetrik = [
      {
        label: 'Master Konten Tersaring',
        nilai: `${statSaring.totalMaster} / 66 master`,
        labelStatus: 'Rencana',
        statusData: 'planned',
      },
      {
        label: 'Komposisi Video & Desain',
        nilai: `${statSaring.totalVideo} video · ${statSaring.totalDesain} desain`,
        labelStatus: 'Rencana',
        statusData: 'planned',
      },
      {
        label: 'Disetujui / Terjadwal / Terbit',
        nilai: `${statSaring.selesai} aset`,
        labelStatus: statSaring.selesai > 0 ? 'Aktual' : 'Rencana',
        statusData: statSaring.selesai > 0 ? 'actual' : 'planned',
      },
      {
        label: 'Tertahan (Blocked)',
        nilai: `${statSaring.tertahan} aset`,
        labelStatus: statSaring.tertahan > 0 ? 'Aktual' : 'Rencana',
        statusData: statSaring.tertahan > 0 ? 'actual' : 'planned',
      },
    ];

    const kolom = [
      'Tanggal',
      'Slot',
      'Judul Konsep Master',
      'Pilar',
      'Kanal & Jam Usulan (WIB)',
      'Status',
      'PIC',
    ];
    if (catatanInternalAktif) {
      kolom.push('Catatan & Tautan Terbit');
    }

    bagian = [
      {
        id: 'cal-master',
        judul: 'Jadwal Master Konten 26 Nov – 17 Des 2026',
        deskripsi:
          'Satu master video diunggah ke IG Reels, FB Reels, dan TikTok; satu master desain di-mirror ke IG Feed dan FB Page. Jam tayang berlabel Usulan.',
        labelStatus: statSaring.selesai > 0 ? 'Aktual' : 'Rencana',
        kolom,
        baris:
          tersaring.length > 0
            ? tersaring.map((item) => {
                const kanalLabel = item.distribusiKanal
                  .map(
                    (d) =>
                      `${dapatkanLabelKanal(d.kanal)} (${d.waktuUsulan} Usulan)`,
                  )
                  .join('; ');
                const baris = [
                  item.labelTanggal,
                  dapatkanLabelSlot(item.slot),
                  item.judul,
                  dapatkanLabelPilar(item.pilar),
                  kanalLabel,
                  dapatkanInfoStatusKonten(item.status).label,
                  item.pic,
                ];
                if (catatanInternalAktif) {
                  baris.push(
                    [item.catatan, item.urlTerbit].filter(Boolean).join(' | ') ||
                      'Belum diisi',
                  );
                }
                return baris;
              })
            : [
                [
                  'Belum diisi',
                  '-',
                  'Tidak ada item kalender yang cocok dengan kombinasi filter aktif.',
                  '-',
                  '-',
                  '-',
                  '-',
                  ...(catatanInternalAktif ? ['-'] : []),
                ],
              ],
      },
    ];
  } else if (konfigurasi.jenis === 'production-approval') {
    const tugasTersaring = stateProduksi.daftarTugas.filter((t) =>
      konfigurasi.statusFilter === 'semua'
        ? true
        : t.status === konfigurasi.statusFilter,
    );

    ringkasanMetrik = [
      {
        label: 'Tugas Produksi Selesai',
        nilai: `${statProduksi.tugasSelesai} / ${statProduksi.totalTugas}`,
        labelStatus: statProduksi.tugasSelesai > 0 ? 'Aktual' : 'Rencana',
        statusData: statProduksi.tugasSelesai > 0 ? 'actual' : 'planned',
      },
      {
        label: 'Checklist Hari Shooting',
        nilai: `${statProduksi.checklistSelesai} / ${statProduksi.checklistTotal}`,
        labelStatus: statProduksi.checklistSelesai > 0 ? 'Aktual' : 'Rencana',
        statusData: statProduksi.checklistSelesai > 0 ? 'actual' : 'planned',
      },
      {
        label: 'Kutipan Wawancara Approved',
        nilai: `${statProduksi.kutipanDisetujui} / ${statProduksi.totalPertanyaan}`,
        labelStatus: statProduksi.kutipanDisetujui > 0 ? 'Disetujui' : 'Rencana',
        statusData: statProduksi.kutipanDisetujui > 0 ? 'approved' : 'planned',
      },
      {
        label: 'Milestone Pra-Balige (< 11 Des)',
        nilai:
          eval11Des.status === 'tuntas' ? 'Tuntas' : 'Perlu Eskalasi',
        labelStatus: eval11Des.status === 'tuntas' ? 'Disetujui' : 'Rencana',
        statusData: eval11Des.status === 'tuntas' ? 'approved' : 'planned',
      },
    ];

    bagian = [
      {
        id: 'prod-shooting',
        judul: '1. Sesi Shooting 3 Hari (25 Nov, 30 Nov & 3 Des 2026)',
        deskripsi: eval11Des.pesanPeringatan,
        labelStatus: 'Rencana',
        kolom: ['Sesi', 'Tanggal & Jam (WIB)', 'Fokus Output', 'Status Kesiapan', 'Catatan Lokasi'],
        baris: stateProduksi.daftarSesiShooting.map((s) => [
          s.judul,
          `${s.tanggal} (${s.jamOperasional})`,
          s.ringkasanTujuan,
          s.statusKesiapan,
          catatanInternalAktif && s.lokasiPrivat
            ? s.lokasiPrivat
            : 'Teredaksi / menunggu konfirmasi lokasi',
        ]),
      },
      {
        id: 'prod-tugas',
        judul: '2. Daftar Tugas Produksi & Approval',
        labelStatus: statProduksi.tugasSelesai > 0 ? 'Aktual' : 'Rencana',
        kolom: ['Tugas', 'Fase', 'Tenggat', 'PIC', 'Status', 'Approver'],
        baris:
          tugasTersaring.length > 0
            ? tugasTersaring.map((t) => [
                t.judul,
                t.fase,
                t.tenggat,
                t.assignee,
                dapatkanInfoStatusTugas(t.status).label,
                t.approver || 'Belum diisi',
              ])
            : [['Tidak ada tugas cocok dengan filter status', '-', '-', '-', '-', '-']],
      },
      {
        id: 'prod-wawancara',
        judul: '3. Status Persetujuan Kutipan Wawancara (18 Pertanyaan Kanonik)',
        deskripsi:
          'Catatan sumber: 4 slot pertanyaan tambahan Melfarina & 1 slot tambahan Raden belum dirinci di v1.0.',
        labelStatus:
          statProduksi.kutipanDisetujui > 0 ? 'Disetujui' : 'Rencana',
        kolom: ['Narasumber', 'Pertanyaan', 'Status Kutipan', 'Disetujui Oleh & Tanggal'],
        baris: stateProduksi.bankPertanyaan.map((q) => [
          q.narasumber.toUpperCase(),
          q.pertanyaan,
          dapatkanInfoStatusKutipan(q.statusPersetujuan).label,
          q.disetujuiOleh
            ? `${q.disetujuiOleh} (${q.tanggalDisetujui || '-'})`
            : 'Belum diisi',
        ]),
      },
      {
        id: 'prod-deliverables',
        judul: '4. Deliverables & Tautan Aset Perpustakaan',
        labelStatus:
          statProduksi.deliverableSelesai > 0 ? 'Aktual' : 'Rencana',
        kolom: ['Deliverable / Aset', 'Target / Folder', 'Status', 'Catatan / Tautan'],
        baris: [
          ...stateProduksi.daftarDeliverables.map((d) => [
            d.nama,
            d.targetVolume,
            dapatkanInfoStatusDeliverable(d.status).label,
            d.catatan || 'Belum diisi',
          ]),
          ...(daftarAset.length > 0
            ? daftarAset.map((a) => [
                `[Aset] ${a.namaTampilan}`,
                a.folderKode,
                a.statusSinkron,
                a.driveUrl || a.driveFileId || 'Menunggu sinkronisasi',
              ])
            : [
                [
                  '[Aset Drive] Belum ada aset terdaftar di sesi ini',
                  '01_Brief s.d. 08_Reports',
                  'Belum diisi',
                  'Buka /aset untuk mengunggah atau mendaftarkan tautan Drive.',
                ],
              ]),
        ],
      },
    ];
  } else if (konfigurasi.jenis === 'ad-flight-budget') {
    const flightTersaring = stateIklan.daftarFlight.filter((f) => {
      if (
        konfigurasi.platform !== 'semua' &&
        f.platform !== konfigurasi.platform
      ) {
        return false;
      }
      if (
        konfigurasi.statusFilter !== 'semua' &&
        f.status !== konfigurasi.statusFilter
      ) {
        return false;
      }
      if (
        konfigurasi.tanggalMulai &&
        f.tanggalSelesai < konfigurasi.tanggalMulai
      ) {
        return false;
      }
      if (
        konfigurasi.tanggalSelesai &&
        f.tanggalMulai > konfigurasi.tanggalSelesai
      ) {
        return false;
      }
      return true;
    });

    const belanjaTersaring = stateIklan.daftarBelanjaAktual.filter((b) => {
      if (
        konfigurasi.tanggalMulai &&
        b.tanggalLaporan < konfigurasi.tanggalMulai
      ) {
        return false;
      }
      if (
        konfigurasi.tanggalSelesai &&
        b.tanggalLaporan > konfigurasi.tanggalSelesai
      ) {
        return false;
      }
      return true;
    });

    ringkasanMetrik = [
      {
        label: `Estimasi Total (${skenarioDipilih.nama})`,
        nilai: `${ringkasanAnggaran.estimasiPerkiraan ? '±' : ''}${formatRupiah(ringkasanAnggaran.estimasiGrandTotalIdr)}`,
        labelStatus: 'Estimasi',
        statusData: 'estimated',
      },
      {
        label: 'Plafon Disetujui Owner',
        nilai:
          ringkasanAnggaran.plafonDisetujuiIdr !== null
            ? formatRupiah(ringkasanAnggaran.plafonDisetujuiIdr)
            : 'Belum diisi',
        labelStatus:
          ringkasanAnggaran.plafonDisetujuiIdr !== null
            ? 'Disetujui'
            : 'Belum diisi',
        statusData:
          ringkasanAnggaran.plafonDisetujuiIdr !== null
            ? 'approved'
            : 'not-configured',
      },
      {
        label: 'Total Belanja Aktual',
        nilai:
          ringkasanAnggaran.totalAktualIdr !== null
            ? formatRupiah(ringkasanAnggaran.totalAktualIdr)
            : 'Belum diisi',
        labelStatus:
          ringkasanAnggaran.totalAktualIdr !== null ? 'Aktual' : 'Belum diisi',
        statusData:
          ringkasanAnggaran.totalAktualIdr !== null
            ? 'actual'
            : 'not-configured',
      },
      {
        label: 'Anggaran Harian TikTok',
        nilai:
          stateIklan.skenarioAktif === 'hemat'
            ? 'Rp0 (Organik)'
            : stateIklan.skenarioAktif === 'agresif'
              ? 'Rp800.000 / hari'
              : 'Rp450.000 / hari',
        labelStatus: 'Estimasi',
        statusData: 'estimated',
      },
    ];

    bagian = [
      {
        id: 'ads-flight',
        judul: '1. Jadwal Flight Meta Ads & TikTok Ads',
        deskripsi:
          'Anggaran TikTok Ads ditetapkan tetap per hari (Optimal: Rp450.000/hari untuk 1 ad group; Maksimal: Rp800.000/hari untuk 2 ad groups). Minimum TikTok Ads Manager: USD 50 campaign / USD 20 ad group (Agustus 2026).',
        labelStatus: 'Estimasi',
        kolom: [
          'Kode & Nama Campaign',
          'Platform',
          'Rentang Tanggal',
          'Hari',
          'Budget/Hari',
          'Estimasi Total (IDR)',
          'Status',
        ],
        kolomRataKanan: [3, 4, 5],
        baris:
          flightTersaring.length > 0
            ? flightTersaring.map((f) => [
                `${f.kodeFlight} — ${f.namaCampaign}`,
                f.platform === 'meta' ? 'Meta Ads' : 'TikTok Ads',
                `${f.tanggalMulai} s.d. ${f.tanggalSelesai}`,
                `${hitungHariFlight(f.tanggalMulai, f.tanggalSelesai)} hari`,
                f.isOrganikSaja
                  ? 'Organik (Rp0)'
                  : f.mataUang === 'USD'
                    ? `USD ${f.anggaranHarian} × ${f.jumlahAdGroup} ad grp`
                    : `${formatRupiah(f.anggaranHarian * f.jumlahAdGroup)}/hari`,
                `${f.mataUang === 'USD' && !f.isOrganikSaja ? '±' : ''}${formatRupiah(hitungEstimasiBiayaFlightIdr(f, stateIklan.kursPlanningUsdIdr))}`,
                dapatkanInfoStatusFlight(f.status).label,
              ])
            : [['Tidak ada flight cocok dengan filter', '-', '-', '-', '-', '-', '-']],
      },
      {
        id: 'ads-skenario',
        judul: '2. Rincian 3 Skenario Anggaran Kanonik',
        labelStatus: 'Estimasi',
        kolom: ['Skenario', 'Produksi', 'Ads Setup', 'Meta Ads', 'TikTok Ads', 'Grand Total'],
        kolomRataKanan: [1, 2, 3, 4, 5],
        baris: DETAIL_SKENARIO_ANGGARAN_KANONIK.map((s) => [
          `${s.nama}${s.id === stateIklan.skenarioAktif ? ' [Aktif]' : ''}`,
          formatRupiah(s.totalProduksiIdr),
          formatRupiah(s.adsSetupIdr),
          formatRupiah(s.metaIdr),
          `${s.tiktokPerkiraan ? '±' : ''}${formatRupiah(s.tiktokIdr)}`,
          `${s.grandTotalPerkiraan ? '±' : ''}${formatRupiah(s.grandTotalIdr)}`,
        ]),
      },
      {
        id: 'ads-aktual',
        judul: '3. Catatan Persetujuan Plafon & Belanja Aktual',
        labelStatus:
          belanjaTersaring.length > 0 ? 'Aktual' : 'Belum diisi',
        kolom: ['Tanggal Laporan', 'Kategori Pos', 'Sumber Laporan', 'Nominal Aktual', 'Dicatat Oleh'],
        kolomRataKanan: [3],
        baris:
          belanjaTersaring.length > 0
            ? belanjaTersaring.map((b) => [
                b.tanggalLaporan,
                b.kategoriPos,
                b.sumberLaporan,
                formatRupiah(b.nominalAktualIdr),
                b.dicatatOleh,
              ])
            : [
                [
                  'Belum diisi',
                  '-',
                  'Belum ada snapshot belanja aktual yang dicatat/diimpor.',
                  'Belum diisi',
                  stateIklan.persetujuanAktif
                    ? `Plafon disetujui oleh ${stateIklan.persetujuanAktif.disetujuiOleh}`
                    : 'Plafon belum disetujui',
                ],
              ],
      },
    ];
  } else if (konfigurasi.jenis === 'stakeholder-pipeline') {
    const tersaring = daftarStakeholder.filter((s) => {
      if (
        konfigurasi.kategoriFilter !== 'semua' &&
        s.kategori !== konfigurasi.kategoriFilter
      ) {
        return false;
      }
      if (
        konfigurasi.statusFilter !== 'semua' &&
        s.statusPipeline !== konfigurasi.statusFilter
      ) {
        return false;
      }
      return true;
    });

    ringkasanMetrik = [
      {
        label: 'Total Stakeholder Tercatat',
        nilai: `${ringkasanStakeholder.total}`,
        labelStatus: ringkasanStakeholder.total > 0 ? 'Aktual' : 'Belum diisi',
        statusData: ringkasanStakeholder.total > 0 ? 'actual' : 'not-configured',
      },
      {
        label: 'Prioritas A',
        nilai: `${ringkasanStakeholder.prioritasA}`,
        labelStatus: ringkasanStakeholder.total > 0 ? 'Aktual' : 'Belum diisi',
        statusData: ringkasanStakeholder.total > 0 ? 'actual' : 'not-configured',
      },
      {
        label: 'Sudah Dihubungi / Merespons',
        nilai: `${ringkasanStakeholder.contacted} / ${ringkasanStakeholder.replied}`,
        labelStatus: ringkasanStakeholder.total > 0 ? 'Aktual' : 'Belum diisi',
        statusData: ringkasanStakeholder.total > 0 ? 'actual' : 'not-configured',
      },
      {
        label: 'Status Perlindungan PII',
        nilai: piiAktif ? 'Terbuka (Konfirmasi)' : 'Teredaksi Default',
        labelStatus: piiAktif ? 'Disetujui' : 'Rencana',
        statusData: piiAktif ? 'approved' : 'planned',
      },
    ];

    catatanIntegritas.push(
      piiAktif
        ? 'PERINGATAN PII: Ekspor ini memuat kontak pribadi stakeholder dengan konfirmasi peran berwenang. Dilarang menyebarkan ke pihak publik.'
        : 'Kontak pribadi (email/telepon/WhatsApp) dan catatan relasi privat disensor otomatis demi keamanan PII.',
    );

    const kolom = [
      'Nama & Organisasi',
      'Kategori',
      'Prioritas',
      'Skor',
      'Status Pipeline',
      'Kanal & Kontak',
      'Tindak Lanjut & PIC',
    ];
    if (catatanInternalAktif) {
      kolom.push('Catatan Relasi');
    }

    bagian = [
      {
        id: 'crm-segmen',
        judul: '1. Kerangka 5 Segmen Stakeholder Kanonik',
        labelStatus: 'Rencana',
        kolom: ['Segmen & Prioritas', 'Prioritas Default', 'Fokus Pesan'],
        baris: KATEGORI_STAKEHOLDER_KANONIK.map((k) => [
          k.label,
          `Prioritas ${k.prioritasDefault}`,
          k.fokusPesan,
        ]),
      },
      {
        id: 'crm-daftar',
        judul: '2. Daftar Pipeline Stakeholder',
        deskripsi:
          daftarStakeholder.length === 0
            ? 'Daftar awal sengaja kosong tanpa nama VIP/pejabat fiktif.'
            : undefined,
        labelStatus: tersaring.length > 0 ? 'Aktual' : 'Belum diisi',
        kolom,
        kolomRataKanan: [3],
        baris:
          tersaring.length > 0
            ? tersaring.map((item) => {
                const kontakTampil = piiAktif && !item.kontakTersensor
                  ? `${dapatkanLabelChannelOutreach(item.channelUtama)}: ${item.contactValue || 'Belum diisi'}`
                  : `${dapatkanLabelChannelOutreach(item.channelUtama)}: [TEREDAKSI — PRIVASI]`;
                const row = [
                  `${item.namaLengkap} (${item.jabatanOrganisasi})`,
                  dapatkanLabelKategoriStakeholder(item.kategori),
                  item.prioritas,
                  `${item.skor.totalSkor}/100`,
                  dapatkanInfoStatusPipeline(item.statusPipeline).label,
                  kontakTampil,
                  `${item.nextAction || 'Belum ditentukan'} | PIC: ${item.relationshipOwner}${item.dueDate ? ` (${item.dueDate})` : ''}`,
                ];
                if (catatanInternalAktif) {
                  row.push(
                    piiAktif && !item.kontakTersensor
                      ? item.catatanPrivat || '-'
                      : '[TEREDAKSI]',
                  );
                }
                return row;
              })
            : [
                [
                  'Belum diisi — belum ada kontak stakeholder terverifikasi',
                  '-',
                  '-',
                  '-',
                  '-',
                  '[TEREDAKSI — PRIVASI]',
                  'Tambahkan stakeholder terverifikasi pada modul /stakeholder.',
                  ...(catatanInternalAktif ? ['-'] : []),
                ],
              ],
      },
    ];
  } else if (konfigurasi.jenis === 'kpi-monitoring') {
    const snapshotTersaring = filterSnapshotKpi(snapshotDipakai, {
      tanggalMulai: konfigurasi.tanggalMulai,
      tanggalSelesai: konfigurasi.tanggalSelesai,
      platform:
        konfigurasi.platform === 'semua'
          ? 'semua'
          : (konfigurasi.platform as never),
      pilar:
        konfigurasi.kategoriFilter === 'semua'
          ? 'semua'
          : (konfigurasi.kategoriFilter as never),
      kampanyeAtauKonten: '',
      source: '',
    });

    const labelStatusKpi = modeContohKpi
      ? 'Data contoh'
      : snapshotTersaring.length > 0
        ? 'Aktual'
        : 'Belum diisi';

    ringkasanMetrik = [
      {
        label: 'Snapshot KPI Tercatat',
        nilai: `${snapshotTersaring.length} catatan`,
        labelStatus: labelStatusKpi,
        statusData: modeContohKpi
          ? 'sample'
          : snapshotTersaring.length > 0
            ? 'actual'
            : 'not-configured',
      },
      {
        label: 'Kesegaran Data',
        nilai: kesegaranKpi.memilikiData
          ? kesegaranKpi.usang
            ? `Usang (${kesegaranKpi.jamSejakLaporan} jam lalu)`
            : 'Aktif (< 72 jam)'
          : 'Belum ada laporan',
        labelStatus: kesegaranKpi.memilikiData ? 'Aktual' : 'Belum diisi',
        statusData: kesegaranKpi.memilikiData ? 'actual' : 'not-configured',
      },
      {
        label: 'Baseline 72 Jam',
        nilai: stateKpi.baseline72Jam
          ? `CPM ${formatRupiah(stateKpi.baseline72Jam.cpmAktualIdr)}`
          : 'Belum diisi',
        labelStatus: stateKpi.baseline72Jam ? 'Aktual' : 'Belum diisi',
        statusData: stateKpi.baseline72Jam ? 'actual' : 'not-configured',
      },
      {
        label: 'Qualified Inquiries',
        nilai: `${stateKpi.daftarInquiry.filter((i) => i.terkualifikasi).length} dari ${stateKpi.daftarInquiry.length}`,
        labelStatus:
          stateKpi.daftarInquiry.length > 0 ? 'Aktual' : 'Belum diisi',
        statusData:
          stateKpi.daftarInquiry.length > 0 ? 'actual' : 'not-configured',
      },
    ];

    if (modeContohKpi) {
      catatanIntegritas.push(
        'PERINGATAN: Laporan ini sedang menyertakan DATA CONTOH simulasi dan BUKAN data performa aktual.',
      );
    }

    const barisRingkasanGrup: string[][] = [];
    for (const grup of INFO_GRUP_KPI_KANONIK) {
      const daftarMetrik = hitungRingkasanMetrikGrup(
        snapshotTersaring,
        grup.id,
        stateKpi.daftarInquiry,
      );
      for (const m of daftarMetrik) {
        barisRingkasanGrup.push([
          grup.nama,
          m.definisi.nama,
          m.nilaiAgregat !== null
            ? formatNilaiMetrik(m.nilaiAgregat, m.definisi.satuan)
            : 'Belum diisi',
          `${m.jumlahCatatan}`,
          m.sumberTerakhir ?? 'Belum diisi',
          m.periodeTerakhir ?? '-',
        ]);
      }
    }

    bagian = [
      {
        id: 'kpi-ringkasan',
        judul: '1. Ringkasan 5 Grup KPI Kanonik (19+ Metrik)',
        deskripsi:
          'Target reach/CPM tidak dikarang sebelum baseline 72 jam pertama terkumpul.',
        labelStatus: labelStatusKpi,
        kolom: ['Grup KPI', 'Nama Metrik', 'Nilai Agregat', 'Catatan', 'Sumber Terakhir', 'Periode'],
        kolomRataKanan: [2, 3],
        baris: barisRingkasanGrup,
      },
      {
        id: 'kpi-log',
        judul: '2. Rincian Snapshot KPI Tercatat',
        labelStatus: labelStatusKpi,
        kolom: ['Periode', 'Platform', 'Metrik', 'Nilai', 'Kampanye / Konten', 'Sumber & PIC'],
        kolomRataKanan: [3],
        baris:
          snapshotTersaring.length > 0
            ? snapshotTersaring.map((s) => [
                s.periode,
                dapatkanLabelPlatformKpi(s.platform),
                DEFINISI_METRIK_KPI_KANONIK.find((m) => m.kode === s.kodeMetrik)
                  ?.nama ?? s.kodeMetrik,
                formatAngka(s.nilai),
                s.kampanyeAtauKonten || '-',
                `${s.source} (${s.pic})`,
              ])
            : [
                [
                  'Belum diisi',
                  '-',
                  'Belum ada snapshot KPI aktual yang diinput atau diimpor dari platform.',
                  'Belum diisi',
                  '-',
                  '-',
                ],
              ],
      },
      {
        id: 'kpi-inquiry',
        judul: '3. Log Kualifikasi Inquiry (DM / Email / Bisnis)',
        labelStatus:
          stateKpi.daftarInquiry.length > 0 ? 'Aktual' : 'Belum diisi',
        kolom: ['Tanggal', 'Pengirim / Organisasi', 'Kanal', 'Kualifikasi', 'Alasan & Tindak Lanjut'],
        baris:
          stateKpi.daftarInquiry.length > 0
            ? stateKpi.daftarInquiry.map((inq) => [
                inq.tanggal,
                piiAktif ? inq.pengirimOrganisasi : 'Kontak / Organisasi (Teredaksi)',
                inq.kanal,
                inq.terkualifikasi ? 'Qualified' : 'Non-Qualified',
                `${inq.alasanKualifikasi || inq.ringkasanPesan} (PIC: ${inq.dinilaiOleh})`,
              ])
            : [
                [
                  'Belum diisi',
                  'Belum ada inquiry masuk yang dicatat.',
                  '-',
                  '-',
                  '-',
                ],
              ],
      },
    ];
  } else {
    // post-event-recap
    const inquiryQualified = stateKpi.daftarInquiry.filter(
      (i) => i.terkualifikasi,
    );
    const asetDokumentasi = daftarAset.filter(
      (a) =>
        a.folderKode === '06_Final_Export' ||
        a.folderKode === '08_Reports' ||
        a.tags.some((t) => /recap|event|gala|clipping/i.test(t)),
    );

    ringkasanMetrik = [
      {
        label: 'Event Gala Show',
        nilai: '18 Desember 2026 (Balige)',
        labelStatus: 'Rencana',
        statusData: 'planned',
      },
      {
        label: 'Aset Dokumentasi Event',
        nilai: `${asetDokumentasi.length} berkas`,
        labelStatus: asetDokumentasi.length > 0 ? 'Aktual' : 'Belum diisi',
        statusData: asetDokumentasi.length > 0 ? 'actual' : 'not-configured',
      },
      {
        label: 'Stakeholder Perlu Follow-Up',
        nilai: `${ringkasanStakeholder.total} tercatat`,
        labelStatus: ringkasanStakeholder.total > 0 ? 'Aktual' : 'Belum diisi',
        statusData: ringkasanStakeholder.total > 0 ? 'actual' : 'not-configured',
      },
      {
        label: 'Qualified Leads & Lookbook',
        nilai: `${inquiryQualified.length} inquiry`,
        labelStatus: inquiryQualified.length > 0 ? 'Aktual' : 'Belum diisi',
        statusData: inquiryQualified.length > 0 ? 'actual' : 'not-configured',
      },
    ];

    bagian = [
      {
        id: 'post-dokumentasi',
        judul: '1. Dokumentasi Event 18 Des 2026 & Media Clipping',
        deskripsi:
          'Mencakup run of show, dokumentasi foto/video PIC di lokasi, persetujuan tamu, serta kliping liputan/mention media (18–22 Des 2026).',
        labelStatus: asetDokumentasi.length > 0 ? 'Aktual' : 'Belum diisi',
        kolom: ['Item Pasca-Event', 'Target Waktu', 'Status', 'Tautan / Catatan'],
        baris:
          asetDokumentasi.length > 0
            ? asetDokumentasi.map((a) => [
                a.namaTampilan,
                a.folderKode,
                a.statusSinkron,
                a.driveUrl || a.catatan || '-',
              ])
            : [
                [
                  'Hero Recap 24 Jam & Highlight Foto/Video Gala Show',
                  '19 Des 2026',
                  'Belum diisi',
                  'Menunggu pelaksanaan acara 18 Des 2026 & unggah ke 06_Final_Export / 08_Reports.',
                ],
                [
                  'Media Clipping & Mention Industri',
                  '19–22 Des 2026',
                  'Belum diisi',
                  'Catat tautan artikel/liputan terverifikasi pasca-acara.',
                ],
              ],
      },
      {
        id: 'post-stakeholder',
        judul: '2. Rekap Tindak Lanjut Stakeholder & Permintaan Lookbook',
        labelStatus:
          daftarStakeholder.length > 0 || inquiryQualified.length > 0
            ? 'Aktual'
            : 'Belum diisi',
        kolom: ['Pihak / Segmen', 'Status Pipeline / Kualifikasi', 'Tindak Lanjut Berikutnya', 'PIC'],
        baris:
          daftarStakeholder.length > 0 || inquiryQualified.length > 0
            ? [
                ...daftarStakeholder.map((s) => [
                  piiAktif
                    ? `${s.namaLengkap} (${s.jabatanOrganisasi})`
                    : `${dapatkanLabelKategoriStakeholder(s.kategori)} — Prioritas ${s.prioritas}`,
                  dapatkanInfoStatusPipeline(s.statusPipeline).label,
                  s.nextAction || 'Kirim lookbook & ringkasan pasca-event',
                  s.relationshipOwner,
                ]),
                ...inquiryQualified.map((inq) => [
                  piiAktif ? inq.pengirimOrganisasi : 'Qualified Business/Media Inquiry',
                  `Qualified (${inq.kanal})`,
                  inq.alasanKualifikasi,
                  inq.dinilaiOleh,
                ]),
              ]
            : [
                [
                  'Belum diisi — belum ada catatan stakeholder atau qualified inquiry',
                  'Belum diisi',
                  'Siapkan pengiriman lookbook & follow-up personal setelah acara.',
                  'PIC Stakeholder',
                ],
              ],
      },
      {
        id: 'post-30-hari',
        judul: '3. Rencana Tindak Lanjut 30 Hari Pasca-Event (Next 30-Day Brand Plan)',
        labelStatus: 'Rencana',
        kolom: ['Tahap Pasca-Acara', 'Fokus Eksekusi', 'Penanggung Jawab', 'Prasyarat Konfirmasi v1.1'],
        baris: [
          [
            'Recap 24 Jam (19 Des 2026)',
            'Publikasi highlight resmi & ucapan apresiasi tanpa membocorkan data privat tamu.',
            'Digital Manager & Editor',
            'Persetujuan owner & izin foto tamu.',
          ],
          [
            'Press Kit & Media Follow-Up (19–22 Des)',
            'Distribusi rilis pers, foto editorial berizin, dan kliping liputan.',
            'PIC Stakeholder',
            'Kontak resmi press & portofolio terverifikasi.',
          ],
          [
            'Pengiriman Lookbook & Meeting Buyer (H+3 s.d. H+14)',
            'Follow-up satu-per-satu kepada buyer, distributor, dan institusi prioritas A.',
            'Owner & PIC Stakeholder',
            'Katalog/lookbook, harga, kapasitas produksi & MOQ.',
          ],
          [
            'Aktivasi Brand Baru & Evaluasi 30 Hari (H+15 s.d. H+30)',
            'Transisi kanal ke identitas brand baru (bila embargo dibuka) dan tinjauan ROI relasi.',
            'Owner & Digital Manager',
            'Keputusan nama label baru & target pasar lanjutan.',
          ],
        ],
      },
    ];
  }

  const jumlahBarisData = bagian.reduce((acc, b) => acc + b.baris.length, 0);

  return {
    jenis: def.id,
    judul: def.judul,
    subjudul: `${IDENTITAS_EVENT_KANONIK.nama} • ${IDENTITAS_EVENT_KANONIK.tanggalEvent} • ${IDENTITAS_EVENT_KANONIK.lokasiPublik}`,
    orientasi: konfigurasi.orientasi,
    dibuatPadaIso: waktuSekarang.toISOString(),
    dibuatPadaLabelWib: formatJamWibLengkap(waktuSekarang),
    dibuatOleh: `${sesi.namaTampilan} (${dapatkanLabelPeran(sesi.peran)})`,
    namaFile: buatNamaFileLaporan(def.id, waktuSekarang),
    parameterAktif,
    catatanIntegritas,
    ringkasanMetrik,
    bagian,
    piiDisertakan: piiAktif,
    catatanInternalDisertakan: catatanInternalAktif,
    jumlahBarisData,
  };
}
