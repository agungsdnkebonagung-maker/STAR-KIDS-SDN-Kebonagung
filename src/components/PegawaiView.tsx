import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Pegawai, KategoriPegawai, StatusKepegawaian, Gender, UserRole, MasterKelas, Student } from '../types';
import { DAFTAR_KELAS, MAPEL_OPTIONS } from '../data/constants';
import { SchoolLogo } from './SchoolLogo';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  Upload, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  X, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  FileText,
  UserCheck,
  Building2,
  BookOpen,
  ClipboardList,
  Shield,
  Coffee,
  HelpCircle,
  Eye
} from 'lucide-react';

interface PegawaiViewProps {
  pegawaiList: Pegawai[];
  role: UserRole;
  masterKelas: MasterKelas[];
  students: Student[];
  onAddPegawai: (pegawai: Pegawai) => void;
  onBatchAddPegawai: (pegawai: Pegawai[]) => void;
  onUpdatePegawai: (id: string, updated: Partial<Pegawai>) => void;
  onDeletePegawai: (id: string) => void;
  onSyncWaliKelasToStudentsAndMaster: (pegawaiList: Pegawai[]) => void;
}

interface ParsedPegawaiRow {
  id: string;
  nip?: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  kategori: KategoriPegawai;
  jabatan: string;
  tugasTambahan?: string;
  kelasBinaan?: string;
  mataPelajaran?: string;
  statusKepegawaian: StatusKepegawaian;
  golonganRuang?: string;
  pendidikanTerakhir?: string;
  noHp: string;
  email?: string;
  alamat?: string;
  statusAktif: boolean;
  isValid: boolean;
  errors: string[];
}

export const PegawaiView: React.FC<PegawaiViewProps> = ({
  pegawaiList,
  role,
  masterKelas,
  students,
  onAddPegawai,
  onBatchAddPegawai,
  onUpdatePegawai,
  onDeletePegawai,
  onSyncWaliKelasToStudentsAndMaster
}) => {
  // Navigation / Filter States
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [selectedStatusPegawai, setSelectedStatusPegawai] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingPegawaiId, setEditingPegawaiId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importTab, setImportTab] = useState<'upload' | 'paste' | 'template_guide'>('upload');
  const [detailPegawai, setDetailPegawai] = useState<Pegawai | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedPegawaiRow[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [importConflictMode, setImportConflictMode] = useState<'update' | 'append'>('update');

  // Form input state
  const [formNip, setFormNip] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formJk, setFormJk] = useState<Gender>('L');
  const [formKategori, setFormKategori] = useState<KategoriPegawai>('wali_kelas');
  const [formJabatan, setFormJabatan] = useState('');
  const [formTugasTambahan, setFormTugasTambahan] = useState('');
  const [formKelasBinaan, setFormKelasBinaan] = useState('');
  const [formMapel, setFormMapel] = useState('');
  const [formStatusKepegawaian, setFormStatusKepegawaian] = useState<StatusKepegawaian>('PNS');
  const [formGolongan, setFormGolongan] = useState('');
  const [formPendidikan, setFormPendidikan] = useState('');
  const [formNoHp, setFormNoHp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formStatusAktif, setFormStatusAktif] = useState(true);
  const [formCatatan, setFormCatatan] = useState('');

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ message: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Summary counts
  const summary = useMemo(() => {
    const total = pegawaiList.length;
    const ksCount = pegawaiList.filter(p => p.kategori === 'kepala_sekolah').length;
    const waliKelasCount = pegawaiList.filter(p => p.kategori === 'wali_kelas').length;
    const guruMapelCount = pegawaiList.filter(p => p.kategori === 'guru_mapel').length;
    const adminCount = pegawaiList.filter(p => p.kategori === 'administrasi').length;
    const staffCount = pegawaiList.filter(p => p.kategori === 'staff_sekolah').length;
    const asnTotal = pegawaiList.filter(p => p.statusKepegawaian === 'PNS' || p.statusKepegawaian === 'PPPK').length;
    const nonAsnTotal = total - asnTotal;

    return {
      total,
      ksCount,
      waliKelasCount,
      guruMapelCount,
      adminCount,
      staffCount,
      asnTotal,
      nonAsnTotal
    };
  }, [pegawaiList]);

  // Filtered List
  const filteredPegawai = useMemo(() => {
    return pegawaiList.filter(p => {
      // Kategori filter
      if (selectedKategori !== 'all' && p.kategori !== selectedKategori) {
        return false;
      }
      // Status kepegawaian filter
      if (selectedStatusPegawai !== 'all' && p.statusKepegawaian !== selectedStatusPegawai) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = p.namaLengkap.toLowerCase().includes(query);
        const matchNip = p.nip ? p.nip.toLowerCase().includes(query) : false;
        const matchJabatan = p.jabatan.toLowerCase().includes(query);
        const matchKelas = p.kelasBinaan ? p.kelasBinaan.toLowerCase().includes(query) : false;
        const matchMapel = p.mataPelajaran ? p.mataPelajaran.toLowerCase().includes(query) : false;
        const matchHp = p.noHp.toLowerCase().includes(query);
        const matchTugas = p.tugasTambahan ? p.tugasTambahan.toLowerCase().includes(query) : false;
        return matchName || matchNip || matchJabatan || matchKelas || matchMapel || matchHp || matchTugas;
      }
      return true;
    });
  }, [pegawaiList, selectedKategori, selectedStatusPegawai, searchTerm]);

  // Open Form for Add
  const handleOpenAdd = (defaultCat?: KategoriPegawai) => {
    setEditingPegawaiId(null);
    setFormNip('');
    setFormNama('');
    setFormJk('L');
    setFormKategori(defaultCat || (selectedKategori !== 'all' ? (selectedKategori as KategoriPegawai) : 'wali_kelas'));
    setFormJabatan('');
    setFormTugasTambahan('');
    setFormKelasBinaan('');
    setFormMapel('');
    setFormStatusKepegawaian('PNS');
    setFormGolongan('');
    setFormPendidikan('');
    setFormNoHp('');
    setFormEmail('');
    setFormAlamat('');
    setFormStatusAktif(true);
    setFormCatatan('');
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (p: Pegawai) => {
    setEditingPegawaiId(p.id);
    setFormNip(p.nip || '');
    setFormNama(p.namaLengkap);
    setFormJk(p.jenisKelamin);
    setFormKategori(p.kategori);
    setFormJabatan(p.jabatan);
    setFormTugasTambahan(p.tugasTambahan || '');
    setFormKelasBinaan(p.kelasBinaan || '');
    setFormMapel(p.mataPelajaran || '');
    setFormStatusKepegawaian(p.statusKepegawaian);
    setFormGolongan(p.golonganRuang || '');
    setFormPendidikan(p.pendidikanTerakhir || '');
    setFormNoHp(p.noHp);
    setFormEmail(p.email || '');
    setFormAlamat(p.alamat || '');
    setFormStatusAktif(p.statusAktif);
    setFormCatatan(p.catatan || '');
    setIsFormModalOpen(true);
  };

  // Save Form (Add or Edit)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      alert('Nama lengkap pegawai wajib diisi!');
      return;
    }

    // Auto-generate default jabatan if empty
    let finalJabatan = formJabatan.trim();
    if (!finalJabatan) {
      if (formKategori === 'kepala_sekolah') finalJabatan = 'Kepala UPT SDN Kebonagung';
      else if (formKategori === 'wali_kelas') finalJabatan = `Guru Kelas / Wali Kelas ${formKelasBinaan || ''}`.trim();
      else if (formKategori === 'guru_mapel') finalJabatan = `Guru Mata Pelajaran ${formMapel || ''}`.trim();
      else if (formKategori === 'administrasi') finalJabatan = 'Staf Administrasi / Tata Usaha';
      else finalJabatan = 'Staff Sekolah / PPSD / OB';
    }

    if (editingPegawaiId) {
      // Update
      const updated: Partial<Pegawai> = {
        nip: formNip.trim() || undefined,
        namaLengkap: formNama.trim(),
        jenisKelamin: formJk,
        kategori: formKategori,
        jabatan: finalJabatan,
        tugasTambahan: formTugasTambahan.trim() || undefined,
        kelasBinaan: formKategori === 'wali_kelas' ? formKelasBinaan.trim().toUpperCase() : undefined,
        mataPelajaran: formKategori === 'guru_mapel' ? formMapel.trim() : undefined,
        statusKepegawaian: formStatusKepegawaian,
        golonganRuang: formGolongan.trim() || undefined,
        pendidikanTerakhir: formPendidikan.trim() || undefined,
        noHp: formNoHp.trim(),
        email: formEmail.trim() || undefined,
        alamat: formAlamat.trim() || undefined,
        statusAktif: formStatusAktif,
        catatan: formCatatan.trim() || undefined
      };
      onUpdatePegawai(editingPegawaiId, updated);
      showToast(`Data pegawai "${formNama}" berhasil diperbarui!`, 'success');
    } else {
      // Add
      const newPegawai: Pegawai = {
        id: `PEG-${Date.now()}`,
        nip: formNip.trim() || undefined,
        namaLengkap: formNama.trim(),
        jenisKelamin: formJk,
        kategori: formKategori,
        jabatan: finalJabatan,
        tugasTambahan: formTugasTambahan.trim() || undefined,
        kelasBinaan: formKategori === 'wali_kelas' ? formKelasBinaan.trim().toUpperCase() : undefined,
        mataPelajaran: formKategori === 'guru_mapel' ? formMapel.trim() : undefined,
        statusKepegawaian: formStatusKepegawaian,
        golonganRuang: formGolongan.trim() || undefined,
        pendidikanTerakhir: formPendidikan.trim() || undefined,
        noHp: formNoHp.trim(),
        email: formEmail.trim() || undefined,
        alamat: formAlamat.trim() || undefined,
        statusAktif: formStatusAktif,
        catatan: formCatatan.trim() || undefined
      };
      onAddPegawai(newPegawai);
      showToast(`Pegawai baru "${formNama}" berhasil ditambahkan!`, 'success');
    }

    setIsFormModalOpen(false);
  };

  // Delete Pegawai
  const handleDelete = (p: Pegawai) => {
    if (confirm(`Yakin ingin menghapus data pegawai: ${p.namaLengkap} (${p.jabatan})?`)) {
      onDeletePegawai(p.id);
      showToast(`Data pegawai ${p.namaLengkap} berhasil dihapus.`, 'info');
    }
  };

  // Synchronize all Wali Kelas from Pegawai List to Master Kelas and Students
  const handleSyncWaliKelas = () => {
    onSyncWaliKelasToStudentsAndMaster(pegawaiList);
    showToast('Seluruh Wali Kelas dan NIP berhasil disinkronkan ke 28 Rombel & Data Siswa SDN Kebonagung!', 'success');
  };

  // ===================== EXCEL DOWNLOAD TEMPLATE =====================
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'NIP Kepegawaian (18 Digit)': '19710314 199605 2 001',
        'Nama Lengkap & Gelar': 'Hj. Sukesi, M.Pd.',
        'Jenis Kelamin (L/P)': 'P',
        'Kategori Pegawai': 'Kepala Sekolah',
        'Jabatan': 'Kepala UPT SDN Kebonagung',
        'Tugas Tambahan': 'Penanggung Jawab TPPK',
        'Kelas Binaan (Khusus Wali Kelas)': '',
        'Mata Pelajaran (Khusus Guru Mapel)': '',
        'Status Kepegawaian': 'PNS',
        'Golongan Ruang': 'IV/b',
        'Pendidikan Terakhir': 'S2 Manajemen Pendidikan',
        'No WhatsApp / HP': '081234567001',
        'Email Resmi': 'sukesi@sdnkebonagung.sch.id',
        'Alamat Lengkap': 'Jl. Panglima Sudirman No. 45, Pasuruan'
      },
      {
        'NIP Kepegawaian (18 Digit)': '19670514 199203 1 005',
        'Nama Lengkap & Gelar': 'Drs. Tri Wahyono',
        'Jenis Kelamin (L/P)': 'L',
        'Kategori Pegawai': 'Wali Kelas',
        'Jabatan': 'Guru Kelas / Wali Kelas 6A',
        'Tugas Tambahan': 'Ketua Tim TPPK',
        'Kelas Binaan (Khusus Wali Kelas)': '6A',
        'Mata Pelajaran (Khusus Guru Mapel)': '',
        'Status Kepegawaian': 'PNS',
        'Golongan Ruang': 'IV/b',
        'Pendidikan Terakhir': 'S1 PGSD',
        'No WhatsApp / HP': '081234567061',
        'Email Resmi': 'tri.wahyono@sdnkebonagung.sch.id',
        'Alamat Lengkap': 'Jl. Veteran No. 12, Kebonagung, Pasuruan'
      },
      {
        'NIP Kepegawaian (18 Digit)': '19900218 201503 1 005',
        'Nama Lengkap & Gelar': 'Bayu Aditya, S.Pd.',
        'Jenis Kelamin (L/P)': 'L',
        'Kategori Pegawai': 'Guru Mapel',
        'Jabatan': 'Guru PJOK',
        'Tugas Tambahan': 'Koordinator UKS',
        'Kelas Binaan (Khusus Wali Kelas)': '',
        'Mata Pelajaran (Khusus Guru Mapel)': 'PJOK',
        'Status Kepegawaian': 'PPPK',
        'Golongan Ruang': 'IX',
        'Pendidikan Terakhir': 'S1 PJKR',
        'No WhatsApp / HP': '081234567104',
        'Email Resmi': 'bayu.aditya@sdnkebonagung.sch.id',
        'Alamat Lengkap': 'Gadingrejo, Pasuruan'
      },
      {
        'NIP Kepegawaian (18 Digit)': '19730510 199803 1 006',
        'Nama Lengkap & Gelar': 'Sugiono, S.AP.',
        'Jenis Kelamin (L/P)': 'L',
        'Kategori Pegawai': 'Administrasi',
        'Jabatan': 'Kepala Urusan Tata Usaha (Kaur TU)',
        'Tugas Tambahan': 'Koordinator Aset & Kepegawaian',
        'Kelas Binaan (Khusus Wali Kelas)': '',
        'Mata Pelajaran (Khusus Guru Mapel)': '',
        'Status Kepegawaian': 'PNS',
        'Golongan Ruang': 'III/c',
        'Pendidikan Terakhir': 'S1 Administrasi Publik',
        'No WhatsApp / HP': '081234567201',
        'Email Resmi': 'sugiono.tu@sdnkebonagung.sch.id',
        'Alamat Lengkap': 'Kebonagung, Pasuruan'
      },
      {
        'NIP Kepegawaian (18 Digit)': '-',
        'Nama Lengkap & Gelar': 'Slamet Riyadi',
        'Jenis Kelamin (L/P)': 'L',
        'Kategori Pegawai': 'Staff Sekolah',
        'Jabatan': 'Koordinator PPSD / Satpam Gerbang',
        'Tugas Tambahan': 'Pengamanan & Ketertiban Masuk Sekolah',
        'Kelas Binaan (Khusus Wali Kelas)': '',
        'Mata Pelajaran (Khusus Guru Mapel)': '',
        'Status Kepegawaian': 'Tenaga Kontrak',
        'Golongan Ruang': '-',
        'Pendidikan Terakhir': 'SMA',
        'No WhatsApp / HP': '081234567301',
        'Email Resmi': '',
        'Alamat Lengkap': 'Kebonagung, Pasuruan'
      },
      {
        'NIP Kepegawaian (18 Digit)': '-',
        'Nama Lengkap & Gelar': 'Mat Sholeh',
        'Jenis Kelamin (L/P)': 'L',
        'Kategori Pegawai': 'Staff Sekolah',
        'Jabatan': 'Office Boy (OB) Gedung A & Halaman',
        'Tugas Tambahan': 'Kebersihan Halaman & Sanitasi',
        'Kelas Binaan (Khusus Wali Kelas)': '',
        'Mata Pelajaran (Khusus Guru Mapel)': '',
        'Status Kepegawaian': 'Tenaga Kontrak',
        'Golongan Ruang': '-',
        'Pendidikan Terakhir': 'SMP',
        'No WhatsApp / HP': '081234567303',
        'Email Resmi': '',
        'Alamat Lengkap': 'Kebonagung, Pasuruan'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Pegawai');
    XLSX.writeFile(wb, 'Format_Import_Pegawai_SDN_Kebonagung.xlsx');
    showToast('Template Excel Pegawai & Wali Kelas berhasil diunduh.', 'success');
  };

  // ===================== EXCEL EXPORT FULL DATA =====================
  const handleExportExcel = () => {
    const exportData = filteredPegawai.map((p, idx) => ({
      'No': idx + 1,
      'NIP': p.nip || '-',
      'Nama Lengkap & Gelar': p.namaLengkap,
      'Jenis Kelamin': p.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'Kategori': p.kategori === 'kepala_sekolah' ? 'Kepala Sekolah'
        : p.kategori === 'wali_kelas' ? 'Wali Kelas'
        : p.kategori === 'guru_mapel' ? 'Guru Mapel'
        : p.kategori === 'administrasi' ? 'Petugas Administrasi / TU'
        : 'Staff Sekolah / OB / PPSD',
      'Jabatan': p.jabatan,
      'Tugas Tambahan': p.tugasTambahan || '-',
      'Kelas Binaan': p.kelasBinaan || '-',
      'Mata Pelajaran': p.mataPelajaran || '-',
      'Status Kepegawaian': p.statusKepegawaian,
      'Golongan/Ruang': p.golonganRuang || '-',
      'Pendidikan Terakhir': p.pendidikanTerakhir || '-',
      'No WhatsApp/HP': p.noHp,
      'Email': p.email || '-',
      'Alamat': p.alamat || '-',
      'Status Aktif': p.statusAktif ? 'Aktif' : 'Nonaktif'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Pegawai');
    XLSX.writeFile(wb, `Data_Pegawai_SDN_Kebonagung_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Daftar Pegawai & Guru berhasil diekspor ke Excel.', 'success');
  };

  // ===================== PARSE IMPORT FILE =====================
  const parseRowsFromRaw = (rawJson: any[]): ParsedPegawaiRow[] => {
    return rawJson.map((row, idx) => {
      const errors: string[] = [];

      // Find NIP
      const nipKey = Object.keys(row).find(k => k.toLowerCase().includes('nip'));
      const rawNip = nipKey ? String(row[nipKey] || '').trim() : '';
      const cleanNip = rawNip === '-' || rawNip === '' ? undefined : rawNip;

      // Find Nama
      const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('nama'));
      const namaLengkap = nameKey ? String(row[nameKey] || '').trim() : '';
      if (!namaLengkap) {
        errors.push('Nama lengkap wajib diisi');
      }

      // Find JK
      const jkKey = Object.keys(row).find(k => k.toLowerCase().includes('kelamin') || k.toLowerCase() === 'jk');
      let jenisKelamin: Gender = 'L';
      if (jkKey) {
        const val = String(row[jkKey] || '').trim().toUpperCase();
        if (val.startsWith('P') || val.includes('PEREMPUAN') || val.includes('WANITA')) {
          jenisKelamin = 'P';
        }
      }

      // Find Kategori
      const catKey = Object.keys(row).find(k => k.toLowerCase().includes('kategori'));
      let kategori: KategoriPegawai = 'wali_kelas';
      if (catKey) {
        const cVal = String(row[catKey] || '').toLowerCase();
        if (cVal.includes('kepala') || cVal.includes('ks')) {
          kategori = 'kepala_sekolah';
        } else if (cVal.includes('wali') || cVal.includes('kelas')) {
          kategori = 'wali_kelas';
        } else if (cVal.includes('mapel') || cVal.includes('guru')) {
          kategori = 'guru_mapel';
        } else if (cVal.includes('administrasi') || cVal.includes('tu') || cVal.includes('tata usaha') || cVal.includes('operator')) {
          kategori = 'administrasi';
        } else if (cVal.includes('staff') || cVal.includes('staf') || cVal.includes('ob') || cVal.includes('ppsd') || cVal.includes('satpam') || cVal.includes('penjaga') || cVal.includes('kebersihan')) {
          kategori = 'staff_sekolah';
        }
      }

      // Find Jabatan
      const jabKey = Object.keys(row).find(k => k.toLowerCase().includes('jabatan'));
      let jabatan = jabKey ? String(row[jabKey] || '').trim() : '';

      // Find Tugas Tambahan
      const tugasKey = Object.keys(row).find(k => k.toLowerCase().includes('tugas'));
      const tugasTambahan = tugasKey ? String(row[tugasKey] || '').trim() : undefined;

      // Find Kelas Binaan
      const klsKey = Object.keys(row).find(k => k.toLowerCase().includes('kelas binaan') || k.toLowerCase().includes('rombel'));
      let kelasBinaan = klsKey ? String(row[klsKey] || '').trim().toUpperCase() : undefined;
      if (!kelasBinaan && kategori === 'wali_kelas') {
        // try to detect from jabatan (e.g., "Guru Kelas 6A")
        const match = jabatan.match(/([1-6][A-E])/i);
        if (match) {
          kelasBinaan = match[1].toUpperCase();
        }
      }

      if (!jabatan) {
        if (kategori === 'kepala_sekolah') jabatan = 'Kepala UPT SDN Kebonagung';
        else if (kategori === 'wali_kelas') jabatan = `Guru Kelas / Wali Kelas ${kelasBinaan || ''}`.trim();
        else if (kategori === 'guru_mapel') jabatan = 'Guru Mata Pelajaran';
        else if (kategori === 'administrasi') jabatan = 'Staf Administrasi / Tata Usaha';
        else jabatan = 'Staff Sekolah / PPSD / OB';
      }

      // Find Mapel
      const mapelKey = Object.keys(row).find(k => k.toLowerCase().includes('mata pelajaran') || k.toLowerCase().includes('mapel'));
      const mataPelajaran = mapelKey ? String(row[mapelKey] || '').trim() : undefined;

      // Find Status Kepegawaian
      const statKey = Object.keys(row).find(k => k.toLowerCase().includes('status kepegawaian') || k.toLowerCase().includes('kepegawaian'));
      let statusKepegawaian: StatusKepegawaian = 'PNS';
      if (statKey) {
        const sVal = String(row[statKey] || '').toUpperCase();
        if (sVal.includes('PPPK')) statusKepegawaian = 'PPPK';
        else if (sVal.includes('GTT')) statusKepegawaian = 'GTT';
        else if (sVal.includes('PTT')) statusKepegawaian = 'PTT';
        else if (sVal.includes('KONTRAK')) statusKepegawaian = 'Tenaga Kontrak';
        else if (sVal.includes('HONOR')) statusKepegawaian = 'Honor Sekolah';
      }

      // Find Golongan
      const golKey = Object.keys(row).find(k => k.toLowerCase().includes('golongan'));
      const golonganRuang = golKey ? String(row[golKey] || '').trim() : undefined;

      // Find Pendidikan
      const pendKey = Object.keys(row).find(k => k.toLowerCase().includes('pendidikan'));
      const pendidikanTerakhir = pendKey ? String(row[pendKey] || '').trim() : undefined;

      // Find HP
      const hpKey = Object.keys(row).find(k => k.toLowerCase().includes('hp') || k.toLowerCase().includes('wa') || k.toLowerCase().includes('telepon'));
      const noHp = hpKey ? String(row[hpKey] || '').trim() : '081234567890';

      // Find Email
      const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email'));
      const email = emailKey ? String(row[emailKey] || '').trim() : undefined;

      // Find Alamat
      const alamatKey = Object.keys(row).find(k => k.toLowerCase().includes('alamat'));
      const alamat = alamatKey ? String(row[alamatKey] || '').trim() : undefined;

      return {
        id: `PEG-${Date.now()}-${idx}`,
        nip: cleanNip,
        namaLengkap,
        jenisKelamin,
        kategori,
        jabatan,
        tugasTambahan,
        kelasBinaan,
        mataPelajaran,
        statusKepegawaian,
        golonganRuang,
        pendidikanTerakhir,
        noHp,
        email,
        alamat,
        statusAktif: true,
        isValid: errors.length === 0,
        errors
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson = XLSX.utils.sheet_to_json(ws);

        if (rawJson.length === 0) {
          alert('File spreadsheet kosong atau format tidak sesuai!');
          setIsProcessingFile(false);
          return;
        }

        const parsed = parseRowsFromRaw(rawJson);
        setParsedRows(parsed);
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file Excel/CSV! Pastikan format file valid.');
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Parse Paste Text
  const handleParsePaste = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.trim().split('\n');
    if (lines.length === 0) return;

    // Check if header line exists
    const firstLine = lines[0];
    const separator = firstLine.includes('\t') ? '\t' : ',';
    const headers = firstLine.split(separator).map(h => h.trim());

    const rawJson = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(separator).map(p => p.trim());
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = parts[idx] || '';
      });
      rawJson.push(obj);
    }

    if (rawJson.length === 0) {
      alert('Tidak ada baris data valid yang terdeteksi dari teks yang ditempel!');
      return;
    }

    const parsed = parseRowsFromRaw(rawJson);
    setParsedRows(parsed);
  };

  // Commit Parsed Rows
  const handleCommitImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada data valid yang dapat disimpan!');
      return;
    }

    const newPegawaiList: Pegawai[] = validRows.map(r => ({
      id: r.id,
      nip: r.nip,
      namaLengkap: r.namaLengkap,
      jenisKelamin: r.jenisKelamin,
      kategori: r.kategori,
      jabatan: r.jabatan,
      tugasTambahan: r.tugasTambahan,
      kelasBinaan: r.kelasBinaan,
      mataPelajaran: r.mataPelajaran,
      statusKepegawaian: r.statusKepegawaian,
      golonganRuang: r.golonganRuang,
      pendidikanTerakhir: r.pendidikanTerakhir,
      noHp: r.noHp,
      email: r.email,
      alamat: r.alamat,
      statusAktif: r.statusAktif
    }));

    if (importConflictMode === 'update') {
      // Update existing or add new based on NIP or Name or Kelas
      const updatedList = [...pegawaiList];
      newPegawaiList.forEach(incoming => {
        const existingIdx = updatedList.findIndex(p => {
          if (incoming.nip && p.nip && incoming.nip.replace(/\s+/g, '') === p.nip.replace(/\s+/g, '')) return true;
          if (incoming.kategori === 'wali_kelas' && incoming.kelasBinaan && p.kelasBinaan === incoming.kelasBinaan) return true;
          if (incoming.kategori === 'kepala_sekolah' && p.kategori === 'kepala_sekolah') return true;
          return p.namaLengkap.toLowerCase() === incoming.namaLengkap.toLowerCase();
        });

        if (existingIdx >= 0) {
          updatedList[existingIdx] = {
            ...updatedList[existingIdx],
            ...incoming,
            id: updatedList[existingIdx].id // preserve ID
          };
        } else {
          updatedList.push(incoming);
        }
      });
      onBatchAddPegawai(updatedList);
    } else {
      // Append only
      onBatchAddPegawai([...pegawaiList, ...newPegawaiList]);
    }

    setIsImportModalOpen(false);
    setParsedRows([]);
    setPasteText('');
    showToast(`Berhasil mengimpor ${validRows.length} data pegawai ke sistem!`, 'success');
  };

  const getKategoriBadge = (kategori: KategoriPegawai) => {
    switch (kategori) {
      case 'kepala_sekolah':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            Kepala Sekolah
          </span>
        );
      case 'wali_kelas':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-100 text-blue-900 border border-blue-300">
            <Users className="w-3.5 h-3.5 text-blue-700" />
            Wali Kelas
          </span>
        );
      case 'guru_mapel':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            Guru Mapel
          </span>
        );
      case 'administrasi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-purple-100 text-purple-900 border border-purple-300">
            <ClipboardList className="w-3.5 h-3.5 text-purple-700" />
            Administrasi / TU
          </span>
        );
      case 'staff_sekolah':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-teal-100 text-teal-900 border border-teal-300">
            <Shield className="w-3.5 h-3.5 text-teal-700" />
            Staff OB & PPSD
          </span>
        );
    }
  };

  const getStatusBadge = (status: StatusKepegawaian) => {
    if (status === 'PNS') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">PNS</span>;
    }
    if (status === 'PPPK') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">PPPK</span>;
    }
    if (status === 'Tenaga Kontrak') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Kontrak</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-bold shadow-md animate-in fade-in duration-200 ${
          toastMessage.type === 'success' ? 'bg-emerald-600 text-white' :
          toastMessage.type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage.message}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 mb-2">
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>Sistem Informasi Kepegawaian Terintegrasi (SIM-PEG)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Data Pendidik & Tenaga Kependidikan</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
              UPT SDN Kebonagung
            </span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1 max-w-3xl">
            Kelola data Kepala Sekolah, 28 Wali Kelas, Guru Mata Pelajaran, Tenaga Administrasi (TU), dan Staff Sekolah (OB / PPSD) dengan pembaruan cepat dan dukungan upload Excel.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            title="Upload atau Paste data pegawai dari file Excel/CSV"
          >
            <Upload className="w-4 h-4" />
            <span>Upload / Import Excel</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Unduh format template Excel untuk pengisian data"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Format Template</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pegawai</span>
          </button>

          <button
            type="button"
            onClick={handleSyncWaliKelas}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sinkronkan otomatis nama & NIP wali kelas ke master rombel dan data murid"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Sinkronkan Wali Kelas</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Pegawai */}
        <div 
          onClick={() => { setSelectedKategori('all'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedKategori === 'all' 
              ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Semua Pegawai</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{summary.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Warga Sekolah Terdata</div>
        </div>

        {/* Kepala Sekolah */}
        <div 
          onClick={() => { setSelectedKategori('kepala_sekolah'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedKategori === 'kepala_sekolah' 
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Kepala Sekolah</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{summary.ksCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pimpinan Lembaga</div>
        </div>

        {/* Wali Kelas */}
        <div 
          onClick={() => { setSelectedKategori('wali_kelas'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedKategori === 'wali_kelas' 
              ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Wali Kelas</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-800 mt-2">{summary.waliKelasCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">28 Rombel (1A - 6E)</div>
        </div>

        {/* Guru Mapel */}
        <div 
          onClick={() => { setSelectedKategori('guru_mapel'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedKategori === 'guru_mapel' 
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Guru Mapel</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{summary.guruMapelCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Agama, PJOK, Seni, dll.</div>
        </div>

        {/* Tenaga Administrasi (TU) */}
        <div 
          onClick={() => { setSelectedKategori('administrasi'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedKategori === 'administrasi' 
              ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Administrasi / TU</span>
            <ClipboardList className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">{summary.adminCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Kaur TU, Dapodik, BOS</div>
        </div>

        {/* Staff Sekolah (OB / PPSD) */}
        <div 
          onClick={() => { setSelectedKategori('staff_sekolah'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedKategori === 'staff_sekolah' 
              ? 'bg-teal-50/80 border-teal-400 ring-2 ring-teal-500/20 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Staff OB & PPSD</span>
            <Shield className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 mt-2">{summary.staffCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Satpam, Penjaga, OB</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NIP, jabatan, kelas binaan (cth: 6A), mapel, no HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Kategori Filter */}
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kategori ({summary.total})</option>
            <option value="kepala_sekolah">🏛️ Kepala Sekolah ({summary.ksCount})</option>
            <option value="wali_kelas">👨‍🏫 Wali Kelas ({summary.waliKelasCount})</option>
            <option value="guru_mapel">📖 Guru Mapel ({summary.guruMapelCount})</option>
            <option value="administrasi">🗄️ Administrasi / TU ({summary.adminCount})</option>
            <option value="staff_sekolah">🛡️ Staff OB & PPSD ({summary.staffCount})</option>
          </select>

          {/* Status Kepegawaian Filter */}
          <select
            value={selectedStatusPegawai}
            onChange={(e) => setSelectedStatusPegawai(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status ASN/Non-ASN</option>
            <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
            <option value="PPPK">PPPK (P3K)</option>
            <option value="GTT">GTT (Guru Tidak Tetap)</option>
            <option value="PTT">PTT (Pegawai Tidak Tetap)</option>
            <option value="Tenaga Kontrak">Tenaga Kontrak (OB/PPSD)</option>
            <option value="Honor Sekolah">Honor Sekolah</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tabel
            </button>
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'card' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Kartu
            </button>
          </div>

          {/* Export button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Ekspor daftar ini ke file Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs font-bold text-slate-600">
              Menampilkan <span className="font-extrabold text-slate-900">{filteredPegawai.length}</span> dari {pegawaiList.length} pegawai
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              💡 Tip: Klik tombol <span className="font-bold text-amber-700">Edit ✏️</span> untuk memperbarui data pegawai secara instan.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-4">Nama Lengkap & NIP</th>
                  <th className="py-3 px-4">Kategori & Jabatan</th>
                  <th className="py-3 px-4">Tugas Tambahan / Binaan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Golongan / Pend.</th>
                  <th className="py-3 px-4">Kontak (HP/WA)</th>
                  <th className="py-3 px-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredPegawai.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-10 h-10 text-slate-300 stroke-1" />
                        <span className="font-bold text-slate-600">Tidak ada data pegawai yang sesuai dengan filter.</span>
                        <button
                          onClick={() => { setSelectedKategori('all'); setSelectedStatusPegawai('all'); setSearchTerm(''); }}
                          className="text-xs text-blue-600 font-bold underline hover:text-blue-800 cursor-pointer"
                        >
                          Reset Filter Pencarian
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPegawai.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      
                      {/* Nama & NIP */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            p.jenisKelamin === 'P' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {p.namaLengkap.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors">
                              {p.namaLengkap}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                              {p.nip ? `NIP. ${p.nip}` : <span className="text-slate-400 italic">Non-NIP</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori & Jabatan */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div>{getKategoriBadge(p.kategori)}</div>
                          <div className="text-[11px] font-bold text-slate-800">{p.jabatan}</div>
                        </div>
                      </td>

                      {/* Tugas / Binaan */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {p.kelasBinaan && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded font-black text-xs bg-blue-50 text-blue-900 border border-blue-200 mr-1.5">
                              Kelas {p.kelasBinaan}
                            </span>
                          )}
                          {p.mataPelajaran && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mr-1.5">
                              {p.mataPelajaran}
                            </span>
                          )}
                          {p.tugasTambahan && (
                            <div className="text-[11px] text-slate-600 font-medium italic">
                              {p.tugasTambahan}
                            </div>
                          )}
                          {!p.kelasBinaan && !p.mataPelajaran && !p.tugasTambahan && (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {getStatusBadge(p.statusKepegawaian)}
                      </td>

                      {/* Golongan / Pendidikan */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] font-bold text-slate-700">{p.golonganRuang || '-'}</div>
                        <div className="text-[10px] text-slate-400">{p.pendidikanTerakhir || '-'}</div>
                      </td>

                      {/* Kontak */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <a
                            href={`https://wa.me/${p.noHp.replace(/\D/g, '').replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{p.noHp}</span>
                          </a>
                          {p.email && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{p.email}</div>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailPegawai(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Pegawai"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Pegawai"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPegawai.map((p) => (
            <div 
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      p.jenisKelamin === 'P' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {p.namaLengkap.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {p.namaLengkap}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {p.nip ? `NIP. ${p.nip}` : 'Non-NIP'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(p.statusKepegawaian)}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {getKategoriBadge(p.kategori)}
                  {p.kelasBinaan && (
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-blue-50 text-blue-900 border border-blue-200">
                      Kelas {p.kelasBinaan}
                    </span>
                  )}
                  {p.mataPelajaran && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {p.mataPelajaran}
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>{p.jabatan}</div>
                  {p.tugasTambahan && (
                    <div className="text-[11px] font-normal text-slate-500 mt-1 italic">
                      Tugas: {p.tugasTambahan}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Golongan:</span>
                    <span className="font-semibold">{p.golonganRuang || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pendidikan:</span>
                    <span className="font-semibold truncate block">{p.pendidikanTerakhir || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                <a
                  href={`https://wa.me/${p.noHp.replace(/\D/g, '').replace(/^0/, '62')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{p.noHp}</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDetailPegawai(p)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================= MODAL TAMBAH / EDIT PEGAWAI ======================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base">
                  {editingPegawaiId ? 'Edit Data Pegawai / Guru' : 'Tambah Pegawai / Guru Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs">
              {/* Row 1: Kategori Pegawai & Status Kepegawaian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Pegawai <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as KategoriPegawai)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="kepala_sekolah">🏛️ Kepala Sekolah</option>
                    <option value="wali_kelas">👨‍🏫 Guru Kelas / Wali Kelas</option>
                    <option value="guru_mapel">📖 Guru Mata Pelajaran</option>
                    <option value="administrasi">🗄️ Tenaga Administrasi / TU</option>
                    <option value="staff_sekolah">🛡️ Staff Sekolah (OB / PPSD / Satpam)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Kepegawaian <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formStatusKepegawaian}
                    onChange={(e) => setFormStatusKepegawaian(e.target.value as StatusKepegawaian)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK (Pegawai Pemerintah dengan Perjanjian Kerja)</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="PTT">PTT (Pegawai Tidak Tetap)</option>
                    <option value="Tenaga Kontrak">Tenaga Kontrak (OB/PPSD)</option>
                    <option value="Honor Sekolah">Honor Sekolah</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Nama Lengkap & NIP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Titik Suprihatin, S.Pd. atau Sukirno"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formJk}
                    onChange={(e) => setFormJk(e.target.value as Gender)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: NIP & Golongan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIP Kepegawaian (18 Digit)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 19820514 200801 2 015 (Kosongkan bila non-NIP)"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pangkat / Golongan Ruang
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: IV/b (Pembina Tk. I) atau IX"
                    value={formGolongan}
                    onChange={(e) => setFormGolongan(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Contextual Row: If Wali Kelas or Guru Mapel */}
              {formKategori === 'wali_kelas' && (
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200">
                  <label className="block font-bold text-blue-950 mb-1">
                    Rombel / Kelas Binaan <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formKelasBinaan}
                    onChange={(e) => setFormKelasBinaan(e.target.value)}
                    className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-black text-blue-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">-- Pilih Rombel Kelas (1A - 6E) --</option>
                    {DAFTAR_KELAS.map(k => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-blue-700 mt-1 block">
                    Nama wali kelas dan NIP ini akan otomatis tercantum pada cetak rekap absen dan surat pemanggilan siswa kelas ini.
                  </span>
                </div>
              )}

              {formKategori === 'guru_mapel' && (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                  <label className="block font-bold text-emerald-950 mb-1">
                    Mata Pelajaran yang Diampu <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pendidikan Agama Islam / PJOK / Bahasa Inggris / SBdP"
                    value={formMapel}
                    onChange={(e) => setFormMapel(e.target.value)}
                    className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              )}

              {/* Row 4: Jabatan & Tugas Tambahan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jabatan Utama
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Guru Kelas 6A / Kaur TU / Koordinator PPSD"
                    value={formJabatan}
                    onChange={(e) => setFormJabatan(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tugas Tambahan / Pokja
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ketua Tim TPPK / Bendahara BOS / Pembina UKS"
                    value={formTugasTambahan}
                    onChange={(e) => setFormTugasTambahan(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Row 5: Kontak & Pendidikan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No WhatsApp / HP <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890"
                    value={formNoHp}
                    onChange={(e) => setFormNoHp(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    placeholder="nama@sdnkebonagung.sch.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pendidikan Terakhir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: S1 PGSD / SMA"
                    value={formPendidikan}
                    onChange={(e) => setFormPendidikan(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Row 6: Alamat */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Tinggal / Domisili
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Diponegoro Gang 3, Kebonagung, Pasuruan"
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPegawaiId ? 'Simpan Perubahan' : 'Tambahkan Pegawai'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL IMPORT / UPLOAD EXCEL ======================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-base">
                    Upload & Impor Data Pegawai / Wali Kelas
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    Mendukung file Excel (.xlsx, .xls), CSV, atau salin-tempel langsung dari Google Sheets.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsImportModalOpen(false); setParsedRows([]); }}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImportTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  importTab === 'upload' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Upload File Excel / CSV
              </button>
              <button
                type="button"
                onClick={() => setImportTab('paste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  importTab === 'paste' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Tempel Teks (Paste Spreadsheet)
              </button>
              <button
                type="button"
                onClick={() => setImportTab('template_guide')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  importTab === 'template_guide' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Panduan Format Kolom
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* TAB 1: UPLOAD FILE */}
              {importTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-emerald-50/40 hover:bg-emerald-50/70 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-800">
                        Klik untuk Memilih File Spreadsheet atau Seret ke Sini
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Mendukung format .xlsx, .xls, .csv (Maksimal 10 MB)
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      <span>Belum memiliki format file yang tepat?</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Template Contoh</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PASTE SPREADSHEET */}
              {importTab === 'paste' && (
                <div className="space-y-3">
                  <p className="text-slate-600">
                    Salin baris data dari Google Spreadsheet atau Microsoft Excel (termasuk baris judul kolom), lalu tempel di bawah ini:
                  </p>
                  <textarea
                    rows={6}
                    placeholder="NIP&#9;Nama Lengkap&#9;Kategori&#9;Jabatan&#9;Kelas Binaan&#9;Status&#9;No HP..."
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleParsePaste}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Proses Teks yang Ditempel
                  </button>
                </div>
              )}

              {/* TAB 3: GUIDELINE */}
              {importTab === 'template_guide' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-extrabold text-slate-900 text-sm">Ketentuan Judul Kolom Spreadsheet:</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                    <li><strong className="text-slate-900">Nama Lengkap & Gelar</strong> (Wajib diisi)</li>
                    <li><strong className="text-slate-900">NIP Kepegawaian</strong> (18 digit angka resmi atau tanda - jika non-NIP)</li>
                    <li><strong className="text-slate-900">Kategori Pegawai</strong> (Kepala Sekolah / Wali Kelas / Guru Mapel / Administrasi / Staff Sekolah)</li>
                    <li><strong className="text-slate-900">Jabatan</strong> (Contoh: Guru Kelas 6A, Guru PJOK, Kaur TU, OB Gedung A, PPSD Gerbang)</li>
                    <li><strong className="text-slate-900">Kelas Binaan</strong> (Khusus Wali Kelas: 1A s.d. 6E)</li>
                    <li><strong className="text-slate-900">Mata Pelajaran</strong> (Khusus Guru Mapel: PAI, PJOK, Bahasa Inggris, SBdP, dll.)</li>
                    <li><strong className="text-slate-900">Status Kepegawaian</strong> (PNS / PPPK / GTT / PTT / Tenaga Kontrak / Honor Sekolah)</li>
                    <li><strong className="text-slate-900">No WhatsApp / HP</strong> (Untuk kemudahan koordinasi kedinasan)</li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh File Format Excel Resmi</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PREVIEW TABLE IF PARSED */}
              {parsedRows.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <span>Pratinjau Hasil Impor ({parsedRows.length} Data Terbaca)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {parsedRows.filter(r => r.isValid).length} Valid
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Periksa kembali kesesuaian data sebelum menyimpannya ke dalam sistem database.
                      </p>
                    </div>

                    {/* Conflict Mode */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                      <span className="text-slate-500 px-1">Metode:</span>
                      <button
                        type="button"
                        onClick={() => setImportConflictMode('update')}
                        className={`px-2 py-1 rounded-lg ${importConflictMode === 'update' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600'}`}
                      >
                        Perbarui Jika Ada
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportConflictMode('append')}
                        className={`px-2 py-1 rounded-lg ${importConflictMode === 'append' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600'}`}
                      >
                        Tambah Baru Saja
                      </button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="p-2 w-8 text-center">No</th>
                          <th className="p-2">Nama & NIP</th>
                          <th className="p-2">Kategori</th>
                          <th className="p-2">Jabatan / Binaan</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">No HP</th>
                          <th className="p-2 text-center">Status Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {parsedRows.map((r, idx) => (
                          <tr key={idx} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                            <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-2">
                              <div className="font-bold text-slate-900">{r.namaLengkap}</div>
                              <div className="text-[10px] font-mono text-slate-500">{r.nip || '-'}</div>
                            </td>
                            <td className="p-2">{getKategoriBadge(r.kategori)}</td>
                            <td className="p-2">
                              <div>{r.jabatan}</div>
                              {r.kelasBinaan && (
                                <span className="text-[10px] font-bold text-blue-700">Kelas {r.kelasBinaan}</span>
                              )}
                            </td>
                            <td className="p-2">{getStatusBadge(r.statusKepegawaian)}</td>
                            <td className="p-2">{r.noHp}</td>
                            <td className="p-2 text-center">
                              {r.isValid ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Siap Impor</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[10px]" title={r.errors.join(', ')}>
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>{r.errors[0]}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setParsedRows([])}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                    >
                      Batal Pratinjau
                    </button>
                    <button
                      type="button"
                      onClick={handleCommitImport}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan Seluruh Data Pegawai ({parsedRows.filter(r => r.isValid).length})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL DETAIL PROFIL PEGAWAI ======================= */}
      {detailPegawai && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setDetailPegawai(null)}
                className="absolute right-4 top-4 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-md ${
                  detailPegawai.jenisKelamin === 'P' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {detailPegawai.namaLengkap.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{detailPegawai.namaLengkap}</h3>
                  <p className="text-xs font-mono text-blue-200 mt-0.5">
                    {detailPegawai.nip ? `NIP. ${detailPegawai.nip}` : 'Pegawai Non-NIP'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {getStatusBadge(detailPegawai.statusKepegawaian)}
                    {getKategoriBadge(detailPegawai.kategori)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Jabatan Resmi</span>
                  <span className="font-extrabold text-slate-900 text-xs">{detailPegawai.jabatan}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Rombel / Mapel</span>
                  <span className="font-extrabold text-blue-900 text-xs">
                    {detailPegawai.kelasBinaan ? `Kelas ${detailPegawai.kelasBinaan}` : (detailPegawai.mataPelajaran || '-')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pangkat / Golongan</span>
                  <span className="font-semibold text-slate-800">{detailPegawai.golonganRuang || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pendidikan</span>
                  <span className="font-semibold text-slate-800">{detailPegawai.pendidikanTerakhir || '-'}</span>
                </div>
              </div>

              {detailPegawai.tugasTambahan && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tugas Tambahan / Pokja:</span>
                  <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 font-bold text-indigo-950">
                    {detailPegawai.tugasTambahan}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">{detailPegawai.noHp}</span>
                  <a
                    href={`https://wa.me/${detailPegawai.noHp.replace(/\D/g, '').replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                  >
                    Kirim WhatsApp
                  </a>
                </div>

                {detailPegawai.email && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{detailPegawai.email}</span>
                  </div>
                )}

                {detailPegawai.alamat && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span className="font-medium">{detailPegawai.alamat}</span>
                  </div>
                )}
              </div>

              {detailPegawai.catatan && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  <span className="font-bold block">Catatan Kepegawaian:</span>
                  {detailPegawai.catatan}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const p = detailPegawai;
                    setDetailPegawai(null);
                    handleOpenEdit(p);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Pegawai</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailPegawai(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
