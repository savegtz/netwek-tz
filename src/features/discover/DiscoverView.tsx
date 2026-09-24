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
} from 'lucide-react';
import { SafeImage } from '../../components/SafeImage';

interface DiscoverViewProps {
  onSelectCategory: (category: string) => void;
  onSelectTrendingItem: (id: string, type: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onSelectCategory,
  onSelectTrendingItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState<'trending' | 'nearby' | 'people'>('trending');

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

  return (
    <div className="w-full flex flex-col bg-[#070A12] text-white flex-1 pb-28 select-none">
      {/* Search Bar */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="w-full bg-[#161B2E] border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filter Chips: Trending, Nearby, People (Matching Screenshot) */}
        <div className="flex items-center gap-2 mt-3">
          {[
            { id: 'trending', label: 'Trending', icon: Zap },
            { id: 'nearby', label: 'Nearby', icon: MapPin },
            { id: 'people', label: 'People', icon: Users },
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
      <div className="p-4 grid grid-cols-2 gap-3">
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

      {/* Trending Header */}
      <div className="px-4 pt-2 flex items-center justify-between">
        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Trending
        </h4>
        <button className="text-xs text-cyan-400 hover:underline font-medium">
          See All
        </button>
      </div>

      {/* Trending List (Tech World, Local Food, Job Opportunities, Travel & Adventure) */}
      <div className="p-4 space-y-2.5">
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
    </div>
  );
};
