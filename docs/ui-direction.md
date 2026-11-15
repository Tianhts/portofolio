# Arah UI portofolio

Dokumen ini adalah rancangan tahap berikutnya berdasarkan gambar referensi. Modularisasi kode dikerjakan lebih dahulu. Susunan dan efek yang dijelaskan di sini belum merupakan hasil redesign yang sudah diterapkan.

## Karakter visual

Pertahankan identitas **Septian Hutasoit**, foto, proyek, serta tautan yang sudah ada. Gunakan referensi sebagai panduan komposisi dan gerak.

| Elemen | Arah desain |
| --- | --- |
| Latar | Hampir hitam, usulan `#0c0f11` |
| Permukaan | Abu gelap, usulan `#191e24`, garis pembatas tipis |
| Aksen | Mint, usulan `#62efbc`, untuk status aktif dan aksi utama |
| Tipografi | Plus Jakarta Sans; judul kuat, paragraf lega, metadata lebih tenang |
| Lebar konten | Sekitar 1.080–1.152 px pada desktop, padding adaptif pada mobile |
| Bentuk | Kartu dan navigasi bersudut membulat, bayangan ringan |
| Kepadatan | Ruang antarseksi lebih luas dengan hierarki judul yang konsisten |

Warna tersebut merupakan usulan token untuk tahap UI. Token tema saat ini dapat disesuaikan lewat `assets/css/base.css` setelah arah visual ditetapkan.

## Susunan halaman

**Home:** header dengan Home, Projects, dan About; hero berisi foto, nama, peran, lokasi, serta status ketersediaan; ringkasan About; pengalaman; tech stack; proyek pilihan; kontak. Isi pengalaman dan pendidikan memakai data yang benar-benar tersedia.

**Projects:** pembuka singkat dan grid kartu. Setiap kartu menampilkan gambar, nama proyek, ringkasan, dan tag teknologi. Desktop memakai dua kolom yang lega; mobile memakai satu kolom. Modal yang ada tetap menjadi fondasi detail proyek sampai halaman studi kasus dibuat.

**Detail proyek, tahap lanjutan:** tautan kembali, judul, aksi Visit Website dan Source, gambar utama, Overview, Gallery, Problem, Solution, dan Tech Stack. Daftar isi menempel di sisi kanan pada desktop dan disederhanakan pada mobile. Aksi ditampilkan hanya saat tautan tersedia.

**About:** judul halaman, foto potret, bio, bidang yang ditekuni, tech stack, serta lini masa pengalaman dan pendidikan. Data pribadi pada gambar referensi tidak dipindahkan ke portofolio.

## Navigasi dan tombol

Header mengambang menyediakan navigasi teks saat halaman berada di atas. Dock ikon muncul ketika pengguna menggulir; status halaman aktif konsisten di kedua navigasi. Dock memberi pembesaran halus pada ikon yang diarahkan pointer dan tooltip yang terbaca, dengan jarak aman dari tepi layar.

Tombol utama memakai aksen mint dengan teks gelap. Tombol sekunder memakai permukaan gelap dan garis tipis. Hover mengubah warna atau bayangan serta mengangkat tombol sekitar 2 px; keadaan tekan mengecilkan tombol sedikit. Fokus keyboard tetap terlihat. Area sentuh ditargetkan minimal 44 × 44 px.

## Bahasa animasi

| Interaksi | Durasi usulan | Perilaku |
| --- | --- | --- |
| Hover dan tekan tombol | 180–240 ms | Gerak kecil, perubahan warna dan bayangan |
| Pembesaran ikon dock | 250–350 ms | Skala dan pergeseran lembut tanpa mengubah alur layout |
| Tooltip | 150–200 ms | Opacity dan pergeseran pendek |
| Reveal konten | 500–650 ms | Fade dengan perpindahan vertikal sekitar 12–20 px |
| Modal atau panel | 250–350 ms | Fade dan skala ringan |

Gunakan easing bersama `cubic-bezier(.22, 1, .36, 1)`. Utamakan animasi `transform` dan `opacity`; batasi efek yang terus berjalan. Hover diterapkan pada perangkat yang mendukung pointer, sedangkan sentuhan mendapat respons tekan. Hormati `prefers-reduced-motion` dengan menonaktifkan gerak dekoratif dan menampilkan konten langsung.

## Urutan pengembangan

1. Selesaikan pemisahan data, styling, fitur, dan animasi; verifikasi fitur lama.
2. Terapkan token warna, tipografi, container, dan jarak antarelemen.
3. Perbarui header, dock, serta tombol sebagai komponen bersama.
4. Susun Home, Projects, dan About memakai konten Septian.
5. Tambahkan halaman detail proyek dan informasi pengalaman setelah datanya tersedia.
6. Periksa responsivitas, keyboard, kontras, reduced motion, dan kelancaran animasi di browser.
