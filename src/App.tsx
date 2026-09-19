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
  AttendanceStatus
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
  INITIAL_AUDIT_LOGS
} from './data/initialData';
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
import { SyncExportView } from './components/SyncExportView';
import { AuditLogView } from './components/AuditLogView';
import { PengaturanView } from './components/PengaturanView';
import { OfficialPrintModal } from './components/OfficialPrintModal';

export const App: React.FC = () => {
  // Authentication Role State
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('starkids_role');
    return (saved === 'admin' || saved === 'view_only') ? saved : 'view_only';
  });

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [selectedStudentNisnForProfile, setSelectedStudentNisnForProfile] = useState<string | null>(null);

  // Core Data States with LocalStorage Cache
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('starkids_students');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_STUDENTS;
  });

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
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_ATTENDANCE;
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
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_SYSTEM_SETTINGS;
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
  useEffect(() => { localStorage.setItem('starkids_sync_config', JSON.stringify(syncConfig)); }, [syncConfig]);

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
    addAuditLog('Update Siswa', `Memperbarui data biodata siswa NISN ${nisn}`);
  };

  const handleDeleteStudent = (nisn: string) => {
    const target = students.find(s => s.nisn === nisn);
    setStudents(prev => prev.filter(s => s.nisn !== nisn));
    setPelanggaranList(prev => prev.filter(p => p.nisn !== nisn));
    setRewardList(prev => prev.filter(r => r.nisn !== nisn));
    setAttendanceList(prev => prev.filter(a => a.nisn !== nisn));
    addAuditLog('Hapus Siswa', `Menghapus siswa ${target?.namaLengkap || nisn} berserta seluruh riwayatnya`);
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents(prev => {
      const existingNisns = new Set(prev.map(s => s.nisn));
      const filteredNew = newStudents.filter(s => !existingNisns.has(s.nisn));
      return [...filteredNew, ...prev];
    });
    addAuditLog('Import Siswa', `Mengimpor ${newStudents.length} data siswa dari spreadsheet`);
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
        onLogout={() => {
          setRole('view_only');
          setActiveTab('dashboard');
        }}
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
          />
        )}

        {/* VIEW 2: ABSENSI SISWA */}
        {activeTab === 'absensi' && (
          <AbsensiView
            students={students}
            attendanceList={attendanceList}
            masterKelas={masterKelas}
            systemSettings={systemSettings}
            role={role}
            onSaveAttendance={handleSaveBatchAttendance}
            onSelectStudentProfile={handleNavigateToStudentProfile}
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
          />
        )}

        {/* VIEW 11: DATA SISWA (Hanya Admin) */}
        {activeTab === 'siswa' && role === 'admin' && (
          <SiswaView
            students={students}
            pelanggaranList={pelanggaranList}
            rewardList={rewardList}
            role={role}
            onAddStudent={handleAddStudent}
            onBatchAddStudents={handleImportStudents}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onPrintStudentReport={handlePrintRekapKarakter}
          />
        )}

        {/* VIEW 12: AUDIT LOG (Hanya Admin) */}
        {activeTab === 'audit' && role === 'admin' && (
          <AuditLogView
            logs={auditLogs}
            role={role}
          />
        )}

        {/* VIEW 13: PENGATURAN (Hanya Admin) */}
        {activeTab === 'pengaturan' && role === 'admin' && (
          <PengaturanView
            masterKelas={masterKelas}
            masterPelanggaran={masterPelanggaran}
            masterReward={masterReward}
            systemSettings={systemSettings}
            role={role}
            onUpdateKelas={(list) => {
              setMasterKelas(list);
              addAuditLog('Pengaturan Rombel', `Memperbarui susunan ${list.length} rombel kelas`);
            }}
            onUpdatePelanggaran={(list) => {
              setMasterPelanggaran(list);
              addAuditLog('Pengaturan Master Pelanggaran', `Memperbarui daftar master pelanggaran (${list.length} item)`);
            }}
            onUpdateReward={(list) => {
              setMasterReward(list);
              addAuditLog('Pengaturan Master Reward', `Memperbarui daftar master reward (${list.length} item)`);
            }}
            onUpdateSettings={(settings) => {
              setSystemSettings(settings);
              addAuditLog('Pengaturan Sistem', 'Memperbarui ambang batas monitoring dan tahun ajaran');
            }}
            onChangePasswordAdmin={(newPw) => {
              setSystemSettings(prev => ({ ...prev, adminPassword: newPw }));
              addAuditLog('Keamanan Akun', 'Administrator mengubah kata sandi akses sistem');
              return true;
            }}
          />
        )}

      </main>

      {/* Official Footer with required copyright & philosophy */}
      <Footer />

      {/* Modal Dialogs */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(newRole: UserRole) => setRole(newRole)}
        expectedPassword={systemSettings.adminPassword}
      />

      <OfficialPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        student={printStudent}
        pelanggaran={printPelanggaran}
        mode={printMode}
      />

    </div>
  );
};

export default App;
