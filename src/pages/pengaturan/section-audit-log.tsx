import { useCallback, useEffect, useState } from 'react';
import { Lock, RefreshCw, Search } from 'lucide-react';
import { ambilAuditTerpaduApi } from '../../services/layanan-pengaturan';
import type { EntriAuditTerstruktur } from '../../types/pengaturan';
import type { SesiPengguna } from '../../types/status';
import { dapatkanLabelPeran } from '../../utils/format';
import {
  InputTeks,
  Kartu,
  KondisiGagal,
  KondisiMemuat,
  SelectPilihan,
  StatusTeks,
  TabelData,
  Tombol,
} from '../../components/ui';
import type { KolomTabel } from '../../components/ui';

const FORMAT_WAKTU_AUDIT_WIB = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Jakarta',
});

function formatWaktuAuditWib(iso: string): string {
  const tgl = new Date(iso);
  if (Number.isNaN(tgl.getTime())) return iso || 'Belum diisi';
  return `${FORMAT_WAKTU_AUDIT_WIB.format(tgl)} WIB`;
}

export interface SectionAuditLogProps {
  sesi: SesiPengguna;
  tokenBearer: string | null;
}

export function SectionAuditLog({ sesi, tokenBearer }: SectionAuditLogProps) {
  const bolehBacaAudit =
    sesi.peran === 'owner' ||
    sesi.peran === 'admin' ||
    sesi.peran === 'digital-manager';

  const [daftarAudit, setDaftarAudit] = useState<EntriAuditTerstruktur[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    'semua' | 'sukses' | 'ditolak' | 'gagal'
  >('semua');
  const [kataKunci, setKataKunci] = useState('');
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [galat, setGalat] = useState('');

  const muatAudit = useCallback(async () => {
    if (!bolehBacaAudit || !tokenBearer) return;
    setSedangMemuat(true);
    setGalat('');
    const resp = await ambilAuditTerpaduApi(tokenBearer, {
      status: statusFilter,
      kataKunci: kataKunci.trim() || undefined,
      batas: 150,
    });
    setSedangMemuat(false);
    if (!resp.ok || !resp.data) {
      setGalat(resp.error?.message ?? 'Gagal memuat log audit server.');
      return;
    }
    setDaftarAudit(resp.data);
  }, [bolehBacaAudit, tokenBearer, statusFilter, kataKunci]);

  useEffect(() => {
    void muatAudit();
  }, [muatAudit]);

  if (!bolehBacaAudit) {
    return (
      <Kartu
        judul="Riwayat Aktivitas Penting (Terbatas)"
        subjudul="Catatan login, persetujuan biaya, perubahan peran, serta unggah & ekspor data."
      >
        <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-4 text-xs text-[var(--teks-sekunder)] flex items-start gap-2.5">
          <Lock className="h-4 w-4 text-[var(--aksen-maroon-teks)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[var(--teks-utama)]">
              Akses Riwayat Aktivitas Dibatasi
            </p>
            <p className="mt-1">
              Riwayat aktivitas hanya dapat dilihat oleh{' '}
              <strong>Owner</strong>, <strong>Admin</strong>, dan{' '}
              <strong>Digital Manager</strong>.
            </p>
          </div>
        </div>
      </Kartu>
    );
  }

  const kolomAudit: KolomTabel<EntriAuditTerstruktur>[] = [
    {
      kunci: 'waktu',
      judul: 'Waktu (WIB) & Kode',
      render: (baris) => (
        <div className="min-w-[150px] text-xs">
          <p className="font-medium text-[var(--teks-utama)] angka-tabular">
            {formatWaktuAuditWib(baris.waktu)}
          </p>
          <p className="text-[11px] font-mono text-[var(--teks-redup)] mt-0.5">
            {baris.requestId}
          </p>
        </div>
      ),
    },
    {
      kunci: 'aktor',
      judul: 'Pengguna & Peran',
      render: (baris) => (
        <div className="min-w-[150px] text-xs">
          <p className="font-semibold text-[var(--teks-utama)]">{baris.aktor}</p>
          <p className="text-[11px] text-[var(--teks-sekunder)] mt-0.5">
            {dapatkanLabelPeran(baris.peran)}
          </p>
        </div>
      ),
    },
    {
      kunci: 'aksi',
      judul: 'Aksi & Entitas',
      render: (baris) => (
        <div className="min-w-[150px] text-xs">
          <p className="font-mono font-semibold text-[var(--aksen-maroon-teks)]">
            {baris.aksi}
          </p>
          <p className="text-[11px] text-[var(--teks-redup)] mt-0.5">
            {baris.entitas ?? 'Operasi'}
            {baris.recordId ? ` • ${baris.recordId}` : ''}
          </p>
        </div>
      ),
    },
    {
      kunci: 'ringkasan',
      judul: 'Objek & Ringkasan Perubahan',
      render: (baris) => (
        <div className="min-w-[240px] text-xs">
          <p className="font-medium text-[var(--teks-utama)]">{baris.target}</p>
          <p className="text-[var(--teks-sekunder)] mt-0.5">{baris.ringkasan}</p>
          {(baris.ringkasanSebelum || baris.ringkasanSesudah) && (
            <p className="text-[11px] font-mono text-[var(--teks-redup)] mt-1">
              {baris.ringkasanSebelum ? `Sebelum: ${baris.ringkasanSebelum}` : ''}
              {baris.ringkasanSebelum && baris.ringkasanSesudah ? ' → ' : ''}
              {baris.ringkasanSesudah ? `Sesudah: ${baris.ringkasanSesudah}` : ''}
            </p>
          )}
        </div>
      ),
    },
    {
      kunci: 'status',
      judul: 'Status',
      render: (baris) => (
        <StatusTeks
          status={
            baris.status === 'sukses'
              ? 'approved'
              : baris.status === 'ditolak'
                ? 'sample'
                : 'not-configured'
          }
          labelKustom={
            baris.status === 'sukses'
              ? 'Berhasil'
              : baris.status === 'ditolak'
                ? 'Ditolak'
                : 'Gagal'
          }
        />
      ),
    },
  ];

  return (
    <Kartu
      judul="Riwayat Aktivitas Tim"
      subjudul="Mencatat aktivitas penting tim tanpa menyimpan kata sandi atau nomor kontak pribadi."
      aksiHeader={
        <Tombol
          varian="sekunder"
          ukuran="sm"
          memuat={sedangMemuat}
          ikonKiri={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={() => void muatAudit()}
        >
          Segarkan
        </Tombol>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2 relative">
            <InputTeks
              label="Cari Riwayat"
              value={kataKunci}
              placeholder="Cari nama, aktivitas, atau objek..."
              onChange={(e) => setKataKunci(e.target.value)}
            />
          </div>
          <SelectPilihan
            label="Filter Status"
            value={statusFilter}
            opsi={[
              { nilai: 'semua', label: 'Semua Status' },
              { nilai: 'sukses', label: 'Berhasil' },
              { nilai: 'ditolak', label: 'Ditolak' },
              { nilai: 'gagal', label: 'Gagal' },
            ]}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as 'semua' | 'sukses' | 'ditolak' | 'gagal',
              )
            }
          />
        </div>

        {galat ? (
          <KondisiGagal
            judul="Gagal memuat riwayat"
            pesan={galat}
            onCobaLagi={() => void muatAudit()}
          />
        ) : sedangMemuat && daftarAudit.length === 0 ? (
          <KondisiMemuat pesan="Memuat riwayat aktivitas..." />
        ) : (
          <TabelData
            keteranganTabel="Daftar riwayat aktivitas penting tim"
            kolom={kolomAudit}
            data={daftarAudit}
            kunciBaris={(b) => b.id}
            filterAktif={Boolean(kataKunci.trim() || statusFilter !== 'semua')}
            judulKosong="Belum ada aktivitas tercatat"
            pesanKosong="Aktivitas login, persetujuan biaya, ubah peran, dan unggah file akan muncul otomatis di sini."
            judulTanpaHasilFilter="Tidak ada riwayat yang cocok"
            pesanTanpaHasilFilter="Ubah kata kunci pencarian atau pilih 'Semua Status'."
          />
        )}

        <p className="text-[11px] text-[var(--teks-redup)] flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Menampilkan maksimal 150 catatan terbaru.
        </p>
      </div>
    </Kartu>
  );
}
