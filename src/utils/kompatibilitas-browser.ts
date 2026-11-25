/**
 * Deteksi aman dukungan penampil PDF inline pada <iframe> lintas OS/peramban.
 * Android Chrome & iOS/iPadOS Safari tidak merender PDF multi-halaman secara andal di dalam <iframe>
 * (Android memicu unduhan otomatis; iOS hanya menampilkan halaman pertama terpotong).
 */
export function dukungPratinjauPdfInline(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return true;
  }

  const ua = navigator.userAgent || '';
  const adalahPerangkatSentuhSeluler =
    /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)) ||
    (typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches);

  if (adalahPerangkatSentuhSeluler) {
    return false;
  }

  if (
    'pdfViewerEnabled' in navigator &&
    navigator.pdfViewerEnabled === false
  ) {
    return false;
  }

  return true;
}
