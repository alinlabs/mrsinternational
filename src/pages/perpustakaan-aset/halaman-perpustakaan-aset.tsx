import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Film,
  FolderOpen,
  Image as ImageIcon,
  Plus,
  Shield,
} from 'lucide-react';
import {
  DAFTAR_FOLDER_DRIVE_KANONIK,
  DAFTAR_KATEGORI_ASET,
  DAFTAR_VISIBILITAS_ASET,
  FILTER_ASET_DEFAULT,
} from '../../data/aset-kanonik';
import { gunakanSesiAplikasi } from '../../hooks/gunakan-sesi-aplikasi';
import {
  ambilAuditDriveApi,
  ambilDaftarAsetApi,
  cekKesehatanDriveApi,
} from '../../services/layanan-aset';
import type {
  AsetDrive,
  EntriAuditDrive,
  FilterAsetDrive,
  KategoriAset,
  KodeFolderDrive,
  StatusKesehatanDrive,
  VisibilitasAset,
} from '../../types/aset';
import {
  dapatkanInfoStatusSinkron,
  dapatkanInfoVisibilitas,
  dapatkanLabelKategoriAset,
  filterDaftarAset,
  formatUkuranBerkas,
  hitungJumlahPerFolder,
} from '../../utils/aset';
import { formatTanggalWib } from '../../utils/format';
import { WadahHalaman } from '../../components/layout/wadah-halaman';
import {
  BilahTabAtas,
  HeaderHalaman,
  InputTeks,
  Kartu,
  KondisiKosong,
  SelectPilihan,
  StatusTeks,
  TabelData,
  Tombol,
  gunakanToast,
} from '../../components/ui';
import type { KolomTabel } from '../../components/ui';
import { KartuKesehatanDrive } from './kartu-kesehatan-drive';
import { PanelDetailAset } from './panel-detail-aset';
import { PanelUnggahAset } from './panel-unggah-aset';

type ModeTampilanAset = 'grid' | 'daftar';

const UKURAN_HALAMAN_ASET = 12;

export default function HalamanPerpustakaanAset() {
  const { sesi, tokenBearer } = gunakanSesiAplikasi();
  const { tampilkanToast } = gunakanToast();

  const [kesehatan, setKesehatan] = useState<StatusKesehatanDrive | null>(null);
  const [sedangCekKesehatan, setSedangCekKesehatan] = useState(false);

  const [daftarAset, setDaftarAset] = useState<AsetDrive[]>([]);
  const [sedangMuatAset, setSedangMuatAset] = useState(false);
  const [daftarAudit, setDaftarAudit] = useState<EntriAuditDrive[]>([]);

  const [modeTampilan, setModeTampilan] = useState<ModeTampilanAset>('grid');
  const [filter, setFilter] = useState<FilterAsetDrive>(FILTER_ASET_DEFAULT);
  const [halamanAktif, setHalamanAktif] = useState(1);
  const [modalUnggahTerbuka, setModalUnggahTerbuka] = useState(false);
  const [asetDipilih, setAsetDipilih] = useState<AsetDrive | null>(null);

  const cekKesehatan = useCallback(async () => {
    setSedangCekKesehatan(true);
    try {
      const resp = await cekKesehatanDriveApi();
      if (resp.ok && resp.data) {
        setKesehatan(resp.data);
      }
    } finally {
      setSedangCekKesehatan(false);
    }
  }, []);

  const muatAsetDanAudit = useCallback(async () => {
    if (!sesi.terautentikasi || !tokenBearer) {
      setDaftarAset([]);
      setDaftarAudit([]);
      return;
    }
    setSedangMuatAset(true);
    try {
      const [respAset, respAudit] = await Promise.all([
        ambilDaftarAsetApi(tokenBearer),
        sesi.peran === 'owner' ||
        sesi.peran === 'admin' ||
        sesi.peran === 'digital-manager'
          ? ambilAuditDriveApi(tokenBearer)
          : Promise.resolve({ ok: false, data: [] as EntriAuditDrive[] }),
      ]);
      if (respAset.ok && respAset.data) {
        setDaftarAset(respAset.data.daftarAset);
      }
      if (respAudit.ok && Array.isArray(respAudit.data)) {
        setDaftarAudit(respAudit.data);
      }
    } finally {
      setSedangMuatAset(false);
    }
  }, [sesi.terautentikasi, sesi.peran, tokenBearer]);

  useEffect(() => {
    void cekKesehatan();
  }, [cekKesehatan]);

  useEffect(() => {
    void muatAsetDanAudit();
  }, [muatAsetDanAudit]);

  const jumlahPerFolder = useMemo(
    () => hitungJumlahPerFolder(daftarAset),
    [daftarAset],
  );

  const asetTersaring = useMemo(
    () => filterDaftarAset(daftarAset, filter),
    [daftarAset, filter],
  );

  const totalHalaman = Math.max(
    1,
    Math.ceil(asetTersaring.length / UKURAN_HALAMAN_ASET),
  );
  const halamanAman = Math.min(halamanAktif, totalHalaman);
  const asetDiHalaman = useMemo(() => {
    const mulai = (halamanAman - 1) * UKURAN_HALAMAN_ASET;
    return asetTersaring.slice(mulai, mulai + UKURAN_HALAMAN_ASET);
  }, [asetTersaring, halamanAman]);

  useEffect(() => {
    setHalamanAktif(1);
  }, [filter, modeTampilan]);

  const filterAktif = Boolean(
    filter.kataKunci.trim() ||
      filter.folderKode !== 'semua' ||
      filter.kategori !== 'semua' ||
      filter.visibility !== 'semua' ||
      filter.sesiShootingId ||
      filter.kontenTertaut.trim() ||
      filter.uploader.trim() ||
      filter.tanggal,
  );

  const bolehUnggah =
    sesi.terautentikasi && sesi.peran !== null && sesi.peran !== 'viewer';

  const kolomTabel: KolomTabel<AsetDrive>[] = [
    {
      kunci: 'nama',
      judul: 'Berkas & Folder',
      render: (aset) => (
        <div className="min-w-[210px]">
          <button
            type="button"
            onClick={() => setAsetDipilih(aset)}
            className="text-left font-medium text-[var(--teks-utama)] hover:text-[var(--aksen-maroon-teks)] cursor-pointer"
          >
            {aset.namaTampilan}
          </button>
          <p className="mt-0.5 text-[11px] font-mono text-[var(--teks-redup)]">
            {aset.folderKode}/{aset.namaAsli}
          </p>
        </div>
      ),
    },
    {
      kunci: 'tipe',
      judul: 'Kategori & Ukuran',
      render: (aset) => (
        <div className="text-xs whitespace-nowrap">
          <p className="font-medium text-[var(--teks-utama)]">
            {dapatkanLabelKategoriAset(aset.kategori)}
          </p>
          <p className="text-[var(--teks-redup)] angka-tabular">
            {formatUkuranBerkas(aset.sizeBytes)}
          </p>
        </div>
      ),
    },
    {
      kunci: 'status',
      judul: 'Status Sinkron & Visibilitas',
      render: (aset) => {
        const infoSinkron = dapatkanInfoStatusSinkron(aset.statusSinkron);
        const infoVis = dapatkanInfoVisibilitas(aset.visibility);
        return (
          <div className="space-y-1">
            <StatusTeks
              labelKustom={infoSinkron.label}
              nadaKustom={infoSinkron.nada}
            />
            <div>
              <StatusTeks
                labelKustom={infoVis.label}
                nadaKustom={infoVis.nada}
              />
            </div>
          </div>
        );
      },
    },
    {
      kunci: 'tautan',
      judul: 'Tautan Konten / Sesi',
      render: (aset) => (
        <div className="text-xs text-[var(--teks-sekunder)]">
          <p>{aset.kontenTertaut.join(', ') || 'Belum ditautkan'}</p>
          {aset.sesiShootingId && (
            <p className="text-[11px] text-[var(--teks-redup)]">
              Sesi: {aset.sesiShootingId}
            </p>
          )}
        </div>
      ),
    },
    {
      kunci: 'uploader',
      judul: 'Pengunggah & Tanggal',
      render: (aset) => (
        <div className="text-xs whitespace-nowrap">
          <p className="text-[var(--teks-utama)]">{aset.uploadedBy}</p>
          <p className="text-[var(--teks-redup)]">
            {formatTanggalWib(aset.uploadedAt)}
          </p>
        </div>
      ),
    },
    {
      kunci: 'aksi',
      judul: 'Aksi',
      perataan: 'kanan',
      render: (aset) => (
        <Tombol
          varian="sekunder"
          ukuran="sm"
          onClick={() => setAsetDipilih(aset)}
        >
          Kelola
        </Tombol>
      ),
    },
  ];

  const folderAktifUnggah: KodeFolderDrive =
    filter.folderKode === 'semua' ? '01_Brief' : filter.folderKode;

  return (
    <div className="flex-1 min-h-0 flex flex-col print:block print:h-auto">
      <BilahTabAtas
        daftarTab={[
          { id: 'grid', label: 'Galeri' },
          { id: 'daftar', label: `Daftar (${asetTersaring.length})` },
        ]}
        tabAktif={modeTampilan}
        onUbahTab={(id) => setModeTampilan(id as ModeTampilanAset)}
        labelNavigasi="Pilih tampilan grid atau daftar aset"
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain print:overflow-visible">
        <WadahHalaman>
          <HeaderHalaman
            labelTahap="8 Folder Google Drive"
            judul="Galeri & Aset Drive"
            tujuan="Simpan foto, video, dan dokumen dalam 8 folder terstruktur di Google Drive."
            aksiUtama={
              <Tombol
                varian="primer"
                ukuran="sm"
                disabled={!bolehUnggah}
                ikonKiri={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => setModalUnggahTerbuka(true)}
              >
                Unggah / Daftarkan Aset
              </Tombol>
            }
          />

          <div className="space-y-8 pb-8">
        <KartuKesehatanDrive
          kesehatan={kesehatan}
          sedangCek={sedangCekKesehatan}
          onUjiKoneksi={() => {
            void cekKesehatan();
            tampilkanToast({
              jenis: 'info',
              judul: 'Pemeriksaan kesehatan Drive dijalankan',
            });
          }}
        />

        <Kartu
          judul="8 Folder Proyek"
          subjudul="Pilih folder untuk menyaring file."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() =>
                setFilter((prev) => ({ ...prev, folderKode: 'semua' }))
              }
              aria-pressed={filter.folderKode === 'semua'}
              className={`rounded-[var(--radius-sm)] border p-2.5 text-left cursor-pointer ${
                filter.folderKode === 'semua'
                  ? 'border-[var(--aksen-maroon-garis)]/60 bg-[var(--aksen-maroon-lembut)]/80'
                  : 'border-[var(--garis-halus)] bg-[var(--bg-permukaan)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <p className="text-[11px] font-semibold text-[var(--aksen-maroon-teks)]">
                Semua Folder
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--teks-utama)] angka-tabular">
                {daftarAset.length}
              </p>
            </button>

            {DAFTAR_FOLDER_DRIVE_KANONIK.map((folder) => {
              const aktif = filter.folderKode === folder.kode;
              return (
                <button
                  key={folder.kode}
                  type="button"
                  title={folder.deskripsi}
                  onClick={() =>
                    setFilter((prev) => ({ ...prev, folderKode: folder.kode }))
                  }
                  aria-pressed={aktif}
                  className={`rounded-[var(--radius-sm)] border p-2.5 text-left cursor-pointer ${
                    aktif
                      ? 'border-[var(--aksen-maroon-garis)]/60 bg-[var(--aksen-maroon-lembut)]/80'
                      : 'border-[var(--garis-halus)] bg-[var(--bg-permukaan)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--teks-utama)] truncate">
                    <FolderOpen
                      className="h-3.5 w-3.5 text-[var(--aksen-emas)] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">{folder.nama}</span>
                  </div>
                  <p className="mt-1 text-base font-semibold text-[var(--teks-utama)] angka-tabular">
                    {jumlahPerFolder[folder.kode] ?? 0}
                  </p>
                </button>
              );
            })}
          </div>
        </Kartu>

        <Kartu>
          <p className="text-xs text-[var(--teks-redup)]">
            Menampilkan{' '}
            <strong className="font-semibold text-[var(--teks-utama)] angka-tabular">
              {asetTersaring.length}
            </strong>{' '}
            aset sesuai izin peran
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <InputTeks
              label="Cari Nama File / Tag"
              placeholder="Cari nama file atau tag..."
              value={filter.kataKunci}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, kataKunci: e.target.value }))
              }
            />

            <SelectPilihan
              label="Kategori"
              value={filter.kategori}
              opsi={[
                { nilai: 'semua', label: 'Semua Kategori' },
                ...DAFTAR_KATEGORI_ASET,
              ]}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  kategori: e.target.value as KategoriAset | 'semua',
                }))
              }
            />

            <SelectPilihan
              label="Visibilitas"
              value={filter.visibility}
              opsi={[
                { nilai: 'semua', label: 'Semua Visibilitas' },
                ...DAFTAR_VISIBILITAS_ASET,
              ]}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  visibility: e.target.value as VisibilitasAset | 'semua',
                }))
              }
            />

            <SelectPilihan
              label="Sesi Shooting"
              value={filter.sesiShootingId}
              placeholderOpsi="Semua Sesi"
              opsi={[
                { nilai: 'shoot-hari-1', label: 'Hari 1 (Iklan) — 25 Nov 2026' },
                { nilai: 'shoot-hari-2', label: 'Hari 2 (Short Konten 1) — 30 Nov 2026' },
                { nilai: 'shoot-hari-3', label: 'Hari 3 (Short Konten 2) — 3 Des 2026' },
                { nilai: 'pra-event', label: 'Pra-Event' },
              ]}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  sesiShootingId: e.target.value,
                }))
              }
            />
          </div>

          {filterAktif && (
            <div className="mt-3 flex justify-end">
              <Tombol
                varian="halus"
                ukuran="sm"
                onClick={() => setFilter(FILTER_ASET_DEFAULT)}
              >
                Atur Ulang Filter
              </Tombol>
            </div>
          )}
        </Kartu>

        {!sesi.terautentikasi ? (
          <KondisiKosong
            judul="Aktifkan sesi kerja untuk melihat daftar file"
            deskripsi="Masukkan kode akses tim pada kartu Akses Tim di atas."
          />
        ) : sedangMuatAset ? (
          <Kartu>
            <p className="text-xs text-[var(--teks-redup)] py-6 text-center">
              Memuat daftar aset dari server...
            </p>
          </Kartu>
        ) : asetTersaring.length === 0 ? (
          <KondisiKosong
            judul={
              filterAktif
                ? 'Tidak ada aset yang cocok dengan filter'
                : 'Belum ada berkas aset yang tercatat'
            }
            deskripsi={
              filterAktif
                ? 'Ubah filter pencarian atau pilih "Semua Folder".'
                : 'Unggah berkas kecil (<= 4 MB) atau daftarkan metadata video besar melalui tombol Unggah / Daftarkan Aset.'
            }
            aksi={
              bolehUnggah ? (
                <Tombol
                  varian="primer"
                  ukuran="sm"
                  onClick={() => setModalUnggahTerbuka(true)}
                >
                  Unggah / Daftarkan Aset Pertama
                </Tombol>
              ) : undefined
            }
          />
        ) : modeTampilan === 'grid' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {asetDiHalaman.map((aset) => {
                const infoSinkron = dapatkanInfoStatusSinkron(aset.statusSinkron);
                const infoVis = dapatkanInfoVisibilitas(aset.visibility);
                return (
                  <article
                    key={aset.id}
                    style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                    className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 p-4 flex flex-col justify-between gap-3 shadow-[var(--bayangan-halus)]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[11px] font-semibold text-[var(--aksen-maroon-teks)]">
                          {aset.folderKode}
                        </span>
                        <StatusTeks
                          labelKustom={infoVis.label}
                          nadaKustom={infoVis.nada}
                        />
                      </div>

                      <div className="flex items-start gap-2.5">
                        {aset.mimeType.startsWith('image/') ? (
                          <ImageIcon
                            className="h-5 w-5 text-[var(--aksen-maroon-teks)] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        ) : aset.mimeType.startsWith('video/') ? (
                          <Film
                            className="h-5 w-5 text-[var(--aksen-maroon-teks)] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        ) : (
                          <FileText
                            className="h-5 w-5 text-[var(--aksen-emas)] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setAsetDipilih(aset)}
                            className="text-left text-sm font-semibold text-[var(--teks-utama)] hover:text-[var(--aksen-maroon-teks)] leading-snug cursor-pointer"
                          >
                            {aset.namaTampilan}
                          </button>
                          <p className="mt-0.5 text-[11px] font-mono text-[var(--teks-redup)] truncate">
                            {aset.namaAsli}
                          </p>
                        </div>
                      </div>

                      <StatusTeks
                        labelKustom={infoSinkron.label}
                        nadaKustom={infoSinkron.nada}
                      />

                      <div className="text-xs text-[var(--teks-sekunder)] space-y-0.5">
                        <p>
                          {dapatkanLabelKategoriAset(aset.kategori)} •{' '}
                          <span className="angka-tabular">
                            {formatUkuranBerkas(aset.sizeBytes)}
                          </span>
                        </p>
                        <p className="text-[11px] text-[var(--teks-redup)]">
                          Pengunggah: {aset.uploadedBy} •{' '}
                          {formatTanggalWib(aset.uploadedAt)}
                        </p>
                        {aset.kontenTertaut.length > 0 && (
                          <p className="text-[11px] text-[var(--teks-sekunder)]">
                            Konten tertaut: {aset.kontenTertaut.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--garis-halus)] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--teks-redup)] truncate">
                        {aset.tags.length > 0
                          ? aset.tags.map((t) => `#${t}`).join(' ')
                          : 'Tanpa tag'}
                      </span>
                      <Tombol
                        varian="sekunder"
                        ukuran="sm"
                        onClick={() => setAsetDipilih(aset)}
                      >
                        Detail &amp; Edit
                      </Tombol>
                    </div>
                  </article>
                );
              })}
            </div>
            {totalHalaman > 1 && (
              <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] px-3.5 py-2.5 text-xs">
                <span className="text-[var(--teks-redup)] angka-tabular">
                  Halaman {halamanAman} dari {totalHalaman} ({asetTersaring.length} aset)
                </span>
                <div className="flex items-center gap-2">
                  <Tombol
                    varian="sekunder"
                    ukuran="sm"
                    disabled={halamanAman <= 1}
                    onClick={() => setHalamanAktif((h) => Math.max(1, h - 1))}
                  >
                    Sebelumnya
                  </Tombol>
                  <Tombol
                    varian="sekunder"
                    ukuran="sm"
                    disabled={halamanAman >= totalHalaman}
                    onClick={() =>
                      setHalamanAktif((h) => Math.min(totalHalaman, h + 1))
                    }
                  >
                    Berikutnya
                  </Tombol>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <TabelData
              keteranganTabel="Daftar aset proyek Ragi Hotang di Google Drive"
              kolom={kolomTabel}
              data={asetDiHalaman}
              kunciBaris={(aset) => aset.id}
              filterAktif={filterAktif}
            />
            {totalHalaman > 1 && (
              <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] px-3.5 py-2.5 text-xs">
                <span className="text-[var(--teks-redup)] angka-tabular">
                  Halaman {halamanAman} dari {totalHalaman} ({asetTersaring.length} aset)
                </span>
                <div className="flex items-center gap-2">
                  <Tombol
                    varian="sekunder"
                    ukuran="sm"
                    disabled={halamanAman <= 1}
                    onClick={() => setHalamanAktif((h) => Math.max(1, h - 1))}
                  >
                    Sebelumnya
                  </Tombol>
                  <Tombol
                    varian="sekunder"
                    ukuran="sm"
                    disabled={halamanAman >= totalHalaman}
                    onClick={() =>
                      setHalamanAktif((h) => Math.min(totalHalaman, h + 1))
                    }
                  >
                    Berikutnya
                  </Tombol>
                </div>
              </div>
            )}
          </div>
        )}

        {sesi.terautentikasi &&
          (sesi.peran === 'owner' ||
            sesi.peran === 'admin' ||
            sesi.peran === 'digital-manager') && (
            <Kartu
              judul="Riwayat Aktivitas File"
              subjudul="Catatan unggahan dan perubahan file terbaru."
              aksiHeader={
                <span className="inline-flex items-center gap-1 text-xs text-[var(--teks-redup)]">
                  <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="angka-tabular">{daftarAudit.length} catatan</span>
                </span>
              }
            >
              {daftarAudit.length === 0 ? (
                <p className="text-xs text-[var(--teks-redup)]">
                  Belum ada aktivitas file tercatat.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--garis-halus)] text-xs">
                  {daftarAudit.slice(0, 10).map((entri) => (
                    <li
                      key={entri.id}
                      className="py-2 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <div>
                        <span className="font-semibold text-[var(--teks-utama)]">
                          {entri.aksi}
                        </span>{' '}
                        <span className="text-[var(--teks-sekunder)]">
                          ({entri.target})
                        </span>{' '}
                        — <span className="text-[var(--teks-redup)]">{entri.ringkasan}</span>
                      </div>
                      <span className="text-[11px] text-[var(--teks-redup)] whitespace-nowrap">
                        {entri.aktor} ({entri.peran}) • {entri.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Kartu>
          )}
          </div>
        </WadahHalaman>
      </div>

      <PanelUnggahAset
        terbuka={modalUnggahTerbuka}
        onTutup={() => setModalUnggahTerbuka(false)}
        tokenBearer={tokenBearer}
        kesehatan={kesehatan}
        folderDefault={folderAktifUnggah}
        onSelesaiTambah={() => {
          void muatAsetDanAudit();
          tampilkanToast({
            jenis: 'sukses',
            judul: 'Aset ditambahkan ke perpustakaan',
          });
        }}
      />

      <PanelDetailAset
        aset={asetDipilih}
        tokenBearer={tokenBearer}
        peran={sesi.peran}
        onTutup={() => setAsetDipilih(null)}
        onDiperbarui={(asetBaru) => {
          setAsetDipilih(asetBaru);
          void muatAsetDanAudit();
          tampilkanToast({
            jenis: 'sukses',
            judul: 'Metadata aset diperbarui',
          });
        }}
        onTerhapus={() => {
          setAsetDipilih(null);
          void muatAsetDanAudit();
          tampilkanToast({
            jenis: 'info',
            judul: 'Aset dihapus dari daftar',
          });
        }}
      />
    </div>
  );
}
