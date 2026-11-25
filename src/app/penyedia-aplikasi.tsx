import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { KondisiGagal, PenyediaToast } from '../components/ui';
import { PenyediaSesiAplikasi } from '../hooks/gunakan-sesi-aplikasi';
import { PenyediaTema } from '../hooks/gunakan-tema';

interface StateBatasGalat {
  galat: Error | null;
}

class BatasGalatAplikasi extends Component<
  { children: ReactNode },
  StateBatasGalat
> {
  state: StateBatasGalat = { galat: null };

  static getDerivedStateFromError(galat: Error): StateBatasGalat {
    return { galat };
  }

  componentDidCatch(galat: Error, info: ErrorInfo): void {
    console.error('Terjadi galat antarmuka:', galat.message, info.componentStack);
    const pesan = galat.message || '';
    const indikasiModulUsang =
      pesan.includes('Failed to fetch dynamically imported module') ||
      pesan.includes('Importing a module script failed') ||
      pesan.includes("reading 'useState'") ||
      pesan.includes("reading 'useContext'") ||
      pesan.includes("reading 'useRef'") ||
      pesan.includes('Invalid hook call');

    if (indikasiModulUsang && typeof window !== 'undefined') {
      try {
        const kunci = 'mrs_auto_recover_ts';
        const terakhir = Number(window.sessionStorage.getItem(kunci) || '0');
        const sekarang = Date.now();
        if (!terakhir || sekarang - terakhir > 15_000) {
          window.sessionStorage.setItem(kunci, String(sekarang));
          window.location.reload();
        }
      } catch {
        // Abaikan jika sessionStorage tidak tersedia
      }
    }
  }

  render() {
    if (this.state.galat) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-kanvas)]">
          <div className="w-full max-w-md">
            <KondisiGagal
              judul="Terjadi gangguan tampilan aplikasi"
              pesan="Muat ulang halaman untuk memulihkan sesi kerja."
              onCobaLagi={() => window.location.reload()}
            />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function PenyediaAplikasi({ children }: { children: ReactNode }) {
  return (
    <BatasGalatAplikasi>
      <PenyediaTema>
        <BrowserRouter>
          <PenyediaSesiAplikasi>
            <PenyediaToast>{children}</PenyediaToast>
          </PenyediaSesiAplikasi>
        </BrowserRouter>
      </PenyediaTema>
    </BatasGalatAplikasi>
  );
}
