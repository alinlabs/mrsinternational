import type {
  InputStakeholderBaru,
  RecordStakeholder,
  StatusPipelineOutreach,
} from '../types/stakeholder';
import type { ResponsApi } from './layanan-aset';

function headerAuth(tokenBearer: string | null): HeadersInit {
  return tokenBearer ? { Authorization: `Bearer ${tokenBearer}` } : {};
}

export async function ambilDaftarStakeholderApi(
  tokenBearer: string | null,
): Promise<
  ResponsApi<{
    daftarStakeholder: RecordStakeholder[];
    aksesKontakPrivat: boolean;
  }>
> {
  const resp = await fetch('/api/stakeholders', {
    headers: headerAuth(tokenBearer),
  });
  return (await resp.json()) as ResponsApi<{
    daftarStakeholder: RecordStakeholder[];
    aksesKontakPrivat: boolean;
  }>;
}

export async function tambahStakeholderApi(
  tokenBearer: string | null,
  input: InputStakeholderBaru,
): Promise<ResponsApi<RecordStakeholder>> {
  const resp = await fetch('/api/stakeholders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headerAuth(tokenBearer),
    },
    body: JSON.stringify(input),
  });
  return (await resp.json()) as ResponsApi<RecordStakeholder>;
}

export async function imporCsvStakeholderApi(
  tokenBearer: string | null,
  daftarBaris: Array<Record<string, unknown>>,
): Promise<
  ResponsApi<{
    jumlahDiimpor: number;
    daftarDiimpor: RecordStakeholder[];
  }>
> {
  const resp = await fetch('/api/stakeholders/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headerAuth(tokenBearer),
    },
    body: JSON.stringify({ daftarBaris }),
  });
  return (await resp.json()) as ResponsApi<{
    jumlahDiimpor: number;
    daftarDiimpor: RecordStakeholder[];
  }>;
}

export async function perbaruiStakeholderApi(
  tokenBearer: string | null,
  idStakeholder: string,
  perubahan: Partial<InputStakeholderBaru>,
): Promise<ResponsApi<RecordStakeholder>> {
  const resp = await fetch(
    `/api/stakeholders?id=${encodeURIComponent(idStakeholder)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headerAuth(tokenBearer),
      },
      body: JSON.stringify(perubahan),
    },
  );
  return (await resp.json()) as ResponsApi<RecordStakeholder>;
}

export async function tambahLogOutreachApi(
  tokenBearer: string | null,
  idStakeholder: string,
  input: {
    tanggal: string;
    channel: string;
    pic: string;
    ringkasan: string;
    respon: string;
    nextStep: string;
    dueDate?: string;
    statusPipeline?: StatusPipelineOutreach;
  },
): Promise<ResponsApi<RecordStakeholder>> {
  const resp = await fetch(
    `/api/stakeholders/outreach?id=${encodeURIComponent(idStakeholder)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headerAuth(tokenBearer),
      },
      body: JSON.stringify(input),
    },
  );
  return (await resp.json()) as ResponsApi<RecordStakeholder>;
}

export async function hapusStakeholderApi(
  tokenBearer: string | null,
  idStakeholder: string,
): Promise<ResponsApi<{ id: string; terhapus: boolean }>> {
  const resp = await fetch(
    `/api/stakeholders?id=${encodeURIComponent(idStakeholder)}`,
    {
      method: 'DELETE',
      headers: headerAuth(tokenBearer),
    },
  );
  return (await resp.json()) as ResponsApi<{ id: string; terhapus: boolean }>;
}

export async function eksporStakeholderApi(
  tokenBearer: string | null,
  mode: 'public' | 'internal',
): Promise<
  ResponsApi<{
    mode: 'public' | 'internal';
    csv: string;
    namaBerkas: string;
  }>
> {
  const resp = await fetch(`/api/stakeholders/export?mode=${mode}`, {
    headers: headerAuth(tokenBearer),
  });
  return (await resp.json()) as ResponsApi<{
    mode: 'public' | 'internal';
    csv: string;
    namaBerkas: string;
  }>;
}
