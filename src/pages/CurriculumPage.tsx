import { useState, useMemo } from 'react';
import { Search, RotateCcw, CheckCircle2, TrendingUp, Target } from 'lucide-react';
import TierPanel from '../components/CategoryPanel';
import { useGlobal } from '../contexts/GlobalContext';

export default function CurriculumPage() {
  const {
    curriculum, progress, autoSynced, toggleProblem, resetProgress,
    totalCompleted, totalProblems, tierStats, subCategoryStats,
  } = useGlobal();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredCurriculum = useMemo(() => {
    if (!searchQuery?.trim()) return curriculum ?? [];
    const q = searchQuery.toLowerCase();
    return (curriculum ?? []).filter((tier) =>
      (tier?.subCategories ?? []).some((sub) =>
        (sub?.problems ?? []).some((p) => p?.name?.toLowerCase()?.includes(q))
      )
    );
  }, [searchQuery, curriculum]);

  const overallPct = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

  return (
    <main className="flex-1 min-w-0 px-7 py-7">
      <div className="mb-7">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Curriculum</h1>
            <p className="text-sm text-white/35 mt-1">Project L-X1 problem tracker.</p>
          </div>
          <button onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.07] text-xs text-white/30 hover:text-white/60 hover:border-white/15 transition-all">
            <RotateCcw size={12} /> Reset
          </button>
        </div>
        {showResetConfirm && (
          <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-lg border border-rose-500/20 bg-rose-500/5">
            <p className="text-xs text-rose-300/80 flex-1">Clear all progress?</p>
            <button onClick={() => { resetProgress(); setShowResetConfirm(false); }} className="px-3 py-1 rounded text-xs bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors">Yes, reset</button>
            <button onClick={() => setShowResetConfirm(false)} className="px-3 py-1 rounded text-xs text-white/30 hover:text-white/60 transition-colors">Cancel</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <MiniStat icon={<CheckCircle2 size={14} className="text-emerald-400" />} label="Solved" value={`${totalCompleted}/${totalProblems}`} />
        <MiniStat icon={<TrendingUp size={14} className="text-sky-400" />} label="Progress" value={`${overallPct}%`} />
        <MiniStat icon={<Target size={14} className="text-amber-400" />} label="Remaining" value={`${totalProblems - totalCompleted}`} />
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
        <input type="text" placeholder="Search problems..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#111114] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-sky-500/40 focus:bg-[#131317] transition-all" />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors text-xl leading-none">&times;</button>
        )}
      </div>

      <div className="space-y-3">
        {(filteredCurriculum ?? []).length === 0 ? (
          <div className="text-center py-16"><p className="text-white/20 text-sm">No problems found for &ldquo;{searchQuery}&rdquo;</p></div>
        ) : (
          (filteredCurriculum ?? []).map((tier) => {
            const stats = (tierStats ?? []).find((s) => s?.tier === tier?.tier);
            return (
              <TierPanel
                key={tier?.tier ?? Math.random()}
                tier={tier}
                progress={progress ?? {}}
                autoSynced={autoSynced ?? {}}
                onToggle={toggleProblem}
                completedCount={stats?.completed ?? 0}
                subCategoryStats={subCategoryStats ?? {}}
                searchQuery={searchQuery}
              />
            );
          })
        )}
      </div>
    </main>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-white/[0.07] bg-[#111114]">
      {icon}
      <div>
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{label}</p>
        <p className="text-sm font-bold text-white tabular-nums">{value}</p>
      </div>
    </div>
  );
}
