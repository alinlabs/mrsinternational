import type { StatusData } from '../../types/status';
import { dapatkanLabelStatus } from '../../utils/format';

export interface StatusTeksProps {
  status?: StatusData;
  labelKustom?: string;
  nadaKustom?: 'netral' | 'emas' | 'maroon' | 'hijau' | 'peringatan' | 'bahaya';
  className?: string;
}

const WARNA_TITIK: Record<NonNullable<StatusTeksProps['nadaKustom']>, string> = {
  netral: 'bg-[var(--teks-redup)]',
  emas: 'bg-[var(--aksen-emas)]',
  maroon: 'bg-[var(--aksen-maroon-teks)]',
  hijau: 'bg-[var(--status-sukses)]',
  peringatan: 'bg-[var(--status-peringatan)]',
  bahaya: 'bg-[var(--status-bahaya)]',
};

const WARNA_TEKS: Record<NonNullable<StatusTeksProps['nadaKustom']>, string> = {
  netral: 'text-[var(--teks-sekunder)]',
  emas: 'text-[var(--aksen-emas)]',
  maroon: 'text-[var(--aksen-maroon-teks)]',
  hijau: 'text-[var(--status-sukses)]',
  peringatan: 'text-[var(--status-peringatan)]',
  bahaya: 'text-[var(--status-bahaya)]',
};

export function StatusTeks({
  status = 'planned',
  labelKustom,
  nadaKustom,
  className = '',
}: StatusTeksProps) {
  const info = dapatkanLabelStatus(status);
  const label = labelKustom ?? info.label;
  const nada = nadaKustom ?? info.nada;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${WARNA_TEKS[nada]} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${WARNA_TITIK[nada]}`}
      />
      <span>{label}</span>
    </span>
  );
}
