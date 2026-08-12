import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChallengeModifier = 
  | 'speed_run' // Måste klara under viss tid
  | 'no_powerups' // Inga power-ups tillgängliga
  | 'limited_lives' // Bara 3 försök
  | 'double_monsters' // Dubbla monster
  | 'ice_floor' // Hela banan är hal
  | 'reverse_controls' // Omvända kontroller
  | 'tiny_ball' // Mindre kula
  | 'mega_ball' // Större kula
  | 'no_walls' // Inga väggar (svårare!)
  | 'time_attack'; // Tidsbegränsning

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  levelId: string;
  modifiers: ChallengeModifier[];
  targetTime?: number;
  maxAttempts?: number;
  reward: {
    coins?: number;
    xp?: number;
    specialSkin?: string;
  };
  description: string;
}

export interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  completedAt?: number;
  attempts: number;
  bestTime?: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string; // YYYY-MM-DD
  totalChallengesCompleted: number;
}

const STORAGE_KEY_CHALLENGES = '@balance_game_daily_challenges';
const STORAGE_KEY_PROGRESS = '@balance_game_challenge_progress';
const STORAGE_KEY_STREAK = '@balance_game_challenge_streak';

// Seed för att generera samma challenge för alla spelare samma dag
function getDailySeed(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function generateDailyChallenge(date: Date = new Date()): DailyChallenge {
  const dateStr = date.toISOString().split('T')[0];
  const seed = getDailySeed(dateStr);
  const random = seededRandom(seed);
  
  // Välj level (1-14)
  const levelId = String(Math.floor(random() * 14) + 1);
  
  // Välj 1-3 modifiers
  const allModifiers: ChallengeModifier[] = [
    'speed_run',
    'no_powerups',
    'limited_lives',
    'double_monsters',
    'ice_floor',
    'reverse_controls',
    'tiny_ball',
    'mega_ball',
    'no_walls',
    'time_attack',
  ];
  
  const modifierCount = Math.floor(random() * 3) + 1;
  const modifiers: ChallengeModifier[] = [];
  
  for (let i = 0; i < modifierCount; i++) {
    const index = Math.floor(random() * allModifiers.length);
    const modifier = allModifiers[index];
    if (!modifiers.includes(modifier)) {
      modifiers.push(modifier);
    }
  }
  
  // Generera beskrivning
  const descriptions: Record<ChallengeModifier, string> = {
    speed_run: 'Klara banan snabbt!',
    no_powerups: 'Inga power-ups',
    limited_lives: 'Bara 3 försök',
    double_monsters: 'Dubbla monster',
    ice_floor: 'Hela banan är hal',
    reverse_controls: 'Omvända kontroller',
    tiny_ball: 'Mini-kula',
    mega_ball: 'Mega-kula',
    no_walls: 'Inga väggar',
    time_attack: 'Tidsbegränsning',
  };
  
  const description = modifiers.map(m => descriptions[m]).join(' • ');
  
  // Belöningar baserat på svårighet
  const difficulty = modifierCount;
  const reward = {
    coins: 50 * difficulty,
    xp: 100 * difficulty,
  };
  
  // Special modifiers
  let targetTime: number | undefined;
  let maxAttempts: number | undefined;
  
  if (modifiers.includes('speed_run')) {
    targetTime = 15 + Math.floor(random() * 20); // 15-35 sekunder
  }
  
  if (modifiers.includes('limited_lives')) {
    maxAttempts = 3;
  }
  
  if (modifiers.includes('time_attack')) {
    targetTime = 30;
  }
  
  return {
    id: `daily-${dateStr}`,
    date: dateStr,
    levelId,
    modifiers,
    targetTime,
    maxAttempts,
    reward,
    description,
  };
}

export async function getTodaysChallenge(): Promise<DailyChallenge> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_CHALLENGES);
    if (stored) {
      const challenges: DailyChallenge[] = JSON.parse(stored);
      const todaysChallenge = challenges.find(c => c.date === dateStr);
      if (todaysChallenge) {
        return todaysChallenge;
      }
    }
  } catch (error) {
    console.error('Failed to load challenges:', error);
  }
  
  // Generera ny challenge
  const challenge = generateDailyChallenge(today);
  
  // Spara
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_CHALLENGES);
    const challenges: DailyChallenge[] = stored ? JSON.parse(stored) : [];
    
    // Ta bort gamla (behåll bara senaste 7 dagarna)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentChallenges = challenges.filter(c => {
      const challengeDate = new Date(c.date);
      return challengeDate >= sevenDaysAgo;
    });
    
    recentChallenges.push(challenge);
    await AsyncStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(recentChallenges));
  } catch (error) {
    console.error('Failed to save challenge:', error);
  }
  
  return challenge;
}

export async function getChallengeProgress(challengeId: string): Promise<ChallengeProgress | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_PROGRESS);
    if (stored) {
      const allProgress: ChallengeProgress[] = JSON.parse(stored);
      return allProgress.find(p => p.challengeId === challengeId) || null;
    }
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
  return null;
}

export async function updateChallengeProgress(
  challengeId: string,
  completed: boolean,
  time?: number
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_PROGRESS);
    const allProgress: ChallengeProgress[] = stored ? JSON.parse(stored) : [];
    
    let progress = allProgress.find(p => p.challengeId === challengeId);
    
    if (!progress) {
      progress = {
        challengeId,
        completed: false,
        attempts: 0,
      };
      allProgress.push(progress);
    }
    
    progress.attempts += 1;
    
    if (completed && !progress.completed) {
      progress.completed = true;
      progress.completedAt = Date.now();
      
      // Uppdatera streak
      await updateStreak();
    }
    
    if (time !== undefined) {
      if (!progress.bestTime || time < progress.bestTime) {
        progress.bestTime = time;
      }
    }
    
    await AsyncStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}

export async function getStreakData(): Promise<StreakData> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_STREAK);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load streak:', error);
  }
  
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: '',
    totalChallengesCompleted: 0,
  };
}

async function updateStreak(): Promise<void> {
  try {
    const streak = await getStreakData();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if completed yesterday or today
    const lastDate = new Date(streak.lastCompletedDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Already completed today, no change
      return;
    } else if (diffDays === 1) {
      // Consecutive day!
      streak.currentStreak += 1;
    } else {
      // Streak broken
      streak.currentStreak = 1;
    }
    
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
    
    streak.lastCompletedDate = today;
    streak.totalChallengesCompleted += 1;
    
    await AsyncStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(streak));
  } catch (error) {
    console.error('Failed to update streak:', error);
  }
}

export async function hasTodaysChallengeBeenCompleted(): Promise<boolean> {
  const challenge = await getTodaysChallenge();
  const progress = await getChallengeProgress(challenge.id);
  return progress?.completed || false;
}

export function getModifierDisplayName(modifier: ChallengeModifier): string {
  const names: Record<ChallengeModifier, string> = {
    speed_run: '⚡ Speed Run',
    no_powerups: '🚫 Inga Power-ups',
    limited_lives: '❤️ 3 Liv',
    double_monsters: '👹👹 Dubbla Monster',
    ice_floor: '🧊 Hal Bana',
    reverse_controls: '🔄 Omvända Kontroller',
    tiny_ball: '🔵 Mini-kula',
    mega_ball: '⚫ Mega-kula',
    no_walls: '🚧 Inga Väggar',
    time_attack: '⏱️ Tidsbegränsning',
  };
  return names[modifier];
}

export function getStreakReward(streakDays: number): {
  title: string;
  emoji: string;
  coins: number;
  xp: number;
} | null {
  const milestones = [
    { days: 3, title: 'Dedikerad!', emoji: '🔥', coins: 100, xp: 200 },
    { days: 7, title: 'På rull!', emoji: '⭐', coins: 300, xp: 500 },
    { days: 14, title: 'Otrolig streak!', emoji: '💎', coins: 700, xp: 1000 },
    { days: 30, title: 'LEGEND!', emoji: '👑', coins: 2000, xp: 3000 },
  ];
  
  return milestones.find(m => m.days === streakDays) || null;
}
