import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Lock,
  Unlock,
  Trash2,
  Eye,
  X,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  Smartphone,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { UserProfile, PRIMARY_ADMIN_EMAIL } from '../../../types';
import { SafeImage } from '../../../components/SafeImage';
import { UserAccountStatus } from '../types';

interface UserControlCenterProps {
  users: UserProfile[];
  onToggleSuspend: (userId: string) => void;
  onToggleRestrict: (userId: string) => void;
  onToggleDeactivate: (userId: string) => void;
  onToggleVerify: (userId: string) => void;
  onChangeRole: (userId: string, newRole: any) => void;
  onPermanentDelete: (user: UserProfile) => void;
  onCleanDuplicates: () => void;
  cleaningDuplicates: boolean;
  cleanResult: string | null;
  onPurgeDemo?: () => void;
  isPurgingDemo?: boolean;
}

export const UserControlCenter: React.FC<UserControlCenterProps> = ({
  users,
  onToggleSuspend,
  onToggleRestrict,
  onToggleDeactivate,
  onToggleVerify,
  onChangeRole,
  onPermanentDelete,
  onCleanDuplicates,
  cleaningDuplicates,
  cleanResult,
  onPurgeDemo,
  isPurgingDemo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [inspectUser, setInspectUser] = useState<UserProfile | null>(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<UserProfile | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Advanced Filtering
  const filteredUsers = users.filter((u) => {
    if (!u) return false;
    const q = searchQuery.trim().toLowerCase();
    const dName = (u.displayName || '').toLowerCase();
    const uName = (u.username || '').toLowerCase();
    const mail = (u.email || '').toLowerCase();
    const phone = ((u as any).phone || '').toLowerCase();
    const uid = (u.id || '').toLowerCase();

    const matchesSearch =
      !q ||
      dName.includes(q) ||
      uName.includes(q) ||
      mail.includes(q) ||
      phone.includes(q) ||
      uid.includes(q);

    const matchesRole = filterRole === 'all' || u.accountType === filterRole;

    let matchesStatus = true;
    if (filterStatus === 'suspended') matchesStatus = Boolean(u.isSuspended);
    else if (filterStatus === 'restricted') matchesStatus = Boolean((u as any).isRestricted);
    else if (filterStatus === 'deactivated') matchesStatus = Boolean((u as any).isDeactivated);
    else if (filterStatus === 'active')
      matchesStatus = !u.isSuspended && !(u as any).isRestricted && !(u as any).isDeactivated;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-5 select-none">
      {/* Control Header & Clean Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl bg-[#0F1426] border border-white/10">
        <div>
          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Usimamizi wa Watumiaji & Udhibiti wa Akaunti (User Control)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Jumla ya akaunti zilizopo kwenye mfumo: <strong className="text-white">{users.length}</strong>
            {users.length === 1 && users[0].email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() && (
              <span className="ml-2 text-emerald-400 font-semibold">(Hali Halisi: Admin Tu Aliyepo)</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onPurgeDemo && (
            <button
              type="button"
              onClick={onPurgeDemo}
              disabled={isPurgingDemo}
              className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Futa akaunti zote za majaribio na kubaki na Admin pekee"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{isPurgingDemo ? 'Inasafisha...' : 'Futa Data za Majaribio'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCleanDuplicates}
            disabled={cleaningDuplicates}
            className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <span>🧹 Ondoa Zilizojirudia</span>
          </button>
        </div>
      </div>

      {cleanResult && (
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{cleanResult}</span>
        </div>
      )}

      {/* Advanced Search & Filtering Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Search Input */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tafuta kwa Jina, Email, @Username, Simu au UID..."
            className="w-full bg-[#12172D] border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-[#12172D] border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
        >
          <option value="all">Aina Zote za Akaunti (Roles)</option>
          <option value="personal">Mtumiaji Binafsi (Personal)</option>
          <option value="creator">Mbunifu / Mshawishi (Creator)</option>
          <option value="business">Mfanyabiashara (Business)</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#12172D] border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
        >
          <option value="all">Hali Zote za Akaunti (Status)</option>
          <option value="active">Hai (Active Pekee)</option>
          <option value="suspended">Zilizosimamishwa (Suspended)</option>
          <option value="restricted">Zenye Vikwazo (Restricted)</option>
          <option value="deactivated">Zilizozimwa (Deactivated)</option>
        </select>
      </div>

      {/* Single Admin Policy Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-[#0F1326] border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-300 min-w-0">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">
            <strong>Sera ya Utawala:</strong> Mfumo una Admin Mkuu ({PRIMARY_ADMIN_EMAIL}). Akaunti hii imekingwa dhidi ya kufutwa au kusimamishwa.
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
          1 Admin Pekee
        </span>
      </div>

      {/* Users Table / Cards */}
      <div className="space-y-2.5">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Hakuna mtumiaji aliyelingana na vigezo vyako vya utafutaji.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isPrimaryAdmin = (u.email || '').toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
            const isRestricted = (u as any).isRestricted;
            const isDeactivated = (u as any).isDeactivated;

            return (
              <div
                key={u.id}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                  isPrimaryAdmin
                    ? 'bg-[#0F182E] border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'bg-[#0F1326] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <SafeImage
                    src={u.photoURL}
                    fallbackText={u.displayName}
                    fallbackGradient="from-cyan-800 to-indigo-900"
                    alt={u.displayName}
                    className="w-10 h-10 rounded-2xl object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-white truncate">{u.displayName}</span>
                      {u.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 shrink-0" />
                      )}
                      {isPrimaryAdmin && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                          👑 Super Admin
                        </span>
                      )}
                      {u.isSuspended && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                          Imesimamishwa
                        </span>
                      )}
                      {isRestricted && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          Restricted
                        </span>
                      )}
                      {isDeactivated && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/40 uppercase">
                          Deactivated
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                      <span className="font-mono text-cyan-400">@{u.username}</span>
                      {u.email && <span>• {u.email}</span>}
                      <span>• Pochi: TZS {(u.walletBalance || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Management Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap self-end md:self-center">
                  {/* Inspect Account Profile Modal */}
                  <button
                    type="button"
                    onClick={() => setInspectUser(u)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                    title="Kagua Wasifu na Shughuli za Akaunti"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  {/* Verification Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleVerify(u.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      u.verified
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                    title={u.verified ? 'Ondoa Uthibitisho (Unverify)' : 'Mpe Blue Badge (Verify)'}
                  >
                    {u.verified ? 'Verified ✓' : 'Thibitisha'}
                  </button>

                  {/* Suspend Toggle */}
                  {!isPrimaryAdmin && (
                    <button
                      type="button"
                      onClick={() => onToggleSuspend(u.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        u.isSuspended
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                      title={u.isSuspended ? 'Rejesha Akaunti (Active)' : 'Simamisha Akaunti (Suspend)'}
                    >
                      {u.isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  {/* Restrict Toggle */}
                  {!isPrimaryAdmin && (
                    <button
                      type="button"
                      onClick={() => onToggleRestrict(u.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isRestricted
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-amber-300'
                      }`}
                      title={isRestricted ? 'Ondoa Vikwazo (Unrestrict)' : 'Weka Vikwazo vya Kuchati/Kuuza (Restrict)'}
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Role Selector */}
                  <select
                    value={u.accountType}
                    onChange={(e) => onChangeRole(u.id, e.target.value)}
                    disabled={isPrimaryAdmin}
                    className="bg-[#14192E] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                  >
                    <option value="personal">Binafsi</option>
                    <option value="creator">Mbunifu</option>
                    <option value="business">Biashara</option>
                  </select>

                  {/* Permanent Delete with Double-Confirmation */}
                  {!isPrimaryAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDeleteTarget(u);
                        setDeleteConfirmationText('');
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Futa Kabisa Akaunti (Permanently Delete)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: USER PROFILE INSPECTOR */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0C1124] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Taarifa za Kina za Akaunti (User Details Inspector)</span>
              </h4>
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Header */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <SafeImage
                src={inspectUser.photoURL}
                fallbackText={inspectUser.displayName}
                className="w-14 h-14 rounded-2xl object-cover border border-cyan-400/30"
              />
              <div>
                <h5 className="font-bold text-base text-white">{inspectUser.displayName}</h5>
                <p className="text-xs text-cyan-400 font-mono">@{inspectUser.username}</p>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {inspectUser.accountType} • {inspectUser.verified ? 'Verified Member ✓' : 'Regular Member'}
                </span>
              </div>
            </div>

            {/* Key Account Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#141A33] border border-white/5">
                <span className="text-slate-400 block text-[11px]">Salio la Pochi</span>
                <strong className="text-emerald-400 text-sm font-mono font-extrabold">
                  TZS {(inspectUser.walletBalance || 0).toLocaleString()}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-[#141A33] border border-white/5">
                <span className="text-slate-400 block text-[11px]">Wafuasi / Kufuata</span>
                <strong className="text-white text-sm">
                  {inspectUser.followersCount || 0} / {inspectUser.followingCount || 0}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-[#141A33] border border-white/5">
                <span className="text-slate-400 block text-[11px]">Barua Pepe</span>
                <span className="text-slate-200 truncate block">{inspectUser.email || 'Haijawekwa'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#141A33] border border-white/5">
                <span className="text-slate-400 block text-[11px]">Hali ya Sasa</span>
                <span className="text-emerald-400 font-bold block">
                  {inspectUser.isOnline ? 'Online Sasa Hivi' : inspectUser.lastSeen || 'Haijulikani'}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="p-3 rounded-xl bg-[#141A33] border border-white/5 text-xs text-slate-300">
              <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Wasifu (Bio)</span>
              <p>{inspectUser.bio || 'Hana maelezo ya wasifu bado.'}</p>
            </div>

            {/* System Identifiers */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
              <div>UID: <span className="text-slate-200">{inspectUser.id}</span></div>
              <div>Device Session: <span className="text-cyan-300">Active (Chrome / Web Client)</span></div>
            </div>

            <button
              type="button"
              onClick={() => setInspectUser(null)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Funga (Close Inspector)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: PERMANENT DELETE DOUBLE-CONFIRMATION (PREVENTS ACCIDENTAL ACCONT DELETION) */}
      {confirmDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#120A16] border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="font-extrabold text-base text-white">
                Thibitisha Kufuta Kabisa Akaunti (Permanent Deletion)
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Kufuta akaunti ya <strong className="text-rose-400">@{confirmDeleteTarget.username}</strong> ni kitendo kisichoweza kurejeshwa. Historia ya miamala, bidhaa na marafiki itafutwa kabisa.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200">
              Ili kuthibitisha, tafadhali andika neno <strong className="font-mono text-white">FUTA</strong> hapa chini:
            </div>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder='Andika "FUTA" kuthibitisha...'
              className="w-full bg-[#1F0C1E] border border-rose-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 text-center font-bold"
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs"
              >
                Ghairi (Cancel)
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'FUTA'}
                onClick={() => {
                  onPermanentDelete(confirmDeleteTarget);
                  setConfirmDeleteTarget(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-extrabold text-xs transition-all"
              >
                Futa Kabisa Akaunti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
