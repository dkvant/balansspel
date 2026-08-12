export type PowerUpType = 
  | 'shield' 
  | 'speed' 
  | 'ghost' 
  | 'magnet' 
  | 'slowmo' 
  | 'invincible';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  active: boolean;
  collected: boolean;
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number;
}

export const POWER_UP_DURATION: Record<PowerUpType, number> = {
  shield: 0, // Lasts until hit
  speed: 5000, // 5 seconds
  ghost: 3000, // 3 seconds
  magnet: 4000, // 4 seconds
  slowmo: 4000, // 4 seconds
  invincible: 2000, // 2 seconds
};

export const POWER_UP_COLORS: Record<PowerUpType, string[]> = {
  shield: ['#fbbf24', '#f59e0b', '#d97706'],
  speed: ['#ef4444', '#dc2626', '#b91c1c'],
  ghost: ['#60a5fa', '#3b82f6', '#2563eb'],
  magnet: ['#22c55e', '#16a34a', '#15803d'],
  slowmo: ['#a855f7', '#9333ea', '#7e22ce'],
  invincible: ['#f97316', '#ea580c', '#c2410c'],
};

export const POWER_UP_ICONS: Record<PowerUpType, string> = {
  shield: '🛡️',
  speed: '⚡',
  ghost: '👻',
  magnet: '🧲',
  slowmo: '🕐',
  invincible: '⭐',
};

export const POWER_UP_NAMES: Record<PowerUpType, string> = {
  shield: 'Sköld',
  speed: 'Hastighet',
  ghost: 'Ghost Mode',
  magnet: 'Magnet till mål',
  slowmo: 'Slow Motion',
  invincible: 'Osårbar',
};

export function createPowerUp(
  type: PowerUpType,
  x: number,
  y: number,
  id: string
): PowerUp {
  return {
    id,
    type,
    x,
    y,
    active: true,
    collected: false,
  };
}

export function generateRandomPowerUps(
  levelWidth: number,
  levelHeight: number,
  count: number
): PowerUp[] {
  const types: PowerUpType[] = ['shield', 'speed', 'ghost', 'magnet', 'slowmo', 'invincible'];
  const powerUps: PowerUp[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const x = 50 + Math.random() * (levelWidth - 100);
    const y = 150 + Math.random() * (levelHeight - 300);
    
    powerUps.push(createPowerUp(type, x, y, `powerup-${i}`));
  }
  
  return powerUps;
}
