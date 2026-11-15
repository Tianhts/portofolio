// Case-study content expands only on features already listed in projects.js.
// Keep personal, business, and performance claims out until verified details are available.
export function projectSlug(project) {
  return project.name.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const projectDetails = [
  {
    eyebrow: 'Healthcare · Web application',
    problem: 'Informasi klinik, jadwal dokter, dan permintaan janji temu perlu tersusun dalam satu pengalaman yang mudah ditelusuri oleh pasien.',
    approach: 'Website menyatukan informasi layanan dengan alur booking. Pengelolaan dokter dan jadwal membantu menyajikan informasi yang berkaitan dengan kebutuhan pasien.',
    highlights: ['Booking dan janji temu pasien', 'Manajemen dokter dan jadwal', 'Informasi layanan serta testimoni pasien'],
    architecture: [
      ['Laravel', 'Fondasi aplikasi web dan pengelolaan alur klinik.'],
      ['MySQL', 'Penyimpanan data aplikasi.'],
      ['Tailwind & REST API', 'Antarmuka web dan pertukaran data antarbagian aplikasi.'],
    ],
  },
  {
    eyebrow: 'Commerce · Web application',
    problem: 'Pembelian online melibatkan katalog, keranjang, dan persediaan. Bagian-bagian tersebut perlu saling terhubung agar pengguna dapat mengikuti alur belanja dengan jelas.',
    approach: 'Platform menyediakan manajemen produk, keranjang real-time, dan sistem barcode untuk mendukung pengelolaan stok dalam aplikasi e-commerce.',
    highlights: ['Manajemen katalog produk', 'Keranjang belanja real-time', 'Barcode untuk pengelolaan persediaan'],
    architecture: [
      ['Laravel', 'Fondasi aplikasi e-commerce dan manajemen produk.'],
      ['MySQL', 'Penyimpanan data produk dan aplikasi.'],
      ['Tailwind CSS & REST API', 'Antarmuka web dan integrasi data.'],
    ],
  },
  {
    eyebrow: 'Culture · Education',
    problem: 'Materi pengenalan Aksara Batak perlu mudah dijangkau oleh pembaca dengan latar bahasa yang berbeda, sekaligus tetap berfokus pada pelestarian budaya.',
    approach: 'Website edukasi menyajikan informasi Aksara Batak dengan dukungan multi-bahasa, sehingga pengunjung dapat menjelajahi materi dan konteks budayanya.',
    highlights: ['Materi edukasi Aksara Batak', 'Dukungan multi-bahasa', 'Informasi untuk pelestarian budaya Batak'],
    architecture: [
      ['Laravel & PHP', 'Fondasi pengembangan website edukasi.'],
      ['MySQL', 'Penyimpanan data website.'],
    ],
  },
  {
    eyebrow: 'Healthcare · Digital companion',
    problem: 'Pasien pasca operasi membutuhkan informasi dan pendampingan yang mudah dijangkau dalam format digital.',
    approach: 'Kawan Pulih menyediakan platform informasi dan pendampingan digital untuk membantu pengguna menelusuri kebutuhan informasi setelah operasi.',
    highlights: ['Informasi untuk pasien pasca operasi', 'Pendampingan dalam platform digital', 'Antarmuka web yang dapat diakses melalui browser'],
    architecture: [
      ['Next.js', 'Fondasi antarmuka dan aplikasi web.'],
      ['Tailwind', 'Styling antarmuka pengguna.'],
    ],
  },
  {
    eyebrow: 'Commerce · Full-stack application',
    problem: 'Alur pembelian online memerlukan akses pengguna, pengelolaan produk, dan keranjang belanja yang terorganisasi dalam satu aplikasi.',
    approach: 'Aplikasi menggabungkan autentikasi, manajemen produk, dan keranjang belanja sebagai bagian dari pengalaman pembelian online.',
    highlights: ['Autentikasi pengguna', 'Manajemen produk', 'Keranjang belanja online'],
    architecture: [
      ['React.js', 'Antarmuka pengguna aplikasi.'],
      ['Node.js', 'Fondasi pengembangan backend.'],
      ['PostgreSQL', 'Penyimpanan data aplikasi.'],
    ],
  },
  {
    eyebrow: 'Applied AI · Healthcare',
    problem: 'Pertanyaan seputar klinik dan kebutuhan booking menjadi bagian dari interaksi awal pasien sebelum memperoleh layanan.',
    approach: 'Chatbot AI dirancang untuk menjawab pertanyaan pasien dan membantu proses booking pada konteks klinik gigi.',
    highlights: ['Percakapan AI untuk pertanyaan pasien', 'Bantuan alur booking', 'Konteks layanan klinik gigi'],
    architecture: [
      ['Next.js & Node.js', 'Bagian dari stack aplikasi web.'],
      ['Python & FastAPI', 'Bagian dari stack backend dan integrasi AI.'],
    ],
    // The three legacy gallery paths are unavailable; the real cover is shown once.
    gallery: [],
  },
  {
    eyebrow: 'Applied AI · Workflow automation',
    problem: 'Tiket support perlu ditinjau berdasarkan urgensi dan tingkat keparahannya. Hasil klasifikasi juga perlu dapat ditelusuri melalui dashboard dan log.',
    approach: 'Cohere Command-R digunakan untuk klasifikasi urgency, severity score, dan reasoning. Dashboard real-time, system logging, serta workflow n8n menyatukan hasilnya dalam alur triase.',
    highlights: ['Klasifikasi urgency dan severity berbasis AI', 'Reasoning logis untuk hasil klasifikasi', 'Dashboard real-time dan system logging', 'Workflow automation dengan n8n'],
    architecture: [
      ['Next.js & TypeScript', 'Antarmuka dashboard dan aplikasi web.'],
      ['FastAPI & Cohere AI', 'Backend dan klasifikasi tiket berbasis model AI.'],
      ['MySQL, n8n & Docker', 'Penyimpanan data, automasi workflow, dan stack pendukung aplikasi.'],
    ],
  },
  {
    eyebrow: 'Healthcare · RAG AI · Automation',
    problem: 'Informasi klinik, dashboard pengguna, automasi workflow, dan percakapan AI perlu terhubung agar respons chatbot tetap berkaitan dengan konteks klinik.',
    approach: 'Sistem menggabungkan dashboard Next.js, backend FastAPI, database NeonCloud, workflow n8n, dan pipeline RAG untuk memberikan respons AI berdasarkan konteks klinik.',
    highlights: ['Dashboard pengguna untuk sistem klinik', 'Chatbot berbasis Retrieval-Augmented Generation', 'Automasi workflow dengan n8n', 'Database serverless NeonCloud'],
    architecture: [
      ['Next.js & TypeScript', 'Dashboard dan antarmuka pengguna.'],
      ['FastAPI & RAG AI', 'Backend dan pipeline respons berbasis konteks.'],
      ['NeonCloud & n8n', 'Database serverless dan automasi workflow.'],
    ],
  },
];
