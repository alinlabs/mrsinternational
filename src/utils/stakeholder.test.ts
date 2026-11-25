import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_STAKEHOLDER_KOSONG } from '../data/stakeholder-kanonik';
import {
  bangunCsvEksporStakeholder,
  filterDanUrutkanStakeholder,
  hitungRingkasanStakeholder,
  hitungSkorRelasiStakeholder,
  uraiCsvStakeholder,
  validasiInputStakeholder,
  validasiLogOutreach,
} from './stakeholder';

test('Seed awal CRM kosong dan ringkasan menunjukkan 0 tanpa data palsu', () => {
  assert.equal(SEED_STAKEHOLDER_KOSONG.length, 0);
  const ringkasan = hitungRingkasanStakeholder(SEED_STAKEHOLDER_KOSONG, '2026-11-24');
  assert.deepEqual(ringkasan, {
    total: 0,
    prioritasA: 0,
    contacted: 0,
    replied: 0,
    meetingRequested: 0,
    overdue: 0,
  });
});

test('Skor relasi stakeholder transparan dan penjumlahan tepat sesuai bobot', () => {
  const skorMaks = hitungSkorRelasiStakeholder({
    relevansi: 5,
    influence: 5,
    peluangNyata: 5,
    kedekatanHubungan: 5,
  });
  assert.equal(skorMaks.totalSkor, 100);
  assert.ok(skorMaks.penjelasanSkor.includes('Relevansi 5/5 (35 poin)'));

  const skorMenengah = hitungSkorRelasiStakeholder({
    relevansi: 4,
    influence: 3,
    peluangNyata: 4,
    kedekatanHubungan: 2,
  });
  assert.equal(skorMenengah.totalSkor, 4 * 7 + 3 * 7 + 4 * 4 + 2 * 2);
});

test('CSV import parser memvalidasi tiap baris dan melaporkan error sebelum disimpan', () => {
  const csvCampuran = [
    'nama,jabatan_organisasi,kategori,prioritas,relevansi_catatan,pic_relasi,sumber_kontak,channel,nilai_kontak,konteks_relasi,izin_publikasi,status_pipeline,tindakan_berikutnya,tenggat_followup',
    'Kurator Uji A,Galeri Wastra Nusantara,commercial,A,Kurasi butik premium,PIC Commercial,Jaringan Pameran,email,kurator@contoh.invalid,Diskusi katalog,tidak,qualified,Kirim lookbook,2026-12-01',
    'Baris Salah,,invalid-kat,Z,Relevansi,PIC',
  ].join('\n');

  const hasil = uraiCsvStakeholder(csvCampuran);
  assert.equal(hasil.barisValid.length, 1);
  assert.equal(hasil.galatBaris.length, 1);
  assert.equal(hasil.barisValid[0].kategori, 'commercial');
  assert.equal(hasil.barisValid[0].prioritas, 'A');
});

test('Validasi form, filter, dan ekspor publik tanpa PII bekerja benar', () => {
  assert.equal(
    validasiInputStakeholder({
      namaLengkap: '',
      jabatanOrganisasi: 'Org',
      relevansi: 'Rel',
      relationshipOwner: 'PIC',
    }).valid,
    false,
  );
  assert.equal(
    validasiLogOutreach({
      tanggal: '2026-11-24',
      pic: 'PIC',
      ringkasan: '',
    }).valid,
    false,
  );

  const skor = hitungSkorRelasiStakeholder({
    relevansi: 4,
    influence: 4,
    peluangNyata: 3,
    kedekatanHubungan: 3,
  });
  const rekaman = [
    {
      id: 'st-1',
      namaLengkap: 'Kontak Uji',
      jabatanOrganisasi: 'Media Mode',
      kategori: 'influence' as const,
      prioritas: 'A' as const,
      relevansi: 'Liputan editorial wastra',
      relationshipOwner: 'PIC Press',
      sumberKontak: 'Daftar Redaksi Resmi',
      channelUtama: 'email' as const,
      contactValue: 'rahasia@contoh.invalid',
      konteksRelasi: 'Pernah meliput pameran tekstil',
      consentToPublish: false,
      statusPipeline: 'contacted' as const,
      lastOutreachAt: '2026-11-24',
      responTerakhir: 'Menunggu balasan',
      nextAction: 'Follow-up H+3',
      dueDate: '2026-11-20',
      catatanPrivat: 'Catatan internal sensitif',
      kontakTersensor: false,
      skor,
      logOutreach: [],
      dibuatPada: '2026-11-24T00:00:00Z',
      diperbaruiPada: '2026-11-24T00:00:00Z',
    },
  ];

  const ringkasan = hitungRingkasanStakeholder(rekaman, '2026-11-24');
  assert.equal(ringkasan.total, 1);
  assert.equal(ringkasan.prioritasA, 1);
  assert.equal(ringkasan.contacted, 1);
  assert.equal(ringkasan.overdue, 1);

  const csvPublik = bangunCsvEksporStakeholder(rekaman, 'public');
  assert.equal(csvPublik.includes('rahasia@contoh.invalid'), false);
  assert.equal(csvPublik.includes('Disamarkan (Privat)'), true);

  const csvInternal = bangunCsvEksporStakeholder(rekaman, 'internal');
  assert.equal(csvInternal.includes('rahasia@contoh.invalid'), true);

  const tersaring = filterDanUrutkanStakeholder(rekaman, {
    kataKunci: 'editorial',
    kategori: 'semua',
    prioritas: 'semua',
    statusPipeline: 'semua',
    urutan: 'skor-tertinggi',
  });
  assert.equal(tersaring.length, 1);
});
