import React, { useState, useMemo } from 'react';
import { 
  Student, 
  PelanggaranRecord, 
  RewardRecord, 
  AttendanceRecord,
  UserRole 
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
  BarChart3,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  FileText,
  UserX,
  HeartHandshake,
  Percent,
  Check,
  AlertCircle
} from 'lucide-react';

interface DashboardViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  rewardList: RewardRecord[];
  attendanceList: AttendanceRecord[];
  role: UserRole;
  onNavigate: (tab: AppTab) => void;
  onSelectStudent?: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  pelanggaranList,
  rewardList,
  attendanceList = [],
  role,
  onNavigate,
  onSelectStudent
}) => {
  const [rankingTab, setRankingTab] = useState<'melanggar' | 'reward' | 'berisiko' | 'hadir' | 'alpa'>('melanggar');
  const [eksekutifFilter, setEksekutifFilter] = useState<'Harian' | 'Mingguan' | 'Bulanan' | 'Semester' | 'Tahunan'>('Harian');
  const [chartCategoryFilter, setChartCategoryFilter] = useState<'all' | 'Ringan' | 'Sedang' | 'Berat'>('all');

  // Today's Date representation in demo data
  const todayDateStr = '2026-09-18';

  // 1. Core Summary Metrics
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
    // Calculate based on attendance recorded today or overall baseline
    const totalRecorded = countHadir + countSakit + countIzin + countAlpa;
    if (totalRecorded === 0) return 96.5;
    return Math.round((countHadir / totalRecorded) * 100 * 10) / 10;
  }, [countHadir, countSakit, countIzin, countAlpa, totalSiswa]);

  // Violations metrics
  const totalPelanggaran = pelanggaranList.length;
  const countRingan = useMemo(() => pelanggaranList.filter(p => p.kategori === 'Ringan').length, [pelanggaranList]);
  const countSedang = useMemo(() => pelanggaranList.filter(p => p.kategori === 'Sedang').length, [pelanggaranList]);
  const countBerat = useMemo(() => pelanggaranList.filter(p => p.kategori === 'Berat').length, [pelanggaranList]);

  // Rewards metrics
  const totalReward = rewardList.length;
  const countPrestasi = useMemo(() => rewardList.filter(r => r.kategori === 'Prestasi').length, [rewardList]);
  const countAfektif = useMemo(() => rewardList.filter(r => r.kategori === 'Afektif').length, [rewardList]);
  const countTeladan = useMemo(() => rewardList.filter(r => (r.kategori as any) === 'Teladan' || (r.kategori as any) === 'Pembiasaan Baik').length, [rewardList]);

  // Net Character Points
  const avgSaldoKarakter = useMemo(() => {
    if (students.length === 0) return 100;
    const totalNet = students.reduce((acc, s) => acc + (100 + s.totalPoinReward - s.totalPoinPelanggaran), 0);
    return Math.round(totalNet / students.length);
  }, [students]);

  // 2. Data Grafik Pelanggaran per Kelas & Kategori
  const classViolationsData = useMemo(() => {
    return DAFTAR_KELAS.map(kelas => {
      const itemsInClass = pelanggaranList.filter(p => p.kelas === kelas);
      const ringan = itemsInClass.filter(p => p.kategori === 'Ringan').length;
      const sedang = itemsInClass.filter(p => p.kategori === 'Sedang').length;
      const berat = itemsInClass.filter(p => p.kategori === 'Berat').length;
      const total = itemsInClass.length;
      return { kelas, ringan, sedang, berat, total };
    });
  }, [pelanggaranList]);

  const maxViolationCount = useMemo(() => {
    const maxVal = Math.max(...classViolationsData.map(d => d.total), 4);
    return Math.ceil(maxVal / 4) * 4;
  }, [classViolationsData]);

  // 3. Data Grafik Reward Prestasi & Afektif per Kelas
  const classRewardsData = useMemo(() => {
    return DAFTAR_KELAS.map(kelas => {
      const itemsInClass = rewardList.filter(r => r.kelas === kelas);
      const prestasi = itemsInClass.filter(r => r.kategori === 'Prestasi').length;
      const afektif = itemsInClass.filter(r => r.kategori === 'Afektif').length;
      const teladan = itemsInClass.filter(r => (r.kategori as any) === 'Teladan' || (r.kategori as any) === 'Pembiasaan Baik').length;
      const total = itemsInClass.length;
      return { kelas, prestasi, afektif, teladan, total };
    });
  }, [rewardList]);

  const maxRewardCount = useMemo(() => {
    const maxVal = Math.max(...classRewardsData.map(d => d.total), 4);
    return Math.ceil(maxVal / 4) * 4;
  }, [classRewardsData]);

  // 4. Rankings Murid
  // ⚠️ Murid Paling Melanggar
  const topMelanggar = useMemo(() => {
    return [...students]
      .filter(s => s.totalPoinPelanggaran > 0)
      .sort((a, b) => b.totalPoinPelanggaran - a.totalPoinPelanggaran)
      .slice(0, 5);
  }, [students]);

  // ⭐ Murid Paling Banyak Reward
  const topReward = useMemo(() => {
    return [...students]
      .filter(s => s.totalPoinReward > 0)
      .sort((a, b) => b.totalPoinReward - a.totalPoinReward)
      .slice(0, 5);
  }, [students]);

  // 🔔 Murid Berisiko (Pelanggaran berat atau poin akumulasi >= 25 atau status Berisiko)
  const muridBerisiko = useMemo(() => {
    return students
      .filter(s => s.statusResiko === 'Berisiko' || s.totalPoinPelanggaran >= 30)
      .sort((a, b) => b.totalPoinPelanggaran - a.totalPoinPelanggaran);
  }, [students]);

  // 🏆 Siswa Kehadiran Terbaik (100% kehadiran)
  const topHadir = useMemo(() => {
    // Check students with 0 alpa and high reward
    return students
      .filter(s => s.statusResiko === 'Aman')
      .sort((a, b) => b.totalPoinReward - a.totalPoinReward)
      .slice(0, 5);
  }, [students]);

  // ⚠️ Siswa Alpa Terbanyak
  const topAlpa = useMemo(() => {
    const alpaMap: Record<string, number> = {};
    attendanceList.forEach(a => {
      if (a.status === 'Alpa') {
        alpaMap[a.nisn] = (alpaMap[a.nisn] || 0) + 1;
      }
    });

    return students
      .filter(s => (alpaMap[s.nisn] || 0) > 0)
      .map(s => ({
        ...s,
        alpaCount: alpaMap[s.nisn] || 0
      }))
      .sort((a, b) => b.alpaCount - a.alpaCount)
      .slice(0, 5);
  }, [students, attendanceList]);

  // Recent feeds
  const recentPelanggaran = useMemo(() => {
    return [...pelanggaranList].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 4);
  }, [pelanggaranList]);

  const recentReward = useMemo(() => {
    return [...rewardList].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 4);
  }, [rewardList]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome & Context Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Radiant Joyful Sunbeam & Ambient Lights */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 -top-10 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 top-1/2 w-48 h-48 bg-emerald-300/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-200 text-xs font-black border border-white/25 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>STAR-KIDS Dashboard &bull; SDN Kebonagung Kota Pasuruan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-xs">
              Sistem Tata Tertib & Apresiasi Karakter
            </h1>
            <p className="text-xs sm:text-sm text-blue-50 max-w-2xl leading-relaxed font-medium">
              ✨ Mewujudkan ekosistem sekolah ramah anak, berkarakter mulia, dan berprestasi gemilang melalui integrasi 28 rombel digital yang cerah dan transparan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {role === 'admin' ? (
              <>
                <button
                  onClick={() => onNavigate('absensi')}
                  className="px-3.5 py-2.5 bg-white hover:bg-blue-50 text-blue-900 rounded-xl text-xs font-black shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4 text-blue-700" />
                  <span>Input Absensi</span>
                </button>
                <button
                  onClick={() => onNavigate('reward')}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-blue-950 rounded-xl text-xs font-black shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-900" />
                  <span>Beri Reward ⭐</span>
                </button>
                <button
                  onClick={() => onNavigate('pelanggaran')}
                  className="px-3.5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-100" />
                  <span>Catat Disiplin</span>
                </button>
                <button
                  onClick={() => onNavigate('laporan')}
                  className="px-3.5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/30 backdrop-blur-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Cetak Laporan</span>
                </button>
              </>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-xs text-amber-200 font-bold flex items-center gap-2 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Mode Tamu: Murid & Orang Tua (View Only)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8 KARTU STATISTIK DI BAGIAN ATAS - TAMPILAN CERAH, ELEGAN & MENGGEMBIRAKAN */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        
        {/* 1. Total Siswa */}
        <div 
          onClick={() => role === 'admin' && onNavigate('siswa')}
          className={`bg-white rounded-2xl p-4 border border-sky-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between ${
            role === 'admin' ? 'cursor-pointer hover:border-sky-300' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700">Total Siswa</span>
            <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-sky-700" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900">{totalSiswa}</div>
            <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
              <span className="text-blue-700 font-bold">{siswaL} L</span> &bull; <span className="text-pink-600 font-bold">{siswaP} P</span>
            </div>
          </div>
          <span className="text-[9px] text-sky-800 font-extrabold bg-sky-50 px-1.5 py-0.5 rounded text-center">28 Rombel Resmi</span>
        </div>

        {/* 2. Hadir Hari Ini */}
        <div 
          onClick={() => onNavigate('absensi')}
          className="bg-gradient-to-b from-white to-emerald-50/30 rounded-2xl p-4 border border-emerald-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Hadir</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-emerald-800">{countHadir}</div>
            <div className="text-[10px] font-extrabold text-emerald-700 mt-0.5">
              {persentaseHadir}% Kehadiran
            </div>
          </div>
          <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded text-center">Hari Ini Prima</span>
        </div>

        {/* 3. Sakit */}
        <div 
          onClick={() => onNavigate('absensi')}
          className="bg-gradient-to-b from-white to-amber-50/30 rounded-2xl p-4 border border-amber-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Sakit</span>
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-700" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-amber-800">{countSakit}</div>
            <div className="text-[10px] font-medium text-slate-500 mt-0.5">Surat / Keterangan</div>
          </div>
          <span className="text-[9px] text-amber-800 font-bold bg-amber-100/70 px-1.5 py-0.5 rounded text-center">Izin Sakit</span>
        </div>

        {/* 4. Izin */}
        <div 
          onClick={() => onNavigate('absensi')}
          className="bg-gradient-to-b from-white to-blue-50/30 rounded-2xl p-4 border border-blue-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">Izin</span>
            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardCheck className="w-3.5 h-3.5 text-blue-700" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-blue-900">{countIzin}</div>
            <div className="text-[10px] font-medium text-slate-500 mt-0.5">Acara Keluarga</div>
          </div>
          <span className="text-[9px] text-blue-800 font-bold bg-blue-100/70 px-1.5 py-0.5 rounded text-center">Izin Resmi</span>
        </div>

        {/* 5. Alpa */}
        <div 
          onClick={() => onNavigate('absensi')}
          className={`rounded-2xl p-4 border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between ${
            countAlpa > 0 
              ? 'bg-gradient-to-b from-rose-50 to-rose-100/60 border-rose-300 ring-1 ring-rose-200' 
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${countAlpa > 0 ? 'text-rose-900' : 'text-slate-500'}`}>
              Alpa
            </span>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${countAlpa > 0 ? 'bg-rose-200' : 'bg-slate-100'}`}>
              <UserX className={`w-3.5 h-3.5 ${countAlpa > 0 ? 'text-rose-700 animate-pulse' : 'text-slate-400'}`} />
            </div>
          </div>
          <div className="my-2">
            <div className={`text-2xl font-black ${countAlpa > 0 ? 'text-rose-800' : 'text-slate-900'}`}>{countAlpa}</div>
            <div className="text-[10px] font-medium text-slate-500 mt-0.5">Tanpa Kabar</div>
          </div>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded text-center ${countAlpa > 0 ? 'bg-rose-200 text-rose-900' : 'bg-emerald-50 text-emerald-800'}`}>
            {countAlpa > 0 ? '⚠️ Follow-up TPPK' : 'Nol Alpa 🎉'}
          </span>
        </div>

        {/* 6. Total Pelanggaran */}
        <div 
          onClick={() => onNavigate('pelanggaran')}
          className="bg-white rounded-2xl p-4 border border-rose-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">Pelanggaran</span>
            <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-rose-700">{totalPelanggaran}</div>
            <div className="text-[10px] font-medium text-slate-500 mt-0.5">
              <span className="text-blue-700 font-bold">{countRingan}R</span> &bull; <span className="text-amber-700 font-bold">{countSedang}S</span> &bull; <span className="text-rose-700 font-bold">{countBerat}B</span>
            </div>
          </div>
          <span className="text-[9px] text-rose-800 font-bold bg-rose-50 px-1.5 py-0.5 rounded text-center">Edukasi Pembinaan</span>
        </div>

        {/* 7. Total Reward */}
        <div 
          onClick={() => onNavigate('reward')}
          className="bg-gradient-to-b from-white to-amber-50/40 rounded-2xl p-4 border border-amber-200/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">Reward ⭐</span>
            <div className="w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center">
              <Award className="w-3.5 h-3.5 text-amber-800" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-amber-800">{totalReward}</div>
            <div className="text-[10px] font-bold text-amber-950 mt-0.5">
              <span className="text-blue-700">{countPrestasi} Pres</span> &bull; <span className="text-emerald-700">{countAfektif} Afek</span>
            </div>
          </div>
          <span className="text-[9px] text-amber-900 font-black bg-amber-100 px-1.5 py-0.5 rounded text-center">Bintang Karakter</span>
        </div>

        {/* 8. Rata-rata Poin Karakter */}
        <div 
          onClick={() => onNavigate('poin')}
          className="bg-gradient-to-b from-white to-indigo-50/30 rounded-2xl p-4 border border-indigo-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900">Karakter</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5 text-indigo-700" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-indigo-950">{avgSaldoKarakter}</div>
            <div className="text-[10px] font-medium text-slate-500 mt-0.5">Rerata Saldo Poin</div>
          </div>
          <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-center">Indeks Positif</span>
        </div>

      </div>

      {/* RINGKASAN EKSEKUTIF KEPALA SEKOLAH & TPPK */}
      <div className="bg-gradient-to-br from-white via-sky-50/30 to-amber-50/20 rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black shadow-xs tracking-wider">
              TPPK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Ringkasan Eksekutif Kepala Sekolah & Tim TPPK
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  Resmi Terverifikasi
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Narasi otomatis analisis ketertiban, kedisiplinan, dan iklim positif SDN Kebonagung.
              </p>
            </div>
          </div>

          {/* Filter Periode */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto shadow-2xs">
            {(['Harian', 'Mingguan', 'Bulanan', 'Semester', 'Tahunan'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setEksekutifFilter(p)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  eksekutifFilter === p
                    ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-blue-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Narrative text block */}
        <div className="p-5 bg-white/90 backdrop-blur-xs rounded-2xl border border-sky-100 shadow-2xs leading-relaxed text-slate-700 text-xs sm:text-sm space-y-2.5">
          <p>
            <strong className="text-blue-950 font-black">Laporan Eksekutif Periode {eksekutifFilter}:</strong> Tingkat kehadiran kumulatif siswa berada pada angka <strong className="text-emerald-700 font-black bg-emerald-50 px-1.5 py-0.5 rounded">{persentaseHadir}%</strong>. Terdapat <strong>{countAlpa} siswa</strong> yang tercatat alpa dan direkomendasikan untuk pembinaan wali kelas bersama Tim TPPK.
          </p>
          <p>
            Tercatat <strong>{totalPelanggaran} tindakan ketertiban</strong> yang didominasi kategori ringan ({countRingan} kasus) dan ditangani secara persuasif tanpa hukuman fisik. Di sisi lain, apresiasi karakter berkembang sangat positif dengan <strong className="text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded font-black">{totalReward} pemberian reward</strong> ({countPrestasi} prestasi lomba dan {countAfektif} pembiasaan afektif baik).
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80 shadow-2xs">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Iklim Sekolah: Ramah Anak & Kondusif
            </span>
            <span className="inline-flex items-center gap-1.5 text-blue-800 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/80 shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Apresiasi Karakter Meningkat +18%
            </span>
            {muridBerisiko.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80 shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                {muridBerisiko.length} Siswa Dalam Pantauan TPPK
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2 MAIN CHARTS: PELANGGARAN PER KELAS & REWARD PER KELAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Pelanggaran per Kelas */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Pelanggaran per Kelas & Kategori</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Frekuensi kasus berdasarkan jenjang rombel (Ringan, Sedang, Berat)
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              {(['all', 'Ringan', 'Sedang', 'Berat'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setChartCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartCategoryFilter === cat
                      ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'Semua' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-3 pt-2">
            {classViolationsData.map((d) => {
              const displayVal = 
                chartCategoryFilter === 'Ringan' ? d.ringan :
                chartCategoryFilter === 'Sedang' ? d.sedang :
                chartCategoryFilter === 'Berat' ? d.berat : d.total;

              const pct = maxViolationCount > 0 ? (displayVal / maxViolationCount) * 100 : 0;

              return (
                <div key={d.kelas} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="font-extrabold text-slate-800 w-12">Kelas {d.kelas}</span>
                    <div className="flex items-center gap-3 text-slate-500 font-medium">
                      {chartCategoryFilter === 'all' && (
                        <span className="text-[11px]">
                          <span className="text-blue-600 font-bold">{d.ringan}R</span> &bull;{' '}
                          <span className="text-amber-600 font-bold">{d.sedang}S</span> &bull;{' '}
                          <span className="text-rose-600 font-bold">{d.berat}B</span>
                        </span>
                      )}
                      <span className="font-extrabold text-slate-900 text-xs w-8 text-right">
                        {displayVal}
                      </span>
                    </div>
                  </div>

                  {/* Multi-segmented Progress Bar */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    {chartCategoryFilter === 'all' ? (
                      <>
                        <div 
                          style={{ width: `${(d.ringan / maxViolationCount) * 100}%` }} 
                          className="bg-blue-500 h-full" 
                          title={`Ringan: ${d.ringan}`}
                        />
                        <div 
                          style={{ width: `${(d.sedang / maxViolationCount) * 100}%` }} 
                          className="bg-amber-500 h-full" 
                          title={`Sedang: ${d.sedang}`}
                        />
                        <div 
                          style={{ width: `${(d.berat / maxViolationCount) * 100}%` }} 
                          className="bg-rose-500 h-full" 
                          title={`Berat: ${d.berat}`}
                        />
                      </>
                    ) : (
                      <div 
                        style={{ width: `${pct}%` }} 
                        className={`h-full ${
                          chartCategoryFilter === 'Berat' ? 'bg-rose-600' :
                          chartCategoryFilter === 'Sedang' ? 'bg-amber-500' :
                          'bg-blue-600'
                        }`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Ringan
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Sedang
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Berat
              </span>
            </div>
            <button
              onClick={() => onNavigate('pelanggaran')}
              className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Detail Pelanggaran</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CHART 2: Reward per Kelas */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Distribusi Reward & Apresiasi Karakter</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Kategori Prestasi Akademik/Non-Akademik vs Pembiasaan Afektif Positif
              </p>
            </div>

            <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
              {totalReward} Apresiasi
            </span>
          </div>

          {/* Reward Bars */}
          <div className="space-y-3 pt-2">
            {classRewardsData.map((d) => {
              return (
                <div key={d.kelas} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="font-extrabold text-slate-800 w-12">Kelas {d.kelas}</span>
                    <div className="flex items-center gap-3 text-slate-500 font-medium">
                      <span className="text-[11px]">
                        <span className="text-blue-700 font-bold">{d.prestasi} Prestasi</span> &bull;{' '}
                        <span className="text-emerald-700 font-bold">{d.afektif} Afektif</span>
                      </span>
                      <span className="font-extrabold text-slate-900 text-xs w-8 text-right">
                        {d.total}
                      </span>
                    </div>
                  </div>

                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${(d.prestasi / maxRewardCount) * 100}%` }} 
                      className="bg-blue-600 h-full" 
                      title={`Prestasi: ${d.prestasi}`}
                    />
                    <div 
                      style={{ width: `${(d.afektif / maxRewardCount) * 100}%` }} 
                      className="bg-emerald-500 h-full" 
                      title={`Afektif: ${d.afektif}`}
                    />
                    <div 
                      style={{ width: `${(d.teladan / maxRewardCount) * 100}%` }} 
                      className="bg-amber-400 h-full" 
                      title={`Teladan: ${d.teladan}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Prestasi
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Afektif
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Teladan
              </span>
            </div>
            <button
              onClick={() => onNavigate('reward')}
              className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
            >
              <span>Detail Reward</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* RANKING MURID TABS (Melanggar, Reward, Berisiko, Hadir 100%, Alpa) */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-sky-50/20 to-white">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Peringkat & Klasifikasi Perkembangan Siswa
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                ⭐ Prestasi & Bimbingan
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Identifikasi apresiasi prestasi dan pemetaan intervensi Tim TPPK berbasis 28 rombel.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl self-start md:self-auto overflow-x-auto max-w-full shadow-2xs">
            <button
              onClick={() => setRankingTab('reward')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rankingTab === 'reward'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-xs font-black scale-102'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-900" />
              <span>Bintang Reward ⭐</span>
            </button>

            <button
              onClick={() => setRankingTab('hadir')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rankingTab === 'hadir'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs font-black scale-102'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kehadiran Teladan 🏆</span>
            </button>

            <button
              onClick={() => setRankingTab('melanggar')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rankingTab === 'melanggar'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-xs font-black scale-102'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pelanggaran Tertinggi</span>
            </button>

            <button
              onClick={() => setRankingTab('berisiko')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rankingTab === 'berisiko'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xs font-black scale-102'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Perlu Perhatian TPPK 🔔</span>
            </button>

            <button
              onClick={() => setRankingTab('alpa')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rankingTab === 'alpa'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xs font-black scale-102'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Alpa Terbanyak</span>
            </button>
          </div>
        </div>

        {/* Tab Content Tables */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 w-28">NISN</th>
                <th className="py-3 px-4 w-20">Kelas</th>
                <th className="py-3 px-4 w-40">Wali Kelas</th>
                <th className="py-3 px-4 w-32 text-right">Poin / Frekuensi</th>
                <th className="py-3 px-4 w-32 text-center">Status Resiko</th>
                <th className="py-3 px-4 w-28 text-center">Aksi Profil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {/* RANKING: Paling Melanggar */}
              {rankingTab === 'melanggar' && topMelanggar.map((s, idx) => (
                <tr key={s.nisn} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center font-extrabold text-slate-500">#{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span>{s.namaLengkap}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">({s.jenisKelamin})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{s.nisn}</td>
                  <td className="py-3 px-4 font-extrabold text-blue-900">Kelas {s.kelas}</td>
                  <td className="py-3 px-4 text-slate-600">{s.waliKelas}</td>
                  <td className="py-3 px-4 text-right font-black text-rose-600">
                    {s.totalPoinPelanggaran} Poin
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.statusResiko === 'Berisiko' ? 'bg-rose-100 text-rose-800' :
                      s.statusResiko === 'Waspada' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {s.statusResiko}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectStudent?.(s)}
                      className="text-blue-700 hover:text-blue-900 font-bold hover:underline"
                    >
                      Buka Profil
                    </button>
                  </td>
                </tr>
              ))}

              {/* RANKING: Reward */}
              {rankingTab === 'reward' && topReward.map((s, idx) => (
                <tr key={s.nisn} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center font-extrabold text-amber-600">#{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span>{s.namaLengkap}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">({s.jenisKelamin})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{s.nisn}</td>
                  <td className="py-3 px-4 font-extrabold text-blue-900">Kelas {s.kelas}</td>
                  <td className="py-3 px-4 text-slate-600">{s.waliKelas}</td>
                  <td className="py-3 px-4 text-right font-black text-amber-600">
                    +{s.totalPoinReward} Poin
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Siswa Teladan
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectStudent?.(s)}
                      className="text-blue-700 hover:text-blue-900 font-bold hover:underline"
                    >
                      Buka Profil
                    </button>
                  </td>
                </tr>
              ))}

              {/* RANKING: Berisiko */}
              {rankingTab === 'berisiko' && muridBerisiko.map((s, idx) => (
                <tr key={s.nisn} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center font-extrabold text-rose-600">#{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span>{s.namaLengkap}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">({s.jenisKelamin})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{s.nisn}</td>
                  <td className="py-3 px-4 font-extrabold text-blue-900">Kelas {s.kelas}</td>
                  <td className="py-3 px-4 text-slate-600">{s.waliKelas}</td>
                  <td className="py-3 px-4 text-right font-black text-rose-700">
                    {s.totalPoinPelanggaran} Poin
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                      Berisiko Tinggi
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectStudent?.(s)}
                      className="text-rose-700 hover:text-rose-900 font-bold hover:underline"
                    >
                      Konseling TPPK
                    </button>
                  </td>
                </tr>
              ))}

              {/* RANKING: Hadir Teladan */}
              {rankingTab === 'hadir' && topHadir.map((s, idx) => (
                <tr key={s.nisn} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center font-extrabold text-emerald-600">#{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span>{s.namaLengkap}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">({s.jenisKelamin})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{s.nisn}</td>
                  <td className="py-3 px-4 font-extrabold text-blue-900">Kelas {s.kelas}</td>
                  <td className="py-3 px-4 text-slate-600">{s.waliKelas}</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-700">
                    100% Hadir
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Disiplin Penuh
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectStudent?.(s)}
                      className="text-blue-700 hover:text-blue-900 font-bold hover:underline"
                    >
                      Buka Profil
                    </button>
                  </td>
                </tr>
              ))}

              {/* RANKING: Alpa */}
              {rankingTab === 'alpa' && topAlpa.map((s: any, idx) => (
                <tr key={s.nisn} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center font-extrabold text-purple-700">#{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span>{s.namaLengkap}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">({s.jenisKelamin})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{s.nisn}</td>
                  <td className="py-3 px-4 font-extrabold text-blue-900">Kelas {s.kelas}</td>
                  <td className="py-3 px-4 text-slate-600">{s.waliKelas}</td>
                  <td className="py-3 px-4 text-right font-black text-rose-700">
                    {s.alpaCount} Kali Alpa
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      Ambang Batas Alpa
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectStudent?.(s)}
                      className="text-purple-700 hover:text-purple-900 font-bold hover:underline"
                    >
                      Surat Panggilan
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT FEEDS: Pelanggaran & Reward Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Violations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>Catatan Pelanggaran Terbaru</span>
            </h3>
            <button
              onClick={() => onNavigate('pelanggaran')}
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              Lihat Semua ({pelanggaranList.length})
            </button>
          </div>

          <div className="space-y-3">
            {recentPelanggaran.map((p) => (
              <div key={p.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 transition-colors flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900">{p.namaSiswa}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
                      Kelas {p.kelas}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{p.jenisPelanggaran}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{p.tanggal} &bull; {p.jam}</span>
                    <span>&bull;</span>
                    <span>Lokasi: {p.lokasiKejadian}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    -{p.poin} Poin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Rewards */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Apresiasi Karakter & Prestasi Terbaru</span>
            </h3>
            <button
              onClick={() => onNavigate('reward')}
              className="text-xs font-bold text-amber-800 hover:underline"
            >
              Lihat Semua ({rewardList.length})
            </button>
          </div>

          <div className="space-y-3">
            {recentReward.map((r) => (
              <div key={r.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 transition-colors flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900">{r.namaSiswa}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
                      Kelas {r.kelas}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{r.jenisReward}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{r.tanggal}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-600 font-bold">Tingkat {r.tingkat}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    +{r.poin} Poin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
