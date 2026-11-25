import type { DokumenLaporanTerbangun } from '../../types/laporan';
import { LogoMerek, StatusTeks } from '../ui';

export interface PratinjauCetakLaporanProps {
  dokumen: DokumenLaporanTerbangun;
}

export function PratinjauCetakLaporan({ dokumen }: PratinjauCetakLaporanProps) {
  return (
    <article
      aria-label={`Lembar cetak ${dokumen.judul}`}
      className={`lembar-cetak-laporan mx-auto rounded-[var(--radius-md)] border border-[var(--garis-halus)] bg-white p-6 sm:p-8 text-[var(--teks-utama)] shadow-xs ${
        dokumen.orientasi === 'landscape' ? 'max-w-[1120px]' : 'max-w-[820px]'
      }`}
    >
      {/* Header Dokumen Cetak */}
      <header className="border-b-2 border-[var(--aksen-maroon)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--teks-redup)]">
          <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-wider text-[var(--aksen-maroon)]">
            <LogoMerek ukuran="xs" dekoratif />
            MRs Plan — MRs Atelier 2026
          </span>
          <span className="angka-tabular">
            Dibuat: {dokumen.dibuatPadaLabelWib}
          </span>
        </div>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--teks-utama)]">
          {dokumen.judul}
        </h2>
        <p className="mt-1 text-xs text-[var(--teks-sekunder)]">
          {dokumen.subjudul}
        </p>
        <p className="mt-1.5 text-[11px] text-[var(--teks-redup)]">
          Disusun oleh: {dokumen.dibuatOleh} · Berkas: <span className="font-mono">{dokumen.namaFile}</span>
        </p>
      </header>

      {/* Parameter & Catatan Integritas */}
      <section className="mt-4 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[#faf9f6] p-3.5 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="font-semibold text-[var(--teks-utama)]">
              Parameter Laporan Aktif
            </p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-[var(--teks-sekunder)] list-disc list-inside">
              {dokumen.parameterAktif.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[var(--teks-utama)]">
              Integritas Data &amp; Batas Privasi
            </p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-[var(--teks-sekunder)] list-disc list-inside">
              {dokumen.catatanIntegritas.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Ringkasan 4 Metrik */}
      {dokumen.ringkasanMetrik.length > 0 && (
        <section className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 hindari-potong-cetak">
          {dokumen.ringkasanMetrik.map((m) => (
            <div
              key={m.label}
              className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-white p-3"
            >
              <p className="text-[11px] text-[var(--teks-redup)]">{m.label}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--teks-utama)] angka-tabular">
                {m.nilai}
              </p>
              <div className="mt-1.5">
                <StatusTeks status={m.statusData} labelKustom={m.labelStatus} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Bagian Tabel Multi-Halaman */}
      <div className="mt-6 space-y-6">
        {dokumen.bagian.map((bagian) => (
          <section key={bagian.id} className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--garis-halus)] pb-1.5">
              <h3 className="text-sm font-semibold text-[var(--teks-utama)]">
                {bagian.judul}
              </h3>
              <span className="text-[11px] font-medium text-[var(--aksen-maroon)]">
                Status data: {bagian.labelStatus}
              </span>
            </div>

            {bagian.deskripsi && (
              <p className="text-xs text-[var(--teks-sekunder)] leading-relaxed">
                {bagian.deskripsi}
              </p>
            )}

            <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--garis-halus)]">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--aksen-maroon)] bg-[#f3f1ec]">
                    {bagian.kolom.map((kol, idxKol) => (
                      <th
                        key={kol}
                        scope="col"
                        className={`px-3 py-2 font-semibold text-[var(--teks-utama)] whitespace-nowrap ${
                          bagian.kolomRataKanan?.includes(idxKol)
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {kol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--garis-halus)]">
                  {bagian.baris.map((baris, idxBaris) => (
                    <tr
                      key={`${bagian.id}-${idxBaris}`}
                      className={idxBaris % 2 === 1 ? 'bg-[#fcfbf9]' : 'bg-white'}
                    >
                      {baris.map((sel, idxSel) => (
                        <td
                          key={`${bagian.id}-${idxBaris}-${idxSel}`}
                          className={`px-3 py-2 align-top text-[var(--teks-utama)] leading-relaxed ${
                            bagian.kolomRataKanan?.includes(idxSel)
                              ? 'text-right angka-tabular whitespace-nowrap'
                              : 'text-left'
                          }`}
                        >
                          {sel}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {/* Footer Dokumen Cetak */}
      <footer className="mt-8 border-t border-[var(--garis-halus)] pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--teks-redup)]">
        <span>
          MRs Plan (Melfarina × Raden Sirait) ·{' '}
          {dokumen.piiDisertakan
            ? 'Dokumen Internal (Memuat Kontak Privat PII)'
            : 'Teredaksi Default (Tanpa PII)'}
        </span>
        <span>Kuota Terbatas · Balige, Toba</span>
      </footer>
    </article>
  );
}
