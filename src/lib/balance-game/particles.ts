export type ParticleType = 
  | 'explosion'
  | 'portal_entry'
  | 'portal_exit'
  | 'lava_splash'
  | 'magnet_spark'
  | 'wind'
  | 'confetti'
  | 'ice_crystal'
  | 'spike_glint'
  | 'power_pickup';

export interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifetime: number;
  maxLifetime: number;
  size: number;
  color: string;
  rotation?: number;
  rotationSpeed?: number;
}

export function createParticles(
  type: ParticleType,
  x: number,
  y: number,
  count: number
): Particle[] {
  const particles: Particle[] = [];
  
  switch (type) {
    case 'explosion':
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 100 + Math.random() * 100;
        particles.push({
          id: `${type}-${Date.now()}-${i}`,
          type,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          lifetime: 0,
          maxLifetime: 0.5 + Math.random() * 0.3,
          size: 4 + Math.random() * 4,
          color: ['#ef4444', '#dc2626', '#f59e0b'][Math.floor(Math.random() * 3)],
        });
      }
      break;
      
    case 'portal_entry':
    case 'portal_exit':
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (type === 'portal_entry' ? 0 : Math.PI);
        const speed = type === 'portal_entry' ? -150 : 150;
        particles.push({
          id: `${type}-${Date.now()}-${i}`,
          type,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          lifetime: 0,
          maxLifetime: 0.4,
          size: 3 + Math.random() * 3,
          color: ['#3b82f6', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 3)],
        });
      }
      break;
      
    case 'confetti':
      for (let i = 0; i < count; i++) {
        const angle = Math.PI * 1.5 + (Math.random() - 0.5) * Math.PI * 0.5;
        const speed = 200 + Math.random() * 150;
        particles.push({
          id: `${type}-${Date.now()}-${i}`,
          type,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          lifetime: 0,
          maxLifetime: 1.5 + Math.random() * 0.5,
          size: 4 + Math.random() * 4,
          color: ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#60a5fa', '#a78bfa'][
            Math.floor(Math.random() * 6)
          ],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 10,
        });
      }
      break;
      
    case 'lava_splash':
      for (let i = 0; i < count; i++) {
        const angle = Math.PI * 1.5 + (Math.random() - 0.5) * Math.PI;
        const speed = 80 + Math.random() * 80;
        particles.push({
          id: `${type}-${Date.now()}-${i}`,
          type,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          lifetime: 0,
          maxLifetime: 0.6 + Math.random() * 0.3,
          size: 3 + Math.random() * 3,
          color: ['#f97316', '#ea580c', '#dc2626'][Math.floor(Math.random() * 3)],
        });
      }
      break;
      
    case 'magnet_spark':
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 60 + Math.random() * 40;
        particles.push({
          id: `${type}-${Date.now()}-${i}`,
          type,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          lifetime: 0,
          maxLifetime: 0.3 + Math.random() * 0.2,
          size: 2 + Math.random() * 2,
          color: ['#a855f7', '#e879f9'][Math.floor(Math.random() * 2)],
        });
      }
      break;
      
    case 'ice_crystal':
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 30 + Math.random() * 30;
        particles.push({
          id: `${type}-${Date.now()}-${i}`,
          type,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 50,
          lifetime: 0,
          maxLifetime: 1 + Math.random() * 0.5,
          size: 2 + Math.random() * 2,
          color: ['#bae6fd', '#7dd3fc', '#f0f9ff'][Math.floor(Math.random() * 3)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 5,
        });
      }
      break;
      
    case 'power_pickup':
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 100 + Math.random() * 50;
        particles.push({
          id: `${type}-${Date.now()}-${i}`,
          type,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          lifetime: 0,
          maxLifetime: 0.5,
          size: 3 + Math.random() * 3,
          color: '#fbbf24',
        });
      }
      break;
      
    default:
      break;
  }
  
  return particles;
}

export function updateParticles(
  particles: Particle[],
  deltaTime: number
): Particle[] {
  return particles
    .filter(p => {
      const newLifetime = p.lifetime + deltaTime;
      return newLifetime < p.maxLifetime;
    })
    .map(p => {
      const newLifetime = p.lifetime + deltaTime;
      const hasGravity = p.type === 'confetti' || p.type === 'lava_splash';
      
      return {
        ...p,
        lifetime: newLifetime,
        x: p.x + p.vx * deltaTime,
        y: p.y + p.vy * deltaTime + (hasGravity ? 300 * deltaTime : 0),
        vy: p.vy + (hasGravity ? 300 * deltaTime : 0),
        rotation: p.rotation !== undefined && p.rotationSpeed !== undefined 
          ? p.rotation + p.rotationSpeed * deltaTime 
          : p.rotation,
      };
    });
}
