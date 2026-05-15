import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react'; // CLERK IMPORT
import type { Tier, User, ProgressState, AutoSyncedState, ChatMessage, StreakData } from '../types';
import curriculumData from '../data/curriculumData';

const PROGRESS_KEY = 'cp-tracker-progress';
const AUTOSYNC_KEY = 'cp-tracker-autosync';
const CHAT_KEY = 'cp-tracker-chat';
const STREAK_KEY = 'cp-tracker-streak';
const CF_HANDLE_KEY = 'cp-tracker-cfhandle';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed !== null && parsed !== undefined && typeof parsed === typeof fallback) return parsed;
    }
  } catch {}
  return fallback;
}

function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function computeStreak(): StreakData {
  const stored = loadJSON<StreakData>(STREAK_KEY, { lastVisit: '', streak: 0 });
  const today = new Date().toISOString().split('T')[0];
  if (stored.lastVisit === today) return stored;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = stored.lastVisit === yesterday ? stored.streak + 1 : 1;
  const updated: StreakData = { lastVisit: today, streak: newStreak };
  saveJSON(STREAK_KEY, updated);
  return updated;
}

function getTierLabel(done: number): string {
  if (done < 5) return 'Unrated';
  if (done < 10) return 'Newbie';
  if (done < 20) return 'Pupil';
  if (done < 40) return 'Specialist';
  if (done < 70) return 'Expert';
  return 'Grandmaster';
}

interface GlobalContextValue {
  user: User | null;
  login: (u: string, p: string) => Promise<string | null>;
  signup: (u: string, p: string) => Promise<string | null>;
  logout: () => void;
  curriculum: Tier[];
  progress: ProgressState;
  autoSynced: AutoSyncedState;
  toggleProblem: (problemId: string) => void;
  resetProgress: () => void;
  totalCompleted: number;
  totalProblems: number;
  tierStats: { tier: string; completed: number; total: number }[];
  subCategoryStats: Record<string, { completed: number; total: number }>;
  heatmapData: { id: string; done: boolean }[];
  level: number;
  auraPercent: number;
  tierLabel: string;
  streak: StreakData;
  cfHandle: string;
  setCfHandle: (h: string) => void;
  syncCfProgress: () => Promise<{ synced: number; error: string | null }>;
  syncing: boolean;
  communityChat: ChatMessage[];
  sendMessage: (text: string) => void;
}

const GlobalContext = createContext<GlobalContextValue | null>(null);

export function GlobalProvider({ children }: { children: ReactNode }) {
  // CLERK INTEGRATION
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useAuth();
  const [user, setUser] = useState<User | null>(null);

 useEffect(() => {
    if (isLoaded) {
      if (clerkUser) {
        setUser({
          username: clerkUser.firstName || clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User',
          role: 'user'
        });
        
        // --- NAYA CODE: Clerk se CF Handle Fetch karo ---
        const savedHandle = clerkUser.unsafeMetadata?.cfHandle as string;
        if (savedHandle) {
          setCfHandleState(savedHandle);
          saveJSON(CF_HANDLE_KEY, savedHandle);
        }
        // ------------------------------------------------
        
      } else {
        setUser(null);
        setCfHandleState(''); // Logout pe handle clear
      }
    }
  }, [isLoaded, clerkUser]);
  const [curriculum] = useState<Tier[]>(() => (Array.isArray(curriculumData) ? curriculumData : []));
  const [progress, setProgress] = useState<ProgressState>(() => loadJSON<ProgressState>(PROGRESS_KEY, {}));
  const [autoSynced, setAutoSynced] = useState<AutoSyncedState>(() => loadJSON<AutoSyncedState>(AUTOSYNC_KEY, {}));
  const [communityChat, setCommunityChat] = useState<ChatMessage[]>(() => loadJSON<ChatMessage[]>(CHAT_KEY, []));
  const [streak] = useState<StreakData>(computeStreak);
  const [cfHandle, setCfHandleState] = useState<string>(() => loadJSON<string>(CF_HANDLE_KEY, ''));
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { saveJSON(PROGRESS_KEY, progress); }, [progress]);
  useEffect(() => { saveJSON(AUTOSYNC_KEY, autoSynced); }, [autoSynced]);
  useEffect(() => { saveJSON(CHAT_KEY, communityChat); }, [communityChat]);

  const setCfHandle = useCallback((h: string) => {
    setCfHandleState(h);
    saveJSON(CF_HANDLE_KEY, h);
  }, []);

  const login = useCallback(async () => null, []);
  const signup = useCallback(async () => null, []);

  const logout = useCallback(() => {
    signOut();
    setCfHandleState(''); // Logout pe handle clear
  }, [signOut]);

  const toggleProblem = useCallback((problemId: string) => {
    setProgress((prev) => ({ ...prev, [problemId]: !prev[problemId] }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({});
    setAutoSynced({});
  }, []);

  const syncCfProgress = useCallback(async (): Promise<{ synced: number; error: string | null }> => {
    if (!cfHandle?.trim()) return { synced: 0, error: 'No handle provided.' };
    setSyncing(true);
    try {
      const res = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(cfHandle.trim())}`);
      const data = await res.json();
      if (data?.status !== 'OK') return { synced: 0, error: data?.comment || 'Handle not found or API error.' };

      const solvedNames = new Set<string>();
      const solvedIds = new Set<string>();
      const results = Array.isArray(data?.result) ? data.result : [];
      for (const sub of results) {
        if (sub?.verdict === 'OK' && sub?.problem) {
          if (sub.problem.name) solvedNames.add(sub.problem.name.toLowerCase());
          if (sub.problem.contestId && sub.problem.index) solvedIds.add(`${sub.problem.contestId}${sub.problem.index}`);
        }
      }

      const newAutoSynced: AutoSyncedState = {};
      const newProgress: ProgressState = {};
      let count = 0;
      for (const tier of curriculum) {
        for (const sub of tier?.subCategories ?? []) {
          for (const problem of sub?.problems ?? []) {
            if (solvedIds.has(problem.id) || solvedNames.has(problem.name?.toLowerCase() ?? '')) {
              newAutoSynced[problem.id] = true;
              newProgress[problem.id] = true;
              count++;
            }
          }
        }
      }

      setAutoSynced(newAutoSynced);
      setProgress((prev) => ({ ...prev, ...newProgress }));
      return { synced: count, error: null };
    } catch {
      return { synced: 0, error: 'Network error. Please try again.' };
    } finally {
      setSyncing(false);
    }
  }, [cfHandle, curriculum]);

  const sendMessage = useCallback((text: string) => {
    if (!user || !text?.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      sender: user.username,
      text: text.trim(),
      timestamp: Date.now(),
    };
    setCommunityChat((prev) => [...(Array.isArray(prev) ? prev : []), msg]);
  }, [user]);

  const totalCompleted = Object.entries(progress ?? {}).filter(([, v]) => !!v).length;
  const totalProblems = (curriculum ?? []).reduce((sum, tier) => sum + (tier?.subCategories ?? []).reduce((s, sub) => s + (sub?.problems ?? []).length, 0), 0);
  
  const tierStats = (curriculum ?? []).map((tier) => {
    const allProblems = (tier?.subCategories ?? []).flatMap((sub) => sub?.problems ?? []);
    const completed = allProblems.filter((p) => !!progress?.[p?.id]).length;
    return { tier: tier?.tier ?? 'Unknown', completed, total: allProblems.length };
  });

  const subCategoryStats: Record<string, { completed: number; total: number }> = {};
  (curriculum ?? []).forEach((tier) => {
    (tier?.subCategories ?? []).forEach((sub) => {
      const problems = sub?.problems ?? [];
      subCategoryStats[`${tier?.tier ?? ''}|${sub?.name ?? ''}`] = { 
        completed: problems.filter((p) => !!progress?.[p?.id]).length, 
        total: problems.length 
      };
    });
  });

  const heatmapData = (curriculum ?? []).flatMap((tier) =>
    (tier?.subCategories ?? []).flatMap((sub) => (sub?.problems ?? []).map((p) => ({ id: p?.id ?? '', done: !!progress?.[p?.id] })))
  );

  const level = Math.floor(totalCompleted / 5) + 1;
  const auraPercent = ((totalCompleted % 5) / 5) * 100;

  return (
    <GlobalContext.Provider
      value={{
        user, login, signup, logout, curriculum, progress, autoSynced, toggleProblem, resetProgress,
        totalCompleted, totalProblems, tierStats, subCategoryStats, heatmapData, level, auraPercent, tierLabel: getTierLabel(totalCompleted), streak,
        cfHandle, setCfHandle, syncCfProgress, syncing, communityChat, sendMessage,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal(): GlobalContextValue {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error('useGlobal must be used within GlobalProvider');
  return ctx;
}