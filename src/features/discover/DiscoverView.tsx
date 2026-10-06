import React, { useState } from 'react';
import {
  Search,
  Zap,
  MapPin,
  Users,
  Briefcase,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { SafeImage } from '../../components/SafeImage';
import { AVAILABLE_CONTACTS } from '../chat/components/StartNewChatModal';

interface DiscoverViewProps {
  onSelectCategory: (category: string) => void;
  onSelectTrendingItem: (id: string, type: string) => void;
  onStartChatWithUser?: (user: {
    id: string;
    displayName: string;
    username: string;
    photoURL?: string;
  }) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onSelectCategory,
  onSelectTrendingItem,
  onStartChatWithUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState<'trending' | 'nearby' | 'people'>('people');

  const categories = [
    { id: 'creators', title: 'Creators', count: '14.2K Active', icon: Users, gradient: 'from-rose-500/25 to-pink-600/30 border-rose-500/40 text-rose-400' },
    { id: 'businesses', title: 'Businesses', count: '8.9K Verified', icon: Briefcase, gradient: 'from-amber-500/25 to-orange-600/30 border-amber-500/40 text-amber-400' },
    { id: 'communities', title: 'Communities', count: '3.4K Hubs', icon: Zap, gradient: 'from-cyan-500/25 to-blue-600/30 border-cyan-500/40 text-cyan-400' },
    { id: 'products', title: 'Products', count: '45K Items', icon: ShoppingBag, gradient: 'from-emerald-500/25 to-teal-600/30 border-emerald-500/40 text-emerald-400' },
  ];

  const trendingItems = [
    {
      id: 'tech_world',
      title: 'Tech World',
      subtitle: 'Community • 125K members',
      type: 'community',
      icon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100',
    },
    {
      id: 'local_food',
      title: 'Local Food',
      subtitle: 'Business • 45K followers',
      type: 'business',
      icon: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100',
    },
    {
      id: 'job_opportunities',
      title: 'Job Opportunities',
      subtitle: 'Jobs • 32K following',
      type: 'jobs',
      icon: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    },
    {
      id: 'travel_adventure',
      title: 'Travel & Adventure',
      subtitle: 'Community • 78K members',
      type: 'community',
      icon: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100',
    },
  ];

  const filteredPeople = AVAILABLE_CONTACTS.filter((p) => {
    if (!searchQuery.trim()) return true;
    return (
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-28 md:pb-12 select-none overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1">
        {/* Search Bar */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tafuta watu (@username), marafiki, au kurasa..."
              className="w-full bg-[#161B2E] border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Filter Chips: People, Trending, Nearby */}
          <div className="flex items-center gap-2 mt-3">
            {[
              { id: 'people', label: 'Watu & Marafiki (People)', icon: Users },
              { id: 'trending', label: 'Trending', icon: Zap },
              { id: 'nearby', label: 'Nearby', icon: MapPin },
            ].map((chip) => {
              const Icon = chip.icon;
              const isSelected = activeChip === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveChip(chip.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Category Tiles (Creators, Businesses, Communities, Products) */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`p-4 rounded-2xl bg-gradient-to-br ${cat.gradient} border text-left flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-[0.98] group`}
              >
                <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-cyan-200 transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-[11px] text-slate-300/80 mt-0.5">{cat.count}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* SECTION 1: PEOPLE DIRECTORY (If People chip is active or searching) */}
        {activeChip === 'people' && (
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Watu na Wanajamii wa Zenia (People Directory)</span>
              </h4>
              <span className="text-xs text-slate-400">
                {filteredPeople.length} Watu wamepatikana
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPeople.map((person) => (
                <div
                  key={person.id}
                  className="p-4 rounded-2xl bg-[#0E1324] border border-white/5 hover:border-cyan-500/30 flex flex-col justify-between transition-all group shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <SafeImage
                        src={person.photoURL}
                        fallbackText={person.displayName}
                        fallbackGradient="from-cyan-800 to-indigo-900"
                        alt={person.displayName}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/10 group-hover:ring-cyan-400"
                      />
                      {person.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0E1324]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-sm text-white group-hover:text-cyan-300 truncate">
                          {person.displayName}
                        </h5>
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 fill-cyan-400/20" />
                      </div>
                      <p className="text-[11px] text-cyan-400/80 font-mono truncate">
                        @{person.username}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {person.bio}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{person.isOnline ? 'Online' : 'Karibuni hivi'}</span>
                    </span>

                    <button
                      onClick={() => {
                        if (onStartChatWithUser) {
                          onStartChatWithUser(person);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Tuma Ujumbe</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: TRENDING COMMUNITIES & BUSINESSES */}
        {activeChip !== 'people' && (
          <>
            <div className="px-4 pt-2 flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Trending Communities & Hubs
              </h4>
              <button className="text-xs text-cyan-400 hover:underline font-medium">
                See All
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {trendingItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTrendingItem(item.id, item.type)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#14192B] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={item.icon}
                      fallbackText={item.title}
                      fallbackGradient="from-indigo-900 to-purple-950"
                      alt={item.title}
                      className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <h5 className="font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
