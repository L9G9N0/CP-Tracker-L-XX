import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type {
  Tier,
  User,
  StoredUser,
  ProgressState,
  AutoSyncedState,
  ChatMessage,
  StreakData,
} from '../types';
import curriculumData from '../data/curriculumData';

// ─── Storage Keys ───────────────────────────────────────────
const USERS_KEY = 'cp-tracker-users';
const SESSION_KEY = 'cp-tracker-session';
const PROGRESS_KEY = 'cp-tracker-progress';
const AUTOSYNC_KEY = 'cp-tracker-autosync';
const CHAT_KEY = 'cp-tracker-chat';
const STREAK_KEY = 'cp-tracker-streak';
const CF_HANDLE_KEY = 'cp-tracker-cfhandle';

// ─── Safe localStorage loaders ─────────────────────────────
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed !== null && parsed !== undefined && typeof parsed === typeof fallback) {
        return parsed;
      }
    }
  } catch { /* corrupt data — use fallback */ }
  return fallback;
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage full or blocked */ }
}

// ─── Seed default users ─────────────────────────────────────
function loadUsers(): StoredUser[] {
  const users = loadJSON<StoredUser[] | null>(USERS_KEY, null);
  if (Array.isArray(users) && users.length > 0) return users;
  const defaults: StoredUser[] = [
    { username: 'admin', password: '123', role: 'admin' },
    { username: 'user', password: '123', role: 'user' },
  ];
  saveJSON(USERS_KEY, defaults);
  return defaults;
}

// ─── Streak computation ─────────────────────────────────────
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

// ─── Tier label from completed count ────────────────────────
function getTierLabel(done: number): string {
  if (done < 5) return 'Unrated';
  if (done < 10) return 'Newbie';
  if (done < 20) return 'Pupil';
  if (done < 40) return 'Specialist';
  if (done < 70) return 'Expert';
  if (done < 100) return 'Candidate Master';
  return 'Grandmaster';
}

// ─── Context shape ──────────────────────────────────────────
interface GlobalContextValue {
  // Auth
  user: User | null;
  login: (username: string, password: string) => string | null;
  signup: (username: string, password: string) => string | null;
  logout: () => void;

  // Curriculum (read-only from curriculumData.js)
  curriculum: Tier[];

  // Progress (persisted in localStorage)
  progress: ProgressState;
  autoSynced: AutoSyncedState;
  toggleProblem: (problemId: string) => void;
  resetProgress: () => void;

  // Stats (derived)
  totalCompleted: number;
  totalProblems: number;
  tierStats: { tier: string; completed: number; total: number }[];
  subCategoryStats: Record<string, { completed: number; total: number }>;
  heatmapData: { id: string; done: boolean }[];
  level: number;
  auraPercent: number;
  tierLabel: string;
  streak: StreakData;

  // Codeforces
  cfHandle: string;
  setCfHandle: (h: string) => void;
  syncCfProgress: () => Promise<{ synced: number; error: string | null }>;
  syncing: boolean;

  // Chat
  communityChat: ChatMessage[];
  sendMessage: (text: string) => void;
}

const GlobalContext = createContext<GlobalContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────
export function GlobalProvider({ children }: { children: ReactNode }) {
  // ── Auth state ──
  const [user, setUser] = useState<User | null>(() => loadJSON<User | null>(SESSION_KEY, null));
  const usersRef = useRef<StoredUser[]>(loadUsers());

  // ── Curriculum: static from curriculumData.js ──
  const [curriculum] = useState<Tier[]>(() => {
    if (!Array.isArray(curriculumData)) return [];
    return curriculumData;
  });

  // ── Progress state ──
  const [progress, setProgress] = useState<ProgressState>(() =>
    loadJSON<ProgressState>(PROGRESS_KEY, {})
  );
  const [autoSynced, setAutoSynced] = useState<AutoSyncedState>(() =>
    loadJSON<AutoSyncedState>(AUTOSYNC_KEY, {})
  );

  // ── Chat state ──
  const [communityChat, setCommunityChat] = useState<ChatMessage[]>(() => {
    const loaded = loadJSON<ChatMessage[]>(CHAT_KEY, []);
    return Array.isArray(loaded) ? loaded : [];
  });

  // ── Streak ──
  const [streak] = useState<StreakData>(computeStreak);

  // ── Codeforces ──
  const [cfHandle, setCfHandleState] = useState<string>(() =>
    loadJSON<string>(CF_HANDLE_KEY, 'L9G9ND')
  );
  const [syncing, setSyncing] = useState(false);

  // ── Persist effects ──
  useEffect(() => { saveJSON(SESSION_KEY, user); }, [user]);
  useEffect(() => { saveJSON(PROGRESS_KEY, progress); }, [progress]);
  useEffect(() => { saveJSON(AUTOSYNC_KEY, autoSynced); }, [autoSynced]);
  useEffect(() => { saveJSON(CHAT_KEY, communityChat); }, [communityChat]);

  const setCfHandle = useCallback((h: string) => {
    setCfHandleState(h);
    saveJSON(CF_HANDLE_KEY, h);
  }, []);

  // ── Auth methods ──
  const login = useCallback((username: string, password: string): string | null => {
    const found = usersRef.current.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) return 'Invalid username or password.';
    setUser({ username: found.username, role: found.role });
    return null;
  }, []);

  const signup = useCallback((username: string, password: string): string | null => {
    if (!username?.trim() || !password?.trim()) return 'Username and password are required.';
    if (username.trim().length < 2) return 'Username must be at least 2 characters.';
    if (password.length < 3) return 'Password must be at least 3 characters.';
    if (usersRef.current.some((u) => u.username === username.trim())) return 'Username already taken.';
    const updated = [...usersRef.current, { username: username.trim(), password, role: 'user' as const }];
    usersRef.current = updated;
    saveJSON(USERS_KEY, updated);
    setUser({ username: username.trim(), role: 'user' });
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // ── Progress methods ──
  const toggleProblem = useCallback((problemId: string) => {
    setProgress((prev) => ({ ...prev, [problemId]: !prev[problemId] }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({});
    setAutoSynced({});
  }, []);

  // ── Codeforces sync ──
  const syncCfProgress = useCallback(async (): Promise<{ synced: number; error: string | null }> => {
    if (!cfHandle?.trim()) return { synced: 0, error: 'No handle provided.' };
    setSyncing(true);
    try {
      const res = await fetch(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(cfHandle.trim())}`
      );
      const data = await res.json();
      if (data?.status !== 'OK') {
        return { synced: 0, error: data?.comment || 'Handle not found or API error.' };
      }

      // Build lookup sets of solved problems
      const solvedNames = new Set<string>();
      const solvedIds = new Set<string>();
      const results = Array.isArray(data?.result) ? data.result : [];
      for (const sub of results) {
        if (sub?.verdict === 'OK' && sub?.problem) {
          const p = sub.problem;
          if (p.name) solvedNames.add(p.name.toLowerCase());
          if (p.contestId && p.index) {
            solvedIds.add(`${p.contestId}${p.index}`);
          }
        }
      }

      // Match against curriculum
      const newAutoSynced: AutoSyncedState = {};
      const newProgress: ProgressState = {};
      let count = 0;
      for (const tier of curriculum) {
        for (const sub of tier?.subCategories ?? []) {
          for (const problem of sub?.problems ?? []) {
            const idMatch = solvedIds.has(problem.id);
            const nameMatch = solvedNames.has(problem.name?.toLowerCase() ?? '');
            if (idMatch || nameMatch) {
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

  // ── Chat methods ──
  const sendMessage = useCallback(
    (text: string) => {
      if (!user || !text?.trim()) return;
      const msg: ChatMessage = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        sender: user.username,
        text: text.trim(),
        timestamp: Date.now(),
      };
      setCommunityChat((prev) => [...(Array.isArray(prev) ? prev : []), msg]);
    },
    [user]
  );

  // ── Derived stats ──
  const totalCompleted = Object.entries(progress ?? {}).filter(([, v]) => !!v).length;

  const totalProblems = (curriculum ?? []).reduce(
    (sum, tier) => sum + (tier?.subCategories ?? []).reduce(
      (s, sub) => s + (sub?.problems ?? []).length, 0
    ),
    0
  );

  const tierStats = (curriculum ?? []).map((tier) => {
    const allProblems = (tier?.subCategories ?? []).flatMap((sub) => sub?.problems ?? []);
    const completed = allProblems.filter((p) => !!progress?.[p?.id]).length;
    return { tier: tier?.tier ?? 'Unknown', completed, total: allProblems.length };
  });

  const subCategoryStats: Record<string, { completed: number; total: number }> = {};
  (curriculum ?? []).forEach((tier) => {
    (tier?.subCategories ?? []).forEach((sub) => {
      const key = `${tier?.tier ?? ''}|${sub?.name ?? ''}`;
      const problems = sub?.problems ?? [];
      const completed = problems.filter((p) => !!progress?.[p?.id]).length;
      subCategoryStats[key] = { completed, total: problems.length };
    });
  });

  const heatmapData = (curriculum ?? []).flatMap((tier) =>
    (tier?.subCategories ?? []).flatMap((sub) =>
      (sub?.problems ?? []).map((p) => ({ id: p?.id ?? '', done: !!progress?.[p?.id] }))
    )
  );

  const level = Math.floor(totalCompleted / 5) + 1;
  const auraPercent = ((totalCompleted % 5) / 5) * 100;

  return (
    <GlobalContext.Provider
      value={{
        user, login, signup, logout,
        curriculum,
        progress, autoSynced, toggleProblem, resetProgress,
        totalCompleted, totalProblems, tierStats, subCategoryStats,
        heatmapData, level, auraPercent, tierLabel: getTierLabel(totalCompleted), streak,
        cfHandle, setCfHandle, syncCfProgress, syncing,
        communityChat, sendMessage,
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
