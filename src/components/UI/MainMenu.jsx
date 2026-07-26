import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { Play, Settings, Trophy } from 'lucide-react';

export default function MainMenu() {
  const startGame = useGameStore((state) => state.startGame);
  const [sysMsg, setSysMsg] = useState('');

  const handleSystemClick = (msg) => {
    setSysMsg(msg);
    setTimeout(() => setSysMsg(''), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="mb-12 text-center"
      >
        <h1 className="text-6xl md:text-8xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 drop-shadow-glowCyan">
          ENGG. DRIVING
        </h1>
        <h2 className="text-2xl md:text-4xl font-bold font-inter text-white tracking-[0.3em] mt-2 opacity-80 uppercase">
          Next Gen Simulator
        </h2>
      </motion.div>

      <div className="flex flex-col gap-4 w-64">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 243, 255, 0.6)' }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-glassBg border border-glassBorder rounded-xl text-neonCyan font-orbitron font-bold text-xl transition-all duration-300"
        >
          <Play size={24} />
          INITIALIZE
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSystemClick('CONNECTING TO GLOBAL SERVER...')}
          className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-glassBg border border-glassBorder rounded-xl text-neonMagenta font-orbitron font-bold text-xl transition-all duration-300"
        >
          <Trophy size={24} />
          RANKINGS
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSystemClick('SYSTEM ACCESS DENIED')}
          className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-glassBg border border-glassBorder rounded-xl text-white font-orbitron font-bold text-xl transition-all duration-300 opacity-80"
        >
          <Settings size={24} />
          SYSTEM
        </motion.button>
      </div>

      <div className="h-8 mt-8">
        <AnimatePresence>
          {sysMsg && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="text-red-500 font-orbitron text-sm tracking-widest drop-shadow-glowMagenta"
            >
              {sysMsg}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
