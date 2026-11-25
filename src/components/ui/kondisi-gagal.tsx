import { Tombol } from './tombol';

export interface KondisiGagalProps {
  judul?: string;
  pesan: string;
  onCobaLagi?: () => void;
}

export function KondisiGagal({
  judul = 'Gagal memuat data',
  pesan,
  onCobaLagi,
}: KondisiGagalProps) {
  return (
    <div
      role="alert"
      className="border border-[var(--status-bahaya)]/45 rounded-[var(--radius-md)] bg-[var(--bg-permukaan)] p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--teks-utama)]">{judul}</h3>
      <p className="mt-1 text-sm text-[var(--teks-sekunder)]">{pesan}</p>
      {onCobaLagi && (
        <div className="mt-3">
          <Tombol varian="sekunder" ukuran="sm" onClick={onCobaLagi}>
            Coba lagi
          </Tombol>
        </div>
      )}
    </div>
  );
}
