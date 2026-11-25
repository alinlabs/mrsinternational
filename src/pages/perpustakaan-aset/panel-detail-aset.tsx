import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ExternalLink,
  FileText,
  Film,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import {
  DAFTAR_FOLDER_DRIVE_KANONIK,
  DAFTAR_KATEGORI_ASET,
  DAFTAR_VISIBILITAS_ASET,
} from '../../data/aset-kanonik';
import { gunakanKalenderKonten } from '../../hooks/gunakan-kalender-konten';
import { gunakanProduksi } from '../../hooks/gunakan-produksi';
import {
  hapusAsetApi,
  perbaruiMetadataAsetApi,
} from '../../services/layanan-aset';
import type {
  AsetDrive,
  KategoriAset,
  KodeFolderDrive,
  VisibilitasAset,
} from '../../types/aset';
import type { PeranPengguna } from '../../types/status';
import {
  apakahUrlEksternalAman,
  dapatkanInfoStatusSinkron,
  dapatkanInfoVisibilitas,
  dapatkanLabelKategoriAset,
  formatUkuranBerkas,
} from '../../utils/aset';
import { formatTanggalWib } from '../../utils/format';
import {
  AreaTeks,
  InputTeks,
  ModalKonfirmasi,
  PanelSamping,
  SelectPilihan,
  StatusTeks,
  Tombol,
} from '../../components/ui';

export interface PanelDetailAsetProps {
  aset: AsetDrive | null;
  tokenBearer: string | null;
  peran: PeranPengguna | null;
  onTutup: () => void;
  onDiperbarui: (asetBaru: AsetDrive) => void;
  onTerhapus: (idAset: string) => void;
}

export function PanelDetailAset({
  aset,
  tokenBearer,
  peran,
  onTutup,
  onDiperbarui,
  onTerhapus,
}: PanelDetailAsetProps) {
  const { daftarKonten } = gunakanKalenderKonten();
  const { stateProduksi } = gunakanProduksi();

  const [namaTampilan, setNamaTampilan] = useState('');
  const [folderKode, setFolderKode] = useState<KodeFolderDrive>('01_Brief');
  const [kategori, setKategori] = useState<KategoriAset>('document');
  const [visibility, setVisibility] = useState<VisibilitasAset>('internal');
  const [tagsTeks, setTagsTeks] = useState('');
  const [kontenTertaut, setKontenTertaut] = useState('');
  const [tugasTertaut, setTugasTertaut] = useState('');
  const [sesiShootingId, setSesiShootingId] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [catatan, setCatatan] = useState('');
  const [galat, setGalat] = useState('');
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [modalHapusTerbuka, setModalHapusTerbuka] = useState(false);
  const [sedangHapus, setSedangHapus] = useState(false);

  useEffect(() => {
    if (!aset) return;
    setNamaTampilan(aset.namaTampilan);
    setFolderKode(aset.folderKode);
    setKategori(aset.kategori);
    setVisibility(aset.visibility);
    setTagsTeks(aset.tags.join(', '));
    setKontenTertaut(aset.kontenTertaut[0] ?? '');
    setTugasTertaut(aset.tugasTertaut[0] ?? '');
    setSesiShootingId(aset.sesiShootingId);
    setDriveUrl(aset.driveUrl);
    setCatatan(aset.catatan);
    setGalat('');
  }, [aset]);

  const bolehEdit = peran !== null && peran !== 'viewer';
  const bolehHapus = peran === 'owner' || peran === 'admin';

  const tanganiSimpan = async (e: FormEvent) => {
    e.preventDefault();
    if (!aset) return;
    setGalat('');
    setSedangSimpan(true);

    const respons = await perbaruiMetadataAsetApi(tokenBearer, aset.id, {
      namaTampilan,
      folderKode,
      kategori,
      visibility,
      tags: tagsTeks
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      kontenTertaut: kontenTertaut ? [kontenTertaut] : [],
      tugasTertaut: tugasTertaut ? [tugasTertaut] : [],
      sesiShootingId:
        sesiShootingId === 'shoot-hari-1' ||
        sesiShootingId === 'shoot-hari-2' ||
        sesiShootingId === 'shoot-hari-3' ||
        sesiShootingId === 'pra-event'
          ? sesiShootingId
          : '',
      driveUrl,
      catatan,
    });

    setSedangSimpan(false);

    if (!respons.ok || !respons.data) {
      setGalat(respons.error?.message ?? 'Gagal menyimpan pembaruan metadata.');
      return;
    }

    onDiperbarui(respons.data);
  };

  const tanganiKonfirmasiHapus = async () => {
    if (!aset) return;
    setSedangHapus(true);
    const respons = await hapusAsetApi(tokenBearer, aset.id);
    setSedangHapus(false);
    setModalHapusTerbuka(false);

    if (!respons.ok) {
      setGalat(respons.error?.message ?? 'Gagal menghapus aset.');
      return;
    }

    onTerhapus(aset.id);
  };

  const infoSinkron = aset
    ? dapatkanInfoStatusSinkron(aset.statusSinkron)
    : null;
  const infoVis = aset ? dapatkanInfoVisibilitas(aset.visibility) : null;

  return (
    <>
      <PanelSamping
        terbuka={Boolean(aset)}
        onTutup={onTutup}
        judul={aset ? aset.namaTampilan : 'Detail Aset'}
        subjudul={
          aset
            ? `${aset.folderKode} • ${formatUkuranBerkas(aset.sizeBytes)} • ${dapatkanLabelKategoriAset(aset.kategori)}`
            : undefined
        }
        footer={
          aset && (
            <div className="w-full flex items-center justify-between gap-2">
              {bolehHapus ? (
                <Tombol
                  varian="bahaya"
                  ukuran="sm"
                  ikonKiri={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setModalHapusTerbuka(true)}
                >
                  Hapus
                </Tombol>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <Tombol varian="sekunder" ukuran="sm" onClick={onTutup}>
                  Tutup
                </Tombol>
                {bolehEdit && (
                  <Tombol
                    type="submit"
                    form="form-detail-aset"
                    varian="primer"
                    ukuran="sm"
                    memuat={sedangSimpan}
                  >
                    Simpan Metadata
                  </Tombol>
                )}
              </div>
            </div>
          )
        }
      >
        {aset && (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                {infoSinkron && (
                  <StatusTeks
                    labelKustom={infoSinkron.label}
                    nadaKustom={infoSinkron.nada}
                  />
                )}
                {infoVis && (
                  <StatusTeks
                    labelKustom={infoVis.label}
                    nadaKustom={infoVis.nada}
                  />
                )}
              </div>

              <div className="flex items-center gap-3 py-2 border-y border-[var(--garis-halus)]">
                {aset.mimeType.startsWith('image/') ? (
                  <ImageIcon
                    className="h-8 w-8 text-[var(--aksen-maroon-teks)] shrink-0"
                    aria-hidden="true"
                  />
                ) : aset.mimeType.startsWith('video/') ? (
                  <Film
                    className="h-8 w-8 text-[var(--aksen-maroon-teks)] shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <FileText
                    className="h-8 w-8 text-[var(--aksen-emas)] shrink-0"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0 flex-1 text-xs space-y-0.5">
                  <p className="font-mono font-medium text-[var(--teks-utama)] truncate">
                    {aset.namaAsli}
                  </p>
                  <p className="text-[var(--teks-redup)]">
                    MIME: {aset.mimeType} • Diunggah oleh {aset.uploadedBy} (
                    {formatTanggalWib(aset.uploadedAt)})
                  </p>
                  <p className="text-[var(--teks-redup)]">
                    Drive File ID:{' '}
                    <code className="font-mono text-[var(--teks-utama)]">
                      {aset.driveFileId || 'Belum ada (unggah eksternal)'}
                    </code>
                  </p>
                </div>
              </div>

              {apakahUrlEksternalAman(aset.driveUrl) ? (
                <a
                  href={aset.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--aksen-maroon-teks)] hover:underline"
                >
                  Buka Pratinjau Terkontrol di Google Drive
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <p className="text-[11px] text-[var(--teks-redup)]">
                  Tautan pratinjau Google Drive belum tersedia (berkas internal hanya
                  dibagikan ke peran yang berwenang).
                </p>
              )}
            </div>

            {galat && (
              <p
                role="alert"
                className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
              >
                {galat}
              </p>
            )}

            <form
              id="form-detail-aset"
              noValidate
              onSubmit={tanganiSimpan}
              className="space-y-3"
            >
              <InputTeks
                label="Nama Tampilan"
                disabled={!bolehEdit}
                value={namaTampilan}
                onChange={(e) => setNamaTampilan(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectPilihan
                  label="Folder Virtual"
                  disabled={!bolehEdit}
                  value={folderKode}
                  opsi={DAFTAR_FOLDER_DRIVE_KANONIK.map((f) => ({
                    nilai: f.kode,
                    label: f.nama,
                  }))}
                  onChange={(e) =>
                    setFolderKode(e.target.value as KodeFolderDrive)
                  }
                />

                <SelectPilihan
                  label="Kategori"
                  disabled={!bolehEdit}
                  value={kategori}
                  opsi={DAFTAR_KATEGORI_ASET}
                  onChange={(e) => setKategori(e.target.value as KategoriAset)}
                />
              </div>

              <SelectPilihan
                label="Visibilitas & Hak Akses (Privat Secara Default)"
                disabled={!bolehEdit}
                value={visibility}
                opsi={DAFTAR_VISIBILITAS_ASET}
                onChange={(e) =>
                  setVisibility(e.target.value as VisibilitasAset)
                }
              />

              <InputTeks
                label="Tag (pisahkan koma)"
                disabled={!bolehEdit}
                value={tagsTeks}
                onChange={(e) => setTagsTeks(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectPilihan
                  label="Konten Kalender Tertaut"
                  disabled={!bolehEdit}
                  value={kontenTertaut}
                  placeholderOpsi="Tidak ditautkan"
                  opsi={daftarKonten.map((k) => ({
                    nilai: k.id,
                    label: `${k.tanggal} — ${k.judul.slice(0, 30)}`,
                  }))}
                  onChange={(e) => setKontenTertaut(e.target.value)}
                />

                <SelectPilihan
                  label="Tugas Produksi Tertaut"
                  disabled={!bolehEdit}
                  value={tugasTertaut}
                  placeholderOpsi="Tidak ditautkan"
                  opsi={stateProduksi.daftarTugas.map((t) => ({
                    nilai: t.id,
                    label: `${t.id}: ${t.judul.slice(0, 28)}`,
                  }))}
                  onChange={(e) => setTugasTertaut(e.target.value)}
                />
              </div>

              <SelectPilihan
                label="Sesi Shooting"
                disabled={!bolehEdit}
                value={sesiShootingId}
                placeholderOpsi="Pilih sesi"
                opsi={[
                  { nilai: 'shoot-hari-1', label: 'Shooting Hari 1 — Iklan (25 Nov)' },
                  { nilai: 'shoot-hari-2', label: 'Shooting Hari 2 — Short Konten 1 (30 Nov)' },
                  { nilai: 'shoot-hari-3', label: 'Shooting Hari 3 — Short Konten 2 (3 Des)' },
                  { nilai: 'pra-event', label: 'Pra-Event / Administrasi' },
                ]}
                onChange={(e) => setSesiShootingId(e.target.value)}
              />

              <InputTeks
                label="Tautan Google Drive (Opsional)"
                disabled={!bolehEdit}
                value={driveUrl}
                placeholder="https://drive.google.com/file/d/..."
                onChange={(e) => setDriveUrl(e.target.value)}
              />

              <AreaTeks
                label="Catatan"
                disabled={!bolehEdit}
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </form>
          </div>
        )}
      </PanelSamping>

      <ModalKonfirmasi
        terbuka={modalHapusTerbuka}
        onTutup={() => setModalHapusTerbuka(false)}
        onKonfirmasi={() => void tanganiKonfirmasiHapus()}
        judul="Hapus aset dari daftar proyek?"
        pesan={
          aset?.driveFileId
            ? 'Berkas akan dipindahkan ke Trash di Google Drive dan dihapus dari daftar perpustakaan aset.'
            : 'Metadata aset menunggu sinkronisasi akan dihapus dari daftar.'
        }
        labelKonfirmasi="Ya, hapus aset"
        memuat={sedangHapus}
        berbahaya
      />
    </>
  );
}
