export interface InputMetrikScroll {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  rectTop: number;
  rectHeight: number;
  rectRight: number;
  viewportWidth: number;
}

export interface MetrikIndikatorScroll {
  aktif: boolean;
  topPx: number;
  heightPx: number;
  rightPx: number;
}

const INSET_VERTIKAL_PX = 6;
const MIN_TINGGI_THUMB_PX = 28;
const MARGIN_KANAN_PX = 3;

export function hitungMetrikIndikatorScroll(
  input: InputMetrikScroll,
): MetrikIndikatorScroll {
  const {
    scrollTop,
    scrollHeight,
    clientHeight,
    rectTop,
    rectHeight,
    rectRight,
    viewportWidth,
  } = input;

  if (scrollHeight <= clientHeight + 2 || rectHeight <= 16 || clientHeight <= 0) {
    return {
      aktif: false,
      topPx: 0,
      heightPx: 0,
      rightPx: MARGIN_KANAN_PX,
    };
  }

  const tinggiJalur = Math.max(24, rectHeight - INSET_VERTIKAL_PX * 2);
  const tinggiIdeal = Math.round((clientHeight / scrollHeight) * tinggiJalur);
  const heightPx = Math.max(MIN_TINGGI_THUMB_PX, Math.min(tinggiJalur, tinggiIdeal));

  const rentangScroll = scrollHeight - clientHeight;
  const progres =
    rentangScroll > 0 ? Math.min(1, Math.max(0, scrollTop / rentangScroll)) : 0;
  const jarakMaks = Math.max(0, tinggiJalur - heightPx);
  const topPx = Math.round(rectTop + INSET_VERTIKAL_PX + progres * jarakMaks);
  const rightPx = Math.max(
    MARGIN_KANAN_PX,
    Math.round(viewportWidth - rectRight + MARGIN_KANAN_PX),
  );

  return {
    aktif: true,
    topPx,
    heightPx,
    rightPx,
  };
}
