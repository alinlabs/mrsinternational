import crypto from 'node:crypto';
import type { IdSkenarioAnggaran } from '../types/iklan';
import type {
  AnggotaTimAkses,
  DataPengaturanTerotorisasi,
  HandleSosialPengaturan,
  StatusAkunTim,
} from '../types/pengaturan';
import type { PeranPengguna, SesiPengguna } from '../types/status';
import {
  ambilDaftarAuditTerfilter,
  catatAuditDrive,
} from './audit-log';
import {
  ambilDaftarDomainEnvAllowlist,
  ambilDaftarEmailEnvAllowlist,
  ambilStatePengaturanMemori,
  cariAnggotaTimByEmail,
} from './direktori-akses';
import {
  ambilGoogleClientIdPublik,
  bacaKonfigurasiDriveServer,
  perbaruiOverrideIntegrasiRuntime,
  validasiUrlAppsScriptAman,
  validasiUrlFolderDriveAman,
} from './konfigurasi-drive';
import {
  adalahPeranValid,
  periksaIzinApproveAnggaran,
  periksaIzinBacaTimDanAudit,
  periksaIzinKelolaIntegrasi,
  periksaIzinKelolaTim,
  periksaIzinUbahPengaturanEvent,
} from './sesi-rbac';

const RATE_LIMIT_PENGATURAN = new Map<string, number[]>();

function periksaRateLimitOperasi(kunci: string, batasPerMenit = 20): boolean {
  const sekarang = Date.now();
  const satuMenitLalu = sekarang - 60_000;
  const riwayat = (RATE_LIMIT_PENGATURAN.get(kunci) ?? []).filter(
    (t) => t > satuMenitLalu,
  );
  if (riwayat.length >= batasPerMenit) {
    RATE_LIMIT_PENGATURAN.set(kunci, riwayat);
    return false;
  }
  riwayat.push(sekarang);
  RATE_LIMIT_PENGATURAN.set(kunci, riwayat);
  return true;
}

function buatReqId(): string {
  return `req_${crypto.randomUUID().slice(0, 12)}`;
}

function bolehLihatDataPrivatEvent(peran: PeranPengguna | null): boolean {
  return (
    peran === 'owner' ||
    peran === 'admin' ||
    peran === 'digital-manager' ||
    peran === 'stakeholder-pic'
  );
}

export function ambilPengaturanUntukSesi(sesi: SesiPengguna | null): {
  statusHttp: number;
  body:
    | { ok: true; requestId: string; data: DataPengaturanTerotorisasi }
    | { ok: false; requestId: string; error: { code: string; message: string } };
} {
  const requestId = buatReqId();
  if (!sesi?.terautentikasi || !sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: { code: 'UNAUTHORIZED', message: 'Masuk terlebih dahulu untuk melihat pengaturan.' },
      },
    };
  }

  const state = ambilStatePengaturanMemori();
  const cfgDrive = bacaKonfigurasiDriveServer();
  const lihatPrivat = bolehLihatDataPrivatEvent(sesi.peran);
  const lihatTimPenuh = periksaIzinBacaTimDanAudit(sesi.peran);

  const data: DataPengaturanTerotorisasi = {
    event: {
      ...state.event,
      lokasiPrivat: lihatPrivat
        ? state.event.lokasiPrivat
        : state.event.lokasiPrivat
          ? '[TEREDAKSI — KHUSUS PERAN INTERNAL]'
          : '',
    },
    handleSosial: state.handleSosial.map((h) => ({ ...h })),
    kontakResmi: lihatPrivat
      ? { ...state.kontakResmi }
      : {
          emailPress: state.kontakResmi.emailPress ? '[TEREDAKSI]' : '',
          whatsappKemitraan: state.kontakResmi.whatsappKemitraan ? '[TEREDAKSI]' : '',
          emailBisnis: state.kontakResmi.emailBisnis ? '[TEREDAKSI]' : '',
          statusKonfirmasi: state.kontakResmi.statusKonfirmasi,
          diperbaruiOleh: state.kontakResmi.diperbaruiOleh,
          diperbaruiPada: state.kontakResmi.diperbaruiPada,
        },
    anggaran: { ...state.anggaran },
    integrasi: {
      appsScriptWebAppUrl: lihatTimPenuh ? cfgDrive.appsScriptWebAppUrl : '',
      appsScriptWebAppTerkonfigurasiServer: cfgDrive.terkonfigurasiAppsScript,
      sharedSecretTerkonfigurasi: cfgDrive.appsScriptSharedSecret.length > 0,
      googleDriveFolderUrl: lihatPrivat ? cfgDrive.controlledFolderUrl : '',
      googleClientId: lihatTimPenuh ? ambilGoogleClientIdPublik() : '',
      domainAllowlist: lihatTimPenuh ? ambilDaftarDomainEnvAllowlist() : [],
      emailAllowlistTerkonfigurasi: lihatTimPenuh
        ? ambilDaftarEmailEnvAllowlist().length
        : 0,
      batasProxyUploadBytes: cfgDrive.maxProxyUploadBytes,
    },
    daftarTim: lihatTimPenuh ? state.daftarTim.map((t) => ({ ...t })) : [],
    aksesTerbatasPenuh: !lihatTimPenuh,
  };

  return {
    statusHttp: 200,
    body: { ok: true, requestId, data },
  };
}

export function perbaruiPengaturanEventUntukSesi(params: {
  sesi: SesiPengguna | null;
  body: Record<string, unknown>;
}) {
  const requestId = buatReqId();
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false, requestId, error: { code: 'UNAUTHORIZED', message: 'Sesi belum aktif.' } },
    };
  }

  if (!periksaIzinUbahPengaturanEvent(params.sesi.peran)) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.email || params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'SETTINGS_EVENT_DITOLAK',
      target: 'event-settings',
      status: 'ditolak',
      ringkasan: `Peran ${params.sesi.peran} tidak berwenang mengubah pengaturan event.`,
      entitas: 'Setting',
    });
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN',
          message: 'Hanya Owner, Admin, atau Digital Manager yang boleh mengubah pengaturan event & kanal.',
        },
      },
    };
  }

  const labelMasuk = String(params.body.labelAksesPublik ?? '').trim();
  if (labelMasuk && /tiket|ticket/i.test(labelMasuk)) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'PRIVATE_EVENT_POLICY_VIOLATION',
          message: 'Penjualan tiket tidak diizinkan; pendaftaran hanya disampaikan sebagai kuota terbatas.',
        },
      },
    };
  }

  const state = ambilStatePengaturanMemori();
  const sebelum = `kota=${state.event.kotaWilayahPublik}, kontak=${state.kontakResmi.statusKonfirmasi}`;

  if (typeof params.body.namaEvent === 'string' && params.body.namaEvent.trim()) {
    state.event.namaEvent = params.body.namaEvent.trim().slice(0, 140);
  }
  if (typeof params.body.kotaWilayahPublik === 'string' && params.body.kotaWilayahPublik.trim()) {
    state.event.kotaWilayahPublik = params.body.kotaWilayahPublik.trim().slice(0, 80);
  }
  if (typeof params.body.lokasiPrivat === 'string') {
    state.event.lokasiPrivat = params.body.lokasiPrivat.trim().slice(0, 200);
  }
  if (Array.isArray(params.body.handleSosial)) {
    const daftarBaru: HandleSosialPengaturan[] = [];
    for (const raw of params.body.handleSosial.slice(0, 5)) {
      if (!raw || typeof raw !== 'object') continue;
      const obj = raw as Record<string, unknown>;
      const platform =
        obj.platform === 'Facebook' || obj.platform === 'TikTok'
          ? obj.platform
          : 'Instagram';
      const urlRaw = String(obj.urlProfil ?? '').trim();
      let urlAman = '';
      if (urlRaw) {
        try {
          const parsed = new URL(urlRaw);
          if (parsed.protocol === 'https:') urlAman = parsed.toString();
        } catch {
          return {
            statusHttp: 400,
            body: {
              ok: false,
              requestId,
              error: { code: 'INVALID_URL', message: `Tautan profil ${platform} harus berformat HTTPS valid.` },
            },
          };
        }
      }
      daftarBaru.push({
        id: String(obj.id ?? `soc-${platform.toLowerCase()}`),
        platform,
        handle: String(obj.handle ?? '').trim().slice(0, 80),
        urlProfil: urlAman,
        statusKonfirmasi:
          obj.statusKonfirmasi === 'terkonfirmasi-owner'
            ? 'terkonfirmasi-owner'
            : 'contoh-belum-dikonfirmasi',
        catatan: String(obj.catatan ?? '').trim().slice(0, 200),
      });
    }
    if (daftarBaru.length > 0) {
      state.handleSosial = daftarBaru;
    }
  }

  if (params.body.kontakResmi && typeof params.body.kontakResmi === 'object') {
    const k = params.body.kontakResmi as Record<string, unknown>;
    state.kontakResmi = {
      emailPress: String(k.emailPress ?? '').trim().slice(0, 120),
      whatsappKemitraan: String(k.whatsappKemitraan ?? '').trim().slice(0, 40),
      emailBisnis: String(k.emailBisnis ?? '').trim().slice(0, 120),
      statusKonfirmasi:
        k.statusKonfirmasi === 'terkonfirmasi-owner' &&
        (String(k.emailPress ?? '').trim() ||
          String(k.whatsappKemitraan ?? '').trim() ||
          String(k.emailBisnis ?? '').trim())
          ? 'terkonfirmasi-owner'
          : 'belum-diisi',
      diperbaruiOleh: params.sesi.namaTampilan,
      diperbaruiPada: new Date().toISOString(),
    };
  }

  state.event.diperbaruiOleh = params.sesi.namaTampilan;
  state.event.diperbaruiPada = new Date().toISOString();

  catatAuditDrive({
    requestId,
    aktor: params.sesi.email || params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'SETTINGS_EVENT_UPDATE',
    target: 'event-dan-kanal',
    status: 'sukses',
    ringkasan: 'Metadata event, handle sosial, atau kontak resmi diperbarui.',
    entitas: 'Setting',
    ringkasanSebelum: sebelum,
    ringkasanSesudah: `kota=${state.event.kotaWilayahPublik}, kontak=${state.kontakResmi.statusKonfirmasi}`,
  });

  return ambilPengaturanUntukSesi(params.sesi);
}

export function perbaruiPlafonAnggaranUntukSesi(params: {
  sesi: SesiPengguna | null;
  body: Record<string, unknown>;
}) {
  const requestId = buatReqId();
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false, requestId, error: { code: 'UNAUTHORIZED', message: 'Sesi belum aktif.' } },
    };
  }

  if (!periksaIzinApproveAnggaran(params.sesi.peran)) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.email || params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'BUDGET_APPROVAL_DITOLAK',
      target: 'plafon-anggaran',
      status: 'ditolak',
      ringkasan: `Peran ${params.sesi.peran} tidak berwenang menyetujui plafon anggaran.`,
      entitas: 'Approval',
    });
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN_BUDGET_APPROVAL',
          message: 'Persetujuan plafon anggaran hanya diizinkan untuk Owner atau Admin.',
        },
      },
    };
  }

  const state = ambilStatePengaturanMemori();
  const plafonMentah = params.body.plafonDisetujuiIdr;
  const plafon =
    plafonMentah === null || plafonMentah === ''
      ? null
      : Number(plafonMentah);

  if (plafon !== null && (!Number.isFinite(plafon) || plafon < 0 || plafon > 1_000_000_000)) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: { code: 'INVALID_BUDGET_CEILING', message: 'Nominal plafon anggaran tidak valid.' },
      },
    };
  }

  const skenario = String(params.body.skenarioTarget ?? state.anggaran.skenarioTarget);
  const skenarioValid: IdSkenarioAnggaran =
    skenario === 'hemat' || skenario === 'agresif' ? skenario : 'menengah';

  const sebelum = `skenario=${state.anggaran.skenarioTarget}, plafon=${state.anggaran.plafonDisetujuiIdr ?? 'null'}`;
  state.anggaran = {
    skenarioTarget: skenarioValid,
    plafonDisetujuiIdr: plafon !== null ? Math.round(plafon) : null,
    disetujuiOleh: plafon !== null ? params.sesi.namaTampilan : '',
    tanggalDisetujui: plafon !== null ? new Date().toISOString().slice(0, 10) : '',
    catatanPersetujuan: String(params.body.catatanPersetujuan ?? '').trim().slice(0, 240),
  };

  catatAuditDrive({
    requestId,
    aktor: params.sesi.email || params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'BUDGET_CEILING_APPROVAL',
    target: `skenario:${skenarioValid}`,
    status: 'sukses',
    ringkasan:
      plafon !== null
        ? `Plafon anggaran disetujui pada Rp${Math.round(plafon).toLocaleString('id-ID')}`
        : 'Plafon anggaran dikembalikan ke status belum diisi.',
    entitas: 'Approval',
    ringkasanSebelum: sebelum,
    ringkasanSesudah: `skenario=${skenarioValid}, plafon=${state.anggaran.plafonDisetujuiIdr ?? 'null'}`,
  });

  return ambilPengaturanUntukSesi(params.sesi);
}

export function perbaruiIntegrasiPublikUntukSesi(params: {
  sesi: SesiPengguna | null;
  body: Record<string, unknown>;
}) {
  const requestId = buatReqId();
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false, requestId, error: { code: 'UNAUTHORIZED', message: 'Sesi belum aktif.' } },
    };
  }

  if (!periksaIzinKelolaIntegrasi(params.sesi.peran)) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.email || params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'INTEGRATION_CONFIG_DITOLAK',
      target: 'integrasi',
      status: 'ditolak',
      ringkasan: `Peran ${params.sesi.peran} tidak berwenang mengubah endpoint integrasi.`,
      entitas: 'Setting',
    });
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN',
          message: 'Hanya Owner atau Admin yang boleh memperbarui konfigurasi integrasi.',
        },
      },
    };
  }

  const rawWebApp =
    params.body.appsScriptWebAppUrl !== undefined
      ? String(params.body.appsScriptWebAppUrl).trim()
      : undefined;
  const rawFolder =
    params.body.googleDriveFolderUrl !== undefined
      ? String(params.body.googleDriveFolderUrl).trim()
      : undefined;
  const rawClientId =
    params.body.googleClientId !== undefined
      ? String(params.body.googleClientId).trim().slice(0, 140)
      : undefined;

  if (rawWebApp && !validasiUrlAppsScriptAman(rawWebApp)) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'INVALID_APPS_SCRIPT_URL',
          message: 'URL Web App harus HTTPS resmi domain script.google.com atau script.googleusercontent.com.',
        },
      },
    };
  }

  if (rawFolder && !validasiUrlFolderDriveAman(rawFolder)) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'INVALID_DRIVE_FOLDER_URL',
          message: 'URL folder Drive harus HTTPS resmi domain drive.google.com.',
        },
      },
    };
  }

  perbaruiOverrideIntegrasiRuntime({
    appsScriptWebAppUrl: rawWebApp,
    controlledFolderUrl: rawFolder,
    googleClientId: rawClientId,
  });

  catatAuditDrive({
    requestId,
    aktor: params.sesi.email || params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'INTEGRATION_CONFIG_UPDATE',
    target: 'endpoint-publik',
    status: 'sukses',
    ringkasan: 'Konfigurasi endpoint publik Apps Script/Drive/OIDC diperbarui tanpa menyimpan secret di respons.',
    entitas: 'Setting',
  });

  return ambilPengaturanUntukSesi(params.sesi);
}

export function kelolaAnggotaTimUntukSesi(params: {
  sesi: SesiPengguna | null;
  body: Record<string, unknown>;
}) {
  const requestId = buatReqId();
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false, requestId, error: { code: 'UNAUTHORIZED', message: 'Sesi belum aktif.' } },
    };
  }

  const email = String(params.body.email ?? '').trim().toLowerCase();
  const namaTampilan = String(params.body.namaTampilan ?? '').trim().slice(0, 80);
  const peranBaruRaw = String(params.body.peran ?? 'viewer').trim();
  const statusRaw = String(params.body.statusAkun ?? 'aktif').trim();
  const konfirmasiOwner = params.body.konfirmasiOwner === true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: { code: 'INVALID_EMAIL', message: 'Alamat email anggota tim wajib valid.' },
      },
    };
  }

  if (!adalahPeranValid(peranBaruRaw)) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: { code: 'INVALID_ROLE', message: 'Peran yang dipilih tidak valid.' },
      },
    };
  }

  const statusAkun: StatusAkunTim =
    statusRaw === 'menunggu-persetujuan' || statusRaw === 'dinonaktifkan'
      ? statusRaw
      : 'aktif';

  const existing = cariAnggotaTimByEmail(email);

  if (!periksaIzinKelolaTim(params.sesi.peran, peranBaruRaw, existing?.peran)) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.email || params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'ROLE_CHANGE_DITOLAK',
      target: email,
      status: 'ditolak',
      ringkasan: `Peran ${params.sesi.peran} tidak diizinkan menetapkan/mengubah peran ke ${peranBaruRaw}.`,
      entitas: 'Role',
    });
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'OWNER_APPROVAL_REQUIRED',
          message:
            peranBaruRaw === 'owner' ||
            peranBaruRaw === 'admin' ||
            existing?.peran === 'owner' ||
            existing?.peran === 'admin'
              ? 'Pemberian atau perubahan peran Owner/Admin wajib disetujui langsung oleh Owner.'
              : 'Hanya Owner atau Admin yang dapat mengelola peran tim.',
        },
      },
    };
  }

  if (
    (peranBaruRaw === 'owner' || peranBaruRaw === 'admin') &&
    (!existing || existing.peran !== peranBaruRaw) &&
    !konfirmasiOwner
  ) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'CONFIRMATION_REQUIRED',
          message: 'Penetapan peran Owner atau Admin memerlukan konfirmasi eksplisit Owner.',
        },
      },
    };
  }

  const state = ambilStatePengaturanMemori();
  const sekarang = new Date().toISOString();

  if (existing) {
    const sebelum = `peran=${existing.peran}, status=${existing.statusAkun}`;
    existing.namaTampilan = namaTampilan || existing.namaTampilan;
    existing.peran = peranBaruRaw;
    existing.statusAkun = statusAkun;
    existing.disetujuiOleh = params.sesi.namaTampilan;
    existing.diperbaruiPada = sekarang;

    catatAuditDrive({
      requestId,
      aktor: params.sesi.email || params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'ROLE_UPDATED',
      target: email,
      status: 'sukses',
      ringkasan: `Peran/status anggota tim diperbarui menjadi ${peranBaruRaw} (${statusAkun}).`,
      entitas: 'Role',
      recordId: existing.id,
      ringkasanSebelum: sebelum,
      ringkasanSesudah: `peran=${peranBaruRaw}, status=${statusAkun}`,
    });

    return {
      statusHttp: 200,
      body: { ok: true, requestId, data: existing },
    };
  }

  const baru: AnggotaTimAkses = {
    id: `tim-${crypto.randomUUID().slice(0, 10)}`,
    email,
    namaTampilan: namaTampilan || email.split('@')[0],
    peran: peranBaruRaw,
    statusAkun,
    sumberPendaftaran: 'admin-invite',
    disetujuiOleh: params.sesi.namaTampilan,
    dibuatPada: sekarang,
    diperbaruiPada: sekarang,
  };
  state.daftarTim.unshift(baru);

  catatAuditDrive({
    requestId,
    aktor: params.sesi.email || params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'ROLE_ASSIGNED',
    target: email,
    status: 'sukses',
    ringkasan: `Anggota tim baru didaftarkan dengan peran ${peranBaruRaw} (${statusAkun}).`,
    entitas: 'Role',
    recordId: baru.id,
    ringkasanSebelum: 'belum-terdaftar',
    ringkasanSesudah: `peran=${peranBaruRaw}, status=${statusAkun}`,
  });

  return {
    statusHttp: 201,
    body: { ok: true, requestId, data: baru },
  };
}

export function hapusAtauNonaktifkanTimUntukSesi(params: {
  sesi: SesiPengguna | null;
  idAnggota: string;
  permanen?: boolean;
}) {
  const requestId = buatReqId();
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false, requestId, error: { code: 'UNAUTHORIZED', message: 'Sesi belum aktif.' } },
    };
  }

  const state = ambilStatePengaturanMemori();
  const idx = state.daftarTim.findIndex((t) => t.id === params.idAnggota);
  if (idx < 0) {
    return {
      statusHttp: 404,
      body: { ok: false, requestId, error: { code: 'NOT_FOUND', message: 'Anggota tim tidak ditemukan.' } },
    };
  }

  const target = state.daftarTim[idx];
  if (!periksaIzinKelolaTim(params.sesi.peran, target.peran, target.peran)) {
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN',
          message: 'Menonaktifkan atau menghapus akun Owner/Admin hanya dapat dilakukan oleh Owner.',
        },
      },
    };
  }

  if (params.permanen) {
    state.daftarTim.splice(idx, 1);
    catatAuditDrive({
      requestId,
      aktor: params.sesi.email || params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'ROLE_PERMANENT_DELETE',
      target: target.email,
      status: 'sukses',
      ringkasan: `Akun tim dihapus permanen (${target.peran}).`,
      entitas: 'Role',
      recordId: target.id,
    });
    return {
      statusHttp: 200,
      body: { ok: true, requestId, data: { id: target.id, terhapus: true, permanen: true } },
    };
  }

  target.statusAkun = 'dinonaktifkan';
  target.diperbaruiPada = new Date().toISOString();
  target.disetujuiOleh = params.sesi.namaTampilan;

  catatAuditDrive({
    requestId,
    aktor: params.sesi.email || params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'ROLE_SOFT_DEACTIVATE',
    target: target.email,
    status: 'sukses',
    ringkasan: `Akun dinonaktifkan (soft delete) dari peran ${target.peran}.`,
    entitas: 'Role',
    recordId: target.id,
  });

  return {
    statusHttp: 200,
    body: { ok: true, requestId, data: target },
  };
}

export function ambilAuditTerpaduUntukSesi(params: {
  sesi: SesiPengguna | null;
  status?: 'semua' | 'sukses' | 'ditolak' | 'gagal';
  aksi?: string;
  kataKunci?: string;
  batas?: number;
}) {
  const requestId = buatReqId();
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false, requestId, error: { code: 'UNAUTHORIZED', message: 'Sesi belum aktif.' } },
    };
  }

  if (!periksaIzinBacaTimDanAudit(params.sesi.peran)) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.email || params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'AUDIT_READ_DITOLAK',
      target: 'audit-log',
      status: 'ditolak',
      ringkasan: `Peran ${params.sesi.peran} dilarang mengakses audit log.`,
      entitas: 'AuditLog',
    });
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN_AUDIT',
          message: 'Audit log hanya dapat diakses oleh Owner, Admin, atau Digital Manager.',
        },
      },
    };
  }

  return {
    statusHttp: 200,
    body: {
      ok: true,
      requestId,
      data: ambilDaftarAuditTerfilter({
        batas: params.batas,
        status: params.status,
        aksi: params.aksi,
        kataKunci: params.kataKunci,
      }),
    },
  };
}

export function eksporBackupPengaturanUntukSesi(sesi: SesiPengguna | null) {
  const requestId = buatReqId();
  if (!sesi?.terautentikasi || !sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false, requestId, error: { code: 'UNAUTHORIZED', message: 'Sesi belum aktif.' } },
    };
  }

  if (!periksaIzinBacaTimDanAudit(sesi.peran)) {
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN_BACKUP',
          message: 'Ekspor backup sistem dibatasi untuk Owner, Admin, atau Digital Manager.',
        },
      },
    };
  }

  if (!periksaRateLimitOperasi(`backup:${sesi.peran}`, 10)) {
    return {
      statusHttp: 429,
      body: {
        ok: false,
        requestId,
        error: { code: 'RATE_LIMITED', message: 'Terlalu sering mengekspor backup. Tunggu 1 menit.' },
      },
    };
  }

  const state = ambilStatePengaturanMemori();
  const auditAman = ambilDaftarAuditTerfilter({ batas: 250 });

  catatAuditDrive({
    requestId,
    aktor: sesi.email || sesi.namaTampilan,
    peran: sesi.peran,
    aksi: 'SYSTEM_BACKUP_EXPORT',
    target: 'backup-json-bersih',
    status: 'sukses',
    ringkasan: 'Ekspor cadangan metadata pengaturan & audit log (tanpa rahasia/token).',
    entitas: 'Setting',
  });

  return {
    statusHttp: 200,
    body: {
      ok: true,
      requestId,
      data: {
        dieksporPada: new Date().toISOString(),
        dieksporOleh: `${sesi.namaTampilan} (${sesi.peran})`,
        catatanKeamanan:
          'Cadangan ini bersih dari API secret, shared secret Apps Script, token sesi, dan passcode.',
        pengaturan: {
          event: state.event,
          handleSosial: state.handleSosial,
          kontakResmi: state.kontakResmi,
          anggaran: state.anggaran,
          daftarTim: state.daftarTim,
        },
        auditLogTerbaru: auditAman,
      },
    },
  };
}

export function resetRateLimitPengaturanUntukTest(): void {
  RATE_LIMIT_PENGATURAN.clear();
}
