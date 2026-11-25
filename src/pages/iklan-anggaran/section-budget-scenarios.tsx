import { CheckCircle2 } from 'lucide-react';
import {
  DETAIL_SKENARIO_ANGGARAN_KANONIK,
  RINCIAN_BIAYA_PRODUKSI_KANONIK,
  RINCIAN_LAYANAN_TERMASUK_KANONIK,
} from '../../data/iklan-kanonik';
import type { IdSkenarioAnggaran } from '../../types/iklan';
import { formatEstimasiRupiah } from '../../utils/beranda';
import { formatRupiah } from '../../utils/format';
import { Kartu, StatusTeks, Tombol } from '../../components/ui';

export interface SectionBudgetScenariosProps {
  skenarioAktif: IdSkenarioAnggaran;
  onPilihSkenario: (skenario: IdSkenarioAnggaran) => void;
}

export function SectionBudgetScenarios({
  skenarioAktif,
  onPilihSkenario,
}: SectionBudgetScenariosProps) {
  const [hemat, menengah, agresif] = DETAIL_SKENARIO_ANGGARAN_KANONIK;
  const totalCoretLayanan = (
    kolom: 'hargaCoretHematIdr' | 'hargaCoretMenengahIdr' | 'hargaCoretAgresifIdr',
  ) =>
    RINCIAN_LAYANAN_TERMASUK_KANONIK.reduce(
      (sum, item) => sum + (item[kolom] ?? 0),
      0,
    );
  const totalCoretLayananHemat = totalCoretLayanan('hargaCoretHematIdr');
  const totalCoretLayananMenengah = totalCoretLayanan('hargaCoretMenengahIdr');
  const totalCoretLayananAgresif = totalCoretLayanan('hargaCoretAgresifIdr');

  return (
    <div className="space-y-5">
      <Kartu
        judul="Perbandingan Paket Biaya (Produksi Konten + Iklan)"
        subjudul="Estimasi perencanaan awal, terpisah dari batas biaya disetujui dan belanja aktual."
        aksiHeader={<StatusTeks status="estimated" labelKustom="Estimasi Awal" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Perbandingan lengkap rincian komponen produksi, media, dan grand total untuk skenario Hemat, Menengah, dan Agresif
            </caption>
            <thead>
              <tr className="border-b border-[var(--garis-tegas)] bg-[var(--bg-sekunder)]/60 dark:bg-black/25">
                <th scope="col" className="px-4 py-3 text-xs font-semibold text-[var(--teks-sekunder)]">
                  Pos Biaya &amp; Keterangan
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-semibold text-[var(--teks-sekunder)] text-right">
                  {hemat.nama}
                  {skenarioAktif === 'hemat' && (
                    <span className="block text-[11px] font-medium text-[var(--aksen-maroon-teks)]">
                      (Dipilih)
                    </span>
                  )}
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-semibold text-[var(--teks-sekunder)] text-right">
                  {menengah.nama}
                  {skenarioAktif === 'menengah' ? (
                    <span className="block text-[11px] font-medium text-[var(--aksen-maroon-teks)]">
                      (Dipilih • Rekomendasi)
                    </span>
                  ) : (
                    <span className="block text-[11px] font-normal text-[var(--aksen-emas)]">
                      (Rekomendasi)
                    </span>
                  )}
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-semibold text-[var(--teks-sekunder)] text-right">
                  {agresif.nama}
                  {skenarioAktif === 'agresif' && (
                    <span className="block text-[11px] font-medium text-[var(--aksen-maroon-teks)]">
                      (Dipilih)
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--garis-halus)]">
              <tr className="bg-[var(--bg-sekunder)]/45 dark:bg-black/20">
                <td colSpan={4} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
                  A. Rincian Biaya Produksi Konten
                </td>
              </tr>

              {RINCIAN_BIAYA_PRODUKSI_KANONIK.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2.5">
                    <p className="text-xs font-medium text-[var(--teks-utama)]">
                      {item.komponen}
                    </p>
                    <p className="text-[11px] text-[var(--teks-redup)]">
                      {item.keterangan}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-[var(--teks-utama)] angka-tabular whitespace-nowrap">
                    {item.hargaCoretHematIdr ? (
                      <>
                        <span className="line-through text-[var(--teks-redup)] mr-1.5">
                          {formatRupiah(item.hargaCoretHematIdr)}
                        </span>
                        <span>{formatRupiah(item.hematIdr)}</span>
                      </>
                    ) : (
                      formatRupiah(item.hematIdr)
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-[var(--teks-utama)] angka-tabular whitespace-nowrap">
                    {item.hargaCoretMenengahIdr ? (
                      <>
                        <span className="line-through text-[var(--teks-redup)] mr-1.5">
                          {formatRupiah(item.hargaCoretMenengahIdr)}
                        </span>
                        <span>{formatRupiah(item.menengahIdr)}</span>
                      </>
                    ) : (
                      formatRupiah(item.menengahIdr)
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-[var(--teks-utama)] angka-tabular whitespace-nowrap">
                    {item.hargaCoretAgresifIdr ? (
                      <>
                        <span className="line-through text-[var(--teks-redup)] mr-1.5">
                          {formatRupiah(item.hargaCoretAgresifIdr)}
                        </span>
                        <span>{formatRupiah(item.agresifIdr)}</span>
                      </>
                    ) : (
                      formatRupiah(item.agresifIdr)
                    )}
                  </td>
                </tr>
              ))}

              <tr className="bg-[var(--bg-sekunder)]/55 dark:bg-black/25 font-semibold">
                <td className="px-4 py-2.5 text-xs text-[var(--teks-utama)]">
                  Total Produksi Konten
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-[var(--teks-utama)] angka-tabular">
                  {formatRupiah(hemat.totalProduksiIdr)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-[var(--teks-utama)] angka-tabular">
                  {formatRupiah(menengah.totalProduksiIdr)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-[var(--teks-utama)] angka-tabular">
                  {formatRupiah(agresif.totalProduksiIdr)}
                </td>
              </tr>

              <tr className="bg-[var(--bg-sekunder)]/45 dark:bg-black/20">
                <td colSpan={4} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
                  B. Biaya Ads Setup &amp; Paid Media (Meta Ads &amp; TikTok Ads)
                </td>
              </tr>

              <tr>
                <td className="px-4 py-2.5">
                  <p className="text-xs font-medium text-[var(--teks-utama)]">
                    Biaya Ads Setup (Meta Ads &amp; TikTok Ads)
                  </p>
                  <p className="text-[11px] text-[var(--teks-redup)]">
                    Sudah termasuk setup iklan Meta Ads dan TikTok Ads (akun iklan/BM, struktur campaign, pixel/tracking, penempatan kreatif, dan verifikasi Ads Manager).
                  </p>
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(hemat.adsSetupIdr)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(menengah.adsSetupIdr)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(agresif.adsSetupIdr)}
                </td>
              </tr>

              <tr>
                <td className="px-4 py-2.5">
                  <p className="text-xs font-medium text-[var(--teks-utama)]">
                    Meta Ads (Awareness / ThruPlay)
                  </p>
                  <p className="text-[11px] text-[var(--teks-redup)]">
                    Hemat: 1 flight 29 Nov–5 Des @Rp200rb/hr; Menengah: 2 flight @Rp350rb/hr; Agresif: 2 flight @Rp500rb/hr
                  </p>
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(hemat.metaIdr)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(menengah.metaIdr)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(agresif.metaIdr)}
                </td>
              </tr>

              <tr>
                <td className="px-4 py-2.5">
                  <p className="text-xs font-medium text-[var(--teks-utama)]">
                    TikTok Ads
                  </p>
                  <p className="text-[11px] text-[var(--teks-redup)]">
                    Hemat: organik (Rp0/hari); Menengah: Rp450.000/hari (1 ad group) × 7 hr; Agresif: Rp800.000/hari (2 ad groups @Rp400.000/hari) × 7 hr (4–10 Des)
                  </p>
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  Rp0 (Organik)
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(menengah.tiktokIdr)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(agresif.tiktokIdr)}
                </td>
              </tr>

              <tr className="bg-[var(--bg-sekunder)]/55 dark:bg-black/25 font-semibold">
                <td className="px-4 py-2.5 text-xs text-[var(--teks-utama)]">
                  Total Ads Setup &amp; Paid Media
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(hemat.totalMediaIdr)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(menengah.totalMediaIdr)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular">
                  {formatRupiah(agresif.totalMediaIdr)}
                </td>
              </tr>

              <tr className="bg-[var(--bg-sekunder)]/45 dark:bg-black/20">
                <td colSpan={4} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
                  C. Layanan Pengelolaan, SEO, Web Desk &amp; Administrasi (Termasuk Gratis)
                </td>
              </tr>

              {RINCIAN_LAYANAN_TERMASUK_KANONIK.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2.5">
                    <p className="text-xs font-medium text-[var(--teks-utama)]">
                      {item.komponen}
                    </p>
                    <p className="text-[11px] text-[var(--teks-redup)]">
                      {item.keterangan}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs angka-tabular whitespace-nowrap">
                    <span className="line-through text-[var(--teks-redup)] mr-1.5">
                      {formatRupiah(item.hargaCoretHematIdr ?? 0)}
                    </span>
                    <span className="font-medium text-[var(--status-sukses)]">
                      {formatRupiah(item.hematIdr)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs angka-tabular whitespace-nowrap">
                    <span className="line-through text-[var(--teks-redup)] mr-1.5">
                      {formatRupiah(item.hargaCoretMenengahIdr ?? 0)}
                    </span>
                    <span className="font-medium text-[var(--status-sukses)]">
                      {formatRupiah(item.menengahIdr)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs angka-tabular whitespace-nowrap">
                    <span className="line-through text-[var(--teks-redup)] mr-1.5">
                      {formatRupiah(item.hargaCoretAgresifIdr ?? 0)}
                    </span>
                    <span className="font-medium text-[var(--status-sukses)]">
                      {formatRupiah(item.agresifIdr)}
                    </span>
                  </td>
                </tr>
              ))}

              <tr className="bg-[var(--bg-sekunder)]/55 dark:bg-black/25 font-semibold">
                <td className="px-4 py-2.5 text-xs text-[var(--teks-utama)]">
                  Total Layanan Pengelolaan &amp; Infrastruktur (Termasuk)
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular whitespace-nowrap">
                  <span className="line-through text-[var(--teks-redup)] font-normal mr-1.5">
                    {formatRupiah(totalCoretLayananHemat)}
                  </span>
                  <span className="text-[var(--status-sukses)]">{formatRupiah(0)}</span>
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular whitespace-nowrap">
                  <span className="line-through text-[var(--teks-redup)] font-normal mr-1.5">
                    {formatRupiah(totalCoretLayananMenengah)}
                  </span>
                  <span className="text-[var(--status-sukses)]">{formatRupiah(0)}</span>
                </td>
                <td className="px-4 py-2.5 text-right text-xs angka-tabular whitespace-nowrap">
                  <span className="line-through text-[var(--teks-redup)] font-normal mr-1.5">
                    {formatRupiah(totalCoretLayananAgresif)}
                  </span>
                  <span className="text-[var(--status-sukses)]">{formatRupiah(0)}</span>
                </td>
              </tr>

              <tr className="bg-[var(--aksen-maroon-lembut)]/80 dark:bg-black/35 font-semibold">
                <td className="px-4 py-3 text-sm text-[var(--aksen-maroon-teks)] dark:text-white">
                  GRAND TOTAL KAMPANYE KONTEN (Produksi Konten + Ads Setup &amp; Paid Media)
                </td>
                <td className="px-4 py-3 text-right text-sm text-[var(--aksen-maroon-teks)] dark:text-white angka-tabular">
                  {formatEstimasiRupiah(hemat.grandTotalIdr, hemat.grandTotalPerkiraan)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-[var(--aksen-maroon-teks)] dark:text-white angka-tabular">
                  {formatEstimasiRupiah(menengah.grandTotalIdr, menengah.grandTotalPerkiraan)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-[var(--aksen-maroon-teks)] dark:text-white angka-tabular">
                  {formatEstimasiRupiah(agresif.grandTotalIdr, agresif.grandTotalPerkiraan)}
                </td>
              </tr>

              <tr>
                <td className="px-4 py-3 text-xs text-[var(--teks-redup)]">
                  Aktifkan sebagai skenario kerja utama pada Control Center
                </td>
                {DETAIL_SKENARIO_ANGGARAN_KANONIK.map((skenario) => {
                  const aktif = skenarioAktif === skenario.id;
                  return (
                    <td key={skenario.id} className="px-4 py-3 text-right">
                      <Tombol
                        varian={aktif ? 'primer' : 'sekunder'}
                        ukuran="sm"
                        ikonKiri={
                          aktif ? (
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : undefined
                        }
                        onClick={() => onPilihSkenario(skenario.id)}
                      >
                        {aktif ? 'Skenario Aktif' : `Pilih ${skenario.nama.replace('Skenario ', '')}`}
                      </Tombol>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-[var(--teks-redup)] leading-relaxed">
          Catatan: seluruh pos anggaran difokuskan khusus untuk biaya produksi konten, operasional tim, sewa alat standar, dan distribusi iklan.
        </p>
      </Kartu>
    </div>
  );
}
