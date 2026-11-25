import { useMemo, useState } from 'react';
import { FileText, Filter, RotateCcw } from 'lucide-react';
import { ModalEksporPdf } from '../../components/domain/modal-ekspor-pdf';
import {
  DAFTAR_OPSI_PILAR,
  DAFTAR_OPSI_STATUS_KONTEN,
  DAFTAR_TANGGAL_KALENDER,
} from '../../data/kalender-kanonik';
import { gunakanKalenderKonten } from '../../hooks/gunakan-kalender-konten';
import type {
  FilterKalenderKonten,
  KanalDistribusi,
  PilarKonten,
  StatusKontenOperasional,
  TambahanEditKonten,
} from '../../types/kalender';
import {
  FILTER_KALENDER_DEFAULT,
  filterKonsepKonten,
  hitungStatistikKalender,
  kelompokkanPerHari,
} from '../../utils/kalender';
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
import { TampilanMatriksHarian } from './tampilan-matriks-harian';
import { TampilanDaftarMaster } from './tampilan-daftar-master';
import { TampilanKalenderVisual } from './tampilan-kalender-visual';
import { PanelDetailKonten } from './panel-detail-konten';

type ModeTampilanKalender = 'matriks' | 'daftar' | 'kalender';

const OPSI_KANAL = [
  { nilai: 'instagram', label: 'Instagram (Reels & Feed)' },
  { nilai: 'facebook', label: 'Facebook (Reels & Feed Mirror)' },
  { nilai: 'tiktok', label: 'TikTok (Video A & B)' },
];

export default function HalamanKalenderKonten() {
  const { daftarKonten, simpanPerubahanKonten, resetKeRencanaAwal } =
    gunakanKalenderKonten();
  const { tampilkanToast } = gunakanToast();

  const [modeTampilan, setModeTampilan] =
    useState<ModeTampilanKalender>('matriks');
  const [filter, setFilter] = useState<FilterKalenderKonten>(
    FILTER_KALENDER_DEFAULT,
  );
  const [filterSelulerTerbuka, setFilterSelulerTerbuka] = useState(false);
  const [idKontenDipilih, setIdKontenDipilih] = useState<string | null>(null);
  const [modalResetTerbuka, setModalResetTerbuka] = useState(false);
  const [modalPdfTerbuka, setModalPdfTerbuka] = useState(false);

  const statistikTotal = useMemo(
    () => hitungStatistikKalender(daftarKonten),
    [daftarKonten],
  );

  const filterAktif = useMemo(
    () =>
      Boolean(
        filter.kataKunci.trim() ||
          filter.tanggal ||
          filter.pilar !== 'semua' ||
          filter.kanal !== 'semua' ||
          filter.status !== 'semua' ||
          filter.pic.trim(),
      ),
    [filter],
  );

  const kontenTersaring = useMemo(
    () => filterKonsepKonten(daftarKonten, filter),
    [daftarKonten, filter],
  );

  const bundelHarian = useMemo(
    () => kelompokkanPerHari(kontenTersaring),
    [kontenTersaring],
  );

  const kontenAktif = useMemo(
    () => daftarKonten.find((item) => item.id === idKontenDipilih) ?? null,
    [daftarKonten, idKontenDipilih],
  );

  const tanganiSimpanKonten = (id: string, perubahan: TambahanEditKonten) => {
    simpanPerubahanKonten(id, perubahan);
    tampilkanToast({
      jenis: 'sukses',
      judul: 'Perubahan konten disimpan',
      pesan: 'Pembaruan brief, status, dan progres produksi langsung tersinkron ke halaman Rencana Utama.',
    });
    setIdKontenDipilih(null);
  };

  const tanganiKonfirmasiReset = () => {
    resetKeRencanaAwal();
    setModalResetTerbuka(false);
    tampilkanToast({
      jenis: 'info',
      judul: 'Kalender dikembalikan ke rencana awal',
      pesan: 'Seluruh 66 master konten kembali ke status Rencana (Planned).',
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col print:block print:h-auto">
      <BilahTabAtas
        daftarTab={[
          { id: 'matriks', label: 'Matriks 22 Hari' },
          { id: 'daftar', label: `Daftar Master (${kontenTersaring.length})` },
          { id: 'kalender', label: 'Kalender 4 Pekan' },
        ]}
        tabAktif={modeTampilan}
        onUbahTab={(id) => setModeTampilan(id as ModeTampilanKalender)}
        labelNavigasi="Pilih mode tampilan kalender"
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain print:overflow-visible">
        <WadahHalaman>
          <HeaderHalaman
            labelTahap="26 Nov – 17 Des 2026"
            judul="Kalender Konten"
            tujuan="Jadwal harian 66 konten (44 video + 22 desain) untuk Instagram, Facebook, dan TikTok."
            aksiUtama={
              <div className="flex flex-wrap items-center justify-center gap-2">
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
                  ikonKiri={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setModalResetTerbuka(true)}
                >
                  Reset ke Rencana Awal
                </Tombol>
              </div>
            }
          />

          <div className="space-y-8 pb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-3.5 py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
              >
                <p className="text-xs text-[var(--teks-redup)]">Rentang Kalender</p>
                <p className="mt-1 text-xl sm:text-2xl font-semibold text-[var(--teks-utama)] angka-tabular">
                  {statistikTotal.jumlahTanggal} Tanggal
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-redup)]">
                  26 Nov – 17 Des 2026
                </p>
              </div>

              <div
                style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-3.5 py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
              >
                <p className="text-xs text-[var(--teks-redup)]">Total Master Aset</p>
                <p className="mt-1 text-xl sm:text-2xl font-semibold text-[var(--teks-utama)] angka-tabular">
                  {statistikTotal.totalMaster} Aset
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-redup)]">
                  {statistikTotal.totalVideo} video + {statistikTotal.totalDesain} desain
                </p>
              </div>

              <div
                style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-3.5 py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
              >
                <p className="text-xs text-[var(--teks-redup)]">Disetujui / Terbit</p>
                <p className="mt-1 text-xl sm:text-2xl font-semibold text-[var(--aksen-maroon-teks)] dark:text-[#F3CE7A] angka-tabular">
                  {statistikTotal.selesai} / {statistikTotal.totalMaster}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-redup)]">
                  {statistikTotal.dalamProses} dalam proses edit/review
                </p>
              </div>

              <div
                style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-3.5 py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
              >
                <p className="text-xs text-[var(--teks-redup)]">Belum Dimulai</p>
                <p className="mt-1 text-xl sm:text-2xl font-semibold text-[var(--teks-utama)] angka-tabular">
                  {statistikTotal.masihRencana}
                </p>
                <div className="mt-1">
                  <StatusTeks
                    status="planned"
                    labelKustom={
                      statistikTotal.selesai === 0
                        ? 'Rencana awal'
                        : `${statistikTotal.tertahan} tertahan`
                    }
                  />
                </div>
              </div>
            </div>

            <Kartu>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--teks-redup)]">
                  Menampilkan{' '}
                  <strong className="font-semibold text-[var(--teks-utama)] angka-tabular">
                    {kontenTersaring.length}
                  </strong>{' '}
                  master ({bundelHarian.length} tanggal)
                </p>
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  className="lg:hidden"
                  ikonKiri={<Filter className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setFilterSelulerTerbuka((v) => !v)}
                  aria-expanded={filterSelulerTerbuka}
                >
                  Filter
                </Tombol>
              </div>

              <div
                className={`pt-4 ${
                  filterSelulerTerbuka ? 'block' : 'hidden lg:block'
                }`}
              >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InputTeks
                label="Cari Judul / Hook / Catatan"
                placeholder="Cari judul, hook, atau catatan..."
                value={filter.kataKunci}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, kataKunci: e.target.value }))
                }
              />

              <SelectPilihan
                label="Tanggal"
                value={filter.tanggal}
                placeholderOpsi="Semua 22 Tanggal"
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, tanggal: e.target.value }))
                }
                opsi={DAFTAR_TANGGAL_KALENDER.map((tgl) => ({
                  nilai: tgl.nilai,
                  label: tgl.label,
                }))}
              />

              <SelectPilihan
                label="Pilar Konten"
                value={filter.pilar}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    pilar: e.target.value as PilarKonten | 'semua',
                  }))
                }
                opsi={[
                  { nilai: 'semua', label: 'Semua Pilar' },
                  ...DAFTAR_OPSI_PILAR,
                ]}
              />

              <SelectPilihan
                label="Kanal Distribusi"
                value={filter.kanal}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    kanal: e.target.value as KanalDistribusi | 'semua',
                  }))
                }
                opsi={[
                  { nilai: 'semua', label: 'Semua Kanal' },
                  ...OPSI_KANAL,
                ]}
              />

              <SelectPilihan
                label="Status"
                value={filter.status}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    status: e.target.value as StatusKontenOperasional | 'semua',
                  }))
                }
                opsi={[
                  { nilai: 'semua', label: 'Semua Status' },
                  ...DAFTAR_OPSI_STATUS_KONTEN,
                ]}
              />

              <InputTeks
                label="Penanggung Jawab"
                placeholder="Mis. Owner, Raden, Editor"
                value={filter.pic}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, pic: e.target.value }))
                }
              />
            </div>

            {filterAktif && (
              <div className="mt-3 flex justify-end">
                <Tombol
                  varian="halus"
                  ukuran="sm"
                  onClick={() => setFilter(FILTER_KALENDER_DEFAULT)}
                >
                  Atur Ulang Semua Filter
                </Tombol>
              </div>
            )}
          </div>
        </Kartu>

        <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] px-4 py-2.5 text-xs text-[var(--teks-sekunder)]">
          Jam tayang usulan:{' '}
          <strong className="font-medium text-[var(--teks-utama)]">
            Reels IG/FB pagi 11.30
          </strong>{' '}
          •{' '}
          <strong className="font-medium text-[var(--teks-utama)]">
            Desain 16.30
          </strong>{' '}
          •{' '}
          <strong className="font-medium text-[var(--teks-utama)]">
            Reels malam 20.00
          </strong>{' '}
          •{' '}
          <strong className="font-medium text-[var(--teks-utama)]">
            TikTok 12.30 &amp; 19.30 WIB
          </strong>.
        </div>

        {modeTampilan === 'matriks' && (
          <TampilanMatriksHarian
            daftarHari={bundelHarian}
            filterAktif={filterAktif}
            onPilihKonten={(item) => setIdKontenDipilih(item.id)}
          />
        )}

        {modeTampilan === 'daftar' && (
          <TampilanDaftarMaster
            daftarKonten={kontenTersaring}
            filterAktif={filterAktif}
            onPilihKonten={(item) => setIdKontenDipilih(item.id)}
          />
        )}

        {modeTampilan === 'kalender' && (
          <TampilanKalenderVisual
            daftarHari={bundelHarian}
            filterAktif={filterAktif}
            onPilihKonten={(item) => setIdKontenDipilih(item.id)}
          />
        )}
          </div>
        </WadahHalaman>
      </div>

      <PanelDetailKonten
        konten={kontenAktif}
        onTutup={() => setIdKontenDipilih(null)}
        onSimpan={tanganiSimpanKonten}
      />

      <ModalKonfirmasi
        terbuka={modalResetTerbuka}
        onTutup={() => setModalResetTerbuka(false)}
        onKonfirmasi={tanganiKonfirmasiReset}
        judul="Kembalikan kalender ke rencana awal?"
        pesan="Perubahan status, catatan, dan tautan publikasi lokal akan dikembalikan ke 66 konten rencana awal."
        labelKonfirmasi="Ya, kembalikan ke rencana awal"
        berbahaya
      />

      <ModalEksporPdf
        terbuka={modalPdfTerbuka}
        onTutup={() => setModalPdfTerbuka(false)}
        jenisDefault="content-calendar"
        filterAwal={{
          tanggalMulai: filter.tanggal,
          tanggalSelesai: filter.tanggal,
          platform: filter.kanal,
          statusFilter: filter.status,
          kategoriFilter: filter.pilar,
        }}
      />
    </div>
  );
}
