import React, { useState, useMemo } from 'react';
import { 
  Student, 
  PelanggaranRecord, 
  RewardRecord, 
  AttendanceRecord, 
  MasterKelas, 
  UserRole,
  SystemSettings 
} from '../types';
import { 
  FileText, 
  Printer, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  Award, 
  AlertTriangle, 
  UserCheck, 
  Users, 
  Medal, 
  BellRing,
  School
} from 'lucide-react';

interface LaporanViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  rewardList: RewardRecord[];
  attendanceList: AttendanceRecord[];
  masterKelas: MasterKelas[];
  systemSettings: SystemSettings;
  role: UserRole;
  onPrintOfficialReport?: (type: string, data: any) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  students,
  pelanggaranList,
  rewardList,
  attendanceList,
  masterKelas,
  systemSettings,
  role
}) => {
  const [activeLaporanType, setActiveLaporanType] = useState<
    'absensi' | 'pelanggaran' | 'reward' | 'poin_karakter' | 'per_kelas' | 'per_siswa' | 'monitoring'
  >('absensi');

  const [filterStartDate, setFilterStartDate] = useState<string>('2026-07-01');
  const [filterEndDate, setFilterEndDate] = useState<string>('2026-09-30');
  const [filterKelas, setFilterKelas] = useState<string>('ALL');
  const [filterKategori, setFilterKategori] = useState<string>('ALL');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // 1. FILTERED ABSENSI
  const reportAbsensi = useMemo(() => {
    return attendanceList
      .filter(a => filterKelas === 'ALL' || a.kelas === filterKelas)
      .filter(a => (!filterStartDate || a.tanggal >= filterStartDate) && (!filterEndDate || a.tanggal <= filterEndDate))
      .filter(a => {
        if (!searchStudent.trim()) return true;
        const q = searchStudent.toLowerCase();
        return a.nama.toLowerCase().includes(q) || a.nisn.includes(q);
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [attendanceList, filterKelas, filterStartDate, filterEndDate, searchStudent]);

  // 2. FILTERED PELANGGARAN
  const reportPelanggaran = useMemo(() => {
    return pelanggaranList
      .filter(p => filterKelas === 'ALL' || p.kelas === filterKelas)
      .filter(p => filterKategori === 'ALL' || p.kategori === filterKategori)
      .filter(p => (!filterStartDate || p.tanggal >= filterStartDate) && (!filterEndDate || p.tanggal <= filterEndDate))
      .filter(p => {
        if (!searchStudent.trim()) return true;
        const q = searchStudent.toLowerCase();
        return p.namaSiswa.toLowerCase().includes(q) || p.nisn.includes(q);
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [pelanggaranList, filterKelas, filterKategori, filterStartDate, filterEndDate, searchStudent]);

  // 3. FILTERED REWARD
  const reportReward = useMemo(() => {
    return rewardList
      .filter(r => filterKelas === 'ALL' || r.kelas === filterKelas)
      .filter(r => filterKategori === 'ALL' || r.kategori === filterKategori)
      .filter(r => (!filterStartDate || r.tanggal >= filterStartDate) && (!filterEndDate || r.tanggal <= filterEndDate))
      .filter(r => {
        if (!searchStudent.trim()) return true;
        const q = searchStudent.toLowerCase();
        return r.namaSiswa.toLowerCase().includes(q) || r.nisn.includes(q);
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [rewardList, filterKelas, filterKategori, filterStartDate, filterEndDate, searchStudent]);

  // 4. FILTERED POIN KARAKTER
  const reportPoinKarakter = useMemo(() => {
    return students
      .filter(s => filterKelas === 'ALL' || s.kelas === filterKelas)
      .filter(s => {
        if (!searchStudent.trim()) return true;
        const q = searchStudent.toLowerCase();
        return s.namaLengkap.toLowerCase().includes(q) || s.nisn.includes(q);
      })
      .map(s => {
        const pList = pelanggaranList.filter(p => p.nisn === s.nisn);
        const rList = rewardList.filter(r => r.nisn === s.nisn);
        const totalP = pList.reduce((acc, c) => acc + c.poin, 0);
        const totalR = rList.reduce((acc, c) => acc + c.poin, 0);
        const saldo = totalR - totalP;
        return {
          student: s,
          totalR,
          totalP,
          saldo,
          countP: pList.length,
          countR: rList.length
        };
      })
      .sort((a, b) => b.saldo - a.saldo);
  }, [students, pelanggaranList, rewardList, filterKelas, searchStudent]);

  // 5. FILTERED PER KELAS
  const reportPerKelas = useMemo(() => {
    const list = filterKelas === 'ALL' ? masterKelas : masterKelas.filter(k => k.kelas === filterKelas);
    return list.map(k => {
      const classStudents = students.filter(s => s.kelas === k.kelas);
      const classPelanggaran = pelanggaranList.filter(p => p.kelas === k.kelas);
      const classReward = rewardList.filter(r => r.kelas === k.kelas);
      const classAtt = attendanceList.filter(a => a.kelas === k.kelas);
      const hadirCount = classAtt.filter(a => a.status === 'Hadir' || a.status === 'Dispensasi').length;
      const pctHadir = classAtt.length > 0 ? Math.round((hadirCount / classAtt.length) * 100) : 100;

      return {
        kelas: k.kelas,
        waliKelas: k.waliKelas,
        totalSiswa: classStudents.length,
        totalPelanggaran: classPelanggaran.length,
        poinPelanggaran: classPelanggaran.reduce((acc, c) => acc + c.poin, 0),
        totalReward: classReward.length,
        poinReward: classReward.reduce((acc, c) => acc + c.poin, 0),
        persentaseKehadiran: pctHadir
      };
    });
  }, [masterKelas, students, pelanggaranList, rewardList, attendanceList, filterKelas]);

  // 6. FILTERED MONITORING
  const reportMonitoring = useMemo(() => {
    return students
      .filter(s => filterKelas === 'ALL' || s.kelas === filterKelas)
      .filter(s => {
        if (!searchStudent.trim()) return true;
        const q = searchStudent.toLowerCase();
        return s.namaLengkap.toLowerCase().includes(q) || s.nisn.includes(q);
      })
      .filter(s => s.statusResiko !== 'Aman' || s.totalPoinPelanggaran >= 15);
  }, [students, filterKelas, searchStudent]);

  // Handle Export CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    const filenamePrefix = `Laporan_${activeLaporanType.toUpperCase()}_SDN_Kebonagung`;

    if (activeLaporanType === 'absensi') {
      headers = ['Tanggal', 'NISN', 'Nama Siswa', 'Kelas', 'Status Kehadiran', 'Keterangan', 'Input Oleh'];
      rows = reportAbsensi.map(a => [
        `"${a.tanggal}"`,
        `"${a.nisn}"`,
        `"${a.nama}"`,
        `"${a.kelas}"`,
        `"${a.status}"`,
        `"${a.keterangan || '-'}"`,
        `"${a.inputOleh}"`
      ]);
    } else if (activeLaporanType === 'pelanggaran') {
      headers = ['Tanggal', 'Jam', 'NISN', 'Nama Siswa', 'Kelas', 'Jenis Pelanggaran', 'Kategori', 'Lokasi', 'Poin', 'Tindak Lanjut', 'Petugas'];
      rows = reportPelanggaran.map(p => [
        `"${p.tanggal}"`,
        `"${p.jam}"`,
        `"${p.nisn}"`,
        `"${p.namaSiswa}"`,
        `"${p.kelas}"`,
        `"${p.jenisPelanggaran}"`,
        `"${p.kategori}"`,
        `"${p.lokasiKejadian}"`,
        p.poin,
        `"${p.tindakLanjut}"`,
        `"${p.petugas}"`
      ]);
    } else if (activeLaporanType === 'reward') {
      headers = ['Tanggal', 'NISN', 'Nama Siswa', 'Kelas', 'Jenis Reward', 'Kategori', 'Tingkat', 'Poin', 'Catatan', 'Petugas'];
      rows = reportReward.map(r => [
        `"${r.tanggal}"`,
        `"${r.nisn}"`,
        `"${r.namaSiswa}"`,
        `"${r.kelas}"`,
        `"${r.jenisReward}"`,
        `"${r.kategori}"`,
        `"${r.tingkat}"`,
        r.poin,
        `"${r.catatan}"`,
        `"${r.petugas}"`
      ]);
    } else if (activeLaporanType === 'poin_karakter') {
      headers = ['NISN', 'Nama Siswa', 'Kelas', 'Poin Reward (+)', 'Poin Pelanggaran (-)', 'Saldo Poin Karakter'];
      rows = reportPoinKarakter.map(k => [
        `"${k.student.nisn}"`,
        `"${k.student.namaLengkap}"`,
        `"${k.student.kelas}"`,
        k.totalR,
        k.totalP,
        k.saldo
      ]);
    } else if (activeLaporanType === 'per_kelas') {
      headers = ['Kelas', 'Wali Kelas', 'Jumlah Siswa', 'Kasus Pelanggaran', 'Poin Pelanggaran', 'Jumlah Reward', 'Poin Reward', 'Kehadiran (%)'];
      rows = reportPerKelas.map(k => [
        `"${k.kelas}"`,
        `"${k.waliKelas}"`,
        k.totalSiswa,
        k.totalPelanggaran,
        k.poinPelanggaran,
        k.totalReward,
        k.poinReward,
        `"${k.persentaseKehadiran}%"`
      ]);
    } else {
      headers = ['NISN', 'Nama Siswa', 'Kelas', 'Wali Kelas', 'Total Pelanggaran', 'Total Poin Pelanggaran', 'Status Resiko', 'No HP Ortu'];
      rows = reportMonitoring.map(s => [
        `"${s.nisn}"`,
        `"${s.namaLengkap}"`,
        `"${s.kelas}"`,
        `"${s.waliKelas}"`,
        pelanggaranList.filter(p => p.nisn === s.nisn).length,
        s.totalPoinPelanggaran,
        `"${s.statusResiko}"`,
        `"${s.noHpOrangTua}"`
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 mb-2">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Pusat Laporan & Rekapitulasi Resmi</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Digital STAR-KIDS
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Ekspor data komprehensif, cetak format resmi siap tanda tangan, dan filter arsip berkala.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Unduh Spreadsheet (.CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* Submenu Navigation Pills */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {(
            [
              { id: 'absensi', label: '1. Laporan Absensi', icon: UserCheck },
              { id: 'pelanggaran', label: '2. Laporan Pelanggaran', icon: AlertTriangle },
              { id: 'reward', label: '3. Laporan Reward', icon: Award },
              { id: 'poin_karakter', label: '4. Laporan Poin Karakter', icon: Medal },
              { id: 'per_kelas', label: '5. Laporan Per Kelas', icon: School },
              { id: 'monitoring', label: '6. Laporan Monitoring Siswa', icon: BellRing },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveLaporanType(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeLaporanType === tab.id
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Universal Filter Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Parameter Filter Laporan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Awal</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pilih Kelas</label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kelas (1A - 6B)</option>
              {masterKelas.map(k => (
                <option key={k.kelas} value={k.kelas}>Kelas {k.kelas}</option>
              ))}
            </select>
          </div>

          {(activeLaporanType === 'pelanggaran' || activeLaporanType === 'reward') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori</label>
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Kategori</option>
                {activeLaporanType === 'pelanggaran' ? (
                  <>
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </>
                ) : (
                  <>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Afektif">Afektif</option>
                    <option value="Pembiasaan Baik">Pembiasaan Baik</option>
                  </>
                )}
              </select>
            </div>
          )}

          <div className={(activeLaporanType === 'pelanggaran' || activeLaporanType === 'reward') ? '' : 'sm:col-span-2'}>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cari Siswa / NISN</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ketik nama atau NISN..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-FRIENDLY KOP SURAT SECTION (Visible on print) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Official Header */}
        <div className="p-6 border-b border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            PEMERINTAH KOTA PASURUAN &bull; DINAS PENDIDIKAN DAN KEBUDAYAAN
          </p>
          <h2 className="text-lg font-black text-slate-900 tracking-wide uppercase">
            UPT SATUAN PENDIDIKAN FORMAL SDN KEBONAGUNG
          </h2>
          <p className="text-xs text-slate-600">
            Jl. Raya Kebonagung, Kec. Purworejo, Kota Pasuruan, Jawa Timur 67116 &bull; NPSN: 20535400
          </p>
          <div className="pt-2">
            <span className="inline-block border-t-2 border-b-2 border-slate-900 py-0.5 px-4 text-xs font-black uppercase tracking-wider">
              {activeLaporanType === 'absensi' && 'REKAPITULASI PRESENSI & KEHADIRAN SISWA'}
              {activeLaporanType === 'pelanggaran' && 'LAPORAN REKAPITULASI PELANGGARAN TATA TERTIB'}
              {activeLaporanType === 'reward' && 'LAPORAN APRESIASI & PRESTASI KARAKTER SISWA'}
              {activeLaporanType === 'poin_karakter' && 'BUKU INDUK SALDO POIN KARAKTER SISWA'}
              {activeLaporanType === 'per_kelas' && 'LAPORAN REKAPITULASI KEDISIPLINAN PER ROMBEL KELAS'}
              {activeLaporanType === 'monitoring' && 'DAFTAR PEMANTAUAN KHUSUS SISWA TIM TPPK'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Periode: {filterStartDate} s/d {filterEndDate} &bull; Tahun Ajaran {systemSettings.tahunAjaran} ({systemSettings.semester})
          </p>
        </div>

        {/* 1. TABLE: ABSENSI */}
        {activeLaporanType === 'absensi' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-28">Tanggal</th>
                  <th className="py-2.5 px-3 w-28">NISN</th>
                  <th className="py-2.5 px-4">Nama Siswa</th>
                  <th className="py-2.5 px-3 text-center">Kelas</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-4">Keterangan</th>
                  <th className="py-2.5 px-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {reportAbsensi.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">Tidak ada data presensi yang sesuai kriteria.</td>
                  </tr>
                ) : (
                  reportAbsensi.map((a, i) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center text-slate-500">{i + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{a.tanggal}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{a.nisn}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{a.nama}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{a.kelas}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold">{a.status}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{a.keterangan || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-500">{a.inputOleh}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. TABLE: PELANGGARAN */}
        {activeLaporanType === 'pelanggaran' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-28">Tanggal</th>
                  <th className="py-2.5 px-4">Nama Siswa</th>
                  <th className="py-2.5 px-3 text-center">Kelas</th>
                  <th className="py-2.5 px-4">Jenis Pelanggaran</th>
                  <th className="py-2.5 px-3 text-center">Kategori</th>
                  <th className="py-2.5 px-3">Lokasi</th>
                  <th className="py-2.5 px-3 text-right">Poin</th>
                  <th className="py-2.5 px-4">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {reportPelanggaran.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">Tidak ada data pelanggaran yang sesuai kriteria.</td>
                  </tr>
                ) : (
                  reportPelanggaran.map((p, i) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center text-slate-500">{i + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{p.tanggal}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{p.namaSiswa}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{p.kelas}</td>
                      <td className="py-2.5 px-4 text-slate-800">{p.jenisPelanggaran}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{p.kategori}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.lokasiKejadian}</td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-700">−{p.poin}</td>
                      <td className="py-2.5 px-4 text-slate-700">{p.tindakLanjut}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. TABLE: REWARD */}
        {activeLaporanType === 'reward' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-28">Tanggal</th>
                  <th className="py-2.5 px-4">Nama Siswa</th>
                  <th className="py-2.5 px-3 text-center">Kelas</th>
                  <th className="py-2.5 px-4">Bentuk Apresiasi / Reward</th>
                  <th className="py-2.5 px-3 text-center">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Tingkat</th>
                  <th className="py-2.5 px-3 text-right">Poin</th>
                  <th className="py-2.5 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {reportReward.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">Tidak ada data reward yang sesuai kriteria.</td>
                  </tr>
                ) : (
                  reportReward.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center text-slate-500">{i + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.tanggal}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{r.namaSiswa}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{r.kelas}</td>
                      <td className="py-2.5 px-4 text-slate-800 font-bold">{r.jenisReward}</td>
                      <td className="py-2.5 px-3 text-center font-semibold">{r.kategori}</td>
                      <td className="py-2.5 px-3 text-center font-semibold">{r.tingkat}</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-700">+{r.poin}</td>
                      <td className="py-2.5 px-4 text-slate-600 italic">"{r.catatan}"</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. TABLE: POIN KARAKTER */}
        {activeLaporanType === 'poin_karakter' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-28">NISN</th>
                  <th className="py-2.5 px-4">Nama Siswa</th>
                  <th className="py-2.5 px-3 text-center">Kelas</th>
                  <th className="py-2.5 px-3 text-center">Reward Didapat</th>
                  <th className="py-2.5 px-3 text-center">Poin Reward (+)</th>
                  <th className="py-2.5 px-3 text-center">Pelanggaran</th>
                  <th className="py-2.5 px-3 text-center">Poin Plg. (−)</th>
                  <th className="py-2.5 px-3 text-center font-black text-blue-900">Saldo Karakter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {reportPoinKarakter.map((k, i) => (
                  <tr key={k.student.nisn} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center text-slate-500">{i + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{k.student.nisn}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{k.student.namaLengkap}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{k.student.kelas}</td>
                    <td className="py-2.5 px-3 text-center">{k.countR} Kali</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">+{k.totalR}</td>
                    <td className="py-2.5 px-3 text-center">{k.countP} Kali</td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-700">−{k.totalP}</td>
                    <td className="py-2.5 px-3 text-center font-black text-blue-900 bg-blue-50/50">
                      {k.saldo >= 0 ? `+${k.saldo}` : k.saldo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. TABLE: PER KELAS */}
        {activeLaporanType === 'per_kelas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 text-center">Kelas</th>
                  <th className="py-2.5 px-4">Wali Kelas</th>
                  <th className="py-2.5 px-3 text-center">Jml Siswa</th>
                  <th className="py-2.5 px-3 text-center">Kasus Pelanggaran</th>
                  <th className="py-2.5 px-3 text-center">Poin Pelanggaran</th>
                  <th className="py-2.5 px-3 text-center">Piagam Reward</th>
                  <th className="py-2.5 px-3 text-center">Poin Reward</th>
                  <th className="py-2.5 px-3 text-center">% Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {reportPerKelas.map((k, i) => (
                  <tr key={k.kelas} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center text-slate-500">{i + 1}</td>
                    <td className="py-2.5 px-3 text-center font-black text-slate-900">{k.kelas}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-700">{k.waliKelas}</td>
                    <td className="py-2.5 px-3 text-center">{k.totalSiswa}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-700">{k.totalPelanggaran}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-700">−{k.poinPelanggaran}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{k.totalReward}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">+{k.poinReward}</td>
                    <td className="py-2.5 px-3 text-center font-extrabold text-blue-900">{k.persentaseKehadiran}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. TABLE: MONITORING */}
        {activeLaporanType === 'monitoring' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3 w-28">NISN</th>
                  <th className="py-2.5 px-4">Nama Siswa</th>
                  <th className="py-2.5 px-3 text-center">Kelas</th>
                  <th className="py-2.5 px-4">Wali Kelas</th>
                  <th className="py-2.5 px-3 text-center">Kasus</th>
                  <th className="py-2.5 px-3 text-center">Poin Plg.</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Kontak Ortu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {reportMonitoring.map((s, i) => (
                  <tr key={s.nisn} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center text-slate-500">{i + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{s.nisn}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{s.namaLengkap}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{s.kelas}</td>
                    <td className="py-2.5 px-4 text-slate-700">{s.waliKelas}</td>
                    <td className="py-2.5 px-3 text-center">{pelanggaranList.filter(p => p.nisn === s.nisn).length} Kali</td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-700">−{s.totalPoinPelanggaran}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-900">
                        {s.statusResiko}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{s.noHpOrangTua}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signature Section */}
        <div className="p-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-700 font-semibold">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold text-slate-900">Kepala UPT SDN Kebonagung</p>
            <div className="h-20" />
            <p className="font-bold text-slate-900 underline">H. SUHARTONO, S.Pd., M.M.</p>
            <p className="text-[11px] text-slate-500">NIP. 19680512 199303 1 008</p>
          </div>

          <div>
            <p>Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold text-slate-900">Ketua Tim TPPK Sekolah</p>
            <div className="h-20" />
            <p className="font-bold text-slate-900 underline">NURUL HIDAYATI, S.Pd.SD.</p>
            <p className="text-[11px] text-slate-500">NIP. 19790815 200801 2 015</p>
          </div>
        </div>

      </div>

    </div>
  );
};
