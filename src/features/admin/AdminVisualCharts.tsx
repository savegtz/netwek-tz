/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  ArrowUpRight,
  Calendar,
  Activity,
  Layers,
} from 'lucide-react';

export const AdminVisualCharts: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [activeChart, setActiveChart] = useState<'sales' | 'fees' | 'growth'>('sales');
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; value: string; extra: string } | null>(null);

  // Weekly GMV data points (Jumatatu - Jumapili)
  const weeklyGmv = [
    { day: 'Jumatatu', gmv: 21.4, orders: 240, fee: 0.53, users: 112 },
    { day: 'Jumanne', gmv: 26.8, orders: 310, fee: 0.67, users: 145 },
    { day: 'Jumatano', gmv: 24.1, orders: 285, fee: 0.60, users: 130 },
    { day: 'Alhamisi', gmv: 29.5, orders: 360, fee: 0.74, users: 180 },
    { day: 'Ijumaa', gmv: 34.2, orders: 420, fee: 0.85, users: 220 },
    { day: 'Jumamosi', gmv: 42.0, orders: 510, fee: 1.05, users: 290 },
    { day: 'Jumapili', gmv: 38.5, orders: 460, fee: 0.96, users: 260 },
  ];

  // Max scale calculation
  const maxGmv = 50;
  const maxFee = 1.2;
  const maxUsers = 350;

  return (
    <div className="p-5 rounded-3xl bg-[#0F1426] border border-cyan-500/20 shadow-xl space-y-5 select-none">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Grafu za Mapato & Takwimu za Mfumo (Visual Charts)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Mwenendo wa mauzo ya sokoni, ada za miamala (2.5%), na ongezeko la watumiaji
          </p>
        </div>

        {/* View Selectors */}
        <div className="flex items-center gap-1.5 bg-[#14192E] p-1 rounded-2xl border border-white/5 shrink-0">
          <button
            onClick={() => setActiveChart('sales')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeChart === 'sales'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mauzo (GMV)
          </button>
          <button
            onClick={() => setActiveChart('fees')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeChart === 'fees'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ada ya Pochi (2.5%)
          </button>
          <button
            onClick={() => setActiveChart('growth')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeChart === 'growth'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Watumiaji Wapya
          </button>
        </div>
      </div>

      {/* Main Interactive SVG Chart Canvas */}
      <div className="relative pt-2">
        {/* Metric summary banner */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              {activeChart === 'sales'
                ? 'Jumla ya Mauzo Sokoni Wiki Hii'
                : activeChart === 'fees'
                ? 'Mapato ya Ada ya Pochi (2.5%) Wiki Hii'
                : 'Watumiaji Waliojisajili Wiki Hii'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {activeChart === 'sales'
                  ? 'TZS 216.5M'
                  : activeChart === 'fees'
                  ? 'TZS 5.40M'
                  : '1,337 Watumiaji'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+24.6%</span>
              </span>
            </div>
          </div>

          {hoveredPoint && (
            <div className="px-3 py-1.5 rounded-xl bg-black/70 border border-cyan-400/40 text-right animate-in fade-in">
              <span className="text-[10px] text-cyan-300 font-bold block">{hoveredPoint.day}</span>
              <span className="text-xs font-black text-white">{hoveredPoint.value}</span>
              <span className="text-[9px] text-slate-400 block">{hoveredPoint.extra}</span>
            </div>
          )}
        </div>

        {/* SVG Curve Canvas */}
        <div className="w-full h-56 relative bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl p-2 border border-white/5">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 700 200"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradientSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="chartGradientFees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="chartGradientGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[40, 90, 140, 190].map((y, i) => (
              <line
                key={i}
                x1="0"
                y1={y}
                x2="700"
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            ))}

            {/* Calculated SVG Path coordinates */}
            {(() => {
              const points = weeklyGmv.map((d, idx) => {
                const x = 50 + idx * 100;
                let val = d.gmv / maxGmv;
                if (activeChart === 'fees') val = d.fee / maxFee;
                if (activeChart === 'growth') val = d.users / maxUsers;
                const y = 180 - val * 150;
                return { x, y, data: d };
              });

              // Create smooth SVG cubic bezier path
              let pathD = `M ${points[0].x} ${points[0].y}`;
              for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i];
                const p1 = points[i + 1];
                const mx = (p0.x + p1.x) / 2;
                pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
              }

              const areaD = `${pathD} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`;
              const strokeColor =
                activeChart === 'sales'
                  ? '#f59e0b'
                  : activeChart === 'fees'
                  ? '#10b981'
                  : '#06b6d4';
              const gradientId =
                activeChart === 'sales'
                  ? 'url(#chartGradientSales)'
                  : activeChart === 'fees'
                  ? 'url(#chartGradientFees)'
                  : 'url(#chartGradientGrowth)';

              return (
                <>
                  <path d={areaD} fill={gradientId} />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />

                  {/* Interactive Point Dots */}
                  {points.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill="#0B0F20"
                        stroke={strokeColor}
                        strokeWidth="3"
                        className="cursor-pointer transition-all hover:scale-150"
                        onMouseEnter={() => {
                          if (activeChart === 'sales') {
                            setHoveredPoint({
                              day: pt.data.day,
                              value: `TZS ${pt.data.gmv}M`,
                              extra: `${pt.data.orders} Oda zilizokamilika`,
                            });
                          } else if (activeChart === 'fees') {
                            setHoveredPoint({
                              day: pt.data.day,
                              value: `TZS ${(pt.data.fee * 1000000).toLocaleString()}`,
                              extra: `Ada 2.5% ya miamala`,
                            });
                          } else {
                            setHoveredPoint({
                              day: pt.data.day,
                              value: `+${pt.data.users} Watumiaji`,
                              extra: `Waliothibitishwa`,
                            });
                          }
                        }}
                      />
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>

        {/* Days of Week X-Axis */}
        <div className="flex justify-between px-3 pt-3 text-[11px] font-bold text-slate-400">
          {weeklyGmv.map((d, i) => (
            <span key={i} className="text-center w-12 truncate">
              {d.day.slice(0, 3)}
            </span>
          ))}
        </div>
      </div>

      {/* Mini Bar Breakdown Table */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Kiwango cha Ubadilishaji</span>
          <h5 className="text-lg font-black text-amber-300">4.82%</h5>
          <p className="text-[10px] text-slate-400">Wageni wanaonunua sokoni</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Wastani wa Thamani ya Oda</span>
          <h5 className="text-lg font-black text-emerald-300">TZS 115,000</h5>
          <p className="text-[10px] text-slate-400">Kwa kila manunuzi sokoni</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Watumiaji Hai (DAU)</span>
          <h5 className="text-lg font-black text-cyan-300">894 Watumiaji</h5>
          <p className="text-[10px] text-slate-400">Wanatumia Zenia kila siku</p>
        </div>
      </div>
    </div>
  );
};
