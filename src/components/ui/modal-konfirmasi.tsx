import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Tombol } from './tombol';

export interface ModalDialogProps {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  deskripsi?: string;
  children: ReactNode;
  footer?: ReactNode;
  ukuran?: 'sm' | 'md' | 'lg' | 'xl';
  cetakIsolasi?: boolean;
}

const LEBAR_MODAL = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-5xl',
};

export function ModalDialog({
  terbuka,
  onTutup,
  judul,
  deskripsi,
  children,
  footer,
  ukuran = 'md',
  cetakIsolasi = false,
}: ModalDialogProps) {
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

  const kontenModal = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] bg-[#24191D]/25 backdrop-blur-[2px] ${
        cetakIsolasi
          ? 'modal-cetak-isolasi print:static print:inset-auto print:block print:bg-white print:p-0'
          : 'print:hidden'
      }`}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onTutup();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-modal-dialog"
        className={`w-full ${LEBAR_MODAL[ukuran]} bg-[var(--bg-permukaan)] border border-[var(--garis-halus)] rounded-[var(--radius-lg)] shadow-xl flex flex-col max-h-[90dvh] ${
          cetakIsolasi
            ? 'print:max-w-none print:max-h-none print:border-0 print:shadow-none print:block'
            : ''
        }`}
      >
        <header
          className={`flex items-start justify-between gap-4 px-6 py-4 border-b border-[var(--garis-halus)] ${
            cetakIsolasi ? 'no-cetak' : ''
          }`}
        >
          <div>
            <h2
              id="judul-modal-dialog"
              className="text-base sm:text-lg font-semibold text-[var(--teks-utama)]"
            >
              {judul}
            </h2>
            {deskripsi && (
              <p className="mt-0.5 text-xs text-[var(--teks-redup)]">{deskripsi}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup dialog"
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--teks-redup)] hover:text-[var(--teks-utama)] hover:bg-[var(--bg-sekunder)] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>
        <div
          className={`p-5 overflow-y-auto text-sm text-[var(--teks-utama)] ${
            cetakIsolasi ? 'print:overflow-visible print:p-0' : ''
          }`}
        >
          {children}
        </div>
        {footer && (
          <footer
            className={`flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70 rounded-b-[var(--radius-lg)] ${
              cetakIsolasi ? 'no-cetak' : ''
            }`}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return kontenModal;
  }

  return createPortal(kontenModal, document.body);
}

export interface ModalKonfirmasiProps {
  terbuka: boolean;
  onTutup: () => void;
  onKonfirmasi: () => void;
  judul: string;
  pesan: string;
  labelKonfirmasi?: string;
  labelBatal?: string;
  berbahaya?: boolean;
  memuat?: boolean;
}

export function ModalKonfirmasi({
  terbuka,
  onTutup,
  onKonfirmasi,
  judul,
  pesan,
  labelKonfirmasi = 'Ya, lanjutkan',
  labelBatal = 'Batal',
  berbahaya = false,
  memuat = false,
}: ModalKonfirmasiProps) {
  return (
    <ModalDialog
      terbuka={terbuka}
      onTutup={onTutup}
      judul={judul}
      ukuran="sm"
      footer={
        <>
          <Tombol varian="sekunder" onClick={onTutup} disabled={memuat}>
            {labelBatal}
          </Tombol>
          <Tombol
            varian={berbahaya ? 'bahaya' : 'primer'}
            onClick={onKonfirmasi}
            memuat={memuat}
          >
            {labelKonfirmasi}
          </Tombol>
        </>
      }
    >
      <p className="text-sm text-[var(--teks-sekunder)] leading-relaxed">{pesan}</p>
    </ModalDialog>
  );
}
