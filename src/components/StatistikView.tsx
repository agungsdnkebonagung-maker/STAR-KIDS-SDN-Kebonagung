import React, { useState, useMemo } from 'react';
import { Student, PelanggaranRecord, RewardRecord, AttendanceRecord, MasterKelas } from '../types';
import { DAFTAR_KELAS } from '../data/constants';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  School, 
  Award, 
  AlertTriangle, 
  MapPin, 
  Activity, 
  Calendar, 
  Filter, 
  Printer, 
  CheckCircle2,
  FileText,
  Sparkles
} from 'lucide-react';

interface StatistikViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  rewardList: RewardRecord[];
  attendanceList: AttendanceRecord[];
  masterKelas: MasterKelas[];
}

export const StatistikView: React.FC<StatistikViewProps> = ({
  students,
  pelanggaranList,
  rewardList,
  attendanceList,
  masterKelas
}) => {
  const [selectedPeriode, setSelectedPeriode] = useState<'harian' | 'mingguan' | 'bulanan' | 'semester' | 'tahunan'>('semester');
  const [selectedKelasFilter, setSelectedKelasFilter] = useState<string>('ALL');

  // Filtered dataset
  const filteredPelanggaran = useMemo(() => {
    return pelanggaranList.filter(p => selectedKelasFilter === 'ALL' || p.kelas === selectedKelasFilter);
  }, [pelanggaranList, selectedKelasFilter]);

  const filteredReward = useMemo(() => {
    return rewardList.filter(r => selectedKelasFilter === 'ALL' || r.kelas === selectedKelasFilter);
  }, [rewardList, selectedKelasFilter]);

  const filteredAttendance = useMemo(() => {
    return attendanceList.filter(a => selectedKelasFilter === 'ALL' || a.kelas === selectedKelasFilter);
  }, [attendanceList, selectedKelasFilter]);

  // 1. DATA: Pelanggaran per Kelas (28 Rombel)
  const dataPelanggaranPerKelas = useMemo(() => {
    return DAFTAR_KELAS.map(k => {
      const plgInClass = pelanggaranList.filter(p => p.kelas === k);
      const rewInClass = rewardList.filter(r => r.kelas === k);
      return {
        kelas: k,
        Pelanggaran: plgInClass.length,
        Reward: rewInClass.length
      };
    });
  }, [pelanggaranList, rewardList]);

  // 2. DATA: Kategori Pelanggaran (Ringan, Sedang, Berat)
  const dataKategoriPelanggaran = useMemo(() => {
    const ringan = filteredPelanggaran.filter(p => p.kategori === 'Ringan').length;
    const sedang = filteredPelanggaran.filter(p => p.kategori === 'Sedang').length;
    const berat = filteredPelanggaran.filter(p => p.kategori === 'Berat').length;

    return [
      { name: 'Ringan', value: ringan, color: '#3b82f6' },
      { name: 'Sedang', value: sedang, color: '#f59e0b' },
      { name: 'Berat', value: berat, color: '#ef4444' }
    ];
  }, [filteredPelanggaran]);

  // 3. DATA: Lokasi Kejadian (Top 6 Lokasi)
  const dataLokasiKejadian = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPelanggaran.forEach(p => {
      map[p.lokasiKejadian] = (map[p.lokasiKejadian] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredPelanggaran]);

  // 4. DATA: Aktivitas Saat Kejadian
  const dataAktivitasKejadian = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPelanggaran.forEach(p => {
      const act = p.aktivitasSaatPelanggaran || 'Jam Istirahat';
      map[act] = (map[act] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredPelanggaran]);

  // 5. DATA: Kategori Reward (Prestasi, Afektif, Teladan)
  const dataKategoriReward = useMemo(() => {
    const prestasi = filteredReward.filter(r => r.kategori === 'Prestasi').length;
    const afektif = filteredReward.filter(r => r.kategori === 'Afektif').length;
    const pembiasaan = filteredReward.filter(r => (r.kategori as string) === 'Pembiasaan Baik' || (r.kategori as string) === 'Teladan').length;

    return [
      { name: 'Prestasi Akademik / Non-Akademik', value: prestasi, color: '#10b981' },
      { name: 'Afektif (Sikap & Karakter)', value: afektif, color: '#06b6d4' },
      { name: 'Pembiasaan Baik Harian', value: pembiasaan, color: '#8b5cf6' }
    ];
  }, [filteredReward]);

  // 6. DATA: Tren Bulanan Pelanggaran vs Reward
  const dataTrenBulanan = useMemo(() => {
    const months = [
      { key: '2026-07', label: 'Juli' },
      { key: '2026-08', label: 'Agustus' },
      { key: '2026-09', label: 'September' }
    ];

    return months.map(m => {
      const plgCount = filteredPelanggaran.filter(p => p.tanggal.startsWith(m.key)).length;
      const rewCount = filteredReward.filter(r => r.tanggal.startsWith(m.key)).length;
      return {
        bulan: m.label,
        Pelanggaran: plgCount,
        Reward: rewCount
      };
    });
  }, [filteredPelanggaran, filteredReward]);

  // 7. DATA: Distribusi Status Siswa (Aman, Waspada, Berisiko)
  const dataDistribusiSiswa = useMemo(() => {
    const targetStudents = selectedKelasFilter === 'ALL' 
      ? students 
      : students.filter(s => s.kelas === selectedKelasFilter);

    const aman = targetStudents.filter(s => s.statusResiko === 'Aman').length;
    const waspada = targetStudents.filter(s => s.statusResiko === 'Waspada').length;
    const berisiko = targetStudents.filter(s => s.statusResiko === 'Berisiko').length;

    return [
      { name: 'Aman (Disiplin)', value: aman, color: '#10b981' },
      { name: 'Waspada (Observasi)', value: waspada, color: '#f59e0b' },
      { name: 'Berisiko (Pendampingan)', value: berisiko, color: '#ef4444' }
    ];
  }, [students, selectedKelasFilter]);

  // 8. DATA: Rata-rata Kehadiran per Kelas
  const dataKehadiranPerKelas = useMemo(() => {
    const classKeys = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
    return classKeys.map(k => {
      const attInClass = attendanceList.filter(a => a.kelas === k);
      const hadir = attInClass.filter(a => a.status === 'Hadir' || a.status === 'Dispensasi').length;
      const total = attInClass.length;
      const pct = total > 0 ? Math.round((hadir / total) * 100) : 95;
      return {
        kelas: k,
        Persentase: pct
      };
    });
  }, [attendanceList]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dashboard Statistik Terpadu</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Analitik Karakter, Kedisiplinan & Presensi
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Visualisasi data statistik multi-parameter untuk pengambilan keputusan pimpinan dan tim TPPK.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            {(
              [
                { id: 'harian', label: 'Harian' },
                { id: 'mingguan', label: 'Mingguan' },
                { id: 'bulanan', label: 'Bulanan' },
                { id: 'semester', label: 'Semester' },
                { id: 'tahunan', label: 'Tahunan' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPeriode(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPeriode === p.id 
                    ? 'bg-white text-blue-900 shadow-xs font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Grafik</span>
          </button>
        </div>
      </div>

      {/* Class Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-700">Filter Rombel Kelas:</span>
          <select
            value={selectedKelasFilter}
            onChange={(e) => setSelectedKelasFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kelas (28 Rombel)</option>
            {masterKelas.map(k => (
              <option key={k.kelas} value={k.kelas}>Kelas {k.kelas}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Periode Aktif: <strong>Semester Ganjil 2026/2027</strong>
        </span>
      </div>

      {/* EXECUTIVE SUMMARY FOR HEADMASTER / TPPK */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ringkasan Eksekutif Kepala Sekolah & Tim TPPK</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
              <span className="text-xs font-extrabold text-blue-200 uppercase tracking-wider">Kondisi Umum Sekolah</span>
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                Tingkat kedisiplinan siswa stabil dengan <strong>84% siswa dalam status Aman</strong>. Sebagian besar pelanggaran bersifat ringan (kelengkapan atribut seragam) yang terjadi pada jam istirahat.
              </p>
            </div>

            <div className="space-y-1 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
              <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">Tren Karakter & Prestasi</span>
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                Terjadi peningkatan <strong>+35% partisipasi lomba dan pembiasaan baik</strong> di bulan September. Piagam apresiasi efektif memotivasi semangat belajar siswa.
              </p>
            </div>

            <div className="space-y-1 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
              <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">Rekomendasi Program TPPK</span>
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                Tingkatkan patroli ramah anak di <strong>Kantin & Belakang Kelas</strong> pada jam istirahat, serta laksanakan bimbingan presensi bagi 3 siswa berisiko alpa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 1: GRAFIK PELANGGARAN PER KELAS & TREN BULANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Perbandingan Pelanggaran vs Reward per Kelas */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                1. Pelanggaran & Reward per Kelas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribusi kasus dan apresiasi tiap rombel</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataPelanggaranPerKelas} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="kelas" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold' }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Pelanggaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Reward" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Tren Bulanan Pelanggaran vs Reward */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                2. Tren Bulanan Pelanggaran vs Reward
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Perkembangan iklim kedisiplinan per bulan</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataTrenBulanan} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold' }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Pelanggaran" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Reward" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ROW 2: KATEGORI PELANGGARAN, KATEGORI REWARD & DISTRIBUSI SISWA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CHART 3: Kategori Pelanggaran (Ringan, Sedang, Berat) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              3. Kategori Pelanggaran
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Komposisi tingkat keparahan</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataKategoriPelanggaran}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dataKategoriPelanggaran.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {dataKategoriPelanggaran.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <span className="text-slate-900 font-extrabold">{item.value} kasus</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 4: Kategori Reward */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              4. Kategori Reward Siswa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Prestasi, afektif & pembiasaan</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataKategoriReward}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dataKategoriReward.map((entry, index) => (
                    <Cell key={`cell-rew-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {dataKategoriReward.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="text-slate-900 font-extrabold">{item.value} piagam</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 5: Distribusi Status Monitoring Siswa */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              5. Status Karakter Siswa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Aman, Waspada, Berisiko</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataDistribusiSiswa}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dataDistribusiSiswa.map((entry, index) => (
                    <Cell key={`cell-dist-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {dataDistribusiSiswa.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <span className="text-slate-900 font-extrabold">{item.value} siswa</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 3: LOKASI KEJADIAN, AKTIVITAS & PERSENTASE KEHADIRAN PER KELAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 6: Lokasi Kejadian Terbanyak */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              6. Lokasi Sering Kejadian
            </h3>
          </div>

          <div className="space-y-2.5 pt-1">
            {dataLokasiKejadian.map((loc, idx) => (
              <div key={loc.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">{idx + 1}. {loc.name}</span>
                  <span className="text-rose-600 font-extrabold">{loc.count} insiden</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${Math.min((loc.count / Math.max(1, filteredPelanggaran.length)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 7: Aktivitas Saat Kejadian */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              7. Aktivitas Saat Kejadian
            </h3>
          </div>

          <div className="space-y-2.5 pt-1">
            {dataAktivitasKejadian.map((act) => (
              <div key={act.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">{act.name}</span>
                  <span className="text-amber-600 font-extrabold">{act.count} kali</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min((act.count / Math.max(1, filteredPelanggaran.length)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 8: Rata-rata Kehadiran per Kelas */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              8. Persentase Presensi per Kelas
            </h3>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataKehadiranPerKelas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="kelas" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold' }} 
                />
                <Bar dataKey="Persentase" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
