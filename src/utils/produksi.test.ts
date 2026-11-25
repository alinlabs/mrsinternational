import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BANK_PERTANYAAN_KANONIK,
  CHECKLIST_SHOOTING_KANONIK,
  DAFTAR_TUGAS_AWAL,
  DELIVERABLES_EDITING_KANONIK,
  SESI_SHOOTING_KANONIK,
  STRUKTUR_HERO_AD_KANONIK,
} from '../data/produksi-kanonik';
import type { StatusStateProduksi } from '../types/produksi';
import {
  evaluasiMilestone11Desember,
  hitungStatistikProduksi,
  petakanStatusTugasKeKonten,
  validasiPersetujuanKutipan,
  validasiTugasProduksi,
} from './produksi';

const STATE_AWAL: StatusStateProduksi = {
  daftarTugas: DAFTAR_TUGAS_AWAL,
  daftarSesiShooting: SESI_SHOOTING_KANONIK,
  checklistShooting: CHECKLIST_SHOOTING_KANONIK,
  bankPertanyaan: BANK_PERTANYAAN_KANONIK,
  daftarDeliverables: DELIVERABLES_EDITING_KANONIK,
};

test('Tiga sesi shooting (1 hari iklan 25 Nov & 2 hari short konten 30 Nov, 3 Des) memiliki rundown lengkap', () => {
  assert.equal(SESI_SHOOTING_KANONIK.length, 3);
  assert.equal(SESI_SHOOTING_KANONIK[0]?.tanggal, '2026-11-25');
  assert.equal(SESI_SHOOTING_KANONIK[1]?.tanggal, '2026-11-30');
  assert.equal(SESI_SHOOTING_KANONIK[2]?.tanggal, '2026-12-03');
  assert.equal(SESI_SHOOTING_KANONIK[0]?.daftarSlot.length, 8);
  assert.equal(SESI_SHOOTING_KANONIK[1]?.daftarSlot.length, 8);
  assert.equal(SESI_SHOOTING_KANONIK[2]?.daftarSlot.length, 7);
  assert.equal(SESI_SHOOTING_KANONIK[0]?.lokasiPrivat, '');
});

test('Bank pertanyaan wawancara memuat tepat 8 Melfarina, 7 Raden, 3 Ghivany dengan jawaban kosong', () => {
  const melfarina = BANK_PERTANYAAN_KANONIK.filter((q) => q.narasumber === 'melfarina');
  const raden = BANK_PERTANYAAN_KANONIK.filter((q) => q.narasumber === 'raden');
  const ghivany = BANK_PERTANYAAN_KANONIK.filter((q) => q.narasumber === 'ghivany');

  assert.equal(melfarina.length, 8);
  assert.equal(raden.length, 7);
  assert.equal(ghivany.length, 3);

  for (const q of BANK_PERTANYAAN_KANONIK) {
    assert.equal(q.jawabanTercatat, '');
    assert.equal(q.kutipanDisetujui, '');
    assert.equal(q.statusPersetujuan, 'belum-direkam');
    assert.equal(q.disetujuiOleh, '');
    assert.equal(q.tanggalDisetujui, '');
  }
});

test('Hero Ad struktur memiliki 5 beat 0–60 detik dengan timeline kanonik', () => {
  assert.equal(STRUKTUR_HERO_AD_KANONIK.length, 5);
  assert.equal(STRUKTUR_HERO_AD_KANONIK[0]?.rentangWaktu, '0–3 detik');
  assert.equal(STRUKTUR_HERO_AD_KANONIK[1]?.rentangWaktu, '3–15 detik');
  assert.equal(STRUKTUR_HERO_AD_KANONIK[2]?.rentangWaktu, '15–27 detik');
  assert.equal(STRUKTUR_HERO_AD_KANONIK[3]?.rentangWaktu, '27–43 detik');
  assert.equal(STRUKTUR_HERO_AD_KANONIK[4]?.rentangWaktu, '43–60 detik');
});

test('Kutipan wawancara tidak dapat ditandai approved tanpa jawaban tercatat, approver, dan tanggal', () => {
  const tanpaJawaban = validasiPersetujuanKutipan({
    jawabanTercatat: '',
    statusPersetujuan: 'approved',
    disetujuiOleh: 'Melfarina Sianipar',
    tanggalDisetujui: '2026-11-30',
  });
  assert.ok(tanpaJawaban.jawabanTercatat);

  const tanpaApproverTanggal = validasiPersetujuanKutipan({
    jawabanTercatat: 'Tekstil membawa identitas dan peluang.',
    statusPersetujuan: 'approved',
    disetujuiOleh: '',
    tanggalDisetujui: '',
  });
  assert.ok(tanpaApproverTanggal.disetujuiOleh);
  assert.ok(tanpaApproverTanggal.tanggalDisetujui);

  const sah = validasiPersetujuanKutipan({
    jawabanTercatat: 'Tekstil membawa identitas dan peluang.',
    statusPersetujuan: 'approved',
    disetujuiOleh: 'Melfarina Sianipar',
    tanggalDisetujui: '2026-11-30',
  });
  assert.deepEqual(sah, {});
});

test('Tugas berstatus blocked wajib memiliki alasanBlocked dan status tugas memetakan progres konten', () => {
  const galatBlocked = validasiTugasProduksi({
    judul: 'Shooting Hari 1',
    status: 'blocked',
    alasanBlocked: '',
    approver: 'Owner',
  });
  assert.ok(galatBlocked.alasanBlocked);

  const sahBlocked = validasiTugasProduksi({
    judul: 'Shooting Hari 1',
    status: 'blocked',
    alasanBlocked: 'Menunggu konfirmasi jam kedatangan Raden Sirait',
    approver: 'Owner',
  });
  assert.deepEqual(sahBlocked, {});

  assert.equal(petakanStatusTugasKeKonten('approved'), 'approved');
  assert.equal(petakanStatusTugasKeKonten('editing'), 'editing');
  assert.equal(petakanStatusTugasKeKonten('blocked'), 'blocked');
});

test('Milestone 11 Desember memicu eskalasi bila tugas kritis atau Shoot Hari 2 & 3 belum tuntas', () => {
  const awal = evaluasiMilestone11Desember(STATE_AWAL);
  assert.equal(awal.status, 'perlu-eskalasi');

  const statistikAwal = hitungStatistikProduksi(STATE_AWAL);
  assert.equal(statistikAwal.tugasSelesai, 0);
  assert.equal(statistikAwal.checklistSelesai, 0);
  assert.equal(statistikAwal.kutipanTercatat, 0);

  const sesudahTuntas: StatusStateProduksi = {
    ...STATE_AWAL,
    daftarTugas: DAFTAR_TUGAS_AWAL.map((t) =>
      t.adalahMilestoneKritis11Des ? { ...t, status: 'approved' } : t,
    ),
    daftarSesiShooting: SESI_SHOOTING_KANONIK.map((s) =>
      s.id === 'shoot-hari-2' || s.id === 'shoot-hari-3'
        ? { ...s, statusKesiapan: 'selesai' }
        : s,
    ),
  };
  const evaluasiTuntas = evaluasiMilestone11Desember(sesudahTuntas);
  assert.equal(evaluasiTuntas.status, 'tuntas');
});
