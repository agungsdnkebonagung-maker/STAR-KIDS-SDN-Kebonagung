import React, { useState, useMemo } from 'react';
import { AuditLog, UserRole } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Activity, 
  Printer, 
  Download,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
  role: UserRole;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, role }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return logs
      .filter(l => filterAction === 'ALL' || l.action.toLowerCase().includes(filterAction.toLowerCase()))
      .filter(l => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          l.user.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.timestamp.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, filterAction, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Waktu Kejadian', 'Pengguna', 'Role', 'Aktivitas / Modul', 'Rincian Perubahan'];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.user}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STAR_KIDS_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            <span>Audit Trail & Akuntabilitas Sistem</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Log Aktivitas & Riwayat Modifikasi Data
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Pencatatan kronologis otomatis setiap aksi input, pembaruan, sinkronisasi, dan penghapusan data.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Log (.CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Log</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-56">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Aktivitas</option>
              <option value="Input">Pencatatan Baru (Input)</option>
              <option value="Update">Pembaruan (Update)</option>
              <option value="Delete">Penghapusan (Delete)</option>
              <option value="Sync">Sinkronisasi (Sync)</option>
              <option value="Absensi">Presensi (Absensi)</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengguna, aktivitas, atau rincian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <span className="text-xs text-slate-500 font-bold self-end sm:self-auto">
          {filteredLogs.length} Catatan Ditemukan
        </span>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-44">Waktu / Timestamp</th>
                <th className="py-3 px-4 w-36">Pengguna</th>
                <th className="py-3 px-4 w-48">Aktivitas / Modul</th>
                <th className="py-3 px-6">Rincian Data & Modifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Tidak ada catatan log aktivitas yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {l.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">{l.user}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {l.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        l.action.includes('Hapus') || l.action.includes('Delete') ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        l.action.includes('Input') || l.action.includes('Tambah') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        l.action.includes('Sync') ? 'bg-purple-50 text-purple-800 border-purple-200' :
                        'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-700 leading-relaxed font-normal">
                      {l.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
