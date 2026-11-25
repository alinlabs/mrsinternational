import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus } from 'lucide-react';
import {
  DEFINISI_METRIK_KPI_KANONIK,
  INFO_GRUP_KPI_KANONIK,
  OPSI_PILAR_KPI,
  OPSI_PLATFORM_KPI,
} from '../../data/kpi-kanonik';
import type { PilarKonten } from '../../types/kalender';
import type { GrupKpi, PlatformKpi, SnapshotKpiAktual } from '../../types/kpi';
import {
  dapatkanDefinisiMetrik,
  dapatkanMetrikByGrup,
  validasiSnapshotManual,
} from '../../utils/kpi';
import {
  AreaTeks,
  InputTeks,
  ModalDialog,
  SelectPilihan,
  Tombol,
} from '../../components/ui';

export interface ModalEntriKpiProps {
  terbuka: boolean;
  grupDefault: GrupKpi;
  onTutup: () => void;
  onSimpan: (snapshot: SnapshotKpiAktual) => void;
}

export function ModalEntriKpi({
  terbuka,
  grupDefault,
  onTutup,
  onSimpan,
}: ModalEntriKpiProps) {
  const [grup, setGrup] = useState<GrupKpi>(grupDefault);
  const [kodeMetrik, setKodeMetrik] = useState(
    dapatkanMetrikByGrup(grupDefault)[0]?.kode ?? 'unique_reach',
  );
  const [platform, setPlatform] = useState<PlatformKpi>('meta-ads');
  const [periode, setPeriode] = useState('');
  const [periodePembanding, setPeriodePembanding] = useState('');
  const [kampanyeAtauKonten, setKampanyeAtauKonten] = useState('');
  const [pilar, setPilar] = useState<PilarKonten | ''>('');
  const [nilaiInput, setNilaiInput] = useState('');
  const [source, setSource] = useState('');
  const [reportedAt, setReportedAt] = useState('');
  const [pic, setPic] = useState('Digital Manager');
  const [notes, setNotes] = useState('');
  const [galat, setGalat] = useState('');

  useEffect(() => {
    if (!terbuka) return;
    setGrup(grupDefault);
    const pertama = dapatkanMetrikByGrup(grupDefault)[0];
    if (pertama) setKodeMetrik(pertama.kode);
    setGalat('');
  }, [terbuka, grupDefault]);

  const metrikSesuaiGrup = dapatkanMetrikByGrup(grup);
  const definisiDipilih =
    dapatkanDefinisiMetrik(kodeMetrik) ??
    DEFINISI_METRIK_KPI_KANONIK.find((m) => m.grup === grup);

  const tanganiSubmit = (e: FormEvent) => {
    e.preventDefault();
    const angkaNilai = Number(nilaiInput);
    const cek = validasiSnapshotManual({
      kodeMetrik,
      periode,
      nilai: angkaNilai,
      source,
      reportedAt,
      pic,
    });

    if (!cek.valid) {
      setGalat(cek.pesanGalat);
      return;
    }

    const sekarangIso = new Date().toISOString();
    onSimpan({
      id: `kpi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      grup: definisiDipilih?.grup ?? grup,
      kodeMetrik,
      platform,
      periode: periode.trim(),
      periodePembanding: periodePembanding.trim() || undefined,
      kampanyeAtauKonten: kampanyeAtauKonten.trim() || 'Akun Utama Ragi Hotang',
      pilar: pilar || undefined,
      nilai: angkaNilai,
      source: source.trim(),
      reportedAt: reportedAt.trim(),
      importedAt: sekarangIso,
      pic: pic.trim(),
      notes: notes.trim(),
    });

    setNilaiInput('');
    setNotes('');
    setGalat('');
    onTutup();
  };

  return (
    <ModalDialog
      terbuka={terbuka}
      onTutup={onTutup}
      judul="Catat Snapshot KPI Aktual (Manual)"
      deskripsi="Masukkan angka aktual yang bersumber dari Meta/TikTok Ads Manager, Instagram/TikTok Insights, atau log resmi. Jangan mengisi perkiraan."
      ukuran="lg"
    >
      <form onSubmit={tanganiSubmit} noValidate className="space-y-3.5">
        {galat && (
          <p
            role="alert"
            className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
          >
            {galat}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectPilihan
            label="Kelompok KPI"
            value={grup}
            opsi={INFO_GRUP_KPI_KANONIK.map((g) => ({
              nilai: g.id,
              label: g.nama,
            }))}
            onChange={(e) => {
              const gBaru = e.target.value as GrupKpi;
              setGrup(gBaru);
              const daftar = dapatkanMetrikByGrup(gBaru);
              if (daftar[0]) setKodeMetrik(daftar[0].kode);
            }}
          />

          <SelectPilihan
            label="Metrik Kanonik"
            value={kodeMetrik}
            opsi={metrikSesuaiGrup.map((m) => ({
              nilai: m.kode,
              label: m.nama,
            }))}
            onChange={(e) => setKodeMetrik(e.target.value)}
          />
        </div>

        {definisiDipilih && (
          <p className="text-[11px] text-[var(--teks-sekunder)] rounded-[var(--radius-sm)] bg-[var(--bg-kanvas)] px-3 py-2 border border-[var(--garis-halus)]">
            {definisiDipilih.keterangan}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectPilihan
            label="Platform"
            value={platform}
            opsi={OPSI_PLATFORM_KPI}
            onChange={(e) => setPlatform(e.target.value as PlatformKpi)}
          />

          <InputTeks
            label="Periode Data"
            type="date"
            wajib
            value={periode}
            onChange={(e) => {
              setPeriode(e.target.value);
              if (!reportedAt) setReportedAt(e.target.value);
              if (galat) setGalat('');
            }}
          />

          <InputTeks
            label="Nilai Aktual"
            type="number"
            min="0"
            step="any"
            wajib
            value={nilaiInput}
            placeholder="Mis. 12500"
            onChange={(e) => {
              setNilaiInput(e.target.value);
              if (galat) setGalat('');
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputTeks
            label="Konten atau Campaign"
            value={kampanyeAtauKonten}
            placeholder="Mis. Meta Flight 1 — Hero Ad 45s"
            onChange={(e) => setKampanyeAtauKonten(e.target.value)}
          />

          <SelectPilihan
            label="Pilar Konten (Opsional)"
            value={pilar}
            opsi={[
              { nilai: '', label: 'Lintas pilar / Umum kampanye' },
              ...OPSI_PILAR_KPI.map((p) => ({
                nilai: p.nilai,
                label: p.label,
              })),
            ]}
            onChange={(e) => setPilar(e.target.value as PilarKonten | '')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InputTeks
            label="Sumber Laporan (Source)"
            wajib
            value={source}
            placeholder="Mis. Meta Ads Manager"
            onChange={(e) => {
              setSource(e.target.value);
              if (galat) setGalat('');
            }}
          />

          <InputTeks
            label="Tanggal Laporan (reportedAt)"
            type="date"
            wajib
            value={reportedAt}
            onChange={(e) => {
              setReportedAt(e.target.value);
              if (galat) setGalat('');
            }}
          />

          <InputTeks
            label="PIC Pencatat"
            wajib
            value={pic}
            onChange={(e) => {
              setPic(e.target.value);
              if (galat) setGalat('');
            }}
          />
        </div>

        <InputTeks
          label="Periode Pembanding (Opsional)"
          type="date"
          value={periodePembanding}
          onChange={(e) => setPeriodePembanding(e.target.value)}
        />

        <AreaTeks
          label="Catatan Konteks / Evaluasi"
          rows={2}
          value={notes}
          placeholder="Mis. Angka 72 jam pertama setelah Flight 1 aktif."
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--garis-halus)]">
          <Tombol varian="sekunder" ukuran="sm" onClick={onTutup}>
            Batal
          </Tombol>
          <Tombol
            type="submit"
            varian="primer"
            ukuran="sm"
            ikonKiri={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
          >
            Simpan Snapshot Aktual
          </Tombol>
        </div>
      </form>
    </ModalDialog>
  );
}
