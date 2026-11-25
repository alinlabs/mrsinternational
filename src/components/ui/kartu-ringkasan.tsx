import type { ReactNode } from 'react';

export interface KartuProps {
  judul?: string;
  subjudul?: string;
  aksiHeader?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  tanpaPadding?: boolean;
  className?: string;
}

export function Kartu({
  judul,
  subjudul,
  aksiHeader,
  children,
  footer,
  tanpaPadding = false,
  className = '',
}: KartuProps) {
  const punyaHeader = Boolean(judul || subjudul || aksiHeader);

  return (
    <section
      style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
      className={`border border-[var(--aksen-maroon-garis)]/25 rounded-[var(--radius-lg)] shadow-[var(--bayangan-halus)] ${className}`}
    >
      {punyaHeader && (
        <header
          className={`flex flex-wrap items-start justify-between gap-3 px-5 pt-5 ${
            tanpaPadding ? 'pb-3' : 'pb-1'
          }`}
        >
          <div className="min-w-0">
            {judul && (
              <h2 className="text-[15px] font-semibold text-[var(--teks-utama)] tracking-normal">
                {judul}
              </h2>
            )}
            {subjudul && (
              <p className="mt-0.5 text-xs text-[var(--teks-redup)]">{subjudul}</p>
            )}
          </div>
          {aksiHeader && <div className="flex items-center gap-2 shrink-0">{aksiHeader}</div>}
        </header>
      )}
      <div className={tanpaPadding ? '' : 'p-5'}>{children}</div>
      {footer && (
        <footer className="px-5 py-3 border-t border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/40 rounded-b-[var(--radius-lg)] text-xs text-[var(--teks-redup)]">
          {footer}
        </footer>
      )}
    </section>
  );
}
