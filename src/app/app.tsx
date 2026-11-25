import { useCallback, useState } from 'react';
import { PenyediaAplikasi } from './penyedia-aplikasi';
import { RuteAplikasi } from './rute';
import { IndikatorScrollMelayang } from '../components/ui/indikator-scroll-melayang';
import { SplashScreen } from '../components/ui/splash-screen';

export function AplikasiUtama() {
  const [tampilSplash, setTampilSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') !== '1';
  });
  const tanganiSplashSelesai = useCallback(() => {
    setTampilSplash(false);
  }, []);

  return (
    <PenyediaAplikasi>
      <RuteAplikasi />
      <IndikatorScrollMelayang />
      {tampilSplash && <SplashScreen onSelesai={tanganiSplashSelesai} />}
    </PenyediaAplikasi>
  );
}
