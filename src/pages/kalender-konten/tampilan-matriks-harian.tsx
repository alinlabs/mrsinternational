import type { BundelHariKalender, KonsepKonten } from '../../types/kalender';
import {
  dapatkanInfoStatusKonten,
  dapatkanLabelPilar,
} from '../../utils/kalender';
import { KondisiKosong, StatusTeks } from '../../components/ui';

export interface TampilanMatriksHarianProps {
  daftarHari: BundelHariKalender[];
  filterAktif: boolean;
  onPilihKonten: (konten: KonsepKonten) => void;
}

function KartuSlotHarian({
  konten,
  onPilih,
}: {
  konten: KonsepKonten | null;
  onPilih: (konten: KonsepKonten) => void;
}) {
  if (!konten) {
    return (
      <div className="rounded-[var(--radius-sm)] border border-dashed border-[var(--garis-halus)] p-2.5 text-[11px] text-[var(--teks-redup)]">
        Tidak sesuai filter aktif
      </div>
    );
  }

  const infoStatus = dapatkanInfoStatusKonten(konten.status);

  return (
    <button
      type="button"
      onClick={() => onPilih(konten)}
      aria-label={`Buka detail ${konten.labelTanggal} ${konten.slot}: ${konten.judul}`}
      className="w-full text-left rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] hover:border-[var(--aksen-maroon-garis)] hover:bg-[var(--bg-sekunder)] p-3 transition-colors cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold text-[var(--aksen-maroon-teks)]">
          {dapatkanLabelPilar(konten.pilar)}
        </span>
        <StatusTeks labelKustom={infoStatus.label} nadaKustom={infoStatus.nada} />
      </div>
      <p className="text-xs font-medium text-[var(--teks-utama)] leading-snug group-hover:text-[var(--aksen-maroon-teks)] transition-colors">
        {konten.judul}
      </p>
      <p className="mt-1.5 text-[11px] text-[var(--teks-redup)]">
        Tujuan: {konten.tujuan} • {konten.waktuUsulanUtama}
      </p>
      <p className="mt-1 text-[11px] text-[var(--teks-sekunder)]">
        Penanggung jawab: {konten.pic}
      </p>
    </button>
  );
}

export function TampilanMatriksHarian({
  daftarHari,
  filterAktif,
  onPilihKonten,
}: TampilanMatriksHarianProps) {
  if (daftarHari.length === 0) {
    return (
      <KondisiKosong
        judul={
          filterAktif
            ? 'Tidak ada jadwal konten yang sesuai filter'
            : 'Belum ada jadwal konten'
        }
        deskripsi="Sesuaikan kata kunci atau atur ulang filter tanggal, pilar, kanal, status, dan PIC."
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-[var(--garis-halus)] rounded-[var(--radius-md)] bg-[var(--bg-permukaan)] shadow-[var(--bayangan-halus)]">
      <table className="w-full min-w-[1040px] border-collapse text-sm">
        <caption className="sr-only">
          Matriks kalender konten 22 hari dengan 2 video master dan 1 desain master per hari beserta kanal distribusi
        </caption>
        <thead className="bg-[var(--bg-kanvas)] border-b border-[var(--garis-halus)]">
          <tr>
            <th scope="col" className="w-[14%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
              Tanggal &amp; Tahap
            </th>
            <th scope="col" className="w-[26%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
              Video A — Cerita &amp; Profil
            </th>
            <th scope="col" className="w-[26%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
              Video B — Visual &amp; Produk
            </th>
            <th scope="col" className="w-[22%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
              Desain / Carousel
            </th>
            <th scope="col" className="w-[12%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
              Ajakan &amp; Catatan
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--garis-halus)]">
          {daftarHari.map((hari) => {
            const contohItem = hari.videoA ?? hari.videoB ?? hari.design;
            return (
              <tr key={hari.tanggal} className="align-top hover:bg-[var(--bg-kanvas)]/30">
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold text-[var(--teks-utama)] angka-tabular">
                    {hari.labelTanggal} 2026
                  </p>
                  <p className="text-[11px] font-medium text-[var(--aksen-maroon-teks)] mt-0.5">
                    Hari ke-{hari.hariKe}
                  </p>
                  <p className="text-xs text-[var(--teks-redup)] mt-1">{hari.fase}</p>
                </td>
                <td className="px-3 py-3.5">
                  <KartuSlotHarian konten={hari.videoA} onPilih={onPilihKonten} />
                </td>
                <td className="px-3 py-3.5">
                  <KartuSlotHarian konten={hari.videoB} onPilih={onPilihKonten} />
                </td>
                <td className="px-3 py-3.5">
                  <KartuSlotHarian konten={hari.design} onPilih={onPilihKonten} />
                </td>
                <td className="px-3 py-3.5 text-[11px] text-[var(--teks-sekunder)] leading-relaxed">
                  {contohItem ? (
                    <div className="space-y-1.5">
                      <p>
                        <span className="font-semibold text-[var(--teks-utama)]">Ajakan:</span>{' '}
                        {contohItem.cta}
                      </p>
                      <p className="text-[var(--teks-redup)]">{contohItem.catatan}</p>
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
