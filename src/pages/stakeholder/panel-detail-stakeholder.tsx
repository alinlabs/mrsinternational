import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Check,
  Copy,
  Lock,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react';
import {
  CHANNEL_OUTREACH_KANONIK,
  PIPELINE_OUTREACH_KANONIK,
  TEMPLATE_OUTREACH_KANONIK,
} from '../../data/stakeholder-kanonik';
import type {
  ChannelOutreach,
  RecordStakeholder,
  StatusPipelineOutreach,
} from '../../types/stakeholder';
import { formatTanggalWib } from '../../utils/format';
import {
  dapatkanInfoStatusPipeline,
  dapatkanLabelChannelOutreach,
  dapatkanLabelKategoriStakeholder,
  validasiLogOutreach,
} from '../../utils/stakeholder';
import {
  AreaTeks,
  InputTeks,
  ModalKonfirmasi,
  PanelSamping,
  SelectPilihan,
  StatusTeks,
  Tombol,
  gunakanToast,
} from '../../components/ui';

export interface PanelDetailStakeholderProps {
  stakeholder: RecordStakeholder | null;
  bolehKelola: boolean;
  defaultPic: string;
  onTutup: () => void;
  onEdit: (stakeholder: RecordStakeholder) => void;
  onHapus: (id: string) => Promise<void>;
  onTambahLogOutreach: (
    id: string,
    payload: {
      tanggal: string;
      channel: ChannelOutreach;
      pic: string;
      ringkasan: string;
      respon: string;
      nextStep: string;
      dueDate?: string;
      statusPipeline: StatusPipelineOutreach;
    },
  ) => Promise<void>;
}

export function PanelDetailStakeholder({
  stakeholder,
  bolehKelola,
  defaultPic,
  onTutup,
  onEdit,
  onHapus,
  onTambahLogOutreach,
}: PanelDetailStakeholderProps) {
  const { tampilkanToast } = gunakanToast();

  const [tanggalLog, setTanggalLog] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [channelLog, setChannelLog] = useState<ChannelOutreach>('email');
  const [picLog, setPicLog] = useState(defaultPic);
  const [ringkasanLog, setRingkasanLog] = useState('');
  const [responLog, setResponLog] = useState('');
  const [nextStepLog, setNextStepLog] = useState('');
  const [dueDateLog, setDueDateLog] = useState('');
  const [statusBaru, setStatusBaru] =
    useState<StatusPipelineOutreach>('contacted');
  const [galatLog, setGalatLog] = useState('');
  const [sedangSimpanLog, setSedangSimpanLog] = useState(false);

  const [templateDipilih, setTemplateDipilih] = useState(
    TEMPLATE_OUTREACH_KANONIK[0].id,
  );
  const [tersalin, setTersalin] = useState(false);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);

  useEffect(() => {
    if (!stakeholder) return;
    setChannelLog(stakeholder.channelUtama);
    setPicLog(stakeholder.relationshipOwner || defaultPic);
    setStatusBaru(
      stakeholder.statusPipeline === 'identified' ||
        stakeholder.statusPipeline === 'qualified'
        ? 'contacted'
        : stakeholder.statusPipeline,
    );
    setRingkasanLog('');
    setResponLog('');
    setNextStepLog(stakeholder.nextAction);
    setDueDateLog(stakeholder.dueDate);
    setGalatLog('');
    setTersalin(false);
  }, [stakeholder, defaultPic]);

  const tanganiSubmitLog = async (e: FormEvent) => {
    e.preventDefault();
    if (!stakeholder) return;
    const cek = validasiLogOutreach({
      tanggal: tanggalLog,
      pic: picLog,
      ringkasan: ringkasanLog,
    });
    if (!cek.valid) {
      setGalatLog(cek.pesanGalat);
      return;
    }
    setGalatLog('');
    setSedangSimpanLog(true);
    await onTambahLogOutreach(stakeholder.id, {
      tanggal: tanggalLog,
      channel: channelLog,
      pic: picLog,
      ringkasan: ringkasanLog,
      respon: responLog,
      nextStep: nextStepLog,
      dueDate: dueDateLog,
      statusPipeline: statusBaru,
    });
    setSedangSimpanLog(false);
    setRingkasanLog('');
    setResponLog('');
  };

  const templateObj =
    TEMPLATE_OUTREACH_KANONIK.find((t) => t.id === templateDipilih) ??
    TEMPLATE_OUTREACH_KANONIK[0];

  const salinTemplate = async () => {
    const teks = `Subjek: ${templateObj.subjek}\n\n${templateObj.isi}`;
    try {
      await navigator.clipboard.writeText(teks);
      setTersalin(true);
      tampilkanToast({
        jenis: 'info',
        judul: 'Template disalin ke clipboard',
        pesan: 'Tinjau & sesuaikan manual sebelum dikirim; aplikasi tidak mengirim otomatis.',
      });
      setTimeout(() => setTersalin(false), 2500);
    } catch {
      tampilkanToast({
        jenis: 'peringatan',
        judul: 'Salin manual teks template pada kotak pratinjau',
      });
    }
  };

  const infoStatus = stakeholder
    ? dapatkanInfoStatusPipeline(stakeholder.statusPipeline)
    : null;

  return (
    <>
      <PanelSamping
        terbuka={Boolean(stakeholder)}
        onTutup={onTutup}
        judul={stakeholder ? stakeholder.namaLengkap : 'Detail Stakeholder'}
        subjudul={
          stakeholder
            ? `${stakeholder.jabatanOrganisasi} • Prioritas ${stakeholder.prioritas}`
            : undefined
        }
        footer={
          stakeholder && (
            <div className="w-full flex items-center justify-between gap-2">
              {bolehKelola ? (
                <Tombol
                  varian="bahaya"
                  ukuran="sm"
                  ikonKiri={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setKonfirmasiHapus(true)}
                >
                  Hapus
                </Tombol>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <Tombol varian="sekunder" ukuran="sm" onClick={onTutup}>
                  Tutup
                </Tombol>
                {bolehKelola && (
                  <Tombol
                    varian="primer"
                    ukuran="sm"
                    ikonKiri={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                    onClick={() => onEdit(stakeholder)}
                  >
                    Edit Profil
                  </Tombol>
                )}
              </div>
            </div>
          )
        }
      >
        {stakeholder && (
          <div className="space-y-5">
            {/* Ringkasan Profil & Skor */}
            <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                {infoStatus && (
                  <StatusTeks
                    labelKustom={infoStatus.label}
                    nadaKustom={infoStatus.nada}
                  />
                )}
                <span className="font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                  Skor Relasi: {stakeholder.skor.totalSkor} / 100
                </span>
              </div>

              <p className="text-[11px] text-[var(--teks-redup)]">
                {stakeholder.skor.penjelasanSkor}
              </p>

              <div className="pt-2 border-t border-[var(--garis-halus)] space-y-1.5 text-[var(--teks-sekunder)]">
                <p>
                  <strong className="text-[var(--teks-utama)]">Kategori:</strong>{' '}
                  {dapatkanLabelKategoriStakeholder(stakeholder.kategori)}
                </p>
                <p>
                  <strong className="text-[var(--teks-utama)]">Relevansi:</strong>{' '}
                  {stakeholder.relevansi}
                </p>
                <p>
                  <strong className="text-[var(--teks-utama)]">PIC Relasi:</strong>{' '}
                  {stakeholder.relationshipOwner}
                </p>
                {stakeholder.konteksRelasi && (
                  <p>
                    <strong className="text-[var(--teks-utama)]">Konteks:</strong>{' '}
                    {stakeholder.konteksRelasi}
                  </p>
                )}
                <p>
                  <strong className="text-[var(--teks-utama)]">
                    Tindak Lanjut:
                  </strong>{' '}
                  {stakeholder.nextAction || 'Belum ditentukan'}{' '}
                  {stakeholder.dueDate
                    ? `(Tenggat: ${formatTanggalWib(stakeholder.dueDate)})`
                    : ''}
                </p>
              </div>
            </div>

            {/* Kontrol PII & Kontak Privat */}
            <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[var(--teks-utama)]">
                  Informasi Kontak &amp; Catatan Privat
                </span>
                {stakeholder.kontakTersensor && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--status-peringatan)] font-medium">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Disamarkan oleh Server
                  </span>
                )}
              </div>
              <p className="text-[var(--teks-sekunder)]">
                <strong>Kanal:</strong>{' '}
                {dapatkanLabelChannelOutreach(stakeholder.channelUtama)} •{' '}
                <span className="font-mono">
                  {stakeholder.contactValue || 'Belum diisi'}
                </span>
              </p>
              <p className="text-[var(--teks-redup)]">
                Sumber: {stakeholder.sumberKontak || 'Belum dicatat'}
              </p>
              {stakeholder.catatanPrivat && (
                <p className="text-[var(--teks-sekunder)] pt-1 border-t border-[var(--garis-halus)]">
                  <strong>Catatan Privat:</strong> {stakeholder.catatanPrivat}
                </p>
              )}
            </div>

            {/* Outreach Log Timeline & Form */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
                Log Outreach ({stakeholder.logOutreach.length})
              </h3>

              {bolehKelola && (
                <form
                  onSubmit={tanganiSubmitLog}
                  noValidate
                  className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] p-3 space-y-2.5"
                >
                  {galatLog && (
                    <p
                      role="alert"
                      className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-2.5 py-1.5 text-xs text-[var(--status-bahaya)]"
                    >
                      {galatLog}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <InputTeks
                      label="Tanggal"
                      type="date"
                      wajib
                      value={tanggalLog}
                      onChange={(e) => setTanggalLog(e.target.value)}
                    />
                    <SelectPilihan
                      label="Channel"
                      value={channelLog}
                      opsi={CHANNEL_OUTREACH_KANONIK.map((c) => ({
                        nilai: c.nilai,
                        label: c.label,
                      }))}
                      onChange={(e) =>
                        setChannelLog(e.target.value as ChannelOutreach)
                      }
                    />
                    <InputTeks
                      label="PIC"
                      wajib
                      value={picLog}
                      onChange={(e) => setPicLog(e.target.value)}
                    />
                  </div>

                  <AreaTeks
                    label="Ringkasan Kontak / Pesan"
                    rows={2}
                    wajib
                    value={ringkasanLog}
                    placeholder="Mis. Mengirim email pengenalan Ragi Hotang dan lampiran lookbook singkat"
                    onChange={(e) => {
                      setRingkasanLog(e.target.value);
                      if (galatLog) setGalatLog('');
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <InputTeks
                      label="Respons Pihak Stakeholder"
                      value={responLog}
                      placeholder="Mis. Meminta jadwal call"
                      onChange={(e) => setResponLog(e.target.value)}
                    />
                    <SelectPilihan
                      label="Perbarui Status Pipeline"
                      value={statusBaru}
                      opsi={PIPELINE_OUTREACH_KANONIK.map((p) => ({
                        nilai: p.nilai,
                        label: p.label,
                      }))}
                      onChange={(e) =>
                        setStatusBaru(e.target.value as StatusPipelineOutreach)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <InputTeks
                      label="Next Step"
                      value={nextStepLog}
                      onChange={(e) => setNextStepLog(e.target.value)}
                    />
                    <InputTeks
                      label="Tenggat Berikutnya"
                      type="date"
                      value={dueDateLog}
                      onChange={(e) => setDueDateLog(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Tombol
                      type="submit"
                      varian="primer"
                      ukuran="sm"
                      memuat={sedangSimpanLog}
                      ikonKiri={<Send className="h-3.5 w-3.5" aria-hidden="true" />}
                    >
                      Catat Log Outreach
                    </Tombol>
                  </div>
                </form>
              )}

              {stakeholder.logOutreach.length === 0 ? (
                <p className="text-xs text-[var(--teks-redup)]">
                  Belum ada riwayat kontak yang dicatat.
                </p>
              ) : (
                <ol className="space-y-2">
                  {stakeholder.logOutreach.map((log) => (
                    <li
                      key={log.id}
                      className="rounded-[var(--radius-sm)] border border-[var(--aksen-maroon-garis)]/40 bg-[var(--bg-kanvas)]/70 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[var(--teks-utama)]">
                          {dapatkanLabelChannelOutreach(log.channel)} • {log.pic}
                        </span>
                        <span className="text-[11px] text-[var(--teks-redup)] angka-tabular">
                          {formatTanggalWib(log.tanggal)}
                        </span>
                      </div>
                      <p className="text-[var(--teks-sekunder)]">{log.ringkasan}</p>
                      {log.respon && (
                        <p className="text-[11px] text-[var(--status-sukses)]">
                          Respons: {log.respon}
                        </p>
                      )}
                      {log.nextStep && (
                        <p className="text-[11px] text-[var(--teks-redup)]">
                          Next step: {log.nextStep}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Template Outreach Siap Salin */}
            <div className="space-y-2.5 pt-3 border-t border-[var(--garis-halus)]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--teks-redup)]">
                  Template Pesan Outreach (Manual Copy)
                </h3>
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={
                    tersalin ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )
                  }
                  onClick={() => void salinTemplate()}
                >
                  {tersalin ? 'Tersalin' : 'Salin Template'}
                </Tombol>
              </div>

              <SelectPilihan
                label="Pilih Segmen Template"
                value={templateDipilih}
                opsi={TEMPLATE_OUTREACH_KANONIK.map((t) => ({
                  nilai: t.id,
                  label: `${t.segmen} — ${t.judul}`,
                }))}
                onChange={(e) => setTemplateDipilih(e.target.value)}
              />

              <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3 text-xs text-[var(--teks-sekunder)] whitespace-pre-line leading-relaxed">
                <p className="font-semibold text-[var(--teks-utama)] mb-2">
                  Subjek: {templateObj.subjek}
                </p>
                {templateObj.isi}
              </div>
              <p className="text-[11px] text-[var(--teks-redup)]">
                Kontrol komunikasi: aplikasi tidak pernah mengirim email/DM otomatis ke pihak luar. Salin dan tinjau manual sebelum dikirim.
              </p>
            </div>
          </div>
        )}
      </PanelSamping>

      <ModalKonfirmasi
        terbuka={konfirmasiHapus}
        onTutup={() => setKonfirmasiHapus(false)}
        onKonfirmasi={async () => {
          if (!stakeholder) return;
          setKonfirmasiHapus(false);
          await onHapus(stakeholder.id);
        }}
        judul="Hapus rekaman stakeholder?"
        pesan="Rekaman profil beserta riwayat log outreach akan dihapus dari daftar CRM."
        labelKonfirmasi="Ya, hapus stakeholder"
        berbahaya
      />
    </>
  );
}
