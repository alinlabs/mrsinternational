import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  HardDriveUpload,
  RefreshCw,
  Upload,
  XCircle,
} from 'lucide-react';
import {
  DAFTAR_FOLDER_DRIVE_KANONIK,
  DAFTAR_KATEGORI_ASET,
} from '../../data/aset-kanonik';
import { gunakanKalenderKonten } from '../../hooks/gunakan-kalender-konten';
import { gunakanProduksi } from '../../hooks/gunakan-produksi';
import {
  bacaFileKeBase64,
  daftarkanAsetEksternalApi,
  unggahAsetKecilDenganProgres,
} from '../../services/layanan-aset';
import type {
  AsetDrive,
  KategoriAset,
  KodeFolderDrive,
  StatusKesehatanDrive,
} from '../../types/aset';
import {
  apakahUrlEksternalAman,
  formatUkuranBerkas,
  tebakKategoriDariMime,
} from '../../utils/aset';
import {
  AreaTeks,
  InputTeks,
  ModalDialog,
  SelectPilihan,
  Tombol,
} from '../../components/ui';

export interface PanelUnggahAsetProps {
  terbuka: boolean;
  onTutup: () => void;
  tokenBearer: string | null;
  kesehatan: StatusKesehatanDrive | null;
  folderDefault: KodeFolderDrive;
  onSelesaiTambah: (aset: AsetDrive) => void;
}

type ModeUnggah = 'proxy-kecil' | 'fallback-eksternal';

const MIME_DITERIMA_INPUT = '.jpg,.jpeg,.png,.webp,.pdf,.mp4';

export function PanelUnggahAset({
  terbuka,
  onTutup,
  tokenBearer,
  kesehatan,
  folderDefault,
  onSelesaiTambah,
}: PanelUnggahAsetProps) {
  const { daftarKonten } = gunakanKalenderKonten();
  const { stateProduksi } = gunakanProduksi();

  const [mode, setMode] = useState<ModeUnggah>('proxy-kecil');
  const [folderKode, setFolderKode] = useState<KodeFolderDrive>(folderDefault);
  const [kategori, setKategori] = useState<KategoriAset>('image');
  const [namaTampilan, setNamaTampilan] = useState('');
  const [tagsTeks, setTagsTeks] = useState('');
  const [kontenTertaut, setKontenTertaut] = useState('');
  const [tugasTertaut, setTugasTertaut] = useState('');
  const [sesiShootingId, setSesiShootingId] = useState('');
  const [catatan, setCatatan] = useState('');

  // State khusus mode proxy-kecil
  const [fileDipilih, setFileDipilih] = useState<File | null>(null);
  const [sedangMenarikDrop, setSedangMenarikDrop] = useState(false);
  const [progresPersen, setProgresPersen] = useState(0);
  const [sedangMengunggah, setSedangMengunggah] = useState(false);
  const [galatUpload, setGalatUpload] = useState('');
  const [bisaRetry, setBisaRetry] = useState(false);
  const [asetBerhasil, setAsetBerhasil] = useState<AsetDrive | null>(null);
  const idempotencyKeyRef = useRef<string>('');
  const batalkanXhrRef = useRef<(() => void) | null>(null);

  // State khusus mode fallback-eksternal
  const [namaFileManual, setNamaFileManual] = useState('');
  const [ukuranMbManual, setUkuranMbManual] = useState('');
  const [tautanDriveManual, setTautanDriveManual] = useState('');
  const [galatManual, setGalatManual] = useState('');
  const [sedangSimpanManual, setSedangSimpanManual] = useState(false);

  const batasBytes = kesehatan?.batasUploadBytes ?? 4 * 1024 * 1024;

  const pilihBerkas = (file: File | null) => {
    setGalatUpload('');
    setAsetBerhasil(null);
    setBisaRetry(false);
    setProgresPersen(0);
    setFileDipilih(file);
    if (!file) return;

    idempotencyKeyRef.current = `up-${Date.now()}-${file.name}-${file.size}`;
    setNamaTampilan(file.name);
    setKategori(tebakKategoriDariMime(file.type, folderKode));
  };

  const tanganiDrop = (ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setSedangMenarikDrop(false);
    const file = ev.dataTransfer.files?.[0] ?? null;
    pilihBerkas(file);
  };

  const jalankanUploadProxy = async () => {
    if (!fileDipilih) {
      setGalatUpload('Pilih berkas yang ingin diunggah terlebih dahulu.');
      return;
    }

    if (fileDipilih.size > batasBytes) {
      setGalatUpload(
        `Ukuran berkas (${formatUkuranBerkas(fileDipilih.size)}) melampaui batas proxy aman (${formatUkuranBerkas(batasBytes)}). Alihkan ke Fallback Unggah Eksternal untuk video besar.`,
      );
      return;
    }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `up-${Date.now()}-${fileDipilih.name}-${fileDipilih.size}`;
    }

    setGalatUpload('');
    setBisaRetry(false);
    setSedangMengunggah(true);
    setProgresPersen(5);

    try {
      const base64Content = await bacaFileKeBase64(fileDipilih);
      const respons = await unggahAsetKecilDenganProgres({
        tokenBearer,
        file: fileDipilih,
        base64Content,
        namaTampilan: namaTampilan.trim() || fileDipilih.name,
        folderKode,
        kategori,
        tags: tagsTeks
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        kontenTertaut: kontenTertaut ? [kontenTertaut] : [],
        tugasTertaut: tugasTertaut ? [tugasTertaut] : [],
        sesiShootingId,
        catatan,
        idempotencyKey: idempotencyKeyRef.current,
        onProgres: (persen) => setProgresPersen(persen),
        onSediakanBatal: (fn) => {
          batalkanXhrRef.current = fn;
        },
      });

      if (!respons.ok || !respons.data?.driveFileId) {
        setProgresPersen(0);
        setBisaRetry(Boolean(respons.error?.retryable));
        setGalatUpload(
          respons.error?.message ??
            'Unggahan tidak menghasilkan Drive File ID yang valid.',
        );
        return;
      }

      setAsetBerhasil(respons.data);
      onSelesaiTambah(respons.data);
    } catch (err) {
      setProgresPersen(0);
      if (err instanceof Error && err.message === 'DIBATALKAN_PENGGUNA') {
        setGalatUpload('Unggahan dibatalkan oleh pengguna.');
      } else {
        setBisaRetry(true);
        setGalatUpload(
          err instanceof Error
            ? err.message
            : 'Terjadi kegagalan jaringan saat mengunggah.',
        );
      }
    } finally {
      setSedangMengunggah(false);
      batalkanXhrRef.current = null;
    }
  };

  const alihkanKeFallbackDenganBerkas = () => {
    if (fileDipilih) {
      setNamaFileManual(fileDipilih.name);
      setNamaTampilan(fileDipilih.name);
      setUkuranMbManual((fileDipilih.size / (1024 * 1024)).toFixed(1));
      setKategori(
        fileDipilih.type.startsWith('video/')
          ? folderKode === '03_Interview_Raw' || folderKode === '04_Broll'
            ? 'raw-video'
            : 'edited-video'
          : tebakKategoriDariMime(fileDipilih.type, folderKode),
      );
    }
    setMode('fallback-eksternal');
  };

  const tanganiSubmitManual = async (e: FormEvent) => {
    e.preventDefault();
    setGalatManual('');

    if (!namaFileManual.trim()) {
      setGalatManual('Nama file standar proyek wajib diisi.');
      return;
    }

    setSedangSimpanManual(true);
    const ukuranNum = Number(ukuranMbManual);
    const sizeBytes =
      Number.isFinite(ukuranNum) && ukuranNum > 0
        ? Math.round(ukuranNum * 1024 * 1024)
        : 0;

    const respons = await daftarkanAsetEksternalApi({
      tokenBearer,
      namaFile: namaFileManual.trim(),
      namaTampilan: namaTampilan.trim() || namaFileManual.trim(),
      folderKode,
      kategori,
      mimeType: kategori.includes('video') ? 'video/mp4' : 'application/octet-stream',
      sizeBytes,
      driveUrl: tautanDriveManual.trim(),
      tags: tagsTeks
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      kontenTertaut: kontenTertaut ? [kontenTertaut] : [],
      tugasTertaut: tugasTertaut ? [tugasTertaut] : [],
      sesiShootingId,
      catatan,
      idempotencyKey: `manual-${Date.now()}-${namaFileManual.trim()}`,
    });

    setSedangSimpanManual(false);

    if (!respons.ok || !respons.data) {
      setGalatManual(
        respons.error?.message ?? 'Gagal mendaftarkan metadata aset eksternal.',
      );
      return;
    }

    onSelesaiTambah(respons.data);
    onTutup();
  };

  return (
    <ModalDialog
      terbuka={terbuka}
      onTutup={onTutup}
      judul="Unggah Aset / Daftarkan Metadata Drive"
      deskripsi={`Batas proxy langsung saat ini: ${formatUkuranBerkas(batasBytes)} (JPG, PNG, WebP, PDF, MP4). Sukses hanya dicatat bila Google Drive File ID diterima.`}
      ukuran="lg"
    >
      <div className="space-y-4">
        <div
          className="flex flex-wrap gap-2 pb-3 border-b border-[var(--garis-halus)]"
          role="group"
          aria-label="Pilih jalur unggah aset"
        >
          <Tombol
            varian={mode === 'proxy-kecil' ? 'primer' : 'sekunder'}
            ukuran="sm"
            className="!transition-none"
            ikonKiri={<Upload className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={() => setMode('proxy-kecil')}
            aria-pressed={mode === 'proxy-kecil'}
          >
            Unggah Langsung (&le; {formatUkuranBerkas(batasBytes)})
          </Tombol>
          <Tombol
            varian={mode === 'fallback-eksternal' ? 'primer' : 'sekunder'}
            ukuran="sm"
            className="!transition-none"
            ikonKiri={
              <HardDriveUpload className="h-3.5 w-3.5" aria-hidden="true" />
            }
            onClick={() => setMode('fallback-eksternal')}
            aria-pressed={mode === 'fallback-eksternal'}
          >
            Fallback Unggah Eksternal (Video Besar)
          </Tombol>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectPilihan
            label="Folder Virtual Tujuan"
            value={folderKode}
            opsi={DAFTAR_FOLDER_DRIVE_KANONIK.map((f) => ({
              nilai: f.kode,
              label: f.nama,
            }))}
            onChange={(e) => setFolderKode(e.target.value as KodeFolderDrive)}
          />

          <SelectPilihan
            label="Kategori Aset"
            value={kategori}
            opsi={DAFTAR_KATEGORI_ASET}
            onChange={(e) => setKategori(e.target.value as KategoriAset)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputTeks
            label="Nama Tampilan Manusiawi"
            value={namaTampilan}
            placeholder="Mis. Thumbnail Hero Ad Melfarina"
            onChange={(e) => setNamaTampilan(e.target.value)}
          />

          <InputTeks
            label="Tag (pisahkan koma)"
            value={tagsTeks}
            placeholder="Mis. hero-ad, 9:16, melfarina"
            onChange={(e) => setTagsTeks(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectPilihan
            label="Tautkan Konten Kalender"
            value={kontenTertaut}
            placeholderOpsi="Tidak ditautkan"
            opsi={daftarKonten.map((k) => ({
              nilai: k.id,
              label: `${k.tanggal} — ${k.judul.slice(0, 32)}`,
            }))}
            onChange={(e) => setKontenTertaut(e.target.value)}
          />

          <SelectPilihan
            label="Tautkan Tugas Produksi"
            value={tugasTertaut}
            placeholderOpsi="Tidak ditautkan"
            opsi={stateProduksi.daftarTugas.map((t) => ({
              nilai: t.id,
              label: `${t.id}: ${t.judul.slice(0, 32)}`,
            }))}
            onChange={(e) => setTugasTertaut(e.target.value)}
          />

          <SelectPilihan
            label="Sesi Shooting"
            value={sesiShootingId}
            placeholderOpsi="Pilih sesi (opsional)"
            opsi={[
              { nilai: 'shoot-hari-1', label: 'Shooting Hari 1 — Iklan (25 Nov)' },
              { nilai: 'shoot-hari-2', label: 'Shooting Hari 2 — Short Konten 1 (30 Nov)' },
              { nilai: 'shoot-hari-3', label: 'Shooting Hari 3 — Short Konten 2 (3 Des)' },
              { nilai: 'pra-event', label: 'Pra-Event / Administrasi' },
            ]}
            onChange={(e) => setSesiShootingId(e.target.value)}
          />
        </div>

        {mode === 'proxy-kecil' ? (
          <div className="space-y-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setSedangMenarikDrop(true);
              }}
              onDragLeave={() => setSedangMenarikDrop(false)}
              onDrop={tanganiDrop}
              className={`rounded-[var(--radius-md)] border-2 border-dashed p-5 text-center transition-colors ${
                sedangMenarikDrop
                  ? 'border-[var(--aksen-maroon-garis)] bg-[var(--aksen-maroon-lembut)]/60'
                  : 'border-[var(--garis-tegas)] bg-[var(--bg-kanvas)]/70'
              }`}
            >
              <Upload
                className="h-6 w-6 mx-auto text-[var(--aksen-maroon-teks)]"
                aria-hidden="true"
              />
              <p className="mt-2 text-sm font-medium text-[var(--teks-utama)]">
                Seret &amp; jatuhkan berkas di sini, atau pilih dari perangkat
              </p>
              <p className="mt-1 text-xs text-[var(--teks-redup)]">
                Format diizinkan: JPG, PNG, WebP, PDF, MP4 • Batas aman proxy:{' '}
                <strong className="text-[var(--teks-utama)]">
                  {formatUkuranBerkas(batasBytes)}
                </strong>
              </p>
              <label className="mt-3 inline-flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] text-xs font-medium text-[var(--teks-utama)] hover:bg-[var(--bg-sekunder)] cursor-pointer">
                <span>Pilih Berkas</span>
                <input
                  type="file"
                  accept={MIME_DITERIMA_INPUT}
                  className="sr-only"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    pilihBerkas(e.target.files?.[0] ?? null)
                  }
                />
              </label>

              {fileDipilih && (
                <div className="mt-3 pt-3 border-t border-[var(--garis-halus)] text-xs text-[var(--teks-sekunder)]">
                  Berkas dipilih:{' '}
                  <strong className="text-[var(--teks-utama)]">
                    {fileDipilih.name}
                  </strong>{' '}
                  ({formatUkuranBerkas(fileDipilih.size)} •{' '}
                  {fileDipilih.type || 'tidak diketahui'})
                </div>
              )}
            </div>

            {fileDipilih && fileDipilih.size > batasBytes && (
              <div
                role="alert"
                className="rounded-[var(--radius-sm)] border border-[var(--status-peringatan)]/40 bg-[var(--status-peringatan)]/[0.08] p-3 text-xs text-[var(--teks-utama)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className="h-4 w-4 text-[var(--status-peringatan)] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    Berkas melebihi batas proxy {formatUkuranBerkas(batasBytes)}. Gunakan
                    Fallback Unggah Eksternal agar tidak membebani fungsi server.
                  </span>
                </div>
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  onClick={alihkanKeFallbackDenganBerkas}
                >
                  Alihkan ke Fallback Eksternal
                </Tombol>
              </div>
            )}

            {sedangMengunggah && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--teks-sekunder)]">
                    Mengirim &amp; memverifikasi ke Google Drive...
                  </span>
                  <span className="font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                    {progresPersen}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-[var(--radius-sm)] bg-[var(--bg-sekunder)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--aksen-maroon)] transition-all"
                    style={{ width: `${progresPersen}%` }}
                  />
                </div>
              </div>
            )}

            {galatUpload && (
              <div
                role="alert"
                className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] p-3 text-xs text-[var(--status-bahaya)] flex items-start gap-2"
              >
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p>{galatUpload}</p>
                  {!kesehatan?.terkonfigurasi && (
                    <button
                      type="button"
                      onClick={alihkanKeFallbackDenganBerkas}
                      className="underline font-medium text-[var(--teks-utama)] cursor-pointer"
                    >
                      Daftarkan melalui Fallback Unggah Eksternal →
                    </button>
                  )}
                </div>
              </div>
            )}

            {asetBerhasil && (
              <div className="rounded-[var(--radius-sm)] border border-[var(--status-sukses)]/40 bg-[var(--status-sukses)]/[0.06] p-3 text-xs text-[var(--status-sukses)] flex items-start gap-2">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">
                    Berhasil tersinkron ke Google Drive
                  </p>
                  <p className="text-[var(--teks-sekunder)] mt-0.5">
                    Drive File ID:{' '}
                    <code className="font-mono">{asetBerhasil.driveFileId}</code>
                  </p>
                </div>
              </div>
            )}

            <AreaTeks
              label="Catatan Aset (Opsional)"
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan versi, izin talent, atau referensi revisi..."
            />

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--garis-halus)]">
              <Tombol varian="sekunder" ukuran="sm" onClick={onTutup}>
                Tutup
              </Tombol>
              {sedangMengunggah && (
                <Tombol
                  varian="bahaya"
                  ukuran="sm"
                  onClick={() => batalkanXhrRef.current?.()}
                >
                  Batalkan Unggahan
                </Tombol>
              )}
              {bisaRetry && !sedangMengunggah && (
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => void jalankanUploadProxy()}
                >
                  Coba Lagi (Idempoten)
                </Tombol>
              )}
              <Tombol
                varian="primer"
                ukuran="sm"
                memuat={sedangMengunggah}
                disabled={!fileDipilih || fileDipilih.size > batasBytes}
                onClick={() => void jalankanUploadProxy()}
              >
                Unggah &amp; Minta Drive File ID
              </Tombol>
            </div>
          </div>
        ) : (
          <form onSubmit={tanganiSubmitManual} noValidate className="space-y-3">
            <div className="rounded-[var(--radius-sm)] border border-[var(--aksen-emas)]/40 bg-[var(--aksen-emas)]/[0.06] p-3 text-xs text-[var(--teks-sekunder)] space-y-2">
              <p>
                <strong className="font-semibold text-[var(--teks-utama)]">
                  Fallback Jujur untuk Video Besar / Unggah Manual Drive:
                </strong>{' '}
                Karena batas request body Vercel standar (4,5 MB) dan kebutuhan video HD 9:16,
                unggah berkas video besar langsung ke folder Google Drive terkontrol lalu catat
                metadatanya di sini. Status tercatat sebagai{' '}
                <strong>“Unggah eksternal; menunggu sinkronisasi”</strong> hingga diverifikasi oleh Drive.
              </p>
              {kesehatan?.tautanFolderTerkontrol &&
                apakahUrlEksternalAman(kesehatan.tautanFolderTerkontrol) && (
                  <a
                    href={kesehatan.tautanFolderTerkontrol}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--aksen-maroon-teks)] hover:underline"
                  >
                    Buka Folder Drive Terkontrol di Tab Baru
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputTeks
                label="Nama File Kanonik"
                wajib
                value={namaFileManual}
                galat={galatManual}
                placeholder="RH_20261125_RAW_FOUNDER_INTERVIEW_01.mp4"
                onChange={(e) => {
                  setNamaFileManual(e.target.value);
                  if (galatManual) setGalatManual('');
                }}
              />

              <InputTeks
                label="Perkiraan Ukuran (MB)"
                type="number"
                step="0.1"
                min="0"
                value={ukuranMbManual}
                placeholder="Mis. 145"
                onChange={(e) => setUkuranMbManual(e.target.value)}
              />
            </div>

            <InputTeks
              label="Tautan File / Folder Google Drive (Opsional, harus https://drive.google.com/...)"
              value={tautanDriveManual}
              placeholder="https://drive.google.com/file/d/..."
              onChange={(e) => setTautanDriveManual(e.target.value)}
            />

            <AreaTeks
              label="Catatan Produksi / Embargo"
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Mis. Backup kartu SD #1 & #2 selesai; klip mengandung nama brand embargo."
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--garis-halus)]">
              <Tombol varian="sekunder" ukuran="sm" onClick={onTutup}>
                Batal
              </Tombol>
              <Tombol
                type="submit"
                varian="primer"
                ukuran="sm"
                memuat={sedangSimpanManual}
              >
                Simpan Metadata (Menunggu Sinkronisasi)
              </Tombol>
            </div>
          </form>
        )}
      </div>
    </ModalDialog>
  );
}
