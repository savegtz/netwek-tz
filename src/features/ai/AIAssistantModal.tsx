import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Send,
  Image,
  Type,
  Languages,
  FileText,
  Megaphone,
  Briefcase,
  Bot,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AIService, AIChatMessage } from '../../services/ai/aiService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content: 'How can I help you today?',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: 'Generate image', prompt: 'Create a vibrant digital art concept of a futuristic African metropolis with flying solar transit.', icon: Image },
    { label: 'Write a caption', prompt: 'Write an inspiring status caption for a stunning sunset photo in Zanzibar.', icon: Type },
    { label: 'Translate', prompt: 'Translate this to Swahili: "Welcome to Zenia, your complete digital life in one place."', icon: Languages },
    { label: 'Summarize', prompt: 'Summarize the key advantages of unified superapps combining social, payments, and marketplace.', icon: FileText },
    { label: 'Create advertisement', prompt: 'Write a high-converting advertisement copy for noise-cancelling wireless earbuds at 20% discount.', icon: Megaphone },
    { label: 'Help with job application', prompt: 'Draft a short, persuasive cover letter for a Frontend Developer role at a tech startup.', icon: Briefcase },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    const userMsg: AIChatMessage = { role: 'user', content: query.trim() };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputPrompt('');
    setLoading(true);

    try {
      const reply = await AIService.generateChatResponse(updatedHistory);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an issue processing your request.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNarration = (text: string) => {
    if (isSpeaking) {
      AIService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    AIService.speakScreenText(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md h-[92vh] sm:h-[680px] bg-[#0A0D18] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header (Matching Screenshot Screen 14) */}
        <div className="p-4 border-b border-white/10 bg-[#121626] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">AI Assistant</h3>
              <p className="text-[10px] text-cyan-300 font-mono">POWERED BY GEMINI</p>
            </div>
          </div>
          <button
            onClick={() => handleNarration(messages[messages.length - 1]?.content || '')}
            className={`p-2 rounded-xl transition-colors ${
              isSpeaking ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
            title="🔊 Sikiliza: Read AI response"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                      : 'bg-[#161B2E] text-slate-200 border border-white/5 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20 w-fit">
              <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
              <span>Thinking with Gemini...</span>
            </div>
          )}

          {/* Quick Prompt Pills (Matching Screenshot Screen 14) */}
          {messages.length <= 2 && (
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSend(item.prompt)}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/30 text-left flex items-center gap-2 transition-all text-xs text-slate-300 hover:text-cyan-300"
                    >
                      <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#121626] border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message or prompt..."
            className="flex-1 bg-[#1C2237] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputPrompt.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-md disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
