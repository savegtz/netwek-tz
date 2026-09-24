import React, { useState } from 'react';
import {
  CheckCircle2,
  Share2,
  Edit,
  Grid,
  Sparkles,
  Video,
  ShoppingBag,
  Users,
  Shield,
  Heart,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SafeImage } from '../../components/SafeImage';

interface ProfileViewProps {
  currentUser: UserProfile;
  onOpenEditProfile: () => void;
  onOpenAdmin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onOpenEditProfile,
  onOpenAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'status' | 'videos' | 'shop'>('posts');

  const profilePosts = [
    {
      id: '1',
      url: '/assets/images/amina_avatar_1790280951312.jpg',
      likes: '1.4k',
      type: 'image',
      gradient: 'from-purple-800 to-indigo-900',
    },
    {
      id: '2',
      url: '/assets/images/zanzibar_beach_1790280962219.jpg',
      likes: '890',
      type: 'image',
      gradient: 'from-cyan-800 to-blue-900',
    },
    {
      id: '3',
      url: '/assets/images/concert_festival_1790280974630.jpg',
      likes: '2.1k',
      type: 'video',
      gradient: 'from-pink-800 to-rose-900',
    },
    {
      id: '4',
      url: '/assets/images/wireless_earbuds_1790280984496.jpg',
      likes: '3.2k',
      type: 'image',
      gradient: 'from-emerald-800 to-teal-900',
    },
    {
      id: '5',
      url: '/assets/images/amina_avatar_1790280951312.jpg',
      likes: '740',
      type: 'image',
      gradient: 'from-amber-800 to-orange-900',
    },
    {
      id: '6',
      url: '/assets/images/zanzibar_beach_1790280962219.jpg',
      likes: '1.8k',
      type: 'video',
      gradient: 'from-violet-800 to-purple-900',
    },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: currentUser.displayName, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied!');
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#0A0D18] text-white pb-24">
      {/* Top Header Icons (Matching Stitch Screen 5: Users icon on left, Shield and Share on right) */}
      <div className="px-5 py-3 flex items-center justify-between">
        <button
          onClick={onOpenEditProfile}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          title="Community Friends"
        >
          <Users className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdmin}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors"
            title="Admin & System Health"
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Header (Matching Stitch Screen 5) */}
      <div className="px-6 flex flex-col items-center text-center mt-1">
        {/* Glowing circular avatar */}
        <div className="relative mb-3.5">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-xl shadow-purple-500/25">
            <SafeImage
              src={currentUser.photoURL}
              fallbackText={currentUser.displayName}
              fallbackGradient="from-cyan-700 via-indigo-700 to-purple-800"
              alt={currentUser.displayName}
              className="w-full h-full rounded-full object-cover p-0.5 bg-[#0A0D18]"
            />
          </div>
          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-[#0A0D18]" />
        </div>

        {/* Display name with verified checkmark */}
        <div className="flex items-center gap-1.5 justify-center">
          <h2 className="text-lg font-bold text-white tracking-tight">{currentUser.displayName}</h2>
          <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400 shrink-0" />
        </div>

        <p className="text-xs text-slate-400 font-medium mt-0.5">@{currentUser.username}</p>

        {/* Bio */}
        <p className="text-xs text-slate-300 mt-2 max-w-xs leading-relaxed whitespace-pre-line">
          {currentUser.bio || 'Content Creator | Fashion | Lifestyle\nDream • Create • Inspire'}
        </p>

        {/* Stats Row (245 Following | 12.4K Followers | 3.2K Posts) */}
        <div className="grid grid-cols-3 gap-6 my-4 w-full max-w-xs py-3 rounded-2xl bg-white/[0.04] border border-white/5">
          <div>
            <p className="text-sm font-black text-white">{currentUser.followingCount || 245}</p>
            <p className="text-[10px] text-slate-400 font-medium">Following</p>
          </div>
          <div>
            <p className="text-sm font-black text-cyan-300">
              {((currentUser.followersCount || 12400) / 1000).toFixed(1)}K
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Followers</p>
          </div>
          <div>
            <p className="text-sm font-black text-white">{currentUser.postsCount || 3200}</p>
            <p className="text-[10px] text-slate-400 font-medium">Posts</p>
          </div>
        </div>

        {/* Action Buttons (Matching Stitch Screen 5: Edit Profile and Share) */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <button
            onClick={onOpenEditProfile}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* Tabs Header (Posts, Status, Videos, Shop) */}
      <div className="flex items-center justify-around border-b border-white/10 mt-6 px-4">
        {[
          { id: 'posts', label: 'Posts', icon: Grid },
          { id: 'status', label: 'Status', icon: Sparkles },
          { id: 'videos', label: 'Videos', icon: Video },
          { id: 'shop', label: 'Shop', icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-3 text-xs font-medium transition-all relative ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3x2 Grid of Media Items (Matching Stitch Screen 5) */}
      <div className="p-2 grid grid-cols-3 gap-1.5">
        {profilePosts.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-xl bg-slate-800 group cursor-pointer"
          >
            <SafeImage
              src={item.url}
              fallbackGradient={item.gradient}
              fallbackText="Zenia"
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {item.type === 'video' && (
              <span className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white">
                <Video className="w-3 h-3" />
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-bold text-white">
              <Heart className="w-3.5 h-3.5 fill-white" />
              {item.likes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
