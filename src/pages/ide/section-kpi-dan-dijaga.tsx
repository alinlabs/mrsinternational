import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  AKSI_KRITIS_KANONIK,
  KPI_RINGKAS_KANONIK,
} from '../../data/beranda-kanonik';
import { RISIKO_LENGKAP_KANONIK } from '../../data/rencana-kanonik';
import { gunakanKalenderKonten } from '../../hooks/gunakan-kalender-konten';
import { gunakanKpiMonitoring } from '../../hooks/gunakan-kpi-monitoring';
import { hitungProgresKonten } from '../../utils/beranda';
import { konversiKeCatatanStatusBeranda } from '../../utils/kalender';
import { hitungRingkasanKpiLintasGrup } from '../../utils/kpi';
import { StatusTeks } from '../../components/ui';

const RINGKASAN_AKSI_IDE: Record<string, string> = {
  'aksi-3': 'Siapkan stok edit awal dan luncurkan Meta Tahap 1 setelah 6 konten organik tayang.',
  'aksi-6': 'Konfirmasi finalisasi rencana brand MRs Plan (Melfarina Raden Sirait), kontak resmi press/bisnis, serta izin portofolio.',
};

const PENJAGAAN_IDE = RISIKO_LENGKAP_KANONIK.map((item) => {
  if (item.id === 'r-07') {
    return {
      ...item,
      judul: 'Penayangan TikTok menyesuaikan kesiapan kanal',
      dampak: 'Konten tidak menjangkau audiens bila syarat minimum Ads Manager belum terpenuhi.',
      mitigasi:
        'Pastikan kesiapan pengaturan TikTok Ads Manager terlebih dahulu; gunakan jalur organik aktif bila iklan berbayar ditunda.',
    };
  }
  if (item.id === 'r-08') {
    return {
      ...item,
      judul: 'Ekspektasi “booming / viral” dianggap hasil yang dapat dijamin',
      dampak: 'Ekspektasi tidak realistis terhadap proses pertumbuhan brand.',
      mitigasi:
        'Fokus pada kualitas bukti karya, pembacaan respon 72 jam pertama, dan konsistensi cerita harian.',
    };
  }
  return item;
});

export function SectionKpiDanDijaga() {
  const { daftarKonten } = gunakanKalenderKonten();
  const { stateKpi } = gunakanKpiMonitoring();
  const [penjagaanTerbuka, setPenjagaanTerbuka] = useState<Record<string, boolean>>({});

  const togglePenjagaan = (id: string) => {
    setPenjagaanTerbuka((sebelumnya) => ({ ...sebelumnya, [id]: !sebelumnya[id] }));
  };

  const progres = hitungProgresKonten(konversiKeCatatanStatusBeranda(daftarKonten));
  const ringkasanKpi = hitungRingkasanKpiLintasGrup(
    stateKpi.daftarSnapshot,
    stateKpi.daftarInquiry,
  );

  return (
    <section aria-labelledby="judul-kpi-penjagaan" className="space-y-10">
      {/* Target Konten & KPI Kampanye */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="text-center space-y-1">
            <h2
              id="judul-kpi-penjagaan"
              className="text-base sm:text-lg font-semibold text-[var(--teks-utama)]"
            >
              Target Konten Kampanye
            </h2>
            <p className="text-xs text-[var(--teks-redup)]">
              22 hari materi harian (26 Nov – 17 Des)
            </p>
            <div className="flex justify-center pt-0.5">
              <StatusTeks status="planned" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 py-1">
            <div
              style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
              className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-2.5 py-3.5 sm:px-3.5 sm:py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
            >
              <p className="text-xs text-[var(--teks-redup)]">Target</p>
              <p className="mt-0.5 text-xl sm:text-2xl font-semibold text-[var(--teks-utama)] angka-tabular">
                {progres.totalRencana}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-[var(--teks-redup)]">
                {progres.totalVideoRencana} video · {progres.totalDesainRencana} desain
              </p>
            </div>
            <div
              style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
              className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-2.5 py-3.5 sm:px-3.5 sm:py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
            >
              <p className="text-xs text-[var(--teks-redup)]">Siap</p>
              <p className="mt-0.5 text-xl sm:text-2xl font-semibold text-[var(--status-sukses)] angka-tabular">
                {progres.selesai}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-[var(--teks-redup)]">
                {progres.persentaseSelesai}% selesai
              </p>
            </div>
            <div
              style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
              className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-2.5 py-3.5 sm:px-3.5 sm:py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
            >
              <p className="text-xs text-[var(--teks-redup)]">Rencana</p>
              <p className="mt-0.5 text-xl sm:text-2xl font-semibold text-[var(--aksen-maroon-teks)] dark:text-[#F3CE7A] angka-tabular">
                {progres.belumDimulai}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-[var(--teks-redup)]">
                Menunggu produksi
              </p>
            </div>
          </div>

          <div
            style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
            className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 px-4 py-3.5 sm:px-5 sm:py-4 space-y-2 shadow-[var(--bayangan-halus)]"
          >
            <div className="flex items-center justify-between text-xs text-[var(--teks-sekunder)]">
              <span>Progres Materi</span>
              <span className="angka-tabular font-semibold text-[var(--teks-utama)]">
                {progres.selesai} / {progres.totalRencana} aset
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progres.persentaseSelesai}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progres target materi kampanye"
              className="h-2 w-full rounded-full bg-[var(--bg-sekunder)] dark:bg-black/25 border border-[var(--garis-halus)] overflow-hidden"
            >
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${progres.persentaseSelesai}%`,
                  backgroundImage: 'var(--gradasi-emas)',
                }}
              />
            </div>
            <p className="pt-0.5 text-xs text-[var(--teks-redup)] leading-relaxed">
              Ditambah 1 video utama (45–60 dtk + versi pendek 15 dtk &amp; 6 dtk) dan Story harian.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--teks-utama)]">
              KPI Kampanye (5 Kategori)
            </h3>
          </div>

          <div
            style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
            className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 divide-y divide-[var(--garis-halus)]"
          >
            {KPI_RINGKAS_KANONIK.map((kpi, indeks) => {
              const aktualGrup = ringkasanKpi[indeks];
              return (
                <div
                  key={kpi.id}
                  className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--teks-utama)]">
                      {kpi.kategori}
                    </p>
                    <p className="text-xs text-[var(--teks-redup)] leading-relaxed">
                      {kpi.indikatorUtama}
                    </p>
                  </div>
                  {aktualGrup?.ringkasanNilai && (
                    <span className="text-xs font-medium shrink-0 angka-tabular text-[var(--aksen-maroon-teks)]">
                      {aktualGrup.ringkasanNilai}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prioritas Terdekat & Penting Dijaga — daftar di dalam kartu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-center text-base sm:text-lg font-semibold text-[var(--teks-utama)]">
            Prioritas Terdekat
          </h3>

          <ul
            style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
            className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 divide-y divide-[var(--garis-halus)] shadow-[var(--bayangan-halus)]"
          >
            {AKSI_KRITIS_KANONIK.map((aksi) => {
              const judulTampil = RINGKASAN_AKSI_IDE[aksi.id] ?? aksi.judul;

              return (
                <li key={aksi.id} className="px-4 py-3.5 sm:px-5 sm:py-4">
                  <span className="text-xs font-normal text-[var(--teks-redup)] dark:text-white/85 angka-tabular">
                    {aksi.tenggat}
                  </span>
                  <p className="mt-1 text-sm font-medium text-[var(--teks-utama)] leading-snug">
                    {judulTampil}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-center text-base sm:text-lg font-semibold text-[var(--teks-utama)]">
            Penting Dijaga
          </h3>

          <ul
            style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
            className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 divide-y divide-[var(--garis-halus)] shadow-[var(--bayangan-halus)] overflow-hidden"
          >
            {PENJAGAAN_IDE.map((risiko) => {
              const terbuka = Boolean(penjagaanTerbuka[risiko.id]);
              const idDetail = `detail-penjagaan-${risiko.id}`;
              return (
                <li key={risiko.id}>
                  <button
                    type="button"
                    aria-expanded={terbuka}
                    aria-controls={idDetail}
                    onClick={() => togglePenjagaan(risiko.id)}
                    className="w-full px-4 py-3.5 sm:px-5 sm:py-4 text-left flex items-start justify-between gap-3 cursor-pointer hover:bg-[var(--bg-sekunder)]/25 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-[13px] sm:text-sm font-semibold text-[var(--teks-utama)] leading-snug flex-1">
                      {risiko.judul}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--teks-redup)] dark:text-white/80 transition-transform duration-200 ${
                        terbuka ? 'rotate-180 text-[var(--teks-utama)] dark:text-white' : ''
                      }`}
                    />
                  </button>

                  <div
                    id={idDetail}
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                      terbuka ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-3.5 sm:px-5 sm:pb-4 text-xs text-[var(--teks-sekunder)] leading-relaxed">
                        {risiko.mitigasi}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

    </section>
  );
}
