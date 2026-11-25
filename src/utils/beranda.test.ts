import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAFTAR_STATUS_KONTEN_AWAL,
  FASE_KAMPANYE_KANONIK,
  JADWAL_IKLAN_KANONIK,
  SKENARIO_ANGGARAN_KANONIK,
} from '../data/beranda-kanonik';
import { formatEstimasiRupiah, hitungProgresKonten } from './beranda';

test('DAFTAR_STATUS_KONTEN_AWAL memiliki tepat 44 video dan 22 desain dengan progres awal 0 selesai', () => {
  const progres = hitungProgresKonten(DAFTAR_STATUS_KONTEN_AWAL);
  assert.equal(progres.totalRencana, 66);
  assert.equal(progres.totalVideoRencana, 44);
  assert.equal(progres.totalDesainRencana, 22);
  assert.equal(progres.selesai, 0);
  assert.equal(progres.dalamProses, 0);
  assert.equal(progres.belumDimulai, 66);
  assert.equal(progres.persentaseSelesai, 0);
});

test('hitungProgresKonten menghitung ulang saat ada konten berubah status', () => {
  const simulasi = DAFTAR_STATUS_KONTEN_AWAL.map((item, idx) => {
    if (idx < 3) return { ...item, status: 'published' as const };
    if (idx < 5) return { ...item, status: 'in-progress' as const };
    return item;
  });
  const progres = hitungProgresKonten(simulasi);
  assert.equal(progres.selesai, 3);
  assert.equal(progres.dalamProses, 2);
  assert.equal(progres.belumDimulai, 61);
  assert.equal(progres.persentaseSelesai, 5);
});

test('SKENARIO_ANGGARAN_KANONIK cocok persis dengan angka sumber strategi', () => {
  const hemat = SKENARIO_ANGGARAN_KANONIK.find((s) => s.id === 'hemat');
  const menengah = SKENARIO_ANGGARAN_KANONIK.find((s) => s.id === 'menengah');
  const agresif = SKENARIO_ANGGARAN_KANONIK.find((s) => s.id === 'agresif');

  assert.equal(hemat?.produksiIdr, 4970000);
  assert.equal(hemat?.adsSetupIdr, 150000);
  assert.equal(hemat?.metaIdr, 1400000);
  assert.equal(hemat?.tiktokIdr, 0);
  assert.equal(hemat?.tiktokPerkiraan, false);
  assert.equal(hemat?.totalIdr, 6520000);
  assert.equal(hemat?.totalPerkiraan, false);

  assert.equal(menengah?.produksiIdr, 6570000);
  assert.equal(menengah?.adsSetupIdr, 300000);
  assert.equal(menengah?.metaIdr, 4900000);
  assert.equal(menengah?.tiktokIdr, 3150000);
  assert.equal(menengah?.tiktokPerkiraan, false);
  assert.equal(menengah?.totalIdr, 14920000);
  assert.equal(menengah?.totalPerkiraan, false);

  assert.equal(agresif?.produksiIdr, 8170000);
  assert.equal(agresif?.adsSetupIdr, 500000);
  assert.equal(agresif?.metaIdr, 7000000);
  assert.equal(agresif?.tiktokIdr, 5600000);
  assert.equal(agresif?.tiktokPerkiraan, false);
  assert.equal(agresif?.totalIdr, 21270000);
  assert.equal(agresif?.totalPerkiraan, false);
});

test('FASE_KAMPANYE_KANONIK dan JADWAL_IKLAN_KANONIK lengkap dan berstatus planned', () => {
  assert.equal(FASE_KAMPANYE_KANONIK.length, 6);
  assert.equal(JADWAL_IKLAN_KANONIK.length, 3);
  assert.ok(JADWAL_IKLAN_KANONIK.every((j) => j.status === 'planned'));
  assert.match(formatEstimasiRupiah(14920000, false).replace(/\u00a0/g, ' '), /^Rp 14\.920\.000$/);
  assert.match(formatEstimasiRupiah(14920000, true).replace(/\u00a0/g, ' '), /^±Rp 14\.920\.000$/);
});
