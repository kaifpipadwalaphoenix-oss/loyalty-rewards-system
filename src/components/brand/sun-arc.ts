/**
 * Sun-Arc geometry helper for MembershipCard and tier progression.
 * Models a daylight arc from dawn (180deg / 0%) to dusk (0deg / 100%).
 */

export interface SunArcConfig {
  cx: number;
  cy: number;
  radius: number;
  startAngleDeg?: number; // default 180 (left)
  endAngleDeg?: number; // default 0 (right)
}

export interface SunArcResult {
  pathD: string;
  activePathD: string;
  dot: { x: number; y: number };
  percentage: number;
  angleDeg: number;
}

export function computeSunArc(
  progressPct: number,
  config: SunArcConfig = { cx: 200, cy: 70, radius: 150 }
): SunArcResult {
  const { cx, cy, radius, startAngleDeg = 180, endAngleDeg = 0 } = config;
  
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, isNaN(progressPct) ? 0 : progressPct));
  
  // Angle sweeps from startAngleDeg (180deg) to endAngleDeg (0deg)
  const angleSweep = endAngleDeg - startAngleDeg; // -180
  const currentAngleDeg = startAngleDeg + (angleSweep * clampedProgress) / 100;
  
  // Convert angles to radians
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;
  const currentRad = (currentAngleDeg * Math.PI) / 180;
  
  // Calculate endpoint coordinates
  const startX = Number((cx + radius * Math.cos(startRad)).toFixed(2));
  const startY = Number((cy - radius * Math.sin(startRad)).toFixed(2));
  const endX = Number((cx + radius * Math.cos(endRad)).toFixed(2));
  const endY = Number((cy - radius * Math.sin(endRad)).toFixed(2));
  
  // Dot coordinates along the arc
  const dotX = Number((cx + radius * Math.cos(currentRad)).toFixed(2));
  const dotY = Number((cy - radius * Math.sin(currentRad)).toFixed(2));
  
  // Full background track arc (largeArcFlag = 0, sweepFlag = 1 for upper semicircle)
  const pathD = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
  
  // Active progression path arc from start to dot
  const activePathD = clampedProgress <= 0
    ? `M ${startX} ${startY}`
    : `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${dotX} ${dotY}`;

  return {
    pathD,
    activePathD,
    dot: { x: dotX, y: dotY },
    percentage: clampedProgress,
    angleDeg: Number(currentAngleDeg.toFixed(2)),
  };
}
