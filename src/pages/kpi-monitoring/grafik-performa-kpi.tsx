import { useMemo, useState } from 'react';
import {
  bangunSeriPerbandinganPeriode,
  dapatkanDefinisiMetrik,
  dapatkanMetrikByGrup,
  formatNilaiMetrik,
} from '../../utils/kpi';
import type { GrupKpi, SnapshotKpiAktual } from '../../types/kpi';
import { PembungkusGrafik, StatusTeks } from '../../components/ui';

export interface GrafikPerformaKpiProps {
  grup: GrupKpi;
  namaGrup: string;
  daftarSnapshot: SnapshotKpiAktual[];
  modeContoh: boolean;
}

export function GrafikPerformaKpi({
  grup,
  namaGrup,
  daftarSnapshot,
  modeContoh,
}: GrafikPerformaKpiProps) {
  const daftarMetrik = useMemo(() => dapatkanMetrikByGrup(grup), [grup]);
  const [kodeMetrikDipilih, setKodeMetrikDipilih] = useState(
    daftarMetrik[0]?.kode ?? '',
  );

  // Pastikan kode metrik selalu valid jika grup berubah
  const kodeAktif = daftarMetrik.some((m) => m.kode === kodeMetrikDipilih)
    ? kodeMetrikDipilih
    : (daftarMetrik[0]?.kode ?? '');

  const definisiAktif = dapatkanDefinisiMetrik(kodeAktif);

  const seri = useMemo(
    () => bangunSeriPerbandinganPeriode(daftarSnapshot, grup, kodeAktif),
    [daftarSnapshot, grup, kodeAktif],
  );

  const periodeRentang =
    seri.length > 0
      ? seri.length === 1
        ? `Periode tercatat: ${seri[0].periode}`
        : `Perbandingan ${seri.length} periode (${seri[0].periode} s.d. ${seri[seri.length - 1].periode})`
      : 'Menunggu pencatatan atau impor CSV aktual';

  const nilaiMaks = useMemo(() => {
    if (seri.length === 0) return 100;
    const maks = Math.max(...seri.map((t) => t.nilai));
    return maks > 0 ? maks : 100;
  }, [seri]);

  const lebarSvg = 680;
  const tinggiSvg = 220;
  const padKiri = 64;
  const padKanan = 24;
  const padAtas = 22;
  const padBawah = 40;
  const areaLebar = lebarSvg - padKiri - padKanan;
  const areaTinggi = tinggiSvg - padAtas - padBawah;

  return (
    <PembungkusGrafik
      judul={`Grafik Aktual ${namaGrup}${definisiAktif ? ` — ${definisiAktif.nama}` : ''}`}
      periodeDanSumber={
        modeContoh
          ? 'Data contoh (Simulasi UI non-persisten — bukan kinerja nyata)'
          : periodeRentang
      }
      memilikiData={seri.length > 0}
      pesanKosong={`Belum ada data aktual untuk kelompok ${namaGrup}. Grafik hanya digambar setelah snapshot aktual diinput atau diimpor.`}
      aksiHeader={
        <div className="flex flex-wrap items-center gap-2">
          {modeContoh && (
            <StatusTeks status="sample" labelKustom="Data contoh" />
          )}
          <select
            aria-label="Pilih metrik grafik"
            value={kodeAktif}
            onChange={(e) => setKodeMetrikDipilih(e.target.value)}
            className="h-8 w-52 rounded-[var(--radius-sm)] border border-[var(--garis-tegas)] bg-[var(--bg-permukaan)] px-2.5 text-xs text-[var(--teks-utama)] focus:border-[var(--aksen-maroon-garis)]"
          >
            {daftarMetrik.map((m) => (
              <option key={m.kode} value={m.kode}>
                {m.nama}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {modeContoh && (
        <p className="mb-3 rounded-[var(--radius-sm)] border border-[var(--status-peringatan)]/40 bg-[var(--status-peringatan)]/[0.08] px-3 py-2 text-xs text-[var(--status-peringatan)]">
          <strong>Data contoh:</strong> Grafik di bawah hanya menampilkan ilustrasi simulasi di memori dan tidak disimpan ke database operasional.
        </p>
      )}

      {seri.length === 1 && (
        <p className="mb-3 text-xs text-[var(--teks-sekunder)]">
          Baru tercatat 1 periode ({seri[0].periode}). Perbandingan antar-periode penuh akan tampil setelah minimal 2 periode aktual masuk.
        </p>
      )}

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${lebarSvg} ${tinggiSvg}`}
          role="img"
          aria-label={`Grafik batang ${definisiAktif?.nama ?? namaGrup} berdasarkan periode aktual`}
          className="w-full min-w-[460px] h-56 select-none"
        >
          {/* Garis referensi horizontal dari 0 (sumbu tidak dipotong) */}
          {[0, 0.5, 1].map((rasio) => {
            const y = padAtas + areaTinggi * (1 - rasio);
            const nilaiTick = Math.round(nilaiMaks * rasio);
            return (
              <g key={rasio}>
                <line
                  x1={padKiri}
                  y1={y}
                  x2={lebarSvg - padKanan}
                  y2={y}
                  stroke="var(--garis-halus)"
                  strokeDasharray={rasio === 0 ? undefined : '3 3'}
                  strokeWidth={1}
                />
                <text
                  x={padKiri - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--teks-redup)"
                >
                  {nilaiTick.toLocaleString('id-ID')}
                </text>
              </g>
            );
          })}

          {/* Batang per periode */}
          {seri.map((titik, idx) => {
            const slotLebar = areaLebar / seri.length;
            const lebarBatang = Math.min(48, Math.max(18, slotLebar * 0.52));
            const x = padKiri + idx * slotLebar + (slotLebar - lebarBatang) / 2;
            const tinggiBatang = (titik.nilai / nilaiMaks) * areaTinggi;
            const y = padAtas + areaTinggi - tinggiBatang;
            const warna = modeContoh ? 'var(--aksen-emas)' : 'var(--aksen-maroon)';

            return (
              <g key={titik.periode}>
                <rect
                  x={x}
                  y={y}
                  width={lebarBatang}
                  height={Math.max(2, tinggiBatang)}
                  rx={5}
                  fill={warna}
                  stroke={modeContoh ? 'var(--aksen-emas-terang)' : 'var(--aksen-maroon-garis)'}
                  strokeWidth={1}
                />
                <text
                  x={x + lebarBatang / 2}
                  y={Math.max(12, y - 6)}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--teks-utama)"
                >
                  {definisiAktif
                    ? formatNilaiMetrik(titik.nilai, definisiAktif.satuan)
                    : titik.nilai.toLocaleString('id-ID')}
                </text>
                <text
                  x={x + lebarBatang / 2}
                  y={tinggiSvg - 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--teks-sekunder)"
                >
                  {titik.periode}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </PembungkusGrafik>
  );
}
