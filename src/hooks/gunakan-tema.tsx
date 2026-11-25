import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type ModeTema = 'terang' | 'gelap';

const KUNCI_PENYIMPANAN_TEMA = 'mrs_tema_aplikasi';

interface NilaiKonteksTema {
  tema: ModeTema;
  adalahGelap: boolean;
  aturTema: (temaBaru: ModeTema) => void;
  putarTema: () => void;
}

const KonteksTema = createContext<NilaiKonteksTema | null>(null);

function bacaTemaAwal(): ModeTema {
  if (typeof window === 'undefined') return 'gelap';
  try {
    const tersimpan = window.localStorage.getItem(KUNCI_PENYIMPANAN_TEMA);
    if (tersimpan === 'gelap' || tersimpan === 'terang') {
      return tersimpan;
    }
    const dariDom = document.documentElement.getAttribute('data-tema');
    if (dariDom === 'gelap' || dariDom === 'terang') {
      return dariDom;
    }
  } catch {
    // Abaikan akses localStorage yang terbatas
  }
  return 'gelap';
}

function terapkanTemaKeDokumen(tema: ModeTema) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-tema', tema);
  root.classList.toggle('dark', tema === 'gelap');

  const metaTema = document.querySelector('meta[name="theme-color"]');
  if (metaTema) {
    metaTema.setAttribute('content', tema === 'gelap' ? '#811F27' : '#FAF7F8');
  }
  const metaScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaScheme) {
    metaScheme.setAttribute('content', tema === 'gelap' ? 'dark' : 'light');
  }
}

export function PenyediaTema({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<ModeTema>(bacaTemaAwal);

  useEffect(() => {
    terapkanTemaKeDokumen(tema);
    try {
      window.localStorage.setItem(KUNCI_PENYIMPANAN_TEMA, tema);
    } catch {
      // Abaikan akses localStorage yang terbatas
    }
  }, [tema]);

  const aturTema = (temaBaru: ModeTema) => setTema(temaBaru);
  const putarTema = () =>
    setTema((sebelumnya) => (sebelumnya === 'gelap' ? 'terang' : 'gelap'));

  return (
    <KonteksTema.Provider
      value={{
        tema,
        adalahGelap: tema === 'gelap',
        aturTema,
        putarTema,
      }}
    >
      {children}
    </KonteksTema.Provider>
  );
}

export function gunakanTema(): NilaiKonteksTema {
  const ctx = useContext(KonteksTema);
  if (!ctx) {
    throw new Error('gunakanTema harus dipanggil di dalam PenyediaTema.');
  }
  return ctx;
}
