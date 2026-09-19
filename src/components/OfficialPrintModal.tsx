import React, { useRef } from 'react';
import { Student, PelanggaranRecord } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { Printer, X, FileText } from 'lucide-react';

export interface AttendanceRekapPrintData {
  kelas: string;
  waliKelas: string;
  nipWaliKelas?: string;
  tahunAjaran: string;
  semester: string;
  bulan: string;
  rows: {
    no: number;
    nisn: string;
    nama: string;
    jk: string;
    h: number;
    s: number;
    i: number;
    a: number;
    d: number;
    total: number;
    persentase: number;
    keterangan?: string;
  }[];
}

interface OfficialPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  pelanggaran?: PelanggaranRecord | null;
  mode?: 'surat_panggilan' | 'rekap_karakter' | 'rekap_absensi';
  attendanceRekap?: AttendanceRekapPrintData | null;
}

export const OfficialPrintModal: React.FC<OfficialPrintModalProps> = ({
  isOpen,
  onClose,
  student,
  pelanggaran,
  mode = 'surat_panggilan',
  attendanceRekap
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;
  if (mode !== 'rekap_absensi' && !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full overflow-hidden my-6 ${
        mode === 'rekap_absensi' ? 'max-w-5xl' : 'max-w-3xl'
      }`}>
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">
              {mode === 'surat_panggilan'
                ? 'Cetak Surat Pemanggilan Orang Tua'
                : mode === 'rekap_absensi'
                ? 'Cetak Rekapitulasi Presensi Siswa Resmi'
                : 'Cetak Rekap Karakter Siswa'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div ref={printRef} className="p-8 sm:p-12 text-slate-900 bg-white font-serif leading-relaxed text-sm">
          
          {/* KOP SURAT RESMI */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 flex items-center gap-4">
            <SchoolLogo size={90} />
            <div className="text-center flex-1">
              <h4 className="text-sm font-bold tracking-wider uppercase">
                PEMERINTAH KOTA PASURUAN
              </h4>
              <h3 className="text-sm font-bold tracking-wide uppercase">
                DINAS PENDIDIKAN DAN KEBUDAYAAN
              </h3>
              <h2 className="text-xl font-extrabold tracking-tight uppercase text-blue-950 font-sans">
                UPT SD NEGERI KEBONAGUNG
              </h2>
              <p className="text-[11px] font-sans text-slate-600 italic">
                Jl. Kebonagung, Kec. Purworejo, Kota Pasuruan, Jawa Timur 67116 &bull; Email: sdnkebonagung@pasuruankota.go.id
              </p>
              <div className="inline-block mt-1 px-3 py-0.5 bg-slate-100 rounded text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800">
                TIM PENCEGAHAN DAN PENANGANAN KEKERASAN (TPPK) & SISTEM STAR-KIDS
              </div>
            </div>
          </div>

          {mode === 'surat_panggilan' && student ? (
            /* DOKUMEN SURAT PEMANGGILAN ORANG TUA */
            <div className="space-y-4">
              <div className="flex justify-between items-start text-xs font-sans">
                <div>
                  <p><strong>Nomor</strong> : 421.2 / {pelanggaran?.id || '042'} / TPPK-SDNKBA / 2026</p>
                  <p><strong>Lampiran</strong> : 1 Lembar Rekap Disiplin</p>
                  <p><strong>Perihal</strong> : <u className="font-bold">Undangan Pembinaan Disiplin & Pemanggilan Orang Tua</u></p>
                </div>
                <div className="text-right">
                  <p>Pasuruan, {todayStr}</p>
                  <p>Kepada Yth.</p>
                  <p className="font-bold">Bapak / Ibu Orang Tua / Wali dari:</p>
                  <p className="underline font-bold text-sm">{student.namaLengkap}</p>
                  <p>di Tempat</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="font-sans text-xs">Dengan hormat,</p>
                <p className="font-sans text-xs indent-6 text-justify mt-2 leading-relaxed">
                  Sehubungan dengan program penegakan tata tertib dan pembinaan karakter terintegrasi digital 
                  <strong> STAR-KIDS</strong> di SDN Kebonagung, bersama surat ini kami Tim Pencegahan dan Penanganan Kekerasan (TPPK) 
                  mengharapkan kehadiran Bapak/Ibu Wali Murid guna koordinasi dan pembinaan edukatif bagi ananda:
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 text-xs font-sans space-y-1.5 my-3">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Nama Lengkap</span>
                  <span className="col-span-2 font-bold">: {student.namaLengkap}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">NISN / Kelas</span>
                  <span className="col-span-2">: {student.nisn} / Kelas {student.kelas}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Wali Kelas</span>
                  <span className="col-span-2">: {student.waliKelas}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-600">Total Akumulasi Poin</span>
                  <span className="col-span-2 text-rose-700 font-extrabold">: {student.totalPoinPelanggaran} Poin ({student.statusResiko})</span>
                </div>
                {pelanggaran && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-600">Pelanggaran Terakhir</span>
                    <span className="col-span-2 font-semibold text-rose-800">
                      : {pelanggaran.jenisPelanggaran} (Kategori: {pelanggaran.kategori} - {pelanggaran.poin} Poin)
                    </span>
                  </div>
                )}
              </div>

              <p className="font-sans text-xs leading-relaxed">
                Adapun pertemuan bimbingan akan diselenggarakan pada:
              </p>

              <div className="pl-6 text-xs font-sans space-y-1">
                <p><strong>Hari, Tanggal</strong> : Senin, 21 September 2026</p>
                <p><strong>Waktu</strong> : Pukul 08.30 WIB s/d Selesai</p>
                <p><strong>Tempat</strong> : Ruang Tim TPPK / Ruang Kepala Sekolah SDN Kebonagung</p>
                <p><strong>Menghadap</strong> : Tim TPPK & Wali Kelas {student.kelas}</p>
              </div>

              <p className="font-sans text-xs indent-6 text-justify mt-4 leading-relaxed">
                Mengingat pentingnya pendampingan perkembangan karakter dan pencegahan pelanggaran lanjutan demi masa depan ananda, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktunya.
              </p>

              <p className="font-sans text-xs mt-2">
                Demikian surat pemanggilan ini kami sampaikan, atas kerja sama dan perhatiannya kami ucapkan terima kasih.
              </p>

              {/* Tanda Tangan */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs font-sans">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Ketua Tim TPPK SDN Kebonagung</p>
                  <div className="h-18 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">[Tanda Tangan Digital & Stempel]</span>
                  </div>
                  <p className="font-bold underline">Drs. Tri Wahyono</p>
                  <p className="text-[10px] text-slate-500">NIP. 19680512 199303 1 008</p>
                </div>
                <div>
                  <p>Pasuruan, {todayStr}</p>
                  <p className="font-bold">Kepala UPT SDN Kebonagung</p>
                  <div className="h-18 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">[Tanda Tangan & Cap Sekolah]</span>
                  </div>
                  <p className="font-bold underline">Hj. Sukesi, M.Pd.</p>
                  <p className="text-[10px] text-slate-500">NIP. 19710314 199605 2 001</p>
                </div>
              </div>
            </div>
          ) : mode === 'rekap_karakter' && student ? (
            /* DOKUMEN REKAP KARAKTER SISWA */
            <div className="space-y-4 font-sans text-xs">
              <div className="text-center mb-4">
                <h3 className="text-base font-extrabold uppercase text-slate-900">
                  LEMBAR REKAPITULASI DISIPLIN & APRESIASI KARAKTER (STAR-KIDS)
                </h3>
                <p className="text-xs text-slate-500">Tahun Ajaran 2026/2027 &bull; Semester Ganjil</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <p><strong>Nama Siswa:</strong> {student.namaLengkap}</p>
                  <p><strong>NISN:</strong> {student.nisn}</p>
                  <p><strong>Jenis Kelamin:</strong> {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div>
                  <p><strong>Kelas:</strong> {student.kelas}</p>
                  <p><strong>Wali Kelas:</strong> {student.waliKelas}</p>
                  <p><strong>Status Resiko:</strong> <span className="font-bold text-rose-700">{student.statusResiko}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 my-3">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                  <span className="text-[11px] text-slate-600 block">Total Poin Pelanggaran</span>
                  <span className="text-xl font-extrabold text-rose-600">{student.totalPoinPelanggaran} Poin</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                  <span className="text-[11px] text-slate-600 block">Total Poin Apresiasi (Reward)</span>
                  <span className="text-xl font-extrabold text-amber-600">+{student.totalPoinReward} Poin</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs leading-relaxed">
                <strong>Catatan Tim TPPK & Bimbingan Konseling:</strong>
                <p className="mt-1 text-slate-700">
                  Data ini dihasilkan secara otomatis melalui sistem STAR-KIDS sebagai bagian dari evaluasi nilai karakter, Profil Pelajar Pancasila, serta transparansi komunikasi antara pihak sekolah dan orang tua.
                </p>
              </div>

              <div className="pt-6 grid grid-cols-2 text-center text-xs">
                <div>
                  <p>Orang Tua / Wali Murid,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">({student?.namaOrangTua || '....................'})</p>
                </div>
                <div>
                  <p>Wali Kelas {student?.kelas},</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{student?.waliKelas || '....................'}</p>
                </div>
              </div>
            </div>
          ) : mode === 'rekap_absensi' && attendanceRekap ? (
            /* DOKUMEN REKAP ABSENSI PESERTA DIDIK (Section 19) */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-base uppercase tracking-wider font-sans underline text-slate-900">
                  REKAP ABSENSI PESERTA DIDIK
                </h3>
                <p className="text-xs text-slate-600 font-sans">
                  Sistem Tata Tertib & Apresiasi Karakter Integrasi Digital Sekolah (STAR-KIDS)
                </p>
              </div>

              {/* Metadata Rekap */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-slate-500 block">Tahun Ajaran:</span>
                  <strong className="text-slate-900">{attendanceRekap.tahunAjaran}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Semester:</span>
                  <strong className="text-slate-900">{attendanceRekap.semester}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Bulan / Periode:</span>
                  <strong className="text-slate-900">{attendanceRekap.bulan}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Kelas:</span>
                  <strong className="text-slate-900">Kelas {attendanceRekap.kelas}</strong>
                </div>
              </div>

              {/* Tabel Siswa dan Jumlah H | S | I | A | D */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-900 text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 text-center font-bold border-b border-slate-900">
                      <th className="border border-slate-900 py-2 px-2 w-10">No</th>
                      <th className="border border-slate-900 py-2 px-3 w-28">NISN</th>
                      <th className="border border-slate-900 py-2 px-3 text-left">Nama Peserta Didik</th>
                      <th className="border border-slate-900 py-2 px-2 w-12">L/P</th>
                      <th className="border border-slate-900 py-2 px-2 w-12 bg-emerald-50">H</th>
                      <th className="border border-slate-900 py-2 px-2 w-12 bg-amber-50">S</th>
                      <th className="border border-slate-900 py-2 px-2 w-12 bg-blue-50">I</th>
                      <th className="border border-slate-900 py-2 px-2 w-12 bg-rose-50">A</th>
                      <th className="border border-slate-900 py-2 px-2 w-12 bg-purple-50">D</th>
                      <th className="border border-slate-900 py-2 px-2 w-14">Total</th>
                      <th className="border border-slate-900 py-2 px-2 w-16">% Hadir</th>
                      <th className="border border-slate-900 py-2 px-3 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRekap.rows.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="border border-slate-900 py-6 text-center text-slate-500">
                          Tidak ada data presensi pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      attendanceRekap.rows.map((r) => (
                        <tr key={r.nisn} className="border-b border-slate-300">
                          <td className="border border-slate-900 py-1.5 px-2 text-center">{r.no}</td>
                          <td className="border border-slate-900 py-1.5 px-3 font-mono font-medium">{r.nisn}</td>
                          <td className="border border-slate-900 py-1.5 px-3 font-bold">{r.nama}</td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center">{r.jk}</td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-bold text-emerald-800">{r.h}</td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-bold text-amber-800">{r.s}</td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-bold text-blue-800">{r.i}</td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-bold text-rose-800">{r.a}</td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-bold text-purple-800">{r.d}</td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-bold">{r.total}</td>
                          <td className="border border-slate-900 py-1.5 px-2 text-center font-bold">
                            {r.persentase}%
                          </td>
                          <td className="border border-slate-900 py-1.5 px-3 text-[11px] text-slate-600">
                            {r.a > 0 ? `Alpa ${r.a} hari` : r.persentase >= 95 ? 'Tertib Sangat Baik' : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {attendanceRekap.rows.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                        <td colSpan={4} className="border border-slate-900 py-2 px-3 text-center uppercase">
                          Jumlah Akumulasi
                        </td>
                        <td className="border border-slate-900 py-2 px-2 text-center text-emerald-900">
                          {attendanceRekap.rows.reduce((sum, r) => sum + r.h, 0)}
                        </td>
                        <td className="border border-slate-900 py-2 px-2 text-center text-amber-900">
                          {attendanceRekap.rows.reduce((sum, r) => sum + r.s, 0)}
                        </td>
                        <td className="border border-slate-900 py-2 px-2 text-center text-blue-900">
                          {attendanceRekap.rows.reduce((sum, r) => sum + r.i, 0)}
                        </td>
                        <td className="border border-slate-900 py-2 px-2 text-center text-rose-900">
                          {attendanceRekap.rows.reduce((sum, r) => sum + r.a, 0)}
                        </td>
                        <td className="border border-slate-900 py-2 px-2 text-center text-purple-900">
                          {attendanceRekap.rows.reduce((sum, r) => sum + r.d, 0)}
                        </td>
                        <td className="border border-slate-900 py-2 px-2 text-center">
                          {attendanceRekap.rows.reduce((sum, r) => sum + r.total, 0)}
                        </td>
                        <td className="border border-slate-900 py-2 px-2 text-center">
                          {attendanceRekap.rows.length > 0
                            ? Math.round(attendanceRekap.rows.reduce((sum, r) => sum + r.persentase, 0) / attendanceRekap.rows.length)
                            : 0}%
                        </td>
                        <td className="border border-slate-900 py-2 px-3 text-[11px]">
                          Rata-rata Kelas
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Keterangan Status Presensi */}
              <div className="text-[11px] font-sans text-slate-600 flex flex-wrap gap-4 pt-1">
                <span><strong>H:</strong> Hadir</span>
                <span><strong>S:</strong> Sakit</span>
                <span><strong>I:</strong> Izin</span>
                <span><strong>A:</strong> Alpa</span>
                <span><strong>D:</strong> Dispensasi (Tugas/Lomba Sekolah)</span>
              </div>

              {/* Tanda Tangan: Wali Kelas dan Kepala Sekolah (Section 19) */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs font-sans">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Wali Kelas {attendanceRekap.kelas}</p>
                  <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
                    (Tanda Tangan & Stempel)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {attendanceRekap.waliKelas}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    NIP. {attendanceRekap.nipWaliKelas || '..............................'}
                  </p>
                </div>
                <div>
                  <p>Pasuruan, {todayStr}</p>
                  <p className="font-bold">Kepala UPT SDN Kebonagung</p>
                  <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
                    (Tanda Tangan & Stempel)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    Hj. Sukesi, M.Pd.
                  </p>
                  <p className="text-[11px] text-slate-600">
                    NIP. 19710314 199605 2 001
                  </p>
                </div>
              </div>
            </div>
          ) : null}

        </div>

      </div>
    </div>
  );
};
