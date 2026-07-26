import { create } from 'zustand';

export const useGameStore = create((set) => ({
  gameState: 'menu', // 'menu', 'playing', 'gameover'
  speed: 0, // Current speed in km/h
  distance: 0, // Distance traveled in meters
  timeDilation: 1.0, 
  
  startGame: () => set({ gameState: 'playing', speed: 20, distance: 0, timeDilation: 1.0 }),
  endGame: () => set({ gameState: 'gameover' }),
  goToMenu: () => set({ gameState: 'menu', speed: 0, distance: 0 }),
  
  setSpeed: (val) => set({ speed: val }),
  addDistance: (val) => set((state) => ({ distance: state.distance + val })),
  
  setTimeDilation: (value) => set({ timeDilation: value }),
}));
