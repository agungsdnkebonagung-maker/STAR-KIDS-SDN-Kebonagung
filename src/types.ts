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

