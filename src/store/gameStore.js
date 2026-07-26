import { create } from 'zustand';

export const useGameStore = create((set) => ({
  gameState: 'menu', // 'menu', 'playing', 'gameover'
  score: 0,
  speed: 40, // Faster game speed for arcade feel
  timeDilation: 1.0, 
  currentLane: 0, // -1: Left, 0: Center, 1: Right
  
  startGame: () => set({ gameState: 'playing', score: 0, speed: 40, timeDilation: 1.0, currentLane: 0 }),
  endGame: () => set({ gameState: 'gameover' }),
  goToMenu: () => set({ gameState: 'menu', score: 0, currentLane: 0 }),
  
  addScore: (points) => set((state) => ({ score: state.score + points })),
  increaseSpeed: (amount) => set((state) => ({ speed: state.speed + amount })),
  
  setTimeDilation: (value) => set({ timeDilation: value }),
  
  moveLane: (dir) => set((state) => {
    let newLane = state.currentLane + dir;
    if (newLane < -1) newLane = -1;
    if (newLane > 1) newLane = 1;
    return { currentLane: newLane };
  }),
}));
