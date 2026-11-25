import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  FileText,
  FolderOpen,
  Lightbulb,
  Megaphone,
  Moon,
  Settings,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { gunakanTema } from '../../hooks/gunakan-tema';
import { LABEL_KELOMPOK_NAVIGASI, PETA_NAVIGASI } from '../../utils/navigasi';
import type { ItemNavigasi } from '../../types/status';
import { LogoMerek } from '../ui';

const IKON_NAVIGASI: Record<string, ReactNode> = {
  ide: <Lightbulb className="h-4 w-4 shrink-0" aria-hidden="true" />,
  produksi: <CheckSquare className="h-4 w-4 shrink-0" aria-hidden="true" />,
  kalender: <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />,
  aset: <FolderOpen className="h-4 w-4 shrink-0" aria-hidden="true" />,
  iklan: <Megaphone className="h-4 w-4 shrink-0" aria-hidden="true" />,
  stakeholder: <Users className="h-4 w-4 shrink-0" aria-hidden="true" />,
  monitoring: <BarChart3 className="h-4 w-4 shrink-0" aria-hidden="true" />,
  laporan: <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />,
  pengaturan: <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />,
};

const URUTAN_KELOMPOK: ItemNavigasi['kelompok'][] = [
  'ringkasan',
  'operasional',
  'analitik',
  'sistem',
];

export interface NavigasiSelulerProps {
  terbuka: boolean;
  onTutup: () => void;
}

export function NavigasiSeluler({ terbuka, onTutup }: NavigasiSelulerProps) {
  const { adalahGelap, aturTema } = gunakanTema();

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
      className="fixed inset-0 z-50 flex lg:hidden bg-[#24191D]/30 backdrop-blur-[2px]"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onTutup();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigasi seluler"
        className="w-72 max-w-[85vw] h-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] bg-[var(--bg-permukaan)] border-r border-[var(--garis-halus)] flex flex-col shadow-xl"
      >
        <div className="h-16 shrink-0 px-4 flex items-center justify-between border-b border-[var(--garis-halus)]">
          <div className="flex items-center gap-3">
            <LogoMerek ukuran="sm" dekoratif />
            <div>
              <p className="text-[14px] font-semibold leading-none text-[var(--teks-utama)]">
                Go International
              </p>
              <p className="mt-1 text-[11px] text-[var(--aksen-emas)]">
                2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup menu navigasi"
            className="p-2 rounded-[var(--radius-sm)] text-[var(--teks-redup)] hover:text-[var(--teks-utama)] hover:bg-[var(--bg-sekunder)] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Menu seluler" className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3 py-4 space-y-5">
          {URUTAN_KELOMPOK.map((kelompok) => {
            const daftarItem = PETA_NAVIGASI.filter((item) => item.kelompok === kelompok);
            return (
              <div key={kelompok}>
                <p className="px-2.5 mb-1.5 text-[11px] font-medium tracking-wide text-[var(--teks-redup)]">
                  {LABEL_KELOMPOK_NAVIGASI[kelompok]}
                </p>
                <ul className="space-y-1">
                  {daftarItem.map((item) => (
                    <li key={item.id}>
                      <NavLink
                        to={item.jalur}
                        end={item.jalur === '/'}
                        onClick={onTutup}
                        style={({ isActive }) =>
                          isActive ? { backgroundImage: 'var(--gradasi-tab-aktif)' } : undefined
                        }
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-[10px] transition-colors whitespace-nowrap ${
                            isActive
                              ? 'border border-[var(--aksen-maroon-garis)]/40 text-[var(--aksen-maroon-teks)] font-semibold'
                              : 'border border-transparent text-[var(--teks-sekunder)] hover:bg-[var(--bg-sekunder)]/70 hover:text-[var(--teks-utama)]'
                          }`
                        }
                      >
                        {IKON_NAVIGASI[item.id]}
                        <span className="truncate">{item.judul}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[var(--garis-halus)] p-3 space-y-2.5">
          <div
            role="group"
            aria-label="Pengatur tema tampilan"
            className="grid grid-cols-2 gap-1 p-1 rounded-[10px] bg-[var(--bg-sekunder)]/70 border border-[var(--garis-halus)]"
          >
            <button
              type="button"
              onClick={() => aturTema('gelap')}
              aria-pressed={adalahGelap}
              style={adalahGelap ? { backgroundImage: 'var(--gradasi-tab-aktif)' } : undefined}
              className={`min-h-[40px] px-3 rounded-[8px] text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                adalahGelap
                  ? 'border border-[var(--aksen-maroon-garis)]/40 text-[var(--aksen-maroon-teks)] font-semibold'
                  : 'border border-transparent text-[var(--teks-sekunder)] hover:text-[var(--teks-utama)] font-medium'
              }`}
            >
              <Moon
                className={`h-3.5 w-3.5 shrink-0 ${adalahGelap ? 'text-[var(--aksen-emas)]' : ''}`}
                aria-hidden="true"
              />
              <span>Gelap</span>
            </button>

            <button
              type="button"
              onClick={() => aturTema('terang')}
              aria-pressed={!adalahGelap}
              style={!adalahGelap ? { backgroundImage: 'var(--gradasi-tab-aktif)' } : undefined}
              className={`min-h-[40px] px-3 rounded-[8px] text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                !adalahGelap
                  ? 'border border-[var(--aksen-maroon-garis)]/40 text-[var(--aksen-maroon-teks)] font-semibold'
                  : 'border border-transparent text-[var(--teks-sekunder)] hover:text-[var(--teks-utama)] font-medium'
              }`}
            >
              <Sun
                className={`h-3.5 w-3.5 shrink-0 ${!adalahGelap ? 'text-[var(--aksen-maroon-teks)]' : ''}`}
                aria-hidden="true"
              />
              <span>Terang</span>
            </button>
          </div>

          <div
            style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
            className="p-3.5 rounded-[var(--radius-md)] border border-[var(--aksen-emas)]/30"
          >
            <p className="text-xs font-semibold text-[var(--teks-utama)]">
              Gala Show · 18 Des 2026
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--aksen-emas)] font-medium">
              Balige, Toba · Kuota Terbatas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
