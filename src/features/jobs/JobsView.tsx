import React, { useState } from 'react';
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  Send,
  X,
  Sparkles,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { JobItem, UserProfile } from '../../types';
import { INITIAL_JOBS } from '../../services/seed/initialData';
import { AIService } from '../../services/ai/aiService';
import { SafeImage } from '../../components/SafeImage';

interface JobsViewProps {
  currentUser: UserProfile;
}

export const JobsView: React.FC<JobsViewProps> = ({ currentUser }) => {
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Remote' | 'Full-time' | 'Part-time'>('All');
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  // Application modal state
  const [applicantNote, setApplicantNote] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Remote' && job.location.toLowerCase().includes('remote')) ||
      job.jobType === activeFilter;
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleGenerateCoverNote = async (job: JobItem) => {
    setGeneratingAI(true);
    try {
      const prompt = `Write a short, professional, 3-sentence job application note for the role of "${job.title}" at "${job.company}". Applicant name is ${currentUser.displayName}. Highlight relevant expertise and excitement.`;
      const note = await AIService.generateChatResponse([{ role: 'user', content: prompt }]);
      setApplicantNote(note);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setAppliedJobs((prev) => ({ ...prev, [selectedJob.id]: true }));
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setSelectedJob(null);
      setApplicantNote('');
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-28 md:pb-12 select-none">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1">
        {/* Search Bar */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs..."
            className="w-full bg-[#161B2E] border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filter Pills (Matching Screenshot Screen 10) */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
          {(['All', 'Remote', 'Full-time', 'Part-time'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List (Responsive multi-column) */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => {
          const isApplied = !!appliedJobs[job.id];
          return (
            <div
              key={job.id}
              className="p-4 rounded-2xl bg-[#14192B] border border-white/5 hover:border-white/15 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <SafeImage
                      src={job.companyLogo}
                      fallbackText={job.company}
                      fallbackGradient="from-blue-900 to-indigo-950"
                      alt={job.company}
                      className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {job.company} • {job.location}
                      </p>
                      <p className="text-xs font-bold text-cyan-400 mt-1">{job.salaryRange}</p>
                    </div>
                  </div>

                  {/* Badge tag */}
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        job.jobType === 'Full-time'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {job.jobType}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">{job.createdAt}</p>
                  </div>
                </div>
              </div>

              {/* Tags & Action */}
              <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {job.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  disabled={isApplied}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isApplied
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {isApplied ? 'Applied ✓' : 'Apply Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Apply Modal with AI Note Assistant */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0F1424] border border-white/10 rounded-3xl p-5 shadow-2xl">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {appliedSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-base text-white">Application Submitted!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  The hiring team at {selectedJob.company} will review your application.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3">
                <div>
                  <h4 className="font-bold text-base text-white">Apply for {selectedJob.title}</h4>
                  <p className="text-xs text-slate-400">{selectedJob.company} • {selectedJob.location}</p>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Applicant Profile</label>
                  <div className="p-2.5 rounded-xl bg-white/5 text-xs text-slate-300 flex items-center justify-between">
                    <span>{currentUser.displayName} (@{currentUser.username})</span>
                    <span className="text-cyan-400 font-mono text-[10px]">VERIFIED</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-300">Introduction Note</label>
                    <button
                      type="button"
                      onClick={() => handleGenerateCoverNote(selectedJob)}
                      disabled={generatingAI}
                      className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      {generatingAI ? 'Writing with Gemini...' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={applicantNote}
                    onChange={(e) => setApplicantNote(e.target.value)}
                    placeholder="Briefly state why you're a great fit for this position..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
