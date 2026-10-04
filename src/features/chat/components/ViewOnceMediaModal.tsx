import React, { useEffect } from 'react';
import { X, Lock, Eye, AlertCircle, ShieldAlert } from 'lucide-react';

interface ViewOnceMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  senderName: string;
  mediaType?: 'image' | 'video';
}

export const ViewOnceMediaModal: React.FC<ViewOnceMediaModalProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  senderName,
  mediaType = 'image',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black select-none animate-in fade-in duration-200">
      {/* Top Bar with Security Warning */}
      <div className="p-4 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-cyan-500/20 text-cyan-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
              <span>Tazama Mara Moja (View Once)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Picha ya Siri
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Kutoka kwa: {senderName}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 flex items-center gap-1 text-xs font-semibold px-3"
        >
          <X className="w-4 h-4" />
          <span>Funga & Futa</span>
        </button>
      </div>

      {/* Media Center View */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-[#05070D]">
        <div className="relative max-w-2xl max-h-[80vh] w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img
            src={mediaUrl}
            alt="View Once Media"
            className="w-full h-full max-h-[75vh] object-contain rounded-2xl"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>

      {/* Bottom Alert Banner */}
      <div className="p-3 bg-black/90 border-t border-white/10 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Picha hii itafungwa na kujifuta kabisa punde tu utakapofunga ukurasa huu.</span>
      </div>
    </div>
  );
};
