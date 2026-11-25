import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export type JenisToast = 'info' | 'sukses' | 'peringatan' | 'galat';

export interface ItemToast {
  id: string;
  judul: string;
  pesan?: string;
  jenis: JenisToast;
}

interface KonteksToastNilai {
  tampilkanToast: (opsi: Omit<ItemToast, 'id'>) => void;
}

const KonteksToast = createContext<KonteksToastNilai | null>(null);

const AKSEN_TOAST: Record<JenisToast, string> = {
  info: 'border-[var(--aksen-emas)]/45',
  sukses: 'border-[var(--status-sukses)]/45',
  peringatan: 'border-[var(--status-peringatan)]/45',
  galat: 'border-[var(--status-bahaya)]/55',
};

export function PenyediaToast({ children }: { children: ReactNode }) {
  const [daftarToast, setDaftarToast] = useState<ItemToast[]>([]);

  const tutupToast = useCallback((id: string) => {
    setDaftarToast((sebelumnya) => sebelumnya.filter((t) => t.id !== id));
  }, []);

  const tampilkanToast = useCallback(
    (opsi: Omit<ItemToast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setDaftarToast((sebelumnya) => [...sebelumnya, { ...opsi, id }]);
      window.setTimeout(() => {
        tutupToast(id);
      }, 4500);
    },
    [tutupToast],
  );

  return (
    <KonteksToast.Provider value={{ tampilkanToast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifikasi sistem"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none"
      >
        {daftarToast.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-[var(--radius-md)] border ${AKSEN_TOAST[toast.jenis]} bg-[var(--bg-permukaan)] p-3.5 shadow-lg`}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--teks-utama)]">{toast.judul}</p>
              {toast.pesan && (
                <p className="mt-0.5 text-xs text-[var(--teks-redup)]">{toast.pesan}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => tutupToast(toast.id)}
              aria-label={`Tutup notifikasi ${toast.judul}`}
              className="p-1 text-[var(--teks-redup)] hover:text-[var(--teks-utama)] cursor-pointer shrink-0"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </KonteksToast.Provider>
  );
}

export function gunakanToast(): KonteksToastNilai {
  const konteks = useContext(KonteksToast);
  if (!konteks) {
    throw new Error('gunakanToast harus dipanggil di dalam PenyediaToast.');
  }
  return konteks;
}
