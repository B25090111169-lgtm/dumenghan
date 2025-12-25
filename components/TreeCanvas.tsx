import React, { useEffect, useRef } from 'react';
import { TreeSettings, Particle3D } from '../types';

interface TreeCanvasProps {
  settings: TreeSettings;
}

const TreeCanvas: React.FC<TreeCanvasProps> = ({ settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowCanvasRef = useRef<HTMLCanvasElement>(null); // Separate canvas for snow
  
  const particlesRef = useRef<Particle3D[]>([]);
  const starsRef = useRef<Particle3D[]>([]);
  
  const frameIdRef = useRef<number>(0);
  const snowFrameIdRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

  // Helper to create tree geometry
  const initParticles = (width: number, height: number) => {
    const particles: Particle3D[] = [];
    const stars: Particle3D[] = [];
    
    // Dimensions
    // Scaled up by ~1.3x (0.75 -> 0.95)
    const treeHeight = Math.min(width, height) * 0.95; 
    // Increased radius ratio from 0.6 to 0.9 to make the tree significantly wider
    const maxTreeRadius = treeHeight * 0.9; 
    const treeBottomY = treeHeight / 2 + 60; 
    const treeTopY = treeBottomY - treeHeight;

    // --- BACKGROUND STARS ---
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
      const spreadX = width * 2.5;
      const spreadY = height * 2.5;
      const zDepth = 1000 + Math.random() * 2000; 
      
      stars.push({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: zDepth,
        radius: Math.random() * 1.5 + 0.5,
        color: `hsla(330, 100%, 98%, ${Math.random() * 0.5 + 0.2})`,
        originalX: 0, 
        originalZ: 0,
        yOffset: 0,
        speed: (Math.random() - 0.5) * 0.1, 
        hue: 0,
        initialAngle: Math.random() * Math.PI * 2, 
        orbitRadius: 0,
        isBase: false,
        isTopper: false,
        isOrnament: false
      });
    }

    // --- COLOR PALETTE HELPER ---
    const getColor = (type: 'tree' | 'base' | 'topper' | 'ornament') => {
        let h = 0, s = '100%', l = '50%', a = 1;
        
        if (type === 'ornament') {
             const isGold = Math.random() > 0.6;
             return isGold ? `hsla(45, 100%, 70%, 1)` : `hsla(0, 0%, 100%, 1)`;
        }

        if (settings.treeColor === 'pink-gold') {
            const r = Math.random();
            if (type === 'topper') {
                 return `hsla(340, 100%, 95%, 1)`;
            }
            h = 320 + Math.random() * 30;
            if (r > 0.8) {
                s = '100%'; l = '97%'; 
            } else if (r > 0.4) {
                s = '90%'; l = '88%';
            } else {
                s = '85%'; l = '80%';
            }
        } else if (settings.treeColor === 'gold') {
            const r = Math.random();
            h = 45 + Math.random() * 10;
            s = '100%';
            l = r > 0.8 ? '95%' : '80%';
        } else if (settings.treeColor === 'green') {
            const r = Math.random();
            h = 140 + Math.random() * 30;
            s = '80%';
            l = r > 0.9 ? '95%' : '70%'; 
        } else { // Rainbow
            h = Math.random() * 360;
            s = '90%';
            l = '80%'; 
        }
        return `hsla(${h}, ${s}, ${l}, ${a})`;
    };

    // 1. TREE BODY
    const treeParticleCount = Math.floor(settings.particleCount * 0.65);
    const layers = 16; // More distinct layers for realism
    
    for (let i = 0; i < treeParticleCount; i++) {
        const t = i / treeParticleCount;
        // Non-linear height distribution for better density at bottom
        const hNorm = Math.pow(t, 0.8); 
        const yBase = treeBottomY - (hNorm * treeHeight);
        
        // Main shape: slightly convex cone (fatter at bottom)
        const coneEnvelope = maxTreeRadius * (1 - hNorm * 0.92);

        // Vertical Layering (Branches stacking up)
        const layerPhase = hNorm * layers * Math.PI * 2;
        // Deep sine wave for clear branch tiers
        const layerModulation = 0.75 + 0.25 * Math.sin(layerPhase); 

        // Radial lobing (Branches sticking out sideways)
        // Golden angle for distribution
        const angle = i * 2.39996 + (hNorm * Math.PI * 2); // Spiral up
        
        // Number of lobes/branches around the trunk varies with height
        // 7 at bottom, 3 at top
        const lobeCount = 4 + Math.floor((1 - hNorm) * 4); 
        
        // Twist the lobes slightly up the tree
        const lobePhase = angle * lobeCount + hNorm * 5;
        // Add some Perlin-like noise to the lobes so they aren't perfect
        const radialModulation = 0.85 + 0.15 * Math.cos(lobePhase) + (Math.random() - 0.5) * 0.1;

        // Combine modulations
        const maxR = coneEnvelope * layerModulation * radialModulation;

        // Radial distribution
        // Bias particles towards the surface for defined branch tips
        // 80% surface (defining the shape), 20% inner volume
        const isSurface = Math.random() > 0.2;
        let rScale = 0;
        if (isSurface) {
            // Surface texture: Clustered near the tips
            rScale = 0.75 + 0.25 * Math.pow(Math.random(), 0.5);
        } else {
            // Inner volume: Fills the gaps
            rScale = Math.random() * 0.75;
        }
        
        const r = maxR * rScale;

        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        
        // Droop: tips drop down heavily due to "gravity"
        // Droop increases with radius
        const droopStrength = 45; 
        const droop = (r / maxTreeRadius) * droopStrength;
        
        // Vertical noise to fluff up the branches
        const yNoise = (Math.random() - 0.5) * 8; 
        const y = yBase + droop + yNoise;

        particles.push({
            x, y, z,
            radius: Math.random() * 2 + 0.8,
            color: getColor('tree'),
            originalX: x,
            originalZ: z,
            yOffset: y, 
            speed: 0,
            hue: 0,
            initialAngle: angle,
            orbitRadius: r,
            isBase: false,
            isTopper: false,
            isOrnament: false
        });
    }

    // 2. BASE GALAXY
    const baseParticleCount = Math.floor(settings.particleCount * 0.30);
    const armCount = 3;
    const baseParticlesForOcclusion: Particle3D[] = [];
    
    for (let i = 0; i < baseParticleCount; i++) {
        const t = i / baseParticleCount; 
        const turnFactor = 8 * Math.PI;
        const angleOffset = (i % armCount) * (Math.PI * 2 / armCount);
        const theta = t * turnFactor;
        
        // Adjust spiral radius to match new tree width
        const spiralRadius = maxTreeRadius * 0.4 + (t * width * 0.8);
        const currentAngle = theta + angleOffset;
        const armWidth = 20 + t * 100;
        const spreadR = (Math.random() - 0.5) * armWidth;
        const r = spiralRadius + spreadR;
        
        const x = Math.cos(currentAngle) * r;
        const z = Math.sin(currentAngle) * r;
        const y = treeBottomY + 25 + (Math.random() * 4); 

        const p: Particle3D = {
            x, y, z,
            radius: Math.random() * 2 + 1,
            color: getColor('base'),
            originalX: x,
            originalZ: z,
            yOffset: y, 
            speed: 0.0001 + Math.random() * 0.0002, 
            hue: 0,
            initialAngle: Math.atan2(z, x),
            orbitRadius: Math.sqrt(x*x + z*z),
            isBase: true,
            isTopper: false,
            isOrnament: false,
            occlusion: 0
        };
        particles.push(p);
        baseParticlesForOcclusion.push(p);
    }

    // Calculate Ambient Occlusion for Base Particles
    // Simple O(N^2) check for nearby neighbors to darken dense areas
    const occlusionRadiusSq = 25 * 25; // Check within 25px
    for (let i = 0; i < baseParticlesForOcclusion.length; i++) {
        const p1 = baseParticlesForOcclusion[i];
        let density = 0;
        for (let j = 0; j < baseParticlesForOcclusion.length; j++) {
            if (i === j) continue;
            const p2 = baseParticlesForOcclusion[j];
            const dx = p1.originalX - p2.originalX;
            const dz = p1.originalZ - p2.originalZ; // Mostly planar distribution matters
            if (dx*dx + dz*dz < occlusionRadiusSq) {
                density++;
            }
        }
        // Normalize density to an opacity factor (0.0 - 0.5)
        // Higher density = darker
        p1.occlusion = Math.min(density / 12, 0.6); 
    }

    // 3. HEART TOPPER
    const topperCount = 1200; // Increased from 350
    const heartY = treeTopY - 15;
    const heartSize = 5.5;

    for (let i = 0; i < topperCount; i++) {
        const t = Math.random() * Math.PI * 2;
        const rScale = Math.pow(Math.random(), 0.3); 
        let hx = 16 * Math.pow(Math.sin(t), 3);
        let hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        const hz = (Math.random() - 0.5) * 6; 

        hx *= heartSize * rScale;
        hy *= heartSize * rScale;
        const hzFinal = hz * rScale;

        particles.push({
            x: hx,
            y: heartY + hy,
            z: hzFinal,
            radius: Math.random() * 2 + 1,
            color: getColor('topper'),
            originalX: hx,
            originalZ: hzFinal,
            yOffset: heartY + hy,
            speed: 0,
            hue: 0,
            initialAngle: 0,
            orbitRadius: 0,
            isBase: false,
            isTopper: true,
            isOrnament: false
        });
    }

    // 4. FALLING ORNAMENTS
    const ornamentCount = 150;
    for (let i = 0; i < ornamentCount; i++) {
        const r = Math.random() * maxTreeRadius * 0.9; 
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const startY = treeTopY + Math.random() * treeHeight;

        particles.push({
            x: x,
            y: startY,
            z: z,
            radius: Math.random() * 1.5 + 1.0, 
            color: getColor('ornament'),
            originalX: x,
            originalZ: z,
            yOffset: startY, 
            speed: 0.3 + Math.random() * 0.4, 
            hue: 0,
            initialAngle: angle,
            orbitRadius: r,
            isBase: false,
            isTopper: false,
            isOrnament: true
        });
    }

    particlesRef.current = particles;
    starsRef.current = stars;
  };

  // --- TREE RENDER EFFECT ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    });
    resizeObserver.observe(document.body);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(canvas.width, canvas.height);

    const render = () => {
      if (!canvas || !ctx) return;
      
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 50; 
      const fov = 1000; // Increased FOV for larger tree
      
      const now = Date.now();
      const pulse = Math.sin(now * 0.002) * 0.2 + 0.9; 

      rotationRef.current += settings.rotationSpeed;

      // Background Stars
      starsRef.current.forEach((star, index) => {
        star.x += star.speed; 
        const limitX = canvas.width * 1.5;
        if (star.x > limitX) star.x = -limitX;
        if (star.x < -limitX) star.x = limitX;

        const scale = fov / (fov + star.z);
        const x2d = star.x * scale + cx;
        const y2d = star.y * scale + cy;

        ctx.beginPath();
        ctx.fillStyle = star.color;
        
        const isTwinkler = index % 3 === 0;
        let currentRadius = star.radius * scale;
        let alphaMult = 1;

        if (isTwinkler) {
             const val = Math.sin(now * 0.002 + star.initialAngle);
             currentRadius *= (1.05 + 0.25 * val);
             alphaMult = 0.75 + 0.25 * val;
        }

        // Star DoF
        if (scale < 0.5) { // Far away stars
            ctx.shadowBlur = 4;
            ctx.shadowColor = star.color;
        }

        ctx.globalAlpha = alphaMult;
        ctx.arc(x2d, y2d, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      // Particles
      const treeHeight = Math.min(canvas.width, canvas.height) * 0.95;
      const treeBottomY = treeHeight / 2 + 60;
      const treeTopY = treeBottomY - treeHeight;

      particlesRef.current.forEach(p => {
         let localX = p.originalX;
         let localZ = p.originalZ;
         let localY = p.y; 

         if (p.isOrnament) {
             p.y += p.speed;
             if (p.y > treeBottomY + 20) {
                 p.y = treeTopY - 20; 
                 const angle = Math.random() * Math.PI * 2;
                 const r = p.orbitRadius; 
                 p.originalX = Math.cos(angle) * r;
                 p.originalZ = Math.sin(angle) * r;
             }
             localX = p.originalX;
             localZ = p.originalZ;
             localY = p.y;
         } else if (p.isBase) {
             const wave = Math.sin(now * 0.001 + p.orbitRadius * 0.005) * 1.0;
             localY = p.y + wave; 
         } else if (p.isTopper) {
             const heartBeat = 1 + 0.03 * Math.pow(Math.sin(now * 0.003), 2);
             localX = p.originalX * heartBeat;
             localY = p.y;
         } else {
             const branchMove = Math.sin(now * 0.002 + p.initialAngle) * (p.orbitRadius / 100);
             localY = p.y + branchMove;
         }

         if (p.isTopper) {
             p.x = localX;
             p.z = localZ;
         } else {
             const angle = rotationRef.current;
             p.x = localX * Math.cos(angle) - localZ * Math.sin(angle);
             p.z = localZ * Math.cos(angle) + localX * Math.sin(angle);
         }
         
         p.yOffset = localY;
      });

      particlesRef.current.sort((a, b) => b.z - a.z);

      particlesRef.current.forEach((p) => {
        const scale = fov / (fov + p.z);
        
        if (p.z <= -fov + 50) return;

        const x2d = p.x * scale + cx;
        const y2d = p.yOffset * scale + cy;
        
        // Depth of Field Calculation
        // Focus plane is at z=0 (tree center)
        // blurFactor increases as abs(z) increases
        const blurAmount = Math.abs(p.z) / 400; 
        const dofAlpha = Math.max(0.4, 1 - blurAmount * 0.5);
        const distAlpha = Math.min(1, (p.z + 800) / 1000); // Fade in from far clip

        ctx.beginPath();
        
        if (p.isOrnament) {
            const r = p.radius * scale;
            ctx.moveTo(x2d, y2d - r * 1.5);
            ctx.lineTo(x2d + r * 1.5, y2d);
            ctx.lineTo(x2d, y2d + r * 1.5);
            ctx.lineTo(x2d - r * 1.5, y2d);
            ctx.closePath();
            
            ctx.fillStyle = p.color;
            ctx.shadowBlur = (settings.glowIntensity + blurAmount * 10) * scale * 1.5;
            ctx.shadowColor = p.color;
            ctx.globalAlpha = dofAlpha;
        } else {
            if (p.isBase) {
                 ctx.arc(x2d, y2d, p.radius * scale * 3, 0, Math.PI * 2);
                 ctx.fillStyle = `rgba(0, 0, 0, ${0.05 * distAlpha})`; 
                 ctx.fill();
                 ctx.beginPath(); 
            }

            // DoF size increase for bokeh effect
            const bokehRadius = p.radius * scale * (1 + blurAmount * 0.5);
            ctx.arc(x2d, y2d, bokehRadius, 0, Math.PI * 2);
            
            ctx.fillStyle = p.color;
            
            let glowSize = settings.glowIntensity;
            
            if (p.isBase) {
                 ctx.globalAlpha = distAlpha * 0.7 * dofAlpha; 
                 glowSize *= 0.8;
            } else if (p.isTopper) {
                 // Topper stays sharp
                 glowSize *= 1.2;
                 ctx.globalAlpha = 1;
            } else {
                 ctx.globalAlpha = distAlpha * dofAlpha;
                 glowSize *= pulse;
            }

            // DoF blur increases shadow blur to look out of focus
            ctx.shadowBlur = (glowSize + blurAmount * 5) * scale; 
            ctx.shadowColor = p.color;
            
            if (Math.random() > 0.98) { 
                 ctx.fillStyle = '#FFFFFF';
                 ctx.shadowBlur = glowSize * 2.0;
                 ctx.shadowColor = '#FFFFFF';
                 ctx.globalAlpha = 1;
            }
        }

        ctx.fill();

        // Apply Ambient Occlusion for Base particles
        if (p.isBase && p.occlusion && p.occlusion > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${p.occlusion})`;
            ctx.shadowBlur = 0;
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      frameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      resizeObserver.disconnect();
    };
  }, [settings]); 

  // --- SNOW RENDER EFFECT ---
  useEffect(() => {
    const canvas = snowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    type Flake = {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      color: string;
      swayOffset: number;
    };

    let flakes: Flake[] = [];
    const count = 600;

    const initSnow = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      flakes = [];
      for (let i = 0; i < count; i++) {
        const isPink = Math.random() > 0.6;
        const color = isPink ? '255, 192, 203' : '255, 255, 255'; 

        flakes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2.5 + 0.5,
          alpha: Math.random() * 0.6 + 0.2,
          color: color,
          swayOffset: Math.random() * Math.PI * 2
        });
      }
    };

    initSnow();
    
    const handleResize = () => {
        initSnow();
    };
    window.addEventListener('resize', handleResize);

    let angle = 0;

    const drawSnow = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.005; 
      
      for (let i = 0; i < count; i++) {
        const f = flakes[i];
        
        ctx.fillStyle = `rgba(${f.color}, ${f.alpha})`;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, true);
        ctx.fill();
        
        // Physics
        const speed = f.radius * 0.3 + 0.4; 
        f.y += speed;
        f.x += Math.sin(angle + f.swayOffset) * 0.5; 

        // Reset
        if (f.y > canvas.height) {
          flakes[i] = { 
              ...f,
              x: Math.random() * canvas.width, 
              y: -10,
              alpha: Math.random() * 0.6 + 0.2 
          };
        }
        
        if (f.x > canvas.width + 5) flakes[i].x = -5;
        if (f.x < -5) flakes[i].x = canvas.width + 5;
      }
      
      snowFrameIdRef.current = requestAnimationFrame(drawSnow);
    };

    drawSnow();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(snowFrameIdRef.current);
    };
  }, []);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 w-full h-full pointer-events-none z-10"
      />
      <canvas 
        ref={snowCanvasRef} 
        className="fixed inset-0 w-full h-full pointer-events-none z-40"
      />
    </>
  );
};

export default TreeCanvas;