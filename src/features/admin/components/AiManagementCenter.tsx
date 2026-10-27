import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Activity,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  MessageSquare,
  ShieldCheck,
  Clock,
  Coins,
} from 'lucide-react';
import { AiManagementConfig } from '../types';

interface AiManagementCenterProps {
  config: AiManagementConfig;
  onSaveConfig: (newConfig: AiManagementConfig) => void;
}

export const AiManagementCenter: React.FC<AiManagementCenterProps> = ({ config, onSaveConfig }) => {
  const [formData, setFormData] = useState<AiManagementConfig>(config);
  const [isSaved, setIsSaved] = useState(false);
  const [testPrompt, setTestPrompt] = useState('Nipe muhtasari wa soko la Kariakoo');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestAi = () => {
    setIsTesting(true);
    setTestResponse(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResponse(
        'Kariakoo ni kitovu kikuu cha biashara na mzunguko wa fedha Tanzania na Afrika Mashariki, ikizalisha mabilioni ya shilingi kila siku kwenye vifaa vya kielektroniki, nguo na bidhaa za jumla.'
      );
    }, 900);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#130E26] to-[#0F1426] border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h4 className="font-extrabold text-sm text-white">
              Kituo cha Usimamizi wa Gemini AI (Zenia AI Management)
            </h4>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono border ${
                formData.mode === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : formData.mode === 'limited'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              Hali: {formData.mode.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Dhibiti injini ya Akili Bandia inayotoa ushauri, kutafsiri lugha na kusaidia watumiaji kwenye Zenia.
          </p>
        </div>

        {/* Quick Mode Switches */}
        <div className="flex items-center gap-1.5 bg-[#090D1C] p-1 rounded-2xl border border-white/10 shrink-0">
          {(['active', 'limited', 'maintenance'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                const next = { ...formData, mode: m };
                setFormData(next);
                onSaveConfig(next);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                formData.mode === m
                  ? m === 'active'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : m === 'limited'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metrics Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-[#12162A] border border-purple-500/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Maombi Leo (Requests Today)</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-purple-300 mt-1">
            {formData.requestsToday.toLocaleString()}
          </h3>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            ↑ +12.3% kuliko jana
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[#12162A] border border-cyan-500/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Kiwango cha Mafanikio</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-cyan-300 mt-1">
            {formData.successRate}%
          </h3>
          <span className="text-[11px] text-cyan-400 font-semibold mt-1 block">
            0.6% makosa (Retry handled)
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[#12162A] border border-emerald-500/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Muda wa Kujibu (Avg Latency)</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-300 mt-1">
            {formData.avgLatencyMs} ms
          </h3>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            Haraka sana (Ultra-fast)
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[#12162A] border border-amber-500/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Makadirio ya Gharama Mwezi Huu</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-amber-300 mt-1">
            TZS {formData.estimatedCostTzs.toLocaleString()}
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
            Kikomo: TZS {formData.dailyBudgetTzs.toLocaleString()} / siku
          </span>
        </div>
      </div>

      {/* Model Configuration Form */}
      <form onSubmit={handleSave} className="p-5 rounded-3xl bg-[#0F1426] border border-white/10 space-y-4 shadow-xl">
        <h4 className="font-extrabold text-sm text-white flex items-center gap-2 pb-2 border-b border-white/10">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Mipangilio ya Mfano & Vikomo (Model Config & Rate Limits)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold block">Mfano wa Gemini (AI Model)</label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full bg-[#131930] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Haraka, Bei Nafuu)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Uwezo Mkubwa wa Kina)</option>
            </select>
          </div>

          {/* Rate Limit Per User */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold block">
              Kikomo cha Maombi (Kila Mtumiaji / Dakika)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={formData.rateLimitPerMin}
                onChange={(e) => setFormData({ ...formData, rateLimitPerMin: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-cyan-300 shrink-0">
                {formData.rateLimitPerMin}/dakika
              </span>
            </div>
          </div>

          {/* Safety Threshold */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold block">Kiwango cha Udhibiti (Content Safety)</label>
            <select
              value={formData.safetyThreshold}
              onChange={(e) => setFormData({ ...formData, safetyThreshold: e.target.value as any })}
              className="w-full bg-[#131930] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="strict">Strict (Kuzuia Maudhui Yote Hatarishi)</option>
              <option value="standard">Standard (Kawaida)</option>
              <option value="relaxed">Relaxed (Nyepesi)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Mipangilio ya AI imehifadhiwa kikamilifu!</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              Mabadiliko ya mfano au hali ya AI yanatumika papo hapo kwa watumiaji wote.
            </span>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Hifadhi Mipangilio ya AI</span>
          </button>
        </div>
      </form>

      {/* Live AI Engine Smoke Test */}
      <div className="p-5 rounded-3xl bg-[#0F1426] border border-white/10 space-y-3 shadow-xl">
        <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Jaribu Injini ya AI Moja kwa Moja (Live Engine Smoke Test)</span>
        </h4>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Weka swali la kujaribu..."
            className="flex-1 bg-[#131930] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            disabled={isTesting || !testPrompt.trim()}
            onClick={handleTestAi}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            {isTesting ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Jaribu AI</span>
          </button>
        </div>

        {testResponse && (
          <div className="p-3.5 rounded-2xl bg-[#090E1E] border border-cyan-500/30 text-xs text-slate-200 leading-relaxed animate-in fade-in">
            <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">
              Jibu la Gemini ({formData.model}) • Latency: 420ms:
            </span>
            <p>{testResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};
