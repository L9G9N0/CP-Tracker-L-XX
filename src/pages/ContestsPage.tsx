import { useState, useEffect } from 'react';
import { Trophy, ExternalLink, RefreshCw, AlertCircle, Clock, Calendar } from 'lucide-react';

interface CFContest { id: number; name: string; startTimeSeconds: number; durationSeconds: number; phase: string; }

export default function ContestsPage() {
  const [contests, setContests] = useState<CFContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://codeforces.com/api/contest.list?gym=false');
      const data = await res.json();
      if (data?.status !== 'OK') { setError('Failed to fetch contests.'); return; }
      const upcoming = (Array.isArray(data?.result) ? data.result : [])
        .filter((c: CFContest) => c?.phase === 'BEFORE' || c?.phase === 'CODING')
        .slice(0, 20);
      setContests(upcoming);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchContests(); }, []);

  const formatDuration = (seconds: number) => {
    const d = Math.floor(seconds / 86400); const h = Math.floor((seconds % 86400) / 3600); const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`; if (h > 0) return `${h}h ${m}m`; return `${m}m`;
  };

  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const timeUntil = (ts: number) => {
    const diff = ts * 1000 - Date.now();
    if (diff <= 0) return 'Started';
    return formatDuration(Math.floor(diff / 1000));
  };

  return (
    <main className="flex-1 min-w-0 px-7 py-7">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contests</h1>
          <p className="text-sm text-white/35 mt-1">Upcoming Codeforces contests.</p>
        </div>
        <button onClick={fetchContests} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.07] text-xs text-white/30 hover:text-white/60 hover:border-white/15 transition-all disabled:opacity-40">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <AlertCircle size={16} className="text-rose-400" /><p className="text-xs text-rose-300">{error}</p>
        </div>
      )}

      {loading && contests.length === 0 ? (
        <div className="text-center py-16"><RefreshCw size={24} className="text-white/15 mx-auto mb-3 animate-spin" /><p className="text-sm text-white/20">Loading contests...</p></div>
      ) : contests.length === 0 ? (
        <div className="text-center py-16"><Trophy size={24} className="text-white/15 mx-auto mb-3" /><p className="text-sm text-white/20">No upcoming contests found.</p></div>
      ) : (
        <div className="rounded-xl border border-white/[0.07] bg-[#111114] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-white/25 uppercase tracking-widest font-semibold">
                  <th className="text-left px-5 py-3">Contest</th>
                  <th className="text-left px-5 py-3">Start Time</th>
                  <th className="text-left px-5 py-3">Duration</th>
                  <th className="text-left px-5 py-3">Starts In</th>
                  <th className="text-right px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {contests.map((contest) => (
                  <tr key={contest?.id ?? Math.random()} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3"><p className="text-white/70 font-medium">{contest?.name ?? 'Unknown'}</p></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-1.5 text-white/40"><Calendar size={12} className="text-white/20" /><span>{formatDate(contest?.startTimeSeconds ?? 0)}</span></div></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-1.5 text-white/40"><Clock size={12} className="text-white/20" /><span>{formatDuration(contest?.durationSeconds ?? 0)}</span></div></td>
                    <td className="px-5 py-3"><span className={`text-xs font-medium ${contest?.phase === 'CODING' ? 'text-emerald-400' : 'text-amber-400'}`}>{contest?.phase === 'CODING' ? 'Live' : timeUntil(contest?.startTimeSeconds ?? 0)}</span></td>
                    <td className="px-5 py-3 text-right">
                      <a href={`https://codeforces.com/contest/${contest?.id ?? ''}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors">
                        <ExternalLink size={11} />{contest?.phase === 'CODING' ? 'Enter' : 'Register'}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
