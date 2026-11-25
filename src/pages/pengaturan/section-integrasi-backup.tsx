import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArchiveRestore,
  Download,
  ExternalLink,
  FolderOpen,
  HardDrive,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';
import { DAFTAR_FOLDER_DRIVE_KANONIK } from '../../data/aset-kanonik';
import { cekKesehatanDriveApi } from '../../services/layanan-aset';
import {
  ambilSampahAsetApi,
  ambilSampahStakeholderApi,
  eksporBackupServerApi,
  hapusPermanenAsetApi,
  hapusPermanenStakeholderApi,
  perbaruiIntegrasiPublikApi,
  pulihkanAsetApi,
  pulihkanStakeholderApi,
} from '../../services/layanan-pengaturan';
import { repositoriIklanLokal } from '../../services/repositori-iklan';
import { repositoriKalenderLokal } from '../../services/repositori-kalender';
import { repositoriKpiLokal } from '../../services/repositori-kpi';
import { repositoriProduksiLokal } from '../../services/repositori-produksi';
import type { AsetDrive, StatusKesehatanDrive } from '../../types/aset';
import type { DataPengaturanTerotorisasi } from '../../types/pengaturan';
import type { RecordStakeholder } from '../../types/stakeholder';
import type { SesiPengguna } from '../../types/status';
import { formatTanggalWib } from '../../utils/format';
import {
  InputTeks,
  Kartu,
  ModalKonfirmasi,
  StatusTeks,
  Tombol,
  gunakanToast,
} from '../../components/ui';

export interface SectionIntegrasiBackupProps {
  sesi: SesiPengguna;
  tokenBearer: string | null;
  dataPengaturan: DataPengaturanTerotorisasi;
  onDataDiperbarui: (dataBaru: DataPengaturanTerotorisasi) => void;
}

export function SectionIntegrasiBackup({
  sesi,
  tokenBearer,
  dataPengaturan,
  onDataDiperbarui,
}: SectionIntegrasiBackupProps) {
  const { tampilkanToast } = gunakanToast();

  const bolehKelolaIntegrasi =
    sesi.peran === 'owner' || sesi.peran === 'admin';
  const bolehBackup =
    sesi.peran === 'owner' ||
    sesi.peran === 'admin' ||
    sesi.peran === 'digital-manager';

  const [kesehatanDrive, setKesehatanDrive] =
    useState<StatusKesehatanDrive | null>(null);
  const [memeriksaDrive, setMemeriksaDrive] = useState(false);

  const [appsScriptUrl, setAppsScriptUrl] = useState(
    dataPengaturan.integrasi.appsScriptWebAppUrl,
  );
  const [driveFolderUrl, setDriveFolderUrl] = useState(
    dataPengaturan.integrasi.googleDriveFolderUrl,
  );
  const [googleClientId, setGoogleClientId] = useState(
    dataPengaturan.integrasi.googleClientId,
  );
  const [sedangSimpanIntegrasi, setSedangSimpanIntegrasi] = useState(false);
  const [galatIntegrasi, setGalatIntegrasi] = useState('');

  const [sedangEksporBackup, setSedangEksporBackup] = useState(false);

  // Soft-deleted trash state
  const [sampahAset, setSampahAset] = useState<AsetDrive[]>([]);
  const [sampahStakeholder, setSampahStakeholder] = useState<
    RecordStakeholder[]
  >([]);
  const [sedangMuatSampah, setSedangMuatSampah] = useState(false);
  const [targetHapus, setTargetHapus] = useState<{
    jenis: 'aset' | 'stakeholder';
    id: string;
    nama: string;
  } | null>(null);
  const [sedangEksekusiHapus, setSedangEksekusiHapus] = useState(false);

  useEffect(() => {
    setAppsScriptUrl(dataPengaturan.integrasi.appsScriptWebAppUrl);
    setDriveFolderUrl(dataPengaturan.integrasi.googleDriveFolderUrl);
    setGoogleClientId(dataPengaturan.integrasi.googleClientId);
  }, [dataPengaturan]);

  const muatKesehatan = useCallback(async () => {
    setMemeriksaDrive(true);
    try {
      const resp = await cekKesehatanDriveApi();
      if (resp.ok && resp.data) {
        setKesehatanDrive(resp.data);
      }
    } finally {
      setMemeriksaDrive(false);
    }
  }, []);

  const muatSampah = useCallback(async () => {
    if (!bolehKelolaIntegrasi || !tokenBearer) return;
    setSedangMuatSampah(true);
    try {
      const [resAset, resStakeholder] = await Promise.all([
        ambilSampahAsetApi(tokenBearer),
        ambilSampahStakeholderApi(tokenBearer),
      ]);
      if (resAset.ok && Array.isArray(resAset.data)) {
        setSampahAset(resAset.data);
      }
      if (resStakeholder.ok && Array.isArray(resStakeholder.data)) {
        setSampahStakeholder(resStakeholder.data);
      }
    } finally {
      setSedangMuatSampah(false);
    }
  }, [bolehKelolaIntegrasi, tokenBearer]);

  useEffect(() => {
    void muatKesehatan();
    void muatSampah();
  }, [muatKesehatan, muatSampah]);

  const tanganiSimpanIntegrasi = async (e: FormEvent) => {
    e.preventDefault();
    setGalatIntegrasi('');
    setSedangSimpanIntegrasi(true);
    const resp = await perbaruiIntegrasiPublikApi(tokenBearer, {
      appsScriptWebAppUrl: appsScriptUrl,
      googleDriveFolderUrl: driveFolderUrl,
      googleClientId,
    });
    setSedangSimpanIntegrasi(false);

    if (!resp.ok || !resp.data) {
      setGalatIntegrasi(
        resp.error?.message ?? 'Gagal memperbarui endpoint publik integrasi.',
      );
      return;
    }

    onDataDiperbarui(resp.data);
    await muatKesehatan();
    tampilkanToast({
      jenis: 'sukses',
      judul: 'Konfigurasi integrasi publik disimpan',
      pesan: 'Shared secret tetap terisolasi hanya pada environment server.',
    });
  };

  const tanganiEksporBackup = async () => {
    setSedangEksporBackup(true);
    const resp = await eksporBackupServerApi(tokenBearer);
    setSedangEksporBackup(false);

    if (!resp.ok || !resp.data) {
      tampilkanToast({
        jenis: 'galat',
        judul: 'Ekspor backup gagal',
        pesan: resp.error?.message ?? 'Tidak diizinkan mengekspor backup.',
      });
      return;
    }

    const paketBackup = {
      versiSchema: 'ragi-hotang-backup-v1',
      ...resp.data,
      workspaceOperasionalLokal: {
        kalenderKonten: repositoriKalenderLokal.muatSemua(),
        produksiTugas: repositoriProduksiLokal.muatSemua(),
        iklanAnggaran: repositoriIklanLokal.muatSemua(),
        kpiMonitoring: repositoriKpiLokal.muatSemua(),
      },
    };

    const blob = new Blob([JSON.stringify(paketBackup, null, 2)], {
      type: 'application/json',
    });
    const urlObj = URL.createObjectURL(blob);
    const tautan = document.createElement('a');
    tautan.href = urlObj;
    tautan.download = `ragi-hotang-backup-aman-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(tautan);
    tautan.click();
    tautan.remove();
    URL.revokeObjectURL(urlObj);

    tampilkanToast({
      jenis: 'sukses',
      judul: 'Cadangan data berhasil diunduh',
      pesan: 'File cadangan ini bebas dari kata sandi dan kunci rahasia.',
    });
  };

  const tanganiPulihkan = async (jenis: 'aset' | 'stakeholder', id: string) => {
    const resp =
      jenis === 'aset'
        ? await pulihkanAsetApi(tokenBearer, id)
        : await pulihkanStakeholderApi(tokenBearer, id);

    if (!resp.ok) {
      tampilkanToast({
        jenis: 'galat',
        judul: 'Pemulihan gagal',
        pesan: resp.error?.message ?? 'Data tidak dapat dipulihkan.',
      });
      return;
    }

    tampilkanToast({
      jenis: 'sukses',
      judul: 'Data dipulihkan',
      pesan:
        jenis === 'aset'
          ? 'File dikembalikan ke Galeri & Aset Drive.'
          : 'Data tamu dikembalikan ke daftar Relasi & Undangan VIP.',
    });
    await muatSampah();
  };

  const tanganiHapusPermanen = async () => {
    if (!targetHapus) return;
    setSedangEksekusiHapus(true);
    const resp =
      targetHapus.jenis === 'aset'
        ? await hapusPermanenAsetApi(tokenBearer, targetHapus.id)
        : await hapusPermanenStakeholderApi(tokenBearer, targetHapus.id);
    setSedangEksekusiHapus(false);
    setTargetHapus(null);

    if (!resp.ok) {
      tampilkanToast({
        jenis: 'galat',
        judul: 'Penghapusan permanen gagal',
        pesan: resp.error?.message ?? 'Gagal menghapus data.',
      });
      return;
    }

    tampilkanToast({
      jenis: 'sukses',
      judul: 'Data dihapus permanen',
      pesan: `${targetHapus.nama} telah dihapus permanen oleh ${sesi.namaTampilan}.`,
    });
    await muatSampah();
  };

  return (
    <div className="space-y-5">
      {/* Status Koneksi Google Drive */}
      <Kartu
        judul="Koneksi Google Drive & Apps Script"
        subjudul="Mengatur tautan folder Google Drive proyek agar unggahan dan laporan tersimpan otomatis."
        aksiHeader={
          <div className="flex items-center gap-2">
            <StatusTeks
              status={
                kesehatanDrive?.status === 'connected'
                  ? 'approved'
                  : kesehatanDrive?.status === 'degraded'
                    ? 'sample'
                    : 'not-configured'
              }
              labelKustom={
                kesehatanDrive?.status === 'connected'
                  ? 'Terhubung'
                  : kesehatanDrive?.status === 'degraded'
                    ? 'Gangguan Koneksi'
                    : 'Belum Terhubung'
              }
            />
            <Tombol
              varian="sekunder"
              ukuran="sm"
              memuat={memeriksaDrive}
              ikonKiri={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => void muatKesehatan()}
            >
              Periksa Koneksi
            </Tombol>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3">
              <p className="text-[var(--teks-redup)]">Kunci Keamanan Apps Script</p>
              <p className="mt-1 font-semibold text-[var(--teks-utama)]">
                {dataPengaturan.integrasi.sharedSecretTerkonfigurasi
                  ? 'Sudah Terpasang Aman'
                  : 'Belum Dipasang'}
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3">
              <p className="text-[var(--teks-redup)]">Batas Sekali Unggah</p>
              <p className="mt-1 font-semibold text-[var(--teks-utama)] angka-tabular">
                {Math.round(
                  dataPengaturan.integrasi.batasProxyUploadBytes / (1024 * 1024),
                )}{' '}
                MB per file
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3">
              <p className="text-[var(--teks-redup)]">Folder Drive Utama</p>
              <p className="mt-1 font-semibold text-[var(--teks-utama)] truncate">
                {kesehatanDrive?.namaFolderInduk ?? 'Ragi Hotang — Drive Utama'}
              </p>
            </div>
          </div>

          <form
            onSubmit={tanganiSimpanIntegrasi}
            noValidate
            className="space-y-3 pt-2 border-t border-[var(--garis-halus)]"
          >
            {galatIntegrasi && (
              <p
                role="alert"
                className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
              >
                {galatIntegrasi}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InputTeks
                label="URL Web App Apps Script (Publik)"
                value={appsScriptUrl}
                disabled={!bolehKelolaIntegrasi}
                placeholder="https://script.google.com/macros/s/.../exec"
                petunjuk="Harus HTTPS resmi domain script.google.com."
                onChange={(e) => setAppsScriptUrl(e.target.value)}
              />
              <InputTeks
                label="URL Folder Induk Google Drive"
                value={driveFolderUrl}
                disabled={!bolehKelolaIntegrasi}
                placeholder="https://drive.google.com/drive/folders/..."
                onChange={(e) => setDriveFolderUrl(e.target.value)}
              />
              <InputTeks
                label="Google OAuth Client ID (Publik OIDC)"
                value={googleClientId}
                disabled={!bolehKelolaIntegrasi}
                placeholder="123456-abc.apps.googleusercontent.com"
                onChange={(e) => setGoogleClientId(e.target.value)}
              />
            </div>

            {bolehKelolaIntegrasi && (
              <div className="flex justify-end">
                <Tombol
                  type="submit"
                  varian="primer"
                  ukuran="sm"
                  memuat={sedangSimpanIntegrasi}
                  ikonKiri={<Save className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  Simpan Endpoint Publik
                </Tombol>
              </div>
            )}
          </form>

          {/* 8 Folder Kanonik */}
          <div className="pt-3 border-t border-[var(--garis-halus)]">
              <div className="flex items-center justify-between gap-2 mb-2.5">
              <p className="text-xs font-semibold text-[var(--teks-utama)] flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-[var(--aksen-maroon-teks)]" aria-hidden="true" />
                <span>8 Folder Proyek di Google Drive</span>
              </p>
              {dataPengaturan.integrasi.googleDriveFolderUrl && (
                <a
                  href={dataPengaturan.integrasi.googleDriveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--aksen-maroon-teks)] hover:underline"
                >
                  <span>Buka Folder Utama</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              {DAFTAR_FOLDER_DRIVE_KANONIK.map((folder) => (
                <div
                  key={folder.kode}
                  className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70 p-2.5"
                >
                  <p className="font-mono font-semibold text-[var(--teks-utama)]">
                    {folder.nama}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--teks-sekunder)] line-clamp-2">
                    {folder.deskripsi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Kartu>

      {/* Cadangan Data */}
      <Kartu
        judul="Unduh Cadangan Data (Backup JSON)"
        subjudul="Menyimpan seluruh data kalender, produksi, anggaran, KPI, dan pengaturan dalam satu file."
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 text-[var(--teks-sekunder)]">
            <HardDrive className="h-4 w-4 text-[var(--aksen-maroon-teks)] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              File cadangan otomatis disaring agar tidak pernah menyertakan kata sandi atau kunci rahasia sistem.
            </p>
          </div>
          {bolehBackup && (
            <Tombol
              varian="sekunder"
              ukuran="sm"
              memuat={sedangEksporBackup}
              ikonKiri={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => void tanganiEksporBackup()}
            >
              Unduh Cadangan Data
            </Tombol>
          )}
        </div>
      </Kartu>

      {/* Arsip Terhapus & Pemulihan (Owner / Admin) */}
      {bolehKelolaIntegrasi && (
        <Kartu
          judul="Arsip Terhapus & Pemulihan"
          subjudul="File Drive atau kontak tamu yang dihapus disimpan sementara di sini sebelum dihapus permanen."
          aksiHeader={
            <Tombol
              varian="sekunder"
              ukuran="sm"
              memuat={sedangMuatSampah}
              ikonKiri={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => void muatSampah()}
            >
              Segarkan Arsip
            </Tombol>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
            {/* Arsip Aset Drive */}
            <div className="space-y-2.5">
              <p className="font-semibold text-[var(--teks-utama)]">
                File Drive Terhapus ({sampahAset.length})
              </p>
              {sampahAset.length === 0 ? (
                <p className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3 text-[var(--teks-redup)]">
                  Tidak ada file terhapus saat ini.
                </p>
              ) : (
                <ul className="space-y-2">
                  {sampahAset.map((aset) => (
                    <li
                      key={aset.id}
                      className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--teks-utama)] truncate">
                          {aset.namaTampilan}
                        </p>
                        <p className="text-[11px] text-[var(--teks-redup)]">
                          {aset.folderKode} • {formatTanggalWib(aset.uploadedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Tombol
                          varian="sekunder"
                          ukuran="sm"
                          onClick={() => void tanganiPulihkan('aset', aset.id)}
                          ikonKiri={
                            <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" />
                          }
                        >
                          Pulihkan
                        </Tombol>
                        <Tombol
                          varian="halus"
                          ukuran="sm"
                          title="Hapus Permanen"
                          onClick={() =>
                            setTargetHapus({
                              jenis: 'aset',
                              id: aset.id,
                              nama: aset.namaTampilan,
                            })
                          }
                        >
                          <Trash2
                            className="h-3.5 w-3.5 text-[var(--status-bahaya)]"
                            aria-hidden="true"
                          />
                        </Tombol>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Arsip Stakeholder */}
            <div className="space-y-2.5">
              <p className="font-semibold text-[var(--teks-utama)]">
                Data Stakeholder Terhapus ({sampahStakeholder.length})
              </p>
              {sampahStakeholder.length === 0 ? (
                <p className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3 text-[var(--teks-redup)]">
                  Tidak ada rekaman stakeholder di arsip terhapus saat ini.
                </p>
              ) : (
                <ul className="space-y-2">
                  {sampahStakeholder.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--teks-utama)] truncate">
                          {item.namaLengkap}
                        </p>
                        <p className="text-[11px] text-[var(--teks-redup)] truncate">
                          {item.jabatanOrganisasi} • Prioritas {item.prioritas}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Tombol
                          varian="sekunder"
                          ukuran="sm"
                          onClick={() =>
                            void tanganiPulihkan('stakeholder', item.id)
                          }
                          ikonKiri={
                            <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" />
                          }
                        >
                          Pulihkan
                        </Tombol>
                        <Tombol
                          varian="halus"
                          ukuran="sm"
                          title="Hapus Permanen"
                          onClick={() =>
                            setTargetHapus({
                              jenis: 'stakeholder',
                              id: item.id,
                              nama: item.namaLengkap,
                            })
                          }
                        >
                          <Trash2
                            className="h-3.5 w-3.5 text-[var(--status-bahaya)]"
                            aria-hidden="true"
                          />
                        </Tombol>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Kartu>
      )}

      <ModalKonfirmasi
        terbuka={Boolean(targetHapus)}
        onTutup={() => setTargetHapus(null)}
        onKonfirmasi={() => void tanganiHapusPermanen()}
        judul="Konfirmasi Penghapusan Permanen"
        pesan={`Data "${targetHapus?.nama ?? ''}" akan dihapus permanen beserta tautannya dan tidak bisa dipulihkan kembali. Lanjutkan?`}
        labelKonfirmasi="Hapus Permanen"
        berbahaya
        memuat={sedangEksekusiHapus}
      />
    </div>
  );
}
