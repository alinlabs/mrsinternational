import { useMemo, useState } from 'react';
import { AlertTriangle, FileText, RotateCcw } from 'lucide-react';
import { ModalEksporPdf } from '../../components/domain/modal-ekspor-pdf';
import { gunakanKalenderKonten } from '../../hooks/gunakan-kalender-konten';
import { gunakanProduksi } from '../../hooks/gunakan-produksi';
import type { StatusTugasProduksi, TugasProduksi } from '../../types/produksi';
import {
  evaluasiMilestone11Desember,
  hitungStatistikProduksi,
  validasiTugasProduksi,
} from '../../utils/produksi';
import { WadahHalaman } from '../../components/layout/wadah-halaman';
import {
  BilahTabAtas,
  HeaderHalaman,
  ModalKonfirmasi,
  StatusTeks,
  Tombol,
  gunakanToast,
} from '../../components/ui';
import { PanelDetailTugas } from './panel-detail-tugas';
import { SectionDeliverablesApproval } from './section-deliverables-approval';
import { SectionShootingSesi } from './section-shooting-sesi';
import { SectionTugasProduksi } from './section-tugas-produksi';
import { SectionWawancaraHero } from './section-wawancara-hero';

export default function HalamanProduksiTugas() {
  const {
    stateProduksi,
    simpanTugas,
    perbaruiSesiShooting,
    perbaruiSlotShooting,
    toggleChecklist,
    simpanPertanyaanWawancara,
    perbaruiDeliverable,
    resetProduksi,
  } = gunakanProduksi();
  const { daftarKonten } = gunakanKalenderKonten();
  const { tampilkanToast } = gunakanToast();

  const [tabAktif, setTabAktif] = useState('tugas');
  const [panelTugasTerbuka, setPanelTugasTerbuka] = useState(false);
  const [modeBuatTugasBaru, setModeBuatTugasBaru] = useState(false);
  const [tugasDiedit, setTugasDiedit] = useState<TugasProduksi | null>(null);
  const [modalResetTerbuka, setModalResetTerbuka] = useState(false);
  const [modalPdfTerbuka, setModalPdfTerbuka] = useState(false);

  const statistik = useMemo(
    () => hitungStatistikProduksi(stateProduksi),
    [stateProduksi],
  );

  const evaluasi11Des = useMemo(
    () => evaluasiMilestone11Desember(stateProduksi),
    [stateProduksi],
  );

  const bukaEditTugas = (tugas: TugasProduksi) => {
    setModeBuatTugasBaru(false);
    setTugasDiedit(tugas);
    setPanelTugasTerbuka(true);
  };

  const bukaTambahTugas = () => {
    setModeBuatTugasBaru(true);
    setTugasDiedit(null);
    setPanelTugasTerbuka(true);
  };

  const tanganiSimpanTugas = (tugas: TugasProduksi) => {
    simpanTugas(tugas);
    setPanelTugasTerbuka(false);
    setTugasDiedit(null);
    tampilkanToast({
      jenis: 'sukses',
      judul: modeBuatTugasBaru ? 'Tugas produksi ditambahkan' : 'Tugas diperbarui',
      pesan:
        tugas.kontenTertaut.length > 0
          ? `Perubahan status disinkronkan ke ${tugas.kontenTertaut.length} master aset di Kalender Konten.`
          : 'Status tugas dan tenggat telah disimpan.',
    });
  };

  const tanganiUbahStatusCepat = (
    tugas: TugasProduksi,
    statusBaru: StatusTugasProduksi,
  ) => {
    const kandidat = { ...tugas, status: statusBaru };
    const galat = validasiTugasProduksi(kandidat);
    if (Object.keys(galat).length > 0) {
      setModeBuatTugasBaru(false);
      setTugasDiedit(kandidat);
      setPanelTugasTerbuka(true);
      tampilkanToast({
        jenis: 'peringatan',
        judul: 'Lengkapi keterangan wajib',
        pesan:
          statusBaru === 'blocked'
            ? 'Isi alasan tertahan pada panel detail sebelum menyimpan.'
            : 'Isi nama penyetuju sebelum menandai tugas Disetujui.',
      });
      return;
    }

    simpanTugas(kandidat);
    tampilkanToast({
      jenis: 'sukses',
      judul: 'Status tugas diperbarui',
      pesan:
        kandidat.kontenTertaut.length > 0
          ? `Progres ${kandidat.kontenTertaut.length} konten tertaut di Kalender & Rencana Utama ikut diperbarui.`
          : 'Status tugas berhasil diperbarui.',
    });
  };

  const tanganiResetProduksi = () => {
    resetProduksi();
    setModalResetTerbuka(false);
    tampilkanToast({
      jenis: 'info',
      judul: 'Data produksi dikembalikan ke rencana awal',
      pesan: 'Tugas, jadwal shooting, checklist, wawancara, dan hasil kerja kembali ke posisi awal.',
    });
  };

  const daftarTab = [
    {
      id: 'tugas',
      label: `Daftar Tugas (${statistik.totalTugas})`,
      konten: (
        <SectionTugasProduksi
          daftarTugas={stateProduksi.daftarTugas}
          onPilihTugas={bukaEditTugas}
          onTambahTugas={bukaTambahTugas}
          onUbahStatusCepat={tanganiUbahStatusCepat}
        />
      ),
    },
    {
      id: 'shooting',
      label: 'Jadwal Shooting',
      konten: (
        <SectionShootingSesi
          daftarSesiShooting={stateProduksi.daftarSesiShooting}
          checklistShooting={stateProduksi.checklistShooting}
          onPerbaruiSesi={(id, perubahan) => {
            perbaruiSesiShooting(id, perubahan);
            tampilkanToast({
              jenis: 'sukses',
              judul: 'Jadwal sesi shooting disimpan',
            });
          }}
          onPerbaruiSlot={perbaruiSlotShooting}
          onToggleChecklist={toggleChecklist}
        />
      ),
    },
    {
      id: 'wawancara',
      label: 'Wawancara & Video Utama',
      konten: (
        <SectionWawancaraHero
          bankPertanyaan={stateProduksi.bankPertanyaan}
          daftarDeliverables={stateProduksi.daftarDeliverables}
          onSimpanPertanyaan={(item) => {
            simpanPertanyaanWawancara(item);
            tampilkanToast({
              jenis: 'sukses',
              judul: 'Rekaman & status kutipan disimpan',
            });
          }}
          onPerbaruiDeliverable={perbaruiDeliverable}
        />
      ),
    },
    {
      id: 'deliverables',
      label: 'Hasil & Persetujuan',
      konten: (
        <SectionDeliverablesApproval
          daftarDeliverables={stateProduksi.daftarDeliverables}
          bankPertanyaan={stateProduksi.bankPertanyaan}
          daftarKontenKalender={daftarKonten}
          onPerbaruiDeliverable={perbaruiDeliverable}
        />
      ),
    },
  ];

  const tabAktifObj =
    daftarTab.find((tab) => tab.id === tabAktif) ?? daftarTab[0];

  return (
    <div className="flex-1 min-h-0 flex flex-col print:block print:h-auto">
      <BilahTabAtas
        daftarTab={daftarTab.map(({ id, label }) => ({ id, label }))}
        tabAktif={tabAktif}
        onUbahTab={setTabAktif}
        labelNavigasi="Bagian halaman produksi dan tugas"
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain print:overflow-visible">
        <WadahHalaman>
          <HeaderHalaman
            labelTahap="Shooting 3 Hari (25 Nov, 30 Nov & 3 Des 2026)"
            judul="Produksi & Shooting"
            tujuan="Kelola tugas tim, jadwal shooting, catatan wawancara, dan persetujuan materi."
            aksiUtama={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<FileText className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setModalPdfTerbuka(true)}
                >
                  Ekspor PDF
                </Tombol>
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setModalResetTerbuka(true)}
                >
                  Reset Produksi
                </Tombol>
              </div>
            }
          />

          <div className="space-y-8 pb-8">
            <div
              role="region"
              aria-label="Peringatan milestone kritis 11 Desember 2026"
              style={
                evaluasi11Des.status === 'tuntas'
                  ? undefined
                  : { backgroundImage: 'var(--gradasi-kartu-lembut)' }
              }
              className={`rounded-[var(--radius-lg)] border px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[var(--bayangan-halus)] ${
                evaluasi11Des.status === 'tuntas'
                  ? 'border-[var(--status-sukses)]/35 bg-[var(--status-sukses)]/[0.06]'
                  : 'border-[var(--aksen-maroon-garis)]/25'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`h-5 w-5 shrink-0 mt-0.5 ${
                    evaluasi11Des.status === 'tuntas'
                      ? 'text-[var(--status-sukses)]'
                      : 'text-[var(--aksen-maroon-teks)]'
                  }`}
                  aria-hidden="true"
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-[var(--teks-utama)]">
                    Milestone Kritis Keberangkatan Balige (&lt; 11 Desember 2026)
                  </p>
                  <p className="text-xs text-[var(--teks-sekunder)] leading-relaxed">
                    {evaluasi11Des.pesanPeringatan}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <StatusTeks
                  labelKustom={
                    evaluasi11Des.status === 'tuntas'
                      ? 'Milestone Pra-Balige Tuntas'
                      : 'Perlu Eskalasi < 11 Des'
                  }
                  nadaKustom={evaluasi11Des.status === 'tuntas' ? 'hijau' : 'maroon'}
                />
                {evaluasi11Des.status !== 'tuntas' && (
                  <Tombol
                    varian="sekunder"
                    ukuran="sm"
                    onClick={() => {
                      const tugasKritis = stateProduksi.daftarTugas.find(
                        (t) => t.adalahMilestoneKritis11Des,
                      );
                      if (tugasKritis) {
                        bukaEditTugas(tugasKritis);
                      }
                    }}
                  >
                    Kelola Tugas 11 Des
                  </Tombol>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-3.5 py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
              >
                <p className="text-xs text-[var(--teks-redup)]">Tugas Selesai</p>
                <p className="mt-1 text-xl sm:text-2xl font-semibold text-[var(--aksen-maroon-teks)] dark:text-[#F3CE7A] angka-tabular">
                  {statistik.tugasSelesai} / {statistik.totalTugas}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-redup)]">
                  {statistik.tugasAktif} berjalan • {statistik.tugasBlocked} tertahan
                </p>
              </div>

              <div
                style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-3.5 py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
              >
                <p className="text-xs text-[var(--teks-redup)]">Checklist Shooting</p>
                <p className="mt-1 text-xl sm:text-2xl font-semibold text-[var(--teks-utama)] angka-tabular">
                  {statistik.checklistSelesai} / {statistik.checklistTotal}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-redup)]">
                  25 Nov, 30 Nov &amp; 3 Des (08.30–17.00)
                </p>
              </div>

              <div
                style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-3.5 py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
              >
                <p className="text-xs text-[var(--teks-redup)]">Kutipan Disetujui</p>
                <p className="mt-1 text-xl sm:text-2xl font-semibold text-[var(--teks-utama)] angka-tabular">
                  {statistik.kutipanDisetujui} / {statistik.totalPertanyaan}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-redup)]">
                  {statistik.kutipanTercatat} jawaban tercatat
                </p>
              </div>

              <div
                style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
                className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 px-3.5 py-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-center"
              >
                <p className="text-xs text-[var(--teks-redup)]">Hasil Video &amp; Desain</p>
                <p className="mt-1 text-xl sm:text-2xl font-semibold text-[var(--teks-utama)] angka-tabular">
                  {statistik.deliverableSelesai} / {statistik.deliverableTotal}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--teks-redup)]">
                  44 video, video utama &amp; 22 desain
                </p>
              </div>
            </div>

            <div role="tabpanel" aria-label={tabAktifObj?.label}>
              {tabAktifObj?.konten}
            </div>
          </div>
        </WadahHalaman>
      </div>

      <PanelDetailTugas
        tugas={tugasDiedit}
        modeBuatBaru={modeBuatTugasBaru}
        terbuka={panelTugasTerbuka}
        onTutup={() => {
          setPanelTugasTerbuka(false);
          setTugasDiedit(null);
        }}
        onSimpan={tanganiSimpanTugas}
      />

      <ModalKonfirmasi
        terbuka={modalResetTerbuka}
        onTutup={() => setModalResetTerbuka(false)}
        onKonfirmasi={tanganiResetProduksi}
        judul="Kembalikan data produksi ke rencana awal?"
        pesan="Perubahan status tugas, catatan shooting, checklist, wawancara, dan hasil kerja lokal akan dikembalikan ke posisi awal."
        labelKonfirmasi="Ya, kembalikan ke awal"
        berbahaya
      />

      <ModalEksporPdf
        terbuka={modalPdfTerbuka}
        onTutup={() => setModalPdfTerbuka(false)}
        jenisDefault="production-approval"
      />
    </div>
  );
}
