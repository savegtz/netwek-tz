import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Ban,
  ShieldCheck,
  RefreshCw,
  Eye,
  Key,
  Globe,
  Radio,
  FileText,
} from 'lucide-react';
import { SecurityAlert } from '../types';

interface SecurityCenterViewProps {
  alerts: SecurityAlert[];
  onDismissAlert: (id: string) => void;
  onBlockIp: (ip: string) => void;
  onLockWallet: (userEmail: string) => void;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({
  alerts,
  onDismissAlert,
  onBlockIp,
  onLockWallet,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/40 via-[#140F20] to-[#0F1426] border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h4 className="font-extrabold text-sm text-white">
              Kituo cha Usalama & Ulinzi wa Mfumo (Security Center)
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 font-mono">
              Zero-Trust Guard 🛡️
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Ufuatiliaji wa majaribio ya udukuzi, akaunti zilizojisajili mara mbili, miamala ya mashaka na wizi wa akaunti.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-300">Tahadhari Zilizo Hai:</span>
          <span className="px-2.5 py-1 rounded-xl bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-500/20">
            {alerts.filter((a) => a.status !== 'resolved').length}
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Security Health Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#0F1326] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Brute-Force Rate Limiting</span>
          <h5 className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active & Guarding</span>
          </h5>
          <span className="text-[10px] text-slate-500 block">Kikomo: Majaribio 5 / dakika 5</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1326] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Firestore ABAC Rules</span>
          <h5 className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deployed & Enforced</span>
          </h5>
          <span className="text-[10px] text-slate-500 block">Zero-Trust rules v2</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1326] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pochi za Watumiaji (Escrow)</span>
          <h5 className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Ledger</span>
          </h5>
          <span className="text-[10px] text-slate-500 block">Miamala yote inathibitishwa</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1326] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Ulinzi wa Vifaa (Sessions)</span>
          <h5 className="font-extrabold text-xs text-cyan-400 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" />
            <span>Fingerprinting Active</span>
          </h5>
          <span className="text-[10px] text-slate-500 block">Kugundua vifaa vya kigeni</span>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Orodha ya Tahadhari za Usalama (Security Alerts Queue)</span>
        </h4>

        <div className="flex items-center gap-1.5 text-xs">
          {['all', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition-all ${
                filterSeverity === sev
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {sev === 'all' ? 'Zote' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Hakuna tahadhari ya usalama katika kiwango hiki. Mfumo uko salama! 🛡️
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-3xl border transition-all ${
                alert.status === 'resolved'
                  ? 'bg-[#0B0F1C] border-white/5 opacity-60'
                  : alert.severity === 'high' || alert.severity === 'critical'
                  ? 'bg-[#140A12] border-rose-500/30'
                  : 'bg-[#120F1C] border-amber-500/25'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        alert.severity === 'high' || alert.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {alert.severity} SEVERITY
                    </span>
                    <h5 className="font-extrabold text-sm text-white">{alert.title}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">• {alert.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono flex-wrap pt-1">
                    {alert.ipAddress && <span>IP: <strong className="text-slate-200">{alert.ipAddress}</strong></span>}
                    {alert.affectedUser && <span>Mtumiaji: <strong className="text-cyan-300">{alert.affectedUser}</strong></span>}
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-amber-300 mt-2">
                    💡 <strong>Hatua Inayopendekezwa:</strong> {alert.suggestedAction}
                  </div>
                </div>

                {/* Mitigation Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  {alert.ipAddress && alert.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => {
                        onBlockIp(alert.ipAddress!);
                        showStatus(`IP ${alert.ipAddress} imezuiwa kwa saa 24!`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Zuia IP</span>
                    </button>
                  )}

                  {alert.affectedUser && alert.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => {
                        onLockWallet(alert.affectedUser!);
                        showStatus(`Pochi ya mtumiaji ${alert.affectedUser} imefungwa kwa usalama!`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Funga Pochi</span>
                    </button>
                  )}

                  {alert.status !== 'resolved' ? (
                    <button
                      type="button"
                      onClick={() => {
                        onDismissAlert(alert.id);
                        showStatus('Tahadhari imetatuliwa (Resolved).');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs"
                    >
                      Tatua (Resolve)
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      ✓ Imetatuliwa
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
