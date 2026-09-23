import React, { useState } from 'react';
import { Student, PelanggaranRecord, RewardRecord, CanvaSyncConfig, UserRole } from '../types';
import { 
  Cloud, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  Table, 
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';

interface SyncExportViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  rewardList: RewardRecord[];
  syncConfig: CanvaSyncConfig;
  role: UserRole;
  onUpdateSyncConfig: (updated: Partial<CanvaSyncConfig>) => void;
  onTriggerSync: () => Promise<void>;
  onImportStudents: (newStudents: Student[]) => void;
  onOpenGoogleSheets?: () => void;
}

export const SyncExportView: React.FC<SyncExportViewProps> = ({
  students,
  pelanggaranList,
  rewardList,
  syncConfig,
  role,
  onUpdateSyncConfig,
  onTriggerSync,
  onImportStudents,
  onOpenGoogleSheets
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [canvaUrl, setCanvaUrl] = useState(syncConfig.sheetUrl);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(syncConfig.autoSync);
  const [activePreviewTab, setActivePreviewTab] = useState<'pelanggaran' | 'reward' | 'siswa'>('pelanggaran');

  // Handle Manual Sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg('');
    try {
      await onTriggerSync();
      setSyncSuccessMsg(`Sinkronisasi berhasil! ${pelanggaranList.length + rewardList.length} data tersimpan ke Canva Sheet.`);
      setTimeout(() => setSyncSuccessMsg(''), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Save Settings
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSyncConfig({
      sheetUrl: canvaUrl,
      autoSync: autoSyncEnabled
    });
    setSyncSuccessMsg('Pengaturan URL Canva Sheet berhasil disimpan.');
    setTimeout(() => setSyncSuccessMsg(''), 4000);
  };

  // Utility to export CSV
  const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export 1: Pelanggaran to Excel/CSV (Format Standar BAB 4 Canva Sheet)
  const exportPelanggaranCSV = () => {
    const headers = [
      'ID Pelanggaran',
      'Tanggal',
      'Jam',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Jenis Pelanggaran',
      'Kategori',
      'Poin Pelanggaran',
      'Lokasi Kejadian',
      'Aktivitas Saat Kejadian',
      'Tindak Lanjut',
      'Status Penanganan',
      'Catatan Tambahan',
      'Petugas TPPK'
    ];

    const rows = pelanggaranList.map(p => [
      `"${p.id}"`,
      `"${p.tanggal}"`,
      `"${p.jam || '09:00'}"`,
      `"${p.nisn}"`,
      `"${p.namaSiswa.replace(/"/g, '""')}"`,
      `"${p.kelas}"`,
      `"${p.jenisPelanggaran.replace(/"/g, '""')}"`,
      `"${p.kategori}"`,
      p.poin,
      `"${p.lokasiKejadian}"`,
      `"${p.aktivitasSaatPelanggaran}"`,
      `"${p.tindakLanjut.replace(/"/g, '""')}"`,
      `"${p.statusPenanganan}"`,
      `"${(p.catatan || '').replace(/"/g, '""')}"`,
      `"${p.petugas}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csvContent, `STAR_KIDS_Data_Pelanggaran_SDN_Kebonagung_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export 2: Reward to Excel/CSV
  const exportRewardCSV = () => {
    const headers = [
      'ID Reward',
      'Tanggal',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Jenis Apresiasi / Reward',
      'Kategori Reward',
      'Tingkat',
      'Poin Reward',
      'Mapel Konversi',
      'Poin Bonus Nilai',
      'Predikat',
      'Catatan Prestasi',
      'Petugas Penilai'
    ];

    const rows = rewardList.map(r => [
      `"${r.id}"`,
      `"${r.tanggal}"`,
      `"${r.nisn}"`,
      `"${r.namaSiswa.replace(/"/g, '""')}"`,
      `"${r.kelas}"`,
      `"${r.jenisReward.replace(/"/g, '""')}"`,
      `"${r.kategori}"`,
      `"${r.tingkat}"`,
      r.poin,
      `"${r.konversiNilai.mataPelajaran}"`,
      r.konversiNilai.poinBonus,
      `"${r.konversiNilai.predikat}"`,
      `"${(r.catatan || '').replace(/"/g, '""')}"`,
      `"${r.petugas}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csvContent, `STAR_KIDS_Data_Reward_SDN_Kebonagung_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export 3: Rekap Siswa to Excel/CSV
  const exportSiswaCSV = () => {
    const headers = [
      'NISN',
      'Nama Lengkap',
      'Jenis Kelamin',
      'Kelas',
      'Wali Kelas',
      'Nama Orang Tua',
      'No HP WhatsApp Orang Tua',
      'Total Poin Pelanggaran',
      'Total Poin Reward',
      'Status Karakter'
    ];

    const rows = students.map(s => [
      `"${s.nisn}"`,
      `"${s.namaLengkap.replace(/"/g, '""')}"`,
      `"${s.jenisKelamin}"`,
      `"${s.kelas}"`,
      `"${s.waliKelas}"`,
      `"${s.namaOrangTua.replace(/"/g, '""')}"`,
      `"${s.noHpOrangTua}"`,
      s.totalPoinPelanggaran,
      s.totalPoinReward,
      `"${s.statusResiko}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csvContent, `STAR_KIDS_Rekap_Siswa_SDN_Kebonagung_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Handle File Upload / Import CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          alert('File kosong atau format tidak sesuai.');
          return;
        }

        const newImported: Student[] = [];
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
          if (parts.length >= 4) {
            newImported.push({
              nisn: parts[0] || `012345${Math.floor(Math.random() * 9000 + 1000)}`,
              namaLengkap: parts[1] || 'Siswa Baru',
              jenisKelamin: (parts[2] === 'P' ? 'P' : 'L'),
              kelas: parts[3] || '1A',
              waliKelas: parts[4] || 'Wali Kelas SDN Kebonagung',
              namaOrangTua: parts[5] || 'Orang Tua Siswa',
              noHpOrangTua: parts[6] || '081234567890',
              totalPoinPelanggaran: Number(parts[7]) || 0,
              totalPoinReward: Number(parts[8]) || 0,
              statusResiko: 'Aman'
            });
          }
        }

        if (newImported.length > 0) {
          onImportStudents(newImported);
          setSyncSuccessMsg(`Berhasil mengimpor ${newImported.length} siswa ke sistem STAR-KIDS!`);
          setTimeout(() => setSyncSuccessMsg(''), 5000);
        }
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file CSV. Pastikan format kolom sesuai.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Integrasi Cloud & Format Standar BAB 4</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sinkronisasi & Ekspor Canva Sheet
          </h1>
          <p className="text-xs text-slate-500">
            Penyimpanan data terintegrasi, pembaruan otomatis, serta ekspor format Microsoft Excel & Spreadsheet
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Menyinkronkan Data...' : 'Sinkronkan Sekarang'}</span>
        </button>
      </div>

      {syncSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{syncSuccessMsg}</span>
        </div>
      )}

      {/* Google Sheets Workspace Integration Card */}
      {onOpenGoogleSheets && (
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-emerald-600/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
              <FileSpreadsheet className="w-8 h-8 text-emerald-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Sinkronisasi Google Sheets & Google Drive</h2>
                <span className="bg-emerald-400/20 text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300/30 uppercase tracking-wider">
                  Live OAuth
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
                Hubungkan langsung akun Google sekolah Anda untuk ekspor otomatis 7 tab dokumen spreadsheet (Profil, Siswa, Presensi Harian, Guru, Rombel, Pelanggaran, dan Reward) atau impor data siswa secara realtime.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenGoogleSheets}
            className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Kelola Google Sheets</span>
          </button>
        </div>
      )}

      {/* Sync Status & Connection Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Hub Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-600" />
            Status Integrasi Canva Sheet
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Status Koneksi:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Terhubung Aktif
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Otomatis Simpan:</span>
              <span className="text-xs font-bold text-slate-800">
                {autoSyncEnabled ? 'Aktif (Real-time)' : 'Manual'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Terakhir Disinkron:</span>
              <span className="text-[11px] font-semibold text-slate-700">
                {syncConfig.lastSyncTime || 'Hari ini, 09:30 WIB'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-600">Total Baris Terintegrasi:</span>
              <span className="text-xs font-extrabold text-blue-900">
                {pelanggaranList.length + rewardList.length + students.length} Records
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <strong>Keterangan Format Canva Sheet:</strong>
            <br />
            Semua input pelanggaran, reward, dan biodata siswa disusun rapi menggunakan standar kolom Bab 4 STAR-KIDS, sehingga siap disambungkan ke Canva Sheet, Google Sheets, maupun sistem Dapodik sekolah.
          </div>
        </div>

        {/* Configuration Form Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-700" />
            Konfigurasi Tautan Canva Sheet / Spreadsheet
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                URL Canva Sheet / Spreadsheet Webhook API
              </label>
              <input
                type="text"
                value={canvaUrl}
                onChange={(e) => setCanvaUrl(e.target.value)}
                placeholder="https://canva.com/sheet/sdn-kebonagung-tppk-2026 atau https://docs.google.com/spreadsheets/d/..."
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50/50"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Masukkan tautan Canva Sheet atau endpoint Apps Script sekolah untuk sinkronisasi otomatis.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="autoSyncCheck"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="autoSyncCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Aktifkan sinkronisasi otomatis setiap kali ada penambahan pelanggaran atau reward baru
              </label>
            </div>

            {role === 'admin' ? (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-amber-700 italic">
                *Hanya admin yang dapat memperbarui pengaturan endpoint sinkronisasi.
              </p>
            )}
          </form>
        </div>

      </div>

      {/* Export & Import Hub Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-900" />
            Ekspor & Impor Data (Excel / Spreadsheet)
          </h3>
          <p className="text-xs text-slate-500">
            Unduh laporan berkala untuk arsip sekolah, rapat dewan guru, laporan dinas pendidikan, atau unggah data siswa
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Ekspor Pelanggaran */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-rose-300 bg-slate-50/50 hover:bg-white transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="p-2 w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">
                Ekspor Data Pelanggaran
              </h4>
              <p className="text-[11px] text-slate-500">
                Format lengkap mencakup 16 lokasi, 5 aktivitas, akumulasi poin, dan tindak lanjut TPPK.
              </p>
            </div>
            <button
              onClick={exportPelanggaranCSV}
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Excel (.csv)</span>
            </button>
          </div>

          {/* Card 2: Ekspor Reward */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50/50 hover:bg-white transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="p-2 w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">
                Ekspor Data Reward
              </h4>
              <p className="text-[11px] text-slate-500">
                Rekap prestasi lomba, apresiasi afektif, teladan, dan konversi nilai raport siswa.
              </p>
            </div>
            <button
              onClick={exportRewardCSV}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Excel (.csv)</span>
            </button>
          </div>

          {/* Card 3: Ekspor Rekap Siswa */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="p-2 w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">
                Rekap Karakter Siswa
              </h4>
              <p className="text-[11px] text-slate-500">
                Daftar lengkap seluruh siswa 1A-6B beserta total poin pelanggaran, reward, dan status resiko.
              </p>
            </div>
            <button
              onClick={exportSiswaCSV}
              className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Excel (.csv)</span>
            </button>
          </div>

          {/* Card 4: Impor Siswa Massal */}
          <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="p-2 w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">
                Impor Data Siswa Massal
              </h4>
              <p className="text-[11px] text-slate-500">
                Muat data dari file CSV / Excel untuk menambahkan atau memperbarui siswa secara massal.
              </p>
            </div>
            
            {role === 'admin' ? (
              <label className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File CSV</span>
                <input
                  type="file"
                  accept=".csv, .txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <span className="text-[10px] text-slate-500 text-center block">
                Khusus Admin
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Live Data Sheet Preview (Standar BAB 4) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-700" />
              Pratinjau Data Sinkronisasi Canva Sheet (Standar BAB 4)
            </h3>
            <p className="text-xs text-slate-500">
              Format baris dan kolom yang otomatis disinkronkan ke Canva Sheet / Spreadsheet cloud
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActivePreviewTab('pelanggaran')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activePreviewTab === 'pelanggaran'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sheet Pelanggaran ({pelanggaranList.length})
            </button>
            <button
              onClick={() => setActivePreviewTab('reward')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activePreviewTab === 'reward'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sheet Reward ({rewardList.length})
            </button>
            <button
              onClick={() => setActivePreviewTab('siswa')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activePreviewTab === 'siswa'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sheet Siswa ({students.length})
            </button>
          </div>
        </div>

        {/* Preview Tables */}
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          {activePreviewTab === 'pelanggaran' && (
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider sticky top-0 border-b border-slate-200">
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">NISN</th>
                  <th className="p-2.5">Nama Siswa</th>
                  <th className="p-2.5">Kelas</th>
                  <th className="p-2.5">Jenis Pelanggaran</th>
                  <th className="p-2.5">Kategori</th>
                  <th className="p-2.5">Poin</th>
                  <th className="p-2.5">Lokasi</th>
                  <th className="p-2.5">Aktivitas</th>
                  <th className="p-2.5">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {pelanggaranList.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-500">{p.id}</td>
                    <td className="p-2.5 whitespace-nowrap">{p.tanggal}</td>
                    <td className="p-2.5 font-mono">{p.nisn}</td>
                    <td className="p-2.5 font-bold">{p.namaSiswa}</td>
                    <td className="p-2.5">{p.kelas}</td>
                    <td className="p-2.5">{p.jenisPelanggaran}</td>
                    <td className="p-2.5 font-semibold text-rose-700">{p.kategori}</td>
                    <td className="p-2.5 font-bold text-rose-700">+{p.poin}</td>
                    <td className="p-2.5">{p.lokasiKejadian}</td>
                    <td className="p-2.5">{p.aktivitasSaatPelanggaran}</td>
                    <td className="p-2.5">{p.tindakLanjut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activePreviewTab === 'reward' && (
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider sticky top-0 border-b border-slate-200">
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">NISN</th>
                  <th className="p-2.5">Nama Siswa</th>
                  <th className="p-2.5">Kelas</th>
                  <th className="p-2.5">Jenis Reward</th>
                  <th className="p-2.5">Kategori</th>
                  <th className="p-2.5">Tingkat</th>
                  <th className="p-2.5">Poin</th>
                  <th className="p-2.5">Mapel Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {rewardList.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-500">{r.id}</td>
                    <td className="p-2.5 whitespace-nowrap">{r.tanggal}</td>
                    <td className="p-2.5 font-mono">{r.nisn}</td>
                    <td className="p-2.5 font-bold">{r.namaSiswa}</td>
                    <td className="p-2.5">{r.kelas}</td>
                    <td className="p-2.5">{r.jenisReward}</td>
                    <td className="p-2.5 font-semibold text-amber-800">{r.kategori}</td>
                    <td className="p-2.5">{r.tingkat}</td>
                    <td className="p-2.5 font-bold text-amber-700">+{r.poin}</td>
                    <td className="p-2.5 text-emerald-700 font-semibold">{r.konversiNilai.mataPelajaran} (+{r.konversiNilai.poinBonus})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activePreviewTab === 'siswa' && (
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider sticky top-0 border-b border-slate-200">
                  <th className="p-2.5">NISN</th>
                  <th className="p-2.5">Nama Lengkap</th>
                  <th className="p-2.5">L/P</th>
                  <th className="p-2.5">Kelas</th>
                  <th className="p-2.5">Wali Kelas</th>
                  <th className="p-2.5">Orang Tua</th>
                  <th className="p-2.5">No WhatsApp</th>
                  <th className="p-2.5">Pelanggaran</th>
                  <th className="p-2.5">Reward</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {students.map(s => (
                  <tr key={s.nisn} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono">{s.nisn}</td>
                    <td className="p-2.5 font-bold">{s.namaLengkap}</td>
                    <td className="p-2.5">{s.jenisKelamin}</td>
                    <td className="p-2.5">{s.kelas}</td>
                    <td className="p-2.5">{s.waliKelas}</td>
                    <td className="p-2.5">{s.namaOrangTua}</td>
                    <td className="p-2.5">{s.noHpOrangTua}</td>
                    <td className="p-2.5 font-bold text-rose-600">{s.totalPoinPelanggaran}</td>
                    <td className="p-2.5 font-bold text-amber-600">+{s.totalPoinReward}</td>
                    <td className="p-2.5 font-semibold">{s.statusResiko}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
