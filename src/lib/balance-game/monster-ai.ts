import { Obstacle } from './levels';

export interface MonsterAIState {
  index: number;
  currentX: number;
  currentY: number;
  baseX: number;
  baseY: number;
  time: number;
  // AI-specific state
  targetX?: number;
  targetY?: number;
  teleportCooldown?: number;
  lastTeleport?: number;
  shootCooldown?: number;
  lastShot?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  createdAt: number;
  lifetime: number;
}

export function updateMonsterAI(
  monster: MonsterAIState,
  obstacle: Obstacle,
  ballX: number,
  ballY: number,
  deltaTime: number,
  levelWidth: number,
  levelHeight: number
): MonsterAIState {
  const newMonster = { ...monster };
  newMonster.time += deltaTime;

  const speed = obstacle.speed || 50;
  const range = obstacle.range || 100;

  switch (obstacle.monsterType) {
    case 'chaser': {
      // Follows the ball
      const dx = ballX - newMonster.currentX;
      const dy = ballY - newMonster.currentY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        // Normalize and apply speed
        const chaseSpeed = speed * deltaTime;
        newMonster.currentX += (dx / distance) * chaseSpeed;
        newMonster.currentY += (dy / distance) * chaseSpeed;
      }
      break;
    }

    case 'flyer': {
      // Flying demon - circular + chase hybrid
      const circularX = Math.cos(newMonster.time * speed / 30) * range;
      const circularY = Math.sin(newMonster.time * speed / 30) * range;

      // Add some chase behavior
      const dx = ballX - (newMonster.baseX + circularX);
      const dy = ballY - (newMonster.baseY + circularY);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0 && distance < 200) {
        const chaseInfluence = 0.3; // 30% chase, 70% circular
        const chaseSpeed = speed * deltaTime * chaseInfluence;
        newMonster.currentX = newMonster.baseX + circularX + (dx / distance) * chaseSpeed * 10;
        newMonster.currentY = newMonster.baseY + circularY + (dy / distance) * chaseSpeed * 10;
      } else {
        newMonster.currentX = newMonster.baseX + circularX;
        newMonster.currentY = newMonster.baseY + circularY;
      }
      break;
    }

    case 'teleporter': {
      // Blinks around randomly
      const now = Date.now();
      const teleportInterval = 2000; // 2 seconds

      if (!newMonster.lastTeleport || now - newMonster.lastTeleport > teleportInterval) {
        // Teleport!
        const teleportRange = 150;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * teleportRange;

        let newX = newMonster.baseX + Math.cos(angle) * distance;
        let newY = newMonster.baseY + Math.sin(angle) * distance;

        // Keep in bounds
        newX = Math.max(50, Math.min(levelWidth - 50, newX));
        newY = Math.max(150, Math.min(levelHeight - 50, newY));

        newMonster.currentX = newX;
        newMonster.currentY = newY;
        newMonster.lastTeleport = now;
      }
      break;
    }

    case 'wall_crawler': {
      // Moves along walls/edges
      const edgeMargin = 50;
      const crawlSpeed = speed * deltaTime;

      // Determine which edge we're on
      const isNearLeft = newMonster.currentX < edgeMargin + 50;
      const isNearRight = newMonster.currentX > levelWidth - edgeMargin - 50;
      const isNearTop = newMonster.currentY < edgeMargin + 150;
      const isNearBottom = newMonster.currentY > levelHeight - edgeMargin - 50;

      // Move along edge
      if (isNearTop) {
        newMonster.currentX += crawlSpeed;
        if (newMonster.currentX > levelWidth - edgeMargin - 50) {
          newMonster.currentY += crawlSpeed;
        }
      } else if (isNearRight) {
        newMonster.currentY += crawlSpeed;
        if (newMonster.currentY > levelHeight - edgeMargin - 50) {
          newMonster.currentX -= crawlSpeed;
        }
      } else if (isNearBottom) {
        newMonster.currentX -= crawlSpeed;
        if (newMonster.currentX < edgeMargin + 50) {
          newMonster.currentY -= crawlSpeed;
        }
      } else if (isNearLeft) {
        newMonster.currentY -= crawlSpeed;
        if (newMonster.currentY < edgeMargin + 150) {
          newMonster.currentX += crawlSpeed;
        }
      } else {
        // Not on edge, move to nearest edge
        const distLeft = newMonster.currentX - edgeMargin;
        const distRight = levelWidth - edgeMargin - newMonster.currentX;
        const distTop = newMonster.currentY - (edgeMargin + 150);
        const distBottom = levelHeight - edgeMargin - newMonster.currentY;

        const minDist = Math.min(distLeft, distRight, distTop, distBottom);
        if (minDist === distLeft) newMonster.currentX -= crawlSpeed;
        else if (minDist === distRight) newMonster.currentX += crawlSpeed;
        else if (minDist === distTop) newMonster.currentY -= crawlSpeed;
        else newMonster.currentY += crawlSpeed;
      }
      break;
    }

    case 'basic':
    default: {
      // Default patrol behavior
      if (obstacle.movementType === 'horizontal') {
        newMonster.currentX = newMonster.baseX + Math.sin(newMonster.time * speed / 30) * range;
      } else if (obstacle.movementType === 'vertical') {
        newMonster.currentY = newMonster.baseY + Math.sin(newMonster.time * speed / 30) * range;
      } else if (obstacle.movementType === 'circular') {
        newMonster.currentX = newMonster.baseX + Math.cos(newMonster.time * speed / 30) * range;
        newMonster.currentY = newMonster.baseY + Math.sin(newMonster.time * speed / 30) * range;
      }
      break;
    }
  }

  return newMonster;
}

export function createProjectile(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  speed: number = 200
): Projectile {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const vx = distance > 0 ? (dx / distance) * speed : 0;
  const vy = distance > 0 ? (dy / distance) * speed : 0;

  return {
    id: `proj-${Date.now()}-${Math.random()}`,
    x: fromX,
    y: fromY,
    vx,
    vy,
    createdAt: Date.now(),
    lifetime: 3000, // 3 seconds
  };
}

export function updateProjectiles(
  projectiles: Projectile[],
  deltaTime: number
): Projectile[] {
  const now = Date.now();
  
  return projectiles
    .filter(p => now - p.createdAt < p.lifetime)
    .map(p => ({
      ...p,
      x: p.x + p.vx * deltaTime,
      y: p.y + p.vy * deltaTime,
    }));
}

export function checkProjectileCollision(
  projectile: Projectile,
  ballX: number,
  ballY: number,
  ballRadius: number
): boolean {
  const dx = projectile.x - ballX;
  const dy = projectile.y - ballY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < ballRadius + 8; // Projectile radius ~8
}

export function shouldShooterFire(
  monster: MonsterAIState,
  ballX: number,
  ballY: number,
  fireInterval: number = 2000
): boolean {
  const now = Date.now();
  
  // Check cooldown
  if (monster.lastShot && now - monster.lastShot < fireInterval) {
    return false;
  }

  // Check if ball is in range
  const dx = ballX - monster.currentX;
  const dy = ballY - monster.currentY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < 250; // Shoot within 250px
}
