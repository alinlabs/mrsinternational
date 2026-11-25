import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { periksaOriginDiizinkan } from './adapter-vercel';
import {
  cabutTokenSesi,
  ambilStatusBootstrapSesi,
  prosesBootstrapAdmin,
  prosesMasukOidc,
  prosesMasukSesi,
  verifikasiHeaderBearer,
} from './sesi-rbac';
import {
  ambilAuditLogUntukSesi,
  ambilKesehatanDrive,
  daftarAsetUntukSesi,
  daftarSampahAsetUntukSesi,
  daftarkanAsetEksternalManual,
  hapusAsetUntukSesi,
  perbaruiMetadataAset,
  pulihkanAsetUntukSesi,
  unggahAsetKecilTervalidasi,
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
} from './layanan-pengaturan-server';
import {
  daftarSampahStakeholderUntukSesi,
  daftarStakeholderUntukSesi,
  eksporStakeholderUntukSesi,
  hapusStakeholderUntukSesi,
  imporCsvStakeholderUntukSesi,
  perbaruiStakeholderUntukSesi,
  pulihkanStakeholderUntukSesi,
  tambahLogOutreachUntukSesi,
  tambahStakeholderUntukSesi,
} from './layanan-stakeholder-server';

export function buatRouterApi(): express.Router {
  const router = express.Router();

  // Header keamanan API + kebijakan CORS allowlist ketat (tanpa wildcard *)
  router.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cache-Control', 'no-store');

    const cekOrigin = periksaOriginDiizinkan({
      origin: req.headers.origin,
      host: req.headers.host,
      forwardedHost: req.header('x-forwarded-host'),
      forwardedProto: req.header('x-forwarded-proto'),
    });

    if (cekOrigin.originHeader) {
      res.setHeader('Access-Control-Allow-Origin', cekOrigin.originHeader);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type,Authorization,X-Idempotency-Key',
      );
    }

    if (!cekOrigin.diizinkan) {
      res.status(403).json({
        ok: false,
        requestId: 'req_cors_blocked',
        error: {
          code: 'CORS_ORIGIN_DENIED',
          message: 'Origin permintaan tidak terdaftar pada allowlist server.',
        },
      });
      return;
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  router.use(express.json({ limit: '6mb' }));

  // Tangkap error body terlalu besar tanpa mengembalikan stack trace HTML
  router.use(
    (err: unknown, _req: Request, res: Response, next: NextFunction) => {
      if (
        err &&
        typeof err === 'object' &&
        'type' in err &&
        (err as { type?: string }).type === 'entity.too.large'
      ) {
        res.status(413).json({
          ok: false,
          requestId: 'req_payload_limit',
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message:
              'Ukuran berkas/payload melebihi batas proxy aman (maks. 4 MB). Gunakan jalur unggah eksternal ke Google Drive untuk video besar.',
          },
        });
        return;
      }
      next(err);
    },
  );

  router.get('/sesi/status', (req, res) => {
    const sesiAktif = verifikasiHeaderBearer(req.headers.authorization);
    res.json({
      ok: true,
      data: {
        ...ambilStatusBootstrapSesi(),
        sesi: sesiAktif ?? {
          terautentikasi: false,
          namaTampilan: 'Belum Masuk',
          email: null,
          peran: null,
          statusSesi: 'not-configured',
        },
      },
    });
  });

  router.post('/sesi/bootstrap', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = prosesBootstrapAdmin({
      passcode: String(body.passcode ?? ''),
      namaTampilan: String(body.namaTampilan ?? ''),
      peran: String(body.peran ?? 'owner'),
      email: typeof body.email === 'string' ? body.email : undefined,
    });

    if (!hasil.ok) {
      res.status(hasil.statusHttp).json({
        ok: false,
        error: { code: hasil.kode, message: hasil.pesan },
      });
      return;
    }

    res.status(201).json({
      ok: true,
      data: { token: hasil.token, sesi: hasil.sesi },
    });
  });

  router.post('/sesi/masuk', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = prosesMasukSesi({
      passcode: String(body.passcode ?? ''),
      namaTampilan: String(body.namaTampilan ?? ''),
      peran: String(body.peran ?? ''),
      email: typeof body.email === 'string' ? body.email : undefined,
    });

    if (!hasil.ok) {
      res.status(hasil.statusHttp).json({
        ok: false,
        error: { code: hasil.kode, message: hasil.pesan },
      });
      return;
    }

    res.json({
      ok: true,
      data: { token: hasil.token, sesi: hasil.sesi },
    });
  });

  router.post('/sesi/oidc', async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = await prosesMasukOidc({
      idToken: String(body.idToken ?? ''),
    });

    if (!hasil.ok) {
      res.status(hasil.statusHttp).json({
        ok: false,
        error: { code: hasil.kode, message: hasil.pesan },
      });
      return;
    }

    res.json({
      ok: true,
      data: { token: hasil.token, sesi: hasil.sesi },
    });
  });

  router.post('/sesi/keluar', (req, res) => {
    cabutTokenSesi(req.headers.authorization);
    res.json({ ok: true, data: { keluar: true } });
  });

  // Pengaturan, Tim RBAC, Integrasi Publik, Backup & Audit Log Terpadu (Tahap 11)
  router.get('/pengaturan', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const hasil = ambilPengaturanUntukSesi(sesi);
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.patch('/pengaturan/event', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = perbaruiPengaturanEventUntukSesi({ sesi, body });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.patch('/pengaturan/anggaran', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = perbaruiPlafonAnggaranUntukSesi({ sesi, body });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.patch('/pengaturan/integrasi', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = perbaruiIntegrasiPublikUntukSesi({ sesi, body });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.post('/pengaturan/tim', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = kelolaAnggotaTimUntukSesi({ sesi, body });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.patch('/pengaturan/tim', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = kelolaAnggotaTimUntukSesi({ sesi, body });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.delete('/pengaturan/tim', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const idAnggota = typeof req.query.id === 'string' ? req.query.id : '';
    const permanen = req.query.permanen === 'true';
    const hasil = hapusAtauNonaktifkanTimUntukSesi({ sesi, idAnggota, permanen });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.delete('/pengaturan/tim/:id', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const permanen = req.query.permanen === 'true';
    const hasil = hapusAtauNonaktifkanTimUntukSesi({
      sesi,
      idAnggota: req.params.id,
      permanen,
    });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.get('/pengaturan/backup', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const hasil = eksporBackupPengaturanUntukSesi(sesi);
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.get('/audit', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const statusRaw = String(req.query.status ?? 'semua');
    const status =
      statusRaw === 'sukses' || statusRaw === 'ditolak' || statusRaw === 'gagal'
        ? statusRaw
        : 'semua';
    const hasil = ambilAuditTerpaduUntukSesi({
      sesi,
      status,
      aksi: typeof req.query.aksi === 'string' ? req.query.aksi : '',
      kataKunci: typeof req.query.q === 'string' ? req.query.q : '',
      batas: Number(req.query.batas ?? 100),
    });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.get('/drive/health', async (_req, res) => {
    const hasil = await ambilKesehatanDrive();
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.get('/drive/assets', async (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    if (req.query.sampah === 'true') {
      const sampah = daftarSampahAsetUntukSesi(sesi);
      res.status(sampah.statusHttp).json(sampah.body);
      return;
    }
    const hasil = await daftarAsetUntukSesi({ sesi });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.post('/drive/assets/:id/restore', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const hasil = pulihkanAsetUntukSesi({ sesi, idAset: req.params.id });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.post('/drive/restore', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const idAset =
      typeof req.query.id === 'string'
        ? req.query.id
        : String(body.id ?? '');
    const hasil = pulihkanAsetUntukSesi({ sesi, idAset });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.post('/drive/upload', async (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const base64Mentah = String(body.base64Content ?? '');
    const buffer = base64Mentah
      ? Buffer.from(base64Mentah, 'base64')
      : Buffer.alloc(0);

    const hasil = await unggahAsetKecilTervalidasi({
      sesi,
      namaFile: String(body.namaFile ?? ''),
      namaTampilan:
        typeof body.namaTampilan === 'string' ? body.namaTampilan : undefined,
      mimeType: String(body.mimeType ?? ''),
      buffer,
      folderKode: String(body.folderKode ?? ''),
      kategori: typeof body.kategori === 'string' ? body.kategori : undefined,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      kontenTertaut: Array.isArray(body.kontenTertaut)
        ? body.kontenTertaut.map(String)
        : [],
      tugasTertaut: Array.isArray(body.tugasTertaut)
        ? body.tugasTertaut.map(String)
        : [],
      sesiShootingId:
        typeof body.sesiShootingId === 'string' ? body.sesiShootingId : '',
      catatan: typeof body.catatan === 'string' ? body.catatan : '',
      idempotencyKey:
        req.header('x-idempotency-key') ??
        (typeof body.idempotencyKey === 'string'
          ? body.idempotencyKey
          : undefined),
    });

    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.post('/drive/manual', async (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const hasil = await daftarkanAsetEksternalManual({
      sesi,
      namaFile: String(body.namaFile ?? ''),
      namaTampilan:
        typeof body.namaTampilan === 'string' ? body.namaTampilan : undefined,
      folderKode: String(body.folderKode ?? ''),
      kategori: String(body.kategori ?? 'raw-video'),
      mimeType: typeof body.mimeType === 'string' ? body.mimeType : undefined,
      sizeBytes: typeof body.sizeBytes === 'number' ? body.sizeBytes : 0,
      driveUrl: typeof body.driveUrl === 'string' ? body.driveUrl : '',
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      kontenTertaut: Array.isArray(body.kontenTertaut)
        ? body.kontenTertaut.map(String)
        : [],
      tugasTertaut: Array.isArray(body.tugasTertaut)
        ? body.tugasTertaut.map(String)
        : [],
      sesiShootingId:
        typeof body.sesiShootingId === 'string' ? body.sesiShootingId : '',
      catatan: typeof body.catatan === 'string' ? body.catatan : '',
      idempotencyKey:
        req.header('x-idempotency-key') ??
        (typeof body.idempotencyKey === 'string'
          ? body.idempotencyKey
          : undefined),
    });

    res.status(hasil.statusHttp).json(hasil.body);
  });

  const tanganiPatchAset = async (req: Request, res: Response) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const idAset =
      req.params.id ??
      (typeof req.query.id === 'string' ? req.query.id : '');
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = await perbaruiMetadataAset({
      sesi,
      idAset,
      perubahan: body,
    });
    res.status(hasil.statusHttp).json(hasil.body);
  };

  const tanganiDeleteAset = async (req: Request, res: Response) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const idAset =
      req.params.id ??
      (typeof req.query.id === 'string' ? req.query.id : '');
    const permanen = req.query.permanen === 'true';
    const hasil = await hapusAsetUntukSesi({
      sesi,
      idAset,
      permanen,
    });
    res.status(hasil.statusHttp).json(hasil.body);
  };

  router.patch('/drive/assets', tanganiPatchAset);
  router.patch('/drive/assets/:id', tanganiPatchAset);
  router.delete('/drive/assets', tanganiDeleteAset);
  router.delete('/drive/assets/:id', tanganiDeleteAset);

  router.get('/drive/audit', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const hasil = ambilAuditLogUntukSesi(sesi);
    res.status(hasil.statusHttp).json(hasil.body);
  });

  // Stakeholder CRM endpoints (RBAC + Server-side PII masking + soft delete)
  router.get('/stakeholders', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    if (req.query.sampah === 'true') {
      const sampah = daftarSampahStakeholderUntukSesi(sesi);
      res.status(sampah.statusHttp).json(sampah.body);
      return;
    }
    const hasil = daftarStakeholderUntukSesi(sesi);
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.post('/stakeholders/:id/restore', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const hasil = pulihkanStakeholderUntukSesi({
      sesi,
      idStakeholder: req.params.id,
    });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.post('/stakeholders/restore', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const idStakeholder =
      typeof req.query.id === 'string'
        ? req.query.id
        : String(body.id ?? '');
    const hasil = pulihkanStakeholderUntukSesi({ sesi, idStakeholder });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.post('/stakeholders', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = tambahStakeholderUntukSesi({ sesi, body });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  router.post('/stakeholders/import', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const daftarBaris = Array.isArray(body.daftarBaris)
      ? (body.daftarBaris as Array<Record<string, unknown>>)
      : [];
    const hasil = imporCsvStakeholderUntukSesi({ sesi, daftarBaris });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  const tanganiPatchStakeholder = (req: Request, res: Response) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const idStakeholder =
      req.params.id ??
      (typeof req.query.id === 'string' ? req.query.id : '');
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = perbaruiStakeholderUntukSesi({
      sesi,
      idStakeholder,
      perubahan: body,
    });
    res.status(hasil.statusHttp).json(hasil.body);
  };

  const tanganiDeleteStakeholder = (req: Request, res: Response) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const idStakeholder =
      req.params.id ??
      (typeof req.query.id === 'string' ? req.query.id : '');
    const permanen = req.query.permanen === 'true';
    const hasil = hapusStakeholderUntukSesi({
      sesi,
      idStakeholder,
      permanen,
    });
    res.status(hasil.statusHttp).json(hasil.body);
  };

  router.patch('/stakeholders', tanganiPatchStakeholder);
  router.patch('/stakeholders/:id', tanganiPatchStakeholder);
  router.delete('/stakeholders', tanganiDeleteStakeholder);
  router.delete('/stakeholders/:id', tanganiDeleteStakeholder);

  const tanganiOutreach = (req: Request, res: Response) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const idStakeholder =
      req.params.id ??
      (typeof req.query.id === 'string' ? req.query.id : '');
    const body = (req.body ?? {}) as Record<string, unknown>;
    const hasil = tambahLogOutreachUntukSesi({ sesi, idStakeholder, body });
    res.status(hasil.statusHttp).json(hasil.body);
  };

  router.post('/stakeholders/outreach', tanganiOutreach);
  router.post('/stakeholders/:id/outreach', tanganiOutreach);

  router.get('/stakeholders/export', (req, res) => {
    const sesi = verifikasiHeaderBearer(req.headers.authorization);
    const mode = req.query.mode === 'internal' ? 'internal' : 'public';
    const hasil = eksporStakeholderUntukSesi({ sesi, mode });
    res.status(hasil.statusHttp).json(hasil.body);
  });

  return router;
}
