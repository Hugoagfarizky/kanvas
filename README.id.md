<div align="center">

# Kanvas

**Rencana, orat-oret & ide dalam satu kanvas tak terbatas.**

Ruang kerja gratis dan open source untuk menyusun rencana, mencatat kasar, dan brainstorming.
Tanpa akun. Tanpa cloud. Semua tersimpan di browser kamu.

[Demo](https://hugoagfarizky.github.io/kanvas/) · [Roadmap](ROADMAP.md) · [Kontribusi](CONTRIBUTING.md)

</div>

> Antarmuka aplikasi berbahasa Inggris. Dokumen ini menjelaskan proyek dalam bahasa Indonesia.

## Fitur & Alat di Kanvas

Kanvas menyediakan ruang kerja tak terbatas untuk curah ide (*brainstorming*), sketsa, perencanaan tugas, dan pemetaan sistem. Semua alat mudah diakses melalui floating dock di bagian atas tengah kanvas, menu klik kanan, atau shortcut keyboard.

### 1. Navigasi & Tampilan Kanvas
* **Select Tool (`V`)**: Memilih, memindahkan, mengubah ukuran (*resize*), dan memutar (*rotate*) node/objek.
* **Pan / Hand Tool (`H`)**: Menggeser dan menjelajahi area kanvas tanpa khawatir sengaja memilih atau mengubah posisi objek.
* **Marquee Selection (`Shift + Drag`)**: Tarik area seleksi kotak untuk memilih banyak objek sekaligus.
* **Zoom Controls (`+`, `-`, `0`)**: Zoom in, zoom out, atau tekan `0` untuk mencocokkan seluruh isi kanvas ke layar (*fit to screen*).
* **MiniMap**: Peta mini di sudut kanan bawah untuk navigasi cepat dan melihat keseluruhan area board.

### 2. Objek & Komponen Kanvas
* **Sticky Note (`N`)**: Catatan tempel berwarna untuk curah gagasan (*brainstorming*) dan catatan cepat. Warna teks otomatis menghitung kontras optimal (standar WCAG) terhadap warna kartu.
* **Teks Bebas (`T`)**: Teks tanpa bingkai untuk judul diagram, label, alur kerja, atau keterangan bebas. Warna teks otomatis menyesuaikan mode terang (*Light*) dan gelap (*Dark*).
* **Daftar Tugas / Task Checklist**: Kartu daftar tugas interaktif lengkap dengan checkbox (centang selesai), penambahan item baru otomatis dengan tombol `Enter`, dan tombol hapus item.
* **Bentuk Geometri / Shapes**: Persegi, kotak membulat, lingkaran/elips, dan belah ketupat (*diamond*) dengan label teks di tengahnya untuk flowchart, alur data, atau arsitektur sistem.
* **Frame Pengelompokan**: Kotak wadah bergaris putus-putus dengan judul untuk membagi kanvas menjadi zona kerja (contoh: *Now / Next / Later* atau *Senin / Rabu / Jumat*).
* **Gambar (Upload Perangkat, Drag & Drop, Paste)**:
  * **Upload dari Komputer**: Klik tombol atau ikon upload untuk memilih file gambar dari perangkat.
  * **Drag & Drop**: Tarik file gambar langsung dari File Explorer komputer dan jatuhkan (*drop*) di area kanvas mana saja.
  * **Paste Clipboard (`Ctrl + V`)**: Salin tangkapan layar (*screenshot*) atau gambar dari aplikasi lain dan tempel langsung ke kanvas.
  * **Kontrol Gambar**: Arahkan kursor (*hover*) pada gambar untuk mengganti file, menghapus, atau mengatur mode tampilan (*Fit/Contain* agar tidak terpotong vs *Cover* memenuhi bingkai).

### 3. Menggambar Bebas & Konektor
* **Pena Bebas / Pen Tool (`P`)**: Menggambar sketsa dan coretan bebas yang halus dengan algoritma `perfect-freehand`. Dilengkapi palet warna tinta (adaptif tema, slate, biru, hijau, oranye, merah, ungu) dan pilihan ketebalan goresan (*Fine*, *Normal*, *Broad*).
* **Stabilo / Highlighter Tool**: Stabilo transparan untuk menandai atau menyoroti teks dan area penting dengan warna neon cerah (Kuning, Hijau, Cyan, Pink, Oranye).
* **Penghapus Cerdas / Eraser Tool (`E`)**: Penghapus berbasis geometri yang menghapus segmen garis yang tersentuh tanpa merusak node atau gambar di bawahnya.
* **Garis Konektor / Connectors**: Tarik garis dari titik handle bulat di sisi node untuk menghubungkannya ke node lain. Double-click pada garis untuk menambahkan label teks alur.

### 4. Panel Gaya (Inspector) & Perataan
* **Style Inspector Panel**: Terletak rapi di kanan atas (tidak menutupi MiniMap). Menyediakan palet warna 1-klik yang dijamin kontras, pemilih warna kustom (*Fill*, *Stroke*, *Text*), ukuran font, switcher bentuk geometri, dan pengatur rotasi.
* **Align & Distribute Toolbar**: Otomatis muncul saat memilih 2 node atau lebih. Meratakan posisi (Rata Kiri, Tengah, Kanan, Atas, Tengah Vertikal, Bawah) dan mendistribusikan jarak antar-node secara merata.

### 5. Riwayat, Shortcut & Persistensi
* **Riwayat 50 Langkah (`Ctrl + Z` / `Ctrl + Y`)**: Membatalkan (*undo*) atau mengulang (*redo*) perubahan secara konsisten.
* **Manajemen Clipboard (`Ctrl + C`, `Ctrl + V`, `Ctrl + D`, `Del`)**: Salin, tempel, duplikasi, dan hapus elemen dengan cepat.
* **Daftar Shortcut Keyboard (`?` / Ikon Keyboard Header)**: Modal panduan tombol cepat untuk melihat seluruh shortcut platform.
* **Local-First & Offline**: Semua data tersimpan otomatis di IndexedDB browser Anda tanpa server, tanpa pelacakan, dan dapat diakses offline (PWA).
* **Ekspor & Backup**: Ekspor board ke gambar PNG resolusi tinggi (dengan latar belakang yang menyesuaikan tema) dan ekspor/impor cadangan JSON.

## Status

Kanvas masih tahap awal. **M0 selesai**, dan ruang kerja lokal sudah mendukung beberapa fitur yang
sebelumnya direncanakan di milestone berikutnya: pencarian board, duplikasi, import/export JSON
dengan undo hapus, sistem toast, error boundary, dan penggunaan offline sebagai PWA. **M4 konektor dan ink juga sudah jalan**: konektor berlabel dengan menyeret antar handle node (double-click
untuk label), plus pena, highlighter, dan penghapus dengan goresan perfect-freehand serta penghapus
berbasis geometri. Kanvas kini mendukung loop M1-M4 — lihat [ROADMAP.md](ROADMAP.md) untuk M5+
(polesan persistensi dan template).

![Demo Kanvas](docs/demo.gif)

## Menjalankan secara lokal

Butuh Node.js 22+ (disarankan 24) dan npm 10+.

```bash
git clone https://github.com/Hugoagfarizky/kanvas.git
cd kanvas
npm install
npm run dev
```

Buka <http://localhost:5173>.

| Perintah           | Fungsi                          |
| ------------------ | ------------------------------- |
| `npm run dev`      | Server pengembangan             |
| `npm run build`    | Typecheck lalu build ke `dist/` |
| `npm run lint`     | ESLint                          |
| `npm test`         | Unit test                       |
| `npm run test:e2e` | Smoke test Playwright           |
| `npm run format`   | Format dengan Prettier          |

## Privasi

Tidak ada backend. Board tersimpan di IndexedDB browser dengan nama database `kanvas`. Menghapus data
situs akan menghapus board, jadi ekspor backup JSON dari header board saat ingin menyimpannya.
Board dapat diimpor lagi dari dashboard.

## Kontribusi

Semua bentuk kontribusi diterima: kode, dokumentasi, terjemahan, laporan bug, dan ide template.
Baca [CONTRIBUTING.md](CONTRIBUTING.md), lalu cari issue berlabel `good first issue`.

## Lisensi

[MIT](LICENSE) © 2026 Hugo Agfarizky
