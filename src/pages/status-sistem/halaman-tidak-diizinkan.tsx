import { useNavigate } from 'react-router-dom';
import { WadahHalaman } from '../../components/layout/wadah-halaman';
import { KondisiKosong, Tombol } from '../../components/ui';

export default function HalamanTidakDiizinkan() {
  const navigasi = useNavigate();

  return (
    <WadahHalaman>
      <div className="py-12">
        <KondisiKosong
          catatanTahap="403 • Akses Dibatasi"
          judul="Anda tidak memiliki izin untuk membuka halaman ini"
          deskripsi="Halaman atau data tertentu pada MRs Plan dibatasi berdasarkan peran pengguna. Hubungi Owner atau Admin untuk penyesuaian akses."
          aksi={
            <Tombol varian="sekunder" ukuran="sm" onClick={() => navigasi('/')}>
              Kembali ke Rencana Utama
            </Tombol>
          }
        />
      </div>
    </WadahHalaman>
  );
}
