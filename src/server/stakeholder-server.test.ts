import test from 'node:test';
import assert from 'node:assert/strict';
import type { SesiPengguna } from '../types/status';
import {
  daftarStakeholderUntukSesi,
  eksporStakeholderUntukSesi,
  hapusStakeholderUntukSesi,
  imporCsvStakeholderUntukSesi,
  resetStakeholderUntukTest,
  tambahLogOutreachUntukSesi,
  tambahStakeholderUntukSesi,
} from './layanan-stakeholder-server';

const SESI_PIC: SesiPengguna = {
  terautentikasi: true,
  namaTampilan: 'PIC Stakeholder',
  email: null,
  peran: 'stakeholder-pic',
  statusSesi: 'active',
};

const SESI_VIEWER: SesiPengguna = {
  terautentikasi: true,
  namaTampilan: 'Viewer Uji',
  email: null,
  peran: 'viewer',
  statusSesi: 'active',
};

const SESI_EDITOR: SesiPengguna = {
  terautentikasi: true,
  namaTampilan: 'Editor Uji',
  email: null,
  peran: 'editor',
  statusSesi: 'active',
};

test('Server Stakeholder CRM menegakkan 401 unauth dan sensor PII ketat untuk viewer/editor', () => {
  resetStakeholderUntukTest();

  // Unauthenticated
  const unauth = daftarStakeholderUntukSesi(null);
  assert.equal(unauth.statusHttp, 401);

  // Tambah oleh PIC Stakeholder
  const tambah = tambahStakeholderUntukSesi({
    sesi: SESI_PIC,
    body: {
      namaLengkap: 'Kurator Uji 01',
      jabatanOrganisasi: 'Butik Wastra',
      kategori: 'commercial',
      prioritas: 'A',
      relevansi: 'Potensi kurasi busana Ragi Hotang',
      relationshipOwner: 'PIC Commercial',
      sumberKontak: 'Rekomendasi Asosiasi',
      channelUtama: 'email',
      contactValue: 'privat.kontak@contoh.invalid',
      catatanPrivat: 'Catatan negosiasi privat',
    },
  });
  assert.equal(tambah.statusHttp, 201);
  const idBaru = (tambah.body.data as { id: string }).id;

  // PIC melihat kontak utuh
  const listPic = daftarStakeholderUntukSesi(SESI_PIC);
  assert.equal(listPic.statusHttp, 200);
  const rowsPic = (listPic.body.data as { daftarStakeholder: Array<{ contactValue: string; kontakTersensor: boolean }> }).daftarStakeholder;
  assert.equal(rowsPic[0].contactValue, 'privat.kontak@contoh.invalid');
  assert.equal(rowsPic[0].kontakTersensor, false);

  // Viewer & Editor menerima kontak tersensor dari server (PII tidak bocor lewat API)
  for (const sesiTerbatas of [SESI_VIEWER, SESI_EDITOR]) {
    const listTerbatas = daftarStakeholderUntukSesi(sesiTerbatas);
    assert.equal(listTerbatas.statusHttp, 200);
    const rows = (listTerbatas.body.data as { daftarStakeholder: Array<{ contactValue: string; catatanPrivat: string; kontakTersensor: boolean }> }).daftarStakeholder;
    assert.equal(rows[0].kontakTersensor, true);
    assert.equal(rows[0].contactValue.includes('privat.kontak@contoh.invalid'), false);
    assert.equal(rows[0].catatanPrivat.includes('Catatan negosiasi privat'), false);

    // Ditolak mutasi & ekspor internal
    const ditolakTambah = tambahStakeholderUntukSesi({
      sesi: sesiTerbatas,
      body: {
        namaLengkap: 'Harus Gagal',
        jabatanOrganisasi: 'Org',
        relevansi: 'Rel',
        relationshipOwner: 'PIC',
      },
    });
    assert.equal(ditolakTambah.statusHttp, 403);

    const ditolakEkspor = eksporStakeholderUntukSesi({
      sesi: sesiTerbatas,
      mode: 'internal',
    });
    assert.equal(ditolakEkspor.statusHttp, 403);

    // Ekspor publik tetap diizinkan tanpa PII
    const eksporPublik = eksporStakeholderUntukSesi({
      sesi: sesiTerbatas,
      mode: 'public',
    });
    assert.equal(eksporPublik.statusHttp, 200);
    assert.equal(
      (eksporPublik.body.data as { csv: string }).csv.includes('privat.kontak@contoh.invalid'),
      false,
    );
  }

  // Outreach log + hapus oleh PIC
  const logRes = tambahLogOutreachUntukSesi({
    sesi: SESI_PIC,
    idStakeholder: idBaru,
    body: {
      tanggal: '2026-11-24',
      channel: 'email',
      pic: 'PIC Commercial',
      ringkasan: 'Mengirim profil kolaborasi Ragi Hotang',
      respon: 'Tertarik melihat lookbook',
      nextStep: 'Jadwalkan panggilan minggu depan',
    },
  });
  assert.equal(logRes.statusHttp, 201);
  assert.equal(
    (logRes.body.data as { statusPipeline: string }).statusPipeline,
    'contacted',
  );

  // Import CSV validasi
  const imp = imporCsvStakeholderUntukSesi({
    sesi: SESI_PIC,
    daftarBaris: [
      {
        namaLengkap: 'Editor Mode Uji',
        jabatanOrganisasi: 'Majalah Tekstil',
        kategori: 'influence',
        prioritas: 'A',
        relevansi: 'Liputan warisan budaya',
        relationshipOwner: 'PIC Press',
      },
    ],
  });
  assert.equal(imp.statusHttp, 201);

  const hapus = hapusStakeholderUntukSesi({
    sesi: SESI_PIC,
    idStakeholder: idBaru,
  });
  assert.equal(hapus.statusHttp, 200);
});
