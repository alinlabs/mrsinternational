import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CloudUpload,
  Download,
  ExternalLink,
  FileText,
  Lock,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { DAFTAR_OPSI_PILAR, DAFTAR_OPSI_STATUS_KONTEN } from '../../data/kalender-kanonik';
import { OPSI_PLATFORM_KPI } from '../../data/kpi-kanonik';
import {
  KATEGORI_STAKEHOLDER_KANONIK,
  PIPELINE_OUTREACH_KANONIK,
} from '../../data/stakeholder-kanonik';
import { gunakanIklanAnggaran } from '../../hooks/gunakan-iklan-anggaran';
import { gunakanKalenderKonten } from '../../hooks/gunakan-kalender-konten';
import { gunakanKpiMonitoring } from '../../hooks/gunakan-kpi-monitoring';
import { gunakanProduksi } from '../../hooks/gunakan-produksi';
import { gunakanSesiAplikasi } from '../../hooks/gunakan-sesi-aplikasi';
import {
  ambilDaftarAsetApi,
  cekKesehatanDriveApi,
} from '../../services/layanan-aset';
import {
  simpanLaporanPdfKeDriveApi,
  unduhBlobPdf,
} from '../../services/layanan-laporan';
import { ambilDaftarStakeholderApi } from '../../services/layanan-stakeholder';
import type { AsetDrive, StatusKesehatanDrive } from '../../types/aset';
import type {
  JenisLaporanId,
  KonfigurasiLaporan,
  OrientasiLaporan,
} from '../../types/laporan';
import type { RecordStakeholder } from '../../types/stakeholder';
import {
  DAFTAR_JENIS_LAPORAN,
  bangunDokumenLaporan,
  bolehEksporPiiStakeholder,
  bolehLihatCatatanInternalLaporan,
  buatKonfigurasiLaporanDefault,
  dapatkanDefinisiLaporan,
} from '../../utils/laporan';
import { buatPdfBlobLaporan } from '../../utils/laporan-pdf';
import { dukungPratinjauPdfInline } from '../../utils/kompatibilitas-browser';
import { PratinjauCetakLaporan } from '../../components/domain/pratinjau-cetak-laporan';
import { WadahHalaman } from '../../components/layout/wadah-halaman';
import {
  HeaderHalaman,
  InputTeks,
  Kartu,
  ModalKonfirmasi,
  SelectPilihan,
  StatusTeks,
  Tombol,
  gunakanToast,
} from '../../components/ui';

export default function HalamanLaporan() {
  const { sesi, tokenBearer } = gunakanSesiAplikasi();
  const { daftarKonten } = gunakanKalenderKonten();
  const { stateProduksi } = gunakanProduksi();
  const { stateIklan } = gunakanIklanAnggaran();
  const { stateKpi, modeContohAktif } = gunakanKpiMonitoring();
  const { tampilkanToast } = gunakanToast();

  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiLaporan>(() =>
    buatKonfigurasiLaporanDefault('executive-brief'),
  );
  const [capWaktuRender, setCapWaktuRender] = useState<Date>(() => new Date());
  const pdfInlineDidukung = useMemo(() => dukungPratinjauPdfInline(), []);
  const [modePratinjau, setModePratinjau] = useState<'pdf' | 'html'>(() =>
    pdfInlineDidukung ? 'pdf' : 'html',
  );

  const [daftarStakeholder, setDaftarStakeholder] = useState<
    RecordStakeholder[]
  >([]);
  const [daftarAset, setDaftarAset] = useState<AsetDrive[]>([]);
  const [kesehatanDrive, setKesehatanDrive] =
    useState<StatusKesehatanDrive | null>(null);

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pdfHasil, setPdfHasil] = useState<{
    blob: Blob;
    base64: string;
    ukuranBytes: number;
    jumlahHalaman: number;
  } | null>(null);

  const [sedangSimpanDrive, setSedangSimpanDrive] = useState(false);
  const [konfirmasiSimpanDrive, setKonfirmasiSimpanDrive] = useState(false);
  const [konfirmasiBukaPii, setKonfirmasiBukaPii] = useState(false);
  const idempotencyKeyRef = useRef(`rep-${Date.now()}`);

  const definisiAktif = useMemo(
    () => dapatkanDefinisiLaporan(konfigurasi.jenis),
    [konfigurasi.jenis],
  );
  const bolehCatatanInternal = bolehLihatCatatanInternalLaporan(sesi.peran);
  const bolehPii = bolehEksporPiiStakeholder(sesi.peran);

  const muatSumberServer = useCallback(async () => {
    const respHealth = await cekKesehatanDriveApi();
    if (respHealth.ok && respHealth.data) {
      setKesehatanDrive(respHealth.data);
    }

    if (sesi.terautentikasi && tokenBearer) {
      const [respStakeholder, respAset] = await Promise.all([
        ambilDaftarStakeholderApi(tokenBearer),
        ambilDaftarAsetApi(tokenBearer),
      ]);
      if (respStakeholder.ok && respStakeholder.data) {
        setDaftarStakeholder(respStakeholder.data.daftarStakeholder);
      }
      if (respAset.ok && respAset.data) {
        setDaftarAset(respAset.data.daftarAset);
      }
    } else {
      setDaftarStakeholder([]);
      setDaftarAset([]);
    }
  }, [sesi.terautentikasi, tokenBearer]);

  useEffect(() => {
    void muatSumberServer();
  }, [muatSumberServer]);

  const pilihJenisLaporan = (jenis: JenisLaporanId) => {
    const baru = buatKonfigurasiLaporanDefault(jenis);
    setKonfigurasi((prev) => ({
      ...baru,
      sertakanCatatanInternal: prev.sertakanCatatanInternal && bolehCatatanInternal,
      sertakanKontakPribadiStakeholder: false,
    }));
    setCapWaktuRender(new Date());
    idempotencyKeyRef.current = `rep-${jenis}-${Date.now()}`;
  };

  const dokumen = useMemo(
    () =>
      bangunDokumenLaporan({
        konfigurasi,
        sesi,
        daftarKonten,
        stateProduksi,
        stateIklan,
        stateKpi,
        modeContohKpi: modeContohAktif,
        daftarStakeholder,
        daftarAset,
        waktuSekarang: capWaktuRender,
      }),
    [
      konfigurasi,
      sesi,
      daftarKonten,
      stateProduksi,
      stateIklan,
      stateKpi,
      modeContohAktif,
      daftarStakeholder,
      daftarAset,
      capWaktuRender,
    ],
  );

  // Bangun PDF Blob setiap dokumen berubah dan selalu bersihkan Blob URL lama
  useEffect(() => {
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
  }, [dokumen]);

  const opsiPlatformFilter = useMemo(() => {
    if (konfigurasi.jenis === 'content-calendar') {
      return [
        { nilai: 'semua', label: 'Semua Kanal' },
        { nilai: 'instagram', label: 'Instagram' },
        { nilai: 'facebook', label: 'Facebook' },
        { nilai: 'tiktok', label: 'TikTok' },
      ];
    }
    if (konfigurasi.jenis === 'ad-flight-budget') {
      return [
        { nilai: 'semua', label: 'Semua Platform Iklan' },
        { nilai: 'meta', label: 'Meta Ads' },
        { nilai: 'tiktok', label: 'TikTok Ads' },
      ];
    }
    if (konfigurasi.jenis === 'kpi-monitoring') {
      return [
        { nilai: 'semua', label: 'Semua Platform KPI' },
        ...OPSI_PLATFORM_KPI,
      ];
    }
    return [{ nilai: 'semua', label: 'Semua Platform' }];
  }, [konfigurasi.jenis]);

  const opsiStatusFilter = useMemo(() => {
    if (konfigurasi.jenis === 'content-calendar') {
      return [
        { nilai: 'semua', label: 'Semua Status Konten' },
        ...DAFTAR_OPSI_STATUS_KONTEN,
      ];
    }
    if (konfigurasi.jenis === 'production-approval') {
      return [
        { nilai: 'semua', label: 'Semua Status Tugas' },
        { nilai: 'brief', label: 'Brief Awal' },
        { nilai: 'ready-to-shoot', label: 'Siap Rekam' },
        { nilai: 'shooting', label: 'Shooting' },
        { nilai: 'editing', label: 'Proses Edit' },
        { nilai: 'review', label: 'Menunggu Cek' },
        { nilai: 'approved', label: 'Disetujui' },
        { nilai: 'scheduled', label: 'Terjadwal' },
        { nilai: 'published', label: 'Sudah Tayang' },
        { nilai: 'blocked', label: 'Tertahan' },
      ];
    }
    if (konfigurasi.jenis === 'ad-flight-budget') {
      return [
        { nilai: 'semua', label: 'Semua Status Jadwal' },
        { nilai: 'planned', label: 'Rencana' },
        { nilai: 'approved', label: 'Disetujui' },
        { nilai: 'active', label: 'Sedang Tayang' },
        { nilai: 'paused', label: 'Dijeda' },
        { nilai: 'completed', label: 'Selesai' },
      ];
    }
    if (konfigurasi.jenis === 'stakeholder-pipeline') {
      return [
        { nilai: 'semua', label: 'Semua Status Pipeline' },
        ...PIPELINE_OUTREACH_KANONIK.map((p) => ({
          nilai: p.nilai,
          label: p.label,
        })),
      ];
    }
    return [{ nilai: 'semua', label: 'Semua Status' }];
  }, [konfigurasi.jenis]);

  const opsiKategoriFilter = useMemo(() => {
    if (
      konfigurasi.jenis === 'content-calendar' ||
      konfigurasi.jenis === 'kpi-monitoring'
    ) {
      return [
        { nilai: 'semua', label: 'Semua Pilar Konten' },
        ...DAFTAR_OPSI_PILAR,
      ];
    }
    if (konfigurasi.jenis === 'stakeholder-pipeline') {
      return [
        { nilai: 'semua', label: 'Semua Segmen Stakeholder' },
        ...KATEGORI_STAKEHOLDER_KANONIK.map((k) => ({
          nilai: k.nilai,
          label: k.label,
        })),
      ];
    }
    return [{ nilai: 'semua', label: 'Semua Kategori' }];
  }, [konfigurasi.jenis]);

  const driveSiapSimpan =
    kesehatanDrive?.status === 'connected' &&
    sesi.terautentikasi &&
    bolehPii &&
    Boolean(pdfHasil);

  const jalankanSimpanDrive = async () => {
    if (!pdfHasil || !driveSiapSimpan) return;
    setSedangSimpanDrive(true);
    const resp = await simpanLaporanPdfKeDriveApi({
      tokenBearer,
      namaFile: dokumen.namaFile,
      judulLaporan: `${dokumen.judul} (${dokumen.dibuatPadaLabelWib})`,
      base64Pdf: pdfHasil.base64,
      catatan: `Disimpan dari Pusat Laporan oleh ${dokumen.dibuatOleh}`,
      idempotencyKey: idempotencyKeyRef.current,
    });
    setSedangSimpanDrive(false);

    if (!resp.ok || !resp.data) {
      tampilkanToast({
        jenis: 'galat',
        judul: 'Gagal menyimpan PDF ke 08_Reports',
        pesan:
          resp.error?.message ??
          'Integrasi Google Drive belum siap atau peran tidak berwenang.',
      });
      return;
    }

    tampilkanToast({
      jenis: 'sukses',
      judul: 'Laporan tersimpan di Drive 08_Reports',
      pesan: `Berkas "${dokumen.namaFile}" berhasil disimpan (fileId: ${resp.data.driveFileId}).`,
    });
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain print:overflow-visible">
      <WadahHalaman>
        <div className="no-cetak">
          <HeaderHalaman
            labelTahap="Pelaporan · Cetak A4 & PDF"
            judul="Laporan PDF"
            tujuan="Pilih format laporan, pratinjau hasilnya, lalu unduh atau simpan ke Google Drive."
            aksiUtama={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<Printer className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setModePratinjau('html');
                    setTimeout(() => window.print(), 120);
                  }}
                >
                  Cetak A4
                </Tombol>
                <Tombol
                  varian="primer"
                  ukuran="sm"
                  disabled={!pdfHasil}
                  ikonKiri={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
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
            }
          />
        </div>

        <div className="space-y-8 pb-8">
          {/* Pemilih 7 Jenis Laporan */}
          <section className="no-cetak space-y-5" aria-label="Pilih jenis laporan">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <h2 className="text-base sm:text-lg font-semibold text-[var(--teks-utama)]">
                1. Pilih Jenis Laporan (7 Format)
              </h2>
              <p className="text-xs sm:text-sm text-[var(--teks-sekunder)]">
                Status data ditandai jelas: Rencana, Estimasi, Disetujui, Aktual, atau Belum diisi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {DAFTAR_JENIS_LAPORAN.map((item, idx) => {
                const aktif = konfigurasi.jenis === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={aktif}
                    onClick={() => pilihJenisLaporan(item.id)}
                    style={!aktif ? { backgroundImage: 'var(--gradasi-kartu-lembut)' } : undefined}
                    className={`rounded-[var(--radius-lg)] border p-4 text-left transition-colors cursor-pointer shadow-[var(--bayangan-halus)] ${
                      aktif
                        ? 'border-[var(--aksen-maroon-garis)]/60 bg-[var(--aksen-maroon-lembut)]/80'
                        : 'border-[var(--aksen-maroon-garis)]/25 hover:border-[var(--aksen-maroon-garis)]/45'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                        0{idx + 1}.
                      </span>
                      <span className="text-[11px] text-[var(--teks-redup)]">
                        {item.orientasiDefault === 'landscape'
                          ? 'A4 Landscape'
                          : 'A4 Portrait'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[var(--teks-utama)]">
                      {item.judul}
                    </p>
                    <p className="mt-1 text-xs text-[var(--teks-sekunder)] leading-relaxed">
                      {item.ringkasan}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

        {/* Konfigurasi Parameter & Filter */}
        <div className="no-cetak">
          <Kartu
            judul="2. Pengaturan Laporan & Privasi"
            subjudul={definisiAktif.ringkasan}
            aksiHeader={
              <Tombol
                varian="sekunder"
                ukuran="sm"
                ikonKiri={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => {
                  setCapWaktuRender(new Date());
                  idempotencyKeyRef.current = `rep-${konfigurasi.jenis}-${Date.now()}`;
                  tampilkanToast({
                    jenis: 'info',
                    judul: 'Pratinjau PDF diperbarui',
                    pesan: `Memuat ${dokumen.jumlahBarisData} baris data aktif.`,
                  });
                }}
              >
                Perbarui Pratinjau
              </Tombol>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <SelectPilihan
                  label="Orientasi Halaman A4"
                  value={konfigurasi.orientasi}
                  onChange={(e) =>
                    setKonfigurasi((prev) => ({
                      ...prev,
                      orientasi: e.target.value as OrientasiLaporan,
                    }))
                  }
                  opsi={[
                    { nilai: 'portrait', label: 'A4 Portrait (Eksekutif)' },
                    { nilai: 'landscape', label: 'A4 Landscape (Tabel Lebar)' },
                  ]}
                />

                {definisiAktif.mendukungFilterTanggal && (
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

                {definisiAktif.mendukungFilterPlatform && (
                  <SelectPilihan
                    label="Platform / Kanal"
                    value={konfigurasi.platform}
                    onChange={(e) =>
                      setKonfigurasi((prev) => ({
                        ...prev,
                        platform: e.target.value,
                      }))
                    }
                    opsi={opsiPlatformFilter}
                  />
                )}

                {definisiAktif.mendukungFilterStatus && (
                  <SelectPilihan
                    label="Filter Status"
                    value={konfigurasi.statusFilter}
                    onChange={(e) =>
                      setKonfigurasi((prev) => ({
                        ...prev,
                        statusFilter: e.target.value,
                      }))
                    }
                    opsi={opsiStatusFilter}
                  />
                )}

                {definisiAktif.mendukungFilterKategori && (
                  <SelectPilihan
                    label="Pilar / Kategori"
                    value={konfigurasi.kategoriFilter}
                    onChange={(e) =>
                      setKonfigurasi((prev) => ({
                        ...prev,
                        kategoriFilter: e.target.value,
                      }))
                    }
                    opsi={opsiKategoriFilter}
                  />
                )}
              </div>

              {/* Opsi permission-gated + status Drive 08_Reports */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-[var(--garis-halus)]">
                <div className="flex flex-wrap items-center gap-5 text-xs">
                  <label
                    className={`flex items-center gap-2 ${
                      bolehCatatanInternal
                        ? 'text-[var(--teks-utama)] cursor-pointer'
                        : 'text-[var(--teks-redup)] cursor-not-allowed'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!bolehCatatanInternal}
                      checked={konfigurasi.sertakanCatatanInternal}
                      onChange={(e) =>
                        setKonfigurasi((prev) => ({
                          ...prev,
                          sertakanCatatanInternal: e.target.checked,
                        }))
                      }
                      className="rounded border-[var(--garis-tegas)] accent-[var(--aksen-maroon)]"
                    />
                    <span>
                      Sertakan catatan internal
                      {!bolehCatatanInternal && ' (memerlukan peran internal berwenang)'}
                    </span>
                  </label>

                  {definisiAktif.memuatPotensiPii && (
                    <label
                      className={`flex items-center gap-2 ${
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
                        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                        Tampilkan kontak privat tamu (disamarkan otomatis)
                      </span>
                    </label>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusTeks
                    status={
                      kesehatanDrive?.status === 'connected'
                        ? 'approved'
                        : 'not-configured'
                    }
                    labelKustom={
                      kesehatanDrive?.status === 'connected'
                        ? 'Drive 08_Reports Siap'
                        : 'Drive 08_Reports Belum Terhubung'
                    }
                  />
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
                </div>
              </div>
            </div>
          </Kartu>
        </div>

        {/* Area Pratinjau Dokumen */}
        <section aria-label="Pratinjau laporan PDF dan cetak">
          <div
            style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
            className="no-cetak mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 px-5 py-3.5 shadow-[var(--bayangan-halus)]"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <FileText
                className="h-4 w-4 text-[var(--aksen-maroon-teks)]"
                aria-hidden="true"
              />
              <span className="font-mono font-medium text-[var(--teks-utama)]">
                {dokumen.namaFile}
              </span>
              {pdfHasil && (
                <span className="text-[var(--teks-redup)] angka-tabular">
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

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-0.5"
                role="tablist"
                aria-label="Mode pratinjau laporan"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={modePratinjau === 'pdf'}
                  onClick={() => setModePratinjau('pdf')}
                  className={`px-3 py-1.5 text-xs rounded-[var(--radius-sm)] cursor-pointer whitespace-nowrap ${
                    modePratinjau === 'pdf'
                      ? 'bg-[var(--aksen-maroon)] text-white font-medium'
                      : 'text-[var(--teks-sekunder)] hover:text-[var(--teks-utama)]'
                  }`}
                >
                  Pratinjau PDF
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={modePratinjau === 'html'}
                  onClick={() => setModePratinjau('html')}
                  className={`px-3 py-1.5 text-xs rounded-[var(--radius-sm)] cursor-pointer whitespace-nowrap ${
                    modePratinjau === 'html'
                      ? 'bg-[var(--aksen-maroon)] text-white font-medium'
                      : 'text-[var(--teks-sekunder)] hover:text-[var(--teks-utama)]'
                  }`}
                >
                  Siap Cetak A4
                </button>
              </div>

              {blobUrl && (
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[var(--aksen-maroon-teks)] hover:underline whitespace-nowrap"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Buka PDF di Tab Baru
                </a>
              )}
            </div>
          </div>

          {modePratinjau === 'pdf' && blobUrl ? (
            pdfInlineDidukung ? (
              <div className="no-cetak overflow-hidden rounded-[var(--radius-md)] border border-[var(--garis-halus)] bg-[var(--bg-sekunder)]">
                <iframe
                  title={`Pratinjau PDF ${dokumen.judul}`}
                  src={blobUrl}
                  className="w-full h-[680px] bg-white"
                />
              </div>
            ) : (
              <div className="no-cetak rounded-[var(--radius-md)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] p-6 text-center space-y-3">
                <p className="text-sm font-medium text-[var(--teks-utama)]">
                  Pratinjau PDF penuh tersedia via tab &ldquo;Siap Cetak A4&rdquo; atau unduhan berkas pada peramban seluler.
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

          {/* Lembar HTML selalu tersedia untuk @media print dan modePratinjau === 'html' */}
          <div className={modePratinjau === 'html' ? 'block' : 'hidden print:block'}>
            <PratinjauCetakLaporan dokumen={dokumen} />
          </div>
        </section>
      </div>

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
        pesan={`Berkas "${dokumen.namaFile}" akan diunggah sebagai dokumen internal (default private) ke folder 08_Reports di Google Drive proyek.`}
        labelKonfirmasi="Ya, Simpan ke Drive"
      />
      </WadahHalaman>
    </div>
  );
}
