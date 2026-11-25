import path from 'node:path';
import {
  DAFTAR_FOLDER_DRIVE_KANONIK,
  MIME_DIIZINKAN_ASET,
} from '../data/aset-kanonik';
import type { KodeFolderDrive } from '../types/aset';

const SET_KODE_FOLDER = new Set<string>(
  DAFTAR_FOLDER_DRIVE_KANONIK.map((f) => f.kode),
);

export function adalahKodeFolderValid(kode: string): kode is KodeFolderDrive {
  return SET_KODE_FOLDER.has(kode);
}

export function sanitasiNamaFile(namaMentah: string): string {
  const namaDasar = path.posix.basename(namaMentah.replace(/\\/g, '/'));
  const dibersihkan = namaDasar
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^\.+/, '');
  return dibersihkan.slice(0, 120) || 'aset_ragi_hotang';
}

export function deteksiMagicBytes(buffer: Uint8Array): string | null {
  if (buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  // PDF: %PDF-
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return 'application/pdf';
  }

  // MP4: ftyp at offset 4
  if (
    buffer.length >= 8 &&
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    return 'video/mp4';
  }

  return null;
}

export interface HasilValidasiUpload {
  valid: boolean;
  kodeStatusHttp: number;
  kodeGalat?:
    | 'INVALID_FOLDER'
    | 'EMPTY_FILE'
    | 'FILE_TOO_LARGE'
    | 'UNSUPPORTED_MIME'
    | 'MIME_MISMATCH';
  pesanGalat?: string;
  namaAman: string;
}

export function validasiBerkasUpload(params: {
  namaFile: string;
  mimeType: string;
  buffer: Uint8Array;
  folderKode: string;
  batasUkuranBytes: number;
}): HasilValidasiUpload {
  const namaAman = sanitasiNamaFile(params.namaFile);

  if (!adalahKodeFolderValid(params.folderKode)) {
    return {
      valid: false,
      kodeStatusHttp: 400,
      kodeGalat: 'INVALID_FOLDER',
      pesanGalat: 'Folder tujuan tidak valid. Pilih salah satu dari 8 folder proyek (01_Brief s.d. 08_Reports).',
      namaAman,
    };
  }

  if (params.buffer.byteLength <= 0) {
    return {
      valid: false,
      kodeStatusHttp: 400,
      kodeGalat: 'EMPTY_FILE',
      pesanGalat: 'Berkas kosong tidak dapat diunggah.',
      namaAman,
    };
  }

  if (params.buffer.byteLength > params.batasUkuranBytes) {
    const batasMb = (params.batasUkuranBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      kodeStatusHttp: 413,
      kodeGalat: 'FILE_TOO_LARGE',
      pesanGalat: `Ukuran berkas melebihi batas proxy aman (${batasMb} MB). Untuk video besar, unggah langsung ke folder Google Drive terkontrol lalu daftarkan metadata melalui Fallback Eksternal.`,
      namaAman,
    };
  }

  const ekstensi = path.posix.extname(namaAman).toLowerCase();
  const ekstensiDiizinkan = MIME_DIIZINKAN_ASET[params.mimeType];

  if (!ekstensiDiizinkan || !ekstensiDiizinkan.includes(ekstensi)) {
    return {
      valid: false,
      kodeStatusHttp: 415,
      kodeGalat: 'UNSUPPORTED_MIME',
      pesanGalat:
        'Tipe berkas atau ekstensi tidak diizinkan. Gunakan JPG, PNG, WebP, PDF, atau MP4 (<= batas ukuran aktif).',
      namaAman,
    };
  }

  const magicMime = deteksiMagicBytes(params.buffer);
  if (magicMime !== params.mimeType) {
    return {
      valid: false,
      kodeStatusHttp: 415,
      kodeGalat: 'MIME_MISMATCH',
      pesanGalat:
        'Isi berkas biner tidak cocok dengan deklarasi MIME/ekstensi berkas. Unggahan ditolak untuk keamanan.',
      namaAman,
    };
  }

  return {
    valid: true,
    kodeStatusHttp: 200,
    namaAman,
  };
}

export function validasiTautanDriveAman(url: string): boolean {
  if (!url.trim()) return true;
  try {
    const parsed = new URL(url.trim());
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'drive.google.com' ||
        parsed.hostname === 'docs.google.com')
    );
  } catch {
    return false;
  }
}
