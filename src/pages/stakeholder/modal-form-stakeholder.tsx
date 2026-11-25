import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  CHANNEL_OUTREACH_KANONIK,
  KATEGORI_STAKEHOLDER_KANONIK,
  PIPELINE_OUTREACH_KANONIK,
  PRIORITAS_STAKEHOLDER_KANONIK,
} from '../../data/stakeholder-kanonik';
import type {
  ChannelOutreach,
  InputStakeholderBaru,
  KategoriStakeholder,
  PrioritasStakeholder,
  RecordStakeholder,
  StatusPipelineOutreach,
} from '../../types/stakeholder';
import {
  hitungSkorRelasiStakeholder,
  validasiInputStakeholder,
} from '../../utils/stakeholder';
import {
  AreaTeks,
  InputTeks,
  ModalDialog,
  SelectPilihan,
  Tombol,
} from '../../components/ui';

export interface ModalFormStakeholderProps {
  terbuka: boolean;
  stakeholderEdit: RecordStakeholder | null;
  defaultOwner: string;
  sedangSimpan: boolean;
  onTutup: () => void;
  onSimpan: (input: InputStakeholderBaru, idEdit?: string) => Promise<void>;
}

const OPSI_SKOR = [
  { nilai: '1', label: '1 — Sangat Rendah' },
  { nilai: '2', label: '2 — Rendah' },
  { nilai: '3', label: '3 — Sedang' },
  { nilai: '4', label: '4 — Tinggi' },
  { nilai: '5', label: '5 — Sangat Tinggi' },
];

export function ModalFormStakeholder({
  terbuka,
  stakeholderEdit,
  defaultOwner,
  sedangSimpan,
  onTutup,
  onSimpan,
}: ModalFormStakeholderProps) {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [jabatanOrganisasi, setJabatanOrganisasi] = useState('');
  const [kategori, setKategori] = useState<KategoriStakeholder>('commercial');
  const [prioritas, setPrioritas] = useState<PrioritasStakeholder>('A');
  const [relevansi, setRelevansi] = useState('');
  const [relationshipOwner, setRelationshipOwner] = useState(defaultOwner);
  const [sumberKontak, setSumberKontak] = useState('');
  const [channelUtama, setChannelUtama] = useState<ChannelOutreach>('email');
  const [contactValue, setContactValue] = useState('');
  const [konteksRelasi, setKonteksRelasi] = useState('');
  const [consentToPublish, setConsentToPublish] = useState(false);
  const [statusPipeline, setStatusPipeline] =
    useState<StatusPipelineOutreach>('identified');
  const [nextAction, setNextAction] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [catatanPrivat, setCatatanPrivat] = useState('');

  const [skorRelevansi, setSkorRelevansi] = useState('4');
  const [skorInfluence, setSkorInfluence] = useState('4');
  const [skorPeluang, setSkorPeluang] = useState('3');
  const [skorKedekatan, setSkorKedekatan] = useState('3');

  const [galat, setGalat] = useState('');

  useEffect(() => {
    if (!terbuka) return;
    if (stakeholderEdit) {
      setNamaLengkap(stakeholderEdit.namaLengkap);
      setJabatanOrganisasi(stakeholderEdit.jabatanOrganisasi);
      setKategori(stakeholderEdit.kategori);
      setPrioritas(stakeholderEdit.prioritas);
      setRelevansi(stakeholderEdit.relevansi);
      setRelationshipOwner(stakeholderEdit.relationshipOwner);
      setSumberKontak(stakeholderEdit.sumberKontak);
      setChannelUtama(stakeholderEdit.channelUtama);
      setContactValue(
        stakeholderEdit.kontakTersensor ? '' : stakeholderEdit.contactValue,
      );
      setKonteksRelasi(stakeholderEdit.konteksRelasi);
      setConsentToPublish(stakeholderEdit.consentToPublish);
      setStatusPipeline(stakeholderEdit.statusPipeline);
      setNextAction(stakeholderEdit.nextAction);
      setDueDate(stakeholderEdit.dueDate);
      setCatatanPrivat(
        stakeholderEdit.kontakTersensor ? '' : stakeholderEdit.catatanPrivat,
      );
      setSkorRelevansi(String(stakeholderEdit.skor.relevansi));
      setSkorInfluence(String(stakeholderEdit.skor.influence));
      setSkorPeluang(String(stakeholderEdit.skor.peluangNyata));
      setSkorKedekatan(String(stakeholderEdit.skor.kedekatanHubungan));
    } else {
      setNamaLengkap('');
      setJabatanOrganisasi('');
      setKategori('commercial');
      setPrioritas('A');
      setRelevansi('');
      setRelationshipOwner(defaultOwner || 'PIC Stakeholder');
      setSumberKontak('');
      setChannelUtama('email');
      setContactValue('');
      setKonteksRelasi('');
      setConsentToPublish(false);
      setStatusPipeline('identified');
      setNextAction('');
      setDueDate('');
      setCatatanPrivat('');
      setSkorRelevansi('4');
      setSkorInfluence('4');
      setSkorPeluang('3');
      setSkorKedekatan('3');
    }
    setGalat('');
  }, [terbuka, stakeholderEdit, defaultOwner]);

  const pratinjauSkor = hitungSkorRelasiStakeholder({
    relevansi: Number(skorRelevansi),
    influence: Number(skorInfluence),
    peluangNyata: Number(skorPeluang),
    kedekatanHubungan: Number(skorKedekatan),
  });

  const tanganiSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cek = validasiInputStakeholder({
      namaLengkap,
      jabatanOrganisasi,
      relevansi,
      relationshipOwner,
    });
    if (!cek.valid) {
      setGalat(cek.pesanGalat);
      return;
    }
    setGalat('');
    await onSimpan(
      {
        namaLengkap,
        jabatanOrganisasi,
        kategori,
        prioritas,
        relevansi,
        relationshipOwner,
        sumberKontak,
        channelUtama,
        contactValue,
        konteksRelasi,
        consentToPublish,
        statusPipeline,
        nextAction,
        dueDate,
        catatanPrivat,
        komponenSkor: {
          relevansi: Number(skorRelevansi),
          influence: Number(skorInfluence),
          peluangNyata: Number(skorPeluang),
          kedekatanHubungan: Number(skorKedekatan),
        },
      },
      stakeholderEdit?.id,
    );
  };

  return (
    <ModalDialog
      terbuka={terbuka}
      onTutup={onTutup}
      judul={
        stakeholderEdit
          ? `Edit Stakeholder: ${stakeholderEdit.namaLengkap}`
          : 'Tambah Stakeholder Baru'
      }
      deskripsi="Catat relasi terverifikasi beserta sumber kontak dan konteks hubungan. Nilai kontak dilindungi pada peran berwenang."
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
          <InputTeks
            label="Nama Lengkap / Pihak"
            wajib
            value={namaLengkap}
            placeholder="Mis. Nama Kontak / Perwakilan Resmi"
            onChange={(e) => {
              setNamaLengkap(e.target.value);
              if (galat) setGalat('');
            }}
          />
          <InputTeks
            label="Jabatan & Organisasi"
            wajib
            value={jabatanOrganisasi}
            placeholder="Mis. Kurator Mode / Pimpinan Redaksi"
            onChange={(e) => {
              setJabatanOrganisasi(e.target.value);
              if (galat) setGalat('');
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectPilihan
            label="Kategori Stakeholder"
            value={kategori}
            opsi={KATEGORI_STAKEHOLDER_KANONIK.map((k) => ({
              nilai: k.nilai,
              label: k.label,
            }))}
            onChange={(e) => {
              const kat = e.target.value as KategoriStakeholder;
              setKategori(kat);
              const def = KATEGORI_STAKEHOLDER_KANONIK.find(
                (k) => k.nilai === kat,
              )?.prioritasDefault;
              if (def && !stakeholderEdit) setPrioritas(def);
            }}
          />
          <SelectPilihan
            label="Prioritas"
            value={prioritas}
            opsi={PRIORITAS_STAKEHOLDER_KANONIK.map((p) => ({
              nilai: p.nilai,
              label: p.label,
            }))}
            onChange={(e) => setPrioritas(e.target.value as PrioritasStakeholder)}
          />
          <SelectPilihan
            label="Status Pipeline Outreach"
            value={statusPipeline}
            opsi={PIPELINE_OUTREACH_KANONIK.map((p) => ({
              nilai: p.nilai,
              label: p.label,
            }))}
            onChange={(e) =>
              setStatusPipeline(e.target.value as StatusPipelineOutreach)
            }
          />
        </div>

        <InputTeks
          label="Alasan Relevansi Strategis"
          wajib
          value={relevansi}
          placeholder="Mis. Mengelola kurasi butik wastra Nusantara di Jakarta"
          onChange={(e) => {
            setRelevansi(e.target.value);
            if (galat) setGalat('');
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InputTeks
            label="Relationship Owner (PIC)"
            wajib
            value={relationshipOwner}
            onChange={(e) => setRelationshipOwner(e.target.value)}
          />
          <SelectPilihan
            label="Channel Kontak Utama"
            value={channelUtama}
            opsi={CHANNEL_OUTREACH_KANONIK.map((c) => ({
              nilai: c.nilai,
              label: c.label,
            }))}
            onChange={(e) => setChannelUtama(e.target.value as ChannelOutreach)}
          />
          <InputTeks
            label="Nilai Kontak (Privat / PII)"
            value={contactValue}
            placeholder="Email atau nomor kerja resmi"
            onChange={(e) => setContactValue(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputTeks
            label="Sumber Kontak"
            value={sumberKontak}
            placeholder="Mis. Direktori resmi / perkenalan partner"
            onChange={(e) => setSumberKontak(e.target.value)}
          />
          <InputTeks
            label="Konteks Relasi"
            value={konteksRelasi}
            placeholder="Mis. Sudah mengenal karya Vany Songket sejak 2025"
            onChange={(e) => setKonteksRelasi(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputTeks
            label="Tindakan Berikutnya (Next Action)"
            value={nextAction}
            placeholder="Mis. Kirim lookbook & undangan privat"
            onChange={(e) => setNextAction(e.target.value)}
          />
          <InputTeks
            label="Tenggat Follow-up"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70 p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[var(--teks-utama)]">
              Skor Prioritas Relasi Terjelaskan (Bobot Transparan)
            </span>
            <strong className="text-[var(--aksen-maroon-teks)] angka-tabular">
              Total: {pratinjauSkor.totalSkor} / 100
            </strong>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <SelectPilihan
              label="Relevansi (35%)"
              value={skorRelevansi}
              opsi={OPSI_SKOR}
              onChange={(e) => setSkorRelevansi(e.target.value)}
            />
            <SelectPilihan
              label="Influence (35%)"
              value={skorInfluence}
              opsi={OPSI_SKOR}
              onChange={(e) => setSkorInfluence(e.target.value)}
            />
            <SelectPilihan
              label="Peluang Nyata (20%)"
              value={skorPeluang}
              opsi={OPSI_SKOR}
              onChange={(e) => setSkorPeluang(e.target.value)}
            />
            <SelectPilihan
              label="Kedekatan (10%)"
              value={skorKedekatan}
              opsi={OPSI_SKOR}
              onChange={(e) => setSkorKedekatan(e.target.value)}
            />
          </div>
          <p className="text-[11px] text-[var(--teks-redup)]">
            {pratinjauSkor.penjelasanSkor}
          </p>
        </div>

        <AreaTeks
          label="Catatan Privat Tim (Tidak diekspor ke publik)"
          rows={2}
          value={catatanPrivat}
          placeholder="Catatan sensitif strategi pendekatan atau preferensi jadwal..."
          onChange={(e) => setCatatanPrivat(e.target.value)}
        />

        <label className="flex items-center gap-2 text-xs text-[var(--teks-utama)] cursor-pointer">
          <input
            type="checkbox"
            checked={consentToPublish}
            onChange={(e) => setConsentToPublish(e.target.checked)}
            className="h-4 w-4 accent-[var(--aksen-maroon)]"
          />
          <span>
            Stakeholder memberi izin nama/organisasi dicantumkan pada laporan non-publik (Consent to Publish)
          </span>
        </label>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--garis-halus)]">
          <Tombol varian="sekunder" ukuran="sm" onClick={onTutup}>
            Batal
          </Tombol>
          <Tombol
            type="submit"
            varian="primer"
            ukuran="sm"
            memuat={sedangSimpan}
          >
            {stakeholderEdit ? 'Simpan Perubahan' : 'Simpan Stakeholder'}
          </Tombol>
        </div>
      </form>
    </ModalDialog>
  );
}
