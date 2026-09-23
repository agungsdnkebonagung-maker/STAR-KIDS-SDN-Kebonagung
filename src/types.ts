export type UserRole = 'admin' | 'view_only';

export type Gender = 'L' | 'P';

export type KategoriPelanggaran = 'Ringan' | 'Sedang' | 'Berat';

export type KategoriReward = 'Prestasi' | 'Afektif' | 'Teladan';

export type TingkatReward = 'Sekolah' | 'Kecamatan' | 'Kota' | 'Provinsi' | 'Nasional' | 'Harian';

export type StatusTindakLanjut = 'Selesai' | 'Dalam Pembinaan' | 'Panggilan Orang Tua' | 'Konseling TPPK';

export type StatusResiko = 'Aman' | 'Waspada' | 'Berisiko';

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Dispensasi';

export type Agama = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu' | 'Lainnya';

export interface Student {
  nisn: string;
  nik?: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;
  kelas: string;
  rombel?: string;
  waliKelas: string;
  nipWaliKelas?: string;
  tahunAjaran?: string;
  statusSiswa?: 'Aktif' | 'Pindah' | 'Lulus';
  namaOrangTua: string;
  noHpOrangTua: string;
  alamat?: string;
  totalPoinPelanggaran: number;
  totalPoinReward: number;
  statusResiko: StatusResiko;
}

export interface AttendanceRecord {
  id: string;
  student_id?: string;
  tanggal: string; // YYYY-MM-DD
  nisn: string;
  nama: string;
  kelas: string;
  jenisKelamin?: Gender;
  waliKelas?: string;
  status: AttendanceStatus;
  keterangan?: string;
  inputOleh: string;
  timestamp: string;
  updatedAt?: string;
  syncedToSheet?: boolean;
}

export interface PelanggaranRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jam: string; // HH:mm
  nisn: string;
  namaSiswa: string;
  kelas: string;
  jenisPelanggaran: string;
  kategori: KategoriPelanggaran;
  poin: number;
  lokasiKejadian: string;
  aktivitasSaatPelanggaran: string;
  tindakLanjut: string;
  catatan: string;
  statusPenanganan: StatusTindakLanjut;
  petugas: string;
  syncedToSheet?: boolean;
}

export interface KonversiNilai {
  mataPelajaran: string;
  poinBonus: number;
  predikat: string;
}

export interface RewardRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  nisn: string;
  namaSiswa: string;
  kelas: string;
  jenisReward: string;
  kategori: KategoriReward;
  tingkat: TingkatReward;
  poin: number;
  konversiNilai: KonversiNilai;
  catatan: string;
  petugas: string;
  syncedToSheet?: boolean;
}

export interface MasterPelanggaran {
  id: string;
  namaPelanggaran?: string;
  jenisPelanggaran?: string;
  kategori: KategoriPelanggaran;
  poin: number;
  tindakLanjutSaran?: string;
  statusAktif?: boolean;
}

export interface MasterReward {
  id: string;
  kategori: KategoriReward | string;
  tingkat: TingkatReward | string;
  jenisReward?: string;
  namaReward?: string;
  poin: number;
  bonusRaportPoin?: number;
  statusAktif?: boolean;
}

export interface MasterKelas {
  id?: string;
  kelas: string;
  waliKelas: string;
  nipWaliKelas?: string;
  tahunAjaran: string;
  kapasitasSiswa?: number;
}

export interface SchoolProfileData {
  namaSekolah: string;
  namaSingkat: string;
  npsn: string;
  nss?: string;
  statusSekolah: 'Negeri' | 'Swasta' | string;
  akreditasi: string;
  tagline: string;
  alamatJalan: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  teleponKantor: string;
  noTeleponPengaduan: string; // Nomor Telp / WA Pengaduan Masyarakat
  hotlineTppk: string; // Hotline Pengaduan Resmi Satgas TPPK
  email: string;
  website: string;
  jamLayananPengaduan: string;
  penanggungJawabPengaduan: string;
  kepalaSekolahNama: string;
  kepalaSekolahNip: string;
  logoUrl?: string; // Data URL Base64 or Image URL
}

export interface SystemSettings {
  alpaPerhatian: number; // default 3
  alpaRisiko: number; // default 5
  kehadiranMonitoringPct: number; // default 90
  kehadiranTindakLanjutPct: number; // default 80
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  adminPassword: string;
  konversiNilaiAktif?: boolean;
  maxPoinBonusNilai?: number;
  schoolProfile?: SchoolProfileData;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
}

export interface CanvaSyncConfig {
  sheetUrl: string;
  autoSync: boolean;
  lastSyncTime: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastMessage?: string;
  totalSyncedCount: number;
}

export interface GoogleSheetsSyncConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  lastSyncTime: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastMessage?: string;
  autoSync: boolean;
}

export type KategoriPegawai = 
  | 'kepala_sekolah' 
  | 'wali_kelas' 
  | 'guru_mapel' 
  | 'administrasi' 
  | 'staff_sekolah';

export type StatusKepegawaian = 'PNS' | 'PPPK' | 'GTT' | 'PTT' | 'Tenaga Kontrak' | 'Honor Sekolah';

export interface Pegawai {
  id: string;
  nip?: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  kategori: KategoriPegawai;
  jabatan: string;
  tugasTambahan?: string;
  kelasBinaan?: string;
  mataPelajaran?: string;
  statusKepegawaian: StatusKepegawaian;
  golonganRuang?: string;
  pendidikanTerakhir?: string;
  noHp: string;
  email?: string;
  alamat?: string;
  statusAktif: boolean;
  fotoUrl?: string;
  catatan?: string;
}

export type VisitorRole = 
  | 'Admin Khusus' 
  | 'Kepala Sekolah' 
  | 'Guru / Wali Kelas' 
  | 'Orang Tua / Wali Murid' 
  | 'Pengawas / Dinas' 
  | 'Tamu Pengunjung';

export interface VisitorLog {
  id: string;
  sessionId: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  lastActive: string; // YYYY-MM-DD HH:mm:ss
  namaPengunjung: string;
  peran: VisitorRole;
  statusAkses: 'Admin Penuh' | 'Akses Terbatas' | 'Publik';
  ipAddress: string;
  lokasi: string;
  perangkat: 'Desktop' | 'Smartphone' | 'Tablet';
  browser: string;
  os: string;
  layarResolusi?: string;
  halamanTerakhir: string;
  durasiMenit: number;
  statusOnline: boolean;
  aktivitas: string;
}

