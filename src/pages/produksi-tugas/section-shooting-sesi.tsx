import { useState } from 'react';
import { Calendar, CheckSquare, MapPin } from 'lucide-react';
import type {
  AgendaSlotShooting,
  ItemChecklistShooting,
  SesiShooting,
  StatusSlotShooting,
} from '../../types/produksi';
import { dapatkanInfoStatusSlot } from '../../utils/produksi';
import {
  InputTeks,
  Kartu,
  SelectPilihan,
  StatusTeks,
  TabelData,
  Tombol,
} from '../../components/ui';
import type { KolomTabel } from '../../components/ui';

export interface SectionShootingSesiProps {
  daftarSesiShooting: SesiShooting[];
  checklistShooting: ItemChecklistShooting[];
  onPerbaruiSesi: (
    idSesi: SesiShooting['id'],
    perubahan: Partial<Pick<SesiShooting, 'lokasiPrivat' | 'statusKesiapan' | 'catatanTambahan'>>,
  ) => void;
  onPerbaruiSlot: (
    idSesi: SesiShooting['id'],
    idSlot: string,
    perubahan: Partial<Pick<AgendaSlotShooting, 'status' | 'catatanLapangan'>>,
  ) => void;
  onToggleChecklist: (idChecklist: string) => void;
}

const OPSI_STATUS_SESI = [
  { nilai: 'planned', label: 'Rencana' },
  { nilai: 'siap', label: 'Siap Berjalan' },
  { nilai: 'selesai', label: 'Selesai Direkam' },
  { nilai: 'tertunda', label: 'Tertunda / Dijadwal Ulang' },
];

const OPSI_STATUS_SLOT: { nilai: StatusSlotShooting; label: string }[] = [
  { nilai: 'planned', label: 'Rencana' },
  { nilai: 'siap', label: 'Siap' },
  { nilai: 'selesai', label: 'Selesai' },
  { nilai: 'tertunda', label: 'Tertunda' },
];

export function SectionShootingSesi({
  daftarSesiShooting,
  checklistShooting,
  onPerbaruiSesi,
  onPerbaruiSlot,
  onToggleChecklist,
}: SectionShootingSesiProps) {
  const [sesiDipilih, setSesiDipilih] = useState<SesiShooting['id']>('shoot-hari-1');
  const [draftLokasi, setDraftLokasi] = useState<Record<string, string>>({});

  const sesiAktif =
    daftarSesiShooting.find((s) => s.id === sesiDipilih) ?? daftarSesiShooting[0];

  const nilaiLokasi =
    draftLokasi[sesiAktif.id] !== undefined
      ? draftLokasi[sesiAktif.id]
      : sesiAktif.lokasiPrivat;

  const infoKesiapan = dapatkanInfoStatusSlot(sesiAktif.statusKesiapan);
  const jumlahChecklistSelesai = checklistShooting.filter((c) => c.selesai).length;

  const kolomRundown: KolomTabel<AgendaSlotShooting>[] = [
    {
      kunci: 'jam',
      judul: 'Jam (WIB)',
      lebar: '115px',
      render: (slot) => (
        <span className="font-mono text-xs font-semibold text-[var(--aksen-maroon-teks)] whitespace-nowrap angka-tabular">
          {slot.jam}
        </span>
      ),
    },
    {
      kunci: 'agenda',
      judul: 'Agenda Produksi',
      render: (slot) => (
        <p className="min-w-[200px] text-sm font-medium text-[var(--teks-utama)] leading-snug">
          {slot.agenda}
        </p>
      ),
    },
    {
      kunci: 'talent',
      judul: 'Talent / Objek',
      render: (slot) => (
        <p className="min-w-[150px] text-xs text-[var(--teks-sekunder)]">
          {slot.talentObjek}
        </p>
      ),
    },
    {
      kunci: 'output',
      judul: 'Output Wajib',
      render: (slot) => (
        <p className="min-w-[190px] text-xs text-[var(--teks-sekunder)] leading-relaxed">
          {slot.outputWajib}
        </p>
      ),
    },
    {
      kunci: 'status',
      judul: 'Status & Catatan Lapangan',
      render: (slot) => {
        const info = dapatkanInfoStatusSlot(slot.status);
        return (
          <div className="min-w-[190px] space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <StatusTeks labelKustom={info.label} nadaKustom={info.nada} />
            </div>
            <select
              aria-label={`Status slot ${slot.jam}`}
              value={slot.status}
              onChange={(e) =>
                onPerbaruiSlot(sesiAktif.id, slot.id, {
                  status: e.target.value as StatusSlotShooting,
                })
              }
              className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] px-2 text-xs text-[var(--teks-utama)]"
            >
              {OPSI_STATUS_SLOT.map((opt) => (
                <option key={opt.nilai} value={opt.nilai}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              aria-label={`Catatan lapangan slot ${slot.jam}`}
              placeholder="Catatan lapangan / retake..."
              value={slot.catatanLapangan}
              onChange={(e) =>
                onPerbaruiSlot(sesiAktif.id, slot.id, {
                  catatanLapangan: e.target.value,
                })
              }
              className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-2 text-xs text-[var(--teks-utama)] placeholder:text-[var(--teks-redup)]"
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pilih sesi hari shooting">
          {daftarSesiShooting.map((sesi) => {
            const aktif = sesi.id === sesiAktif.id;
            return (
              <Tombol
                key={sesi.id}
                varian={aktif ? 'primer' : 'sekunder'}
                ukuran="sm"
                className="!transition-none"
                ikonKiri={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => setSesiDipilih(sesi.id)}
                aria-pressed={aktif}
              >
                {sesi.id === 'shoot-hari-1'
                  ? 'Hari 1 (Iklan) — 25 Nov 2026'
                  : sesi.id === 'shoot-hari-2'
                    ? 'Hari 2 (Short Konten 1) — 30 Nov 2026'
                    : 'Hari 3 (Short Konten 2) — 3 Des 2026'}
              </Tombol>
            );
          })}
        </div>

        <p className="text-xs text-[var(--teks-redup)]">
          Jam kerja operasional: <strong className="text-[var(--teks-utama)]">{sesiAktif.jamOperasional}</strong>
        </p>
      </div>

      <Kartu
        judul={sesiAktif.judul}
        subjudul={sesiAktif.ringkasanTujuan}
        aksiHeader={
          <StatusTeks
            labelKustom={infoKesiapan.label}
            nadaKustom={infoKesiapan.nada}
          />
        }
      >
        <div className="space-y-4">
          <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-3.5 py-2.5 text-xs text-[var(--teks-sekunder)] leading-relaxed">
            <strong className="font-semibold text-[var(--teks-utama)]">
              Catatan Kesiapan:
            </strong>{' '}
            {sesiAktif.catatanTambahan}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-6">
              <InputTeks
                label="Lokasi Shooting (Privat untuk Kru Internal)"
                placeholder="Isi alamat studio atau lokasi shooting..."
                value={nilaiLokasi}
                petunjuk={
                  sesiAktif.lokasiPrivat
                    ? 'Tersimpan untuk referensi internal kru.'
                    : 'Wajib diisi sebelum jadwal pemanggilan tim.'
                }
                onChange={(e) =>
                  setDraftLokasi((prev) => ({
                    ...prev,
                    [sesiAktif.id]: e.target.value,
                  }))
                }
              />
            </div>

            <div className="lg:col-span-2 flex">
              <Tombol
                varian="sekunder"
                ukuran="md"
                className="w-full"
                ikonKiri={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() =>
                  onPerbaruiSesi(sesiAktif.id, {
                    lokasiPrivat: nilaiLokasi.trim(),
                  })
                }
              >
                Simpan Lokasi
              </Tombol>
            </div>

            <div className="lg:col-span-4">
              <SelectPilihan
                label="Status Kesiapan Sesi"
                value={sesiAktif.statusKesiapan}
                opsi={OPSI_STATUS_SESI}
                onChange={(e) =>
                  onPerbaruiSesi(sesiAktif.id, {
                    statusKesiapan: e.target.value as SesiShooting['statusKesiapan'],
                  })
                }
              />
            </div>
          </div>

          <TabelData
            keteranganTabel={`Rundown ${sesiAktif.judul}`}
            kolom={kolomRundown}
            data={sesiAktif.daftarSlot}
            kunciBaris={(slot) => slot.id}
          />
        </div>
      </Kartu>

      <Kartu
        judul="Checklist Wajib Hari Shooting"
        subjudul="Cek izin lokasi, audio, busana, jeda bicara, salinan cadangan, dan penandaan embargo"
        aksiHeader={
          <StatusTeks
            labelKustom={`${jumlahChecklistSelesai} / ${checklistShooting.length} selesai`}
            nadaKustom={
              jumlahChecklistSelesai === checklistShooting.length ? 'hijau' : 'emas'
            }
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistShooting.map((item) => {
            const inputId = `checklist-${item.id}`;
            return (
              <div
                key={item.id}
                className={`rounded-[var(--radius-sm)] border p-3.5 transition-colors ${
                  item.selesai
                    ? 'border-[var(--status-sukses)]/40 bg-[var(--status-sukses)]/[0.04]'
                    : 'border-[var(--garis-halus)] bg-[var(--bg-permukaan)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={item.selesai}
                    onChange={() => onToggleChecklist(item.id)}
                    className="mt-1 h-4 w-4 accent-[var(--aksen-maroon)] cursor-pointer shrink-0"
                  />
                  <label htmlFor={inputId} className="cursor-pointer space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--aksen-emas)]">
                        {item.kategori}
                      </span>
                      {item.selesai && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--status-sukses)]">
                          <CheckSquare className="h-3 w-3" aria-hidden="true" />
                          Terverifikasi
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm font-medium leading-snug ${
                        item.selesai
                          ? 'text-[var(--teks-sekunder)] line-through'
                          : 'text-[var(--teks-utama)]'
                      }`}
                    >
                      {item.judul}
                    </p>
                    <p className="text-xs text-[var(--teks-redup)] leading-relaxed">
                      {item.rincian}
                    </p>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </Kartu>
    </div>
  );
}
