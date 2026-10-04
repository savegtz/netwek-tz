import React, { useRef } from 'react';
import {
  X,
  MessageSquare,
  Phone,
  Video,
  Info,
  Camera,
  Check,
  User,
  Sparkles,
} from 'lucide-react';
import { Conversation } from '../../../types';
import freshKkAvatar from '../../../assets/images/fresh_kk_avatar_1791078365294.jpg';
import freshKkStatus from '../../../assets/images/fresh_kk_status_1791078352206.jpg';

interface ProfilePicturePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onOpenChat: (conv: Conversation) => void;
  onStartCall: (type: 'voice' | 'video', conv: Conversation) => void;
  onOpenInfo: (conv: Conversation) => void;
  onUpdateAvatar: (convId: string, newAvatarUrl: string) => void;
}

export const ProfilePicturePreviewModal: React.FC<ProfilePicturePreviewModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onOpenChat,
  onStartCall,
  onOpenInfo,
  onUpdateAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !conversation) return null;

  const otherUserId = conversation.participants.find((p) => p !== 'current_user_id');
  const otherUser = otherUserId && conversation.participantDetails ? conversation.participantDetails[otherUserId] : null;
  const title = conversation.isGroup ? conversation.groupName : otherUser?.displayName || 'Direct Chat';
  const avatar = conversation.isGroup
    ? conversation.groupAvatar || '/assets/images/amina_avatar_1790280951312.jpg'
    : otherUser?.photoURL || '/assets/images/amina_avatar_1790280951312.jpg';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateAvatar(conversation.id, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetFreshKkAvatar = () => {
    onUpdateAvatar(conversation.id, freshKkAvatar);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[290px] sm:max-w-[320px] bg-[#0E1322] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col"
      >
        {/* Header bar with Contact Name and Close button */}
        <div className="p-3 bg-gradient-to-b from-[#141B2E] to-[#0E1322] border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white truncate max-w-[210px] drop-shadow-sm">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Large Profile Picture View */}
        <div className="relative w-full aspect-square bg-[#070A12] overflow-hidden group">
          <img
            src={avatar}
            alt={title || 'Profile'}
            className="w-full h-full object-cover"
          />

          {/* Quick Change Picture Pill Overlay */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <button
              onClick={handleSetFreshKkAvatar}
              className="px-2 py-1 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-[10px] font-bold text-cyan-200 backdrop-blur-md shadow-lg flex items-center gap-1"
              title="Weka picha ya Fresh kk kama wasifu"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Picha ya Fresh kk
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white backdrop-blur-md shadow-lg"
              title="Pakia picha nyingine"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* 4 WhatsApp-Style Quick Action Buttons (Message, Audio, Video, Info) */}
        <div className="grid grid-cols-4 p-2 bg-[#12182B] border-t border-white/10 text-center">
          {/* 1. Message */}
          <button
            onClick={() => {
              onClose();
              onOpenChat(conversation);
            }}
            className="flex flex-col items-center justify-center py-2 px-1 hover:bg-white/5 rounded-2xl text-cyan-400 hover:text-cyan-300 transition-all active:scale-95"
            title="Tuma Ujumbe (Chat)"
          >
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium text-slate-300">Ujumbe</span>
          </button>

          {/* 2. Voice Call */}
          <button
            onClick={() => {
              onClose();
              onStartCall('voice', conversation);
            }}
            className="flex flex-col items-center justify-center py-2 px-1 hover:bg-white/5 rounded-2xl text-emerald-400 hover:text-emerald-300 transition-all active:scale-95"
            title="Piga Simu ya Sauti"
          >
            <Phone className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium text-slate-300">Sauti</span>
          </button>

          {/* 3. Video Call */}
          <button
            onClick={() => {
              onClose();
              onStartCall('video', conversation);
            }}
            className="flex flex-col items-center justify-center py-2 px-1 hover:bg-white/5 rounded-2xl text-cyan-400 hover:text-cyan-300 transition-all active:scale-95"
            title="Piga Simu ya Video"
          >
            <Video className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium text-slate-300">Video</span>
          </button>

          {/* 4. Contact Info */}
          <button
            onClick={() => {
              onClose();
              onOpenInfo(conversation);
            }}
            className="flex flex-col items-center justify-center py-2 px-1 hover:bg-white/5 rounded-2xl text-indigo-400 hover:text-indigo-300 transition-all active:scale-95"
            title="Taarifa za Mhusika"
          >
            <Info className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium text-slate-300">Taarifa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
