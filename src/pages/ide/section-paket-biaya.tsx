import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { gunakanIklanAnggaran } from '../../hooks/gunakan-iklan-anggaran';
import type { IdSkenarioAnggaran } from '../../types/iklan';
import { formatRupiah } from '../../utils/format';
import {
  DAFTAR_TAB_PAKET_BIAYA,
  ambilDataPaketBiaya,
} from '../../utils/paket-biaya';

function SelPosBiayaDropdown({
  id,
  judul,
  keterangan,
  terbuka,
  onToggle,
}: {
  id: string;
  judul: string;
  keterangan: string;
  terbuka: boolean;
  onToggle: (id: string) => void;
}) {
  const idDetail = `detail-biaya-${id}`;
  return (
    <div>
      <button
        type="button"
        aria-expanded={terbuka}
        aria-controls={idDetail}
        onClick={() => onToggle(id)}
        className="w-full text-left inline-flex items-start gap-2 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aksen-maroon)] rounded"
      >
        <ChevronDown
          aria-hidden="true"
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--teks-redup)] dark:text-white/80 transition-transform duration-200 group-hover:text-[var(--teks-utama)] dark:group-hover:text-white ${
            terbuka ? 'rotate-180 text-[var(--teks-utama)] dark:text-white' : ''
          }`}
        />
        <span className="text-xs font-medium text-[var(--teks-utama)] leading-snug">
          {judul}
        </span>
      </button>

      <div
        id={idDetail}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          terbuka ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible'
        }`}
      >
        <div className="overflow-hidden">
          <p className="pt-1 pl-5.5 text-[11px] text-[var(--teks-redup)] leading-relaxed">
            {keterangan}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SectionPaketBiaya() {
  const { stateIklan, ubahSkenarioAktif } = gunakanIklanAnggaran();
  const [rincianTerbuka, setRincianTerbuka] = useState<Record<string, boolean>>({});

  const toggleRincian = (id: string) => {
    setRincianTerbuka((sebelumnya) => ({ ...sebelumnya, [id]: !sebelumnya[id] }));
  };

  const skenarioAktif = stateIklan.skenarioAktif;
  const dataPaket = ambilDataPaketBiaya(skenarioAktif);
  const {
    tab: tabAktif,
    skenario,
    rincianProduksi,
    rincianMedia,
    rincianLayananTermasuk,
    totalNilaiCoretLayananIdr,
  } = dataPaket;

  const pilihTab = (idSkenario: IdSkenarioAnggaran) => {
    if (idSkenario === skenarioAktif) return;
    ubahSkenarioAktif(idSkenario);
  };

  return (
    <section aria-labelledby="judul-paket-biaya" className="space-y-5 sm:space-y-6">
      <div className="text-center">
        <h2
          id="judul-paket-biaya"
          className="text-base sm:text-lg font-semibold text-[var(--teks-utama)]"
        >
          Paket Biaya (Produksi Konten + Iklan)
        </h2>
      </div>

      {/* 3 Tab Paket Biaya: Efisien | Optimal | Maksimal */}
      <div className="space-y-4">
        <div
          role="tablist"
          aria-label="Pilihan paket biaya"
          className="grid grid-cols-3 gap-2.5 sm:gap-3.5"
        >
          {DAFTAR_TAB_PAKET_BIAYA.map((tab) => {
            const aktif = tab.idSkenario === skenarioAktif;
            return (
              <button
                key={tab.id}
                id={`tab-paket-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={aktif}
                aria-controls="panel-tabel-paket-biaya"
                onClick={() => pilihTab(tab.idSkenario)}
                style={!aktif ? { backgroundImage: 'var(--gradasi-kartu-lembut)' } : undefined}
                className={`min-h-[44px] px-3 sm:px-5 py-2.5 rounded-[var(--radius-md)] border text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-[var(--bayangan-halus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F3CE7A] ${
                  aktif
                    ? 'bg-[#F3CE7A] border-[#F3CE7A] text-[#7A1C24]'
                    : 'border-[var(--aksen-maroon-garis)]/25 text-[var(--teks-sekunder)] hover:text-[var(--teks-utama)] hover:border-[var(--aksen-maroon-garis)]/55'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tabel Rincian Paket Biaya (Pos Biaya & Keterangan | Qty | Harga | Total) */}
        <div
          id="panel-tabel-paket-biaya"
          role="tabpanel"
          aria-labelledby={`tab-paket-${tabAktif.id}`}
          style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
          className="rounded-[var(--radius-lg)] border border-[var(--aksen-maroon-garis)]/25 shadow-[var(--bayangan-halus)] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Rincian paket biaya {tabAktif.label} mencakup pos biaya, qty, harga satuan, dan total
              </caption>
              <thead>
                <tr className="border-b border-[var(--garis-tegas)] bg-[var(--bg-sekunder)]/60 dark:bg-black/25">
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-[var(--teks-sekunder)]"
                  >
                    Pos Biaya &amp; Keterangan
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-[var(--teks-sekunder)] text-center whitespace-nowrap"
                  >
                    Qty
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-[var(--teks-sekunder)] text-right whitespace-nowrap"
                  >
                    Harga
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-[var(--teks-sekunder)] text-right whitespace-nowrap"
                  >
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--garis-halus)]">
                <tr className="bg-[var(--bg-sekunder)]/45 dark:bg-black/20">
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--teks-redup)]"
                  >
                    A. Rincian Biaya Produksi Konten
                  </td>
                </tr>

                {rincianProduksi.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5 align-top">
                      <SelPosBiayaDropdown
                        id={item.id}
                        judul={item.judul}
                        keterangan={item.keterangan}
                        terbuka={Boolean(rincianTerbuka[item.id])}
                        onToggle={toggleRincian}
                      />
                    </td>
                    <td className="px-4 py-2.5 align-top text-center text-xs text-[var(--teks-sekunder)] angka-tabular whitespace-nowrap">
                      {item.qty}
                    </td>
                    <td className="px-4 py-2.5 align-top text-right text-xs text-[var(--teks-utama)] angka-tabular whitespace-nowrap">
                      {item.hargaCoretIdr ? (
                        <span className="line-through text-[var(--teks-redup)]">
                          {formatRupiah(item.hargaCoretIdr)}
                        </span>
                      ) : item.hargaIdr !== null ? (
                        formatRupiah(item.hargaIdr)
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2.5 align-top text-right text-xs text-[var(--teks-utama)] angka-tabular whitespace-nowrap">
                      {formatRupiah(item.totalIdr)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-[var(--bg-sekunder)]/55 dark:bg-black/25 font-semibold">
                  <td className="px-4 py-2.5 text-xs text-[var(--teks-utama)]">
                    Total Produksi Konten
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs text-[var(--teks-redup)]">
                    —
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-[var(--teks-redup)]">
                    —
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-[var(--teks-utama)] angka-tabular whitespace-nowrap">
                    {formatRupiah(skenario.totalProduksiIdr)}
                  </td>
                </tr>

                <tr className="bg-[var(--bg-sekunder)]/45 dark:bg-black/20">
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--teks-redup)]"
                  >
                    B. Biaya Ads Setup &amp; Paid Media (Meta Ads &amp; TikTok Ads)
                  </td>
                </tr>

                {rincianMedia.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5 align-top">
                      <SelPosBiayaDropdown
                        id={item.id}
                        judul={item.judul}
                        keterangan={item.keterangan}
                        terbuka={Boolean(rincianTerbuka[item.id])}
                        onToggle={toggleRincian}
                      />
                    </td>
                    <td className="px-4 py-2.5 align-top text-center text-xs text-[var(--teks-sekunder)] angka-tabular whitespace-nowrap">
                      {item.qty}
                    </td>
                    <td className="px-4 py-2.5 align-top text-right text-xs text-[var(--teks-utama)] angka-tabular whitespace-nowrap">
                      {item.organikSaja || item.hargaIdr === null
                        ? 'Rp 0'
                        : formatRupiah(item.hargaIdr)}
                    </td>
                    <td className="px-4 py-2.5 align-top text-right text-xs text-[var(--teks-utama)] angka-tabular whitespace-nowrap">
                      {item.organikSaja
                        ? 'Rp0 (Organik)'
                        : formatRupiah(item.totalIdr)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-[var(--bg-sekunder)]/55 dark:bg-black/25 font-semibold">
                  <td className="px-4 py-2.5 text-xs text-[var(--teks-utama)]">
                    Total Ads Setup &amp; Paid Media
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs text-[var(--teks-redup)]">
                    —
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-[var(--teks-redup)]">
                    —
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-[var(--teks-utama)] angka-tabular whitespace-nowrap">
                    {formatRupiah(skenario.totalMediaIdr)}
                  </td>
                </tr>

                <tr className="bg-[var(--bg-sekunder)]/45 dark:bg-black/20">
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--teks-redup)]"
                  >
                    C. Layanan Pengelolaan, SEO, Web Desk &amp; Administrasi (Termasuk Gratis)
                  </td>
                </tr>

                {rincianLayananTermasuk.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5 align-top">
                      <SelPosBiayaDropdown
                        id={item.id}
                        judul={item.judul}
                        keterangan={item.keterangan}
                        terbuka={Boolean(rincianTerbuka[item.id])}
                        onToggle={toggleRincian}
                      />
                    </td>
                    <td className="px-4 py-2.5 align-top text-center text-xs text-[var(--teks-sekunder)] angka-tabular whitespace-nowrap">
                      {item.qty}
                    </td>
                    <td className="px-4 py-2.5 align-top text-right text-xs angka-tabular whitespace-nowrap">
                      <span className="line-through text-[var(--teks-redup)]">
                        {formatRupiah(item.hargaCoretIdr ?? 0)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 align-top text-right text-xs font-medium text-[var(--status-sukses)] angka-tabular whitespace-nowrap">
                      {formatRupiah(item.totalIdr)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-[var(--bg-sekunder)]/55 dark:bg-black/25 font-semibold">
                  <td className="px-4 py-2.5 text-xs text-[var(--teks-utama)]">
                    Total Layanan Pengelolaan &amp; Infrastruktur (Termasuk)
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs text-[var(--teks-redup)]">
                    —
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs angka-tabular whitespace-nowrap">
                    <span className="line-through text-[var(--teks-redup)] font-normal">
                      {formatRupiah(totalNilaiCoretLayananIdr)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-[var(--status-sukses)] angka-tabular whitespace-nowrap">
                    {formatRupiah(0)}
                  </td>
                </tr>

                <tr className="bg-[var(--aksen-maroon-lembut)]/80 dark:bg-black/35 font-semibold">
                  <td className="px-4 py-3 text-xs sm:text-sm text-[var(--aksen-maroon-teks)] dark:text-white">
                    GRAND TOTAL KAMPANYE KONTEN (Produksi Konten + Ads Setup &amp; Paid Media)
                  </td>
                  <td className="px-4 py-3 text-center text-xs sm:text-sm text-[var(--aksen-maroon-teks)] dark:text-white" />
                  <td className="px-4 py-3 text-right text-xs sm:text-sm text-[var(--aksen-maroon-teks)] dark:text-white" />
                  <td className="px-4 py-3 text-right text-xs sm:text-sm text-[var(--aksen-maroon-teks)] dark:text-white angka-tabular whitespace-nowrap">
                    {formatRupiah(skenario.grandTotalIdr)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="px-4 py-3 sm:px-5 border-t border-[var(--garis-halus)] text-[11px] text-[var(--teks-redup)] leading-relaxed">
            Catatan: seluruh pos anggaran difokuskan khusus untuk biaya produksi konten, operasional tim, sewa alat standar, dan distribusi iklan.
          </p>
        </div>
      </div>
    </section>
  );
}
