import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  Lightbulb,
  Megaphone,
  Moon,
  Settings,
  Sun,
  Users,
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

export interface BilahSampingProps {
  diciutkan: boolean;
  onToggleCiutkan: () => void;
}

export function BilahSamping({ diciutkan, onToggleCiutkan }: BilahSampingProps) {
  const { adalahGelap, aturTema, putarTema } = gunakanTema();

  return (
    <aside
      aria-label="Navigasi utama desktop"
      className={`hidden lg:flex print:hidden flex-col lg:h-full shrink-0 border-r border-[var(--garis-halus)] bg-[var(--bg-permukaan)] transition-[width] duration-150 ${
        diciutkan ? 'w-[76px]' : 'w-64'
      }`}
    >
      <div
        className={`h-16 shrink-0 flex items-center justify-between border-b border-[var(--garis-halus)] ${
          diciutkan ? 'px-2' : 'px-4'
        }`}
      >
        {!diciutkan ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <LogoMerek ukuran="sm" dekoratif />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-none text-[var(--teks-utama)] truncate">
                Go International
              </p>
              <p className="mt-1 text-[11px] text-[var(--aksen-emas)] truncate">
                2026
              </p>
            </div>
          </div>
        ) : (
          <LogoMerek ukuran="xs" alt="MRs Plan" className="mx-auto max-w-[38px]" />
        )}
        <button
          type="button"
          onClick={onToggleCiutkan}
          aria-label={diciutkan ? 'Perluas bilah samping' : 'Ciutkan bilah samping'}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--teks-redup)] hover:text-[var(--teks-utama)] hover:bg-[var(--bg-sekunder)] cursor-pointer shrink-0 transition-colors"
        >
          {diciutkan ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <nav aria-label="Menu modul" className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3 py-4 space-y-5">
        {URUTAN_KELOMPOK.map((kelompok) => {
          const daftarItem = PETA_NAVIGASI.filter((item) => item.kelompok === kelompok);
          return (
            <div key={kelompok}>
              {!diciutkan && (
                <p className="px-2.5 mb-1.5 text-[11px] font-medium tracking-wide text-[var(--teks-redup)]">
                  {LABEL_KELOMPOK_NAVIGASI[kelompok]}
                </p>
              )}
              <ul className="space-y-1">
                {daftarItem.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.jalur}
                      end={item.jalur === '/'}
                      title={diciutkan ? item.judul : undefined}
                      style={({ isActive }) =>
                        isActive ? { backgroundImage: 'var(--gradasi-tab-aktif)' } : undefined
                      }
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-[10px] transition-colors whitespace-nowrap ${
                          isActive
                            ? 'border border-[var(--aksen-maroon-garis)]/40 text-[var(--aksen-maroon-teks)] font-semibold'
                            : 'border border-transparent text-[var(--teks-sekunder)] hover:bg-[var(--bg-sekunder)]/70 hover:text-[var(--teks-utama)]'
                        } ${diciutkan ? 'justify-center px-0' : ''}`
                      }
                    >
                      {IKON_NAVIGASI[item.id]}
                      {!diciutkan && <span className="truncate">{item.judul}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[var(--garis-halus)] p-3 space-y-2.5">
        {!diciutkan ? (
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
              className={`min-h-[36px] px-2.5 rounded-[8px] text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
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
              className={`min-h-[36px] px-2.5 rounded-[8px] text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
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
        ) : (
          <button
            type="button"
            onClick={putarTema}
            aria-label={adalahGelap ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            title={adalahGelap ? 'Tema: Gelap (klik untuk Terang)' : 'Tema: Terang (klik untuk Gelap)'}
            aria-pressed={adalahGelap}
            style={{ backgroundImage: 'var(--gradasi-tab-aktif)' }}
            className="w-full h-10 rounded-[10px] border border-[var(--aksen-maroon-garis)]/35 hover:border-[var(--aksen-emas)]/60 flex items-center justify-center cursor-pointer transition-colors"
          >
            {adalahGelap ? (
              <Moon className="h-4 w-4 text-[var(--aksen-emas)]" aria-hidden="true" />
            ) : (
              <Sun className="h-4 w-4 text-[var(--aksen-maroon-teks)]" aria-hidden="true" />
            )}
          </button>
        )}

        {!diciutkan && (
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
        )}
      </div>
    </aside>
  );
}
