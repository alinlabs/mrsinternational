import crypto from 'node:crypto';
import {
  HANDLE_SOSIAL_KANONIK,
  KONTAK_RESMI_KANONIK,
  PENGATURAN_ANGGARAN_KANONIK,
  PENGATURAN_EVENT_KANONIK,
} from '../data/akses-kanonik';
import type {
  AnggotaTimAkses,
  HandleSosialPengaturan,
  KontakResmiPengaturan,
  PengaturanAnggaranSistem,
  PengaturanEventSistem,
} from '../types/pengaturan';
import type { PeranPengguna } from '../types/status';

export interface StatePengaturanServerMemori {
  event: PengaturanEventSistem;
  handleSosial: HandleSosialPengaturan[];
  kontakResmi: KontakResmiPengaturan;
  anggaran: PengaturanAnggaranSistem;
  daftarTim: AnggotaTimAkses[];
}

function buatStateAwalPengaturan(): StatePengaturanServerMemori {
  return {
    event: { ...PENGATURAN_EVENT_KANONIK },
    handleSosial: HANDLE_SOSIAL_KANONIK.map((h) => ({ ...h })),
    kontakResmi: { ...KONTAK_RESMI_KANONIK },
    anggaran: { ...PENGATURAN_ANGGARAN_KANONIK },
    daftarTim: [],
  };
}

let stateMemori: StatePengaturanServerMemori = buatStateAwalPengaturan();

export function ambilStatePengaturanMemori(): StatePengaturanServerMemori {
  return stateMemori;
}

export function ambilDaftarEmailEnvAllowlist(): string[] {
  return (process.env.ALLOWED_AUTH_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function ambilDaftarDomainEnvAllowlist(): string[] {
  return (process.env.ALLOWED_AUTH_DOMAINS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);
}

export function cariAnggotaTimByEmail(
  email: string,
): AnggotaTimAkses | undefined {
  const target = email.trim().toLowerCase();
  if (!target) return undefined;
  return stateMemori.daftarTim.find(
    (item) => item.email.toLowerCase() === target,
  );
}

export function daftarkanPermintaanOidcMemori(input: {
  email: string;
  namaTampilan: string;
  peran?: PeranPengguna;
  statusAkun?: AnggotaTimAkses['statusAkun'];
  sumberPendaftaran?: AnggotaTimAkses['sumberPendaftaran'];
  disetujuiOleh?: string;
}): AnggotaTimAkses {
  const emailBersih = input.email.trim().toLowerCase();
  const ada = cariAnggotaTimByEmail(emailBersih);
  if (ada) return ada;

  const sekarang = new Date().toISOString();
  const baru: AnggotaTimAkses = {
    id: `tim-${crypto.randomUUID().slice(0, 10)}`,
    email: emailBersih,
    namaTampilan: input.namaTampilan.trim().slice(0, 80) || emailBersih,
    peran: input.peran ?? 'viewer',
    statusAkun: input.statusAkun ?? 'menunggu-persetujuan',
    sumberPendaftaran: input.sumberPendaftaran ?? 'oidc-request',
    disetujuiOleh: input.disetujuiOleh ?? '',
    dibuatPada: sekarang,
    diperbaruiPada: sekarang,
  };
  stateMemori.daftarTim.unshift(baru);
  return baru;
}

export function resetStatePengaturanUntukTest(): void {
  stateMemori = buatStateAwalPengaturan();
}
