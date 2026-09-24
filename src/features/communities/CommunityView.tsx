import React, { useState } from 'react';
import {
  Users,
  Search,
  ArrowLeft,
  Heart,
  MessageSquare,
  Share2,
  Plus,
  Send,
  Calendar,
  Sparkles,
  Check,
} from 'lucide-react';
import { CommunityItem, CommunityPost, UserProfile } from '../../types';
import { INITIAL_COMMUNITIES } from '../../services/seed/initialData';
import { SafeImage } from '../../components/SafeImage';

interface CommunityViewProps {
  currentUser: UserProfile;
  onBack?: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  currentUser,
  onBack,
}) => {
  const [community, setCommunity] = useState<CommunityItem>(INITIAL_COMMUNITIES[0]);
  const [isJoined, setIsJoined] = useState(community.isJoined || false);
  const [activeTab, setActiveTab] = useState<'posts' | 'groups' | 'events' | 'members'>('posts');
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 'p1',
      communityId: community.id,
      authorId: 'user_daniel',
      authorName: 'Daniel',
      authorPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      content: 'AI is changing the future. What do you think?',
      likesCount: 234,
      commentsCount: 56,
      createdAt: '2h ago',
    },
    {
      id: 'p2',
      communityId: community.id,
      authorId: 'user_sarah',
      authorName: 'Sarah Mwangi',
      authorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
      content: 'Excited about the upcoming developer meetup! Who else is building on WebRTC and AI agents?',
      likesCount: 142,
      commentsCount: 29,
      createdAt: '5h ago',
    },
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const handleToggleJoin = () => {
    setIsJoined((j) => !j);
    setCommunity((c) => ({
      ...c,
      membersCount: c.membersCount + (isJoined ? -1 : 1),
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      communityId: community.id,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorPhoto: currentUser.photoURL,
      content: newPostContent.trim(),
      likesCount: 1,
      commentsCount: 0,
      createdAt: 'Just now',
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const toggleLikePost = (postId: string) => {
    setLikedPosts((prev) => {
      const isNowLiked = !prev[postId];
      setPosts((pList) =>
        pList.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount + (isNowLiked ? 1 : -1) } : p))
      );
      return { ...prev, [postId]: isNowLiked };
    });
  };

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-28 select-none">
      {/* Header Banner (Matching Screenshot Screen 13) */}
      <div className="relative h-40 w-full bg-indigo-950 overflow-hidden">
        <SafeImage
          src={community.bannerUrl}
          fallbackText={community.name}
          fallbackGradient="from-purple-950 to-indigo-950"
          alt={community.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D18] via-transparent to-black/50" />

        {/* Top back & search */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-full bg-black/40 text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-black/40 text-white">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Community Info Block */}
      <div className="px-5 relative -top-8">
        <div className="flex items-end justify-between">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-xl ring-4 ring-[#0A0D18]">
            <div className="w-full h-full rounded-[14px] bg-[#12162B] flex items-center justify-center font-black text-2xl text-cyan-300">
              X
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">{community.name}</h3>
              <p className="text-xs text-slate-400 font-medium">
                {(community.membersCount / 1000).toFixed(1)}K members
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{community.description}</p>

          {/* Join Community Action Button (Matching Screenshot Screen 13) */}
          <button
            onClick={handleToggleJoin}
            className={`w-full mt-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isJoined
                ? 'bg-white/10 hover:bg-white/15 text-cyan-300 border border-cyan-500/30'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-500/20'
            }`}
          >
            {isJoined ? (
              <>
                <Check className="w-4 h-4" />
                Joined Community
              </>
            ) : (
              'Join Community'
            )}
          </button>
        </div>
      </div>

      {/* Tabs Header (Posts, Groups, Events, Members) */}
      <div className="flex items-center justify-around border-b border-white/10 px-4 mt-[-8px]">
        {(['posts', 'groups', 'events', 'members'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider transition-all relative ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Community Post Creator */}
      {activeTab === 'posts' && (
        <div className="p-4 space-y-3">
          <form onSubmit={handleCreatePost} className="p-3 rounded-2xl bg-[#14192B] border border-white/5">
            <textarea
              rows={2}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share an insight with Tech Innovators..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[10px] text-slate-400">Post as {currentUser.displayName}</span>
              <button
                type="submit"
                className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Post
              </button>
            </div>
          </form>

          {/* Posts Feed (Matching Screenshot Screen 13: Daniel, "AI is changing the future...") */}
          {posts.map((post) => {
            const isLiked = !!likedPosts[post.id];
            return (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-[#14192B] border border-white/5 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={post.authorPhoto}
                    fallbackText={post.authorName}
                    fallbackGradient="from-indigo-800 to-purple-900"
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-white">{post.authorName}</h5>
                    <p className="text-[10px] text-slate-400">{post.createdAt}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

                {/* Reaction numbers (234, 56) */}
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-white/5">
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-white">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-white ml-auto">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
