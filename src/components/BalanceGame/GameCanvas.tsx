import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { 
  Canvas, 
  Circle, 
  Rect, 
  Group, 
  LinearGradient, 
  RadialGradient,
  Shadow,
  Blur,
  vec,
  Path,
  Skia,
} from '@shopify/react-native-skia';
import { Accelerometer } from 'expo-sensors';
import { Level } from '../../lib/balance-game/levels';
import { ObstacleRenderer } from './ObstacleRenderer';
import { PowerUp, ActivePowerUp, generateRandomPowerUps, POWER_UP_DURATION, POWER_UP_COLORS, POWER_UP_ICONS } from '../../lib/balance-game/powerups';
import { Particle, createParticles, updateParticles } from '../../lib/balance-game/particles';
import { BallSkin, BALL_SKINS } from '../../lib/balance-game/skins';
import { MonsterAIState, updateMonsterAI } from '../../lib/balance-game/monster-ai';
import { playSoundEffect } from '../../lib/balance-game/sound-system';
import { recordPowerUpCollected, recordDeath, recordDistance } from '../../lib/balance-game/statistics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_WIDTH = 400;
const GAME_HEIGHT = 700;
const TRAIL_LENGTH = 15;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

// Use MonsterAIState from monster-ai.ts
// interface MovingObstacle = MonsterAIState

interface GameCanvasProps {
  level: Level;
  onWin: (time: number) => void;
  onLose: () => void;
  ballSkin?: BallSkin;
  onPowerUpCollected?: (type: string) => void;
}

export function GameCanvas({ level, onWin, onLose, ballSkin = 'classic', onPowerUpCollected }: GameCanvasProps) {
  const [ball, setBall] = useState<Ball>({
    x: level.startX,
    y: level.startY,
    vx: 0,
    vy: 0,
  });
  const [gameActive, setGameActive] = useState(true);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [time, setTime] = useState(0);
  const [movingObstacles, setMovingObstacles] = useState<MonsterAIState[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(Date.now());
  const accelerometerRef = useRef({ x: 0, y: 0 });
  const startTimeRef = useRef<number>(Date.now());
  const lastPortalUseRef = useRef<number>(0);
  const totalDistanceRef = useRef<number>(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const skinConfig = BALL_SKINS[ballSkin];

  useEffect(() => {
    // Sätt upp accelerometer
    Accelerometer.setUpdateInterval(16);
    
    const subscription = Accelerometer.addListener((data) => {
      // Mer responsiv styrning med bättre känslighet
      accelerometerRef.current = {
        x: data.x * 60,
        y: -data.y * 60,
      };
    });

    return () => {
      // @ts-ignore - remove() doesn't take arguments in expo-sensors v57
      subscription && subscription.remove();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Återställ bollen när level ändras
    setBall({
      x: level.startX,
      y: level.startY,
      vx: 0,
      vy: 0,
    });
    setGameActive(true);
    setTrail([]);
    setTime(0);
    setParticles([]);
    setActivePowerUps([]);
    lastUpdateRef.current = Date.now();
    startTimeRef.current = Date.now();
    lastPortalUseRef.current = 0;
    
    // Initiera rörliga hinder med Monster AI
    const moving: MonsterAIState[] = [];
    level.obstacles.forEach((obstacle, index) => {
      if (obstacle.movementType || obstacle.type === 'monster') {
        moving.push({
          index,
          currentX: obstacle.x,
          currentY: obstacle.y,
          baseX: obstacle.x,
          baseY: obstacle.y,
          time: 0,
          // AI-specific
          lastTeleport: 0,
          lastShot: 0,
        });
      }
    });
    setMovingObstacles(moving);
    
    // Generera power-ups (2-4 per bana)
    const powerUpCount = 2 + Math.floor(Math.random() * 3);
    setPowerUps(generateRandomPowerUps(GAME_WIDTH, GAME_HEIGHT, powerUpCount));
  }, [level]);

  useEffect(() => {
    if (!gameActive) return;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      // Uppdatera timer
      setTime((now - startTimeRef.current) / 1000);

      // Uppdatera partiklar
      setParticles(prev => updateParticles(prev, deltaTime));
      
      // Uppdatera aktiva power-ups
      setActivePowerUps(prev => prev.filter(p => p.expiresAt > now));

      setBall((prevBall) => {
        let newBall = { ...prevBall };

        // Check power-ups
        const hasSpeed = activePowerUps.some(p => p.type === 'speed');
        const hasGhost = activePowerUps.some(p => p.type === 'ghost');
        const hasMagnet = activePowerUps.some(p => p.type === 'magnet');
        const hasSlowmo = activePowerUps.some(p => p.type === 'slowmo');
        const isInvincible = activePowerUps.some(p => p.type === 'invincible');
        
        const speedMultiplier = hasSpeed ? 1.5 : hasSlowmo ? 0.5 : 1;

        // Applicera acceleration från telefonen
        newBall.vx += accelerometerRef.current.x * deltaTime * speedMultiplier;
        newBall.vy += accelerometerRef.current.y * deltaTime * speedMultiplier;
        
        // Magnet till mål
        if (hasMagnet) {
          const dx = level.goalX - newBall.x;
          const dy = level.goalY - newBall.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            const strength = 100 * deltaTime / distance;
            newBall.vx += dx * strength;
            newBall.vy += dy * strength;
          }
        }

        // Applicera friktion
        newBall.vx *= level.friction;
        newBall.vy *= level.friction;

        // Uppdatera position
        newBall.x += newBall.vx * deltaTime;
        newBall.y += newBall.vy * deltaTime;

        // Uppdatera rörliga hinder med Monster AI
        setMovingObstacles((prev) => {
          return prev.map((mo) => {
            const obstacle = level.obstacles[mo.index];
            
            // Använd Monster AI system
            return updateMonsterAI(
              mo,
              obstacle,
              newBall.x,
              newBall.y,
              deltaTime,
              GAME_WIDTH,
              GAME_HEIGHT
            );
          });
        });

        // Kolla kollision med power-ups
        setPowerUps(prev => prev.map(powerUp => {
          if (powerUp.collected) return powerUp;
          
          const dx = newBall.x - powerUp.x;
          const dy = newBall.y - powerUp.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < level.ballRadius + 15) {
            // Collected!
            const expiresAt = powerUp.type === 'shield' 
              ? Date.now() + 999999999 
              : Date.now() + POWER_UP_DURATION[powerUp.type];
            
            setActivePowerUps(prev => [...prev, { type: powerUp.type, expiresAt }]);
            setParticles(prev => [...prev, ...createParticles('power_pickup', powerUp.x, powerUp.y, 12)]);
            playSoundEffect('power_pickup'); // Sound effect!
            recordPowerUpCollected(powerUp.type); // Statistics!
            onPowerUpCollected?.(powerUp.type);
            
            return { ...powerUp, collected: true };
          }
          
          return powerUp;
        }));

        // Kolla kollision med hinder
        for (let i = 0; i < level.obstacles.length; i++) {
          const obstacle = level.obstacles[i];
          let obstacleX = obstacle.x;
          let obstacleY = obstacle.y;
          
          // Använd aktuell position för rörliga hinder
          const movingObstacle = movingObstacles.find(mo => mo.index === i);
          if (movingObstacle) {
            obstacleX = movingObstacle.currentX;
            obstacleY = movingObstacle.currentY;
          }
          // Hantera olika hindertyper
          switch (obstacle.type) {
            case 'hole':
            case 'lava': {
              if (isInvincible || hasGhost) break; // Immune
              
              const centerX = obstacleX + obstacle.width / 2;
              const centerY = obstacleY + obstacle.height / 2;
              const distance = Math.sqrt(
                Math.pow(newBall.x - centerX, 2) + Math.pow(newBall.y - centerY, 2)
              );
              
              if (distance < level.ballRadius + obstacle.width / 2) {
                // Particle effect
                setParticles(prev => [...prev, ...createParticles(
                  obstacle.type === 'lava' ? 'lava_splash' : 'explosion',
                  centerX,
                  centerY,
                  15
                )]);
                
                playSoundEffect('lose'); // Sound effect!
                recordDeath(obstacle.type); // Statistics!
                setGameActive(false);
                setTimeout(() => onLose(), 300);
                return newBall;
              }
              break;
            }
            
            case 'monster': {
              const centerX = obstacleX + obstacle.width / 2;
              const centerY = obstacleY + obstacle.height / 2;
              const distance = Math.sqrt(
                Math.pow(newBall.x - centerX, 2) + Math.pow(newBall.y - centerY, 2)
              );
              
              if (distance < level.ballRadius + obstacle.width / 2) {
                if (isInvincible) {
                  // Kill monster with particles!
                  setParticles(prev => [...prev, ...createParticles('explosion', centerX, centerY, 20)]);
                  playSoundEffect('monster_death'); // Sound effect!
                  break;
                }
                
                // Check for shield
                const hasShield = activePowerUps.some(p => p.type === 'shield');
                if (hasShield) {
                  setActivePowerUps(prev => prev.filter(p => p.type !== 'shield'));
                  setParticles(prev => [...prev, ...createParticles('explosion', centerX, centerY, 15)]);
                  playSoundEffect('monster_death'); // Sound effect!
                  break;
                }
                
                setParticles(prev => [...prev, ...createParticles('explosion', newBall.x, newBall.y, 20)]);
                playSoundEffect('lose'); // Sound effect!
                recordDeath('monster'); // Statistics!
                setGameActive(false);
                setTimeout(() => onLose(), 300);
                return newBall;
              }
              break;
            }
            
            case 'spike': {
              if (isInvincible || hasGhost) break; // Immune
              
              const collision = checkWallCollision(
                newBall,
                { x: obstacleX, y: obstacleY, width: obstacle.width, height: obstacle.height },
                level.ballRadius
              );
              
              if (collision) {
                const hasShield = activePowerUps.some(p => p.type === 'shield');
                if (hasShield) {
                  setActivePowerUps(prev => prev.filter(p => p.type !== 'shield'));
                  break;
                }
                
                recordDeath('spike'); // Statistics!
                setGameActive(false);
                setTimeout(() => onLose(), 300);
                return newBall;
              }
              break;
            }
            
            case 'wall': {
              if (hasGhost) break; // Can pass through walls
              
              const collision = checkWallCollision(
                newBall,
                { x: obstacleX, y: obstacleY, width: obstacle.width, height: obstacle.height },
                level.ballRadius
              );
              
              if (collision) {
                newBall = collision;
              }
              break;
            }
            
            case 'portal': {
              const centerX = obstacleX + obstacle.width / 2;
              const centerY = obstacleY + obstacle.height / 2;
              const distance = Math.sqrt(
                Math.pow(newBall.x - centerX, 2) + Math.pow(newBall.y - centerY, 2)
              );
              
              // Teleportera om vi är i portalen och inte nyligen använt en portal
              if (distance < obstacle.width / 2 && Date.now() - lastPortalUseRef.current > 500) {
                if (obstacle.targetX !== undefined && obstacle.targetY !== undefined) {
                  // Entry particles
                  setParticles(prev => [...prev, ...createParticles('portal_entry', centerX, centerY, 15)]);
                  playSoundEffect('portal'); // Sound effect!
                  
                  newBall.x = obstacle.targetX;
                  newBall.y = obstacle.targetY;
                  newBall.vx *= 0.5;
                  newBall.vy *= 0.5;
                  lastPortalUseRef.current = Date.now();
                  
                  // Exit particles (delayed slightly)
                  setTimeout(() => {
                    setParticles(prev => [...prev, ...createParticles('portal_exit', obstacle.targetX!, obstacle.targetY!, 15)]);
                  }, 50);
                }
              }
              break;
            }
            
            case 'wind': {
              // Kolla om bollen är i vindområdet
              if (
                newBall.x > obstacleX &&
                newBall.x < obstacleX + obstacle.width &&
                newBall.y > obstacleY &&
                newBall.y < obstacleY + obstacle.height
              ) {
                const strength = (obstacle.windStrength || 30) * deltaTime;
                switch (obstacle.windDirection) {
                  case 'up':
                    newBall.vy -= strength;
                    break;
                  case 'down':
                    newBall.vy += strength;
                    break;
                  case 'left':
                    newBall.vx -= strength;
                    break;
                  case 'right':
                    newBall.vx += strength;
                    break;
                }
              }
              break;
            }
            
            case 'magnet': {
              const centerX = obstacleX + obstacle.width / 2;
              const centerY = obstacleY + obstacle.height / 2;
              const dx = centerX - newBall.x;
              const dy = centerY - newBall.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Attrahera kulan mot magneten
              if (distance < 150 && distance > obstacle.width / 2) {
                const strength = (obstacle.windStrength || 50) * deltaTime / distance;
                newBall.vx += dx * strength;
                newBall.vy += dy * strength;
              }
              break;
            }
          }
        }

        // Kolla om bollen når målet
        const distanceToGoal = Math.sqrt(
          Math.pow(newBall.x - level.goalX, 2) +
          Math.pow(newBall.y - level.goalY, 2)
        );
        
        if (distanceToGoal < level.ballRadius + 25) {
          setGameActive(false);
          const finalTime = (Date.now() - startTimeRef.current) / 1000;
          
          // Confetti!
          setParticles(prev => [...prev, ...createParticles('confetti', level.goalX, level.goalY, 40)]);
          playSoundEffect('win'); // Sound effect!
          recordDistance(totalDistanceRef.current); // Statistics!
          
          setTimeout(() => onWin(finalTime), 300);
          return newBall;
        }

        // Kolla om bollen åkte utanför banan
        if (
          newBall.x < level.ballRadius ||
          newBall.x > GAME_WIDTH - level.ballRadius ||
          newBall.y < level.ballRadius ||
          newBall.y > GAME_HEIGHT - level.ballRadius
        ) {
          recordDeath('out_of_bounds'); // Statistics!
          setGameActive(false);
          setTimeout(() => onLose(), 300);
          return newBall;
        }

        return newBall;
      });

      // Uppdatera trail-effekt
      setBall((currentBall) => {
        setTrail((prevTrail) => {
          const newTrail = [
            { x: currentBall.x, y: currentBall.y, alpha: 1 },
            ...prevTrail.map((point, idx) => ({
              ...point,
              alpha: 1 - (idx + 1) / TRAIL_LENGTH,
            })),
          ].slice(0, TRAIL_LENGTH);
          return newTrail;
        });
        return currentBall;
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameActive, level, onWin, onLose]);

  const checkWallCollision = (
    ball: Ball,
    obstacle: { x: number; y: number; width: number; height: number },
    radius: number
  ): Ball | null => {
    // Hitta närmaste punkt på rektangeln
    const closestX = Math.max(obstacle.x, Math.min(ball.x, obstacle.x + obstacle.width));
    const closestY = Math.max(obstacle.y, Math.min(ball.y, obstacle.y + obstacle.height));

    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < radius) {
      // Kollision! Reflektera bollen
      const newBall = { ...ball };
      
      if (distance > 0) {
        const normalX = distanceX / distance;
        const normalY = distanceY / distance;
        
        // Flytta bollen ut från väggen
        const overlap = radius - distance;
        newBall.x += normalX * overlap;
        newBall.y += normalY * overlap;
        
        // Reflektera hastigheten
        const dotProduct = newBall.vx * normalX + newBall.vy * normalY;
        newBall.vx -= 2 * dotProduct * normalX;
        newBall.vy -= 2 * dotProduct * normalY;
        
        // Dämpa lite för mer realistisk studs
        newBall.vx *= 0.6;
        newBall.vy *= 0.6;
      }
      
      return newBall;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <Canvas style={styles.canvas}>
          {/* Bakgrund med stjärneffekt */}
          <Rect x={0} y={0} width={GAME_WIDTH} height={GAME_HEIGHT}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(GAME_WIDTH, GAME_HEIGHT)}
              colors={['#0a0e27', '#1a1f3a', '#0f172a', '#0a0e27']}
            />
          </Rect>

          {/* Dekorativa cirklar i bakgrunden */}
          <Circle cx={50} cy={100} r={80} opacity={0.05}>
            <RadialGradient
              c={vec(50, 100)}
              r={80}
              colors={['#3b82f6', 'transparent']}
            />
          </Circle>
          <Circle cx={350} cy={300} r={100} opacity={0.05}>
            <RadialGradient
              c={vec(350, 300)}
              r={100}
              colors={['#8b5cf6', 'transparent']}
            />
          </Circle>
          <Circle cx={200} cy={600} r={90} opacity={0.05}>
            <RadialGradient
              c={vec(200, 600)}
              r={90}
              colors={['#10b981', 'transparent']}
            />
          </Circle>

          {/* Rita hinder med förbättrad grafik */}
          {level.obstacles.map((obstacle, index) => {
            // Hämta position för rörliga hinder
            const movingObstacle = movingObstacles.find(mo => mo.index === index);
            const obstacleX = movingObstacle ? movingObstacle.currentX : obstacle.x;
            const obstacleY = movingObstacle ? movingObstacle.currentY : obstacle.y;
            
            return (
              <ObstacleRenderer
                key={index}
                obstacle={obstacle}
                obstacleX={obstacleX}
                obstacleY={obstacleY}
                time={time}
              />
            );
          })}

          {/* Start-markering med animerad glöd */}
          <Group>
            <Circle cx={level.startX} cy={level.startY} r={30} opacity={0.2}>
              <RadialGradient
                c={vec(level.startX, level.startY)}
                r={30}
                colors={['#22c55e', 'transparent']}
              />
            </Circle>
            <Circle cx={level.startX} cy={level.startY} r={25}>
              <RadialGradient
                c={vec(level.startX, level.startY)}
                r={25}
                colors={['rgba(34, 197, 94, 0.6)', 'rgba(34, 197, 94, 0.2)']}
              />
            </Circle>
            <Circle cx={level.startX} cy={level.startY} r={15}>
              <RadialGradient
                c={vec(level.startX, level.startY)}
                r={15}
                colors={['#22c55e', '#16a34a']}
              />
            </Circle>
            {/* Inre highlight */}
            <Circle cx={level.startX - 5} cy={level.startY - 5} r={6} opacity={0.8}>
              <RadialGradient
                c={vec(level.startX - 5, level.startY - 5)}
                r={6}
                colors={['rgba(255, 255, 255, 0.9)', 'transparent']}
              />
            </Circle>
          </Group>

          {/* Mål-markering med guld-effekt */}
          <Group>
            <Circle cx={level.goalX} cy={level.goalY} r={35} opacity={0.3}>
              <RadialGradient
                c={vec(level.goalX, level.goalY)}
                r={35}
                colors={['#fbbf24', '#f59e0b', 'transparent']}
              />
            </Circle>
            <Circle cx={level.goalX} cy={level.goalY} r={25}>
              <RadialGradient
                c={vec(level.goalX, level.goalY)}
                r={25}
                colors={['rgba(251, 191, 36, 0.7)', 'rgba(234, 179, 8, 0.3)']}
              />
            </Circle>
            <Circle cx={level.goalX} cy={level.goalY} r={15}>
              <RadialGradient
                c={vec(level.goalX, level.goalY)}
                r={15}
                colors={['#fbbf24', '#f59e0b', '#d97706']}
              />
            </Circle>
            {/* Guld-glans */}
            <Circle cx={level.goalX - 4} cy={level.goalY - 4} r={7} opacity={0.9}>
              <RadialGradient
                c={vec(level.goalX - 4, level.goalY - 4)}
                r={7}
                colors={['rgba(255, 255, 255, 0.95)', 'transparent']}
              />
            </Circle>
          </Group>

          {/* Power-ups */}
          {powerUps.map((powerUp, index) => {
            if (powerUp.collected) return null;
            const colors = POWER_UP_COLORS[powerUp.type];
            const pulse = 1 + Math.sin(time * 4) * 0.15;
            
            return (
              <Group key={`powerup-${index}`}>
                {/* Yttre glöd */}
                <Circle cx={powerUp.x} cy={powerUp.y} r={20 * pulse} opacity={0.4}>
                  <RadialGradient
                    c={vec(powerUp.x, powerUp.y)}
                    r={20 * pulse}
                    colors={[colors[0], colors[1], 'transparent']}
                  />
                </Circle>
                {/* Power-up kropp */}
                <Circle cx={powerUp.x} cy={powerUp.y} r={15 * pulse}>
                  <RadialGradient
                    c={vec(powerUp.x - 5, powerUp.y - 5)}
                    r={15 * pulse}
                    colors={colors}
                  />
                </Circle>
                {/* Icon could be rendered here with text if needed */}
              </Group>
            );
          })}

          {/* Particles */}
          {particles.map((particle, index) => (
            <Circle
              key={`particle-${index}`}
              cx={particle.x}
              cy={particle.y}
              r={particle.size * (1 - particle.lifetime / particle.maxLifetime)}
              opacity={1 - particle.lifetime / particle.maxLifetime}
              color={particle.color}
            />
          ))}

          {/* Trail-effekt bakom kulan */}
          {trail.map((point, index) => (
            <Circle
              key={`trail-${index}`}
              cx={point.x}
              cy={point.y}
              r={level.ballRadius * (0.5 + point.alpha * 0.5)}
              opacity={point.alpha * 0.4}
            >
              <RadialGradient
                c={vec(point.x, point.y)}
                r={level.ballRadius}
                colors={[skinConfig.trailColor || 'rgba(96, 165, 250, 0.8)', 'transparent']}
              />
            </Circle>
          ))}

          {/* Kulan med 3D-effekt och glöd */}
          <Group>
            {/* Yttre glöd */}
            <Circle cx={ball.x} cy={ball.y} r={level.ballRadius + 8} opacity={0.4}>
              <RadialGradient
                c={vec(ball.x, ball.y)}
                r={level.ballRadius + 8}
                colors={[skinConfig.glowColor || '#3b82f6', 'transparent']}
              />
            </Circle>
            {/* Ghost mode effect */}
            {activePowerUps.some(p => p.type === 'ghost') && (
              <Circle cx={ball.x} cy={ball.y} r={level.ballRadius + 12} opacity={0.3}>
                <RadialGradient
                  c={vec(ball.x, ball.y)}
                  r={level.ballRadius + 12}
                  colors={['#60a5fa', '#3b82f6', 'transparent']}
                />
              </Circle>
            )}
            {/* Shield effect */}
            {activePowerUps.some(p => p.type === 'shield') && (
              <Circle cx={ball.x} cy={ball.y} r={level.ballRadius + 10} opacity={0.5}>
                <RadialGradient
                  c={vec(ball.x, ball.y)}
                  r={level.ballRadius + 10}
                  colors={['#fbbf24', '#f59e0b', 'transparent']}
                />
              </Circle>
            )}
            {/* Invincible effect */}
            {activePowerUps.some(p => p.type === 'invincible') && (
              <Circle cx={ball.x} cy={ball.y} r={level.ballRadius + 15} opacity={0.6}>
                <RadialGradient
                  c={vec(ball.x, ball.y)}
                  r={level.ballRadius + 15}
                  colors={['#f97316', '#ea580c', 'transparent']}
                />
              </Circle>
            )}
            {/* Skugga */}
            <Circle cx={ball.x + 2} cy={ball.y + 2} r={level.ballRadius} opacity={0.3} color="#000000" />
            {/* Huvudkulan */}
            <Circle cx={ball.x} cy={ball.y} r={level.ballRadius}>
              <RadialGradient
                c={vec(ball.x - level.ballRadius * 0.3, ball.y - level.ballRadius * 0.3)}
                r={level.ballRadius * 1.5}
                colors={skinConfig.colors}
              />
            </Circle>
            {/* Highlight för 3D-effekt */}
            <Circle 
              cx={ball.x - level.ballRadius * 0.35} 
              cy={ball.y - level.ballRadius * 0.35} 
              r={level.ballRadius * 0.4}
              opacity={0.85}
            >
              <RadialGradient
                c={vec(ball.x - level.ballRadius * 0.35, ball.y - level.ballRadius * 0.35)}
                r={level.ballRadius * 0.4}
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.3)', 'transparent']}
              />
            </Circle>
          </Group>
        </Canvas>
        
        {/* Timer overlay */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>⏱ {time.toFixed(1)}s</Text>
        </View>
        
        {/* Active power-ups display */}
        {activePowerUps.length > 0 && (
          <View style={styles.powerUpsContainer}>
            {activePowerUps.map((powerUp, index) => {
              const remaining = Math.max(0, powerUp.expiresAt - Date.now()) / 1000;
              const icon = POWER_UP_ICONS[powerUp.type];
              return (
                <View key={index} style={styles.powerUpBadge}>
                  <Text style={styles.powerUpIcon}>{icon}</Text>
                  {powerUp.type !== 'shield' && (
                    <Text style={styles.powerUpTime}>{remaining.toFixed(1)}s</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasContainer: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  canvas: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  timerContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  timerText: {
    color: '#60a5fa',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  powerUpsContainer: {
    position: 'absolute',
    top: 70,
    right: 15,
    flexDirection: 'column',
    gap: 8,
  },
  powerUpBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.6)',
    alignItems: 'center',
    minWidth: 60,
  },
  powerUpIcon: {
    fontSize: 20,
  },
  powerUpTime: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
