import crypto from 'node:crypto';
import type { SesiPengguna } from '../types/status';
import type {
  ChannelOutreach,
  KategoriStakeholder,
  LogOutreachStakeholder,
  PrioritasStakeholder,
  RecordStakeholder,
  StatusPipelineOutreach,
} from '../types/stakeholder';
import {
  bangunCsvEksporStakeholder,
  hitungSkorRelasiStakeholder,
  validasiInputStakeholder,
  validasiLogOutreach,
} from '../utils/stakeholder';
import { catatAuditDrive } from './audit-log';

const penyimpananStakeholderMemori: RecordStakeholder[] = [];
const sampahStakeholderMemori: RecordStakeholder[] = [];
const rateLimitStakeholderMemori = new Map<string, number[]>();

function periksaRateLimitStakeholder(kunci: string, batasPerMenit = 20): boolean {
  const sekarang = Date.now();
  const satuMenitLalu = sekarang - 60_000;
  const riwayat = (rateLimitStakeholderMemori.get(kunci) ?? []).filter(
    (t) => t > satuMenitLalu,
  );
  if (riwayat.length >= batasPerMenit) {
    rateLimitStakeholderMemori.set(kunci, riwayat);
    return false;
  }
  riwayat.push(sekarang);
  rateLimitStakeholderMemori.set(kunci, riwayat);
  return true;
}

export function resetStakeholderUntukTest(): void {
  penyimpananStakeholderMemori.length = 0;
  sampahStakeholderMemori.length = 0;
  rateLimitStakeholderMemori.clear();
}

export function bolehLihatKontakPrivat(sesi: SesiPengguna | null): boolean {
  if (!sesi?.terautentikasi || !sesi.peran) return false;
  return (
    sesi.peran === 'owner' ||
    sesi.peran === 'admin' ||
    sesi.peran === 'digital-manager' ||
    sesi.peran === 'stakeholder-pic'
  );
}

export function bolehKelolaStakeholder(sesi: SesiPengguna | null): boolean {
  return bolehLihatKontakPrivat(sesi);
}

function sensorStakeholderUntukPeran(
  item: RecordStakeholder,
  aksesPrivat: boolean,
): RecordStakeholder {
  if (aksesPrivat) {
    return { ...item, kontakTersensor: false };
  }
  return {
    ...item,
    contactValue: 'Tersensor (khusus PIC Stakeholder / Manager / Owner)',
    sumberKontak: 'Tersensor',
    catatanPrivat: 'Catatan privat dibatasi pada peran berwenang',
    kontakTersensor: true,
  };
}

function normalisasiKategori(raw: unknown): KategoriStakeholder {
  const nilai = String(raw ?? '').toLowerCase();
  if (
    nilai === 'commercial' ||
    nilai === 'influence' ||
    nilai === 'institution' ||
    nilai === 'cultural-ecosystem' ||
    nilai === 'public-awareness'
  ) {
    return nilai;
  }
  return 'commercial';
}

function normalisasiPrioritas(raw: unknown): PrioritasStakeholder {
  const nilai = String(raw ?? '').toUpperCase();
  if (nilai === 'A' || nilai === 'B' || nilai === 'C') return nilai;
  return 'B';
}

function normalisasiPipeline(raw: unknown): StatusPipelineOutreach {
  const nilai = String(raw ?? '').toLowerCase();
  if (
    nilai === 'identified' ||
    nilai === 'qualified' ||
    nilai === 'contacted' ||
    nilai === 'replied' ||
    nilai === 'meeting-requested' ||
    nilai === 'ongoing' ||
    nilai === 'closed-lost'
  ) {
    return nilai;
  }
  return 'identified';
}

function normalisasiChannel(raw: unknown): ChannelOutreach {
  const nilai = String(raw ?? '').toLowerCase();
  if (
    nilai === 'email' ||
    nilai === 'whatsapp' ||
    nilai === 'instagram-dm' ||
    nilai === 'telepon' ||
    nilai === 'pertemuan' ||
    nilai === 'lainnya'
  ) {
    return nilai;
  }
  return 'email';
}

function bangunRekamanStakeholder(
  body: Record<string, unknown>,
  aktor: string,
): { ok: true; data: RecordStakeholder } | { ok: false; pesan: string } {
  const namaLengkap = String(body.namaLengkap ?? '').trim();
  const jabatanOrganisasi = String(body.jabatanOrganisasi ?? '').trim();
  const relevansi = String(body.relevansi ?? '').trim();
  const relationshipOwner = String(body.relationshipOwner ?? aktor).trim();

  const cek = validasiInputStakeholder({
    namaLengkap,
    jabatanOrganisasi,
    relevansi,
    relationshipOwner,
  });
  if (!cek.valid) {
    return { ok: false, pesan: cek.pesanGalat };
  }

  const komponenMentah = (body.komponenSkor ?? {}) as Record<string, unknown>;
  const skor = hitungSkorRelasiStakeholder({
    relevansi: Number(komponenMentah.relevansi ?? 4),
    influence: Number(komponenMentah.influence ?? 3),
    peluangNyata: Number(komponenMentah.peluangNyata ?? 3),
    kedekatanHubungan: Number(komponenMentah.kedekatanHubungan ?? 2),
  });

  const sekarang = new Date().toISOString();
  return {
    ok: true,
    data: {
      id: `sth-${crypto.randomUUID().slice(0, 12)}`,
      namaLengkap: namaLengkap.slice(0, 140),
      jabatanOrganisasi: jabatanOrganisasi.slice(0, 160),
      kategori: normalisasiKategori(body.kategori),
      prioritas: normalisasiPrioritas(body.prioritas),
      relevansi: relevansi.slice(0, 320),
      relationshipOwner: relationshipOwner.slice(0, 100),
      sumberKontak: String(body.sumberKontak ?? '').trim().slice(0, 140),
      channelUtama: normalisasiChannel(body.channelUtama),
      contactValue: String(body.contactValue ?? '').trim().slice(0, 180),
      konteksRelasi: String(body.konteksRelasi ?? '').trim().slice(0, 400),
      consentToPublish: Boolean(body.consentToPublish),
      statusPipeline: normalisasiPipeline(body.statusPipeline),
      lastOutreachAt: String(body.lastOutreachAt ?? '').trim(),
      responTerakhir: String(body.responTerakhir ?? '').trim().slice(0, 300),
      nextAction: String(body.nextAction ?? '').trim().slice(0, 240),
      dueDate: String(body.dueDate ?? '').trim(),
      catatanPrivat: String(body.catatanPrivat ?? '').trim().slice(0, 600),
      kontakTersensor: false,
      skor,
      logOutreach: [],
      dibuatPada: sekarang,
      diperbaruiPada: sekarang,
    },
  };
}

export function daftarStakeholderUntukSesi(sesi: SesiPengguna | null): {
  statusHttp: number;
  body: Record<string, unknown>;
} {
  if (!sesi?.terautentikasi || !sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message:
            'Sesi diperlukan untuk mengakses daftar stakeholder dan perlindungan kontak privat.',
        },
      },
    };
  }

  const aksesPrivat = bolehLihatKontakPrivat(sesi);
  const daftarTersaring = penyimpananStakeholderMemori.map((item) =>
    sensorStakeholderUntukPeran(item, aksesPrivat),
  );

  return {
    statusHttp: 200,
    body: {
      ok: true,
      data: {
        daftarStakeholder: daftarTersaring,
        aksesKontakPrivat: aksesPrivat,
      },
    },
  };
}

export function tambahStakeholderUntukSesi(params: {
  sesi: SesiPengguna | null;
  body: Record<string, unknown>;
}): { statusHttp: number; body: Record<string, unknown> } {
  const requestId = `req_${crypto.randomUUID().slice(0, 10)}`;
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan.' },
      },
    };
  }

  if (!bolehKelolaStakeholder(params.sesi)) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'STAKEHOLDER_CREATE_DITOLAK',
      target: 'stakeholder',
      status: 'ditolak',
      ringkasan: `Peran ${params.sesi.peran} tidak berwenang menambah kontak stakeholder`,
    });
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN',
          message:
            'Peran Anda hanya bersifat baca atau produksi; penambahan stakeholder dikelola PIC Stakeholder, Digital Manager, Admin, atau Owner.',
        },
      },
    };
  }

  const hasil = bangunRekamanStakeholder(params.body, params.sesi.namaTampilan);
  if (!hasil.ok) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: { code: 'VALIDATION_ERROR', message: hasil.pesan },
      },
    };
  }

  penyimpananStakeholderMemori.unshift(hasil.data);
  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'STAKEHOLDER_TAMBAH',
    target: hasil.data.id,
    status: 'sukses',
    ringkasan: `Kategori ${hasil.data.kategori}, Prioritas ${hasil.data.prioritas} (tanpa log PII)`,
  });

  return {
    statusHttp: 201,
    body: {
      ok: true,
      requestId,
      data: hasil.data,
    },
  };
}

export function imporCsvStakeholderUntukSesi(params: {
  sesi: SesiPengguna | null;
  daftarBaris: Array<Record<string, unknown>>;
}): { statusHttp: number; body: Record<string, unknown> } {
  const requestId = `req_${crypto.randomUUID().slice(0, 10)}`;
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan.' },
      },
    };
  }

  if (!bolehKelolaStakeholder(params.sesi)) {
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN',
          message: 'Peran Anda tidak berwenang mengimpor kontak stakeholder.',
        },
      },
    };
  }

  if (!Array.isArray(params.daftarBaris) || params.daftarBaris.length === 0) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'EMPTY_IMPORT',
          message: 'Tidak ada baris tervalidasi untuk diimpor.',
        },
      },
    };
  }

  const ditambahkan: RecordStakeholder[] = [];
  for (const baris of params.daftarBaris.slice(0, 200)) {
    const hasil = bangunRekamanStakeholder(baris, params.sesi.namaTampilan);
    if (!hasil.ok) {
      return {
        statusHttp: 400,
        body: {
          ok: false,
          requestId,
          error: { code: 'VALIDATION_ERROR', message: hasil.pesan },
        },
      };
    }
    ditambahkan.push(hasil.data);
  }

  penyimpananStakeholderMemori.unshift(...ditambahkan);
  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'STAKEHOLDER_IMPOR_CSV',
    target: `${ditambahkan.length} entri`,
    status: 'sukses',
    ringkasan: `Impor CSV tervalidasi sejumlah ${ditambahkan.length} stakeholder`,
  });

  return {
    statusHttp: 201,
    body: {
      ok: true,
      requestId,
      data: {
        jumlahDiimpor: ditambahkan.length,
        daftarDiimpor: ditambahkan,
      },
    },
  };
}

export function perbaruiStakeholderUntukSesi(params: {
  sesi: SesiPengguna | null;
  idStakeholder: string;
  perubahan: Record<string, unknown>;
}): { statusHttp: number; body: Record<string, unknown> } {
  const requestId = `req_${crypto.randomUUID().slice(0, 10)}`;
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan.' },
      },
    };
  }

  if (!bolehKelolaStakeholder(params.sesi)) {
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN',
          message: 'Peran Anda tidak berwenang memperbarui metadata stakeholder.',
        },
      },
    };
  }

  const idx = penyimpananStakeholderMemori.findIndex(
    (item) => item.id === params.idStakeholder,
  );
  if (idx < 0) {
    return {
      statusHttp: 404,
      body: {
        ok: false,
        requestId,
        error: { code: 'NOT_FOUND', message: 'Stakeholder tidak ditemukan.' },
      },
    };
  }

  const lama = penyimpananStakeholderMemori[idx];
  const komponenSkor =
    params.perubahan.komponenSkor &&
    typeof params.perubahan.komponenSkor === 'object'
      ? (params.perubahan.komponenSkor as Record<string, unknown>)
      : null;

  const skorBaru = komponenSkor
    ? hitungSkorRelasiStakeholder({
        relevansi: Number(komponenSkor.relevansi ?? lama.skor.relevansi),
        influence: Number(komponenSkor.influence ?? lama.skor.influence),
        peluangNyata: Number(komponenSkor.peluangNyata ?? lama.skor.peluangNyata),
        kedekatanHubungan: Number(
          komponenSkor.kedekatanHubungan ?? lama.skor.kedekatanHubungan,
        ),
      })
    : lama.skor;

  const baru: RecordStakeholder = {
    ...lama,
    namaLengkap:
      typeof params.perubahan.namaLengkap === 'string' &&
      params.perubahan.namaLengkap.trim()
        ? params.perubahan.namaLengkap.trim()
        : lama.namaLengkap,
    jabatanOrganisasi:
      typeof params.perubahan.jabatanOrganisasi === 'string' &&
      params.perubahan.jabatanOrganisasi.trim()
        ? params.perubahan.jabatanOrganisasi.trim()
        : lama.jabatanOrganisasi,
    kategori:
      params.perubahan.kategori !== undefined
        ? normalisasiKategori(params.perubahan.kategori)
        : lama.kategori,
    prioritas:
      params.perubahan.prioritas !== undefined
        ? normalisasiPrioritas(params.perubahan.prioritas)
        : lama.prioritas,
    relevansi:
      typeof params.perubahan.relevansi === 'string' &&
      params.perubahan.relevansi.trim()
        ? params.perubahan.relevansi.trim()
        : lama.relevansi,
    relationshipOwner:
      typeof params.perubahan.relationshipOwner === 'string' &&
      params.perubahan.relationshipOwner.trim()
        ? params.perubahan.relationshipOwner.trim()
        : lama.relationshipOwner,
    sumberKontak:
      typeof params.perubahan.sumberKontak === 'string'
        ? params.perubahan.sumberKontak.trim()
        : lama.sumberKontak,
    channelUtama:
      params.perubahan.channelUtama !== undefined
        ? normalisasiChannel(params.perubahan.channelUtama)
        : lama.channelUtama,
    contactValue:
      typeof params.perubahan.contactValue === 'string'
        ? params.perubahan.contactValue.trim()
        : lama.contactValue,
    konteksRelasi:
      typeof params.perubahan.konteksRelasi === 'string'
        ? params.perubahan.konteksRelasi.trim()
        : lama.konteksRelasi,
    consentToPublish:
      typeof params.perubahan.consentToPublish === 'boolean'
        ? params.perubahan.consentToPublish
        : lama.consentToPublish,
    statusPipeline:
      params.perubahan.statusPipeline !== undefined
        ? normalisasiPipeline(params.perubahan.statusPipeline)
        : lama.statusPipeline,
    responTerakhir:
      typeof params.perubahan.responTerakhir === 'string'
        ? params.perubahan.responTerakhir.trim()
        : lama.responTerakhir,
    nextAction:
      typeof params.perubahan.nextAction === 'string'
        ? params.perubahan.nextAction.trim()
        : lama.nextAction,
    dueDate:
      typeof params.perubahan.dueDate === 'string'
        ? params.perubahan.dueDate.trim()
        : lama.dueDate,
    catatanPrivat:
      typeof params.perubahan.catatanPrivat === 'string'
        ? params.perubahan.catatanPrivat.trim()
        : lama.catatanPrivat,
    skor: skorBaru,
    diperbaruiPada: new Date().toISOString(),
  };

  penyimpananStakeholderMemori[idx] = baru;
  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'STAKEHOLDER_UBAH',
    target: baru.id,
    status: 'sukses',
    ringkasan: `Pipeline -> ${baru.statusPipeline}, Prioritas ${baru.prioritas}`,
  });

  return {
    statusHttp: 200,
    body: { ok: true, requestId, data: baru },
  };
}

export function tambahLogOutreachUntukSesi(params: {
  sesi: SesiPengguna | null;
  idStakeholder: string;
  body: Record<string, unknown>;
}): { statusHttp: number; body: Record<string, unknown> } {
  const requestId = `req_${crypto.randomUUID().slice(0, 10)}`;
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan.' },
      },
    };
  }

  if (!bolehKelolaStakeholder(params.sesi)) {
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN',
          message: 'Peran Anda tidak berwenang mencatat log outreach.',
        },
      },
    };
  }

  const idx = penyimpananStakeholderMemori.findIndex(
    (item) => item.id === params.idStakeholder,
  );
  if (idx < 0) {
    return {
      statusHttp: 404,
      body: {
        ok: false,
        requestId,
        error: { code: 'NOT_FOUND', message: 'Stakeholder tidak ditemukan.' },
      },
    };
  }

  const tanggal = String(params.body.tanggal ?? '').trim();
  const pic = String(params.body.pic ?? params.sesi.namaTampilan).trim();
  const ringkasan = String(params.body.ringkasan ?? '').trim();

  const cek = validasiLogOutreach({ tanggal, pic, ringkasan });
  if (!cek.valid) {
    return {
      statusHttp: 400,
      body: {
        ok: false,
        requestId,
        error: { code: 'VALIDATION_ERROR', message: cek.pesanGalat },
      },
    };
  }

  const logBaru: LogOutreachStakeholder = {
    id: `log-${crypto.randomUUID().slice(0, 10)}`,
    tanggal,
    channel: normalisasiChannel(params.body.channel),
    pic,
    ringkasan: ringkasan.slice(0, 400),
    respon: String(params.body.respon ?? '').trim().slice(0, 300),
    nextStep: String(params.body.nextStep ?? '').trim().slice(0, 240),
    dicatatPada: new Date().toISOString(),
  };

  const lama = penyimpananStakeholderMemori[idx];
  const statusPipelineBaru =
    params.body.statusPipeline !== undefined
      ? normalisasiPipeline(params.body.statusPipeline)
      : lama.statusPipeline === 'identified' || lama.statusPipeline === 'qualified'
        ? 'contacted'
        : lama.statusPipeline;

  const diperbarui: RecordStakeholder = {
    ...lama,
    statusPipeline: statusPipelineBaru,
    lastOutreachAt: tanggal,
    responTerakhir: logBaru.respon || lama.responTerakhir,
    nextAction: logBaru.nextStep || lama.nextAction,
    dueDate:
      typeof params.body.dueDate === 'string' && params.body.dueDate.trim()
        ? params.body.dueDate.trim()
        : lama.dueDate,
    logOutreach: [logBaru, ...lama.logOutreach],
    diperbaruiPada: new Date().toISOString(),
  };

  penyimpananStakeholderMemori[idx] = diperbarui;
  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'STAKEHOLDER_OUTREACH_LOG',
    target: diperbarui.id,
    status: 'sukses',
    ringkasan: `Kanal ${logBaru.channel}, pipeline -> ${diperbarui.statusPipeline}`,
  });

  return {
    statusHttp: 201,
    body: { ok: true, requestId, data: diperbarui },
  };
}

export function hapusStakeholderUntukSesi(params: {
  sesi: SesiPengguna | null;
  idStakeholder: string;
  permanen?: boolean;
}): { statusHttp: number; body: Record<string, unknown> } {
  const requestId = `req_${crypto.randomUUID().slice(0, 10)}`;
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan.' },
      },
    };
  }

  if (!periksaRateLimitStakeholder(`delete:${params.sesi.peran}`, 25)) {
    return {
      statusHttp: 429,
      body: {
        ok: false,
        requestId,
        error: { code: 'RATE_LIMITED', message: 'Batas frekuensi penghapusan tercapai. Tunggu 1 menit.' },
      },
    };
  }

  if (!bolehKelolaStakeholder(params.sesi)) {
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN',
          message: 'Peran Anda tidak berwenang menghapus stakeholder.',
        },
      },
    };
  }

  if (params.permanen && params.sesi.peran !== 'owner' && params.sesi.peran !== 'admin') {
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN_PERMANENT_DELETE',
          message: 'Penghapusan permanen data stakeholder hanya diizinkan untuk Owner atau Admin.',
        },
      },
    };
  }

  const idxAktif = penyimpananStakeholderMemori.findIndex(
    (item) => item.id === params.idStakeholder,
  );
  const idxSampah = sampahStakeholderMemori.findIndex(
    (item) => item.id === params.idStakeholder,
  );

  if (idxAktif < 0 && idxSampah < 0) {
    return {
      statusHttp: 404,
      body: {
        ok: false,
        requestId,
        error: { code: 'NOT_FOUND', message: 'Stakeholder tidak ditemukan.' },
      },
    };
  }

  if (!params.permanen) {
    if (idxAktif >= 0) {
      const [item] = penyimpananStakeholderMemori.splice(idxAktif, 1);
      sampahStakeholderMemori.unshift(item);
    }
    catatAuditDrive({
      requestId,
      aktor: params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'STAKEHOLDER_SOFT_DELETE',
      target: params.idStakeholder,
      status: 'sukses',
      ringkasan: 'Stakeholder diarsipkan (soft delete) dan dapat dipulihkan oleh Owner/Admin.',
      entitas: 'Stakeholder',
      recordId: params.idStakeholder,
    });

    return {
      statusHttp: 200,
      body: {
        ok: true,
        requestId,
        data: { id: params.idStakeholder, terhapus: true, permanen: false },
      },
    };
  }

  if (idxAktif >= 0) penyimpananStakeholderMemori.splice(idxAktif, 1);
  if (idxSampah >= 0) sampahStakeholderMemori.splice(idxSampah, 1);

  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'STAKEHOLDER_PERMANENT_DELETE',
    target: params.idStakeholder,
    status: 'sukses',
    ringkasan: 'Menghapus permanen rekaman stakeholder oleh Owner/Admin.',
    entitas: 'Stakeholder',
    recordId: params.idStakeholder,
  });

  return {
    statusHttp: 200,
    body: {
      ok: true,
      requestId,
      data: { id: params.idStakeholder, terhapus: true, permanen: true },
    },
  };
}

export function daftarSampahStakeholderUntukSesi(sesi: SesiPengguna | null) {
  const requestId = `req_${crypto.randomUUID().slice(0, 10)}`;
  if (!sesi?.terautentikasi || !sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false, requestId, error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan.' } },
    };
  }
  if (sesi.peran !== 'owner' && sesi.peran !== 'admin') {
    return {
      statusHttp: 403,
      body: { ok: false, requestId, error: { code: 'FORBIDDEN', message: 'Khusus Owner atau Admin.' } },
    };
  }
  return {
    statusHttp: 200,
    body: {
      ok: true,
      requestId,
      data: sampahStakeholderMemori.map((item) => sensorStakeholderUntukPeran(item, true)),
    },
  };
}

export function pulihkanStakeholderUntukSesi(params: {
  sesi: SesiPengguna | null;
  idStakeholder: string;
}) {
  const requestId = `req_${crypto.randomUUID().slice(0, 10)}`;
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: { ok: false, requestId, error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan.' } },
    };
  }
  if (params.sesi.peran !== 'owner' && params.sesi.peran !== 'admin') {
    return {
      statusHttp: 403,
      body: { ok: false, requestId, error: { code: 'FORBIDDEN', message: 'Pemulihan data stakeholder hanya untuk Owner atau Admin.' } },
    };
  }
  const idx = sampahStakeholderMemori.findIndex((i) => i.id === params.idStakeholder);
  if (idx < 0) {
    return {
      statusHttp: 404,
      body: { ok: false, requestId, error: { code: 'NOT_FOUND', message: 'Data stakeholder tidak ditemukan di arsip.' } },
    };
  }
  const [item] = sampahStakeholderMemori.splice(idx, 1);
  penyimpananStakeholderMemori.unshift(item);
  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi: 'STAKEHOLDER_RESTORE',
    target: params.idStakeholder,
    status: 'sukses',
    ringkasan: 'Rekaman stakeholder dipulihkan dari arsip terhapus.',
    entitas: 'Stakeholder',
    recordId: params.idStakeholder,
  });
  return {
    statusHttp: 200,
    body: { ok: true, requestId, data: sensorStakeholderUntukPeran(item, true) },
  };
}

export function eksporStakeholderUntukSesi(params: {
  sesi: SesiPengguna | null;
  mode: 'public' | 'internal';
}): { statusHttp: number; body: Record<string, unknown> } {
  const requestId = `req_${crypto.randomUUID().slice(0, 10)}`;
  if (!params.sesi?.terautentikasi || !params.sesi.peran) {
    return {
      statusHttp: 401,
      body: {
        ok: false,
        requestId,
        error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan.' },
      },
    };
  }

  if (!periksaRateLimitStakeholder(`export:${params.sesi.peran}`, 15)) {
    return {
      statusHttp: 429,
      body: {
        ok: false,
        requestId,
        error: { code: 'RATE_LIMITED', message: 'Terlalu banyak permintaan ekspor. Tunggu 1 menit.' },
      },
    };
  }

  if (params.mode === 'internal' && !bolehLihatKontakPrivat(params.sesi)) {
    catatAuditDrive({
      requestId,
      aktor: params.sesi.namaTampilan,
      peran: params.sesi.peran,
      aksi: 'STAKEHOLDER_EKSPOR_DITOLAK',
      target: 'export-internal',
      status: 'ditolak',
      ringkasan: `Peran ${params.sesi.peran} dilarang mengekspor kontak privat`,
      entitas: 'Stakeholder',
    });
    return {
      statusHttp: 403,
      body: {
        ok: false,
        requestId,
        error: {
          code: 'FORBIDDEN',
          message:
            'Ekspor internal berisi kontak privat hanya diizinkan untuk Owner, Admin, Digital Manager, dan PIC Stakeholder.',
        },
      },
    };
  }

  const csv = bangunCsvEksporStakeholder(
    penyimpananStakeholderMemori,
    params.mode,
  );
  catatAuditDrive({
    requestId,
    aktor: params.sesi.namaTampilan,
    peran: params.sesi.peran,
    aksi:
      params.mode === 'internal'
        ? 'STAKEHOLDER_EKSPOR_INTERNAL'
        : 'STAKEHOLDER_EKSPOR_PUBLIK',
    target: `${penyimpananStakeholderMemori.length} baris`,
    status: 'sukses',
    ringkasan:
      params.mode === 'internal'
        ? 'Ekspor CSV internal terkonfirmasi (dengan kontak)'
        : 'Ekspor CSV publik (seluruh PII disamarkan)',
    entitas: 'Stakeholder',
  });

  return {
    statusHttp: 200,
    body: {
      ok: true,
      requestId,
      data: {
        mode: params.mode,
        csv,
        namaBerkas:
          params.mode === 'internal'
            ? `ragi-hotang-stakeholder-internal-${new Date().toISOString().slice(0, 10)}.csv`
            : `ragi-hotang-stakeholder-publik-${new Date().toISOString().slice(0, 10)}.csv`,
      },
    },
  };
}
