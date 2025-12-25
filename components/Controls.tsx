import React, { useState } from 'react';
import { TreeSettings } from '../types';
import { generateChristmasWish } from '../services/geminiService';

interface ControlsProps {
  settings: TreeSettings;
  setSettings: React.Dispatch<React.SetStateAction<TreeSettings>>;
}

type ViewMode = 'full' | 'mini' | 'hidden';

const Controls: React.FC<ControlsProps> = ({ settings, setSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [wish, setWish] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState("Hope");
  const [viewMode, setViewMode] = useState<ViewMode>('full');

  const handleGenerateWish = async () => {
    if (!process.env.API_KEY) {
      setWish("Please provide an API Key in the environment to use AI features.");
      return;
    }
    setIsGenerating(true);
    const newWish = await generateChristmasWish(theme);
    setWish(newWish);
    setIsGenerating(false);
  };

  const cycleColor = () => {
    setSettings(p => {
      const next = p.treeColor === 'pink-gold' ? 'green' 
                   : p.treeColor === 'green' ? 'rainbow' 
                   : p.treeColor === 'rainbow' ? 'gold' 
                   : 'pink-gold';
      return {...p, treeColor: next};
    });
  };

  // Hidden Mode View - Only shows a restore button
  if (viewMode === 'hidden') {
    return (
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <button 
          onClick={() => setViewMode('full')}
          className="bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-md p-3 rounded-full text-white/70 hover:text-white transition-all shadow-lg border border-white/10 group"
          title="Show Controls"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 flex flex-col items-center pointer-events-none">
      
      {/* Dynamic Wish Display */}
      <div className={`transition-all duration-1000 ease-out mb-8 text-center max-w-2xl 
        ${wish ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {wish && (
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
            <p className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-100 to-amber-200 font-['Mountains_of_Christmas'] font-bold tracking-wide leading-relaxed">
              "{wish}"
            </p>
          </div>
        )}
      </div>

      {/* Main Control Bar */}
      <div className={`pointer-events-auto bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-full flex items-center shadow-2xl transition-all duration-300 ${viewMode === 'mini' ? 'px-4 py-2 gap-3' : 'px-6 py-3 gap-4'}`}>
        
        {/* Color Toggle */}
        <button 
          onClick={cycleColor}
          className="p-2 rounded-full hover:bg-white/10 transition-colors group"
          title="Change Color Theme"
        >
          <div className={`w-6 h-6 rounded-full border-2 border-white shadow-[0_0_10px_currentColor] transition-all duration-500
            ${settings.treeColor === 'green' ? 'bg-green-600 text-green-500' : 
              settings.treeColor === 'gold' ? 'bg-amber-400 text-amber-400' : 
              settings.treeColor === 'pink-gold' ? 'bg-pink-400 text-pink-400 shadow-[0_0_15px_#f472b6]' :
              'bg-gradient-to-br from-red-500 via-green-500 to-blue-500 text-white'}`}
          />
        </button>

        <div className="h-8 w-[1px] bg-white/20"></div>

        {viewMode === 'full' ? (
          <>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white/90 font-medium hover:text-white transition-colors flex items-center gap-2"
            >
              <span>Settings</span>
              <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="h-8 w-[1px] bg-white/20"></div>

            {/* AI Generator Button */}
            <div className="flex items-center gap-2">
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-transparent text-white/80 text-sm border-none outline-none focus:ring-0 cursor-pointer text-right max-w-[80px]"
              >
                <option value="Hope" className="text-black">Hope</option>
                <option value="Love" className="text-black">Love</option>
                <option value="Childhood Magic" className="text-black">Magic</option>
                <option value="Snow" className="text-black">Snow</option>
                <option value="Family" className="text-black">Family</option>
              </select>
              <button 
                onClick={handleGenerateWish}
                disabled={isGenerating}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                    <span>AI Wish</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Mini Mode Content: Just Icons */
          <>
             <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white/90 hover:text-white transition-colors p-1"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
             <button
              onClick={handleGenerateWish}
              disabled={isGenerating}
              className="text-pink-400 hover:text-pink-300 transition-colors p-1 disabled:opacity-50"
              title={`Generate ${theme} Wish`}
            >
               {isGenerating ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : (
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
               )}
            </button>
          </>
        )}

        <div className="h-8 w-[1px] bg-white/20"></div>

        {/* View Controls: Minimize and Hide */}
        <div className="flex items-center gap-1">
          {/* Shrink/Expand Button */}
          <button 
            onClick={() => setViewMode(viewMode === 'full' ? 'mini' : 'full')}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title={viewMode === 'full' ? "Minimize" : "Expand"}
          >
             {viewMode === 'full' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                </svg>
             ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
             )}
          </button>
          
          {/* Hide Button */}
          <button 
             onClick={() => setViewMode('hidden')}
             className="p-1.5 rounded-full hover:bg-red-500/20 text-white/60 hover:text-red-300 transition-colors"
             title="Hide Controls"
          >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>

      </div>

      {/* Expanded Settings Panel */}
      {isOpen && viewMode !== 'hidden' && (
        <div className="mt-4 pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
           <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">Rotation Speed</label>
                <input 
                  type="range" 
                  min="0" 
                  max="0.05" 
                  step="0.001" 
                  value={settings.rotationSpeed}
                  onChange={(e) => setSettings({...settings, rotationSpeed: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">Glow Intensity</label>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="1" 
                  value={settings.glowIntensity}
                  onChange={(e) => setSettings({...settings, glowIntensity: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 block">Density (Requires Restart)</label>
                <input 
                  type="range" 
                  min="500" 
                  max="9000" 
                  step="500" 
                  value={settings.particleCount}
                  onChange={(e) => setSettings({...settings, particleCount: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Controls;