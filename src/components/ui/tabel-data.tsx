import type { ReactNode } from 'react';
import { KondisiKosong } from './kondisi-kosong';

export interface KolomTabel<T> {
  kunci: string;
  judul: string;
  perataan?: 'kiri' | 'kanan' | 'tengah';
  lebar?: string;
  render: (baris: T) => ReactNode;
}

export interface TabelDataProps<T> {
  keteranganTabel: string;
  kolom: KolomTabel<T>[];
  data: T[];
  kunciBaris: (baris: T) => string;
  headerLengket?: boolean;
  filterAktif?: boolean;
  judulKosong?: string;
  pesanKosong?: string;
  judulTanpaHasilFilter?: string;
  pesanTanpaHasilFilter?: string;
  onKlikBaris?: (baris: T) => void;
}

const KELAS_PERATAAN = {
  kiri: 'text-left',
  kanan: 'text-right angka-tabular',
  tengah: 'text-center',
};

export function TabelData<T>({
  keteranganTabel,
  kolom,
  data,
  kunciBaris,
  headerLengket = false,
  filterAktif = false,
  judulKosong = 'Belum ada data tercatat',
  pesanKosong = 'Data pada bagian ini akan tampil setelah ditambahkan atau disinkronkan.',
  judulTanpaHasilFilter = 'Tidak ada data yang sesuai filter',
  pesanTanpaHasilFilter = 'Ubah kata kunci pencarian atau atur ulang filter yang diterapkan.',
  onKlikBaris,
}: TabelDataProps<T>) {
  if (data.length === 0) {
    return (
      <KondisiKosong
        judul={filterAktif ? judulTanpaHasilFilter : judulKosong}
        deskripsi={filterAktif ? pesanTanpaHasilFilter : pesanKosong}
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-[var(--garis-halus)] rounded-[var(--radius-md)] bg-[var(--bg-permukaan)] shadow-[var(--bayangan-halus)]">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{keteranganTabel}</caption>
        <thead
          className={`bg-[var(--bg-kanvas)] border-b border-[var(--garis-halus)] ${
            headerLengket ? 'sticky top-0 z-10' : ''
          }`}
        >
          <tr>
            {kolom.map((kol) => (
              <th
                key={kol.kunci}
                scope="col"
                style={kol.lebar ? { width: kol.lebar } : undefined}
                className={`px-4 py-3 text-xs font-semibold text-[var(--teks-sekunder)] whitespace-nowrap ${
                  KELAS_PERATAAN[kol.perataan ?? 'kiri']
                }`}
              >
                {kol.judul}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--garis-halus)]">
          {data.map((baris) => (
            <tr
              key={kunciBaris(baris)}
              onClick={onKlikBaris ? () => onKlikBaris(baris) : undefined}
              className={
                onKlikBaris
                  ? 'hover:bg-[var(--aksen-maroon-lembut)]/45 cursor-pointer transition-colors'
                  : 'hover:bg-[var(--bg-kanvas)]/75 transition-colors'
              }
            >
              {kolom.map((kol) => (
                <td
                  key={kol.kunci}
                  className={`px-4 py-3 text-[var(--teks-utama)] align-top ${
                    KELAS_PERATAAN[kol.perataan ?? 'kiri']
                  }`}
                >
                  {kol.render(baris)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
