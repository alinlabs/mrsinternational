import { Menu } from 'lucide-react';
import type { ItemNavigasi } from '../../types/status';
import { LogoMerek } from '../ui';

export interface HeaderAplikasiProps {
  ruteAktif?: ItemNavigasi;
  onBukaMenuSeluler: () => void;
}

export function HeaderAplikasi({
  ruteAktif,
  onBukaMenuSeluler,
}: HeaderAplikasiProps) {
  return (
    <header className="relative h-16 shrink-0 z-30 print:hidden border-b border-[var(--garis-halus)] bg-[var(--bg-permukaan)] px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
      <div className="flex items-center gap-0.5 lg:gap-0 min-w-0 shrink-0 lg:shrink">
        <button
          type="button"
          onClick={onBukaMenuSeluler}
          aria-label="Buka menu navigasi"
          className="lg:hidden py-2 pl-1 pr-1.5 -ml-1.5 rounded-[var(--radius-sm)] text-[var(--teks-sekunder)] hover:bg-[var(--bg-sekunder)] hover:text-[var(--teks-utama)] cursor-pointer shrink-0"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex lg:hidden items-center shrink-0">
          <LogoMerek ukuran="sm" dekoratif />
        </div>

        <div className="hidden lg:flex flex-col justify-center min-w-0">
          <span className="text-[15px] font-bold leading-tight tracking-tight text-[var(--teks-utama)] truncate">
            MRs Plan
          </span>
          <span className="mt-0.5 text-xs font-normal leading-tight text-[var(--teks-utama)]/80 truncate">
            {ruteAktif?.judul ?? 'Halaman Tidak Ditemukan'}
          </span>
        </div>
      </div>

      <span className="lg:hidden min-w-0 flex-1 text-right text-[16px] sm:text-[17px] font-semibold leading-tight tracking-tight text-[var(--teks-utama)] truncate">
        {ruteAktif?.judul ?? 'Halaman Tidak Ditemukan'}
      </span>

      <div
        aria-hidden="true"
        style={{ backgroundImage: 'var(--gradasi-garis)' }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px]"
      />
    </header>
  );
}

