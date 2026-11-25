import test from 'node:test';
import assert from 'node:assert/strict';
import { STATE_AWAL_IKLAN_ANGGARAN } from '../data/iklan-kanonik';
import { KONSEP_KONTEN_KANONIK } from '../data/kalender-kanonik';
import { STATE_AWAL_KPI_MONITORING } from '../data/kpi-kanonik';
import {
  BANK_PERTANYAAN_KANONIK,
  CHECKLIST_SHOOTING_KANONIK,
  DAFTAR_TUGAS_AWAL,
  DELIVERABLES_EDITING_KANONIK,
  SESI_SHOOTING_KANONIK,
} from '../data/produksi-kanonik';
import type { JenisLaporanId, SumberDataLaporan } from '../types/laporan';
import type { StatusStateProduksi } from '../types/produksi';
import type { RecordStakeholder } from '../types/stakeholder';
import type { SesiPengguna } from '../types/status';
import {
  DAFTAR_JENIS_LAPORAN,
  bangunDokumenLaporan,
  buatKonfigurasiLaporanDefault,
  buatNamaFileLaporan,
} from './laporan';
import { buatPdfBlobLaporan, sanitasiTeksPdf } from './laporan-pdf';

const STATE_PRODUKSI_AWAL: StatusStateProduksi = {
  daftarTugas: DAFTAR_TUGAS_AWAL,
  daftarSesiShooting: SESI_SHOOTING_KANONIK,
  checklistShooting: CHECKLIST_SHOOTING_KANONIK,
  bankPertanyaan: BANK_PERTANYAAN_KANONIK,
  daftarDeliverables: DELIVERABLES_EDITING_KANONIK,
};

const SESI_DIGITAL_MANAGER: SesiPengguna = {
  terautentikasi: true,
  namaTampilan: 'Digital Manager Uji',
  email: 'dm@ragihotang.test',
  peran: 'digital-manager',
  statusSesi: 'active',
};

const SESI_VIEWER: SesiPengguna = {
  terautentikasi: true,
  namaTampilan: 'Viewer Tamu',
  email: 'viewer@ragihotang.test',
  peran: 'viewer',
  statusSesi: 'active',
};

const WAKTU_UJI = new Date('2026-11-24T08:30:00.000Z'); // 15:30 WIB, 2026-11-24

const CONTOH_STAKEHOLDER: RecordStakeholder = {
  id: 'stk-uji-1',
  namaLengkap: 'Ibu Contoh Kurator',
  jabatanOrganisasi: 'Kurator Galeri Tekstil Nusantara',
  kategori: 'commercial',
  prioritas: 'A',
  relevansi: 'Kurasi butik premium Jakarta',
  relationshipOwner: 'PIC Stakeholder',
  sumberKontak: 'Referensi internal tim',
  channelUtama: 'whatsapp',
  contactValue: '+6281234567890',
  konteksRelasi: 'Meminta jadwal pratinjau koleksi',
  consentToPublish: false,
  statusPipeline: 'replied',
  lastOutreachAt: '2026-11-22',
  responTerakhir: 'Tertarik menerima lookbook',
  nextAction: 'Kirim ringkasan acara private',
  dueDate: '2026-11-28',
  catatanPrivat: 'Catatan rahasia: preferensi pertemuan pagi hari.',
  kontakTersensor: false,
  skor: {
    relevansi: 5,
    influence: 4,
    peluangNyata: 4,
    kedekatanHubungan: 3,
    totalSkor: 85,
    penjelasanSkor: 'Skor uji 85/100',
  },
  logOutreach: [],
  dibuatPada: '2026-11-20T09:00:00.000Z',
  diperbaruiPada: '2026-11-22T09:00:00.000Z',
};

function buatSumber(
  jenis: JenisLaporanId,
  override: Partial<SumberDataLaporan> = {},
): SumberDataLaporan {
  return {
    konfigurasi: buatKonfigurasiLaporanDefault(jenis),
    sesi: SESI_DIGITAL_MANAGER,
    daftarKonten: KONSEP_KONTEN_KANONIK,
    stateProduksi: STATE_PRODUKSI_AWAL,
    stateIklan: STATE_AWAL_IKLAN_ANGGARAN,
    stateKpi: STATE_AWAL_KPI_MONITORING,
    modeContohKpi: false,
    daftarStakeholder: [],
    daftarAset: [],
    waktuSekarang: WAKTU_UJI,
    ...override,
  };
}

test('penamaan file PDF bertanggal WIB memakai konvensi RagiHotang-<Jenis>-YYYY-MM-DD.pdf', () => {
  assert.equal(
    buatNamaFileLaporan('executive-brief', WAKTU_UJI),
    'RagiHotang-ExecutiveBrief-2026-11-24.pdf',
  );
  assert.equal(
    buatNamaFileLaporan('content-calendar', WAKTU_UJI),
    'RagiHotang-KalenderKonten-2026-11-24.pdf',
  );
  assert.equal(
    buatNamaFileLaporan('stakeholder-pipeline', WAKTU_UJI),
    'RagiHotang-StakeholderPipeline-2026-11-24.pdf',
  );
});

test('semua 7 jenis laporan terbangun lengkap dengan penandaan integritas tanpa data aktual karangan', () => {
  assert.equal(DAFTAR_JENIS_LAPORAN.length, 7);

  for (const def of DAFTAR_JENIS_LAPORAN) {
    const dok = bangunDokumenLaporan(buatSumber(def.id));
    assert.equal(dok.jenis, def.id);
    assert.ok(dok.judul.length > 0);
    assert.ok(dok.bagian.length >= 1);
    assert.ok(dok.ringkasanMetrik.length === 4);
    assert.ok(dok.dibuatPadaLabelWib.includes('WIB'));
    assert.ok(dok.piiDisertakan === false);
  }

  // Pastikan kalender awal persis 66 master konten (44 video + 22 desain)
  const dokKalender = bangunDokumenLaporan(buatSumber('content-calendar'));
  assert.equal(dokKalender.bagian[0].baris.length, 66);

  // Pastikan KPI kosong tidak mengarang benchmark/angka dan tidak berlabel Data contoh
  const dokKpi = bangunDokumenLaporan(buatSumber('kpi-monitoring'));
  const teksKpi = JSON.stringify(dokKpi.bagian);
  assert.ok(teksKpi.includes('Belum diisi'));
  assert.equal(dokKpi.bagian[0].labelStatus, 'Belum diisi');

  // Pastikan mode contoh KPI menandai peringatan Data contoh secara eksplisit
  const dokKpiContoh = bangunDokumenLaporan(
    buatSumber('kpi-monitoring', { modeContohKpi: true }),
  );
  assert.equal(dokKpiContoh.bagian[0].labelStatus, 'Data contoh');
  assert.ok(
    dokKpiContoh.catatanIntegritas.some((c) => c.includes('DATA CONTOH')),
  );
});

test('kontak pribadi stakeholder (PII) teredaksi default dan peran viewer tetap diblokir meski flag paksa true', () => {
  const konfPaksaBuka = {
    ...buatKonfigurasiLaporanDefault('stakeholder-pipeline'),
    sertakanCatatanInternal: true,
    sertakanKontakPribadiStakeholder: true,
  };

  // 1. Default aman (flag false meski digital-manager)
  const dokDefault = bangunDokumenLaporan(
    buatSumber('stakeholder-pipeline', {
      daftarStakeholder: [CONTOH_STAKEHOLDER],
    }),
  );
  const isiDefault = JSON.stringify(dokDefault.bagian);
  assert.equal(dokDefault.piiDisertakan, false);
  assert.ok(isiDefault.includes('[TEREDAKSI — PRIVASI]'));
  assert.equal(isiDefault.includes('+6281234567890'), false);
  assert.equal(isiDefault.includes('preferensi pertemuan pagi hari'), false);

  // 2. Peran viewer memaksa flag true -> tetap terblokir & teredaksi
  const dokViewer = bangunDokumenLaporan(
    buatSumber('stakeholder-pipeline', {
      konfigurasi: konfPaksaBuka,
      sesi: SESI_VIEWER,
      daftarStakeholder: [CONTOH_STAKEHOLDER],
    }),
  );
  const isiViewer = JSON.stringify(dokViewer.bagian);
  assert.equal(dokViewer.piiDisertakan, false);
  assert.equal(dokViewer.catatanInternalDisertakan, false);
  assert.equal(isiViewer.includes('+6281234567890'), false);

  // 3. Peran berwenang (digital-manager) dengan konfirmasi eksplisit -> baru menyertakan PII
  const dokBerwenang = bangunDokumenLaporan(
    buatSumber('stakeholder-pipeline', {
      konfigurasi: konfPaksaBuka,
      sesi: SESI_DIGITAL_MANAGER,
      daftarStakeholder: [CONTOH_STAKEHOLDER],
    }),
  );
  const isiBerwenang = JSON.stringify(dokBerwenang.bagian);
  assert.equal(dokBerwenang.piiDisertakan, true);
  assert.equal(dokBerwenang.catatanInternalDisertakan, true);
  assert.ok(isiBerwenang.includes('+6281234567890'));
  assert.ok(isiBerwenang.includes('preferensi pertemuan pagi hari'));
});

test('generator PDF vektor menghasilkan header %PDF valid, multi-halaman untuk 66 konten, dan aman terhadap teks panjang', async () => {
  // Uji 66 baris kalender pada A4 Landscape -> harus otomatis multi-halaman
  const dokKalender = bangunDokumenLaporan(buatSumber('content-calendar'));
  const pdfKalender = buatPdfBlobLaporan(dokKalender);

  assert.ok(pdfKalender.jumlahHalaman >= 2, `Halaman PDF hanya ${pdfKalender.jumlahHalaman}`);
  assert.ok(pdfKalender.ukuranBytes > 5000);
  assert.equal(pdfKalender.blob.type, 'application/pdf');
  assert.ok(pdfKalender.base64.length > 1000);

  const bytesAwal = new Uint8Array(await pdfKalender.blob.slice(0, 5).arrayBuffer());
  const headerPdf = String.fromCharCode(...bytesAwal);
  assert.equal(headerPdf, '%PDF-');

  // Uji edge-case: KPI kosong + teks panjang + judul panjang pada Portrait & Landscape
  const dokPanjang = bangunDokumenLaporan(
    buatSumber('executive-brief', {
      konfigurasi: {
        ...buatKonfigurasiLaporanDefault('executive-brief'),
        orientasi: 'portrait',
      },
    }),
  );
  dokPanjang.judul =
    'Executive Brief Kampanye Peluncuran Ragi Hotang — Uji Judul Panjang Multi-Baris 2026';
  dokPanjang.bagian[0].baris.push([
    'Sel Teks Sangat Panjang Untuk Pengujian Wrap',
    'Narasi sangat panjang tanpa putus baris yang disengaja untuk memastikan autotable melakukan linebreak secara rapi tanpa overflow melebihi margin halaman A4 portrait maupun landscape pada zoom 200 persen. '.repeat(
      3,
    ),
  ]);

  const pdfPortrait = buatPdfBlobLaporan(dokPanjang);
  assert.ok(pdfPortrait.jumlahHalaman >= 1);
  assert.ok(pdfPortrait.ukuranBytes > 2000);

  // Uji sanitasi karakter non-WinAnsi agar simbol tidak rusak
  assert.equal(sanitasiTeksPdf('26 Nov – 17 Des → ≥ 72 jam'), '26 Nov - 17 Des -> >= 72 jam');
});
