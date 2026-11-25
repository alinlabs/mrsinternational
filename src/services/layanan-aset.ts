import type {
  AsetDrive,
  DefinisiFolderDrive,
  EntriAuditDrive,
  KategoriAset,
  KodeFolderDrive,
  StatusKesehatanDrive,
} from '../types/aset';

export interface ResponsApi<T> {
  ok: boolean;
  requestId?: string;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
  };
}

function headerOtentikasi(tokenBearer: string | null): HeadersInit {
  return tokenBearer ? { Authorization: `Bearer ${tokenBearer}` } : {};
}

export async function cekKesehatanDriveApi(): Promise<ResponsApi<StatusKesehatanDrive>> {
  const resp = await fetch('/api/drive/health');
  return (await resp.json()) as ResponsApi<StatusKesehatanDrive>;
}

export async function ambilDaftarAsetApi(
  tokenBearer: string | null,
): Promise<
  ResponsApi<{
    daftarFolder: DefinisiFolderDrive[];
    daftarAset: AsetDrive[];
    sumber: 'apps-script' | 'server-metadata';
  }>
> {
  const resp = await fetch('/api/drive/assets', {
    headers: headerOtentikasi(tokenBearer),
  });
  return (await resp.json()) as ResponsApi<{
    daftarFolder: DefinisiFolderDrive[];
    daftarAset: AsetDrive[];
    sumber: 'apps-script' | 'server-metadata';
  }>;
}

export async function ambilAuditDriveApi(
  tokenBearer: string | null,
): Promise<ResponsApi<EntriAuditDrive[]>> {
  const resp = await fetch('/api/drive/audit', {
    headers: headerOtentikasi(tokenBearer),
  });
  return (await resp.json()) as ResponsApi<EntriAuditDrive[]>;
}

export function bacaFileKeBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const hasil = typeof reader.result === 'string' ? reader.result : '';
      const idxKoma = hasil.indexOf(',');
      resolve(idxKoma >= 0 ? hasil.slice(idxKoma + 1) : hasil);
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas lokal.'));
    reader.readAsDataURL(file);
  });
}

export function unggahAsetKecilDenganProgres(params: {
  tokenBearer: string | null;
  file: File;
  base64Content: string;
  namaTampilan: string;
  folderKode: KodeFolderDrive;
  kategori: KategoriAset;
  tags: string[];
  kontenTertaut: string[];
  tugasTertaut: string[];
  sesiShootingId: string;
  catatan: string;
  idempotencyKey: string;
  onProgres: (persen: number) => void;
  onSediakanBatal: (batalkan: () => void) => void;
}): Promise<ResponsApi<AsetDrive>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/drive/upload');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Idempotency-Key', params.idempotencyKey);
    if (params.tokenBearer) {
      xhr.setRequestHeader('Authorization', `Bearer ${params.tokenBearer}`);
    }

    params.onSediakanBatal(() => xhr.abort());

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && ev.total > 0) {
        const persen = Math.min(95, Math.round((ev.loaded / ev.total) * 95));
        params.onProgres(persen);
      }
    };

    xhr.onload = () => {
      try {
        const parsed = JSON.parse(xhr.responseText || '{}') as ResponsApi<AsetDrive>;
        if (parsed.ok) {
          params.onProgres(100);
        }
        resolve(parsed);
      } catch {
        reject(new Error('Respons server unggah tidak dapat dibaca.'));
      }
    };

    xhr.onerror = () => reject(new Error('Koneksi jaringan terputus saat mengunggah.'));
    xhr.onabort = () => reject(new Error('DIBATALKAN_PENGGUNA'));

    xhr.send(
      JSON.stringify({
        namaFile: params.file.name,
        namaTampilan: params.namaTampilan,
        mimeType: params.file.type || 'application/octet-stream',
        base64Content: params.base64Content,
        folderKode: params.folderKode,
        kategori: params.kategori,
        tags: params.tags,
        kontenTertaut: params.kontenTertaut,
        tugasTertaut: params.tugasTertaut,
        sesiShootingId: params.sesiShootingId,
        catatan: params.catatan,
        idempotencyKey: params.idempotencyKey,
      }),
    );
  });
}

export async function daftarkanAsetEksternalApi(params: {
  tokenBearer: string | null;
  namaFile: string;
  namaTampilan: string;
  folderKode: KodeFolderDrive;
  kategori: KategoriAset;
  mimeType: string;
  sizeBytes: number;
  driveUrl: string;
  tags: string[];
  kontenTertaut: string[];
  tugasTertaut: string[];
  sesiShootingId: string;
  catatan: string;
  idempotencyKey: string;
}): Promise<ResponsApi<AsetDrive>> {
  const resp = await fetch('/api/drive/manual', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': params.idempotencyKey,
      ...headerOtentikasi(params.tokenBearer),
    },
    body: JSON.stringify(params),
  });
  return (await resp.json()) as ResponsApi<AsetDrive>;
}

export async function perbaruiMetadataAsetApi(
  tokenBearer: string | null,
  idAset: string,
  perubahan: Partial<AsetDrive>,
): Promise<ResponsApi<AsetDrive>> {
  const resp = await fetch(`/api/drive/assets?id=${encodeURIComponent(idAset)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...headerOtentikasi(tokenBearer),
    },
    body: JSON.stringify(perubahan),
  });
  return (await resp.json()) as ResponsApi<AsetDrive>;
}

export async function hapusAsetApi(
  tokenBearer: string | null,
  idAset: string,
): Promise<ResponsApi<{ id: string; terhapus: boolean }>> {
  const resp = await fetch(`/api/drive/assets?id=${encodeURIComponent(idAset)}`, {
    method: 'DELETE',
    headers: headerOtentikasi(tokenBearer),
  });
  return (await resp.json()) as ResponsApi<{ id: string; terhapus: boolean }>;
}
