import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { DAFTAR_PERAN_RBAC_KANONIK } from '../data/aset-kanonik';
import type { StatusBootstrapSesi } from '../types/aset';
import type { PeranPengguna, SesiPengguna } from '../types/status';

interface KonteksSesiNilai {
  sesi: SesiPengguna;
  tokenBearer: string | null;
  statusBootstrap: StatusBootstrapSesi;
  sedangMemuat: boolean;
  muatStatusSesi: () => Promise<void>;
  bootstrapAdmin: (params: {
    passcode: string;
    namaTampilan: string;
    peran: PeranPengguna;
    email?: string;
  }) => Promise<{ ok: boolean; pesan?: string }>;
  masukSesi: (params: {
    passcode: string;
    namaTampilan: string;
    peran: PeranPengguna;
    email?: string;
  }) => Promise<{ ok: boolean; pesan?: string }>;
  masukOidc: (idToken: string) => Promise<{ ok: boolean; kode?: string; pesan?: string }>;
  keluarSesi: () => void;
}

const SESI_AWAL: SesiPengguna = {
  terautentikasi: false,
  namaTampilan: 'Belum Masuk',
  email: null,
  peran: null,
  statusSesi: 'not-configured',
};

const BOOTSTRAP_AWAL: StatusBootstrapSesi = {
  terkonfigurasiEnv: false,
  perluBootstrapAdmin: true,
  oidcTerkonfigurasi: false,
  googleClientId: undefined,
  domainDiizinkan: [],
  daftarPeranTersedia: DAFTAR_PERAN_RBAC_KANONIK,
};

const KonteksSesi = createContext<KonteksSesiNilai | null>(null);

export function PenyediaSesiAplikasi({ children }: { children: ReactNode }) {
  // Token Bearer disimpan murni di memori React state (bukan localStorage/sessionStorage)
  const [tokenBearer, setTokenBearer] = useState<string | null>(null);
  const [sesi, setSesi] = useState<SesiPengguna>(SESI_AWAL);
  const [statusBootstrap, setStatusBootstrap] =
    useState<StatusBootstrapSesi>(BOOTSTRAP_AWAL);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  const muatStatusSesi = useCallback(async () => {
    setSedangMemuat(true);
    try {
      const resp = await fetch('/api/sesi/status', {
        headers: tokenBearer ? { Authorization: `Bearer ${tokenBearer}` } : {},
      });
      if (!resp.ok) return;
      const json = (await resp.json()) as {
        ok: boolean;
        data?: StatusBootstrapSesi & { sesi?: SesiPengguna };
      };
      if (json.ok && json.data) {
        setStatusBootstrap({
          terkonfigurasiEnv: json.data.terkonfigurasiEnv,
          perluBootstrapAdmin: json.data.perluBootstrapAdmin,
          oidcTerkonfigurasi: Boolean(json.data.oidcTerkonfigurasi),
          googleClientId: json.data.googleClientId,
          domainDiizinkan: json.data.domainDiizinkan ?? [],
          daftarPeranTersedia:
            json.data.daftarPeranTersedia ?? DAFTAR_PERAN_RBAC_KANONIK,
        });
        if (json.data.sesi) {
          setSesi(json.data.sesi);
        }
      }
    } catch {
      // Abaikan kegagalan jaringan sementara tanpa menjatuhkan shell
    } finally {
      setSedangMemuat(false);
    }
  }, [tokenBearer]);

  useEffect(() => {
    void muatStatusSesi();
  }, [muatStatusSesi]);

  const bootstrapAdmin = useCallback(
    async (params: {
      passcode: string;
      namaTampilan: string;
      peran: PeranPengguna;
      email?: string;
    }) => {
      try {
        const resp = await fetch('/api/sesi/bootstrap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const json = (await resp.json()) as {
          ok: boolean;
          data?: { token: string; sesi: SesiPengguna };
          error?: { message?: string };
        };
        if (!resp.ok || !json.ok || !json.data) {
          return {
            ok: false,
            pesan:
              json.error?.message ?? 'Gagal menetapkan kode akses admin awal.',
          };
        }
        setTokenBearer(json.data.token);
        setSesi(json.data.sesi);
        setStatusBootstrap((prev) => ({ ...prev, perluBootstrapAdmin: false }));
        return { ok: true };
      } catch {
        return { ok: false, pesan: 'Tidak dapat menghubungi server autentikasi.' };
      }
    },
    [],
  );

  const masukSesi = useCallback(
    async (params: {
      passcode: string;
      namaTampilan: string;
      peran: PeranPengguna;
      email?: string;
    }) => {
      try {
        const resp = await fetch('/api/sesi/masuk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const json = (await resp.json()) as {
          ok: boolean;
          data?: { token: string; sesi: SesiPengguna };
          error?: { message?: string };
        };
        if (!resp.ok || !json.ok || !json.data) {
          return {
            ok: false,
            pesan: json.error?.message ?? 'Gagal masuk ke sesi kerja.',
          };
        }
        setTokenBearer(json.data.token);
        setSesi(json.data.sesi);
        return { ok: true };
      } catch {
        return { ok: false, pesan: 'Tidak dapat menghubungi server autentikasi.' };
      }
    },
    [],
  );

  const masukOidc = useCallback(async (idToken: string) => {
    try {
      const resp = await fetch('/api/sesi/oidc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const json = (await resp.json()) as {
        ok: boolean;
        data?: { token: string; sesi: SesiPengguna };
        error?: { code?: string; message?: string };
      };
      if (!resp.ok || !json.ok || !json.data) {
        return {
          ok: false,
          kode: json.error?.code,
          pesan: json.error?.message ?? 'Verifikasi Google OIDC gagal.',
        };
      }
      setTokenBearer(json.data.token);
      setSesi(json.data.sesi);
      return { ok: true };
    } catch {
      return { ok: false, pesan: 'Tidak dapat menghubungi server verifikasi OIDC.' };
    }
  }, []);

  const keluarSesi = useCallback(() => {
    const tokenAktif = tokenBearer;
    setTokenBearer(null);
    setSesi(SESI_AWAL);
    if (tokenAktif) {
      void fetch('/api/sesi/keluar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenAktif}` },
      }).catch(() => undefined);
    }
  }, [tokenBearer]);

  const nilai = useMemo(
    () => ({
      sesi,
      tokenBearer,
      statusBootstrap,
      sedangMemuat,
      muatStatusSesi,
      bootstrapAdmin,
      masukSesi,
      masukOidc,
      keluarSesi,
    }),
    [
      sesi,
      tokenBearer,
      statusBootstrap,
      sedangMemuat,
      muatStatusSesi,
      bootstrapAdmin,
      masukSesi,
      masukOidc,
      keluarSesi,
    ],
  );

  return <KonteksSesi.Provider value={nilai}>{children}</KonteksSesi.Provider>;
}

export function gunakanSesiAplikasi() {
  const ctx = useContext(KonteksSesi);
  if (!ctx) {
    throw new Error(
      'gunakanSesiAplikasi harus dipakai di dalam PenyediaSesiAplikasi.',
    );
  }
  return ctx;
}
