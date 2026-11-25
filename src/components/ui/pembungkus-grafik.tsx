import type { ReactNode } from 'react';
import { Kartu } from './kartu-ringkasan';
import { KondisiKosong } from './kondisi-kosong';

export interface PembungkusGrafikProps {
  judul: string;
  periodeDanSumber: string;
  memilikiData: boolean;
  pesanKosong?: string;
  aksiHeader?: ReactNode;
  children?: ReactNode;
}

export function PembungkusGrafik({
  judul,
  periodeDanSumber,
  memilikiData,
  pesanKosong = 'Grafik hanya ditampilkan setelah data aktual dicatat atau diimpor dari platform.',
  aksiHeader,
  children,
}: PembungkusGrafikProps) {
  return (
    <Kartu judul={judul} subjudul={periodeDanSumber} aksiHeader={aksiHeader}>
      {memilikiData ? (
        <div className="w-full min-h-[220px]">{children}</div>
      ) : (
        <KondisiKosong
          judul="Belum ada data aktual"
          deskripsi={pesanKosong}
        />
      )}
    </Kartu>
  );
}
