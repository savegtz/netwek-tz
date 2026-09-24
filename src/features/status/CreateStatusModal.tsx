import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  MapPin,
  Send,
  BarChart2,
  Tag,
} from 'lucide-react';
import { StatusItem, StatusType, UserProfile } from '../../types';
import { AIService } from '../../services/ai/aiService';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase/config';
import { handleFirestoreError, OperationType } from '../../services/firebase/firestoreError';

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusType: StatusType | 'ai' | null;
  currentUser: UserProfile;
  onStatusCreated: (status: StatusItem) => void;
}

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  isOpen,
  onClose,
  statusType = 'photo',
  currentUser,
  onStatusCreated,
}) => {
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState(
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80'
  );
  const [location, setLocation] = useState('Zanzibar, Tanzania');
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [pollOption1, setPollOption1] = useState('Option A');
  const [pollOption2, setPollOption2] = useState('Option B');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const actualType: StatusType = statusType === 'ai' ? 'ai_generated' : (statusType || 'photo');

  const handleGenerateAICaption = async () => {
    setGeneratingCaption(true);
    try {
      const generated = await AIService.generateCaption(
        caption || `A vibrant moment in ${location}`
      );
      setCaption(generated);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newStatus: StatusItem = {
      id: `status_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorUsername: currentUser.username,
      authorPhoto: currentUser.photoURL,
      type: actualType,
      mediaUrl: mediaUrl,
      text: caption || 'Living my best life ✨',
      location: location,
      visibility: 'public',
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: 'Just now',
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      metadata:
        actualType === 'poll'
          ? {
              pollQuestion: caption || 'Cast your vote:',
              pollOptions: [
                { id: '1', text: pollOption1, votes: 0 },
                { id: '2', text: pollOption2, votes: 0 },
              ],
            }
          : undefined,
    };

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'statuses', newStatus.id), newStatus);
      }
      onStatusCreated(newStatus);
      onClose();
    } catch (err) {
      console.warn('Status creation local fallback:', err);
      onStatusCreated(newStatus);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0F1424] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-3xl p-5 pb-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
              <Camera className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white capitalize">
              New {actualType.replace('_', ' ')} Status
            </h4>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Media Preview */}
          <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
            <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={() => {
                  const sampleImages = [
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
                    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200',
                    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
                    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
                  ];
                  const next = sampleImages[(sampleImages.indexOf(mediaUrl) + 1) % sampleImages.length];
                  setMediaUrl(next);
                }}
                className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] text-cyan-300 font-bold"
              >
                Change Photo ↻
              </button>
            </div>
          </div>

          {/* Caption with AI button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-300">Caption</label>
              <button
                type="button"
                onClick={handleGenerateAICaption}
                disabled={generatingCaption}
                className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                {generatingCaption ? 'Generating with Gemini...' : 'AI Caption'}
              </button>
            </div>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's happening? (Expires in 24 hours)"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tag location"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {actualType === 'poll' && (
            <div className="space-y-2 p-2.5 rounded-xl bg-white/5">
              <p className="text-[11px] font-bold text-cyan-300">Poll Choices:</p>
              <input
                type="text"
                value={pollOption1}
                onChange={(e) => setPollOption1(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-xs text-white"
              />
              <input
                type="text"
                value={pollOption2}
                onChange={(e) => setPollOption2(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-xs text-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
          >
            {submitting ? 'Publishing...' : 'Share Status Story'}
          </button>
        </form>
      </div>
    </div>
  );
};
