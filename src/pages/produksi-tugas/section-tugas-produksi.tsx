import { useMemo, useState } from 'react';
import { AlertOctagon, Kanban, List, Plus } from 'lucide-react';
import { DAFTAR_ASSIGNEE_PERAN } from '../../data/produksi-kanonik';
import type {
  FilterTugasProduksi,
  PrioritasTugas,
  StatusTugasProduksi,
  TugasProduksi,
} from '../../types/produksi';
import {
  FILTER_TUGAS_DEFAULT,
  URUTAN_KANBAN_PRODUKSI,
  dapatkanInfoPrioritasTugas,
  dapatkanInfoStatusTugas,
  filterTugasProduksi,
} from '../../utils/produksi';
import {
  InputTeks,
  Kartu,
  KondisiKosong,
  SelectPilihan,
  StatusTeks,
  TabelData,
  Tombol,
} from '../../components/ui';
import type { KolomTabel } from '../../components/ui';

export interface SectionTugasProduksiProps {
  daftarTugas: TugasProduksi[];
  onPilihTugas: (tugas: TugasProduksi) => void;
  onTambahTugas: () => void;
  onUbahStatusCepat: (tugas: TugasProduksi, statusBaru: StatusTugasProduksi) => void;
}

type ModeTampilanTugas = 'kanban' | 'daftar';

const OPSI_STATUS_FILTER = [
  { nilai: 'semua', label: 'Semua Status' },
  { nilai: 'brief', label: 'Brief Awal' },
  { nilai: 'ready-to-shoot', label: 'Siap Rekam' },
  { nilai: 'shooting', label: 'Shooting' },
  { nilai: 'editing', label: 'Proses Edit' },
  { nilai: 'review', label: 'Menunggu Cek' },
  { nilai: 'approved', label: 'Disetujui' },
  { nilai: 'scheduled', label: 'Terjadwal' },
  { nilai: 'published', label: 'Sudah Tayang' },
  { nilai: 'blocked', label: 'Tertahan' },
  { nilai: 'cancelled', label: 'Dibatalkan' },
];

const OPSI_STATUS_CEPAT = OPSI_STATUS_FILTER.filter((o) => o.nilai !== 'semua');

export function SectionTugasProduksi({
  daftarTugas,
  onPilihTugas,
  onTambahTugas,
  onUbahStatusCepat,
}: SectionTugasProduksiProps) {
  const [mode, setMode] = useState<ModeTampilanTugas>('kanban');
  const [filter, setFilter] = useState<FilterTugasProduksi>(FILTER_TUGAS_DEFAULT);

  const filterAktif = useMemo(
    () =>
      Boolean(
        filter.kataKunci.trim() ||
          filter.status !== 'semua' ||
          filter.prioritas !== 'semua' ||
          filter.assignee.trim(),
      ),
    [filter],
  );

  const tugasTersaring = useMemo(
    () => filterTugasProduksi(daftarTugas, filter),
    [daftarTugas, filter],
  );

  const tugasTertahanAtauBatal = useMemo(
    () =>
      tugasTersaring.filter(
        (t) => t.status === 'blocked' || t.status === 'cancelled',
      ),
    [tugasTersaring],
  );

  const kolomTabel: KolomTabel<TugasProduksi>[] = [
    {
      kunci: 'judul',
      judul: 'Tugas & Fase',
      render: (baris) => (
        <div className="min-w-[240px] max-w-[360px]">
          <button
            type="button"
            onClick={() => onPilihTugas(baris)}
            className="text-left font-medium text-[var(--teks-utama)] hover:text-[var(--aksen-maroon-teks)] transition-colors cursor-pointer"
          >
            {baris.judul}
          </button>
          <p className="mt-0.5 text-xs text-[var(--teks-redup)]">
            {baris.fase}
            {baris.adalahMilestoneKritis11Des ? ' • Batas Kritis < 11 Des' : ''}
          </p>
        </div>
      ),
    },
    {
      kunci: 'tenggat',
      judul: 'Tenggat',
      render: (baris) => (
        <span className="text-xs font-medium angka-tabular whitespace-nowrap">
          {baris.tenggat}
        </span>
      ),
    },
    {
      kunci: 'assignee',
      judul: 'Penanggung Jawab',
      render: (baris) => (
        <span className="text-xs text-[var(--teks-sekunder)]">
          {baris.assignee}
        </span>
      ),
    },
    {
      kunci: 'prioritas',
      judul: 'Prioritas',
      render: (baris) => {
        const info = dapatkanInfoPrioritasTugas(baris.prioritas);
        return <StatusTeks labelKustom={info.label} nadaKustom={info.nada} />;
      },
    },
    {
      kunci: 'status',
      judul: 'Status',
      render: (baris) => {
        const info = dapatkanInfoStatusTugas(baris.status);
        return <StatusTeks labelKustom={info.label} nadaKustom={info.nada} />;
      },
    },
    {
      kunci: 'tertaut',
      judul: 'Konten Tertaut',
      perataan: 'kanan',
      render: (baris) => (
        <span className="text-xs font-medium angka-tabular">
          {baris.kontenTertaut.length} aset
        </span>
      ),
    },
    {
      kunci: 'approver',
      judul: 'Penyetuju / Kendala',
      render: (baris) => (
        <div className="max-w-[220px] text-xs">
          {baris.status === 'blocked' ? (
            <span className="text-[var(--status-bahaya)] font-medium">
              Tertahan: {baris.alasanBlocked || 'Alasan belum diisi'}
            </span>
          ) : (
            <span className="text-[var(--teks-sekunder)]">
              {baris.approver || 'Belum ditetapkan'}
            </span>
          )}
        </div>
      ),
    },
    {
      kunci: 'aksi',
      judul: 'Aksi',
      perataan: 'kanan',
      render: (baris) => (
        <Tombol
          varian="sekunder"
          ukuran="sm"
          onClick={() => onPilihTugas(baris)}
        >
          Kelola
        </Tombol>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Kartu>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pilih tampilan tugas produksi">
            <Tombol
              varian={mode === 'kanban' ? 'primer' : 'sekunder'}
              ukuran="sm"
              className="!transition-none"
              ikonKiri={<Kanban className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => setMode('kanban')}
              aria-pressed={mode === 'kanban'}
            >
              Papan Progres (8 Tahap)
            </Tombol>
            <Tombol
              varian={mode === 'daftar' ? 'primer' : 'sekunder'}
              ukuran="sm"
              className="!transition-none"
              ikonKiri={<List className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => setMode('daftar')}
              aria-pressed={mode === 'daftar'}
            >
              Daftar Tugas ({tugasTersaring.length})
            </Tombol>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3">
            <span className="text-xs text-[var(--teks-redup)]">
              Menampilkan{' '}
              <strong className="font-semibold text-[var(--teks-utama)] angka-tabular">
                {tugasTersaring.length}
              </strong>{' '}
              tugas
            </span>
            <Tombol
              varian="primer"
              ukuran="sm"
              ikonKiri={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={onTambahTugas}
            >
              Tambah Tugas
            </Tombol>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <InputTeks
            label="Cari Tugas"
            placeholder="Cari judul, fase, catatan..."
            value={filter.kataKunci}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, kataKunci: e.target.value }))
            }
          />

          <SelectPilihan
            label="Status"
            value={filter.status}
            opsi={OPSI_STATUS_FILTER}
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                status: e.target.value as StatusTugasProduksi | 'semua',
              }))
            }
          />

          <SelectPilihan
            label="Prioritas"
            value={filter.prioritas}
            opsi={[
              { nilai: 'semua', label: 'Semua Prioritas' },
              { nilai: 'kritis', label: 'Kritis' },
              { nilai: 'tinggi', label: 'Tinggi' },
              { nilai: 'sedang', label: 'Sedang' },
              { nilai: 'rendah', label: 'Rendah' },
            ]}
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                prioritas: e.target.value as PrioritasTugas | 'semua',
              }))
            }
          />

          <SelectPilihan
            label="Penanggung Jawab"
            value={filter.assignee}
            placeholderOpsi="Semua Peran"
            opsi={DAFTAR_ASSIGNEE_PERAN.map((peran) => ({
              nilai: peran,
              label: peran,
            }))}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, assignee: e.target.value }))
            }
          />
        </div>

        {filterAktif && (
          <div className="mt-3 flex justify-end">
            <Tombol
              varian="halus"
              ukuran="sm"
              onClick={() => setFilter(FILTER_TUGAS_DEFAULT)}
            >
              Atur Ulang Filter
            </Tombol>
          </div>
        )}
      </Kartu>

      {mode === 'kanban' ? (
        <div className="space-y-4">
          {tugasTersaring.length === 0 ? (
            <KondisiKosong
              judul="Tidak ada tugas yang sesuai filter"
              deskripsi="Atur ulang filter di atas atau tambahkan tugas produksi baru."
            />
          ) : (
            <div
              className="flex gap-3 overflow-x-auto pb-3"
              aria-label="Papan kanban 8 tahap produksi"
            >
              {URUTAN_KANBAN_PRODUKSI.map((statusKolom) => {
                const infoKolom = dapatkanInfoStatusTugas(statusKolom);
                const itemKolom = tugasTersaring.filter(
                  (t) => t.status === statusKolom,
                );

                return (
                  <section
                    key={statusKolom}
                    aria-label={`Kolom ${infoKolom.label}`}
                    className="w-[272px] shrink-0 rounded-[var(--radius-md)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] flex flex-col"
                  >
                    <header className="px-3 py-2.5 border-b border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70 flex items-center justify-between gap-2">
                      <StatusTeks
                        labelKustom={infoKolom.label}
                        nadaKustom={infoKolom.nada}
                      />
                      <span className="text-xs font-semibold text-[var(--teks-redup)] angka-tabular">
                        {itemKolom.length}
                      </span>
                    </header>

                    <div className="p-2.5 space-y-2.5 flex-1 min-h-[140px]">
                      {itemKolom.length === 0 ? (
                        <p className="py-6 text-center text-xs text-[var(--teks-redup)]">
                          Kosong
                        </p>
                      ) : (
                        itemKolom.map((tugas) => {
                          const infoPrio = dapatkanInfoPrioritasTugas(
                            tugas.prioritas,
                          );
                          return (
                            <article
                              key={tugas.id}
                              className={`rounded-[var(--radius-sm)] border p-3 space-y-2 ${
                                tugas.adalahMilestoneKritis11Des
                                  ? 'border-[var(--aksen-maroon-garis)]/45 bg-[var(--aksen-maroon-lembut)]/65'
                                  : 'border-[var(--garis-halus)] bg-[var(--bg-permukaan)]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <StatusTeks
                                  labelKustom={infoPrio.label}
                                  nadaKustom={infoPrio.nada}
                                />
                                <span className="text-[11px] font-medium text-[var(--teks-redup)] angka-tabular">
                                  {tugas.tenggat}
                                </span>
                              </div>

                              {tugas.adalahMilestoneKritis11Des && (
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--aksen-maroon-teks)]">
                                  Batas Kritis &lt; 11 Des
                                </p>
                              )}

                              <button
                                type="button"
                                onClick={() => onPilihTugas(tugas)}
                                className="block w-full text-left text-sm font-medium text-[var(--teks-utama)] hover:text-[var(--aksen-maroon-teks)] leading-snug cursor-pointer"
                              >
                                {tugas.judul}
                              </button>

                              <div className="text-[11px] text-[var(--teks-redup)] space-y-0.5">
                                <p>Peran: {tugas.assignee}</p>
                                <p>
                                  Tertaut:{' '}
                                  <strong className="font-medium text-[var(--teks-sekunder)] angka-tabular">
                                    {tugas.kontenTertaut.length}
                                  </strong>{' '}
                                  aset kalender
                                </p>
                              </div>

                              <div className="pt-1 border-t border-[var(--garis-halus)] flex items-center justify-between gap-2">
                                <label
                                  htmlFor={`quick-status-${tugas.id}`}
                                  className="sr-only"
                                >
                                  Ubah status cepat untuk {tugas.judul}
                                </label>
                                <select
                                  id={`quick-status-${tugas.id}`}
                                  value={tugas.status}
                                  onChange={(e) =>
                                    onUbahStatusCepat(
                                      tugas,
                                      e.target.value as StatusTugasProduksi,
                                    )
                                  }
                                  className="h-7 flex-1 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-2 text-[11px] text-[var(--teks-utama)]"
                                >
                                  {OPSI_STATUS_CEPAT.map((opt) => (
                                    <option key={opt.nilai} value={opt.nilai}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                <Tombol
                                  varian="halus"
                                  ukuran="sm"
                                  className="!h-7 !px-2 !text-[11px]"
                                  onClick={() => onPilihTugas(tugas)}
                                >
                                  Detail
                                </Tombol>
                              </div>
                            </article>
                          );
                        })
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          <Kartu
            judul="Tugas Tertahan & Dibatalkan"
            subjudul="Tugas yang tertahan wajib disertai alasan kendala"
            aksiHeader={
              <StatusTeks
                labelKustom={`${tugasTertahanAtauBatal.length} tugas`}
                nadaKustom={
                  tugasTertahanAtauBatal.some((t) => t.status === 'blocked')
                    ? 'bahaya'
                    : 'netral'
                }
              />
            }
          >
            {tugasTertahanAtauBatal.length === 0 ? (
              <p className="text-xs text-[var(--teks-redup)]">
                Belum ada tugas yang tertahan atau dibatalkan.
              </p>
            ) : (
              <div className="divide-y divide-[var(--garis-halus)]">
                {tugasTertahanAtauBatal.map((tugas) => {
                  const infoStatus = dapatkanInfoStatusTugas(tugas.status);
                  return (
                    <div
                      key={tugas.id}
                      className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <AlertOctagon
                            className="h-4 w-4 text-[var(--status-bahaya)] shrink-0"
                            aria-hidden="true"
                          />
                          <StatusTeks
                            labelKustom={infoStatus.label}
                            nadaKustom={infoStatus.nada}
                          />
                          <span className="text-xs text-[var(--teks-redup)] angka-tabular">
                            Tenggat {tugas.tenggat}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[var(--teks-utama)]">
                          {tugas.judul}
                        </p>
                        {tugas.alasanBlocked && (
                          <p className="text-xs text-[var(--status-bahaya)]">
                            Alasan tertahan: {tugas.alasanBlocked}
                          </p>
                        )}
                      </div>
                      <Tombol
                        varian="sekunder"
                        ukuran="sm"
                        onClick={() => onPilihTugas(tugas)}
                      >
                        Tindak Lanjuti
                      </Tombol>
                    </div>
                  );
                })}
              </div>
            )}
          </Kartu>
        </div>
      ) : (
        <TabelData
          keteranganTabel="Daftar tugas operasional produksi Ragi Hotang"
          kolom={kolomTabel}
          data={tugasTersaring}
          kunciBaris={(baris) => baris.id}
          filterAktif={filterAktif}
        />
      )}
    </div>
  );
}
