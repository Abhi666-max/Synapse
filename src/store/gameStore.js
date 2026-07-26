import { create } from 'zustand';

export const useGameStore = create((set) => ({
  gameState: 'menu', // 'menu', 'playing', 'gameover'
  speed: 0, // Current speed in km/h
  distance: 0, // Distance traveled in meters
  timeDilation: 1.0, 
  bots: Array(5).fill({ lane: 1, z: 0, crashed: false, speed: 0 }),
  obstacles: [],
  
  setBots: (botsData) => set({ bots: botsData }),
  setObstacles: (obs) => set({ obstacles: obs }),
  
  startGame: () => set({ gameState: 'playing', speed: 20, distance: 0, timeDilation: 1.0, bots: Array(5).fill({ lane: 1, z: 0, crashed: false, speed: 0 }), obstacles: [] }),
  endGame: () => set({ gameState: 'gameover', speed: 0 }),
  resetGame: () => set({ 
    gameState: 'menu', 
    distance: 0, 
    speed: 0,
    bots: Array(5).fill({ lane: 1, z: 0, crashed: false, speed: 0 }),
    obstacles: []
  }),
  
  setSpeed: (val) => set({ speed: val }),
  addDistance: (val) => set((state) => ({ distance: state.distance + val })),
  
  setTimeDilation: (value) => set({ timeDilation: value }),
}));
