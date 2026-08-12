export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'hole' | 'ice' | 'boost' | 'monster' | 'portal' | 'wind' | 'spike' | 'lava' | 'magnet';
  // För rörliga hinder
  movementType?: 'horizontal' | 'vertical' | 'circular' | 'patrol' | 'chase' | 'flying';
  speed?: number;
  range?: number;
  // Monster-typ
  monsterType?: 'basic' | 'chaser' | 'flyer' | 'teleporter' | 'shooter' | 'wall_crawler';
  // För portaler
  targetX?: number;
  targetY?: number;
  portalId?: number;
  // För vindkraft
  windDirection?: 'up' | 'down' | 'left' | 'right';
  windStrength?: number;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: 'Lätt' | 'Medel' | 'Svår' | 'Expert';
  startX: number;
  startY: number;
  goalX: number;
  goalY: number;
  obstacles: Obstacle[];
  ballRadius: number;
  friction: number;
}

export const levels: Level[] = [
  {
    id: '1',
    name: 'Första steget',
    description: 'En enkel rak bana för att lära sig styrningen',
    difficulty: 'Lätt',
    startX: 50,
    startY: 100,
    goalX: 50,
    goalY: 500,
    ballRadius: 20,
    friction: 0.95,
    obstacles: [
      // Väggar på sidorna
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
    ],
  },
  {
    id: '2',
    name: 'Enkel slalom',
    description: 'Navigera mellan väggarna',
    difficulty: 'Lätt',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 600,
    ballRadius: 20,
    friction: 0.95,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      // Mellanväggar
      { x: 20, y: 200, width: 250, height: 20, type: 'wall' },
      { x: 130, y: 350, width: 250, height: 20, type: 'wall' },
      { x: 20, y: 500, width: 250, height: 20, type: 'wall' },
    ],
  },
  {
    id: '3',
    name: 'Hålen',
    description: 'Undvik hålen i banan - de fäller kulan!',
    difficulty: 'Medel',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 600,
    ballRadius: 20,
    friction: 0.95,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      // Hål
      { x: 150, y: 200, width: 60, height: 60, type: 'hole' },
      { x: 250, y: 300, width: 60, height: 60, type: 'hole' },
      { x: 100, y: 400, width: 60, height: 60, type: 'hole' },
      { x: 200, y: 500, width: 60, height: 60, type: 'hole' },
    ],
  },
  {
    id: '4',
    name: 'Labyrinten',
    description: 'Hitta vägen genom labyrinten',
    difficulty: 'Medel',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 650,
    ballRadius: 18,
    friction: 0.95,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      // Labyrint-väggar
      { x: 20, y: 150, width: 280, height: 20, type: 'wall' },
      { x: 280, y: 170, width: 20, height: 150, type: 'wall' },
      { x: 100, y: 300, width: 180, height: 20, type: 'wall' },
      { x: 100, y: 320, width: 20, height: 150, type: 'wall' },
      { x: 120, y: 450, width: 260, height: 20, type: 'wall' },
      { x: 20, y: 550, width: 260, height: 20, type: 'wall' },
    ],
  },
  {
    id: '5',
    name: 'Ishallen',
    description: 'Halka på is - mycket lägre friktion!',
    difficulty: 'Svår',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 600,
    ballRadius: 20,
    friction: 0.98,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      // Is-områden (visuellt)
      { x: 50, y: 200, width: 300, height: 150, type: 'ice' },
      { x: 50, y: 450, width: 300, height: 100, type: 'ice' },
      // Hinder på isen
      { x: 20, y: 250, width: 200, height: 20, type: 'wall' },
      { x: 180, y: 300, width: 200, height: 20, type: 'wall' },
    ],
  },
  {
    id: '6',
    name: 'Minerad mark',
    description: 'Många hål och smala passager',
    difficulty: 'Svår',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 650,
    ballRadius: 18,
    friction: 0.94,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      // Många små hål
      { x: 80, y: 180, width: 50, height: 50, type: 'hole' },
      { x: 200, y: 180, width: 50, height: 50, type: 'hole' },
      { x: 320, y: 180, width: 50, height: 50, type: 'hole' },
      { x: 140, y: 280, width: 50, height: 50, type: 'hole' },
      { x: 260, y: 280, width: 50, height: 50, type: 'hole' },
      { x: 80, y: 380, width: 50, height: 50, type: 'hole' },
      { x: 200, y: 380, width: 50, height: 50, type: 'hole' },
      { x: 320, y: 380, width: 50, height: 50, type: 'hole' },
      { x: 140, y: 480, width: 50, height: 50, type: 'hole' },
      { x: 260, y: 480, width: 50, height: 50, type: 'hole' },
      { x: 200, y: 580, width: 50, height: 50, type: 'hole' },
    ],
  },
  {
    id: '7',
    name: 'Expert-utmaningen',
    description: 'Kombinerar allt - is, hål, och trång labyrint',
    difficulty: 'Expert',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 650,
    ballRadius: 16,
    friction: 0.97,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      // Is-sektion
      { x: 50, y: 150, width: 300, height: 120, type: 'ice' },
      { x: 150, y: 200, width: 50, height: 50, type: 'hole' },
      { x: 250, y: 200, width: 50, height: 50, type: 'hole' },
      // Trång labyrint
      { x: 20, y: 300, width: 280, height: 20, type: 'wall' },
      { x: 280, y: 320, width: 20, height: 100, type: 'wall' },
      { x: 120, y: 400, width: 160, height: 20, type: 'wall' },
      { x: 120, y: 420, width: 20, height: 100, type: 'wall' },
      // Hål i slutet
      { x: 200, y: 500, width: 60, height: 60, type: 'hole' },
      { x: 280, y: 570, width: 60, height: 60, type: 'hole' },
    ],
  },
  {
    id: '8',
    name: 'Den omöjliga',
    description: 'Extremt svår bana för de mest skickliga',
    difficulty: 'Expert',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 650,
    ballRadius: 15,
    friction: 0.98,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      // Mycket trång och komplex bana
      { x: 20, y: 150, width: 300, height: 20, type: 'wall' },
      { x: 300, y: 170, width: 20, height: 80, type: 'wall' },
      { x: 100, y: 230, width: 200, height: 20, type: 'wall' },
      { x: 100, y: 250, width: 20, height: 80, type: 'wall' },
      { x: 120, y: 310, width: 260, height: 20, type: 'wall' },
      
      // Is med hål
      { x: 50, y: 350, width: 300, height: 100, type: 'ice' },
      { x: 120, y: 370, width: 50, height: 50, type: 'hole' },
      { x: 230, y: 390, width: 50, height: 50, type: 'hole' },
      
      // Slutlabyrint
      { x: 20, y: 470, width: 200, height: 20, type: 'wall' },
      { x: 200, y: 490, width: 20, height: 80, type: 'wall' },
      { x: 80, y: 550, width: 120, height: 20, type: 'wall' },
      { x: 270, y: 600, width: 60, height: 60, type: 'hole' },
    ],
  },
  {
    id: '9',
    name: '👹 Monsterjakt',
    description: 'Undvik monster som patrullerar banan!',
    difficulty: 'Svår',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 650,
    ballRadius: 18,
    friction: 0.95,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      
      // Monster som rör sig horisontellt
      { x: 100, y: 200, width: 40, height: 40, type: 'monster', movementType: 'horizontal', speed: 80, range: 200 },
      { x: 250, y: 350, width: 40, height: 40, type: 'monster', movementType: 'horizontal', speed: 100, range: 150 },
      
      // Monster som rör sig vertikalt
      { x: 200, y: 450, width: 40, height: 40, type: 'monster', movementType: 'vertical', speed: 120, range: 180 },
      
      // Väggar för att göra det svårare
      { x: 20, y: 250, width: 150, height: 20, type: 'wall' },
      { x: 230, y: 400, width: 150, height: 20, type: 'wall' },
      { x: 80, y: 550, width: 180, height: 20, type: 'wall' },
      
      // Några hål
      { x: 300, y: 280, width: 50, height: 50, type: 'hole' },
      { x: 100, y: 500, width: 50, height: 50, type: 'hole' },
    ],
  },
  {
    id: '10',
    name: '🌪️ Vindtunneln',
    description: 'Stark vind påverkar kulans rörelse!',
    difficulty: 'Medel',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 650,
    ballRadius: 18,
    friction: 0.95,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      
      // Vindzoner
      { x: 20, y: 180, width: 180, height: 120, type: 'wind', windDirection: 'right', windStrength: 40 },
      { x: 200, y: 320, width: 180, height: 120, type: 'wind', windDirection: 'left', windStrength: 50 },
      { x: 100, y: 480, width: 200, height: 120, type: 'wind', windDirection: 'up', windStrength: 60 },
      
      // Väggar
      { x: 20, y: 150, width: 250, height: 20, type: 'wall' },
      { x: 130, y: 300, width: 250, height: 20, type: 'wall' },
      { x: 20, y: 460, width: 200, height: 20, type: 'wall' },
      
      // Hål
      { x: 280, y: 220, width: 50, height: 50, type: 'hole' },
      { x: 80, y: 380, width: 50, height: 50, type: 'hole' },
    ],
  },
  {
    id: '11',
    name: '🌀 Portal-dimansen',
    description: 'Teleportera genom mystiska portaler!',
    difficulty: 'Medel',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 650,
    ballRadius: 18,
    friction: 0.95,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      
      // Portal 1 (blå) - teleporterar till portal 2
      { x: 100, y: 220, width: 50, height: 50, type: 'portal', portalId: 1, targetX: 300, targetY: 400 },
      // Portal 2 (lila) - teleporterar till portal 3
      { x: 300, y: 400, width: 50, height: 50, type: 'portal', portalId: 2, targetX: 80, targetY: 520 },
      // Portal 3 (grön) - teleporterar till slutet
      { x: 80, y: 520, width: 50, height: 50, type: 'portal', portalId: 3, targetX: 300, targetY: 600 },
      
      // Väggar som tvingar genom portaler
      { x: 20, y: 300, width: 360, height: 20, type: 'wall' },
      { x: 20, y: 450, width: 360, height: 20, type: 'wall' },
      { x: 20, y: 580, width: 250, height: 20, type: 'wall' },
      
      // Hål
      { x: 200, y: 340, width: 50, height: 50, type: 'hole' },
      { x: 250, y: 500, width: 50, height: 50, type: 'hole' },
    ],
  },
  {
    id: '12',
    name: '🔥 Lava-zonen',
    description: 'Kokande lava och taggar överallt!',
    difficulty: 'Svår',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 650,
    ballRadius: 17,
    friction: 0.94,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      
      // Lava-pooler (långsam död)
      { x: 50, y: 200, width: 120, height: 80, type: 'lava' },
      { x: 230, y: 320, width: 140, height: 90, type: 'lava' },
      { x: 80, y: 500, width: 160, height: 100, type: 'lava' },
      
      // Taggar på väggar
      { x: 20, y: 250, width: 180, height: 15, type: 'spike' },
      { x: 200, y: 400, width: 180, height: 15, type: 'spike' },
      { x: 50, y: 580, width: 200, height: 15, type: 'spike' },
      
      // Vanliga hål
      { x: 300, y: 220, width: 50, height: 50, type: 'hole' },
      { x: 120, y: 430, width: 50, height: 50, type: 'hole' },
      
      // Is för variation
      { x: 250, y: 480, width: 100, height: 60, type: 'ice' },
    ],
  },
  {
    id: '13',
    name: '🧲 Magnetisk kaos',
    description: 'Magneter drar och stöter bort kulan!',
    difficulty: 'Expert',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 650,
    ballRadius: 16,
    friction: 0.96,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      
      // Magneter som drar till sig (attraherande)
      { x: 150, y: 220, width: 50, height: 50, type: 'magnet', windStrength: 80 },
      { x: 280, y: 400, width: 50, height: 50, type: 'magnet', windStrength: 100 },
      { x: 120, y: 550, width: 50, height: 50, type: 'magnet', windStrength: 90 },
      
      // Rörligt monster
      { x: 200, y: 300, width: 40, height: 40, type: 'monster', movementType: 'circular', speed: 60, range: 80 },
      
      // Hål nära magneterna
      { x: 230, y: 220, width: 50, height: 50, type: 'hole' },
      { x: 180, y: 400, width: 50, height: 50, type: 'hole' },
      { x: 220, y: 550, width: 50, height: 50, type: 'hole' },
      
      // Väggar
      { x: 20, y: 180, width: 200, height: 15, type: 'wall' },
      { x: 180, y: 350, width: 200, height: 15, type: 'wall' },
      { x: 50, y: 500, width: 150, height: 15, type: 'wall' },
      
      // Lava
      { x: 260, y: 480, width: 100, height: 70, type: 'lava' },
    ],
  },
  {
    id: '14',
    name: '💀 Boss-banan',
    description: 'Allt på en gång - ultimat utmaning!',
    difficulty: 'Expert',
    startX: 50,
    startY: 100,
    goalX: 350,
    goalY: 650,
    ballRadius: 15,
    friction: 0.97,
    obstacles: [
      { x: 0, y: 0, width: 20, height: 700, type: 'wall' },
      { x: 380, y: 0, width: 20, height: 700, type: 'wall' },
      
      // Monster patrullering
      { x: 100, y: 180, width: 35, height: 35, type: 'monster', movementType: 'horizontal', speed: 100, range: 180 },
      { x: 280, y: 300, width: 35, height: 35, type: 'monster', movementType: 'vertical', speed: 90, range: 140 },
      { x: 150, y: 480, width: 35, height: 35, type: 'monster', movementType: 'circular', speed: 70, range: 60 },
      
      // Portal
      { x: 80, y: 250, width: 45, height: 45, type: 'portal', portalId: 1, targetX: 300, targetY: 520 },
      { x: 300, y: 520, width: 45, height: 45, type: 'portal', portalId: 2, targetX: 150, targetY: 600 },
      
      // Vind
      { x: 150, y: 350, width: 150, height: 100, type: 'wind', windDirection: 'right', windStrength: 70 },
      
      // Lava
      { x: 50, y: 420, width: 100, height: 60, type: 'lava' },
      { x: 250, y: 580, width: 100, height: 60, type: 'lava' },
      
      // Magnet
      { x: 200, y: 400, width: 45, height: 45, type: 'magnet', windStrength: 85 },
      
      // Hål och taggar
      { x: 280, y: 210, width: 50, height: 50, type: 'hole' },
      { x: 120, y: 550, width: 50, height: 50, type: 'hole' },
      { x: 20, y: 280, width: 180, height: 12, type: 'spike' },
      
      // Is för extra kaos
      { x: 180, y: 450, width: 120, height: 50, type: 'ice' },
    ],
  },
];
