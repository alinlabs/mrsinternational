import test from 'node:test';
import assert from 'node:assert/strict';
import { KONSEP_KONTEN_KANONIK } from '../data/kalender-kanonik';
import { hitungProgresKonten } from './beranda';
import {
  FILTER_KALENDER_DEFAULT,
  filterKonsepKonten,
  gabungkanKonsepDenganEdit,
  hitungStatistikKalender,
  kelompokkanPerHari,
  konversiKeCatatanStatusBeranda,
  validasiPerubahanKonten,
} from './kalender';

test('KONSEP_KONTEN_KANONIK memiliki tepat 22 tanggal, 44 video master, dan 22 desain master', () => {
  const statistik = hitungStatistikKalender(KONSEP_KONTEN_KANONIK);
  assert.equal(statistik.jumlahTanggal, 22);
  assert.equal(statistik.totalMaster, 66);
  assert.equal(statistik.totalVideo, 44);
  assert.equal(statistik.totalDesain, 22);
  assert.equal(statistik.masihRencana, 66);
  assert.equal(statistik.selesai, 0);

  const bundelHarian = kelompokkanPerHari(KONSEP_KONTEN_KANONIK);
  assert.equal(bundelHarian.length, 22);
  assert.equal(bundelHarian[0]?.tanggal, '2026-11-26');
  assert.equal(bundelHarian[21]?.tanggal, '2026-12-17');

  for (const hari of bundelHarian) {
    assert.ok(hari.videoA, `Video A harus ada pada ${hari.tanggal}`);
    assert.ok(hari.videoB, `Video B harus ada pada ${hari.tanggal}`);
    assert.ok(hari.design, `Design harus ada pada ${hari.tanggal}`);
  }
});

test('Seluruh seed kalender berstatus planned, urlTerbit kosong, dan mirror kanal benar tanpa duplikasi konsep', () => {
  for (const item of KONSEP_KONTEN_KANONIK) {
    assert.equal(item.status, 'planned');
    assert.equal(item.urlTerbit, '');
    assert.equal(item.tanggalTerbitAktual, '');
    assert.equal(item.adalahRencanaAwal, true);

    const daftarKanal = item.distribusiKanal.map((d) => d.kanal);
    if (item.jenisMaster === 'video') {
      assert.deepEqual(daftarKanal, ['instagram', 'facebook', 'tiktok']);
    } else {
      assert.deepEqual(daftarKanal, ['instagram', 'facebook']);
    }
  }
});

test('filterKonsepKonten menyaring berdasarkan tanggal, pilar, kanal, status, PIC, dan kata kunci', () => {
  const hanyaTikTok = filterKonsepKonten(KONSEP_KONTEN_KANONIK, {
    ...FILTER_KALENDER_DEFAULT,
    kanal: 'tiktok',
  });
  assert.equal(hanyaTikTok.length, 44);

  const hanyaTanggalAwal = filterKonsepKonten(KONSEP_KONTEN_KANONIK, {
    ...FILTER_KALENDER_DEFAULT,
    tanggal: '2026-11-26',
  });
  assert.equal(hanyaTanggalAwal.length, 3);

  const hanyaRaden = filterKonsepKonten(KONSEP_KONTEN_KANONIK, {
    ...FILTER_KALENDER_DEFAULT,
    pilar: 'designer',
    pic: 'Raden',
  });
  assert.ok(hanyaRaden.length > 0);
  assert.ok(hanyaRaden.every((item) => item.pilar === 'designer' && item.pic.includes('Raden')));

  const cariGhivany = filterKonsepKonten(KONSEP_KONTEN_KANONIK, {
    ...FILTER_KALENDER_DEFAULT,
    kataKunci: 'Ghivany',
  });
  assert.ok(cariGhivany.length >= 3);
});

test('gabungkanKonsepDenganEdit memperbarui progres Beranda secara akurat', () => {
  const diedit = gabungkanKonsepDenganEdit(KONSEP_KONTEN_KANONIK, {
    '2026-11-26-video-a': { status: 'approved' },
    '2026-11-26-design': { status: 'published', urlTerbit: 'https://instagram.com/p/abc' },
    '2026-11-27-video-a': { status: 'editing' },
  });

  const progresBeranda = hitungProgresKonten(konversiKeCatatanStatusBeranda(diedit));
  assert.equal(progresBeranda.totalRencana, 66);
  assert.equal(progresBeranda.selesai, 2);
  assert.equal(progresBeranda.dalamProses, 1);
  assert.equal(progresBeranda.belumDimulai, 63);
});

test('validasiPerubahanKonten menegakkan aturan CTA bebas jual tiket/walk-in, bukti persetujuan, dan URL terbit', () => {
  const galatPublik = validasiPerubahanKonten({
    cta: 'Beli tiket dan datang sekarang!',
    status: 'published',
    urlTerbit: 'bukan-url',
  });
  assert.ok(galatPublik.cta);
  assert.ok(galatPublik.urlTerbit);

  const galatApproval = validasiPerubahanKonten({
    status: 'approved',
    persetujuan: {
      status: 'disetujui',
      disetujuiOleh: '',
      tanggalDisetujui: '',
      catatan: '',
    },
  });
  assert.ok(galatApproval.disetujuiOleh);
  assert.ok(galatApproval.tanggalDisetujui);

  const valid = validasiPerubahanKonten({
    status: 'approved',
    cta: 'Ikuti perjalanan Ragi Hotang di akun ini.',
    persetujuan: {
      status: 'disetujui',
      disetujuiOleh: 'Melfarina Sianipar (Owner)',
      tanggalDisetujui: '2026-11-25',
      catatan: 'Disetujui tanpa revisi',
    },
  });
  assert.deepEqual(valid, {});
});
