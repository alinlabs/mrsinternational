import { useEffect, useState } from 'react';
import {
  DAFTAR_OPSI_STATUS_KONTEN,
} from '../../data/kalender-kanonik';
import type {
  KonsepKonten,
  StatusKontenOperasional,
  StatusPersetujuanKonten,
  TambahanEditKonten,
} from '../../types/kalender';
import {
  dapatkanInfoStatusKonten,
  dapatkanLabelKanal,
  dapatkanLabelPilar,
  dapatkanLabelSlot,
  validasiPerubahanKonten,
} from '../../utils/kalender';
import {
  AreaTeks,
  InputTeks,
  PanelSamping,
  SelectPilihan,
  StatusTeks,
  Tombol,
} from '../../components/ui';

export interface PanelDetailKontenProps {
  konten: KonsepKonten | null;
  onTutup: () => void;
  onSimpan: (id: string, perubahan: TambahanEditKonten) => void;
}

const OPSI_PERSETUJUAN = [
  { nilai: 'belum-diajukan', label: 'Belum diajukan' },
  { nilai: 'menunggu-review', label: 'Menunggu review' },
  { nilai: 'disetujui', label: 'Disetujui (Approved)' },
  { nilai: 'perlu-revisi', label: 'Perlu revisi' },
];

export function PanelDetailKonten({
  konten,
  onTutup,
  onSimpan,
}: PanelDetailKontenProps) {
  const [status, setStatus] = useState<StatusKontenOperasional>('planned');
  const [pic, setPic] = useState('');
  const [hook, setHook] = useState('');
  const [ringkasan, setRingkasan] = useState('');
  const [materiBukti, setMateriBukti] = useState('');
  const [drafCaption, setDrafCaption] = useState('');
  const [cta, setCta] = useState('');
  const [statusPersetujuan, setStatusPersetujuan] =
    useState<StatusPersetujuanKonten>('belum-diajukan');
  const [disetujuiOleh, setDisetujuiOleh] = useState('');
  const [tanggalDisetujui, setTanggalDisetujui] = useState('');
  const [catatanPersetujuan, setCatatanPersetujuan] = useState('');
  const [asetTertaut, setAsetTertaut] = useState('');
  const [urlTerbit, setUrlTerbit] = useState('');
  const [tanggalTerbitAktual, setTanggalTerbitAktual] = useState('');
  const [catatan, setCatatan] = useState('');
  const [galat, setGalat] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!konten) return;
    setStatus(konten.status);
    setPic(konten.pic);
    setHook(konten.hook);
    setRingkasan(konten.ringkasan);
    setMateriBukti(konten.materiBukti);
    setDrafCaption(konten.drafCaption);
    setCta(konten.cta);
    setStatusPersetujuan(konten.persetujuan.status);
    setDisetujuiOleh(konten.persetujuan.disetujuiOleh);
    setTanggalDisetujui(konten.persetujuan.tanggalDisetujui);
    setCatatanPersetujuan(konten.persetujuan.catatan);
    setAsetTertaut(konten.asetTertaut);
    setUrlTerbit(konten.urlTerbit);
    setTanggalTerbitAktual(konten.tanggalTerbitAktual);
    setCatatan(konten.catatan);
    setGalat({});
  }, [konten]);

  if (!konten) {
    return (
      <PanelSamping terbuka={false} onTutup={onTutup} judul="">
        <div />
      </PanelSamping>
    );
  }

  const infoStatus = dapatkanInfoStatusKonten(status);

  const tanganiSubmit = () => {
    const payload: TambahanEditKonten = {
      status,
      pic: pic.trim(),
      hook: hook.trim(),
      ringkasan: ringkasan.trim(),
      materiBukti: materiBukti.trim(),
      drafCaption: drafCaption.trim(),
      cta: cta.trim(),
      persetujuan: {
        status: statusPersetujuan,
        disetujuiOleh: disetujuiOleh.trim(),
        tanggalDisetujui: tanggalDisetujui.trim(),
        catatan: catatanPersetujuan.trim(),
      },
      asetTertaut: asetTertaut.trim(),
      urlTerbit: urlTerbit.trim(),
      tanggalTerbitAktual: tanggalTerbitAktual.trim(),
      catatan: catatan.trim(),
    };

    const hasilValidasi = validasiPerubahanKonten(payload);
    if (Object.keys(hasilValidasi).length > 0) {
      setGalat(hasilValidasi);
      return;
    }

    setGalat({});
    onSimpan(konten.id, payload);
  };

  return (
    <PanelSamping
      terbuka={Boolean(konten)}
      onTutup={onTutup}
      judul={`${konten.labelTanggal} 2026 — ${dapatkanLabelSlot(konten.slot)}`}
      subjudul={`Hari ke-${konten.hariKe} • ${konten.fase} • Pilar ${dapatkanLabelPilar(konten.pilar)}`}
      footer={
        <>
          <Tombol varian="sekunder" onClick={onTutup}>
            Tutup
          </Tombol>
          <Tombol varian="primer" onClick={tanganiSubmit}>
            Simpan perubahan
          </Tombol>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70 p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--aksen-maroon-teks)]">
              Brief Master Plan v1.0 (Kanonik)
            </span>
            <StatusTeks labelKustom={infoStatus.label} nadaKustom={infoStatus.nada} />
          </div>
          <p className="text-sm font-medium text-[var(--teks-utama)] leading-snug">
            {konten.judul}
          </p>
          <p className="text-xs text-[var(--teks-redup)]">
            Tujuan Funnel: {konten.tujuan} • Jenis Master:{' '}
            {konten.jenisMaster === 'video' ? 'Video 9:16' : 'Desain / Carousel'}
          </p>
        </div>

        <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] p-3.5">
          <p className="text-xs font-semibold text-[var(--teks-utama)] mb-2">
            Target Distribusi Kanal (1 Konsep Master, Multi-Kanal)
          </p>
          <ul className="space-y-1.5 text-xs">
            {konten.distribusiKanal.map((dist) => (
              <li
                key={dist.kanal}
                className="flex items-center justify-between gap-2 text-[var(--teks-sekunder)]"
              >
                <span>
                  <strong className="font-medium text-[var(--teks-utama)]">
                    {dapatkanLabelKanal(dist.kanal)}
                  </strong>{' '}
                  — {dist.format}
                </span>
                <span className="text-[var(--teks-redup)] angka-tabular">
                  {dist.waktuUsulan}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            tanganiSubmit();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectPilihan
              label="Status Operasional"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as StatusKontenOperasional)
              }
              opsi={[...DAFTAR_OPSI_STATUS_KONTEN]}
            />
            <InputTeks
              label="Penanggung Jawab (PIC)"
              value={pic}
              onChange={(e) => setPic(e.target.value)}
            />
          </div>

          <InputTeks
            label="Hook (0–3 Detik / Headline)"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
          />

          <AreaTeks
            label="Ringkasan Eksekusi Konten"
            rows={2}
            value={ringkasan}
            onChange={(e) => setRingkasan(e.target.value)}
          />

          <AreaTeks
            label="Materi Bukti Wajib (Proof Material)"
            rows={2}
            value={materiBukti}
            onChange={(e) => setMateriBukti(e.target.value)}
          />

          <AreaTeks
            label="Draf Caption Publik"
            rows={3}
            value={drafCaption}
            onChange={(e) => setDrafCaption(e.target.value)}
          />

          <InputTeks
            label="Call to Action (Daftar Kuota Terbatas)"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            galat={galat.cta}
          />

          <div className="pt-3 border-t border-[var(--garis-halus)] space-y-3">
            <p className="text-xs font-semibold text-[var(--teks-utama)]">
              Persetujuan &amp; Bukti Kredibilitas
            </p>
            <SelectPilihan
              label="Status Persetujuan"
              value={statusPersetujuan}
              onChange={(e) =>
                setStatusPersetujuan(e.target.value as StatusPersetujuanKonten)
              }
              opsi={OPSI_PERSETUJUAN}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputTeks
                label="Disetujui Oleh"
                placeholder="Contoh: Melfarina Sianipar"
                value={disetujuiOleh}
                onChange={(e) => setDisetujuiOleh(e.target.value)}
                galat={galat.disetujuiOleh}
              />
              <InputTeks
                label="Tanggal Disetujui"
                type="date"
                value={tanggalDisetujui}
                onChange={(e) => setTanggalDisetujui(e.target.value)}
                galat={galat.tanggalDisetujui}
              />
            </div>
            <InputTeks
              label="Catatan Persetujuan / Revisi"
              placeholder="Catatan review 12–24 jam"
              value={catatanPersetujuan}
              onChange={(e) => setCatatanPersetujuan(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-[var(--garis-halus)] space-y-3">
            <p className="text-xs font-semibold text-[var(--teks-utama)]">
              Aset Tertaut &amp; Jejak Publikasi Aktual
            </p>
            <InputTeks
              label="ID / Nama File Aset Tertaut"
              placeholder="Contoh: RH_20261126_ALL_EVENT_TEASER_V01.mp4"
              value={asetTertaut}
              onChange={(e) => setAsetTertaut(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputTeks
                label="URL Terbit Aktual"
                placeholder="https://..."
                value={urlTerbit}
                onChange={(e) => setUrlTerbit(e.target.value)}
                galat={galat.urlTerbit}
              />
              <InputTeks
                label="Tanggal Terbit Aktual"
                type="date"
                value={tanggalTerbitAktual}
                onChange={(e) => setTanggalTerbitAktual(e.target.value)}
              />
            </div>
            <AreaTeks
              label="Catatan Operasional / Embargo"
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>
        </form>
      </div>
    </PanelSamping>
  );
}
