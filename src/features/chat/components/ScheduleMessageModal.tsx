import React, { useState } from 'react';
import { X, Calendar, Clock, Send, Check } from 'lucide-react';

interface ScheduleMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageText: string;
  onSchedule: (timeString: string) => void;
}

export const ScheduleMessageModal: React.FC<ScheduleMessageModalProps> = ({
  isOpen,
  onClose,
  messageText,
  onSchedule,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('Kesho saa 2:00 Asubuhi');
  const [customTime, setCustomTime] = useState<string>('');

  if (!isOpen) return null;

  const presets = [
    'Baada ya dakika 30',
    'Baada ya saa 2',
    'Kesho saa 2:00 Asubuhi',
    'Kesho saa 8:00 Mchana',
    'Jumatatu saa 3:00 Asubuhi',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSchedule = customTime ? `Muda maalum: ${customTime}` : selectedPreset;
    onSchedule(finalSchedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#111628] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Panga Ujumbe Utumwe Baadaye</h3>
              <p className="text-[11px] text-cyan-300">Scheduled Message</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Preview */}
        <div className="p-3 rounded-2xl bg-[#090D1A] border border-white/5 mb-3 text-xs text-slate-300">
          <span className="text-[10px] text-cyan-400 font-bold block mb-1">
            Ujumbe utakaotumwa:
          </span>
          <p className="italic">"{messageText || 'Ujumbe wako uliopangwa...'}"</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-2">
              Chagua Wakati wa Kutuma
            </label>
            <div className="space-y-1.5">
              {presets.map((preset) => {
                const isSelected = selectedPreset === preset && !customTime;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(preset);
                      setCustomTime('');
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white'
                        : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{preset}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Au chagua tarehe & muda maalum
            </label>
            <input
              type="datetime-local"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full bg-[#182038] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Ghairi
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              Panga Ujumbe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
