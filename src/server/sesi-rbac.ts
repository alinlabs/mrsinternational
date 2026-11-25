import crypto from 'node:crypto';
import { DAFTAR_PERAN_RBAC_KANONIK } from '../data/aset-kanonik';
import type { KodeFolderDrive, StatusBootstrapSesi, VisibilitasAset } from '../types/aset';
import type { PeranPengguna, SesiPengguna } from '../types/status';
import { catatAuditDrive } from './audit-log';
import {
  ambilDaftarDomainEnvAllowlist,
  ambilDaftarEmailEnvAllowlist,
  ambilStatePengaturanMemori,
  cariAnggotaTimByEmail,
  daftarkanPermintaanOidcMemori,
} from './direktori-akses';
import type { FetchFn } from './klien-apps-script';
import { ambilGoogleClientIdPublik } from './konfigurasi-drive';

const PERAN_VALID = new Set<PeranPengguna>([
  'owner',
  'admin',
  'digital-manager',
  'editor',
  'stakeholder-pic',
  'viewer',
]);

const FOLDER_EDITOR = new Set<KodeFolderDrive>([
  '03_Interview_Raw',
  '04_Broll',
  '05_Edit_Review',
  '06_Final_Export',
]);

const FOLDER_STAKEHOLDER = new Set<KodeFolderDrive>([
  '01_Brief',
  '02_Logo',
  '08_Reports',
]);

const ISSUER_GOOGLE_VALID = new Set([
  'https://accounts.google.com',
  'accounts.google.com',
]);

interface KredensialBootstrap {
  saltHex: string;
  hashHex: string;
}

interface PayloadTokenSesi {
  jti: string;
  sub: string;
  namaTampilan: string;
  email: string | null;
  peran: PeranPengguna;
  metodeAuth?: 'passcode' | 'bootstrap' | 'oidc';
  exp: number;
}

let kunciSesiEphemeral: Buffer | null = null;
let kredensialBootstrapTersimpan: KredensialBootstrap | null = null;
const tokenDicabutMemori = new Set<string>();
const rateLimitAuthMemori = new Map<string, number[]>();

function periksaRateLimitAuth(kunci: string, batasPerMenit = 15): boolean {
  const sekarang = Date.now();
  const satuMenitLalu = sekarang - 60_000;
  const riwayat = (rateLimitAuthMemori.get(kunci) ?? []).filter(
    (t) => t > satuMenitLalu,
  );
  if (riwayat.length >= batasPerMenit) {
    rateLimitAuthMemori.set(kunci, riwayat);
    return false;
  }
  riwayat.push(sekarang);
  rateLimitAuthMemori.set(kunci, riwayat);
  return true;
}

function ambilKunciPenandatangan(): Buffer {
  const dariEnv = (process.env.AUTH_SESSION_SECRET ?? '').trim();
  if (dariEnv.length >= 16) {
    return crypto.createHash('sha256').update(dariEnv).digest();
  }
  const konteksVercel = (
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_PROJECT_ID ||
    (process.env.VERCEL === '1' ? process.env.VERCEL_URL : '') ||
    ''
  ).trim();
  if (konteksVercel) {
    const benih = `${konteksVercel}:${process.env.PREVIEW_ADMIN_PASSCODE ?? ''}:mrs-vercel-session`;
    return crypto.createHash('sha256').update(benih).digest();
  }
  if (!kunciSesiEphemeral) {
    kunciSesiEphemeral = crypto.randomBytes(32);
  }
  return kunciSesiEphemeral;
}

function cocokkanKonstan(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function hashPasscodeScrypt(passcode: string, saltHex: string): string {
  return crypto.scryptSync(passcode, saltHex, 64).toString('hex');
}

export function adalahPeranValid(peran: string): peran is PeranPengguna {
  return PERAN_VALID.has(peran as PeranPengguna);
}

export function ambilStatusBootstrapSesi(): StatusBootstrapSesi {
  const passcodeEnv = (process.env.PREVIEW_ADMIN_PASSCODE ?? '').trim();
  const terkonfigurasiEnv = passcodeEnv.length > 0;
  const googleClientId = ambilGoogleClientIdPublik();
  return {
    terkonfigurasiEnv,
    perluBootstrapAdmin: !terkonfigurasiEnv && kredensialBootstrapTersimpan === null,
    oidcTerkonfigurasi: googleClientId.length > 0,
    googleClientId: googleClientId || undefined,
    domainDiizinkan: ambilDaftarDomainEnvAllowlist(),
    daftarPeranTersedia: DAFTAR_PERAN_RBAC_KANONIK,
  };
}

export function terbitkanTokenSesi(params: {
  namaTampilan: string;
  peran: PeranPengguna;
  email?: string | null;
  metodeAuth?: 'passcode' | 'bootstrap' | 'oidc';
}): { token: string; sesi: SesiPengguna } {
  const namaBersih = params.namaTampilan.trim().slice(0, 60) || 'Tim MRS';
  const emailBersih = params.email ? params.email.trim().toLowerCase().slice(0, 120) : null;
  const payload: PayloadTokenSesi = {
    jti: crypto.randomUUID(),
    sub: `sesi-${crypto.randomUUID()}`,
    namaTampilan: namaBersih,
    email: emailBersih,
    peran: params.peran,
    metodeAuth: params.metodeAuth ?? 'passcode',
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8 jam
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ambilKunciPenandatangan())
    .update(encodedPayload)
    .digest('base64url');

  return {
    token: `${encodedPayload}.${signature}`,
    sesi: {
      terautentikasi: true,
      namaTampilan: namaBersih,
      email: emailBersih,
      peran: params.peran,
      statusSesi: 'active',
    },
  };
}

export function verifikasiHeaderBearer(authorizationHeader?: string): SesiPengguna | null {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authorizationHeader.slice('Bearer '.length).trim();
  const bagian = token.split('.');
  if (bagian.length !== 2) return null;

  const [encodedPayload, signature] = bagian;
  if (!encodedPayload || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', ambilKunciPenandatangan())
    .update(encodedPayload)
    .digest('base64url');

  if (!cocokkanKonstan(signature, expectedSig)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as PayloadTokenSesi;

    if (
      !parsed ||
      typeof parsed.exp !== 'number' ||
      parsed.exp < Date.now() ||
      !PERAN_VALID.has(parsed.peran)
    ) {
      return null;
    }

    if (parsed.jti && tokenDicabutMemori.has(parsed.jti)) {
      return null;
    }

    // Jika akun terdaftar di direktori tim dan statusnya dinonaktifkan, cabut akses secara real-time
    if (parsed.email) {
      const anggota = cariAnggotaTimByEmail(parsed.email);
      if (anggota && anggota.statusAkun !== 'aktif') {
        return null;
      }
    }

    return {
      terautentikasi: true,
      namaTampilan: parsed.namaTampilan,
      email: parsed.email ?? null,
      peran: parsed.peran,
      statusSesi: 'active',
    };
  } catch {
    return null;
  }
}

export function cabutTokenSesi(authorizationHeader?: string): { ok: boolean } {
  const sesi = verifikasiHeaderBearer(authorizationHeader);
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return { ok: false };
  }
  const token = authorizationHeader.slice('Bearer '.length).trim();
  const [encodedPayload] = token.split('.');
  if (!encodedPayload) return { ok: false };

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as PayloadTokenSesi;
    if (parsed.jti) {
      tokenDicabutMemori.add(parsed.jti);
    }
    if (sesi?.peran) {
      catatAuditDrive({
        requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
        aktor: sesi.email || sesi.namaTampilan,
        peran: sesi.peran,
        aksi: 'AUTH_LOGOUT',
        target: 'sesi-aktif',
        status: 'sukses',
        ringkasan: 'Pengguna keluar dari sesi; token dicabut di server.',
        entitas: 'AuthSession',
      });
    }
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function prosesBootstrapAdmin(input: {
  passcode: string;
  namaTampilan: string;
  peran: string;
  email?: string;
}):
  | { ok: true; token: string; sesi: SesiPengguna }
  | { ok: false; statusHttp: number; kode: string; pesan: string } {
  if (!periksaRateLimitAuth('bootstrap')) {
    return {
      ok: false,
      statusHttp: 429,
      kode: 'RATE_LIMITED',
      pesan: 'Terlalu banyak percobaan bootstrap. Tunggu 1 menit sebelum mencoba kembali.',
    };
  }

  const status = ambilStatusBootstrapSesi();
  if (!status.perluBootstrapAdmin) {
    return {
      ok: false,
      statusHttp: 409,
      kode: 'BOOTSTRAP_LOCKED',
      pesan: 'Kredensial akses sudah ditetapkan. Gunakan formulir masuk dengan kode akses yang berlaku.',
    };
  }

  const passcode = input.passcode.trim();
  if (passcode.length < 6) {
    return {
      ok: false,
      statusHttp: 400,
      kode: 'WEAK_PASSCODE',
      pesan: 'Kode akses awal minimal 6 karakter.',
    };
  }

  const peran = (PERAN_VALID.has(input.peran as PeranPengguna)
    ? input.peran
    : 'owner') as PeranPengguna;

  const saltHex = crypto.randomBytes(16).toString('hex');
  const hashHex = hashPasscodeScrypt(passcode, saltHex);
  kredensialBootstrapTersimpan = { saltHex, hashHex };

  const namaFinal = input.namaTampilan.trim() || 'Owner / Admin Utama';
  const emailFinal = input.email?.trim().toLowerCase() || null;
  if (emailFinal) {
    daftarkanPermintaanOidcMemori({
      email: emailFinal,
      namaTampilan: namaFinal,
      peran,
      statusAkun: 'aktif',
      sumberPendaftaran: 'admin-invite',
      disetujuiOleh: 'Bootstrap Awal',
    });
  }

  const hasil = terbitkanTokenSesi({
    namaTampilan: namaFinal,
    peran,
    email: emailFinal,
    metodeAuth: 'bootstrap',
  });

  catatAuditDrive({
    requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
    aktor: emailFinal || namaFinal,
    peran,
    aksi: 'AUTH_BOOTSTRAP_CLAIM',
    target: peran,
    status: 'sukses',
    ringkasan: 'Klaim kredensial admin awal berhasil dan mengunci bootstrap.',
    entitas: 'AuthSession',
  });

  return {
    ok: true,
    ...hasil,
  };
}

export function prosesMasukSesi(input: {
  passcode: string;
  namaTampilan: string;
  peran: string;
  email?: string;
}):
  | { ok: true; token: string; sesi: SesiPengguna }
  | { ok: false; statusHttp: number; kode: string; pesan: string } {
  if (!periksaRateLimitAuth(`masuk:${input.peran || 'anon'}`)) {
    return {
      ok: false,
      statusHttp: 429,
      kode: 'RATE_LIMITED',
      pesan: 'Terlalu banyak percobaan masuk. Tunggu 1 menit lalu coba lagi.',
    };
  }

  if (!PERAN_VALID.has(input.peran as PeranPengguna)) {
    return {
      ok: false,
      statusHttp: 400,
      kode: 'INVALID_ROLE',
      pesan: 'Peran pengguna tidak dikenali.',
    };
  }

  const peranDiminta = input.peran as PeranPengguna;
  const emailBersih = input.email?.trim().toLowerCase() || null;

  // Jika direktori tim punya catatan untuk email ini, periksa status aktif & batas eskalasi peran
  if (emailBersih) {
    const anggota = cariAnggotaTimByEmail(emailBersih);
    if (anggota) {
      if (anggota.statusAkun === 'dinonaktifkan') {
        return {
          ok: false,
          statusHttp: 403,
          kode: 'ACCOUNT_DISABLED',
          pesan: 'Akun ini telah dinonaktifkan oleh Owner/Admin.',
        };
      }
      if (anggota.statusAkun === 'menunggu-persetujuan') {
        return {
          ok: false,
          statusHttp: 403,
          kode: 'PENDING_APPROVAL',
          pesan: 'Akun menunggu persetujuan Owner/Admin di menu Pengaturan > Tim.',
        };
      }
      if (anggota.peran !== peranDiminta) {
        catatAuditDrive({
          requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
          aktor: emailBersih,
          peran: anggota.peran,
          aksi: 'AUTH_ROLE_MISMATCH',
          target: peranDiminta,
          status: 'ditolak',
          ringkasan: `Permintaan masuk sebagai ${peranDiminta} ditolak karena peran terdaftar ${anggota.peran}.`,
          entitas: 'AuthSession',
        });
        return {
          ok: false,
          statusHttp: 403,
          kode: 'ROLE_NOT_ASSIGNED',
          pesan: `Email Anda terdaftar dengan peran ${anggota.peran}. Hubungi Owner untuk perubahan peran.`,
        };
      }
    }
  }

  const passcode = input.passcode.trim();
  const passcodeEnv = (process.env.PREVIEW_ADMIN_PASSCODE ?? '').trim();

  if (passcodeEnv) {
    if (!cocokkanKonstan(passcode, passcodeEnv)) {
      catatAuditDrive({
        requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
        aktor: emailBersih || input.namaTampilan || 'Anonim',
        peran: peranDiminta,
        aksi: 'AUTH_LOGIN_GAGAL',
        target: peranDiminta,
        status: 'ditolak',
        ringkasan: 'Percobaan masuk ditolak: kode akses tidak cocok.',
        entitas: 'AuthSession',
      });
      return {
        ok: false,
        statusHttp: 401,
        kode: 'INVALID_PASSCODE',
        pesan: 'Kode akses tidak cocok.',
      };
    }

    const hasil = terbitkanTokenSesi({
      namaTampilan: input.namaTampilan,
      peran: peranDiminta,
      email: emailBersih,
      metodeAuth: 'passcode',
    });
    catatAuditDrive({
      requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
      aktor: emailBersih || hasil.sesi.namaTampilan,
      peran: peranDiminta,
      aksi: 'AUTH_LOGIN_SUKSES',
      target: peranDiminta,
      status: 'sukses',
      ringkasan: `Masuk sesi kerja terverifikasi (${peranDiminta}).`,
      entitas: 'AuthSession',
    });
    return { ok: true, ...hasil };
  }

  if (!kredensialBootstrapTersimpan) {
    return {
      ok: false,
      statusHttp: 403,
      kode: 'BOOTSTRAP_REQUIRED',
      pesan: 'Admin/Owner pertama perlu menetapkan kode akses sesi terlebih dahulu.',
    };
  }

  const kandidatHash = hashPasscodeScrypt(
    passcode,
    kredensialBootstrapTersimpan.saltHex,
  );
  const bufA = Buffer.from(kandidatHash, 'hex');
  const bufB = Buffer.from(kredensialBootstrapTersimpan.hashHex, 'hex');
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    catatAuditDrive({
      requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
      aktor: emailBersih || input.namaTampilan || 'Anonim',
      peran: peranDiminta,
      aksi: 'AUTH_LOGIN_GAGAL',
      target: peranDiminta,
      status: 'ditolak',
      ringkasan: 'Percobaan masuk ditolak: kode akses tidak cocok.',
      entitas: 'AuthSession',
    });
    return {
      ok: false,
      statusHttp: 401,
      kode: 'INVALID_PASSCODE',
      pesan: 'Kode akses tidak cocok.',
    };
  }

  const hasil = terbitkanTokenSesi({
    namaTampilan: input.namaTampilan,
    peran: peranDiminta,
    email: emailBersih,
    metodeAuth: 'passcode',
  });
  catatAuditDrive({
    requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
    aktor: emailBersih || hasil.sesi.namaTampilan,
    peran: peranDiminta,
    aksi: 'AUTH_LOGIN_SUKSES',
    target: peranDiminta,
    status: 'sukses',
    ringkasan: `Masuk sesi kerja terverifikasi (${peranDiminta}).`,
    entitas: 'AuthSession',
  });
  return { ok: true, ...hasil };
}

interface PayloadTokenInfoGoogle {
  iss?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  exp?: string | number;
}

export async function prosesMasukOidc(input: {
  idToken: string;
  fetchImpl?: FetchFn;
  clientIdOverride?: string;
}): Promise<
  | { ok: true; token: string; sesi: SesiPengguna }
  | { ok: false; statusHttp: number; kode: string; pesan: string }
> {
  if (!periksaRateLimitAuth('oidc-login', 12)) {
    return {
      ok: false,
      statusHttp: 429,
      kode: 'RATE_LIMITED',
      pesan: 'Terlalu banyak percobaan login OIDC. Tunggu 1 menit.',
    };
  }

  const clientId = (input.clientIdOverride ?? ambilGoogleClientIdPublik()).trim();
  if (!clientId) {
    return {
      ok: false,
      statusHttp: 503,
      kode: 'OIDC_NOT_CONFIGURED',
      pesan: 'GOOGLE_OAUTH_CLIENT_ID belum dikonfigurasi pada server.',
    };
  }

  const idToken = input.idToken.trim();
  if (!idToken || idToken.length < 20) {
    return {
      ok: false,
      statusHttp: 400,
      kode: 'INVALID_ID_TOKEN',
      pesan: 'ID token Google OIDC tidak valid atau kosong.',
    };
  }

  const fnFetch = input.fetchImpl ?? fetch;
  let info: PayloadTokenInfoGoogle;
  try {
    const resp = await fnFetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { method: 'GET' },
    );
    if (!resp.ok) {
      return {
        ok: false,
        statusHttp: 401,
        kode: 'OIDC_TOKEN_REJECTED',
        pesan: 'Verifikasi ID token Google OIDC ditolak oleh penyedia identitas.',
      };
    }
    info = (await resp.json()) as PayloadTokenInfoGoogle;
  } catch {
    return {
      ok: false,
      statusHttp: 502,
      kode: 'OIDC_VERIFIER_UNAVAILABLE',
      pesan: 'Gagal menghubungi endpoint verifikasi Google OIDC.',
    };
  }

  const iss = String(info.iss ?? '').trim();
  const aud = String(info.aud ?? '').trim();
  const expDetik = Number(info.exp ?? 0);
  const email = String(info.email ?? '').trim().toLowerCase();
  const emailVerified =
    info.email_verified === true || info.email_verified === 'true';

  if (
    !ISSUER_GOOGLE_VALID.has(iss) ||
    aud !== clientId ||
    !Number.isFinite(expDetik) ||
    expDetik * 1000 <= Date.now() ||
    !email ||
    !emailVerified
  ) {
    catatAuditDrive({
      requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
      aktor: email || 'oidc-unknown',
      peran: 'viewer',
      aksi: 'AUTH_OIDC_DITOLAK',
      target: 'oidc',
      status: 'ditolak',
      ringkasan: 'Token OIDC gagal validasi issuer, audience, expiry, atau email_verified.',
      entitas: 'AuthSession',
    });
    return {
      ok: false,
      statusHttp: 401,
      kode: 'OIDC_CLAIMS_INVALID',
      pesan: 'Klaim issuer, audience, masa berlaku, atau verifikasi email pada token OIDC tidak valid.',
    };
  }

  const namaTampilan = String(info.name ?? '').trim() || email.split('@')[0] || 'Pengguna Google';
  const anggota = cariAnggotaTimByEmail(email);

  if (anggota) {
    if (anggota.statusAkun === 'dinonaktifkan') {
      return {
        ok: false,
        statusHttp: 403,
        kode: 'ACCOUNT_DISABLED',
        pesan: 'Akun Anda berstatus nonaktif. Hubungi Owner atau Admin.',
      };
    }
    if (anggota.statusAkun === 'menunggu-persetujuan') {
      return {
        ok: false,
        statusHttp: 403,
        kode: 'PENDING_APPROVAL',
        pesan: 'Permintaan akses Anda sedang menunggu persetujuan Owner/Admin.',
      };
    }

    const hasil = terbitkanTokenSesi({
      namaTampilan: anggota.namaTampilan || namaTampilan,
      peran: anggota.peran,
      email,
      metodeAuth: 'oidc',
    });
    catatAuditDrive({
      requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
      aktor: email,
      peran: anggota.peran,
      aksi: 'AUTH_OIDC_SUKSES',
      target: anggota.peran,
      status: 'sukses',
      ringkasan: `Login OIDC berhasil sebagai ${anggota.peran}.`,
      entitas: 'AuthSession',
    });
    return { ok: true, ...hasil };
  }

  const emailAllowlist = ambilDaftarEmailEnvAllowlist();
  const domainAllowlist = ambilDaftarDomainEnvAllowlist();
  const domainUser = email.split('@')[1] ?? '';

  if (emailAllowlist.includes(email)) {
    const state = ambilStatePengaturanMemori();
    const belumAdaOwner = !state.daftarTim.some((t) => t.peran === 'owner' && t.statusAkun === 'aktif');
    const peranAwal: PeranPengguna =
      belumAdaOwner && emailAllowlist[0] === email ? 'owner' : 'viewer';

    daftarkanPermintaanOidcMemori({
      email,
      namaTampilan,
      peran: peranAwal,
      statusAkun: 'aktif',
      sumberPendaftaran: 'allowlist',
      disetujuiOleh: 'Email Allowlist Server',
    });

    const hasil = terbitkanTokenSesi({
      namaTampilan,
      peran: peranAwal,
      email,
      metodeAuth: 'oidc',
    });
    catatAuditDrive({
      requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
      aktor: email,
      peran: peranAwal,
      aksi: 'AUTH_OIDC_ALLOWLIST_SUKSES',
      target: peranAwal,
      status: 'sukses',
      ringkasan: `Onboarding OIDC via email allowlist dengan peran awal ${peranAwal}.`,
      entitas: 'AuthSession',
    });
    return { ok: true, ...hasil };
  }

  if (domainUser && domainAllowlist.includes(domainUser)) {
    daftarkanPermintaanOidcMemori({
      email,
      namaTampilan,
      peran: 'viewer',
      statusAkun: 'menunggu-persetujuan',
      sumberPendaftaran: 'oidc-request',
    });
    catatAuditDrive({
      requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
      aktor: email,
      peran: 'viewer',
      aksi: 'AUTH_OIDC_PENDING',
      target: domainUser,
      status: 'ditolak',
      ringkasan: 'Pengguna domain organisasi masuk antrean persetujuan Owner/Admin.',
      entitas: 'AuthSession',
    });
    return {
      ok: false,
      statusHttp: 403,
      kode: 'PENDING_APPROVAL',
      pesan: 'Domain organisasi terverifikasi, tetapi akun Anda menunggu persetujuan & penetapan peran oleh Owner/Admin.',
    };
  }

  catatAuditDrive({
    requestId: `req_${crypto.randomUUID().slice(0, 10)}`,
    aktor: email,
    peran: 'viewer',
    aksi: 'AUTH_OIDC_ALLOWLIST_REJECTED',
    target: domainUser || 'unknown-domain',
    status: 'ditolak',
    ringkasan: 'Login OIDC ditolak: email/domain tidak ada di allowlist proyek.',
    entitas: 'AuthSession',
  });

  return {
    ok: false,
    statusHttp: 403,
    kode: 'EMAIL_NOT_ALLOWLISTED',
    pesan: 'Email Anda belum terdaftar pada direktori tim atau allowlist proyek.',
  };
}

export type OperasiDrive =
  | 'read'
  | 'upload'
  | 'manual'
  | 'edit'
  | 'delete'
  | 'publishVisibility'
  | 'audit';

export function periksaIzinOperasiDrive(
  peran: PeranPengguna | null,
  operasi: OperasiDrive,
  folderKode?: KodeFolderDrive,
): boolean {
  if (!peran) return false;

  if (peran === 'owner' || peran === 'admin') {
    return true;
  }

  if (peran === 'digital-manager') {
    return operasi !== 'delete';
  }

  if (peran === 'editor') {
    if (operasi === 'delete' || operasi === 'publishVisibility' || operasi === 'audit') {
      return false;
    }
    if (operasi === 'read') return true;
    return folderKode ? FOLDER_EDITOR.has(folderKode) : true;
  }

  if (peran === 'stakeholder-pic') {
    if (operasi === 'delete' || operasi === 'publishVisibility' || operasi === 'audit') {
      return false;
    }
    if (operasi === 'read') {
      return folderKode ? FOLDER_STAKEHOLDER.has(folderKode) : true;
    }
    return folderKode ? FOLDER_STAKEHOLDER.has(folderKode) : false;
  }

  if (peran === 'viewer') {
    return operasi === 'read';
  }

  return false;
}

export function bolehLihatAset(
  peran: PeranPengguna | null,
  folderKode: KodeFolderDrive,
  visibility: VisibilitasAset,
): boolean {
  if (!peran) return false;
  if (peran === 'owner' || peran === 'admin') return true;
  if (visibility === 'owner-only') return false;

  if (peran === 'digital-manager') return true;
  if (peran === 'editor') return true;
  if (peran === 'stakeholder-pic') return FOLDER_STAKEHOLDER.has(folderKode);
  if (peran === 'viewer') return visibility === 'approved-for-public';
  return false;
}

export function periksaIzinUbahPengaturanEvent(peran: PeranPengguna | null): boolean {
  return peran === 'owner' || peran === 'admin' || peran === 'digital-manager';
}

export function periksaIzinApproveAnggaran(peran: PeranPengguna | null): boolean {
  return peran === 'owner' || peran === 'admin';
}

export function periksaIzinKelolaIntegrasi(peran: PeranPengguna | null): boolean {
  return peran === 'owner' || peran === 'admin';
}

export function periksaIzinBacaTimDanAudit(peran: PeranPengguna | null): boolean {
  return peran === 'owner' || peran === 'admin' || peran === 'digital-manager';
}

export function periksaIzinKelolaTim(
  aktorPeran: PeranPengguna | null,
  targetPeranBaru?: PeranPengguna,
  targetPeranLama?: PeranPengguna,
): boolean {
  if (!aktorPeran) return false;
  const menyentuhHakIstimewa =
    targetPeranBaru === 'owner' ||
    targetPeranBaru === 'admin' ||
    targetPeranLama === 'owner' ||
    targetPeranLama === 'admin';

  if (menyentuhHakIstimewa) {
    return aktorPeran === 'owner';
  }
  return aktorPeran === 'owner' || aktorPeran === 'admin';
}

export function resetStateSesiUntukTest(): void {
  kredensialBootstrapTersimpan = null;
  tokenDicabutMemori.clear();
  rateLimitAuthMemori.clear();
}
