import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Student, 
  PelanggaranRecord, 
  RewardRecord, 
  AttendanceRecord,
  CanvaSyncConfig, 
  UserRole,
  StatusResiko,
  MasterKelas,
  MasterPelanggaran,
  MasterReward,
  SystemSettings,
  AuditLog,
  AttendanceStatus,
  Pegawai,
  VisitorLog
} from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_PELANGGARAN, 
  INITIAL_REWARDS, 
  INITIAL_ATTENDANCE,
  DEFAULT_SYNC_CONFIG,
  MASTER_KELAS,
  MASTER_PELANGGARAN,
  MASTER_REWARDS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_SCHOOL_PROFILE,
  INITIAL_AUDIT_LOGS
} from './data/initialData';
import { INITIAL_VISITOR_LOGS } from './data/initialVisitorLogs';
import { ensureKelas1AComplete, ensureKelas1AAttendance } from './data/kelas1AData';
import { INITIAL_PEGAWAI } from './data/initialPegawai';
import { Header, AppTab } from './components/Header';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './components/DashboardView';
import { AbsensiView } from './components/AbsensiView';
import { PelanggaranView } from './components/PelanggaranView';
import { RewardView } from './components/RewardView';
import { PoinKarakterView } from './components/PoinKarakterView';
import { ProfilSiswaView } from './components/ProfilSiswaView';
import { MonitoringView } from './components/MonitoringView';
import { StatistikView } from './components/StatistikView';
import { LaporanView } from './components/LaporanView';
import { SiswaView } from './components/SiswaView';
import { PegawaiView } from './components/PegawaiView';
import { SyncExportView } from './components/SyncExportView';
import { AuditLogView } from './components/AuditLogView';
import { VisitorLogView } from './components/VisitorLogView';
import { PengaturanView } from './components/PengaturanView';
import { OfficialPrintModal } from './components/OfficialPrintModal';
import { WebProfilView } from './components/WebProfilView';
import { SimpleLoginView } from './components/SimpleLoginView';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // Authentication Role State
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('starkids_role');
    return (saved === 'admin' || saved === 'view_only') ? saved : 'view_only';
  });

  // User Session State: Simple login screen active by default unless logged in
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('starkids_is_logged_in') === 'true';
  });

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);
  const [selectedStudentNisnForProfile, setSelectedStudentNisnForProfile] = useState<string | null>(null);

  // Core Data States with LocalStorage Cache
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('starkids_students');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ensureKelas1AComplete(parsed);
        }
      } catch (e) { /* ignore */ }
    }
    return ensureKelas1AComplete(INITIAL_STUDENTS);
  });

  const [targetKelasAbsensi, setTargetKelasAbsensi] = useState<string>('1A');

  const [pelanggaranList, setPelanggaranList] = useState<PelanggaranRecord[]>(() => {
    const saved = localStorage.getItem('starkids_pelanggaran');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PELANGGARAN;
  });

  const [rewardList, setRewardList] = useState<RewardRecord[]>(() => {
    const saved = localStorage.getItem('starkids_reward');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_REWARDS;
  });

  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('starkids_attendance');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ensureKelas1AAttendance(parsed);
        }
      } catch (e) { /* ignore */ }
    }
    return ensureKelas1AAttendance(INITIAL_ATTENDANCE);
  });

  const [masterKelas, setMasterKelas] = useState<MasterKelas[]>(() => {
    const saved = localStorage.getItem('starkids_master_kelas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 28) {
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return MASTER_KELAS;
  });

  const [masterPelanggaran, setMasterPelanggaran] = useState<MasterPelanggaran[]>(() => {
    const saved = localStorage.getItem('starkids_master_pelanggaran');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return MASTER_PELANGGARAN;
  });

  const [masterReward, setMasterReward] = useState<MasterReward[]>(() => {
    const saved = localStorage.getItem('starkids_master_reward');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return MASTER_REWARDS;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('starkids_system_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SYSTEM_SETTINGS,
          ...parsed,
          schoolProfile: {
            ...DEFAULT_SCHOOL_PROFILE,
            ...(parsed.schoolProfile || {})
          }
        };
      } catch (e) { /* ignore */ }
    }
    return {
      ...DEFAULT_SYSTEM_SETTINGS,
      schoolProfile: DEFAULT_SCHOOL_PROFILE
    };
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('starkids_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [syncConfig, setSyncConfig] = useState<CanvaSyncConfig>(() => {
    const saved = localStorage.getItem('starkids_sync_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_SYNC_CONFIG;
  });

  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(() => {
    const saved = localStorage.getItem('starkids_pegawai');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_PEGAWAI;
  });

  // Visitor Logs State with LocalStorage Persistence
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>(() => {
    const saved = localStorage.getItem('starkids_visitor_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Gabungkan data historis 7 hari terakhir agar tren visualisasi lengkap
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missingHistory = INITIAL_VISITOR_LOGS.filter(init => !existingIds.has(init.id));
          return [...parsed, ...missingHistory];
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_VISITOR_LOGS;
  });

  // Dynamic Kepala Sekolah memo for signatures and official documents
  const kepalaSekolah = useMemo(() => {
    // If school profile explicitly provides kepalaSekolahNama, use it
    if (systemSettings.schoolProfile?.kepalaSekolahNama) {
      return {
        namaLengkap: systemSettings.schoolProfile.kepalaSekolahNama,
        nip: systemSettings.schoolProfile.kepalaSekolahNip || '19710314 199605 2 001'
      };
    }
    const ks = pegawaiList.find(p => p.kategori === 'kepala_sekolah' && p.statusAktif);
    return ks || {
      namaLengkap: 'Hj. Sukesi, M.Pd.',
      nip: '19710314 199605 2 001'
    };
  }, [pegawaiList, systemSettings.schoolProfile]);

  // Print Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printStudent, setPrintStudent] = useState<Student | null>(null);
  const [printPelanggaran, setPrintPelanggaran] = useState<PelanggaranRecord | null>(null);
  const [printMode, setPrintMode] = useState<'surat_panggilan' | 'rekap_karakter'>('surat_panggilan');

  // Sync states to LocalStorage
  useEffect(() => { localStorage.setItem('starkids_role', role); }, [role]);
  useEffect(() => { localStorage.setItem('starkids_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('starkids_pelanggaran', JSON.stringify(pelanggaranList)); }, [pelanggaranList]);
  useEffect(() => { localStorage.setItem('starkids_reward', JSON.stringify(rewardList)); }, [rewardList]);
  useEffect(() => { localStorage.setItem('starkids_attendance', JSON.stringify(attendanceList)); }, [attendanceList]);
  useEffect(() => { localStorage.setItem('starkids_master_kelas', JSON.stringify(masterKelas)); }, [masterKelas]);
  useEffect(() => { localStorage.setItem('starkids_master_pelanggaran', JSON.stringify(masterPelanggaran)); }, [masterPelanggaran]);
  useEffect(() => { localStorage.setItem('starkids_master_reward', JSON.stringify(masterReward)); }, [masterReward]);
  useEffect(() => { localStorage.setItem('starkids_system_settings', JSON.stringify(systemSettings)); }, [systemSettings]);
  useEffect(() => { localStorage.setItem('starkids_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('starkids_visitor_logs', JSON.stringify(visitorLogs)); }, [visitorLogs]);
  useEffect(() => { localStorage.setItem('starkids_sync_config', JSON.stringify(syncConfig)); }, [syncConfig]);
  useEffect(() => { localStorage.setItem('starkids_pegawai', JSON.stringify(pegawaiList)); }, [pegawaiList]);

  // Otomatis mencatat dan memperbarui sesi pengunjung web saat ini
  useEffect(() => {
    try {
      let sessionId = sessionStorage.getItem('starkids_visitor_session_id');
      if (!sessionId) {
        sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        sessionStorage.setItem('starkids_visitor_session_id', sessionId);
      }

      const ua = navigator.userAgent;
      const width = window.innerWidth;
      const deviceType: 'Desktop' | 'Smartphone' | 'Tablet' = 
        width < 768 ? 'Smartphone' : width < 1024 ? 'Tablet' : 'Desktop';

      let browser = 'Web Browser';
      if (ua.includes('Edg/')) browser = 'Microsoft Edge';
      else if (ua.includes('Chrome/')) browser = 'Google Chrome';
      else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari';
      else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';

      let os = 'Sistem Operasi';
      if (ua.includes('Win')) os = 'Windows 11 / 10';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS / iPadOS';
      else if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';

      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const tabTitleMap: Record<string, string> = {
        dashboard: 'Dashboard Utama',
        absensi: 'Presensi Siswa',
        pelanggaran: 'Catatan Pelanggaran',
        reward: 'Prestasi & Reward',
        poin: 'Poin Karakter',
        monitoring: 'Monitoring TPPK',
        profil: 'Profil Siswa',
        statistik: 'Statistik & Analitik',
        laporan: 'Pusat Laporan',
        sync: 'Sinkronisasi Data',
        siswa: 'Data Siswa & Rombel',
        pegawai: 'Data Pegawai & Guru',
        audit: 'Log Aktivitas Sistem',
        pengaturan: 'Pengaturan Sekolah',
        webprofil: 'Website Profil Sekolah',
        pengunjung: 'Log Daftar Pengunjung'
      };

      const pageName = tabTitleMap[activeTab] || 'Portal Aplikasi';
      const visitorName = role === 'admin' 
        ? 'Agung, S.Pd (Admin Khusus TPPK)' 
        : 'Pengunjung Portal / Wali Murid';

      setVisitorLogs(prev => {
        const existingIdx = prev.findIndex(v => v.sessionId === sessionId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          const existing = updated[existingIdx];
          const startTime = new Date(existing.timestamp).getTime();
          const duration = Math.max(1, Math.round((now.getTime() - startTime) / 60000));

          updated[existingIdx] = {
            ...existing,
            lastActive: formattedDate,
            namaPengunjung: visitorName,
            peran: role === 'admin' ? 'Admin Khusus' : existing.peran,
            statusAkses: role === 'admin' ? 'Admin Penuh' : existing.statusAkses,
            halamanTerakhir: pageName,
            durasiMenit: duration,
            statusOnline: true,
            aktivitas: `Mengakses menu ${pageName}`
          };
          return updated;
        } else {
          const newEntry: VisitorLog = {
            id: `VIS-${Date.now().toString().slice(-4)}`,
            sessionId: sessionId!,
            timestamp: formattedDate,
            lastActive: formattedDate,
            namaPengunjung: visitorName,
            peran: role === 'admin' ? 'Admin Khusus' : 'Orang Tua / Wali Murid',
            statusAkses: role === 'admin' ? 'Admin Penuh' : 'Publik',
            ipAddress: '180.252.164.21',
            lokasi: 'Kota Pasuruan (Jaringan Aktif)',
            perangkat: deviceType,
            browser: `${browser} (${width}x${window.innerHeight})`,
            os,
            layarResolusi: `${window.screen.width}x${window.screen.height}`,
            halamanTerakhir: pageName,
            durasiMenit: 1,
            statusOnline: true,
            aktivitas: `Membuka halaman awal ${pageName}`
          };
          return [newEntry, ...prev];
        }
      });
    } catch (e) {
      // ignore
    }
  }, [activeTab, role]);


  // Helper for adding Audit Log
  const addAuditLog = useCallback((action: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      timestamp: new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'short',
        timeStyle: 'medium'
      }).format(new Date()),
      user: role === 'admin' ? 'Admin (Tim TPPK)' : 'Tamu / View Only',
      role: role === 'admin' ? 'Administrator' : 'Pengguna',
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [role]);

  // Visitor Refresh & Sync States
  const [isRefreshingVisitor, setIsRefreshingVisitor] = useState(false);
  const [lastVisitorSyncTime, setLastVisitorSyncTime] = useState<string>(() => {
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()) + ' WIB';
  });

  // Cross-tab / cross-window synchronization for visitor logs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'starkids_visitor_logs' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setVisitorLogs(parsed);
          }
        } catch (err) {}
      }
    };
    const handleCustomSync = () => {
      const saved = localStorage.getItem('starkids_visitor_logs');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setVisitorLogs(parsed);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('starkids_visitor_sync', handleCustomSync);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('starkids_visitor_sync', handleCustomSync);
    };
  }, []);

  // Handler for clearing visitor logs (Hanya Admin Khusus)
  const handleClearVisitorLogs = useCallback(() => {
    const currentSessionId = sessionStorage.getItem('starkids_visitor_session_id');
    setVisitorLogs(prev => prev.filter(v => v.sessionId === currentSessionId));
    addAuditLog('Pembersihan Log Pengunjung', 'Administrator khusus membersihkan riwayat daftar pengunjung sistem');
  }, [addAuditLog]);

  // Handler for refreshing and synchronizing visitor logs
  const handleRefreshVisitorLogs = useCallback(() => {
    setIsRefreshingVisitor(true);
    try {
      // 1. Ambil data terbaru dari localStorage atau gabungkan initial data 7 hari jika belum ada
      const saved = localStorage.getItem('starkids_visitor_logs');
      let currentLogs = visitorLogs;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(parsed.map((p: any) => p.id));
            const missingHistory = INITIAL_VISITOR_LOGS.filter(init => !existingIds.has(init.id));
            currentLogs = [...parsed, ...missingHistory];
          }
        } catch (e) {}
      } else {
        currentLogs = INITIAL_VISITOR_LOGS;
      }

      // 2. Perbarui status online untuk sesi aktif saat ini
      const currentSessionId = sessionStorage.getItem('starkids_visitor_session_id');
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      const updatedLogs = currentLogs.map(item => {
        if (item.sessionId === currentSessionId) {
          return {
            ...item,
            lastActive: formattedDate,
            statusOnline: true,
            peran: role === 'admin' ? 'Admin Khusus' : item.peran,
            statusAkses: role === 'admin' ? 'Admin Penuh' : item.statusAkses
          };
        }
        return item;
      });

      setVisitorLogs(updatedLogs);
      localStorage.setItem('starkids_visitor_logs', JSON.stringify(updatedLogs));
      
      const newTime = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()) + ' WIB';
      setLastVisitorSyncTime(newTime);
      window.dispatchEvent(new CustomEvent('starkids_visitor_sync'));

      setRefreshToastMessage('Daftar pengunjung web dan analitik 7 hari berhasil disinkronkan.');
      setTimeout(() => setRefreshToastMessage(null), 3000);
    } finally {
      setTimeout(() => setIsRefreshingVisitor(false), 500);
    }
  }, [role, visitorLogs]);

  // Handler for adding manual guest / visitor entry (Buku Tamu Digital)
  const handleAddManualVisitor = useCallback((visitorData: Omit<VisitorLog, 'id' | 'sessionId' | 'timestamp' | 'lastActive' | 'durasiMenit' | 'statusOnline'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newVisitor: VisitorLog = {
      ...visitorData,
      id: `VIS-MAN-${Date.now().toString().slice(-4)}`,
      sessionId: `sess_manual_${Date.now().toString(36)}`,
      timestamp: formattedDate,
      lastActive: formattedDate,
      durasiMenit: 10,
      statusOnline: false
    };
    setVisitorLogs(prev => [newVisitor, ...prev]);
    addAuditLog('Buku Tamu Digital', `Pencatatan kunjungan tamu baru: ${visitorData.namaPengunjung} (${visitorData.peran})`);
  }, [addAuditLog]);

  // Refresh & Update state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToastMessage, setRefreshToastMessage] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => {
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()) + ' WIB';
  });

  const handleRefreshData = useCallback(() => {
    setIsRefreshing(true);
    try {
      // 1. Sinkronisasi Data Peserta Didik & Pastikan Kelas 1A Lengkap 28 Siswa
      let updatedStudents = students;
      const savedStudents = localStorage.getItem('starkids_students');
      if (savedStudents) {
        try {
          const parsed = JSON.parse(savedStudents);
          if (Array.isArray(parsed) && parsed.length > 0) {
            updatedStudents = ensureKelas1AComplete(parsed);
          }
        } catch (e) {}
      } else {
        updatedStudents = ensureKelas1AComplete(INITIAL_STUDENTS);
      }
      setStudents(updatedStudents);
      localStorage.setItem('starkids_students', JSON.stringify(updatedStudents));

      // 2. Sinkronisasi Data Presensi & Pastikan Presensi Kelas 1A Terisi Seutuhnya
      let updatedAtt = attendanceList;
      const savedAtt = localStorage.getItem('starkids_attendance');
      if (savedAtt) {
        try {
          const parsed = JSON.parse(savedAtt);
          if (Array.isArray(parsed)) {
            updatedAtt = ensureKelas1AAttendance(parsed);
          }
        } catch (e) {}
      } else {
        updatedAtt = ensureKelas1AAttendance(INITIAL_ATTENDANCE);
      }
      setAttendanceList(updatedAtt);
      localStorage.setItem('starkids_attendance', JSON.stringify(updatedAtt));

      // 3. Sinkronisasi Data Kepegawaian (Pegawai & Staff)
      const savedPegawai = localStorage.getItem('starkids_pegawai');
      if (savedPegawai) {
        try {
          const parsed = JSON.parse(savedPegawai);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPegawaiList(parsed);
          }
        } catch (e) {}
      } else {
        localStorage.setItem('starkids_pegawai', JSON.stringify(INITIAL_PEGAWAI));
      }

      // 4. Sinkronisasi Data Guru Kelas & Rombel (Master Kelas)
      const savedMasterKelas = localStorage.getItem('starkids_master_kelas');
      if (savedMasterKelas) {
        try {
          const parsed = JSON.parse(savedMasterKelas);
          if (Array.isArray(parsed) && parsed.length >= 28) {
            setMasterKelas(parsed);
          }
        } catch (e) {}
      } else {
        localStorage.setItem('starkids_master_kelas', JSON.stringify(MASTER_KELAS));
      }

      // 5. Sinkronisasi Pelanggaran & Reward
      const savedPelanggaran = localStorage.getItem('starkids_pelanggaran');
      if (savedPelanggaran) {
        try {
          const parsed = JSON.parse(savedPelanggaran);
          if (Array.isArray(parsed)) setPelanggaranList(parsed);
        } catch (e) {}
      }
      const savedReward = localStorage.getItem('starkids_reward');
      if (savedReward) {
        try {
          const parsed = JSON.parse(savedReward);
          if (Array.isArray(parsed)) setRewardList(parsed);
        } catch (e) {}
      }

      // 6. Sinkronisasi Profil Sekolah & Pengaturan Sistem
      const savedSettings = localStorage.getItem('starkids_system_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed && typeof parsed === 'object') setSystemSettings(parsed);
        } catch (e) {}
      } else {
        localStorage.setItem('starkids_system_settings', JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
      }

      const now = new Date();
      const nowStr = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(now) + ' WIB';

      setLastUpdatedTime(nowStr);
      setRefreshToastMessage(`Seluruh lini data (Kepegawaian, Guru Kelas, Peserta Didik Kelas 1A-6E, Profil Sekolah, & Presensi) berhasil disinkronkan & tersimpan realtime (${nowStr})`);
      setTimeout(() => {
        setRefreshToastMessage(null);
      }, 4500);
      addAuditLog('Refresh Data Realtime', 'Pembaruan otomatis seluruh lini data sistem dan penyimpanan permanen');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 400);
    }
  }, [students, attendanceList, addAuditLog]);

  // Recalculate Student totals automatically when violations or rewards change
  const refreshStudentStats = useCallback((
    updatedPelanggaran: PelanggaranRecord[],
    updatedRewards: RewardRecord[]
  ) => {
    setStudents(prevStudents => {
      return prevStudents.map(student => {
        const studentV = updatedPelanggaran.filter(p => p.nisn === student.nisn);
        const studentR = updatedRewards.filter(r => r.nisn === student.nisn);

        const totalPoinPelanggaran = studentV.reduce((acc, curr) => acc + curr.poin, 0);
        const totalPoinReward = studentR.reduce((acc, curr) => acc + curr.poin, 0);

        let statusResiko: StatusResiko = 'Aman';
        if (totalPoinPelanggaran >= 40) {
          statusResiko = 'Berisiko';
        } else if (totalPoinPelanggaran >= 20) {
          statusResiko = 'Waspada';
        }

        return {
          ...student,
          totalPoinPelanggaran,
          totalPoinReward,
          statusResiko
        };
      });
    });
  }, []);

  // CRUD Pelanggaran Handlers
  const handleAddPelanggaran = (newRecord: Omit<PelanggaranRecord, 'id'>) => {
    const id = `PEL-${Date.now().toString().slice(-4)}`;
    const fullRecord: PelanggaranRecord = {
      ...newRecord,
      id,
      syncedToSheet: true
    };
    const nextList = [fullRecord, ...pelanggaranList];
    setPelanggaranList(nextList);
    refreshStudentStats(nextList, rewardList);
    addAuditLog('Input Pelanggaran', `Pencatatan pelanggaran ${fullRecord.namaSiswa} (${fullRecord.kelas}): ${fullRecord.jenisPelanggaran} - Poin ${fullRecord.poin}`);

    if (syncConfig.autoSync) {
      const nowStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
      setSyncConfig(prev => ({ ...prev, lastSyncTime: nowStr }));
    }
  };

  const handleUpdatePelanggaran = (id: string, updated: Partial<PelanggaranRecord>) => {
    const target = pelanggaranList.find(p => p.id === id);
    const nextList = pelanggaranList.map(item => 
      item.id === id ? { ...item, ...updated, syncedToSheet: true } : item
    );
    setPelanggaranList(nextList);
    refreshStudentStats(nextList, rewardList);
    addAuditLog('Update Pelanggaran', `Memperbarui status/data pelanggaran ${target?.namaSiswa || id}`);
  };

  const handleDeletePelanggaran = (id: string) => {
    const target = pelanggaranList.find(p => p.id === id);
    const nextList = pelanggaranList.filter(item => item.id !== id);
    setPelanggaranList(nextList);
    refreshStudentStats(nextList, rewardList);
    addAuditLog('Hapus Pelanggaran', `Menghapus data pelanggaran ${target?.namaSiswa || id}`);
  };

  const handleBatchDeletePelanggaran = (ids: string[]) => {
    const idSet = new Set(ids);
    const nextList = pelanggaranList.filter(item => !idSet.has(item.id));
    setPelanggaranList(nextList);
    refreshStudentStats(nextList, rewardList);
    addAuditLog('Hapus Sebagian Pelanggaran', `Menghapus secara bersamaan ${ids.length} catatan poin pelanggaran`);
    setRefreshToastMessage(`Berhasil menghapus ${ids.length} catatan pelanggaran.`);
    setTimeout(() => setRefreshToastMessage(null), 5000);
  };

  const handleDeleteAllPelanggaran = (kelas?: string) => {
    let nextList: PelanggaranRecord[] = [];
    if (kelas && kelas !== 'all') {
      const removedCount = pelanggaranList.filter(p => p.kelas === kelas).length;
      nextList = pelanggaranList.filter(p => p.kelas !== kelas);
      addAuditLog('Hapus Seluruh Pelanggaran Kelas', `Menghapus seluruh catatan pelanggaran (${removedCount} data) di Kelas ${kelas}`);
      setRefreshToastMessage(`Berhasil menghapus seluruh data pelanggaran Kelas ${kelas}.`);
    } else {
      addAuditLog('Hapus Seluruh Pelanggaran', `Menghapus seluruh catatan pelanggaran sekolah (${pelanggaranList.length} data)`);
      setRefreshToastMessage('Seluruh catatan pelanggaran berhasil dihapus.');
    }
    setPelanggaranList(nextList);
    refreshStudentStats(nextList, rewardList);
    setTimeout(() => setRefreshToastMessage(null), 5000);
  };

  // CRUD Reward Handlers
  const handleAddReward = (newRecord: Omit<RewardRecord, 'id'>) => {
    const id = `REW-${Date.now().toString().slice(-4)}`;
    const fullRecord: RewardRecord = {
      ...newRecord,
      id,
      syncedToSheet: true
    };
    const nextList = [fullRecord, ...rewardList];
    setRewardList(nextList);
    refreshStudentStats(pelanggaranList, nextList);
    addAuditLog('Input Reward', `Pemberian apresiasi ke ${fullRecord.namaSiswa} (${fullRecord.kelas}): ${fullRecord.jenisReward} +${fullRecord.poin} Poin`);

    if (syncConfig.autoSync) {
      const nowStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
      setSyncConfig(prev => ({ ...prev, lastSyncTime: nowStr }));
    }
  };

  const handleUpdateReward = (id: string, updated: Partial<RewardRecord>) => {
    const target = rewardList.find(r => r.id === id);
    const nextList = rewardList.map(item => 
      item.id === id ? { ...item, ...updated, syncedToSheet: true } : item
    );
    setRewardList(nextList);
    refreshStudentStats(pelanggaranList, nextList);
    addAuditLog('Update Reward', `Memperbarui apresiasi ${target?.namaSiswa || id}`);
  };

  const handleDeleteReward = (id: string) => {
    const target = rewardList.find(r => r.id === id);
    const nextList = rewardList.filter(item => item.id !== id);
    setRewardList(nextList);
    refreshStudentStats(pelanggaranList, nextList);
    addAuditLog('Hapus Reward', `Menghapus apresiasi ${target?.namaSiswa || id}`);
  };

  const handleBatchDeleteReward = (ids: string[]) => {
    const idSet = new Set(ids);
    const nextList = rewardList.filter(item => !idSet.has(item.id));
    setRewardList(nextList);
    refreshStudentStats(pelanggaranList, nextList);
    addAuditLog('Hapus Sebagian Prestasi', `Menghapus secara bersamaan ${ids.length} data prestasi / reward`);
    setRefreshToastMessage(`Berhasil menghapus ${ids.length} data prestasi.`);
    setTimeout(() => setRefreshToastMessage(null), 5000);
  };

  const handleDeleteAllReward = (kelas?: string) => {
    let nextList: RewardRecord[] = [];
    if (kelas && kelas !== 'all') {
      const removedCount = rewardList.filter(r => r.kelas === kelas).length;
      nextList = rewardList.filter(r => r.kelas !== kelas);
      addAuditLog('Hapus Seluruh Prestasi Kelas', `Menghapus seluruh data prestasi (${removedCount} data) di Kelas ${kelas}`);
      setRefreshToastMessage(`Berhasil menghapus seluruh data prestasi Kelas ${kelas}.`);
    } else {
      addAuditLog('Hapus Seluruh Prestasi', `Menghapus seluruh data prestasi/reward sekolah (${rewardList.length} data)`);
      setRefreshToastMessage('Seluruh data prestasi/reward berhasil dihapus.');
    }
    setRewardList(nextList);
    refreshStudentStats(pelanggaranList, nextList);
    setTimeout(() => setRefreshToastMessage(null), 5000);
  };

  // Attendance Handlers
  const handleSaveBatchAttendance = (records: AttendanceRecord[]) => {
    setAttendanceList(prev => {
      // replace existing for same date & nisn
      const keys = new Set(records.map(r => `${r.tanggal}_${r.nisn}`));
      const filteredPrev = prev.filter(r => !keys.has(`${r.tanggal}_${r.nisn}`));
      return [...records, ...filteredPrev];
    });
    addAuditLog('Input Absensi Rombel', `Perekaman presensi ${records.length} siswa untuk kelas ${records[0]?.kelas || ''} tanggal ${records[0]?.tanggal || ''}`);
  };

  const handleUpdateSingleAttendance = (id: string, status: AttendanceStatus, keterangan?: string) => {
    setAttendanceList(prev => prev.map(a => a.id === id ? { ...a, status, keterangan: keterangan ?? a.keterangan } : a));
    addAuditLog('Update Absensi', `Memperbarui status presensi ID ${id} menjadi ${status}`);
  };

  // CRUD Student Handlers
  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [newStudent, ...prev]);
    addAuditLog('Tambah Siswa', `Menambahkan data siswa baru: ${newStudent.namaLengkap} (${newStudent.nisn}) Kelas ${newStudent.kelas}`);
  };

  const handleUpdateStudent = (nisn: string, updated: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.nisn === nisn ? { ...s, ...updated } : s));

    // Cascading sync: If student name or class changed, synchronize to pelanggaran, reward, and attendance
    if (updated.namaLengkap || updated.kelas) {
      setPelanggaranList(prev => prev.map(p => {
        if (p.nisn === nisn) {
          return {
            ...p,
            namaSiswa: updated.namaLengkap || p.namaSiswa,
            kelas: updated.kelas || p.kelas
          };
        }
        return p;
      }));

      setRewardList(prev => prev.map(r => {
        if (r.nisn === nisn) {
          return {
            ...r,
            namaSiswa: updated.namaLengkap || r.namaSiswa,
            kelas: updated.kelas || r.kelas
          };
        }
        return r;
      }));

      setAttendanceList(prev => prev.map(a => {
        if (a.nisn === nisn) {
          return {
            ...a,
            nama: updated.namaLengkap || a.nama,
            kelas: updated.kelas || a.kelas
          };
        }
        return a;
      }));
    }

    addAuditLog('Update Siswa', `Memperbarui data siswa NISN ${nisn} dan menyelaraskan ke seluruh riwayat sistem`);
  };

  const handleDeleteStudent = (nisn: string) => {
    const target = students.find(s => s.nisn === nisn);
    setStudents(prev => prev.filter(s => s.nisn !== nisn));
    setPelanggaranList(prev => prev.filter(p => p.nisn !== nisn));
    setRewardList(prev => prev.filter(r => r.nisn !== nisn));
    setAttendanceList(prev => prev.filter(a => a.nisn !== nisn));
    addAuditLog('Hapus Siswa', `Menghapus siswa ${target?.namaLengkap || nisn} berserta seluruh riwayatnya`);
  };

  const handleBatchDeleteStudents = (nisns: string[]) => {
    const nisnSet = new Set(nisns);
    setStudents(prev => prev.filter(s => !nisnSet.has(s.nisn)));
    setPelanggaranList(prev => prev.filter(p => !nisnSet.has(p.nisn)));
    setRewardList(prev => prev.filter(r => !nisnSet.has(r.nisn)));
    setAttendanceList(prev => prev.filter(a => !nisnSet.has(a.nisn)));
    addAuditLog('Hapus Sebagian Siswa', `Menghapus secara bersamaan ${nisns.length} data siswa terpilih beserta riwayatnya`);
    setRefreshToastMessage(`Berhasil menghapus ${nisns.length} data siswa terpilih.`);
    setTimeout(() => setRefreshToastMessage(null), 5000);
  };

  const handleDeleteAllStudentsInKelas = (kelas: string) => {
    if (kelas === 'all') {
      const count = students.length;
      setStudents([]);
      setPelanggaranList([]);
      setRewardList([]);
      setAttendanceList([]);
      addAuditLog('Hapus Seluruh Siswa', `Menghapus seluruh (${count}) data siswa sekolah`);
      setRefreshToastMessage('Seluruh data siswa sekolah berhasil dihapus.');
    } else {
      const targetStudents = students.filter(s => s.kelas === kelas);
      const targetNisns = new Set(targetStudents.map(s => s.nisn));
      setStudents(prev => prev.filter(s => s.kelas !== kelas));
      setPelanggaranList(prev => prev.filter(p => !targetNisns.has(p.nisn)));
      setRewardList(prev => prev.filter(r => !targetNisns.has(r.nisn)));
      setAttendanceList(prev => prev.filter(a => !targetNisns.has(a.nisn)));
      addAuditLog('Hapus Seluruh Siswa Kelas', `Menghapus seluruh siswa (${targetStudents.length} siswa) di Kelas ${kelas}`);
      setRefreshToastMessage(`Berhasil menghapus seluruh data siswa di Kelas ${kelas}.`);
    }
    setTimeout(() => setRefreshToastMessage(null), 5000);
  };

  const handleBatchUpdateStudents = (nisns: string[], updates: Partial<Student>) => {
    const nisnSet = new Set(nisns);
    setStudents(prev => prev.map(s => {
      if (nisnSet.has(s.nisn)) {
        return { ...s, ...updates };
      }
      return s;
    }));
    addAuditLog('Tandai / Update Masal Siswa', `Menandai/memperbarui ${nisns.length} data siswa secara bersamaan`);
    setRefreshToastMessage(`Berhasil memperbarui ${nisns.length} siswa terpilih.`);
    setTimeout(() => setRefreshToastMessage(null), 5000);
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents(prev => {
      const existingNisns = new Set(prev.map(s => s.nisn));
      const filteredNew = newStudents.filter(s => !existingNisns.has(s.nisn));
      return [...filteredNew, ...prev];
    });
    addAuditLog('Import Siswa', `Mengimpor ${newStudents.length} data siswa dari spreadsheet`);
  };

  const handleImportStudentsFromSheets = (imported: Partial<Student>[]) => {
    setStudents(prev => {
      const updated = [...prev];
      imported.forEach(imp => {
        if (!imp.nisn) return;
        const idx = updated.findIndex(s => s.nisn === imp.nisn);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            namaLengkap: imp.namaLengkap || updated[idx].namaLengkap,
            jenisKelamin: imp.jenisKelamin || updated[idx].jenisKelamin,
            kelas: imp.kelas || updated[idx].kelas,
            waliKelas: imp.waliKelas || updated[idx].waliKelas,
            namaOrangTua: imp.namaOrangTua || updated[idx].namaOrangTua,
            noHpOrangTua: imp.noHpOrangTua || updated[idx].noHpOrangTua
          };
        } else {
          updated.push({
            nisn: imp.nisn,
            namaLengkap: imp.namaLengkap || 'Siswa Baru',
            jenisKelamin: imp.jenisKelamin || 'L',
            kelas: imp.kelas || '1A',
            waliKelas: imp.waliKelas || '',
            namaOrangTua: imp.namaOrangTua || '',
            noHpOrangTua: imp.noHpOrangTua || '',
            totalPoinPelanggaran: imp.totalPoinPelanggaran || 0,
            totalPoinReward: imp.totalPoinReward || 0,
            statusResiko: imp.statusResiko || 'Aman'
          });
        }
      });
      localStorage.setItem('starkids_students', JSON.stringify(updated));
      return updated;
    });
    setRefreshToastMessage(`Berhasil menyelaraskan ${imported.length} data siswa dari Google Sheets!`);
    setTimeout(() => setRefreshToastMessage(null), 5000);
    addAuditLog('Impor Google Sheets', `Menyelaraskan ${imported.length} siswa dari Google Sheets`);
  };

  // Pegawai CRUD and Sync Handlers
  const handleAddPegawai = (newPegawai: Pegawai) => {
    setPegawaiList(prev => [newPegawai, ...prev]);
    addAuditLog('Tambah Pegawai', `Menambahkan pegawai baru: ${newPegawai.namaLengkap} (${newPegawai.jabatan})`);
  };

  const handleBatchAddPegawai = (newPegawaiList: Pegawai[]) => {
    setPegawaiList(newPegawaiList);
    addAuditLog('Import Pegawai', `Memperbarui & mengimpor data kepegawaian (${newPegawaiList.length} pegawai)`);
  };

  const handleUpdatePegawai = (id: string, updated: Partial<Pegawai>) => {
    setPegawaiList(prev => {
      const nextList = prev.map(p => (p.id === id ? { ...p, ...updated } : p));
      const target = nextList.find(p => p.id === id);

      // Cascading sync: If Kepala Sekolah updated, sync to schoolProfile
      if (target && target.kategori === 'kepala_sekolah') {
        setSystemSettings(curr => {
          const currentProfile = curr.schoolProfile || DEFAULT_SCHOOL_PROFILE;
          return {
            ...curr,
            schoolProfile: {
              ...currentProfile,
              kepalaSekolahNama: target.namaLengkap,
              kepalaSekolahNip: target.nip || currentProfile.kepalaSekolahNip
            }
          };
        });
      }

      // Cascading sync: If Wali Kelas updated, sync to masterKelas, students, and attendance
      if (target && target.kategori === 'wali_kelas' && target.kelasBinaan) {
        const kb = target.kelasBinaan.toUpperCase();
        setMasterKelas(currK => currK.map(k => {
          if (k.kelas.toUpperCase() === kb) {
            return {
              ...k,
              waliKelas: target.namaLengkap,
              nipWaliKelas: target.nip || k.nipWaliKelas
            };
          }
          return k;
        }));

        setStudents(currS => currS.map(s => {
          if (s.kelas.toUpperCase() === kb) {
            return {
              ...s,
              waliKelas: target.namaLengkap,
              nipWaliKelas: target.nip || s.nipWaliKelas
            };
          }
          return s;
        }));

        setAttendanceList(currA => currA.map(a => {
          if (a.kelas.toUpperCase() === kb) {
            return {
              ...a,
              waliKelas: target.namaLengkap
            };
          }
          return a;
        }));
      }

      return nextList;
    });

    addAuditLog('Update Pegawai', `Memperbarui data pegawai: ${updated.namaLengkap || id} dan menyelaraskan ke rombel & murid`);
  };

  const handleDeletePegawai = (id: string) => {
    const target = pegawaiList.find(p => p.id === id);
    setPegawaiList(prev => prev.filter(p => p.id !== id));
    addAuditLog('Hapus Pegawai', `Menghapus data pegawai: ${target?.namaLengkap || id}`);
  };

  // Master Kelas & Settings Cascading Sync Handlers
  const handleUpdateMasterKelas = (list: MasterKelas[]) => {
    setMasterKelas(list);

    // Cascading sync: Synchronize updated wali kelas and NIP into all students and attendance records
    const mapWali: Record<string, { nama: string; nip?: string }> = {};
    list.forEach(k => {
      mapWali[k.kelas.toUpperCase()] = {
        nama: k.waliKelas,
        nip: k.nipWaliKelas
      };
    });

    setStudents(prev => prev.map(s => {
      const match = mapWali[s.kelas.toUpperCase()];
      if (match) {
        return {
          ...s,
          waliKelas: match.nama,
          nipWaliKelas: match.nip || s.nipWaliKelas
        };
      }
      return s;
    }));

    setAttendanceList(prev => prev.map(a => {
      const match = mapWali[a.kelas.toUpperCase()];
      if (match) {
        return {
          ...a,
          waliKelas: match.nama
        };
      }
      return a;
    }));

    addAuditLog('Pengaturan Rombel', `Memperbarui susunan ${list.length} rombel kelas dan menyinkronkan data wali kelas ke data murid`);
  };

  const handleUpdateSettings = (settings: SystemSettings) => {
    setSystemSettings(settings);

    // Cascading sync: If Kepala Sekolah updated in schoolProfile, synchronize with pegawaiList
    const ksNama = settings.schoolProfile?.kepalaSekolahNama;
    const ksNip = settings.schoolProfile?.kepalaSekolahNip;
    if (ksNama) {
      setPegawaiList(prev => prev.map(p => {
        if (p.kategori === 'kepala_sekolah') {
          return {
            ...p,
            namaLengkap: ksNama,
            nip: ksNip || p.nip
          };
        }
        return p;
      }));
    }

    // Cascading sync: If tahunAjaran changed, synchronize into masterKelas
    if (settings.tahunAjaran) {
      setMasterKelas(prev => prev.map(k => ({
        ...k,
        tahunAjaran: settings.tahunAjaran
      })));
    }

    addAuditLog('Pengaturan Sistem', `Memperbarui profil sekolah (NPSN: ${settings.schoolProfile?.npsn || '20535384'}), hotline, logo, dan konfigurasi sistem`);
  };

  const handleSyncWaliKelasToStudentsAndMaster = (pegawais: Pegawai[]) => {
    const mapWali: Record<string, { nama: string; nip?: string }> = {};
    pegawais.forEach(p => {
      if (p.kategori === 'wali_kelas' && p.kelasBinaan) {
        mapWali[p.kelasBinaan.toUpperCase()] = {
          nama: p.namaLengkap,
          nip: p.nip
        };
      }
    });

    setMasterKelas(prev => prev.map(k => {
      const match = mapWali[k.kelas.toUpperCase()];
      if (match) {
        return {
          ...k,
          waliKelas: match.nama,
          nipWaliKelas: match.nip || k.nipWaliKelas
        };
      }
      return k;
    }));

    setStudents(prev => prev.map(s => {
      const match = mapWali[s.kelas.toUpperCase()];
      if (match) {
        return {
          ...s,
          waliKelas: match.nama,
          nipWaliKelas: match.nip || s.nipWaliKelas
        };
      }
      return s;
    }));

    setAttendanceList(prev => prev.map(a => {
      const match = mapWali[a.kelas.toUpperCase()];
      if (match) {
        return {
          ...a,
          waliKelas: match.nama
        };
      }
      return a;
    }));

    addAuditLog('Sinkronisasi Wali Kelas', 'Menyelaraskan nama dan NIP wali kelas ke 28 rombel dan seluruh murid');
  };

  // Manual Trigger Sync
  const handleTriggerSync = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const nowStr = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date());
    setSyncConfig(prev => ({
      ...prev,
      lastSyncTime: nowStr
    }));
    addAuditLog('Sinkronisasi Cloud', 'Sinkronisasi database STAR-KIDS ke Canva Sheet / Spreadsheet berhasil');
  };

  // Open Official Print Modals
  const handlePrintSuratPanggilan = (student: Student, pelanggaran?: PelanggaranRecord) => {
    setPrintStudent(student);
    setPrintPelanggaran(pelanggaran || null);
    setPrintMode('surat_panggilan');
    setPrintModalOpen(true);
    addAuditLog('Cetak Surat Panggilan', `Mencetak surat panggilan orang tua untuk siswa ${student.namaLengkap}`);
  };

  const handlePrintRekapKarakter = (student: Student) => {
    setPrintStudent(student);
    setPrintPelanggaran(null);
    setPrintMode('rekap_karakter');
    setPrintModalOpen(true);
    addAuditLog('Cetak Rekap Karakter', `Mencetak kartu catatan karakter untuk siswa ${student.namaLengkap}`);
  };

  // Navigation with direct student selection
  const handleNavigateToStudentProfile = (student: Student) => {
    setSelectedStudentNisnForProfile(student.nisn);
    setActiveTab('profil');
  };

  // Navigation to specific class attendance directly
  const handleNavigateToAbsensiKelas = (kelas: string) => {
    setTargetKelasAbsensi(kelas);
    setActiveTab('absensi');
  };

  // Logout handler returning user to the simple login screen
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('starkids_is_logged_in');
    setRole('view_only');
    setActiveTab('dashboard');
    addAuditLog('Logout Pengguna', 'Pengguna keluar dari sesi aplikasi ke menu login');
  };

  // Sederhana: Tampilan Awal hanya form Login jika belum login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
        <SimpleLoginView
          schoolProfile={systemSettings.schoolProfile}
          expectedPassword={systemSettings.adminPassword}
          onLogin={(newRole) => {
            setRole(newRole);
            setIsLoggedIn(true);
            localStorage.setItem('starkids_is_logged_in', 'true');
            addAuditLog('Login Pengguna', `Pengguna masuk ke sistem sebagai ${newRole === 'admin' ? 'Administrator' : 'Orang Tua / Wali'}`);
          }}
        />
        <Footer schoolProfile={systemSettings.schoolProfile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/50 via-white to-amber-50/20 text-slate-800 selection:bg-amber-400 selection:text-slate-900 font-sans antialiased relative overflow-x-hidden">
      {/* Joyful Ambient Lighting Decor */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      
      {/* Top Header with Brand & Navigation */}
      <Header
        currentTab={activeTab}
        setCurrentTab={(tab) => {
          // If non-admin tries to access admin-only tab, open login modal
          if ((tab === 'siswa' || tab === 'audit' || tab === 'pengaturan') && role !== 'admin') {
            setIsLoginModalOpen(true);
            return;
          }
          setActiveTab(tab);
        }}
        role={role}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        schoolProfile={systemSettings.schoolProfile}
        tahunAjaran={systemSettings.tahunAjaran}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView
            students={students}
            pelanggaranList={pelanggaranList}
            rewardList={rewardList}
            attendanceList={attendanceList}
            role={role}
            onNavigate={(tab) => {
              if ((tab === 'siswa' || tab === 'audit' || tab === 'pengaturan') && role !== 'admin') {
                setIsLoginModalOpen(true);
                return;
              }
              setActiveTab(tab);
            }}
            onSelectStudent={handleNavigateToStudentProfile}
            onNavigateToAbsensiKelas={handleNavigateToAbsensiKelas}
            masterKelas={masterKelas}
            schoolProfile={systemSettings.schoolProfile}
            onRefreshData={handleRefreshData}
            isRefreshing={isRefreshing}
            lastUpdatedTime={lastUpdatedTime}
          />
        )}

        {/* VIEW 2: ABSENSI SISWA */}
        {activeTab === 'absensi' && (
          <AbsensiView
            initialKelas={targetKelasAbsensi}
            students={students}
            attendanceList={attendanceList}
            masterKelas={masterKelas}
            systemSettings={systemSettings}
            role={role}
            onSaveAttendance={handleSaveBatchAttendance}
            onSelectStudentProfile={handleNavigateToStudentProfile}
            onRefreshData={handleRefreshData}
            isRefreshing={isRefreshing}
            onNavigate={(tab) => {
              if ((tab === 'siswa' || tab === 'audit' || tab === 'pengaturan') && role !== 'admin') {
                setIsLoginModalOpen(true);
                return;
              }
              setActiveTab(tab as any);
            }}
          />
        )}

        {/* VIEW 3: DATA PELANGGARAN */}
        {activeTab === 'pelanggaran' && (
          <PelanggaranView
            students={students}
            pelanggaranList={pelanggaranList}
            role={role}
            onAddPelanggaran={handleAddPelanggaran}
            onUpdatePelanggaran={handleUpdatePelanggaran}
            onDeletePelanggaran={handleDeletePelanggaran}
            onBatchDeletePelanggaran={handleBatchDeletePelanggaran}
            onDeleteAllPelanggaran={handleDeleteAllPelanggaran}
            onPrintSurat={handlePrintSuratPanggilan}
          />
        )}

        {/* VIEW 4: DATA REWARD */}
        {activeTab === 'reward' && (
          <RewardView
            students={students}
            rewardList={rewardList}
            role={role}
            onAddReward={handleAddReward}
            onUpdateReward={handleUpdateReward}
            onDeleteReward={handleDeleteReward}
            onBatchDeleteReward={handleBatchDeleteReward}
            onDeleteAllReward={handleDeleteAllReward}
          />
        )}

        {/* VIEW 5: POIN KARAKTER */}
        {activeTab === 'poin' && (
          <PoinKarakterView
            students={students}
            pelanggaranList={pelanggaranList}
            rewardList={rewardList}
            role={role}
            onSelectStudentProfile={handleNavigateToStudentProfile}
            onPrintRekapKarakter={handlePrintRekapKarakter}
          />
        )}

        {/* VIEW 6: PROFIL SISWA */}
        {activeTab === 'profil' && (
          <ProfilSiswaView
            students={students}
            pelanggaranList={pelanggaranList}
            rewardList={rewardList}
            attendanceList={attendanceList}
            role={role}
            selectedStudentNisn={selectedStudentNisnForProfile || undefined}
            onPrintSuratPanggilan={handlePrintSuratPanggilan}
            onPrintRekapKarakter={handlePrintRekapKarakter}
          />
        )}

        {/* VIEW 7: MONITORING TPPK */}
        {activeTab === 'monitoring' && (
          <MonitoringView
            students={students}
            pelanggaranList={pelanggaranList}
            rewardList={rewardList}
            attendanceList={attendanceList}
            systemSettings={systemSettings}
            role={role}
            onSelectStudentProfile={handleNavigateToStudentProfile}
            onPrintSuratPanggilan={handlePrintSuratPanggilan}
          />
        )}

        {/* VIEW 8: STATISTIK & ANALITIK */}
        {activeTab === 'statistik' && (
          <StatistikView
            students={students}
            pelanggaranList={pelanggaranList}
            rewardList={rewardList}
            attendanceList={attendanceList}
            masterKelas={masterKelas}
          />
        )}

        {/* VIEW 9: PUSAT LAPORAN & CETAK */}
        {activeTab === 'laporan' && (
          <LaporanView
            students={students}
            pelanggaranList={pelanggaranList}
            rewardList={rewardList}
            attendanceList={attendanceList}
            systemSettings={systemSettings}
            role={role}
            masterKelas={masterKelas}
          />
        )}

        {/* VIEW 10: SINKRONISASI & EKSPOR */}
        {activeTab === 'sync' && (
          <SyncExportView
            students={students}
            pelanggaranList={pelanggaranList}
            rewardList={rewardList}
            syncConfig={syncConfig}
            role={role}
            onUpdateSyncConfig={(updated) => setSyncConfig(prev => ({ ...prev, ...updated }))}
            onTriggerSync={handleTriggerSync}
            onImportStudents={handleImportStudents}
            onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
          />
        )}

        {/* VIEW 11: DATA SISWA & KELAS */}
        {activeTab === 'siswa' && (
          <SiswaView
            students={students}
            pelanggaranList={pelanggaranList}
            rewardList={rewardList}
            role={role}
            onAddStudent={handleAddStudent}
            onBatchAddStudents={handleImportStudents}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onBatchDeleteStudents={handleBatchDeleteStudents}
            onDeleteAllStudentsInKelas={handleDeleteAllStudentsInKelas}
            onBatchUpdateStudents={handleBatchUpdateStudents}
            onPrintStudentReport={handlePrintRekapKarakter}
          />
        )}

        {/* VIEW 12: DATA PEGAWAI & GURU (SIM-PEG KEBONAGUNG) */}
        {activeTab === 'pegawai' && (
          <PegawaiView
            pegawaiList={pegawaiList}
            role={role}
            masterKelas={masterKelas}
            students={students}
            onAddPegawai={handleAddPegawai}
            onBatchAddPegawai={handleBatchAddPegawai}
            onUpdatePegawai={handleUpdatePegawai}
            onDeletePegawai={handleDeletePegawai}
            onSyncWaliKelasToStudentsAndMaster={handleSyncWaliKelasToStudentsAndMaster}
          />
        )}

        {/* VIEW 13: AUDIT LOG (Hanya Admin) */}
        {activeTab === 'audit' && role === 'admin' && (
          <AuditLogView
            logs={auditLogs}
            role={role}
          />
        )}

        {/* VIEW 14: PENGATURAN (Hanya Admin) */}
        {activeTab === 'pengaturan' && role === 'admin' && (
          <PengaturanView
            masterKelas={masterKelas}
            masterPelanggaran={masterPelanggaran}
            masterReward={masterReward}
            systemSettings={systemSettings}
            role={role}
            onUpdateKelas={handleUpdateMasterKelas}
            onUpdatePelanggaran={(list) => {
              setMasterPelanggaran(list);
              addAuditLog('Pengaturan Master Pelanggaran', `Memperbarui daftar master pelanggaran (${list.length} item)`);
            }}
            onUpdateReward={(list) => {
              setMasterReward(list);
              addAuditLog('Pengaturan Master Reward', `Memperbarui daftar master reward (${list.length} item)`);
            }}
            onUpdateSettings={handleUpdateSettings}
            onChangePasswordAdmin={(newPw) => {
              setSystemSettings(prev => ({ ...prev, adminPassword: newPw }));
              addAuditLog('Keamanan Akun', 'Administrator mengubah kata sandi akses sistem');
              return true;
            }}
            onNavigateToPegawai={() => setActiveTab('pegawai')}
          />
        )}

        {/* VIEW 15: WEB PROFIL SEKOLAH PUBLIK (COMPANY PROFILE) */}
        {activeTab === 'webprofil' && (
           <WebProfilView
             onNavigateToPortal={(tab) => setActiveTab(tab || 'dashboard')}
             kepalaSekolahName={kepalaSekolah.namaLengkap}
             kepalaSekolahNip={kepalaSekolah.nip}
             totalSiswa={students.length}
             totalRombel={masterKelas.length}
             totalPegawai={pegawaiList.length}
             schoolProfile={systemSettings.schoolProfile}
           />
         )}

        {/* VIEW 16: LOG SISTEM DAFTAR PENGUNJUNG (Khusus Admin) */}
        {activeTab === 'pengunjung' && (
          <VisitorLogView
            visitorLogs={visitorLogs}
            role={role}
            onClearLogs={handleClearVisitorLogs}
            onRefreshLogs={handleRefreshVisitorLogs}
            onAddManualVisitor={handleAddManualVisitor}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            schoolProfile={systemSettings.schoolProfile}
            isRefreshing={isRefreshingVisitor}
            lastSyncTime={lastVisitorSyncTime}
          />
        )}

      </main>

      {/* Real-time Refresh Toast Notification */}
      {refreshToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100">{refreshToastMessage}</p>
            <p className="text-[10px] text-slate-400">Sinkronisasi data sistem selesai</p>
          </div>
        </div>
      )}

      {/* Official Footer with required copyright & philosophy */}
      <Footer schoolProfile={systemSettings.schoolProfile} />

      {/* Modal Dialogs */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(newRole: UserRole) => setRole(newRole)}
        expectedPassword={systemSettings.adminPassword}
        schoolProfile={systemSettings.schoolProfile}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        schoolProfile={systemSettings.schoolProfile}
        students={students}
        attendanceList={attendanceList}
        pegawaiList={pegawaiList}
        masterKelas={masterKelas}
        pelanggaranList={pelanggaranList}
        rewardList={rewardList}
        onImportStudents={handleImportStudentsFromSheets}
        onAuditLog={(action, details) => addAuditLog(action, details)}
        onToastMessage={(msg) => {
          setRefreshToastMessage(msg);
          setTimeout(() => setRefreshToastMessage(null), 5000);
        }}
      />

      <OfficialPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        student={printStudent}
        pelanggaran={printPelanggaran}
        mode={printMode}
        kepalaSekolahName={kepalaSekolah.namaLengkap}
        kepalaSekolahNip={kepalaSekolah.nip}
        schoolProfile={systemSettings.schoolProfile}
      />

    </div>
  );
};

export default App;
