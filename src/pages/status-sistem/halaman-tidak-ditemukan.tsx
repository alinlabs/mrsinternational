import { useNavigate } from 'react-router-dom';
import { WadahHalaman } from '../../components/layout/wadah-halaman';
import { KondisiKosong, Tombol } from '../../components/ui';

export default function HalamanTidakDitemukan() {
  const navigasi = useNavigate();

  return (
    <WadahHalaman>
      <div className="py-12">
        <KondisiKosong
          catatanTahap="404 • Rute Tidak Ditemukan"
          judul="Halaman yang Anda cari tidak tersedia"
          deskripsi="Periksa kembali alamat URL atau gunakan navigasi samping untuk membuka modul MRs Plan."
          aksi={
            <Tombol varian="primer" ukuran="sm" onClick={() => navigasi('/')}>
              Kembali ke Rencana Utama
            </Tombol>
          }
        />
      </div>
    </WadahHalaman>
  );
}
