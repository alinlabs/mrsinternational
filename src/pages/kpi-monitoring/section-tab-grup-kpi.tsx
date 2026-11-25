import { Plus, Trash2 } from 'lucide-react';
import { INFO_GRUP_KPI_KANONIK } from '../../data/kpi-kanonik';
import type {
  GrupKpi,
  InquiryKualifikasi,
  SnapshotKpiAktual,
} from '../../types/kpi';
import { formatTanggalWib } from '../../utils/format';
import {
  dapatkanDefinisiMetrik,
  dapatkanLabelPlatformKpi,
  dapatkanMetrikByGrup,
  formatNilaiMetrik,
  hitungPeringkatKontenAktual,
  hitungRingkasanMetrikGrup,
} from '../../utils/kpi';
import {
  Kartu,
  KondisiKosong,
  StatusTeks,
  TabelData,
  Tombol,
} from '../../components/ui';
import type { KolomTabel } from '../../components/ui';
import { GrafikPerformaKpi } from './grafik-performa-kpi';

export interface SectionTabGrupKpiProps {
  grup: GrupKpi;
  daftarSnapshotTersaring: SnapshotKpiAktual[];
  daftarInquiry: InquiryKualifikasi[];
  modeContoh: boolean;
  onBukaTambahManual: (grup: GrupKpi) => void;
  onHapusSnapshot: (idSnapshot: string) => void;
}

export function SectionTabGrupKpi({
  grup,
  daftarSnapshotTersaring,
  daftarInquiry,
  modeContoh,
  onBukaTambahManual,
  onHapusSnapshot,
}: SectionTabGrupKpiProps) {
  const infoGrup =
    INFO_GRUP_KPI_KANONIK.find((g) => g.id === grup) ??
    INFO_GRUP_KPI_KANONIK[0];

  const ringkasanMetrik = hitungRingkasanMetrikGrup(
    daftarSnapshotTersaring,
    grup,
    daftarInquiry,
  );

  const catatanGrup = daftarSnapshotTersaring
    .filter((s) => s.grup === grup)
    .sort((a, b) => b.periode.localeCompare(a.periode));

  const kodeMetrikUtama = dapatkanMetrikByGrup(grup)[0]?.kode ?? '';
  const defMetrikUtama = dapatkanDefinisiMetrik(kodeMetrikUtama);
  const peringkatKonten = hitungPeringkatKontenAktual(
    daftarSnapshotTersaring,
    grup,
    kodeMetrikUtama,
  );

  const kolomTabel: KolomTabel<SnapshotKpiAktual>[] = [
    {
      kunci: 'periode',
      judul: 'Periode',
      render: (b) => (
        <span className="angka-tabular font-medium text-[var(--teks-utama)]">
          {b.periode}
        </span>
      ),
    },
    {
      kunci: 'metrik',
      judul: 'Metrik',
      render: (b) => {
        const def = dapatkanDefinisiMetrik(b.kodeMetrik);
        return (
          <div>
            <p className="font-medium text-[var(--teks-utama)]">
              {def?.nama ?? b.kodeMetrik}
            </p>
            {b.notes && (
              <p className="text-[11px] text-[var(--teks-redup)]">{b.notes}</p>
            )}
          </div>
        );
      },
    },
    {
      kunci: 'platform',
      judul: 'Platform & Konten',
      render: (b) => (
        <div>
          <p className="text-[var(--teks-utama)]">
            {dapatkanLabelPlatformKpi(b.platform)}
          </p>
          <p className="text-[11px] text-[var(--teks-redup)]">
            {b.kampanyeAtauKonten || '—'}
          </p>
        </div>
      ),
    },
    {
      kunci: 'nilai',
      judul: 'Nilai Aktual',
      perataan: 'kanan',
      render: (b) => {
        const def = dapatkanDefinisiMetrik(b.kodeMetrik);
        return (
          <span className="font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
            {def ? formatNilaiMetrik(b.nilai, def.satuan) : b.nilai}
          </span>
        );
      },
    },
    {
      kunci: 'sumber',
      judul: 'Sumber & Tanggal',
      render: (b) => (
        <div className="text-[11px]">
          <p className="font-medium text-[var(--teks-utama)]">{b.source}</p>
          <p className="text-[var(--teks-redup)]">
            Lapor {b.reportedAt} • Penanggung jawab: {b.pic}
          </p>
          <p className="text-[var(--teks-redup)]">
            Masuk {formatTanggalWib(b.importedAt)}
          </p>
        </div>
      ),
    },
    {
      kunci: 'aksi',
      judul: 'Aksi',
      perataan: 'kanan',
      render: (b) =>
        b.dataContoh ? (
          <StatusTeks status="sample" labelKustom="Data contoh" />
        ) : (
          <Tombol
            varian="halus"
            ukuran="sm"
            aria-label={`Hapus catatan ${b.kodeMetrik} tanggal ${b.periode}`}
            onClick={() => onHapusSnapshot(b.id)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </Tombol>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Panduan membaca kelompok KPI + grid kartu metrik */}
      <Kartu
        judul={`Kategori KPI: ${infoGrup.nama}`}
        subjudul={`Panduan: ${infoGrup.caraMembaca}`}
        aksiHeader={
          <Tombol
            varian="primer"
            ukuran="sm"
            ikonKiri={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={() => onBukaTambahManual(grup)}
          >
            Catat {infoGrup.nama}
          </Tombol>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {ringkasanMetrik.map((item) => (
            <div
              key={item.definisi.kode}
              style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
              className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 p-4 flex flex-col justify-between shadow-[var(--bayangan-halus)]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-[var(--teks-utama)]">
                    {item.definisi.nama}
                  </p>
                  <StatusTeks
                    status={
                      modeContoh && item.nilaiAgregat !== null
                        ? 'sample'
                        : item.nilaiAgregat !== null
                          ? 'actual'
                          : 'not-configured'
                    }
                    labelKustom={
                      modeContoh && item.nilaiAgregat !== null
                        ? 'Contoh'
                        : item.nilaiAgregat !== null
                          ? `${item.jumlahCatatan} catatan`
                          : 'Kosong'
                    }
                  />
                </div>
                <p className="mt-2 text-lg font-semibold text-[var(--teks-utama)] angka-tabular">
                  {formatNilaiMetrik(item.nilaiAgregat, item.definisi.satuan)}
                </p>
              </div>
              <p className="mt-2 text-[11px] text-[var(--teks-redup)] leading-snug">
                {item.sumberTerakhir
                  ? `Sumber: ${item.sumberTerakhir} (${item.periodeTerakhir})`
                  : item.definisi.keterangan}
              </p>
            </div>
          ))}
        </div>
      </Kartu>

      {/* Grafik Perbandingan Periode + Peringkat Konten Aktual */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7">
          <GrafikPerformaKpi
            grup={grup}
            namaGrup={infoGrup.nama}
            daftarSnapshot={daftarSnapshotTersaring}
            modeContoh={modeContoh}
          />
        </div>

        <div className="xl:col-span-5">
          <Kartu
            judul={`Peringkat Konten (${infoGrup.nama})`}
            subjudul={`Disusun dari ${defMetrikUtama?.nama ?? 'metrik utama'} yang tercatat.`}
            aksiHeader={
              modeContoh && peringkatKonten.length > 0 ? (
                <StatusTeks status="sample" labelKustom="Data contoh" />
              ) : undefined
            }
          >
            {peringkatKonten.length === 0 ? (
              <KondisiKosong
                judul="Belum ada peringkat konten"
                deskripsi="Peringkat muncul otomatis setelah hasil per konten dicatat atau diimpor."
              />
            ) : (
              <ol className="divide-y divide-[var(--garis-halus)] text-xs">
                {peringkatKonten.slice(0, 6).map((baris, idx) => (
                  <li
                    key={baris.kampanyeAtauKonten}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--teks-utama)] truncate">
                        {idx + 1}. {baris.kampanyeAtauKonten}
                      </p>
                      <p className="text-[11px] text-[var(--teks-redup)]">
                        {dapatkanLabelPlatformKpi(baris.platformTerakhir)} •{' '}
                        {baris.periodeTerakhir}
                      </p>
                    </div>
                    <span className="font-semibold text-[var(--aksen-maroon-teks)] angka-tabular shrink-0">
                      {defMetrikUtama
                        ? formatNilaiMetrik(
                            baris.totalNilaiUtama,
                            defMetrikUtama.satuan,
                          )
                        : baris.totalNilaiUtama}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Kartu>
        </div>
      </div>

      {/* Tabel Catatan Data Aktual */}
      <Kartu
        judul={`Catatan Data Aktual — ${infoGrup.nama}`}
        subjudul="Setiap data mencatat sumber, tanggal, dan penanggung jawab."
      >
        {catatanGrup.length === 0 ? (
          <KondisiKosong
            judul={`Belum ada catatan ${infoGrup.nama}`}
            deskripsi="Klik Tambah Data Aktual atau Impor CSV untuk memasukkan hasil platform."
          />
        ) : (
          <TabelData
            keteranganTabel={`Daftar catatan aktual ${infoGrup.nama}`}
            kolom={kolomTabel}
            data={catatanGrup}
            kunciBaris={(baris) => baris.id}
          />
        )}
      </Kartu>
    </div>
  );
}
