import { SEGMEN_STAKEHOLDER_KANONIK } from '../../data/rencana-kanonik';
import { gunakanGeserSlide } from '../../hooks/gunakan-geser-slide';
import { IndikatorSlide } from '../../components/ui';

interface WilayahIde {
  id: string;
  tingkat: string;
  wilayah: string;
  catatan: string;
}

const WILAYAH_IDE: WilayahIde[] = [
  {
    id: 'geo-utama',
    tingkat: 'Prioritas Utama',
    wilayah: 'Jakarta, Bandung, Medan & Sumatera Utara (termasuk Balige / Toba)',
    catatan:
      'Fokus awal kampanye karena kedekatan dengan ekosistem fashion, media, dan akar budaya Batak agar jangkauan lebih terarah.',
  },
  {
    id: 'geo-uji',
    tingkat: 'Uji Terbatas',
    wilayah: 'Surabaya, Yogyakarta & Bali',
    catatan:
      'Diperluas apabila respons awal 72 jam pertama menunjukkan minat dan interaksi audiens yang kuat.',
  },
  {
    id: 'geo-global',
    tingkat: 'Internasional (Prasyarat Ketat)',
    wilayah: 'Pasar Diaspora & Komunitas Fashion Mancanegara',
    catatan:
      'Ditayangkan setelah profil bahasa Inggris, lookbook, kesiapan produksi, jalur distribusi, dan kontak resmi siap.',
  },
];

export function SectionWilayahTamu() {
  const totalSlideWilayah = WILAYAH_IDE.length;
  const totalSlideSegmen = SEGMEN_STAKEHOLDER_KANONIK.length;

  const {
    slideAktif: slideWilayahAktif,
    offsetSeretPx: offsetSeretWilayahPx,
    sedangSeret: sedangSeretWilayah,
    tanganiKeyDown: tanganiKeyDownWilayah,
    atributTrack: atributTrackWilayah,
  } = gunakanGeserSlide(totalSlideWilayah);

  const {
    slideAktif: slideSegmenAktif,
    offsetSeretPx,
    sedangSeret,
    tanganiKeyDown: tanganiKeyDownSegmen,
    atributTrack: atributTrackSegmen,
  } = gunakanGeserSlide(totalSlideSegmen);

  return (
    <section aria-labelledby="judul-wilayah-tamu" className="space-y-10">
      {/* Target Wilayah — kartu terpisah; slider drag di mobile */}
      <div className="space-y-4">
        <div className="text-center">
          <h2
            id="judul-wilayah-tamu"
            className="text-base sm:text-lg font-semibold text-[var(--teks-utama)]"
          >
            Target Wilayah Kampanye
          </h2>
        </div>

        {/* Khusus Mobile: Slider kartu terpisah tanpa tombol, digeser langsung dengan kursor/sentuhan */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Target Wilayah Kampanye"
          tabIndex={0}
          onKeyDown={tanganiKeyDownWilayah}
          className="sm:hidden space-y-3 focus:outline-none"
        >
          <div
            className="overflow-hidden w-full touch-pan-y select-none cursor-grab active:cursor-grabbing"
            {...atributTrackWilayah}
          >
            <div
              style={{
                transform: `translateX(calc(-${slideWilayahAktif * 100}% + ${offsetSeretWilayahPx}px))`,
              }}
              className={`flex will-change-transform ${
                sedangSeretWilayah
                  ? 'transition-none'
                  : 'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
              }`}
            >
              {WILAYAH_IDE.map((geo) => (
                <div key={geo.id} className="w-full shrink-0 px-0.5">
                  <article
                    style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                    className="min-h-[168px] rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 p-5 flex flex-col items-center justify-center text-center gap-2 shadow-[var(--bayangan-halus)]"
                  >
                    <p className="text-xs font-semibold text-[var(--aksen-maroon-teks)] dark:text-white/90">
                      {geo.tingkat}
                    </p>
                    <p className="text-sm font-semibold text-[var(--teks-utama)] leading-snug">
                      {geo.wilayah}
                    </p>
                    <p className="text-xs text-[var(--teks-sekunder)] leading-relaxed">
                      {geo.catatan}
                    </p>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <IndikatorSlide
            total={totalSlideWilayah}
            indeksAktif={slideWilayahAktif}
          />
        </div>

        {/* Tablet & Desktop: kartu terpisah untuk masing-masing wilayah */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 md:gap-5">
          {WILAYAH_IDE.map((geo) => (
            <article
              key={geo.id}
              style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
              className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 p-4 sm:p-5 space-y-2 text-center shadow-[var(--bayangan-halus)]"
            >
              <p className="text-xs font-semibold text-[var(--aksen-maroon-teks)] dark:text-white/90">
                {geo.tingkat}
              </p>
              <p className="text-sm font-semibold text-[var(--teks-utama)] leading-snug">
                {geo.wilayah}
              </p>
              <p className="text-xs text-[var(--teks-sekunder)] leading-relaxed">
                {geo.catatan}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* Target Tamu & Mitra — kartu terpisah; slider drag di mobile */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-[var(--teks-utama)]">
            Target Tamu &amp; Mitra Utama
          </h3>
        </div>

        {/* Khusus Mobile: Slider kartu terpisah tanpa tombol, digeser langsung dengan kursor/sentuhan */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Target Tamu & Mitra Utama"
          tabIndex={0}
          onKeyDown={tanganiKeyDownSegmen}
          className="sm:hidden space-y-3 focus:outline-none"
        >
          <div
            className="overflow-hidden w-full touch-pan-y select-none cursor-grab active:cursor-grabbing"
            {...atributTrackSegmen}
          >
            <div
              style={{
                transform: `translateX(calc(-${slideSegmenAktif * 100}% + ${offsetSeretPx}px))`,
              }}
              className={`flex will-change-transform ${
                sedangSeret
                  ? 'transition-none'
                  : 'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
              }`}
            >
              {SEGMEN_STAKEHOLDER_KANONIK.map((segmen) => (
                <div key={segmen.id} className="w-full shrink-0 px-0.5">
                  <article
                    style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                    className="min-h-[216px] rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 p-5 flex flex-col items-center justify-center text-center gap-2.5 shadow-[var(--bayangan-halus)]"
                  >
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[var(--aksen-maroon-teks)] dark:text-white/90">
                        {segmen.labelPrioritas}
                      </p>
                      <p className="text-[13px] font-medium text-[var(--teks-utama)] leading-snug">
                        {segmen.segmen}
                      </p>
                      <p className="text-xs text-[var(--teks-sekunder)] leading-relaxed">
                        <span className="font-medium text-[var(--teks-utama)]">Fokus pesan:</span>{' '}
                        {segmen.kepentinganPesan}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--teks-redup)] leading-relaxed">
                      <span className="font-medium text-[var(--teks-sekunder)]">Jalur sapa:</span>{' '}
                      {segmen.jalurPendekatan}
                    </p>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <IndikatorSlide
            total={totalSlideSegmen}
            indeksAktif={slideSegmenAktif}
          />
        </div>

        {/* Tablet & Desktop: kartu terpisah untuk masing-masing segmen */}
        <div className="hidden sm:block space-y-3">
          {SEGMEN_STAKEHOLDER_KANONIK.map((segmen) => (
            <article
              key={segmen.id}
              style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
              className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-6 items-start text-center lg:text-left shadow-[var(--bayangan-halus)]"
            >
              <div className="lg:col-span-3">
                <p className="text-xs font-semibold text-[var(--aksen-maroon-teks)] dark:text-white/90">
                  {segmen.labelPrioritas}
                </p>
              </div>
              <div className="lg:col-span-9 space-y-1.5">
                <p className="text-[13px] sm:text-sm font-medium text-[var(--teks-utama)] leading-snug">
                  {segmen.segmen}
                </p>
                <p className="text-xs text-[var(--teks-sekunder)] leading-relaxed">
                  <span className="font-medium text-[var(--teks-utama)]">Fokus pesan:</span>{' '}
                  {segmen.kepentinganPesan}
                </p>
                <p className="text-xs text-[var(--teks-redup)] leading-relaxed">
                  <span className="font-medium text-[var(--teks-sekunder)]">Jalur sapa:</span>{' '}
                  {segmen.jalurPendekatan}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
