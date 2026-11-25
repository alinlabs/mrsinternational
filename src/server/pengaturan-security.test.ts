import assert from 'node:assert/strict';
import test from 'node:test';
import type { SesiPengguna } from '../types/status';
import { normalisasiUrlVercelApi } from '../../api/index';
import { periksaOriginDiizinkan } from './adapter-vercel';
import { ambilDaftarAuditTerfilter, catatAuditDrive, sanitasiTeksAudit } from './audit-log';
import { resetStatePengaturanUntukTest } from './direktori-akses';
import { resetOverrideIntegrasiUntukTest } from './konfigurasi-drive';
import {
  daftarAsetUntukSesi,
  daftarSampahAsetUntukSesi,
  daftarkanAsetEksternalManual,
  hapusAsetUntukSesi,
  pulihkanAsetUntukSesi,
  resetPenyimpananAsetUntukTest,
} from './layanan-aset-server';
import {
  ambilAuditTerpaduUntukSesi,
  ambilPengaturanUntukSesi,
  eksporBackupPengaturanUntukSesi,
  hapusAtauNonaktifkanTimUntukSesi,
  kelolaAnggotaTimUntukSesi,
  perbaruiIntegrasiPublikUntukSesi,
  perbaruiPengaturanEventUntukSesi,
  perbaruiPlafonAnggaranUntukSesi,
  resetRateLimitPengaturanUntukTest,
} from './layanan-pengaturan-server';
import {
  daftarSampahStakeholderUntukSesi,
  daftarStakeholderUntukSesi,
  hapusStakeholderUntukSesi,
  pulihkanStakeholderUntukSesi,
  resetStakeholderUntukTest,
  tambahStakeholderUntukSesi,
} from './layanan-stakeholder-server';
import {
  cabutTokenSesi,
  prosesMasukOidc,
  prosesMasukSesi,
  resetStateSesiUntukTest,
  terbitkanTokenSesi,
  verifikasiHeaderBearer,
} from './sesi-rbac';

function buatSesi(peran: SesiPengguna['peran'], nama = 'Penguji', email: string | null = null): SesiPengguna {
  return {
    terautentikasi: true,
    namaTampilan: nama,
    email,
    peran,
    statusSesi: 'active',
  };
}

function resetSemuaState() {
  resetStateSesiUntukTest();
  resetStatePengaturanUntukTest();
  resetOverrideIntegrasiUntukTest();
  resetRateLimitPengaturanUntukTest();
  resetPenyimpananAsetUntukTest();
  resetStakeholderUntukTest();
}

test('Verifikasi Google OIDC menolak klaim tidak valid serta menegakkan email/domain allowlist & persetujuan tim', async () => {
  resetSemuaState();
  const prevEmailAllow = process.env.ALLOWED_AUTH_EMAILS;
  const prevDomainAllow = process.env.ALLOWED_AUTH_DOMAINS;
  const prevClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;

  try {
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'client-uji-123.apps.googleusercontent.com';
    process.env.ALLOWED_AUTH_EMAILS = 'owner@ragihotang.id,dm@ragihotang.id';
    process.env.ALLOWED_AUTH_DOMAINS = 'mitra-toba.id';

    const expMasaDepan = Math.floor(Date.now() / 1000) + 3600;
    const expKedaluwarsa = Math.floor(Date.now() / 1000) - 60;

    // 1. Audience salah -> 401
    const badAud = await prosesMasukOidc({
      idToken: 'token-panjang-untuk-pengujian-01',
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            iss: 'https://accounts.google.com',
            aud: 'client-lain.apps.googleusercontent.com',
            email: 'owner@ragihotang.id',
            email_verified: 'true',
            exp: expMasaDepan,
          }),
          { status: 200 },
        ),
    });
    assert.equal(badAud.ok, false);
    if (!badAud.ok) assert.equal(badAud.statusHttp, 401);

    // 2. Token expired / email_verified false -> 401
    const badExp = await prosesMasukOidc({
      idToken: 'token-panjang-untuk-pengujian-02',
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            iss: 'https://accounts.google.com',
            aud: 'client-uji-123.apps.googleusercontent.com',
            email: 'owner@ragihotang.id',
            email_verified: false,
            exp: expKedaluwarsa,
          }),
          { status: 200 },
        ),
    });
    assert.equal(badExp.ok, false);
    if (!badExp.ok) assert.equal(badExp.statusHttp, 401);

    // 3. Domain luar allowlist -> 403 EMAIL_NOT_ALLOWLISTED
    const luarAllowlist = await prosesMasukOidc({
      idToken: 'token-panjang-untuk-pengujian-03',
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            iss: 'accounts.google.com',
            aud: 'client-uji-123.apps.googleusercontent.com',
            email: 'asing@luar.invalid',
            email_verified: true,
            exp: expMasaDepan,
          }),
          { status: 200 },
        ),
    });
    assert.equal(luarAllowlist.ok, false);
    if (!luarAllowlist.ok) {
      assert.equal(luarAllowlist.statusHttp, 403);
      assert.equal(luarAllowlist.kode, 'EMAIL_NOT_ALLOWLISTED');
    }

    // 4. Email allowlist pertama -> onboard sebagai Owner
    const ownerOidc = await prosesMasukOidc({
      idToken: 'token-panjang-untuk-pengujian-04',
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            iss: 'https://accounts.google.com',
            aud: 'client-uji-123.apps.googleusercontent.com',
            email: 'owner@ragihotang.id',
            name: 'Melfarina Sianipar',
            email_verified: 'true',
            exp: expMasaDepan,
          }),
          { status: 200 },
        ),
    });
    assert.equal(ownerOidc.ok, true);
    if (ownerOidc.ok) {
      assert.equal(ownerOidc.sesi.peran, 'owner');
    }

    // 5. Domain allowlist -> masuk antrean 403 PENDING_APPROVAL sampai disetujui Owner
    const domainPending = await prosesMasukOidc({
      idToken: 'token-panjang-untuk-pengujian-05',
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            iss: 'https://accounts.google.com',
            aud: 'client-uji-123.apps.googleusercontent.com',
            email: 'editor@mitra-toba.id',
            name: 'Editor Toba',
            email_verified: true,
            exp: expMasaDepan,
          }),
          { status: 200 },
        ),
    });
    assert.equal(domainPending.ok, false);
    if (!domainPending.ok) {
      assert.equal(domainPending.statusHttp, 403);
      assert.equal(domainPending.kode, 'PENDING_APPROVAL');
    }

    // Owner menyetujui & menetapkan peran editor
    const setujui = kelolaAnggotaTimUntukSesi({
      sesi: buatSesi('owner', 'Melfarina Sianipar', 'owner@ragihotang.id'),
      body: {
        email: 'editor@mitra-toba.id',
        peran: 'editor',
        statusAkun: 'aktif',
      },
    });
    assert.equal(setujui.statusHttp, 200);

    // Login ulang OIDC berhasil dengan peran editor
    const domainAktif = await prosesMasukOidc({
      idToken: 'token-panjang-untuk-pengujian-06',
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            iss: 'https://accounts.google.com',
            aud: 'client-uji-123.apps.googleusercontent.com',
            email: 'editor@mitra-toba.id',
            email_verified: true,
            exp: expMasaDepan,
          }),
          { status: 200 },
        ),
    });
    assert.equal(domainAktif.ok, true);
    if (domainAktif.ok) {
      assert.equal(domainAktif.sesi.peran, 'editor');
    }
  } finally {
    process.env.ALLOWED_AUTH_EMAILS = prevEmailAllow;
    process.env.ALLOWED_AUTH_DOMAINS = prevDomainAllow;
    process.env.GOOGLE_OAUTH_CLIENT_ID = prevClientId;
  }
});

test('Matriks RBAC 6 peran ditegakkan pada pengaturan event, anggaran, tim, integrasi, backup, dan audit log', () => {
  resetSemuaState();
  const prevSecret = process.env.APPS_SCRIPT_SHARED_SECRET;
  process.env.APPS_SCRIPT_SHARED_SECRET = 'rahasia-sangat-kuat-server-only';

  try {
    // Unauthenticated -> 401
    assert.equal(ambilPengaturanUntukSesi(null).statusHttp, 401);

    const sesiOwner = buatSesi('owner', 'Melfarina Sianipar', 'owner@ragihotang.id');
    const sesiAdmin = buatSesi('admin', 'Admin Sistem', 'admin@ragihotang.id');
    const sesiDm = buatSesi('digital-manager', 'Digital Manager', 'dm@ragihotang.id');
    const sesiEditor = buatSesi('editor', 'Editor Video', 'editor@ragihotang.id');
    const sesiViewer = buatSesi('viewer', 'Viewer Tamu', 'viewer@ragihotang.id');

    // Kebijakan Private Event menolak kata tiket / registrasi umum
    const tolakTiket = perbaruiPengaturanEventUntukSesi({
      sesi: sesiOwner,
      body: { labelAksesPublik: 'Tiket Umum & Open Registration' },
    });
    assert.equal(tolakTiket.statusHttp, 400);

    // Owner isi lokasi privat & kontak resmi -> Editor & Viewer harus menerima data teredaksi
    const simpanEvent = perbaruiPengaturanEventUntukSesi({
      sesi: sesiOwner,
      body: {
        lokasiPrivat: 'Villa Privat Balige Blok B (Rahasia)',
        kontakResmi: {
          emailPress: 'press@ragihotang.id',
          whatsappKemitraan: '+6281234567890',
          statusKonfirmasi: 'terkonfirmasi-owner',
        },
      },
    });
    assert.equal(simpanEvent.statusHttp, 200);

    const bacaEditor = ambilPengaturanUntukSesi(sesiEditor);
    assert.equal(bacaEditor.statusHttp, 200);
    if (bacaEditor.body.ok) {
      assert.match(bacaEditor.body.data.event.lokasiPrivat, /TEREDAKSI/);
      assert.equal(bacaEditor.body.data.kontakResmi.emailPress, '[TEREDAKSI]');
      assert.equal(bacaEditor.body.data.aksesTerbatasPenuh, true);
    }

    // Viewer tidak bisa ubah event maupun approve anggaran atau baca audit
    assert.equal(
      perbaruiPengaturanEventUntukSesi({
        sesi: sesiViewer,
        body: { kotaWilayahPublik: 'Jakarta' },
      }).statusHttp,
      403,
    );
    assert.equal(
      perbaruiPlafonAnggaranUntukSesi({
        sesi: sesiViewer,
        body: { skenarioTarget: 'hemat', plafonDisetujuiIdr: 5_000_000 },
      }).statusHttp,
      403,
    );
    assert.equal(ambilAuditTerpaduUntukSesi({ sesi: sesiViewer }).statusHttp, 403);
    assert.equal(ambilAuditTerpaduUntukSesi({ sesi: sesiEditor }).statusHttp, 403);

    // Digital Manager bisa ubah event & baca audit/backup, tapi tidak boleh approve anggaran atau ubah integrasi
    assert.equal(
      perbaruiPengaturanEventUntukSesi({
        sesi: sesiDm,
        body: { kotaWilayahPublik: 'Balige, Toba' },
      }).statusHttp,
      200,
    );
    assert.equal(
      perbaruiPlafonAnggaranUntukSesi({
        sesi: sesiDm,
        body: { skenarioTarget: 'menengah', plafonDisetujuiIdr: 20_000_000 },
      }).statusHttp,
      403,
    );
    assert.equal(
      perbaruiIntegrasiPublikUntukSesi({
        sesi: sesiDm,
        body: { appsScriptWebAppUrl: 'https://script.google.com/macros/s/abc/exec' },
      }).statusHttp,
      403,
    );
    assert.equal(ambilAuditTerpaduUntukSesi({ sesi: sesiDm }).statusHttp, 200);

    // Admin boleh approve anggaran & tambah peran biasa, tapi DILARANG memberi/mengubah peran Owner/Admin
    assert.equal(
      perbaruiPlafonAnggaranUntukSesi({
        sesi: sesiAdmin,
        body: { skenarioTarget: 'menengah', plafonDisetujuiIdr: 21_500_000 },
      }).statusHttp,
      200,
    );
    const adminCobaAngkatAdmin = kelolaAnggotaTimUntukSesi({
      sesi: sesiAdmin,
      body: { email: 'baru@ragihotang.id', peran: 'admin', konfirmasiOwner: true },
    });
    assert.equal(adminCobaAngkatAdmin.statusHttp, 403);

    // Owner wajib sertakan konfirmasiOwner=true untuk mengangkat Admin/Owner
    const ownerTanpaKonfirmasi = kelolaAnggotaTimUntukSesi({
      sesi: sesiOwner,
      body: { email: 'admin2@ragihotang.id', peran: 'admin', konfirmasiOwner: false },
    });
    assert.equal(ownerTanpaKonfirmasi.statusHttp, 400);

    const ownerDenganKonfirmasi = kelolaAnggotaTimUntukSesi({
      sesi: sesiOwner,
      body: { email: 'admin2@ragihotang.id', peran: 'admin', konfirmasiOwner: true },
    });
    assert.equal(ownerDenganKonfirmasi.statusHttp, 201);

    // Validasi integrasi menolak URL non-Google Apps Script & tidak pernah membocorkan shared secret
    const urlBuruk = perbaruiIntegrasiPublikUntukSesi({
      sesi: sesiOwner,
      body: { appsScriptWebAppUrl: 'http://169.254.169.254/latest/meta-data' },
    });
    assert.equal(urlBuruk.statusHttp, 400);

    const backup = eksporBackupPengaturanUntukSesi(sesiOwner);
    assert.equal(backup.statusHttp, 200);
    const teksBackup = JSON.stringify(backup.body);
    assert.equal(teksBackup.includes('rahasia-sangat-kuat-server-only'), false);
  } finally {
    process.env.APPS_SCRIPT_SHARED_SECRET = prevSecret;
  }
});

test('Pencabutan token logout, penonaktifan real-time, rate limit, CORS allowlist, soft-delete restore, dan sanitasi audit log', async () => {
  resetSemuaState();

  // 1. Registrasi user aktif lalu terbitkan token
  const sesiOwner = buatSesi('owner', 'Melfarina', 'owner@ragihotang.id');
  const tambahUser = kelolaAnggotaTimUntukSesi({
    sesi: sesiOwner,
    body: {
      email: 'pic@ragihotang.id',
      namaTampilan: 'PIC Tim',
      peran: 'stakeholder-pic',
      statusAkun: 'aktif',
    },
  });
  assert.equal(tambahUser.statusHttp, 201);
  const idPic =
    tambahUser.body.ok && tambahUser.body.data ? tambahUser.body.data.id : '';
  assert.ok(idPic);

  const tokenA = terbitkanTokenSesi({
    namaTampilan: 'PIC Tim',
    peran: 'stakeholder-pic',
    email: 'pic@ragihotang.id',
  });
  assert.ok(verifikasiHeaderBearer(`Bearer ${tokenA.token}`));

  // Nonaktifkan user -> token lama langsung ditolak real-time
  const nonaktif = hapusAtauNonaktifkanTimUntukSesi({
    sesi: sesiOwner,
    idAnggota: idPic,
    permanen: false,
  });
  assert.equal(nonaktif.statusHttp, 200);
  assert.equal(verifikasiHeaderBearer(`Bearer ${tokenA.token}`), null);

  // Logout mencabut token secara eksplisit
  const tokenB = terbitkanTokenSesi({
    namaTampilan: 'Owner',
    peran: 'owner',
    email: 'owner@ragihotang.id',
  });
  assert.ok(verifikasiHeaderBearer(`Bearer ${tokenB.token}`));
  cabutTokenSesi(`Bearer ${tokenB.token}`);
  assert.equal(verifikasiHeaderBearer(`Bearer ${tokenB.token}`), null);

  // 2. Rate limiting login passcode (>15 percobaan/menit -> 429)
  const prevPasscode = process.env.PREVIEW_ADMIN_PASSCODE;
  process.env.PREVIEW_ADMIN_PASSCODE = 'rahasia-uji-123';
  try {
    let kenaRateLimit = false;
    for (let i = 0; i < 20; i++) {
      const hasil = prosesMasukSesi({
        passcode: 'salah-terus',
        namaTampilan: 'Brute',
        peran: 'viewer',
      });
      if (!hasil.ok && hasil.statusHttp === 429) {
        kenaRateLimit = true;
        break;
      }
    }
    assert.equal(kenaRateLimit, true);
  } finally {
    process.env.PREVIEW_ADMIN_PASSCODE = prevPasscode;
  }

  // 3. CORS Allowlist menolak origin asing dan mengizinkan host / ALLOWED_CORS_ORIGINS
  const corsJahat = periksaOriginDiizinkan({
    origin: 'https://penyerang.example',
    host: 'ragihotang.vercel.app',
  });
  assert.equal(corsJahat.diizinkan, false);

  const corsSah = periksaOriginDiizinkan({
    origin: 'https://ragihotang.vercel.app',
    host: 'ragihotang.vercel.app',
  });
  assert.equal(corsSah.diizinkan, true);
  assert.equal(corsSah.originHeader, 'https://ragihotang.vercel.app');

  const corsVercelResmi = periksaOriginDiizinkan({
    origin: 'https://mrsinternational.vercel.app',
    host: 'mrs.international.my.id',
  });
  assert.equal(corsVercelResmi.diizinkan, true);
  assert.equal(corsVercelResmi.originHeader, 'https://mrsinternational.vercel.app');

  const corsCustomSubdomain = periksaOriginDiizinkan({
    origin: 'https://mrs.international.my.id',
    host: 'mrsinternational.vercel.app',
  });
  assert.equal(corsCustomSubdomain.diizinkan, true);
  assert.equal(corsCustomSubdomain.originHeader, 'https://mrs.international.my.id');

  assert.equal(
    normalisasiUrlVercelApi('/api?__route=drive/assets&sampah=true'),
    '/api/drive/assets?sampah=true',
  );
  assert.equal(
    normalisasiUrlVercelApi('/api/sesi/status'),
    '/api/sesi/status',
  );

  // 4. Soft delete & restore Aset + Stakeholder
  const tambahAset = await daftarkanAsetEksternalManual({
    sesi: sesiOwner,
    namaFile: 'RH_20261125_IG_CRAFT_TES_V01.mp4',
    folderKode: '03_Interview_Raw',
    kategori: 'raw-video',
  });
  assert.equal(tambahAset.statusHttp, 201);
  const idAset = tambahAset.body.ok ? tambahAset.body.data.id : '';

  const softDelAset = await hapusAsetUntukSesi({ sesi: sesiOwner, idAset });
  assert.equal(softDelAset.statusHttp, 200);
  if (softDelAset.body.ok) assert.equal(softDelAset.body.data.permanen, false);

  const listSetelahHapus = await daftarAsetUntukSesi({ sesi: sesiOwner });
  if (listSetelahHapus.body.ok) {
    assert.equal(listSetelahHapus.body.data.daftarAset.length, 0);
  }
  const listSampahAset = daftarSampahAsetUntukSesi(sesiOwner);
  assert.equal(listSampahAset.statusHttp, 200);
  if (listSampahAset.body.ok) assert.equal(listSampahAset.body.data.length, 1);

  const pulihkanAset = pulihkanAsetUntukSesi({ sesi: sesiOwner, idAset });
  assert.equal(pulihkanAset.statusHttp, 200);
  const listSetelahPulih = await daftarAsetUntukSesi({ sesi: sesiOwner });
  if (listSetelahPulih.body.ok) {
    assert.equal(listSetelahPulih.body.data.daftarAset.length, 1);
  }

  const tambahSt = tambahStakeholderUntukSesi({
    sesi: sesiOwner,
    body: {
      namaLengkap: 'Kurator Test Soft Delete',
      jabatanOrganisasi: 'Galeri Nusantara',
      relevansi: 'Potensi kemitraan kurasi',
      relationshipOwner: 'Owner',
    },
  });
  assert.equal(tambahSt.statusHttp, 201);
  const idSt = (tambahSt.body.data as { id: string }).id;

  assert.equal(hapusStakeholderUntukSesi({ sesi: sesiOwner, idStakeholder: idSt }).statusHttp, 200);
  assert.equal(daftarSampahStakeholderUntukSesi(sesiOwner).body.ok, true);
  assert.equal(pulihkanStakeholderUntukSesi({ sesi: sesiOwner, idStakeholder: idSt }).statusHttp, 200);
  const listSt = daftarStakeholderUntukSesi(sesiOwner);
  assert.equal((listSt.body.data as { daftarStakeholder: unknown[] }).daftarStakeholder.length, 1);

  // 5. Sanitasi audit log (Bearer token, passcode, dan nomor telepon panjang tersensor)
  const teksTersanitasi = sanitasiTeksAudit(
    'Authorization: Bearer abc.def.ghi passcode=Rahasia123 hubungi +6281234567890',
  );
  assert.equal(teksTersanitasi.includes('abc.def.ghi'), false);
  assert.equal(teksTersanitasi.includes('Rahasia123'), false);
  assert.equal(teksTersanitasi.includes('081234567890'), false);

  catatAuditDrive({
    requestId: 'req_scrub_test',
    aktor: 'owner@ragihotang.id',
    peran: 'owner',
    aksi: 'TEST_SCRUB',
    target: 'Bearer secret.token.payload',
    status: 'sukses',
    ringkasan: 'Menghubungi +6281299988877 dengan secret=SuperRahasia',
    entitas: 'Setting',
  });
  const auditTerbaru = ambilDaftarAuditTerfilter({ aksi: 'TEST_SCRUB', batas: 5 });
  assert.equal(auditTerbaru.length > 0, true);
  assert.equal(auditTerbaru[0].ringkasan.includes('SuperRahasia'), false);
  assert.equal(auditTerbaru[0].target.includes('secret.token.payload'), false);
});
