import { create } from 'zustand';

export const useGameStore = create((set) => ({
  gameState: 'menu', // 'menu', 'playing', 'gameover'
  score: 0,
  speed: 20, // Initial game speed
  timeDilation: 1.0, // For slow-mo mechanic
  
  startGame: () => set({ gameState: 'playing', score: 0, speed: 20, timeDilation: 1.0 }),
  endGame: () => set({ gameState: 'gameover' }),
  goToMenu: () => set({ gameState: 'menu', score: 0 }),
  
  addScore: (points) => set((state) => ({ score: state.score + points })),
  increaseSpeed: (amount) => set((state) => ({ speed: state.speed + amount })),
  
  setTimeDilation: (value) => set({ timeDilation: value }),
}));
