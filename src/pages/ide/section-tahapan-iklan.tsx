import { useId } from 'react';
import { FASE_KAMPANYE_KANONIK } from '../../data/beranda-kanonik';
import { gunakanGeserSlide } from '../../hooks/gunakan-geser-slide';
import { IndikatorSlide } from '../../components/ui';

interface JadwalBerbayarIde {
  id: string;
  platform: 'Meta Ads' | 'TikTok Ads';
  nama: string;
  rentangTanggal: string;
  syaratSiap: string;
  arahanKreatif: string;
}

const JADWAL_BERBAYAR_IDE: JadwalBerbayarIde[] = [
  {
    id: 'meta-1',
    platform: 'Meta Ads',
    nama: 'Perkenalan & Perdana',
    rentangTanggal: '29 Nov – 5 Des 2026',
    syaratSiap: 'Mulai setelah 6 konten organik dan 3 pinned post tayang.',
    arahanKreatif:
      'Memutar 3–4 video terbaik (perkenalan kolaborasi MRs — Melfarina Sianipar × Raden Sirait, kisah founder, dan arahan desainer) untuk menjangkau audiens fashion serta budaya.',
  },
  {
    id: 'tiktok-1',
    platform: 'TikTok Ads',
    nama: 'Penemuan & Spark Ads',
    rentangTanggal: '4 – 10 Des 2026',
    syaratSiap: 'Berjalan paralel dengan jalur organik bila kanal siap.',
    arahanKreatif:
      'Menampilkan video pendek 15–35 detik seputar detail motif Batak Ragi Hotang dan proses kreatif MRs di studio dengan nada bercerita yang alami.',
  },
  {
    id: 'meta-2',
    platform: 'Meta Ads',
    nama: 'Preview Koleksi & Pengingat',
    rentangTanggal: '11 – 17 Des 2026',
    syaratSiap: 'Memilih 2–3 konten dengan respons terbaik dari tahap 1.',
    arahanKreatif:
      'Menyoroti detail bahan, siluet koleksi, dan hitung mundur menuju Gala Show 18 Des dengan ajakan daftar kuota terbatas sebelum kapasitas terpenuhi.',
  },
];

const FOKUS_FASE_RINGKAS: Record<string, string> = {
  'fase-1':
    'Perkenalan kolaborasi MRS, kisah founder, motif Ragi Hotang, dan ajakan kuota terbatas.',
  'fase-5':
    'Gala Fashion Show di Balige bagi tamu undangan terkonfirmasi dan liputan langsung PIC.',
};

function LogoPlatform({ platform }: { platform: JadwalBerbayarIde['platform'] }) {
  const idGrad = useId();
  return (
    <div
      aria-hidden="true"
      className="w-10 h-10 shrink-0 rounded-[var(--radius-sm)] bg-white border border-[var(--garis-halus)] shadow-[var(--bayangan-halus)] flex items-center justify-center"
    >
      {platform === 'Meta Ads' ? (
        <svg viewBox="0 0 28 18" className="w-6 h-4" fill="none">
          <defs>
            <linearGradient id={idGrad} x1="2" y1="9" x2="26" y2="9" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0081FB" />
              <stop offset="50%" stopColor="#0064E0" />
              <stop offset="100%" stopColor="#0081FB" />
            </linearGradient>
          </defs>
          <path
            d="M7.6 3C5 3 2.5 5.8 2.5 9.6C2.5 12.6 4.2 14.5 6.4 14.5C8.5 14.5 10.2 12.8 12.6 8.9L14 6.6L15.4 8.9C17.8 12.8 19.5 14.5 21.6 14.5C23.8 14.5 25.5 12.6 25.5 9.6C25.5 5.8 23 3 20.4 3C18.2 3 16.5 4.6 14.7 7.4L14 8.5L13.3 7.4C11.5 4.6 9.8 3 7.6 3Z"
            stroke={`url(#${idGrad})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <path
            d="M15.8 3.2c.6 1.9 2 3.3 3.9 3.8v2.6c-1.5 0-2.9-.5-4-1.3v6.1a5.4 5.4 0 1 1-4.7-5.3v2.7a2.8 2.8 0 1 0 2 2.7V3.2h2.8Z"
            fill="#25F4EE"
            transform="translate(-0.7, -0.5)"
          />
          <path
            d="M15.8 3.2c.6 1.9 2 3.3 3.9 3.8v2.6c-1.5 0-2.9-.5-4-1.3v6.1a5.4 5.4 0 1 1-4.7-5.3v2.7a2.8 2.8 0 1 0 2 2.7V3.2h2.8Z"
            fill="#FE2C55"
            transform="translate(0.7, 0.5)"
          />
          <path
            d="M15.8 3.2c.6 1.9 2 3.3 3.9 3.8v2.6c-1.5 0-2.9-.5-4-1.3v6.1a5.4 5.4 0 1 1-4.7-5.3v2.7a2.8 2.8 0 1 0 2 2.7V3.2h2.8Z"
            fill="#111111"
          />
        </svg>
      )}
    </div>
  );
}

function KartuJadwalBerbayar({
  item,
  mobileSlide = false,
}: {
  item: JadwalBerbayarIde;
  mobileSlide?: boolean;
}) {
  return (
    <article
      style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
      className={
        mobileSlide
          ? 'min-h-[188px] rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 p-5 flex flex-col justify-between gap-2.5 shadow-[var(--bayangan-halus)]'
          : 'rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 p-4 sm:p-5 space-y-2.5 shadow-[var(--bayangan-halus)]'
      }
    >
      <div className="space-y-2.5">
        <div className="flex items-center gap-3">
          <LogoPlatform platform={item.platform} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-normal text-[var(--teks-redup)] dark:text-white/85 angka-tabular">
              {item.platform} · {item.rentangTanggal}
            </p>
            <p className="text-xs font-semibold text-[var(--teks-utama)] leading-snug">
              {item.nama}
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--teks-sekunder)] leading-relaxed">
          {item.arahanKreatif}
        </p>
      </div>
      <p className="text-[11px] text-[var(--teks-redup)] leading-relaxed">
        Syarat: {item.syaratSiap}
      </p>
    </article>
  );
}

export function SectionTahapanIklan() {
  const totalSlideIklan = JADWAL_BERBAYAR_IDE.length;
  const {
    slideAktif: slideIklanAktif,
    offsetSeretPx,
    sedangSeret,
    tanganiKeyDown,
    atributTrack,
  } = gunakanGeserSlide(totalSlideIklan);

  return (
    <section
      aria-labelledby="judul-tahapan-jadwal"
      className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 items-start"
    >
      {/* 6 Tahapan Kampanye — daftar vertikal di dalam kartu */}
      <div className="xl:col-span-7 space-y-4">
        <div className="text-center">
          <h2
            id="judul-tahapan-jadwal"
            className="text-base sm:text-lg font-semibold text-[var(--teks-utama)]"
          >
            Tahapan Kampanye
          </h2>
          <p className="text-xs text-[var(--teks-redup)] mt-0.5 angka-tabular">
            26 Nov – 22 Des 2026
          </p>
        </div>

        <ol
          style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
          className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 divide-y divide-[var(--garis-halus)] shadow-[var(--bayangan-halus)]"
        >
          {FASE_KAMPANYE_KANONIK.map((fase) => {
            const fokusTampil = FOKUS_FASE_RINGKAS[fase.id] ?? fase.fokus;
            return (
              <li key={fase.id} className="px-4 py-3.5 sm:px-5 sm:py-4 space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--teks-utama)]">
                    {fase.nama}
                  </p>
                  <p className="text-[11px] font-normal text-[var(--teks-redup)] dark:text-white/85 angka-tabular text-right whitespace-nowrap shrink-0">
                    {fase.rentangTanggal}
                  </p>
                </div>
                <p className="text-xs sm:text-[13px] text-[var(--teks-sekunder)] leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {fokusTampil}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Jadwal Tayang Berbayar — kartu terpisah; slider drag di mobile */}
      <div className="xl:col-span-5 space-y-4">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-[var(--teks-utama)]">
            Jadwal Tayang Berbayar
          </h3>
          <p className="text-xs text-[var(--teks-redup)] mt-0.5">
            Urutan tayang Meta &amp; TikTok
          </p>
        </div>

        {/* Khusus Mobile: Slider kartu terpisah tanpa tombol, digeser langsung dengan kursor/sentuhan */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Jadwal Tayang Berbayar"
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
                transform: `translateX(calc(-${slideIklanAktif * 100}% + ${offsetSeretPx}px))`,
              }}
              className={`flex will-change-transform ${
                sedangSeret
                  ? 'transition-none'
                  : 'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
              }`}
            >
              {JADWAL_BERBAYAR_IDE.map((item) => (
                <div key={item.id} className="w-full shrink-0 px-0.5">
                  <KartuJadwalBerbayar item={item} mobileSlide />
                </div>
              ))}
            </div>
          </div>

          <IndikatorSlide total={totalSlideIklan} indeksAktif={slideIklanAktif} />
        </div>

        {/* Tablet & Desktop: kartu terpisah untuk masing-masing tahap */}
        <div className="hidden sm:block space-y-3">
          {JADWAL_BERBAYAR_IDE.map((item) => (
            <KartuJadwalBerbayar key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
