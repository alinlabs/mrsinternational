import assert from 'node:assert/strict';
import test from 'node:test';
import type { KonfigurasiDriveServer } from './konfigurasi-drive';
import { validasiBerkasUpload } from './keamanan-upload';
import {
  ambilKesehatanDrive,
  daftarAsetUntukSesi,
  daftarkanAsetEksternalManual,
  hapusAsetUntukSesi,
  perbaruiMetadataAset,
  resetPenyimpananAsetUntukTest,
  unggahAsetKecilTervalidasi,
} from './layanan-aset-server';
import {
  prosesBootstrapAdmin,
  prosesMasukSesi,
  resetStateSesiUntukTest,
  verifikasiHeaderBearer,
} from './sesi-rbac';

const PNG_MINIMAL = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

const KONFIG_BELUM_SIAP: KonfigurasiDriveServer = {
  appsScriptWebAppUrl: '',
  appsScriptSharedSecret: '',
  rootFolderId: '',
  controlledFolderUrl: '',
  maxProxyUploadBytes: 4 * 1024 * 1024,
  terkonfigurasiAppsScript: false,
};

const KONFIG_SIAP: KonfigurasiDriveServer = {
  appsScriptWebAppUrl: 'https://script.google.com/macros/s/demo-id/exec',
  appsScriptSharedSecret: 'secret-server-only-test-123456',
  rootFolderId: 'root-folder-id',
  controlledFolderUrl: 'https://drive.google.com/drive/folders/root-folder-id',
  maxProxyUploadBytes: 4 * 1024 * 1024,
  terkonfigurasiAppsScript: true,
};

test('Health check mengembalikan not-configured bila env belum diisi dan connected bila GAS merespons sehat', async () => {
  const belum = await ambilKesehatanDrive({ konfigurasi: KONFIG_BELUM_SIAP });
  assert.equal(belum.statusHttp, 200);
  assert.equal(belum.body.ok, true);
  if (belum.body.ok) {
    assert.equal(belum.body.data.status, 'not-configured');
  }

  const terhubung = await ambilKesehatanDrive({
    konfigurasi: KONFIG_SIAP,
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          ok: true,
          requestId: 'req_1',
          data: { rootFolderName: 'Ragi Hotang Drive', status: 'connected' },
        }),
        { status: 200 },
      ),
  });
  if (terhubung.body.ok) {
    assert.equal(terhubung.body.data.status, 'connected');
    assert.equal(terhubung.body.data.namaFolderInduk, 'Ragi Hotang Drive');
  }
});

test('Validasi upload menolak MIME palsu, oversize, dan membersihkan path traversal', () => {
  const oversize = validasiBerkasUpload({
    namaFile: 'video-besar.mp4',
    mimeType: 'video/mp4',
    buffer: new Uint8Array(4 * 1024 * 1024 + 5),
    folderKode: '03_Interview_Raw',
    batasUkuranBytes: 4 * 1024 * 1024,
  });
  assert.equal(oversize.valid, false);
  assert.equal(oversize.kodeStatusHttp, 413);

  const mimePalsu = validasiBerkasUpload({
    namaFile: '../../evil.png',
    mimeType: 'image/png',
    buffer: new TextEncoder().encode('bukan-png-asli'),
    folderKode: '02_Logo',
    batasUkuranBytes: 4 * 1024 * 1024,
  });
  assert.equal(mimePalsu.valid, false);
  assert.equal(mimePalsu.kodeGalat, 'MIME_MISMATCH');
  assert.equal(mimePalsu.namaAman, 'evil.png');
});

test('Sesi scrypt bootstrap, RBAC 6 peran, upload kecil dengan idempotency, serta penolakan tanpa Apps Script berjalan ketat', async () => {
  resetPenyimpananAsetUntukTest();
  resetStateSesiUntukTest();

  const bootstrap = prosesBootstrapAdmin({
    passcode: 'ragi-aman-2026',
    namaTampilan: 'Melfarina Sianipar',
    peran: 'owner',
  });
  assert.equal(bootstrap.ok, true);
  if (!bootstrap.ok) return;

  const sesiOwner = verifikasiHeaderBearer(`Bearer ${bootstrap.token}`);
  assert.ok(sesiOwner);

  const masukViewer = prosesMasukSesi({
    passcode: 'ragi-aman-2026',
    namaTampilan: 'Viewer Tamu',
    peran: 'viewer',
  });
  assert.equal(masukViewer.ok, true);
  if (!masukViewer.ok) return;
  const sesiViewer = verifikasiHeaderBearer(`Bearer ${masukViewer.token}`);

  // Non-login ditolak 401
  const tanpaLogin = await daftarAsetUntukSesi({ sesi: null });
  assert.equal(tanpaLogin.statusHttp, 401);

  // Viewer tidak boleh upload (403)
  const viewerUpload = await unggahAsetKecilTervalidasi({
    sesi: sesiViewer,
    namaFile: 'logo.png',
    mimeType: 'image/png',
    buffer: PNG_MINIMAL,
    folderKode: '02_Logo',
    konfigurasi: KONFIG_SIAP,
  });
  assert.equal(viewerUpload.statusHttp, 403);

  // Jika GAS belum dikonfigurasi, upload proxy ditolak jujur (503) tanpa fake success
  const tanpaGas = await unggahAsetKecilTervalidasi({
    sesi: sesiOwner,
    namaFile: 'logo.png',
    mimeType: 'image/png',
    buffer: PNG_MINIMAL,
    folderKode: '02_Logo',
    konfigurasi: KONFIG_BELUM_SIAP,
  });
  assert.equal(tanpaGas.statusHttp, 503);

  // Dengan GAS sehat + idempotency key, retry tidak menggandakan file
  let jumlahPanggilanGas = 0;
  const mockFetchGas = async () => {
    jumlahPanggilanGas += 1;
    return new Response(
      JSON.stringify({
        ok: true,
        requestId: 'req_gas_ok',
        data: {
          fileId: 'drive-file-001',
          folderId: 'drive-folder-02',
          name: 'RH_LOGO_UTAMA.png',
          mimeType: 'image/png',
          sizeBytes: PNG_MINIMAL.byteLength,
          createdAt: '2026-11-24T10:00:00.000Z',
        },
      }),
      { status: 200 },
    );
  };

  const unggah1 = await unggahAsetKecilTervalidasi({
    sesi: sesiOwner,
    namaFile: 'RH_LOGO_UTAMA.png',
    mimeType: 'image/png',
    buffer: PNG_MINIMAL,
    folderKode: '02_Logo',
    idempotencyKey: 'idem-001',
    konfigurasi: KONFIG_SIAP,
    fetchImpl: mockFetchGas,
  });
  assert.equal(unggah1.statusHttp, 201);
  assert.equal(unggah1.body.ok, true);

  const unggahRetry = await unggahAsetKecilTervalidasi({
    sesi: sesiOwner,
    namaFile: 'RH_LOGO_UTAMA.png',
    mimeType: 'image/png',
    buffer: PNG_MINIMAL,
    folderKode: '02_Logo',
    idempotencyKey: 'idem-001',
    konfigurasi: KONFIG_SIAP,
    fetchImpl: mockFetchGas,
  });
  assert.equal(unggahRetry.statusHttp, 200);
  assert.equal(jumlahPanggilanGas, 1);

  if (unggah1.body.ok) {
    assert.equal(unggah1.body.data.visibility, 'internal');
    assert.equal(unggah1.body.data.driveFileId, 'drive-file-001');

    // Viewer tidak melihat aset internal
    const daftarViewer = await daftarAsetUntukSesi({
      sesi: sesiViewer,
      konfigurasi: KONFIG_BELUM_SIAP,
    });
    assert.equal(daftarViewer.body.ok, true);
    if (daftarViewer.body.ok) {
      assert.equal(daftarViewer.body.data.daftarAset.length, 0);
    }

    // Editor tidak boleh hapus aset (403)
    const masukEditor = prosesMasukSesi({
      passcode: 'ragi-aman-2026',
      namaTampilan: 'Editor Tim',
      peran: 'editor',
    });
    if (masukEditor.ok) {
      const sesiEditor = verifikasiHeaderBearer(`Bearer ${masukEditor.token}`);
      const hapusEditor = await hapusAsetUntukSesi({
        sesi: sesiEditor,
        idAset: unggah1.body.data.id,
        konfigurasi: KONFIG_SIAP,
      });
      assert.equal(hapusEditor.statusHttp, 403);
    }

    // Owner update metadata
    const editOwner = await perbaruiMetadataAset({
      sesi: sesiOwner,
      idAset: unggah1.body.data.id,
      perubahan: { visibility: 'approved-for-public', tags: ['logo', 'resmi'] },
      konfigurasi: KONFIG_BELUM_SIAP,
    });
    assert.equal(editOwner.statusHttp, 200);
  }

  // Fallback manual untuk video besar menandai status jujur menunggu sinkronisasi & menolak URL javascript:
  const urlJahat = await daftarkanAsetEksternalManual({
    sesi: sesiOwner,
    namaFile: 'RH_20261125_RAW_FOUNDER_01.mp4',
    folderKode: '03_Interview_Raw',
    kategori: 'raw-video',
    driveUrl: 'javascript:alert(1)',
    konfigurasi: KONFIG_BELUM_SIAP,
  });
  assert.equal(urlJahat.statusHttp, 400);

  const manualSah = await daftarkanAsetEksternalManual({
    sesi: sesiOwner,
    namaFile: 'RH_20261125_RAW_FOUNDER_01.mp4',
    folderKode: '03_Interview_Raw',
    kategori: 'raw-video',
    sizeBytes: 120_000_000,
    driveUrl: 'https://drive.google.com/drive/folders/demo-folder',
    konfigurasi: KONFIG_BELUM_SIAP,
  });
  assert.equal(manualSah.statusHttp, 201);
  if (manualSah.body.ok) {
    assert.equal(
      manualSah.body.data.statusSinkron,
      'unggah-eksternal-menunggu-sinkronisasi',
    );
    assert.equal(manualSah.body.data.driveFileId, '');
  }
});
