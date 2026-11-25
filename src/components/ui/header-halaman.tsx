import type { ReactNode } from 'react';

export interface HeaderHalamanProps {
  judul: string;
  tujuan?: string;
  labelTahap?: string;
  aksiUtama?: ReactNode;
}

export function HeaderHalaman({
  judul,
  tujuan,
  labelTahap,
  aksiUtama,
}: HeaderHalamanProps) {
  return (
    <header className="text-center space-y-3 mb-8">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold leading-snug text-[var(--teks-utama)]">
          {judul}
        </h1>
        {labelTahap && (
          <p className="text-xs sm:text-[13px] font-medium text-[var(--aksen-emas)] angka-tabular">
            {labelTahap}
          </p>
        )}
      </div>

      {tujuan && (
        <p className="max-w-3xl mx-auto text-center text-[13px] text-[var(--teks-sekunder)] leading-relaxed">
          {tujuan}
        </p>
      )}

      {aksiUtama && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {aksiUtama}
        </div>
      )}
    </header>
  );
}
