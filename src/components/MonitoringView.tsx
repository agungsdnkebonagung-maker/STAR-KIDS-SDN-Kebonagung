import React, { useState, useMemo } from 'react';
import { Student, PelanggaranRecord, RewardRecord, AttendanceRecord, UserRole, SystemSettings } from '../types';
import { DAFTAR_KELAS } from '../data/constants';
import { 
  AlertTriangle, 
  Award, 
  BellRing, 
  Search, 
  Filter, 
  Printer, 
  MessageCircle, 
  FileText, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  Phone,
  UserCheck
} from 'lucide-react';

interface MonitoringViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  rewardList: RewardRecord[];
  attendanceList: AttendanceRecord[];
  systemSettings: SystemSettings;
  role: UserRole;
  onSelectStudentProfile?: (student: Student) => void;
  onPrintSuratPanggilan?: (student: Student, pelanggaran?: PelanggaranRecord) => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  students,
  pelanggaranList,
  rewardList,
  attendanceList,
  systemSettings,
  role,
  onSelectStudentProfile,
  onPrintSuratPanggilan
}) => {
  const [activeTab, setActiveTab] = useState<'perlu_monitoring' | 'pelanggaran_terbanyak' | 'reward_terbanyak'>('perlu_monitoring');
  const [filterKelas, setFilterKelas] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. RANKING REWARD TERBANYAK (Top Reward ⭐)
  const topRewardStudents = useMemo(() => {
    return [...students]
      .filter(s => filterKelas === 'ALL' || s.kelas === filterKelas)
      .filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.namaLengkap.toLowerCase().includes(q) || s.nisn.includes(q);
      })
      .sort((a, b) => b.totalPoinReward - a.totalPoinReward);
  }, [students, filterKelas, searchQuery]);

  // 2. RANKING PELANGGARAN TERBANYAK (⚠️ Monitoring Internal TPPK)
  const topPelanggaranStudents = useMemo(() => {
    return [...students]
      .filter(s => filterKelas === 'ALL' || s.kelas === filterKelas)
      .filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.namaLengkap.toLowerCase().includes(q) || s.nisn.includes(q);
      })
      .sort((a, b) => b.totalPoinPelanggaran - a.totalPoinPelanggaran);
  }, [students, filterKelas, searchQuery]);

  // 3. PERLU MONITORING & PENDAMPINGAN (🔔)
  // Combines: high alpa, low attendance, repeated violations, or approaching thresholds
  const perluMonitoringList = useMemo(() => {
    return students
      .filter(s => filterKelas === 'ALL' || s.kelas === filterKelas)
      .filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.namaLengkap.toLowerCase().includes(q) || s.nisn.includes(q);
      })
      .map(student => {
        const studentAttendance = attendanceList.filter(a => a.nisn === student.nisn);
        const hadir = studentAttendance.filter(a => a.status === 'Hadir').length;
        const alpa = studentAttendance.filter(a => a.status === 'Alpa').length;
        const dispensasi = studentAttendance.filter(a => a.status === 'Dispensasi').length;
        const totalRecorded = studentAttendance.length;
        const pctKehadiran = totalRecorded > 0 ? Math.round(((hadir + dispensasi) / totalRecorded) * 100) : 100;

        const studentPlg = pelanggaranList.filter(p => p.nisn === student.nisn);
        const beratPlgCount = studentPlg.filter(p => p.kategori === 'Berat').length;

        // Reason checks
        const reasons: string[] = [];
        let riskScore = 0;

        if (student.statusResiko === 'Berisiko' || student.totalPoinPelanggaran >= 40) {
          reasons.push(`Poin pelanggaran tinggi (${student.totalPoinPelanggaran} poin)`);
          riskScore += 3;
        } else if (student.statusResiko === 'Waspada' || student.totalPoinPelanggaran >= 20) {
          reasons.push(`Poin pelanggaran waspada (${student.totalPoinPelanggaran} poin)`);
          riskScore += 2;
        }

        if (alpa >= systemSettings.alpaRisiko) {
          reasons.push(`Alpa tinggi (${alpa} kali)`);
          riskScore += 3;
        } else if (alpa >= systemSettings.alpaPerhatian) {
          reasons.push(`Alpa perlu perhatian (${alpa} kali)`);
          riskScore += 2;
        }

        if (totalRecorded >= 4 && pctKehadiran < systemSettings.kehadiranTindakLanjutPct) {
          reasons.push(`Presensi sangat rendah (${pctKehadiran}%)`);
          riskScore += 2;
        }

        if (beratPlgCount > 0) {
          reasons.push(`Tercatat ${beratPlgCount} pelanggaran kategori Berat`);
          riskScore += 3;
        }

        return {
          student,
          reasons,
          riskScore,
          alpa,
          pctKehadiran,
          pelanggaranCount: studentPlg.length,
          latestPelanggaran: studentPlg[0]
        };
      })
      .filter(item => item.riskScore > 0)
      .sort((a, b) => b.riskScore - a.riskScore || b.student.totalPoinPelanggaran - a.student.totalPoinPelanggaran);
  }, [students, attendanceList, pelanggaranList, systemSettings, filterKelas, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 mb-2">
            <BellRing className="w-3.5 h-3.5 text-amber-600" />
            <span>Radar Monitoring & Pendampingan TPPK</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pusat Monitoring Siswa Terintegrasi
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Mencatat bukan untuk menghukum, tetapi untuk membimbing dan memberikan intervensi edukatif tepat waktu.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('perlu_monitoring')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'perlu_monitoring'
                ? 'bg-white text-blue-900 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BellRing className="w-4 h-4 text-amber-600" />
            <span>Perlu Monitoring 🔔</span>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {perluMonitoringList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reward_terbanyak')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reward_terbanyak'
                ? 'bg-white text-blue-900 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Bintang Prestasi ⭐</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pelanggaran_terbanyak')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pelanggaran_terbanyak'
                ? 'bg-white text-blue-900 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Evaluasi Tertib ⚠️</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kelas (28 Rombel)</option>
              {DAFTAR_KELAS.map(k => (
                <option key={k} value={k}>Kelas {k}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-end sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>Cetak Lembar Monitoring</span>
        </button>
      </div>

      {/* TAB 1: PERLU MONITORING (🔔) */}
      {activeTab === 'perlu_monitoring' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-3">
            <BellRing className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Pemberitahuan Tim TPPK & Wali Kelas:</strong> Daftar siswa berikut memerlukan observasi berkala dan intervensi pembinaan kolaboratif antara sekolah dan orang tua. Pastikan pembinaan dilakukan secara persuasif dan mengedepankan hak anak.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {perluMonitoringList.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
                <ShieldAlert className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-800 font-extrabold text-sm">Tidak ada siswa dalam kategori monitoring saat ini.</p>
                <p className="text-slate-500 text-xs mt-1">Seluruh siswa berada dalam batas aman tata tertib dan presensi.</p>
              </div>
            ) : (
              perluMonitoringList.map((item) => (
                <div 
                  key={item.student.nisn}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.riskScore >= 5 ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {item.riskScore >= 5 ? 'Prioritas Tindak Lanjut' : 'Observasi Berkala'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">Kelas {item.student.kelas}</span>
                    </div>

                    <div>
                      <h4 
                        onClick={() => onSelectStudentProfile?.(item.student)}
                        className="text-base font-black text-slate-900 hover:text-blue-700 cursor-pointer"
                      >
                        {item.student.namaLengkap}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">NISN: {item.student.nisn}</p>
                    </div>

                    {/* Reasons Checklist */}
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Indikator Terdeteksi:</span>
                      {item.reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      Wali Kelas: <strong className="text-slate-700">{item.student.waliKelas}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectStudentProfile?.(item.student)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900"
                    >
                      Buka Profil &rarr;
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/${item.student.noHpOrangTua.replace(/^0/, '62')}?text=Assalamu%27alaikum%20Bapak/Ibu%20Wali%20dari%20${encodeURIComponent(item.student.namaLengkap)},%20kami%20dari%20Tim%20TPPK%20UPT%20SDN%20Kebonagung%20Kota%20Pasuruan%20ingin%20berkoordinasi%20mengenai%20perkembangan%20putra/putri%20Bapak/Ibu...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Hubungi Ortu</span>
                      </a>

                      {role === 'admin' && item.student.totalPoinPelanggaran >= 20 && (
                        <button
                          type="button"
                          onClick={() => onPrintSuratPanggilan?.(item.student, item.latestPelanggaran)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Surat Panggilan</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BINTANG REWARD TERBANYAK (⭐) */}
      {activeTab === 'reward_terbanyak' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Peringkat Bintang Karakter & Apresiasi Terbanyak
            </h3>
            <span className="text-xs text-emerald-700 font-bold">Teladan Karakter SDN Kebonagung</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-12 text-center">Rank</th>
                  <th className="py-3 px-4 w-28">NISN</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-3 text-center">Kelas</th>
                  <th className="py-3 px-4 text-center">Total Reward Didapat</th>
                  <th className="py-3 px-4 text-center">Total Poin Apresiasi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {topRewardStudents.slice(0, 15).map((st, idx) => (
                  <tr key={st.nisn} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center font-black">
                      {idx === 0 ? <span className="text-amber-500 font-black">🥇 1</span> :
                       idx === 1 ? <span className="text-slate-400 font-black">🥈 2</span> :
                       idx === 2 ? <span className="text-amber-700 font-black">🥉 3</span> :
                       idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{st.nisn}</td>
                    <td className="py-3 px-4">
                      <span 
                        onClick={() => onSelectStudentProfile?.(st)}
                        className="font-extrabold text-slate-900 hover:text-blue-700 cursor-pointer"
                      >
                        {st.namaLengkap}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{st.kelas}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-600">{rewardList.filter(r => r.nisn === st.nisn).length} Piagam</td>
                    <td className="py-3 px-4 text-center font-black text-emerald-700 text-sm">
                      +{st.totalPoinReward} Poin
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectStudentProfile?.(st)}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Lihat Prestasi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EVALUASI PELANGGARAN TERBANYAK (⚠️) */}
      {activeTab === 'pelanggaran_terbanyak' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Peringkat Akumulasi Pelanggaran (Khusus Monitoring Internal)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Instrumen diagnostik internal guru & TPPK untuk penanganan suportif.
              </p>
            </div>
            <span className="text-xs text-rose-700 font-bold">Kerahasiaan Terjaga</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-12 text-center">Rank</th>
                  <th className="py-3 px-4 w-28">NISN</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-3 text-center">Kelas</th>
                  <th className="py-3 px-4 text-center">Total Pelanggaran</th>
                  <th className="py-3 px-4 text-center">Total Poin Pelanggaran</th>
                  <th className="py-3 px-4 text-center">Status Risiko</th>
                  <th className="py-3 px-4 text-center">Aksi Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {topPelanggaranStudents.slice(0, 15).map((st, idx) => (
                  <tr key={st.nisn} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-slate-600">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{st.nisn}</td>
                    <td className="py-3 px-4">
                      <span 
                        onClick={() => onSelectStudentProfile?.(st)}
                        className="font-extrabold text-slate-900 hover:text-blue-700 cursor-pointer"
                      >
                        {st.namaLengkap}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{st.kelas}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-600">{pelanggaranList.filter(p => p.nisn === st.nisn).length} Kali</td>
                    <td className="py-3 px-4 text-center font-black text-rose-700 text-sm">
                      −{st.totalPoinPelanggaran} Poin
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        st.statusResiko === 'Berisiko' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        st.statusResiko === 'Waspada' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {st.statusResiko}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectStudentProfile?.(st)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Detail Riwayat
                        </button>
                        {role === 'admin' && st.totalPoinPelanggaran >= 20 && (
                          <button
                            type="button"
                            onClick={() => onPrintSuratPanggilan?.(st)}
                            className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                          >
                            Surat Panggilan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
