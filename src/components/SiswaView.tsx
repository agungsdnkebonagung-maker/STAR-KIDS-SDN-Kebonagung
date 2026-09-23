import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student, PelanggaranRecord, RewardRecord, UserRole, Gender, StatusResiko, Agama } from '../types';
import { DAFTAR_KELAS, WALI_KELAS_MAP, WALI_KELAS_NIP_MAP, AGAMA_OPTIONS } from '../data/constants';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  UserCheck, 
  AlertTriangle, 
  Award, 
  Phone, 
  MapPin, 
  Printer, 
  X, 
  CheckCircle2, 
  ShieldAlert,
  ShieldCheck,
  Eye,
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  Sparkles,
  ClipboardPaste,
  HelpCircle,
  Layers,
  Check,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Square,
  MinusSquare,
  CheckCheck,
  Tag,
  ArrowRightLeft,
  ListChecks,
  UserX,
  ChevronDown
} from 'lucide-react';

interface SiswaViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  rewardList: RewardRecord[];
  role: UserRole;
  onAddStudent: (student: Student) => void;
  onBatchAddStudents?: (students: Student[]) => void;
  onUpdateStudent: (nisn: string, updated: Partial<Student>) => void;
  onDeleteStudent: (nisn: string) => void;
  onBatchDeleteStudents?: (nisns: string[]) => void;
  onDeleteAllStudentsInKelas?: (kelas: string) => void;
  onBatchUpdateStudents?: (nisns: string[], updates: Partial<Student>) => void;
  onPrintStudentReport: (student: Student) => void;
}

interface ParsedImportRow {
  id: string;
  nisn: string;
  namaLengkap: string;
  kelas: string;
  jenisKelamin: Gender;
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: Agama | string;
  waliKelas: string;
  nipWaliKelas?: string;
  namaOrangTua: string;
  noHpOrangTua: string;
  alamat: string;
  isValid: boolean;
  errors: string[];
}

export const SiswaView: React.FC<SiswaViewProps> = ({
  students,
  pelanggaranList,
  rewardList,
  role,
  onAddStudent,
  onBatchAddStudents,
  onUpdateStudent,
  onDeleteStudent,
  onBatchDeleteStudents,
  onDeleteAllStudentsInKelas,
  onBatchUpdateStudents,
  onPrintStudentReport
}) => {
  const [selectedKelas, setSelectedKelas] = useState<string>('all');
  const [filterTingkat, setFilterTingkat] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selection & Batch Action States
  const [selectedNisns, setSelectedNisns] = useState<string[]>([]);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isDeleteAllKelasModalOpen, setIsDeleteAllKelasModalOpen] = useState(false);
  const [isBatchMoveModalOpen, setIsBatchMoveModalOpen] = useState(false);
  const [targetMoveKelas, setTargetMoveKelas] = useState<string>('1A');
  const [batchActionNotice, setBatchActionNotice] = useState<string | null>(null);
  
  // Student Details Modal
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  // Student Form Modal (Single Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNisn, setEditingNisn] = useState<string | null>(null);

  // Quick Input & Excel Import Modal
  const [isQuickImportOpen, setIsQuickImportOpen] = useState(false);
  const [quickImportTab, setQuickImportTab] = useState<'upload' | 'paste' | 'multi_row' | 'format_guide'>('upload');
  
  // Parsed rows for Excel / Paste import
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-row quick input state (mini spreadsheet)
  const [multiRows, setMultiRows] = useState<Array<{
    nisn: string;
    namaLengkap: string;
    kelas: string;
    jenisKelamin: Gender;
    tempatLahir: string;
    tanggalLahir: string;
    agama: string;
    namaOrangTua: string;
    noHpOrangTua: string;
    alamat: string;
  }>>([
    { nisn: '', namaLengkap: '', kelas: '1A', jenisKelamin: 'L', tempatLahir: 'Pasuruan', tanggalLahir: '', agama: 'Islam', namaOrangTua: '', noHpOrangTua: '', alamat: '' },
    { nisn: '', namaLengkap: '', kelas: '1A', jenisKelamin: 'P', tempatLahir: 'Pasuruan', tanggalLahir: '', agama: 'Islam', namaOrangTua: '', noHpOrangTua: '', alamat: '' },
    { nisn: '', namaLengkap: '', kelas: '1A', jenisKelamin: 'L', tempatLahir: 'Pasuruan', tanggalLahir: '', agama: 'Islam', namaOrangTua: '', noHpOrangTua: '', alamat: '' }
  ]);

  // Single Form Fields
  const [formNisn, setFormNisn] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formGender, setFormGender] = useState<Gender>('L');
  const [formKelas, setFormKelas] = useState<string>('1A');
  const [formTempatLahir, setFormTempatLahir] = useState('Pasuruan');
  const [formTanggalLahir, setFormTanggalLahir] = useState('');
  const [formAgama, setFormAgama] = useState<Agama | string>('Islam');
  const [formNamaOrtu, setFormNamaOrtu] = useState('');
  const [formNoHpOrtu, setFormNoHpOrtu] = useState('');
  const [formAlamat, setFormAlamat] = useState('');

  // Strict check: Sesuai instruksi: "Menu Data Siswa hanya untuk admin"
  if (role !== 'admin') {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Akses Terbatas: Khusus Administrator
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Menu <strong>Data Siswa</strong> dan pengelolaan biodata murid hanya dapat diakses oleh Bapak/Ibu Guru dan Tim TPPK yang telah login sebagai Admin.
        </p>
      </div>
    );
  }

  // Helper to normalize Class name to official 28 classes
  const normalizeKelas = (raw: string): string => {
    if (!raw) return '1A';
    const cleaned = String(raw).trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
    const match = DAFTAR_KELAS.find(k => k === cleaned);
    return match || cleaned;
  };

  // Helper to validate a parsed row
  const validateRow = (
    nisn: string,
    nama: string,
    kelas: string,
    existingNisns: Set<string>,
    batchNisns: Set<string>
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!nisn.trim()) {
      errors.push('NISN wajib diisi');
    } else if (existingNisns.has(nisn.trim())) {
      errors.push('NISN sudah terdaftar di database');
    } else if (batchNisns.has(nisn.trim())) {
      errors.push('NISN duplikat di dalam file');
    }

    if (!nama.trim()) {
      errors.push('Nama lengkap wajib diisi');
    }

    const normKelas = normalizeKelas(kelas);
    if (!DAFTAR_KELAS.includes(normKelas as any)) {
      errors.push(`Kelas "${kelas}" bukan dari 28 rombel resmi (1A-6E)`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Process raw object rows (from Excel or Paste)
  const processRawRows = (rawList: Record<string, any>[]) => {
    const existingNisns = new Set(students.map(s => s.nisn));
    const batchNisns = new Set<string>();

    const results: ParsedImportRow[] = rawList.map((row, idx) => {
      // Flexible key matcher
      const findVal = (...keys: string[]): string => {
        for (const k of Object.keys(row)) {
          const lowerK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const target of keys) {
            if (lowerK.includes(target.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
              return String(row[k] || '').trim();
            }
          }
        }
        return '';
      };

      const rawNisn = findVal('nisn', 'nis', 'noinduk', 'id') || String(row['NISN'] || row['nisn'] || row[0] || '').trim();
      const rawNama = findVal('nama', 'siswa', 'murid') || String(row['Nama Lengkap'] || row['nama'] || row[1] || '').trim();
      const rawKelas = findVal('kelas', 'rombel') || String(row['Kelas'] || row['kelas'] || row[2] || '1A').trim();
      const rawGender = findVal('jeniskelamin', 'jk', 'gender', 'lp', 'sex') || String(row['Jenis Kelamin'] || row['jk'] || row[3] || 'L').trim();
      
      const rawTempatLahir = findVal('tempatlahir', 'tempat_lahir', 'kotalahir', 'tempat') || String(row['Tempat Lahir'] || row['tempat_lahir'] || row[4] || '').trim();
      const rawTanggalLahir = findVal('tanggallahir', 'tanggal_lahir', 'tgllahir', 'tgl_lahir', 'tgl') || String(row['Tanggal Lahir'] || row['tanggal_lahir'] || row[5] || '').trim();
      const rawAgama = findVal('agama', 'religion', 'kepercayaan') || String(row['Agama'] || row['agama'] || row[6] || '').trim();
      
      const rawNamaOrtu = findVal('orangtua', 'ortu', 'wali', 'ayah', 'ibu') || String(row['Nama Orang Tua'] || row['ortu'] || row[7] || '').trim();
      const rawNoHp = findVal('nohp', 'hp', 'wa', 'telepon', 'kontak') || String(row['No HP Orang Tua'] || row['nohp'] || row[8] || '').trim();
      const rawAlamat = findVal('alamat', 'domisili', 'tempattinggal') || String(row['Alamat'] || row['alamat'] || row[9] || '').trim();

      const normKelas = normalizeKelas(rawKelas);
      const gender: Gender = (/^p/i.test(rawGender) || rawGender.toLowerCase().includes('perempuan')) ? 'P' : 'L';
      const wali = WALI_KELAS_MAP[normKelas] || 'Wali Kelas SDN Kebonagung';
      const nip = WALI_KELAS_NIP_MAP[normKelas] || '';

      const validation = validateRow(rawNisn, rawNama, normKelas, existingNisns, batchNisns);
      if (rawNisn) batchNisns.add(rawNisn);

      return {
        id: `ROW-${idx + 1}-${Date.now().toString().slice(-4)}`,
        nisn: rawNisn,
        namaLengkap: rawNama,
        kelas: normKelas,
        jenisKelamin: gender,
        tempatLahir: rawTempatLahir || 'Pasuruan',
        tanggalLahir: rawTanggalLahir || '',
        agama: (rawAgama as Agama) || 'Islam',
        waliKelas: wali,
        nipWaliKelas: nip,
        namaOrangTua: rawNamaOrtu || '-',
        noHpOrangTua: rawNoHp || '-',
        alamat: rawAlamat || 'Kota Pasuruan',
        isValid: validation.isValid,
        errors: validation.errors
      };
    }).filter(r => r.nisn || r.namaLengkap); // omit blank lines

    setParsedRows(results);
    if (results.length === 0) {
      setImportNotice({ type: 'error', message: 'Tidak ada baris data siswa yang valid terbaca dari file/teks.' });
    } else {
      const validCount = results.filter(r => r.isValid).length;
      setImportNotice({ 
        type: 'success', 
        message: `Berhasil memproses ${results.length} baris data siswa (${validCount} valid & siap disimpan).` 
      });
    }
  };

  // Excel File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setImportNotice(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
        processRawRows(rawJson);
      } catch (err) {
        setImportNotice({ 
          type: 'error', 
          message: 'Gagal memproses file Excel. Pastikan format file .xlsx / .xls / .csv sesuai dan tidak rusak.' 
        });
      } finally {
        setIsProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Smart Paste Handler
  const handleParsePaste = () => {
    if (!pasteText.trim()) {
      setImportNotice({ type: 'error', message: 'Silakan paste (Ctrl+V) tabel data siswa dari Excel atau Canva Sheet terlebih dahulu.' });
      return;
    }

    const lines = pasteText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return;

    // Check if first line is a header
    const firstCols = lines[0].split(/\t|,|;/).map(c => c.trim().replace(/^"|"$/g, ''));
    const hasHeader = firstCols.some(c => /nisn|nama|kelas|jk|gender|ortu|wali|tempat|tanggal|agama/i.test(c));

    const dataLines = hasHeader ? lines.slice(1) : lines;
    const rawList = dataLines.map(line => {
      let cols = line.split('\t');
      if (cols.length < 2) cols = line.split(';');
      if (cols.length < 2) cols = line.split(',');
      cols = cols.map(c => c.trim().replace(/^"|"$/g, ''));

      // If 10 columns: NISN, Nama, Kelas, JK, Tempat Lahir, Tanggal Lahir, Agama, Nama Ortu, HP, Alamat
      if (cols.length >= 8) {
        return {
          'NISN': cols[0] || '',
          'Nama Lengkap': cols[1] || '',
          'Kelas': cols[2] || '1A',
          'Jenis Kelamin': cols[3] || 'L',
          'Tempat Lahir': cols[4] || 'Pasuruan',
          'Tanggal Lahir': cols[5] || '',
          'Agama': cols[6] || 'Islam',
          'Nama Orang Tua': cols[7] || '',
          'No HP Orang Tua': cols[8] || '',
          'Alamat': cols[9] || ''
        };
      }

      // 7 columns fallback
      return {
        'NISN': cols[0] || '',
        'Nama Lengkap': cols[1] || '',
        'Kelas': cols[2] || '1A',
        'Jenis Kelamin': cols[3] || 'L',
        'Nama Orang Tua': cols[4] || '',
        'No HP Orang Tua': cols[5] || '',
        'Alamat': cols[6] || ''
      };
    });

    processRawRows(rawList);
  };

  // Save parsed rows to database in bulk
  const handleSaveImportedStudents = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setImportNotice({ type: 'error', message: 'Tidak ada baris data siswa yang valid untuk disimpan. Mohon perbaiki baris yang bermasalah.' });
      return;
    }

    const newStudents: Student[] = validRows.map(r => ({
      nisn: r.nisn,
      namaLengkap: r.namaLengkap,
      jenisKelamin: r.jenisKelamin,
      kelas: r.kelas,
      tempatLahir: r.tempatLahir || 'Pasuruan',
      tanggalLahir: r.tanggalLahir || '2016-05-10',
      agama: (r.agama as Agama) || 'Islam',
      waliKelas: WALI_KELAS_MAP[r.kelas] || r.waliKelas || 'Wali Kelas SDN Kebonagung',
      nipWaliKelas: r.nipWaliKelas || WALI_KELAS_NIP_MAP[r.kelas] || '',
      namaOrangTua: r.namaOrangTua,
      noHpOrangTua: r.noHpOrangTua,
      alamat: r.alamat,
      totalPoinPelanggaran: 0,
      totalPoinReward: 0,
      statusResiko: 'Aman'
    }));

    if (onBatchAddStudents) {
      onBatchAddStudents(newStudents);
    } else {
      newStudents.forEach(st => onAddStudent(st));
    }

    setIsQuickImportOpen(false);
    setParsedRows([]);
    setPasteText('');
    setImportNotice(null);
  };

  // Save Multi-Row Grid
  const handleSaveMultiRows = () => {
    const filledRows = multiRows.filter(r => r.nisn.trim() && r.namaLengkap.trim());
    if (filledRows.length === 0) {
      setImportNotice({ type: 'error', message: 'Harap lengkapi setidaknya 1 baris NISN dan Nama Siswa.' });
      return;
    }

    const existingNisns = new Set(students.map(s => s.nisn));
    const duplicate = filledRows.find(r => existingNisns.has(r.nisn.trim()));
    if (duplicate) {
      setImportNotice({ type: 'error', message: `NISN ${duplicate.nisn} sudah ada di database!` });
      return;
    }

    const newStudents: Student[] = filledRows.map(r => ({
      nisn: r.nisn.trim(),
      namaLengkap: r.namaLengkap.trim(),
      jenisKelamin: r.jenisKelamin,
      kelas: r.kelas,
      tempatLahir: r.tempatLahir.trim() || 'Pasuruan',
      tanggalLahir: r.tanggalLahir || '2016-05-10',
      agama: (r.agama as Agama) || 'Islam',
      waliKelas: WALI_KELAS_MAP[r.kelas] || 'Wali Kelas SDN Kebonagung',
      nipWaliKelas: WALI_KELAS_NIP_MAP[r.kelas] || '',
      namaOrangTua: r.namaOrangTua.trim() || '-',
      noHpOrangTua: r.noHpOrangTua.trim() || '-',
      alamat: r.alamat.trim() || 'Kota Pasuruan',
      totalPoinPelanggaran: 0,
      totalPoinReward: 0,
      statusResiko: 'Aman'
    }));

    if (onBatchAddStudents) {
      onBatchAddStudents(newStudents);
    } else {
      newStudents.forEach(st => onAddStudent(st));
    }

    setIsQuickImportOpen(false);
    setImportNotice(null);
  };

  // Download Official Excel Template (.xlsx)
  const downloadExcelTemplate = () => {
    const templateData = [
      {
        'NISN': '0123456001',
        'Nama Lengkap': 'Ahmad Rayhan Putra',
        'Kelas': '1A',
        'Jenis Kelamin': 'L',
        'Tempat Lahir': 'Pasuruan',
        'Tanggal Lahir': '2019-04-12',
        'Agama': 'Islam',
        'Nama Orang Tua': 'Bambang Sudarsono',
        'No HP Orang Tua': '081234567890',
        'Alamat': 'Jl. Panglima Sudirman No. 12, Kebonagung'
      },
      {
        'NISN': '0123456002',
        'Nama Lengkap': 'Anindya Kirana Putri',
        'Kelas': '1B',
        'Jenis Kelamin': 'P',
        'Tempat Lahir': 'Pasuruan',
        'Tanggal Lahir': '2019-07-25',
        'Agama': 'Islam',
        'Nama Orang Tua': 'Suryo Wibowo',
        'No HP Orang Tua': '081398765432',
        'Alamat': 'Perum Kebonagung Asri Blok C-04'
      },
      {
        'NISN': '0123456003',
        'Nama Lengkap': 'Bagus Wahyu Pratama',
        'Kelas': '2A',
        'Jenis Kelamin': 'L',
        'Tempat Lahir': 'Pasuruan',
        'Tanggal Lahir': '2018-02-18',
        'Agama': 'Islam',
        'Nama Orang Tua': 'Wahyu Hidayat',
        'No HP Orang Tua': '085712345678',
        'Alamat': 'Jl. Diponegoro Gang 2 No. 8, Pasuruan'
      },
      {
        'NISN': '0123456004',
        'Nama Lengkap': 'Cantika Putri Rahayu',
        'Kelas': '3A',
        'Jenis Kelamin': 'P',
        'Tempat Lahir': 'Pasuruan',
        'Tanggal Lahir': '2017-09-05',
        'Agama': 'Kristen',
        'Nama Orang Tua': 'Rahmat Hidayat',
        'No HP Orang Tua': '082133445566',
        'Alamat': 'Jl. Erlangga No. 45, Kebonagung'
      },
      {
        'NISN': '0123456005',
        'Nama Lengkap': 'Dimas Satria Nugraha',
        'Kelas': '4C',
        'Jenis Kelamin': 'L',
        'Tempat Lahir': 'Malang',
        'Tanggal Lahir': '2016-03-21',
        'Agama': 'Islam',
        'Nama Orang Tua': 'Nugroho Santoso',
        'No HP Orang Tua': '081288997766',
        'Alamat': 'Jl. KH. Wachid Hasyim No. 19'
      },
      {
        'NISN': '0123456006',
        'Nama Lengkap': 'Fahira Zahra Aulia',
        'Kelas': '5B',
        'Jenis Kelamin': 'P',
        'Tempat Lahir': 'Pasuruan',
        'Tanggal Lahir': '2015-11-14',
        'Agama': 'Islam',
        'Nama Orang Tua': 'Farid Alamsyah',
        'No HP Orang Tua': '085811223344',
        'Alamat': 'Jl. Veteran Gang Melati No. 3'
      },
      {
        'NISN': '0123456007',
        'Nama Lengkap': 'Gilang Ramadhan',
        'Kelas': '6E',
        'Jenis Kelamin': 'L',
        'Tempat Lahir': 'Pasuruan',
        'Tanggal Lahir': '2014-08-30',
        'Agama': 'Islam',
        'Nama Orang Tua': 'H. Moch. Taufik',
        'No HP Orang Tua': '087755667788',
        'Alamat': 'Jl. Slagah No. 22, Kebonagung'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 14 }, // NISN
      { wch: 28 }, // Nama Lengkap
      { wch: 10 }, // Kelas
      { wch: 14 }, // Jenis Kelamin
      { wch: 18 }, // Tempat Lahir
      { wch: 15 }, // Tanggal Lahir
      { wch: 12 }, // Agama
      { wch: 24 }, // Nama Orang Tua
      { wch: 18 }, // No HP Orang Tua
      { wch: 38 }, // Alamat
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DATA_SISWA');

    // 28 Classes reference sheet for teacher's guide
    const kelasRefData = DAFTAR_KELAS.map(k => ({
      'Kode Rombel (Kelas)': k,
      'Tingkat': `Kelas ${k[0]}`,
      'Wali Kelas Resmi': WALI_KELAS_MAP[k] || '-',
      'NIP Kepegawaian Wali Kelas': WALI_KELAS_NIP_MAP[k] || '-'
    }));
    const sheetKelas = XLSX.utils.json_to_sheet(kelasRefData);
    sheetKelas['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 30 }, { wch: 26 }];
    XLSX.utils.book_append_sheet(workbook, sheetKelas, 'DAFTAR_28_ROMBEL');

    XLSX.writeFile(workbook, 'Template_Input_Siswa_SDN_Kebonagung_28Kelas.xlsx');
  };

  // Download CSV Template
  const downloadCsvTemplate = () => {
    const headers = ['NISN', 'Nama Lengkap', 'Kelas', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Agama', 'Nama Orang Tua', 'No HP Orang Tua', 'Alamat'];
    const sampleRows = [
      ['0123456001', 'Ahmad Rayhan Putra', '1A', 'L', 'Pasuruan', '2019-04-12', 'Islam', 'Bambang Sudarsono', '081234567890', 'Jl. Panglima Sudirman No. 12'],
      ['0123456002', 'Anindya Kirana Putri', '1B', 'P', 'Pasuruan', '2019-07-25', 'Islam', 'Suryo Wibowo', '081398765432', 'Perum Kebonagung Asri C-04'],
      ['0123456003', 'Bagus Wahyu Pratama', '2A', 'L', 'Pasuruan', '2018-02-18', 'Islam', 'Wahyu Hidayat', '085712345678', 'Jl. Diponegoro Gang 2 No. 8'],
      ['0123456004', 'Cantika Putri Rahayu', '3A', 'P', 'Pasuruan', '2017-09-05', 'Kristen', 'Rahmat Hidayat', '082133445566', 'Jl. Erlangga No. 45'],
      ['0123456005', 'Dimas Satria Nugraha', '4C', 'L', 'Malang', '2016-03-21', 'Islam', 'Nugroho Santoso', '081288997766', 'Jl. KH. Wachid Hasyim No. 19'],
      ['0123456006', 'Fahira Zahra Aulia', '5B', 'P', 'Pasuruan', '2015-11-14', 'Islam', 'Farid Alamsyah', '085811223344', 'Jl. Veteran No. 3'],
      ['0123456007', 'Gilang Ramadhan', '6E', 'L', 'Pasuruan', '2014-08-30', 'Islam', 'H. Moch. Taufik', '087755667788', 'Jl. Slagah No. 22']
    ];
    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Input_Siswa_SDN_Kebonagung_28Kelas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Single Create Modal
  const handleOpenCreate = () => {
    setEditingNisn(null);
    setFormNisn('');
    setFormNama('');
    setFormGender('L');
    setFormKelas('1A');
    setFormTempatLahir('Pasuruan');
    setFormTanggalLahir('');
    setFormAgama('Islam');
    setFormNamaOrtu('');
    setFormNoHpOrtu('');
    setFormAlamat('');
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student: Student) => {
    setEditingNisn(student.nisn);
    setFormNisn(student.nisn);
    setFormNama(student.namaLengkap);
    setFormGender(student.jenisKelamin);
    setFormKelas(student.kelas);
    setFormTempatLahir(student.tempatLahir || 'Pasuruan');
    setFormTanggalLahir(student.tanggalLahir || '');
    setFormAgama(student.agama || 'Islam');
    setFormNamaOrtu(student.namaOrangTua);
    setFormNoHpOrtu(student.noHpOrangTua);
    setFormAlamat(student.alamat || '');
    setIsFormOpen(true);
  };

  // Single Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wali = WALI_KELAS_MAP[formKelas] || 'Wali Kelas SDN Kebonagung';
    const nip = WALI_KELAS_NIP_MAP[formKelas] || '';

    if (editingNisn) {
      onUpdateStudent(editingNisn, {
        namaLengkap: formNama,
        jenisKelamin: formGender,
        kelas: formKelas,
        tempatLahir: formTempatLahir.trim() || 'Pasuruan',
        tanggalLahir: formTanggalLahir,
        agama: formAgama as Agama,
        waliKelas: wali,
        nipWaliKelas: nip,
        namaOrangTua: formNamaOrtu,
        noHpOrangTua: formNoHpOrtu,
        alamat: formAlamat
      });
    } else {
      if (students.some(s => s.nisn === formNisn.trim())) {
        alert(`NISN ${formNisn} sudah terdaftar di database!`);
        return;
      }

      onAddStudent({
        nisn: formNisn.trim(),
        namaLengkap: formNama.trim(),
        jenisKelamin: formGender,
        kelas: formKelas,
        tempatLahir: formTempatLahir.trim() || 'Pasuruan',
        tanggalLahir: formTanggalLahir,
        agama: formAgama as Agama,
        waliKelas: wali,
        nipWaliKelas: nip,
        namaOrangTua: formNamaOrtu.trim() || '-',
        noHpOrangTua: formNoHpOrtu.trim() || '-',
        alamat: formAlamat.trim() || 'Kota Pasuruan',
        totalPoinPelanggaran: 0,
        totalPoinReward: 0,
        statusResiko: 'Aman'
      });
    }
    setIsFormOpen(false);
  };

  // Group 28 classes by Grade Level for intuitive selection
  const kelasByTingkat = useMemo(() => {
    return {
      '1': DAFTAR_KELAS.filter(k => k.startsWith('1')),
      '2': DAFTAR_KELAS.filter(k => k.startsWith('2')),
      '3': DAFTAR_KELAS.filter(k => k.startsWith('3')),
      '4': DAFTAR_KELAS.filter(k => k.startsWith('4')),
      '5': DAFTAR_KELAS.filter(k => k.startsWith('5')),
      '6': DAFTAR_KELAS.filter(k => k.startsWith('6'))
    };
  }, []);

  // Filtered Students based on 28 classes and search term
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Tingkat filter (Semua, Kelas 1, Kelas 2, ...)
      const matchTingkat = filterTingkat === 'all' || s.kelas.startsWith(filterTingkat);
      // Specific Rombel filter
      const matchKelas = selectedKelas === 'all' || s.kelas === selectedKelas;
      // Search term
      const matchSearch = 
        s.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nisn.includes(searchTerm) ||
        s.namaOrangTua.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTingkat && matchKelas && matchSearch;
    });
  }, [students, filterTingkat, selectedKelas, searchTerm]);

  // Violations & Rewards for detail modal
  const studentViolations = useMemo(() => {
    if (!detailStudent) return [];
    return pelanggaranList.filter(p => p.nisn === detailStudent.nisn);
  }, [pelanggaranList, detailStudent]);

  const studentRewards = useMemo(() => {
    if (!detailStudent) return [];
    return rewardList.filter(r => r.nisn === detailStudent.nisn);
  }, [rewardList, detailStudent]);

  // Set of selected NISNs for O(1) lookups
  const selectedNisnsSet = useMemo(() => new Set(selectedNisns), [selectedNisns]);

  // Selected students objects
  const selectedStudents = useMemo(() => {
    return students.filter(s => selectedNisnsSet.has(s.nisn));
  }, [students, selectedNisnsSet]);

  // Classes breakdown of selected students
  const selectedKelasBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    selectedStudents.forEach(s => {
      map[s.kelas] = (map[s.kelas] || 0) + 1;
    });
    return Object.entries(map).map(([kelas, count]) => `Kelas ${kelas} (${count})`).join(', ');
  }, [selectedStudents]);

  // Toggle single student selection
  const handleToggleSelectStudent = (nisn: string) => {
    setSelectedNisns(prev => {
      if (prev.includes(nisn)) {
        return prev.filter(id => id !== nisn);
      } else {
        return [...prev, nisn];
      }
    });
  };

  // Select all in current view / current class
  const handleSelectAllFiltered = () => {
    const currentFilteredNisns = filteredStudents.map(s => s.nisn);
    const allSelected = currentFilteredNisns.length > 0 && currentFilteredNisns.every(nisn => selectedNisnsSet.has(nisn));
    if (allSelected) {
      // Deselect all filtered
      setSelectedNisns(prev => prev.filter(id => !currentFilteredNisns.includes(id)));
    } else {
      // Add all filtered to selection
      const union = new Set([...selectedNisns, ...currentFilteredNisns]);
      setSelectedNisns(Array.from(union));
    }
  };

  // Quick select actions for specific class
  const handleSelectByCriteria = (criteria: 'all_class' | 'berisiko' | 'waspada' | 'aman' | 'laki' | 'perempuan' | 'clear') => {
    if (criteria === 'clear') {
      setSelectedNisns([]);
      return;
    }

    const pool = selectedKelas !== 'all' 
      ? students.filter(s => s.kelas === selectedKelas) 
      : filteredStudents;

    let targetNisns: string[] = [];
    if (criteria === 'all_class') {
      targetNisns = pool.map(s => s.nisn);
    } else if (criteria === 'berisiko') {
      targetNisns = pool.filter(s => s.statusResiko === 'Berisiko').map(s => s.nisn);
    } else if (criteria === 'waspada') {
      targetNisns = pool.filter(s => s.statusResiko === 'Waspada').map(s => s.nisn);
    } else if (criteria === 'aman') {
      targetNisns = pool.filter(s => s.statusResiko === 'Aman').map(s => s.nisn);
    } else if (criteria === 'laki') {
      targetNisns = pool.filter(s => s.jenisKelamin === 'L').map(s => s.nisn);
    } else if (criteria === 'perempuan') {
      targetNisns = pool.filter(s => s.jenisKelamin === 'P').map(s => s.nisn);
    }

    const union = new Set([...selectedNisns, ...targetNisns]);
    setSelectedNisns(Array.from(union));
  };

  // Batch delete execution
  const handleConfirmBatchDelete = () => {
    if (selectedNisns.length === 0) return;
    const count = selectedNisns.length;

    if (onBatchDeleteStudents) {
      onBatchDeleteStudents(selectedNisns);
    } else {
      selectedNisns.forEach(nisn => onDeleteStudent(nisn));
    }

    setSelectedNisns([]);
    setIsBatchDeleteModalOpen(false);
    setBatchActionNotice(`Berhasil menghapus sebagian (${count} siswa terpilih) beserta riwayatnya.`);
    setTimeout(() => setBatchActionNotice(null), 5000);
  };

  // Delete all in class or school execution
  const handleConfirmDeleteAllInKelas = () => {
    const targets = selectedKelas === 'all' ? students : students.filter(s => s.kelas === selectedKelas);
    const count = targets.length;

    if (onDeleteAllStudentsInKelas) {
      onDeleteAllStudentsInKelas(selectedKelas);
    } else {
      targets.forEach(s => onDeleteStudent(s.nisn));
    }

    setSelectedNisns([]);
    setIsDeleteAllKelasModalOpen(false);
    const notice = selectedKelas === 'all'
      ? `Berhasil menghapus seluruh data siswa sekolah (${count} siswa).`
      : `Berhasil menghapus seluruh data siswa (${count} siswa) di Kelas ${selectedKelas}.`;
    setBatchActionNotice(notice);
    setTimeout(() => setBatchActionNotice(null), 5000);
  };

  // Batch status update execution
  const handleBatchUpdateStatus = (newStatus: StatusResiko) => {
    if (selectedNisns.length === 0) return;
    const count = selectedNisns.length;

    if (onBatchUpdateStudents) {
      onBatchUpdateStudents(selectedNisns, { statusResiko: newStatus });
    } else {
      selectedNisns.forEach(nisn => onUpdateStudent(nisn, { statusResiko: newStatus }));
    }

    setBatchActionNotice(`Berhasil menandai ${count} siswa dengan status "${newStatus}".`);
    setTimeout(() => setBatchActionNotice(null), 5000);
  };

  // Batch move class execution
  const handleConfirmBatchMove = () => {
    if (selectedNisns.length === 0) return;
    const count = selectedNisns.length;
    const wali = WALI_KELAS_MAP[targetMoveKelas] || 'Wali Kelas SDN Kebonagung';
    const nip = WALI_KELAS_NIP_MAP[targetMoveKelas] || '';

    if (onBatchUpdateStudents) {
      onBatchUpdateStudents(selectedNisns, {
        kelas: targetMoveKelas,
        waliKelas: wali,
        nipWaliKelas: nip
      });
    } else {
      selectedNisns.forEach(nisn => onUpdateStudent(nisn, {
        kelas: targetMoveKelas,
        waliKelas: wali,
        nipWaliKelas: nip
      }));
    }

    setIsBatchMoveModalOpen(false);
    setSelectedNisns([]);
    setBatchActionNotice(`Berhasil memindahkan ${count} siswa ke Rombel Kelas ${targetMoveKelas}.`);
    setTimeout(() => setBatchActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-amber-50/40 rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-900 text-xs font-black border border-blue-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Manajemen 28 Rombel Kelas • SDN Kebonagung Kota Pasuruan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Data Induk Siswa & Rapor Karakter</span>
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Pengelolaan biodata murid 28 rombel (1A–6E), kontak wali murid, TTL, Agama, NIP Wali Kelas, dan import cepat berbasis spreadsheet.
          </p>
        </div>

        {/* Action Buttons: Input Cepat, Unduh Template, dan Tambah Manual */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Unduh Template Excel */}
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md hover:scale-102"
            title="Unduh Format Excel Resmi (.xlsx)"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Format Excel (.xlsx)</span>
          </button>

          {/* Pusat Input Cepat & Import */}
          <button
            type="button"
            onClick={() => {
              setImportNotice(null);
              setIsQuickImportOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-sm hover:shadow-md hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Input Cepat & Import Excel</span>
          </button>

          {/* Tambah Satuan */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 rounded-xl text-xs font-black shadow-sm hover:shadow-md hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>+ Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Selector 28 Rombongan Belajar (Kelas 1A s/d 6E) */}
      <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
        
        {/* Tingkat Tabs (Semua, Kelas 1, Kelas 2, ...) */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-black text-slate-800">
              Filter Tingkat Kelas:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => {
                setFilterTingkat('all');
                setSelectedKelas('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTingkat === 'all'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Tingkat ({students.length})
            </button>
            {(['1', '2', '3', '4', '5', '6'] as const).map(tingkat => {
              const countInTingkat = students.filter(s => s.kelas.startsWith(tingkat)).length;
              return (
                <button
                  key={tingkat}
                  type="button"
                  onClick={() => {
                    setFilterTingkat(tingkat);
                    setSelectedKelas('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTingkat === tingkat
                      ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs font-black'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tingkat {tingkat} ({countInTingkat})
                </button>
              );
            })}
          </div>
        </div>

        {/* 28 Rombel Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Pilih Rombel Spesifik ({filterTingkat === 'all' ? '28 Rombel Aktif' : `Rombel Kelas ${filterTingkat}`}):
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Terpilih: <strong className="text-blue-900">{filteredStudents.length} Siswa</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedKelas('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedKelas === 'all'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Rombel
            </button>

            {DAFTAR_KELAS
              .filter(k => filterTingkat === 'all' || k.startsWith(filterTingkat))
              .map(k => {
                const count = students.filter(s => s.kelas === k).length;
                const isSelected = selectedKelas === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSelectedKelas(k)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{k}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Search Field */}
        <div className="pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama lengkap murid, NISN, wali kelas, atau nama orang tua..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Menu Seleksi Siswa Pada Masing-Masing Kelas & Aksi Cepat */}
        <div className="pt-2">
          <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <ListChecks className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Menu Memilih Siswa</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-black">
                      {selectedKelas === 'all' ? 'Semua 28 Rombel' : `Kelas ${selectedKelas}`}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tandai siswa dalam rombel ini untuk mengubah status karakter atau menghapus data secara bersamaan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 self-start sm:self-auto">
                <span>Ditandai:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black transition-colors ${
                  selectedNisns.length > 0 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                }`}>
                  {selectedNisns.length} Siswa
                </span>
              </div>
            </div>

            {/* Quick Selection Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200/70">
              <span className="text-[10.5px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                Tandai Cepat:
              </span>
              
              <button
                type="button"
                onClick={() => handleSelectByCriteria('all_class')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-blue-50 text-blue-900 border border-slate-200 hover:border-blue-300 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                title="Tandai semua siswa yang ada di kelas atau filter ini"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Semua Siswa {selectedKelas !== 'all' ? `Kelas ${selectedKelas}` : 'Tampil'} ({selectedKelas !== 'all' ? students.filter(s => s.kelas === selectedKelas).length : filteredStudents.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectByCriteria('berisiko')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-rose-50 text-rose-800 border border-slate-200 hover:border-rose-300 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Berisiko</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectByCriteria('waspada')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-amber-50 text-amber-800 border border-slate-200 hover:border-amber-300 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Waspada</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectByCriteria('laki')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-sky-50 text-sky-800 border border-slate-200 hover:border-sky-300 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Laki-laki (L)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectByCriteria('perempuan')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-pink-50 text-pink-800 border border-slate-200 hover:border-pink-300 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Perempuan (P)</span>
              </button>

              {selectedNisns.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleSelectByCriteria('clear')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all flex items-center gap-1 cursor-pointer ml-auto"
                >
                  <X className="w-3.5 h-3.5 text-rose-600" />
                  <span>Batal Tandai ({selectedNisns.length})</span>
                </button>
              )}
            </div>

            {/* Menu Point Hapus Data Kelas (Sebagian atau Seluruhnya) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="font-extrabold text-slate-800">Menu Hapus Data Kelas:</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">Pilih hapus sebagian (siswa terpilih) atau seluruh data kelas</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Hapus Sebagian */}
                <button
                  type="button"
                  disabled={selectedNisns.length === 0}
                  onClick={() => setIsBatchDeleteModalOpen(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedNisns.length > 0
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title={selectedNisns.length > 0 ? "Hapus siswa yang ditandai" : "Tandai minimal 1 siswa untuk menghapus sebagian"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Sebagian ({selectedNisns.length} Siswa Terpilih)</span>
                </button>

                {/* Hapus Seluruhnya */}
                <button
                  type="button"
                  onClick={() => setIsDeleteAllKelasModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-all flex items-center gap-1.5 cursor-pointer"
                  title={`Hapus seluruh data siswa di ${selectedKelas !== 'all' ? `Kelas ${selectedKelas}` : 'Semua Rombel'}`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 hover:text-white" />
                  <span>Hapus Seluruh Data {selectedKelas !== 'all' ? `Kelas ${selectedKelas}` : 'Sekolah'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Action Notification Toast */}
      {batchActionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{batchActionNotice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setBatchActionNotice(null)} 
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bilah Aktifitas Bersamaan (Sticky Batch Toolbar) */}
      {selectedNisns.length > 0 && (
        <div className="sticky top-2 z-20 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-4 shadow-xl border border-indigo-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <CheckCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">
                  {selectedNisns.length} Siswa Terpilih / Ditandai
                </h4>
                <span className="bg-blue-400/20 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  Aktifitas Bersamaan
                </span>
              </div>
              <p className="text-[11px] text-slate-300 max-w-xl truncate mt-0.5">
                {selectedKelasBreakdown || 'Pilihan aktif dari berbagai rombel'}
              </p>
            </div>
          </div>

          {/* Batch activities group */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Tandai Status Karakter */}
            <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/15">
              <span className="text-[10px] font-bold text-slate-300 px-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-300" />
                Tandai Status:
              </span>
              <button
                type="button"
                onClick={() => handleBatchUpdateStatus('Aman')}
                title="Tandai Status Aman untuk semua siswa terpilih"
                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-600/80 hover:bg-emerald-600 text-white transition-all cursor-pointer"
              >
                Aman
              </button>
              <button
                type="button"
                onClick={() => handleBatchUpdateStatus('Waspada')}
                title="Tandai Status Waspada untuk semua siswa terpilih"
                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-600/80 hover:bg-amber-600 text-white transition-all cursor-pointer"
              >
                Waspada
              </button>
              <button
                type="button"
                onClick={() => handleBatchUpdateStatus('Berisiko')}
                title="Tandai Status Berisiko untuk semua siswa terpilih"
                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-600/80 hover:bg-rose-600 text-white transition-all cursor-pointer"
              >
                Berisiko
              </button>
            </div>

            {/* Pindahkan Rombel Bersamaan */}
            <button
              type="button"
              onClick={() => setIsBatchMoveModalOpen(true)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Pindahkan siswa terpilih ke kelas lain sekaligus"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-200" />
              <span>Pindahkan Kelas</span>
            </button>

            {/* Hapus Bersamaan */}
            <button
              type="button"
              onClick={() => setIsBatchDeleteModalOpen(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
              title="Hapus seluruh data siswa yang ditandai secara bersamaan"
            >
              <Trash2 className="w-4 h-4 text-white" />
              <span>Hapus Bersamaan ({selectedNisns.length})</span>
            </button>

            {/* Batal */}
            <button
              type="button"
              onClick={() => setSelectedNisns([])}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              title="Batal Memilih Semua"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                {/* Master Checkbox Column */}
                <th className="py-3 px-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    aria-label="Pilih Semua Siswa yang Tampil"
                    checked={
                      filteredStudents.length > 0 &&
                      filteredStudents.every(s => selectedNisnsSet.has(s.nisn))
                    }
                    ref={el => {
                      if (el) {
                        const someSelected = filteredStudents.some(s => selectedNisnsSet.has(s.nisn));
                        const allSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedNisnsSet.has(s.nisn));
                        el.indeterminate = someSelected && !allSelected;
                      }
                    }}
                    onChange={handleSelectAllFiltered}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Nama Lengkap & Gender</th>
                <th className="py-3 px-4">Kelas & Wali Kelas</th>
                <th className="py-3 px-4">Orang Tua / Kontak</th>
                <th className="py-3 px-4">Poin Disiplin</th>
                <th className="py-3 px-4">Status Karakter</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold">Tidak ada data siswa pada rombel atau filter ini.</p>
                    <p className="text-[11px] mt-1 text-slate-400">Gunakan tombol <strong>Input Cepat & Import Excel</strong> untuk memasukkan data siswa dengan cepat.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedNisnsSet.has(s.nisn);
                  return (
                    <tr 
                      key={s.nisn} 
                      className={`transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/80 border-l-4 border-blue-600 font-medium' 
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Row Checkbox Column */}
                      <td className="py-3.5 px-3.5 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Pilih siswa ${s.namaLengkap}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelectStudent(s.nisn)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{s.nisn}</span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9px] font-black uppercase">
                              Dipilih
                            </span>
                          )}
                        </div>
                      </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{s.namaLengkap}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          s.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {s.jenisKelamin === 'L' ? 'L' : 'P'}
                        </span>
                        {s.agama && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {s.agama}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        TTL: <span className="font-medium text-slate-700">{s.tempatLahir || 'Pasuruan'}, {s.tanggalLahir || '-'}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 truncate max-w-xs mt-0.5">
                        {s.alamat || 'Pasuruan'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Kelas {s.kelas}
                      </span>
                      <div className="text-[11px] font-medium text-slate-700 mt-1">
                        Wali: {s.waliKelas}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        NIP: {s.nipWaliKelas || WALI_KELAS_NIP_MAP[s.kelas] || '-'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.namaOrangTua}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{s.noHpOrangTua}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {s.totalPoinPelanggaran} Melanggar
                        </span>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          +{s.totalPoinReward} Reward
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        s.statusResiko === 'Berisiko' ? 'bg-rose-100 text-rose-800' :
                        s.statusResiko === 'Waspada' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {s.statusResiko === 'Berisiko' ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        <span>{s.statusResiko}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Detail Profil & Riwayat */}
                        <button
                          type="button"
                          onClick={() => setDetailStudent(s)}
                          title="Lihat Profil Karakter & Riwayat Lengkap"
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Cetak Raport Karakter */}
                        <button
                          type="button"
                          onClick={() => onPrintStudentReport(s)}
                          title="Cetak Lembar Rekap Karakter"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Edit Biodata */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          title="Edit Biodata Siswa"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Hapus */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Yakin ingin menghapus siswa ${s.namaLengkap} (${s.nisn})? Data pelanggaran, reward, dan absensinya juga akan dihapus.`)) {
                              onDeleteStudent(s.nisn);
                            }
                          }}
                          title="Hapus Siswa"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PUSAT INPUT CEPAT & IMPORT DATA SISWA (EXCEL / PASTE / MULTI-ROW) */}
      {/* ========================================================================= */}
      {isQuickImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight">
                    Pusat Input Cepat Data Siswa & Import Excel
                  </h2>
                  <p className="text-xs text-blue-200">
                    Mendukung 28 rombel resmi (1A–6E) dengan validasi otomatis & unduhan template
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickImportOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs Modal */}
            <div className="flex items-center gap-2 p-3 bg-slate-100 border-b border-slate-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => { setQuickImportTab('upload'); setImportNotice(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  quickImportTab === 'upload' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4 text-blue-700" />
                <span>1. Upload File Excel (.xlsx / .csv)</span>
              </button>

              <button
                type="button"
                onClick={() => { setQuickImportTab('paste'); setImportNotice(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  quickImportTab === 'paste' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardPaste className="w-4 h-4 text-purple-700" />
                <span>2. Copy-Paste dari Spreadsheet</span>
              </button>

              <button
                type="button"
                onClick={() => { setQuickImportTab('multi_row'); setImportNotice(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  quickImportTab === 'multi_row' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-4 h-4 text-amber-700" />
                <span>3. Input Cepat Tabel Multi-Baris</span>
              </button>

              <button
                type="button"
                onClick={() => { setQuickImportTab('format_guide'); setImportNotice(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  quickImportTab === 'format_guide' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>Format & Panduan Excel</span>
              </button>
            </div>

            {/* Notification alert */}
            {importNotice && (
              <div className={`mx-5 mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
                importNotice.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                <div className="flex items-center gap-2">
                  {importNotice.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{importNotice.message}</span>
                </div>
                <button type="button" onClick={() => setImportNotice(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              
              {/* TAB 1: UPLOAD FILE EXCEL */}
              {quickImportTab === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      id="excel-file-input"
                    />
                    <label htmlFor="excel-file-input" className="cursor-pointer block space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                        <FileSpreadsheet className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {isProcessingFile ? 'Membaca File Excel...' : 'Klik untuk Memilih File Excel (.xlsx, .xls) atau .CSV'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          File akan langsung dibaca dan divalidasi ke 28 rombel SDN Kebonagung
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>Pilih Berkas Spreadsheet</span>
                      </div>
                    </label>
                  </div>

                  {/* Template download banner */}
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-extrabold text-blue-950">Belum punya format Excel yang pas?</h4>
                      <p className="text-[11px] text-blue-800">
                        Unduh template resmi SDN Kebonagung (sudah dilengkapi contoh & daftar 28 rombel).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={downloadExcelTemplate}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Excel (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={downloadCsvTemplate}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh .CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SMART PASTE DARI SPREADSHEET */}
              {quickImportTab === 'paste' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Tempelkan (Paste) Tabel Siswa dari Microsoft Excel / Google Sheets / Canva Sheet:
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Buka file Excel Anda, blok baris siswa (dengan atau tanpa judul kolom), tekan <strong>Ctrl + C</strong>, lalu klik di kotak bawah dan tekan <strong>Ctrl + V</strong>.
                    </p>
                    <textarea
                      rows={6}
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder={`Contoh data yang di-copy dari Excel:\n0123456001\tAhmad Rayhan\t1A\tL\tBambang Sudarsono\t081234567890\tPasuruan\n0123456002\tAnindya Kirana\t1B\tP\tSuryo Wibowo\t081398765432\tPasuruan`}
                      className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPasteText('')}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Bersihkan Teks
                    </button>
                    <button
                      type="button"
                      onClick={handleParsePaste}
                      className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-4 h-4 text-purple-300" />
                      <span>Proses & Buat Pratinjau Tabel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: INPUT CEPAT TABEL MULTI-BARIS */}
              {quickImportTab === 'multi_row' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">Tabel Ketik Cepat Multi-Siswa</h4>
                      <p className="text-[11px] text-slate-500">Ketik beberapa siswa sekaligus dalam satu layar tanpa membuka form satu per satu.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMultiRows(prev => [
                          ...prev,
                          { nisn: '', namaLengkap: '', kelas: '1A', jenisKelamin: 'L', tempatLahir: 'Pasuruan', tanggalLahir: '', agama: 'Islam', namaOrangTua: '', noHpOrangTua: '', alamat: '' },
                          { nisn: '', namaLengkap: '', kelas: '1A', jenisKelamin: 'P', tempatLahir: 'Pasuruan', tanggalLahir: '', agama: 'Islam', namaOrangTua: '', noHpOrangTua: '', alamat: '' }
                        ]);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah 2 Baris</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2 w-10 text-center">No</th>
                          <th className="p-2 w-28">NISN *</th>
                          <th className="p-2">Nama Lengkap *</th>
                          <th className="p-2 w-20">Kelas *</th>
                          <th className="p-2 w-16">L/P *</th>
                          <th className="p-2 w-24">Tempat Lahir</th>
                          <th className="p-2 w-28">Tgl Lahir</th>
                          <th className="p-2 w-24">Agama</th>
                          <th className="p-2">Nama Orang Tua</th>
                          <th className="p-2 w-28">No HP Ortu</th>
                          <th className="p-2 w-8 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {multiRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.nisn}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMultiRows(prev => prev.map((r, i) => i === idx ? { ...r, nisn: val } : r));
                                }}
                                placeholder="NISN"
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-blue-600"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.namaLengkap}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMultiRows(prev => prev.map((r, i) => i === idx ? { ...r, namaLengkap: val } : r));
                                }}
                                placeholder="Nama Siswa"
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-600"
                              />
                            </td>
                            <td className="p-1.5">
                              <select
                                value={row.kelas}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMultiRows(prev => prev.map((r, i) => i === idx ? { ...r, kelas: val } : r));
                                }}
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-blue-900 bg-white"
                              >
                                {DAFTAR_KELAS.map(k => (
                                  <option key={k} value={k}>{k}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-1.5">
                              <select
                                value={row.jenisKelamin}
                                onChange={(e) => {
                                  const val = e.target.value as Gender;
                                  setMultiRows(prev => prev.map((r, i) => i === idx ? { ...r, jenisKelamin: val } : r));
                                }}
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold bg-white"
                              >
                                <option value="L">L</option>
                                <option value="P">P</option>
                              </select>
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.tempatLahir}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMultiRows(prev => prev.map((r, i) => i === idx ? { ...r, tempatLahir: val } : r));
                                }}
                                placeholder="Kota"
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="date"
                                value={row.tanggalLahir}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMultiRows(prev => prev.map((r, i) => i === idx ? { ...r, tanggalLahir: val } : r));
                                }}
                                className="w-full px-1.5 py-1 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600"
                              />
                            </td>
                            <td className="p-1.5">
                              <select
                                value={row.agama}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMultiRows(prev => prev.map((r, i) => i === idx ? { ...r, agama: val } : r));
                                }}
                                className="w-full px-1.5 py-1 border border-slate-200 rounded-lg text-xs bg-white"
                              >
                                {AGAMA_OPTIONS.map(a => (
                                  <option key={a} value={a}>{a}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.namaOrangTua}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMultiRows(prev => prev.map((r, i) => i === idx ? { ...r, namaOrangTua: val } : r));
                                }}
                                placeholder="Orang Tua"
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.noHpOrangTua}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMultiRows(prev => prev.map((r, i) => i === idx ? { ...r, noHpOrangTua: val } : r));
                                }}
                                placeholder="08xx..."
                                className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-600"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              {multiRows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setMultiRows(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveMultiRows}
                      className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan Semua Baris Ini</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: PANDUAN FORMAT EXCEL RESMI */}
              {quickImportTab === 'format_guide' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      Format Kolom Excel yang Didukung
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sistem STAR-KIDS dirancang sangat fleksibel dan dapat mengenali berbagai variasi penamaan kolom. Untuk hasil terbaik, gunakan urutan kolom berikut:
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-200/80 text-slate-800 font-bold border-b border-slate-300">
                            <th className="p-2">No</th>
                            <th className="p-2">Nama Kolom</th>
                            <th className="p-2">Wajib?</th>
                            <th className="p-2">Contoh Pengisian</th>
                            <th className="p-2">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="p-2 font-bold text-center">1</td>
                            <td className="p-2 font-mono font-bold text-blue-900">NISN</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Wajib</span></td>
                            <td className="p-2 font-mono text-slate-600">0123456789</td>
                            <td className="p-2 text-slate-600">Nomor Induk Siswa Nasional (harus unik).</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-center">2</td>
                            <td className="p-2 font-mono font-bold text-blue-900">Nama Lengkap</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Wajib</span></td>
                            <td className="p-2 font-medium text-slate-600">Ahmad Rayhan Putra</td>
                            <td className="p-2 text-slate-600">Nama lengkap siswa sekolah dasar.</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-center">3</td>
                            <td className="p-2 font-mono font-bold text-blue-900">Kelas</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Wajib</span></td>
                            <td className="p-2 font-extrabold text-indigo-900">1A, 2B, 3C, 4A, 5E, 6E</td>
                            <td className="p-2 text-slate-600">Pilih salah satu dari 28 rombel resmi.</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-center">4</td>
                            <td className="p-2 font-mono font-bold text-blue-900">Jenis Kelamin</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Wajib</span></td>
                            <td className="p-2 font-bold text-slate-700">L atau P</td>
                            <td className="p-2 text-slate-600">L (Laki-laki) atau P (Perempuan).</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-center">5</td>
                            <td className="p-2 font-mono font-bold text-blue-900">Tempat Lahir</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Dianjurkan</span></td>
                            <td className="p-2 text-slate-600">Pasuruan, Malang, Surabaya</td>
                            <td className="p-2 text-slate-600">Kota/kabupaten kelahiran siswa.</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-center">6</td>
                            <td className="p-2 font-mono font-bold text-blue-900">Tanggal Lahir</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Dianjurkan</span></td>
                            <td className="p-2 font-mono text-slate-600">2018-05-12 (YYYY-MM-DD)</td>
                            <td className="p-2 text-slate-600">Tanggal lahir resmi siswa untuk data rapor/dapodik.</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-center">7</td>
                            <td className="p-2 font-mono font-bold text-blue-900">Agama</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Dianjurkan</span></td>
                            <td className="p-2 text-slate-600">Islam / Kristen / Katolik / Hindu / Buddha / Konghucu</td>
                            <td className="p-2 text-slate-600">Agama siswa sesuai KTP/Kartu Keluarga.</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-center">8</td>
                            <td className="p-2 font-mono font-bold text-blue-900">Nama Orang Tua</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">Opsional</span></td>
                            <td className="p-2 text-slate-600">Bambang Sudarsono</td>
                            <td className="p-2 text-slate-600">Nama ayah, ibu, atau wali siswa.</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-center">9</td>
                            <td className="p-2 font-mono font-bold text-blue-900">No HP Orang Tua</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">Opsional</span></td>
                            <td className="p-2 font-mono text-slate-600">081234567890</td>
                            <td className="p-2 text-slate-600">Nomor WhatsApp untuk surat panggilan & koordinasi TPPK.</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-bold text-center">10</td>
                            <td className="p-2 font-mono font-bold text-blue-900">Alamat</td>
                            <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">Opsional</span></td>
                            <td className="p-2 text-slate-600">Jl. Panglima Sudirman No. 12</td>
                            <td className="p-2 text-slate-600">Alamat domisili murid.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 28 Classes Grid Info */}
                  <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-indigo-950">Daftar 28 Rombel Resmi SDN Kebonagung:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                      <div className="p-2 bg-white rounded-lg border border-indigo-100">
                        <strong className="text-indigo-900 block font-black">Kelas 1 (4)</strong>
                        <span className="text-slate-600">1A, 1B, 1C, 1D</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-indigo-100">
                        <strong className="text-indigo-900 block font-black">Kelas 2 (4)</strong>
                        <span className="text-slate-600">2A, 2B, 2C, 2D</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-indigo-100">
                        <strong className="text-indigo-900 block font-black">Kelas 3 (5)</strong>
                        <span className="text-slate-600">3A, 3B, 3C, 3D, 3E</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-indigo-100">
                        <strong className="text-indigo-900 block font-black">Kelas 4 (5)</strong>
                        <span className="text-slate-600">4A, 4B, 4C, 4D, 4E</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-indigo-100">
                        <strong className="text-indigo-900 block font-black">Kelas 5 (5)</strong>
                        <span className="text-slate-600">5A, 5B, 5C, 5D, 5E</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-indigo-100">
                        <strong className="text-indigo-900 block font-black">Kelas 6 (5)</strong>
                        <span className="text-slate-600">6A, 6B, 6C, 6D, 6E</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PREVIEW TABEL HASIL PARSE FILE / PASTE */}
              {parsedRows.length > 0 && (quickImportTab === 'upload' || quickImportTab === 'paste') && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        Pratinjau Hasil Pembacaan ({parsedRows.length} Siswa Terdeteksi)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {parsedRows.filter(r => r.isValid).length} baris valid siap disimpan, {parsedRows.filter(r => !r.isValid).length} baris memiliki peringatan.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setParsedRows([])}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-bold"
                    >
                      Hapus Pratinjau
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-60 overflow-y-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="p-2 w-10 text-center">Status</th>
                          <th className="p-2">NISN</th>
                          <th className="p-2">Nama Lengkap</th>
                          <th className="p-2">Kelas</th>
                          <th className="p-2">L/P</th>
                          <th className="p-2">Wali Kelas</th>
                          <th className="p-2">Orang Tua</th>
                          <th className="p-2">Kontak HP</th>
                          <th className="p-2 text-center w-8">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.map((row, idx) => (
                          <tr key={row.id || idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                            <td className="p-2 text-center">
                              {row.isValid ? (
                                <span title="Siap Disimpan" className="inline-block p-1 bg-emerald-100 text-emerald-700 rounded-full">
                                  <Check className="w-3 h-3" />
                                </span>
                              ) : (
                                <span title={row.errors.join(', ')} className="inline-block p-1 bg-rose-100 text-rose-700 rounded-full cursor-help">
                                  <AlertTriangle className="w-3 h-3" />
                                </span>
                              )}
                            </td>
                            <td className="p-2 font-mono font-bold text-slate-700">{row.nisn || '-'}</td>
                            <td className="p-2 font-bold text-slate-900">{row.namaLengkap || '-'}</td>
                            <td className="p-2">
                              <span className="font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {row.kelas}
                              </span>
                            </td>
                            <td className="p-2 font-bold text-center">{row.jenisKelamin}</td>
                            <td className="p-2 text-slate-600">{row.waliKelas}</td>
                            <td className="p-2 text-slate-600">{row.namaOrangTua}</td>
                            <td className="p-2 font-mono text-slate-600">{row.noHpOrangTua}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => setParsedRows(prev => prev.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-rose-600"
                                title="Hapus baris ini"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions to commit batch */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Baris tidak valid akan otomatis diabaikan atau dapat diperbaiki.
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveImportedStudents}
                      disabled={parsedRows.filter(r => r.isValid).length === 0}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan {parsedRows.filter(r => r.isValid).length} Siswa Sekaligus</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                STAR-KIDS Data Pipeline • SDN Kebonagung Kota Pasuruan
              </span>
              <button
                type="button"
                onClick={() => setIsQuickImportOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DETAIL BIODATA SISWA & RIWAYAT LENGKAP */}
      {/* ========================================================================= */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-black text-xl text-white">
                  {detailStudent.namaLengkap[0]}
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">{detailStudent.namaLengkap}</h2>
                  <p className="text-xs text-blue-200 font-mono">
                    NISN: {detailStudent.nisn} • Rombel: Kelas {detailStudent.kelas}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-slate-500 font-bold block mb-1">Status Risiko</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    detailStudent.statusResiko === 'Berisiko' ? 'bg-rose-100 text-rose-800' :
                    detailStudent.statusResiko === 'Waspada' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {detailStudent.statusResiko}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                  <span className="text-rose-700 font-bold block mb-1">Poin Pelanggaran</span>
                  <span className="text-base font-black text-rose-800">−{detailStudent.totalPoinPelanggaran}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-emerald-700 font-bold block mb-1">Poin Reward</span>
                  <span className="text-base font-black text-emerald-800">+{detailStudent.totalPoinReward}</span>
                </div>
              </div>

              {/* Biodata List */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Informasi Biodata & Wali Siswa
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Wali Kelas:</strong> {detailStudent.waliKelas}</div>
                  <div><strong>NIP Wali Kelas:</strong> <span className="font-mono text-slate-900">{detailStudent.nipWaliKelas || WALI_KELAS_NIP_MAP[detailStudent.kelas] || '-'}</span></div>
                  <div><strong>Jenis Kelamin:</strong> {detailStudent.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</div>
                  <div><strong>Agama:</strong> {detailStudent.agama || 'Islam'}</div>
                  <div className="col-span-2"><strong>Tempat, Tanggal Lahir:</strong> {detailStudent.tempatLahir || 'Pasuruan'}, {detailStudent.tanggalLahir || '-'}</div>
                  <div><strong>Nama Orang Tua:</strong> {detailStudent.namaOrangTua}</div>
                  <div><strong>No. Handphone:</strong> {detailStudent.noHpOrangTua}</div>
                  <div className="col-span-2"><strong>Alamat Domisili:</strong> {detailStudent.alamat || 'Kota Pasuruan'}</div>
                </div>
              </div>

              {/* Recent Pelanggaran */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    Riwayat Pelanggaran Tercatat ({studentViolations.length})
                  </span>
                </h4>
                {studentViolations.length === 0 ? (
                  <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl text-center">
                    Tidak ada catatan pelanggaran (Siswa teladan).
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {studentViolations.map(p => (
                      <div key={p.id} className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{p.jenisPelanggaran}</div>
                          <div className="text-[11px] text-slate-500">
                            {p.tanggal} • {p.lokasiKejadian || 'Sekolah'} • Poin: −{p.poin}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800">
                          {p.kategori}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Rewards */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <Award className="w-4 h-4" />
                    Riwayat Apresiasi Karakter & Prestasi ({studentRewards.length})
                  </span>
                </h4>
                {studentRewards.length === 0 ? (
                  <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl text-center">
                    Belum ada catatan apresiasi reward.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {studentRewards.map(r => (
                      <div key={r.id} className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{r.jenisReward}</div>
                          <div className="text-[11px] text-slate-500">
                            {r.tanggal} • Tingkat {r.tingkat} • Poin: +{r.poin}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          {r.kategori}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onPrintStudentReport(detailStudent);
                  setDetailStudent(null);
                }}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Karakter</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FORMULIR TAMBAH / EDIT SISWA SATUAN */}
      {/* ========================================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex items-center justify-between">
              <h2 className="text-base font-black tracking-tight">
                {editingNisn ? 'Edit Biodata Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  NISN (Nomor Induk Siswa Nasional) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formNisn}
                  onChange={(e) => setFormNisn(e.target.value)}
                  disabled={!!editingNisn}
                  placeholder="Contoh: 0123456789"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs font-semibold focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Murid <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Nama Lengkap Siswa"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as Gender)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rombel (28 Kelas) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-extrabold text-blue-900 bg-white"
                  >
                    {DAFTAR_KELAS.map(k => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formTempatLahir}
                    onChange={(e) => setFormTempatLahir(e.target.value)}
                    placeholder="Kota Lahir (misal: Pasuruan)"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formTanggalLahir}
                    onChange={(e) => setFormTanggalLahir(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Agama
                  </label>
                  <select
                    value={formAgama}
                    onChange={(e) => setFormAgama(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-xs bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    {AGAMA_OPTIONS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-blue-900 font-bold block">
                    Wali Kelas Resmi:
                  </span>
                  <span className="text-xs font-extrabold text-blue-950">
                    {WALI_KELAS_MAP[formKelas] || 'Wali Kelas SDN Kebonagung'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-blue-900 font-bold block">
                    NIP Pegawai:
                  </span>
                  <span className="text-xs font-extrabold text-blue-950 font-mono">
                    {WALI_KELAS_NIP_MAP[formKelas] || '-'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Orang Tua / Wali Murid
                </label>
                <input
                  type="text"
                  value={formNamaOrtu}
                  onChange={(e) => setFormNamaOrtu(e.target.value)}
                  placeholder="Nama Ayah/Ibu/Wali"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  No. Handphone / WhatsApp Orang Tua
                </label>
                <input
                  type="text"
                  value={formNoHpOrtu}
                  onChange={(e) => setFormNoHpOrtu(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Domisili
                </label>
                <input
                  type="text"
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  placeholder="Kelurahan Kebonagung, Pasuruan"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md"
                >
                  {editingNisn ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KONFIRMASI HAPUS DATA SISWA SECARA BERSAMAAN */}
      {/* ========================================================================= */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Trash2 className="w-6 h-6 text-rose-200" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    Hapus {selectedNisns.length} Data Siswa Bersamaan
                  </h3>
                  <p className="text-xs text-rose-200">
                    Konfirmasi penghapusan massal data siswa SDN Kebonagung
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900 leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold block text-rose-950 mb-0.5">Peringatan Penghapusan Bersamaan:</strong>
                  Tindakan ini akan <strong>menghapus permanen {selectedNisns.length} siswa terpilih</strong> beserta seluruh catatan presensi, riwayat pelanggaran tata tertib, dan piagam reward karakter yang terkait. Tindakan ini tidak dapat dibatalkan.
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Daftar Siswa yang Akan Dihapus:</span>
                  <span className="text-slate-500 font-mono text-[11px]">{selectedNisns.length} siswa</span>
                </div>
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                  {selectedStudents.map(st => (
                    <div key={st.nisn} className="p-2.5 flex items-center justify-between text-xs hover:bg-white transition-colors">
                      <div>
                        <div className="font-bold text-slate-900">{st.namaLengkap}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NISN: {st.nisn}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-bold text-[10px]">
                          Kelas {st.kelas}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBatchDeleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBatchDelete}
                  className="px-5 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus {selectedNisns.length} Siswa Secara Bersamaan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: HAPUS SELURUH DATA SISWA DI KELAS ATAU SEKOLAH */}
      {/* ========================================================================= */}
      {isDeleteAllKelasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-red-700 via-rose-800 to-rose-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Trash2 className="w-6 h-6 text-rose-200" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    Hapus Seluruh Data Siswa {selectedKelas !== 'all' ? `Kelas ${selectedKelas}` : 'Sekolah'}
                  </h3>
                  <p className="text-xs text-rose-200">
                    Konfirmasi penghapusan seluruh data rombel di UPT SDN Kebonagung
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteAllKelasModalOpen(false)}
                className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-xs text-rose-950 leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold block text-rose-950 mb-0.5">PERINGATAN PENGHAPUSAN SELURUH DATA KELAS:</strong>
                  Tindakan ini akan <strong>menghapus SELURUH data siswa ({selectedKelas !== 'all' ? students.filter(s => s.kelas === selectedKelas).length : students.length} siswa) {selectedKelas !== 'all' ? `di Kelas ${selectedKelas}` : 'di seluruh sekolah'}</strong> beserta seluruh data absensi, riwayat pelanggaran, dan prestasi terkait. Tindakan ini tidak dapat dibatalkan.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Target Rombel / Kelas:</span>
                  <span className="font-black text-rose-700">{selectedKelas !== 'all' ? `Kelas ${selectedKelas}` : 'Semua 28 Rombel Sekolah'}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Jumlah Siswa yang Akan Dihapus:</span>
                  <span className="font-black text-slate-900 font-mono">
                    {selectedKelas !== 'all' ? students.filter(s => s.kelas === selectedKelas).length : students.length} Siswa
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeleteAllKelasModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteAllInKelas}
                  className="px-5 py-2 text-xs font-black text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Seluruh Data {selectedKelas !== 'all' ? `Kelas ${selectedKelas}` : 'Sekolah'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MUTASI / PINDAH ROMBEL KELAS SECARA BERSAMAAN */}
      {/* ========================================================================= */}
      {isBatchMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-indigo-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-800 to-blue-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <ArrowRightLeft className="w-6 h-6 text-indigo-200" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    Pindahkan {selectedNisns.length} Siswa Terpilih
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Mutasi rombel atau kenaikan kelas secara bersamaan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchMoveModalOpen(false)}
                className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Rombel Kelas Tujuan (28 Rombel Resmi):
                </label>
                <select
                  value={targetMoveKelas}
                  onChange={(e) => setTargetMoveKelas(e.target.value)}
                  className="w-full p-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                >
                  {DAFTAR_KELAS.map(k => (
                    <option key={k} value={k}>
                      Kelas {k} — Wali: {WALI_KELAS_MAP[k] || '-'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Wali kelas & NIP wali kelas seluruh siswa yang ditandai akan disesuaikan otomatis dengan rombel baru.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBatchMoveModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBatchMove}
                  className="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Pindahkan ke Kelas {targetMoveKelas}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SiswaView;
