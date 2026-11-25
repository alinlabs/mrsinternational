import { useCallback, useEffect, useRef, useState } from 'react';
import { gunakanSesiAplikasi } from '../../hooks/gunakan-sesi-aplikasi';
import { LogoMerek } from './logo-merek';

export interface SplashScreenProps {
  onSelesai: () => void;
}

const DURASI_MINIMUM_MS = 3000;
const DURASI_MAKSIMUM_SESI_MS = 4500;
const DURASI_REVEAL_MS = 220;
const DURASI_FADE_OUT_MS = 320;
const BATAS_TUNGGU_MEDIA_MS = 4000;

export function SplashScreen({ onSelesai }: SplashScreenProps) {
  const { sedangMemuat } = gunakanSesiAplikasi();
  const sedangMemuatRef = useRef(sedangMemuat);
  sedangMemuatRef.current = sedangMemuat;
  const [logoTerload, setLogoTerload] = useState(false);
  const [logoTampilPenuh, setLogoTampilPenuh] = useState(false);
  const [progres, setProgres] = useState(0);
  const [menghilang, setMenghilang] = useState(false);

  const tanganiLogoSiap = useCallback(() => {
    setLogoTerload(true);
  }, []);

  // Jaga agar splash tidak macet permanen jika aset gagal direspons jaringan
  useEffect(() => {
    if (logoTerload || typeof window === 'undefined') return;
    const timerCadangan = window.setTimeout(() => {
      setLogoTerload(true);
    }, BATAS_TUNGGU_MEDIA_MS);
    return () => window.clearTimeout(timerCadangan);
  }, [logoTerload]);

  // Pastikan logo benar-benar sudah ter-paint dan tampil penuh sebelum hitungan 3 detik dimulai
  useEffect(() => {
    if (!logoTerload || typeof window === 'undefined') return;

    const gerakTerbatas =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf1 = 0;
    let raf2 = 0;
    let timerReveal: number | undefined;

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        if (gerakTerbatas) {
          setLogoTampilPenuh(true);
        } else {
          timerReveal = window.setTimeout(() => {
            setLogoTampilPenuh(true);
          }, DURASI_REVEAL_MS);
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      if (timerReveal !== undefined) window.clearTimeout(timerReveal);
    };
  }, [logoTerload]);

  // Hitungan minimal 3 detik dimulai HANYA setelah media logo terload di cache & tampil penuh di layar
  useEffect(() => {
    if (!logoTampilPenuh) return;
    if (typeof window === 'undefined') {
      onSelesai();
      return;
    }

    let rafId = 0;
    let timerFade: number | undefined;
    let timerSelesai: number | undefined;
    let sudahSelesai = false;
    const waktuMulai = performance.now();

    const perbarui = (sekarang: number) => {
      const berlalu = sekarang - waktuMulai;
      const rasioMinimum = Math.min(1, berlalu / DURASI_MINIMUM_MS);
      const kurvaHalus = 1 - Math.pow(1 - rasioMinimum, 2.4);

      const aplikasiSiap = !sedangMemuatRef.current || berlalu >= DURASI_MAKSIMUM_SESI_MS;
      const progresTerhitung = aplikasiSiap
        ? kurvaHalus
        : Math.min(0.92, kurvaHalus * 0.92);

      setProgres(progresTerhitung);

      if (aplikasiSiap && rasioMinimum >= 1) {
        if (!sudahSelesai) {
          sudahSelesai = true;
          setProgres(1);
          timerFade = window.setTimeout(() => {
            setMenghilang(true);
            timerSelesai = window.setTimeout(onSelesai, DURASI_FADE_OUT_MS);
          }, 100);
        }
        return;
      }

      rafId = window.requestAnimationFrame(perbarui);
    };

    rafId = window.requestAnimationFrame(perbarui);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (timerFade !== undefined) window.clearTimeout(timerFade);
      if (timerSelesai !== undefined) window.clearTimeout(timerSelesai);
    };
  }, [logoTampilPenuh, onSelesai]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat aplikasi Go International 2026"
      style={{ backgroundImage: 'var(--gradasi-kanvas)' }}
      className={`fixed inset-0 z-[100] print:hidden flex flex-col items-center justify-center bg-[var(--bg-kanvas)] px-6 select-none transition-opacity duration-300 ease-out ${
        menghilang ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <div
          className={`h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-[var(--aksen-emas)]/10 blur-3xl transition-opacity duration-300 ${
            logoTerload ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div
        className={`relative flex flex-col items-center text-center transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          logoTerload ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
      >
        <LogoMerek
          ukuran="lg"
          alt="Logo MRs Plan"
          prioritas
          onSiap={tanganiLogoSiap}
          className="drop-shadow-[0_8px_24px_rgba(122,28,36,0.18)]"
        />

        <h1 className="mt-5 text-xl sm:text-2xl font-semibold tracking-[0.04em] text-[var(--teks-utama)]">
          Go International
        </h1>

        <p className="mt-1.5 text-sm sm:text-base font-medium tracking-[0.28em] text-[var(--aksen-emas)] angka-tabular">
          2026
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Progres pemuatan"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progres * 100)}
        style={{ bottom: 'env(safe-area-inset-bottom)' }}
        className="absolute inset-x-0 h-[3px] bg-[var(--garis-halus)] overflow-hidden"
      >
        <div
          style={{
            transform: `scaleX(${progres})`,
            backgroundImage: 'var(--gradasi-emas)',
          }}
          className="h-full w-full origin-left will-change-transform"
        />
      </div>
    </div>
  );
}
