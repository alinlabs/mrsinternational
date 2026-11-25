import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buatDaftarFlightDefault,
  DETAIL_SKENARIO_ANGGARAN_KANONIK,
  KURS_PLANNING_USD_IDR_KANONIK,
  RINCIAN_BIAYA_PRODUKSI_KANONIK,
  STATE_AWAL_IKLAN_ANGGARAN,
} from '../data/iklan-kanonik';
import {
  hitungEstimasiBiayaFlightIdr,
  hitungHariFlight,
  hitungRingkasanPengendalianAnggaran,
  uraiCsvBelanjaAktual,
  validasiBelanjaAktual,
  validasiFormFlight,
  validasiPersetujuanAnggaran,
} from './iklan';

test('Nominal produksi, Meta, TikTok, dan grand total persis sesuai dokumen sumber', () => {
  const sumHematProd = RINCIAN_BIAYA_PRODUKSI_KANONIK.reduce((a, b) => a + b.hematIdr, 0);
  const sumMenengahProd = RINCIAN_BIAYA_PRODUKSI_KANONIK.reduce((a, b) => a + b.menengahIdr, 0);
  const sumAgresifProd = RINCIAN_BIAYA_PRODUKSI_KANONIK.reduce((a, b) => a + b.agresifIdr, 0);

  assert.equal(sumHematProd, 4970000);
  assert.equal(sumMenengahProd, 6570000);
  assert.equal(sumAgresifProd, 8170000);

  const [hemat, menengah, agresif] = DETAIL_SKENARIO_ANGGARAN_KANONIK;
  assert.equal(hemat.contingency10PersenIdr, 0);
  assert.equal(hemat.totalProduksiIdr, 4970000);
  assert.equal(hemat.adsSetupIdr, 150000);
  assert.equal(hemat.metaIdr, 1400000);
  assert.equal(hemat.tiktokIdr, 0);
  assert.equal(hemat.tiktokPerkiraan, false);
  assert.equal(hemat.grandTotalIdr, 6520000);
  assert.equal(hemat.grandTotalPerkiraan, false);

  assert.equal(menengah.contingency10PersenIdr, 0);
  assert.equal(menengah.totalProduksiIdr, 6570000);
  assert.equal(menengah.adsSetupIdr, 300000);
  assert.equal(menengah.metaIdr, 4900000);
  assert.equal(menengah.tiktokIdr, 3150000);
  assert.equal(menengah.tiktokPerkiraan, false);
  assert.equal(menengah.grandTotalIdr, 14920000);
  assert.equal(menengah.grandTotalPerkiraan, false);

  assert.equal(agresif.contingency10PersenIdr, 0);
  assert.equal(agresif.totalProduksiIdr, 8170000);
  assert.equal(agresif.adsSetupIdr, 500000);
  assert.equal(agresif.metaIdr, 7000000);
  assert.equal(agresif.tiktokIdr, 5600000);
  assert.equal(agresif.tiktokPerkiraan, false);
  assert.equal(agresif.grandTotalIdr, 21270000);
  assert.equal(agresif.grandTotalPerkiraan, false);
});

test('Perhitungan hari flight dan biaya IDR per skenario tepat tanpa perkiraan', () => {
  assert.equal(hitungHariFlight('2026-11-29', '2026-12-05'), 7);
  assert.equal(hitungHariFlight('2026-12-04', '2026-12-10'), 7);
  assert.equal(hitungHariFlight('2026-12-11', '2026-12-17'), 7);

  const flightsHemat = buatDaftarFlightDefault('hemat');
  const totalHemat = flightsHemat.reduce(
    (acc, f) => acc + hitungEstimasiBiayaFlightIdr(f, KURS_PLANNING_USD_IDR_KANONIK),
    0,
  );
  assert.equal(totalHemat, 1400000);

  const flightsMenengah = buatDaftarFlightDefault('menengah');
  const totalMenengah = flightsMenengah.reduce(
    (acc, f) => acc + hitungEstimasiBiayaFlightIdr(f, KURS_PLANNING_USD_IDR_KANONIK),
    0,
  );
  assert.equal(totalMenengah, 8050000);

  const flightsAgresif = buatDaftarFlightDefault('agresif');
  const totalAgresif = flightsAgresif.reduce(
    (acc, f) => acc + hitungEstimasiBiayaFlightIdr(f, KURS_PLANNING_USD_IDR_KANONIK),
    0,
  );
  assert.equal(totalAgresif, 12600000);
});

test('Varians bernilai null tanpa actual spend dan guardrail aktif saat estimasi melampaui plafon', () => {
  const ringkasanAwal = hitungRingkasanPengendalianAnggaran(STATE_AWAL_IKLAN_ANGGARAN);
  assert.equal(ringkasanAwal.estimasiAdsSetupIdr, 300000);
  assert.equal(ringkasanAwal.estimasiGrandTotalIdr, 14920000);
  assert.equal(ringkasanAwal.estimasiPerkiraan, false);
  assert.equal(ringkasanAwal.plafonDisetujuiIdr, null);
  assert.equal(ringkasanAwal.totalAktualIdr, null);
  assert.equal(ringkasanAwal.variansTerhadapEstimasiIdr, null);
  assert.equal(ringkasanAwal.melebihiPlafon, false);

  // Setujui plafon Efisien/Hemat (6.520.000) sementara skenario aktif Optimal/Menengah (14.920.000) -> Guardrail menyala
  const denganPlafonKetat = {
    ...STATE_AWAL_IKLAN_ANGGARAN,
    persetujuanAktif: {
      id: 'apr-1',
      skenarioDisetujui: 'hemat' as const,
      disetujuiOleh: 'Melfarina Sianipar',
      peranApprover: 'Owner',
      plafonDisetujuiIdr: 6520000,
      disetujuiPada: '2026-11-24T10:00:00Z',
      catatan: 'Setujui plafon awal hemat',
    },
  };
  const ringkasanGuardrail = hitungRingkasanPengendalianAnggaran(denganPlafonKetat);
  assert.equal(ringkasanGuardrail.melebihiPlafon, true);
  assert.equal(ringkasanGuardrail.selisihTerhadapPlafonIdr, 14920000 - 6520000);
  assert.equal(ringkasanGuardrail.variansTerhadapEstimasiIdr, null);

  // Tambah actual spend -> varians baru dihitung
  const denganAktual = {
    ...denganPlafonKetat,
    daftarBelanjaAktual: [
      {
        id: 'act-1',
        tanggalLaporan: '2026-12-02',
        kategoriPos: 'meta-ads' as const,
        sumberLaporan: 'Meta Ads Manager Billing',
        nominalAktualIdr: 1200000,
        catatan: '3 hari pertama Meta Flight 1',
        dicatatOleh: 'Digital Manager',
        dicatatPada: '2026-12-02T12:00:00Z',
      },
    ],
  };
  const ringkasanDenganAktual = hitungRingkasanPengendalianAnggaran(denganAktual);
  assert.equal(ringkasanDenganAktual.totalAktualIdr, 1200000);
  assert.equal(ringkasanDenganAktual.variansTerhadapEstimasiIdr, 1200000 - 14920000);
});

test('Validasi form flight, approval, actual spend, dan CSV import bekerja ketat', () => {
  assert.equal(
    validasiFormFlight({
      namaCampaign: 'Test',
      tanggalMulai: '2026-12-05',
      tanggalSelesai: '2026-12-01',
      anggaranHarian: 350000,
      jumlahAdGroup: 1,
      objective: 'Awareness',
    }).valid,
    false,
  );

  assert.equal(
    validasiPersetujuanAnggaran({
      disetujuiOleh: '',
      plafonDisetujuiIdr: 6520000,
    }).valid,
    false,
  );

  assert.equal(
    validasiBelanjaAktual({
      tanggalLaporan: '2026-12-02',
      sumberLaporan: '',
      nominalAktualIdr: 500000,
    }).valid,
    false,
  );

  const csvOk = uraiCsvBelanjaAktual(
    'tanggal,kategori,nominal_idr,sumber,catatan\n2026-12-02,meta-ads,1200000,Meta Ads Manager CSV,Flight 1 hari 1-4\n2026-12-03,produksi,2000000,Kuitansi DP Videografer,Termin 1',
    'Digital Manager',
  );
  assert.equal(csvOk.galat, '');
  assert.equal(csvOk.entri.length, 2);
  assert.equal(csvOk.entri[0].nominalAktualIdr, 1200000);
  assert.equal(csvOk.entri[1].kategoriPos, 'produksi');
});
