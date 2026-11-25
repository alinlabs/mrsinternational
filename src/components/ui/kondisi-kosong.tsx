import type { ReactNode } from 'react';

export interface KondisiKosongProps {
  judul: string;
  deskripsi: string;
  catatanTahap?: string;
  aksi?: ReactNode;
}

export function KondisiKosong({
  judul,
  deskripsi,
  catatanTahap,
  aksi,
}: KondisiKosongProps) {
  return (
    <div className="border border-dashed border-[var(--garis-tegas)] rounded-[var(--radius-md)] bg-[var(--bg-permukaan)] px-6 py-10 text-center">
      <div className="mx-auto max-w-md">
        {catatanTahap && (
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--aksen-emas)] mb-1.5">
            {catatanTahap}
          </p>
        )}
        <h3 className="text-sm font-semibold text-[var(--teks-utama)]">{judul}</h3>
        <p className="mt-1.5 text-sm text-[var(--teks-redup)] leading-relaxed">
          {deskripsi}
        </p>
        {aksi && <div className="mt-4 flex justify-center">{aksi}</div>}
      </div>
    </div>
  );
}
