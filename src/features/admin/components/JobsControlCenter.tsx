import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Users,
  ShieldCheck,
  Ban,
  Trash2,
  ExternalLink,
  Plus,
  Eye,
} from 'lucide-react';
import { AdminJobItem } from '../types';
import { AdminStoreService } from '../adminStore';

interface JobsControlCenterProps {
  currentAdminEmail?: string;
}

export const JobsControlCenter: React.FC<JobsControlCenterProps> = ({
  currentAdminEmail = 'amytzee@gmail.com',
}) => {
  const [jobs, setJobs] = useState<AdminJobItem[]>(() => AdminStoreService.getAdminJobs());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'under_review' | 'fake_only'>('all');
  const [selectedJob, setSelectedJob] = useState<AdminJobItem | null>(null);

  const persistJobs = (updated: AdminJobItem[]) => {
    setJobs(updated);
    AdminStoreService.saveAdminJobs(updated);
  };

  const handleToggleVerifiedEmployer = (jobId: string) => {
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return;

    const newStatus = !target.isVerifiedEmployer;
    const updated = jobs.map((j) => (j.id === jobId ? { ...j, isVerifiedEmployer: newStatus } : j));
    persistJobs(updated);

    AdminStoreService.addAuditLog({
      adminEmail: currentAdminEmail,
      action: newStatus ? 'VERIFY_EMPLOYER' : 'UNVERIFY_EMPLOYER',
      target: target.company,
      details: `${newStatus ? 'Amepewa uthibitisho wa mwajiri halali' : 'Uthibitisho wa mwajiri umeondolewa'} kwa kazi "${target.title}"`,
      status: 'success',
    });
  };

  const handleToggleFakeFlag = (jobId: string) => {
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return;

    const isFake = !target.isFlaggedFake;
    const updated = jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            isFlaggedFake: isFake,
            status: isFake ? ('under_review' as const) : ('active' as const),
          }
        : j
    );
    persistJobs(updated);

    AdminStoreService.addAuditLog({
      adminEmail: currentAdminEmail,
      action: isFake ? 'FLAG_FAKE_JOB' : 'UNFLAG_FAKE_JOB',
      target: `Kazi: ${target.title} (${target.company})`,
      details: isFake
        ? 'Imewekwa alama ya kazi ya utapeli na kusimamishwa kwa ukaguzi'
        : 'Alama ya utapeli imeondolewa, kazi imerejeshwa sokoni',
      status: isFake ? 'critical' : 'warning',
    });
  };

  const handleDeleteJob = (jobId: string) => {
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return;

    if (!window.confirm(`Je, una uhakika unataka kufuta tangazo la kazi "${target.title}" kutoka "${target.company}"?`)) {
      return;
    }

    const updated = jobs.filter((j) => j.id !== jobId);
    persistJobs(updated);

    if (selectedJob?.id === jobId) {
      setSelectedJob(null);
    }

    AdminStoreService.addAuditLog({
      adminEmail: currentAdminEmail,
      action: 'DELETE_JOB_POSTING',
      target: `${target.title} - ${target.company}`,
      details: `Tangazo la kazi limefutwa kabisa na Admin ${currentAdminEmail}`,
      status: 'warning',
    });
  };

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (job.title || '').toLowerCase().includes(q) ||
      (job.company || '').toLowerCase().includes(q) ||
      (job.employerEmail || '').toLowerCase().includes(q) ||
      (job.location || '').toLowerCase().includes(q);

    if (statusFilter === 'active') return matchesSearch && job.status === 'active';
    if (statusFilter === 'under_review') return matchesSearch && job.status === 'under_review';
    if (statusFilter === 'fake_only') return matchesSearch && job.isFlaggedFake;
    return matchesSearch;
  });

  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);
  const verifiedCount = jobs.filter((j) => j.isVerifiedEmployer).length;
  const fakeCount = jobs.filter((j) => j.isFlaggedFake).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 rounded-3xl border border-sky-500/20 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-sky-500/30 text-sky-300 text-xs font-bold rounded-full border border-sky-400/30 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-300" />
                Zenia Ajira & Kazi Control Center
              </span>
              <span className="text-xs text-slate-400">Moderation & Safety</span>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-sky-400" />
              Jobs Management — Kusimamia Matangazo ya Ajira na Waajiri
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Kagua matangazo ya ajira yaliyowekwa na makampuni, thibitisha waajiri halali kwa kuwapa Blue Badge, na zuia matangazo ya udanganyifu au utapeli ili kulinda watumiaji wa Zenia.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
            <div className="text-xs text-slate-400 font-medium">Jumla ya Matangazo</div>
            <div className="text-xl font-bold text-white mt-1">{jobs.length}</div>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
            <div className="text-xs text-emerald-400 font-medium">Waajiri Waliothibitishwa</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{verifiedCount}</div>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
            <div className="text-xs text-rose-400 font-medium">Kazi Zilizotiliwa Shaka (Fake)</div>
            <div className="text-xl font-bold text-rose-400 mt-1">{fakeCount}</div>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5">
            <div className="text-xs text-sky-400 font-medium">Jumla ya Waombaji (CVs)</div>
            <div className="text-xl font-bold text-sky-300 mt-1">{totalApplications}</div>
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
            placeholder="Tafuta nafasi ya kazi, kampuni au eneo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Chuja:
          </span>
          {(['all', 'active', 'under_review', 'fake_only'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === filter
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter === 'all'
                ? `Zote (${jobs.length})`
                : filter === 'active'
                ? `Zinazofanya Kazi (${jobs.filter((j) => j.status === 'active').length})`
                : filter === 'under_review'
                ? `Chini ya Ukaguzi (${jobs.filter((j) => j.status === 'under_review').length})`
                : `Tahadhari ya Utapeli (${fakeCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Hakuna matangazo ya kazi yaliyopatikana.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
                job.isFlaggedFake
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : job.status === 'under_review'
                  ? 'border-amber-500/40'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold">
                    {job.type}
                  </span>
                  {job.isFlaggedFake ? (
                    <span className="px-2.5 py-1 bg-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-500/30 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Udanganyifu (Fake)
                    </span>
                  ) : job.status === 'under_review' ? (
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-500 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Inakaguliwa
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Kazi Ipo Hewani
                    </span>
                  )}
                </div>

                {/* Job Title & Company */}
                <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2">
                  {job.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{job.company}</span>
                  {job.isVerifiedEmployer && (
                    <span title="Mwajiri aliyethibitishwa">
                      <ShieldCheck className="w-4 h-4 text-sky-500" />
                    </span>
                  )}
                </div>

                {/* Meta details */}
                <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>{job.applicationsCount} maombi yaliyopokelewa</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Iliwekwa {job.postedAt} • {job.employerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                <button
                  onClick={() => handleToggleVerifiedEmployer(job.id)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    job.isVerifiedEmployer
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                  title={job.isVerifiedEmployer ? 'Ondoa uthibitisho wa mwajiri' : 'Thibitisha mwajiri huyu'}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {job.isVerifiedEmployer ? 'Verified' : 'Verify'}
                  </span>
                </button>

                <button
                  onClick={() => handleToggleFakeFlag(job.id)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    job.isFlaggedFake
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                  }`}
                  title={job.isFlaggedFake ? 'Ondoa alama ya fake' : 'Weka alama ya utapeli (Fake Job)'}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {job.isFlaggedFake ? 'Ondoa Fake' : 'Fake Job'}
                  </span>
                </button>

                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Futa tangazo la kazi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
