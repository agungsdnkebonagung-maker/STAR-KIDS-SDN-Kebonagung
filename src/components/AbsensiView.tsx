import React, { useState, useMemo } from 'react';
import { 
  Student, 
  AttendanceRecord, 
  AttendanceStatus, 
  UserRole, 
  MasterKelas,
  SystemSettings 
} from '../types';
import { 
  Calendar, 
  CheckCircle2, 
  Download, 
  Printer, 
  Filter, 
  Search, 
  Save, 
  Users, 
  AlertTriangle,
  FileSpreadsheet,
  Check,
  BellRing,
  Eye,
  Edit3,
  MessageCircle,
  BarChart3,
  ClipboardList,
  Sparkles,
  Info,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StatistikKehadiranView } from './StatistikKehadiranView';
import { OfficialPrintModal, AttendanceRekapPrintData } from './OfficialPrintModal';

interface AbsensiViewProps {
  students: Student[];
  attendanceList: AttendanceRecord[];
  masterKelas: MasterKelas[];
  systemSettings: SystemSettings;
  role: UserRole;
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  onPrintRekap?: (filteredList: AttendanceRecord[], kelas: string, periode: string) => void;
  onSelectStudentProfile?: (student: Student) => void;
  onNavigate?: (tab: string) => void;
  initialSubTab?: 'input' | 'rekap' | 'statistik' | 'monitoring';
  initialKelas?: string;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const AbsensiView: React.FC<AbsensiViewProps> = ({
  students,
  attendanceList,
  masterKelas,
  systemSettings,
  role,
  onSaveAttendance,
  onSelectStudentProfile,
  onNavigate,
  initialSubTab = 'input',
  initialKelas = '1A',
  onRefreshData,
  isRefreshing = false
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'input' | 'rekap' | 'statistik' | 'monitoring'>(initialSubTab);

  // Sync initialSubTab if changed from outside
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // --- SUBTAB 1: INPUT PRESENSI HARIAN ---
  const [inputTanggal, setInputTanggal] = useState<string>('2026-09-18');
  const [inputKelas, setInputKelas] = useState<string>(() => initialKelas || '1A');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [tempAttendanceMap, setTempAttendanceMap] = useState<Record<string, { status: AttendanceStatus; keterangan: string }>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState<boolean>(false);
  const [isReadOnlyPreview, setIsReadOnlyPreview] = useState<boolean>(false);

  // Sync initialKelas when changed externally (e.g. from Dashboard click on Kelas 1A)
  React.useEffect(() => {
    if (initialKelas) {
      setInputKelas(initialKelas);
    }
  }, [initialKelas]);

  // Normalize class string to handle variations like "1A", "Kelas 1A", "1-A"
  const normalizeKelas = (k: string) => (k || '').replace(/kelas\s*/i, '').replace(/[-\s]/g, '').trim().toUpperCase();

  // Print Modal state for Rekap
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Selected class info
  const selectedKelasInfo = useMemo(() => {
    const target = normalizeKelas(inputKelas);
    return masterKelas.find(k => normalizeKelas(k.kelas) === target) || {
      kelas: inputKelas,
      waliKelas: target === '1A' ? 'Siti Rahmawati, S.Pd.' : 'Guru Kelas SDN Kebonagung',
      nipWaliKelas: target === '1A' ? '19840512 200902 2 006' : '19850101 201001 1 001',
      tahunAjaran: systemSettings.tahunAjaran
    };
  }, [masterKelas, inputKelas, systemSettings.tahunAjaran]);

  // Students in selected class
  const classStudents = useMemo(() => {
    const target = normalizeKelas(inputKelas);
    return students.filter(s => normalizeKelas(s.kelas) === target);
  }, [students, inputKelas]);

  // Filtered students based on search input
  const filteredClassStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return classStudents;
    const q = studentSearchQuery.toLowerCase().trim();
    return classStudents.filter(s => 
      s.namaLengkap.toLowerCase().includes(q) ||
      s.nisn.includes(q)
    );
  }, [classStudents, studentSearchQuery]);

  // Check if data already exists for selected date and class (Anti-duplikasi check)
  const existingRecordsForClassDate = useMemo(() => {
    const target = normalizeKelas(inputKelas);
    return attendanceList.filter(a => a.tanggal === inputTanggal && normalizeKelas(a.kelas) === target);
  }, [attendanceList, inputTanggal, inputKelas]);

  // Load existing records or set default 'Hadir' when date or class changes
  React.useEffect(() => {
    const newMap: Record<string, { status: AttendanceStatus; keterangan: string }> = {};
    classStudents.forEach(st => {
      const existing = existingRecordsForClassDate.find(e => e.nisn === st.nisn);
      if (existing) {
        newMap[st.nisn] = {
          status: existing.status,
          keterangan: existing.keterangan || ''
        };
      } else {
        newMap[st.nisn] = {
          status: 'Hadir',
          keterangan: ''
        };
      }
    });
    setTempAttendanceMap(newMap);
    setSaveSuccessMsg(null);
    setIsReadOnlyPreview(false);
  }, [inputKelas, inputTanggal, classStudents, existingRecordsForClassDate]);

  const handleStatusChange = (nisn: string, status: AttendanceStatus) => {
    if (isReadOnlyPreview) return;
    setTempAttendanceMap(prev => ({
      ...prev,
      [nisn]: {
        ...prev[nisn],
        status
      }
    }));
  };

  const handleKeteranganChange = (nisn: string, keterangan: string) => {
    if (isReadOnlyPreview) return;
    setTempAttendanceMap(prev => ({
      ...prev,
      [nisn]: {
        ...prev[nisn],
        keterangan
      }
    }));
  };

  const handleSetAllHadir = () => {
    if (isReadOnlyPreview) return;
    const updated: Record<string, { status: AttendanceStatus; keterangan: string }> = {};
    classStudents.forEach(st => {
      updated[st.nisn] = {
        status: 'Hadir',
        keterangan: ''
      };
    });
    setTempAttendanceMap(updated);
  };

  // Real-time counter of current input form
  const currentInputCounters = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let dispensasi = 0;

    classStudents.forEach(st => {
      const entry = tempAttendanceMap[st.nisn] || { status: 'Hadir', keterangan: '' };
      if (entry.status === 'Hadir') hadir++;
      else if (entry.status === 'Sakit') sakit++;
      else if (entry.status === 'Izin') izin++;
      else if (entry.status === 'Alpa') alpa++;
      else if (entry.status === 'Dispensasi') dispensasi++;
    });

    const total = classStudents.length;
    const pct = total > 0 ? Math.round(((hadir + dispensasi) / total) * 1000) / 10 : 100;

    return { hadir, sakit, izin, alpa, dispensasi, total, pct };
  }, [classStudents, tempAttendanceMap]);

  // Execute saving (Ensures 1 student + 1 date = 1 record)
  const executeSaveAttendance = () => {
    const nowTimestamp = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(new Date());

    const recordsToSave: AttendanceRecord[] = classStudents.map(st => {
      const entry = tempAttendanceMap[st.nisn] || { status: 'Hadir', keterangan: '' };
      return {
        id: `ATT-${inputTanggal.replace(/-/g, '')}-${st.nisn}`,
        student_id: (st as any).id || st.nisn,
        tanggal: inputTanggal,
        nisn: st.nisn,
        nama: st.namaLengkap,
        jenisKelamin: st.jenisKelamin,
        kelas: st.kelas,
        waliKelas: selectedKelasInfo.waliKelas,
        status: entry.status,
        keterangan: entry.keterangan || undefined,
        inputOleh: role === 'admin' ? `Admin (${selectedKelasInfo.waliKelas})` : 'Petugas Guru',
        timestamp: nowTimestamp,
        updatedAt: nowTimestamp,
        syncedToSheet: true
      };
    });

    onSaveAttendance(recordsToSave);
    setOverwriteConfirmOpen(false);
    setIsReadOnlyPreview(false);
    setSaveSuccessMsg(`Data absensi Kelas ${inputKelas} tanggal ${inputTanggal} berhasil disimpan (${recordsToSave.length} siswa tercatat).`);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingRecordsForClassDate.length > 0) {
      setOverwriteConfirmOpen(true);
    } else {
      executeSaveAttendance();
    }
  };

  // --- SUBTAB 2: REKAPITULASI PRESENSI ---
  const [rekapKelas, setRekapKelas] = useState<string>('ALL');
  const [rekapBulan, setRekapBulan] = useState<string>('09');
  const [rekapSearch, setRekapSearch] = useState<string>('');
  const [rekapStatusFilter, setRekapStatusFilter] = useState<'ALL' | 'ALPA' | 'PRIMA'>('ALL');

  // Calculate student attendance totals
  const studentRekapStats = useMemo(() => {
    return students
      .filter(s => rekapKelas === 'ALL' || normalizeKelas(s.kelas) === normalizeKelas(rekapKelas))
      .filter(s => {
        if (!rekapSearch.trim()) return true;
        const q = rekapSearch.toLowerCase();
        return s.namaLengkap.toLowerCase().includes(q) || s.nisn.includes(q);
      })
      .map(student => {
        const studentRecords = attendanceList.filter(a => {
          const matchStudent = a.nisn === student.nisn;
          const matchMonth = rekapBulan === 'ALL' || a.tanggal.startsWith(`2026-${rekapBulan}`);
          return matchStudent && matchMonth;
        });

        const hadir = studentRecords.filter(a => a.status === 'Hadir').length;
        const sakit = studentRecords.filter(a => a.status === 'Sakit').length;
        const izin = studentRecords.filter(a => a.status === 'Izin').length;
        const alpa = studentRecords.filter(a => a.status === 'Alpa').length;
        const dispensasi = studentRecords.filter(a => a.status === 'Dispensasi').length;

        const totalRecorded = hadir + sakit + izin + alpa + dispensasi;
        const persentase = totalRecorded > 0 
          ? Math.round(((hadir + dispensasi) / totalRecorded) * 1000) / 10
          : 100;

        return {
          student,
          hadir,
          sakit,
          izin,
          alpa,
          dispensasi,
          totalRecorded,
          persentase
        };
      })
      .filter(item => {
        if (rekapStatusFilter === 'ALPA') return item.alpa > 0;
        if (rekapStatusFilter === 'PRIMA') return item.persentase >= 98 && item.alpa === 0;
        return true;
      });
  }, [students, attendanceList, rekapKelas, rekapBulan, rekapSearch, rekapStatusFilter]);

  // Overall Rekap Totals
  const overallTotals = useMemo(() => {
    let tHadir = 0;
    let tSakit = 0;
    let tIzin = 0;
    let tAlpa = 0;
    let tDispensasi = 0;
    studentRekapStats.forEach(st => {
      tHadir += st.hadir;
      tSakit += st.sakit;
      tIzin += st.izin;
      tAlpa += st.alpa;
      tDispensasi += st.dispensasi;
    });
    const totalAll = tHadir + tSakit + tIzin + tAlpa + tDispensasi;
    const avgPersentase = totalAll > 0 
      ? Math.round(((tHadir + tDispensasi) / totalAll) * 1000) / 10 
      : 100;
    return { tHadir, tSakit, tIzin, tAlpa, tDispensasi, totalAll, avgPersentase };
  }, [studentRekapStats]);

  // Export Excel (.xlsx) using xlsx library
  const handleExportExcel = () => {
    const data = studentRekapStats.map((st, idx) => ({
      'No': idx + 1,
      'NISN': st.student.nisn,
      'Nama Lengkap': st.student.namaLengkap,
      'Jenis Kelamin': st.student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'Kelas': st.student.kelas,
      'Wali Kelas': st.student.waliKelas || '',
      'Hadir (H)': st.hadir,
      'Sakit (S)': st.sakit,
      'Izin (I)': st.izin,
      'Alpa (A)': st.alpa,
      'Dispensasi (D)': st.dispensasi,
      'Total Pertemuan': st.totalRecorded,
      'Persentase (%)': `${st.persentase}%`,
      'Status': st.alpa >= systemSettings.alpaRisiko || st.persentase < systemSettings.kehadiranTindakLanjutPct
        ? 'Perlu Tindak Lanjut'
        : st.alpa >= systemSettings.alpaPerhatian || st.persentase < systemSettings.kehadiranMonitoringPct
        ? 'Perlu Perhatian'
        : 'Tertib Prima'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Presensi');
    XLSX.writeFile(workbook, `Rekap_Presensi_SDN_Kebonagung_Kelas_${rekapKelas}_Bulan_${rekapBulan}.xlsx`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['NISN', 'Nama Lengkap', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Dispensasi', 'Persentase Kehadiran'];
    const rows = studentRekapStats.map(r => [
      `"${r.student.nisn}"`,
      `"${r.student.namaLengkap}"`,
      `"${r.student.kelas}"`,
      r.hadir,
      r.sakit,
      r.izin,
      r.alpa,
      r.dispensasi,
      `"${r.persentase}%"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Presensi_SDN_Kebonagung_${rekapKelas}_${rekapBulan}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare Official Print Data
  const attendanceRekapPrintPayload: AttendanceRekapPrintData = useMemo(() => {
    const classInfo = masterKelas.find(k => k.kelas === (rekapKelas === 'ALL' ? '5A' : rekapKelas)) || {
      waliKelas: 'Guru Kelas SDN Kebonagung',
      nipWaliKelas: '19850101 201001 1 001'
    };

    const bulanLabel = rekapBulan === '09' ? 'September 2026' : rekapBulan === '08' ? 'Agustus 2026' : rekapBulan === '07' ? 'Juli 2026' : 'Semua Bulan';

    return {
      kelas: rekapKelas === 'ALL' ? 'Semua Kelas (1A - 6B)' : rekapKelas,
      waliKelas: classInfo.waliKelas,
      nipWaliKelas: classInfo.nipWaliKelas || '19850101 201001 1 001',
      tahunAjaran: systemSettings.tahunAjaran,
      semester: systemSettings.semester,
      bulan: bulanLabel,
      rows: studentRekapStats.map((st, idx) => ({
        no: idx + 1,
        nisn: st.student.nisn,
        nama: st.student.namaLengkap,
        jk: st.student.jenisKelamin,
        h: st.hadir,
        s: st.sakit,
        i: st.izin,
        a: st.alpa,
        d: st.dispensasi,
        total: st.totalRecorded,
        persentase: Math.round(st.persentase),
        keterangan: st.alpa > 0 ? `Alpa ${st.alpa}x` : st.persentase >= 95 ? 'Tertib Sangat Baik' : '-'
      }))
    };
  }, [rekapKelas, rekapBulan, masterKelas, systemSettings, studentRekapStats]);

  // --- SUBTAB 4: MONITORING KEHADIRAN (Section 12) ---
  // Categorization:
  // >= 95% -> Normal (Hijau)
  // 90 - 94.99% -> Perlu Perhatian (Kuning)
  // 80 - 89.99% -> Monitoring (Oranye)
  // < 80% -> Perlu Tindak Lanjut (Merah)
  const monitoringList = useMemo(() => {
    return students
      .map(student => {
        const studentRecords = attendanceList.filter(a => a.nisn === student.nisn);
        const hadir = studentRecords.filter(a => a.status === 'Hadir').length;
        const dispensasi = studentRecords.filter(a => a.status === 'Dispensasi').length;
        const sakit = studentRecords.filter(a => a.status === 'Sakit').length;
        const izin = studentRecords.filter(a => a.status === 'Izin').length;
        const alpa = studentRecords.filter(a => a.status === 'Alpa').length;
        const total = hadir + dispensasi + sakit + izin + alpa;

        const persentase = total > 0 ? Math.round(((hadir + dispensasi) / total) * 1000) / 10 : 100;

        let statusCategory: 'normal' | 'perhatian' | 'monitoring' | 'tindak_lanjut' = 'normal';
        let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        let label = '🟢 Normal';
        let rekomendasi = 'Pertahankan disiplin kehadiran dan pembiasaan positif di sekolah.';

        if (persentase < systemSettings.kehadiranTindakLanjutPct || alpa >= systemSettings.alpaRisiko) {
          statusCategory = 'tindak_lanjut';
          badgeColor = 'bg-rose-100 text-rose-900 border-rose-300 ring-1 ring-rose-200';
          label = '🔴 Perlu Tindak Lanjut';
          rekomendasi = 'Wali kelas berkoordinasi dengan Tim TPPK untuk kunjungan rumah (home visit) dan dialog personal ramah anak dengan orang tua.';
        } else if (persentase < systemSettings.kehadiranMonitoringPct || alpa >= systemSettings.alpaPerhatian) {
          statusCategory = 'monitoring';
          badgeColor = 'bg-orange-100 text-orange-900 border-orange-300';
          label = '🟠 Monitoring';
          rekomendasi = 'Pendampingan khusus wali kelas guna mengidentifikasi kendala siswa (kesehatan, transportasi, atau psikologis).';
        } else if (persentase < 95 || alpa >= 1) {
          statusCategory = 'perhatian';
          badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
          label = '🟡 Perlu Perhatian';
          rekomendasi = 'Konfirmasi santun kepada orang tua melalui pesan WhatsApp untuk memastikan keadaan siswa.';
        }

        return {
          student,
          hadir,
          sakit,
          izin,
          alpa,
          dispensasi,
          total,
          persentase,
          statusCategory,
          badgeColor,
          label,
          rekomendasi
        };
      })
      .filter(m => m.statusCategory !== 'normal')
      .sort((a, b) => a.persentase - b.persentase);
  }, [students, attendanceList, systemSettings]);

  return (
    <div className="space-y-6">
      
      {/* Top Navigation Submenu Bar (4 Submenus: Section 2) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-700" />
            <span>MODUL ABSENSI SISWA TERINTEGRASI</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Presensi harian, rekapitulasi, grafik analitik, dan radar monitoring edukatif SDN Kebonagung.
          </p>
        </div>

        {/* 4 Submenu Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('input')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'input'
                ? 'bg-white text-blue-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Absensi Hari Ini</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('rekap')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'rekap'
                ? 'bg-white text-blue-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Rekap Absensi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('statistik')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'statistik'
                ? 'bg-white text-blue-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Statistik Kehadiran</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('monitoring')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'monitoring'
                ? 'bg-white text-blue-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BellRing className="w-4 h-4 text-amber-600" />
            <span>Monitoring Kehadiran</span>
            {monitoringList.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
                {monitoringList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: FORM INPUT ABSENSI HARI INI                     */}
      {/* ======================================================== */}
      {activeSubTab === 'input' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <form onSubmit={handleSubmitAttendance} className="space-y-6">
              
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Tanggal Presensi
                  </label>
                  <input
                    type="date"
                    value={inputTanggal}
                    onChange={(e) => setInputTanggal(e.target.value)}
                    disabled={role !== 'admin'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Pilih Kelas (Rombel)
                  </label>
                  <select
                    value={inputKelas}
                    onChange={(e) => setInputKelas(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    {masterKelas.map(k => (
                      <option key={k.kelas} value={k.kelas}>
                        Kelas {k.kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Wali Kelas
                  </label>
                  <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 truncate">
                    {selectedKelasInfo.waliKelas}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Tahun Ajaran & Semester
                  </label>
                  <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 truncate">
                    {systemSettings.tahunAjaran} ({systemSettings.semester})
                  </div>
                </div>
              </div>

              {/* Anti-duplikasi Banner & Action Options (Section 4) */}
              {existingRecordsForClassDate.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 font-medium animate-fadeIn">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <span className="font-extrabold text-amber-950">
                        Data Presensi Sudah Ada ({existingRecordsForClassDate.length} Siswa Terdata)
                      </span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Presensi untuk <strong>Kelas {inputKelas}</strong> pada tanggal <strong>{inputTanggal}</strong> telah diinput sebelumnya. Sistem mencegah duplikasi data (1 siswa + 1 tanggal = 1 record).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsReadOnlyPreview(!isReadOnlyPreview)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isReadOnlyPreview 
                          ? 'bg-amber-200 text-amber-900 border border-amber-300' 
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isReadOnlyPreview ? 'Mode Edit' : 'Lihat Data'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReadOnlyPreview(false);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit / Perbarui</span>
                    </button>
                  </div>
                </div>
              )}

              {saveSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-950 font-bold animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Action Bar Above Table */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Users className="w-4 h-4 text-blue-700" />
                    <span>Total Siswa Rombel: <strong className="text-slate-900 font-black">{classStudents.length} Siswa</strong></span>
                  </div>
                  <span className="hidden sm:inline text-slate-300">&bull;</span>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Default: Hadir</span>
                  </div>
                  {studentSearchQuery && (
                    <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      Menampilkan: {filteredClassStudents.length} dari {classStudents.length} Siswa
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search box for students in class */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau NISN..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-44 sm:w-56"
                    />
                    {studentSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setStudentSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {onRefreshData && (
                    <button
                      type="button"
                      onClick={onRefreshData}
                      disabled={isRefreshing}
                      title="Perbarui & Sinkronkan Data Realtime"
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="hidden md:inline">Update Data</span>
                    </button>
                  )}

                  {role === 'admin' && !isReadOnlyPreview && (
                    <>
                      <button
                        type="button"
                        onClick={handleSetAllHadir}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Set Semua Hadir</span>
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>SIMPAN ABSENSI KELAS {inputKelas}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Student Attendance Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                      <th className="py-3 px-3 w-12 text-center">No</th>
                      <th className="py-3 px-4 w-28">NISN</th>
                      <th className="py-3 px-4">Nama Lengkap Siswa</th>
                      <th className="py-3 px-3 text-center w-16">L/P</th>
                      <th className="py-3 px-4 min-w-[380px]">Status Kehadiran</th>
                      <th className="py-3 px-4 min-w-[260px]">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {classStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <Users className="w-10 h-10 text-slate-300 mx-auto" />
                            <p className="text-slate-800 font-extrabold text-sm">
                              Belum ada siswa terdaftar di Kelas {inputKelas}.
                            </p>
                            <p className="text-slate-500 text-xs">
                              Data siswa untuk kelas ini dapat dimuat ulang dan disinkronkan secara otomatis.
                            </p>
                            {onRefreshData && (
                              <button
                                type="button"
                                onClick={onRefreshData}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>Muat Ulang Data Siswa Kelas {inputKelas}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : filteredClassStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                          Tidak ada siswa yang cocok dengan pencarian "{studentSearchQuery}".
                        </td>
                      </tr>
                    ) : (
                      filteredClassStudents.map((st, idx) => {
                        const currentVal = tempAttendanceMap[st.nisn] || { status: 'Hadir', keterangan: '' };
                        return (
                          <tr key={st.nisn} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                            <td className="py-3 px-4">
                              <span className="font-mono text-slate-700 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                                {st.nisn}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  type="button"
                                  onClick={() => onSelectStudentProfile?.(st)}
                                  className="font-extrabold text-slate-900 hover:text-blue-700 text-left cursor-pointer transition-colors"
                                >
                                  {st.namaLengkap}
                                </button>
                                {(st.statusResiko === 'Waspada' || st.statusResiko === 'Berisiko') && (
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${
                                    st.statusResiko === 'Berisiko' 
                                      ? 'bg-rose-100 text-rose-900 border-rose-200' 
                                      : 'bg-amber-100 text-amber-900 border-amber-200'
                                  }`}>
                                    {st.statusResiko}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-600 font-medium mt-0.5">
                                Orang Tua/Wali: {st.namaOrangTua || '-'}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                st.jenisKelamin === 'L' 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                  : 'bg-pink-50 text-pink-700 border-pink-200'
                              }`}>
                                {st.jenisKelamin}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {/* STATUS COLOR BUTTONS WITH CRISP TEXT & COLORED DOTS */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {[
                                  { label: 'Hadir', val: 'Hadir' as AttendanceStatus, dot: 'bg-emerald-500', activeBg: 'bg-emerald-600 text-white border-emerald-600 shadow-xs' },
                                  { label: 'Sakit', val: 'Sakit' as AttendanceStatus, dot: 'bg-amber-500', activeBg: 'bg-amber-500 text-white border-amber-500 shadow-xs' },
                                  { label: 'Izin', val: 'Izin' as AttendanceStatus, dot: 'bg-blue-500', activeBg: 'bg-blue-600 text-white border-blue-600 shadow-xs' },
                                  { label: 'Alpa', val: 'Alpa' as AttendanceStatus, dot: 'bg-rose-500', activeBg: 'bg-rose-600 text-white border-rose-600 shadow-xs' },
                                  { label: 'Dispensasi', val: 'Dispensasi' as AttendanceStatus, dot: 'bg-purple-500', activeBg: 'bg-purple-600 text-white border-purple-600 shadow-xs' },
                                ].map((opt) => {
                                  const isCurrent = currentVal.status === opt.val;
                                  return (
                                    <button
                                      type="button"
                                      key={opt.val}
                                      disabled={role !== 'admin' || isReadOnlyPreview}
                                      onClick={() => handleStatusChange(st.nisn, opt.val)}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all cursor-pointer ${
                                        isCurrent
                                          ? opt.activeBg
                                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                      }`}
                                    >
                                      <span className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? 'bg-white' : opt.dot}`} />
                                      <span>{opt.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  placeholder="Keterangan / alasan..."
                                  value={currentVal.keterangan}
                                  disabled={role !== 'admin' || isReadOnlyPreview}
                                  onChange={(e) => handleKeteranganChange(st.nisn, e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                                />

                                {/* Quick chips suggestions if non-hadir */}
                                {currentVal.status !== 'Hadir' && !isReadOnlyPreview && (
                                  <div className="flex flex-wrap gap-1">
                                    {(currentVal.status === 'Sakit'
                                      ? ['Demam / Flu', 'Surat Dokter', 'Sakit Perut']
                                      : currentVal.status === 'Izin'
                                      ? ['Acara Keluarga', 'Keperluan Wali Murid', 'Surat Orang Tua']
                                      : currentVal.status === 'Dispensasi'
                                      ? ['Lomba FLS2N / O2SN', 'Tugas Pramuka', 'Dinas Sekolah']
                                      : ['Tanpa Keterangan', 'Tidak Masuk']
                                    ).map(sug => (
                                      <button
                                        key={sug}
                                        type="button"
                                        onClick={() => handleKeteranganChange(st.nisn, sug)}
                                        className="text-[9px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-semibold transition-colors cursor-pointer"
                                      >
                                        + {sug}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* REAL-TIME SUMMARY COUNTERS AT BOTTOM OF FORM (Section 5) */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Total Siswa</span>
                    <span className="text-lg font-black text-white">{currentInputCounters.total} Anak</span>
                  </div>
                  <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block">🟢 Hadir</span>
                    <span className="text-lg font-black text-emerald-400">{currentInputCounters.hadir}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">🟡 Sakit</span>
                    <span className="text-lg font-black text-amber-400">{currentInputCounters.sakit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-sky-400 uppercase font-black tracking-wider block">🔵 Izin</span>
                    <span className="text-lg font-black text-sky-400">{currentInputCounters.izin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-400 uppercase font-black tracking-wider block">🔴 Alpa</span>
                    <span className="text-lg font-black text-rose-400">{currentInputCounters.alpa}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-400 uppercase font-black tracking-wider block">🟣 Dispensasi</span>
                    <span className="text-lg font-black text-purple-400">{currentInputCounters.dispensasi}</span>
                  </div>
                  <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Persentase</span>
                    <span className="text-lg font-black text-blue-400">{currentInputCounters.pct}%</span>
                  </div>
                </div>

                {role === 'admin' && !isReadOnlyPreview && classStudents.length > 0 && (
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>SIMPAN ABSENSI KELAS {inputKelas}</span>
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: REKAPITULASI PRESENSI                           */}
      {/* ======================================================== */}
      {activeSubTab === 'rekap' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Filter Rekapitulasi Presensi</h3>
              </div>

              {/* Export Buttons: Excel, CSV, Cetak Resmi */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Unduh Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Rekap Resmi</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Filter Kelas
                </label>
                <select
                  value={rekapKelas}
                  onChange={(e) => setRekapKelas(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Kelas (1A - 6B)</option>
                  {masterKelas.map(k => (
                    <option key={k.kelas} value={k.kelas}>Kelas {k.kelas}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Periode Bulan
                </label>
                <select
                  value={rekapBulan}
                  onChange={(e) => setRekapBulan(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Bulan</option>
                  <option value="09">September 2026</option>
                  <option value="08">Agustus 2026</option>
                  <option value="07">Juli 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Filter Khusus
                </label>
                <select
                  value={rekapStatusFilter}
                  onChange={(e) => setRekapStatusFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="ALPA">⚠️ Pernah Alpa (Tanpa Ket.)</option>
                  <option value="PRIMA">⭐ Kehadiran Prima (100%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Cari Siswa / NISN
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nama atau NISN..."
                    value={rekapSearch}
                    onChange={(e) => setRekapSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Presensi</span>
              <p className="text-xl font-black text-slate-900 mt-1">{overallTotals.totalAll}</p>
              <span className="text-[10px] text-slate-400">Record kehadiran</span>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Hadir</span>
              <p className="text-xl font-black text-emerald-900 mt-1">{overallTotals.tHadir}</p>
              <span className="text-[10px] text-emerald-700">Tepat waktu</span>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Sakit</span>
              <p className="text-xl font-black text-amber-900 mt-1">{overallTotals.tSakit}</p>
              <span className="text-[10px] text-amber-700">Keterangan sakit</span>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Izin</span>
              <p className="text-xl font-black text-blue-900 mt-1">{overallTotals.tIzin}</p>
              <span className="text-[10px] text-blue-700">Izin resmi</span>
            </div>

            <div className="bg-rose-50 rounded-xl p-4 border border-rose-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Alpa</span>
              <p className="text-xl font-black text-rose-900 mt-1">{overallTotals.tAlpa}</p>
              <span className="text-[10px] text-rose-700">Tanpa kabar</span>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">% Kehadiran</span>
              <p className="text-xl font-black text-indigo-900 mt-1">{overallTotals.avgPersentase}%</p>
              <span className="text-[10px] text-indigo-700">Rerata sekolah</span>
            </div>
          </div>

          {/* Rekapitulasi Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Daftar Rekapitulasi Presensi Siswa ({studentRekapStats.length} Siswa)
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                Periode: {rekapBulan === 'ALL' ? 'Semua Bulan' : `September 2026`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                    <th className="py-3 px-3 w-12 text-center">No</th>
                    <th className="py-3 px-4 w-28">NISN</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-3 text-center">Kelas</th>
                    <th className="py-3 px-3 text-center bg-emerald-50 text-emerald-900">Hadir</th>
                    <th className="py-3 px-3 text-center bg-amber-50 text-amber-900">Sakit</th>
                    <th className="py-3 px-3 text-center bg-blue-50 text-blue-900">Izin</th>
                    <th className="py-3 px-3 text-center bg-rose-50 text-rose-900">Alpa</th>
                    <th className="py-3 px-3 text-center bg-purple-50 text-purple-900">Dispensasi</th>
                    <th className="py-3 px-4 min-w-[140px]">% Kehadiran</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {studentRekapStats.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-slate-400 font-bold">
                        Tidak ada data siswa yang sesuai dengan filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    studentRekapStats.map((st, idx) => {
                      const isDanger = st.alpa >= systemSettings.alpaRisiko || st.persentase < systemSettings.kehadiranTindakLanjutPct;
                      const isWarning = st.alpa >= systemSettings.alpaPerhatian || st.persentase < systemSettings.kehadiranMonitoringPct;

                      return (
                        <tr key={st.student.nisn} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono text-slate-600 font-bold">{st.student.nisn}</td>
                          <td className="py-3 px-4">
                            <span 
                              onClick={() => onSelectStudentProfile?.(st.student)}
                              className="font-black text-slate-900 hover:text-blue-700 cursor-pointer"
                            >
                              {st.student.namaLengkap}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">{st.student.kelas}</td>
                          <td className="py-3 px-3 text-center font-black text-emerald-700 bg-emerald-50/50">{st.hadir}</td>
                          <td className="py-3 px-3 text-center font-black text-amber-700 bg-amber-50/50">{st.sakit}</td>
                          <td className="py-3 px-3 text-center font-black text-blue-700 bg-blue-50/50">{st.izin}</td>
                          <td className="py-3 px-3 text-center font-black text-rose-700 bg-rose-50/50">{st.alpa}</td>
                          <td className="py-3 px-3 text-center font-black text-purple-700 bg-purple-50/50">{st.dispensasi}</td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-black">
                                <span className={
                                  st.persentase >= 95 ? 'text-emerald-700' :
                                  st.persentase >= 90 ? 'text-amber-700' : 'text-rose-700'
                                }>
                                  {st.persentase}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    st.persentase >= 95 ? 'bg-emerald-500' :
                                    st.persentase >= 90 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(st.persentase, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isDanger ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Tindak Lanjut
                              </span>
                            ) : isWarning ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                <BellRing className="w-3 h-3 text-amber-600" />
                                Perhatian
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Tertib
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: STATISTIK KEHADIRAN                            */}
      {/* ======================================================== */}
      {activeSubTab === 'statistik' && (
        <StatistikKehadiranView
          students={students}
          attendanceList={attendanceList}
          masterKelas={masterKelas}
          systemSettings={systemSettings}
          onSelectStudentProfile={onSelectStudentProfile}
          onNavigateReward={() => onNavigate?.('reward')}
        />
      )}

      {/* ======================================================== */}
      {/* SUBTAB 4: MONITORING KEHADIRAN (Section 12 & 13)         */}
      {/* ======================================================== */}
      {activeSubTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Educative Philosophy Card (Section 13: ABSENSI ≠ PELANGGARAN) */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-blue-500/10 rounded-2xl p-6 border border-amber-200/80 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    Radar Monitoring Kehadiran Siswa
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950 uppercase tracking-wider">
                    Prinsip: Absensi ≠ Pelanggaran
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  Sistem otomatis mengidentifikasi siswa yang memerlukan pendampingan wali kelas atau Tim TPPK berdasarkan aturan ambang batas absensi sekolah.
                  <strong className="text-slate-800"> Absensi bukan hukuman</strong> — Alpa tidak otomatis menjadi pelanggaran, melainkan sinyal awal untuk pendampingan edukatif, dialog ramah anak, dan komunikasi kolaboratif dengan orang tua.
                </p>
              </div>
            </div>
          </div>

          {/* Categorization Legend (Section 12) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-black text-emerald-800 block">🟢 Normal</span>
              <span className="text-xs font-bold text-emerald-700 block mt-0.5">&ge; 95% Kehadiran</span>
              <span className="text-[10px] text-emerald-600">Disiplin terjaga</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-black text-amber-800 block">🟡 Perlu Perhatian</span>
              <span className="text-xs font-bold text-amber-700 block mt-0.5">90 – 94,99%</span>
              <span className="text-[10px] text-amber-600">Konfirmasi WA ortu</span>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-black text-orange-800 block">🟠 Monitoring</span>
              <span className="text-xs font-bold text-orange-700 block mt-0.5">80 – 89,99%</span>
              <span className="text-[10px] text-orange-600">Konseling wali kelas</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-center">
              <span className="text-[11px] font-black text-rose-800 block">🔴 Tindak Lanjut</span>
              <span className="text-xs font-bold text-rose-700 block mt-0.5">&lt; 80% / Alpa &ge; 3</span>
              <span className="text-[10px] text-rose-600">Home visit TPPK</span>
            </div>
          </div>

          {/* Monitoring Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitoringList.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-base font-black text-slate-800">Seluruh Siswa Hadir Tertib</h4>
                <p className="text-xs text-slate-500 mt-1">Tidak ada siswa yang mencapai ambang batas monitoring presensi saat ini.</p>
              </div>
            ) : (
              monitoringList.map((m) => (
                <div 
                  key={m.student.nisn} 
                  className={`bg-white rounded-2xl p-5 border shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                    m.statusCategory === 'tindak_lanjut' ? 'border-rose-200 ring-1 ring-rose-300' :
                    m.statusCategory === 'monitoring' ? 'border-orange-200 ring-1 ring-orange-300' :
                    'border-amber-200 ring-1 ring-amber-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${m.badgeColor}`}>
                        {m.label}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">Kelas {m.student.kelas}</span>
                    </div>

                    <div>
                      <h4 
                        onClick={() => onSelectStudentProfile?.(m.student)}
                        className="text-sm font-black text-slate-900 hover:text-blue-700 cursor-pointer"
                      >
                        {m.student.namaLengkap}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">NISN: {m.student.nisn}</p>
                    </div>

                    {/* Quick Stats Pill */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Alpa</span>
                        <span className="text-sm font-black text-rose-600">{m.alpa} hari</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Kehadiran</span>
                        <span className="text-sm font-black text-slate-800">{m.persentase}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Poin Plg.</span>
                        <span className="text-sm font-black text-amber-600">{m.student.totalPoinPelanggaran}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 block mb-0.5">Rekomendasi Edukatif TPPK:</strong>
                      {m.rekomendasi}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectStudentProfile?.(m.student)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900"
                    >
                      Profil Siswa &rarr;
                    </button>
                    <a
                      href={`https://wa.me/${m.student.noHpOrangTua.replace(/^0/, '62')}?text=Selamat%20pagi/siang%20Bapak/Ibu%20Wali%20dari%20${encodeURIComponent(m.student.namaLengkap)},%20kami%20dari%20UPT%20SDN%20Kebonagung%20ingin%20mengonfirmasi%20kondisi%20dan%20kehadiran%20putra/putri%20Bapak/Ibu...`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black inline-flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WA Ortu</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL OVERWRITE CONFIRMATION */}
      {overwriteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-slate-900">
                Perbarui Data Absensi?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Data absensi siswa untuk <strong>Kelas {inputKelas}</strong> pada tanggal <strong>{inputTanggal}</strong> sudah pernah tersimpan sebelumnya.
                Apakah Anda ingin memperbarui data absensi tersebut?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOverwriteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeSaveAttendance}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Perbarui Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINT MODAL FOR REKAP ABSENSI */}
      <OfficialPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        mode="rekap_absensi"
        attendanceRekap={attendanceRekapPrintPayload}
      />

    </div>
  );
};
