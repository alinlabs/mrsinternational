import { ShieldCheck, Target, Users } from 'lucide-react';
import {
  IDENTITAS_EVENT_KANONIK,
  TIGA_OUTCOME_KANONIK,
} from '../../data/beranda-kanonik';
import { FUNNEL_KAMPANYE_KANONIK } from '../../data/rencana-kanonik';
import { gunakanGeserSlide } from '../../hooks/gunakan-geser-slide';
import { IndikatorSlide } from '../../components/ui';

const IKON_OUTCOME = {
  awareness: Target,
  trust: ShieldCheck,
  pipeline: Users,
} as const;

export function SectionGagasan() {
  const totalSlide = FUNNEL_KAMPANYE_KANONIK.length;
  const {
    slideAktif,
    offsetSeretPx,
    sedangSeret,
    tanganiKeyDown,
    atributTrack,
  } = gunakanGeserSlide(totalSlide);

  return (
    <section aria-labelledby="judul-gagasan-utama" className="space-y-8 sm:space-y-10">
      {/* Pembuka Editorial */}
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <h2
            id="judul-gagasan-utama"
            className="text-xl sm:text-2xl font-semibold leading-snug text-[var(--teks-utama)]"
          >
            Gagasan Inti
          </h2>
          <p className="text-sm sm:text-[15px] font-medium text-[var(--teks-sekunder)] leading-relaxed">
            {IDENTITAS_EVENT_KANONIK.kolaborator}
          </p>
          <p className="text-xs sm:text-[13px] font-medium text-[var(--teks-redup)] angka-tabular">
            26 November s.d 17 Desember 2026
          </p>
        </div>

        <p className="max-w-3xl mx-auto text-center text-[13px] text-[var(--teks-sekunder)] leading-relaxed">
          Kolaborasi Melfarina Sianipar × Raden Sirait (MRS) adalah presentasi fashion kontemporer yang memadukan motif ulos Batak Toba (Ragi Hotang) dengan desain modern. Alih-alih menjual tiket untuk umum, acara ini fokus memperkenalkan brand, desainer, dan arah koleksi kepada jaringan strategis demi membuka akses pasar nasional maupun internasional.
        </p>

        {/* Tiga Hasil Utama — 3 kartu ringkas dalam 1 baris di atas kartu emas */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          {TIGA_OUTCOME_KANONIK.map((outcome) => {
            const IkonOutcome = IKON_OUTCOME[outcome.id as keyof typeof IKON_OUTCOME] ?? Target;
            return (
              <div
                key={outcome.id}
                style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-2.5 py-3.5 sm:px-4 sm:py-5 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center gap-2 sm:gap-2.5"
              >
                <div
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #fbe4a4 0%, #f1c973 52%, #dfb052 100%)',
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-[var(--radius-sm)] border border-[#c6984a]/60 shadow-[var(--bayangan-halus)] flex items-center justify-center"
                >
                  <IkonOutcome className="w-4 h-4 sm:w-5 sm:h-5 text-[#5d131a]" strokeWidth={1.9} />
                </div>
                <p className="text-[11px] sm:text-xs font-semibold leading-tight text-[var(--aksen-maroon-teks)] dark:text-[#F3CE7A]">
                  {outcome.judul}
                </p>
              </div>
            );
          })}
        </div>

        <blockquote
          style={{
            backgroundImage:
              'linear-gradient(135deg, #fbe4a4 0%, #f1c973 52%, #dfb052 100%)',
          }}
          className="px-5 py-4 rounded-[var(--radius-md)] border border-[#c6984a]/60 text-[13px] font-semibold text-[#5d131a] leading-relaxed shadow-[var(--bayangan-halus)]"
        >
          Bangun awareness terarah, buktikan kredibilitas lewat portofolio, dan ubah atensi tersebut menjadi peluang bisnis melalui pendaftaran eksklusif.
        </blockquote>
      </div>

      {/* Alur Tujuan Komunikasi — mobile: slider 1 kartu per slide rata tengah; desktop: daftar bergaris halus */}
      <div className="space-y-4">
        <h3 className="text-center text-base sm:text-lg font-semibold text-[var(--teks-utama)]">
          Alur Tujuan Komunikasi
        </h3>

        {/* Khusus Mobile: Slider sesungguhnya tanpa tombol, digeser langsung dengan kursor atau sentuhan */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Alur Tujuan Komunikasi"
          tabIndex={0}
          onKeyDown={tanganiKeyDown}
          className="sm:hidden space-y-3 focus:outline-none"
        >
          <div
            className="overflow-hidden w-full touch-pan-y select-none cursor-grab active:cursor-grabbing"
            {...atributTrack}
          >
            <div
              style={{
                transform: `translateX(calc(-${slideAktif * 100}% + ${offsetSeretPx}px))`,
              }}
              className={`flex will-change-transform ${
                sedangSeret
                  ? 'transition-none'
                  : 'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
              }`}
            >
              {FUNNEL_KAMPANYE_KANONIK.map((step) => (
                <div key={step.id} className="w-full shrink-0 px-0.5">
                  <article
                    style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                    className="min-h-[156px] rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 p-5 text-center flex flex-col justify-center items-center gap-2 shadow-[var(--bayangan-halus)]"
                  >
                    <p className="text-xs font-semibold text-[var(--aksen-maroon-teks)] dark:text-[#F3CE7A]">
                      {step.level}
                    </p>
                    <p className="text-[13px] font-medium text-[var(--teks-utama)] leading-relaxed">
                      {step.tujuanKomunikasi}
                    </p>
                    <p className="text-xs text-[var(--teks-redup)] leading-relaxed">
                      Target aksi: {step.aksiDiharapkan}
                    </p>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <IndikatorSlide total={totalSlide} indeksAktif={slideAktif} />
        </div>

        {/* Tablet & Desktop: satu lembar daftar bergaris halus */}
        <ol
          style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
          className="hidden sm:block rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 divide-y divide-[var(--garis-halus)]"
        >
          {FUNNEL_KAMPANYE_KANONIK.map((step, indeks) => (
            <li
              key={step.id}
              className="px-5 py-3.5 flex flex-row items-baseline gap-5"
            >
              <div className="w-44 shrink-0">
                <span className="text-xs font-semibold text-[var(--aksen-maroon-teks)] dark:text-[#F3CE7A]">
                  0{indeks + 1}. {step.level}
                </span>
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-[13px] font-medium text-[var(--teks-utama)] leading-relaxed">
                  {step.tujuanKomunikasi}
                </p>
                <p className="text-xs text-[var(--teks-redup)]">
                  Target aksi: {step.aksiDiharapkan}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
