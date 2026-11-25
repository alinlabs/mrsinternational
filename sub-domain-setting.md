# Panduan Hosting di Vercel Menggunakan Subdomain Rumahweb

Panduan ini dibuat khusus agar mudah diikuti oleh pemula, langkah demi langkah, tanpa istilah teknis yang membingungkan.

---

## Pahami Dulu Konsep Sederhananya

Bayangkan Anda ingin membuka toko online:
- **Vercel** = **Bangunan / tempat aplikasi Anda berjalan** (server gratis & cepat yang sudah cocok dengan proyek ini).
- **Rumahweb** = **Tempat Anda membeli alamat domain** (misalnya `namadomainanda.com`).
- **Subdomain** = **Cabang alamat di depan domain utama**, misalnya:
  - `mrs.namadomainanda.com`
  - `app.namadomainanda.com`
  - `portal.namadomainanda.com`

Dengan memakai **subdomain**, domain utama Anda (`namadomainanda.com`) tetap aman jika sudah dipakai untuk website lain (misalnya landing page atau company profile), sementara aplikasi ini bisa diakses di alamat khusus seperti `mrs.namadomainanda.com`.

> **Kabar baik:** Proyek ini sudah dilengkapi file `vercel.json` dan folder `api/`. Artinya Anda **tidak perlu mengubah pengaturan kode atau build** untuk men-deploy ke Vercel.

---

## Yang Perlu Disiapkan

1. Akun **GitHub** (gratis di [github.com](https://github.com)) — untuk menyimpan kode proyek agar otomatis terhubung ke Vercel.
2. Akun **Vercel** (gratis di [vercel.com](https://vercel.com)) — disarankan login menggunakan tombol **Continue with GitHub**.
3. Akun **Clientzone Rumahweb** ([clientzone.rumahweb.com](https://clientzone.rumahweb.com)) — tempat domain Anda dibeli dan aktif.

---

## Langkah 1: Upload & Deploy Proyek ke Vercel

1. **Upload kode proyek ke GitHub**
   - Buat repository baru di GitHub (boleh **Private** atau **Public**).
   - Upload seluruh folder dan file proyek ini ke repository tersebut.
2. **Import proyek ke Vercel**
   - Buka [vercel.com/new](https://vercel.com/new).
   - Pilih repository GitHub proyek Anda, lalu klik **Import**.
3. **Biarkan pengaturan Build apa adanya**
   - Framework Preset: otomatis terdeteksi **Vite** (atau ikuti `vercel.json`).
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Klik **Deploy** dan tunggu sekitar 1–2 menit sampai muncul tulisan **Congratulations** (artinya aplikasi sudah online dengan alamat sementara berakhiran `.vercel.app`).

---

## Langkah 2: Daftarkan Subdomain di Vercel

Sekarang kita beri tahu Vercel alamat subdomain apa yang ingin dipakai.

1. Di halaman proyek Vercel Anda, klik menu **Settings** (di bagian atas).
2. Di menu sebelah kiri, klik **Domains**.
3. Ketikkan alamat subdomain lengkap yang Anda inginkan di kolom input, misalnya:
   ```text
   mrs.namadomainanda.com
   ```
   *(Ganti `namadomainanda.com` dengan domain asli yang Anda beli di Rumahweb, dan `mrs` bisa diganti nama apa saja sesuai selera).*
4. Klik tombol **Add**.
5. Setelah ditambahkan, Vercel akan menampilkan status **Invalid Configuration** (ini normal karena kita belum menyambungkan dari sisi Rumahweb) beserta instruksi DNS.
6. **Catat nilai CNAME** yang diberikan Vercel. Biasanya tampil seperti ini:
   - **Type:** `CNAME`
   - **Name:** `mrs`
   - **Value:** `cname.vercel-dns.com` *(atau kode khusus berakhiran `.vercel-dns-017.com` — **selalu ikuti persis yang muncul di layar Vercel Anda**).*

---

## Langkah 3: Atur DNS Subdomain di Rumahweb

Sekarang kita arahkan subdomain dari Rumahweb menuju Vercel.

1. Login ke **Clientzone Rumahweb**: [clientzone.rumahweb.com](https://clientzone.rumahweb.com).
2. Masuk ke menu **Domains** → klik domain Anda → pilih **Manage DNS** (atau **DNS Management**).
   > **Penting:** Jika muncul pesan bahwa DNS Management tidak aktif, cek menu **Nameservers** domain Anda. Pastikan domain menggunakan **Nameserver Default Rumahweb** (kecuali Anda sengaja memakai Cloudflare/cPanel hosting; lihat bagian *Catatan Penting* di bawah).
3. Cari tombol **Add New Record** / **Tambah Record**, lalu isi seperti ini:

   | Kolom | Isi dengan | Keterangan untuk Pemula |
   | :--- | :--- | :--- |
   | **Type / Tipe** | `CNAME` | Pilih `CNAME` (bukan `A` atau `TXT`). |
   | **Host / Name / Subdomain** | `mrs` | Isi **bagian depannya saja** (jangan ditulis lengkap dengan `.namadomainanda.com`, karena Rumahweb biasanya otomatis menambahkan nama domain di belakangnya). |
   | **Value / Target / Points to** | `cname.vercel-dns.com` | **Salin persis** dari layar Vercel pada Langkah 2.6 (bisa juga berupa alamat unik seperti `xxx.vercel-dns-017.com`). |
   | **TTL** | `14400` atau `3600` / `Auto` | Biarkan nilai bawaan/default saja. |

4. Klik **Save** / **Simpan Perubahan**.

> **Peringatan:** Pastikan tidak ada record lama dengan nama Host yang sama (misalnya `A record` bernama `mrs`). Jika sudah ada, hapus record lama tersebut terlebih dahulu agar tidak bentrok.

---

## Langkah 4: Verifikasi & Aktifkan HTTPS (SSL)

1. Tunggu sekitar **5 sampai 30 menit** agar perubahan DNS menyebar ke seluruh internet (kadang bisa memakan waktu hingga beberapa jam).
2. Kembali ke dashboard **Vercel → Project Anda → Settings → Domains**.
3. Klik tombol **Refresh** di samping subdomain Anda.
4. Jika sudah berhasil tersambung, status akan berubah menjadi **Valid Configuration** dengan tanda centang biru/hijau.
5. **Selesai!** Vercel otomatis memasangkan sertifikat SSL gratis (`https://`), sehingga subdomain `https://mrs.namadomainanda.com` sudah bisa dibuka dengan aman di HP maupun laptop.

---

## Langkah 5 (Khusus Aplikasi Ini): Pengaturan Environment Variables di Vercel

Agar fitur login admin, keamanan origin (CORS), dan integrasi berjalan sempurna di subdomain baru Anda, tambahkan pengaturan berikut di Vercel:

1. Buka **Vercel → Project Anda → Settings → Environment Variables**.
2. Tambahkan variabel berikut satu per satu (opsional tapi sangat disarankan):

   | Name (Nama) | Value (Isi) | Fungsinya |
   | :--- | :--- | :--- |
   | `APP_URL` | `https://mrs.namadomainanda.com` | Memberi tahu server alamat resmi subdomain Anda. |
   | `ALLOWED_CORS_ORIGINS` | `https://mrs.namadomainanda.com` | Mengizinkan subdomain Anda mengakses API `/api/*` dengan aman. |
   | `AUTH_SESSION_SECRET` | *(kata sandi acak minimal 16 huruf/angka)* | Menjaga sesi login tetap aman dan konsisten di server Vercel. |
   | `PREVIEW_ADMIN_PASSCODE` | *(passcode pilihan Anda)* | *(Opsional)* Mengunci passcode tetap untuk masuk sebagai admin/owner. |

3. Setelah menyimpan Environment Variables, buka tab **Deployments** di Vercel → klik ikon titik tiga (`...`) pada deployment paling atas → klik **Redeploy** agar pengaturan baru langsung aktif.

---

## Catatan Penting & Solusi Jika Menemui Kendala

### 1. Menu "Manage DNS" di Rumahweb tidak bisa dipakai?
Biasanya ini terjadi karena domain Anda masih memakai **Nameserver Hosting** (misalnya cPanel) atau **Cloudflare**:
- **Jika domain terhubung ke cPanel Hosting Rumahweb:** Masuk ke **cPanel → Zone Editor** → klik **Manage** pada domain Anda → klik **+ Add Record** → pilih `CNAME` → isi **Name:** `mrs` (atau `mrs.namadomainanda.com.`) dan **Record:** nilai CNAME dari Vercel.
- **Jika domain terhubung ke Cloudflare:** Masuk ke **Cloudflare → DNS → Records** → tambah `CNAME` (`Name: mrs`, `Target:` nilai CNAME dari Vercel) dan ubah **Proxy status** menjadi **DNS only (awan abu-abu)** agar SSL Vercel tidak bentrok.

### 2. Sudah 1 jam lebih di Vercel masih "Invalid Configuration"?
Periksa 3 hal ini:
- Apakah kolom **Host/Name** di Rumahweb tidak sengaja ditulis ganda? (Contoh salah: `mrs.namadomainanda.com.namadomainanda.com`). Solusi: isi `mrs` saja.
- Apakah ada spasi di awal/akhir saat menyalin nilai `CNAME` dari Vercel?
- Apakah ada `A Record` atau `CNAME` lama dengan nama `mrs` yang belum dihapus?

### 3. Muncul peringatan "Situs Tidak Aman" saat pertama kali dibuka?
Itu wajar saat proses penerbitan SSL otomatis baru berjalan. Tunggu **5–15 menit**, lalu buka ulang menggunakan mode Incognito/Samaran di browser.

### 4. Tips Tambahan untuk SEO / Tampilan Share Link (WhatsApp / Media Sosial)
Jika Anda menggunakan subdomain selain `mrs.international.my.id`, Anda juga bisa memperbarui alamat URL pada tag `canonical`, `og:url`, `og:image`, dan `twitter:image` di dalam file `index.html` agar tampilan pratinjau link saat dibagikan di WhatsApp sesuai dengan subdomain baru Anda.
