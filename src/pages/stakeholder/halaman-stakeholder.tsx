import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Lock,
  Plus,
  Users,
} from 'lucide-react';
import { ModalEksporPdf } from '../../components/domain/modal-ekspor-pdf';
import {
  FILTER_STAKEHOLDER_DEFAULT,
  KATEGORI_STAKEHOLDER_KANONIK,
  PIPELINE_OUTREACH_KANONIK,
  PRIORITAS_STAKEHOLDER_KANONIK,
  SEED_STAKEHOLDER_KOSONG,
} from '../../data/stakeholder-kanonik';
import { gunakanSesiAplikasi } from '../../hooks/gunakan-sesi-aplikasi';
import {
  ambilDaftarStakeholderApi,
  hapusStakeholderApi,
  perbaruiStakeholderApi,
  tambahLogOutreachApi,
  tambahStakeholderApi,
} from '../../services/layanan-stakeholder';
import type {
  FilterStakeholder,
  InputStakeholderBaru,
  KategoriStakeholder,
  PrioritasStakeholder,
  RecordStakeholder,
  StatusPipelineOutreach,
  UrutanStakeholder,
} from '../../types/stakeholder';
import { formatTanggalWib } from '../../utils/format';
import {
  dapatkanInfoStatusPipeline,
  dapatkanLabelChannelOutreach,
  dapatkanLabelKategoriStakeholder,
  filterDanUrutkanStakeholder,
  hitungRingkasanStakeholder,
  paginasiStakeholder,
} from '../../utils/stakeholder';
import { WadahHalaman } from '../../components/layout/wadah-halaman';
import {
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
import { KartuAksesStakeholder } from './kartu-akses-stakeholder';
import { ModalFormStakeholder } from './modal-form-stakeholder';
import {
  KontrolEksporStakeholder,
  ModalImporCsvStakeholder,
} from './modal-impor-ekspor-stakeholder';
import { PanelDetailStakeholder } from './panel-detail-stakeholder';

export default function HalamanStakeholder() {
  const { sesi, tokenBearer } = gunakanSesiAplikasi();
  const { tampilkanToast } = gunakanToast();

  const [daftarStakeholder, setDaftarStakeholder] = useState<
    RecordStakeholder[]
  >(SEED_STAKEHOLDER_KOSONG);
  const [aksesKontakPrivat, setAksesKontakPrivat] = useState(false);
  const [sedangMuat, setSedangMuat] = useState(false);

  const [filter, setFilter] = useState<FilterStakeholder>(
    FILTER_STAKEHOLDER_DEFAULT,
  );
  const [halaman, setHalaman] = useState(1);

  const [modalFormTerbuka, setModalFormTerbuka] = useState(false);
  const [stakeholderEdit, setStakeholderEdit] =
    useState<RecordStakeholder | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [modalCsvTerbuka, setModalCsvTerbuka] = useState(false);
  const [modalPdfTerbuka, setModalPdfTerbuka] = useState(false);
  const [stakeholderDipilih, setStakeholderDipilih] =
    useState<RecordStakeholder | null>(null);

  const muatStakeholder = useCallback(async () => {
    if (!sesi.terautentikasi || !tokenBearer) {
      setDaftarStakeholder(SEED_STAKEHOLDER_KOSONG);
      setAksesKontakPrivat(false);
      return;
    }
    setSedangMuat(true);
    try {
      const resp = await ambilDaftarStakeholderApi(tokenBearer);
      if (resp.ok && resp.data) {
        setDaftarStakeholder(resp.data.daftarStakeholder);
        setAksesKontakPrivat(resp.data.aksesKontakPrivat);
      }
    } finally {
      setSedangMuat(false);
    }
  }, [sesi.terautentikasi, tokenBearer]);

  useEffect(() => {
    void muatStakeholder();
  }, [muatStakeholder]);

  const ringkasan = useMemo(
    () => hitungRingkasanStakeholder(daftarStakeholder),
    [daftarStakeholder],
  );

  const tersaring = useMemo(
    () => filterDanUrutkanStakeholder(daftarStakeholder, filter),
    [daftarStakeholder, filter],
  );

  const { itemHalaman, totalHalaman, halamanAman } = useMemo(
    () => paginasiStakeholder(tersaring, halaman, 10),
    [tersaring, halaman],
  );

  const filterAktif = Boolean(
    filter.kataKunci.trim() ||
      filter.kategori !== 'semua' ||
      filter.prioritas !== 'semua' ||
      filter.statusPipeline !== 'semua',
  );

  const tanganiSimpanForm = async (
    input: InputStakeholderBaru,
    idEdit?: string,
  ) => {
    setSedangSimpan(true);
    const resp = idEdit
      ? await perbaruiStakeholderApi(tokenBearer, idEdit, input)
      : await tambahStakeholderApi(tokenBearer, input);
    setSedangSimpan(false);

    if (!resp.ok || !resp.data) {
      tampilkanToast({
        jenis: 'galat',
        judul: 'Gagal menyimpan data tamu',
        pesan: resp.error?.message ?? 'Periksa hak akses atau isian Anda.',
      });
      return;
    }

    setModalFormTerbuka(false);
    setStakeholderEdit(null);
    if (stakeholderDipilih?.id === resp.data.id) {
      setStakeholderDipilih(resp.data);
    }
    await muatStakeholder();
    tampilkanToast({
      jenis: 'sukses',
      judul: idEdit ? 'Data tamu diperbarui' : 'Tamu baru ditambahkan',
    });
  };

  const kolomTabel: KolomTabel<RecordStakeholder>[] = [
    {
      kunci: 'nama',
      judul: 'Nama & Organisasi',
      render: (item) => (
        <div className="min-w-[200px]">
          <button
            type="button"
            onClick={() => setStakeholderDipilih(item)}
            className="text-left font-medium text-[var(--teks-utama)] hover:text-[var(--aksen-maroon-teks)] cursor-pointer"
          >
            {item.namaLengkap}
          </button>
          <p className="mt-0.5 text-xs text-[var(--teks-redup)]">
            {item.jabatanOrganisasi}
          </p>
        </div>
      ),
    },
    {
      kunci: 'kategori',
      judul: 'Kategori & Prioritas',
      render: (item) => (
        <div className="text-xs">
          <p className="font-semibold text-[var(--aksen-maroon-teks)]">
            Prioritas {item.prioritas}
          </p>
          <p className="text-[11px] text-[var(--teks-sekunder)]">
            {dapatkanLabelKategoriStakeholder(item.kategori)}
          </p>
        </div>
      ),
    },
    {
      kunci: 'skor',
      judul: 'Skor Relasi',
      perataan: 'kanan',
      render: (item) => (
        <div className="text-xs whitespace-nowrap">
          <strong className="text-[var(--teks-utama)] angka-tabular">
            {item.skor.totalSkor}
          </strong>
          <span className="text-[var(--teks-redup)]"> / 100</span>
        </div>
      ),
    },
    {
      kunci: 'pipeline',
      judul: 'Status Undangan',
      render: (item) => {
        const info = dapatkanInfoStatusPipeline(item.statusPipeline);
        return <StatusTeks labelKustom={info.label} nadaKustom={info.nada} />;
      },
    },
    {
      kunci: 'kontak',
      judul: 'Kontak (Privat)',
      render: (item) => (
        <div className="text-xs">
          <p className="text-[var(--teks-sekunder)]">
            {dapatkanLabelChannelOutreach(item.channelUtama)}
          </p>
          {item.kontakTersensor ? (
            <p className="inline-flex items-center gap-1 text-[11px] text-[var(--status-peringatan)]">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Tersensor
            </p>
          ) : (
            <p className="font-mono text-[11px] text-[var(--teks-utama)]">
              {item.contactValue || 'Belum diisi'}
            </p>
          )}
        </div>
      ),
    },
    {
      kunci: 'nextAction',
      judul: 'Penanggung Jawab & Tindak Lanjut',
      render: (item) => (
        <div className="text-xs min-w-[160px]">
          <p className="text-[var(--teks-utama)]">
            {item.nextAction || 'Belum ditentukan'}
          </p>
          <p className="text-[11px] text-[var(--teks-redup)]">
            Penanggung jawab: {item.relationshipOwner}
            {item.dueDate ? ` • ${formatTanggalWib(item.dueDate)}` : ''}
          </p>
        </div>
      ),
    },
    {
      kunci: 'aksi',
      judul: 'Aksi',
      perataan: 'kanan',
      render: (item) => (
        <Tombol
          varian="sekunder"
          ukuran="sm"
          onClick={() => setStakeholderDipilih(item)}
        >
          Detail
        </Tombol>
      ),
    },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain print:overflow-visible">
      <WadahHalaman>
        <HeaderHalaman
          labelTahap="Lini Relasi · Kurasi & Verifikasi Tamu"
          judul="Relasi & Undangan VIP"
          tujuan="Kelola daftar buyer, KOL, media, serta kurasi internal pendaftar kuota terbatas agar undangan tepat sasaran dengan perlindungan privasi."
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
                disabled={!aksesKontakPrivat}
                ikonKiri={
                  <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                }
                onClick={() => setModalCsvTerbuka(true)}
              >
                Impor CSV
              </Tombol>
              <Tombol
                varian="primer"
                ukuran="sm"
                disabled={!aksesKontakPrivat}
                ikonKiri={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => {
                  setStakeholderEdit(null);
                  setModalFormTerbuka(true);
                }}
              >
                Tambah Tamu / Relasi
              </Tombol>
            </div>
          }
        />

        <div className="space-y-8 pb-8">
          <KartuAksesStakeholder aksesKontakPrivat={aksesKontakPrivat} />

          {/* 6 Ringkasan Tamu & Relasi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { label: 'Total Terdaftar', nilai: ringkasan.total },
              { label: 'Prioritas A', nilai: ringkasan.prioritasA },
              { label: 'Sudah Dihubungi', nilai: ringkasan.contacted },
              { label: 'Sudah Merespons', nilai: ringkasan.replied },
              {
                label: 'Minta Pertemuan / Katalog',
                nilai: ringkasan.meetingRequested,
              },
              { label: 'Perlu Segera Dihubungi', nilai: ringkasan.overdue },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 p-4 text-center flex flex-col items-center justify-center shadow-[var(--bayangan-halus)]"
              >
                <p className="text-[11px] font-medium text-[var(--teks-redup)]">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-2xl font-semibold text-[var(--teks-utama)] angka-tabular">
                  {stat.nilai}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-sekunder)]">
                  {stat.nilai === 0 ? 'Belum diisi' : 'Tercatat'}
                </p>
              </div>
            ))}
          </div>

        {/* 5 Segmen Tamu & Relasi */}
        <Kartu
          judul="5 Segmen Tamu & Relasi"
          subjudul="Klik segmen untuk menyaring daftar."
          aksiHeader={
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--teks-redup)]">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />5 Segmen
            </span>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {KATEGORI_STAKEHOLDER_KANONIK.map((kat) => {
              const aktif = filter.kategori === kat.nilai;
              return (
                <button
                  key={kat.nilai}
                  type="button"
                  aria-pressed={aktif}
                  onClick={() => {
                    setFilter((prev) => ({
                      ...prev,
                      kategori: aktif ? 'semua' : kat.nilai,
                    }));
                    setHalaman(1);
                  }}
                  style={!aktif ? { backgroundImage: 'var(--gradasi-kartu-lembut)' } : undefined}
                  className={`rounded-[var(--radius-md)] border p-3.5 text-center transition-colors cursor-pointer ${
                    aktif
                      ? 'border-[var(--aksen-maroon-garis)] bg-[var(--aksen-maroon-lembut)]/70'
                      : 'border-[var(--aksen-maroon-garis)]/25 hover:border-[var(--aksen-maroon-garis)]/45'
                  }`}
                >
                  <p className="text-xs font-semibold text-[var(--aksen-maroon-teks)]">
                    {kat.label}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--teks-sekunder)] leading-relaxed">
                    {kat.fokusPesan}
                  </p>
                </button>
              );
            })}
          </div>
        </Kartu>

        {/* Filter, Sort & Ekspor */}
        <Kartu>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <p className="text-xs text-[var(--teks-sekunder)]">
              Menampilkan{' '}
              <strong className="font-semibold text-[var(--teks-utama)] angka-tabular">
                {tersaring.length}
              </strong>{' '}
              dari{' '}
              <strong className="font-semibold text-[var(--teks-utama)] angka-tabular">
                {daftarStakeholder.length}
              </strong>{' '}
              tamu terdaftar
            </p>
            <KontrolEksporStakeholder
              tokenBearer={tokenBearer}
              aksesKontakPrivat={aksesKontakPrivat}
              jumlahData={daftarStakeholder.length}
            />
          </div>

          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <InputTeks
              label="Cari Nama / Instansi / Penanggung Jawab"
              placeholder="Cari nama..."
              value={filter.kataKunci}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, kataKunci: e.target.value }));
                setHalaman(1);
              }}
            />

            <SelectPilihan
              label="Kategori"
              value={filter.kategori}
              opsi={[
                { nilai: 'semua', label: 'Semua Kategori' },
                ...KATEGORI_STAKEHOLDER_KANONIK.map((k) => ({
                  nilai: k.nilai,
                  label: k.label,
                })),
              ]}
              onChange={(e) => {
                setFilter((prev) => ({
                  ...prev,
                  kategori: e.target.value as KategoriStakeholder | 'semua',
                }));
                setHalaman(1);
              }}
            />

            <SelectPilihan
              label="Prioritas"
              value={filter.prioritas}
              opsi={[
                { nilai: 'semua', label: 'Semua Prioritas' },
                ...PRIORITAS_STAKEHOLDER_KANONIK.map((p) => ({
                  nilai: p.nilai,
                  label: p.label,
                })),
              ]}
              onChange={(e) => {
                setFilter((prev) => ({
                  ...prev,
                  prioritas: e.target.value as PrioritasStakeholder | 'semua',
                }));
                setHalaman(1);
              }}
            />

            <SelectPilihan
              label="Status Pipeline"
              value={filter.statusPipeline}
              opsi={[
                { nilai: 'semua', label: 'Semua Status' },
                ...PIPELINE_OUTREACH_KANONIK.map((p) => ({
                  nilai: p.nilai,
                  label: p.label,
                })),
              ]}
              onChange={(e) => {
                setFilter((prev) => ({
                  ...prev,
                  statusPipeline: e.target.value as
                    | StatusPipelineOutreach
                    | 'semua',
                }));
                setHalaman(1);
              }}
            />

            <SelectPilihan
              label="Urutkan"
              value={filter.urutan}
              opsi={[
                { nilai: 'skor-tertinggi', label: 'Skor Relasi Tertinggi' },
                { nilai: 'prioritas-a-ke-c', label: 'Prioritas A → C' },
                { nilai: 'tenggat-terdekat', label: 'Tenggat Terdekat' },
                { nilai: 'nama-az', label: 'Nama A → Z' },
              ]}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  urutan: e.target.value as UrutanStakeholder,
                }))
              }
            />
          </div>

          {filterAktif && (
            <div className="mt-3 flex justify-end">
              <Tombol
                varian="halus"
                ukuran="sm"
                onClick={() => {
                  setFilter(FILTER_STAKEHOLDER_DEFAULT);
                  setHalaman(1);
                }}
              >
                Atur Ulang Filter
              </Tombol>
            </div>
          )}
        </Kartu>

        {!sesi.terautentikasi ? (
          <KondisiKosong
            judul="Masuk terlebih dahulu untuk melihat daftar tamu & kontak"
            deskripsi="Rincian kontak tamu dijaga khusus bagi pengelola dan penanggung jawab tamu yang berwenang."
          />
        ) : sedangMuat ? (
          <Kartu>
            <p className="text-xs text-[var(--teks-redup)] py-6 text-center">
              Memuat daftar tamu &amp; relasi...
            </p>
          </Kartu>
        ) : itemHalaman.length === 0 ? (
          <KondisiKosong
            judul={
              filterAktif
                ? 'Tidak ada tamu yang cocok dengan filter'
                : 'Belum ada tamu atau relasi yang dicatat'
            }
            deskripsi={
              filterAktif
                ? 'Ubah kata kunci pencarian atau pilih "Semua Kategori".'
                : 'Daftar dimulai kosong. Tambahkan kontak tamu undangan atau impor dari file CSV.'
            }
            aksi={
              aksesKontakPrivat && !filterAktif ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Tombol
                    varian="sekunder"
                    ukuran="sm"
                    onClick={() => setModalCsvTerbuka(true)}
                  >
                    Impor File CSV
                  </Tombol>
                  <Tombol
                    varian="primer"
                    ukuran="sm"
                    onClick={() => {
                      setStakeholderEdit(null);
                      setModalFormTerbuka(true);
                    }}
                  >
                    Tambah Tamu Pertama
                  </Tombol>
                </div>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            <TabelData
              keteranganTabel="Daftar stakeholder strategis Ragi Hotang beserta skor relasi dan status pipeline outreach"
              kolom={kolomTabel}
              data={itemHalaman}
              kunciBaris={(item) => item.id}
              filterAktif={filterAktif}
            />

            {totalHalaman > 1 && (
              <div className="flex items-center justify-between text-xs text-[var(--teks-sekunder)]">
                <span>
                  Halaman {halamanAman} dari {totalHalaman}
                </span>
                <div className="flex items-center gap-2">
                  <Tombol
                    varian="sekunder"
                    ukuran="sm"
                    disabled={halamanAman <= 1}
                    onClick={() => setHalaman((h) => Math.max(1, h - 1))}
                  >
                    Sebelumnya
                  </Tombol>
                  <Tombol
                    varian="sekunder"
                    ukuran="sm"
                    disabled={halamanAman >= totalHalaman}
                    onClick={() =>
                      setHalaman((h) => Math.min(totalHalaman, h + 1))
                    }
                  >
                    Berikutnya
                  </Tombol>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ModalFormStakeholder
        terbuka={modalFormTerbuka}
        stakeholderEdit={stakeholderEdit}
        defaultOwner={sesi.namaTampilan}
        sedangSimpan={sedangSimpan}
        onTutup={() => {
          setModalFormTerbuka(false);
          setStakeholderEdit(null);
        }}
        onSimpan={tanganiSimpanForm}
      />

      <ModalImporCsvStakeholder
        terbuka={modalCsvTerbuka}
        tokenBearer={tokenBearer}
        onTutup={() => setModalCsvTerbuka(false)}
        onSelesaiImpor={(jumlah) => {
          void muatStakeholder();
          tampilkanToast({
            jenis: 'sukses',
            judul: `${jumlah} stakeholder berhasil diimpor`,
          });
        }}
      />

      <PanelDetailStakeholder
        stakeholder={stakeholderDipilih}
        bolehKelola={aksesKontakPrivat}
        defaultPic={sesi.namaTampilan}
        onTutup={() => setStakeholderDipilih(null)}
        onEdit={(item) => {
          setStakeholderEdit(item);
          setModalFormTerbuka(true);
        }}
        onHapus={async (id) => {
          const resp = await hapusStakeholderApi(tokenBearer, id);
          if (!resp.ok) {
            tampilkanToast({
              jenis: 'galat',
              judul: 'Gagal menghapus data tamu',
              pesan: resp.error?.message,
            });
            return;
          }
          setStakeholderDipilih(null);
          await muatStakeholder();
          tampilkanToast({
            jenis: 'info',
            judul: 'Data tamu dipindahkan ke arsip',
          });
        }}
        onTambahLogOutreach={async (id, payload) => {
          const resp = await tambahLogOutreachApi(tokenBearer, id, payload);
          if (!resp.ok || !resp.data) {
            tampilkanToast({
              jenis: 'galat',
              judul: 'Gagal mencatat riwayat kontak',
              pesan: resp.error?.message,
            });
            return;
          }
          setStakeholderDipilih(resp.data);
          await muatStakeholder();
          tampilkanToast({
            jenis: 'sukses',
            judul: 'Riwayat kontak & status undangan diperbarui',
          });
        }}
      />

      <ModalEksporPdf
        terbuka={modalPdfTerbuka}
        onTutup={() => setModalPdfTerbuka(false)}
        jenisDefault="stakeholder-pipeline"
        daftarStakeholder={daftarStakeholder}
        filterAwal={{
          kategoriFilter: filter.kategori,
          statusFilter: filter.statusPipeline,
        }}
      />
      </WadahHalaman>
    </div>
  );
}
