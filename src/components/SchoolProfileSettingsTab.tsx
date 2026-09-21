import React, { useState, useRef, useEffect } from 'react';
import { SchoolProfileData } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { 
  Building2, 
  Upload, 
  Image as ImageIcon, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  Eye, 
  Sparkles, 
  Clock, 
  UserCheck, 
  FileText, 
  MessageSquare,
  Smartphone,
  Save,
  Info
} from 'lucide-react';

interface SchoolProfileSettingsTabProps {
  initialProfile: SchoolProfileData;
  onSaveProfile: (updatedProfile: SchoolProfileData) => void;
  onNavigateToPegawai?: () => void;
}

export const SchoolProfileSettingsTab: React.FC<SchoolProfileSettingsTabProps> = ({
  initialProfile,
  onSaveProfile,
  onNavigateToPegawai
}) => {
  const [formData, setFormData] = useState<SchoolProfileData>(initialProfile);
  const [dragActive, setDragActive] = useState(false);
  const [previewKop, setPreviewKop] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync formData whenever initialProfile changes from parent or storage
  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    }
  }, [initialProfile]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle file selection and Base64 conversion
  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Format file harus berupa gambar (PNG, JPG, JPEG, WEBP, atau SVG).');
      return;
    }

    // Limit size to 4MB for localStorage comfort
    if (file.size > 4 * 1024 * 1024) {
      showToast('error', 'Ukuran file gambar terlalu besar. Maksimal 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setFormData(prev => ({ ...prev, logoUrl: result }));
        showToast('success', 'Logo sekolah baru berhasil dipilih dan dimuat! Klik "Simpan Data Sekolah" untuk menerapkan.');
      }
    };
    reader.onerror = () => {
      showToast('error', 'Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  const handleResetToDefaultLogo = () => {
    if (window.confirm('Kembalikan logo ke logo resmi vektor UPT SDN Kebonagung?')) {
      setFormData(prev => ({ ...prev, logoUrl: '' }));
      showToast('success', 'Logo dikembalikan ke format vektor bawaan resmi.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaSekolah.trim()) {
      showToast('error', 'Nama resmi sekolah wajib diisi.');
      return;
    }
    if (!formData.noTeleponPengaduan.trim() && !formData.hotlineTppk.trim()) {
      showToast('error', 'Nomor telepon pengaduan atau hotline TPPK wajib diisi agar mudah dihubungi.');
      return;
    }

    onSaveProfile(formData);
    showToast('success', 'Profil sekolah, saluran pengaduan, dan logo berhasil disimpan secara permanen!');
  };

  // Helper to test WhatsApp URL
  const getCleanWaNumber = (phoneStr: string) => {
    const cleaned = phoneStr.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      return '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {notification && (
        <div 
          id="school-profile-notification"
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold border transition-all animate-fadeIn ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* SECTION 1: UPLOAD & PREVIEW LOGO SEKOLAH */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <span>Logo Resmi Sekolah</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unggah logo sekolah yang akan otomatis tampil di seluruh dokumen cetak, kop surat resmi, header, dan web profil.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {formData.logoUrl && (
              <button
                type="button"
                onClick={handleResetToDefaultLogo}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Logo Bawaan</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload Dropzone */}
          <div className="lg:col-span-7 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleLogoFile(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/70 scale-[0.99]' 
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 shadow-2xs group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Klik untuk memilih file atau seret & jatuhkan logo ke sini
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Mendukung file PNG, JPG, JPEG, WEBP, atau SVG berlatar transparan (Maks. 4 MB). Disarankan resolusi minimal 250x250 piksel.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-4 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih File dari Komputer</span>
              </button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Tips Logo:</strong> Gunakan logo sekolah berformat PNG transparan agar serasi dengan latar kop surat putih maupun header biru gelap.
              </span>
            </div>
          </div>

          {/* Real-time Preview Showcase */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  Pratinjau Tampilan Logo
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  {formData.logoUrl ? 'Logo Kustom Aktif' : 'Logo Vektor Bawaan'}
                </span>
              </div>

              {/* Multiple Preview Dimensions */}
              <div className="space-y-4">
                {/* 1. Header Look */}
                <div className="p-3 bg-slate-900 rounded-xl text-white flex items-center gap-3">
                  <SchoolLogo size={42} customLogoUrl={formData.logoUrl} />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                      Pratinjau Header
                    </span>
                    <span className="text-xs font-extrabold block truncate">
                      {formData.namaSingkat || 'SDN Kebonagung'}
                    </span>
                  </div>
                </div>

                {/* 2. Document Kop Look */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 flex items-center gap-3 shadow-2xs">
                  <SchoolLogo size={52} customLogoUrl={formData.logoUrl} />
                  <div className="text-left overflow-hidden">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">
                      Kop Surat Resmi
                    </span>
                    <span className="text-xs font-extrabold text-blue-950 block leading-tight truncate">
                      {formData.namaSekolah || 'UPT SDN KEBONAGUNG'}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {formData.alamatJalan}, {formData.kota}
                    </span>
                  </div>
                </div>

                {/* 3. Small Avatar Badge */}
                <div className="flex items-center gap-3 p-2.5 bg-slate-100 rounded-xl">
                  <SchoolLogo size={32} customLogoUrl={formData.logoUrl} />
                  <span className="text-xs font-semibold text-slate-700">
                    Ikon Navigasi & Mobile Ribbon (32px)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Status: Siap digunakan di semua modul</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SALURAN PENGADUAN & LAYANAN MASYARAKAT (FOKUS PERMINTAAN USER) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fokus Layanan Ramah Anak & TPPK</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-600" />
            <span>Nomor Telepon Pengaduan & Kontak Sekolah</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola saluran komunikasi resmi, nomor WhatsApp pengaduan kekerasan/bullying (TPPK), dan hotline darurat sekolah agar mudah diperbaharui sewaktu-waktu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* No Telp Pengaduan Utama */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 space-y-2">
            <label className="block text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Nomor HP / WhatsApp Pengaduan Masyarakat *</span>
            </label>
            <input
              type="text"
              required
              value={formData.noTeleponPengaduan}
              onChange={(e) => setFormData({ ...formData, noTeleponPengaduan: e.target.value })}
              placeholder="Contoh: 0812-3456-7890"
              className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-500">Akan tampil di Footer, Kop Surat & Web Profil.</span>
              {formData.noTeleponPengaduan && (
                <a
                  href={`https://wa.me/${getCleanWaNumber(formData.noTeleponPengaduan)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Tes Link WA</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          {/* Hotline Satgas TPPK */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/80 space-y-2">
            <label className="block text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Hotline Satgas TPPK (Anti Kekerasan & Bullying) *</span>
            </label>
            <input
              type="text"
              required
              value={formData.hotlineTppk}
              onChange={(e) => setFormData({ ...formData, hotlineTppk: e.target.value })}
              placeholder="Contoh: 0812-3456-7890"
              className="w-full px-3.5 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-500">
              Saluran siaga tanggap darurat konseling dan perlindungan peserta didik.
            </p>
          </div>

          {/* Telepon Kantor TU */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Telepon Kantor / Tata Usaha (TU)
            </label>
            <input
              type="text"
              value={formData.teleponKantor}
              onChange={(e) => setFormData({ ...formData, teleponKantor: e.target.value })}
              placeholder="Contoh: (0343) 421890"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          {/* Email Sekolah */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Resmi Sekolah
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Contoh: sdnkebonagung@pasuruankota.go.id"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          {/* Jam Pelayanan Pengaduan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Jam Layanan Pengaduan & Konseling</span>
            </label>
            <input
              type="text"
              value={formData.jamLayananPengaduan}
              onChange={(e) => setFormData({ ...formData, jamLayananPengaduan: e.target.value })}
              placeholder="Contoh: Senin - Jumat (07.00 - 15.00 WIB)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          {/* Tim Penanggung Jawab Pengaduan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Penanggung Jawab Layanan Pengaduan
            </label>
            <input
              type="text"
              value={formData.penanggungJawabPengaduan}
              onChange={(e) => setFormData({ ...formData, penanggungJawabPengaduan: e.target.value })}
              placeholder="Contoh: Satgas TPPK & Tim Humas SDN Kebonagung"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: IDENTITAS SATUAN PENDIDIKAN */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Identitas Satuan Pendidikan</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nama resmi satuan pendidikan, nomor statistik, akreditasi, dan alamat kampus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nama Resmi Satuan Pendidikan *
            </label>
            <input
              type="text"
              required
              value={formData.namaSekolah}
              onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
              placeholder="Contoh: UPT Satuan Pendidikan SDN Kebonagung Kota Pasuruan"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nama Singkat / Panggilan
            </label>
            <input
              type="text"
              value={formData.namaSingkat}
              onChange={(e) => setFormData({ ...formData, namaSingkat: e.target.value })}
              placeholder="Contoh: SDN Kebonagung"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              NPSN (Nomor Pokok Sekolah Nasional)
            </label>
            <input
              type="text"
              value={formData.npsn}
              onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
              placeholder="Contoh: 20535384"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              NSS (Nomor Statistik Sekolah)
            </label>
            <input
              type="text"
              value={formData.nss || ''}
              onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
              placeholder="Contoh: 101056302001"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Status & Akreditasi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={formData.statusSekolah}
                onChange={(e) => setFormData({ ...formData, statusSekolah: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Negeri">Negeri</option>
                <option value="Swasta">Swasta</option>
              </select>
              <input
                type="text"
                value={formData.akreditasi}
                onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                placeholder="A (Unggul)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Semboyan / Tagline Sekolah
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="Contoh: Sekolah Ramah Anak, Berbudaya Lingkungan Adiwiyata & Berkarakter Juara"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Alamat Jalan & Gedung Sekolah
            </label>
            <input
              type="text"
              value={formData.alamatJalan}
              onChange={(e) => setFormData({ ...formData, alamatJalan: e.target.value })}
              placeholder="Contoh: Jl. Raya Kebonagung No. 12"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Kelurahan / Desa
            </label>
            <input
              type="text"
              value={formData.kelurahan}
              onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
              placeholder="Kebonagung"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Kecamatan
            </label>
            <input
              type="text"
              value={formData.kecamatan}
              onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
              placeholder="Purworejo"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Kota / Kabupaten
            </label>
            <input
              type="text"
              value={formData.kota}
              onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
              placeholder="Kota Pasuruan"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Provinsi & Kode Pos
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.provinsi}
                onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                placeholder="Jawa Timur"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              />
              <input
                type="text"
                value={formData.kodePos}
                onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                placeholder="67116"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: PIMPINAN SEKOLAH (KEPALA SEKOLAH) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Kepala Sekolah & Pejabat Penandatangan Dokumen</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nama dan NIP Kepala Sekolah yang akan tercetak pada Surat Pemanggilan Orang Tua dan Laporan Resmi.
            </p>
          </div>
          {onNavigateToPegawai && (
            <button
              type="button"
              onClick={onNavigateToPegawai}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer"
            >
              <span>Kelola di Modul Pegawai</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nama Kepala Sekolah Beserta Gelar
            </label>
            <input
              type="text"
              value={formData.kepalaSekolahNama}
              onChange={(e) => setFormData({ ...formData, kepalaSekolahNama: e.target.value })}
              placeholder="Contoh: Hj. Sukesi, M.Pd."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              NIP Kepala Sekolah
            </label>
            <input
              type="text"
              value={formData.kepalaSekolahNip}
              onChange={(e) => setFormData({ ...formData, kepalaSekolahNip: e.target.value })}
              placeholder="Contoh: 19710314 199605 2 001"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 font-mono"
            />
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold">Pastikan data sekolah dan nomor pengaduan sudah akurat</p>
            <p className="text-[11px] text-slate-400">
              Perubahan disimpan otomatis di memori sistem dan disinkronkan ke seluruh aplikasi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFormData(initialProfile)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Batal Ubah
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Data Sekolah & Pengaduan</span>
          </button>
        </div>
      </div>
    </form>
  );
};
