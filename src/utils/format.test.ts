import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dapatkanLabelPeran,
  dapatkanLabelStatus,
  formatAngka,
  formatRupiah,
  formatTanggalWib,
} from './format';
import { cariRuteAktif, PETA_NAVIGASI } from './navigasi';

test('formatRupiah memformat angka Indonesia tanpa desimal dan menangani nilai kosong', () => {
  assert.equal(formatRupiah(9085000).replace(/\u00a0/g, ' '), 'Rp 9.085.000');
  assert.equal(formatRupiah(null), 'Belum diisi');
  assert.equal(formatRupiah(undefined), 'Belum diisi');
});

test('formatAngka memformat angka ribuan Indonesia dan menangani nilai kosong', () => {
  assert.equal(formatAngka(16982000), '16.982.000');
  assert.equal(formatAngka(null), 'Belum diisi');
});

test('formatTanggalWib memformat tanggal ke zona Asia/Jakarta', () => {
  const hasil = formatTanggalWib('2026-12-18T10:00:00+07:00');
  assert.match(hasil, /18 Des 2026/);
  assert.equal(formatTanggalWib(null), 'Belum diisi');
  assert.equal(formatTanggalWib('bukan-tanggal'), 'Tanggal tidak valid');
});

test('dapatkanLabelStatus dan dapatkanLabelPeran mengembalikan label yang tepat', () => {
  assert.equal(dapatkanLabelStatus('planned').label, 'Rencana');
  assert.equal(dapatkanLabelStatus('actual').label, 'Aktual');
  assert.equal(dapatkanLabelPeran('digital-manager'), 'Digital Manager');
  assert.equal(dapatkanLabelPeran(null), 'Belum terautentikasi');
});

test('PETA_NAVIGASI memiliki 9 rute inti dan cariRuteAktif mencocokkan jalur dengan tepat', () => {
  assert.equal(PETA_NAVIGASI.length, 9);
  assert.equal(cariRuteAktif('/')?.id, 'ide');
  assert.equal(cariRuteAktif('/rencana')?.id, 'ide');
  assert.equal(cariRuteAktif('/kalender')?.id, 'kalender');
  assert.equal(cariRuteAktif('/iklan/detail')?.id, 'iklan');
  assert.equal(cariRuteAktif('/rute-asing'), undefined);
});
