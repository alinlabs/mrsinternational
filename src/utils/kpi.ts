import {
  DEFINISI_METRIK_KPI_KANONIK,
  INFO_GRUP_KPI_KANONIK,
  OPSI_PLATFORM_KPI,
} from '../data/kpi-kanonik';
import type { PilarKonten } from '../types/kalender';
import type {
  BarisValidCsvKpi,
  Baseline72Jam,
  DefinisiMetrikKpi,
  FilterKpiMonitoring,
  GrupKpi,
  HasilKalkulatorKpi,
  HasilPratinjauCsvKpi,
  InquiryKualifikasi,
  PemetaanKolomCsvKpi,
  PlatformKpi,
  SnapshotKpiAktual,
  StatusKesegaranData,
} from '../types/kpi';

const POLA_TANGGAL_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function dapatkanDefinisiMetrik(kode: string): DefinisiMetrikKpi | undefined {
  return DEFINISI_METRIK_KPI_KANONIK.find((m) => m.kode === kode);
}

export function dapatkanMetrikByGrup(grup: GrupKpi): DefinisiMetrikKpi[] {
  return DEFINISI_METRIK_KPI_KANONIK.filter((m) => m.grup === grup);
}

export function dapatkanLabelPlatformKpi(platform: PlatformKpi): string {
  return (
    OPSI_PLATFORM_KPI.find((p) => p.nilai === platform)?.label ?? platform
  );
}

export function filterSnapshotKpi(
  daftar: SnapshotKpiAktual[],
  filter: FilterKpiMonitoring,
): SnapshotKpiAktual[] {
  const kataKampanye = filter.kampanyeAtauKonten.trim().toLowerCase();
  const kataSource = filter.source.trim().toLowerCase();

  return daftar.filter((item) => {
    if (filter.tanggalMulai && item.periode < filter.tanggalMulai) return false;
    if (filter.tanggalSelesai && item.periode > filter.tanggalSelesai) return false;
    if (filter.platform !== 'semua' && item.platform !== filter.platform) return false;
    if (filter.pilar !== 'semua' && item.pilar !== filter.pilar) return false;
    if (
      kataKampanye &&
      !item.kampanyeAtauKonten.toLowerCase().includes(kataKampanye)
    ) {
      return false;
    }
    if (kataSource && !item.source.toLowerCase().includes(kataSource)) return false;
    return true;
  });
}

export interface RingkasanMetrikAktual {
  definisi: DefinisiMetrikKpi;
  jumlahCatatan: number;
  nilaiAgregat: number | null;
  periodeTerakhir: string | null;
  sumberTerakhir: string | null;
}

export function hitungRingkasanMetrikGrup(
  daftar: SnapshotKpiAktual[],
  grup: GrupKpi,
  daftarInquiry: InquiryKualifikasi[] = [],
): RingkasanMetrikAktual[] {
  const metrikGrup = dapatkanMetrikByGrup(grup);
  const catatanGrup = daftar.filter((s) => s.grup === grup);

  return metrikGrup.map((definisi) => {
    const cocok = catatanGrup
      .filter((s) => s.kodeMetrik === definisi.kode)
      .sort((a, b) => b.periode.localeCompare(a.periode));

    // Untuk Relationship -> qualified_dm_email, jika belum ada snapshot manual namun sudah ada inquiry terkualifikasi
    if (
      cocok.length === 0 &&
      grup === 'relationship' &&
      definisi.kode === 'qualified_dm_email'
    ) {
      const terkualifikasi = daftarInquiry.filter((i) => i.terkualifikasi);
      if (terkualifikasi.length > 0) {
        const terbaru = [...terkualifikasi].sort((a, b) =>
          b.tanggal.localeCompare(a.tanggal),
        )[0];
        return {
          definisi,
          jumlahCatatan: terkualifikasi.length,
          nilaiAgregat: terkualifikasi.length,
          periodeTerakhir: terbaru.tanggal,
          sumberTerakhir: 'Log Kualifikasi Inquiry',
        };
      }
    }

    if (cocok.length === 0) {
      return {
        definisi,
        jumlahCatatan: 0,
        nilaiAgregat: null,
        periodeTerakhir: null,
        sumberTerakhir: null,
      };
    }

    const total = cocok.reduce((acc, s) => acc + s.nilai, 0);
    const nilaiAgregat =
      definisi.agregasi === 'rata-rata'
        ? Number((total / cocok.length).toFixed(2))
        : Math.round(total * 100) / 100;

    return {
      definisi,
      jumlahCatatan: cocok.length,
      nilaiAgregat,
      periodeTerakhir: cocok[0].periode,
      sumberTerakhir: cocok[0].source,
    };
  });
}

export interface RingkasanGrupUntukBeranda {
  grup: GrupKpi;
  nama: string;
  jumlahCatatan: number;
  ringkasanNilai: string | null;
}

export function hitungRingkasanKpiLintasGrup(
  daftar: SnapshotKpiAktual[],
  daftarInquiry: InquiryKualifikasi[],
): RingkasanGrupUntukBeranda[] {
  return INFO_GRUP_KPI_KANONIK.map((info) => {
    const ringkasan = hitungRingkasanMetrikGrup(
      daftar,
      info.id,
      daftarInquiry,
    );
    const metrikTerisi = ringkasan.filter((r) => r.nilaiAgregat !== null);
    if (metrikTerisi.length === 0) {
      return {
        grup: info.id,
        nama: info.nama,
        jumlahCatatan: 0,
        ringkasanNilai: null,
      };
    }
    const utama = metrikTerisi[0];
    const totalCatatan = ringkasan.reduce((a, b) => a + b.jumlahCatatan, 0);
    return {
      grup: info.id,
      nama: info.nama,
      jumlahCatatan: totalCatatan,
      ringkasanNilai: `${utama.definisi.nama}: ${formatNilaiMetrik(utama.nilaiAgregat, utama.definisi.satuan)} (${totalCatatan} catatan)`,
    };
  });
}

export function formatNilaiMetrik(
  nilai: number | null,
  satuan: DefinisiMetrikKpi['satuan'],
): string {
  if (nilai === null || Number.isNaN(nilai)) return 'Belum ada data aktual';
  if (satuan === 'idr') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(nilai);
  }
  if (satuan === 'persen') return `${nilai.toLocaleString('id-ID')}%`;
  if (satuan === 'detik') return `${nilai.toLocaleString('id-ID')} dtk`;
  return nilai.toLocaleString('id-ID');
}

export interface TitikGrafikPeriode {
  periode: string;
  nilai: number;
  jumlahCatatan: number;
}

export function bangunSeriPerbandinganPeriode(
  daftar: SnapshotKpiAktual[],
  grup: GrupKpi,
  kodeMetrik: string,
): TitikGrafikPeriode[] {
  const def = dapatkanDefinisiMetrik(kodeMetrik);
  const cocok = daftar.filter(
    (s) => s.grup === grup && s.kodeMetrik === kodeMetrik,
  );
  if (cocok.length === 0) return [];

  const peta = new Map<string, number[]>();
  for (const item of cocok) {
    const arr = peta.get(item.periode) ?? [];
    arr.push(item.nilai);
    peta.set(item.periode, arr);
  }

  return Array.from(peta.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periode, daftarNilai]) => {
      const total = daftarNilai.reduce((acc, n) => acc + n, 0);
      const nilai =
        def?.agregasi === 'rata-rata'
          ? Number((total / daftarNilai.length).toFixed(2))
          : total;
      return {
        periode,
        nilai,
        jumlahCatatan: daftarNilai.length,
      };
    });
}

export interface PeringkatKontenAktual {
  kampanyeAtauKonten: string;
  platformTerakhir: PlatformKpi;
  pilar?: PilarKonten;
  totalNilaiUtama: number;
  jumlahCatatan: number;
  periodeTerakhir: string;
}

export function hitungPeringkatKontenAktual(
  daftar: SnapshotKpiAktual[],
  grup: GrupKpi,
  kodeMetrikUtama: string,
): PeringkatKontenAktual[] {
  const cocok = daftar.filter(
    (s) =>
      s.grup === grup &&
      s.kodeMetrik === kodeMetrikUtama &&
      s.kampanyeAtauKonten.trim().length > 0,
  );
  if (cocok.length === 0) return [];

  const def = dapatkanDefinisiMetrik(kodeMetrikUtama);
  const peta = new Map<
    string,
    {
      platform: PlatformKpi;
      pilar?: PilarKonten;
      nilaiList: number[];
      periodeTerakhir: string;
    }
  >();

  for (const item of cocok) {
    const kunci = item.kampanyeAtauKonten.trim();
    const lama = peta.get(kunci);
    if (!lama) {
      peta.set(kunci, {
        platform: item.platform,
        pilar: item.pilar,
        nilaiList: [item.nilai],
        periodeTerakhir: item.periode,
      });
    } else {
      lama.nilaiList.push(item.nilai);
      if (item.periode > lama.periodeTerakhir) {
        lama.periodeTerakhir = item.periode;
        lama.platform = item.platform;
      }
      if (!lama.pilar && item.pilar) lama.pilar = item.pilar;
    }
  }

  return Array.from(peta.entries())
    .map(([kampanyeAtauKonten, info]) => {
      const sum = info.nilaiList.reduce((a, b) => a + b, 0);
      const totalNilaiUtama =
        def?.agregasi === 'rata-rata'
          ? Number((sum / info.nilaiList.length).toFixed(2))
          : sum;
      return {
        kampanyeAtauKonten,
        platformTerakhir: info.platform,
        pilar: info.pilar,
        totalNilaiUtama,
        jumlahCatatan: info.nilaiList.length,
        periodeTerakhir: info.periodeTerakhir,
      };
    })
    .sort((a, b) => b.totalNilaiUtama - a.totalNilaiUtama);
}

export function evaluasiKesegaranData(
  daftar: SnapshotKpiAktual[],
  waktuReferensiIso?: string,
): StatusKesegaranData {
  const catatanAsli = daftar.filter((s) => !s.dataContoh);
  if (catatanAsli.length === 0) {
    return {
      memilikiData: false,
      tanggalLaporanTerakhir: null,
      sumberTerakhir: null,
      diperbaruiTerakhir: null,
      jamSejakLaporan: null,
      usang: false,
      pesan: 'Belum ada snapshot KPI aktual yang dilaporkan atau diimpor.',
    };
  }

  const terurut = [...catatanAsli].sort((a, b) =>
    b.reportedAt.localeCompare(a.reportedAt),
  );
  const terbaru = terurut[0];
  const refTime = waktuReferensiIso
    ? new Date(waktuReferensiIso).getTime()
    : Date.now();
  const lapTime = new Date(
    terbaru.reportedAt.length === 10
      ? `${terbaru.reportedAt}T12:00:00Z`
      : terbaru.reportedAt,
  ).getTime();

  const selisihJam =
    Number.isNaN(refTime) || Number.isNaN(lapTime)
      ? null
      : Math.max(0, Math.round((refTime - lapTime) / (1000 * 60 * 60)));

  const usang = selisihJam !== null && selisihJam > 72;

  return {
    memilikiData: true,
    tanggalLaporanTerakhir: terbaru.reportedAt,
    sumberTerakhir: terbaru.source,
    diperbaruiTerakhir: terbaru.importedAt,
    jamSejakLaporan: selisihJam,
    usang,
    pesan: usang
      ? `Data terakhir dilaporkan ${selisihJam} jam lalu (> 72 jam). Segera lakukan evaluasi 48–72 jam dan perbarui snapshot.`
      : `Snapshot aktual terbaru tersedia dari ${terbaru.source}.`,
  };
}

export function hitungProyeksiDenganRumus(input: {
  anggaranIdr: number;
  cpmAktualIdr: number | null;
  rasioProfileVisitPer1000: number | null;
  qualifiedInquiryAktual: number | null;
}): HasilKalkulatorKpi {
  if (!Number.isFinite(input.anggaranIdr) || input.anggaranIdr <= 0) {
    return {
      reachEstimasi: null,
      targetProfileVisits: null,
      targetQualifiedInquiries: input.qualifiedInquiryAktual,
      catatanValidasi: 'Masukkan anggaran positif untuk menghitung proyeksi.',
    };
  }

  if (
    input.cpmAktualIdr === null ||
    !Number.isFinite(input.cpmAktualIdr) ||
    input.cpmAktualIdr <= 0
  ) {
    return {
      reachEstimasi: null,
      targetProfileVisits: null,
      targetQualifiedInquiries: input.qualifiedInquiryAktual,
      catatanValidasi:
        'CPM aktual belum tersedia. Kumpulkan baseline 72 jam pertama atau masukkan angka simulasi CPM secara eksplisit.',
    };
  }

  const reachEstimasi = Math.round((input.anggaranIdr / input.cpmAktualIdr) * 1000);
  const targetProfileVisits =
    input.rasioProfileVisitPer1000 !== null &&
    Number.isFinite(input.rasioProfileVisitPer1000) &&
    input.rasioProfileVisitPer1000 >= 0
      ? Math.round(reachEstimasi * (input.rasioProfileVisitPer1000 / 1000))
      : null;

  return {
    reachEstimasi,
    targetProfileVisits,
    targetQualifiedInquiries: input.qualifiedInquiryAktual,
    catatanValidasi: null,
  };
}

export function validasiSnapshotManual(input: {
  kodeMetrik: string;
  periode: string;
  nilai: number;
  source: string;
  reportedAt: string;
  pic: string;
}): { valid: boolean; pesanGalat: string } {
  if (!dapatkanDefinisiMetrik(input.kodeMetrik)) {
    return { valid: false, pesanGalat: 'Metrik KPI tidak dikenali.' };
  }
  if (!POLA_TANGGAL_ISO.test(input.periode.trim())) {
    return { valid: false, pesanGalat: 'Periode wajib berformat YYYY-MM-DD.' };
  }
  if (!Number.isFinite(input.nilai) || input.nilai < 0) {
    return { valid: false, pesanGalat: 'Nilai metrik wajib berupa angka >= 0.' };
  }
  if (!input.source.trim()) {
    return {
      valid: false,
      pesanGalat:
        'Sumber laporan wajib diisi (mis. Meta Ads Manager / TikTok Analytics).',
    };
  }
  if (!POLA_TANGGAL_ISO.test(input.reportedAt.trim())) {
    return {
      valid: false,
      pesanGalat: 'Tanggal laporan (reportedAt) wajib berformat YYYY-MM-DD.',
    };
  }
  if (!input.pic.trim()) {
    return { valid: false, pesanGalat: 'PIC pencatat wajib diisi.' };
  }
  return { valid: true, pesanGalat: '' };
}

export function validasiBaseline72Jam(
  b: Partial<Baseline72Jam>,
): { valid: boolean; pesanGalat: string } {
  if (!b.source?.trim()) {
    return { valid: false, pesanGalat: 'Sumber data baseline 72 jam wajib diisi.' };
  }
  if (!b.reportedAt || !POLA_TANGGAL_ISO.test(b.reportedAt.trim())) {
    return {
      valid: false,
      pesanGalat: 'Tanggal laporan baseline wajib berformat YYYY-MM-DD.',
    };
  }
  if (!b.dicatatOleh?.trim()) {
    return { valid: false, pesanGalat: 'Nama PIC pencatat baseline wajib diisi.' };
  }
  const adaMinimalSatuAngka = [
    b.medianReachOrganikPerPost,
    b.averageWatchTimeDetik,
    b.profileVisitsPer1000Reach,
    b.saveShareRatePersen,
    b.cpmAktualIdr,
    b.costPerThruPlayIdr,
  ].some((v) => v !== null && v !== undefined && Number.isFinite(v) && v >= 0);

  if (!adaMinimalSatuAngka) {
    return {
      valid: false,
      pesanGalat: 'Isi minimal satu angka metrik baseline aktual yang sudah terukur.',
    };
  }
  return { valid: true, pesanGalat: '' };
}

export function validasiInquiryKualifikasi(input: {
  tanggal: string;
  pengirimOrganisasi: string;
  ringkasanPesan: string;
  terkualifikasi: boolean;
  alasanKualifikasi: string;
  dinilaiOleh: string;
}): { valid: boolean; pesanGalat: string } {
  if (!POLA_TANGGAL_ISO.test(input.tanggal.trim())) {
    return { valid: false, pesanGalat: 'Tanggal inquiry wajib berformat YYYY-MM-DD.' };
  }
  if (!input.pengirimOrganisasi.trim()) {
    return {
      valid: false,
      pesanGalat: 'Nama pengirim / organisasi wajib diisi.',
    };
  }
  if (!input.ringkasanPesan.trim()) {
    return { valid: false, pesanGalat: 'Ringkasan pesan/kebutuhan wajib diisi.' };
  }
  if (input.terkualifikasi && !input.alasanKualifikasi.trim()) {
    return {
      valid: false,
      pesanGalat:
        'Alasan kualifikasi (rationale) wajib diisi saat menandai inquiry sebagai Qualified.',
    };
  }
  if (!input.dinilaiOleh.trim()) {
    return { valid: false, pesanGalat: 'Nama penilai (PIC/Manager) wajib diisi.' };
  }
  return { valid: true, pesanGalat: '' };
}

// ---------- Parser CSV & Column Mapping Wizard ----------

function pecahBarisCsv(baris: string): string[] {
  const hasil: string[] = [];
  let saatIni = '';
  let dalamKutip = false;

  for (let i = 0; i < baris.length; i += 1) {
    const ch = baris[i];
    if (ch === '"') {
      if (dalamKutip && baris[i + 1] === '"') {
        saatIni += '"';
        i += 1;
      } else {
        dalamKutip = !dalamKutip;
      }
    } else if (ch === ',' && !dalamKutip) {
      hasil.push(saatIni.trim());
      saatIni = '';
    } else {
      saatIni += ch;
    }
  }
  hasil.push(saatIni.trim());
  return hasil;
}

export function ekstrakHeaderCsv(teksCsv: string): {
  header: string[];
  barisData: string[][];
  pemetaanOtomatis: PemetaanKolomCsvKpi;
} {
  const barisMentah = teksCsv
    .split(/\r?\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  if (barisMentah.length === 0) {
    return {
      header: [],
      barisData: [],
      pemetaanOtomatis: {
        metrik: '',
        platform: '',
        periode: '',
        nilai: '',
        source: '',
        reportedAt: '',
        kampanyeAtauKonten: '',
        pilar: '',
        pic: '',
        notes: '',
      },
    };
  }

  const header = pecahBarisCsv(barisMentah[0]);
  const barisData = barisMentah.slice(1).map((b) => pecahBarisCsv(b));

  const cariHeader = (kandidat: string[]): string => {
    for (const h of header) {
      const norm = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (kandidat.some((k) => norm.includes(k))) return h;
    }
    return '';
  };

  return {
    header,
    barisData,
    pemetaanOtomatis: {
      metrik: cariHeader(['metrik', 'metric', 'kpi']),
      platform: cariHeader(['platform', 'channel', 'kanal']),
      periode: cariHeader(['periode', 'period', 'date', 'tanggal', 'tgl']),
      nilai: cariHeader(['nilai', 'value', 'amount', 'hasil', 'angka']),
      source: cariHeader(['sumber', 'source']),
      reportedAt: cariHeader(['tanggallaporan', 'reportedat', 'reported']),
      kampanyeAtauKonten: cariHeader(['kampanye', 'campaign', 'konten', 'content']),
      pilar: cariHeader(['pilar', 'pillar']),
      pic: cariHeader(['pic', 'owner', 'pencatat']),
      notes: cariHeader(['catatan', 'notes', 'note']),
    },
  };
}

function normalisasiKodeMetrik(mentah: string): DefinisiMetrikKpi | undefined {
  const norm = mentah.trim().toLowerCase().replace(/\s+/g, '_');
  return DEFINISI_METRIK_KPI_KANONIK.find(
    (m) =>
      m.kode === norm ||
      m.nama.toLowerCase() === mentah.trim().toLowerCase() ||
      m.nama.toLowerCase().includes(mentah.trim().toLowerCase()),
  );
}

function normalisasiPlatform(mentah: string): PlatformKpi | null {
  const norm = mentah.trim().toLowerCase();
  if (norm === 'instagram' || norm === 'ig') return 'instagram';
  if (norm === 'facebook' || norm === 'fb') return 'facebook';
  if (norm === 'tiktok' || norm === 'tt') return 'tiktok';
  if (norm === 'meta-ads' || norm === 'meta ads' || norm === 'meta') return 'meta-ads';
  if (norm === 'tiktok-ads' || norm === 'tiktok ads') return 'tiktok-ads';
  if (norm === 'direct-outreach' || norm === 'outreach' || norm === 'dm') return 'direct-outreach';
  if (norm === 'analytics' || norm === 'search') return 'analytics';
  return null;
}

function bersihkanAngkaMataUang(mentah: string): number {
  const bersih = mentah
    .trim()
    .replace(/^rp\.?\s*/i, '')
    .replace(/%$/, '')
    .replace(/\s+/g, '');
  // Jika ada format ribuan Indonesia mis. 12.500 (tanpa koma) vs desimal 12.5
  if (/^\d{1,3}(\.\d{3})+$/.test(bersih)) {
    return Number(bersih.replace(/\./g, ''));
  }
  return Number(bersih.replace(/,/g, ''));
}

function normalisasiPilar(mentah: string): PilarKonten | undefined {
  const norm = mentah.trim().toLowerCase();
  if (
    norm === 'founder' ||
    norm === 'designer' ||
    norm === 'heritage' ||
    norm === 'product' ||
    norm === 'event'
  ) {
    return norm;
  }
  return undefined;
}

function kunciDuplikatSnapshot(s: {
  kodeMetrik: string;
  platform: PlatformKpi;
  periode: string;
  kampanyeAtauKonten: string;
}): string {
  return `${s.kodeMetrik}|${s.platform}|${s.periode}|${s.kampanyeAtauKonten.trim().toLowerCase()}`;
}

export function validasiDanPratinjauCsvKpi(input: {
  teksCsv: string;
  pemetaan: PemetaanKolomCsvKpi;
  snapshotExisting: SnapshotKpiAktual[];
  defaultPic?: string;
}): HasilPratinjauCsvKpi {
  const { header, barisData } = ekstrakHeaderCsv(input.teksCsv);
  if (header.length === 0 || barisData.length === 0) {
    return {
      headerCsv: header,
      barisValid: [],
      galatBaris: ['CSV kosong atau tidak memiliki baris data setelah header.'],
      jumlahDuplikat: 0,
    };
  }

  const indeksKolom = (namaHeader: string) =>
    namaHeader ? header.indexOf(namaHeader) : -1;

  const idxMetrik = indeksKolom(input.pemetaan.metrik);
  const idxPlatform = indeksKolom(input.pemetaan.platform);
  const idxPeriode = indeksKolom(input.pemetaan.periode);
  const idxNilai = indeksKolom(input.pemetaan.nilai);
  const idxSource = indeksKolom(input.pemetaan.source);
  const idxReportedAt = indeksKolom(input.pemetaan.reportedAt);
  const idxKampanye = indeksKolom(input.pemetaan.kampanyeAtauKonten);
  const idxPilar = indeksKolom(input.pemetaan.pilar);
  const idxPic = indeksKolom(input.pemetaan.pic);
  const idxNotes = indeksKolom(input.pemetaan.notes);

  if (
    idxMetrik < 0 ||
    idxPlatform < 0 ||
    idxPeriode < 0 ||
    idxNilai < 0 ||
    idxSource < 0
  ) {
    return {
      headerCsv: header,
      barisValid: [],
      galatBaris: [
        'Pemetaan kolom wajib lengkap untuk: Metrik, Platform, Periode, Nilai, dan Sumber.',
      ],
      jumlahDuplikat: 0,
    };
  }

  const setExisting = new Set(
    input.snapshotExisting.map((s) => kunciDuplikatSnapshot(s)),
  );
  const setCsv = new Set<string>();
  const barisValid: BarisValidCsvKpi[] = [];
  const galatBaris: string[] = [];
  let jumlahDuplikat = 0;

  barisData.forEach((kol, idx) => {
    const nomorBaris = idx + 2;
    const nilaiMetrikRaw = kol[idxMetrik] ?? '';
    const nilaiPlatformRaw = kol[idxPlatform] ?? '';
    const nilaiPeriodeRaw = kol[idxPeriode] ?? '';
    const nilaiAngkaRaw = kol[idxNilai] ?? '';
    const nilaiSourceRaw = kol[idxSource] ?? '';
    const nilaiReportedRaw =
      idxReportedAt >= 0 && kol[idxReportedAt]
        ? kol[idxReportedAt]
        : nilaiPeriodeRaw;
    const kampanye = idxKampanye >= 0 ? (kol[idxKampanye] ?? '').trim() : '';
    const pilar = idxPilar >= 0 ? normalisasiPilar(kol[idxPilar] ?? '') : undefined;
    const pic =
      idxPic >= 0 && (kol[idxPic] ?? '').trim()
        ? (kol[idxPic] ?? '').trim()
        : (input.defaultPic ?? 'Digital Manager');
    const notes = idxNotes >= 0 ? (kol[idxNotes] ?? '').trim() : '';

    const defMetrik = normalisasiKodeMetrik(nilaiMetrikRaw);
    if (!defMetrik) {
      galatBaris.push(
        `Baris ${nomorBaris}: metrik "${nilaiMetrikRaw}" tidak cocok dengan daftar KPI kanonik.`,
      );
      return;
    }

    const platform = normalisasiPlatform(nilaiPlatformRaw);
    if (!platform) {
      galatBaris.push(
        `Baris ${nomorBaris}: platform "${nilaiPlatformRaw}" tidak valid.`,
      );
      return;
    }

    if (!POLA_TANGGAL_ISO.test(nilaiPeriodeRaw)) {
      galatBaris.push(
        `Baris ${nomorBaris}: periode "${nilaiPeriodeRaw}" wajib berformat YYYY-MM-DD.`,
      );
      return;
    }

    if (!POLA_TANGGAL_ISO.test(nilaiReportedRaw)) {
      galatBaris.push(
        `Baris ${nomorBaris}: tanggal laporan "${nilaiReportedRaw}" wajib berformat YYYY-MM-DD.`,
      );
      return;
    }

    const nilaiAngka = bersihkanAngkaMataUang(nilaiAngkaRaw);
    if (!Number.isFinite(nilaiAngka) || nilaiAngka < 0) {
      galatBaris.push(
        `Baris ${nomorBaris}: nilai "${nilaiAngkaRaw}" bukan angka/nominal valid.`,
      );
      return;
    }

    if (!nilaiSourceRaw.trim()) {
      galatBaris.push(`Baris ${nomorBaris}: sumber laporan wajib diisi.`);
      return;
    }

    const kunci = kunciDuplikatSnapshot({
      kodeMetrik: defMetrik.kode,
      platform,
      periode: nilaiPeriodeRaw,
      kampanyeAtauKonten: kampanye,
    });

    let duplikatDengan: BarisValidCsvKpi['duplikatDengan'] = null;
    if (setExisting.has(kunci)) {
      duplikatDengan = 'existing';
      jumlahDuplikat += 1;
    } else if (setCsv.has(kunci)) {
      duplikatDengan = 'csv';
      jumlahDuplikat += 1;
    }
    setCsv.add(kunci);

    barisValid.push({
      nomorBaris,
      grup: defMetrik.grup,
      kodeMetrik: defMetrik.kode,
      namaMetrik: defMetrik.nama,
      platform,
      periode: nilaiPeriodeRaw,
      nilai: nilaiAngka,
      source: nilaiSourceRaw.trim(),
      reportedAt: nilaiReportedRaw,
      kampanyeAtauKonten: kampanye,
      pilar,
      pic,
      notes,
      duplikatDengan,
    });
  });

  return {
    headerCsv: header,
    barisValid,
    galatBaris,
    jumlahDuplikat,
  };
}
