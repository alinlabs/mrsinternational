import { BATAS_UPLOAD_PROXY_DEFAULT_BYTES } from '../data/aset-kanonik';

export interface KonfigurasiDriveServer {
  appsScriptWebAppUrl: string;
  appsScriptSharedSecret: string;
  rootFolderId: string;
  controlledFolderUrl: string;
  maxProxyUploadBytes: number;
  terkonfigurasiAppsScript: boolean;
}

interface OverrideIntegrasiRuntime {
  appsScriptWebAppUrl?: string;
  controlledFolderUrl?: string;
  googleClientId?: string;
}

let overrideRuntime: OverrideIntegrasiRuntime = {};

const HOST_APPS_SCRIPT_DIIZINKAN = new Set([
  'script.google.com',
  'script.googleusercontent.com',
]);

export function validasiUrlAppsScriptAman(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return '';
    if (!HOST_APPS_SCRIPT_DIIZINKAN.has(parsed.hostname)) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

export function validasiUrlFolderDriveAman(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return '';
    if (parsed.hostname !== 'drive.google.com') return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

export function perbaruiOverrideIntegrasiRuntime(input: {
  appsScriptWebAppUrl?: string;
  controlledFolderUrl?: string;
  googleClientId?: string;
}): void {
  if (input.appsScriptWebAppUrl !== undefined) {
    overrideRuntime.appsScriptWebAppUrl = input.appsScriptWebAppUrl;
  }
  if (input.controlledFolderUrl !== undefined) {
    overrideRuntime.controlledFolderUrl = input.controlledFolderUrl;
  }
  if (input.googleClientId !== undefined) {
    overrideRuntime.googleClientId = input.googleClientId.trim();
  }
}

export function ambilGoogleClientIdPublik(): string {
  const dariEnv = (process.env.GOOGLE_OAUTH_CLIENT_ID ?? '').trim();
  if (dariEnv) return dariEnv;
  return (overrideRuntime.googleClientId ?? '').trim();
}

export function bacaKonfigurasiDriveServer(): KonfigurasiDriveServer {
  const envUrl = validasiUrlAppsScriptAman(
    process.env.APPS_SCRIPT_WEBAPP_URL ?? '',
  );
  const runtimeUrl = validasiUrlAppsScriptAman(
    overrideRuntime.appsScriptWebAppUrl ?? '',
  );
  const appsScriptWebAppUrl = envUrl || runtimeUrl;

  // Shared secret hanya dibaca dari environment server, tidak pernah dari body klien
  const appsScriptSharedSecret = (
    process.env.APPS_SCRIPT_SHARED_SECRET ?? ''
  ).trim();
  const rootFolderId = (process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? '').trim();

  const envFolderUrl = validasiUrlFolderDriveAman(
    process.env.GOOGLE_DRIVE_PARENT_FOLDER_URL ?? '',
  );
  const runtimeFolderUrl = validasiUrlFolderDriveAman(
    overrideRuntime.controlledFolderUrl ?? '',
  );
  const controlledFolderUrl = envFolderUrl || runtimeFolderUrl;

  const envMaxBytes = Number(process.env.MAX_PROXY_UPLOAD_BYTES);
  const maxProxyUploadBytes =
    Number.isFinite(envMaxBytes) &&
    envMaxBytes >= 1024 &&
    envMaxBytes <= 20 * 1024 * 1024
      ? Math.floor(envMaxBytes)
      : BATAS_UPLOAD_PROXY_DEFAULT_BYTES;

  return {
    appsScriptWebAppUrl,
    appsScriptSharedSecret,
    rootFolderId,
    controlledFolderUrl,
    maxProxyUploadBytes,
    terkonfigurasiAppsScript: Boolean(
      appsScriptWebAppUrl && appsScriptSharedSecret,
    ),
  };
}

export function resetOverrideIntegrasiUntukTest(): void {
  overrideRuntime = {};
}
