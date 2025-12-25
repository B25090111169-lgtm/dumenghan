import React, { useEffect, useRef } from 'react';

const Snowfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    type Flake = {
      x: number;
      y: number;
      radius: number;
      density: number;
      alpha: number;
      color: string;
      swayOffset: number;
    };

    let flakes: Flake[] = [];
    const count = 600; // Increased density for full-screen effect

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      flakes = [];
      for (let i = 0; i < count; i++) {
        const isPink = Math.random() > 0.6;
        const color = isPink ? '255, 192, 203' : '255, 255, 255'; 

        flakes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2.5 + 0.5, // Slightly larger max size for depth
          density: Math.random() * count,
          alpha: Math.random() * 0.6 + 0.2,
          color: color,
          swayOffset: Math.random() * Math.PI * 2
        });
      }
    };

    init();
    
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Re-initialize to fill new space immediately
        init();
    };
    window.addEventListener('resize', handleResize);

    let frameId = 0;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      angle += 0.005; 
      
      for (let i = 0; i < count; i++) {
        const f = flakes[i];
        
        ctx.fillStyle = `rgba(${f.color}, ${f.alpha})`;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, true);
        ctx.fill();
        
        const speed = f.radius * 0.3 + 0.4; // Slightly faster fall
        f.y += speed;

        f.x += Math.sin(angle + f.swayOffset) * 0.5; // More sway

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
      
      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Changed z-0 to z-40 to place snow in front of tree (z-10) and text (z-20) but behind controls (z-50)
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-40" />;
};

export default Snowfall;