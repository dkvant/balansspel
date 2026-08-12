import AsyncStorage from '@react-native-async-storage/async-storage';

export interface World {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  levelIds: string[];
  requiredStars: number;
  bgGradient: string[];
}

export const WORLDS: Omit<World, 'unlocked'>[] = [
  {
    id: 'tutorial',
    name: '🏠 Tutorial',
    icon: '🎓',
    description: 'Lär dig grunderna',
    levelIds: ['1', '2'],
    requiredStars: 0,
    bgGradient: ['#10b981', '#059669'],
  },
  {
    id: 'forest',
    name: '🌳 Skogen',
    icon: '🌲',
    description: 'Gröna banor med träd',
    levelIds: ['3', '4', '10'],
    requiredStars: 2,
    bgGradient: ['#22c55e', '#16a34a'],
  },
  {
    id: 'mountain',
    name: '⛰️ Bergen',
    icon: '⛰️',
    description: 'Höga berg och is',
    levelIds: ['5', '7', '11'],
    requiredStars: 6,
    bgGradient: ['#6366f1', '#4f46e5'],
  },
  {
    id: 'volcano',
    name: '🌋 Vulkanen',
    icon: '🔥',
    description: 'Het lava och monster',
    levelIds: ['9', '12', '6'],
    requiredStars: 12,
    bgGradient: ['#ef4444', '#dc2626'],
  },
  {
    id: 'castle',
    name: '🏰 Slottet',
    icon: '👑',
    description: 'Boss-utmaningar',
    levelIds: ['8', '13', '14'],
    requiredStars: 20,
    bgGradient: ['#8b5cf6', '#7c3aed'],
  },
];

const STORAGE_KEY = '@balance_game_world_progress';

export interface WorldProgress {
  worldId: string;
  unlocked: boolean;
  completedLevels: string[];
  totalStars: number;
}

export async function loadWorldProgress(): Promise<WorldProgress[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load world progress:', error);
  }
  
  // Initialize with tutorial unlocked
  return WORLDS.map(w => ({
    worldId: w.id,
    unlocked: w.id === 'tutorial',
    completedLevels: [],
    totalStars: 0,
  }));
}

export async function saveWorldProgress(progress: WorldProgress[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save world progress:', error);
  }
}

export async function completeLevel(
  levelId: string,
  stars: number
): Promise<void> {
  const progress = await loadWorldProgress();
  
  for (const worldProgress of progress) {
    const world = WORLDS.find(w => w.id === worldProgress.worldId);
    if (world && world.levelIds.includes(levelId)) {
      if (!worldProgress.completedLevels.includes(levelId)) {
        worldProgress.completedLevels.push(levelId);
      }
      worldProgress.totalStars += stars;
      break;
    }
  }
  
  // Check if new worlds should be unlocked
  const totalStars = progress.reduce((sum, p) => sum + p.totalStars, 0);
  for (const worldProgress of progress) {
    const world = WORLDS.find(w => w.id === worldProgress.worldId);
    if (world && !worldProgress.unlocked && totalStars >= world.requiredStars) {
      worldProgress.unlocked = true;
    }
  }
  
  await saveWorldProgress(progress);
}

export async function getTotalStars(): Promise<number> {
  const progress = await loadWorldProgress();
  return progress.reduce((sum, p) => sum + p.totalStars, 0);
}
