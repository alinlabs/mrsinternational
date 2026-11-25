import { useEffect, useRef } from 'react';
import { hitungMetrikIndikatorScroll } from '../../utils/indikator-scroll';

const DURASI_SEMBUNYI_MS = 1200;

export function IndikatorScrollMelayang() {
  const wadahRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const posisiTerakhir = new WeakMap<Element, number>();
    let timerId: number | undefined;
    let rafId: number | undefined;

    const sembunyikan = () => {
      if (wadahRef.current) {
        wadahRef.current.dataset.aktif = 'false';
      }
    };

    const tanganiScroll = (event: Event) => {
      const targetMentah = event.target;
      const elemen =
        targetMentah === document
          ? document.scrollingElement || document.documentElement
          : targetMentah instanceof Element
            ? targetMentah
            : null;

      if (!elemen) return;

      const scrollTop = elemen.scrollTop;
      const scrollHeight = elemen.scrollHeight;
      const clientHeight = elemen.clientHeight;

      if (scrollHeight <= clientHeight + 2) return;

      const sebelumnya = posisiTerakhir.get(elemen);
      posisiTerakhir.set(elemen, scrollTop);
      if (sebelumnya !== undefined && Math.abs(sebelumnya - scrollTop) < 0.5) {
        return;
      }

      if (rafId !== undefined) {
        window.cancelAnimationFrame(rafId);
      }

      rafId = window.requestAnimationFrame(() => {
        const rect =
          elemen === document.documentElement || elemen === document.body
            ? {
                top: 0,
                height: window.innerHeight,
                right: window.innerWidth,
              }
            : elemen.getBoundingClientRect();

        const metrik = hitungMetrikIndikatorScroll({
          scrollTop: elemen.scrollTop,
          scrollHeight: elemen.scrollHeight,
          clientHeight: elemen.clientHeight,
          rectTop: rect.top,
          rectHeight: rect.height,
          rectRight: rect.right,
          viewportWidth: window.innerWidth,
        });

        const wadah = wadahRef.current;
        const thumb = thumbRef.current;
        if (!wadah || !thumb) return;

        if (!metrik.aktif) {
          wadah.dataset.aktif = 'false';
          return;
        }

        thumb.style.top = `${metrik.topPx}px`;
        thumb.style.height = `${metrik.heightPx}px`;
        thumb.style.right = `${metrik.rightPx}px`;
        wadah.dataset.aktif = 'true';

        if (timerId !== undefined) {
          window.clearTimeout(timerId);
        }
        timerId = window.setTimeout(sembunyikan, DURASI_SEMBUNYI_MS);
      });
    };

    document.addEventListener('scroll', tanganiScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', sembunyikan, { passive: true });

    return () => {
      document.removeEventListener('scroll', tanganiScroll, { capture: true });
      window.removeEventListener('resize', sembunyikan);
      if (timerId !== undefined) window.clearTimeout(timerId);
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={wadahRef}
      aria-hidden="true"
      data-aktif="false"
      className="indikator-scroll-melayang no-cetak"
    >
      <span ref={thumbRef} className="indikator-scroll-melayang__thumb" />
    </div>
  );
}
