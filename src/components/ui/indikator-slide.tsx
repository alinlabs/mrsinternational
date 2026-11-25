export interface IndikatorSlideProps {
  total: number;
  indeksAktif: number;
}

export function IndikatorSlide({ total, indeksAktif }: IndikatorSlideProps) {
  return (
    <div aria-hidden="true" className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, indeks) => {
        const aktif = indeks === indeksAktif;
        return (
          <span
            key={indeks}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              aktif
                ? 'w-6 bg-[var(--aksen-maroon)] dark:bg-white'
                : 'w-1.5 bg-[var(--garis-tegas)] dark:bg-white/35'
            }`}
          />
        );
      })}
    </div>
  );
}
