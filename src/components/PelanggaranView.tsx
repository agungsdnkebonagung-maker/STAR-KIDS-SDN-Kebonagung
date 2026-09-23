import React, { useState, useMemo } from 'react';
import { Student, PelanggaranRecord, UserRole, KategoriPelanggaran, StatusTindakLanjut } from '../types';
import { 
  DAFTAR_KELAS, 
  LOKASI_KEJADIAN_LIST, 
  AKTIVITAS_PELANGGARAN_LIST, 
  TINDAK_LANJUT_OPTIONS,
  REFERENSI_PELANGGARAN
} from '../data/constants';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Printer, 
  ShieldAlert,
  X,
  Sparkles,
  Lock,
  ShieldCheck,
  AlertCircle,
  Info,
  UserCheck,
  CheckSquare,
  ListChecks,
  CheckCheck,
  Tag
} from 'lucide-react';

interface PelanggaranViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  role: UserRole;
  onAddPelanggaran: (pelanggaran: Omit<PelanggaranRecord, 'id'>) => void;
  onUpdatePelanggaran: (id: string, updated: Partial<PelanggaranRecord>) => void;
  onDeletePelanggaran: (id: string) => void;
  onBatchDeletePelanggaran?: (ids: string[]) => void;
  onDeleteAllPelanggaran?: (kelas?: string) => void;
  onPrintSurat: (student: Student, pelanggaran: PelanggaranRecord) => void;
}

export const PelanggaranView: React.FC<PelanggaranViewProps> = ({
  students,
  pelanggaranList,
  role,
  onAddPelanggaran,
  onUpdatePelanggaran,
  onDeletePelanggaran,
  onBatchDeletePelanggaran,
  onDeleteAllPelanggaran,
  onPrintSurat
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterKategori, setFilterKategori] = useState<'all' | KategoriPelanggaran>('all');

  // Selection & Batch Delete States
  const [selectedViolationIds, setSelectedViolationIds] = useState<string[]>([]);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [batchActionNotice, setBatchActionNotice] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PelanggaranRecord | null>(null);

  // Form inputs
  const [formKelas, setFormKelas] = useState<string>('6A');
  const [formNisn, setFormNisn] = useState<string>('');
  const [formTanggal, setFormTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formJam, setFormJam] = useState<string>('09:30');
  const [formJenis, setFormJenis] = useState<string>(REFERENSI_PELANGGARAN[0].nama);
  const [formKategori, setFormKategori] = useState<KategoriPelanggaran>(REFERENSI_PELANGGARAN[0].kategori);
  const [formPoin, setFormPoin] = useState<number>(REFERENSI_PELANGGARAN[0].poin);
  const [formLokasi, setFormLokasi] = useState<string>(LOKASI_KEJADIAN_LIST[0]);
  const [formAktivitas, setFormAktivitas] = useState<string>(AKTIVITAS_PELANGGARAN_LIST[0]);
  const [formTindakLanjut, setFormTindakLanjut] = useState<string>(TINDAK_LANJUT_OPTIONS[0]);
  const [formStatusPenanganan, setFormStatusPenanganan] = useState<StatusTindakLanjut>('Selesai');
  const [formCatatan, setFormCatatan] = useState<string>('');
  const [formPetugas, setFormPetugas] = useState<string>('Tim TPPK SDN Kebonagung');

  // Filter siswa sesuai formKelas
  const studentsInFormKelas = useMemo(() => {
    return students.filter(s => s.kelas === formKelas);
  }, [students, formKelas]);

  // Handle Jenis Pelanggaran Change -> Poin & Kategori Otomatis
  const handleJenisChange = (jenisNama: string) => {
    setFormJenis(jenisNama);
    const foundRef = REFERENSI_PELANGGARAN.find(r => r.nama === jenisNama);
    if (foundRef) {
      setFormPoin(foundRef.poin);
      setFormKategori(foundRef.kategori);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormKelas('6A');
    const firstStudent = students.find(s => s.kelas === '6A');
    setFormNisn(firstStudent ? firstStudent.nisn : '');
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormJam('09:30');
    setFormJenis(REFERENSI_PELANGGARAN[0].nama);
    setFormKategori(REFERENSI_PELANGGARAN[0].kategori);
    setFormPoin(REFERENSI_PELANGGARAN[0].poin);
    setFormLokasi(LOKASI_KEJADIAN_LIST[0]);
    setFormAktivitas(AKTIVITAS_PELANGGARAN_LIST[0]);
    setFormTindakLanjut(TINDAK_LANJUT_OPTIONS[0]);
    setFormStatusPenanganan('Selesai');
    setFormCatatan('');
    setFormPetugas('Tim TPPK SDN Kebonagung');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: PelanggaranRecord) => {
    setEditingItem(item);
    setFormKelas(item.kelas);
    setFormNisn(item.nisn);
    setFormTanggal(item.tanggal);
    setFormJam(item.jam || '09:00');
    setFormJenis(item.jenisPelanggaran);
    setFormKategori(item.kategori);
    setFormPoin(item.poin);
    setFormLokasi(item.lokasiKejadian);
    setFormAktivitas(item.aktivitasSaatPelanggaran);
    setFormTindakLanjut(item.tindakLanjut);
    setFormStatusPenanganan(item.statusPenanganan);
    setFormCatatan(item.catatan);
    setFormPetugas(item.petugas);
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find(s => s.nisn === formNisn);
    const namaSiswa = targetStudent ? targetStudent.namaLengkap : 'Siswa SDN Kebonagung';

    if (editingItem) {
      onUpdatePelanggaran(editingItem.id, {
        tanggal: formTanggal,
        jam: formJam,
        nisn: formNisn,
        namaSiswa,
        kelas: formKelas,
        jenisPelanggaran: formJenis,
        kategori: formKategori,
        poin: Number(formPoin),
        lokasiKejadian: formLokasi,
        aktivitasSaatPelanggaran: formAktivitas,
        tindakLanjut: formTindakLanjut,
        catatan: formCatatan,
        statusPenanganan: formStatusPenanganan,
        petugas: formPetugas,
        syncedToSheet: true
      });
    } else {
      onAddPelanggaran({
        tanggal: formTanggal,
        jam: formJam,
        nisn: formNisn,
        namaSiswa,
        kelas: formKelas,
        jenisPelanggaran: formJenis,
        kategori: formKategori,
        poin: Number(formPoin),
        lokasiKejadian: formLokasi,
        aktivitasSaatPelanggaran: formAktivitas,
        tindakLanjut: formTindakLanjut,
        catatan: formCatatan,
        statusPenanganan: formStatusPenanganan,
        petugas: formPetugas,
        syncedToSheet: true
      });
    }
    setIsModalOpen(false);
  };

  // State khusus Orang Tua (View Only)
  const [parentNisnQuery, setParentNisnQuery] = useState('');
  const [parentFoundStudent, setParentFoundStudent] = useState<Student | null>(null);
  const [parentStudentViolations, setParentStudentViolations] = useState<PelanggaranRecord[]>([]);
  const [parentSearchError, setParentSearchError] = useState<string | null>(null);
  const [hasCheckedNisn, setHasCheckedNisn] = useState(false);

  const handleParentSearch = (nisnOverride?: string) => {
    const query = (nisnOverride !== undefined ? nisnOverride : parentNisnQuery).trim();
    setHasCheckedNisn(true);
    if (!query) {
      setParentSearchError('Silakan masukkan nomor NISN putra/putri Anda.');
      setParentFoundStudent(null);
      setParentStudentViolations([]);
      return;
    }
    const student = students.find(s => s.nisn.trim() === query || s.nisn.toLowerCase() === query.toLowerCase());
    if (student) {
      setParentFoundStudent(student);
      const vList = pelanggaranList.filter(p => p.nisn.trim() === student.nisn.trim());
      setParentStudentViolations(vList);
      setParentSearchError(null);
    } else {
      setParentFoundStudent(null);
      setParentStudentViolations([]);
      setParentSearchError(`NISN "${query}" tidak ditemukan dalam pangkalan data siswa sekolah. Mohon periksa kembali kartu pelajar atau buku rapor.`);
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return pelanggaranList.filter(item => {
      const matchSearch = 
        item.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jenisPelanggaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nisn.includes(searchTerm);
      const matchKelas = filterKelas === 'all' || item.kelas === filterKelas;
      const matchKategori = filterKategori === 'all' || item.kategori === filterKategori;
      return matchSearch && matchKelas && matchKategori;
    });
  }, [pelanggaranList, searchTerm, filterKelas, filterKategori]);

  const selectedViolationsSet = useMemo(() => new Set(selectedViolationIds), [selectedViolationIds]);

  const selectedViolations = useMemo(() => {
    return pelanggaranList.filter(item => selectedViolationsSet.has(item.id));
  }, [pelanggaranList, selectedViolationsSet]);

  const handleToggleSelectViolation = (id: string) => {
    setSelectedViolationIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFilteredViolations = () => {
    const allFilteredIds = filteredList.map(item => item.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedViolationsSet.has(id));

    if (allSelected) {
      setSelectedViolationIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      const union = new Set([...selectedViolationIds, ...allFilteredIds]);
      setSelectedViolationIds(Array.from(union));
    }
  };

  const handleClearSelection = () => {
    setSelectedViolationIds([]);
  };

  const handleConfirmBatchDelete = () => {
    if (selectedViolationIds.length === 0) return;
    const count = selectedViolationIds.length;

    if (onBatchDeletePelanggaran) {
      onBatchDeletePelanggaran(selectedViolationIds);
    } else {
      selectedViolationIds.forEach(id => onDeletePelanggaran(id));
    }

    setSelectedViolationIds([]);
    setIsBatchDeleteModalOpen(false);
    setBatchActionNotice(`Berhasil menghapus sebagian (${count} catatan pelanggaran terpilih). Saldo karakter siswa otomatis dikalkulasi ulang.`);
    setTimeout(() => setBatchActionNotice(null), 5000);
  };

  const handleConfirmDeleteAll = () => {
    const targetCount = filterKelas === 'all' 
      ? pelanggaranList.length 
      : pelanggaranList.filter(p => p.kelas === filterKelas).length;

    if (onDeleteAllPelanggaran) {
      onDeleteAllPelanggaran(filterKelas);
    } else {
      const targets = filterKelas === 'all' 
        ? pelanggaranList 
        : pelanggaranList.filter(p => p.kelas === filterKelas);
      targets.forEach(p => onDeletePelanggaran(p.id));
    }

    setSelectedViolationIds([]);
    setIsDeleteAllModalOpen(false);
    setBatchActionNotice(
      filterKelas === 'all'
        ? `Berhasil menghapus seluruh catatan pelanggaran sekolah (${targetCount} catatan).`
        : `Berhasil menghapus seluruh catatan pelanggaran Kelas ${filterKelas} (${targetCount} catatan).`
    );
    setTimeout(() => setBatchActionNotice(null), 5000);
  };

  // JIKA ROLE ADALAH VIEW_ONLY (ORANG TUA)
  // Sesuai permintaan: data pelanggaran tidak disajikan secara publik/umum,
  // melainkan harus memasukkan NISN siswa yang ingin dicek untuk menjaga privasi.
  if (role === 'view_only') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header Orang Tua */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Portal Orang Tua / Wali Murid</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pemeriksaan Catatan Disiplin Siswa
            </h1>
            <p className="text-xs text-slate-500">
              Akses rekam kedisiplinan dan tata tertib ananda secara privat dan terlindungi dengan verifikasi NISN
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mode Khusus Wali Murid</span>
          </div>
        </div>

        {/* Kotak Kebijakan Privasi */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-amber-950 flex flex-col sm:flex-row items-start gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-800" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-amber-900 text-sm">Prinsip Kerahasiaan & Etika Pendidikan</h3>
            <p className="leading-relaxed text-amber-900/90">
              Sesuai pedoman TPPK dan regulasi perlindungan privasi peserta didik, catatan pelanggaran tata tertib <strong>tidak dipublikasikan secara umum</strong> ke publik. Orang tua/wali hanya dapat melihat catatan kedisiplinan putra/putri masing-masing secara eksklusif setelah memasukkan nomor <strong>NISN</strong> siswa yang sah.
            </p>
          </div>
        </div>

        {/* Kartu Input Pencarian NISN */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
              Masukkan Nomor Induk Siswa Nasional (NISN) Ananda
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={parentNisnQuery}
                  onChange={(e) => {
                    setParentNisnQuery(e.target.value);
                    if (hasCheckedNisn) setHasCheckedNisn(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleParentSearch();
                  }}
                  placeholder="Contoh: 0134567890 (10 digit NISN)..."
                  className="w-full pl-10 pr-4 py-3 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50 text-slate-900"
                />
              </div>
              <button
                type="button"
                onClick={() => handleParentSearch()}
                className="px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Periksa Catatan Disiplin</span>
              </button>
            </div>

            {/* Quick Demo Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <span className="text-[11px] text-slate-400 font-semibold">Coba NISN Siswa Demo:</span>
              {students.slice(0, 5).map((st) => (
                <button
                  key={st.nisn}
                  type="button"
                  onClick={() => {
                    setParentNisnQuery(st.nisn);
                    handleParentSearch(st.nisn);
                  }}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 transition cursor-pointer border border-slate-200"
                >
                  {st.namaLengkap.split(' ')[0]} ({st.nisn})
                </button>
              ))}
            </div>
          </div>

          {/* Hasil Pengecekan */}
          {hasCheckedNisn && (
            <div className="pt-3 border-t border-slate-100 animate-in fade-in duration-200">
              {parentSearchError ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Pemeriksaan Tidak Ditemukan</span>
                    <p className="text-xs text-rose-700 mt-0.5">{parentSearchError}</p>
                  </div>
                </div>
              ) : parentFoundStudent ? (
                <div className="space-y-4">
                  {/* Card Profil Siswa */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white font-black flex items-center justify-center text-lg shadow-sm">
                        {parentFoundStudent.namaLengkap.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900">{parentFoundStudent.namaLengkap}</h3>
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                            Kelas {parentFoundStudent.kelas}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                          <span>NISN: <strong className="font-mono text-slate-700">{parentFoundStudent.nisn}</strong></span>
                          <span>&bull;</span>
                          <span>Jenis Kelamin: {parentFoundStudent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="self-start sm:self-auto">
                      <span className={`text-xs font-black px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 ${
                        parentStudentViolations.length === 0
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {parentStudentViolations.length === 0 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Siswa Tertib & Disiplin</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>{parentStudentViolations.length} Catatan Disiplin</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Rekam Pelanggaran */}
                  {parentStudentViolations.length === 0 ? (
                    <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2.5 font-black text-emerald-800 text-sm sm:text-base">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <span>Catatan Kedisiplinan Bersih</span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed max-w-2xl">
                        Alhamdulillah, ananda <strong>{parentFoundStudent.namaLengkap}</strong> memiliki rekam kedisiplinan yang sangat baik. Tidak ada riwayat pelanggaran tata tertib yang tercatat di sistem pembinaan karakter sekolah. Pertahankan prestasi dan karakter terpuji ananda!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                        Rincian Riwayat Pelanggaran & Pembinaan:
                      </h4>
                      <div className="space-y-2.5">
                        {parentStudentViolations.map((item) => (
                          <div key={item.id} className="p-4 rounded-xl bg-white border border-rose-200 shadow-2xs space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h5 className="font-bold text-sm text-slate-900">{item.jenisPelanggaran}</h5>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    item.kategori === 'Berat' 
                                      ? 'bg-rose-100 text-rose-800' 
                                      : item.kategori === 'Sedang' 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    Kategori {item.kategori}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold">&bull;</span>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    Lokasi: {item.lokasiKejadian}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-black text-xs shrink-0">
                                -{item.poin} Poin
                              </span>
                            </div>

                            <div className="text-xs text-slate-500 pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                              <span>Tanggal Kejadian: <strong>{item.tanggal} ({item.jam})</strong></span>
                              <span>Pencatat: {item.petugas}</span>
                            </div>

                            <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-950">
                              <span className="font-bold block text-amber-900 mb-0.5">Tindak Lanjut & Konseling:</span>
                              <p className="text-amber-900/90">{item.tindakLanjut}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Tata Tertib & Disiplin Karakter</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Data Pelanggaran Siswa
          </h1>
          <p className="text-xs text-slate-500">
            Pencatatan pelanggaran dengan pembobotan poin otomatis, rekapitulasi, dan tindak lanjut TPPK
          </p>
        </div>

        {role === 'admin' ? (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Input Pelanggaran Baru</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium self-start md:self-auto">
            Mode Tinjauan (View Only)
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama siswa, NISN, atau jenis pelanggaran..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold hidden sm:inline">Kelas:</span>
          </div>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Kelas</option>
            {DAFTAR_KELAS.map(k => (
              <option key={k} value={k}>Kelas {k}</option>
            ))}
          </select>

          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Kategori</option>
            <option value="Ringan">Ringan (5-10 Poin)</option>
            <option value="Sedang">Sedang (15-25 Poin)</option>
            <option value="Berat">Berat (50-100 Poin)</option>
          </select>
        </div>
      </div>

      {/* Action Notification Toast */}
      {batchActionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{batchActionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setBatchActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Menu Poin Hapus Data Pelanggaran (Sebagian atau Seluruhnya) */}
      <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <ListChecks className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>Menu Poin Hapus Data Pelanggaran</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[10px] font-black">
                  {filterKelas === 'all' ? 'Semua Kelas' : `Kelas ${filterKelas}`}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Pilih atau tandai catatan pelanggaran untuk menghapus sebagian atau seluruhnya pada kelas/sekolah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 self-start sm:self-auto">
            <span>Ditandai:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black transition-colors ${
              selectedViolationIds.length > 0 ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
            }`}>
              {selectedViolationIds.length} Catatan
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleSelectAllFilteredViolations}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
              <span>
                {filteredList.length > 0 && filteredList.every(i => selectedViolationsSet.has(i.id))
                  ? 'Batal Tandai Semua Tampil'
                  : `Tandai Semua yang Tampil (${filteredList.length})`}
              </span>
            </button>

            {selectedViolationIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-rose-600" />
                <span>Batal Tandai</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol Hapus Sebagian */}
            <button
              type="button"
              disabled={selectedViolationIds.length === 0}
              onClick={() => setIsBatchDeleteModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedViolationIds.length > 0
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={selectedViolationIds.length > 0 ? "Hapus pelanggaran yang ditandai" : "Tandai catatan terlebih dahulu"}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Sebagian ({selectedViolationIds.length} Terpilih)</span>
            </button>

            {/* Tombol Hapus Seluruhnya */}
            <button
              type="button"
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-all flex items-center gap-1.5 cursor-pointer"
              title={`Hapus seluruh catatan pelanggaran di ${filterKelas !== 'all' ? `Kelas ${filterKelas}` : 'Semua Kelas'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 hover:text-white" />
              <span>Hapus Seluruh Data {filterKelas !== 'all' ? `Kelas ${filterKelas}` : 'Sekolah'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Records */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredList.length > 0 && filteredList.every(i => selectedViolationsSet.has(i.id))}
                    onChange={handleSelectAllFilteredViolations}
                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    title="Tandai / Batalkan semua baris yang tampil"
                  />
                </th>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Siswa & Kelas</th>
                <th className="py-3 px-4">Pelanggaran & Kategori</th>
                <th className="py-3 px-4">Poin</th>
                <th className="py-3 px-4">Lokasi & Aktivitas</th>
                <th className="py-3 px-4">Tindak Lanjut</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Tidak ditemukan data pelanggaran yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const student = students.find(s => s.nisn === item.nisn);
                  const isSelected = selectedViolationsSet.has(item.id);

                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${
                        isSelected ? 'bg-rose-50/50 hover:bg-rose-50/80' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectViolation(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>

                      {/* Tanggal & Waktu */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{item.tanggal}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.jam || '09:00'} WIB</span>
                        </div>
                      </td>

                      {/* Siswa & Kelas */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.namaSiswa}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          NISN: {item.nisn} &bull; <span className="font-semibold text-blue-700">Kelas {item.kelas}</span>
                        </div>
                      </td>

                      {/* Pelanggaran & Kategori */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 leading-snug">
                          {item.jenisPelanggaran}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.kategori === 'Berat' ? 'bg-rose-100 text-rose-800' :
                            item.kategori === 'Sedang' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.kategori}
                          </span>
                          {item.catatan && (
                            <span className="text-[11px] text-slate-500 truncate max-w-44" title={item.catatan}>
                              {item.catatan}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Poin */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                          +{item.poin} Poin
                        </span>
                      </td>

                      {/* Lokasi & Aktivitas */}
                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="text-slate-800 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.lokasiKejadian}</span>
                        </div>
                        <div className="text-slate-500 text-[10px] mt-0.5">
                          Saat: {item.aktivitasSaatPelanggaran}
                        </div>
                      </td>

                      {/* Tindak Lanjut */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium text-xs leading-snug">
                          {item.tindakLanjut}
                        </div>
                        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.statusPenanganan === 'Panggilan Orang Tua' ? 'bg-rose-100 text-rose-800' :
                          item.statusPenanganan === 'Dalam Pembinaan' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.statusPenanganan}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Tombol Cetak Surat Panggilan */}
                          {student && (
                            <button
                              onClick={() => onPrintSurat(student, item)}
                              title="Cetak Surat Panggilan Orang Tua Resmi"
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}

                          {role === 'admin' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(item)}
                                title="Edit Catatan Pelanggaran"
                                className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus catatan pelanggaran untuk ${item.namaSiswa}?`)) {
                                    onDeletePelanggaran(item.id);
                                  }
                                }}
                                title="Hapus Catatan"
                                className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Menampilkan <strong>{filteredList.length}</strong> dari <strong>{pelanggaranList.length}</strong> catatan pelanggaran</span>
          <span className="text-[11px] text-slate-500">Semua perubahan otomatis tersinkronisasi dengan Canva Sheet &bull; STAR-KIDS 2026</span>
        </div>
      </div>

      {/* Modal Form Input / Edit Pelanggaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-rose-700 to-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">
                    {editingItem ? 'Edit Catatan Pelanggaran' : 'Form Input Pelanggaran Terstruktur'}
                  </h3>
                  <p className="text-xs text-rose-200">
                    Sistem Tata Tertib & Apresiasi Karakter SDN Kebonagung
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              
              {/* Row 1: Pilih Kelas -> Siswa Otomatis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    1. Pilih Kelas <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formKelas}
                    onChange={(e) => {
                      const newKelas = e.target.value;
                      setFormKelas(newKelas);
                      const studentInNewClass = students.find(s => s.kelas === newKelas);
                      if (studentInNewClass) setFormNisn(studentInNewClass.nisn);
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold bg-slate-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  >
                    {DAFTAR_KELAS.map(k => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. Pilih Nama Siswa <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold bg-slate-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  >
                    {studentsInFormKelas.length === 0 ? (
                      <option value="">(Belum ada siswa di kelas ini)</option>
                    ) : (
                      studentsInFormKelas.map(s => (
                        <option key={s.nisn} value={s.nisn}>
                          {s.namaLengkap} ({s.nisn}) - Poin Sekarang: {s.totalPoinPelanggaran}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Row 2: Tanggal & Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Pelanggaran <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Waktu / Jam Kejadian
                  </label>
                  <input
                    type="time"
                    value={formJam}
                    onChange={(e) => setFormJam(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Jenis Pelanggaran -> Poin Otomatis */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    3. Jenis Pelanggaran (Poin & Kategori Otomatis) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formJenis}
                    onChange={(e) => handleJenisChange(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  >
                    <optgroup label="Pelanggaran Ringan (5 - 10 Poin)">
                      {REFERENSI_PELANGGARAN.filter(r => r.kategori === 'Ringan').map(r => (
                        <option key={r.nama} value={r.nama}>{r.nama} ({r.poin} Poin)</option>
                      ))}
                    </optgroup>
                    <optgroup label="Pelanggaran Sedang (15 - 25 Poin)">
                      {REFERENSI_PELANGGARAN.filter(r => r.kategori === 'Sedang').map(r => (
                        <option key={r.nama} value={r.nama}>{r.nama} ({r.poin} Poin)</option>
                      ))}
                    </optgroup>
                    <optgroup label="Pelanggaran Berat (50 - 100 Poin)">
                      {REFERENSI_PELANGGARAN.filter(r => r.kategori === 'Berat').map(r => (
                        <option key={r.nama} value={r.nama}>{r.nama} ({r.poin} Poin)</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Kategori Pelanggaran (Otomatis)
                    </label>
                    <select
                      value={formKategori}
                      onChange={(e) => setFormKategori(e.target.value as KategoriPelanggaran)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold bg-white text-rose-700"
                    >
                      <option value="Ringan">Ringan</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Berat">Berat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Bobot Poin (Otomatis)
                    </label>
                    <input
                      type="number"
                      value={formPoin}
                      onChange={(e) => setFormPoin(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg font-extrabold bg-white text-rose-700"
                      min={1}
                      max={150}
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: 16 Lokasi Kejadian & 5 Aktivitas Saat Pelanggaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    4. Lokasi Kejadian (16 Lokasi Standar) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium bg-slate-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  >
                    {LOKASI_KEJADIAN_LIST.map(lokasi => (
                      <option key={lokasi} value={lokasi}>{lokasi}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    5. Aktivitas Saat Pelanggaran (5 Aktivitas Standar) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formAktivitas}
                    onChange={(e) => setFormAktivitas(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium bg-slate-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  >
                    {AKTIVITAS_PELANGGARAN_LIST.map(akt => (
                      <option key={akt} value={akt}>{akt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Tindak Lanjut & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    6. Tindak Lanjut Penanganan <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formTindakLanjut}
                    onChange={(e) => setFormTindakLanjut(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium bg-slate-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  >
                    {TINDAK_LANJUT_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Penanganan Kasus
                  </label>
                  <select
                    value={formStatusPenanganan}
                    onChange={(e) => setFormStatusPenanganan(e.target.value as StatusTindakLanjut)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold bg-slate-50 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="Selesai">Selesai (Teguran/Refleksi Tuntas)</option>
                    <option value="Dalam Pembinaan">Dalam Pembinaan Wali Kelas / BK</option>
                    <option value="Panggilan Orang Tua">Panggilan Orang Tua / Wali Murid</option>
                    <option value="Konseling TPPK">Konseling Khusus Tim TPPK</option>
                  </select>
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Tambahan & Kronologi Kejadian Singkat
                </label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Tuliskan keterangan saksi, kronologi singkat, atau kesepakatan pembinaan..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Guru / Petugas Pencatat */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Guru / Petugas Tim TPPK Pencatat
                </label>
                <input
                  type="text"
                  value={formPetugas}
                  onChange={(e) => setFormPetugas(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Pelanggaran & Update Poin'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar for Batch Delete */}
      {selectedViolationIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700 py-3 px-5 flex flex-wrap items-center justify-between gap-3 pointer-events-auto max-w-2xl w-full animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold">
                <strong className="text-rose-400 font-black">{selectedViolationIds.length}</strong> Catatan Pelanggaran Terpilih
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(true)}
                className="px-4 py-1.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus {selectedViolationIds.length} Terpilih</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HAPUS SEBAGIAN PELANGGARAN TERPILIH */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-rose-700 to-rose-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Trash2 className="w-6 h-6 text-rose-200" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    Hapus {selectedViolationIds.length} Catatan Pelanggaran
                  </h3>
                  <p className="text-xs text-rose-200">
                    Konfirmasi penghapusan sebagian catatan disiplin terpilih
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

            <div className="p-5 space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-xs text-rose-950 leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold block text-rose-950 mb-0.5">PERINGATAN PENGHAPUSAN:</strong>
                  Anda akan menghapus <strong>{selectedViolationIds.length} catatan pelanggaran</strong> secara permanen. Pengurangan poin pada saldo karakter siswa yang bersangkutan akan dikembalikan secara otomatis.
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Daftar Pelanggaran yang Akan Dihapus:</span>
                  <span className="text-slate-500 font-mono text-[11px]">{selectedViolationIds.length} catatan</span>
                </div>
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                  {selectedViolations.map(v => (
                    <div key={v.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-white transition-colors">
                      <div>
                        <div className="font-bold text-slate-900">{v.namaSiswa} <span className="font-normal text-slate-500">(Kelas {v.kelas})</span></div>
                        <div className="text-[11px] text-slate-600">{v.jenisPelanggaran}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{v.tanggal} &bull; {v.lokasiKejadian}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                          +{v.poin} Poin
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
                  <span>Ya, Hapus {selectedViolationIds.length} Pelanggaran</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HAPUS SELURUH DATA PELANGGARAN KELAS ATAU SEKOLAH */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-red-700 via-rose-800 to-rose-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Trash2 className="w-6 h-6 text-rose-200" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    Hapus Seluruh Data Pelanggaran {filterKelas !== 'all' ? `Kelas ${filterKelas}` : 'Sekolah'}
                  </h3>
                  <p className="text-xs text-rose-200">
                    Pembersihan seluruh catatan disiplin di UPT SDN Kebonagung
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-xs text-rose-950 leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold block text-rose-950 mb-0.5">PERINGATAN BERSIHKAN DATA:</strong>
                  Tindakan ini akan <strong>menghapus SELURUH ({filterKelas !== 'all' ? pelanggaranList.filter(p => p.kelas === filterKelas).length : pelanggaranList.length} catatan) data pelanggaran {filterKelas !== 'all' ? `di Kelas ${filterKelas}` : 'di seluruh sekolah'}</strong>. Saldo karakter dan status risiko seluruh siswa akan diperbarui secara otomatis.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Target Rombel / Kelas:</span>
                  <span className="font-black text-rose-700">{filterKelas !== 'all' ? `Kelas ${filterKelas}` : 'Semua Rombel Sekolah'}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Jumlah Catatan yang Akan Dihapus:</span>
                  <span className="font-black text-slate-900 font-mono">
                    {filterKelas !== 'all' ? pelanggaranList.filter(p => p.kelas === filterKelas).length : pelanggaranList.length} Catatan
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteAll}
                  className="px-5 py-2 text-xs font-black text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Seluruh Data {filterKelas !== 'all' ? `Kelas ${filterKelas}` : 'Sekolah'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
