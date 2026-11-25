import crypto from 'node:crypto';
import type { EntriAuditTerstruktur } from '../types/pengaturan';
import type { PeranPengguna } from '../types/status';

const MAKS_LOG_MEMORI = 400;
const daftarAuditMemori: EntriAuditTerstruktur[] = [];

/**
 * Menyaring pola token, kredensial, atau nomor telepon panjang agar audit log
 * tidak pernah membocorkan rahasia atau nilai PII mentah.
 */
export function sanitasiTeksAudit(teks: string): string {
  return teks
    .replace(/Bearer\s+[A-Za-z0-9\-_.~+/]+=*/gi, 'Bearer [TERSARING]')
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g, '[JWT_TERSARING]')
    .replace(/(secret|token|passcode|password)\s*[:=]\s*\S+/gi, '$1=[TERSARING]')
    .replace(/\+?\d[\d\s\-()]{8,16}\d/g, '[KONTAK_TEREDAKSI]');
}

export function catatAuditDrive(input: {
  requestId: string;
  aktor: string;
  peran: PeranPengguna;
  aksi: string;
  target: string;
  status: 'sukses' | 'ditolak' | 'gagal';
  ringkasan: string;
  entitas?: string;
  recordId?: string;
  ringkasanSebelum?: string;
  ringkasanSesudah?: string;
}): EntriAuditTerstruktur {
  const entri: EntriAuditTerstruktur = {
    id: `aud-${crypto.randomUUID()}`,
    requestId: input.requestId,
    waktu: new Date().toISOString(),
    aktor: sanitasiTeksAudit(input.aktor).slice(0, 80),
    peran: input.peran,
    aksi: input.aksi.slice(0, 64),
    target: sanitasiTeksAudit(input.target).slice(0, 120),
    status: input.status,
    ringkasan: sanitasiTeksAudit(input.ringkasan).slice(0, 240),
    entitas: input.entitas?.slice(0, 48),
    recordId: input.recordId?.slice(0, 64),
    ringkasanSebelum: input.ringkasanSebelum
      ? sanitasiTeksAudit(input.ringkasanSebelum).slice(0, 160)
      : undefined,
    ringkasanSesudah: input.ringkasanSesudah
      ? sanitasiTeksAudit(input.ringkasanSesudah).slice(0, 160)
      : undefined,
  };

  daftarAuditMemori.unshift(entri);
  if (daftarAuditMemori.length > MAKS_LOG_MEMORI) {
    daftarAuditMemori.length = MAKS_LOG_MEMORI;
  }
  return entri;
}

export function ambilDaftarAuditDrive(batas = 50): EntriAuditTerstruktur[] {
  return daftarAuditMemori.slice(0, batas);
}

export function ambilDaftarAuditTerfilter(params?: {
  batas?: number;
  status?: 'semua' | 'sukses' | 'ditolak' | 'gagal';
  aksi?: string;
  kataKunci?: string;
}): EntriAuditTerstruktur[] {
  const batas = Math.min(Math.max(params?.batas ?? 100, 1), 250);
  const status = params?.status ?? 'semua';
  const aksi = (params?.aksi ?? '').trim().toLowerCase();
  const kata = (params?.kataKunci ?? '').trim().toLowerCase();

  return daftarAuditMemori
    .filter((item) => {
      if (status !== 'semua' && item.status !== status) return false;
      if (aksi && !item.aksi.toLowerCase().includes(aksi)) return false;
      if (kata) {
        const gabungan = `${item.aktor} ${item.aksi} ${item.target} ${item.ringkasan} ${item.entitas ?? ''} ${item.requestId}`.toLowerCase();
        if (!gabungan.includes(kata)) return false;
      }
      return true;
    })
    .slice(0, batas);
}

export function resetAuditDriveUntukTest(): void {
  daftarAuditMemori.length = 0;
}
