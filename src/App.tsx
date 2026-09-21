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
  Pegawai
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
import { PengaturanView } from './components/PengaturanView';
import { OfficialPrintModal } from './components/OfficialPrintModal';
import { WebProfilView } from './components/WebProfilView';
import { SimpleLoginView } from './components/SimpleLoginView';
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
  useEffect(() => { localStorage.setItem('starkids_sync_config', JSON.stringify(syncConfig)); }, [syncConfig]);
  useEffect(() => { localStorage.setItem('starkids_pegawai', JSON.stringify(pegawaiList)); }, [pegawaiList]);

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

  // Refresh & Update state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToastMessage, setRefreshToastMessage] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => {
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()) + ' WIB';
  });

  const handleRefreshData = useCallback(() => {
    setIsRefreshing(true);
    try {
      const savedStudents = localStorage.getItem('starkids_students');
      if (savedStudents) {
        try {
          const parsed = JSON.parse(savedStudents);
          if (Array.isArray(parsed) && parsed.length > 0) setStudents(parsed);
        } catch (e) {}
      }
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
      const savedAtt = localStorage.getItem('starkids_attendance');
      if (savedAtt) {
        try {
          const parsed = JSON.parse(savedAtt);
          if (Array.isArray(parsed)) setAttendanceList(parsed);
        } catch (e) {}
      }
      const savedSettings = localStorage.getItem('starkids_system_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed && typeof parsed === 'object') setSystemSettings(parsed);
        } catch (e) {}
      }

      const nowStr = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()) + ' WIB';
      setLastUpdatedTime(nowStr);
      setRefreshToastMessage(`Data sistem berhasil dimuat ulang & diperbarui (${nowStr})`);
      setTimeout(() => {
        setRefreshToastMessage(null);
      }, 3500);
      addAuditLog('Refresh Data', 'Pembaruan dan sinkronisasi data sistem');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 400);
    }
  }, [addAuditLog]);

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

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents(prev => {
      const existingNisns = new Set(prev.map(s => s.nisn));
      const filteredNew = newStudents.filter(s => !existingNisns.has(s.nisn));
      return [...filteredNew, ...prev];
    });
    addAuditLog('Import Siswa', `Mengimpor ${newStudents.length} data siswa dari spreadsheet`);
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
