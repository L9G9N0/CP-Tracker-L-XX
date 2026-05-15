export interface Problem {
  id: string;
  name: string;
  url: string;
}

export interface SubCategory {
  name: string;
  problems: Problem[];
}

export interface Tier {
  tier: string;
  subCategories: SubCategory[];
}

export interface User {
  username: string;
  role: 'admin' | 'user';
}

export interface StoredUser {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface ProgressState {
  [problemId: string]: boolean;
}

export interface AutoSyncedState {
  [problemId: string]: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export interface StreakData {
  lastVisit: string;
  streak: number;
}
