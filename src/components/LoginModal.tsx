import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { UserRole, SchoolProfileData } from '../types';
import { X, Lock, User, ShieldCheck, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: UserRole) => void;
  expectedPassword?: string;
  schoolProfile?: SchoolProfileData;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogin,
  expectedPassword = 'admin',
  schoolProfile
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Sesuai ketentuan prompt: Admin username = admin, password = admin (atau yang diubah di pengaturan)
    const validPassword = expectedPassword || 'admin';
    if (username.trim() === 'admin' && password.trim() === validPassword) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onLogin('admin');
        onClose();
      }, 500);
    } else {
      setErrorMessage('Username atau kata sandi yang dimasukkan salah.');
    }
  };

  const handleViewOnlyLogin = () => {
    onLogin('view_only');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-3">
            <div className="p-2 bg-white rounded-2xl shadow-md inline-block">
              <SchoolLogo size={52} customLogoUrl={schoolProfile?.logoUrl} />
            </div>
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">
            Login Sistem STAR-KIDS {schoolProfile?.namaSingkat || 'Kebonagung'}
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            {schoolProfile?.namaSekolah || 'UPT SDN Kebonagung Kota Pasuruan'}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-amber-300 border border-white/15">
            <span className="font-mono">NPSN: {schoolProfile?.npsn || '20535384'}</span>
            <span className="text-white/40">&bull;</span>
            <span className="text-emerald-300">Akreditasi {schoolProfile?.akreditasi || 'A'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Admin Login Form */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Masuk Sebagai Admin (Guru / TPPK)
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                Akses Penuh
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {showSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Login berhasil! Membuka hak akses Admin...</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username admin"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk Sebagai Admin</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase">
              atau
            </span>
          </div>

          {/* View Only Mode Button */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-amber-900 font-bold text-xs">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>Akses Murid & Orang Tua (View Only)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Melihat transparansi rekap poin disiplin, grafik reward, ranking prestasi, dan profil karakter tanpa perlu akun admin.
            </p>
            <button
              type="button"
              onClick={handleViewOnlyLogin}
              className="w-full py-2 px-3 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Lanjutkan Mode View Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
