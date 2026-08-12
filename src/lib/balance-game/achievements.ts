import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAndUnlockSkins } from './skins';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first_win',
    name: 'Nybörjare',
    description: 'Klara din första bana',
    icon: '🎉',
    maxProgress: 1,
  },
  {
    id: 'survivor',
    name: 'Överlevare',
    description: 'Klara 5 banor utan att dö',
    icon: '💪',
    maxProgress: 5,
  },
  {
    id: 'monster_hunter',
    name: 'Monsterjägare',
    description: 'Undvik 100 monster',
    icon: '👹',
    maxProgress: 100,
  },
  {
    id: 'portal_master',
    name: 'Portal-mästare',
    description: 'Använd 50 portaler',
    icon: '🌀',
    maxProgress: 50,
  },
  {
    id: 'speed_demon',
    name: 'Hastighets-demon',
    description: 'Få ⭐⭐⭐ på 5 banor',
    icon: '⚡',
    maxProgress: 5,
  },
  {
    id: 'lava_dancer',
    name: 'Lava-dansare',
    description: 'Klara lava-zonen första försöket',
    icon: '🔥',
    maxProgress: 1,
  },
  {
    id: 'magnetic_personality',
    name: 'Magnetisk personlighet',
    description: 'Undkom 20 magneter',
    icon: '🧲',
    maxProgress: 20,
  },
  {
    id: 'boss_killer',
    name: 'Boss-killer',
    description: 'Klara boss-banan',
    icon: '💀',
    maxProgress: 1,
  },
  {
    id: 'perfectionist',
    name: 'Perfektionist',
    description: '⭐⭐⭐ på alla banor',
    icon: '🏆',
    maxProgress: 14,
  },
  {
    id: 'legendary',
    name: 'Legendary',
    description: 'Klara boss-banan under 30 sekunder',
    icon: '👑',
    maxProgress: 1,
  },
  {
    id: 'power_collector',
    name: 'Power-samlare',
    description: 'Samla 50 power-ups',
    icon: '⭐',
    maxProgress: 50,
  },
  {
    id: 'ghost_master',
    name: 'Ghost-mästare',
    description: 'Använd Ghost-mode 25 gånger',
    icon: '👻',
    maxProgress: 25,
  },
];

const STORAGE_KEY = '@balance_game_achievements';

export async function loadAchievements(): Promise<Achievement[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load achievements:', error);
  }
  
  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: false,
    progress: 0,
  }));
}

export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
}

export async function updateAchievement(
  id: string,
  progress: number
): Promise<Achievement | null> {
  const achievements = await loadAchievements();
  const achievement = achievements.find(a => a.id === id);
  
  if (!achievement || achievement.unlocked) {
    return null;
  }
  
  achievement.progress = Math.min(progress, achievement.maxProgress);
  
  if (achievement.progress >= achievement.maxProgress) {
    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
  }
  
  await saveAchievements(achievements);
  
  return achievement.unlocked ? achievement : null;
}

export async function incrementAchievement(id: string): Promise<Achievement | null> {
  const achievements = await loadAchievements();
  const achievement = achievements.find(a => a.id === id);
  
  if (!achievement || achievement.unlocked) {
    return null;
  }
  
  const result = await updateAchievement(id, achievement.progress + 1);
  
  // Auto-unlock skins when achievements are completed
  if (result?.unlocked) {
    const updatedAchievements = await loadAchievements();
    await checkAndUnlockSkins(updatedAchievements);
  }
  
  return result;
}
