import crypto from 'node:crypto';
import type { KonfigurasiDriveServer } from './konfigurasi-drive';

export type AksiAppsScript =
  | 'healthCheck'
  | 'listFolders'
  | 'listAssets'
  | 'uploadSmallAsset'
  | 'saveAssetMetadata'
  | 'getAssetMetadata'
  | 'deleteAsset';

const SET_AKSI_DIIZINKAN = new Set<AksiAppsScript>([
  'healthCheck',
  'listFolders',
  'listAssets',
  'uploadSmallAsset',
  'saveAssetMetadata',
  'getAssetMetadata',
  'deleteAsset',
]);

export interface ResponsAppsScript<T = Record<string, unknown>> {
  ok: boolean;
  requestId: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
}

export type FetchFn = typeof fetch;

export async function panggilAppsScript<T = Record<string, unknown>>(params: {
  konfigurasi: KonfigurasiDriveServer;
  action: AksiAppsScript;
  payload?: Record<string, unknown>;
  requestId?: string;
  fetchImpl?: FetchFn;
  timeoutMs?: number;
}): Promise<ResponsAppsScript<T>> {
  const requestId = params.requestId ?? `req_${crypto.randomUUID()}`;

  if (!SET_AKSI_DIIZINKAN.has(params.action)) {
    return {
      ok: false,
      requestId,
      error: {
        code: 'ACTION_NOT_ALLOWED',
        message: 'Operasi Apps Script tidak terdaftar dalam allowlist.',
      },
    };
  }

  if (!params.konfigurasi.terkonfigurasiAppsScript) {
    return {
      ok: false,
      requestId,
      error: {
        code: 'DRIVE_NOT_CONFIGURED',
        message:
          'Integrasi Google Apps Script Web App belum dikonfigurasi pada environment server.',
      },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    params.timeoutMs ?? 15_000,
  );

  try {
    const fetchDipakai = params.fetchImpl ?? fetch;
    const response = await fetchDipakai(params.konfigurasi.appsScriptWebAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '1',
        action: params.action,
        requestId,
        issuedAt: new Date().toISOString(),
        auth: {
          secret: params.konfigurasi.appsScriptSharedSecret,
        },
        payload: params.payload ?? {},
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        requestId,
        error: {
          code: 'GAS_HTTP_ERROR',
          message: `Apps Script Web App mengembalikan status HTTP ${response.status}.`,
          retryable: response.status >= 500,
        },
      };
    }

    const body = (await response.json()) as Partial<ResponsAppsScript<T>> | null;
    if (!body || typeof body.ok !== 'boolean') {
      return {
        ok: false,
        requestId,
        error: {
          code: 'GAS_INVALID_RESPONSE',
          message: 'Format respons Apps Script tidak valid.',
        },
      };
    }

    if (!body.ok) {
      return {
        ok: false,
        requestId,
        error: {
          code: String(body.error?.code ?? 'GAS_OPERATION_FAILED').slice(0, 60),
          message: String(
            body.error?.message ?? 'Permintaan ke Google Drive gagal diproses.',
          ).slice(0, 200),
          retryable: Boolean(body.error?.retryable),
        },
      };
    }

    return {
      ok: true,
      requestId,
      data: body.data,
    };
  } catch (err) {
    const adalahAbort =
      err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      requestId,
      error: {
        code: adalahAbort ? 'GAS_TIMEOUT' : 'GAS_UNREACHABLE',
        message: adalahAbort
          ? 'Permintaan ke Google Apps Script melewati batas waktu.'
          : 'Tidak dapat menghubungi layanan Google Apps Script saat ini.',
        retryable: true,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
