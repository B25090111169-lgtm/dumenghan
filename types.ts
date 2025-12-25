export interface TreeSettings {
  rotationSpeed: number;
  particleCount: number;
  glowIntensity: number;
  treeColor: string;
}

export interface Particle3D {
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  originalX: number;
  originalZ: number;
  yOffset: number; // For floating animation
  speed: number;
  hue: number;
  // New fields for complex orbital animation
  initialAngle: number;
  orbitRadius: number;
  isBase: boolean; // To distinguish render logic
  isTopper: boolean; // To distinguish the heart topper
  isOrnament: boolean; // New field for falling ornaments
  occlusion?: number; // Ambient occlusion factor (0-1)
}