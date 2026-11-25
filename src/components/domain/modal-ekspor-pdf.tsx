import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CloudUpload,
  Download,
  ExternalLink,
  FileText,
  Lock,
  Printer,
} from 'lucide-react';
import { gunakanIklanAnggaran } from '../../hooks/gunakan-iklan-anggaran';
import { gunakanKalenderKonten } from '../../hooks/gunakan-kalender-konten';
import { gunakanKpiMonitoring } from '../../hooks/gunakan-kpi-monitoring';
import { gunakanProduksi } from '../../hooks/gunakan-produksi';
import { gunakanSesiAplikasi } from '../../hooks/gunakan-sesi-aplikasi';
import { cekKesehatanDriveApi } from '../../services/layanan-aset';
import {
  simpanLaporanPdfKeDriveApi,
  unduhBlobPdf,
} from '../../services/layanan-laporan';
import type { StatusKesehatanDrive } from '../../types/aset';
import type {
  JenisLaporanId,
  KonfigurasiLaporan,
  OrientasiLaporan,
} from '../../types/laporan';
import type { RecordStakeholder } from '../../types/stakeholder';
import {
  bangunDokumenLaporan,
  bolehEksporPiiStakeholder,
  bolehLihatCatatanInternalLaporan,
  buatKonfigurasiLaporanDefault,
  dapatkanDefinisiLaporan,
} from '../../utils/laporan';
import { buatPdfBlobLaporan } from '../../utils/laporan-pdf';
import { dukungPratinjauPdfInline } from '../../utils/kompatibilitas-browser';
import {
  InputTeks,
  ModalDialog,
  ModalKonfirmasi,
  SelectPilihan,
  StatusTeks,
  Tombol,
  gunakanToast,
} from '../ui';
import { PratinjauCetakLaporan } from './pratinjau-cetak-laporan';

export interface ModalEksporPdfProps {
  terbuka: boolean;
  onTutup: () => void;
  jenisDefault: JenisLaporanId;
  filterAwal?: Partial<KonfigurasiLaporan>;
  daftarStakeholder?: RecordStakeholder[];
  modeContohKpi?: boolean;
}

export function ModalEksporPdf({
  terbuka,
  onTutup,
  jenisDefault,
  filterAwal,
  daftarStakeholder = [],
  modeContohKpi = false,
}: ModalEksporPdfProps) {
  const { sesi, tokenBearer } = gunakanSesiAplikasi();
  const { daftarKonten } = gunakanKalenderKonten();
  const { stateProduksi } = gunakanProduksi();
  const { stateIklan } = gunakanIklanAnggaran();
  const { stateKpi } = gunakanKpiMonitoring();
  const { tampilkanToast } = gunakanToast();

  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiLaporan>(() => ({
    ...buatKonfigurasiLaporanDefault(jenisDefault),
    ...filterAwal,
    jenis: jenisDefault,
    sertakanKontakPribadiStakeholder: false,
  }));

  const pdfInlineDidukung = useMemo(() => dukungPratinjauPdfInline(), []);
  const [modePratinjau, setModePratinjau] = useState<'pdf' | 'html'>(() =>
    pdfInlineDidukung ? 'pdf' : 'html',
  );
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pdfHasil, setPdfHasil] = useState<{
    blob: Blob;
    base64: string;
    ukuranBytes: number;
    jumlahHalaman: number;
  } | null>(null);

  const [kesehatanDrive, setKesehatanDrive] =
    useState<StatusKesehatanDrive | null>(null);
  const [sedangSimpanDrive, setSedangSimpanDrive] = useState(false);
  const [konfirmasiSimpanDrive, setKonfirmasiSimpanDrive] = useState(false);
  const [konfirmasiBukaPii, setKonfirmasiBukaPii] = useState(false);
  const idempotencyKeyRef = useRef('');

  const definisiLaporan = useMemo(
    () => dapatkanDefinisiLaporan(konfigurasi.jenis),
    [konfigurasi.jenis],
  );

  const bolehCatatanInternal = bolehLihatCatatanInternalLaporan(sesi.peran);
  const bolehPii = bolehEksporPiiStakeholder(sesi.peran);

  // Sinkronkan filter awal tiap kali modal dibuka
  useEffect(() => {
    if (!terbuka) return;
    setKonfigurasi({
      ...buatKonfigurasiLaporanDefault(jenisDefault),
      ...filterAwal,
      jenis: jenisDefault,
      sertakanKontakPribadiStakeholder: false,
    });
    idempotencyKeyRef.current = `pdf-${jenisDefault}-${Date.now()}`;

    void cekKesehatanDriveApi().then((resp) => {
      if (resp.ok && resp.data) {
        setKesehatanDrive(resp.data);
      }
    });
  }, [terbuka, jenisDefault, filterAwal]);

  const dokumen = useMemo(
    () =>
      bangunDokumenLaporan({
        konfigurasi,
        sesi,
        daftarKonten,
        stateProduksi,
        stateIklan,
        stateKpi,
        modeContohKpi,
        daftarStakeholder,
      }),
    [
      konfigurasi,
      sesi,
      daftarKonten,
      stateProduksi,
      stateIklan,
      stateKpi,
      modeContohKpi,
      daftarStakeholder,
    ],
  );

  // Buat Blob PDF dan selalu revoke URL lama saat berganti, ditutup, atau unmount
  useEffect(() => {
    if (!terbuka) {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setPdfHasil(null);
      return;
    }

    const hasil = buatPdfBlobLaporan(dokumen);
    const urlBaru = URL.createObjectURL(hasil.blob);
    setPdfHasil(hasil);
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return urlBaru;
    });

    return () => {
      URL.revokeObjectURL(urlBaru);
    };
  }, [terbuka, dokumen]);

  const driveSiapSimpan =
    kesehatanDrive?.status === 'connected' &&
    sesi.terautentikasi &&
    bolehPii &&
    Boolean(pdfHasil);

  const jalankanSimpanDrive = async () => {
    if (!pdfHasil || !driveSiapSimpan) return;
    setSedangSimpanDrive(true);
    const key =
      idempotencyKeyRef.current || `pdf-${dokumen.jenis}-${Date.now()}`;
    const resp = await simpanLaporanPdfKeDriveApi({
      tokenBearer,
      namaFile: dokumen.namaFile,
      judulLaporan: `${dokumen.judul} (${dokumen.dibuatPadaLabelWib})`,
      base64Pdf: pdfHasil.base64,
      catatan: `Diekspor dari modul Control Center oleh ${dokumen.dibuatOleh}`,
      idempotencyKey: key,
    });
    setSedangSimpanDrive(false);

    if (!resp.ok || !resp.data) {
      tampilkanToast({
        jenis: 'galat',
        judul: 'Gagal menyimpan ke folder 08_Reports',
        pesan:
          resp.error?.message ??
          'Pastikan integrasi Google Drive aktif dan Anda memiliki izin unggah.',
      });
      return;
    }

    tampilkanToast({
      jenis: 'sukses',
      judul: 'Laporan PDF disimpan ke 08_Reports',
      pesan: `Drive fileId: ${resp.data.driveFileId}`,
    });
  };

  return (
    <>
      <ModalDialog
        terbuka={terbuka}
        onTutup={onTutup}
        judul={`Ekspor PDF — ${definisiLaporan.judul}`}
        deskripsi="Pratinjau dokumen PDF A4 sebelum diunduh atau disimpan ke Google Drive."
        ukuran="xl"
        cetakIsolasi
      >
        <div className="space-y-4">
          {/* Parameter ringkas */}
          <div className="no-cetak rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3.5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <SelectPilihan
                label="Orientasi A4"
                value={konfigurasi.orientasi}
                onChange={(e) =>
                  setKonfigurasi((prev) => ({
                    ...prev,
                    orientasi: e.target.value as OrientasiLaporan,
                  }))
                }
                opsi={[
                  { nilai: 'portrait', label: 'A4 Portrait (Ringkas)' },
                  { nilai: 'landscape', label: 'A4 Landscape (Tabel Lebar)' },
                ]}
              />

              {definisiLaporan.mendukungFilterTanggal && (
                <>
                  <InputTeks
                    label="Dari Tanggal"
                    type="date"
                    value={konfigurasi.tanggalMulai}
                    onChange={(e) =>
                      setKonfigurasi((prev) => ({
                        ...prev,
                        tanggalMulai: e.target.value,
                      }))
                    }
                  />
                  <InputTeks
                    label="Sampai Tanggal"
                    type="date"
                    value={konfigurasi.tanggalSelesai}
                    onChange={(e) =>
                      setKonfigurasi((prev) => ({
                        ...prev,
                        tanggalSelesai: e.target.value,
                      }))
                    }
                  />
                </>
              )}

              <div className="flex flex-col justify-end gap-2">
                {bolehCatatanInternal && (
                  <label className="flex items-center gap-2 text-xs text-[var(--teks-utama)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={konfigurasi.sertakanCatatanInternal}
                      onChange={(e) =>
                        setKonfigurasi((prev) => ({
                          ...prev,
                          sertakanCatatanInternal: e.target.checked,
                        }))
                      }
                      className="rounded border-[var(--garis-tegas)] accent-[var(--aksen-maroon)]"
                    />
                    <span>Sertakan catatan internal</span>
                  </label>
                )}

                {definisiLaporan.memuatPotensiPii && (
                  <label
                    className={`flex items-center gap-2 text-xs ${
                      bolehPii
                        ? 'text-[var(--teks-utama)] cursor-pointer'
                        : 'text-[var(--teks-redup)] cursor-not-allowed'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!bolehPii}
                      checked={konfigurasi.sertakanKontakPribadiStakeholder}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setKonfirmasiBukaPii(true);
                        } else {
                          setKonfigurasi((prev) => ({
                            ...prev,
                            sertakanKontakPribadiStakeholder: false,
                          }));
                        }
                      }}
                      className="rounded border-[var(--garis-tegas)] accent-[var(--aksen-maroon)]"
                    />
                    <span className="inline-flex items-center gap-1">
                      <Lock className="h-3 w-3" aria-hidden="true" />
                      Tampilkan kontak privat tamu
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--garis-halus)] text-xs">
              <div className="flex flex-wrap items-center gap-3 text-[var(--teks-sekunder)]">
                <span className="font-mono text-[11px] text-[var(--teks-utama)]">
                  {dokumen.namaFile}
                </span>
                {pdfHasil && (
                  <span className="angka-tabular text-[11px]">
                    {pdfHasil.jumlahHalaman} halaman ·{' '}
                    {(pdfHasil.ukuranBytes / 1024).toFixed(1)} KB
                  </span>
                )}
                <StatusTeks
                  status={dokumen.piiDisertakan ? 'sample' : 'approved'}
                  labelKustom={
                    dokumen.piiDisertakan
                      ? 'Kontak Privat Ditampilkan'
                      : 'Kontak Disamarkan'
                  }
                />
              </div>

              <div className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] p-0.5">
                <button
                  type="button"
                  onClick={() => setModePratinjau('pdf')}
                  className={`px-2.5 py-1 text-xs rounded-[var(--radius-sm)] cursor-pointer whitespace-nowrap ${
                    modePratinjau === 'pdf'
                      ? 'bg-[var(--aksen-maroon)] text-white font-medium'
                      : 'text-[var(--teks-sekunder)] hover:text-[var(--teks-utama)]'
                  }`}
                >
                  Pratinjau PDF
                </button>
                <button
                  type="button"
                  onClick={() => setModePratinjau('html')}
                  className={`px-2.5 py-1 text-xs rounded-[var(--radius-sm)] cursor-pointer whitespace-nowrap ${
                    modePratinjau === 'html'
                      ? 'bg-[var(--aksen-maroon)] text-white font-medium'
                      : 'text-[var(--teks-sekunder)] hover:text-[var(--teks-utama)]'
                  }`}
                >
                  Siap Cetak A4
                </button>
              </div>
            </div>
          </div>

          {/* Area Pratinjau */}
          {modePratinjau === 'pdf' && blobUrl ? (
            pdfInlineDidukung ? (
              <div className="no-cetak space-y-2">
                <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--garis-halus)] bg-[var(--bg-sekunder)]">
                  <iframe
                    title={`Pratinjau PDF ${dokumen.judul}`}
                    src={blobUrl}
                    className="w-full h-[460px] bg-white"
                  />
                </div>
                <p className="text-[11px] text-[var(--teks-redup)] flex items-center justify-between gap-2">
                  <span>
                    Jika pratinjau PDF tidak muncul, pilih &ldquo;Siap Cetak A4&rdquo; atau unduh langsung berkas PDF.
                  </span>
                  <a
                    href={blobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--aksen-maroon-teks)] hover:underline whitespace-nowrap shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    Buka PDF di Tab Baru
                  </a>
                </p>
              </div>
            ) : (
              <div className="no-cetak rounded-[var(--radius-md)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] p-5 text-center space-y-3">
                <p className="text-xs sm:text-sm text-[var(--teks-utama)]">
                  Pratinjau A4 disarankan pada peramban seluler. Gunakan &ldquo;Siap Cetak A4&rdquo; atau unduh berkas PDF langsung.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Tombol varian="sekunder" ukuran="sm" onClick={() => setModePratinjau('html')}>
                    Lihat Siap Cetak A4
                  </Tombol>
                  {pdfHasil && (
                    <Tombol
                      varian="primer"
                      ukuran="sm"
                      ikonKiri={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => unduhBlobPdf(pdfHasil.blob, dokumen.namaFile)}
                    >
                      Unduh PDF
                    </Tombol>
                  )}
                </div>
              </div>
            )
          ) : null}

          <div
            className={
              modePratinjau === 'html'
                ? 'print-wadah-lembar max-h-[480px] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--garis-halus)] bg-[var(--bg-sekunder)] p-3'
                : 'hidden print:block'
            }
          >
            <PratinjauCetakLaporan dokumen={dokumen} />
          </div>

          {/* Footer Aksi */}
          <div className="no-cetak flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--garis-halus)]">
            <div className="text-[11px] text-[var(--teks-redup)]">
              {kesehatanDrive?.status === 'connected'
                ? 'Drive 08_Reports terhubung'
                : 'Simpan ke Drive 08_Reports nonaktif (integrasi Drive belum terhubung)'}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Tombol varian="halus" ukuran="sm" onClick={onTutup}>
                Tutup
              </Tombol>
              <Tombol
                varian="sekunder"
                ukuran="sm"
                ikonKiri={<Printer className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => {
                  setModePratinjau('html');
                  setTimeout(() => window.print(), 120);
                }}
              >
                Cetak (A4)
              </Tombol>
              <Tombol
                varian="sekunder"
                ukuran="sm"
                disabled={!driveSiapSimpan}
                memuat={sedangSimpanDrive}
                ikonKiri={
                  <CloudUpload className="h-3.5 w-3.5" aria-hidden="true" />
                }
                onClick={() => setKonfirmasiSimpanDrive(true)}
              >
                Simpan ke 08_Reports
              </Tombol>
              <Tombol
                varian="primer"
                ukuran="sm"
                disabled={!pdfHasil}
                ikonKiri={
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                }
                onClick={() => {
                  if (!pdfHasil) return;
                  unduhBlobPdf(pdfHasil.blob, dokumen.namaFile);
                  tampilkanToast({
                    jenis: 'sukses',
                    judul: 'Berkas PDF diunduh',
                    pesan: dokumen.namaFile,
                  });
                }}
              >
                Unduh PDF
              </Tombol>
            </div>
          </div>
        </div>
      </ModalDialog>

      <ModalKonfirmasi
        terbuka={konfirmasiBukaPii}
        onTutup={() => setKonfirmasiBukaPii(false)}
        onKonfirmasi={() => {
          setKonfirmasiBukaPii(false);
          setKonfigurasi((prev) => ({
            ...prev,
            sertakanKontakPribadiStakeholder: true,
          }));
        }}
        judul="Sertakan Kontak Pribadi Tamu?"
        pesan="Laporan akan menampilkan nomor dan email pribadi tamu undangan. Pastikan file hanya dibagikan kepada tim internal."
        labelKonfirmasi="Ya, Tampilkan Kontak Privat"
      />

      <ModalKonfirmasi
        terbuka={konfirmasiSimpanDrive}
        onTutup={() => setKonfirmasiSimpanDrive(false)}
        onKonfirmasi={() => {
          setKonfirmasiSimpanDrive(false);
          void jalankanSimpanDrive();
        }}
        judul="Simpan PDF ke Folder Drive 08_Reports?"
        pesan={`Berkas "${dokumen.namaFile}" akan diunggah sebagai dokumen internal ke folder 08_Reports di Google Drive proyek.`}
        labelKonfirmasi="Ya, Simpan ke Drive"
      />
    </>
  );
}

export { FileText };
