import React, { useState } from 'react';
import TreeCanvas from './components/TreeCanvas';
import Controls from './components/Controls';
import { TreeSettings } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<TreeSettings>({
    rotationSpeed: 0.003, // Slower, majestic rotation
    particleCount: 9000, // Significantly increased density
    glowIntensity: 12,
    treeColor: 'pink-gold' // Default to match image
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      
      {/* Background Ambience - Darker for contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_var(--tw-gradient-stops))] from-slate-900 via-black to-black z-0"></div>
      
      {/* Global Ambient Glow Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-pink-900/30 via-transparent to-transparent z-0 pointer-events-none animate-pulse" 
        style={{ animationDuration: '5s' }}
      ></div>

      {/* Visual Components - TreeCanvas now includes Snowfall */}
      <TreeCanvas settings={settings} />

      {/* Foreground UI - Left Aligned Layout */}
      <div className="absolute top-1/3 left-8 md:left-24 transform -translate-y-1/2 pointer-events-none z-20 text-left">
        <h1 className="text-6xl md:text-8xl font-['Mountains_of_Christmas'] font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-white drop-shadow-[0_0_25px_rgba(255,200,200,0.6)] leading-tight">
          Merry<br/>
          Christmas<br/>
          <span className="font-['Zen_Maru_Gothic'] text-5xl md:text-7xl">杜梦涵</span>
        </h1>
        <p className="mt-4 text-pink-200/80 font-light tracking-[0.2em] uppercase text-sm md:text-lg pl-2">
          Make a wish
        </p>
      </div>

      <Controls settings={settings} setSettings={setSettings} />
      
      <div className="absolute bottom-4 right-4 text-white/10 text-xs pointer-events-none">
         Built with Gemini & React
      </div>
    </div>
  );
};

export default App;