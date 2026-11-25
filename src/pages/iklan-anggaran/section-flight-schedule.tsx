import { AlertCircle, CalendarRange, Pencil } from 'lucide-react';
import { KURS_PLANNING_USD_IDR_KANONIK } from '../../data/iklan-kanonik';
import type { FlightKampanyeIklan } from '../../types/iklan';
import { formatEstimasiRupiah } from '../../utils/beranda';
import { formatRupiah, formatTanggalWib } from '../../utils/format';
import {
  dapatkanInfoStatusFlight,
  hitungEstimasiBiayaFlightIdr,
  hitungHariFlight,
} from '../../utils/iklan';
import { Kartu, StatusTeks, Tombol } from '../../components/ui';

export interface SectionFlightScheduleProps {
  daftarFlight: FlightKampanyeIklan[];
  kursUsdIdr?: number;
  onEditFlight: (flight: FlightKampanyeIklan) => void;
}

const FASE_LINIMASA_HARIAN = [
  {
    id: 'tl-organik-awal',
    tanggal: '26–28 Nov',
    judul: 'Pondasi Organik & Setup Akun',
    detail: 'Minimal 6 konten organik terbit + 3 pinned post siap sebelum iklan aktif.',
    aksen: 'border-[var(--garis-tegas)]',
  },
  {
    id: 'tl-meta-1',
    tanggal: '29 Nov–5 Des',
    judul: 'Meta Flight 1 (Awareness / ThruPlay)',
    detail: 'Tersedia di seluruh skenario (Hemat, Menengah, Agresif). Evaluasi di jam ke-48–72.',
    aksen: 'border-[var(--aksen-maroon-garis)]/70',
  },
  {
    id: 'tl-tiktok-1',
    tanggal: '4–10 Des',
    judul: 'TikTok Window (Paid pada Menengah/Agresif)',
    detail: 'Hemat tetap organik 2 video/hari; Menengah 1 ad group, Agresif 2 ad groups.',
    aksen: 'border-[var(--aksen-emas)]/60',
  },
  {
    id: 'tl-pause',
    tanggal: '6–10 Des',
    judul: 'Meta Pause, Analisa & Optimasi',
    detail: 'Jeda Meta Ads untuk analisa kreatif pemenang dan efisiensi CPM/ThruPlay.',
    aksen: 'border-[var(--garis-tegas)]',
  },
  {
    id: 'tl-meta-2',
    tanggal: '11–17 Des',
    judul: 'Meta Flight 2 (Collection & Reminder)',
    detail: 'Fokus 2–3 kreatif pemenang menjelang Gala Fashion Show 18 Des (Menengah/Agresif).',
    aksen: 'border-[var(--aksen-maroon-garis)]/70',
  },
];

export function SectionFlightSchedule({
  daftarFlight,
  kursUsdIdr = KURS_PLANNING_USD_IDR_KANONIK,
  onEditFlight,
}: SectionFlightScheduleProps) {
  return (
    <div className="space-y-5">
      <Kartu
        judul="Linimasa Jadwal Iklan (26 Nov – 17 Des 2026)"
        subjudul="Urutan tayang organik hingga iklan menjelang Gala Show 18 Des"
        aksiHeader={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--teks-redup)]">
            <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
            22 Hari Kampanye
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {FASE_LINIMASA_HARIAN.map((item) => (
            <div
              key={item.id}
              className={`rounded-[var(--radius-sm)] border ${item.aksen} bg-[var(--bg-kanvas)]/80 p-3`}
            >
              <p className="text-[11px] font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                {item.tanggal}
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--teks-utama)] leading-snug">
                {item.judul}
              </p>
              <p className="mt-1.5 text-[11px] text-[var(--teks-sekunder)] leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </Kartu>

      <div className="space-y-4">
        {daftarFlight.map((flight) => {
          const hari = hitungHariFlight(flight.tanggalMulai, flight.tanggalSelesai);
          const estimasiIdr = hitungEstimasiBiayaFlightIdr(flight, kursUsdIdr);
          const infoStatus = dapatkanInfoStatusFlight(flight.status);

          return (
            <Kartu key={flight.id}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-[var(--aksen-maroon-teks)]">
                      {flight.kodeFlight}
                    </span>
                    <h3 className="text-base font-semibold text-[var(--teks-utama)]">
                      {flight.namaCampaign}
                    </h3>
                    <StatusTeks
                      labelKustom={infoStatus.label}
                      nadaKustom={infoStatus.nada}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3 text-xs">
                    <div>
                      <p className="text-[var(--teks-redup)]">Rentang &amp; Durasi</p>
                      <p className="mt-0.5 font-medium text-[var(--teks-utama)] angka-tabular">
                        {formatTanggalWib(flight.tanggalMulai)} –{' '}
                        {formatTanggalWib(flight.tanggalSelesai)} ({hari} hari)
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--teks-redup)]">Anggaran Harian</p>
                      <p className="mt-0.5 font-medium text-[var(--teks-utama)] angka-tabular">
                        {flight.isOrganikSaja
                          ? 'Rp0 (Organik 2 video/hari)'
                          : flight.mataUang === 'USD'
                            ? `${flight.jumlahAdGroup} ad group × USD ${flight.anggaranHarian}/hari`
                            : flight.jumlahAdGroup > 1
                              ? `${formatRupiah(flight.anggaranHarian * flight.jumlahAdGroup)}/hari (${flight.jumlahAdGroup} ad group × ${formatRupiah(flight.anggaranHarian)})`
                              : `${formatRupiah(flight.anggaranHarian)}/hari (${flight.jumlahAdGroup} ${flight.platform === 'tiktok' ? 'ad group' : 'ad set'})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--teks-redup)]">Estimasi Total Flight</p>
                      <p className="mt-0.5 font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                        {flight.isOrganikSaja
                          ? 'Rp0 (Organik)'
                          : formatEstimasiRupiah(
                              estimasiIdr,
                              flight.mataUang === 'USD',
                            )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-[var(--teks-utama)]">
                        Objective &amp; Target Audiens
                      </p>
                      <p className="mt-0.5 text-[var(--teks-sekunder)]">
                        <strong>Objective:</strong> {flight.objective}
                      </p>
                      <p className="mt-0.5 text-[var(--teks-sekunder)] leading-relaxed">
                        <strong>Audiens:</strong> {flight.targetAudiens}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-[var(--teks-utama)]">
                        Kreatif Terjadwal ({flight.daftarKreatif.length})
                      </p>
                      <ul className="mt-0.5 list-disc list-inside text-[var(--teks-sekunder)] space-y-0.5">
                        {flight.daftarKreatif.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {flight.catatanBilling && (
                    <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] px-3 py-2 text-xs text-[var(--teks-sekunder)] flex items-start gap-2">
                      <AlertCircle
                        className="h-4 w-4 text-[var(--aksen-emas)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{flight.catatanBilling}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <Tombol
                    varian="sekunder"
                    ukuran="sm"
                    ikonKiri={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                    onClick={() => onEditFlight(flight)}
                  >
                    Ubah Jadwal
                  </Tombol>
                </div>
              </div>
            </Kartu>
          );
        })}
      </div>
    </div>
  );
}
