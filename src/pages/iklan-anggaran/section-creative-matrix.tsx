import { useState } from 'react';
import type { FormEvent } from 'react';
import { Film, Pencil, ShieldCheck } from 'lucide-react';
import type { BarisCreativeMatrix } from '../../types/iklan';
import {
  AreaTeks,
  InputTeks,
  Kartu,
  ModalDialog,
  Tombol,
} from '../../components/ui';

export interface SectionCreativeMatrixProps {
  daftarCreative: BarisCreativeMatrix[];
  onSimpanCreative: (creative: BarisCreativeMatrix) => void;
}

const LABEL_PILAR: Record<BarisCreativeMatrix['pilar'], string> = {
  hero: 'Konsep Utama',
  founder: 'Cerita Owner',
  designer: 'Karya Desainer',
  product: 'Detail Produk',
};

export function SectionCreativeMatrix({
  daftarCreative,
  onSimpanCreative,
}: SectionCreativeMatrixProps) {
  const [creativeEdit, setCreativeEdit] = useState<BarisCreativeMatrix | null>(
    null,
  );
  const [hookUtama, setHookUtama] = useState('');
  const [ctaAman, setCtaAman] = useState('');
  const [kpiFokus, setKpiFokus] = useState('');
  const [catatanKesiapan, setCatatanKesiapan] = useState('');

  const bukaModal = (item: BarisCreativeMatrix) => {
    setCreativeEdit(item);
    setHookUtama(item.hookUtama);
    setCtaAman(item.ctaAman);
    setKpiFokus(item.kpiFokus);
    setCatatanKesiapan(item.catatanKesiapan);
  };

  const tanganiSimpan = (e: FormEvent) => {
    e.preventDefault();
    if (!creativeEdit) return;
    onSimpanCreative({
      ...creativeEdit,
      hookUtama: hookUtama.trim() || creativeEdit.hookUtama,
      ctaAman: ctaAman.trim() || creativeEdit.ctaAman,
      kpiFokus: kpiFokus.trim() || creativeEdit.kpiFokus,
      catatanKesiapan: catatanKesiapan.trim(),
    });
    setCreativeEdit(null);
  };

  return (
    <div className="space-y-5">
      <Kartu
        judul="Daftar Materi Iklan (4 Pilar Utama)"
        subjudul="Alur singkat tiap video iklan: pembuka 3 dtk, cerita, bukti visual, dan ajakan daftar kuota terbatas."
        aksiHeader={
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--status-sukses)]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Kuota Terbatas · Tanpa Jual Tiket
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daftarCreative.map((item) => (
            <article
              key={item.id}
              className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/60 p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--aksen-maroon-teks)]">
                      {LABEL_PILAR[item.pilar]}
                    </span>
                    <h3 className="text-sm font-semibold text-[var(--teks-utama)] mt-0.5">
                      {item.namaKreatif}
                    </h3>
                  </div>
                  <Tombol
                    varian="halus"
                    ukuran="sm"
                    ikonKiri={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                    onClick={() => bukaModal(item)}
                  >
                    Ubah
                  </Tombol>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--teks-redup)] border-y border-[var(--garis-halus)] py-2">
                  <span className="inline-flex items-center gap-1">
                    <Film className="h-3 w-3 text-[var(--aksen-emas)]" aria-hidden="true" />
                    {item.durasi}
                  </span>
                  <span>Format: {item.format}</span>
                  <span>Platform: {item.platformUtama}</span>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--teks-sekunder)] leading-relaxed">
                  <p>
                    <strong className="text-[var(--teks-utama)]">Pembuka:</strong>{' '}
                    {item.hookUtama}
                  </p>
                  <p>
                    <strong className="text-[var(--teks-utama)]">Isi Cerita:</strong>{' '}
                    {item.isiCerita}
                  </p>
                  <p>
                    <strong className="text-[var(--teks-utama)]">Ajakan Aman:</strong>{' '}
                    {item.ctaAman}
                  </p>
                  <p>
                    <strong className="text-[var(--teks-utama)]">Fokus Ukur:</strong>{' '}
                    {item.kpiFokus}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-[var(--teks-redup)] pt-2 border-t border-[var(--garis-halus)]">
                Kesiapan: {item.catatanKesiapan}
              </p>
            </article>
          ))}
        </div>
      </Kartu>

      <ModalDialog
        terbuka={Boolean(creativeEdit)}
        onTutup={() => setCreativeEdit(null)}
        judul={
          creativeEdit
            ? `Perbarui Kreatif: ${LABEL_PILAR[creativeEdit.pilar]}`
            : 'Perbarui Kreatif'
        }
        deskripsi="Sesuaikan hook, CTA aman (daftar kuota terbatas), KPI fokus, atau catatan kesiapan produksi."
      >
        <form onSubmit={tanganiSimpan} noValidate className="space-y-3">
          <AreaTeks
            label="Hook 0–3 Detik"
            rows={2}
            value={hookUtama}
            onChange={(e) => setHookUtama(e.target.value)}
          />
          <InputTeks
            label="CTA Aman (Tanpa Penjualan Tiket)"
            value={ctaAman}
            onChange={(e) => setCtaAman(e.target.value)}
          />
          <InputTeks
            label="KPI Fokus"
            value={kpiFokus}
            onChange={(e) => setKpiFokus(e.target.value)}
          />
          <AreaTeks
            label="Catatan Kesiapan / Hak Tayang"
            rows={2}
            value={catatanKesiapan}
            onChange={(e) => setCatatanKesiapan(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--garis-halus)]">
            <Tombol varian="sekunder" ukuran="sm" onClick={() => setCreativeEdit(null)}>
              Batal
            </Tombol>
            <Tombol type="submit" varian="primer" ukuran="sm">
              Simpan Perubahan Kreatif
            </Tombol>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
