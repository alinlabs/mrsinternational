import type { ReactNode } from 'react';

export interface ItemTabAtas {
  id: string;
  label: string;
}

export interface ItemTab extends ItemTabAtas {
  konten: ReactNode;
}

export interface BilahTabAtasProps {
  daftarTab: ItemTabAtas[];
  tabAktif: string;
  onUbahTab: (id: string) => void;
  labelNavigasi?: string;
}

export function BilahTabAtas({
  daftarTab,
  tabAktif,
  onUbahTab,
  labelNavigasi = 'Navigasi tab halaman',
}: BilahTabAtasProps) {
  return (
    <nav
      aria-label={labelNavigasi}
      role="tablist"
      className="shrink-0 z-20 bg-[var(--bg-permukaan)]/95 backdrop-blur-xs border-b border-[var(--garis-halus)] px-3.5 sm:px-6 lg:px-0 flex items-center gap-1.5 lg:gap-0 overflow-x-auto lg:overflow-visible print:hidden"
    >
      {daftarTab.map((tab) => {
        const aktif = tab.id === tabAktif;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={aktif}
            onClick={() => onUbahTab(tab.id)}
            style={aktif ? { backgroundImage: 'var(--gradasi-tab-aktif)' } : undefined}
            className={`relative min-h-[44px] px-3.5 lg:px-2 py-2 text-[13px] font-medium whitespace-nowrap shrink-0 lg:shrink lg:flex-1 lg:min-w-0 flex items-center justify-center transition-colors cursor-pointer ${
              aktif
                ? 'text-[var(--aksen-maroon-teks)] font-semibold'
                : 'text-[var(--teks-redup)] hover:text-[var(--teks-utama)] hover:bg-[var(--bg-sekunder)]/50'
            }`}
          >
            <span className="truncate">{tab.label}</span>
            {aktif && (
              <span
                aria-hidden="true"
                style={{ backgroundImage: 'var(--gradasi-emas)' }}
                className="absolute inset-x-1 lg:inset-x-0 bottom-0 h-[2px] rounded-full lg:rounded-none"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
