import type { BundelHariKalender, KonsepKonten } from '../../types/kalender';
import { dapatkanInfoStatusKonten } from '../../utils/kalender';
import { KondisiKosong, StatusTeks } from '../../components/ui';

export interface TampilanKalenderVisualProps {
  daftarHari: BundelHariKalender[];
  filterAktif: boolean;
  onPilihKonten: (konten: KonsepKonten) => void;
}

interface SelKalenderTanggal {
  tanggal: string;
  label: string;
  hari: string;
  catatanMilestone?: string;
  adalahHariEvent?: boolean;
}

// Rentang 4 pekan penuh: Senin 23 Nov – Minggu 20 Des 2026
const GRID_KALENDER_4_PEKAN: SelKalenderTanggal[] = [
  { tanggal: '2026-11-23', label: '23 Nov', hari: 'Sen' },
  { tanggal: '2026-11-24', label: '24 Nov', hari: 'Sel', catatanMilestone: 'Finalisasi brief v1.0 & 2FA' },
  { tanggal: '2026-11-25', label: '25 Nov', hari: 'Rab', catatanMilestone: 'Shooting Hari 1 (Syuting Iklan)' },
  { tanggal: '2026-11-26', label: '26 Nov', hari: 'Kam' },
  { tanggal: '2026-11-27', label: '27 Nov', hari: 'Jum' },
  { tanggal: '2026-11-28', label: '28 Nov', hari: 'Sab' },
  { tanggal: '2026-11-29', label: '29 Nov', hari: 'Min', catatanMilestone: 'Mulai Meta Flight 1' },
  { tanggal: '2026-11-30', label: '30 Nov', hari: 'Sen', catatanMilestone: 'Shooting Hari 2 (Short Konten 1)' },
  { tanggal: '2026-12-01', label: '1 Des', hari: 'Sel' },
  { tanggal: '2026-12-02', label: '2 Des', hari: 'Rab' },
  { tanggal: '2026-12-03', label: '3 Des', hari: 'Kam', catatanMilestone: 'Shooting Hari 3 (Short Konten 2)' },
  { tanggal: '2026-12-04', label: '4 Des', hari: 'Jum', catatanMilestone: 'Mulai TikTok Flight (Menengah/Agresif)' },
  { tanggal: '2026-12-05', label: '5 Des', hari: 'Sab', catatanMilestone: 'Akhir Meta Flight 1' },
  { tanggal: '2026-12-06', label: '6 Des', hari: 'Min' },
  { tanggal: '2026-12-07', label: '7 Des', hari: 'Sen' },
  { tanggal: '2026-12-08', label: '8 Des', hari: 'Sel', catatanMilestone: 'H-10' },
  { tanggal: '2026-12-09', label: '9 Des', hari: 'Rab' },
  { tanggal: '2026-12-10', label: '10 Des', hari: 'Kam', catatanMilestone: 'Batas Rekaman Pra-Balige & Akhir TikTok' },
  { tanggal: '2026-12-11', label: '11 Des', hari: 'Jum', catatanMilestone: 'Owner ke Balige • Mulai Meta Flight 2' },
  { tanggal: '2026-12-12', label: '12 Des', hari: 'Sab' },
  { tanggal: '2026-12-13', label: '13 Des', hari: 'Min', catatanMilestone: 'Cek Embargo Label Baru' },
  { tanggal: '2026-12-14', label: '14 Des', hari: 'Sen' },
  { tanggal: '2026-12-15', label: '15 Des', hari: 'Sel', catatanMilestone: 'H-3' },
  { tanggal: '2026-12-16', label: '16 Des', hari: 'Rab', catatanMilestone: 'H-2' },
  { tanggal: '2026-12-17', label: '17 Des', hari: 'Kam', catatanMilestone: 'H-1 & Akhir Meta Flight 2' },
  { tanggal: '2026-12-18', label: '18 Des', hari: 'Jum', catatanMilestone: 'GALA FASHION SHOW — BALIGE (Privat)', adalahHariEvent: true },
  { tanggal: '2026-12-19', label: '19 Des', hari: 'Sab', catatanMilestone: 'Rekap 24 Jam & Kliping Media' },
  { tanggal: '2026-12-20', label: '20 Des', hari: 'Min', catatanMilestone: 'Tindak Lanjut Tamu & Lookbook' },
];

const LABEL_SLOT_RINGKAS = {
  'video-a': 'Video A',
  'video-b': 'Video B',
  design: 'Desain',
} as const;

export function TampilanKalenderVisual({
  daftarHari,
  filterAktif,
  onPilihKonten,
}: TampilanKalenderVisualProps) {
  if (daftarHari.length === 0 && filterAktif) {
    return (
      <KondisiKosong
        judul="Tidak ada item kalender yang cocok dengan filter"
        deskripsi="Atur ulang filter untuk menampilkan seluruh rentang 26 November–17 Desember 2026."
      />
    );
  }

  const petaBundel = new Map(daftarHari.map((h) => [h.tanggal, h]));

  return (
    <div className="space-y-3">
      <div className="hidden lg:grid grid-cols-7 gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
        <span>Senin</span>
        <span>Selasa</span>
        <span>Rabu</span>
        <span>Kamis</span>
        <span>Jumat</span>
        <span>Sabtu</span>
        <span>Minggu</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
        {GRID_KALENDER_4_PEKAN.map((sel) => {
          const bundel = petaBundel.get(sel.tanggal);
          const dalamRentangKampanye =
            sel.tanggal >= '2026-11-26' && sel.tanggal <= '2026-12-17';

          return (
            <div
              key={sel.tanggal}
              className={`rounded-[var(--radius-md)] border p-3 flex flex-col gap-2 min-h-[168px] ${
                sel.adalahHariEvent
                  ? 'border-[var(--aksen-maroon-garis)] bg-[var(--aksen-maroon-lembut)]/70'
                  : dalamRentangKampanye
                    ? 'border-[var(--garis-halus)] bg-[var(--bg-permukaan)]'
                    : 'border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-[var(--garis-halus)]">
                <div>
                  <p className="text-xs font-semibold text-[var(--teks-utama)] angka-tabular">
                    {sel.label}
                  </p>
                  <p className="text-[11px] text-[var(--teks-redup)] lg:hidden">
                    {sel.hari}
                  </p>
                </div>
                {bundel && (
                  <span className="text-[11px] font-medium text-[var(--aksen-maroon-teks)] angka-tabular">
                    H{bundel.hariKe}
                  </span>
                )}
              </div>

              {sel.catatanMilestone && (
                <p
                  className={`text-[11px] font-medium leading-snug ${
                    sel.adalahHariEvent
                      ? 'text-[var(--aksen-maroon-teks)]'
                      : 'text-[var(--aksen-emas)]'
                  }`}
                >
                  {sel.catatanMilestone}
                </p>
              )}

              {bundel ? (
                <div className="space-y-1.5">
                  {bundel.daftarItem.map((item) => {
                    const infoStatus = dapatkanInfoStatusKonten(item.status);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onPilihKonten(item)}
                        aria-label={`Detail ${sel.label} ${LABEL_SLOT_RINGKAS[item.slot]}: ${item.judul}`}
                        className="w-full text-left rounded-[var(--radius-sm)] border border-[var(--garis-halus)] hover:border-[var(--aksen-maroon-garis)] bg-[var(--bg-kanvas)]/60 hover:bg-[var(--bg-sekunder)] px-2 py-1.5 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--aksen-maroon-teks)]">
                            {LABEL_SLOT_RINGKAS[item.slot]}
                          </span>
                          <StatusTeks
                            labelKustom={infoStatus.label}
                            nadaKustom={infoStatus.nada}
                            className="!text-[10px]"
                          />
                        </div>
                        <p className="mt-0.5 text-[11px] text-[var(--teks-utama)] line-clamp-2 leading-snug">
                          {item.judul}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                !sel.catatanMilestone && (
                  <p className="text-[11px] text-[var(--teks-redup)] mt-auto">
                    {dalamRentangKampanye ? 'Terfilter' : 'Di luar jadwal unggah 22 hari'}
                  </p>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
