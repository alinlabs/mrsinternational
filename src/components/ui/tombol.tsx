import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type VarianTombol = 'primer' | 'sekunder' | 'halus' | 'bahaya';
export type UkuranTombol = 'sm' | 'md' | 'lg';

export interface TombolProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  varian?: VarianTombol;
  ukuran?: UkuranTombol;
  memuat?: boolean;
  ikonKiri?: ReactNode;
  ikonKanan?: ReactNode;
}

const KELAS_VARIAN: Record<VarianTombol, string> = {
  primer:
    'bg-[image:var(--gradasi-aksen)] text-white border border-[var(--aksen-maroon)] hover:brightness-110 shadow-xs disabled:opacity-55',
  sekunder:
    'bg-[var(--bg-permukaan)] text-[var(--teks-utama)] border border-[var(--garis-tegas)] hover:bg-[var(--bg-sekunder)] disabled:opacity-55',
  halus:
    'bg-transparent text-[var(--teks-sekunder)] border border-transparent hover:bg-[var(--bg-sekunder)] hover:text-[var(--teks-utama)] disabled:opacity-55',
  bahaya:
    'bg-[var(--status-bahaya-solid)] text-white border border-[var(--status-bahaya-solid)] hover:opacity-90 disabled:opacity-55',
};

const KELAS_UKURAN: Record<UkuranTombol, string> = {
  sm: 'h-8 px-3.5 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
};

export function Tombol({
  varian = 'sekunder',
  ukuran = 'md',
  memuat = false,
  ikonKiri,
  ikonKanan,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: TombolProps) {
  return (
    <button
      type={type}
      disabled={disabled || memuat}
      className={`inline-flex items-center justify-center font-medium rounded-[var(--radius-sm)] transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap ${KELAS_VARIAN[varian]} ${KELAS_UKURAN[ukuran]} ${className}`}
      {...props}
    >
      {memuat ? (
        <span
          aria-hidden="true"
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        ikonKiri
      )}
      <span>{children}</span>
      {!memuat && ikonKanan}
    </button>
  );
}
