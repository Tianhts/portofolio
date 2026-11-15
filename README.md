# Septian Hutasoit — Portfolio

Website portofolio dengan HTML, CSS, dan JavaScript native. UI memakai tema gelap dengan aksen mint, container yang konsisten, grid tech stack, serta halaman detail proyek. Efek masuk blur, animasi dock, dan scroll reveal dipisahkan menjadi modul. Catatan desain tersedia di [docs/ui-direction.md](docs/ui-direction.md).

## Menjalankan secara lokal

Gunakan Node.js 18 atau lebih baru. Tidak ada dependensi npm yang perlu dipasang.

```sh
npm start
```

Buka **http://localhost:4173**. Di PowerShell, gunakan `npm.cmd start` jika kebijakan eksekusi memblokir `npm.ps1`. Alternatifnya, buka folder proyek melalui VS Code Live Server.

Jalankan melalui HTTP karena JavaScript menggunakan ES modules. Membuka `index.html` langsung melalui `file://` tidak didukung.

```sh
npm run check
```

Perintah pemeriksaan memvalidasi struktur, sintaks, import, aset detail proyek, dan server HTTP. Smoke test navigasi memeriksa deep link seluruh proyek, status aktif, history, modifier click, serta dock desktop/mobile. Pemeriksaan visual tetap perlu dilakukan di browser.

Tiga jalur gambar ChatBot AI Klinik dari data lama belum tersedia. Data asli tetap disimpan; halaman detail menggunakan cover yang tersedia. Gambar galeri lain tetap bisa dibuka dalam viewer layar penuh.

## Struktur kode

```text
index.html                 Markup halaman dan elemen interaksi
assets/
  css/
    main.css               Titik masuk stylesheet dan urutan import
    base.css               Variabel tema, reset, dan aturan dasar
    cursor.css             Tampilan kursor khusus
    navigation.css         Header, dock, dan tombol kembali ke atas
    components.css         Kartu proyek, tag, dan tech stack
    hero.css               Elemen visual hero
    overlays.css           Widget Spotify
    animations.css         Keyframe dan animasi reveal
    responsive.css         Penyesuaian ukuran layar
    pages.css              Styling markup halaman
    interactions.css       Styling komponen dinamis, hover, dan reduced motion
    project-detail.css     Halaman studi kasus, galeri, dan viewer gambar
  js/
    app.js                 Inisialisasi aplikasi
    intro-boot.js          Persiapan intro dan fallback visibilitas
    data/                  Data proyek dan skill
    components/            Render kartu proyek dan daftar skill
    features/              Navigasi, detail proyek, tema, dan Spotify
    animations/            Intro blur, dock, kursor, typewriter, reveal, interaksi
    utils/                 Pemetaan ikon teknologi
  img/                     Foto profil dan gambar proyek
  audio/                   Aset audio
scripts/
  serve.mjs                Server lokal tanpa dependensi
  check.mjs                Pemeriksaan struktur proyek
  navigation-smoke.mjs     Pengujian perilaku navigasi tanpa dependensi browser
docs/
  ui-direction.md          Catatan UI dan perilaku animasi
```

## Mengembangkan portofolio

| Perubahan | Lokasi utama |
| --- | --- |
| Judul, deskripsi, gambar, dan tautan proyek | `assets/js/data/projects.js` |
| Masalah, pendekatan, highlight, dan susunan galeri proyek | `assets/js/data/project-details.js` |
| Nama, ikon, dan warna skill | `assets/js/data/skills.js` |
| Susunan kartu proyek dan skill | `assets/js/components/` |
| Konten hero, About, dan kontak | `index.html` |
| Daftar foto yang dapat diganti pada About | `assets/js/data/profile.js` |
| Warna tema dan styling dasar | `assets/css/base.css` |
| Styling halaman | `assets/css/pages.css` |
| Header dan dock | `assets/css/navigation.css`, `assets/js/features/navigation.js` |
| Halaman detail dan viewer galeri | `assets/js/features/project-detail.js`, `assets/css/project-detail.css` |
| Efek dan animasi | `assets/js/animations/`, `assets/css/animations.css` |

Pertahankan jalur gambar sebagai `assets/img/...`, relatif terhadap `index.html`. Tambahkan event listener pada modul fitur; atribut `data-*` menghubungkan markup dengan perilakunya.

Foto About berbentuk lingkaran dan memakai dua gambar yang terdaftar di `assets/js/data/profile.js`: `assets/img/profile.jpg` dan `assets/img/profile.png`. Klik atau tekan Enter/Space pada foto About untuk berganti bolak-balik dengan flip singkat; tidak ada pergantian otomatis. Untuk menambah foto lagi, simpan gambarnya dan tambahkan entri pada daftar tersebut. Jika gambar berikutnya gagal dimuat, foto saat ini tetap terlihat. Foto beranda tetap memakai `profile.jpg`.

Navigasi memakai hash `#home`, `#projects`, `#about`, dan `#project/<slug>`, sehingga tautan detail bisa dibagikan dan tombol Back/Forward browser tetap berfungsi. Slug berasal dari nama proyek. `initProjectDetail()` dipanggil sebelum `initNavigation()` agar detail dapat dibuka langsung dari URL.

Konten dibatasi maksimal 800 px dan berada di tengah. Home dan Semua Proyek memakai dua kartu per baris pada desktop dan tablet agar kartu lebih lega. Enam proyek beranda menjadi tiga baris, sedangkan delapan proyek lengkap menjadi empat baris. Mobile memakai satu kartu per baris.

Tech stack merender seluruh data sekali dalam grid delapan kolom desktop, enam kolom tablet, dan empat/tiga kolom pada layar kecil. Kotak ikon berukuran 64 px dan label berada di bawahnya. Widget Spotify dan seluruh tautan kontak tetap tersedia pada footer.

Widget musik menggunakan embed resmi **Fix You — Coldplay**. Tekan **Buka pemutar**, lalu Play pada kontrol Spotify. Iframe dimuat hanya saat pertama dibuka dan dipertahankan ketika panel disembunyikan agar posisi pemutaran tidak direset. Gunakan kontrol Pause untuk menghentikan musik; tombol **Tutup panel** hanya menyembunyikan panel. Tautan **Buka di Spotify** selalu tersedia. Ketersediaan pemutaran penuh mengikuti akses Spotify dan dukungan browser.

Intro berjalan setelah struktur aplikasi siap dengan stagger singkat. Fallback 1,8 detik menjaga konten tetap terlihat bila modul gagal dimuat. Animasi menghormati `prefers-reduced-motion`; pembesaran dock hanya aktif pada pointer yang sesuai.

Font Plus Jakarta Sans dimuat dari Google Fonts, sementara Font Awesome dan Devicon dimuat melalui CDN. Font dan ikon eksternal memerlukan koneksi internet. Animasi reveal dibuat dengan `IntersectionObserver`, tanpa library AOS; styling menggunakan CSS native, tanpa Tailwind runtime.

## Kontak

[GitHub](https://github.com/Septianhutasoit) · [LinkedIn](https://www.linkedin.com/in/septian-a-hutasoit/) · [Instagram](https://www.instagram.com/tianhts_/) · [Email](mailto:septianhts95@gmail.com)
