import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { DAFTAR_ASSIGNEE_PERAN } from '../../data/produksi-kanonik';
import type {
  PrioritasTugas,
  StatusTugasProduksi,
  TugasProduksi,
} from '../../types/produksi';
import { validasiTugasProduksi } from '../../utils/produksi';
import {
  AreaTeks,
  InputTeks,
  PanelSamping,
  SelectPilihan,
  Tombol,
} from '../../components/ui';

export interface PanelDetailTugasProps {
  tugas: TugasProduksi | null;
  modeBuatBaru: boolean;
  terbuka: boolean;
  onTutup: () => void;
  onSimpan: (tugas: TugasProduksi) => void;
}

const OPSI_STATUS_TUGAS: { nilai: StatusTugasProduksi; label: string }[] = [
  { nilai: 'brief', label: 'Brief' },
  { nilai: 'ready-to-shoot', label: 'Ready to Shoot' },
  { nilai: 'shooting', label: 'Shooting' },
  { nilai: 'editing', label: 'Editing' },
  { nilai: 'review', label: 'Review' },
  { nilai: 'approved', label: 'Approved' },
  { nilai: 'scheduled', label: 'Scheduled' },
  { nilai: 'published', label: 'Published' },
  { nilai: 'blocked', label: 'Blocked (Tertahan)' },
  { nilai: 'cancelled', label: 'Cancelled (Dibatalkan)' },
];

const OPSI_PRIORITAS: { nilai: PrioritasTugas; label: string }[] = [
  { nilai: 'kritis', label: 'Kritis' },
  { nilai: 'tinggi', label: 'Tinggi' },
  { nilai: 'sedang', label: 'Sedang' },
  { nilai: 'rendah', label: 'Rendah' },
];

function buatDraftKosong(): TugasProduksi {
  return {
    id: `tugas-${Date.now()}`,
    judul: '',
    deskripsi: '',
    fase: 'Operasional Kampanye',
    tenggat: '2026-12-01',
    status: 'brief',
    prioritas: 'sedang',
    assignee: 'Belum ditugaskan',
    kontenTertaut: [],
    dependensi: '',
    approver: '',
    alasanBlocked: '',
    selesaiPada: '',
    catatan: '',
  };
}

export function PanelDetailTugas({
  tugas,
  modeBuatBaru,
  terbuka,
  onTutup,
  onSimpan,
}: PanelDetailTugasProps) {
  const [form, setForm] = useState<TugasProduksi>(() => tugas ?? buatDraftKosong());
  const [galat, setGalat] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!terbuka) return;
    setForm(tugas ? { ...tugas } : buatDraftKosong());
    setGalat({});
  }, [terbuka, tugas]);

  const tanganiSubmit = (event: FormEvent) => {
    event.preventDefault();
    const hasilValidasi = validasiTugasProduksi(form);
    if (Object.keys(hasilValidasi).length > 0) {
      setGalat(hasilValidasi);
      return;
    }
    onSimpan(form);
  };

  const opsiAssignee = Array.from(
    new Set([
      ...DAFTAR_ASSIGNEE_PERAN,
      ...(form.assignee ? [form.assignee] : []),
    ]),
  ).map((peran) => ({ nilai: peran, label: peran }));

  return (
    <PanelSamping
      terbuka={terbuka}
      onTutup={onTutup}
      judul={modeBuatBaru ? 'Tambah Tugas Produksi Baru' : 'Detail & Pengelolaan Tugas'}
      subjudul={
        modeBuatBaru
          ? 'Gunakan placeholder peran tim (tanpa nama staf fiktif).'
          : `${form.fase} • Tenggat ${form.tenggat || 'Belum diisi'}`
      }
      footer={
        <>
          <Tombol varian="sekunder" ukuran="sm" onClick={onTutup}>
            Batal
          </Tombol>
          <Tombol
            type="submit"
            form="form-detail-tugas"
            varian="primer"
            ukuran="sm"
          >
            Simpan Perubahan Tugas
          </Tombol>
        </>
      }
    >
      <form id="form-detail-tugas" noValidate onSubmit={tanganiSubmit} className="space-y-4">
        {form.adalahMilestoneKritis11Des && (
          <div className="rounded-[var(--radius-sm)] border border-[var(--aksen-maroon-garis)]/40 bg-[var(--aksen-maroon-lembut)] px-3 py-2.5 text-xs text-[var(--aksen-maroon-teks)]">
            <strong className="font-semibold">Milestone Kritis Pra-Balige (&lt; 11 Des 2026):</strong>{' '}
            Seluruh rekaman dan persetujuan konten Melfarina &amp; Ghivany wajib tuntas sebelum keberangkatan ke Balige.
          </div>
        )}

        <InputTeks
          label="Judul Tugas"
          wajib
          value={form.judul}
          galat={galat.judul}
          placeholder="Contoh: Finalisasi subtitle Hero Ad 45–60 detik"
          onChange={(e) => {
            setForm((prev) => ({ ...prev, judul: e.target.value }));
            if (galat.judul) setGalat((prev) => ({ ...prev, judul: '' }));
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectPilihan
            label="Status Alur Kerja"
            value={form.status}
            opsi={OPSI_STATUS_TUGAS}
            onChange={(e) => {
              const statusBaru = e.target.value as StatusTugasProduksi;
              setForm((prev) => ({ ...prev, status: statusBaru }));
              setGalat((prev) => ({ ...prev, alasanBlocked: '', approver: '' }));
            }}
          />

          <SelectPilihan
            label="Prioritas"
            value={form.prioritas}
            opsi={OPSI_PRIORITAS}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                prioritas: e.target.value as PrioritasTugas,
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputTeks
            label="Tenggat Waktu"
            type="date"
            value={form.tenggat}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, tenggat: e.target.value }))
            }
          />

          <SelectPilihan
            label="Assignee (Peran Tim)"
            value={form.assignee}
            opsi={opsiAssignee}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, assignee: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputTeks
            label="Fase / Kelompok"
            value={form.fase}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fase: e.target.value }))
            }
          />

          <InputTeks
            label="Dependensi"
            value={form.dependensi}
            placeholder="Mis. tugas-03 / konfirmasi lokasi"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, dependensi: e.target.value }))
            }
          />
        </div>

        <InputTeks
          label="Penyetuju (Approver)"
          value={form.approver}
          wajib={form.status === 'approved'}
          galat={galat.approver}
          placeholder="Mis. Owner (Melfarina Sianipar) / Raden Sirait / Digital Manager"
          petunjuk="Wajib diisi saat tugas ditandai Approved."
          onChange={(e) => {
            setForm((prev) => ({ ...prev, approver: e.target.value }));
            if (galat.approver) setGalat((prev) => ({ ...prev, approver: '' }));
          }}
        />

        {(form.status === 'blocked' || form.alasanBlocked) && (
          <AreaTeks
            label="Alasan Tertahan (Blocked Reason)"
            wajib={form.status === 'blocked'}
            value={form.alasanBlocked}
            galat={galat.alasanBlocked}
            rows={2}
            placeholder="Jelaskan hambatan spesifik serta tindak lanjut yang dibutuhkan..."
            onChange={(e) => {
              setForm((prev) => ({ ...prev, alasanBlocked: e.target.value }));
              if (galat.alasanBlocked) {
                setGalat((prev) => ({ ...prev, alasanBlocked: '' }));
              }
            }}
          />
        )}

        <AreaTeks
          label="Deskripsi Pekerjaan"
          rows={3}
          value={form.deskripsi}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
          }
        />

        <AreaTeks
          label="Catatan Operasional"
          rows={2}
          value={form.catatan}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, catatan: e.target.value }))
          }
        />

        <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-3 py-2.5 space-y-1.5">
          <p className="text-xs font-medium text-[var(--teks-sekunder)]">
            Konten Kalender Tertaut ({form.kontenTertaut.length})
          </p>
          {form.kontenTertaut.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {form.kontenTertaut.map((idKonten) => (
                  <span
                    key={idKonten}
                    className="px-2 py-0.5 text-[11px] font-mono border border-[var(--garis-halus)] rounded-[var(--radius-sm)] bg-[var(--bg-permukaan)] text-[var(--teks-utama)]"
                  >
                    {idKonten}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[var(--teks-redup)]">
                Menyimpan status tugas ini otomatis menyinkronkan status item tertaut di Kalender Konten dan progres halaman Rencana Utama.
              </p>
            </>
          ) : (
            <p className="text-[11px] text-[var(--teks-redup)]">
              Belum ada ID master konten kalender tertaut ke tugas ini.
            </p>
          )}
        </div>

        {form.selesaiPada && (
          <p className="text-xs text-[var(--teks-redup)]">
            Tercatat selesai pada: <strong className="text-[var(--teks-utama)]">{form.selesaiPada.slice(0, 10)}</strong>
          </p>
        )}
      </form>
    </PanelSamping>
  );
}
