import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion } from 'framer-motion';
import { Pause, Settings, Volume2, VolumeX } from 'lucide-react';

export default function HUD() {
  const score = useGameStore((state) => state.score);
  const timeDilation = useGameStore((state) => state.timeDilation);
  const goToMenu = useGameStore((state) => state.goToMenu);
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Slowly increase score while playing
  useEffect(() => {
    const interval = setInterval(() => {
      useGameStore.getState().addScore(1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start pointer-events-auto">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-glassBg border border-glassBorder px-6 py-3 rounded-xl backdrop-blur-md"
        >
          <p className="text-neonCyan font-orbitron text-sm tracking-widest opacity-80 uppercase">Score</p>
          <p className="text-white font-inter font-black text-3xl drop-shadow-glowCyan">{score.toLocaleString()}</p>
        </motion.div>
        
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex gap-4"
        >
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-glassBg border border-glassBorder p-3 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} className="text-red-500" />}
          </button>
          
          <button 
            className="bg-glassBg border border-glassBorder p-3 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            <Settings size={24} />
          </button>
          
          <button 
            onClick={goToMenu}
            className="bg-glassBg border border-neonMagenta p-3 rounded-full hover:bg-neonMagenta/20 transition-colors text-neonMagenta shadow-[0_0_15px_rgba(255,0,255,0.3)]"
          >
            <Pause size={24} />
          </button>
        </motion.div>
      </div>

      <div className="flex justify-center mb-10">
        {timeDilation < 0.5 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-neonMagenta font-orbitron font-black text-4xl md:text-5xl tracking-[0.5em] drop-shadow-glowMagenta animate-pulse-fast text-center"
          >
            TIME DILATION ACTIVE
          </motion.div>
        )}
      </div>
    </div>
  );
}
