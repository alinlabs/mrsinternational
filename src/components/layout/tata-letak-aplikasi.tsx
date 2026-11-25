import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BilahSamping } from './bilah-samping';
import { HeaderAplikasi } from './header-aplikasi';
import { NavigasiSeluler } from './navigasi-seluler';
import { cariRuteAktif } from '../../utils/navigasi';

export function TataLetakAplikasi() {
  const [sidebarCiut, setSidebarCiut] = useState(false);
  const [menuSelulerTerbuka, setMenuSelulerTerbuka] = useState(false);
  const { pathname } = useLocation();
  const kontenUtamaRef = useRef<HTMLElement>(null);

  const ruteAktif = cariRuteAktif(pathname);

  useEffect(() => {
    if (kontenUtamaRef.current) {
      kontenUtamaRef.current.scrollTo({ top: 0 });
    }
    setMenuSelulerTerbuka(false);
  }, [pathname]);

  return (
    <div className="tata-letak-utama h-full overflow-hidden flex bg-[var(--bg-kanvas)] text-[var(--teks-utama)] print:h-auto print:overflow-visible">
      <BilahSamping
        diciutkan={sidebarCiut}
        onToggleCiutkan={() => setSidebarCiut((prev) => !prev)}
      />
      <NavigasiSeluler
        terbuka={menuSelulerTerbuka}
        onTutup={() => setMenuSelulerTerbuka(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <HeaderAplikasi
          ruteAktif={ruteAktif}
          onBukaMenuSeluler={() => setMenuSelulerTerbuka(true)}
        />

        <main
          ref={kontenUtamaRef}
          tabIndex={-1}
          style={{ backgroundImage: 'var(--gradasi-kanvas)' }}
          className="flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-y-contain focus:outline-none print:overflow-visible print:h-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
