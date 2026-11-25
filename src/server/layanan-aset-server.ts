import crypto from 'node:crypto';
import { DAFTAR_FOLDER_DRIVE_KANONIK } from '../data/aset-kanonik';
import type {
  AsetDrive,
  KategoriAset,
  KodeFolderDrive,
  StatusKesehatanDrive,
  VisibilitasAset,
} from '../types/aset';
import type { SesiPengguna } from '../types/status';
import { tebakKategoriDariMime } from '../utils/aset';
import { ambilDaftarAuditDrive, catatAuditDrive } from './audit-log';
import {
  adalahKodeFolderValid,
  sanitasiNamaFile,
  validasiBerkasUpload,
  validasiTautanDriveAman,
} from './keamanan-upload';
import { panggilAppsScript, type FetchFn } from './klien-apps-script';
import {
  bacaKonfigurasiDriveServer,
  type KonfigurasiDriveServer,
} from './konfigurasi-drive';
import {
  bolehLihatAset,
  periksaIzinOperasiDrive,
} from './sesi-rbac';

export interface HasilOperasiHttp<T = unknown> {
  statusHttp: number;
  body:
    | { ok: true; requestId: string; data: T }
    | {
        ok: false;
        requestId: string;
        error: { code: string; message: string; retryable?: boolean };
      };
}

// Penyimpanan metadata operasional sisi server (diisi hanya dari upload terverifikasi / pendaftaran manual nyata — 0 seed palsu)
const penyimpananAsetMemori = new Map<string, AsetDrive>();
const sampahAsetMemori = new Map<string, AsetDrive>();
const indeksIdempotensiMemori = new Map<string, string>();
const catatanRateLimitMemori = new Map<string, number[]>();

const KATEGORI_VALID = new Set<KategoriAset>([
  'raw-video',
  'edited-video',
  'image',
  'design',
  'document',
  'audio',
  'other',
]);

const VISIBILITAS_VALID = new Set<VisibilitasAset>([
  'internal',
  'owner-only',
  'approved-for-public',
]);

function periksaRateLimit(aktorKey: string, batasPerMenit = 30): boolean {
  const sekarang = Date.now();
  const satuMenitLalu = sekarang - 60_000;
  const riwayat = (catatanRateLimitMemori.get(aktorKey) ?? []).filter(
    (t) => t > satuMenitLalu,
  );
  if (riwayat.length >= batasPerMenit) {
    catatanRateLimitMemori.set(aktorKey, riwayat);
    return false;
  }
  riwayat.push(sekarang);
  catatanRateLimitMemori.set(aktorKey, riwayat);
  return true;
}

function buatRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}

export async function ambilKesehatanDrive(params?: {
  konfigurasi?: KonfigurasiDriveServer;
  fetchImpl?: FetchFn;
}): Promise<HasilOperasiHttp<StatusKesehatanDrive>> {
  const requestId = buatRequestId();
  const cfg = params?.konfigurasi ?? bacaKonfigurasiDriveServer();
  const sekarang = new Date().toISOString();

  if (!cfg.terkonfigurasiAppsScript) {
    return {
      statusHttp: 200,
      body: {
        ok: true,
        requestId,
        data: {
          status: 'not-configured',
          terkonfigurasi: false,
          pesan:
            'APPS_SCRIPT_WEBAPP_URL dan APPS_SCRIPT_SHARED_SECRET belum dikonfigurasi pada environment server. Gunakan pendaftaran metadata eksternal sementara hingga kredensial Drive Owner dipasang.',
          namaFolderInduk: cfg.rootFolderId
            ? `Folder Induk (${cfg.rootFolderId.slice(0, 8)}...)`
            : 'MRs Plan — Root Drive (Belum Terhubung)',
          tautanFolderTerkontrol: cfg.controlledFolderUrl,
          batasUploadBytes: cfg.maxProxyUploadBytes,
          mendukungUploadVideoBesar: false,
          lastCheckedAt: sekarang,
          requestId,
        },
      },
    };
  }

  const hasilGas = await panggilAppsScript<{
    rootFolderName?: string;
    folderCount?: number;
    status?: string;
  }>({
    konfigurasi: cfg,
    action: 'healthCheck',
    payload: {
      rootFolderId: cfg.rootFolderId || undefined,
    },
    requestId,
    fetchImpl: params?.fetchImpl,
  });

  if (!hasilGas.ok) {
    return {
      statusHttp: 200,
      body: {
        ok: true,
        requestId,
        data: {
          status: 'degraded',
          terkonfigurasi: true,
          pesan:
            hasilGas.error?.message ??
            'Koneksi ke Apps Script sedang bermasalah atau timeout.',
          namaFolderInduk: 'MRs Plan — Root Drive (Gangguan Koneksi)',
          tautanFolderTerkontrol: cfg.controlledFolderUrl,
          batasUploadBytes: cfg.maxProxyUploadBytes,
          mendukungUploadVideoBesar: false,
          lastCheckedAt: sekarang,
          requestId,
        },
      },
    };
  }

  return {
    statusHttp: 200,
    body: {
      ok: true,
      requestId,
      data: {
        status: 'connected',
        terkonfigurasi: true,
        pesan: 'Terhubung ke Google Apps Script Web App & folder Drive terkontrol.',
        namaFolderInduk:
          hasilGas.data?.rootFolderName ?? 'MRs Plan — Control Center Drive',
        tautanFolderTerkontrol: cfg.controlledFolderUrl,
        batasUploadBytes: cfg.maxProxyUploadBytes,
        mendukungUploadVideoBesar: false,
        lastCheckedAt: sekarang,
        requestId,
      },
    },
  };
}

export async function daftarAsetUntukSesi(params: {
  sesi: SesiPengguna | null;
  konfigurasi?: KonfigurasiDriveServer;
  fetchImpl?: FetchFn;
}): Promise<
  HasilOperasiHttp<{
    daftarFolder: typeof DAFTAR_FOLDER_DRIVE_KANONIK;
    daftarAset: AsetDrive[];
    sumber: 'apps-script' | 'server-metadata';
  }>
> {
  const requestId = buatRequestId();
  if (!params.sesi || !params.sesi.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Sesi kerja belum aktif. Masuk terlebih dahulu untuk mengakses perpustakaan aset.',
        },
      },
    };
  }

  const cfg = params.konfigurasi ?? bacaKonfigurasiDriveServer();

  if (cfg.terkonfigurasiAppsScript) {
    const hasilGas = await panggilAppsScript<{ assets?: AsetDrive[] }>({
      konfigurasi: cfg,
      action: 'listAssets',
      payload: { role: params.sesi.peran },
      requestId,
      fetchImpl: params.fetchImpl,
    });
    if (hasilGas.ok && Array.isArray(hasilGas.data?.assets)) {
      for (const aset of hasilGas.data.assets) {
        penyimpananAsetMemori.set(aset.id, aset);
      }
    }
  }

  const tersaring = Array.from(penyimpananAsetMemori.values())
    .filter((aset) =>
      bolehLihatAset(params.sesi?.peran ?? null, aset.folderKode, aset.visibility),
    )
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

  return {
    statusHttp: 200,
    body: {
      ok: true,
      requestId,
      data: {
        daftarFolder: DAFTAR_FOLDER_DRIVE_KANONIK,
        daftarAset: tersaring,
        sumber: cfg.terkonfigurasiAppsScript ? 'apps-script' : 'server-metadata',
      },
    },
  };
}

export async function unggahAsetKecilTervalidasi(params: {
  sesi: SesiPengguna | null;
  namaFile: string;
  namaTampilan?: string;
  mimeType: string;
  buffer: Uint8Array;
  folderKode: string;
  kategori?: string;
  tags?: string[];
  kontenTertaut?: string[];
  tugasTertaut?: string[];
  sesiShootingId?: string;
  catatan?: string;
  idempotencyKey?: string;
  konfigurasi?: KonfigurasiDriveServer;
  fetchImpl?: FetchFn;
}): Promise<HasilOperasiHttp<AsetDrive>> {
  const requestId = buatRequestId();
  const cfg = params.konfigurasi ?? bacaKonfigurasiDriveServer();

  if (!params.sesi || !params.sesi.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Akses ditolak: Anda harus mengaktifkan sesi kerja terlebih dahulu.',
        },
      },
    };
  }

  if (!periksaRateLimit(params.sesi.namaTampilan)) {
    return {
      statusHttp: 429,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'RATE_LIMITED',
          message: 'Terlalu banyak permintaan unggah dalam 1 menit. Tunggu sejenak lalu coba lagi.',
          retryable: true,
        },
      },
    };
  }

  const folderTarget = adalahKodeFolderValid(params.folderKode)
    ? params.folderKode
    : undefined;

  if (!periksaIzinOperasiDrive(params.sesi.peran, 'upload', folderTarget)) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'uploadSmallAsset',
      target: `${params.folderKode}/${sanitasiNamaFile(params.namaFile)}`,
      status: 'ditolak',
      ringkasan: `Peran ${params.sesi.peran} tidak diizinkan mengunggah ke folder ${params.folderKode}.`,
    });
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: `Peran Anda (${params.sesi.peran}) tidak memiliki izin unggah pada folder ${params.folderKode}.`,
        },
      },
    };
  }

  const hasilValidasi = validasiBerkasUpload({
    namaFile: params.namaFile,
    mimeType: params.mimeType,
    buffer: params.buffer,
    folderKode: params.folderKode,
    batasUkuranBytes: cfg.maxProxyUploadBytes,
  });

  if (!hasilValidasi.valid) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'uploadSmallAsset',
      target: `${params.folderKode}/${hasilValidasi.namaAman}`,
      status: 'ditolak',
      ringkasan: hasilValidasi.pesanGalat ?? 'Validasi berkas gagal.',
    });
    return {
      statusHttp: hasilValidasi.kodeStatusHttp,
      body: {
        ok: false,
        requestId,
        error: {
          code: hasilValidasi.kodeGalat ?? 'VALIDATION_FAILED',
          message: hasilValidasi.pesanGalat ?? 'Berkas tidak memenuhi syarat.',
        },
      },
    };
  }

  const checksum = crypto
    .createHash('sha256')
    .update(params.buffer)
    .digest('hex');

  const kunciIdempotensi = params.idempotencyKey?.trim()
    ? `${params.sesi.peran}:${params.folderKode}:${params.idempotencyKey.trim()}`
    : '';

  if (kunciIdempotensi) {
    const idSudahAda = indeksIdempotensiMemori.get(kunciIdempotensi);
    const asetSudahAda = idSudahAda ? penyimpananAsetMemori.get(idSudahAda) : undefined;
    if (asetSudahAda) {
      return {
        statusHttp: 200,
        body: {
          ok: true,
          requestId,
          data: asetSudahAda,
        },
      };
    }
  }

  if (!cfg.terkonfigurasiAppsScript) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'uploadSmallAsset',
      target: `${params.folderKode}/${hasilValidasi.namaAman}`,
      status: 'gagal',
      ringkasan:
        'Gagal upload langsung karena APPS_SCRIPT_WEBAPP_URL / secret belum dikonfigurasi.',
    });
    return {
      statusHttp: 503,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'DRIVE_NOT_CONFIGURED',
          message:
            'Google Apps Script Web App belum dikonfigurasi pada server sehingga file belum dapat dikirim ke Google Drive (tidak ada file ID Drive). Gunakan tab "Fallback Unggah Eksternal" bila Anda menaruh file secara manual di Drive.',
          retryable: false,
        },
      },
    };
  }

  const kategoriDipakai: KategoriAset =
    params.kategori && KATEGORI_VALID.has(params.kategori as KategoriAset)
      ? (params.kategori as KategoriAset)
      : tebakKategoriDariMime(params.mimeType, params.folderKode as KodeFolderDrive);

  const hasilGas = await panggilAppsScript<{
    fileId: string;
    driveUrl?: string;
    folderId?: string;
    name?: string;
    mimeType?: string;
    sizeBytes?: number;
    createdAt?: string;
    thumbnailUrl?: string;
  }>({
    konfigurasi: cfg,
    action: 'uploadSmallAsset',
    payload: {
      folderKode: params.folderKode,
      fileName: hasilValidasi.namaAman,
      mimeType: params.mimeType,
      sizeBytes: params.buffer.byteLength,
      checksum,
      visibility: 'internal',
      base64Content: Buffer.from(params.buffer).toString('base64'),
      uploadedBy: params.sesi.namaTampilan,
      tags: params.tags ?? [],
      kontenTertaut: params.kontenTertaut ?? [],
      sesiShootingId: params.sesiShootingId ?? '',
    },
    requestId,
    fetchImpl: params.fetchImpl,
  });

  if (!hasilGas.ok || !hasilGas.data?.fileId) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'uploadSmallAsset',
      target: `${params.folderKode}/${hasilValidasi.namaAman}`,
      status: 'gagal',
      ringkasan:
        hasilGas.error?.message ??
        'Apps Script tidak mengembalikan Drive fileId.',
    });
    return {
      statusHttp: 502,
      body: {
        ok: false,
        requestId,
        error: {
          code: hasilGas.error?.code ?? 'MISSING_DRIVE_FILE_ID',
          message:
            hasilGas.error?.message ??
            'Google Apps Script tidak mengembalikan ID file Drive yang valid. Unggahan tidak ditandai selesai.',
          retryable: hasilGas.error?.retryable ?? true,
        },
      },
    };
  }

  const asetBaru: AsetDrive = {
    id: `ast-${crypto.randomUUID()}`,
    driveFileId: hasilGas.data.fileId,
    driveUrl:
      hasilGas.data.driveUrl && validasiTautanDriveAman(hasilGas.data.driveUrl)
        ? hasilGas.data.driveUrl
        : `https://drive.google.com/file/d/${encodeURIComponent(hasilGas.data.fileId)}/view`,
    folderKode: params.folderKode as KodeFolderDrive,
    folderId: hasilGas.data.folderId ?? '',
    namaAsli: hasilValidasi.namaAman,
    namaTampilan: params.namaTampilan?.trim() || hasilValidasi.namaAman,
    mimeType: hasilGas.data.mimeType ?? params.mimeType,
    sizeBytes: hasilGas.data.sizeBytes ?? params.buffer.byteLength,
    kategori: kategoriDipakai,
    tags: (params.tags ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 12),
    kontenTertaut: (params.kontenTertaut ?? []).map((k) => k.trim()).filter(Boolean),
    tugasTertaut: (params.tugasTertaut ?? []).map((t) => t.trim()).filter(Boolean),
    sesiShootingId:
      params.sesiShootingId === 'shoot-hari-1' ||
      params.sesiShootingId === 'shoot-hari-2' ||
      params.sesiShootingId === 'shoot-hari-3' ||
      params.sesiShootingId === 'pra-event'
        ? params.sesiShootingId
        : '',
    visibility: 'internal',
    statusSinkron: 'tersinkron-drive',
    uploadedBy: params.sesi.namaTampilan,
    uploadedAt: hasilGas.data.createdAt ?? new Date().toISOString(),
    checksum,
    thumbnailUrl:
      hasilGas.data.thumbnailUrl && validasiTautanDriveAman(hasilGas.data.thumbnailUrl)
        ? hasilGas.data.thumbnailUrl
        : '',
    catatan: (params.catatan ?? '').trim().slice(0, 400),
  };

  penyimpananAsetMemori.set(asetBaru.id, asetBaru);
  if (kunciIdempotensi) {
    indeksIdempotensiMemori.set(kunciIdempotensi, asetBaru.id);
  }

  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'uploadSmallAsset',
    target: `${asetBaru.folderKode}/${asetBaru.namaAsli}`,
    status: 'sukses',
    ringkasan: `Berhasil tersinkron ke Drive (fileId: ${asetBaru.driveFileId}).`,
  });

  return {
    statusHttp: 201,
    body: {
      ok: true,
      requestId,
      data: asetBaru,
    },
  };
}

export async function daftarkanAsetEksternalManual(params: {
  sesi: SesiPengguna | null;
  namaFile: string;
  namaTampilan?: string;
  folderKode: string;
  kategori: string;
  mimeType?: string;
  sizeBytes?: number;
  driveUrl?: string;
  tags?: string[];
  kontenTertaut?: string[];
  tugasTertaut?: string[];
  sesiShootingId?: string;
  catatan?: string;
  idempotencyKey?: string;
  konfigurasi?: KonfigurasiDriveServer;
  fetchImpl?: FetchFn;
}): Promise<HasilOperasiHttp<AsetDrive>> {
  const requestId = buatRequestId();
  const cfg = params.konfigurasi ?? bacaKonfigurasiDriveServer();

  if (!params.sesi || !params.sesi.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Akses ditolak: aktifkan sesi kerja terlebih dahulu.',
        },
      },
    };
  }

  if (!adalahKodeFolderValid(params.folderKode)) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'INVALID_FOLDER',
          message: 'Folder tujuan tidak valid.',
        },
      },
    };
  }

  if (!periksaIzinOperasiDrive(params.sesi.peran, 'manual', params.folderKode)) {
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: `Peran ${params.sesi.peran} tidak diizinkan mendaftarkan aset pada folder ${params.folderKode}.`,
        },
      },
    };
  }

  if (!params.namaFile.trim()) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'MISSING_FILENAME',
          message: 'Nama file wajib diisi sesuai penamaan standar proyek.',
        },
      },
    };
  }

  if (params.driveUrl && !validasiTautanDriveAman(params.driveUrl)) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'INVALID_DRIVE_URL',
          message:
            'Tautan eksternal harus berupa URL https://drive.google.com/... atau https://docs.google.com/... yang valid.',
        },
      },
    };
  }

  const kunciIdempotensi = params.idempotencyKey?.trim()
    ? `manual:${params.sesi.peran}:${params.folderKode}:${params.idempotencyKey.trim()}`
    : '';
  if (kunciIdempotensi) {
    const idSudahAda = indeksIdempotensiMemori.get(kunciIdempotensi);
    const asetSudahAda = idSudahAda ? penyimpananAsetMemori.get(idSudahAda) : undefined;
    if (asetSudahAda) {
      return { statusHttp: 200, body: { ok: true, requestId, data: asetSudahAda } };
    }
  }

  const namaAman = sanitasiNamaFile(params.namaFile);
  const asetManual: AsetDrive = {
    id: `ast-${crypto.randomUUID()}`,
    driveFileId: '',
    driveUrl: params.driveUrl?.trim() ?? '',
    folderKode: params.folderKode,
    folderId: '',
    namaAsli: namaAman,
    namaTampilan: params.namaTampilan?.trim() || namaAman,
    mimeType: params.mimeType?.trim() || 'video/mp4',
    sizeBytes:
      typeof params.sizeBytes === 'number' && params.sizeBytes >= 0
        ? Math.floor(params.sizeBytes)
        : 0,
    kategori: KATEGORI_VALID.has(params.kategori as KategoriAset)
      ? (params.kategori as KategoriAset)
      : 'raw-video',
    tags: (params.tags ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 12),
    kontenTertaut: (params.kontenTertaut ?? []).map((k) => k.trim()).filter(Boolean),
    tugasTertaut: (params.tugasTertaut ?? []).map((t) => t.trim()).filter(Boolean),
    sesiShootingId:
      params.sesiShootingId === 'shoot-hari-1' ||
      params.sesiShootingId === 'shoot-hari-2' ||
      params.sesiShootingId === 'shoot-hari-3' ||
      params.sesiShootingId === 'pra-event'
        ? params.sesiShootingId
        : '',
    visibility: 'internal',
    statusSinkron: 'unggah-eksternal-menunggu-sinkronisasi',
    uploadedBy: params.sesi.namaTampilan,
    uploadedAt: new Date().toISOString(),
    checksum: '',
    thumbnailUrl: '',
    catatan: (params.catatan ?? '').trim().slice(0, 400),
  };

  if (cfg.terkonfigurasiAppsScript) {
    await panggilAppsScript({
      konfigurasi: cfg,
      action: 'saveAssetMetadata',
      payload: { aset: asetManual },
      requestId,
      fetchImpl: params.fetchImpl,
    });
  }

  penyimpananAsetMemori.set(asetManual.id, asetManual);
  if (kunciIdempotensi) {
    indeksIdempotensiMemori.set(kunciIdempotensi, asetManual.id);
  }

  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'registerExternalAsset',
    target: `${asetManual.folderKode}/${asetManual.namaAsli}`,
    status: 'sukses',
    ringkasan: 'Metadata didaftarkan via fallback eksternal (menunggu sinkronisasi Drive).',
  });

  return {
    statusHttp: 201,
    body: { ok: true, requestId, data: asetManual },
  };
}

export async function perbaruiMetadataAset(params: {
  sesi: SesiPengguna | null;
  idAset: string;
  perubahan: Partial<
    Pick<
      AsetDrive,
      | 'namaTampilan'
      | 'folderKode'
      | 'kategori'
      | 'tags'
      | 'kontenTertaut'
      | 'tugasTertaut'
      | 'sesiShootingId'
      | 'visibility'
      | 'driveUrl'
      | 'catatan'
    >
  >;
  konfigurasi?: KonfigurasiDriveServer;
  fetchImpl?: FetchFn;
}): Promise<HasilOperasiHttp<AsetDrive>> {
  const requestId = buatRequestId();
  if (!params.sesi || !params.sesi.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: { code: 'UNAUTHORIZED', message: 'Sesi kerja belum aktif.' },
      },
    };
  }

  const asetSaatIni = penyimpananAsetMemori.get(params.idAset);
  if (!asetSaatIni) {
    return {
      statusHttp: 404,
      body: {
        ok: false,
        requestId,
        error: { code: 'ASSET_NOT_FOUND', message: 'Aset tidak ditemukan.' },
      },
    };
  }

  const folderBaru =
    params.perubahan.folderKode && adalahKodeFolderValid(params.perubahan.folderKode)
      ? params.perubahan.folderKode
      : asetSaatIni.folderKode;

  if (!periksaIzinOperasiDrive(params.sesi.peran, 'edit', folderBaru)) {
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: `Peran ${params.sesi.peran} tidak diizinkan mengubah metadata pada folder ${folderBaru}.`,
        },
      },
    };
  }

  if (
    params.perubahan.visibility === 'approved-for-public' &&
    !periksaIzinOperasiDrive(params.sesi.peran, 'publishVisibility')
  ) {
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN_PUBLISH',
          message:
            'Hanya Owner, Admin, atau Digital Manager yang dapat mengubah visibilitas ke Disetujui Publik.',
        },
      },
    };
  }

  if (
    params.perubahan.driveUrl !== undefined &&
    !validasiTautanDriveAman(params.perubahan.driveUrl)
  ) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'INVALID_DRIVE_URL',
          message: 'Tautan Drive harus berupa URL https://drive.google.com/... yang valid.',
        },
      },
    };
  }

  const asetDiperbarui: AsetDrive = {
    ...asetSaatIni,
    namaTampilan:
      params.perubahan.namaTampilan !== undefined
        ? params.perubahan.namaTampilan.trim().slice(0, 120) || asetSaatIni.namaTampilan
        : asetSaatIni.namaTampilan,
    folderKode: folderBaru,
    kategori:
      params.perubahan.kategori && KATEGORI_VALID.has(params.perubahan.kategori)
        ? params.perubahan.kategori
        : asetSaatIni.kategori,
    tags:
      params.perubahan.tags !== undefined
        ? params.perubahan.tags.map((t) => t.trim()).filter(Boolean).slice(0, 12)
        : asetSaatIni.tags,
    kontenTertaut:
      params.perubahan.kontenTertaut !== undefined
        ? params.perubahan.kontenTertaut.map((k) => k.trim()).filter(Boolean)
        : asetSaatIni.kontenTertaut,
    tugasTertaut:
      params.perubahan.tugasTertaut !== undefined
        ? params.perubahan.tugasTertaut.map((t) => t.trim()).filter(Boolean)
        : asetSaatIni.tugasTertaut,
    sesiShootingId:
      params.perubahan.sesiShootingId !== undefined
        ? params.perubahan.sesiShootingId
        : asetSaatIni.sesiShootingId,
    visibility:
      params.perubahan.visibility && VISIBILITAS_VALID.has(params.perubahan.visibility)
        ? params.perubahan.visibility
        : asetSaatIni.visibility,
    driveUrl:
      params.perubahan.driveUrl !== undefined
        ? params.perubahan.driveUrl.trim()
        : asetSaatIni.driveUrl,
    catatan:
      params.perubahan.catatan !== undefined
        ? params.perubahan.catatan.trim().slice(0, 400)
        : asetSaatIni.catatan,
  };

  const cfg = params.konfigurasi ?? bacaKonfigurasiDriveServer();
  if (cfg.terkonfigurasiAppsScript) {
    await panggilAppsScript({
      konfigurasi: cfg,
      action: 'saveAssetMetadata',
      payload: { aset: asetDiperbarui },
      requestId,
      fetchImpl: params.fetchImpl,
    });
  }

  penyimpananAsetMemori.set(asetDiperbarui.id, asetDiperbarui);

  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'updateAssetMetadata',
    target: `${asetDiperbarui.folderKode}/${asetDiperbarui.namaAsli}`,
    status: 'sukses',
    ringkasan: `Metadata & visibilitas (${asetDiperbarui.visibility}) diperbarui.`,
  });

  return {
    statusHttp: 200,
    body: { ok: true, requestId, data: asetDiperbarui },
  };
}

export async function hapusAsetUntukSesi(params: {
  sesi: SesiPengguna | null;
  idAset: string;
  permanen?: boolean;
  konfigurasi?: KonfigurasiDriveServer;
  fetchImpl?: FetchFn;
}): Promise<HasilOperasiHttp<{ id: string; terhapus: boolean; permanen: boolean }>> {
  const requestId = buatRequestId();
  if (!params.sesi || !params.sesi.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: { code: 'UNAUTHORIZED', message: 'Sesi kerja belum aktif.' },
      },
    };
  }

  if (!periksaRateLimit(`delete:${params.sesi.peran}:${params.sesi.namaTampilan}`, 20)) {
    return {
      statusHttp: 429,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'RATE_LIMITED',
          message: 'Batas frekuensi penghapusan aset tercapai. Tunggu 1 menit.',
        },
      },
    };
  }

  if (!periksaIzinOperasiDrive(params.sesi.peran, 'delete')) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'deleteAsset',
      target: params.idAset,
      status: 'ditolak',
      ringkasan: `Peran ${params.sesi.peran} tidak berwenang menghapus aset.`,
      entitas: 'DriveAsset',
      recordId: params.idAset,
    });
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN_DELETE',
          message: 'Hanya Owner atau Admin yang dapat menghapus aset proyek.',
        },
      },
    };
  }

  const targetAktif = penyimpananAsetMemori.get(params.idAset);
  const targetSampah = sampahAsetMemori.get(params.idAset);
  const target = targetAktif ?? targetSampah;
  if (!target) {
    return {
      statusHttp: 404,
      body: {
        ok: false,
        requestId,
        error: { code: 'ASSET_NOT_FOUND', message: 'Aset tidak ditemukan.' },
      },
    };
  }

  if (!params.permanen) {
    if (targetAktif) {
      penyimpananAsetMemori.delete(params.idAset);
      sampahAsetMemori.set(params.idAset, {
        ...targetAktif,
        catatan: `[Arsip Hapus oleh ${params.sesi.namaTampilan} pada ${new Date().toISOString()}] ${targetAktif.catatan}`.trim(),
      });
    }
    catatAuditDrive({
      requestId,
      aktor: params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'softDeleteAsset',
      target: `${target.folderKode}/${target.namaAsli}`,
      status: 'sukses',
      ringkasan: 'Aset dipindahkan ke arsip terhapus (soft delete) dan masih dapat dipulihkan.',
      entitas: 'DriveAsset',
      recordId: params.idAset,
    });
    return {
      statusHttp: 200,
      body: {
        ok: true,
        requestId,
        data: { id: params.idAset, terhapus: true, permanen: false },
      },
    };
  }

  const cfg = params.konfigurasi ?? bacaKonfigurasiDriveServer();
  if (cfg.terkonfigurasiAppsScript && target.driveFileId) {
    const hasilGas = await panggilAppsScript({
      konfigurasi: cfg,
      action: 'deleteAsset',
      payload: { fileId: target.driveFileId, id: target.id },
      requestId,
      fetchImpl: params.fetchImpl,
    });
    if (!hasilGas.ok) {
      return {
        statusHttp: 502,
        body: {
          ok: false,
          requestId,
          error: {
            code: hasilGas.error?.code ?? 'GAS_DELETE_FAILED',
            message:
              hasilGas.error?.message ??
              'Gagal menghapus file di Google Drive.',
          },
        },
      };
    }
  }

  penyimpananAsetMemori.delete(params.idAset);
  sampahAsetMemori.delete(params.idAset);
  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'permanentDeleteAsset',
    target: `${target.folderKode}/${target.namaAsli}`,
    status: 'sukses',
    ringkasan: 'Aset dihapus permanen dengan konfirmasi Owner/Admin.',
    entitas: 'DriveAsset',
    recordId: params.idAset,
  });

  return {
    statusHttp: 200,
    body: {
      ok: true,
      requestId,
      data: { id: params.idAset, terhapus: true, permanen: true },
    },
  };
}

export function daftarSampahAsetUntukSesi(sesi: SesiPengguna | null) {
  const requestId = buatRequestId();
  if (!sesi?.terautentikasi || !sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false as const, requestId, error: { code: 'UNAUTHORIZED', message: 'Sesi kerja belum aktif.' } },
    };
  }
  if (!periksaIzinOperasiDrive(sesi.peran, 'delete')) {
    return {
      statusHttp: 403,
      body: { ok: false as const, requestId, error: { code: 'FORBIDDEN', message: 'Hanya Owner atau Admin yang dapat mengakses arsip terhapus.' } },
    };
  }
  return {
    statusHttp: 200,
    body: { ok: true as const, requestId, data: Array.from(sampahAsetMemori.values()) },
  };
}

export function pulihkanAsetUntukSesi(params: {
  sesi: SesiPengguna | null;
  idAset: string;
}) {
  const requestId = buatRequestId();
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false as const, requestId, error: { code: 'UNAUTHORIZED', message: 'Sesi kerja belum aktif.' } },
    };
  }
  if (!periksaIzinOperasiDrive(params.sesi.peran, 'delete')) {
    return {
      statusHttp: 403,
      body: { ok: false as const, requestId, error: { code: 'FORBIDDEN', message: 'Hanya Owner atau Admin yang boleh memulihkan aset.' } },
    };
  }
  const aset = sampahAsetMemori.get(params.idAset);
  if (!aset) {
    return {
      statusHttp: 404,
      body: { ok: false as const, requestId, error: { code: 'ASSET_NOT_FOUND', message: 'Aset tidak ditemukan di arsip terhapus.' } },
    };
  }
  sampahAsetMemori.delete(params.idAset);
  penyimpananAsetMemori.set(params.idAset, aset);
  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'restoreAsset',
    target: `${aset.folderKode}/${aset.namaAsli}`,
    status: 'sukses',
    ringkasan: 'Aset dipulihkan dari arsip terhapus ke Perpustakaan Aset.',
    entitas: 'DriveAsset',
    recordId: params.idAset,
  });
  return {
    statusHttp: 200,
    body: { ok: true as const, requestId, data: aset },
  };
}

export function ambilAuditLogUntukSesi(sesi: SesiPengguna | null) {
  const requestId = buatRequestId();
  if (!sesi || !sesi.terautentikasi || !sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false as const,
        requestId,
        error: { code: 'UNAUTHORIZED', message: 'Sesi kerja belum aktif.' },
      },
    };
  }

  if (!periksaIzinOperasiDrive(sesi.peran, 'audit')) {
    return {
      statusHttp: 403,
      body: {
        ok: false as const,
        requestId,
        error: {
          code: 'FORBIDDEN_AUDIT',
          message: 'Log audit hanya dapat dilihat oleh Owner, Admin, atau Digital Manager.',
        },
      },
    };
  }

  return {
    statusHttp: 200,
    body: {
      ok: true as const,
      requestId,
      data: ambilDaftarAuditDrive(50),
    },
  };
}

export function resetPenyimpananAsetUntukTest(): void {
  penyimpananAsetMemori.clear();
  sampahAsetMemori.clear();
  indeksIdempotensiMemori.clear();
  catatanRateLimitMemori.clear();
}
