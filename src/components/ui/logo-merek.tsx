import { useEffect, useRef, useState } from 'react';

export interface LogoMerekProps {
  ukuran?: 'xs' | 'sm' | 'md' | 'lg';
  alt?: string;
  className?: string;
  dekoratif?: boolean;
  prioritas?: boolean;
  onSiap?: () => void;
}

const KELAS_GAMBAR: Record<NonNullable<LogoMerekProps['ukuran']>, string> = {
  xs: 'h-6 w-auto max-w-[48px]',
  sm: 'h-8 w-auto max-w-[64px]',
  md: 'h-10 w-auto max-w-[84px]',
  lg: 'h-20 sm:h-24 w-auto max-w-[180px]',
};

const KELAS_FALLBACK: Record<NonNullable<LogoMerekProps['ukuran']>, string> = {
  xs: 'h-6 px-2 text-[10px]',
  sm: 'h-8 px-2.5 text-[11px]',
  md: 'h-10 px-3 text-xs',
  lg: 'h-20 px-6 text-2xl',
};

export function LogoMerek({
  ukuran = 'sm',
  alt = 'Logo MRs Plan',
  className = '',
  dekoratif = false,
  prioritas = false,
  onSiap,
}: LogoMerekProps) {
  const [gagalMuat, setGagalMuat] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const sudahSiapRef = useRef(false);
  const onSiapRef = useRef(onSiap);
  onSiapRef.current = onSiap;

  const tandaiSiap = async (el: HTMLImageElement | null) => {
    if (sudahSiapRef.current) return;
    if (el) {
      if (el.complete && el.naturalWidth === 0) {
        setGagalMuat(true);
        sudahSiapRef.current = true;
        onSiapRef.current?.();
        return;
      }
      if (typeof el.decode === 'function') {
        try {
          await el.decode();
        } catch {
          // Lanjutkan agar logo fallback atau render standar tidak macet
        }
      }
    }
    if (!sudahSiapRef.current) {
      sudahSiapRef.current = true;
      onSiapRef.current?.();
    }
  };

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete) {
      void tandaiSiap(el);
    }
  }, []);

  if (gagalMuat) {
    return (
      <span
        aria-hidden={dekoratif ? true : undefined}
        aria-label={dekoratif ? undefined : alt}
        className={`${KELAS_FALLBACK[ukuran]} text-[var(--teks-utama)] font-semibold tracking-tight inline-flex items-center justify-center shrink-0 ${className}`}
      >
        MRs
      </span>
    );
  }

  return (
    <img
      ref={imgRef}
      src="/logo.webp"
      alt={dekoratif ? '' : alt}
      aria-hidden={dekoratif ? true : undefined}
      loading={prioritas ? 'eager' : undefined}
      fetchPriority={prioritas ? 'high' : undefined}
      onLoad={(e) => {
        void tandaiSiap(e.currentTarget);
      }}
      onError={() => {
        setGagalMuat(true);
        if (!sudahSiapRef.current) {
          sudahSiapRef.current = true;
          onSiapRef.current?.();
        }
      }}
      className={`${KELAS_GAMBAR[ukuran]} object-contain shrink-0 block ${className}`}
    />
  );
}
