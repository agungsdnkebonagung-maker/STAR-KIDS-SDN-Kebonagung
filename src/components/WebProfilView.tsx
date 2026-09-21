import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  LayoutDashboard, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  School, 
  BookOpen, 
  Award, 
  Leaf, 
  HeartHandshake, 
  Layers, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  Monitor, 
  BookMarked, 
  Activity, 
  HeartPulse, 
  Sprout, 
  Newspaper, 
  Calendar, 
  ArrowRight,
  UserCheck,
  ChevronRight,
  Code
} from 'lucide-react';
import { AppTab } from './Header';
import { SchoolProfileData } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface WebProfilViewProps {
  onNavigateToPortal: (tab?: AppTab) => void;
  kepalaSekolahName?: string;
  kepalaSekolahNip?: string;
  totalSiswa?: number;
  totalRombel?: number;
  totalPegawai?: number;
  schoolProfile?: SchoolProfileData;
}

export const WebProfilView: React.FC<WebProfilViewProps> = ({
  onNavigateToPortal,
  kepalaSekolahName = 'Hj. Sukesi, M.Pd.',
  kepalaSekolahNip = '19710314 199605 2 001',
  totalSiswa = 840,
  totalRombel = 28,
  totalPegawai = 48,
  schoolProfile
}) => {
  const effectiveKsName = schoolProfile?.kepalaSekolahNama || kepalaSekolahName;
  const effectiveKsNip = schoolProfile?.kepalaSekolahNip || kepalaSekolahNip;
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'beranda' | 'profil' | 'sambutan' | 'akademik' | 'fasilitas' | 'berita' | 'kontak'>('beranda');

  const handleDownloadHtml = () => {
    // Fetch or create download link for public/profil-sekolah.html
    const link = document.createElement('a');
    link.href = '/profil-sekolah.html';
    link.download = 'website-sdn-kebonagung-profil.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCode = async () => {
    try {
      const response = await fetch('/profil-sekolah.html');
      const htmlText = await response.text();
      await navigator.clipboard.writeText(htmlText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      alert('File HTML siap diunduh melalui tombol Unduh File HTML.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* ACTION TOPBAR / CONTROL PANEL */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Live Standalone Ready
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs font-bold text-blue-700">Company Profile Publik</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Website Profil Sekolah &bull; SDN Kebonagung Kota Pasuruan
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            title="Salin kode HTML lengkap ke clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kode Tersalin!' : 'Salin Kode HTML'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition cursor-pointer"
            title="Unduh file profil-sekolah.html siap pakai"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh File HTML</span>
          </button>

          <a
            href="/profil-sekolah.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>Buka Tab Baru</span>
          </a>

          <button
            type="button"
            onClick={() => onNavigateToPortal('dashboard')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs shadow-xs transition cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Kembali ke Portal STAR-KIDS</span>
          </button>
        </div>
      </div>

      {/* SUB NAVIGATION TABS FOR QUICK SECTION PREVIEW */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200">
        {[
          { id: 'beranda', label: '1. Beranda & Hero Banner' },
          { id: 'sambutan', label: '2. Sambutan Kepala Sekolah' },
          { id: 'profil', label: '3. Profil, Visi & Misi' },
          { id: 'akademik', label: '4. Akademik & 28 Rombel' },
          { id: 'fasilitas', label: '5. Fasilitas & Statistik' },
          { id: 'berita', label: '6. Berita & Pengumuman' },
          { id: 'kontak', label: '7. Kontak & Aspirasi' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveSubTab(tab.id as any);
              const el = document.getElementById(`section-${tab.id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LIVE INTERACTIVE WEBSITE PREVIEW CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        
        {/* WEBPAGE HEADER BAR */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SchoolLogo size={46} customLogoUrl={schoolProfile?.logoUrl} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-wider text-blue-700 uppercase">UPT SATUAN PENDIDIKAN</span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded">AKREDITASI {schoolProfile?.akreditasi || 'A'}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {schoolProfile?.namaSekolah || 'SDN KEBONAGUNG KOTA PASURUAN'}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">NPSN: {schoolProfile?.npsn || '20535384'} &bull; {schoolProfile?.provinsi || 'Jawa Timur'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 mr-2">
              <span className="hover:text-blue-700 cursor-pointer" onClick={() => setActiveSubTab('beranda')}>Beranda</span>
              <span className="hover:text-blue-700 cursor-pointer" onClick={() => setActiveSubTab('profil')}>Profil</span>
              <span className="hover:text-blue-700 cursor-pointer" onClick={() => setActiveSubTab('sambutan')}>Sambutan KS</span>
              <span className="hover:text-blue-700 cursor-pointer" onClick={() => setActiveSubTab('akademik')}>Akademik</span>
              <span className="hover:text-blue-700 cursor-pointer" onClick={() => setActiveSubTab('berita')}>Berita</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToPortal('dashboard')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black text-xs rounded-xl shadow-xs hover:shadow-md transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>PORTAL STAR-KIDS</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: HERO BANNER */}
        <div id="section-beranda" className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white p-8 sm:p-14 relative overflow-hidden">
          <div className="max-w-4xl space-y-5 relative z-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Website Resmi Profil Publik UPT SDN Kebonagung</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Mendidik Generasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-300 to-blue-200">Cerdas, Berkarakter Juara & Berbudaya Lingkungan</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Selamat datang di portal resmi <strong>UPT Satuan Pendidikan SDN Kebonagung Kota Pasuruan</strong>. Sekolah Ramah Anak dengan 28 rombongan belajar yang mengintegrasikan Kurikulum Merdeka, pembiasaan budi pekerti, dan sistem pantau perilaku STAR-KIDS.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Akreditasi A (Unggul)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-xs font-medium">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Sekolah Adiwiyata
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-xs font-medium">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-400" /> Sekolah Ramah Anak (TPPK)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-xs font-medium">
                <Layers className="w-3.5 h-3.5 text-sky-400" /> 28 Rombel Aktif
              </span>
            </div>

            <div className="pt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigateToPortal('dashboard')}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Masuk Aplikasi Portal STAR-KIDS</span>
              </button>
              <a
                href="/profil-sekolah.html"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-sky-300" />
                <span>Buka Versi Halaman Penuh</span>
              </a>
            </div>
          </div>
        </div>

        {/* SECTION 2: STATISTIK RINGKAS */}
        <div className="bg-slate-50 border-b border-slate-200 py-6 px-6 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Peserta Didik</p>
              <p className="text-2xl font-black text-blue-700 mt-1">{totalSiswa}+</p>
              <p className="text-[11px] text-slate-500">Siswa & Siswi Aktif</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Rombongan Belajar</p>
              <p className="text-2xl font-black text-sky-600 mt-1">{totalRombel}</p>
              <p className="text-[11px] text-slate-500">Kelas 1A s/d 6E</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Pendidik & Staf</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{totalPegawai}</p>
              <p className="text-[11px] text-slate-500">SIM-PEG Kebonagung</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Status Kelulusan</p>
              <p className="text-2xl font-black text-amber-600 mt-1">100%</p>
              <p className="text-[11px] text-slate-500">Melanjutkan ke SMP</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: SAMBUTAN KEPALA SEKOLAH */}
        <div id="section-sambutan" className="p-6 sm:p-12 border-b border-slate-200">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl p-1.5 bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-400 shadow-lg mb-3">
                  <div className="w-full h-full bg-slate-900 rounded-[22px] flex flex-col items-center justify-center text-white p-3">
                    <UserCheck className="w-12 h-12 text-amber-300 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">Kepala Sekolah</span>
                    <span className="text-xs font-bold mt-0.5">{effectiveKsName}</span>
                  </div>
                </div>
                <h3 className="text-base font-black text-slate-900">{effectiveKsName}</h3>
                <p className="text-xs text-blue-700 font-bold">Kepala {schoolProfile?.namaSekolah || 'UPT SDN Kebonagung Kota Pasuruan'}</p>
                <p className="text-[11px] text-slate-500 font-mono">NIP. {effectiveKsNip}</p>
              </div>

              <div className="lg:col-span-8 space-y-3.5 text-left text-slate-700">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold">
                  <Award className="w-3.5 h-3.5 text-blue-700" />
                  Sambutan Resmi Kepala Satuan Pendidikan
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Mendidik dengan Keteladanan, Merawat Budi Pekerti Anak Bangsa
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 italic">
                  Assalamu’alaikum Warahmatullahi Wabarakatuh, Salam Sejahtera bagi kita semua.
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                  Selamat datang di website profil resmi <strong>UPT SDN Kebonagung Kota Pasuruan</strong>. Website ini dirancang sebagai jembatan komunikasi dan akuntabilitas publik bagi seluruh masyarakat, pemangku kepentingan, dan orang tua murid.
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                  Dengan dukungan 28 rombongan belajar dan sistem digital <strong>STAR-KIDS</strong>, kami berikhtiar mendampingi tumbuh kembang anak secara holistik: cerdas akademik, berakhlak mulia, peduli kebersihan lingkungan (Adiwiyata), serta terlindungi dalam lingkungan sekolah yang aman dan ramah anak.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-semibold text-slate-500">
                  <span>Kota Pasuruan &bull; Tahun Ajaran 2026/2027</span>
                  <span className="text-blue-700 font-bold">SDN Kebonagung Juara</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SECTION 4: PROFIL, VISI & MISI */}
        <div id="section-profil" className="p-6 sm:p-12 bg-slate-50 border-b border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black text-blue-700 uppercase tracking-wider">Identitas & Tujuan</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Visi & Misi Satuan Pendidikan</h3>
            <p className="text-xs text-slate-500">Landasan filosofis seluruh program pembiasaan budi pekerti di UPT SDN Kebonagung.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-7 shadow-sm space-y-4">
              <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-lg inline-block">
                VISI SEKOLAH
              </span>
              <h4 className="text-lg sm:text-xl font-black text-amber-300 leading-snug">
                "Terwujudnya Peserta Didik yang Beriman, Cerdas, Berkarakter, Unggul dalam Prestasi, Berbudaya Lingkungan, dan Ramah Anak."
              </h4>
              <p className="text-xs text-blue-200 leading-relaxed">
                Fokus pembentukan profil Pelajar Pancasila yang tangguh, ceria, toleran, dan berwawasan pelestarian alam di era digital.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xs space-y-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-black rounded-lg inline-block">
                MISI SEKOLAH
              </span>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-700">1.</span>
                  <span>Menanamkan nilai-nilai keagamaan dan budi pekerti luhur dalam keseharian.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-700">2.</span>
                  <span>Mengoptimalkan pembelajaran Kurikulum Merdeka yang inovatif dan interaktif.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-700">3.</span>
                  <span>Mengembangkan budaya ramah lingkungan melalui program Adiwiyata dan bank sampah.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-700">4.</span>
                  <span>Menegakkan lingkungan aman dari bullying dengan Satgas TPPK dan sistem STAR-KIDS.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 5: FASILITAS & SARANA */}
        <div id="section-fasilitas" className="p-6 sm:p-12 border-b border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Sarana Penunjang</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Fasilitas Sekolah Terpadu</h3>
            <p className="text-xs text-slate-500">Mendukung kenyamanan dan stimulasi minat bakat seluruh murid di 28 rombel.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <Monitor className="w-6 h-6 text-blue-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Lab Komputer & Digital</h4>
              <p className="text-xs text-slate-600 mt-1">Unit komputer modern untuk pelaksanaan asesmen ANBK dan literasi teknologi dasar.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <BookMarked className="w-6 h-6 text-emerald-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Perpustakaan Pelangi Cendekia</h4>
              <p className="text-xs text-slate-600 mt-1">Koleksi ribuan buku bacaan ramah anak dengan area baca santai lesehan yang nyaman.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <Activity className="w-6 h-6 text-amber-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Lapangan Olahraga & Upacara</h4>
              <p className="text-xs text-slate-600 mt-1">Lapangan serbaguna untuk upacara bendera, senam bersama, basket, futsal, dan pentas seni.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <HeartPulse className="w-6 h-6 text-rose-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">UKS & Konseling TPPK</h4>
              <p className="text-xs text-slate-600 mt-1">Ruang pertolongan pertama medis dan ruang konseling ramah anak yang menjamin privasi siswa.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <Sprout className="w-6 h-6 text-teal-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Green House & Kebun Toga</h4>
              <p className="text-xs text-slate-600 mt-1">Fasilitas edukasi lingkungan hidup dan pembibitan tanaman herbal untuk program Adiwiyata.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-6 h-6 text-indigo-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Keamanan & PPSD 24 Jam</h4>
              <p className="text-xs text-slate-600 mt-1">Pengamanan gerbang sekolah dengan petugas PPSD, pos satpam, dan CCTV pengawasan.</p>
            </div>
          </div>
        </div>

        {/* SECTION 6: BERITA & ARTIKEL */}
        <div id="section-berita" className="p-6 sm:p-12 bg-slate-50 border-b border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black text-blue-700 uppercase tracking-wider">Aktivitas Terkini</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Berita & Pengumuman Sekolah</h3>
            <p className="text-xs text-slate-500">Informasi terbaru mengenai kegiatan pembelajaran dan prestasi warga sekolah.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded">Inovasi Sekolah</span>
                <h4 className="text-sm font-bold text-slate-900">Integrasi Aplikasi STAR-KIDS di 28 Rombel</h4>
                <p className="text-xs text-slate-600">Pemberlakuan absensi digital dan evaluasi karakter juara berbasis poin terpadu.</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToPortal('absensi')}
                className="mt-4 text-xs font-bold text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                Lihat di Portal STAR-KIDS <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded">Kegiatan P5</span>
                <h4 className="text-sm font-bold text-slate-900">Gelar Karya Siswa Tema Gaya Hidup Berkelanjutan</h4>
                <p className="text-xs text-slate-600">Pameran produk daur ulang sampah dan hasil kebun Toga siswa Fase A, B, dan C.</p>
              </div>
              <span className="mt-4 text-xs font-bold text-slate-400">Agustus 2026</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[10px] rounded">Prestasi</span>
                <h4 className="text-sm font-bold text-slate-900">Juara Umum O2SN dan FLS2N Tingkat Kota</h4>
                <p className="text-xs text-slate-600">Raihan medali emas cabang atletik cilik, renang, dan seni tari khas Pasuruan.</p>
              </div>
              <span className="mt-4 text-xs font-bold text-slate-400">Juli 2026</span>
            </div>
          </div>
        </div>

        {/* SECTION 7: KONTAK & ASPIRASI */}
        <div id="section-kontak" className="p-6 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">Layanan Informasi</span>
              <h3 className="text-2xl font-black text-slate-900">Kontak Resmi {schoolProfile?.namaSingkat || 'SDN Kebonagung'}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kami siap melayani kebutuhan informasi wali murid dan masyarakat dengan transparansi dan senyuman.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800">Alamat Kampus:</strong>
                    <span className="text-slate-600">{schoolProfile?.alamatJalan || 'Jl. Raya Kebonagung No. 12'}, {schoolProfile?.kecamatan ? `Kec. ${schoolProfile.kecamatan}` : 'Kec. Purworejo'}, {schoolProfile?.kota || 'Kota Pasuruan'}, {schoolProfile?.provinsi || 'Jatim'} {schoolProfile?.kodePos || '67116'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800">Telepon Kantor & TU:</strong>
                    <span className="text-slate-600">{schoolProfile?.teleponKantor || '(0343) 421890'}</span>
                  </div>
                </div>
                {schoolProfile?.noTeleponPengaduan && (
                  <div className="flex items-start gap-3 p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-rose-900">Hotline Pengaduan & TPPK:</strong>
                      <a href={`tel:${schoolProfile.noTeleponPengaduan}`} className="text-rose-700 hover:underline font-bold">
                        {schoolProfile.noTeleponPengaduan}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800">Email Sekolah:</strong>
                    <span className="text-slate-600">{schoolProfile?.email || 'sdnkebonagung@pasuruankota.go.id'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-1">Formulir Pesan & Aspirasi Ramah Anak</h4>
              <p className="text-[11px] text-slate-500 mb-4">Pesan Anda akan diteruskan ke tim TU dan Satgas TPPK sekolah.</p>

              {formSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold">Pesan Anda Telah Terkirim!</p>
                  <p className="text-[11px]">Terima kasih atas kepedulian Anda terhadap kemajuan SDN Kebonagung Kota Pasuruan.</p>
                  <button
                    type="button"
                    onClick={() => setFormSubmitted(false)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold mt-2"
                  >
                    Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormSubmitted(true);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Anda"
                      className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="No. WhatsApp / HP"
                      className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tuliskan pertanyaan, aspirasi, atau masukan..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                  ></textarea>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Aspirasi ke Sekolah</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* WEBPAGE FOOTER STRIP */}
        <div className="bg-slate-950 text-slate-400 px-6 py-6 border-t border-slate-900 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 {schoolProfile?.namaSekolah || 'UPT Satuan Pendidikan SDN Kebonagung Kota Pasuruan'}. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-3">
            <span className="text-amber-300/90 font-mono font-bold">NPSN: {schoolProfile?.npsn || '20535384'}</span>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => onNavigateToPortal('dashboard')}
              className="text-amber-400 font-bold hover:underline cursor-pointer"
            >
              Portal STAR-KIDS
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
