import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion } from 'framer-motion';

export default function HUD() {
  const score = useGameStore((state) => state.score);
  const timeDilation = useGameStore((state) => state.timeDilation);
  
  // Slowly increase score while playing
  useEffect(() => {
    const interval = setInterval(() => {
      useGameStore.getState().addScore(1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-glassBg border border-glassBorder px-6 py-3 rounded-xl backdrop-blur-md"
        >
          <p className="text-neonCyan font-orbitron text-sm tracking-widest opacity-80 uppercase">Score</p>
          <p className="text-white font-inter font-black text-3xl">{score.toLocaleString()}</p>
        </motion.div>
        
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-glassBg border border-glassBorder px-6 py-3 rounded-xl backdrop-blur-md text-right"
        >
          <p className="text-neonMagenta font-orbitron text-sm tracking-widest opacity-80 uppercase">System Status</p>
          <p className="text-white font-inter font-bold text-xl text-green-400">ONLINE</p>
        </motion.div>
      </div>

      <div className="flex justify-center mb-10">
        {timeDilation < 0.5 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-neonMagenta font-orbitron font-black text-4xl tracking-[0.5em] drop-shadow-glowMagenta animate-pulse-fast"
          >
            TIME DILATION ACTIVE
          </motion.div>
        )}
      </div>
    </div>
  );
}
