import React, { useState, useEffect, useMemo } from 'react';
import { Student, PelanggaranRecord, RewardRecord, AttendanceRecord, UserRole } from '../types';
import { 
  User, 
  Calendar, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Printer, 
  FileText, 
  Search, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft,
  BookOpen
} from 'lucide-react';

interface ProfilSiswaViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  rewardList: RewardRecord[];
  attendanceList: AttendanceRecord[];
  role: UserRole;
  selectedStudentNisn?: string;
  onPrintRekapKarakter?: (student: Student) => void;
  onPrintSuratPanggilan?: (student: Student, pelanggaran?: PelanggaranRecord) => void;
}

export const ProfilSiswaView: React.FC<ProfilSiswaViewProps> = ({
  students,
  pelanggaranList,
  rewardList,
  attendanceList,
  role,
  selectedStudentNisn,
  onPrintRekapKarakter,
  onPrintSuratPanggilan
}) => {
  const [activeNisn, setActiveNisn] = useState<string>(() => {
    return selectedStudentNisn || (students.length > 0 ? students[0].nisn : '');
  });

  useEffect(() => {
    if (selectedStudentNisn) {
      setActiveNisn(selectedStudentNisn);
    }
  }, [selectedStudentNisn]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'kehadiran' | 'pelanggaran' | 'reward'>('kehadiran');

  // If selectedStudentNisn changes from parent, sync it
  React.useEffect(() => {
    if (selectedStudentNisn) {
      setActiveNisn(selectedStudentNisn);
    }
  }, [selectedStudentNisn]);

  // Current active student
  const currentStudent = useMemo(() => {
    return students.find(s => s.nisn === activeNisn) || students[0];
  }, [students, activeNisn]);

  // Filter student list for selector
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s => s.namaLengkap.toLowerCase().includes(q) || s.nisn.includes(q) || s.kelas.toLowerCase().includes(q));
  }, [students, searchQuery]);

  // Specific Student Records
  const studentAttendance = useMemo(() => {
    if (!currentStudent) return [];
    return attendanceList
      .filter(a => a.nisn === currentStudent.nisn)
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [attendanceList, currentStudent]);

  const studentPelanggaran = useMemo(() => {
    if (!currentStudent) return [];
    return pelanggaranList
      .filter(p => p.nisn === currentStudent.nisn)
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [pelanggaranList, currentStudent]);

  const studentReward = useMemo(() => {
    if (!currentStudent) return [];
    return rewardList
      .filter(r => r.nisn === currentStudent.nisn)
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [rewardList, currentStudent]);

  // Stats Calculations
  const attendanceStats = useMemo(() => {
    const hadir = studentAttendance.filter(a => a.status === 'Hadir').length;
    const sakit = studentAttendance.filter(a => a.status === 'Sakit').length;
    const izin = studentAttendance.filter(a => a.status === 'Izin').length;
    const alpa = studentAttendance.filter(a => a.status === 'Alpa').length;
    const dispensasi = studentAttendance.filter(a => a.status === 'Dispensasi').length;
    const totalRecorded = hadir + sakit + izin + alpa + dispensasi;
    const persentase = totalRecorded > 0 ? Math.round(((hadir + dispensasi) / totalRecorded) * 100) : 100;
    return { hadir, sakit, izin, alpa, dispensasi, totalRecorded, persentase };
  }, [studentAttendance]);

  const totalPelanggaranPoin = useMemo(() => {
    return studentPelanggaran.reduce((acc, curr) => acc + curr.poin, 0);
  }, [studentPelanggaran]);

  const totalRewardPoin = useMemo(() => {
    return studentReward.reduce((acc, curr) => acc + curr.poin, 0);
  }, [studentReward]);

  const saldoKarakter = totalRewardPoin - totalPelanggaranPoin;

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-bold">Data siswa tidak tersedia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Student Switcher Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Pilih Siswa:
          </label>
          <div className="relative w-full sm:w-80">
            <select
              value={activeNisn}
              onChange={(e) => setActiveNisn(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filteredStudents.map(s => (
                <option key={s.nisn} value={s.nisn}>
                  [{s.kelas}] {s.namaLengkap} ({s.nisn})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onPrintRekapKarakter?.(currentStudent)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Profil Karakter</span>
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar Pill */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 border-2 border-white ring-2 ring-blue-100">
              {currentStudent.namaLengkap.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentStudent.namaLengkap}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                  Kelas {currentStudent.kelas}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                  currentStudent.statusResiko === 'Berisiko' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  currentStudent.statusResiko === 'Waspada' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  Status: {currentStudent.statusResiko}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span>NISN: <strong className="font-mono text-slate-800">{currentStudent.nisn}</strong></span>
                <span>&bull;</span>
                <span>JK: <strong>{currentStudent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</strong></span>
                <span>&bull;</span>
                <span>Wali Kelas: <strong>{currentStudent.waliKelas}</strong></span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium pt-1">
                <span>Orang Tua: <strong>{currentStudent.namaOrangTua}</strong></span>
                <span>&bull;</span>
                <span>No. WA: <strong className="font-mono">{currentStudent.noHpOrangTua}</strong></span>
                {currentStudent.alamat && (
                  <>
                    <span>&bull;</span>
                    <span className="truncate max-w-xs text-slate-600">{currentStudent.alamat}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Character Score Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center min-w-[180px] self-stretch md:self-auto flex flex-col justify-center">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Saldo Poin Karakter</span>
            <span className={`text-3xl font-black mt-1 ${saldoKarakter >= 0 ? 'text-blue-800' : 'text-rose-700'}`}>
              {saldoKarakter >= 0 ? `+${saldoKarakter}` : saldoKarakter}
            </span>
            <span className="text-[10px] text-slate-500 font-bold mt-0.5">
              (+{totalRewardPoin} Rew / −{totalPelanggaranPoin} Plg)
            </span>
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kehadiran Siswa</span>
          <p className="text-xl font-black text-slate-900 mt-1">{attendanceStats.persentase}%</p>
          <span className="text-[10px] text-slate-400">
            {attendanceStats.hadir} Hadir &bull; {attendanceStats.alpa} Alpa
          </span>
        </div>

        <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Reward</span>
          <p className="text-xl font-black text-emerald-900 mt-1">+{totalRewardPoin} Poin</p>
          <span className="text-[10px] text-emerald-700">
            {studentReward.length} Piagam apresiasi
          </span>
        </div>

        <div className="bg-rose-50/70 rounded-xl p-4 border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Total Pelanggaran</span>
          <p className="text-xl font-black text-rose-900 mt-1">−{totalPelanggaranPoin} Poin</p>
          <span className="text-[10px] text-rose-700">
            {studentPelanggaran.length} Catatan tata tertib
          </span>
        </div>

        <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Tindak Lanjut</span>
          <p className="text-base font-extrabold text-blue-950 mt-1.5">
            {studentPelanggaran.length === 0 ? 'Tertib Berprestasi' : 
             studentPelanggaran[0]?.statusPenanganan || 'Selesai'}
          </p>
          <span className="text-[10px] text-blue-700">Catatan mutakhir</span>
        </div>
      </div>

      {/* Tabs for Detailed History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200/80 px-6 py-3 flex items-center gap-4 bg-slate-50/60">
          <button
            type="button"
            onClick={() => setActiveTab('kehadiran')}
            className={`flex items-center gap-2 py-2 border-b-2 text-xs font-extrabold transition-all ${
              activeTab === 'kehadiran'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Riwayat Absensi ({studentAttendance.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reward')}
            className={`flex items-center gap-2 py-2 border-b-2 text-xs font-extrabold transition-all ${
              activeTab === 'reward'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Riwayat Reward & Apresiasi ({studentReward.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pelanggaran')}
            className={`flex items-center gap-2 py-2 border-b-2 text-xs font-extrabold transition-all ${
              activeTab === 'pelanggaran'
                ? 'border-rose-600 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Riwayat Pelanggaran & Tindak Lanjut ({studentPelanggaran.length})</span>
          </button>
        </div>

        {/* TAB 1: RIWAYAT ABSENSI */}
        {activeTab === 'kehadiran' && (
          <div className="p-4 sm:p-6 space-y-4">
            {studentAttendance.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada catatan presensi untuk siswa ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 w-28">Tanggal</th>
                      <th className="py-2.5 px-3 w-28">Status</th>
                      <th className="py-2.5 px-4">Keterangan / Alasan</th>
                      <th className="py-2.5 px-3">Petugas Penginput</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentAttendance.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{a.tanggal}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            a.status === 'Hadir' ? 'bg-emerald-100 text-emerald-800' :
                            a.status === 'Sakit' ? 'bg-amber-100 text-amber-800' :
                            a.status === 'Izin' ? 'bg-blue-100 text-blue-800' :
                            a.status === 'Alpa' ? 'bg-rose-100 text-rose-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {a.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">{a.keterangan || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-medium">{a.inputOleh}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RIWAYAT REWARD */}
        {activeTab === 'reward' && (
          <div className="p-4 sm:p-6 space-y-4">
            {studentReward.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada piagam atau apresiasi yang tercatat.</p>
            ) : (
              <div className="space-y-3">
                {studentReward.map((r) => (
                  <div key={r.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {r.kategori} &bull; {r.tingkat}
                        </span>
                        <span className="text-xs font-mono text-slate-500">{r.tanggal}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">{r.jenisReward}</h4>
                      <p className="text-xs text-slate-600 italic">"{r.catatan}"</p>
                      {r.konversiNilai && (
                        <div className="text-[11px] text-blue-700 font-bold">
                          Konversi Raport: +{r.konversiNilai.poinBonus} Poin ({r.konversiNilai.mataPelajaran}) - Predikat {r.konversiNilai.predikat}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-emerald-700">+{r.poin} Poin</span>
                      <span className="block text-[10px] text-slate-400">Dicatat oleh {r.petugas}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RIWAYAT PELANGGARAN */}
        {activeTab === 'pelanggaran' && (
          <div className="p-4 sm:p-6 space-y-4">
            {studentPelanggaran.length === 0 ? (
              <div className="text-center py-6 text-emerald-600 font-bold flex flex-col items-center gap-1">
                <CheckCircle2 className="w-8 h-8" />
                <span>Siswa ini tidak memiliki catatan pelanggaran (Sangat Disiplin).</span>
              </div>
            ) : (
              <div className="space-y-3">
                {studentPelanggaran.map((p) => (
                  <div key={p.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                          p.kategori === 'Berat' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          p.kategori === 'Sedang' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          Kategori {p.kategori}
                        </span>
                        <span className="text-xs font-mono text-slate-500">{p.tanggal} ({p.jam})</span>
                        <span className="text-xs text-slate-500">&bull; Lokasi: <strong>{p.lokasiKejadian}</strong></span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">{p.jenisPelanggaran}</h4>
                      <p className="text-xs text-slate-600">Catatan: {p.catatan}</p>
                      
                      <div className="bg-white p-2 rounded-lg border border-slate-200 text-xs text-slate-700">
                        <strong>Tindak Lanjut TPPK:</strong> {p.tindakLanjut} &bull; 
                        <span className="font-bold text-amber-700 ml-1">Status: {p.statusPenanganan}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-2">
                      <div>
                        <span className="text-lg font-black text-rose-700">−{p.poin} Poin</span>
                        <span className="block text-[10px] text-slate-400">Petugas: {p.petugas}</span>
                      </div>

                      {role === 'admin' && p.poin >= 20 && (
                        <button
                          type="button"
                          onClick={() => onPrintSuratPanggilan?.(currentStudent, p)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-extrabold transition-colors shadow-xs"
                        >
                          Cetak Surat Panggilan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
