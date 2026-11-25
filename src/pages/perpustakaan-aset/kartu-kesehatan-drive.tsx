import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  HardDrive,
  KeyRound,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { DAFTAR_PERAN_RBAC_KANONIK } from '../../data/aset-kanonik';
import { gunakanSesiAplikasi } from '../../hooks/gunakan-sesi-aplikasi';
import type { StatusKesehatanDrive } from '../../types/aset';
import type { PeranPengguna } from '../../types/status';
import {
  apakahUrlEksternalAman,
  dapatkanInfoStatusKoneksi,
  formatUkuranBerkas,
} from '../../utils/aset';
import { dapatkanLabelPeran, formatTanggalWib } from '../../utils/format';
import {
  InputTeks,
  Kartu,
  SelectPilihan,
  StatusTeks,
  Tombol,
  gunakanToast,
} from '../../components/ui';

export interface KartuKesehatanDriveProps {
  kesehatan: StatusKesehatanDrive | null;
  sedangCek: boolean;
  onUjiKoneksi: () => void;
}

export function KartuKesehatanDrive({
  kesehatan,
  sedangCek,
  onUjiKoneksi,
}: KartuKesehatanDriveProps) {
  const {
    sesi,
    statusBootstrap,
    bootstrapAdmin,
    masukSesi,
    keluarSesi,
  } = gunakanSesiAplikasi();
  const { tampilkanToast } = gunakanToast();

  const [namaTampilan, setNamaTampilan] = useState('Melfarina Sianipar');
  const [peranDipilih, setPeranDipilih] = useState<PeranPengguna>('owner');
  const [passcode, setPasscode] = useState('');
  const [galatAuth, setGalatAuth] = useState('');
  const [sedangSubmitAuth, setSedangSubmitAuth] = useState(false);

  const infoKoneksi = dapatkanInfoStatusKoneksi(
    kesehatan?.status ?? 'not-configured',
  );

  const tanganiSubmitAuth = async (e: FormEvent) => {
    e.preventDefault();
    setGalatAuth('');
    setSedangSubmitAuth(true);

    const hasil = statusBootstrap.perluBootstrapAdmin
      ? await bootstrapAdmin({
          passcode,
          namaTampilan,
          peran: peranDipilih,
        })
      : await masukSesi({
          passcode,
          namaTampilan,
          peran: peranDipilih,
        });

    setSedangSubmitAuth(false);

    if (!hasil.ok) {
      setGalatAuth(hasil.pesan ?? 'Autentikasi gagal.');
      return;
    }

    setPasscode('');
    tampilkanToast({
      jenis: 'sukses',
      judul: 'Sesi kerja terautentikasi',
      pesan: `Masuk sebagai ${dapatkanLabelPeran(peranDipilih)} dengan token sesi server.`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-7">
        <Kartu
          judul="Status Koneksi Google Drive"
          subjudul="Koneksi tersimpan aman melalui server aplikasi."
          aksiHeader={
            <StatusTeks
              labelKustom={infoKoneksi.label}
              nadaKustom={infoKoneksi.nada}
            />
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-[var(--teks-sekunder)] leading-relaxed">
              {kesehatan?.pesan ??
                'Memeriksa koneksi Google Drive...'}
            </p>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3 text-xs">
              <div>
                <dt className="text-[var(--teks-redup)]">Folder Tujuan Induk</dt>
                <dd className="mt-0.5 font-medium text-[var(--teks-utama)] truncate">
                  {kesehatan?.namaFolderInduk ?? 'Belum terhubung'}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--teks-redup)]">Batas Sekali Unggah</dt>
                <dd className="mt-0.5 font-medium text-[var(--aksen-maroon-teks)] angka-tabular">
                  Maks.{' '}
                  {formatUkuranBerkas(kesehatan?.batasUploadBytes ?? 4194304)}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--teks-redup)]">Pemeriksaan Terakhir</dt>
                <dd className="mt-0.5 font-medium text-[var(--teks-utama)]">
                  {kesehatan?.lastCheckedAt
                    ? formatTanggalWib(kesehatan.lastCheckedAt)
                    : 'Belum dicek'}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  memuat={sedangCek}
                  ikonKiri={
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  }
                  onClick={onUjiKoneksi}
                >
                  Uji Koneksi Drive
                </Tombol>

                {kesehatan?.tautanFolderTerkontrol &&
                  apakahUrlEksternalAman(kesehatan.tautanFolderTerkontrol) && (
                    <a
                      href={kesehatan.tautanFolderTerkontrol}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] text-xs font-medium text-[var(--teks-utama)] hover:bg-[var(--bg-sekunder)]"
                    >
                      <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
                      Buka Folder Drive
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
              </div>
            </div>
          </div>
        </Kartu>
      </div>

      <div className="lg:col-span-5">
        <Kartu
          judul="Akses Tim & Sesi Kerja"
          subjudul={
            sesi.terautentikasi
              ? 'Sesi aktif — file baru otomatis bersifat privat.'
              : 'Masuk untuk membuka dan mengunggah file tim.'
          }
          aksiHeader={
            <StatusTeks
              labelKustom={
                sesi.terautentikasi
                  ? `Aktif: ${dapatkanLabelPeran(sesi.peran)}`
                  : 'Belum Masuk'
              }
              nadaKustom={sesi.terautentikasi ? 'hijau' : 'peringatan'}
            />
          }
        >
          {sesi.terautentikasi ? (
            <div className="space-y-3">
              <div className="rounded-[var(--radius-sm)] border border-[var(--status-sukses)]/35 bg-[var(--status-sukses)]/[0.05] p-3 text-xs space-y-1">
                <p className="font-semibold text-[var(--teks-utama)] flex items-center gap-1.5">
                  <CheckCircle2
                    className="h-4 w-4 text-[var(--status-sukses)]"
                    aria-hidden="true"
                  />
                  {sesi.namaTampilan} ({dapatkanLabelPeran(sesi.peran)})
                </p>
                <p className="text-[var(--teks-sekunder)] leading-relaxed">
                  {DAFTAR_PERAN_RBAC_KANONIK.find((p) => p.nilai === sesi.peran)
                    ?.ringkasanAkses ?? ''}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--teks-redup)] flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  File baru bersifat privat (internal) secara default
                </span>
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<LogOut className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={keluarSesi}
                >
                  Keluar / Ganti Peran
                </Tombol>
              </div>
            </div>
          ) : (
            <form onSubmit={tanganiSubmitAuth} noValidate className="space-y-3">
              {statusBootstrap.perluBootstrapAdmin && (
                <p className="text-[11px] text-[var(--aksen-maroon-teks)] bg-[var(--aksen-maroon-lembut)]/70 border border-[var(--aksen-maroon-garis)]/50 rounded-[var(--radius-sm)] px-2.5 py-2 leading-relaxed">
                  <strong>Pengaturan Awal:</strong> Buat kode akses minimal 6 karakter untuk mengaktifkan akses tim.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <InputTeks
                  label="Nama / Inisial Tim"
                  value={namaTampilan}
                  onChange={(e) => setNamaTampilan(e.target.value)}
                  placeholder="Mis. Melfarina / Digital Manager"
                />

                <SelectPilihan
                  label="Peran Operasional"
                  value={peranDipilih}
                  opsi={DAFTAR_PERAN_RBAC_KANONIK.map((p) => ({
                    nilai: p.nilai,
                    label: p.label,
                  }))}
                  onChange={(e) =>
                    setPeranDipilih(e.target.value as PeranPengguna)
                  }
                />
              </div>

              <InputTeks
                label={
                  statusBootstrap.perluBootstrapAdmin
                    ? 'Buat Kode Akses Sesi Awal (min. 6 karakter)'
                    : 'Kode Akses Sesi'
                }
                type="password"
                wajib
                value={passcode}
                galat={galatAuth}
                placeholder="Masukkan kode akses..."
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (galatAuth) setGalatAuth('');
                }}
              />

              <Tombol
                type="submit"
                varian="primer"
                ukuran="sm"
                className="w-full"
                memuat={sedangSubmitAuth}
                ikonKiri={<KeyRound className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                {statusBootstrap.perluBootstrapAdmin
                  ? 'Tetapkan Kode & Aktifkan Sesi'
                  : 'Aktifkan Sesi Kerja'}
              </Tombol>
            </form>
          )}
        </Kartu>
      </div>
    </div>
  );
}
