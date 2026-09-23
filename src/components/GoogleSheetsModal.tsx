import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Plus, 
  Upload, 
  Download, 
  LogOut, 
  X, 
  ShieldCheck, 
  Check, 
  User as UserIcon,
  FolderSync
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken 
} from '../lib/googleAuth';
import { GoogleSheetsService } from '../services/googleSheetsService';
import { 
  Student, 
  AttendanceRecord, 
  Pegawai, 
  MasterKelas, 
  PelanggaranRecord, 
  RewardRecord, 
  SchoolProfileData,
  GoogleSheetsSyncConfig
} from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolProfile?: SchoolProfileData;
  students: Student[];
  attendanceList: AttendanceRecord[];
  pegawaiList: Pegawai[];
  masterKelas: MasterKelas[];
  pelanggaranList: PelanggaranRecord[];
  rewardList: RewardRecord[];
  onImportStudents?: (students: Partial<Student>[]) => void;
  onAuditLog?: (action: string, details: string) => void;
  onToastMessage?: (msg: string) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  schoolProfile,
  students,
  attendanceList,
  pegawaiList,
  masterKelas,
  pelanggaranList,
  rewardList,
  onImportStudents,
  onAuditLog,
  onToastMessage
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sheets Config
  const [config, setConfig] = useState<GoogleSheetsSyncConfig>(() => {
    const saved = localStorage.getItem('starkids_google_sheets_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      spreadsheetId: '',
      spreadsheetUrl: '',
      spreadsheetTitle: '',
      lastSyncTime: null,
      status: 'idle',
      autoSync: false
    };
  });

  const [inputUrlOrId, setInputUrlOrId] = useState(config.spreadsheetUrl || config.spreadsheetId || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation Modal for Destructive Workspace Operations
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'export' | 'import';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'export',
    onConfirm: () => {}
  });

  // Save config changes
  const saveConfig = (newConfig: GoogleSheetsSyncConfig) => {
    setConfig(newConfig);
    localStorage.setItem('starkids_google_sheets_config', JSON.stringify(newConfig));
  };

  // Initialize Auth on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Helper to extract Spreadsheet ID
  const extractSpreadsheetId = (input: string): string => {
    const clean = input.trim();
    const match = clean.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return clean;
  };

  const handleConnectSpreadsheet = async () => {
    if (!token) {
      setActionMessage({ type: 'error', text: 'Silakan masuk dengan akun Google terlebih dahulu.' });
      return;
    }

    const id = extractSpreadsheetId(inputUrlOrId);
    if (!id) {
      setActionMessage({ type: 'error', text: 'Mohon masukkan tautan URL atau ID Spreadsheet Google Sheets yang valid.' });
      return;
    }

    try {
      setIsSyncing(true);
      setActionMessage(null);
      const info = await GoogleSheetsService.getSpreadsheetInfo(token, id);
      const updatedConfig: GoogleSheetsSyncConfig = {
        ...config,
        spreadsheetId: info.spreadsheetId,
        spreadsheetUrl: info.spreadsheetUrl,
        spreadsheetTitle: info.title,
        status: 'idle',
        lastMessage: `Terhubung dengan "${info.title}"`
      };
      saveConfig(updatedConfig);
      setActionMessage({ type: 'success', text: `Berhasil terhubung ke spreadsheet: "${info.title}"` });
      onAuditLog?.('Koneksi Google Sheets', `Menghubungkan spreadsheet ${info.title} (${info.spreadsheetId})`);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Gagal mengakses spreadsheet. Pastikan izin akses dibuka.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateNewSpreadsheet = async () => {
    if (!token) {
      setActionMessage({ type: 'error', text: 'Silakan masuk dengan akun Google terlebih dahulu.' });
      return;
    }

    try {
      setIsCreating(true);
      setActionMessage(null);
      const info = await GoogleSheetsService.createSchoolSpreadsheet(
        token, 
        schoolProfile?.namaSingkat || schoolProfile?.namaSekolah || 'SDN Kebonagung 1'
      );

      const updatedConfig: GoogleSheetsSyncConfig = {
        ...config,
        spreadsheetId: info.spreadsheetId,
        spreadsheetUrl: info.spreadsheetUrl,
        spreadsheetTitle: info.title,
        status: 'idle',
        lastMessage: `Spreadsheet baru dibuat di Google Drive: "${info.title}"`
      };
      saveConfig(updatedConfig);
      setInputUrlOrId(info.spreadsheetUrl);
      setActionMessage({ type: 'success', text: `Spreadsheet baru berhasil dibuat di Google Drive Anda! Tab profil, data siswa, presensi, dan rombel telah disiapkan.` });
      onAuditLog?.('Buat Google Sheets', `Membuat spreadsheet baru ${info.title} (${info.spreadsheetId})`);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Gagal membuat spreadsheet baru di Google Drive.' });
    } finally {
      setIsCreating(false);
    }
  };

  // Perform Export with explicit user confirmation
  const requestExportConfirmation = () => {
    if (!token) {
      setActionMessage({ type: 'error', text: 'Silakan login Google terlebih dahulu.' });
      return;
    }
    const targetId = config.spreadsheetId || extractSpreadsheetId(inputUrlOrId);
    if (!targetId) {
      setActionMessage({ type: 'error', text: 'Pilih atau hubungkan spreadsheet terlebih dahulu.' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Konfirmasi Sinkronisasi ke Google Sheets',
      description: `Apakah Anda yakin ingin mengekspor seluruh data STAR-KIDS (${students.length} Peserta Didik, ${attendanceList.length} Catatan Presensi, ${pegawaiList.length} Pegawai, Profil Sekolah, & Riwayat Karakter) ke spreadsheet "${config.spreadsheetTitle || targetId}"? Data pada tab-tab tersebut di Google Sheets akan diperbarui sesuai data terkini.`,
      actionType: 'export',
      onConfirm: () => executeExport(targetId)
    });
  };

  const executeExport = async (targetId: string) => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    setIsSyncing(true);
    setActionMessage(null);

    try {
      const activeToken = (await getAccessToken()) || token;
      if (!activeToken) throw new Error('Sesi otorisasi Google telah kedaluwarsa. Silakan login kembali.');

      const result = await GoogleSheetsService.exportAllData(activeToken, targetId, {
        schoolProfile,
        students,
        attendanceList,
        pegawaiList,
        masterKelas,
        pelanggaranList,
        rewardList
      });

      const updatedConfig: GoogleSheetsSyncConfig = {
        ...config,
        spreadsheetId: targetId,
        lastSyncTime: result.timestamp,
        status: 'success',
        lastMessage: `Berhasil sinkronisasi ${result.updatedCells} sel`
      };
      saveConfig(updatedConfig);
      setActionMessage({
        type: 'success',
        text: `Data sekolah berhasil disinkronkan ke Google Sheets! (${result.updatedCells} sel diperbarui pada ${result.timestamp})`
      });
      onToastMessage?.(`Sinkronisasi Google Sheets Berhasil (${result.timestamp})`);
      onAuditLog?.('Ekspor Google Sheets', `Sinkronisasi seluruh data (${students.length} siswa, ${attendanceList.length} presensi) ke Google Sheets ${targetId}`);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan saat mengekspor data ke Google Sheets.'
      });
      saveConfig({
        ...config,
        status: 'error',
        lastMessage: err.message
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Perform Import with explicit user confirmation
  const requestImportConfirmation = () => {
    if (!token) {
      setActionMessage({ type: 'error', text: 'Silakan login Google terlebih dahulu.' });
      return;
    }
    const targetId = config.spreadsheetId || extractSpreadsheetId(inputUrlOrId);
    if (!targetId) {
      setActionMessage({ type: 'error', text: 'Pilih atau hubungkan spreadsheet terlebih dahulu.' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Konfirmasi Tarik / Impor Data dari Google Sheets',
      description: `Sistem akan membaca tab "Data Siswa" dari spreadsheet "${config.spreadsheetTitle || targetId}" dan menyelaraskannya ke STAR-KIDS. Apakah Anda yakin ingin melanjutkan?`,
      actionType: 'import',
      onConfirm: () => executeImport(targetId)
    });
  };

  const executeImport = async (targetId: string) => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    setIsSyncing(true);
    setActionMessage(null);

    try {
      const activeToken = (await getAccessToken()) || token;
      if (!activeToken) throw new Error('Sesi otorisasi Google telah kedaluwarsa. Silakan login kembali.');

      const imported = await GoogleSheetsService.importStudents(activeToken, targetId);
      if (imported.length === 0) {
        throw new Error('Tidak ada baris data siswa yang ditemukan pada tab "Data Siswa".');
      }

      onImportStudents?.(imported);
      setActionMessage({
        type: 'success',
        text: `Berhasil mengimpor ${imported.length} data siswa dari Google Sheets ke STAR-KIDS!`
      });
      onToastMessage?.(`Berhasil memuat ${imported.length} siswa dari Google Sheets`);
      onAuditLog?.('Impor Google Sheets', `Mengimpor ${imported.length} siswa dari Google Sheets ${targetId}`);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Gagal mengimpor data dari Google Sheets.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        onToastMessage?.(`Login Google berhasil: ${res.user.displayName || res.user.email}`);
        onAuditLog?.('Login Google Workspace', `Pengguna menghubungkan Google Account: ${res.user.email}`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Gagal login dengan Google.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setActionMessage(null);
    onAuditLog?.('Logout Google Workspace', 'Pengguna memutus integrasi akun Google');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <FileSpreadsheet className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Integrasi Google Sheets</h2>
                <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/30 uppercase tracking-wider">
                  Cloud Workspace
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Sinkronisasi database sekolah realtime dua arah dengan spreadsheet Google Drive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Authentication State */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {user ? (
                user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Google User'} 
                    className="w-12 h-12 rounded-full border-2 border-emerald-500 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-300">
                    {(user.displayName || user.email || 'G')[0].toUpperCase()}
                  </div>
                )
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center">
                  <Cloud className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Akun Google</span>
                  {user && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Check className="w-3 h-3" /> Terhubung
                    </span>
                  )}
                </div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {user ? (user.displayName || user.email) : 'Belum Terhubung ke Google'}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {user ? user.email : 'Masuk untuk mengizinkan akses simpan dan baca Google Sheets'}
                </div>
              </div>
            </div>

            <div>
              {user ? (
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span>Keluar Akun</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isAuthLoading}
                  className="gsi-material-button inline-flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 hover:shadow-xs rounded-xl text-xs font-black text-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>{isAuthLoading ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Section 2: Spreadsheet Target */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Dokumen Google Sheets Terpilih
              </label>
              {config.spreadsheetUrl && (
                <a
                  href={config.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-700 font-extrabold hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka di Google Sheets</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tempel Tautan Google Sheets atau ID Spreadsheet..."
                  value={inputUrlOrId}
                  onChange={(e) => setInputUrlOrId(e.target.value)}
                  disabled={!user || isSyncing || isCreating}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono disabled:opacity-60"
                />
              </div>

              <button
                type="button"
                onClick={handleConnectSpreadsheet}
                disabled={!user || isSyncing || isCreating || !inputUrlOrId.trim()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <FolderSync className="w-3.5 h-3.5" />
                <span>Hubungkan</span>
              </button>

              <button
                type="button"
                onClick={handleCreateNewSpreadsheet}
                disabled={!user || isSyncing || isCreating}
                title="Buat Spreadsheet baru lengkap dengan 7 tab format STAR-KIDS di Google Drive"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCreating ? 'Membuat...' : 'Buat Baru di Drive'}</span>
              </button>
            </div>

            {config.spreadsheetTitle && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="font-extrabold text-slate-900">{config.spreadsheetTitle}</span>
                    <div className="text-[10px] text-slate-500 font-mono">ID: {config.spreadsheetId}</div>
                  </div>
                </div>
                {config.lastSyncTime && (
                  <div className="text-right text-[11px] text-slate-600">
                    <span className="text-slate-400">Terakhir disinkronkan:</span> <br/>
                    <strong className="text-emerald-800 font-bold">{config.lastSyncTime}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Synchronization Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export Card */}
            <div className="p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 transition-colors flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Ekspor Seluruh Data ke Sheets</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mengirimkan seluruh data murid ({students.length} Siswa), riwayat presensi harian ({attendanceList.length} rekor), kepegawaian, dan profil sekolah ke dalam tab Google Sheets.
                </p>
              </div>

              <button
                type="button"
                onClick={requestExportConfirmation}
                disabled={!user || isSyncing || (!config.spreadsheetId && !inputUrlOrId.trim())}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'SINKRONKAN KE GOOGLE SHEETS'}</span>
              </button>
            </div>

            {/* Import Card */}
            <div className="p-4 rounded-2xl border-2 border-blue-100 bg-blue-50/40 hover:bg-blue-50 transition-colors flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Tarik / Impor dari Sheets</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Membaca data dari tab "Data Siswa" pada spreadsheet dan menyelaraskannya ke sistem STAR-KIDS secara otomatis.
                </p>
              </div>

              <button
                type="button"
                onClick={requestImportConfirmation}
                disabled={!user || isSyncing || (!config.spreadsheetId && !inputUrlOrId.trim())}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>TARIK DATA DARI SHEETS</span>
              </button>
            </div>
          </div>

          {/* Feedback Toast / Alert Banner */}
          {actionMessage && (
            <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold animate-in fade-in ${
              actionMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* Guidelines Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Keamanan Akses Google Workspace</span>
            </div>
            <p>
              Aplikasi menggunakan otorisasi resmi Google OAuth dengan cakupan akses terbatas ke Google Drive & Sheets. Token tersimpan aman di memori sesi aktif dan data tersimpan langsung ke akun Google Drive milik sekolah Anda.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Status: {config.status === 'success' ? '🟢 Tersinkronisasi' : user ? '🔵 Akun Google Terhubung' : '⚪ Menunggu Otorisasi'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>

      {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE / MUTATING WORKSPACE OPERATIONS */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">{confirmDialog.title}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-black text-white shadow-xs transition cursor-pointer ${
                  confirmDialog.actionType === 'export'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
