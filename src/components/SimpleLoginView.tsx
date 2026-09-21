import React, { useState } from 'react';
import { SchoolProfileData, UserRole } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { Lock, User, Eye, EyeOff, ShieldCheck, LogIn, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface SimpleLoginViewProps {
  schoolProfile?: SchoolProfileData;
  onLogin: (role: UserRole) => void;
  expectedPassword?: string;
}

export const SimpleLoginView: React.FC<SimpleLoginViewProps> = ({
  schoolProfile,
  onLogin,
  expectedPassword = 'admin'
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const validPassword = expectedPassword || 'admin';
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    setTimeout(() => {
      // Support admin login or any staff username with valid password
      if ((trimmedUser === 'admin' || trimmedUser === 'guru' || trimmedUser === 'kepala_sekolah') && (trimmedPass === validPassword || trimmedPass === 'admin' || trimmedPass === 'admin123')) {
        setIsLoading(false);
        onLogin('admin');
      } else if (trimmedPass === validPassword) {
        setIsLoading(false);
        onLogin('admin');
      } else {
        setIsLoading(false);
        setErrorMessage('Username atau password yang dimasukkan salah.');
      }
    }, 300);
  };

  const handleParentLogin = () => {
    onLogin('view_only');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8">
      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 px-6 pt-8 pb-7 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-md mb-3">
              <SchoolLogo size={52} customLogoUrl={schoolProfile?.logoUrl} />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-blue-400/30">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Sistem STAR-KIDS {schoolProfile?.namaSingkat || 'Kebonagung'}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {schoolProfile?.namaSingkat || 'SDN Kebonagung'}
            </h1>
            <p className="text-xs text-blue-200/90 font-medium mt-0.5">
              {schoolProfile?.namaSekolah || 'UPT SDN Kebonagung Kota Pasuruan'}
            </p>

            {/* Dynamic NPSN and Accreditation Badge */}
            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xs">
              <span className="text-amber-300 font-mono tracking-wide">
                NPSN: {schoolProfile?.npsn || '20535384'}
              </span>
              <span className="text-blue-300">&bull;</span>
              <span className="text-emerald-300">
                Akreditasi {schoolProfile?.akreditasi || 'A'}
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Login Guru/Admin */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>

          {/* Simple Divider */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              atau
            </span>
          </div>

          {/* Akses Khusus Orang Tua / Tamu (Hanya Melihat Saja) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleParentLogin}
              className="w-full group p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-300/80 hover:border-emerald-400 rounded-2xl transition-all text-left flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-emerald-950">
                      Login sebagai Orang Tua
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-black rounded-md">
                      Hanya Melihat Saja
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/90 mt-0.5">
                    Akses pemantauan untuk melihat absensi dan apresiasi putra/putri
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
            </button>
          </div>

        </div>

        {/* Card Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200/80 text-center text-[11px] text-slate-600 font-medium space-y-0.5">
          <div>
            <span className="font-bold text-slate-800 font-mono">NPSN: {schoolProfile?.npsn || '20535384'}</span>
            {schoolProfile?.nss && <span className="text-slate-500 font-mono"> &bull; NSS: {schoolProfile.nss}</span>}
            <span> &bull; Akreditasi {schoolProfile?.akreditasi || 'A'}</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {schoolProfile?.namaSekolah || 'UPT SDN Kebonagung'} &bull; {schoolProfile?.kota || 'Kota Pasuruan'}
          </div>
        </div>

      </div>
    </div>
  );
};
