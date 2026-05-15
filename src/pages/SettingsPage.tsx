import { useState } from 'react';
import { useGlobal } from '../contexts/GlobalContext';
import { RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const { cfHandle, setCfHandle, syncCfProgress, syncing, autoSynced, user } = useGlobal();
  const [handleInput, setHandleInput] = useState(cfHandle ?? 'L9G9ND');
  const [syncResult, setSyncResult] = useState<{ synced: number; error: string | null } | null>(null);

  const handleSave = () => {
    setCfHandle(handleInput?.trim() ?? '');
  };

  const handleSync = async () => {
    setCfHandle(handleInput?.trim() ?? '');
    const result = await syncCfProgress();
    setSyncResult(result);
  };

  const autoSyncedCount = Object.values(autoSynced ?? {}).filter(Boolean).length;

  return (
    <main className="flex-1 min-w-0 px-7 py-7">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-white/35 mt-1">Configure Codeforces integration.</p>
      </div>

      <div className="max-w-xl space-y-5">
        <div className="rounded-xl border border-white/[0.07] bg-[#111114] p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-lg font-bold text-white">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">{user?.username ?? 'Unknown'}</p>
              <p className="text-xs text-white/30">{user?.role === 'admin' ? 'Administrator' : 'User'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#111114] p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-1">Codeforces Integration</h2>
          <p className="text-xs text-white/30 mb-4">Link your CF handle to auto-sync solved problems.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1.5">Codeforces Handle</label>
              <div className="flex gap-2">
                <input value={handleInput} onChange={(e) => setHandleInput(e.target.value)} placeholder="L9G9ND"
                  className="flex-1 bg-[#0a0a0c] border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-sky-500/40 transition-colors" />
                <button onClick={handleSave}
                  className="px-4 py-2.5 rounded-lg border border-white/[0.07] text-xs text-white/40 hover:text-white/70 hover:border-white/15 transition-all">Save</button>
              </div>
            </div>

            <button onClick={handleSync} disabled={syncing || !handleInput?.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors">
              {syncing ? <><RefreshCw size={14} className="animate-spin" /> Syncing...</> : <><RefreshCw size={14} /> Sync with Codeforces</>}
            </button>

            {syncResult && (
              <div className={`flex items-start gap-2 px-4 py-3 rounded-lg border ${syncResult.error ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                {syncResult.error ? <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />}
                <p className={`text-xs ${syncResult.error ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {syncResult.error ?? `Synced ${syncResult.synced} solved problems from Codeforces.`}
                </p>
              </div>
            )}

            {autoSyncedCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <p className="text-xs text-emerald-300/80">{autoSyncedCount} problem{autoSyncedCount !== 1 ? 's' : ''} auto-completed from Codeforces</p>
              </div>
            )}

            {cfHandle && (
              <a href={`https://codeforces.com/profile/${encodeURIComponent(cfHandle)}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors">
                <ExternalLink size={12} /> View profile: {cfHandle}
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
