import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion } from 'framer-motion';
import { Pause, Settings, Volume2, VolumeX } from 'lucide-react';

export default function HUD() {
  const speed = useGameStore((state) => state.speed);
  const distance = useGameStore((state) => state.distance);
  const timeDilation = useGameStore((state) => state.timeDilation);
  const goToMenu = useGameStore((state) => state.goToMenu);
  
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start pointer-events-auto">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex gap-4"
        >
          <div className="bg-glassBg border border-glassBorder px-6 py-3 rounded-xl backdrop-blur-md">
            <p className="text-neonCyan font-orbitron text-sm tracking-widest opacity-80 uppercase">Speed</p>
            <p className="text-white font-inter font-black text-3xl drop-shadow-glowCyan">
              {Math.floor(speed)} <span className="text-sm font-normal text-gray-400">km/h</span>
            </p>
          </div>
          
          <div className="bg-glassBg border border-glassBorder px-6 py-3 rounded-xl backdrop-blur-md">
            <p className="text-green-400 font-orbitron text-sm tracking-widest opacity-80 uppercase">Distance</p>
            <p className="text-white font-inter font-black text-3xl drop-shadow-glowCyan">
              {Math.floor(distance)} <span className="text-sm font-normal text-gray-400">m</span>
            </p>
          </div>
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
      
      {/* Steering Controls Hint */}
      <div className="flex justify-center mb-10 text-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/50 font-orbitron font-bold text-lg tracking-widest bg-black/40 px-6 py-2 rounded-full flex flex-col"
        >
          <span>Use W/S/Arrows to Move • A/D/Arrows to Steer</span>
          <span className="text-sm mt-1 text-neonCyan">Press 'C' to Change Camera Angle</span>
        </motion.div>
      </div>
    </div>
  );
}
