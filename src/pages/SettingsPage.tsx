import { useState, useEffect } from 'react';
import { useGlobal } from '../contexts/GlobalContext';
import { RefreshCw, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, UserPlus } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export default function SettingsPage() {
  const { cfHandle, setCfHandle, syncCfProgress, syncing, autoSynced, user } = useGlobal();
  const { user: clerkUser } = useUser();
  
  const [handleInput, setHandleInput] = useState(cfHandle || '');
  const [syncResult, setSyncResult] = useState<{ synced: number; error: string | null } | null>(null);
  
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    setHandleInput(cfHandle || '');
  }, [cfHandle]);

  // CP-31 Style Direct API Verification
  const handleLinkAccount = async () => {
    const newHandle = handleInput.trim();
    if (!newHandle) {
      setLinkError('Please enter a Codeforces handle.');
      return;
    }

    setIsLinking(true);
    setLinkError('');
    setSyncResult(null);

    try {
      // Direct API call to check if the handle actually exists on Codeforces
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${newHandle}`);
      const data = await res.json();
      
      if (data.status !== 'OK') {
        setLinkError(`Handle "${newHandle}" not found on Codeforces. Check spelling.`);
        setIsLinking(false);
        return;
      }

      // Handle is valid! Save it locally and to Clerk Cloud
      setCfHandle(newHandle);
      
      if (clerkUser) {
        await clerkUser.update({
          unsafeMetadata: { ...clerkUser.unsafeMetadata, cfHandle: newHandle },
        });
      }
      
      // Automatically sync progress right after linking
      const result = await syncCfProgress();
      setSyncResult(result);

    } catch (error) {
      setLinkError('Network error. Codeforces API might be down.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleSync = async () => {
    setSyncResult(null);
    const result = await syncCfProgress();
    setSyncResult(result);
  };

  const handleUnlink = async () => {
    setCfHandle('');
    setHandleInput('');
    setSyncResult(null);
    setLinkError('');
    // Remove from Clerk Cloud
    if (clerkUser) {
      await clerkUser.update({
        unsafeMetadata: { ...clerkUser.unsafeMetadata, cfHandle: '' },
      });
    }
  };

  const autoSyncedCount = Object.values(autoSynced ?? {}).filter(Boolean).length;

  return (
    <main className="flex-1 min-w-0 px-7 py-7">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-white/35 mt-1">Configure Codeforces integration.</p>
      </div>

      <div className="max-w-xl space-y-5">
        
        {/* Profile Card */}
        <div className="rounded-xl border border-white/[0.07] bg-[#111114] p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-lg font-bold text-white">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">{user?.username ?? 'Unknown'}</p>
              <p className="text-xs text-white/30">User Account</p>
            </div>
          </div>
        </div>

        {/* Integration Card */}
        <div className="rounded-xl border border-white/[0.07] bg-[#111114] p-5">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-white/80">Codeforces Integration</h2>
            {cfHandle && <ShieldCheck size={16} className="text-emerald-400" />}
          </div>
          <p className="text-xs text-white/30 mb-5">Link your CF handle to instantly fetch solved problems.</p>

          <div className="space-y-4">
            
            {/* Input & Link Button */}
            <div>
              <label className="block text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1.5">Codeforces Handle</label>
              <div className="flex gap-2">
                <input 
                  value={handleInput} 
                  onChange={(e) => setHandleInput(e.target.value)} 
                  placeholder="Enter your CF Handle (e.g. tourist)"
                  disabled={!!cfHandle}
                  className="flex-1 bg-[#0a0a0c] border border-white/[0.07] rounded-lg px-3.5 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-sky-500/40 transition-colors disabled:opacity-50" 
                />
                {!cfHandle ? (
                  <button 
                    onClick={handleLinkAccount}
                    disabled={isLinking}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-white transition-all disabled:opacity-50"
                  >
                    {isLinking ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    {isLinking ? 'Verifying...' : 'Link Account'}
                  </button>
                ) : (
                  <button 
                    onClick={handleUnlink}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-rose-500/30 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
                  >
                    Unlink
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {linkError && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{linkError}</p>
              </div>
            )}

            {/* Sync Controls (Visible only when linked) */}
            {cfHandle && (
              <div className="pt-4 border-t border-white/5 space-y-4">
                <button onClick={handleSync} disabled={syncing}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0a0a0c] border border-white/10 hover:border-sky-500/50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-sky-400 transition-colors">
                  {syncing ? <><RefreshCw size={14} className="animate-spin" /> Fetching latest submissions...</> : <><RefreshCw size={14} /> Sync Progress Now</>}
                </button>

                {syncResult && (
                  <div className={`flex items-start gap-2 px-4 py-3 rounded-lg border ${syncResult.error ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                    {syncResult.error ? <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />}
                    <p className={`text-xs ${syncResult.error ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {syncResult.error ?? `Successfully synced ${syncResult.synced} solved problems.`}
                    </p>
                  </div>
                )}

                {autoSyncedCount > 0 && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <p className="text-xs text-emerald-300/80">{autoSyncedCount} problem{autoSyncedCount !== 1 ? 's' : ''} matched & completed from CF</p>
                  </div>
                )}
                
                <a href={`https://codeforces.com/profile/${encodeURIComponent(cfHandle)}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors">
                  <ExternalLink size={12} /> View Codeforces profile: {cfHandle}
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}