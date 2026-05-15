import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../contexts/GlobalContext';
import StatsPanel from '../components/StatsPanel';
import { CheckCircle2, TrendingUp, Target } from 'lucide-react';

export default function DashboardPage() {
  const { totalCompleted, totalProblems, tierStats, subCategoryStats, curriculum } = useGlobal();
  const navigate = useNavigate();
  const overallPct = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;

  return (
    <div className="flex min-h-full">
      <main className="flex-1 min-w-0 px-7 py-7">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/35 mt-1">Project L-X1 progress at a glance.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon={<CheckCircle2 size={16} className="text-emerald-400" />} label="Solved" value={`${totalCompleted}`} sub={`of ${totalProblems} problems`} color="emerald" />
          <StatCard icon={<TrendingUp size={16} className="text-sky-400" />} label="Progress" value={`${overallPct}%`} sub="overall completion" color="sky" />
          <StatCard icon={<Target size={16} className="text-amber-400" />} label="Remaining" value={`${totalProblems - totalCompleted}`} sub="problems left" color="amber" />
        </div>

        {/* Clickable tier cards */}
        <div className="grid grid-cols-1 gap-3">
          {(tierStats ?? []).map((stat) => {
            const tier = (curriculum ?? []).find((t) => t?.tier === stat.tier);
            const pct = stat?.total > 0 ? (stat.completed / stat.total) * 100 : 0;
            return (
              <button
                key={stat?.tier ?? Math.random()}
                onClick={() => navigate('/curriculum')}
                className="rounded-xl border border-white/[0.07] bg-[#111114] p-4 text-left hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white/80 group-hover:text-sky-300 transition-colors">{stat?.tier ?? 'Unknown'}</p>
                  <span className="text-[11px] text-white/30 tabular-nums">{stat?.completed ?? 0}/{stat?.total ?? 0}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500/80 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(tier?.subCategories ?? []).map((sub) => {
                    const key = `${tier?.tier ?? ''}|${sub?.name ?? ''}`;
                    const subStat = subCategoryStats?.[key];
                    const subPct = subStat && subStat.total > 0 ? (subStat.completed / subStat.total) * 100 : 0;
                    return (
                      <div key={sub?.name ?? Math.random()} className="flex items-center gap-1.5 text-[10px] text-white/30">
                        <div className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: subPct === 0 ? 'rgba(255,255,255,0.1)' : subPct < 50 ? 'rgba(14,165,233,0.4)' : subPct < 100 ? 'rgba(14,165,233,0.7)' : 'rgb(16,185,129)' }} />
                        <span>{sub?.name ?? 'Unknown'}</span>
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <div className="w-72 flex-shrink-0 px-4 py-7 border-l border-white/[0.04]">
        <StatsPanel />
      </div>
    </div>
  );
}

interface StatCardProps { icon: React.ReactNode; label: string; value: string; sub: string; color: 'emerald' | 'sky' | 'amber' }
const COLOR_CLASSES: Record<string, string> = { emerald: 'bg-emerald-500/[0.07] border-emerald-500/15', sky: 'bg-sky-500/[0.07] border-sky-500/15', amber: 'bg-amber-500/[0.07] border-amber-500/15' };
function StatCard({ icon, label, value, sub, color }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${COLOR_CLASSES[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">{label}</span></div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-[11px] text-white/25 mt-0.5">{sub}</p>
    </div>
  );
}
