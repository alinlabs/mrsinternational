import test from 'node:test';
import assert from 'node:assert/strict';
import { STATE_AWAL_KPI_MONITORING } from '../data/kpi-kanonik';
import type { PemetaanKolomCsvKpi, SnapshotKpiAktual } from '../types/kpi';
import {
  bangunSeriPerbandinganPeriode,
  ekstrakHeaderCsv,
  evaluasiKesegaranData,
  hitungPeringkatKontenAktual,
  hitungProyeksiDenganRumus,
  hitungRingkasanMetrikGrup,
  validasiBaseline72Jam,
  validasiDanPratinjauCsvKpi,
  validasiInquiryKualifikasi,
  validasiSnapshotManual,
} from './kpi';

test('seed awal KPI kosong tanpa benchmark/angka karangan dan evaluasi kesegaran jujur', () => {
  const ringkasanAwareness = hitungRingkasanMetrikGrup(
    STATE_AWAL_KPI_MONITORING.daftarSnapshot,
    'awareness',
  );
  assert.ok(ringkasanAwareness.every((r) => r.nilaiAgregat === null));
  const kesegaran = evaluasiKesegaranData(STATE_AWAL_KPI_MONITORING.daftarSnapshot);
  assert.equal(kesegaran.memilikiData, false);
  assert.equal(kesegaran.usang, false);
});

test('peringatan data usang aktif jika reportedAt lebih dari 72 jam lalu', () => {
  const contohLama: SnapshotKpiAktual[] = [
    {
      id: 'snap-1',
      grup: 'awareness',
      kodeMetrik: 'unique_reach',
      platform: 'meta-ads',
      periode: '2026-11-29',
      kampanyeAtauKonten: 'Meta Flight 1',
      nilai: 12000,
      source: 'Meta Ads Manager',
      reportedAt: '2026-11-29',
      importedAt: '2026-11-29T12:00:00.000Z',
      pic: 'Digital Manager',
      notes: '',
    },
  ];
  const kesegaran = evaluasiKesegaranData(contohLama, '2026-12-03T18:00:00Z');
  assert.equal(kesegaran.memilikiData, true);
  assert.equal(kesegaran.usang, true);
  assert.ok((kesegaran.jamSejakLaporan ?? 0) > 72);
});

test('kalkulator proyeksi memakai rumus kanonik dan menolak CPM nol/kosong', () => {
  const tanpaCpm = hitungProyeksiDenganRumus({
    anggaranIdr: 4200000,
    cpmAktualIdr: 0,
    rasioProfileVisitPer1000: 15,
    qualifiedInquiryAktual: null,
  });
  assert.equal(tanpaCpm.reachEstimasi, null);
  assert.ok(tanpaCpm.catatanValidasi?.includes('CPM aktual belum tersedia'));

  const valid = hitungProyeksiDenganRumus({
    anggaranIdr: 2100000,
    cpmAktualIdr: 25000,
    rasioProfileVisitPer1000: 18,
    qualifiedInquiryAktual: 4,
  });
  // 2.100.000 / 25.000 * 1.000 = 84.000 reach
  assert.equal(valid.reachEstimasi, 84000);
  // 84.000 * (18 / 1000) = 1.512 profile visits
  assert.equal(valid.targetProfileVisits, 1512);
  assert.equal(valid.targetQualifiedInquiries, 4);
});

test('validasi manual snapshot, baseline 72 jam, dan inquiry qualified wajib rationale', () => {
  const snapSalah = validasiSnapshotManual({
    kodeMetrik: 'unique_reach',
    periode: '2026-12-01',
    nilai: 1000,
    source: '',
    reportedAt: '2026-12-01',
    pic: 'DM',
  });
  assert.equal(snapSalah.valid, false);

  const baseSalah = validasiBaseline72Jam({
    source: 'IG Insights',
    reportedAt: '2026-11-29',
    dicatatOleh: 'DM',
  });
  assert.equal(baseSalah.valid, false);

  const inqTanpaAlasan = validasiInquiryKualifikasi({
    tanggal: '2026-12-02',
    pengirimOrganisasi: 'Butik Jakarta',
    ringkasanPesan: 'Tanya lookbook',
    terkualifikasi: true,
    alasanKualifikasi: '',
    dinilaiOleh: 'Digital Manager',
  });
  assert.equal(inqTanpaAlasan.valid, false);

  const inqValid = validasiInquiryKualifikasi({
    tanggal: '2026-12-02',
    pengirimOrganisasi: 'Butik Jakarta',
    ringkasanPesan: 'Meminta lookbook untuk kurasi Q1',
    terkualifikasi: true,
    alasanKualifikasi: 'Buyer fashion terverifikasi dengan kapasitas ritel relevan.',
    dinilaiOleh: 'Digital Manager',
  });
  assert.equal(inqValid.valid, true);
});

test('wizard CSV mendukung pemetaan kolom, pembersihan rupiah, validasi baris, dan deteksi duplikat', () => {
  const csv = [
    'tgl,kanal,nama_kpi,hasil,kampanye,sumber_data,pic',
    '2026-12-01,Meta Ads,CPM,Rp25.000,Flight 1 Hero,Meta Ads Manager,DM',
    '2026-12-01,Meta Ads,CPM,25000,Flight 1 Hero,Meta Ads Manager,DM',
    'bukan-tanggal,Instagram,Profile Visits,abc,IG Bio,IG Insights,DM',
  ].join('\n');

  const ekstrak = ekstrakHeaderCsv(csv);
  const pemetaan: PemetaanKolomCsvKpi = {
    ...ekstrak.pemetaanOtomatis,
    metrik: 'nama_kpi',
    platform: 'kanal',
    periode: 'tgl',
    nilai: 'hasil',
    source: 'sumber_data',
    reportedAt: 'tgl',
    kampanyeAtauKonten: 'kampanye',
    pic: 'pic',
  };

  const pratinjau = validasiDanPratinjauCsvKpi({
    teksCsv: csv,
    pemetaan,
    snapshotExisting: [],
  });

  assert.equal(pratinjau.galatBaris.length, 1);
  assert.equal(pratinjau.barisValid.length, 2);
  assert.equal(pratinjau.barisValid[0].nilai, 25000);
  assert.equal(pratinjau.barisValid[1].duplikatDengan, 'csv');
  assert.equal(pratinjau.jumlahDuplikat, 1);
});

test('grafik periode dan peringkat konten hanya disusun dari catatan aktual', () => {
  const catatan: SnapshotKpiAktual[] = [
    {
      id: '1',
      grup: 'awareness',
      kodeMetrik: 'unique_reach',
      platform: 'meta-ads',
      periode: '2026-12-01',
      kampanyeAtauKonten: 'Hero Ad 45s',
      nilai: 10000,
      source: 'Meta Ads Manager',
      reportedAt: '2026-12-02',
      importedAt: '2026-12-02T09:00:00Z',
      pic: 'DM',
      notes: '',
    },
    {
      id: '2',
      grup: 'awareness',
      kodeMetrik: 'unique_reach',
      platform: 'meta-ads',
      periode: '2026-12-04',
      kampanyeAtauKonten: 'Founder Story',
      nilai: 15000,
      source: 'Meta Ads Manager',
      reportedAt: '2026-12-05',
      importedAt: '2026-12-05T09:00:00Z',
      pic: 'DM',
      notes: '',
    },
  ];
  const seri = bangunSeriPerbandinganPeriode(catatan, 'awareness', 'unique_reach');
  assert.equal(seri.length, 2);
  assert.equal(seri[0].nilai, 10000);
  assert.equal(seri[1].nilai, 15000);

  const peringkat = hitungPeringkatKontenAktual(catatan, 'awareness', 'unique_reach');
  assert.equal(peringkat[0].kampanyeAtauKonten, 'Founder Story');
});
