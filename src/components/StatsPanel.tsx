import { Flame, Star, BarChart2, Award, Calendar } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';

const TIER_COLORS: Record<string, string> = {
  Unrated: 'text-white/40',
  Newbie: 'text-gray-400',
  Pupil: 'text-green-400',
  Specialist: 'text-cyan-300',
  Expert: 'text-sky-400',
  'Candidate Master': 'text-amber-400',
  Grandmaster: 'text-rose-400',
};

const TIER_BG: Record<string, string> = {
  Unrated: 'from-white/5 to-transparent border-white/10',
  Newbie: 'from-gray-800/30 to-transparent border-gray-600/20',
  Pupil: 'from-green-900/30 to-transparent border-green-700/20',
  Specialist: 'from-cyan-900/30 to-transparent border-cyan-700/20',
  Expert: 'from-sky-900/30 to-transparent border-sky-700/20',
  'Candidate Master': 'from-amber-900/30 to-transparent border-amber-700/20',
  Grandmaster: 'from-rose-900/30 to-transparent border-rose-700/20',
};

export default function StatsPanel() {
  const {
    totalCompleted, totalProblems, level, auraPercent, tierLabel,
    streak, heatmapData, tierStats,
  } = useGlobal();

  const overallPct = totalProblems > 0 ? (totalCompleted / totalProblems) * 100 : 0;

  const HEATMAP_CELLS = 30;
  const chunkSize = Math.max(1, Math.ceil((heatmapData?.length ?? 1) / HEATMAP_CELLS));
  const heatmap = Array.from({ length: HEATMAP_CELLS }, (_, i) => {
    const slice = (heatmapData ?? []).slice(i * chunkSize, (i + 1) * chunkSize);
    if (!slice.length) return 0;
    return slice.filter((c) => c?.done).length / slice.length;
  });

  const R = 42;
  const CIRC = 2 * Math.PI * R;
  const auraOffset = CIRC * (1 - auraPercent / 100);

  return (
    <aside className="w-64 flex-shrink-0 space-y-4">
      {/* Tier & Level */}
      <div className={`rounded-xl border bg-gradient-to-b p-4 ${TIER_BG[tierLabel] ?? TIER_BG['Unrated']}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Rank</p>
            <p className={`text-xl font-bold mt-0.5 ${TIER_COLORS[tierLabel] ?? 'text-white'}`}>{tierLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Level</p>
            <p className="text-xl font-bold text-white mt-0.5">{level}</p>
          </div>
        </div>

        <div className="flex flex-col items-center py-2">
          <div className="relative w-24 h-24">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(14,165,233,0.07)" strokeWidth="6" />
              <circle cx="48" cy="48" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
              <circle cx="48" cy="48" r={R} fill="none" stroke="url(#auraGrad)" strokeWidth="7"
                strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={auraOffset}
                transform="rotate(-90 48 48)" className="transition-all duration-700" />
              <defs>
                <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white">{Math.round(auraPercent)}%</span>
              <span className="text-[10px] text-white/30">Aura</span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-between text-center">
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest">Solved</p>
            <p className="text-base font-bold text-white tabular-nums">
              {totalCompleted}<span className="text-white/25 text-sm font-normal">/{totalProblems}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest">Rank #</p>
            <p className="text-base font-bold text-white">#{Math.max(1, 100 - totalCompleted)}</p>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111114] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={15} className="text-orange-400" />
          <p className="text-xs font-semibold text-white/60">Visit Streak</p>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-white">{streak?.streak ?? 0}</span>
          <span className="text-sm text-white/30">days</span>
        </div>
        <div className="flex gap-1.5 mt-3">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < (streak?.streak ?? 0) % 7 ? 'bg-orange-500/70' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      {/* Topic Grid */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111114] p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={15} className="text-sky-400" />
          <p className="text-xs font-semibold text-white/60">Problem Grid</p>
          <span className="ml-auto text-[11px] text-white/25 tabular-nums">{totalCompleted}/{totalProblems}</span>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {heatmap.map((val, i) => (
            <div key={i} title={`${Math.round(val * 100)}% done`}
              className="w-full aspect-square rounded-sm transition-colors duration-300"
              style={{ backgroundColor: val === 0 ? 'rgba(255,255,255,0.04)' : `rgba(14, 165, 233, ${0.12 + val * 0.88})` }}
            />
          ))}
        </div>
      </div>

      {/* Tier breakdown */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111114] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award size={15} className="text-emerald-400" />
          <p className="text-xs font-semibold text-white/60">Progress by Tier</p>
        </div>
        <div className="space-y-3">
          {(tierStats ?? []).map((stat) => {
            const pct = stat?.total > 0 ? (stat.completed / stat.total) * 100 : 0;
            return (
              <div key={stat?.tier ?? Math.random()}>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-white/50 truncate max-w-[130px]">{stat?.tier ?? 'Unknown'}</span>
                  <span className="text-[11px] text-white/30 tabular-nums">{stat?.completed ?? 0}/{stat?.total ?? 0}</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500/80 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111114] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star size={15} className="text-yellow-400" />
          <p className="text-xs font-semibold text-white/60">Overall Progress</p>
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-bold text-white">{Math.round(overallPct)}%</span>
          <span className="text-xs text-white/25">complete</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%`, background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)' }} />
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={13} className="text-white/30" />
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Activity</p>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="aspect-square rounded-[2px]"
                style={{ backgroundColor: i < totalCompleted % 35 ? `rgba(14, 165, 233, ${0.3 + (i % 5) * 0.14})` : 'rgba(255,255,255,0.04)' }}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
