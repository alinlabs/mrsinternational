import { ShieldCheck } from 'lucide-react';
import { ATURAN_ROUTING_APPROVAL } from '../../data/produksi-kanonik';
import type { KonsepKonten } from '../../types/kalender';
import type {
  DeliverableProduksi,
  PertanyaanWawancara,
  StatusDeliverable,
} from '../../types/produksi';
import { dapatkanInfoStatusDeliverable } from '../../utils/produksi';
import {
  Kartu,
  StatusTeks,
  TabelData,
} from '../../components/ui';
import type { KolomTabel } from '../../components/ui';

export interface SectionDeliverablesApprovalProps {
  daftarDeliverables: DeliverableProduksi[];
  bankPertanyaan: PertanyaanWawancara[];
  daftarKontenKalender: KonsepKonten[];
  onPerbaruiDeliverable: (
    idDeliverable: string,
    perubahan: Partial<Pick<DeliverableProduksi, 'status' | 'catatan'>>,
  ) => void;
}

const OPSI_STATUS_DELIVERABLE: { nilai: StatusDeliverable; label: string }[] = [
  { nilai: 'planned', label: 'Rencana' },
  { nilai: 'editing', label: 'Proses Edit' },
  { nilai: 'review', label: 'Menunggu Cek' },
  { nilai: 'approved', label: 'Disetujui' },
  { nilai: 'delivered', label: 'Diserahkan' },
];

export function SectionDeliverablesApproval({
  daftarDeliverables,
  bankPertanyaan,
  daftarKontenKalender,
  onPerbaruiDeliverable,
}: SectionDeliverablesApprovalProps) {
  const antreanReviewKonten = daftarKontenKalender.filter(
    (item) => item.status === 'review' || item.status === 'editing',
  );
  const antreanReviewKutipan = bankPertanyaan.filter(
    (q) =>
      q.statusPersetujuan === 'tercatat-draft' ||
      q.statusPersetujuan === 'menunggu-approval' ||
      q.statusPersetujuan === 'revisi',
  );

  const kolomDeliverable: KolomTabel<DeliverableProduksi>[] = [
    {
      kunci: 'nama',
      judul: 'Hasil Kerja & Target',
      render: (del) => (
        <div className="min-w-[210px] space-y-0.5">
          <p className="text-sm font-medium text-[var(--teks-utama)]">{del.nama}</p>
          <p className="text-xs font-medium text-[var(--aksen-maroon-teks)]">
            {del.targetVolume}
          </p>
        </div>
      ),
    },
    {
      kunci: 'spek',
      judul: 'Spesifikasi Teknis & Aturan Revisi',
      render: (del) => (
        <div className="min-w-[240px] space-y-1 text-xs">
          <p className="text-[var(--teks-sekunder)] leading-relaxed">
            {del.spesifikasi}
          </p>
          <p className="text-[var(--teks-redup)]">
            Revisi: {del.aturanRevisi}
          </p>
        </div>
      ),
    },
    {
      kunci: 'status',
      judul: 'Status & Catatan',
      render: (del) => {
        const info = dapatkanInfoStatusDeliverable(del.status);
        return (
          <div className="min-w-[200px] space-y-1.5">
            <StatusTeks labelKustom={info.label} nadaKustom={info.nada} />
            <select
              aria-label={`Status deliverable ${del.nama}`}
              value={del.status}
              onChange={(e) =>
                onPerbaruiDeliverable(del.id, {
                  status: e.target.value as StatusDeliverable,
                })
              }
              className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] px-2 text-xs text-[var(--teks-utama)]"
            >
              {OPSI_STATUS_DELIVERABLE.map((opt) => (
                <option key={opt.nilai} value={opt.nilai}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              aria-label={`Catatan deliverable ${del.nama}`}
              value={del.catatan}
              onChange={(e) =>
                onPerbaruiDeliverable(del.id, { catatan: e.target.value })
              }
              className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-2 text-xs text-[var(--teks-utama)]"
            />
          </div>
        );
      },
    },
  ];

  const kolomRouting: KolomTabel<(typeof ATURAN_ROUTING_APPROVAL)[number]>[] = [
    {
      kunci: 'peran',
      judul: 'Penyetuju & RACI',
      render: (item) => (
        <div className="min-w-[180px]">
          <p className="text-sm font-semibold text-[var(--teks-utama)]">{item.peran}</p>
          <p className="text-xs font-medium text-[var(--aksen-maroon-teks)]">
            {item.peranRaci}
          </p>
        </div>
      ),
    },
    {
      kunci: 'lingkup',
      judul: 'Lingkup Persetujuan Wajib',
      render: (item) => (
        <p className="min-w-[250px] text-xs text-[var(--teks-sekunder)] leading-relaxed">
          {item.lingkup}
        </p>
      ),
    },
    {
      kunci: 'batas',
      judul: 'Batas Waktu & Gerbang',
      render: (item) => (
        <p className="min-w-[180px] text-xs font-medium text-[var(--teks-utama)]">
          {item.batasReview}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Kartu
        judul="Daftar Hasil Kerja & Standar"
        subjudul="Target 44 video pendek 9:16, video utama + versi pendek, 22 desain, teks layar, dan file mentah"
        aksiHeader={
          <StatusTeks
            labelKustom={`${daftarDeliverables.filter((d) => d.status === 'approved' || d.status === 'delivered').length} / ${daftarDeliverables.length} selesai`}
            nadaKustom="hijau"
          />
        }
      >
        <div className="space-y-4">
          <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-3.5 py-2.5 text-xs text-[var(--teks-sekunder)] space-y-1">
            <p>
              <strong className="font-semibold text-[var(--teks-utama)]">
                Format Nama File:
              </strong>{' '}
              <code className="font-mono text-[var(--aksen-maroon-teks)]">
                RH_YYYYMMDD_PLATFORM_PILLAR_TOPIC_V01.mp4
              </code>
            </p>
            <p>
              <strong className="font-semibold text-[var(--teks-utama)]">
                Batas Revisi:
              </strong>{' '}
              Maksimal 1 revisi ringan per video.
            </p>
          </div>

          <TabelData
            keteranganTabel="Daftar hasil kerja produksi Ragi Hotang"
            kolom={kolomDeliverable}
            data={daftarDeliverables}
            kunciBaris={(del) => del.id}
          />
        </div>
      </Kartu>

      <Kartu
        judul="Alur Persetujuan & Pengecekan Akhir"
        subjudul="Semua konten wajib disetujui sebelum dijadwalkan tayang"
        aksiHeader={
          <StatusTeks
            labelKustom="Wajib Disetujui Sebelum Tayang"
            nadaKustom="maroon"
          />
        }
      >
        <div className="space-y-4">
          <div className="rounded-[var(--radius-sm)] border border-[var(--aksen-maroon-garis)]/40 bg-[var(--aksen-maroon-lembut)]/75 px-3.5 py-2.5 text-xs text-[var(--teks-sekunder)] flex items-start gap-2.5">
            <ShieldCheck
              className="h-4 w-4 text-[var(--aksen-maroon-teks)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p>
              <strong className="font-semibold text-[var(--teks-utama)]">
                Aturan Cek Sebelum Tayang:
              </strong>{' '}
              Klaim bisnis disetujui <strong>Owner</strong>, klaim desain disetujui <strong>Raden Sirait</strong>, dan pengecekan akhir (teks layar, musik, ajakan privat) oleh <strong>Digital Manager</strong>.
            </p>
          </div>

          <TabelData
            keteranganTabel="Aturan routing approval Owner, Raden Sirait, dan Digital Manager"
            kolom={[...kolomRouting]}
            data={[...ATURAN_ROUTING_APPROVAL]}
            kunciBaris={(item) => item.id}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] p-3.5 bg-[var(--bg-permukaan)] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[var(--teks-utama)]">
                  Antrean Review Konten Kalender
                </p>
                <span className="text-xs font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                  {antreanReviewKonten.length} aset
                </span>
              </div>
              {antreanReviewKonten.length === 0 ? (
                <p className="text-xs text-[var(--teks-redup)]">
                  Belum ada master konten kalender pada tahap Editing atau Review.
                </p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {antreanReviewKonten.slice(0, 6).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 text-[var(--teks-sekunder)]"
                    >
                      <span className="truncate">{item.judul}</span>
                      <span className="shrink-0 font-mono text-[11px] text-[var(--aksen-maroon-teks)]">
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] p-3.5 bg-[var(--bg-permukaan)] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[var(--teks-utama)]">
                  Antrean Review Kutipan Wawancara
                </p>
                <span className="text-xs font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                  {antreanReviewKutipan.length} kutipan
                </span>
              </div>
              {antreanReviewKutipan.length === 0 ? (
                <p className="text-xs text-[var(--teks-redup)]">
                  Belum ada rekaman jawaban wawancara yang menunggu persetujuan narasumber.
                </p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {antreanReviewKutipan.slice(0, 6).map((q) => (
                    <li
                      key={q.id}
                      className="flex items-center justify-between gap-2 text-[var(--teks-sekunder)]"
                    >
                      <span className="truncate">{q.pertanyaan}</span>
                      <span className="shrink-0 font-mono text-[11px] text-[var(--aksen-emas)]">
                        {q.statusPersetujuan}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Kartu>
    </div>
  );
}
