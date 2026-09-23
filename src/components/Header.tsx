import React, { useState, useRef, useEffect } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { UserRole, SchoolProfileData } from '../types';
import { 
  LayoutDashboard, 
  ClipboardCheck,
  AlertTriangle, 
  Award, 
  Coins,
  ShieldAlert,
  User,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Users, 
  History,
  Settings,
  LogOut, 
  LogIn, 
  ShieldCheck, 
  Eye, 
  Menu, 
  X,
  ChevronDown,
  Sparkles,
  Globe,
  Phone,
  RefreshCw,
  Compass
} from 'lucide-react';

export type AppTab = 
  | 'dashboard'
  | 'absensi'
  | 'pelanggaran'
  | 'reward'
  | 'poin'
  | 'monitoring'
  | 'profil'
  | 'statistik'
  | 'laporan'
  | 'sync'
  | 'siswa'
  | 'pegawai'
  | 'audit'
  | 'pengaturan'
  | 'webprofil'
  | 'pengunjung';

interface HeaderProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  role: UserRole;
  onOpenLogin: () => void;
  onLogout: () => void;
  schoolProfile?: SchoolProfileData;
  tahunAjaran?: string;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  onOpenGoogleSheets?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  role,
  onOpenLogin,
  onLogout,
  schoolProfile,
  tahunAjaran,
  onRefreshData,
  isRefreshing = false,
  onOpenGoogleSheets
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNavItems: { id: AppTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'siswa', label: 'Data Siswa & Kelas', icon: Users },
    { id: 'absensi', label: 'Absensi', icon: ClipboardCheck },
    { id: 'pelanggaran', label: 'Pelanggaran', icon: AlertTriangle },
    { id: 'reward', label: 'Prestasi & Reward', icon: Award },
    { id: 'poin', label: 'Poin Karakter', icon: Coins },
    { id: 'monitoring', label: 'Monitoring TPPK', icon: ShieldAlert },
  ];

  const secondaryNavItems: { id: AppTab; label: string; icon: any; adminOnly?: boolean; desc: string }[] = [
    { id: 'profil', label: 'Profil Siswa', icon: User, desc: 'Rekam jejak & biodata murid' },
    { id: 'statistik', label: 'Statistik & Analitik', icon: BarChart3, desc: 'Grafik komparatif & tren perilaku' },
    { id: 'laporan', label: 'Pusat Laporan & Surat', icon: FileText, desc: 'Cetak surat panggilan & rekap resmi' },
    { id: 'sync', label: 'Sinkronisasi Canva Sheet', icon: FileSpreadsheet, desc: 'Integrasi cloud spreadsheet & backup' },
    { id: 'pegawai', label: 'Data Pegawai & Guru', icon: Users, desc: 'Kepala Sekolah, Wali Kelas, Guru Mapel, TU & Staff' },
    { id: 'audit', label: 'Log Aktivitas (Audit)', icon: History, adminOnly: true, desc: 'Riwayat modifikasi data (Hanya Admin)' },
    { id: 'pengunjung', label: 'Log Daftar Pengunjung', icon: Compass, adminOnly: true, desc: 'Monitoring identitas & lalu lintas pengunjung web (Khusus Admin)' },
    { id: 'pengaturan', label: 'Pengaturan Sekolah', icon: Settings, adminOnly: true, desc: 'Rombel, master data & kata sandi' },
    { id: 'webprofil', label: 'Website Profil Sekolah', icon: Globe, desc: 'Company profile publik UPT SDN Kebonagung' },
  ];

  const visibleSecondary = secondaryNavItems;

  const isSecondaryActive = visibleSecondary.some(item => item.id === currentTab);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white text-[12px] py-1.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-300 text-blue-950 tracking-wide shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-800" />
              RESMI TPPK
            </span>
            <span className="font-semibold text-blue-50 truncate text-[11px] sm:text-xs">
              {schoolProfile?.namaSingkat || 'SDN Kebonagung'} Kota Pasuruan &bull; NPSN: {schoolProfile?.npsn || '20535384'} &bull; {schoolProfile?.tagline || 'Sekolah Ramah Anak & Berkarakter Juara'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-blue-100 text-[11px]">
            {schoolProfile?.noTeleponPengaduan && (
              <a
                href={`tel:${schoolProfile.noTeleponPengaduan}`}
                className="inline-flex items-center gap-1 text-amber-200 hover:text-amber-100 font-bold bg-white/15 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                title="Nomor Siaga Pengaduan Sekolah & TPPK"
              >
                <Phone className="w-3 h-3 text-amber-300" />
                <span>Pengaduan: {schoolProfile.noTeleponPengaduan}</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => setCurrentTab('webprofil')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer ${
                currentTab === 'webprofil'
                  ? 'bg-amber-400 text-blue-950 shadow-xs'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Globe className="w-3 h-3 text-amber-300" />
              <span>🌐 Web Profil Sekolah</span>
            </button>
            <span className="bg-white/10 px-2 py-0.5 rounded-md font-medium">Tahun Ajaran {tahunAjaran || '2026/2027'}</span>
            <span>&bull;</span>
            <span className="text-emerald-300 font-bold flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              28 Rombel Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Identity */}
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative">
              <SchoolLogo size={46} customLogoUrl={schoolProfile?.logoUrl} />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[8px] text-amber-950 font-black">★</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 group-hover:to-blue-700 transition-colors">
                  STAR-KIDS
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                  <span>★</span> {schoolProfile?.namaSingkat || 'SDN Kebonagung'} &bull; NPSN: {schoolProfile?.npsn || '20535384'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Sistem Tata Tertib & Apresiasi Karakter Terintegrasi Digital
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm font-extrabold scale-[1.02]'
                      : 'text-slate-600 hover:text-blue-900 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Dropdown Menu for More Tools */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSecondaryActive
                    ? 'bg-gradient-to-r from-indigo-700 to-blue-700 text-white shadow-sm font-extrabold'
                    : 'text-slate-700 hover:text-blue-900 hover:bg-white/80'
                }`}
              >
                <span>Menu Lengkap</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Modul Analisis & Manajemen
                    </span>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {visibleSecondary.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentTab(item.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-950 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg mt-0.5 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">{item.label}</span>
                              {item.adminOnly && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {onOpenGoogleSheets && (
                    <div className="p-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenGoogleSheets();
                        }}
                        className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 transition-colors cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg mt-0.5 bg-emerald-100 text-emerald-700">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-950">Google Sheets Sync</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">Cloud</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">Sinkronkan ke Google Spreadsheet</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </nav>

          {/* User Role & Auth Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Sheets Sync Button */}
            {onOpenGoogleSheets && (
              <button
                type="button"
                onClick={onOpenGoogleSheets}
                title="Sinkronisasi Google Sheets"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300 rounded-xl transition cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Google Sheets</span>
              </button>
            )}

            {/* Refresh Data Button */}
            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                disabled={isRefreshing}
                title="Update dan refresh data sistem"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden md:inline">Refresh Data</span>
              </button>
            )}

            {role === 'admin' ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Administrator
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">Akses Penuh TPPK</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Keluar dari akun admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    Orang Tua / Wali
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Hanya Melihat</span>
                </div>
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-300" />
                  <span>Login Admin</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Kembali ke halaman awal login"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
          
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Menu Utama
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold ${
                  isActive
                    ? 'bg-blue-50 text-blue-950 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-3 pb-1 border-t border-slate-100">
            Laporan, Analisis & Pengaturan
          </div>
          {visibleSecondary.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold ${
                  isActive
                    ? 'bg-blue-50 text-blue-950 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.adminOnly && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                    Admin
                  </span>
                )}
              </button>
            );
          })}

          {onOpenGoogleSheets && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGoogleSheets();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 mt-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Google Sheets Sync</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-bold">
                Cloud
              </span>
            </button>
          )}

        </div>
      )}
    </header>
  );
};
