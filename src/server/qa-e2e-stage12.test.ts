import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import express from 'express';
import {
  AKSI_KRITIS_KANONIK,
  DAFTAR_STATUS_KONTEN_AWAL,
  IDENTITAS_EVENT_KANONIK,
  JADWAL_IKLAN_KANONIK,
  SKENARIO_ANGGARAN_KANONIK,
} from '../data/beranda-kanonik';
import {
  DETAIL_SKENARIO_ANGGARAN_KANONIK,
  KURS_PLANNING_USD_IDR_KANONIK,
  STATE_AWAL_IKLAN_ANGGARAN,
} from '../data/iklan-kanonik';
import {
  DAFTAR_TANGGAL_KALENDER,
  KONSEP_KONTEN_KANONIK,
} from '../data/kalender-kanonik';
import { STATE_AWAL_KPI_MONITORING } from '../data/kpi-kanonik';
import {
  BANK_PERTANYAAN_KANONIK,
  CHECKLIST_SHOOTING_KANONIK,
  DAFTAR_TUGAS_AWAL,
  DELIVERABLES_EDITING_KANONIK,
  SESI_SHOOTING_KANONIK,
} from '../data/produksi-kanonik';
import { SEED_STAKEHOLDER_KOSONG } from '../data/stakeholder-kanonik';
import type { JenisLaporanId } from '../types/laporan';
import type { RecordStakeholder } from '../types/stakeholder';
import type { SesiPengguna } from '../types/status';
import {
  DAFTAR_JENIS_LAPORAN,
  bangunDokumenLaporan,
  buatKonfigurasiLaporanDefault,
} from '../utils/laporan';
import { buatPdfBlobLaporan } from '../utils/laporan-pdf';
import { resetStatePengaturanUntukTest } from './direktori-akses';
import { resetOverrideIntegrasiUntukTest } from './konfigurasi-drive';
import { resetPenyimpananAsetUntukTest } from './layanan-aset-server';
import { resetRateLimitPengaturanUntukTest } from './layanan-pengaturan-server';
import { resetStakeholderUntukTest } from './layanan-stakeholder-server';
import { buatRouterApi } from './router-express';
import { resetStateSesiUntukTest } from './sesi-rbac';

const PNG_MINIMAL = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52,
]);

function resetSemuaServerState(): void {
  resetStateSesiUntukTest();
  resetStatePengaturanUntukTest();
  resetOverrideIntegrasiUntukTest();
  resetRateLimitPengaturanUntukTest();
  resetPenyimpananAsetUntukTest();
  resetStakeholderUntukTest();
}

test('E2E HTTP Server: Bootstrap, 6 peran RBAC, Drive upload QA, Stakeholder PII masking, soft-delete restore, dan logout revocation', async () => {
  resetSemuaServerState();

  const prevEnv = {
    PREVIEW_ADMIN_PASSCODE: process.env.PREVIEW_ADMIN_PASSCODE,
    APPS_SCRIPT_WEBAPP_URL: process.env.APPS_SCRIPT_WEBAPP_URL,
    APPS_SCRIPT_SHARED_SECRET: process.env.APPS_SCRIPT_SHARED_SECRET,
    GOOGLE_DRIVE_ROOT_FOLDER_ID: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
  };
  const prevFetch = globalThis.fetch;

  delete process.env.PREVIEW_ADMIN_PASSCODE;
  process.env.APPS_SCRIPT_WEBAPP_URL =
    'https://script.google.com/macros/s/qa-stage12/exec';
  process.env.APPS_SCRIPT_SHARED_SECRET = 'secret-qa-stage12-server-only';
  process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID = 'root-qa-stage12';

  let gasUploadCount = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.startsWith('https://script.google.com/')) {
      const payloadText = typeof init?.body === 'string' ? init.body : '{}';
      const parsed = JSON.parse(payloadText) as { action?: string };
      if (parsed.action === 'uploadSmallAsset') {
        gasUploadCount += 1;
        return new Response(
          JSON.stringify({
            ok: true,
            requestId: 'req_gas_qa_upload',
            data: {
              fileId: 'drive-qa-file-01',
              folderId: 'drive-folder-02',
              name: 'RH_QA_LOGO.png',
              mimeType: 'image/png',
              sizeBytes: PNG_MINIMAL.byteLength,
              createdAt: '2026-11-24T12:00:00.000Z',
            },
          }),
          { status: 200 },
        );
      }
      return new Response(
        JSON.stringify({
          ok: true,
          requestId: 'req_gas_qa_ok',
          data: {
            status: 'connected',
            rootFolderName: 'Ragi Hotang QA Drive',
            assets: [],
          },
        }),
        { status: 200 },
      );
    }
    return prevFetch(input, init);
  }) as typeof fetch;

  const app = express();
  app.use('/api', buatRouterApi());
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  try {
    const { port } = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}`;

    // 1. Unauthenticated access ditolak 401 pada endpoint privat
    const unauthStatus = await prevFetch(`${baseUrl}/api/sesi/status`);
    assert.equal(unauthStatus.status, 200);
    const unauthSettings = await prevFetch(`${baseUrl}/api/pengaturan`);
    assert.equal(unauthSettings.status, 401);
    const unauthUpload = await prevFetch(`${baseUrl}/api/drive/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namaFile: 'logo.png' }),
    });
    assert.equal(unauthUpload.status, 401);

    // 2. Bootstrap Owner + tolak bootstrap kedua (409)
    const bootRes = await prevFetch(`${baseUrl}/api/sesi/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: 'ragi-qa-stage12-2026',
        namaTampilan: 'Melfarina Sianipar',
        peran: 'owner',
        email: 'owner@ragihotang.id',
      }),
    });
    assert.equal(bootRes.status, 201);
    const bootJson = (await bootRes.json()) as {
      ok: boolean;
      data: { token: string; sesi: SesiPengguna };
    };
    const tokenOwner = bootJson.data.token;
    assert.equal(bootJson.data.sesi.peran, 'owner');

    const secondBoot = await prevFetch(`${baseUrl}/api/sesi/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: 'ragi-qa-stage12-2026',
        namaTampilan: 'Duplikat',
        peran: 'owner',
      }),
    });
    assert.equal(secondBoot.status, 409);

    // 3. Login semua 5 peran lain via /api/sesi/masuk
    const roles: Array<NonNullable<SesiPengguna['peran']>> = [
      'admin',
      'digital-manager',
      'editor',
      'stakeholder-pic',
      'viewer',
    ];
    const tokens: Record<string, string> = { owner: tokenOwner };

    for (const role of roles) {
      const loginRes = await prevFetch(`${baseUrl}/api/sesi/masuk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: 'ragi-qa-stage12-2026',
          namaTampilan: `UAT ${role}`,
          peran: role,
          email: `${role}@ragihotang.id`,
        }),
      });
      assert.equal(loginRes.status, 200);
      const loginJson = (await loginRes.json()) as {
        data: { token: string; sesi: SesiPengguna };
      };
      assert.equal(loginJson.data.sesi.peran, role);
      tokens[role] = loginJson.data.token;
    }

    // 4. Verifikasi RBAC Pengaturan & Audit across all 6 roles
    const ownerSetEvent = await prevFetch(`${baseUrl}/api/pengaturan/event`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.owner}`,
      },
      body: JSON.stringify({
        lokasiPrivat: 'Balige Ruang Privat VIP (Rahasia)',
        kontakResmi: {
          emailPress: 'press-rahasia@ragihotang.id',
          whatsappKemitraan: '+6281112223334',
          statusKonfirmasi: 'terkonfirmasi-owner',
        },
      }),
    });
    assert.equal(ownerSetEvent.status, 200);

    const editorReadSettings = await prevFetch(`${baseUrl}/api/pengaturan`, {
      headers: { Authorization: `Bearer ${tokens.editor}` },
    });
    assert.equal(editorReadSettings.status, 200);
    const editorSettingsJson = (await editorReadSettings.json()) as {
      data: {
        event: { lokasiPrivat: string };
        kontakResmi: { emailPress: string };
      };
    };
    assert.match(editorSettingsJson.data.event.lokasiPrivat, /TEREDAKSI/);
    assert.equal(editorSettingsJson.data.kontakResmi.emailPress, '[TEREDAKSI]');

    // Plafon anggaran: hanya Owner & Admin
    for (const blockedRole of ['digital-manager', 'editor', 'stakeholder-pic', 'viewer']) {
      const res = await prevFetch(`${baseUrl}/api/pengaturan/anggaran`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens[blockedRole]}`,
        },
        body: JSON.stringify({ skenarioTarget: 'menengah', plafonDisetujuiIdr: 17000000 }),
      });
      assert.equal(res.status, 403, `Role ${blockedRole} harus ditolak 403 pada plafon`);
    }
    const adminApproveBudget = await prevFetch(`${baseUrl}/api/pengaturan/anggaran`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.admin}`,
      },
      body: JSON.stringify({ skenarioTarget: 'menengah', plafonDisetujuiIdr: 17000000 }),
    });
    assert.equal(adminApproveBudget.status, 200);

    // Audit log: hanya Owner, Admin, Digital Manager
    assert.equal(
      (await prevFetch(`${baseUrl}/api/audit`, {
        headers: { Authorization: `Bearer ${tokens.editor}` },
      })).status,
      403,
    );
    assert.equal(
      (await prevFetch(`${baseUrl}/api/audit`, {
        headers: { Authorization: `Bearer ${tokens.viewer}` },
      })).status,
      403,
    );
    assert.equal(
      (await prevFetch(`${baseUrl}/api/audit`, {
        headers: { Authorization: `Bearer ${tokens['digital-manager']}` },
      })).status,
      200,
    );

    // 5. Drive Upload QA via HTTP (RBAC folder, valid, idempotency, spoof MIME, oversize, viewer forbidden, soft-delete/restore)
    const uploadEditorWrongFolder = await prevFetch(`${baseUrl}/api/drive/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.editor}`,
      },
      body: JSON.stringify({
        namaFile: 'RH_QA_LOGO.png',
        mimeType: 'image/png',
        base64Content: PNG_MINIMAL.toString('base64'),
        folderKode: '02_Logo',
        kategori: 'logo-brand',
      }),
    });
    assert.equal(uploadEditorWrongFolder.status, 403);

    const uploadValid = await prevFetch(`${baseUrl}/api/drive/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.editor}`,
        'X-Idempotency-Key': 'qa-idem-001',
      },
      body: JSON.stringify({
        namaFile: 'RH_QA_EXPORT_THUMB.png',
        mimeType: 'image/png',
        base64Content: PNG_MINIMAL.toString('base64'),
        folderKode: '06_Final_Export',
        kategori: 'thumbnail',
      }),
    });
    assert.equal(uploadValid.status, 201);
    const uploadValidJson = (await uploadValid.json()) as {
      data: { id: string; driveFileId: string; visibility: string };
    };
    assert.equal(uploadValidJson.data.driveFileId, 'drive-qa-file-01');
    assert.equal(uploadValidJson.data.visibility, 'internal');

    const uploadRetry = await prevFetch(`${baseUrl}/api/drive/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.editor}`,
        'X-Idempotency-Key': 'qa-idem-001',
      },
      body: JSON.stringify({
        namaFile: 'RH_QA_EXPORT_THUMB.png',
        mimeType: 'image/png',
        base64Content: PNG_MINIMAL.toString('base64'),
        folderKode: '06_Final_Export',
        kategori: 'thumbnail',
      }),
    });
    assert.equal(uploadRetry.status, 200);
    assert.equal(gasUploadCount, 1);

    const uploadSpoof = await prevFetch(`${baseUrl}/api/drive/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.editor}`,
      },
      body: JSON.stringify({
        namaFile: 'evil.png',
        mimeType: 'image/png',
        base64Content: Buffer.from('bukan-png-valid').toString('base64'),
        folderKode: '06_Final_Export',
      }),
    });
    assert.equal(uploadSpoof.status, 415);

    const uploadOversize = await prevFetch(`${baseUrl}/api/drive/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.editor}`,
      },
      body: JSON.stringify({
        namaFile: 'terlalu-besar.png',
        mimeType: 'image/png',
        base64Content: Buffer.concat([
          PNG_MINIMAL,
          Buffer.alloc(4 * 1024 * 1024 + 64),
        ]).toString('base64'),
        folderKode: '06_Final_Export',
      }),
    });
    assert.equal(uploadOversize.status, 413);

    const uploadViewer = await prevFetch(`${baseUrl}/api/drive/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.viewer}`,
      },
      body: JSON.stringify({
        namaFile: 'viewer.png',
        mimeType: 'image/png',
        base64Content: PNG_MINIMAL.toString('base64'),
        folderKode: '02_Logo',
      }),
    });
    assert.equal(uploadViewer.status, 403);

    // Soft delete & restore aset oleh Owner
    const delAset = await prevFetch(
      `${baseUrl}/api/drive/assets/${uploadValidJson.data.id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokens.owner}` },
      },
    );
    assert.equal(delAset.status, 200);
    const restoreAset = await prevFetch(
      `${baseUrl}/api/drive/assets/${uploadValidJson.data.id}/restore`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.owner}` },
      },
    );
    assert.equal(restoreAset.status, 200);

    // 6. Stakeholder CRM PII protection & soft-delete/restore
    const addStakeholder = await prevFetch(`${baseUrl}/api/stakeholders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens['stakeholder-pic']}`,
      },
      body: JSON.stringify({
        namaLengkap: 'Kurator Terverifikasi QA',
        jabatanOrganisasi: 'Rumah Mode Nusantara',
        kategori: 'commercial',
        prioritas: 'A',
        relevansi: 'Potensi kurasi pasca-acara',
        relationshipOwner: 'PIC Commercial',
        channelUtama: 'email',
        contactValue: 'privat.buyer@contoh.invalid',
        catatanPrivat: 'Catatan rahasia negosiasi QA',
      }),
    });
    assert.equal(addStakeholder.status, 201);
    const addedStJson = (await addStakeholder.json()) as {
      data: { id: string };
    };

    for (const limitedRole of ['editor', 'viewer']) {
      const readSt = await prevFetch(`${baseUrl}/api/stakeholders`, {
        headers: { Authorization: `Bearer ${tokens[limitedRole]}` },
      });
      assert.equal(readSt.status, 200);
      const stJson = (await readSt.json()) as {
        data: {
          daftarStakeholder: Array<{
            contactValue: string;
            kontakTersensor: boolean;
          }>;
        };
      };
      assert.equal(stJson.data.daftarStakeholder[0].kontakTersensor, true);
      assert.equal(
        stJson.data.daftarStakeholder[0].contactValue.includes(
          'privat.buyer@contoh.invalid',
        ),
        false,
      );

      const expInternal = await prevFetch(
        `${baseUrl}/api/stakeholders/export?mode=internal`,
        {
          headers: { Authorization: `Bearer ${tokens[limitedRole]}` },
        },
      );
      assert.equal(expInternal.status, 403);

      const expPublic = await prevFetch(
        `${baseUrl}/api/stakeholders/export?mode=public`,
        {
          headers: { Authorization: `Bearer ${tokens[limitedRole]}` },
        },
      );
      assert.equal(expPublic.status, 200);
      const expPubJson = (await expPublic.json()) as { data: { csv: string } };
      assert.equal(
        expPubJson.data.csv.includes('privat.buyer@contoh.invalid'),
        false,
      );
    }

    const delSt = await prevFetch(
      `${baseUrl}/api/stakeholders/${addedStJson.data.id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokens['stakeholder-pic']}` },
      },
    );
    assert.equal(delSt.status, 200);
    const resStPicDenied = await prevFetch(
      `${baseUrl}/api/stakeholders/${addedStJson.data.id}/restore`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens['stakeholder-pic']}` },
      },
    );
    assert.equal(resStPicDenied.status, 403);

    const resSt = await prevFetch(
      `${baseUrl}/api/stakeholders/${addedStJson.data.id}/restore`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.owner}` },
      },
    );
    assert.equal(resSt.status, 200);

    // 7. Logout mencabut token secara permanen
    const logoutRes = await prevFetch(`${baseUrl}/api/sesi/keluar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.owner}` },
    });
    assert.equal(logoutRes.status, 200);

    const afterLogout = await prevFetch(`${baseUrl}/api/pengaturan`, {
      headers: { Authorization: `Bearer ${tokens.owner}` },
    });
    assert.equal(afterLogout.status, 401);
  } finally {
    globalThis.fetch = prevFetch;
    process.env.PREVIEW_ADMIN_PASSCODE = prevEnv.PREVIEW_ADMIN_PASSCODE;
    process.env.APPS_SCRIPT_WEBAPP_URL = prevEnv.APPS_SCRIPT_WEBAPP_URL;
    process.env.APPS_SCRIPT_SHARED_SECRET = prevEnv.APPS_SCRIPT_SHARED_SECRET;
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID = prevEnv.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('Content Fidelity Audit 100%: Tanggal, volume 66 master, shooting 25/30 Nov, gate <11 Des, anggaran, & zero mock actuals', () => {
  assert.equal(IDENTITAS_EVENT_KANONIK.tanggalEvent, '18 Desember 2026');
  assert.equal(
    IDENTITAS_EVENT_KANONIK.akses,
    'Kuota Terbatas',
  );
  assert.equal(
    IDENTITAS_EVENT_KANONIK.periodeKampanye,
    '26 November – 17 Desember 2026 (22 hari)',
  );

  // Kalender 22 hari = 44 video + 22 desain = 66 master, seluruhnya 'planned'
  assert.equal(DAFTAR_TANGGAL_KALENDER.length, 22);
  assert.equal(DAFTAR_TANGGAL_KALENDER[0].nilai, '2026-11-26');
  assert.equal(DAFTAR_TANGGAL_KALENDER[21].nilai, '2026-12-17');
  assert.equal(KONSEP_KONTEN_KANONIK.length, 66);
  assert.equal(
    KONSEP_KONTEN_KANONIK.filter((k) => k.jenisMaster === 'video').length,
    44,
  );
  assert.equal(
    KONSEP_KONTEN_KANONIK.filter((k) => k.jenisMaster === 'desain').length,
    22,
  );
  assert.equal(DAFTAR_STATUS_KONTEN_AWAL.length, 66);
  assert.equal(
    DAFTAR_STATUS_KONTEN_AWAL.every((item) => item.status === 'planned'),
    true,
  );

  // Shooting 3 hari (25 Nov iklan; 30 Nov & 3 Des short konten), 18 pertanyaan kanonik (8 + 7 + 3), gate < 11 Des
  assert.equal(SESI_SHOOTING_KANONIK.length, 3);
  assert.equal(SESI_SHOOTING_KANONIK[0].tanggal, '2026-11-25');
  assert.equal(SESI_SHOOTING_KANONIK[1].tanggal, '2026-11-30');
  assert.equal(SESI_SHOOTING_KANONIK[2].tanggal, '2026-12-03');
  assert.equal(BANK_PERTANYAAN_KANONIK.length, 18);
  assert.equal(
    BANK_PERTANYAAN_KANONIK.filter((q) => q.narasumber === 'melfarina').length,
    8,
  );
  assert.equal(
    BANK_PERTANYAAN_KANONIK.filter((q) => q.narasumber === 'raden').length,
    7,
  );
  assert.equal(
    BANK_PERTANYAAN_KANONIK.filter((q) => q.narasumber === 'ghivany').length,
    3,
  );
  assert.equal(
    AKSI_KRITIS_KANONIK.some((a) => a.tenggat.includes('11 Des')),
    true,
  );
  assert.equal(
    DAFTAR_TUGAS_AWAL.some((t) => t.adalahMilestoneKritis11Des === true),
    true,
  );

  // Iklan & Anggaran kanonik + kurs Rp17.000/USD
  assert.equal(KURS_PLANNING_USD_IDR_KANONIK, 17000);
  assert.deepEqual(
    SKENARIO_ANGGARAN_KANONIK.map((s) => s.totalIdr),
    [6520000, 14920000, 21270000],
  );
  assert.deepEqual(
    DETAIL_SKENARIO_ANGGARAN_KANONIK.map((s) => s.grandTotalIdr),
    [6520000, 14920000, 21270000],
  );
  assert.equal(JADWAL_IKLAN_KANONIK[0].rentangTanggal, '29 Nov – 5 Des 2026');
  assert.equal(JADWAL_IKLAN_KANONIK[1].rentangTanggal, '4 – 10 Des 2026');
  assert.equal(JADWAL_IKLAN_KANONIK[2].rentangTanggal, '11 – 17 Des 2026');

  // Seed CRM & KPI awal harus 100% kosong (zero fabricated actuals/VIPs)
  assert.equal(SEED_STAKEHOLDER_KOSONG.length, 0);
  assert.equal(STATE_AWAL_KPI_MONITORING.daftarSnapshot.length, 0);
  assert.equal(STATE_AWAL_KPI_MONITORING.daftarInquiry.length, 0);
  assert.equal(STATE_AWAL_KPI_MONITORING.baseline72Jam, null);
});

test('PDF QA Lengkap: Semua 7 jenis laporan menghasilkan vector %PDF- valid serta menegakkan redaksi PII default', () => {
  const sesiOwner: SesiPengguna = {
    terautentikasi: true,
    namaTampilan: 'Melfarina Sianipar',
    email: 'owner@ragihotang.id',
    peran: 'owner',
    statusSesi: 'active',
  };

  const dummyStakeholder: RecordStakeholder = {
    id: 'st-qa-1',
    namaLengkap: 'Kurator Rahasia PDF',
    jabatanOrganisasi: 'Galeri Toba',
    kategori: 'commercial',
    prioritas: 'A',
    relevansi: 'Potensi kemitraan kurasi',
    skor: {
      relevansi: 5,
      influence: 4,
      peluangNyata: 4,
      kedekatanHubungan: 4,
      totalSkor: 87,
      penjelasanSkor: 'Skor uji QA',
    },
    relationshipOwner: 'PIC Commercial',
    sumberKontak: 'Referensi',
    channelUtama: 'email',
    contactValue: 'pii.rahasia.pdf@contoh.invalid',
    kontakTersensor: false,
    konteksRelasi: 'Kenal langsung',
    catatanPrivat: 'Catatan negosiasi rahasia PDF',
    consentToPublish: false,
    statusPipeline: 'qualified',
    lastOutreachAt: '',
    responTerakhir: '',
    nextAction: 'Kirim lookbook',
    dueDate: '2026-12-02',
    logOutreach: [],
    dibuatPada: '2026-11-24T10:00:00.000Z',
    diperbaruiPada: '2026-11-24T10:00:00.000Z',
  };

  const stateProduksi = {
    daftarTugas: DAFTAR_TUGAS_AWAL,
    daftarSesiShooting: SESI_SHOOTING_KANONIK,
    checklistShooting: CHECKLIST_SHOOTING_KANONIK,
    bankPertanyaan: BANK_PERTANYAAN_KANONIK,
    daftarDeliverables: DELIVERABLES_EDITING_KANONIK,
  };

  const semuaJenis: JenisLaporanId[] = DAFTAR_JENIS_LAPORAN.map((d) => d.id);
  assert.equal(semuaJenis.length, 7);

  for (const jenis of semuaJenis) {
    const konfigAman = buatKonfigurasiLaporanDefault(jenis);
    const dokAman = bangunDokumenLaporan({
      konfigurasi: konfigAman,
      sesi: sesiOwner,
      daftarKonten: KONSEP_KONTEN_KANONIK,
      stateProduksi,
      stateIklan: STATE_AWAL_IKLAN_ANGGARAN,
      stateKpi: STATE_AWAL_KPI_MONITORING,
      daftarStakeholder: [dummyStakeholder],
    });

    assert.equal(dokAman.piiDisertakan, false);
    assert.equal(
      JSON.stringify(dokAman.bagian).includes('pii.rahasia.pdf@contoh.invalid'),
      false,
      `Kontak PII tidak boleh bocor secara default di laporan ${jenis}`,
    );

    const pdf = buatPdfBlobLaporan(dokAman);
    assert.equal(pdf.ukuranBytes > 1000, true);
    assert.equal(pdf.jumlahHalaman >= 1, true);
    const header = Buffer.from(pdf.base64, 'base64').toString('ascii', 0, 5);
    assert.equal(header, '%PDF-');
  }

  // Konfirmasi eksplisit PII oleh Owner menampilkan kontak pada Stakeholder Pipeline
  const konfigPii = {
    ...buatKonfigurasiLaporanDefault('stakeholder-pipeline'),
    sertakanKontakPribadiStakeholder: true,
    sertakanCatatanInternal: true,
  };
  const dokPii = bangunDokumenLaporan({
    konfigurasi: konfigPii,
    sesi: sesiOwner,
    daftarKonten: KONSEP_KONTEN_KANONIK,
    stateProduksi,
    stateIklan: STATE_AWAL_IKLAN_ANGGARAN,
    stateKpi: STATE_AWAL_KPI_MONITORING,
    daftarStakeholder: [dummyStakeholder],
  });
  assert.equal(dokPii.piiDisertakan, true);
  assert.equal(
    JSON.stringify(dokPii.bagian).includes('pii.rahasia.pdf@contoh.invalid'),
    true,
  );
  const pdfPii = buatPdfBlobLaporan(dokPii);
  assert.equal(
    Buffer.from(pdfPii.base64, 'base64').toString('ascii', 0, 5),
    '%PDF-',
  );
});
