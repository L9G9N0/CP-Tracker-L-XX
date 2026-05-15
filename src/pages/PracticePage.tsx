import { useState, useCallback } from 'react';
import { Shuffle, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';

export default function PracticePage() {
  const { curriculum, progress, autoSynced, toggleProblem } = useGlobal();
  const [currentProblem, setCurrentProblem] = useState<{
    tierName: string;
    subName: string;
    problem: { id: string; name: string; url: string };
  } | null>(null);
  const [filter, setFilter] = useState<'all' | 'incomplete' | 'completed'>('incomplete');

  const pool = (curriculum ?? []).flatMap((tier) =>
    (tier?.subCategories ?? []).flatMap((sub) =>
      (sub?.problems ?? [])
        .filter((p) => {
          if (filter === 'all') return true;
          if (filter === 'incomplete') return !progress?.[p?.id];
          return !!progress?.[p?.id];
        })
        .map((problem) => ({
          tierName: tier?.tier ?? '',
          subName: sub?.name ?? '',
          problem,
        }))
    )
  );

  const pickRandom = useCallback(() => {
    if ((pool ?? []).length === 0) return;
    setCurrentProblem(pool[Math.floor(Math.random() * pool.length)]);
  }, [pool]);

  return (
    <main className="flex-1 min-w-0 px-7 py-7">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Practice</h1>
        <p className="text-sm text-white/35 mt-1">Random problem practice.</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-white/30 uppercase tracking-widest font-semibold">Filter:</span>
        {(['incomplete', 'all', 'completed'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? 'bg-sky-500/15 text-sky-300 border border-sky-500/25' : 'text-white/30 border border-white/[0.07] hover:text-white/60 hover:border-white/15'
            }`}>
            {f === 'incomplete' ? 'Incomplete' : f === 'all' ? 'All' : 'Completed'}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/20 tabular-nums">{(pool ?? []).length} problems</span>
      </div>

      <div className="max-w-lg mx-auto">
        {!currentProblem ? (
          <div className="rounded-2xl border border-white/[0.07] bg-[#111114] p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-5">
              <Shuffle size={28} className="text-sky-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Random Practice</h2>
            <p className="text-sm text-white/30 mb-6">Pick a random problem from your {filter} list.</p>
            <button onClick={pickRandom} disabled={(pool ?? []).length === 0}
              className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors">
              Pick a Problem
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-[#111114] overflow-hidden">
            <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{currentProblem.tierName}</span>
              <span className="text-white/10">/</span>
              <span className="text-[10px] text-white/25">{currentProblem.subName}</span>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">{currentProblem.problem?.name ?? 'Unknown'}</h2>
              {currentProblem.problem?.url && (
                <a href={currentProblem.problem.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors mb-4">
                  <ExternalLink size={13} /> Open on Codeforces
                </a>
              )}
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => toggleProblem(currentProblem.problem?.id ?? '')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    autoSynced?.[currentProblem.problem?.id ?? '']
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 cursor-default'
                      : progress?.[currentProblem.problem?.id ?? '']
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                      : 'bg-white/5 text-white/40 border border-white/[0.07] hover:text-white/70'
                  }`}>
                  <CheckCircle2 size={15} />
                  {autoSynced?.[currentProblem.problem?.id ?? ''] ? 'CF Synced' : progress?.[currentProblem.problem?.id ?? ''] ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={pickRandom} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-sm font-semibold text-white transition-colors">
                  <RefreshCw size={14} /> Next Problem
                </button>
                <button onClick={pickRandom} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.07] text-sm text-white/40 hover:text-white/70 hover:border-white/15 transition-all">
                  <Shuffle size={14} /> Shuffle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
