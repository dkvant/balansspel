import React from 'react';
import {
  Circle,
  Rect,
  Group,
  LinearGradient,
  RadialGradient,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import { Obstacle } from '../../lib/balance-game/levels';

interface ObstacleRendererProps {
  obstacle: Obstacle;
  obstacleX: number;
  obstacleY: number;
  time: number;
}

export function ObstacleRenderer({
  obstacle,
  obstacleX,
  obstacleY,
  time,
}: ObstacleRendererProps) {
  switch (obstacle.type) {
    case 'hole': {
      const cx = obstacleX + obstacle.width / 2;
      const cy = obstacleY + obstacle.height / 2;
      const r = obstacle.width / 2;
      return (
        <Group>
          {/* Yttre glöd */}
          <Circle cx={cx} cy={cy} r={r + 8} opacity={0.3}>
            <RadialGradient
              c={vec(cx, cy)}
              r={r + 8}
              colors={['#ef4444', '#7f1d1d', 'transparent']}
            />
          </Circle>
          {/* Hålet */}
          <Circle cx={cx} cy={cy} r={r}>
            <RadialGradient
              c={vec(cx, cy)}
              r={r}
              colors={['#1a1a1a', '#000000']}
            />
          </Circle>
          {/* Inre highlight */}
          <Circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.3} opacity={0.2}>
            <RadialGradient
              c={vec(cx - r * 0.3, cy - r * 0.3)}
              r={r * 0.3}
              colors={['#666666', 'transparent']}
            />
          </Circle>
        </Group>
      );
    }

    case 'monster': {
      const cx = obstacleX + obstacle.width / 2;
      const cy = obstacleY + obstacle.height / 2;
      const r = obstacle.width / 2;
      // Pulsering för levande känsla
      const pulse = 1 + Math.sin(time * 3) * 0.15;
      return (
        <Group>
          {/* Yttre röd glöd */}
          <Circle cx={cx} cy={cy} r={(r + 10) * pulse} opacity={0.4}>
            <RadialGradient
              c={vec(cx, cy)}
              r={(r + 10) * pulse}
              colors={['#ef4444', '#dc2626', 'transparent']}
            />
          </Circle>
          {/* Monster-kropp */}
          <Circle cx={cx} cy={cy} r={r * pulse}>
            <RadialGradient
              c={vec(cx, cy - r * 0.3)}
              r={r * pulse * 1.2}
              colors={['#dc2626', '#991b1b', '#450a0a']}
            />
          </Circle>
          {/* Onda ögon */}
          <Circle cx={cx - r * 0.3} cy={cy - r * 0.2} r={r * 0.2} color="#ff0000" />
          <Circle cx={cx + r * 0.3} cy={cy - r * 0.2} r={r * 0.2} color="#ff0000" />
          <Circle cx={cx - r * 0.3} cy={cy - r * 0.2} r={r * 0.1} color="#ffffff" />
          <Circle cx={cx + r * 0.3} cy={cy - r * 0.2} r={r * 0.1} color="#ffffff" />
          {/* Elak mun */}
          <Rect
            x={cx - r * 0.4}
            y={cy + r * 0.2}
            width={r * 0.8}
            height={r * 0.2}
            color="#000000"
          />
          {/* Tänder */}
          <Rect x={cx - r * 0.3} y={cy + r * 0.2} width={r * 0.15} height={r * 0.15} color="#ffffff" />
          <Rect x={cx + r * 0.15} y={cy + r * 0.2} width={r * 0.15} height={r * 0.15} color="#ffffff" />
        </Group>
      );
    }

    case 'portal': {
      const cx = obstacleX + obstacle.width / 2;
      const cy = obstacleY + obstacle.height / 2;
      const r = obstacle.width / 2;
      // Roterande portal
      const rotation = time * 2;
      const portalColors = obstacle.portalId === 1 
        ? ['#3b82f6', '#1d4ed8', '#1e40af']
        : obstacle.portalId === 2
        ? ['#8b5cf6', '#7c3aed', '#6d28d9']
        : ['#10b981', '#059669', '#047857'];
      
      return (
        <Group>
          {/* Yttre virvlande glöd */}
          <Circle cx={cx} cy={cy} r={r + 15} opacity={0.4}>
            <RadialGradient
              c={vec(cx, cy)}
              r={r + 15}
              colors={[...portalColors, 'transparent']}
            />
          </Circle>
          {/* Portal-ring */}
          <Circle cx={cx} cy={cy} r={r}>
            <RadialGradient
              c={vec(cx, cy)}
              r={r}
              colors={[portalColors[0], portalColors[1], portalColors[2]]}
            />
          </Circle>
          {/* Inre virvlande effekt */}
          {[0, 1, 2, 3].map((i) => (
            <Circle
              key={i}
              cx={cx + Math.cos(rotation + i * Math.PI / 2) * r * 0.4}
              cy={cy + Math.sin(rotation + i * Math.PI / 2) * r * 0.4}
              r={r * 0.15}
              opacity={0.6}
              color={portalColors[0]}
            />
          ))}
          {/* Mörk mittpunkt */}
          <Circle cx={cx} cy={cy} r={r * 0.3} color="#000000" />
        </Group>
      );
    }

    case 'wind': {
      // Vindområde med pilar
      const windColors = {
        up: ['rgba(147, 197, 253, 0.15)', 'rgba(59, 130, 246, 0.25)'],
        down: ['rgba(147, 197, 253, 0.15)', 'rgba(59, 130, 246, 0.25)'],
        left: ['rgba(147, 197, 253, 0.15)', 'rgba(59, 130, 246, 0.25)'],
        right: ['rgba(147, 197, 253, 0.15)', 'rgba(59, 130, 246, 0.25)'],
      };
      
      const direction = obstacle.windDirection || 'right';
      const colors = windColors[direction];
      
      // Animerade vindstreck
      const offset = (time * 100) % 50;
      
      return (
        <Group>
          {/* Vindområde */}
          <Rect
            x={obstacleX}
            y={obstacleY}
            width={obstacle.width}
            height={obstacle.height}
          >
            <LinearGradient
              start={vec(obstacleX, obstacleY)}
              end={vec(obstacleX + obstacle.width, obstacleY + obstacle.height)}
              colors={colors}
            />
          </Rect>
          {/* Vindpilar */}
          {[0, 1, 2, 3].map((i) => {
            let x, y, rotation;
            switch (direction) {
              case 'up':
                x = obstacleX + 20 + i * 40 + (offset % 40);
                y = obstacleY + obstacle.height / 2;
                rotation = -90;
                break;
              case 'down':
                x = obstacleX + 20 + i * 40 + (offset % 40);
                y = obstacleY + obstacle.height / 2;
                rotation = 90;
                break;
              case 'left':
                x = obstacleX + obstacle.width / 2;
                y = obstacleY + 20 + i * 40 + (offset % 40);
                rotation = 180;
                break;
              default: // right
                x = obstacleX + obstacle.width / 2;
                y = obstacleY + 20 + i * 40 + (offset % 40);
                rotation = 0;
            }
            
            return (
              <Group key={i}>
                <Rect
                  x={x - 15}
                  y={y - 2}
                  width={20}
                  height={4}
                  color="rgba(59, 130, 246, 0.5)"
                />
                {/* Pilspets */}
                <Circle
                  cx={x + 5}
                  cy={y}
                  r={5}
                  color="rgba(59, 130, 246, 0.7)"
                />
              </Group>
            );
          })}
        </Group>
      );
    }

    case 'lava': {
      // Kokande lava med bubblor
      const pulse = Math.sin(time * 2) * 0.1 + 0.9;
      return (
        <Group>
          {/* Lava-bas */}
          <Rect
            x={obstacleX}
            y={obstacleY}
            width={obstacle.width}
            height={obstacle.height}
          >
            <LinearGradient
              start={vec(obstacleX, obstacleY)}
              end={vec(obstacleX, obstacleY + obstacle.height)}
              colors={['#f97316', '#ea580c', '#dc2626', '#991b1b']}
            />
          </Rect>
          {/* Glödande effekt */}
          <Rect
            x={obstacleX}
            y={obstacleY}
            width={obstacle.width}
            height={obstacle.height}
            opacity={0.3 * pulse}
          >
            <RadialGradient
              c={vec(obstacleX + obstacle.width / 2, obstacleY + obstacle.height / 2)}
              r={Math.max(obstacle.width, obstacle.height) / 2}
              colors={['#ffedd5', '#fdba74', 'transparent']}
            />
          </Rect>
          {/* Bubblor */}
          {[0, 1, 2].map((i) => {
            const bubbleX = obstacleX + 20 + i * (obstacle.width / 4) + Math.sin(time * 2 + i) * 10;
            const bubbleY = obstacleY + 10 + ((time * 30 + i * 20) % obstacle.height);
            return (
              <Circle
                key={i}
                cx={bubbleX}
                cy={bubbleY}
                r={5 + Math.sin(time * 3 + i) * 2}
                opacity={0.6}
              >
                <RadialGradient
                  c={vec(bubbleX, bubbleY)}
                  r={7}
                  colors={['#fef3c7', '#fcd34d', 'transparent']}
                />
              </Circle>
            );
          })}
        </Group>
      );
    }

    case 'spike': {
      // Farliga taggar
      const spikeCount = Math.floor(obstacle.width / 20);
      return (
        <Group>
          {/* Taggarnas bas */}
          <Rect
            x={obstacleX}
            y={obstacleY + obstacle.height * 0.6}
            width={obstacle.width}
            height={obstacle.height * 0.4}
          >
            <LinearGradient
              start={vec(obstacleX, obstacleY)}
              end={vec(obstacleX, obstacleY + obstacle.height)}
              colors={['#374151', '#1f2937']}
            />
          </Rect>
          {/* Taggar */}
          {Array.from({ length: spikeCount }).map((_, i) => {
            const x = obstacleX + i * 20 + 10;
            const y = obstacleY + obstacle.height * 0.6;
            const path = Skia.Path.Make();
            path.moveTo(x - 8, y);
            path.lineTo(x, y - obstacle.height * 0.6);
            path.lineTo(x + 8, y);
            path.close();
            
            return (
              <Group key={i}>
                <Path path={path}>
                  <LinearGradient
                    start={vec(x, y - obstacle.height * 0.6)}
                    end={vec(x, y)}
                    colors={['#d1d5db', '#6b7280', '#374151']}
                  />
                </Path>
              </Group>
            );
          })}
        </Group>
      );
    }

    case 'magnet': {
      const cx = obstacleX + obstacle.width / 2;
      const cy = obstacleY + obstacle.height / 2;
      const r = obstacle.width / 2;
      // Pulsering för magnetfält
      const pulse = 1 + Math.sin(time * 2) * 0.2;
      
      return (
        <Group>
          {/* Magnetfält (visar räckvidden) */}
          <Circle cx={cx} cy={cy} r={150 * pulse} opacity={0.08}>
            <RadialGradient
              c={vec(cx, cy)}
              r={150}
              colors={['#a855f7', '#9333ea', 'transparent']}
            />
          </Circle>
          {/* Inre magnetfält */}
          <Circle cx={cx} cy={cy} r={80 * pulse} opacity={0.15}>
            <RadialGradient
              c={vec(cx, cy)}
              r={80}
              colors={['#e879f9', '#c026d3', 'transparent']}
            />
          </Circle>
          {/* Magnet-kropp */}
          <Rect
            x={obstacleX}
            y={obstacleY}
            width={obstacle.width}
            height={obstacle.height}
          >
            <LinearGradient
              start={vec(obstacleX, obstacleY)}
              end={vec(obstacleX, obstacleY + obstacle.height)}
              colors={['#a855f7', '#9333ea', '#7e22ce']}
            />
          </Rect>
          {/* N och S */}
          <Rect x={obstacleX + 5} y={obstacleY + 5} width={obstacle.width - 10} height={obstacle.height / 2 - 5} color="#dc2626" />
          <Rect x={obstacleX + 5} y={obstacleY + obstacle.height / 2} width={obstacle.width - 10} height={obstacle.height / 2 - 5} color="#3b82f6" />
          {/* Glans */}
          <Circle cx={obstacleX + r * 0.5} cy={obstacleY + r * 0.5} r={r * 0.4} opacity={0.5}>
            <RadialGradient
              c={vec(obstacleX + r * 0.5, obstacleY + r * 0.5)}
              r={r * 0.4}
              colors={['rgba(255, 255, 255, 0.8)', 'transparent']}
            />
          </Circle>
        </Group>
      );
    }

    case 'ice': {
      return (
        <Group>
          {/* Is-yta med glans */}
          <Rect
            x={obstacleX}
            y={obstacleY}
            width={obstacle.width}
            height={obstacle.height}
          >
            <LinearGradient
              start={vec(obstacleX, obstacleY)}
              end={vec(obstacleX + obstacle.width, obstacleY + obstacle.height)}
              colors={['rgba(147, 197, 253, 0.4)', 'rgba(59, 130, 246, 0.3)', 'rgba(147, 197, 253, 0.4)']}
            />
          </Rect>
          {/* Highlight på isen */}
          <Rect
            x={obstacleX + 5}
            y={obstacleY + 5}
            width={obstacle.width * 0.3}
            height={obstacle.height * 0.2}
            opacity={0.6}
          >
            <LinearGradient
              start={vec(obstacleX, obstacleY)}
              end={vec(obstacleX + obstacle.width * 0.3, obstacleY + obstacle.height * 0.2)}
              colors={['rgba(255, 255, 255, 0.8)', 'transparent']}
            />
          </Rect>
        </Group>
      );
    }

    case 'wall':
    default: {
      return (
        <Group>
          {/* Vägg med 3D-effekt */}
          <Rect
            x={obstacleX}
            y={obstacleY}
            width={obstacle.width}
            height={obstacle.height}
          >
            <LinearGradient
              start={vec(obstacleX, obstacleY)}
              end={vec(obstacleX + obstacle.width, obstacleY + obstacle.height)}
              colors={['#64748b', '#475569', '#334155']}
            />
          </Rect>
          {/* Highlight på väggen */}
          <Rect
            x={obstacleX + 2}
            y={obstacleY + 2}
            width={obstacle.width - 4}
            height={4}
            opacity={0.5}
          >
            <LinearGradient
              start={vec(obstacleX, obstacleY)}
              end={vec(obstacleX + obstacle.width, obstacleY)}
              colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
            />
          </Rect>
        </Group>
      );
    }
  }
}
