import React, { useState, useEffect } from 'react';
import { 
  MasterKelas, 
  MasterPelanggaran, 
  MasterReward, 
  SystemSettings, 
  UserRole,
  SchoolProfileData
} from '../types';
import { WALI_KELAS_NIP_MAP } from '../data/constants';
import { DEFAULT_SCHOOL_PROFILE } from '../data/initialData';
import { SchoolProfileSettingsTab } from './SchoolProfileSettingsTab';
import { 
  Settings, 
  School, 
  AlertTriangle, 
  Award, 
  BookOpen, 
  Sliders, 
  KeyRound, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2,
  Calendar,
  X,
  Check,
  Sparkles,
  UserCheck,
  Building2
} from 'lucide-react';

interface PengaturanViewProps {
  masterKelas: MasterKelas[];
  masterPelanggaran: MasterPelanggaran[];
  masterReward: MasterReward[];
  systemSettings: SystemSettings;
  role: UserRole;
  onUpdateKelas: (list: MasterKelas[]) => void;
  onUpdatePelanggaran: (list: MasterPelanggaran[]) => void;
  onUpdateReward: (list: MasterReward[]) => void;
  onUpdateSettings: (settings: SystemSettings) => void;
  onChangePasswordAdmin: (newPassword: string) => boolean;
  onNavigateToPegawai?: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  masterKelas,
  masterPelanggaran,
  masterReward,
  systemSettings,
  role,
  onUpdateKelas,
  onUpdatePelanggaran,
  onUpdateReward,
  onUpdateSettings,
  onChangePasswordAdmin,
  onNavigateToPegawai
}) => {
  const [activeTab, setActiveTab] = useState<'sekolah' | 'umum' | 'kelas' | 'pelanggaran' | 'reward' | 'keamanan'>('sekolah');
  const [tempSettings, setTempSettings] = useState<SystemSettings>(systemSettings);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync tempSettings whenever systemSettings updates
  useEffect(() => {
    setTempSettings(systemSettings);
  }, [systemSettings]);

  // Security tab state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);

  // New item modal states
  const [newKelasName, setNewKelasName] = useState('');
  const [newWaliKelas, setNewWaliKelas] = useState('');
  const [newNipWaliKelas, setNewNipWaliKelas] = useState('');

  // Editing existing class modal state
  const [editingKelas, setEditingKelas] = useState<{
    id: string;
    kelas: string;
    waliKelas: string;
    nipWaliKelas: string;
    tahunAjaran: string;
  } | null>(null);

  const [newPlgNama, setNewPlgNama] = useState('');
  const [newPlgKategori, setNewPlgKategori] = useState<'Ringan' | 'Sedang' | 'Berat'>('Ringan');
  const [newPlgPoin, setNewPlgPoin] = useState<number>(5);

  const [newRewNama, setNewRewNama] = useState('');
  const [newRewKategori, setNewRewKategori] = useState<'Prestasi' | 'Afektif' | 'Pembiasaan Baik'>('Pembiasaan Baik');
  const [newRewTingkat, setNewRewTingkat] = useState<'Sekolah' | 'Kecamatan' | 'Kota' | 'Provinsi' | 'Nasional'>('Sekolah');
  const [newRewPoin, setNewRewPoin] = useState<number>(10);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(tempSettings);
    showNotification('Pengaturan umum dan ambang batas berhasil disimpan.');
  };

  // Add Class
  const handleAddKelas = () => {
    if (!newKelasName.trim() || !newWaliKelas.trim()) return;
    const exists = masterKelas.some(k => k.kelas.toUpperCase() === newKelasName.toUpperCase());
    if (exists) {
      alert('Kelas sudah ada!');
      return;
    }
    const updated = [...masterKelas, {
      id: `KLS-${Date.now()}`,
      kelas: newKelasName.toUpperCase(),
      waliKelas: newWaliKelas,
      nipWaliKelas: newNipWaliKelas.trim(),
      tahunAjaran: tempSettings.tahunAjaran
    }];
    onUpdateKelas(updated);
    setNewKelasName('');
    setNewWaliKelas('');
    setNewNipWaliKelas('');
    showNotification(`Kelas ${newKelasName} beserta Wali Kelas dan NIP berhasil ditambahkan.`);
  };

  // Save Edited Class
  const handleSaveEditKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKelas) return;

    const updated = masterKelas.map(k => {
      if (k.kelas === editingKelas.kelas) {
        return {
          ...k,
          waliKelas: editingKelas.waliKelas.trim(),
          nipWaliKelas: editingKelas.nipWaliKelas.trim(),
          tahunAjaran: editingKelas.tahunAjaran.trim() || tempSettings.tahunAjaran
        };
      }
      return k;
    });

    onUpdateKelas(updated);
    showNotification(`Data Wali Kelas & NIP untuk Kelas ${editingKelas.kelas} berhasil diperbarui.`);
    setEditingKelas(null);
  };

  // Auto-fill official standard NIPs
  const handleAutoFillStandardNip = () => {
    const updated = masterKelas.map(k => ({
      ...k,
      nipWaliKelas: k.nipWaliKelas || WALI_KELAS_NIP_MAP[k.kelas] || '-'
    }));
    onUpdateKelas(updated);
    showNotification('Seluruh NIP kepegawaian resmi wali kelas 28 rombel berhasil disinkronkan.');
  };

  const handleDeleteKelas = (kelasName: string) => {
    if (confirm(`Yakin ingin menghapus Kelas ${kelasName}?`)) {
      const updated = masterKelas.filter(k => k.kelas !== kelasName);
      onUpdateKelas(updated);
      showNotification(`Kelas ${kelasName} berhasil dihapus.`);
    }
  };

  // Add Violation Rule
  const handleAddPelanggaran = () => {
    if (!newPlgNama.trim()) return;
    const updated = [...masterPelanggaran, {
      id: `MPLG-${Date.now()}`,
      namaPelanggaran: newPlgNama,
      kategori: newPlgKategori,
      poin: newPlgPoin,
      tindakLanjutSaran: 'Pembinaan wali kelas dan pencatatan komitmen.'
    }];
    onUpdatePelanggaran(updated);
    setNewPlgNama('');
    showNotification('Master pelanggaran berhasil ditambahkan.');
  };

  const handleDeletePelanggaran = (id: string) => {
    const updated = masterPelanggaran.filter(p => p.id !== id);
    onUpdatePelanggaran(updated);
    showNotification('Master pelanggaran berhasil dihapus.');
  };

  // Add Reward Rule
  const handleAddReward = () => {
    if (!newRewNama.trim()) return;
    const updated = [...masterReward, {
      id: `MREW-${Date.now()}`,
      namaReward: newRewNama,
      kategori: newRewKategori,
      tingkat: newRewTingkat,
      poin: newRewPoin,
      bonusRaportPoin: Math.min(Math.round(newRewPoin / 5), 10)
    }];
    onUpdateReward(updated);
    setNewRewNama('');
    showNotification('Master reward berhasil ditambahkan.');
  };

  const handleDeleteReward = (id: string) => {
    const updated = masterReward.filter(r => r.id !== id);
    onUpdateReward(updated);
    showNotification('Master reward berhasil dihapus.');
  };

  // Change Admin Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);

    if (currentPw !== 'admin') {
      setPwError('Password saat ini salah! (Default: admin)');
      return;
    }
    if (newPw.length < 5) {
      setPwError('Password baru minimal 5 karakter.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('Konfirmasi password tidak cocok.');
      return;
    }

    const success = onChangePasswordAdmin(newPw);
    if (success) {
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      showNotification('Password Admin berhasil diperbarui!');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 mb-2">
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Hak Akses Super Admin</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pengaturan Master Data & Kebijakan Sekolah
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Konfigurasi rombel kelas, aturan poin, rumus konversi nilai, dan ambang batas monitoring presensi.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sekolah')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sekolah' ? 'bg-white text-blue-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Data Sekolah & Logo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('umum')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'umum' ? 'bg-white text-blue-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Umum & Ambang
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kelas')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'kelas' ? 'bg-white text-blue-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kelas & Rombel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pelanggaran')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'pelanggaran' ? 'bg-white text-blue-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Master Pelanggaran
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reward')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'reward' ? 'bg-white text-blue-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Master Reward
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keamanan')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'keamanan' ? 'bg-white text-blue-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Keamanan Admin
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 0: DATA SEKOLAH & LOGO */}
      {activeTab === 'sekolah' && (
        <SchoolProfileSettingsTab
          initialProfile={tempSettings.schoolProfile || DEFAULT_SCHOOL_PROFILE}
          onSaveProfile={(updatedProfile) => {
            const updated = {
              ...tempSettings,
              schoolProfile: updatedProfile
            };
            setTempSettings(updated);
            onUpdateSettings(updated);
            showNotification('Data identitas sekolah, nomor telepon pengaduan, dan logo resmi berhasil disimpan.');
          }}
          onNavigateToPegawai={onNavigateToPegawai}
        />
      )}

      {/* TAB 1: UMUM & AMBANG BATAS */}
      {activeTab === 'umum' && (
        <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Tahun Ajaran & Semester Aktif</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Diterapkan pada seluruh arsip presensi dan rekapitulasi.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={tempSettings.tahunAjaran}
                  onChange={(e) => setTempSettings({ ...tempSettings, tahunAjaran: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Semester
                </label>
                <select
                  value={tempSettings.semester}
                  onChange={(e) => setTempSettings({ ...tempSettings, semester: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
            </div>

            {/* Ambang Batas Presensi */}
            <div className="border-b border-slate-100 pt-4 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Ambang Batas Deteksi Monitoring Presensi</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Parameter otomatis deteksi siswa butuh pendampingan di modul absensi.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Alpa Perhatian (Kali)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tempSettings.alpaPerhatian}
                  onChange={(e) => setTempSettings({ ...tempSettings, alpaPerhatian: parseInt(e.target.value) || 3 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: 3 kali</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Alpa Risiko / Tindak Lanjut
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tempSettings.alpaRisiko}
                  onChange={(e) => setTempSettings({ ...tempSettings, alpaRisiko: parseInt(e.target.value) || 5 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: 5 kali</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Presensi Monitoring (%)
                </label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={tempSettings.kehadiranMonitoringPct}
                  onChange={(e) => setTempSettings({ ...tempSettings, kehadiranMonitoringPct: parseInt(e.target.value) || 90 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: &lt; 90%</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Presensi Kritis / Tindak Lanjut (%)
                </label>
                <input
                  type="number"
                  min={40}
                  max={95}
                  value={tempSettings.kehadiranTindakLanjutPct}
                  onChange={(e) => setTempSettings({ ...tempSettings, kehadiranTindakLanjutPct: parseInt(e.target.value) || 80 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: &lt; 80%</span>
              </div>
            </div>

            {/* Aturan Konversi Nilai Rapor */}
            <div className="border-b border-slate-100 pt-4 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Aturan Kebijakan Konversi Nilai Rapor</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Konversi poin reward ke nilai tugas atau afektif mata pelajaran terkait.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="konversiAktif"
                  checked={tempSettings.konversiNilaiAktif}
                  onChange={(e) => setTempSettings({ ...tempSettings, konversiNilaiAktif: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="konversiAktif" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Aktifkan fitur rekomendasi konversi nilai raport dari sertifikat / reward
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Maksimal Tambahan Nilai Mapel
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tempSettings.maxPoinBonusNilai}
                  onChange={(e) => setTempSettings({ ...tempSettings, maxPoinBonusNilai: parseInt(e.target.value) || 10 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Maksimal: +10 nilai tugas</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>SIMPAN PERUBAHAN PENGATURAN</span>
              </button>
            </div>

          </div>
        </form>
      )}

      {/* TAB 2: KELAS & ROMBEL */}
      {activeTab === 'kelas' && (
        <div className="space-y-6">
          {/* SIM-PEG Kepegawaian Fast Link Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-300 text-blue-950 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-800" />
                Modul Kepegawaian Terintegrasi (SIM-PEG)
              </div>
              <h4 className="text-base font-black">
                Perbaikan & Upload Data Wali Kelas, Guru Mapel, TU & Staff Sekolah
              </h4>
              <p className="text-xs text-blue-100 max-w-2xl">
                Tersedia modul lengkap untuk mengimpor Excel, mengubah data Kepala Sekolah, Wali Kelas 28 Rombel, Guru Mapel, Administrasi, hingga petugas OB dan PPSD dalam satu tempat.
              </p>
            </div>
            {onNavigateToPegawai && (
              <button
                type="button"
                onClick={onNavigateToPegawai}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Buka Data Pegawai & Guru</span>
              </button>
            )}
          </div>

          {/* Add Class Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Tambah Rombel Kelas & Wali Kelas Baru</span>
              </h3>
              <button
                type="button"
                onClick={handleAutoFillStandardNip}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Lengkapi otomatis NIP resmi 28 wali kelas dari database kepegawaian SDN Kebonagung"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sinkronkan NIP Resmi 28 Rombel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nama Rombel / Kelas <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 6C"
                  value={newKelasName}
                  onChange={(e) => setNewKelasName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nama Lengkap & Gelar Wali Kelas <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Titik Suprihatin, S.Pd."
                  value={newWaliKelas}
                  onChange={(e) => setNewWaliKelas(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  NIP Kepegawaian (18 Digit)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 19820514 200801 2 015"
                  value={newNipWaliKelas}
                  onChange={(e) => setNewNipWaliKelas(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddKelas}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Rombel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Class List Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <School className="w-4 h-4 text-blue-700" />
                  <span>Daftar Rombongan Belajar (Rombel) & NIP Wali Kelas SDN Kebonagung</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mencakup struktur 28 rombel (1A-6E) lengkap dengan data kepegawaian dan NIP guru wali kelas.
                </p>
              </div>
              <span className="text-xs text-blue-900 font-black px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg shrink-0">
                {masterKelas.length} Rombel Terdata
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4 w-24 font-black">Kelas</th>
                    <th className="py-3 px-6">Nama & Gelar Wali Kelas</th>
                    <th className="py-3 px-6">NIP Kepegawaian</th>
                    <th className="py-3 px-4 w-32">Tahun Ajaran</th>
                    <th className="py-3 px-4 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {masterKelas.map((k, idx) => {
                    const effectiveNip = k.nipWaliKelas || WALI_KELAS_NIP_MAP[k.kelas] || '-';
                    return (
                      <tr key={k.kelas} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-black text-blue-900 text-xs px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                            Kelas {k.kelas}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <div className="font-bold text-slate-900">{k.waliKelas}</div>
                          <div className="text-[10px] text-slate-400">Guru Wali Kelas Rombel {k.kelas}</div>
                        </td>
                        <td className="py-3 px-6">
                          {effectiveNip && effectiveNip !== '-' ? (
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {effectiveNip}
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-600 font-semibold italic">
                              Belum diisi NIP
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{k.tahunAjaran}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingKelas({
                                id: k.id || `KLS-${k.kelas}`,
                                kelas: k.kelas,
                                waliKelas: k.waliKelas,
                                nipWaliKelas: k.nipWaliKelas || WALI_KELAS_NIP_MAP[k.kelas] || '',
                                tahunAjaran: k.tahunAjaran
                              })}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Wali Kelas & NIP"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteKelas(k.kelas)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Rombel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Edit Wali Kelas & NIP */}
          {editingKelas && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-300" />
                    <h3 className="font-black text-sm">
                      Edit Data Guru / Wali Kelas {editingKelas.kelas}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingKelas(null)}
                    className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditKelas} className="p-6 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kelas / Rombel
                    </label>
                    <input
                      type="text"
                      value={editingKelas.kelas}
                      disabled
                      className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl font-black text-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama & Gelar Wali Kelas <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingKelas.waliKelas}
                      onChange={(e) => setEditingKelas({ ...editingKelas, waliKelas: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      NIP Kepegawaian Guru (18 Digit)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 19820514 200801 2 015"
                      value={editingKelas.nipWaliKelas}
                      onChange={(e) => setEditingKelas({ ...editingKelas, nipWaliKelas: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Nomor Induk Pegawai resmi untuk surat pemanggilan dan dokumen rekap.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tahun Ajaran
                    </label>
                    <input
                      type="text"
                      value={editingKelas.tahunAjaran}
                      onChange={(e) => setEditingKelas({ ...editingKelas, tahunAjaran: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingKelas(null)}
                      className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: MASTER PELANGGARAN */}
      {activeTab === 'pelanggaran' && (
        <div className="space-y-6">
          {/* Add Rule Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-600" />
              <span>Tambah Aturan Pelanggaran Baru</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Nama / Jenis Pelanggaran"
                  value={newPlgNama}
                  onChange={(e) => setNewPlgNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <select
                  value={newPlgKategori}
                  onChange={(e) => setNewPlgKategori(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Ringan">Ringan</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Berat">Berat</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min={5}
                  max={50}
                  step={5}
                  value={newPlgPoin}
                  onChange={(e) => setNewPlgPoin(parseInt(e.target.value) || 5)}
                  className="w-24 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 text-center"
                />
                <button
                  type="button"
                  onClick={handleAddPelanggaran}
                  className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>

          {/* Violation Rules List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">
                Katalog Master Pelanggaran & Poin Pengurangan
              </h3>
              <span className="text-xs text-slate-500 font-bold">{masterPelanggaran.length} Jenis</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4 w-16 text-center">No</th>
                    <th className="py-3 px-4">Jenis Pelanggaran</th>
                    <th className="py-3 px-4 w-32 text-center">Kategori</th>
                    <th className="py-3 px-4 w-28 text-right">Poin (-)</th>
                    <th className="py-3 px-4 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {masterPelanggaran.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-center text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.namaPelanggaran}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          p.kategori === 'Berat' ? 'bg-rose-100 text-rose-800' :
                          p.kategori === 'Sedang' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {p.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-700">−{p.poin} Poin</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeletePelanggaran(p.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MASTER REWARD */}
      {activeTab === 'reward' && (
        <div className="space-y-6">
          {/* Add Reward Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Tambah Master Reward & Apresiasi Baru</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Nama Prestasi / Bentuk Apresiasi"
                  value={newRewNama}
                  onChange={(e) => setNewRewNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <select
                  value={newRewKategori}
                  onChange={(e) => setNewRewKategori(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Prestasi">Prestasi Lomba</option>
                  <option value="Afektif">Afektif (Sikap)</option>
                  <option value="Pembiasaan Baik">Pembiasaan Baik</option>
                </select>
              </div>

              <div>
                <select
                  value={newRewTingkat}
                  onChange={(e) => setNewRewTingkat(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Sekolah">Sekolah</option>
                  <option value="Kecamatan">Kecamatan</option>
                  <option value="Kota">Kota Pasuruan</option>
                  <option value="Provinsi">Provinsi</option>
                  <option value="Nasional">Nasional</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min={5}
                  max={100}
                  step={5}
                  value={newRewPoin}
                  onChange={(e) => setNewRewPoin(parseInt(e.target.value) || 10)}
                  className="w-20 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 text-center"
                />
                <button
                  type="button"
                  onClick={handleAddReward}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reward Rules List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">
                Katalog Master Reward & Apresiasi Karakter
              </h3>
              <span className="text-xs text-slate-500 font-bold">{masterReward.length} Bentuk</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4 w-16 text-center">No</th>
                    <th className="py-3 px-4">Nama Bentuk Apresiasi</th>
                    <th className="py-3 px-4 w-32 text-center">Kategori</th>
                    <th className="py-3 px-4 w-32 text-center">Tingkat</th>
                    <th className="py-3 px-4 w-28 text-right">Poin (+)</th>
                    <th className="py-3 px-4 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {masterReward.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-center text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.namaReward}</td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">{r.kategori}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-600">{r.tingkat}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700">+{r.poin} Poin</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteReward(r.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KEAMANAN & GANTI PASSWORD ADMIN */}
      {activeTab === 'keamanan' && (
        <div className="max-w-xl bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Ganti Kata Sandi Administrator
              </h3>
              <p className="text-xs text-slate-500">
                Username default: <strong className="text-slate-800">admin</strong> &bull; Sandi default: <strong className="text-slate-800">admin</strong>
              </p>
            </div>
          </div>

          {pwError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                required
                placeholder="Masukkan password saat ini (default: admin)"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                placeholder="Minimal 5 karakter"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                placeholder="Ulangi kata sandi baru"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                <span>PERBARUI KATA SANDI ADMIN</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
