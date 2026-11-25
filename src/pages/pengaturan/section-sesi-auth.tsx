import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  CheckCircle2,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { DAFTAR_PERAN_RBAC_KANONIK } from '../../data/aset-kanonik';
import { gunakanSesiAplikasi } from '../../hooks/gunakan-sesi-aplikasi';
import type { PeranPengguna } from '../../types/status';
import { dapatkanLabelPeran } from '../../utils/format';
import {
  InputTeks,
  Kartu,
  SelectPilihan,
  StatusTeks,
  Tombol,
  gunakanToast,
} from '../../components/ui';

interface GoogleGisClient {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    auto_select?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill';
      width?: number;
      locale?: string;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleGisClient;
      };
    };
  }
}

export interface SectionSesiAuthProps {
  onSesiBerubah?: () => void;
}

export function SectionSesiAuth({ onSesiBerubah }: SectionSesiAuthProps) {
  const {
    sesi,
    statusBootstrap,
    bootstrapAdmin,
    masukSesi,
    masukOidc,
    keluarSesi,
  } = gunakanSesiAplikasi();
  const { tampilkanToast } = gunakanToast();

  const [namaTampilan, setNamaTampilan] = useState('Melfarina Sianipar');
  const [emailTim, setEmailTim] = useState('');
  const [peranDipilih, setPeranDipilih] = useState<PeranPengguna>('owner');
  const [passcode, setPasscode] = useState('');
  const [galatPasscode, setGalatPasscode] = useState('');
  const [sedangSubmit, setSedangSubmit] = useState(false);

  const [galatOidc, setGalatOidc] = useState('');
  const [statusGisSiap, setStatusGisSiap] = useState(false);
  const [sedangVerifikasiOidc, setSedangVerifikasiOidc] = useState(false);
  const wadahTombolGoogleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clientId = statusBootstrap.googleClientId?.trim();
    if (!statusBootstrap.oidcTerkonfigurasi || !clientId) {
      setStatusGisSiap(false);
      return;
    }

    let dibatalkan = false;

    const inisialisasiTombolGis = () => {
      if (dibatalkan || !wadahTombolGoogleRef.current) return;
      const gisId = window.google?.accounts?.id;
      if (!gisId) return;

      gisId.initialize({
        client_id: clientId,
        callback: async (resp) => {
          if (!resp.credential) {
            setGalatOidc('Token kredensial Google tidak diterima.');
            return;
          }
          setGalatOidc('');
          setSedangVerifikasiOidc(true);
          const hasil = await masukOidc(resp.credential);
          setSedangVerifikasiOidc(false);
          if (!hasil.ok) {
            setGalatOidc(hasil.pesan ?? 'Login Google ditolak.');
            return;
          }
          tampilkanToast({
            jenis: 'sukses',
            judul: 'Berhasil masuk dengan Google',
            pesan: 'Akun dan peran Anda sudah aktif.',
          });
          onSesiBerubah?.();
        },
        auto_select: false,
      });

      wadahTombolGoogleRef.current.innerHTML = '';
      gisId.renderButton(wadahTombolGoogleRef.current, {
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        locale: 'id',
      });
      setStatusGisSiap(true);
    };

    if (window.google?.accounts?.id) {
      inisialisasiTombolGis();
      return () => {
        dibatalkan = true;
      };
    }

    const scriptAda = document.querySelector<HTMLScriptElement>(
      'script[data-gis-client="true"]',
    );
    if (scriptAda) {
      scriptAda.addEventListener('load', inisialisasiTombolGis);
      return () => {
        dibatalkan = true;
        scriptAda.removeEventListener('load', inisialisasiTombolGis);
      };
    }

    const scriptBaru = document.createElement('script');
    scriptBaru.src = 'https://accounts.google.com/gsi/client';
    scriptBaru.async = true;
    scriptBaru.defer = true;
    scriptBaru.dataset.gisClient = 'true';
    scriptBaru.onload = inisialisasiTombolGis;
    scriptBaru.onerror = () => {
      if (!dibatalkan) {
        setStatusGisSiap(false);
      }
    };
    document.head.appendChild(scriptBaru);

    return () => {
      dibatalkan = true;
    };
  }, [
    statusBootstrap.oidcTerkonfigurasi,
    statusBootstrap.googleClientId,
    masukOidc,
    tampilkanToast,
    onSesiBerubah,
  ]);

  const tanganiSubmitPasscode = async (e: FormEvent) => {
    e.preventDefault();
    setGalatPasscode('');
    setSedangSubmit(true);

    const emailBersih = emailTim.trim() || undefined;
    const hasil = statusBootstrap.perluBootstrapAdmin
      ? await bootstrapAdmin({
          passcode,
          namaTampilan,
          peran: peranDipilih,
          email: emailBersih,
        })
      : await masukSesi({
          passcode,
          namaTampilan,
          peran: peranDipilih,
          email: emailBersih,
        });

    setSedangSubmit(false);
    if (!hasil.ok) {
      setGalatPasscode(hasil.pesan ?? 'Autentikasi gagal.');
      return;
    }

    setPasscode('');
      tampilkanToast({
      jenis: 'sukses',
      judul: statusBootstrap.perluBootstrapAdmin
        ? 'Kode pengelola dikunci & aktif'
        : 'Sesi kerja aktif',
      pesan: `Masuk sebagai ${dapatkanLabelPeran(peranDipilih)}.`,
    });
    onSesiBerubah?.();
  };

  return (
    <div className="space-y-5">
      {/* Status Sesi Aktif */}
      <Kartu
        judul="Status Masuk & Keamanan Sesi"
        subjudul="Akses kerja tersimpan aman hanya selama sesi aktif dan otomatis terhenti saat Anda keluar."
        aksiHeader={
          <StatusTeks
            status={sesi.terautentikasi ? 'approved' : 'not-configured'}
            labelKustom={sesi.terautentikasi ? 'Sudah Masuk' : 'Belum Masuk'}
          />
        }
      >
        {sesi.terautentikasi ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs flex-1">
              <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3">
                <p className="text-[var(--teks-redup)]">Nama Pengguna</p>
                <p className="mt-1 font-semibold text-[var(--teks-utama)] flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-[var(--status-sukses)]" aria-hidden="true" />
                  <span>{sesi.namaTampilan}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-sekunder)]">
                  {sesi.email ?? 'Masuk dengan kode tim'}
                </p>
              </div>

              <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3">
                <p className="text-[var(--teks-redup)]">Peran Aktif</p>
                <p className="mt-1 font-semibold text-[var(--aksen-maroon-teks)]">
                  {dapatkanLabelPeran(sesi.peran)}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-sekunder)]">
                  Hak akses diperiksa otomatis
                </p>
              </div>

              <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3">
                <p className="text-[var(--teks-redup)]">Sifat Acara</p>
                <p className="mt-1 font-semibold text-[var(--teks-utama)]">
                  Kuota Terbatas
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-sekunder)]">
                  Sesi berlaku selama 8 jam
                </p>
              </div>
            </div>

            <Tombol
              varian="sekunder"
              ukuran="sm"
              ikonKiri={<LogOut className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => {
                keluarSesi();
                tampilkanToast({
                  jenis: 'info',
                  judul: 'Keluar dari sesi',
                  pesan: 'Akses sesi kerja Anda telah dihentikan.',
                });
                onSesiBerubah?.();
              }}
            >
              Keluar
            </Tombol>
          </div>
        ) : (
          <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3.5 text-xs text-[var(--teks-sekunder)] flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-[var(--aksen-maroon-teks)] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              Belum ada akun masuk. Gunakan{' '}
              <strong className="text-[var(--teks-utama)]">Masuk dengan Google</strong>{' '}
              jika sudah aktif, atau isi{' '}
              <strong className="text-[var(--teks-utama)]">Kode Masuk Tim</strong> di bawah ini.
            </p>
          </div>
        )}
      </Kartu>

      {/* Dual Auth Panels: Google & Kode Masuk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: Google */}
        <Kartu
          judul="Masuk dengan Akun Google"
          subjudul="Khusus email atau domain yang sudah disetujui pengelola."
          aksiHeader={
            <StatusTeks
              status={statusBootstrap.oidcTerkonfigurasi ? 'approved' : 'not-configured'}
              labelKustom={
                statusBootstrap.oidcTerkonfigurasi
                  ? 'Client ID Siap'
                  : 'Belum Dikonfigurasi'
              }
            />
          }
        >
          {statusBootstrap.oidcTerkonfigurasi && statusBootstrap.googleClientId ? (
            <div className="space-y-3 text-xs">
              <p className="text-[var(--teks-sekunder)] leading-relaxed">
                Akun baru dari domain yang diizinkan otomatis berstatus{' '}
                <strong className="text-[var(--teks-utama)]">Pengamat (Viewer)</strong>{' '}
                hingga disetujui Owner/Admin.
              </p>

              {statusBootstrap.domainDiizinkan && statusBootstrap.domainDiizinkan.length > 0 && (
                <p className="text-[11px] text-[var(--teks-redup)]">
                  Domain yang diizinkan:{' '}
                  <span className="font-mono text-[var(--teks-sekunder)]">
                    {statusBootstrap.domainDiizinkan.join(', ')}
                  </span>
                </p>
              )}

              <div className="pt-1">
                <div ref={wadahTombolGoogleRef} className="min-h-[44px]" />
                {!statusGisSiap && (
                  <p className="text-[11px] text-[var(--teks-redup)] mt-1">
                    Memuat tombol masuk Google...
                  </p>
                )}
                {sedangVerifikasiOidc && (
                  <p className="text-[11px] text-[var(--aksen-maroon-teks)] mt-1.5 font-medium">
                    Memeriksa akun Google Anda...
                  </p>
                )}
              </div>

              {galatOidc && (
                <p
                  role="alert"
                  className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
                >
                  {galatOidc}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3.5 space-y-2">
                <p className="font-semibold text-[var(--teks-utama)]">
                  Login Google Belum Diaktifkan
                </p>
                <p className="text-[var(--teks-sekunder)] leading-relaxed">
                  Untuk mengaktifkan tombol masuk Google, atur variabel konfigurasi berikut di pengaturan server:
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-[var(--teks-sekunder)]">
                  <li>GOOGLE_OAUTH_CLIENT_ID</li>
                  <li>ALLOWED_AUTH_EMAILS</li>
                  <li>ALLOWED_AUTH_DOMAINS</li>
                  <li>AUTH_SESSION_SECRET</li>
                </ul>
              </div>
              <p className="text-[11px] text-[var(--teks-redup)]">
                Sementara itu, gunakan formulir Kode Masuk Tim di samping untuk masuk dengan aman.
              </p>
            </div>
          )}
        </Kartu>

        {/* Panel 2: Passcode / Claim Bootstrap */}
        <Kartu
          judul={
            statusBootstrap.perluBootstrapAdmin
              ? 'Buat Kode Pengelola Awal'
              : 'Masuk dengan Kode Tim'
          }
          subjudul={
            statusBootstrap.perluBootstrapAdmin
              ? 'Tetapkan kode masuk pertama untuk mengaktifkan akses Owner/Admin.'
              : 'Masuk sesuai peran Anda di tim menggunakan kode akses.'
          }
          aksiHeader={
            <StatusTeks
              status={statusBootstrap.terkonfigurasiEnv ? 'approved' : 'estimated'}
              labelKustom={
                statusBootstrap.terkonfigurasiEnv
                  ? 'Kode Tim Aktif'
                  : statusBootstrap.perluBootstrapAdmin
                    ? 'Siap Diatur'
                    : 'Sudah Terkunci'
              }
            />
          }
        >
          <form onSubmit={tanganiSubmitPasscode} noValidate className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputTeks
                label="Nama Tampilan"
                wajib
                value={namaTampilan}
                placeholder="Mis. Melfarina Sianipar"
                onChange={(e) => setNamaTampilan(e.target.value)}
              />
              <InputTeks
                label="Email Tim (Opsional)"
                type="email"
                value={emailTim}
                placeholder="nama@ragihotang.id"
                onChange={(e) => setEmailTim(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectPilihan
                label="Peran Tim"
                value={peranDipilih}
                opsi={DAFTAR_PERAN_RBAC_KANONIK.map((p) => ({
                  nilai: p.nilai,
                  label: p.label,
                }))}
                onChange={(e) => setPeranDipilih(e.target.value as PeranPengguna)}
              />
              <InputTeks
                label={
                  statusBootstrap.perluBootstrapAdmin
                    ? 'Buat Kode Masuk (min. 6 karakter)'
                    : 'Kode Masuk'
                }
                type="password"
                wajib
                value={passcode}
                placeholder="Masukkan kode..."
                galat={galatPasscode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (galatPasscode) setGalatPasscode('');
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-[var(--teks-redup)]">
                Kode dijaga aman dan dibatasi jika salah berulang kali.
              </p>
              <Tombol
                type="submit"
                varian="primer"
                ukuran="sm"
                memuat={sedangSubmit}
                ikonKiri={
                  statusBootstrap.perluBootstrapAdmin ? (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                  )
                }
              >
                {statusBootstrap.perluBootstrapAdmin
                  ? 'Tetapkan Kode & Masuk'
                  : 'Masuk'}
              </Tombol>
            </div>
          </form>
        </Kartu>
      </div>
    </div>
  );
}
