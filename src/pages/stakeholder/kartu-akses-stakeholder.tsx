import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, KeyRound, Lock, LogOut, ShieldCheck } from 'lucide-react';
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

export interface KartuAksesStakeholderProps {
  aksesKontakPrivat: boolean;
}

export function KartuAksesStakeholder({
  aksesKontakPrivat,
}: KartuAksesStakeholderProps) {
  const {
    sesi,
    statusBootstrap,
    bootstrapAdmin,
    masukSesi,
    keluarSesi,
  } = gunakanSesiAplikasi();
  const { tampilkanToast } = gunakanToast();

  const [namaTampilan, setNamaTampilan] = useState('PIC Stakeholder');
  const [peranDipilih, setPeranDipilih] =
    useState<PeranPengguna>('stakeholder-pic');
  const [passcode, setPasscode] = useState('');
  const [galatAuth, setGalatAuth] = useState('');
  const [sedangSubmit, setSedangSubmit] = useState(false);

  const tanganiSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGalatAuth('');
    setSedangSubmit(true);

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

    setSedangSubmit(false);
    if (!hasil.ok) {
      setGalatAuth(hasil.pesan ?? 'Autentikasi gagal.');
      return;
    }

    setPasscode('');
    tampilkanToast({
      jenis: 'sukses',
      judul: 'Sesi kerja aktif',
      pesan: `Masuk sebagai ${dapatkanLabelPeran(peranDipilih)}.`,
    });
  };

  return (
    <Kartu
      judul="Akses Daftar Tamu & Kontak"
      subjudul="Kontak pribadi tamu dijaga aman. Hanya Owner, Admin, Digital Manager, dan Penanggung Jawab Tamu yang dapat melihat rinciannya."
      aksiHeader={
        <StatusTeks
          status={
            !sesi.terautentikasi
              ? 'not-configured'
              : aksesKontakPrivat
                ? 'approved'
                : 'sample'
          }
          labelKustom={
            !sesi.terautentikasi
              ? 'Belum Masuk'
              : aksesKontakPrivat
                ? `Akses Penuh (${dapatkanLabelPeran(sesi.peran)})`
                : `Kontak Disamarkan (${dapatkanLabelPeran(sesi.peran)})`
          }
        />
      }
    >
      {sesi.terautentikasi ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs">
            {aksesKontakPrivat ? (
              <CheckCircle2
                className="h-4 w-4 text-[var(--status-sukses)] shrink-0 mt-0.5"
                aria-hidden="true"
              />
            ) : (
              <Lock
                className="h-4 w-4 text-[var(--status-peringatan)] shrink-0 mt-0.5"
                aria-hidden="true"
              />
            )}
            <div>
              <p className="font-semibold text-[var(--teks-utama)]">
                {sesi.namaTampilan} ({dapatkanLabelPeran(sesi.peran)})
              </p>
              <p className="text-[var(--teks-sekunder)] mt-0.5">
                {aksesKontakPrivat
                  ? 'Dapat melihat kontak pribadi, mencatat riwayat kontak, impor daftar, dan ekspor data internal.'
                  : 'Mode terbatas: kontak pribadi tamu disamarkan dan ekspor hanya memuat daftar tanpa rincian kontak.'}
              </p>
            </div>
          </div>

          <Tombol
            varian="sekunder"
            ukuran="sm"
            ikonKiri={<LogOut className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={keluarSesi}
          >
            Keluar / Ganti Peran
          </Tombol>
        </div>
      ) : (
        <form
          onSubmit={tanganiSubmit}
          noValidate
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
        >
          <InputTeks
            label="Nama / Inisial Tim"
            value={namaTampilan}
            onChange={(e) => setNamaTampilan(e.target.value)}
          />
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
                ? 'Buat Kode Masuk (min. 6)'
                : 'Kode Masuk Tim'
            }
            type="password"
            wajib
            value={passcode}
            galat={galatAuth}
            placeholder="Masukkan kode masuk..."
            onChange={(e) => {
              setPasscode(e.target.value);
              if (galatAuth) setGalatAuth('');
            }}
          />
          <Tombol
            type="submit"
            varian="primer"
            ukuran="md"
            memuat={sedangSubmit}
            ikonKiri={<KeyRound className="h-3.5 w-3.5" aria-hidden="true" />}
          >
            {statusBootstrap.perluBootstrapAdmin
              ? 'Tetapkan Kode & Masuk'
              : 'Masuk'}
          </Tombol>
        </form>
      )}
      <p className="mt-2.5 text-[11px] text-[var(--teks-redup)] flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Pendaftaran kampanye menggunakan mekanisme kuota terbatas — peninjauan &amp; konfirmasi kursi dikelola secara internal oleh Admin.
      </p>
    </Kartu>
  );
}
