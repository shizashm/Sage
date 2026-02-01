import { cn } from '@/lib/utils';

interface GardenIllustrationProps {
  growthStage: number; // 0+ representing growth stages (no limit)
  className?: string;
}

// Individual flower component
function Flower({ 
  x, 
  y, 
  size = 1, 
  petalColor, 
  centerColor,
  opacity = 1 
}: { 
  x: number; 
  y: number; 
  size?: number; 
  petalColor: string;
  centerColor: string;
  opacity?: number;
}) {
  const petalRx = 5 * size;
  const petalRy = 7 * size;
  const centerR = 4 * size;
  
  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacity}>
      <ellipse cx="0" cy={-petalRy * 1.2} rx={petalRx} ry={petalRy} fill={petalColor} opacity="0.8" />
      <ellipse cx={petalRx * 1.4} cy={-petalRy * 0.3} rx={petalRx} ry={petalRy} fill={petalColor} opacity="0.75" transform="rotate(72)" />
      <ellipse cx={petalRx * 0.9} cy={petalRy * 0.9} rx={petalRx} ry={petalRy} fill={petalColor} opacity="0.7" transform="rotate(144)" />
      <ellipse cx={-petalRx * 0.9} cy={petalRy * 0.9} rx={petalRx} ry={petalRy} fill={petalColor} opacity="0.7" transform="rotate(216)" />
      <ellipse cx={-petalRx * 1.4} cy={-petalRy * 0.3} rx={petalRx} ry={petalRy} fill={petalColor} opacity="0.75" transform="rotate(288)" />
      <circle cx="0" cy="0" r={centerR} fill={centerColor} />
      <circle cx="0" cy="0" r={centerR * 0.5} fill={centerColor} opacity="0.6" />
    </g>
  );
}

// Individual potted plant component
function PottedPlant({
  x,
  y,
  plantStage, // 0-10 for this plant
  scale = 1,
  colors
}: {
  x: number;
  y: number;
  plantStage: number;
  scale?: number;
  colors: {
    stem: string;
    leaf: string;
    leafDark: string;
    petalPink: string;
    petalLavender: string;
    petalYellow: string;
    center: string;
    pot: string;
    potDark: string;
    soil: string;
  };
}) {
  const stage = Math.min(Math.max(plantStage, 0), 10);
  
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Pot */}
      <ellipse cx="0" cy="0" rx="28" ry="5" fill={colors.pot} />
      <path d="M-28 0 L-23 22 Q0 25 23 22 L28 0 Z" fill={colors.pot} />
      <path d="M-28 0 L-23 22 Q-10 24 0 24 L0 0 Z" fill={colors.potDark} opacity="0.3" />
      <ellipse cx="0" cy="0" rx="23" ry="3" fill={colors.soil} opacity="0.6" />
      
      {/* Stem and growth */}
      {stage >= 1 && (
        <g className="animate-in fade-in duration-1000">
          <path
            d={`M0 -2 C0 ${-8 - stage * 4} 0 ${-15 - stage * 5} 0 ${-20 - stage * 6}`}
            stroke={colors.stem}
            fill="none"
            strokeWidth={2 + stage * 0.15}
            strokeLinecap="round"
          />
        </g>
      )}
      
      {/* Leaves - grow with stage */}
      {stage >= 1 && (
        <g className="animate-in fade-in duration-1000">
          <ellipse 
            cx={-6 - stage * 0.5} 
            cy={-8 - stage * 2} 
            rx={5 + stage * 0.5} 
            ry={3 + stage * 0.2} 
            fill={colors.leaf} 
            opacity="0.75" 
            transform={`rotate(-30 ${-6 - stage * 0.5} ${-8 - stage * 2})`} 
          />
          <ellipse 
            cx={6 + stage * 0.5} 
            cy={-10 - stage * 2} 
            rx={4 + stage * 0.4} 
            ry={2.5 + stage * 0.15} 
            fill={colors.leafDark} 
            opacity="0.7" 
            transform={`rotate(30 ${6 + stage * 0.5} ${-10 - stage * 2})`} 
          />
        </g>
      )}
      
      {stage >= 3 && (
        <g className="animate-in fade-in duration-1000">
          <ellipse 
            cx={-8} 
            cy={-25 - stage * 3} 
            rx={7} 
            ry={3.5} 
            fill={colors.leaf} 
            opacity="0.7" 
            transform={`rotate(-35 -8 ${-25 - stage * 3})`} 
          />
          <ellipse 
            cx={8} 
            cy={-28 - stage * 3} 
            rx={6} 
            ry={3} 
            fill={colors.leafDark} 
            opacity="0.65" 
            transform={`rotate(35 8 ${-28 - stage * 3})`} 
          />
        </g>
      )}
      
      {/* Side stems for later stages */}
      {stage >= 5 && (
        <g className="animate-in fade-in duration-1000">
          <path
            d={`M0 ${-30 - stage * 2} C-8 ${-35 - stage * 2} -15 ${-38 - stage * 2} -20 ${-42 - stage * 2}`}
            stroke={colors.stem}
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d={`M0 ${-32 - stage * 2} C8 ${-37 - stage * 2} 15 ${-40 - stage * 2} 20 ${-44 - stage * 2}`}
            stroke={colors.stem}
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      )}
      
      {/* Main flower */}
      {stage >= 6 && (
        <Flower 
          x={0} 
          y={-28 - stage * 6} 
          size={0.7 + stage * 0.03}
          petalColor={colors.petalPink}
          centerColor={colors.center}
        />
      )}
      
      {/* Side flowers */}
      {stage >= 8 && (
        <Flower 
          x={-22} 
          y={-45 - stage * 2} 
          size={0.5}
          petalColor={colors.petalLavender}
          centerColor={colors.center}
          opacity={0.9}
        />
      )}
      
      {stage >= 9 && (
        <Flower 
          x={22} 
          y={-48 - stage * 2} 
          size={0.45}
          petalColor={colors.petalYellow}
          centerColor={colors.center}
          opacity={0.85}
        />
      )}
    </g>
  );
}

export function GardenIllustration({ growthStage, className }: GardenIllustrationProps) {
  // Soft, calming color palette
  const colors = {
    stem: '#7A9A7E',
    stemDark: '#5C7A60',
    leaf: '#9DB4A0',
    leafDark: '#7A9A7E',
    petalPink: '#E8C4C4',
    petalLavender: '#C9C4E8',
    petalYellow: '#F0E5C8',
    center: '#E8D8A0',
    pot: '#C9B89A',
    potDark: '#B5A080',
    soil: '#8B7355',
    ground: '#E8E4DF',
  };

  // Calculate how many plants and their individual stages
  const plantsData = [];
  let remainingStage = growthStage;
  
  // First plant
  const plant1Stage = Math.min(remainingStage, 10);
  plantsData.push({ stage: plant1Stage, position: 0 });
  remainingStage -= 10;
  
  // Second plant (appears after first is done)
  if (remainingStage > 0) {
    const plant2Stage = Math.min(remainingStage, 10);
    plantsData.push({ stage: plant2Stage, position: 1 });
    remainingStage -= 10;
  }
  
  // Third plant
  if (remainingStage > 0) {
    const plant3Stage = Math.min(remainingStage, 10);
    plantsData.push({ stage: plant3Stage, position: 2 });
    remainingStage -= 10;
  }
  
  // Fourth plant (center back)
  if (remainingStage > 0) {
    const plant4Stage = Math.min(remainingStage, 10);
    plantsData.push({ stage: plant4Stage, position: 3 });
    remainingStage -= 10;
  }
  
  // Fifth plant
  if (remainingStage > 0) {
    const plant5Stage = Math.min(remainingStage, 10);
    plantsData.push({ stage: plant5Stage, position: 4 });
  }

  // Determine layout based on number of plants
  const plantCount = plantsData.length;
  const isSinglePlant = plantCount === 1;
  const isGarden = plantCount >= 3;
  
  // Dynamic viewBox based on garden size
  const viewBoxWidth = isGarden ? 320 : (plantCount === 2 ? 260 : 200);
  const viewBoxHeight = isGarden ? 200 : 180;
  
  // Plant positions
  const getPlantPosition = (position: number, total: number) => {
    if (total === 1) return { x: 100, y: 150, scale: 1 };
    if (total === 2) {
      const positions = [
        { x: 75, y: 150, scale: 0.85 },
        { x: 185, y: 150, scale: 0.85 },
      ];
      return positions[position];
    }
    if (total === 3) {
      const positions = [
        { x: 60, y: 155, scale: 0.75 },
        { x: 160, y: 150, scale: 0.8 },
        { x: 260, y: 155, scale: 0.75 },
      ];
      return positions[position];
    }
    if (total === 4) {
      const positions = [
        { x: 55, y: 160, scale: 0.7 },
        { x: 140, y: 155, scale: 0.75 },
        { x: 225, y: 160, scale: 0.7 },
        { x: 160, y: 130, scale: 0.65 }, // Back center
      ];
      return positions[position];
    }
    // 5 plants - full garden
    const positions = [
      { x: 50, y: 165, scale: 0.65 },
      { x: 120, y: 158, scale: 0.7 },
      { x: 200, y: 155, scale: 0.75 },
      { x: 270, y: 165, scale: 0.65 },
      { x: 160, y: 125, scale: 0.6 }, // Back center
    ];
    return positions[position];
  };

  return (
    <div className={cn("relative w-full max-w-sm mx-auto", className)}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto"
        aria-label="Your growing garden"
      >
        {/* Ground for garden mode */}
        {isGarden && (
          <g className="animate-in fade-in duration-1000">
            <ellipse 
              cx={viewBoxWidth / 2} 
              cy={viewBoxHeight - 15} 
              rx={viewBoxWidth * 0.45} 
              ry={12} 
              fill={colors.ground} 
              opacity="0.5" 
            />
          </g>
        )}
        
        {/* Render plants from back to front */}
        {plantsData
          .map((plant, index) => ({
            ...plant,
            ...getPlantPosition(plant.position, plantCount),
            index
          }))
          .sort((a, b) => a.y - b.y) // Sort by y for proper layering
          .map((plant) => (
            <PottedPlant
              key={plant.index}
              x={plant.x}
              y={plant.y}
              plantStage={plant.stage}
              scale={plant.scale}
              colors={colors}
            />
          ))
        }
        
        {/* Decorative elements for full garden */}
        {plantCount >= 5 && plantsData[4]?.stage >= 5 && (
          <g className="animate-in fade-in duration-1000">
            {/* Small butterflies or decorative dots */}
            <circle cx={80} cy={60} r={2} fill={colors.petalPink} opacity="0.5" />
            <circle cx={240} cy={50} r={1.5} fill={colors.petalLavender} opacity="0.4" />
            <circle cx={160} cy={40} r={2} fill={colors.petalYellow} opacity="0.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
