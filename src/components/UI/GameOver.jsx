import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { RotateCcw, Home } from 'lucide-react';

export default function GameOver() {
  const score = useGameStore((state) => state.score);
  const startGame = useGameStore((state) => state.startGame);
  const goToMenu = useGameStore((state) => state.goToMenu);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
        className="text-center bg-glassBg border border-glassBorder p-12 rounded-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-black font-orbitron text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] mb-4">
          SYSTEM FAILURE
        </h1>
        
        <p className="text-gray-300 font-inter text-xl tracking-widest uppercase mb-8">Collision Detected</p>

        <div className="mb-10">
          <p className="text-neonCyan font-orbitron text-sm tracking-widest opacity-80 uppercase mb-2">Final Score</p>
          <p className="text-white font-inter font-black text-6xl drop-shadow-glowCyan">{score.toLocaleString()}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 243, 255, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="flex items-center justify-center gap-3 py-4 px-8 bg-glassBg border border-glassBorder rounded-xl text-neonCyan font-orbitron font-bold text-lg"
          >
            <RotateCcw size={20} />
            REBOOT SYSTEM
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={goToMenu}
            className="flex items-center justify-center gap-3 py-4 px-8 bg-glassBg border border-glassBorder rounded-xl text-white font-orbitron font-bold text-lg"
          >
            <Home size={20} />
            MAIN MENU
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
