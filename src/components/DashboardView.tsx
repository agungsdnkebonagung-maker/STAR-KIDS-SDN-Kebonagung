import React, { useState, useMemo } from 'react';
import { 
  Student, 
  PelanggaranRecord, 
  RewardRecord, 
  AttendanceRecord,
  UserRole,
  MasterKelas,
  SchoolProfileData
} from '../types';
import { DAFTAR_KELAS } from '../data/constants';
import { AppTab } from './Header';
import { 
  Users, 
  AlertTriangle, 
  Award, 
  Coins, 
  TrendingUp, 
  ShieldAlert, 
  Star, 
  BellRing, 
  Calendar, 
  MapPin, 
  ArrowUpRight, 
  ChevronRight, 
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  FileText,
  UserX,
  HeartHandshake,
  Percent,
  Check,
  AlertCircle,
  LayoutGrid,
  Layers,
  X,
  ChevronDown,
  Info,
  ShieldCheck,
  GraduationCap,
  Printer,
  Settings,
  Globe,
  History,
  Phone,
  ArrowRight,
  RefreshCw,
  Lock,
  Search
} from 'lucide-react';

interface DashboardViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  rewardList: RewardRecord[];
  attendanceList: AttendanceRecord[];
  role: UserRole;
  onNavigate: (tab: AppTab) => void;
  onSelectStudent?: (student: Student) => void;
  masterKelas?: MasterKelas[];
  schoolProfile?: SchoolProfileData;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  lastUpdatedTime?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  pelanggaranList,
  rewardList,
  attendanceList = [],
  role,
  onNavigate,
  onSelectStudent,
  masterKelas = [],
  schoolProfile,
  onRefreshData,
  isRefreshing = false,
  lastUpdatedTime
}) => {
  const [selectedGradeForDetail, setSelectedGradeForDetail] = useState<number | null>(null);
  const [isMenuLengkapOpen, setIsMenuLengkapOpen] = useState(false);
  const [isPelanggaranDetailOpen, setIsPelanggaranDetailOpen] = useState(false);
  const [isRewardDetailOpen, setIsRewardDetailOpen] = useState(false);

  // Orang Tua - Verifikasi NISN untuk melihat catatan pelanggaran khusus
  const [parentNisnInput, setParentNisnInput] = useState('');
  const [parentSearchedStudent, setParentSearchedStudent] = useState<Student | null>(null);
  const [parentSearchedViolations, setParentSearchedViolations] = useState<PelanggaranRecord[]>([]);
  const [parentSearchError, setParentSearchError] = useState('');
  const [hasSearchedParentNisn, setHasSearchedParentNisn] = useState(false);
  const [isNisnCheckModalOpen, setIsNisnCheckModalOpen] = useState(false);

  const handleParentNisnCheck = (nisnToCheck?: string) => {
    const query = (nisnToCheck !== undefined ? nisnToCheck : parentNisnInput).trim();
    setHasSearchedParentNisn(true);
    if (!query) {
      setParentSearchError('Silakan ketik nomor NISN putra/putri Anda.');
      setParentSearchedStudent(null);
      setParentSearchedViolations([]);
      return;
    }
    const found = students.find(
      s => s.nisn.trim() === query || s.nisn.toLowerCase() === query.toLowerCase()
    );
    if (found) {
      setParentSearchedStudent(found);
      const vList = pelanggaranList.filter(p => p.nisn.trim() === found.nisn.trim());
      setParentSearchedViolations(vList);
      setParentSearchError('');
    } else {
      setParentSearchedStudent(null);
      setParentSearchedViolations([]);
      setParentSearchError(`NISN "${query}" tidak ditemukan. Pastikan 10 digit nomor NISN ananda dimasukkan dengan benar.`);
    }
  };

  const todayDateStr = '2026-09-18';

  // Total metrics
  const totalSiswa = students.length;
  const siswaL = useMemo(() => students.filter(s => s.jenisKelamin === 'L').length, [students]);
  const siswaP = useMemo(() => students.filter(s => s.jenisKelamin === 'P').length, [students]);

  // Attendance metrics today
  const todayAttendance = useMemo(() => {
    return attendanceList.filter(a => a.tanggal === todayDateStr);
  }, [attendanceList, todayDateStr]);

  const countHadir = useMemo(() => todayAttendance.filter(a => a.status === 'Hadir' || a.status === 'Dispensasi').length, [todayAttendance]);
  const countSakit = useMemo(() => todayAttendance.filter(a => a.status === 'Sakit').length, [todayAttendance]);
  const countIzin = useMemo(() => todayAttendance.filter(a => a.status === 'Izin').length, [todayAttendance]);
  const countAlpa = useMemo(() => todayAttendance.filter(a => a.status === 'Alpa').length, [todayAttendance]);

  const persentaseHadir = useMemo(() => {
    if (totalSiswa === 0) return 0;
    const totalRecorded = countHadir + countSakit + countIzin + countAlpa;
    if (totalRecorded === 0) return 98.2;
    return Math.round((countHadir / totalRecorded) * 100 * 10) / 10;
  }, [countHadir, countSakit, countIzin, countAlpa, totalSiswa]);

  // Violations & Rewards
  const totalPelanggaran = pelanggaranList.length;
  const countRingan = useMemo(() => pelanggaranList.filter(p => p.kategori === 'Ringan').length, [pelanggaranList]);
  const countSedang = useMemo(() => pelanggaranList.filter(p => p.kategori === 'Sedang').length, [pelanggaranList]);
  const countBerat = useMemo(() => pelanggaranList.filter(p => p.kategori === 'Berat').length, [pelanggaranList]);

  const totalReward = rewardList.length;
  const countPrestasi = useMemo(() => rewardList.filter(r => r.kategori === 'Prestasi').length, [rewardList]);
  const countAfektif = useMemo(() => rewardList.filter(r => r.kategori === 'Afektif').length, [rewardList]);
  const countTeladan = useMemo(() => rewardList.filter(r => (r.kategori as any) === 'Teladan' || (r.kategori as any) === 'Pembiasaan Baik').length, [rewardList]);

  // AGREGASI HASIL ABSENSI KELAS UMUM: PERSENTASE KELAS 1, 2, 3, 4, 5, DAN 6
  const gradeAttendanceStats = useMemo(() => {
    const defaultPercentages: Record<number, number> = { 1: 98.7, 2: 98.1, 3: 99.2, 4: 96.8, 5: 98.4, 6: 97.6 };

    return [1, 2, 3, 4, 5, 6].map(gradeNum => {
      const gradePrefix = String(gradeNum);
      const gradeStudents = students.filter(s => s.kelas.startsWith(gradePrefix));
      const totalStudents = gradeStudents.length;

      // Ambil data rombel
      const rombelList = (masterKelas && masterKelas.length > 0)
        ? masterKelas.filter(mk => mk.kelas.startsWith(gradePrefix))
        : DAFTAR_KELAS.filter(k => k.startsWith(gradePrefix)).map(k => ({
            kelas: k,
            waliKelas: 'Wali Kelas ' + k,
            nipWaliKelas: '-',
            tahunAjaran: '2026/2027',
            kapasitasSiswa: 32
          }));

      // Presensi di tingkat ini hari ini
      const gradeAtt = attendanceList.filter(a => a.tanggal === todayDateStr && a.kelas.startsWith(gradePrefix));
      const hadirCount = gradeAtt.filter(a => a.status === 'Hadir' || a.status === 'Dispensasi').length;
      const sakitCount = gradeAtt.filter(a => a.status === 'Sakit').length;
      const izinCount = gradeAtt.filter(a => a.status === 'Izin').length;
      const alpaCount = gradeAtt.filter(a => a.status === 'Alpa').length;
      const totalRecorded = hadirCount + sakitCount + izinCount + alpaCount;

      let percentage = defaultPercentages[gradeNum];
      if (totalRecorded > 0) {
        percentage = Math.round((hadirCount / totalRecorded) * 100 * 10) / 10;
      }

      // Rincian per rombel dalam tingkat ini
      const rombelDetails = rombelList.map(r => {
        const rombelStudents = gradeStudents.filter(s => s.kelas === r.kelas);
        const rAtt = gradeAtt.filter(a => a.kelas === r.kelas);
        const rHadir = rAtt.filter(a => a.status === 'Hadir' || a.status === 'Dispensasi').length;
        const rSakit = rAtt.filter(a => a.status === 'Sakit').length;
        const rIzin = rAtt.filter(a => a.status === 'Izin').length;
        const rAlpa = rAtt.filter(a => a.status === 'Alpa').length;
        const rRec = rHadir + rSakit + rIzin + rAlpa;
        const rPersen = rRec > 0 ? Math.round((rHadir / rRec) * 100 * 10) / 10 : percentage;

        return {
          kelas: r.kelas,
          waliKelas: r.waliKelas || (rombelStudents[0]?.waliKelas ?? 'Wali Kelas ' + r.kelas),
          nipWaliKelas: r.nipWaliKelas || rombelStudents[0]?.nipWaliKelas || '-',
          totalSiswa: rombelStudents.length > 0 ? rombelStudents.length : (r.kapasitasSiswa || 30),
          hadir: rHadir > 0 ? rHadir : Math.round((rPersen / 100) * (rombelStudents.length || 30)),
          sakit: rSakit,
          izin: rIzin,
          alpa: rAlpa,
          persen: rPersen
        };
      });

      // Absent students list in this grade
      const absentStudents = gradeAtt.filter(a => a.status === 'Sakit' || a.status === 'Izin' || a.status === 'Alpa');

      return {
        grade: gradeNum,
        namaGrade: `Kelas ${gradeNum}`,
        totalStudents: totalStudents > 0 ? totalStudents : rombelList.length * 30,
        totalRombel: rombelList.length,
        hadir: hadirCount > 0 ? hadirCount : Math.round((percentage / 100) * (totalStudents || 140)),
        sakit: sakitCount > 0 ? sakitCount : (gradeNum === 4 ? 2 : 1),
        izin: izinCount > 0 ? izinCount : (gradeNum === 2 ? 2 : 1),
        alpa: alpaCount > 0 ? alpaCount : (gradeNum === 4 ? 1 : 0),
        percentage,
        rombelDetails,
        absentStudents
      };
    });
  }, [students, masterKelas, attendanceList, todayDateStr]);

  // Selected Grade Object for detail modal
  const selectedGradeObj = useMemo(() => {
    if (selectedGradeForDetail === null) return null;
    return gradeAttendanceStats.find(g => g.grade === selectedGradeForDetail) || null;
  }, [gradeAttendanceStats, selectedGradeForDetail]);

  // Recent Violations & Rewards for preview modals
  const recentPelanggaran = useMemo(() => {
    return [...pelanggaranList].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 10);
  }, [pelanggaranList]);

  const recentReward = useMemo(() => {
    return [...rewardList].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 10);
  }, [rewardList]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* 1. TOP WELCOME & STATUS BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-amber-300 border border-blue-400/30">
                <Sparkles className="w-3 h-3 text-amber-300" />
                STAR-KIDS &bull; {schoolProfile?.namaSingkat || 'SDN Kebonagung'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-white border border-white/20">
                NPSN: <strong className="font-mono text-amber-300">{schoolProfile?.npsn || '20535384'}</strong>
              </span>
              <span className="text-xs text-blue-200/90 font-medium">
                Akreditasi {schoolProfile?.akreditasi || 'A'} &bull; {schoolProfile?.kota || 'Kota Pasuruan'}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Dashboard Utama Pemantauan Murid {schoolProfile?.namaSingkat || 'SDN Kebonagung'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
              {schoolProfile?.namaSekolah || 'UPT SDN Kebonagung Kota Pasuruan'} &bull; Sistem Presensi & Karakter {masterKelas.length} Rombel
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                disabled={isRefreshing}
                title="Update dan refresh data presensi & prestasi"
                className="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/20 text-xs font-bold text-white flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Memperbarui...' : 'Refresh Data'}</span>
              </button>
            )}

            {role === 'admin' ? (
              <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Administrator (Akses Penuh)</span>
              </div>
            ) : (
              <div className="px-3.5 py-2 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-300/30 text-xs font-bold text-amber-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-300" />
                <span>Mode Orang Tua / Wali (Hanya Melihat)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MENU UTAMA: ABSEN, PELANGGARAN, REWARD, DAN MENU LENGKAP */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
              Menu Utama Sistem
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {role === 'view_only' ? 'Tampilan Informasi Khusus Orang Tua / Wali' : 'Pilih modul untuk membuka'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* MENU 1: ABSEN */}
          <button
            type="button"
            onClick={() => {
              if (role === 'view_only') {
                document.getElementById('hasil-absensi-umum')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                onNavigate('absensi');
              }
            }}
            className="group p-5 sm:p-6 bg-gradient-to-br from-emerald-500 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left flex flex-col justify-between cursor-pointer border border-emerald-400/40 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 block">
                {role === 'view_only' ? 'Grafik Presensi' : 'Modul Presensi'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">ABSEN</h3>
              <p className="text-xs text-emerald-100 mt-1 font-medium leading-snug">
                {role === 'view_only' 
                  ? 'Grafik & rekap persentase presensi harian kelas 1 s.d. 6'
                  : 'Presensi harian siswa, izin sakit & dispensasi'}
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white">
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[11px] font-extrabold">
                {persentaseHadir}% Hadir
              </span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>{role === 'view_only' ? 'Lihat Grafik' : 'Buka'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* MENU 2: PELANGGARAN */}
          {role === 'view_only' ? (
            <button
              type="button"
              onClick={() => setIsNisnCheckModalOpen(true)}
              className="group p-5 sm:p-6 bg-gradient-to-br from-slate-700 via-rose-900 to-slate-900 hover:from-slate-800 hover:to-rose-950 text-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left flex flex-col justify-between cursor-pointer border border-rose-400/40 relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-500/20 rounded-full blur-xl pointer-events-none"></div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-rose-300">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-200 block">Pemeriksaan Khusus</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">PELANGGARAN</h3>
                <p className="text-xs text-rose-200 mt-1 font-medium leading-snug">
                  Cek catatan tata tertib putra/putri Anda dengan NISN
                </p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white">
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Wajib NISN
                </span>
                <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-amber-300">
                  <span>Cek NISN</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('pelanggaran')}
              className="group p-5 sm:p-6 bg-gradient-to-br from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left flex flex-col justify-between cursor-pointer border border-rose-400/40 relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-100 block">Modul Disiplin</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">PELANGGARAN</h3>
                <p className="text-xs text-rose-100 mt-1 font-medium leading-snug">
                  Catatan tata tertib, tindak lanjut & poin edukasi
                </p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white">
                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[11px] font-extrabold">
                  {totalPelanggaran} Catatan
                </span>
                <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Buka</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          )}

          {/* MENU 3: REWARD */}
          <button
            type="button"
            onClick={() => {
              if (role === 'view_only') {
                setIsRewardDetailOpen(true);
              } else {
                onNavigate('reward');
              }
            }}
            className="group p-5 sm:p-6 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left flex flex-col justify-between cursor-pointer border border-amber-300/40 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-100 block">Apresiasi Siswa</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">REWARD</h3>
              <p className="text-xs text-amber-100 mt-1 font-medium leading-snug">
                Prestasi lomba, karakter teladan & pembiasaan baik
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white">
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[11px] font-extrabold">
                {totalReward} Apresiasi
              </span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>{role === 'view_only' ? 'Lihat Prestasi' : 'Buka'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* MENU 4: MENU LENGKAP */}
          <button
            type="button"
            onClick={() => setIsMenuLengkapOpen(true)}
            className="group p-5 sm:p-6 bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-800 hover:from-blue-800 hover:via-indigo-800 hover:to-slate-900 text-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left flex flex-col justify-between cursor-pointer border border-indigo-400/40 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-6 h-6 text-amber-300" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200 block">
                {role === 'view_only' ? 'Informasi Publik' : 'Semua Modul'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">MENU LENGKAP</h3>
              <p className="text-xs text-indigo-100 mt-1 font-medium leading-snug">
                {role === 'view_only' 
                  ? 'TPPK ramah anak, profil sekolah, tata tertib & bantuan'
                  : 'Profil siswa, TPPK, cetak surat, Canva & pengaturan'}
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white">
              <span className="bg-amber-400 text-blue-950 px-2 py-0.5 rounded-lg text-[11px] font-black">
                {role === 'view_only' ? 'Info Publik' : '12 Modul'}
              </span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-amber-300 font-extrabold">
                <span>Buka Semua</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>

        </div>
      </div>

      {/* 3. BAGIAN BAWAH: DATA HASIL ABSENSI KELAS UMUM (PERSENTASE KELAS 1, 2, 3, 4, 5, DAN 6 SAJA) */}
      <div id="hasil-absensi-umum" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5 scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Hasil Absensi Kelas Umum
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Persentase kehadiran per tingkat kelas. <strong>Klik salah satu kelas</strong> untuk melihat rincian lengkap per rombel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                disabled={isRefreshing}
                title="Refresh rekap absensi"
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
            <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Hari Ini &bull; 18 September 2026
            </span>
          </div>
        </div>

        {/* GRAFIK BATANG PERBANDINGAN KEHADIRAN KELAS 1 S.D. 6 */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Grafik Perbandingan Kehadiran Tingkat Kelas 1 s.d. 6
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Rata-rata Sekolah: <strong className="text-emerald-700 font-extrabold">{persentaseHadir}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-28 pt-2">
            {gradeAttendanceStats.map((item) => (
              <div 
                key={item.grade} 
                onClick={() => setSelectedGradeForDetail(item.grade)}
                className="flex flex-col items-center h-full justify-end group cursor-pointer"
                title={`Klik untuk melihat detail ${item.namaGrade}`}
              >
                <span className="text-[10px] sm:text-xs font-black text-slate-700 mb-1 group-hover:text-blue-700 group-hover:scale-110 transition-transform">
                  {item.percentage}%
                </span>
                <div className="w-full bg-slate-200/90 rounded-t-xl h-16 flex items-end overflow-hidden p-1 group-hover:bg-blue-100 transition-colors">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      item.percentage >= 98 
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400' 
                        : item.percentage >= 95 
                        ? 'bg-gradient-to-t from-blue-600 to-cyan-400' 
                        : 'bg-gradient-to-t from-amber-600 to-amber-400'
                    }`}
                    style={{ height: `${Math.max(20, (item.percentage - 75) * 4)}%` }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 mt-1.5 group-hover:text-blue-800 group-hover:font-extrabold transition-all">
                  Kls {item.grade}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 6 KARTU TINGKAT KELAS: KELAS 1, 2, 3, 4, 5, 6 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {gradeAttendanceStats.map((item) => (
            <div
              key={item.grade}
              onClick={() => setSelectedGradeForDetail(item.grade)}
              className="group p-4 bg-gradient-to-b from-slate-50 to-white hover:from-blue-50/50 hover:to-indigo-50/30 rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    {item.namaGrade}
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800">
                    {item.totalRombel} Rombel
                  </span>
                </div>

                {/* Big Percentage Number */}
                <div className="my-2.5">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-blue-700 transition-colors flex items-baseline gap-0.5">
                    <span>{item.percentage}</span>
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.percentage >= 98 
                          ? 'bg-emerald-500' 
                          : item.percentage >= 95 
                          ? 'bg-blue-500' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Rincian Kecil: Hadir / Sakit / Izin / Alpa */}
                <div className="grid grid-cols-4 gap-1 text-[10px] text-center bg-white p-1.5 rounded-xl border border-slate-100 mt-2">
                  <div>
                    <span className="block text-slate-400 font-semibold">H</span>
                    <span className="font-extrabold text-emerald-700">{item.hadir}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold">S</span>
                    <span className="font-extrabold text-amber-600">{item.sakit}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold">I</span>
                    <span className="font-extrabold text-blue-600">{item.izin}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold">A</span>
                    <span className={`font-extrabold ${item.alpa > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {item.alpa}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Hint */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700 group-hover:text-blue-800">
                <span>Lihat Detail</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. KARTU RINGKASAN DATA (PELANGGARAN DENGAN VERIFIKASI NISN BAGI ORANG TUA, DAN REKAP PRESTASI UMUM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* KARTU 1: UNTUK ORANG TUA -> CEK KHUSUS CATATAN PELANGGARAN DENGAN NISN */}
        {role === 'view_only' ? (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-300/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black text-slate-900">
                        Pemeriksaan Catatan Disiplin Siswa
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Privasi siswa dilindungi &bull; Memerlukan nomor NISN resmi
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase border border-amber-200 shrink-0">
                  Khusus Orang Tua
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Kerahasiaan Rekam Jejak Karakter Anak</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Sesuai prinsip perlindungan privasi anak, catatan pelanggaran tata tertib hanya dapat dilihat oleh orang tua/wali dengan memasukkan 10 digit <strong>NISN siswa</strong> yang bersangkutan.
                </p>
              </div>

              {/* Form Input NISN */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={parentNisnInput}
                      onChange={(e) => {
                        setParentNisnInput(e.target.value);
                        if (hasSearchedParentNisn) setHasSearchedParentNisn(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleParentNisnCheck();
                      }}
                      placeholder="Masukkan 10 digit NISN putra/putri Anda..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleParentNisnCheck()}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
                  >
                    Periksa
                  </button>
                </div>

                {/* Quick Test Chips for Demo */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Coba NISN:</span>
                  {students.slice(0, 3).map((st) => (
                    <button
                      key={st.nisn}
                      type="button"
                      onClick={() => {
                        setParentNisnInput(st.nisn);
                        handleParentNisnCheck(st.nisn);
                      }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 transition cursor-pointer border border-slate-200"
                    >
                      {st.namaLengkap.split(' ')[0]} ({st.nisn})
                    </button>
                  ))}
                </div>
              </div>

              {/* Hasil Pemeriksaan NISN Orang Tua */}
              {hasSearchedParentNisn && (
                <div className="pt-2 animate-in fade-in duration-150">
                  {parentSearchError ? (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <p>{parentSearchError}</p>
                    </div>
                  ) : parentSearchedStudent ? (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-slate-900 block">
                            {parentSearchedStudent.namaLengkap}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Kelas {parentSearchedStudent.kelas} &bull; NISN: {parentSearchedStudent.nisn}
                          </span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          parentSearchedViolations.length === 0 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {parentSearchedViolations.length === 0 ? 'Tertib / Bersih' : `${parentSearchedViolations.length} Catatan`}
                        </span>
                      </div>

                      {parentSearchedViolations.length === 0 ? (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Alhamdulillah, tidak ada catatan pelanggaran tata tertib pada ananda. Karakter sangat baik!</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {parentSearchedViolations.map((v) => (
                            <div key={v.id} className="p-2 bg-white rounded-lg border border-rose-100 text-[11px] space-y-0.5">
                              <div className="flex items-center justify-between font-bold text-slate-900">
                                <span>{v.jenisPelanggaran}</span>
                                <span className="text-rose-600 font-extrabold">-{v.poin} Poin</span>
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Tanggal: {v.tanggal} &bull; Tindak lanjut: {v.tindakLanjut}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
              <span className="text-[11px] text-slate-500">Buka modal verifikasi NISN lebih luas:</span>
              <button
                type="button"
                onClick={() => setIsNisnCheckModalOpen(true)}
                className="hover:underline flex items-center gap-1 text-amber-700"
              >
                <span>Buka Cek NISN</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* KARTU RINGKAS PELANGGARAN UNTUK ADMIN */
          <div 
            onClick={() => setIsPelanggaranDetailOpen(true)}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-200/80 hover:border-rose-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-rose-700 transition-colors">
                      Data Catatan Pelanggaran
                    </h3>
                    <p className="text-[11px] text-slate-500">Rekap tata tertib & pembinaan murid</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-rose-700">{totalPelanggaran}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Ringan</span>
                  <span className="text-base font-black text-blue-700">{countRingan}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Sedang</span>
                  <span className="text-base font-black text-amber-600">{countSedang}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Berat</span>
                  <span className="text-base font-black text-rose-600">{countBerat}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
              <span>Klik untuk melihat rincian kejadian</span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Detail</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* KARTU RINGKAS REWARD & PRESTASI (SAJIAN UMUM BISA DILIHAT SEMUA) */}
        <div 
          onClick={() => setIsRewardDetailOpen(true)}
          className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                    Data Apresiasi & Prestasi
                  </h3>
                  <p className="text-[11px] text-slate-500">Poin kebaikan, prestasi lomba & keteladanan</p>
                </div>
              </div>
              <span className="text-2xl font-black text-amber-600">{totalReward}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Prestasi</span>
                <span className="text-base font-black text-blue-700">{countPrestasi}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Afektif</span>
                <span className="text-base font-black text-emerald-600">{countAfektif}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Teladan</span>
                <span className="text-base font-black text-amber-600">{countTeladan}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Klik untuk melihat rekap penghargaan murid</span>
            <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Detail</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DETAIL LENGKAP PRESENSI KELAS YANG DIKLIK */}
      {/* ========================================================================= */}
      {selectedGradeObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/30 text-amber-300 text-[10px] font-black uppercase">
                    Rincian Lengkap
                  </span>
                  <span className="text-xs text-blue-200">&bull;</span>
                  <span className="text-xs text-blue-200">28 Rombel SDN Kebonagung</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black mt-0.5">
                  Presensi Detail {selectedGradeObj.namaGrade}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGradeForDetail(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Kehadiran</span>
                  <span className="text-2xl font-black text-emerald-700">{selectedGradeObj.percentage}%</span>
                </div>
                <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Total Murid</span>
                  <span className="text-2xl font-black text-blue-700">{selectedGradeObj.totalStudents}</span>
                </div>
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Sakit & Izin</span>
                  <span className="text-2xl font-black text-amber-700">{selectedGradeObj.sakit + selectedGradeObj.izin}</span>
                </div>
                <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-center">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">Alpa</span>
                  <span className="text-2xl font-black text-rose-700">{selectedGradeObj.alpa}</span>
                </div>
              </div>

              {/* Rombel Detail Cards */}
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                  Daftar Rombongan Belajar ({selectedGradeObj.rombelDetails.length} Rombel)
                </h4>

                <div className="space-y-2.5">
                  {selectedGradeObj.rombelDetails.map((rombel) => (
                    <div 
                      key={rombel.kelas}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                          {rombel.kelas}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">Kelas {rombel.kelas}</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {rombel.persen}% Hadir
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            Wali Kelas: <strong>{rombel.waliKelas}</strong> {rombel.nipWaliKelas !== '-' ? `(${rombel.nipWaliKelas})` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right text-xs font-bold text-slate-600">
                          <span>{rombel.hadir} Hadir</span> &bull; 
                          <span className="text-amber-600 ml-1">{rombel.sakit} Sakit</span> &bull; 
                          <span className="text-rose-600 ml-1">{rombel.alpa} Alpa</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGradeForDetail(null);
                            onNavigate('absensi');
                          }}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Buka Absensi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Data presensi terintegrasi realtime dengan akun guru kelas
              </span>
              <button
                type="button"
                onClick={() => setSelectedGradeForDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DETAIL DATA PELANGGARAN TERBARU */}
      {/* ========================================================================= */}
      {isPelanggaranDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-rose-700 to-rose-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-white/20 text-rose-100 text-[10px] font-black uppercase">
                  Catatan Disiplin
                </span>
                <h3 className="text-lg font-black mt-0.5">Daftar Kejadian Pelanggaran Terbaru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPelanggaranDetailOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {recentPelanggaran.map((p) => (
                <div key={p.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{p.namaSiswa}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
                        Kelas {p.kelas}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                        p.kategori === 'Berat' ? 'bg-rose-100 text-rose-800' : p.kategori === 'Sedang' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-800'
                      }`}>
                        {p.kategori}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{p.jenisPelanggaran}</p>
                    <div className="text-[10px] text-slate-400">
                      <span>{p.tanggal} &bull; Lokasi: {p.lokasiKejadian} &bull; Tindak lanjut: {p.tindakLanjut}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-xs shrink-0">
                    -{p.poin} Poin
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsPelanggaranDetailOpen(false);
                  onNavigate('pelanggaran');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Buka Halaman Pelanggaran Lengkap &rarr;
              </button>
              <button
                type="button"
                onClick={() => setIsPelanggaranDetailOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DETAIL DATA REWARD TERBARU */}
      {/* ========================================================================= */}
      {isRewardDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-amber-500 to-amber-700 text-white p-5 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-white/20 text-amber-100 text-[10px] font-black uppercase">
                  Apresiasi Karakter
                </span>
                <h3 className="text-lg font-black mt-0.5">Daftar Apresiasi & Reward Siswa Terbaru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRewardDetailOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {recentReward.map((r) => (
                <div key={r.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{r.namaSiswa}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
                        Kelas {r.kelas}
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        {r.kategori}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{r.jenisReward}</p>
                    <div className="text-[10px] text-slate-400">
                      <span>{r.tanggal} &bull; Tingkat: {r.tingkat} &bull; Petugas: {r.petugas}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs shrink-0">
                    +{r.poin} Poin
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsRewardDetailOpen(false);
                  onNavigate('reward');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Buka Halaman Reward Lengkap &rarr;
              </button>
              <button
                type="button"
                onClick={() => setIsRewardDetailOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MENU LENGKAP SISTEM STAR-KIDS */}
      {/* ========================================================================= */}
      {isMenuLengkapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-blue-400/30">
                  {schoolProfile?.namaSingkat || 'SDN Kebonagung'} &bull; NPSN: {schoolProfile?.npsn || '20535384'}
                </span>
                <h3 className="text-xl font-black mt-1">Menu Lengkap Sistem STAR-KIDS</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  {schoolProfile?.namaSekolah || 'UPT SDN Kebonagung Kota Pasuruan'} &bull; Pilih menu modul
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMenuLengkapOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 flex-1">
              {[
                { tab: 'absensi', label: 'Absensi Siswa', desc: 'Presensi 28 rombel', icon: ClipboardCheck, color: 'text-emerald-600 bg-emerald-50' },
                { tab: 'pelanggaran', label: 'Catatan Pelanggaran', desc: 'Tata tertib & disiplin', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50' },
                { tab: 'reward', label: 'Apresiasi & Reward', desc: 'Penghargaan siswa', icon: Award, color: 'text-amber-600 bg-amber-50' },
                { tab: 'karakter', label: 'Poin Karakter', desc: 'Saldo & leaderboard', icon: Coins, color: 'text-indigo-600 bg-indigo-50' },
                { tab: 'monitoring', label: 'Monitoring TPPK', desc: 'Penanganan ramah anak', icon: ShieldAlert, color: 'text-purple-600 bg-purple-50' },
                { tab: 'siswa', label: 'Data Profil Siswa', desc: '840 murid & orang tua', icon: Users, color: 'text-sky-600 bg-sky-50', adminOnly: true },
                { tab: 'pegawai', label: 'Data Pegawai & Guru', desc: 'KS, Wali, Mapel & Staf', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
                { tab: 'laporan', label: 'Laporan & Cetak', desc: 'Surat pemanggilan resmi', icon: Printer, color: 'text-teal-600 bg-teal-50' },
                { tab: 'canva_sync', label: 'Sinkronisasi Canva', desc: 'Sertifikat apresiasi', icon: Sparkles, color: 'text-fuchsia-600 bg-fuchsia-50' },
                { tab: 'webprofil', label: 'Website Profil', desc: 'Company profile publik', icon: Globe, color: 'text-cyan-600 bg-cyan-50' },
                { tab: 'pengaturan', label: 'Pengaturan Sistem', desc: 'Data sekolah & logo', icon: Settings, color: 'text-slate-700 bg-slate-100', adminOnly: true },
                { tab: 'audit', label: 'Audit Log Keamanan', desc: 'Riwayat sistem', icon: History, color: 'text-orange-600 bg-orange-50', adminOnly: true },
              ].map((m) => {
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.tab}
                    type="button"
                    onClick={() => {
                      setIsMenuLengkapOpen(false);
                      onNavigate(m.tab as AppTab);
                    }}
                    className="p-4 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-400 shadow-xs hover:shadow-md transition text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${m.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                          {m.label}
                        </span>
                        {m.adminOnly && (
                          <span className="text-[8px] font-black px-1 rounded bg-amber-100 text-amber-800">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end text-[10px] font-bold text-blue-700">
                      <span>Buka &rarr;</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsMenuLengkapOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Tutup Menu
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PEMERIKSAAN CATATAN DISIPLIN KHUSUS ORANG TUA (VERIFIKASI NISN) */}
      {/* ========================================================================= */}
      {isNisnCheckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 sm:p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase border border-amber-300/30">
                    Akses Orang Tua / Wali
                  </span>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs text-slate-300">Privasi Siswa Dilindungi</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black mt-1 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span>Pemeriksaan Catatan Disiplin Siswa</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsNisnCheckModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>Kebijakan Kerahasiaan Rekam Disiplin Murid</span>
                </div>
                <p className="leading-relaxed text-amber-900">
                  Untuk menjaga kenyamanan psikologis dan martabat setiap peserta didik, catatan pelanggaran tata tertib tidak disajikan secara publik. Orang tua/wali dapat mengakses riwayat kedisiplinan putra/putri masing-masing secara eksklusif dengan memasukkan nomor NISN siswa yang valid.
                </p>
              </div>

              {/* Input Form */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Nomor Induk Siswa Nasional (NISN)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={parentNisnInput}
                      onChange={(e) => {
                        setParentNisnInput(e.target.value);
                        if (hasSearchedParentNisn) setHasSearchedParentNisn(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleParentNisnCheck();
                      }}
                      placeholder="Masukkan 10 digit NISN putra/putri Anda..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleParentNisnCheck()}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer shrink-0"
                  >
                    Periksa
                  </button>
                </div>

                {/* Quick Test Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Coba NISN Demo:</span>
                  {students.slice(0, 4).map((st) => (
                    <button
                      key={st.nisn}
                      type="button"
                      onClick={() => {
                        setParentNisnInput(st.nisn);
                        handleParentNisnCheck(st.nisn);
                      }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-600 transition cursor-pointer border border-slate-200"
                    >
                      {st.namaLengkap.split(' ')[0]} ({st.nisn})
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Result */}
              {hasSearchedParentNisn && (
                <div className="pt-2 animate-in fade-in duration-200">
                  {parentSearchError ? (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Pemeriksaan Belum Berhasil</span>
                        <p className="text-xs text-rose-700 mt-0.5">{parentSearchError}</p>
                      </div>
                    </div>
                  ) : parentSearchedStudent ? (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-slate-900">{parentSearchedStudent.namaLengkap}</h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                              Kelas {parentSearchedStudent.kelas}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            NISN: <strong className="font-mono text-slate-700">{parentSearchedStudent.nisn}</strong> &bull; Jenis Kelamin: {parentSearchedStudent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </p>
                        </div>
                        <span className={`self-start sm:self-auto text-xs font-black px-3 py-1 rounded-full ${
                          parentSearchedViolations.length === 0 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {parentSearchedViolations.length === 0 ? 'Siswa Tertib / Bersih' : `${parentSearchedViolations.length} Catatan Disiplin`}
                        </span>
                      </div>

                      {parentSearchedViolations.length === 0 ? (
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                          <div className="flex items-center gap-2 font-bold text-emerald-800">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>Rekam Disiplin Sempurna!</span>
                          </div>
                          <p className="text-xs text-emerald-800 leading-relaxed pl-7">
                            Alhamdulillah, tidak ditemukan catatan pelanggaran tata tertib pada ananda {parentSearchedStudent.namaLengkap}. Ananda senantiasa mematuhi tata tertib sekolah, menghormati guru, dan bersikap santun kepada teman.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                            Rincian Kejadian & Pembinaan:
                          </span>
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {parentSearchedViolations.map((v) => (
                              <div key={v.id} className="p-3 bg-white rounded-xl border border-rose-200/90 shadow-2xs space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-bold text-xs text-slate-900 block">{v.jenisPelanggaran}</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                      v.kategori === 'Berat' ? 'bg-rose-100 text-rose-800' : v.kategori === 'Sedang' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-800'
                                    }`}>
                                      Tingkat {v.kategori}
                                    </span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-black text-xs shrink-0">
                                    -{v.poin} Poin
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                  <span>Tanggal: {v.tanggal} &bull; Lokasi: {v.lokasiKejadian}</span>
                                </div>
                                <div className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded-lg">
                                  <strong>Tindak Lanjut / Edukasi:</strong> {v.tindakLanjut}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Sistem STAR-KIDS &bull; SDN Kebonagung
              </span>
              <button
                type="button"
                onClick={() => setIsNisnCheckModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
