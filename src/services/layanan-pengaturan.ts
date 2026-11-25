import type { AsetDrive } from '../types/aset';
import type { IdSkenarioAnggaran } from '../types/iklan';
import type {
  AnggotaTimAkses,
  DataPengaturanTerotorisasi,
  EntriAuditTerstruktur,
  HandleSosialPengaturan,
  KontakResmiPengaturan,
  StatusAkunTim,
} from '../types/pengaturan';
import type { RecordStakeholder } from '../types/stakeholder';
import type { PeranPengguna } from '../types/status';
import type { ResponsApi } from './layanan-aset';

function headerAuth(tokenBearer: string | null): HeadersInit {
  return tokenBearer ? { Authorization: `Bearer ${tokenBearer}` } : {};
}

async function parseJsonAman<T>(resp: Response): Promise<ResponsApi<T>> {
  try {
    return (await resp.json()) as ResponsApi<T>;
  } catch {
    return {
      ok: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Respons server tidak dapat diparsing sebagai JSON.',
      },
    };
  }
}

export async function ambilPengaturanApi(
  tokenBearer: string | null,
): Promise<ResponsApi<DataPengaturanTerotorisasi>> {
  const resp = await fetch('/api/pengaturan', {
    headers: headerAuth(tokenBearer),
  });
  return parseJsonAman<DataPengaturanTerotorisasi>(resp);
}

export async function perbaruiPengaturanEventApi(
  tokenBearer: string | null,
  payload: {
    namaEvent?: string;
    kotaWilayahPublik?: string;
    lokasiPrivat?: string;
    handleSosial?: HandleSosialPengaturan[];
    kontakResmi?: Partial<KontakResmiPengaturan>;
  },
): Promise<ResponsApi<DataPengaturanTerotorisasi>> {
  const resp = await fetch('/api/pengaturan/event', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...headerAuth(tokenBearer),
    },
    body: JSON.stringify(payload),
  });
  return parseJsonAman<DataPengaturanTerotorisasi>(resp);
}

export async function perbaruiPlafonAnggaranApi(
  tokenBearer: string | null,
  payload: {
    skenarioTarget: IdSkenarioAnggaran;
    plafonDisetujuiIdr: number | null;
    catatanPersetujuan?: string;
  },
): Promise<ResponsApi<DataPengaturanTerotorisasi>> {
  const resp = await fetch('/api/pengaturan/anggaran', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...headerAuth(tokenBearer),
    },
    body: JSON.stringify(payload),
  });
  return parseJsonAman<DataPengaturanTerotorisasi>(resp);
}

export async function perbaruiIntegrasiPublikApi(
  tokenBearer: string | null,
  payload: {
    appsScriptWebAppUrl?: string;
    googleDriveFolderUrl?: string;
    googleClientId?: string;
  },
): Promise<ResponsApi<DataPengaturanTerotorisasi>> {
  const resp = await fetch('/api/pengaturan/integrasi', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...headerAuth(tokenBearer),
    },
    body: JSON.stringify(payload),
  });
  return parseJsonAman<DataPengaturanTerotorisasi>(resp);
}

export async function simpanAnggotaTimApi(
  tokenBearer: string | null,
  payload: {
    email: string;
    namaTampilan?: string;
    peran: PeranPengguna;
    statusAkun: StatusAkunTim;
    konfirmasiOwner?: boolean;
  },
): Promise<ResponsApi<AnggotaTimAkses>> {
  const resp = await fetch('/api/pengaturan/tim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headerAuth(tokenBearer),
    },
    body: JSON.stringify(payload),
  });
  return parseJsonAman<AnggotaTimAkses>(resp);
}

export async function hapusAtauNonaktifkanTimApi(
  tokenBearer: string | null,
  idAnggota: string,
  permanen = false,
): Promise<ResponsApi<AnggotaTimAkses | { id: string; terhapus: boolean; permanen: boolean }>> {
  const resp = await fetch(
    `/api/pengaturan/tim?id=${encodeURIComponent(idAnggota)}&permanen=${permanen ? 'true' : 'false'}`,
    {
      method: 'DELETE',
      headers: headerAuth(tokenBearer),
    },
  );
  return parseJsonAman(resp);
}

export async function ambilAuditTerpaduApi(
  tokenBearer: string | null,
  params?: {
    status?: 'semua' | 'sukses' | 'ditolak' | 'gagal';
    aksi?: string;
    kataKunci?: string;
    batas?: number;
  },
): Promise<ResponsApi<EntriAuditTerstruktur[]>> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.aksi) qs.set('aksi', params.aksi);
  if (params?.kataKunci) qs.set('q', params.kataKunci);
  if (params?.batas) qs.set('batas', String(params.batas));

  const resp = await fetch(`/api/audit?${qs.toString()}`, {
    headers: headerAuth(tokenBearer),
  });
  return parseJsonAman<EntriAuditTerstruktur[]>(resp);
}

export async function eksporBackupServerApi(
  tokenBearer: string | null,
): Promise<
  ResponsApi<{
    dieksporPada: string;
    dieksporOleh: string;
    catatanKeamanan: string;
    pengaturan: Record<string, unknown>;
    auditLogTerbaru: EntriAuditTerstruktur[];
  }>
> {
  const resp = await fetch('/api/pengaturan/backup', {
    headers: headerAuth(tokenBearer),
  });
  return parseJsonAman(resp);
}

export async function ambilSampahAsetApi(
  tokenBearer: string | null,
): Promise<ResponsApi<AsetDrive[]>> {
  const resp = await fetch('/api/drive/assets?sampah=true', {
    headers: headerAuth(tokenBearer),
  });
  return parseJsonAman<AsetDrive[]>(resp);
}

export async function pulihkanAsetApi(
  tokenBearer: string | null,
  idAset: string,
): Promise<ResponsApi<AsetDrive>> {
  const resp = await fetch(`/api/drive/restore?id=${encodeURIComponent(idAset)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headerAuth(tokenBearer),
    },
    body: JSON.stringify({ id: idAset }),
  });
  return parseJsonAman<AsetDrive>(resp);
}

export async function hapusPermanenAsetApi(
  tokenBearer: string | null,
  idAset: string,
): Promise<ResponsApi<{ id: string; terhapus: boolean; permanen: boolean }>> {
  const resp = await fetch(
    `/api/drive/assets?id=${encodeURIComponent(idAset)}&permanen=true`,
    {
      method: 'DELETE',
      headers: headerAuth(tokenBearer),
    },
  );
  return parseJsonAman(resp);
}

export async function ambilSampahStakeholderApi(
  tokenBearer: string | null,
): Promise<ResponsApi<RecordStakeholder[]>> {
  const resp = await fetch('/api/stakeholders?sampah=true', {
    headers: headerAuth(tokenBearer),
  });
  return parseJsonAman<RecordStakeholder[]>(resp);
}

export async function pulihkanStakeholderApi(
  tokenBearer: string | null,
  idStakeholder: string,
): Promise<ResponsApi<RecordStakeholder>> {
  const resp = await fetch(
    `/api/stakeholders/restore?id=${encodeURIComponent(idStakeholder)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headerAuth(tokenBearer),
      },
      body: JSON.stringify({ id: idStakeholder }),
    },
  );
  return parseJsonAman<RecordStakeholder>(resp);
}

export async function hapusPermanenStakeholderApi(
  tokenBearer: string | null,
  idStakeholder: string,
): Promise<ResponsApi<{ id: string; terhapus: boolean; permanen: boolean }>> {
  const resp = await fetch(
    `/api/stakeholders?id=${encodeURIComponent(idStakeholder)}&permanen=true`,
    {
      method: 'DELETE',
      headers: headerAuth(tokenBearer),
    },
  );
  return parseJsonAman(resp);
}
