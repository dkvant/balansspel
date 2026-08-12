import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameStats {
  totalPlayTime: number; // milliseconds
  levelsCompleted: number;
  totalDeaths: number;
  longestStreak: number;
  totalStars: number;
  powerUpsCollected: number;
  achievementsUnlocked: number;
  dailyChallengesCompleted: number;
  favoritePowerUp: string;
  mostDeadlyObstacle: string;
  fastestCompletion: number;
  totalDistance: number;
  // Tracking counts
  powerUpCounts: Record<string, number>;
  obstacleCounts: Record<string, number>;
}

const STORAGE_KEY = '@balance_game_statistics';

const DEFAULT_STATS: GameStats = {
  totalPlayTime: 0,
  levelsCompleted: 0,
  totalDeaths: 0,
  longestStreak: 0,
  totalStars: 0,
  powerUpsCollected: 0,
  achievementsUnlocked: 0,
  dailyChallengesCompleted: 0,
  favoritePowerUp: 'Shield',
  mostDeadlyObstacle: 'Monster',
  fastestCompletion: 0,
  totalDistance: 0,
  powerUpCounts: {},
  obstacleCounts: {},
};

export async function loadStats(): Promise<GameStats> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_STATS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
  return { ...DEFAULT_STATS };
}

export async function saveStats(stats: GameStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

export async function recordLevelComplete(time: number, stars: number): Promise<void> {
  const stats = await loadStats();
  
  stats.levelsCompleted++;
  stats.totalStars += stars;
  stats.totalPlayTime += time * 1000;
  
  // Update fastest
  if (stats.fastestCompletion === 0 || time < stats.fastestCompletion) {
    stats.fastestCompletion = time;
  }
  
  await saveStats(stats);
}

export async function recordDeath(deathType: string): Promise<void> {
  const stats = await loadStats();
  
  stats.totalDeaths++;
  
  // Track obstacle deaths
  stats.obstacleCounts[deathType] = (stats.obstacleCounts[deathType] || 0) + 1;
  
  // Update most deadly
  let maxCount = 0;
  let maxObstacle = 'Monster';
  for (const [obstacle, count] of Object.entries(stats.obstacleCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxObstacle = obstacle;
    }
  }
  stats.mostDeadlyObstacle = maxObstacle;
  
  await saveStats(stats);
}

export async function recordPowerUpCollected(powerUpType: string): Promise<void> {
  const stats = await loadStats();
  
  stats.powerUpsCollected++;
  
  // Track power-up usage
  stats.powerUpCounts[powerUpType] = (stats.powerUpCounts[powerUpType] || 0) + 1;
  
  // Update favorite
  let maxCount = 0;
  let maxPowerUp = 'Shield';
  for (const [powerUp, count] of Object.entries(stats.powerUpCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxPowerUp = powerUp;
    }
  }
  stats.favoritePowerUp = maxPowerUp;
  
  await saveStats(stats);
}

export async function recordDistance(distance: number): Promise<void> {
  const stats = await loadStats();
  stats.totalDistance += distance;
  await saveStats(stats);
}

export async function updateAchievementCount(count: number): Promise<void> {
  const stats = await loadStats();
  stats.achievementsUnlocked = count;
  await saveStats(stats);
}

export async function updateDailyChallengeCount(count: number): Promise<void> {
  const stats = await loadStats();
  stats.dailyChallengesCompleted = count;
  await saveStats(stats);
}

export async function updateLongestStreak(streak: number): Promise<void> {
  const stats = await loadStats();
  if (streak > stats.longestStreak) {
    stats.longestStreak = streak;
    await saveStats(stats);
  }
}
