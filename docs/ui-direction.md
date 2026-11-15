# Arah UI portofolio

Dokumen ini mencatat UI yang diterapkan berdasarkan gambar referensi. Konten tetap menggunakan identitas Septian Hutasoit dan data proyek yang tersedia. Home, Projects, About, detail proyek, grid tech stack, dock, serta intro blur sudah diimplementasikan.

## Karakter visual

Pertahankan identitas **Septian Hutasoit**, foto, proyek, serta tautan yang sudah ada. Gunakan referensi sebagai panduan komposisi dan gerak.

| Elemen | Arah desain |
| --- | --- |
| Latar | Hampir hitam, `#0c0f11` |
| Permukaan | Abu gelap, `#191e24`, garis pembatas tipis |
| Aksen | Hijau terang, `#4ade80`, untuk status aktif dan aksi utama |
| Tipografi | Plus Jakarta Sans; judul kuat, paragraf lega, metadata lebih tenang |
| Lebar konten | Maksimal 800 px, rata tengah dengan ruang kiri–kanan seimbang; header dan detail proyek mengikuti batas yang sama |
| Bentuk | Kartu dan navigasi bersudut membulat, bayangan ringan |
| Kepadatan | Ruang antarseksi lebih luas dengan hierarki judul yang konsisten |

Token aktif ada di `assets/css/base.css`: latar `#0c0f11`, permukaan `#191e24`, aksen `#4ade80`, dan lebar konten 800 px. Margin minimum mengikuti token `--page-gutter`: 32 px pada desktop, 20 px pada mobile, dan 16 px pada layar paling kecil. Tema terang tetap tersedia melalui tombol tema.

## Susunan halaman

**Home:** header dengan Home, Projects, dan About; foto, nama, peran, lokasi, serta status ketersediaan; ringkasan About; bidang proyek yang dikerjakan; tech stack; proyek pilihan; kontak. Bagian bidang proyek bersumber dari proyek yang tersedia, tanpa menambahkan riwayat pekerjaan atau pendidikan.

**Projects:** pembuka singkat dan grid kartu. Setiap kartu menampilkan gambar, nama proyek, ringkasan, serta tag teknologi. Desktop memakai tiga kolom: enam proyek beranda menjadi dua baris, dan delapan proyek lengkap menjadi tiga baris (3 + 3 + 2). Tablet memakai dua kolom dan mobile satu kolom. Kartu membuka halaman detail dengan hash tersendiri.

**Detail proyek:** tautan kembali, judul, aksi Visit Website dan Source Code saat tautannya tersedia, gambar utama, Overview, Gallery, The Problem, How I Built It, dan Tech Stack. Daftar isi menempel di kanan pada desktop. Galeri memiliki thumbnail, navigasi gambar, penghitung, dan viewer layar penuh dengan Escape, tombol panah, serta pengelolaan fokus keyboard.

**About:** judul halaman, foto potret, bio, bidang yang ditekuni, dan prinsip membangun produk. Data pribadi, pengalaman, dan pendidikan dari pemilik website referensi tidak dipindahkan ke portofolio.

## Navigasi dan tombol

Header mengambang menyediakan navigasi teks saat halaman berada di atas. Dock muncul ketika pengguna menggulir dan selalu tersedia pada layar kecil; status halaman aktif konsisten. Lingkaran ikon membesar berdasarkan jarak pointer dengan interpolasi halus, sementara area klik dan tooltip tetap stabil.

Tombol utama memakai aksen mint dengan teks gelap. Tombol sekunder memakai permukaan gelap dan garis tipis. Hover mengubah warna atau bayangan serta mengangkat tombol sekitar 2 px; keadaan tekan mengecilkan tombol sedikit. Fokus keyboard tetap terlihat. Area sentuh ditargetkan minimal 44 × 44 px.

## Bahasa animasi

Saat pertama masuk, kelompok konten di area pandang bergerak dari blur 12 px menjadi jernih selama 780 ms, dengan stagger 95 ms. Pergantian halaman memakai versi yang lebih singkat. Konten tetap terlihat jika JavaScript animasi tidak tersedia, dengan fallback pembuka 1,8 detik. Blur diterapkan pada kelompok konten dan tidak membungkus navigasi fixed.

| Interaksi | Durasi usulan | Perilaku |
| --- | --- | --- |
| Hover dan tekan tombol | 180–240 ms | Gerak kecil, perubahan warna dan bayangan |
| Pembesaran ikon dock | 250–350 ms | Skala dan pergeseran lembut tanpa mengubah alur layout |
| Tooltip | 150–200 ms | Opacity dan pergeseran pendek |
| Reveal konten | 500–650 ms | Fade dengan perpindahan vertikal sekitar 12–20 px |
| Modal atau panel | 250–350 ms | Fade dan skala ringan |

Gunakan easing bersama `cubic-bezier(.22, 1, .36, 1)`. Utamakan animasi `transform` dan `opacity`; batasi efek yang terus berjalan. Hover diterapkan pada perangkat yang mendukung pointer, sedangkan sentuhan mendapat respons tekan. Hormati `prefers-reduced-motion` dengan menonaktifkan gerak dekoratif dan menampilkan konten langsung.

## Pengembangan berikutnya

Riwayat pekerjaan dan pendidikan dapat ditambahkan setelah data tersedia. Pemeriksaan visual di browser tetap diperlukan untuk menilai proporsi, kelancaran gerak, dan kontras pada perangkat sebenarnya. Pemeriksaan otomatis yang tersedia mencakup struktur, aset, server HTTP, dan perilaku navigasi.
