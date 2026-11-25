import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Film, MessageSquareQuote, ShieldAlert } from 'lucide-react';
import { STRUKTUR_HERO_AD_KANONIK } from '../../data/produksi-kanonik';
import type {
  BeatHeroAd,
  DeliverableProduksi,
  NarasumberWawancara,
  PertanyaanWawancara,
  StatusDeliverable,
  StatusPersetujuanKutipan,
} from '../../types/produksi';
import {
  dapatkanInfoStatusDeliverable,
  dapatkanInfoStatusKutipan,
  validasiPersetujuanKutipan,
} from '../../utils/produksi';
import {
  AreaTeks,
  InputTeks,
  Kartu,
  PanelSamping,
  SelectPilihan,
  StatusTeks,
  TabelData,
  Tombol,
} from '../../components/ui';
import type { KolomTabel } from '../../components/ui';

export interface SectionWawancaraHeroProps {
  bankPertanyaan: PertanyaanWawancara[];
  daftarDeliverables: DeliverableProduksi[];
  onSimpanPertanyaan: (item: PertanyaanWawancara) => void;
  onPerbaruiDeliverable: (
    idDeliverable: string,
    perubahan: Partial<Pick<DeliverableProduksi, 'status' | 'catatan'>>,
  ) => void;
}

const LABEL_NARASUMBER: Record<NarasumberWawancara, string> = {
  melfarina: 'Melfarina Sianipar (Owner)',
  raden: 'Raden Sirait (Fashion Designer)',
  ghivany: 'Ghivany (Talent Editorial)',
};

const OPSI_STATUS_KUTIPAN: { nilai: StatusPersetujuanKutipan; label: string }[] = [
  { nilai: 'belum-direkam', label: 'Belum Direkam' },
  { nilai: 'tercatat-draft', label: 'Catatan Awal' },
  { nilai: 'menunggu-approval', label: 'Menunggu Persetujuan' },
  { nilai: 'approved', label: 'Disetujui (Siap Pakai)' },
  { nilai: 'revisi', label: 'Perlu Revisi / Ulang' },
];

const OPSI_STATUS_HERO: { nilai: StatusDeliverable; label: string }[] = [
  { nilai: 'planned', label: 'Rencana' },
  { nilai: 'editing', label: 'Proses Edit' },
  { nilai: 'review', label: 'Menunggu Cek' },
  { nilai: 'approved', label: 'Disetujui' },
  { nilai: 'delivered', label: 'Diserahkan' },
];

export function SectionWawancaraHero({
  bankPertanyaan,
  daftarDeliverables,
  onSimpanPertanyaan,
  onPerbaruiDeliverable,
}: SectionWawancaraHeroProps) {
  const [filterNarasumber, setFilterNarasumber] = useState<
    NarasumberWawancara | 'semua'
  >('semua');
  const [itemEdit, setItemEdit] = useState<PertanyaanWawancara | null>(null);
  const [galatEdit, setGalatEdit] = useState<Record<string, string>>({});

  const pertanyaanTersaring = useMemo(
    () =>
      filterNarasumber === 'semua'
        ? bankPertanyaan
        : bankPertanyaan.filter((q) => q.narasumber === filterNarasumber),
    [bankPertanyaan, filterNarasumber],
  );

  const hitungPerNarasumber = useMemo(
    () => ({
      melfarina: bankPertanyaan.filter((q) => q.narasumber === 'melfarina').length,
      raden: bankPertanyaan.filter((q) => q.narasumber === 'raden').length,
      ghivany: bankPertanyaan.filter((q) => q.narasumber === 'ghivany').length,
    }),
    [bankPertanyaan],
  );

  const heroAdDeliverables = useMemo(
    () =>
      daftarDeliverables.filter((d) =>
        ['del-02', 'del-03', 'del-04'].includes(d.id),
      ),
    [daftarDeliverables],
  );

  const bukaPanelPertanyaan = (item: PertanyaanWawancara) => {
    setItemEdit({ ...item });
    setGalatEdit({});
  };

  const tanganiSimpanKutipan = (event: FormEvent) => {
    event.preventDefault();
    if (!itemEdit) return;
    const galat = validasiPersetujuanKutipan(itemEdit);
    if (Object.keys(galat).length > 0) {
      setGalatEdit(galat);
      return;
    }
    onSimpanPertanyaan(itemEdit);
    setItemEdit(null);
  };

  const kolomHeroAd: KolomTabel<BeatHeroAd>[] = [
    {
      kunci: 'waktu',
      judul: 'Rentang Waktu',
      lebar: '130px',
      render: (beat) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <p className="font-mono text-xs font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
            {beat.rentangWaktu}
          </p>
          <p className="text-[11px] text-[var(--teks-redup)]">
            Ref: {beat.referensiWaktuBagian8}
          </p>
        </div>
      ),
    },
    {
      kunci: 'bagian',
      judul: 'Bagian',
      lebar: '170px',
      render: (beat) => (
        <span className="text-xs font-semibold text-[var(--teks-utama)]">
          {beat.bagian}
        </span>
      ),
    },
    {
      kunci: 'visual',
      judul: 'Arah Visual',
      render: (beat) => (
        <p className="min-w-[180px] text-xs text-[var(--teks-sekunder)] leading-relaxed">
          {beat.visual}
        </p>
      ),
    },
    {
      kunci: 'narasi',
      judul: 'Konsep Narasi (Bukan Kutipan Asli)',
      render: (beat) => (
        <p className="min-w-[240px] text-xs text-[var(--teks-utama)] leading-relaxed">
          {beat.drafNarasi}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Kartu
        judul="Daftar Pertanyaan Wawancara"
        subjudul="Pertanyaan untuk Melfarina Sianipar, Raden Sirait, dan Ghivany"
        aksiHeader={
          <StatusTeks
            labelKustom={`${bankPertanyaan.filter((q) => q.statusPersetujuan === 'approved').length} / ${bankPertanyaan.length} disetujui`}
            nadaKustom="emas"
          />
        }
      >
        <div className="space-y-4">
          <div className="rounded-[var(--radius-sm)] border border-[var(--aksen-emas)]/40 bg-[var(--aksen-emas)]/[0.06] px-3.5 py-2.5 text-xs text-[var(--teks-sekunder)] leading-relaxed flex items-start gap-2.5">
            <ShieldAlert
              className="h-4 w-4 text-[var(--aksen-emas)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p>
              <strong className="font-semibold text-[var(--teks-utama)]">
                Aturan Kutipan Asli:
              </strong>{' '}
              Jawaban hanya dapat ditandai <strong>Disetujui</strong> setelah rekaman kalimat asli, nama penyetuju, dan tanggal terisi lengkap.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter pertanyaan berdasarkan narasumber"
          >
            <Tombol
              varian={filterNarasumber === 'semua' ? 'primer' : 'sekunder'}
              ukuran="sm"
              className="!transition-none"
              onClick={() => setFilterNarasumber('semua')}
              aria-pressed={filterNarasumber === 'semua'}
            >
              Semua ({bankPertanyaan.length})
            </Tombol>
            <Tombol
              varian={filterNarasumber === 'melfarina' ? 'primer' : 'sekunder'}
              ukuran="sm"
              className="!transition-none"
              onClick={() => setFilterNarasumber('melfarina')}
              aria-pressed={filterNarasumber === 'melfarina'}
            >
              Melfarina ({hitungPerNarasumber.melfarina})
            </Tombol>
            <Tombol
              varian={filterNarasumber === 'raden' ? 'primer' : 'sekunder'}
              ukuran="sm"
              className="!transition-none"
              onClick={() => setFilterNarasumber('raden')}
              aria-pressed={filterNarasumber === 'raden'}
            >
              Raden ({hitungPerNarasumber.raden})
            </Tombol>
            <Tombol
              varian={filterNarasumber === 'ghivany' ? 'primer' : 'sekunder'}
              ukuran="sm"
              className="!transition-none"
              onClick={() => setFilterNarasumber('ghivany')}
              aria-pressed={filterNarasumber === 'ghivany'}
            >
              Ghivany ({hitungPerNarasumber.ghivany})
            </Tombol>
          </div>

          <div className="divide-y divide-[var(--garis-halus)] border border-[var(--garis-halus)] rounded-[var(--radius-md)]">
            {pertanyaanTersaring.map((item) => {
              const info = dapatkanInfoStatusKutipan(item.statusPersetujuan);
              return (
                <article
                  key={item.id}
                  className="p-4 bg-[var(--bg-permukaan)] flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                        {LABEL_NARASUMBER[item.narasumber]} #{item.urutan}
                      </span>
                      <StatusTeks
                        labelKustom={info.label}
                        nadaKustom={info.nada}
                      />
                      <span className="text-[11px] text-[var(--teks-redup)]">
                        {item.catatanSumber}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-[var(--teks-utama)] leading-snug">
                      {item.pertanyaan}
                    </p>

                    {item.jawabanTercatat ? (
                      <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-3 py-2 text-xs text-[var(--teks-sekunder)] space-y-1">
                        <p>
                          <strong className="font-medium text-[var(--teks-utama)]">
                            Rekaman Jawaban:
                          </strong>{' '}
                          {item.jawabanTercatat}
                        </p>
                        {item.kutipanDisetujui && (
                          <p>
                            <strong className="font-medium text-[var(--teks-utama)]">
                              Kutipan Pilihan:
                            </strong>{' '}
                            “{item.kutipanDisetujui}”
                          </p>
                        )}
                        {(item.disetujuiOleh || item.tanggalDisetujui) && (
                          <p className="text-[11px] text-[var(--teks-redup)]">
                            Disetujui oleh {item.disetujuiOleh || '-'} pada{' '}
                            {item.tanggalDisetujui || '-'}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs italic text-[var(--teks-redup)]">
                        Belum ada rekaman jawaban — menunggu pengambilan gambar/audio lapangan.
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <Tombol
                      varian="sekunder"
                      ukuran="sm"
                      ikonKiri={
                        <MessageSquareQuote
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      }
                      onClick={() => bukaPanelPertanyaan(item)}
                    >
                      Catat Jawaban
                    </Tombol>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Kartu>

      <Kartu
        judul="Susunan Video Utama (45–60 Detik) & Versi Pendek"
        subjudul="Alur video utama dan potongan durasi 15 dtk serta 6 dtk"
        aksiHeader={
          <StatusTeks
            labelKustom="Konsep Awal"
            nadaKustom="peringatan"
          />
        }
      >
        <div className="space-y-4">
          <div className="rounded-[var(--radius-sm)] border border-[var(--aksen-maroon-garis)]/40 bg-[var(--aksen-maroon-lembut)]/75 px-3.5 py-2.5 text-xs text-[var(--teks-sekunder)] leading-relaxed flex items-start gap-2.5">
            <Film
              className="h-4 w-4 text-[var(--aksen-maroon-teks)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p>
              <strong className="font-semibold text-[var(--teks-utama)]">
                Catatan Konsep:
              </strong>{' '}
              Teks narasi di bawah ini baru konsep awal sebelum rekaman asli Hari 1 diambil dan disetujui narasumber.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {heroAdDeliverables.map((del) => {
              const infoDel = dapatkanInfoStatusDeliverable(del.status);
              return (
                <div
                  key={del.id}
                  className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--teks-utama)] leading-snug">
                      {del.nama}
                    </p>
                    <StatusTeks
                      labelKustom={infoDel.label}
                      nadaKustom={infoDel.nada}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--teks-redup)]">
                    {del.targetVolume}
                  </p>
                  <select
                    aria-label={`Status ${del.nama}`}
                    value={del.status}
                    onChange={(e) =>
                      onPerbaruiDeliverable(del.id, {
                        status: e.target.value as StatusDeliverable,
                      })
                    }
                    className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] px-2 text-xs text-[var(--teks-utama)]"
                  >
                    {OPSI_STATUS_HERO.map((opt) => (
                      <option key={opt.nilai} value={opt.nilai}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <TabelData
            keteranganTabel="Struktur 5 bagian papan Hero Ad 45 sampai 60 detik"
            kolom={kolomHeroAd}
            data={STRUKTUR_HERO_AD_KANONIK}
            kunciBaris={(beat) => beat.id}
          />
        </div>
      </Kartu>

      <PanelSamping
        terbuka={Boolean(itemEdit)}
        onTutup={() => setItemEdit(null)}
        judul={
          itemEdit
            ? `Catat Jawaban — #${itemEdit.urutan}`
            : 'Catat Jawaban'
        }
        subjudul={
          itemEdit ? LABEL_NARASUMBER[itemEdit.narasumber] : undefined
        }
        footer={
          <>
            <Tombol
              varian="sekunder"
              ukuran="sm"
              onClick={() => setItemEdit(null)}
            >
              Batal
            </Tombol>
            <Tombol
              type="submit"
              form="form-kutipan-wawancara"
              varian="primer"
              ukuran="sm"
            >
              Simpan Rekaman &amp; Status
            </Tombol>
          </>
        }
      >
        {itemEdit && (
          <form
            id="form-kutipan-wawancara"
            noValidate
            onSubmit={tanganiSimpanKutipan}
            className="space-y-4"
          >
            <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-3 py-2.5 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
                Pertanyaan ({itemEdit.catatanSumber})
              </p>
              <p className="text-sm font-medium text-[var(--teks-utama)]">
                {itemEdit.pertanyaan}
              </p>
            </div>

            <AreaTeks
              label="Rekaman Jawaban Asli Narasumber"
              rows={4}
              value={itemEdit.jawabanTercatat}
              galat={galatEdit.jawabanTercatat}
              placeholder="Catat kalimat asli sesuai rekaman audio/video (biarkan kosong bila belum direkam)..."
              onChange={(e) => {
                setItemEdit((prev) =>
                  prev ? { ...prev, jawabanTercatat: e.target.value } : prev,
                );
                if (galatEdit.jawabanTercatat) {
                  setGalatEdit((prev) => ({ ...prev, jawabanTercatat: '' }));
                }
              }}
            />

            <AreaTeks
              label="Kutipan Pendek Terkurasi (Opsional)"
              rows={2}
              value={itemEdit.kutipanDisetujui}
              placeholder="Kalimat pilihan dari rekaman untuk caption/carousel..."
              onChange={(e) =>
                setItemEdit((prev) =>
                  prev ? { ...prev, kutipanDisetujui: e.target.value } : prev,
                )
              }
            />

            <SelectPilihan
              label="Status Persetujuan Kutipan"
              value={itemEdit.statusPersetujuan}
              opsi={OPSI_STATUS_KUTIPAN}
              onChange={(e) => {
                setItemEdit((prev) =>
                  prev
                    ? {
                        ...prev,
                        statusPersetujuan: e.target
                          .value as StatusPersetujuanKutipan,
                      }
                    : prev,
                );
                setGalatEdit({});
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputTeks
                label="Disetujui Oleh (PIC Berwenang)"
                value={itemEdit.disetujuiOleh}
                galat={galatEdit.disetujuiOleh}
                placeholder="Mis. Owner (Melfarina Sianipar)"
                onChange={(e) => {
                  setItemEdit((prev) =>
                    prev ? { ...prev, disetujuiOleh: e.target.value } : prev,
                  );
                  if (galatEdit.disetujuiOleh) {
                    setGalatEdit((prev) => ({ ...prev, disetujuiOleh: '' }));
                  }
                }}
              />

              <InputTeks
                label="Tanggal Persetujuan"
                type="date"
                value={itemEdit.tanggalDisetujui}
                galat={galatEdit.tanggalDisetujui}
                onChange={(e) => {
                  setItemEdit((prev) =>
                    prev ? { ...prev, tanggalDisetujui: e.target.value } : prev,
                  );
                  if (galatEdit.tanggalDisetujui) {
                    setGalatEdit((prev) => ({ ...prev, tanggalDisetujui: '' }));
                  }
                }}
              />
            </div>

            <p className="text-[11px] text-[var(--teks-redup)] leading-relaxed">
              Status <strong>Disetujui</strong> hanya bisa dipilih jika rekaman jawaban, nama penyetuju, dan tanggal sudah diisi.
            </p>
          </form>
        )}
      </PanelSamping>
    </div>
  );
}
