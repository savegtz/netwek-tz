import React, { useState } from 'react';
import {
  X,
  Briefcase,
  User,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  CheckCircle2,
  Upload,
  Send,
  Building2,
  Clock,
  MapPin,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../../types';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  salaryText?: string;
  currentUser: UserProfile;
  onStartChatWithEmployer?: (applicationMessage: string) => void;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  jobTitle = 'Waiter / Waitress',
  companyName = 'Zebra Restaurant',
  location = 'Masaki, Dar es Salaam',
  salaryText = 'TSh 400K – 600K',
  currentUser,
  onStartChatWithEmployer,
}) => {
  const [fullName, setFullName] = useState(currentUser.displayName || 'Amina Juma');
  const [phone, setPhone] = useState(currentUser.phone || '+255 714 892 012');
  const [email, setEmail] = useState(currentUser.email || 'amina.juma@gmail.com');
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [coverMessage, setCoverMessage] = useState(
    'Nimefurahia nafasi hii ya kazi! Nina uzoefu wa zaidi ya mwaka mmoja wa kutoa huduma bora kwa wateja na niko tayari kuanza kazi mara moja.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulateCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFileName(e.target.files[0].name);
    } else {
      setCvFileName('CV_Amina_Juma_Updated.pdf');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  const handleOpenChat = () => {
    if (onStartChatWithEmployer) {
      const msg = `Habari ${companyName}! Nimetuma maombi ya kazi ya "${jobTitle}".\n\n👤 Jina: ${fullName}\n📱 Simu: ${phone}\n📧 Email: ${email}\n📄 CV: ${cvFileName || 'CV_Imeambatishwa.pdf'}\n💬 Ujumbe: "${coverMessage}"\n\nNaomba mazingatio yenu kwa nafasi hii.`;
      onStartChatWithEmployer(msg);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0A0D18] border-t sm:border border-emerald-500/30 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#10162A] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 block">
                APPLY FOR JOB
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {jobTitle}
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-400" />
                <span>{companyName}</span>
                <span>•</span>
                <span>{location}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Job Highlights pill */}
              <div className="p-3 rounded-2xl bg-[#12182C] border border-white/5 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">💰 Mshahara:</span>
                  <span className="font-mono text-white font-extrabold">{salaryText}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Nafasi iko wazi</span>
                </div>
              </div>

              {/* 1. Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>👤 Full Name (Jina Kamili)</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Andika jina lako kamili..."
                  className="w-full bg-[#161D33] border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* 2. Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>📱 Phone Number (Namba ya Simu)</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 7XX XXX XXX"
                  className="w-full bg-[#161D33] border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* 3. Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>📧 Email (Barua Pepe)</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jina@email.com"
                  className="w-full bg-[#161D33] border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* 4. Upload CV */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>📄 CV (Wasifu Wako)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="cv-upload-input"
                    accept=".pdf,.doc,.docx"
                    onChange={handleSimulateCvUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="cv-upload-input"
                    className={`w-full p-3 rounded-xl border border-dashed flex items-center justify-between cursor-pointer transition-all ${
                      cvFileName
                        ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                        : 'bg-[#161D33] border-white/20 hover:border-cyan-400/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>{cvFileName || '[ Upload CV (PDF / Word) ]'}</span>
                    </div>
                    {cvFileName && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Imeambatanishwa</span>
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {/* 5. Cover Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>💬 Cover Message (Ujumbe Mfupi kwa Mwajiri)</span>
                </label>
                <textarea
                  rows={3}
                  value={coverMessage}
                  onChange={(e) => setCoverMessage(e.target.value)}
                  placeholder="Eleza kwanini unafaa kwa nafasi hii..."
                  className="w-full bg-[#161D33] border border-white/10 focus:border-cyan-400 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all mt-2"
              >
                {isSubmitting ? (
                  <span>Inatuma maombi...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>Tuma Maombi (Submit Application)</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success confirmation screen */
            <div className="p-5 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 block">
                  MAOMBI YAMEPOKELEWA!
                </span>
                <h4 className="text-xl font-black text-white mt-1">
                  Umetuma Maombi kwa {companyName}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Nafasi: <strong>{jobTitle}</strong>. Taarifa zako zimepokelewa na timu ya usaili.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#12182C] border border-white/5 text-left text-xs text-slate-300 space-y-1">
                <p>👤 Mwombaji: <strong>{fullName}</strong></p>
                <p>📱 Simu: <strong>{phone}</strong></p>
                <p>📧 Email: <strong>{email}</strong></p>
                <p>📄 CV: <strong>{cvFileName || 'CV_Imeambatishwa.pdf'}</strong></p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>💬 Chat na Mwajiri Moja kwa Moja</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  Sawa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
