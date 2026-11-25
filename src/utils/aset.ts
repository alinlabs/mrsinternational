import { DAFTAR_FOLDER_DRIVE_KANONIK } from '../data/aset-kanonik';
import type {
  AsetDrive,
  FilterAsetDrive,
  KategoriAset,
  KodeFolderDrive,
  StatusKoneksiDrive,
  StatusSinkronAset,
  VisibilitasAset,
} from '../types/aset';

export function formatUkuranBerkas(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes) || bytes < 0) {
    return 'Belum diketahui';
  }
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export function dapatkanInfoStatusKoneksi(status: StatusKoneksiDrive): {
  label: string;
  nada: 'hijau' | 'peringatan' | 'netral' | 'bahaya';
} {
  switch (status) {
    case 'connected':
      return { label: 'Connected (Terhubung ke Drive)', nada: 'hijau' };
    case 'degraded':
      return { label: 'Degraded (Koneksi Parsial)', nada: 'peringatan' };
    case 'disconnected':
      return { label: 'Disconnected (Gagal Terhubung)', nada: 'bahaya' };
    case 'not-configured':
    default:
      return { label: 'Not Configured (Belum Dikonfigurasi)', nada: 'netral' };
  }
}

export function dapatkanInfoVisibilitas(visibilitas: VisibilitasAset): {
  label: string;
  nada: 'netral' | 'maroon' | 'hijau';
} {
  switch (visibilitas) {
    case 'owner-only':
      return { label: 'Khusus Owner & Admin', nada: 'maroon' };
    case 'approved-for-public':
      return { label: 'Disetujui Publik', nada: 'hijau' };
    case 'internal':
    default:
      return { label: 'Internal (Privat)', nada: 'netral' };
  }
}

export function dapatkanInfoStatusSinkron(status: StatusSinkronAset): {
  label: string;
  nada: 'hijau' | 'peringatan';
} {
  if (status === 'tersinkron-drive') {
    return { label: 'Tersinkron ke Google Drive', nada: 'hijau' };
  }
  return {
    label: 'Unggah eksternal; menunggu sinkronisasi',
    nada: 'peringatan',
  };
}

export function dapatkanLabelKategoriAset(kategori: KategoriAset): string {
  switch (kategori) {
    case 'raw-video':
      return 'Video Mentah';
    case 'edited-video':
      return 'Video Edit / Final';
    case 'image':
      return 'Gambar / Foto';
    case 'design':
      return 'Desain / Template';
    case 'document':
      return 'Dokumen / PDF';
    case 'audio':
      return 'Audio / VO';
    default:
      return 'Lainnya';
  }
}

export function tebakKategoriDariMime(mime: string, folder?: KodeFolderDrive): KategoriAset {
  if (folder === '02_Logo') return 'design';
  if (folder === '03_Interview_Raw' || folder === '04_Broll') return 'raw-video';
  if (folder === '05_Edit_Review' || folder === '06_Final_Export' || folder === '07_Ads') {
    return mime.startsWith('image/') ? 'design' : 'edited-video';
  }
  if (mime === 'application/pdf') return 'document';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'raw-video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'other';
}

export function apakahUrlEksternalAman(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function filterDaftarAset(
  daftar: AsetDrive[],
  filter: FilterAsetDrive,
): AsetDrive[] {
  const kata = filter.kataKunci.trim().toLowerCase();
  const uploader = filter.uploader.trim().toLowerCase();
  const konten = filter.kontenTertaut.trim().toLowerCase();

  return daftar.filter((aset) => {
    if (filter.folderKode !== 'semua' && aset.folderKode !== filter.folderKode) {
      return false;
    }
    if (filter.kategori !== 'semua' && aset.kategori !== filter.kategori) {
      return false;
    }
    if (filter.visibility !== 'semua' && aset.visibility !== filter.visibility) {
      return false;
    }
    if (filter.sesiShootingId && aset.sesiShootingId !== filter.sesiShootingId) {
      return false;
    }
    if (filter.tanggal && !aset.uploadedAt.startsWith(filter.tanggal)) {
      return false;
    }
    if (uploader && !aset.uploadedBy.toLowerCase().includes(uploader)) {
      return false;
    }
    if (
      konten &&
      !aset.kontenTertaut.some((id) => id.toLowerCase().includes(konten))
    ) {
      return false;
    }
    if (kata) {
      const gabungan = [
        aset.namaTampilan,
        aset.namaAsli,
        aset.folderKode,
        aset.tags.join(' '),
        aset.catatan,
        aset.driveFileId,
      ]
        .join(' ')
        .toLowerCase();
      if (!gabungan.includes(kata)) return false;
    }
    return true;
  });
}

export function hitungJumlahPerFolder(
  daftar: AsetDrive[],
): Record<KodeFolderDrive, number> {
  const hasil = Object.fromEntries(
    DAFTAR_FOLDER_DRIVE_KANONIK.map((f) => [f.kode, 0]),
  ) as Record<KodeFolderDrive, number>;

  for (const aset of daftar) {
    if (aset.folderKode in hasil) {
      hasil[aset.folderKode] += 1;
    }
  }
  return hasil;
}
