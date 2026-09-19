export const DAFTAR_KELAS = [
  '1A', '1B', '1C', '1D',
  '2A', '2B', '2C', '2D',
  '3A', '3B', '3C', '3D', '3E',
  '4A', '4B', '4C', '4D', '4E',
  '5A', '5B', '5C', '5D', '5E',
  '6A', '6B', '6C', '6D', '6E'
] as const;

export const WALI_KELAS_MAP: Record<string, string> = {
  // Kelas 1 (4 Rombel)
  '1A': 'Siti Rahmawati, S.Pd.',
  '1B': 'Nurul Hidayah, S.Pd.SD.',
  '1C': 'Dewi Sartika, S.Pd.',
  '1D': 'Anisa Kusuma Wardani, S.Pd.',
  
  // Kelas 2 (4 Rombel)
  '2A': 'Agus Prasetyo, S.Pd.',
  '2B': 'Dwi Astuti, S.Pd.',
  '2C': 'Budi Santoso, S.Pd.SD.',
  '2D': 'Retno Wulandari, S.Pd.',

  // Kelas 3 (5 Rombel)
  '3A': 'Bambang Sugeng, S.Pd.SD.',
  '3B': 'Rina Kusuma Dewi, S.Pd.',
  '3C': 'Surya Dharma, S.Pd.',
  '3D': 'Fitria Rahayu, S.Pd.',
  '3E': 'Hendra Setiawan, S.Pd.',

  // Kelas 4 (5 Rombel)
  '4A': 'H. Moch. Taufik, M.Pd.',
  '4B': 'Endang Sri Wahyuni, S.Pd.',
  '4C': 'Yuni Kartika Sari, S.Pd.',
  '4D': 'Aris Munandar, S.Pd.',
  '4E': 'Maya Anggraini, S.Pd.',

  // Kelas 5 (5 Rombel)
  '5A': 'Ahmad Fauzi, S.Pd.I.',
  '5B': 'Sri Wahyuningtyas, S.Pd.',
  '5C': 'M. Ilham Wahyudi, S.Pd.',
  '5D': 'Nur Aini Zahra, S.Pd.',
  '5E': 'Eko Prasetyo, S.Pd.',

  // Kelas 6 (5 Rombel)
  '6A': 'Drs. Tri Wahyono',
  '6B': 'Lilik Setyowati, S.Pd.',
  '6C': 'Wahyu Hidayat, S.Pd.',
  '6D': 'Tri Retnaningsih, S.Pd.',
  '6E': 'Sugeng Priyanto, M.Pd.'
};

export const WALI_KELAS_NIP_MAP: Record<string, string> = {
  // Kelas 1 (4 Rombel)
  '1A': '19840512 200902 2 006',
  '1B': '19820718 200801 2 011',
  '1C': '19900325 201403 2 003',
  '1D': '19931109 201903 2 014',

  // Kelas 2 (4 Rombel)
  '2A': '19790814 200604 1 009',
  '2B': '19860421 201001 2 018',
  '2C': '19811205 200701 1 015',
  '2D': '19880916 201101 2 007',

  // Kelas 3 (5 Rombel)
  '3A': '19760310 199903 1 004',
  '3B': '19870615 201101 2 012',
  '3C': '19850228 200903 1 008',
  '3D': '19910804 201502 2 005',
  '3E': '19890120 201204 1 010',

  // Kelas 4 (5 Rombel)
  '4A': '19690412 199308 1 002',
  '4B': '19780529 200312 2 004',
  '4C': '19881007 201402 2 009',
  '4D': '19830319 200801 1 013',
  '4E': '19920517 201708 2 006',

  // Kelas 5 (5 Rombel)
  '5A': '19800723 200501 1 007',
  '5B': '19751104 200212 2 003',
  '5C': '19840911 201001 1 016',
  '5D': '19940214 202012 2 008',
  '5E': '19860630 201101 1 011',

  // Kelas 6 (5 Rombel)
  '6A': '19670514 199203 1 005',
  '6B': '19740922 199803 2 002',
  '6C': '19830115 200801 1 017',
  '6D': '19770808 200501 2 006',
  '6E': '19710319 199602 1 003'
};

export const AGAMA_OPTIONS = [
  'Islam',
  'Kristen',
  'Katolik',
  'Hindu',
  'Buddha',
  'Konghucu',
  'Lainnya'
] as const;

// 16 Lokasi Kejadian persis sesuai instruksi prompt:
export const LOKASI_KEJADIAN_LIST = [
  'Ruang Kelas',
  'Teras',
  'Lapangan',
  'Perpustakaan',
  'UKS',
  'Kantin',
  'Mushola',
  'Toilet',
  'Ruang Guru',
  'Ruang Kepala Sekolah',
  'Tata Usaha',
  'Gerbang',
  'Area Parkir',
  'Serbaguna',
  'Ekstrakurikuler',
  'Laboratorium'
] as const;

// 5 Aktivitas Saat Pelanggaran persis sesuai instruksi prompt:
export const AKTIVITAS_PELANGGARAN_LIST = [
  'Upacara',
  'Istirahat',
  'Jam Pelajaran',
  'Ekstrakurikuler',
  'Kegiatan Luar Sekolah resmi'
] as const;

export const TINDAK_LANJUT_OPTIONS = [
  'Teguran Lisan & Refleksi Mandiri',
  'Peringatan Tertulis di Buku Saku Disiplin',
  'Pembinaan Khusus oleh Wali Kelas',
  'Konseling Edukatif Tim TPPK & Guru BK',
  'Surat Peringatan 1 (SP 1)',
  'Surat Peringatan 2 (SP 2)',
  'Pemanggilan Orang Tua / Wali Murid ke Sekolah',
  'Kesepakatan Perjanjian Khusus & Pendampingan Karakter'
];

export interface StandardPelanggaranRef {
  nama: string;
  kategori: 'Ringan' | 'Sedang' | 'Berat';
  poin: number;
}

export const REFERENSI_PELANGGARAN: StandardPelanggaranRef[] = [
  // Ringan
  { nama: 'Terlambat masuk sekolah (< 15 menit)', kategori: 'Ringan', poin: 5 },
  { nama: 'Seragam tidak rapi / atribut tidak lengkap', kategori: 'Ringan', poin: 5 },
  { nama: 'Tidak memakai topi/dasi saat upacara bendera', kategori: 'Ringan', poin: 5 },
  { nama: 'Kaos kaki atau sepatu tidak sesuai tata tertib', kategori: 'Ringan', poin: 5 },
  { nama: 'Membuang sampah tidak pada tempatnya', kategori: 'Ringan', poin: 10 },
  { nama: 'Makan / minum saat pembelajaran tanpa izin', kategori: 'Ringan', poin: 5 },
  { nama: 'Tidur saat kegiatan belajar mengajar berlangsung', kategori: 'Ringan', poin: 5 },
  { nama: 'Tidak melaksanakan piket kebersihan kelas', kategori: 'Ringan', poin: 5 },
  { nama: 'Bermain di area terlarang (area parkir/gerbang)', kategori: 'Ringan', poin: 10 },
  
  // Sedang
  { nama: 'Meninggalkan kelas / membolos jam pelajaran', kategori: 'Sedang', poin: 15 },
  { nama: 'Mengucapkan kata kasar / mengejek teman', kategori: 'Sedang', poin: 15 },
  { nama: 'Mencontek saat ulangan / asesmen sumatif', kategori: 'Sedang', poin: 20 },
  { nama: 'Membawa barang terlarang (mainan/gadget tanpa izin)', kategori: 'Sedang', poin: 15 },
  { nama: 'Cekcok mulut / pertengkaran yang mengganggu kelas', kategori: 'Sedang', poin: 20 },
  { nama: 'Mencoret meja, kursi, atau dinding fasilitas sekolah', kategori: 'Sedang', poin: 25 },
  { nama: 'Berkelahi / kontak fisik ringan sesama siswa', kategori: 'Sedang', poin: 25 },
  { nama: 'Membolos dari sekolah tanpa keterangan sah', kategori: 'Sedang', poin: 20 },

  // Berat
  { nama: 'Perundungan / Bullying verbal maupun pengucilan', kategori: 'Berat', poin: 50 },
  { nama: 'Tindakan kekerasan fisik yang melukai teman', kategori: 'Berat', poin: 75 },
  { nama: 'Pemalakan / meminta uang/barang teman secara paksa', kategori: 'Berat', poin: 50 },
  { nama: 'Mencuri / mengambil barang orang lain tanpa hak', kategori: 'Berat', poin: 75 },
  { nama: 'Membawa senjata tajam atau benda membahayakan', kategori: 'Berat', poin: 100 },
  { nama: 'Merusak fasilitas sekolah hingga rusak berat', kategori: 'Berat', poin: 50 }
];

export interface StandardRewardRef {
  nama: string;
  kategori: 'Prestasi' | 'Afektif' | 'Teladan';
  tingkat: 'Sekolah' | 'Kecamatan' | 'Kota' | 'Provinsi' | 'Nasional' | 'Harian';
  poin: number;
  bonusNilaiMapel: number;
  rekomendasiMapel: string;
}

export const REFERENSI_REWARD: StandardRewardRef[] = [
  // Prestasi
  {
    nama: 'Juara 1 Lomba OSN / FLS2N / O2SN Tingkat Kota Pasuruan',
    kategori: 'Prestasi',
    tingkat: 'Kota',
    poin: 50,
    bonusNilaiMapel: 10,
    rekomendasiMapel: 'Pendidikan Pancasila / Rapor Prestasi'
  },
  {
    nama: 'Juara 2 / 3 Lomba Tingkat Kota Pasuruan',
    kategori: 'Prestasi',
    tingkat: 'Kota',
    poin: 40,
    bonusNilaiMapel: 8,
    rekomendasiMapel: 'Pendidikan Pancasila'
  },
  {
    nama: 'Juara 1 / 2 / 3 Lomba Tingkat Kecamatan Panggungrejo',
    kategori: 'Prestasi',
    tingkat: 'Kecamatan',
    poin: 25,
    bonusNilaiMapel: 6,
    rekomendasiMapel: 'Muatan Lokal / SBdP'
  },
  {
    nama: 'Juara Lomba Classmeeting / Kreasi Seni Sekolah',
    kategori: 'Prestasi',
    tingkat: 'Sekolah',
    poin: 15,
    bonusNilaiMapel: 5,
    rekomendasiMapel: 'Seni Budaya & Prakarya'
  },
  {
    nama: 'Juara Lomba Tingkat Provinsi Jawa Timur / Nasional',
    kategori: 'Prestasi',
    tingkat: 'Provinsi',
    poin: 100,
    bonusNilaiMapel: 15,
    rekomendasiMapel: 'Pendidikan Pancasila / Semua Mapel'
  },

  // Afektif
  {
    nama: 'Menemukan dan Mengembalikan Uang/Barang Milik Teman (Jujur)',
    kategori: 'Afektif',
    tingkat: 'Harian',
    poin: 20,
    bonusNilaiMapel: 5,
    rekomendasiMapel: 'Pendidikan Agama & Budi Pekerti'
  },
  {
    nama: 'Selalu Datang Paling Awal & Tertib Penuh Selama 1 Bulan',
    kategori: 'Afektif',
    tingkat: 'Sekolah',
    poin: 25,
    bonusNilaiMapel: 6,
    rekomendasiMapel: 'Pendidikan Pancasila'
  },
  {
    nama: 'Membantu Teman Difabel / Sakit / Mengalami Kesulitan Belajar',
    kategori: 'Afektif',
    tingkat: 'Harian',
    poin: 15,
    bonusNilaiMapel: 4,
    rekomendasiMapel: 'Pendidikan Agama & Budi Pekerti'
  },
  {
    nama: 'Inisiatif Mandiri Membersihkan Fasilitas Sekolah & Mushola',
    kategori: 'Afektif',
    tingkat: 'Harian',
    poin: 15,
    bonusNilaiMapel: 4,
    rekomendasiMapel: 'Projek Penguatan Profil Pelajar Pancasila'
  },
  {
    nama: 'Sopan Santun Teladan Kepada Seluruh Guru dan Warga Sekolah',
    kategori: 'Afektif',
    tingkat: 'Harian',
    poin: 15,
    bonusNilaiMapel: 4,
    rekomendasiMapel: 'Pendidikan Agama & Budi Pekerti'
  },

  // Teladan
  {
    nama: 'Bintang Kelas Teladan Bulan Ini (Star of the Month)',
    kategori: 'Teladan',
    tingkat: 'Sekolah',
    poin: 35,
    bonusNilaiMapel: 8,
    rekomendasiMapel: 'Pendidikan Pancasila'
  },
  {
    nama: 'Duta Karakter Pelajar Pancasila SDN Kebonagung',
    kategori: 'Teladan',
    tingkat: 'Sekolah',
    poin: 50,
    bonusNilaiMapel: 10,
    rekomendasiMapel: 'Pendidikan Pancasila'
  },
  {
    nama: 'Pelopor Anti-Bullying / Sahabat Damai Tim TPPK',
    kategori: 'Teladan',
    tingkat: 'Sekolah',
    poin: 30,
    bonusNilaiMapel: 7,
    rekomendasiMapel: 'Pendidikan Pancasila'
  },
  {
    nama: 'Pemimpin Upacara & Petugas Pengibar Bendera Terbaik',
    kategori: 'Teladan',
    tingkat: 'Sekolah',
    poin: 20,
    bonusNilaiMapel: 5,
    rekomendasiMapel: 'Pendidikan Pancasila'
  }
];

export const MAPEL_OPTIONS = [
  'Pendidikan Pancasila',
  'Pendidikan Agama dan Budi Pekerti',
  'Bahasa Indonesia',
  'Matematika',
  'IPAS (Ilmu Pengetahuan Alam & Sosial)',
  'Seni Budaya dan Prakarya (SBdP)',
  'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)',
  'Bahasa Jawa (Muatan Lokal)',
  'Nilai Rapor Sikap & Karakter (P3)'
];
