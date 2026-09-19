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
  Sparkles
} from 'lucide-react';

interface PelanggaranViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  role: UserRole;
  onAddPelanggaran: (pelanggaran: Omit<PelanggaranRecord, 'id'>) => void;
  onUpdatePelanggaran: (id: string, updated: Partial<PelanggaranRecord>) => void;
  onDeletePelanggaran: (id: string) => void;
  onPrintSurat: (student: Student, pelanggaran: PelanggaranRecord) => void;
}

export const PelanggaranView: React.FC<PelanggaranViewProps> = ({
  students,
  pelanggaranList,
  role,
  onAddPelanggaran,
  onUpdatePelanggaran,
  onDeletePelanggaran,
  onPrintSurat
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterKategori, setFilterKategori] = useState<'all' | KategoriPelanggaran>('all');
  
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

      {/* Main Table Records */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
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
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Tidak ditemukan data pelanggaran yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const student = students.find(s => s.nisn === item.nisn);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
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

    </div>
  );
};
