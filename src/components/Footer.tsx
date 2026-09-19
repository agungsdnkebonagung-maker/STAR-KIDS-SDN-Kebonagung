import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { Shield, Phone, Mail, MapPin, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-slate-300 border-t-4 border-amber-400 mt-16 pt-12 pb-8 shadow-2xl relative overflow-hidden">
      {/* Joyful Subtle Glows */}
      <div className="absolute left-10 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-10 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
          
          {/* Col 1: Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <SchoolLogo size={48} />
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <span>SDN Kebonagung Kota Pasuruan</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                    ★ 28 Rombel
                  </span>
                </h4>
                <p className="text-xs text-blue-200">
                  Dinas Pendidikan dan Kebudayaan Pemerintah Kota Pasuruan
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
              STAR-KIDS adalah Sistem Tata Tertib & Apresiasi Karakter Terintegrasi Digital yang diinisiasi oleh 
              Tim Pencegahan dan Penanganan Kekerasan (TPPK) SDN Kebonagung untuk menumbuhkan ekosistem sekolah ramah anak, berintegritas, dan berprestasi tinggi.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-bold pt-1">
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span>Mewujudkan Generasi Pelajar Pancasila yang Disiplin, Ceria & Berakhlak Mulia</span>
            </div>
          </div>

          {/* Col 2: Alamat & Kontak */}
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Lokasi Kampus Sekolah
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              UPT SD Negeri Kebonagung<br />
              Kecamatan Purworejo / Panggungrejo<br />
              Kota Pasuruan, Jawa Timur 67116
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-300">
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-sky-200">sdnkebonagung.pasuruan@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Col 3: Layanan Pengaduan & TPPK */}
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-emerald-300 mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Layanan Siaga TPPK
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              Posko Pengaduan Ramah Anak & Konseling Disiplin Siswa SDN Kebonagung.
            </p>
            <div className="mt-3 p-3 rounded-2xl bg-slate-800/90 border border-emerald-500/30 text-xs shadow-inner">
              <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">Hotline Siaga Sekolah:</span>
              <span className="font-black text-emerald-300 text-sm tracking-wide">0812-3456-7890 (TPPK)</span>
            </div>
          </div>

        </div>

        {/* Mandatory Footer Text from Prompt */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
          <div className="font-black text-white tracking-wide flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>STAR-KIDS | Tim TPPK SDN Kebonagung@2026</span>
          </div>
          <div className="text-[11px] text-blue-200 font-medium">
            Sistem Tata Tertib & Apresiasi Karakter Integrasi Digital Sekolah
          </div>
        </div>
      </div>
    </footer>
  );
};
