import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  PESAN_INTI_KANONIK,
  PILAR_KONTEN_KANONIK,
  STRUKTUR_STORYTELLING_VIDEO,
} from '../../data/rencana-kanonik';

const WARNA_PROP_PILAR: Record<string, string> = {
  founder: 'bg-[var(--aksen-maroon)]',
  designer: 'bg-[#b85c69]',
  heritage: 'bg-[var(--aksen-emas)]',
  product: 'bg-[#a68d8f]',
  event: 'bg-[#6d565e]',
};

export function SectionPesanPilar() {
  const [pilarTerbuka, setPilarTerbuka] = useState<Record<string, boolean>>({});
  const [pesanTerbuka, setPesanTerbuka] = useState<Record<string, boolean>>({});

  const togglePilar = (id: string) => {
    setPilarTerbuka((sebelumnya) => ({ ...sebelumnya, [id]: !sebelumnya[id] }));
  };

  const togglePesan = (id: string) => {
    setPesanTerbuka((sebelumnya) => ({ ...sebelumnya, [id]: !sebelumnya[id] }));
  };

  return (
    <section aria-labelledby="judul-pesan-pilar" className="space-y-10">
      {/* Pilar Konten & Proporsi — terbuka tanpa kartu bersarang */}
      <div className="space-y-5">
        <div className="text-center">
          <h2
            id="judul-pesan-pilar"
            className="text-base sm:text-lg font-semibold text-[var(--teks-utama)]"
          >
            Pilar Konten (30 / 20 / 20 / 20 / 10)
          </h2>
        </div>

        <div
          className="flex h-2.5 w-full overflow-hidden rounded-full border border-[var(--garis-halus)]"
          role="img"
          aria-label="Proporsi pilar konten: Founder 30%, Designer 20%, Heritage 20%, Product 20%, Event 10%"
        >
          {PILAR_KONTEN_KANONIK.map((pilar) => (
            <div
              key={pilar.id}
              style={{ width: `${pilar.proporsiPersen}%` }}
              className={WARNA_PROP_PILAR[pilar.id] ?? 'bg-[var(--aksen-maroon)]'}
              title={`${pilar.nama}: ${pilar.proporsiPersen}%`}
            />
          ))}
        </div>

        <div
          style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
          className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 divide-y divide-[var(--garis-halus)] lg:divide-y-0 lg:divide-x lg:grid lg:grid-cols-5 shadow-[var(--bayangan-halus)]"
        >
          {PILAR_KONTEN_KANONIK.map((pilar) => {
            const terbuka = Boolean(pilarTerbuka[pilar.id]);
            const idDetail = `detail-pilar-${pilar.id}`;
            return (
              <div key={pilar.id} className="flex flex-col">
                <button
                  type="button"
                  aria-expanded={terbuka}
                  aria-controls={idDetail}
                  onClick={() => togglePilar(pilar.id)}
                  className="w-full px-4 py-3.5 sm:px-5 sm:py-4 text-left flex items-start justify-between gap-2.5 cursor-pointer hover:bg-[var(--bg-sekunder)]/25 dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                        WARNA_PROP_PILAR[pilar.id] ?? 'bg-[var(--aksen-maroon)]'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--teks-utama)] leading-snug">
                        {pilar.nama}
                      </p>
                      <p className="text-[11px] font-medium text-[var(--teks-sekunder)] leading-snug mt-0.5">
                        {pilar.peranStrategis}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 shrink-0 pt-0.5">
                    <span className="text-sm font-semibold text-[var(--teks-utama)] dark:text-white angka-tabular">
                      {pilar.proporsiPersen}%
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 text-[var(--teks-redup)] dark:text-white/80 transition-transform duration-200 ${
                        terbuka ? 'rotate-180 text-[var(--teks-utama)] dark:text-white' : ''
                      }`}
                    />
                  </span>
                </button>

                <div
                  id={idDetail}
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                    terbuka ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-3.5 sm:px-5 sm:pb-4 flex items-start gap-2.5">
                      <span className="w-3 shrink-0" aria-hidden="true" />
                      <p className="text-[11px] text-[var(--teks-redup)] leading-relaxed flex-1">
                        {pilar.contohMateri}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alur Cerita Video Pendek — bagian tersendiri */}
      <div className="space-y-4">
        <h3 className="text-center text-base sm:text-lg font-semibold text-[var(--teks-utama)]">
          Alur Cerita Video Pendek (0–35 Detik)
        </h3>
        <div
          style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
          className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--garis-halus)] shadow-[var(--bayangan-halus)]"
        >
          {STRUKTUR_STORYTELLING_VIDEO.map((beat) => (
            <div key={beat.segmen} className="p-4 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold text-[var(--teks-utama)] dark:text-white">
                  {beat.peran}
                </p>
                <span className="text-[11px] font-medium text-[var(--teks-redup)] dark:text-white/85 angka-tabular text-right whitespace-nowrap shrink-0">
                  {beat.segmen}
                </span>
              </div>
              <p className="text-xs text-[var(--teks-sekunder)] leading-relaxed">
                {beat.arahan}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Pesan Utama & Pendukung — daftar di dalam kartu dengan dropdown deskripsi */}
      <div className="space-y-4">
        <h3 className="text-center text-base sm:text-lg font-semibold text-[var(--teks-utama)]">
          5 Pesan Utama &amp; Pendukung
        </h3>

        <ol
          style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
          className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 divide-y divide-[var(--garis-halus)] shadow-[var(--bayangan-halus)] overflow-hidden"
        >
          {PESAN_INTI_KANONIK.map((pesan, indeks) => {
            const terbuka = Boolean(pesanTerbuka[pesan.id]);
            const idDetail = `detail-pesan-${pesan.id}`;
            return (
              <li key={pesan.id}>
                <button
                  type="button"
                  aria-expanded={terbuka}
                  aria-controls={idDetail}
                  onClick={() => togglePesan(pesan.id)}
                  className="w-full px-4 py-3.5 sm:px-5 sm:py-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-[var(--bg-sekunder)]/25 dark:hover:bg-white/[0.04] transition-colors"
                >
                  <span className="flex items-baseline gap-3 min-w-0 flex-1">
                    <span className="w-7 shrink-0 text-xs font-normal text-[var(--teks-redup)] dark:text-white/85 angka-tabular leading-snug">
                      0{indeks + 1}.
                    </span>
                    <span className="text-[13px] sm:text-sm font-semibold text-[var(--teks-utama)] leading-snug">
                      {pesan.judul}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-[var(--teks-redup)] dark:text-white/80 transition-transform duration-200 ${
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
                    <div className="px-4 pb-3.5 sm:px-5 sm:pb-4 flex items-start gap-3">
                      <span className="w-7 shrink-0" aria-hidden="true" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[13px] sm:text-sm font-medium text-[var(--teks-sekunder)] leading-snug">
                          {pesan.rumusan}
                        </p>
                        <p className="text-xs text-[var(--teks-redup)] leading-relaxed">
                          {pesan.buktiWajib}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
