import AsyncStorage from '@react-native-async-storage/async-storage';

export type BallSkin = 
  | 'classic'
  | 'fire'
  | 'ice'
  | 'rainbow'
  | 'galaxy'
  | 'gold'
  | 'neon'
  | 'ghost';

export interface SkinConfig {
  id: BallSkin;
  name: string;
  colors: string[];
  unlocked: boolean;
  requiresAchievement?: string;
  trailColor?: string;
  glowColor?: string;
}

export const BALL_SKINS: Record<BallSkin, Omit<SkinConfig, 'unlocked'>> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    colors: ['#93c5fd', '#60a5fa', '#3b82f6', '#1e40af'],
    trailColor: 'rgba(96, 165, 250, 0.8)',
    glowColor: '#3b82f6',
  },
  fire: {
    id: 'fire',
    name: 'Fire',
    colors: ['#fef3c7', '#fbbf24', '#f59e0b', '#dc2626'],
    trailColor: 'rgba(251, 191, 36, 0.8)',
    glowColor: '#f59e0b',
    requiresAchievement: 'lava_dancer',
  },
  ice: {
    id: 'ice',
    name: 'Ice',
    colors: ['#f0f9ff', '#bae6fd', '#7dd3fc', '#0ea5e9'],
    trailColor: 'rgba(125, 211, 252, 0.8)',
    glowColor: '#0ea5e9',
    requiresAchievement: 'speed_demon',
  },
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    colors: ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#60a5fa', '#a78bfa'],
    trailColor: 'rgba(251, 146, 60, 0.8)',
    glowColor: '#a78bfa',
    requiresAchievement: 'perfectionist',
  },
  galaxy: {
    id: 'galaxy',
    name: 'Galaxy',
    colors: ['#1e1b4b', '#312e81', '#4c1d95', '#581c87'],
    trailColor: 'rgba(88, 28, 135, 0.8)',
    glowColor: '#7c3aed',
    requiresAchievement: 'boss_killer',
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    colors: ['#fef3c7', '#fde047', '#eab308', '#ca8a04'],
    trailColor: 'rgba(253, 224, 71, 0.8)',
    glowColor: '#eab308',
    requiresAchievement: 'legendary',
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    colors: ['#d1fae5', '#6ee7b7', '#10b981', '#059669'],
    trailColor: 'rgba(110, 231, 183, 0.8)',
    glowColor: '#10b981',
    requiresAchievement: 'monster_hunter',
  },
  ghost: {
    id: 'ghost',
    name: 'Ghost',
    colors: ['#ffffff', '#f3f4f6', '#d1d5db', '#9ca3af'],
    trailColor: 'rgba(243, 244, 246, 0.6)',
    glowColor: '#f3f4f6',
    requiresAchievement: 'ghost_master',
  },
};

const STORAGE_KEY = '@balance_game_selected_skin';
const UNLOCKED_KEY = '@balance_game_unlocked_skins';

export async function getSelectedSkin(): Promise<BallSkin> {
  try {
    const skin = await AsyncStorage.getItem(STORAGE_KEY);
    return (skin as BallSkin) || 'classic';
  } catch {
    return 'classic';
  }
}

export async function setSelectedSkin(skin: BallSkin): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, skin);
  } catch (error) {
    console.error('Failed to save skin:', error);
  }
}

export async function getUnlockedSkins(): Promise<BallSkin[]> {
  try {
    const stored = await AsyncStorage.getItem(UNLOCKED_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return ['classic']; // Classic is always unlocked
}

export async function unlockSkin(skin: BallSkin): Promise<void> {
  try {
    const unlocked = await getUnlockedSkins();
    if (!unlocked.includes(skin)) {
      unlocked.push(skin);
      await AsyncStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
    }
  } catch (error) {
    console.error('Failed to unlock skin:', error);
  }
}

export async function checkAndUnlockSkins(achievements: any[]): Promise<BallSkin[]> {
  const newlyUnlocked: BallSkin[] = [];
  const unlockedSkins = await getUnlockedSkins();
  
  for (const [skinId, skin] of Object.entries(BALL_SKINS)) {
    if (skin.requiresAchievement && !unlockedSkins.includes(skinId as BallSkin)) {
      const achievement = achievements.find(a => a.id === skin.requiresAchievement);
      if (achievement?.unlocked) {
        await unlockSkin(skinId as BallSkin);
        newlyUnlocked.push(skinId as BallSkin);
      }
    }
  }
  
  return newlyUnlocked;
}
