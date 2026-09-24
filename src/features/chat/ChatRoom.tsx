import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Mic,
  Send,
  CheckCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Conversation, ChatMessage, UserProfile } from '../../types';
import { AIService } from '../../services/ai/aiService';

interface ChatRoomProps {
  conversation: Conversation;
  currentUser: UserProfile;
  onBack: () => void;
  onStartCall: (type: 'video' | 'voice') => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  conversation,
  currentUser,
  onBack,
  onStartCall,
}) => {
  const otherUserId = conversation.participants.find((p) => p !== currentUser.id);
  const otherUser = otherUserId && conversation.participantDetails ? conversation.participantDetails[otherUserId] : null;
  const name = otherUser?.displayName || 'Sarah Mwangi';
  const avatar = otherUser?.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      conversationId: conversation.id,
      senderId: 'user_sarah',
      senderName: name,
      text: 'Hey! How are you doing? 😊',
      messageType: 'text',
      createdAt: '12:20 PM',
    },
    {
      id: 'm2',
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: 'You',
      text: "I am doing great! Exploring Zenia's new features.",
      messageType: 'text',
      createdAt: '12:22 PM',
    },
    {
      id: 'm3',
      conversationId: conversation.id,
      senderId: 'user_sarah',
      senderName: name,
      text: 'The marketplace and video calls are super smooth!',
      messageType: 'text',
      createdAt: '12:24 PM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
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
    const fullTranscript = messages.map((m) => `${m.senderName || 'User'}: ${m.text}`).join('. ');
    AIService.speakScreenText(
      fullTranscript,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070A12] text-white select-none">
      {/* Top Header */}
      <div className="bg-[#0D1222] px-4 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors active:scale-95"
            title="Back to Chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0D1222]" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight text-white">{name}</h3>
            <p className="text-[11px] text-emerald-400 font-medium">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={handleReadMessages}
            className={`p-2 rounded-xl transition-colors ${
              isSpeaking ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
            title="🔊 Sikiliza: Text-to-speech reading"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-cyan-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onStartCall('voice')}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-300 hover:text-white transition-colors"
            title="Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => onStartCall('video')}
            className="p-2 hover:bg-white/5 rounded-xl text-cyan-400 transition-colors"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <img src={avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isMe
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md shadow-cyan-600/10'
                    : 'bg-[#13192B] text-slate-100 rounded-bl-none border border-white/5 shadow-md'
                }`}
              >
                <p>{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-300/80">
                  <span>{msg.createdAt}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-200" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 bg-[#0D1222] border-t border-white/[0.08] flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#171F36] border border-white/[0.08] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
