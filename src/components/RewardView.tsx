import React, { useState, useMemo } from 'react';
import { Student, RewardRecord, UserRole, KategoriReward, TingkatReward } from '../types';
import { 
  DAFTAR_KELAS, 
  REFERENSI_REWARD, 
  MAPEL_OPTIONS 
} from '../data/constants';
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Calendar, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Trophy,
  Heart,
  Medal,
  X,
  FileBadge
} from 'lucide-react';

interface RewardViewProps {
  students: Student[];
  rewardList: RewardRecord[];
  role: UserRole;
  onAddReward: (reward: Omit<RewardRecord, 'id'>) => void;
  onUpdateReward: (id: string, updated: Partial<RewardRecord>) => void;
  onDeleteReward: (id: string) => void;
}

export const RewardView: React.FC<RewardViewProps> = ({
  students,
  rewardList,
  role,
  onAddReward,
  onUpdateReward,
  onDeleteReward
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterKategori, setFilterKategori] = useState<'all' | KategoriReward>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RewardRecord | null>(null);

  // Certificate Modal State
  const [certRecord, setCertRecord] = useState<RewardRecord | null>(null);

  // Form State
  const [formKelas, setFormKelas] = useState<string>('6A');
  const [formNisn, setFormNisn] = useState<string>('');
  const [formTanggal, setFormTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formKategori, setFormKategori] = useState<KategoriReward>('Prestasi');
  const [formTingkat, setFormTingkat] = useState<TingkatReward>('Kota');
  const [formJenis, setFormJenis] = useState<string>(REFERENSI_REWARD[0].nama);
  const [formPoin, setFormPoin] = useState<number>(REFERENSI_REWARD[0].poin);
  const [formMapel, setFormMapel] = useState<string>(REFERENSI_REWARD[0].rekomendasiMapel);
  const [formPoinBonus, setFormPoinBonus] = useState<number>(REFERENSI_REWARD[0].bonusNilaiMapel);
  const [formPredikat, setFormPredikat] = useState<string>('Sangat Baik (A)');
  const [formCatatan, setFormCatatan] = useState<string>('');
  const [formPetugas, setFormPetugas] = useState<string>('Tim TPPK & Wali Kelas');

  const studentsInFormKelas = useMemo(() => {
    return students.filter(s => s.kelas === formKelas);
  }, [students, formKelas]);

  // Handle Preset Selection
  const handlePresetSelect = (presetName: string) => {
    setFormJenis(presetName);
    const item = REFERENSI_REWARD.find(r => r.nama === presetName);
    if (item) {
      setFormKategori(item.kategori);
      setFormTingkat(item.tingkat);
      setFormPoin(item.poin);
      setFormMapel(item.rekomendasiMapel);
      setFormPoinBonus(item.bonusNilaiMapel);
      setFormPredikat('Sangat Baik (A)');
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormKelas('6A');
    const firstStudent = students.find(s => s.kelas === '6A');
    setFormNisn(firstStudent ? firstStudent.nisn : '');
    setFormTanggal(new Date().toISOString().split('T')[0]);
    handlePresetSelect(REFERENSI_REWARD[0].nama);
    setFormCatatan('');
    setFormPetugas('Tim TPPK & Wali Kelas');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RewardRecord) => {
    setEditingItem(item);
    setFormKelas(item.kelas);
    setFormNisn(item.nisn);
    setFormTanggal(item.tanggal);
    setFormJenis(item.jenisReward);
    setFormKategori(item.kategori);
    setFormTingkat(item.tingkat);
    setFormPoin(item.poin);
    setFormMapel(item.konversiNilai.mataPelajaran);
    setFormPoinBonus(item.konversiNilai.poinBonus);
    setFormPredikat(item.konversiNilai.predikat);
    setFormCatatan(item.catatan);
    setFormPetugas(item.petugas);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find(s => s.nisn === formNisn);
    const namaSiswa = targetStudent ? targetStudent.namaLengkap : 'Siswa Berprestasi SDN Kebonagung';

    if (editingItem) {
      onUpdateReward(editingItem.id, {
        tanggal: formTanggal,
        nisn: formNisn,
        namaSiswa,
        kelas: formKelas,
        jenisReward: formJenis,
        kategori: formKategori,
        tingkat: formTingkat,
        poin: Number(formPoin),
        konversiNilai: {
          mataPelajaran: formMapel,
          poinBonus: Number(formPoinBonus),
          predikat: formPredikat
        },
        catatan: formCatatan,
        petugas: formPetugas,
        syncedToSheet: true
      });
    } else {
      onAddReward({
        tanggal: formTanggal,
        nisn: formNisn,
        namaSiswa,
        kelas: formKelas,
        jenisReward: formJenis,
        kategori: formKategori,
        tingkat: formTingkat,
        poin: Number(formPoin),
        konversiNilai: {
          mataPelajaran: formMapel,
          poinBonus: Number(formPoinBonus),
          predikat: formPredikat
        },
        catatan: formCatatan,
        petugas: formPetugas,
        syncedToSheet: true
      });
    }
    setIsModalOpen(false);
  };

  const filteredList = useMemo(() => {
    return rewardList.filter(item => {
      const matchSearch = 
        item.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jenisReward.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nisn.includes(searchTerm);
      const matchKelas = filterKelas === 'all' || item.kelas === filterKelas;
      const matchKategori = filterKategori === 'all' || item.kategori === filterKategori;
      return matchSearch && matchKelas && matchKategori;
    });
  }, [rewardList, searchTerm, filterKelas, filterKategori]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Apresiasi Karakter & Prestasi Murid</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Data Reward & Konversi Nilai
          </h1>
          <p className="text-xs text-slate-500">
            Pemberian poin karakter positif, pencatatan prestasi lomba, serta konversi nilai tambahan raport
          </p>
        </div>

        {role === 'admin' ? (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Beri Apresiasi / Reward</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium self-start md:self-auto">
            Mode Tinjauan (View Only)
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama siswa, NISN, atau jenis penghargaan..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold hidden sm:inline">Kelas:</span>
          </div>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Kelas</option>
            {DAFTAR_KELAS.map(k => (
              <option key={k} value={k}>Kelas {k}</option>
            ))}
          </select>

          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="Prestasi">Prestasi (Lomba)</option>
            <option value="Afektif">Afektif (Sikap Baik)</option>
            <option value="Teladan">Teladan (Bintang Karakter)</option>
          </select>
        </div>
      </div>

      {/* Main Table Records */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Siswa & Rombel</th>
                <th className="py-3 px-4">Penghargaan & Kategori</th>
                <th className="py-3 px-4">Poin Reward</th>
                <th className="py-3 px-4">Konversi Nilai Raport</th>
                <th className="py-3 px-4">Petugas / Pemberi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Tidak ditemukan data reward yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                      {item.tanggal}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.namaSiswa}</div>
                      <div className="text-[11px] text-slate-500">
                        NISN: {item.nisn} &bull; <span className="font-semibold text-blue-700">Kelas {item.kelas}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 leading-snug">
                        {item.jenisReward}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.kategori === 'Prestasi' ? 'bg-blue-100 text-blue-800' :
                          item.kategori === 'Afektif' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {item.kategori} &bull; Tingkat {item.tingkat}
                        </span>
                        {item.catatan && (
                          <span className="text-[11px] text-slate-500 truncate max-w-40" title={item.catatan}>
                            {item.catatan}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                        +{item.poin} Poin
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-bold text-xs flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.konversiNilai.mataPelajaran}</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        Bonus +{item.konversiNilai.poinBonus} Nilai ({item.konversiNilai.predikat})
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {item.petugas}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Tombol Piagam */}
                        <button
                          onClick={() => setCertRecord(item)}
                          title="Lihat & Cetak Piagam Apresiasi Karakter"
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileBadge className="w-4 h-4" />
                        </button>

                        {role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Data Reward"
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus reward untuk ${item.namaSiswa}?`)) {
                                  onDeleteReward(item.id);
                                }
                              }}
                              title="Hapus Reward"
                              className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Menampilkan <strong>{filteredList.length}</strong> dari <strong>{rewardList.length}</strong> catatan apresiasi</span>
          <span className="text-[11px] text-slate-500">Nilai bonus otomatis terkonversi pada lembar raport karakter Profil Pelajar Pancasila</span>
        </div>
      </div>

      {/* Modal Form Input / Edit Reward */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingItem ? 'Edit Data Apresiasi' : 'Beri Reward & Konversi Nilai Karakter'}
                  </h3>
                  <p className="text-xs text-amber-100">
                    Apresiasi pembiasaan baik, prestasi, dan keteladanan siswa
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              
              {/* Row 1: Pilih Kelas -> Siswa Otomatis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    1. Pilih Kelas <span className="text-amber-600">*</span>
                  </label>
                  <select
                    value={formKelas}
                    onChange={(e) => {
                      const newKelas = e.target.value;
                      setFormKelas(newKelas);
                      const studentInNewClass = students.find(s => s.kelas === newKelas);
                      if (studentInNewClass) setFormNisn(studentInNewClass.nisn);
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  >
                    {DAFTAR_KELAS.map(k => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. Pilih Nama Siswa <span className="text-amber-600">*</span>
                  </label>
                  <select
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  >
                    {studentsInFormKelas.map(s => (
                      <option key={s.nisn} value={s.nisn}>
                        {s.namaLengkap} ({s.nisn}) - Reward Sekarang: +{s.totalPoinReward}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preset Pilihan Cepat Reward */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>3. Pilih Kategori Reward Standar (Poin & Konversi Otomatis)</span>
                  <span className="text-[10px] text-amber-700 font-semibold">Skema Otomatis</span>
                </label>
                <select
                  value={formJenis}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium bg-amber-50/40 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                >
                  <optgroup label="Prestasi Lomba / Kejuaraan">
                    {REFERENSI_REWARD.filter(r => r.kategori === 'Prestasi').map(r => (
                      <option key={r.nama} value={r.nama}>{r.nama} (+{r.poin} Poin)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Afektif (Sikap Baik & Pembiasaan)">
                    {REFERENSI_REWARD.filter(r => r.kategori === 'Afektif').map(r => (
                      <option key={r.nama} value={r.nama}>{r.nama} (+{r.poin} Poin)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Teladan (Bintang Pelajar)">
                    {REFERENSI_REWARD.filter(r => r.kategori === 'Teladan').map(r => (
                      <option key={r.nama} value={r.nama}>{r.nama} (+{r.poin} Poin)</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Rincian Poin & Tingkat */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Kategori Reward
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as KategoriReward)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold bg-white"
                  >
                    <option value="Prestasi">Prestasi</option>
                    <option value="Afektif">Afektif</option>
                    <option value="Teladan">Teladan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tingkat Penghargaan
                  </label>
                  <select
                    value={formTingkat}
                    onChange={(e) => setFormTingkat(e.target.value as TingkatReward)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium bg-white"
                  >
                    <option value="Harian">Harian / Kelas</option>
                    <option value="Sekolah">Sekolah</option>
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kota">Kota Pasuruan</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Poin Reward (Otomatis)
                  </label>
                  <input
                    type="number"
                    value={formPoin}
                    onChange={(e) => setFormPoin(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-extrabold text-amber-700 bg-white"
                    min={1}
                    max={200}
                  />
                </div>
              </div>

              {/* 4. Konversi Nilai Mata Pelajaran */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-700" />
                    Konversi Nilai Mata Pelajaran & Raport
                  </span>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded">
                    Sistem STAR-KIDS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mata Pelajaran yang Mendapat Nilai Bonus
                    </label>
                    <select
                      value={formMapel}
                      onChange={(e) => setFormMapel(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                    >
                      {MAPEL_OPTIONS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Bonus Nilai Tambahan
                    </label>
                    <input
                      type="number"
                      value={formPoinBonus}
                      onChange={(e) => setFormPoinBonus(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg font-extrabold text-emerald-700 bg-white"
                      min={1}
                      max={20}
                    />
                  </div>
                </div>
              </div>

              {/* Tanggal & Petugas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Apresiasi
                  </label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Guru / Petugas Penilai
                  </label>
                  <input
                    type="text"
                    value={formPetugas}
                    onChange={(e) => setFormPetugas(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Catatan / Keterangan Prestasi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Prestasi / Pembiasaan Baik
                </label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Contoh: Menemukan dompet di mushola dan langsung mengembalikan, atau juara 1 lomba..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Buttons */}
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Beri Reward & Tambah Poin'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Piagam Apresiasi Karakter Digital */}
      {certRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-400 w-full max-w-2xl overflow-hidden my-6 p-8 relative">
            <button
              onClick={() => setCertRecord(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 print:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Piagam Certificate Design */}
            <div className="border-2 border-dashed border-amber-500/60 p-6 rounded-2xl text-center space-y-4 bg-gradient-to-b from-amber-50/40 to-white">
              <div className="flex justify-center">
                <div className="p-2.5 bg-amber-100 rounded-full inline-block text-amber-700">
                  <Award className="w-10 h-10" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  PIAGAM APRESIASI KARAKTER DIGITAL
                </h3>
                <h2 className="text-2xl font-extrabold tracking-tight text-blue-950 font-serif">
                  STAR-KIDS SDN KEBONAGUNG
                </h2>
                <p className="text-[11px] text-slate-500">
                  Diberikan sebagai bentuk penghargaan atas keteladanan pembiasaan karakter positif
                </p>
              </div>

              <div className="py-2">
                <p className="text-xs text-slate-600">Diberikan kepada:</p>
                <h3 className="text-xl font-extrabold text-blue-900 underline underline-offset-4 decoration-amber-400">
                  {certRecord.namaSiswa}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  NISN: {certRecord.nisn} &bull; Kelas {certRecord.kelas} UPT SDN Kebonagung
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1">
                <p className="font-bold text-amber-900">{certRecord.jenisReward}</p>
                <p className="text-slate-600">{certRecord.catatan || 'Menunjukkan integritas, prestasi, dan keteladanan Profil Pelajar Pancasila.'}</p>
                <div className="pt-1 flex items-center justify-center gap-3 text-[11px] font-bold text-emerald-700">
                  <span>+{certRecord.poin} Poin Karakter</span>
                  <span>&bull;</span>
                  <span>Bonus Nilai {certRecord.konversiNilai.mataPelajaran} (+{certRecord.konversiNilai.poinBonus})</span>
                </div>
              </div>

              <div className="pt-6 grid grid-cols-2 text-xs text-slate-700">
                <div>
                  <p>Pasuruan, {certRecord.tanggal}</p>
                  <p className="font-bold">Wali Kelas {certRecord.kelas}</p>
                  <div className="h-12"></div>
                  <p className="font-bold underline">{certRecord.petugas}</p>
                </div>
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala UPT SDN Kebonagung</p>
                  <div className="h-12"></div>
                  <p className="font-bold underline">Hj. Sukesi, M.Pd.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setCertRecord(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <FileBadge className="w-4 h-4" />
                <span>Cetak Piagam</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
