import test from 'node:test';
import assert from 'node:assert/strict';
import { hitungMetrikIndikatorScroll } from './indikator-scroll';

test('mengembalikan non-aktif bila kontainer tidak punya luapan scroll vertikal', () => {
  const hasil = hitungMetrikIndikatorScroll({
    scrollTop: 0,
    scrollHeight: 800,
    clientHeight: 800,
    rectTop: 64,
    rectHeight: 800,
    rectRight: 1440,
    viewportWidth: 1440,
  });
  assert.equal(hasil.aktif, false);
});

test('menghitung posisi atas, bawah, dan jarak kanan paling tepi secara presisi', () => {
  const awal = hitungMetrikIndikatorScroll({
    scrollTop: 0,
    scrollHeight: 2400,
    clientHeight: 800,
    rectTop: 100,
    rectHeight: 800,
    rectRight: 1440,
    viewportWidth: 1440,
  });
  assert.equal(awal.aktif, true);
  assert.equal(awal.topPx, 106);
  assert.equal(awal.rightPx, 3);
  assert.ok(awal.heightPx >= 28);

  const akhir = hitungMetrikIndikatorScroll({
    scrollTop: 1600,
    scrollHeight: 2400,
    clientHeight: 800,
    rectTop: 100,
    rectHeight: 800,
    rectRight: 1440,
    viewportWidth: 1440,
  });
  assert.equal(akhir.aktif, true);
  assert.equal(akhir.topPx + akhir.heightPx, 100 + 800 - 6);
  assert.equal(akhir.rightPx, 3);
});

test('menjaga tinggi minimum thumb untuk halaman yang sangat panjang', () => {
  const hasil = hitungMetrikIndikatorScroll({
    scrollTop: 5000,
    scrollHeight: 50000,
    clientHeight: 600,
    rectTop: 0,
    rectHeight: 600,
    rectRight: 390,
    viewportWidth: 390,
  });
  assert.equal(hasil.aktif, true);
  assert.equal(hasil.heightPx, 28);
  assert.equal(hasil.rightPx, 3);
});
