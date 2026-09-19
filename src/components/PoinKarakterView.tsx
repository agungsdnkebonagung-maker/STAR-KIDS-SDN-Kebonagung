import React, { useState, useMemo } from 'react';
import { Student, PelanggaranRecord, RewardRecord, UserRole } from '../types';
import { DAFTAR_KELAS } from '../data/constants';
import { 
  Award, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Medal,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface PoinKarakterViewProps {
  students: Student[];
  pelanggaranList: PelanggaranRecord[];
  rewardList: RewardRecord[];
  role: UserRole;
  onSelectStudentProfile?: (student: Student) => void;
  onPrintRekapKarakter?: (student: Student) => void;
}

export const PoinKarakterView: React.FC<PoinKarakterViewProps> = ({
  students,
  pelanggaranList,
  rewardList,
  role,
  onSelectStudentProfile,
  onPrintRekapKarakter
}) => {
  const [selectedKelas, setSelectedKelas] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'daftar_saldo' | 'riwayat_transaksi'>('daftar_saldo');

  // Calculate Character Point Balance for Each Student
  const studentBalances = useMemo(() => {
    return students
      .filter(s => selectedKelas === 'ALL' || s.kelas === selectedKelas)
      .filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.namaLengkap.toLowerCase().includes(q) || s.nisn.includes(q);
      })
      .map(student => {
        const studentPelanggaran = pelanggaranList.filter(p => p.nisn === student.nisn);
        const studentRewards = rewardList.filter(r => r.nisn === student.nisn);

        const totalPelanggaranPoin = studentPelanggaran.reduce((acc, curr) => acc + curr.poin, 0);
        const totalRewardPoin = studentRewards.reduce((acc, curr) => acc + curr.poin, 0);
        const saldoKarakter = totalRewardPoin - totalPelanggaranPoin;

        // Predikat Karakter Terpadu
        let predikat = 'Sangat Baik (Bintang Teladan)';
        let badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
        if (saldoKarakter >= 80) {
          predikat = 'Sangat Baik (Bintang Teladan)';
          badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
        } else if (saldoKarakter >= 40) {
          predikat = 'Baik (Karakter Positif)';
          badgeColor = 'bg-blue-100 text-blue-900 border-blue-300';
        } else if (saldoKarakter >= 0) {
          predikat = 'Cukup (Perlu Pembiasaan)';
          badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
        } else {
          predikat = 'Perlu Pendampingan Khusus';
          badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
        }

        return {
          student,
          totalPelanggaranPoin,
          totalRewardPoin,
          saldoKarakter,
          pelanggaranCount: studentPelanggaran.length,
          rewardCount: studentRewards.length,
          predikat,
          badgeColor
        };
      })
      .sort((a, b) => b.saldoKarakter - a.saldoKarakter);
  }, [students, pelanggaranList, rewardList, selectedKelas, searchQuery]);

  // Unified Combined Transaction History
  const transactionHistory = useMemo(() => {
    interface TxItem {
      id: string;
      tanggal: string;
      nisn: string;
      nama: string;
      kelas: string;
      jenis: 'REWARD' | 'PELANGGARAN';
      keterangan: string;
      poin: number;
      badgeText: string;
    }

    const txs: TxItem[] = [];

    rewardList.forEach(r => {
      txs.push({
        id: r.id,
        tanggal: r.tanggal,
        nisn: r.nisn,
        nama: r.namaSiswa,
        kelas: r.kelas,
        jenis: 'REWARD',
        keterangan: `${r.jenisReward} (${r.kategori} - ${r.tingkat})`,
        poin: r.poin,
        badgeText: `+${r.poin} Poin Reward`
      });
    });

    pelanggaranList.forEach(p => {
      txs.push({
        id: p.id,
        tanggal: p.tanggal,
        nisn: p.nisn,
        nama: p.namaSiswa,
        kelas: p.kelas,
        jenis: 'PELANGGARAN',
        keterangan: `${p.jenisPelanggaran} (${p.kategori} di ${p.lokasiKejadian})`,
        poin: -p.poin,
        badgeText: `-${p.poin} Poin Pelanggaran`
      });
    });

    return txs
      .filter(t => selectedKelas === 'ALL' || t.kelas === selectedKelas)
      .filter(t => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return t.nama.toLowerCase().includes(q) || t.nisn.includes(q) || t.keterangan.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [rewardList, pelanggaranList, selectedKelas, searchQuery]);

  // Overall Aggregates
  const totalSekolahReward = useMemo(() => rewardList.reduce((acc, curr) => acc + curr.poin, 0), [rewardList]);
  const totalSekolahPelanggaran = useMemo(() => pelanggaranList.reduce((acc, curr) => acc + curr.poin, 0), [pelanggaranList]);
  const totalSekolahSaldo = totalSekolahReward - totalSekolahPelanggaran;

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['NISN', 'Nama Siswa', 'Kelas', 'Total Poin Reward (+)', 'Total Poin Pelanggaran (-)', 'Saldo Poin Karakter', 'Predikat Karakter'];
    const rows = studentBalances.map(b => [
      `"${b.student.nisn}"`,
      `"${b.student.namaLengkap}"`,
      `"${b.student.kelas}"`,
      b.totalRewardPoin,
      b.totalPelanggaranPoin,
      b.saldoKarakter,
      `"${b.predikat}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STAR_KIDS_Saldo_Poin_Karakter_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Logic Explainer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 mb-2">
            <Medal className="w-3.5 h-3.5 text-amber-600" />
            <span>Poin Karakter Terpadu STAR-KIDS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Akumulasi & Saldo Poin Karakter Siswa
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Transparansi pembiasaan positif: <strong className="text-slate-700">Saldo Karakter = Poin Reward (+) − Poin Pelanggaran (−)</strong>
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('daftar_saldo')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'daftar_saldo'
                ? 'bg-white text-blue-900 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Saldo Siswa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riwayat_transaksi')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'riwayat_transaksi'
                ? 'bg-white text-blue-900 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Transaksi Terpadu
          </button>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-5 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Poin Apresiasi (+)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-2">+{totalSekolahReward}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Dari {rewardList.length} piagam & pembiasaan terpuji</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-amber-50/50 rounded-2xl p-5 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Poin Pelanggaran (−)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-900 mt-2">−{totalSekolahPelanggaran}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-1">Dari {pelanggaranList.length} insiden tata tertib</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Net Saldo Karakter Sekolah</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Medal className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-950 mt-2">
            {totalSekolahSaldo >= 0 ? `+${totalSekolahSaldo}` : totalSekolahSaldo} Poin
          </p>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            Indikator iklim karakter positif SDN Kebonagung
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kelas (28 Rombel)</option>
              {DAFTAR_KELAS.map(k => (
                <option key={k} value={k}>Kelas {k}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari siswa atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Saldo</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DAFTAR SALDO SISWA */}
      {activeTab === 'daftar_saldo' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-12 text-center">Rank</th>
                  <th className="py-3 px-4 w-28">NISN</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-3 text-center">Kelas</th>
                  <th className="py-3 px-4 text-center bg-emerald-50/50 text-emerald-900">Total Reward (+)</th>
                  <th className="py-3 px-4 text-center bg-rose-50/50 text-rose-900">Total Pelanggaran (−)</th>
                  <th className="py-3 px-4 text-center bg-blue-50/70 text-blue-950 font-extrabold">Saldo Karakter</th>
                  <th className="py-3 px-4 text-center">Predikat Karakter</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {studentBalances.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada siswa yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  studentBalances.map((b, idx) => {
                    const isPositive = b.saldoKarakter >= 0;
                    return (
                      <tr key={b.student.nisn} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-extrabold text-slate-600">
                          {idx === 0 ? <span className="text-amber-500 font-black">🥇 1</span> :
                           idx === 1 ? <span className="text-slate-400 font-black">🥈 2</span> :
                           idx === 2 ? <span className="text-amber-700 font-black">🥉 3</span> :
                           idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-600">{b.student.nisn}</td>
                        <td className="py-3 px-4">
                          <span 
                            onClick={() => onSelectStudentProfile?.(b.student)}
                            className="font-extrabold text-slate-900 hover:text-blue-700 cursor-pointer"
                          >
                            {b.student.namaLengkap}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-700">{b.student.kelas}</td>
                        <td className="py-3 px-4 text-center font-extrabold text-emerald-700 bg-emerald-50/30">
                          +{b.totalRewardPoin}
                        </td>
                        <td className="py-3 px-4 text-center font-extrabold text-rose-700 bg-rose-50/30">
                          −{b.totalPelanggaranPoin}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-sm bg-blue-50/50">
                          <span className={isPositive ? 'text-blue-800' : 'text-rose-700'}>
                            {isPositive ? `+${b.saldoKarakter}` : b.saldoKarakter} Poin
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${b.badgeColor}`}>
                            {b.predikat}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectStudentProfile?.(b.student)}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              Profil
                            </button>
                            <button
                              type="button"
                              onClick={() => onPrintRekapKarakter?.(b.student)}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              Cetak Rekap
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
      )}

      {/* VIEW 2: RIWAYAT TRANSAKSI TERPADU */}
      {activeTab === 'riwayat_transaksi' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Riwayat Kejadian Karakter & Apresiasi ({transactionHistory.length} Transaksi)
            </h3>
            <span className="text-xs text-slate-500 font-medium">Urutan kronologis terbaru</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 w-28">Tanggal</th>
                  <th className="py-3 px-4 w-24 text-center">Jenis</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-3 text-center">Kelas</th>
                  <th className="py-3 px-4">Uraian / Keterangan</th>
                  <th className="py-3 px-4 text-right">Nilai Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {transactionHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada catatan transaksi yang sesuai.
                    </td>
                  </tr>
                ) : (
                  transactionHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 font-bold">{tx.tanggal}</td>
                      <td className="py-3 px-4 text-center">
                        {tx.jenis === 'REWARD' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                            REWARD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                            <ArrowDownRight className="w-3 h-3 text-rose-600" />
                            PELANGGARAN
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">{tx.nama}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{tx.kelas}</td>
                      <td className="py-3 px-4 text-slate-600">{tx.keterangan}</td>
                      <td className="py-3 px-4 text-right font-black">
                        <span className={tx.poin > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {tx.badgeText}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
