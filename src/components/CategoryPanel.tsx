import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { Tier, ProgressState, AutoSyncedState } from '../types';

interface TierPanelProps {
  tier: Tier;
  progress: ProgressState;
  autoSynced: AutoSyncedState;
  onToggle: (problemId: string) => void;
  completedCount: number;
  subCategoryStats: Record<string, { completed: number; total: number }>;
  searchQuery: string;
}

interface SubCategoryPanelProps {
  tierName: string;
  subName: string;
  problems: { id: string; name: string; url: string }[];
  progress: ProgressState;
  autoSynced: AutoSyncedState;
  onToggle: (problemId: string) => void;
  stats: { completed: number; total: number };
  defaultOpen: boolean;
}

function SubCategoryPanel({
  tierName: _tierName,
  subName,
  problems,
  progress,
  autoSynced,
  onToggle,
  stats,
  defaultOpen,
}: SubCategoryPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = stats?.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
      >
        <span className="flex-1 text-left text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">
          {subName}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-sky-500/70 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] text-white/30 tabular-nums w-12 text-right">
            {stats?.completed ?? 0}/{stats?.total ?? 0}
          </span>
        </div>
        <ChevronDown size={14} className={`text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-3 pt-1 space-y-0.5 bg-black/20">
          {(problems ?? []).map((problem) => {
            const done = !!progress?.[problem?.id];
            const synced = !!autoSynced?.[problem?.id];
            return (
              <div
                key={problem?.id ?? Math.random()}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 hover:bg-white/[0.04] group ${done ? 'opacity-60' : ''}`}
              >
                {/* Checkbox */}
                <div
                  onClick={() => problem?.id && onToggle(problem.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-150 cursor-pointer ${
                    synced ? 'bg-emerald-500 border-emerald-500'
                      : done ? 'bg-sky-500 border-sky-500'
                      : 'border-white/20 group-hover:border-sky-500/50'
                  }`}
                >
                  {(done || synced) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white">
                      <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Problem name — clickable link if url exists */}
                {problem?.url ? (
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[13px] select-none transition-colors flex items-center gap-1.5 ${
                      synced ? 'text-emerald-400/80'
                        : done ? 'text-white/35 line-through decoration-white/20'
                        : 'text-white/60 group-hover:text-sky-300'
                    }`}
                  >
                    {problem.name}
                    <ExternalLink size={10} className="opacity-40" />
                  </a>
                ) : (
                  <span
                    onClick={() => problem?.id && onToggle(problem.id)}
                    className={`text-[13px] select-none transition-colors cursor-pointer ${
                      synced ? 'text-emerald-400/80'
                        : done ? 'text-white/35 line-through decoration-white/20'
                        : 'text-white/60 group-hover:text-white/80'
                    }`}
                  >
                    {problem?.name ?? 'Unknown'}
                  </span>
                )}

                {/* Auto-sync badge */}
                {synced && (
                  <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-emerald-500/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    CF
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TierPanel({
  tier,
  progress,
  autoSynced,
  onToggle,
  completedCount,
  subCategoryStats,
  searchQuery,
}: TierPanelProps) {
  const [open, setOpen] = useState(false);
  const total = (tier?.subCategories ?? []).reduce((s, sub) => s + (sub?.problems ?? []).length, 0);
  const pct = total > 0 ? (completedCount / total) * 100 : 0;

  const filteredSubs = (tier?.subCategories ?? [])
    .map((sub) => ({
      ...sub,
      problems: (sub?.problems ?? []).filter((p) =>
        p?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase() ?? '')
      ),
    }))
    .filter((sub) => (sub?.problems ?? []).length > 0);

  const hasSearch = (searchQuery ?? '').trim().length > 0;
  const showSubs = hasSearch ? filteredSubs : (tier?.subCategories ?? []);
  const isOpenEffective = open || hasSearch;

  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden bg-[#111114]">
      <button
        onClick={() => !hasSearch && setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${hasSearch ? 'cursor-default' : 'hover:bg-white/[0.03]'}`}
      >
        <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-sky-400">{tier?.tier?.match(/\d+/)?.[0] ?? '?'}</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-white/90">{tier?.tier ?? 'Unknown Tier'}</p>
          <p className="text-[11px] text-white/30 mt-0.5">{completedCount} of {total} Problems</p>
        </div>
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 36 36" className="flex-shrink-0">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none" stroke="rgb(14 165 233)" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 15}`}
              strokeDashoffset={`${2 * Math.PI * 15 * (1 - pct / 100)}`}
              transform="rotate(-90 18 18)"
              className="transition-all duration-500"
            />
            <text x="18" y="18" textAnchor="middle" dominantBaseline="central" className="fill-white/50" fontSize="8" fontWeight="600">
              {Math.round(pct)}%
            </text>
          </svg>
          {!hasSearch && <ChevronDown size={16} className={`text-white/25 transition-transform duration-250 ${open ? 'rotate-180' : ''}`} />}
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-350 ease-in-out ${isOpenEffective ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-white/5">
          {(showSubs ?? []).length === 0 ? (
            <p className="text-center text-xs text-white/20 py-4">No problems match your search.</p>
          ) : (
            (showSubs ?? []).map((sub) => (
              <SubCategoryPanel
                key={sub?.name ?? Math.random()}
                tierName={tier?.tier ?? ''}
                subName={sub?.name ?? 'Unknown'}
                problems={sub?.problems ?? []}
                progress={progress}
                autoSynced={autoSynced}
                onToggle={onToggle}
                stats={
                  hasSearch
                    ? { completed: (sub?.problems ?? []).filter((p) => !!progress?.[p?.id]).length, total: (sub?.problems ?? []).length }
                    : subCategoryStats[`${tier?.tier ?? ''}|${sub?.name ?? ''}`] ?? { completed: 0, total: (sub?.problems ?? []).length }
                }
                defaultOpen={hasSearch}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
