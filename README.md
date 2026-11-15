# Septian Hutasoit — Portfolio

Website portofolio dengan HTML, CSS, dan JavaScript native. Kode dipisahkan menjadi modul agar konten, komponen, dan animasi dapat dikembangkan secara terpisah. Tahap ini menyiapkan fondasi kode; arah pembaruan UI berdasarkan referensi tersedia di [docs/ui-direction.md](docs/ui-direction.md).

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

Perintah pemeriksaan memvalidasi struktur dan referensi lokal. Pemeriksaan visual serta interaksi tetap perlu dilakukan di browser.

Tiga gambar galeri ChatBot AI Klinik dari data lama belum tersedia. Pemeriksaan akan melaporkannya; modal memakai cover proyek sebagai pengganti.

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
    overlays.css           Modal proyek dan widget Spotify
    animations.css         Keyframe dan animasi reveal
    responsive.css         Penyesuaian ukuran layar
    pages.css              Styling markup halaman
    interactions.css       Styling komponen dinamis, hover, dan reduced motion
  js/
    app.js                 Inisialisasi aplikasi
    data/                  Data proyek dan skill
    components/            Render kartu proyek dan daftar skill
    features/              Navigasi, modal, tema, dan Spotify
    animations/            Kursor, partikel, typewriter, reveal, interaksi
    utils/                 Pemetaan ikon teknologi
  img/                     Foto profil dan gambar proyek
  audio/                   Aset audio
scripts/
  serve.mjs                Server lokal tanpa dependensi
  check.mjs                Pemeriksaan struktur proyek
docs/
  ui-direction.md          Rancangan arah UI dan animasi berikutnya
```

## Mengembangkan portofolio

| Perubahan | Lokasi utama |
| --- | --- |
| Judul, deskripsi, gambar, dan tautan proyek | `assets/js/data/projects.js` |
| Nama, ikon, dan warna skill | `assets/js/data/skills.js` |
| Susunan kartu proyek dan skill | `assets/js/components/` |
| Konten hero, About, dan kontak | `index.html` |
| Warna tema dan styling dasar | `assets/css/base.css` |
| Styling halaman | `assets/css/pages.css` |
| Header dan dock | `assets/css/navigation.css`, `assets/js/features/navigation.js` |
| Galeri dan modal detail proyek | `assets/js/features/modal.js`, `assets/css/overlays.css` |
| Efek dan animasi | `assets/js/animations/`, `assets/css/animations.css` |

Pertahankan jalur gambar sebagai `assets/img/...`, relatif terhadap `index.html`. Tambahkan event listener pada modul fitur; atribut `data-*` menghubungkan markup dengan perilakunya.

Font Plus Jakarta Sans dimuat dari Google Fonts, sementara Font Awesome dan Devicon dimuat melalui CDN. Font dan ikon eksternal memerlukan koneksi internet. Animasi reveal dibuat dengan `IntersectionObserver`, tanpa library AOS; styling menggunakan CSS native, tanpa Tailwind runtime.

## Kontak

[GitHub](https://github.com/Septianhutasoit) · [LinkedIn](https://www.linkedin.com/in/septian-a-hutasoit/) · [Instagram](https://www.instagram.com/tianhts_/) · [Email](mailto:septianhts95@gmail.com)
