import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Eye,
  FileSpreadsheet,
  FileText,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { ModalEksporPdf } from '../../components/domain/modal-ekspor-pdf';
import {
  INFO_GRUP_KPI_KANONIK,
  OPSI_PILAR_KPI,
  OPSI_PLATFORM_KPI,
} from '../../data/kpi-kanonik';
import { gunakanKpiMonitoring } from '../../hooks/gunakan-kpi-monitoring';
import type { PilarKonten } from '../../types/kalender';
import type {
  FilterKpiMonitoring,
  GrupKpi,
  PlatformKpi,
} from '../../types/kpi';
import { formatTanggalWib } from '../../utils/format';
import {
  evaluasiKesegaranData,
  filterSnapshotKpi,
} from '../../utils/kpi';
import { WadahHalaman } from '../../components/layout/wadah-halaman';
import {
  BilahTabAtas,
  HeaderHalaman,
  InputTeks,
  Kartu,
  ModalKonfirmasi,
  SelectPilihan,
  StatusTeks,
  Tombol,
  gunakanToast,
} from '../../components/ui';
import { ModalEntriKpi } from './modal-entri-kpi';
import { ModalWizardCsvKpi } from './modal-wizard-csv-kpi';
import { SectionBaselineKalkulator } from './section-baseline-kalkulator';
import { SectionQualifiedInquiries } from './section-qualified-inquiries';
import { SectionTabGrupKpi } from './section-tab-grup-kpi';

const FILTER_AWAL: FilterKpiMonitoring = {
  tanggalMulai: '',
  tanggalSelesai: '',
  platform: 'semua',
  pilar: 'semua',
  kampanyeAtauKonten: '',
  source: '',
};

export default function HalamanKpiMonitoring() {
  const {
    stateKpi,
    daftarSnapshotTampil,
    modeContohAktif,
    setModeContohAktif,
    tambahSnapshot,
    hapusSnapshot,
    simpanBaseline72Jam,
    tambahInquiry,
    perbaruiInquiry,
    hapusInquiry,
    resetSemuaKpi,
  } = gunakanKpiMonitoring();

  const { tampilkanToast } = gunakanToast();
  const [tabAktif, setTabAktif] = useState<GrupKpi>('awareness');
  const [filter, setFilter] = useState<FilterKpiMonitoring>(FILTER_AWAL);
  const [modalManualTerbuka, setModalManualTerbuka] = useState(false);
  const [grupModalManual, setGrupModalManual] = useState<GrupKpi>('awareness');
  const [modalCsvTerbuka, setModalCsvTerbuka] = useState(false);
  const [konfirmasiReset, setKonfirmasiReset] = useState(false);
  const [modalPdfTerbuka, setModalPdfTerbuka] = useState(false);

  const daftarTersaring = useMemo(
    () => filterSnapshotKpi(daftarSnapshotTampil, filter),
    [daftarSnapshotTampil, filter],
  );

  const kesegaran = useMemo(
    () => evaluasiKesegaranData(stateKpi.daftarSnapshot),
    [stateKpi.daftarSnapshot],
  );

  const bukaTambahManual = (grup: GrupKpi) => {
    setGrupModalManual(grup);
    setModalManualTerbuka(true);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col print:block print:h-auto">
      <BilahTabAtas
        labelNavigasi="Kategori KPI Ragi Hotang"
        tabAktif={tabAktif}
        onUbahTab={(id) => setTabAktif(id as GrupKpi)}
        daftarTab={INFO_GRUP_KPI_KANONIK.map((grup) => ({
          id: grup.id,
          label: grup.nama,
        }))}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain print:overflow-visible">
        <WadahHalaman>
          <HeaderHalaman
            labelTahap="Hasil Kampanye · Pantauan 72 Jam"
            judul="KPI & Performa"
            tujuan="Catat hasil nyata tiap platform, pantau 72 jam pertama, dan pilah pesan peluang yang masuk."
            aksiUtama={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<Eye className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setModeContohAktif((aktif) => !aktif)}
                >
                  {modeContohAktif ? 'Tutup Data Contoh' : 'Pratinjau Data Contoh'}
                </Tombol>
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<FileText className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setModalPdfTerbuka(true)}
                >
                  Ekspor PDF
                </Tombol>
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setModalCsvTerbuka(true)}
                >
                  Impor CSV
                </Tombol>
                <Tombol
                  varian="primer"
                  ukuran="sm"
                  ikonKiri={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => bukaTambahManual(tabAktif)}
                >
                  Tambah Data Aktual
                </Tombol>
                {(stateKpi.daftarSnapshot.length > 0 ||
                  stateKpi.baseline72Jam !== null ||
                  stateKpi.daftarInquiry.length > 0) && (
                  <Tombol
                    varian="halus"
                    ukuran="sm"
                    ikonKiri={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
                    onClick={() => setKonfirmasiReset(true)}
                  >
                    Reset
                  </Tombol>
                )}
              </div>
            }
          />

          <div className="space-y-8 pb-8">
            {/* Indikator Kesegaran Data & Peringatan Data Contoh */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8">
                <Kartu
                  judul="Status Pembaruan Data"
                  subjudul={kesegaran.pesan}
                  aksiHeader={
                    <StatusTeks
                      status={
                        kesegaran.usang
                          ? 'sample'
                          : kesegaran.memilikiData
                            ? 'actual'
                            : 'not-configured'
                      }
                      labelKustom={
                        kesegaran.usang
                          ? 'Perlu Pembaruan (>72 Jam)'
                          : kesegaran.memilikiData
                            ? 'Data Aktual Aktif'
                            : 'Belum Ada Catatan'
                      }
                    />
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div
                      style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                      className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 p-3.5 text-center"
                    >
                      <p className="text-[var(--teks-redup)]">Tanggal Laporan Terakhir</p>
                      <p className="mt-1 font-semibold text-[var(--teks-utama)] angka-tabular">
                        {kesegaran.tanggalLaporanTerakhir ?? 'Belum ada laporan'}
                      </p>
                    </div>
                    <div
                      style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                      className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 p-3.5 text-center"
                    >
                      <p className="text-[var(--teks-redup)]">Sumber Terakhir</p>
                      <p className="mt-1 font-semibold text-[var(--teks-utama)]">
                        {kesegaran.sumberTerakhir ?? 'Belum ada sumber'}
                      </p>
                    </div>
                    <div
                      style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                      className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 p-3.5 text-center"
                    >
                      <p className="text-[var(--teks-redup)]">Diperbarui / Diimpor Pada</p>
                      <p className="mt-1 font-semibold text-[var(--teks-utama)] angka-tabular">
                        {kesegaran.diperbaruiTerakhir
                          ? formatTanggalWib(kesegaran.diperbaruiTerakhir)
                          : 'Belum diimpor'}
                      </p>
                    </div>
                  </div>

                  {kesegaran.usang && (
                    <div
                      role="alert"
                      className="mt-3 rounded-[var(--radius-sm)] border border-[var(--status-peringatan)]/45 bg-[var(--status-peringatan)]/[0.08] px-3 py-2 text-xs text-[var(--status-peringatan)] flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{kesegaran.pesan}</span>
                    </div>
                  )}
                </Kartu>
              </div>

              <div className="lg:col-span-4">
                <Kartu
                  judul="Ringkasan Data Tersimpan"
                  subjudul="Hanya menghitung catatan nyata yang sudah dimasukkan."
                >
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div
                      style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                      className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 p-3.5 text-center"
                    >
                      <p className="text-[var(--teks-redup)]">Catatan Aktual</p>
                      <p className="mt-1 text-xl font-semibold text-[var(--teks-utama)] angka-tabular">
                        {stateKpi.daftarSnapshot.length}
                      </p>
                    </div>
                    <div
                      style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                      className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 p-3.5 text-center"
                    >
                      <p className="text-[var(--teks-redup)]">Peluang Masuk Sah</p>
                      <p className="mt-1 text-xl font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                        {stateKpi.daftarInquiry.filter((i) => i.terkualifikasi).length}
                      </p>
                    </div>
                  </div>
                  {modeContohAktif && (
                    <p className="mt-3 rounded-[var(--radius-sm)] border border-[var(--status-peringatan)]/45 bg-[var(--status-peringatan)]/[0.08] px-2.5 py-2 text-[11px] text-[var(--status-peringatan)] flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>
                        Mode Data Contoh aktif sementara (tidak disimpan). Tutup sebelum evaluasi akhir.
                      </span>
                    </p>
                  )}
                </Kartu>
              </div>
            </div>

      {/* Filter Lintas Tab */}
      <Kartu
        judul="Filter Data KPI"
        subjudul="Saring catatan berdasarkan tanggal, platform, pilar, atau nama konten."
        aksiHeader={
          <Tombol
            varian="sekunder"
            ukuran="sm"
            onClick={() => setFilter(FILTER_AWAL)}
          >
            Reset Filter
          </Tombol>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <InputTeks
            label="Dari Tanggal"
            type="date"
            value={filter.tanggalMulai}
            onChange={(e) =>
              setFilter((f) => ({ ...f, tanggalMulai: e.target.value }))
            }
          />
          <InputTeks
            label="Sampai Tanggal"
            type="date"
            value={filter.tanggalSelesai}
            onChange={(e) =>
              setFilter((f) => ({ ...f, tanggalSelesai: e.target.value }))
            }
          />
          <SelectPilihan
            label="Platform"
            value={filter.platform}
            opsi={[
              { nilai: 'semua', label: 'Semua platform' },
              ...OPSI_PLATFORM_KPI,
            ]}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                platform: e.target.value as PlatformKpi | 'semua',
              }))
            }
          />
          <SelectPilihan
            label="Pilar Konten"
            value={filter.pilar}
            opsi={[
              { nilai: 'semua', label: 'Semua pilar' },
              ...OPSI_PILAR_KPI.map((p) => ({
                nilai: p.nilai,
                label: p.label,
              })),
            ]}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                pilar: e.target.value as PilarKonten | 'semua',
              }))
            }
          />
          <InputTeks
            label="Konten / Campaign"
            value={filter.kampanyeAtauKonten}
            placeholder="Cari judul/flight..."
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                kampanyeAtauKonten: e.target.value,
              }))
            }
          />
          <InputTeks
            label="Sumber Laporan"
            value={filter.source}
            placeholder="Mis. Meta Ads..."
            onChange={(e) =>
              setFilter((f) => ({ ...f, source: e.target.value }))
            }
          />
        </div>
      </Kartu>

            {/* Panel Kategori KPI Aktif */}
            <div role="tabpanel">
              <SectionTabGrupKpi
                grup={tabAktif}
                daftarSnapshotTersaring={daftarTersaring}
                daftarInquiry={stateKpi.daftarInquiry}
                modeContoh={modeContohAktif}
                onBukaTambahManual={bukaTambahManual}
                onHapusSnapshot={(idSnapshot) => {
                  hapusSnapshot(idSnapshot);
                  tampilkanToast({
                    jenis: 'info',
                    judul: 'Catatan KPI dihapus',
                  });
                }}
              />
            </div>

      {/* Baseline 72 Jam & Kalkulator Proyeksi */}
      <SectionBaselineKalkulator
        baseline={stateKpi.baseline72Jam}
        daftarInquiry={stateKpi.daftarInquiry}
        onSimpanBaseline={(baseline) => {
          simpanBaseline72Jam(baseline);
          tampilkanToast({
            jenis: 'sukses',
            judul: 'Catatan 72 jam disimpan',
            pesan: 'Kalkulator perkiraan kini menggunakan data awal tercatat.',
          });
        }}
      />

      {/* Kualifikasi Inquiry */}
      <SectionQualifiedInquiries
        daftarInquiry={stateKpi.daftarInquiry}
        onTambahInquiry={(inq) => {
          tambahInquiry(inq);
          tampilkanToast({
            jenis: 'sukses',
            judul: 'Pesan masuk dicatat',
            pesan: inq.terkualifikasi
              ? 'Ditandai sebagai Peluang Sah.'
              : 'Dicatat sebagai Pesan Umum.',
          });
        }}
        onPerbaruiInquiry={(inq) => {
          perbaruiInquiry(inq);
          tampilkanToast({
            jenis: 'sukses',
            judul: 'Status peluang diperbarui',
          });
        }}
        onHapusInquiry={(idInq) => {
          hapusInquiry(idInq);
          tampilkanToast({
            jenis: 'info',
            judul: 'Catatan pesan dihapus',
          });
        }}
      />

      {/* Modals */}
      <ModalEntriKpi
        terbuka={modalManualTerbuka}
        grupDefault={grupModalManual}
        onTutup={() => setModalManualTerbuka(false)}
        onSimpan={(snap) => {
          tambahSnapshot(snap);
          setTabAktif(snap.grup);
          tampilkanToast({
            jenis: 'sukses',
            judul: 'Catatan KPI disimpan',
            pesan: `${snap.source} (${snap.periode}) berhasil dicatat.`,
          });
        }}
      />

      <ModalWizardCsvKpi
        terbuka={modalCsvTerbuka}
        snapshotExisting={stateKpi.daftarSnapshot}
        onTutup={() => setModalCsvTerbuka(false)}
        onImporSelesai={(daftarBaru) => tambahSnapshot(daftarBaru)}
      />

      <ModalKonfirmasi
        terbuka={konfirmasiReset}
        onTutup={() => setKonfirmasiReset(false)}
        onKonfirmasi={() => {
          setKonfirmasiReset(false);
          resetSemuaKpi();
          tampilkanToast({
            jenis: 'info',
            judul: 'Seluruh catatan KPI dikosongkan',
          });
        }}
        judul="Kosongkan Seluruh Catatan KPI?"
        pesan="Menghapus semua data KPI aktual, catatan 72 jam, dan daftar pesan masuk yang tersimpan di perangkat ini."
        labelKonfirmasi="Ya, Kosongkan"
      />

      <ModalEksporPdf
        terbuka={modalPdfTerbuka}
        onTutup={() => setModalPdfTerbuka(false)}
        jenisDefault="kpi-monitoring"
        modeContohKpi={modeContohAktif}
            filterAwal={{
              tanggalMulai: filter.tanggalMulai,
              tanggalSelesai: filter.tanggalSelesai,
              platform: filter.platform,
              kategoriFilter: filter.pilar,
            }}
          />
          </div>
        </WadahHalaman>
      </div>
    </div>
  );
}
