import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Image as ImageIcon,
  FileText,
  BarChart2,
  Calendar,
  Smile,
  Mic,
  Send,
  CheckCheck,
  Paperclip,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Conversation, ChatMessage, UserProfile } from '../../types';
import { INITIAL_MESSAGES_CONV2 } from '../../services/seed/initialData';
import { AIService } from '../../services/ai/aiService';
import { SafeImage } from '../../components/SafeImage';

interface GroupChatRoomProps {
  conversation: Conversation;
  currentUser: UserProfile;
  onBack: () => void;
  onStartCall: (type: 'video' | 'voice') => void;
}

export const GroupChatRoom: React.FC<GroupChatRoomProps> = ({
  conversation,
  currentUser,
  onBack,
  onStartCall,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES_CONV2);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'media' | 'files' | 'polls' | 'events'>('all');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: 'You',
      text: inputText.trim(),
      messageType: 'text',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const handleReadMessages = () => {
    if (isSpeaking) {
      AIService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const fullTranscript = messages
      .map((m) => `${m.senderName || 'Member'} said: ${m.text}`)
      .join('. ');
    AIService.speakScreenText(
      fullTranscript,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-4 select-none">
      {/* Top Header matching Screenshot 7: Back, Avatar, Design Team (12 members), search, options */}
      <div className="bg-[#0D1220] px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-0.5 flex items-center justify-center font-bold text-xs text-white">
            DT
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight text-white">
              {conversation.groupName || 'Design Team'}
            </h3>
            <p className="text-[11px] text-slate-400">12 members</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <button
            onClick={handleReadMessages}
            className={`p-2 rounded-xl transition-colors ${
              isSpeaking ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5'
            }`}
            title="🔊 Sikiliza"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-cyan-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Tabs matching Screenshot 7: Media, Files, Polls, Events */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#090D18] border-b border-white/[0.04] text-xs font-semibold text-center">
        {[
          { id: 'media', label: 'Media', icon: ImageIcon },
          { id: 'files', label: 'Files', icon: FileText },
          { id: 'polls', label: 'Polls', icon: BarChart2 },
          { id: 'events', label: 'Events', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(activeTab === tab.id ? 'all' : (tab.id as any))}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all ${
                isActive ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Message Feed matching Screenshot 7 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <SafeImage
                  src={msg.senderAvatar}
                  fallbackText={msg.senderName}
                  fallbackGradient="from-indigo-800 to-purple-900"
                  alt={msg.senderName || ''}
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                />
              )}

              <div
                className={`max-w-[78%] rounded-2xl p-3 shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-[#006699] to-[#0088CC] text-white rounded-br-none'
                    : 'bg-[#121828] text-slate-100 rounded-bl-none border border-white/[0.06]'
                }`}
              >
                {!isMe && (
                  <p className="text-[11px] font-bold text-cyan-400 mb-1">{msg.senderName}</p>
                )}

                {/* Attachment Card matching Screenshot 7 (project_final.psd 2.4 MB) */}
                {msg.messageType === 'document' ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/30 border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/30 border border-blue-400 flex items-center justify-center font-bold text-white text-xs">
                      P
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{msg.fileName}</p>
                      <p className="text-[10px] text-slate-300 font-medium">{msg.fileSize}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                )}

                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                  <span>{msg.createdAt}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar matching Screenshot 7 */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-[#0D1220] border-t border-white/[0.06] flex items-center gap-2"
      >
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-white"
        >
          <Smile className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-[#151C2E] border border-white/[0.08] rounded-2xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={() => {
              const newDoc: ChatMessage = {
                id: `doc_${Date.now()}`,
                conversationId: conversation.id,
                senderId: currentUser.id,
                senderName: 'You',
                text: 'project_final.psd',
                messageType: 'document',
                fileName: 'project_final.psd',
                fileSize: '2.4 MB',
                createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
              setMessages((prev) => [...prev, newDoc]);
            }}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          className="p-2.5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
