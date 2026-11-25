import { useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';

/**
 * Hook geser kartu seluler yang ramah sentuhan iOS & Android:
 * tidak menahan scroll vertikal sampai arah geser horizontal terkonfirmasi.
 */
export function gunakanGeserSlide(totalSlide: number) {
  const [slideAktif, setSlideAktif] = useState(0);
  const [offsetSeretPx, setOffsetSeretPx] = useState(0);
  const [sedangSeret, setSedangSeret] = useState(false);

  const awalXRef = useRef<number | null>(null);
  const awalYRef = useRef<number | null>(null);
  const kunciHorizontalRef = useRef(false);

  const geserSlide = (arah: -1 | 1) => {
    setSlideAktif((sebelumnya) => (sebelumnya + arah + totalSlide) % totalSlide);
  };

  const resetSeret = (
    pointerId?: number,
    target?: EventTarget & HTMLDivElement,
  ) => {
    if (pointerId !== undefined && target?.hasPointerCapture?.(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
    if (kunciHorizontalRef.current && Math.abs(offsetSeretPx) > 36) {
      geserSlide(offsetSeretPx < 0 ? 1 : -1);
    }
    awalXRef.current = null;
    awalYRef.current = null;
    kunciHorizontalRef.current = false;
    setSedangSeret(false);
    setOffsetSeretPx(0);
  };

  const tanganiKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') geserSlide(1);
    if (e.key === 'ArrowLeft') geserSlide(-1);
  };

  const atributTrack = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      awalXRef.current = e.clientX;
      awalYRef.current = e.clientY;
      kunciHorizontalRef.current = e.pointerType === 'mouse';
      setSedangSeret(e.pointerType === 'mouse');
      setOffsetSeretPx(0);
      if (e.pointerType === 'mouse') {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (awalXRef.current === null || awalYRef.current === null) return;
      const dx = e.clientX - awalXRef.current;
      const dy = e.clientY - awalYRef.current;

      if (!kunciHorizontalRef.current) {
        if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) {
          awalXRef.current = null;
          awalYRef.current = null;
          return;
        }
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          kunciHorizontalRef.current = true;
          setSedangSeret(true);
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // Sebagian peramban seluler tidak mewajibkan pointer capture untuk sentuhan
          }
        } else {
          return;
        }
      }

      setOffsetSeretPx(dx);
    },
    onPointerUp: (e: PointerEvent<HTMLDivElement>) =>
      resetSeret(e.pointerId, e.currentTarget),
    onPointerCancel: (e: PointerEvent<HTMLDivElement>) =>
      resetSeret(e.pointerId, e.currentTarget),
  };

  return {
    slideAktif,
    offsetSeretPx,
    sedangSeret,
    tanganiKeyDown,
    atributTrack,
  };
}
