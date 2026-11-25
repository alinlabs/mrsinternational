import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Check,
  Lock,
  Pencil,
  ShieldAlert,
  Trash2,
  UserPlus,
  UserX,
} from 'lucide-react';
import { MATRIKS_IZIN_6_PERAN } from '../../data/akses-kanonik';
import { DAFTAR_PERAN_RBAC_KANONIK } from '../../data/aset-kanonik';
import {
  hapusAtauNonaktifkanTimApi,
  simpanAnggotaTimApi,
} from '../../services/layanan-pengaturan';
import type {
  AnggotaTimAkses,
  DataPengaturanTerotorisasi,
  ItemMatriksIzinPeran,
  StatusAkunTim,
} from '../../types/pengaturan';
import type { PeranPengguna, SesiPengguna } from '../../types/status';
import { dapatkanLabelPeran, formatTanggalWib } from '../../utils/format';
import {
  InputTeks,
  Kartu,
  ModalKonfirmasi,
  SelectPilihan,
  StatusTeks,
  TabelData,
  Tombol,
  gunakanToast,
} from '../../components/ui';
import type { KolomTabel } from '../../components/ui';

export interface SectionTimRbacProps {
  sesi: SesiPengguna;
  tokenBearer: string | null;
  dataPengaturan: DataPengaturanTerotorisasi;
  onMuatUlang: () => Promise<void>;
}

const LABEL_SUMBER_TIM: Record<AnggotaTimAkses['sumberPendaftaran'], string> = {
  allowlist: 'Daftar Email Disetujui',
  'oidc-request': 'Masuk via Google',
  'admin-invite': 'Ditambahkan Pengelola',
};

export function SectionTimRbac({
  sesi,
  tokenBearer,
  dataPengaturan,
  onMuatUlang,
}: SectionTimRbacProps) {
  const { tampilkanToast } = gunakanToast();

  const bolehKelolaTim = sesi.peran === 'owner' || sesi.peran === 'admin';
  const adalahOwner = sesi.peran === 'owner';

  const [email, setEmail] = useState('');
  const [namaTampilan, setNamaTampilan] = useState('');
  const [peran, setPeran] = useState<PeranPengguna>('editor');
  const [statusAkun, setStatusAkun] = useState<StatusAkunTim>('aktif');
  const [galatTim, setGalatTim] = useState('');
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [konfirmasiOwnerTerbuka, setKonfirmasiOwnerTerbuka] = useState(false);
  const [targetHapusPermanen, setTargetHapusPermanen] =
    useState<AnggotaTimAkses | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  const eksekusiSimpanTim = async (denganKonfirmasiOwner: boolean) => {
    setGalatTim('');
    setSedangSimpan(true);
    const resp = await simpanAnggotaTimApi(tokenBearer, {
      email,
      namaTampilan,
      peran,
      statusAkun,
      konfirmasiOwner: denganKonfirmasiOwner,
    });
    setSedangSimpan(false);

    if (!resp.ok || !resp.data) {
      setGalatTim(resp.error?.message ?? 'Gagal menyimpan anggota tim.');
      return;
    }

    setEmail('');
    setNamaTampilan('');
    setPeran('editor');
    setStatusAkun('aktif');
    setKonfirmasiOwnerTerbuka(false);

    tampilkanToast({
      jenis: 'sukses',
      judul: 'Direktori tim diperbarui',
      pesan: `${resp.data.email} ditetapkan sebagai ${dapatkanLabelPeran(resp.data.peran)} (${resp.data.statusAkun}).`,
    });
    await onMuatUlang();
  };

  const tanganiSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    setGalatTim('');
    if (!email.trim()) {
      setGalatTim('Alamat email anggota tim wajib diisi.');
      return;
    }

    const perluKonfirmasiKhusus = peran === 'owner' || peran === 'admin';
    if (perluKonfirmasiKhusus) {
      if (!adalahOwner) {
        setGalatTim(
          'Penetapan atau perubahan peran Owner/Admin hanya dapat dilakukan oleh Owner.',
        );
        return;
      }
      setKonfirmasiOwnerTerbuka(true);
      return;
    }

    await eksekusiSimpanTim(false);
  };

  const tanganiSetujuiCepat = async (anggota: AnggotaTimAkses) => {
    const resp = await simpanAnggotaTimApi(tokenBearer, {
      email: anggota.email,
      namaTampilan: anggota.namaTampilan,
      peran: anggota.peran,
      statusAkun: 'aktif',
    });
    if (!resp.ok) {
      tampilkanToast({
        jenis: 'galat',
        judul: 'Gagal menyetujui akun',
        pesan: resp.error?.message ?? 'Akses ditolak.',
      });
      return;
    }
    tampilkanToast({
      jenis: 'sukses',
      judul: 'Akun diaktifkan',
      pesan: `${anggota.email} kini berstatus aktif sebagai ${dapatkanLabelPeran(anggota.peran)}.`,
    });
    await onMuatUlang();
  };

  const tanganiNonaktifkan = async (anggota: AnggotaTimAkses) => {
    const resp = await hapusAtauNonaktifkanTimApi(tokenBearer, anggota.id, false);
    if (!resp.ok) {
      tampilkanToast({
        jenis: 'galat',
        judul: 'Gagal menonaktifkan akun',
        pesan: resp.error?.message ?? 'Tidak berwenang menonaktifkan anggota ini.',
      });
      return;
    }
    tampilkanToast({
      jenis: 'peringatan',
      judul: 'Akun dinonaktifkan sementara',
      pesan: `Akses milik ${anggota.email} telah dihentikan.`,
    });
    await onMuatUlang();
  };

  const tanganiHapusPermanen = async () => {
    if (!targetHapusPermanen) return;
    setSedangHapus(true);
    const resp = await hapusAtauNonaktifkanTimApi(
      tokenBearer,
      targetHapusPermanen.id,
      true,
    );
    setSedangHapus(false);
    setTargetHapusPermanen(null);

    if (!resp.ok) {
      tampilkanToast({
        jenis: 'galat',
        judul: 'Penghapusan permanen gagal',
        pesan: resp.error?.message ?? 'Akses ditolak server.',
      });
      return;
    }

    tampilkanToast({
      jenis: 'sukses',
      judul: 'Anggota dihapus permanen',
      pesan: `${targetHapusPermanen.email} telah dihapus dari direktori akses tim.`,
    });
    await onMuatUlang();
  };

  const kolomTim: KolomTabel<AnggotaTimAkses>[] = [
    {
      kunci: 'identitas',
      judul: 'Anggota & Email',
      render: (baris) => (
        <div className="min-w-[180px]">
          <p className="font-semibold text-[var(--teks-utama)] text-xs">
            {baris.namaTampilan}
          </p>
          <p className="text-[11px] font-mono text-[var(--teks-sekunder)] mt-0.5">
            {baris.email}
          </p>
          <p className="text-[11px] text-[var(--teks-redup)] mt-0.5">
            {LABEL_SUMBER_TIM[baris.sumberPendaftaran]}
          </p>
        </div>
      ),
    },
    {
      kunci: 'peran',
      judul: 'Peran Tim',
      render: (baris) => (
        <span className="inline-block rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-2 py-1 text-xs font-medium text-[var(--teks-utama)]">
          {dapatkanLabelPeran(baris.peran)}
        </span>
      ),
    },
    {
      kunci: 'status',
      judul: 'Status Akun',
      render: (baris) => (
        <StatusTeks
          status={
            baris.statusAkun === 'aktif'
              ? 'approved'
              : baris.statusAkun === 'menunggu-persetujuan'
                ? 'sample'
                : 'not-configured'
          }
          labelKustom={
            baris.statusAkun === 'aktif'
              ? 'Aktif'
              : baris.statusAkun === 'menunggu-persetujuan'
                ? 'Menunggu Persetujuan'
                : 'Dinonaktifkan'
          }
        />
      ),
    },
    {
      kunci: 'persetujuan',
      judul: 'Otorisasi',
      render: (baris) => (
        <div className="text-[11px] text-[var(--teks-sekunder)]">
          <p>{baris.disetujuiOleh || 'Belum disetujui'}</p>
          <p className="text-[var(--teks-redup)] angka-tabular mt-0.5">
            {formatTanggalWib(baris.diperbaruiPada)}
          </p>
        </div>
      ),
    },
    {
      kunci: 'aksi',
      judul: 'Tindakan',
      perataan: 'kanan',
      render: (baris) => {
        if (!bolehKelolaTim) {
          return (
            <span className="text-[11px] text-[var(--teks-redup)]">Baca saja</span>
          );
        }
        const menyentuhHakIstimewa =
          baris.peran === 'owner' || baris.peran === 'admin';
        const dikunciNonOwner = menyentuhHakIstimewa && !adalahOwner;

        return (
          <div className="inline-flex items-center justify-end gap-1.5">
            {baris.statusAkun === 'menunggu-persetujuan' && !dikunciNonOwner && (
              <Tombol
                varian="sekunder"
                ukuran="sm"
                title="Setujui akun agar aktif"
                onClick={() => void tanganiSetujuiCepat(baris)}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </Tombol>
            )}
            <Tombol
              varian="halus"
              ukuran="sm"
              disabled={dikunciNonOwner}
              title={
                dikunciNonOwner
                  ? 'Perubahan Owner/Admin wajib disetujui Owner'
                  : 'Sunting peran/status'
              }
              onClick={() => {
                setEmail(baris.email);
                setNamaTampilan(baris.namaTampilan);
                setPeran(baris.peran);
                setStatusAkun(baris.statusAkun);
              }}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </Tombol>
            {baris.statusAkun !== 'dinonaktifkan' && (
              <Tombol
                varian="halus"
                ukuran="sm"
                disabled={dikunciNonOwner}
                title="Nonaktifkan akun sementara"
                onClick={() => void tanganiNonaktifkan(baris)}
              >
                <UserX className="h-3.5 w-3.5" aria-hidden="true" />
              </Tombol>
            )}
            {adalahOwner && (
              <Tombol
                varian="halus"
                ukuran="sm"
                title="Hapus permanen dari direktori"
                onClick={() => setTargetHapusPermanen(baris)}
              >
                <Trash2 className="h-3.5 w-3.5 text-[var(--status-bahaya)]" aria-hidden="true" />
              </Tombol>
            )}
          </div>
        );
      },
    },
  ];

  const kolomMatriks: KolomTabel<ItemMatriksIzinPeran>[] = [
    {
      kunci: 'sumberDaya',
      judul: 'Sumber Daya Sistem',
      render: (baris) => (
        <div className="min-w-[200px]">
          <p className="font-semibold text-xs text-[var(--teks-utama)]">
            {baris.sumberDaya}
          </p>
          <p className="text-[11px] text-[var(--teks-sekunder)] mt-0.5">
            {baris.deskripsi}
          </p>
        </div>
      ),
    },
    {
      kunci: 'owner',
      judul: 'Owner',
      render: (b) => <span className="text-xs">{b.izinPerPeran.owner}</span>,
    },
    {
      kunci: 'admin',
      judul: 'Admin',
      render: (b) => <span className="text-xs">{b.izinPerPeran.admin}</span>,
    },
    {
      kunci: 'dm',
      judul: 'Digital Manager',
      render: (b) => (
        <span className="text-xs">{b.izinPerPeran['digital-manager']}</span>
      ),
    },
    {
      kunci: 'editor',
      judul: 'Editor',
      render: (b) => <span className="text-xs">{b.izinPerPeran.editor}</span>,
    },
    {
      kunci: 'pic',
      judul: 'PIC Stakeholder',
      render: (b) => (
        <span className="text-xs">{b.izinPerPeran['stakeholder-pic']}</span>
      ),
    },
    {
      kunci: 'viewer',
      judul: 'Viewer',
      render: (b) => <span className="text-xs">{b.izinPerPeran.viewer}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Daftar Anggota Tim */}
      <Kartu
        judul="Daftar Anggota Tim & Pengaturan Peran"
        subjudul="Anggota baru yang masuk pertama kali menunggu persetujuan Owner atau Admin sebelum mendapat akses penuh."
      >
        {dataPengaturan.aksesTerbatasPenuh ? (
          <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-4 text-xs text-[var(--teks-sekunder)] flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-[var(--aksen-maroon-teks)] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-[var(--teks-utama)]">
                Daftar Anggota Tim Dibatasi
              </p>
              <p className="mt-1">
                Hanya <strong>Owner</strong>, <strong>Admin</strong>, dan{' '}
                <strong>Digital Manager</strong> yang dapat melihat daftar email dan peran tim.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {bolehKelolaTim ? (
              <form
                onSubmit={tanganiSubmitForm}
                noValidate
                className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[var(--teks-utama)]">
                    Tambah atau Perbarui Peran Anggota Tim
                  </p>
                  {!adalahOwner && (
                    <span className="text-[11px] text-[var(--teks-redup)]">
                      Admin hanya dapat mengelola peran non-Owner/non-Admin
                    </span>
                  )}
                </div>

                {galatTim && (
                  <p
                    role="alert"
                    className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
                  >
                    {galatTim}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <InputTeks
                    label="Email Anggota Tim"
                    type="email"
                    wajib
                    value={email}
                    placeholder="tim@ragihotang.id"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (galatTim) setGalatTim('');
                    }}
                  />
                  <InputTeks
                    label="Nama Tampilan"
                    value={namaTampilan}
                    placeholder="Nama lengkap"
                    onChange={(e) => setNamaTampilan(e.target.value)}
                  />
                  <SelectPilihan
                    label="Peran Operasional"
                    value={peran}
                    opsi={DAFTAR_PERAN_RBAC_KANONIK.map((p) => ({
                      nilai: p.nilai,
                      label: p.label,
                    }))}
                    onChange={(e) => setPeran(e.target.value as PeranPengguna)}
                  />
                  <SelectPilihan
                    label="Status Akun"
                    value={statusAkun}
                    opsi={[
                      { nilai: 'aktif', label: 'Aktif' },
                      {
                        nilai: 'menunggu-persetujuan',
                        label: 'Menunggu Persetujuan',
                      },
                      { nilai: 'dinonaktifkan', label: 'Dinonaktifkan' },
                    ]}
                    onChange={(e) =>
                      setStatusAkun(e.target.value as StatusAkunTim)
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Tombol
                    type="submit"
                    varian="primer"
                    ukuran="sm"
                    memuat={sedangSimpan}
                    ikonKiri={<UserPlus className="h-3.5 w-3.5" aria-hidden="true" />}
                  >
                    Simpan Anggota &amp; Peran
                  </Tombol>
                </div>
              </form>
            ) : (
              <div className="rounded-[var(--radius-sm)] border border-[var(--status-peringatan)]/40 bg-[var(--status-peringatan)]/[0.06] px-3.5 py-2.5 text-xs text-[var(--status-peringatan)] flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Peran Digital Manager hanya dapat meninjau direktori tim tanpa menambah atau mengubah peran.
                </span>
              </div>
            )}

            <TabelData
              keteranganTabel="Daftar anggota tim dan status persetujuan akses"
              kolom={kolomTim}
              data={dataPengaturan.daftarTim}
              kunciBaris={(b) => b.id}
              judulKosong="Belum ada anggota tim terdaftar"
              pesanKosong="Tambahkan email anggota tim melalui formulir di atas."
            />
          </div>
        )}
      </Kartu>

      {/* Tabel Hak Akses 6 Peran */}
      <Kartu
        judul="Pembagian Hak Akses 6 Peran"
        subjudul="Ringkasan apa saja yang bisa dibuka dan diubah oleh tiap peran di tim."
      >
        <TabelData
          keteranganTabel="Tabel pembagian hak akses enam peran tim"
          kolom={kolomMatriks}
          data={MATRIKS_IZIN_6_PERAN}
          kunciBaris={(b) => b.id}
        />
      </Kartu>

      {/* Modal Konfirmasi Eksplisit Owner untuk Role Owner/Admin */}
      <ModalKonfirmasi
        terbuka={konfirmasiOwnerTerbuka}
        onTutup={() => setKonfirmasiOwnerTerbuka(false)}
        onKonfirmasi={() => void eksekusiSimpanTim(true)}
        judul="Konfirmasi Owner untuk Hak Istimewa"
        pesan={`Anda akan menetapkan peran ${dapatkanLabelPeran(peran)} kepada ${email}. Peran ini memiliki kewenangan penuh atas seluruh data sensitif, penghapusan, dan pengaturan. Lanjutkan?`}
        labelKonfirmasi="Ya, Tetapkan dengan Otoritas Owner"
        memuat={sedangSimpan}
      />

      {/* Modal Hapus Permanen Anggota */}
      <ModalKonfirmasi
        terbuka={Boolean(targetHapusPermanen)}
        onTutup={() => setTargetHapusPermanen(null)}
        onKonfirmasi={() => void tanganiHapusPermanen()}
        judul="Hapus Anggota Tim Permanen"
        pesan={`Yakin ingin menghapus permanen ${targetHapusPermanen?.email ?? ''} dari direktori akses tim? Tindakan ini tercatat pada audit log.`}
        labelKonfirmasi="Hapus Permanen"
        berbahaya
        memuat={sedangHapus}
      />
    </div>
  );
}
