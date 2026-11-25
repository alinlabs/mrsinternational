import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface PanelSampingProps {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  subjudul?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function PanelSamping({
  terbuka,
  onTutup,
  judul,
  subjudul,
  children,
  footer,
}: PanelSampingProps) {
  useEffect(() => {
    if (!terbuka) return;
    const tanganiKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onTutup();
      }
    };
    window.addEventListener('keydown', tanganiKeyDown);
    return () => window.removeEventListener('keydown', tanganiKeyDown);
  }, [terbuka, onTutup]);

  if (!terbuka) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#24191D]/25 backdrop-blur-[2px]"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onTutup();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        className="w-full max-w-lg h-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] bg-[var(--bg-permukaan)] border-l border-[var(--garis-halus)] shadow-2xl flex flex-col"
      >
        <header className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[var(--garis-halus)]">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--teks-utama)] truncate">
              {judul}
            </h2>
            {subjudul && (
              <p className="mt-0.5 text-xs text-[var(--teks-redup)]">{subjudul}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup panel detail"
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--teks-redup)] hover:text-[var(--teks-utama)] hover:bg-[var(--bg-sekunder)] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && (
          <footer className="px-6 py-3.5 border-t border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/80 flex items-center justify-end gap-2">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
