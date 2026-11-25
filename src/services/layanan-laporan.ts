import type { AsetDrive } from '../types/aset';
import type { ResponsApi } from './layanan-aset';

export async function simpanLaporanPdfKeDriveApi(params: {
  tokenBearer: string | null;
  namaFile: string;
  judulLaporan: string;
  base64Pdf: string;
  catatan: string;
  idempotencyKey: string;
}): Promise<ResponsApi<AsetDrive>> {
  const resp = await fetch('/api/drive/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': params.idempotencyKey,
      ...(params.tokenBearer
        ? { Authorization: `Bearer ${params.tokenBearer}` }
        : {}),
    },
    body: JSON.stringify({
      namaFile: params.namaFile,
      namaTampilan: params.judulLaporan,
      mimeType: 'application/pdf',
      base64Content: params.base64Pdf,
      folderKode: '08_Reports',
      kategori: 'document',
      tags: ['laporan-pdf', 'control-center'],
      kontenTertaut: [],
      tugasTertaut: [],
      sesiShootingId: '',
      catatan: params.catatan,
      idempotencyKey: params.idempotencyKey,
    }),
  });

  return (await resp.json()) as ResponsApi<AsetDrive>;
}

export function unduhBlobPdf(blob: Blob, namaFile: string): void {
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement('a');
  tautan.href = url;
  tautan.download = namaFile;
  document.body.appendChild(tautan);
  tautan.click();
  document.body.removeChild(tautan);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
}
