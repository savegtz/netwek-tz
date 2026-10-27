import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Copy,
  Check,
  Clock,
  Shield,
  Activity,
  UserCheck,
} from 'lucide-react';
import { AuditLogEntry } from '../types';
import { AdminStoreService } from '../adminStore';

interface AuditLogsViewProps {
  currentAdminEmail?: string;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ currentAdminEmail = 'amytzee@gmail.com' }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => AdminStoreService.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'critical'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRefresh = () => {
    setLogs(AdminStoreService.getAuditLogs());
  };

  const handleCopyLog = (log: AuditLogEntry) => {
    const text = `[AUDIT LOG] ${log.timestamp} | Admin: ${log.adminEmail} | Action: ${log.action} | Target: ${log.target} | Status: ${log.status} | Details: ${log.details}`;
    navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.target || '').toLowerCase().includes(q) ||
      (log.adminEmail || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q) ||
      (log.ipAddress || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/20 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full border border-indigo-400/30 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-300" />
                Mfumo wa Kumbukumbu Zisizobadilika
              </span>
              <span className="text-xs text-slate-400">ISO-compliant Audit Trail</span>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <FileText className="w-7 h-7 text-indigo-400" />
              Audit Logs — Kumbukumbu za Vitendo vya Ma-Admin
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Kila hatua inayochukuliwa na Super Admin au wasaidizi wake (kubadili commission, kufuta au kusimamisha akaunti, kuidhinisha payouts, au kubadili sheria) inanakiliwa hapa kwa uwazi na usalama.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              title="Pakia Upya Kumbukumbu"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              Pakia Upya
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
            <div className="text-xs text-slate-400 font-medium">Jumla ya Vitendo</div>
            <div className="text-xl font-bold text-white mt-1">{logs.length}</div>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
            <div className="text-xs text-emerald-400 font-medium">Vitendo Vilivyofaulu</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {logs.filter((l) => l.status === 'success').length}
            </div>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
            <div className="text-xs text-amber-400 font-medium">Tahadhari / Warning</div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {logs.filter((l) => l.status === 'warning').length}
            </div>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
            <div className="text-xs text-indigo-400 font-medium">Admin Aliye Kwenye Kikao</div>
            <div className="text-xs font-bold text-indigo-300 mt-2 truncate" title={currentAdminEmail}>
              {currentAdminEmail}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tafuta kitendo, admin, lengo, au maelezo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Hali:
          </span>
          {(['all', 'success', 'warning', 'critical'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status === 'all'
                ? `Zote (${logs.length})`
                : status === 'success'
                ? `Mafanikio (${logs.filter((l) => l.status === 'success').length})`
                : status === 'warning'
                ? `Onyo (${logs.filter((l) => l.status === 'warning').length})`
                : `Hatari (${logs.filter((l) => l.status === 'critical').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Wakati / Muda</th>
                <th className="py-3 px-4">Super Admin</th>
                <th className="py-3 px-4">Kitendo (Action)</th>
                <th className="py-3 px-4">Lengo (Target)</th>
                <th className="py-3 px-4">Maelezo Kamili</th>
                <th className="py-3 px-4 text-center">Hali</th>
                <th className="py-3 px-4 text-right">Nakili</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-sans">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    Hakuna kumbukumbu zinazofanana na utafutaji wako.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSuccess = log.status === 'success';
                  const isWarning = log.status === 'warning';
                  const isCritical = log.status === 'critical';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors font-sans"
                    >
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{log.timestamp}</span>
                        </div>
                        {log.ipAddress && (
                          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                            IP: {log.ipAddress}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[150px]" title={log.adminEmail}>
                            {log.adminEmail}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {log.target}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-sm">
                        {log.details}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isSuccess && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Imefaulu
                          </span>
                        )}
                        {isWarning && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" /> Tahadhari
                          </span>
                        )}
                        {isCritical && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <ShieldAlert className="w-3 h-3" /> Hatari
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleCopyLog(log)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Nakili taarifa ya logi"
                        >
                          {copiedId === log.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
