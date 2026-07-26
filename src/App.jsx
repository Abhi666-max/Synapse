import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import MainMenu from './components/UI/MainMenu';
import HUD from './components/UI/HUD';
import GameOver from './components/UI/GameOver';
import Player from './components/Game/Player';
import Environment from './components/Game/Environment';
import Obstacles from './components/Game/Obstacles';
import { useGameStore } from './store/gameStore';

import Bots from './components/Game/Bots';

function GameScene() {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <>
      {/* Sunset Village Lighting */}
      <ambientLight intensity={0.4} color="#ffd8b1" />
      <directionalLight position={[-20, 15, -50]} intensity={1.5} color="#ff7a00" castShadow />
      <pointLight position={[0, 10, -100]} intensity={1.2} color="#ff3300" />
      
      {/* Pushed fog far back for visibility */}
      <fog attach="fog" args={['#2a1636', 50, 300]} />

      {/* Physics World */}
      <Physics gravity={[0, -30, 0]} paused={gameState !== 'playing'}>
        <Environment />
        <Player />
        <Bots />
        <Obstacles />
      </Physics>
      
      {/* Post-Processing Effects for Evening Glow */}
      <EffectComposer disableNormalPass multisampling={4}>
        <Bloom 
          luminanceThreshold={0.4} 
          luminanceSmoothing={0.9} 
          height={300} 
          intensity={1.0} 
        />
        <ChromaticAberration 
          offset={[0.001, 0.001]} 
          blendFunction={BlendFunction.NORMAL} 
        />
        <Noise opacity={0.02} />
      </EffectComposer>
    </>
  );
}

function App() {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <div className="w-screen h-screen bg-darkBg overflow-hidden relative font-inter">
      {/* UI Layer */}
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'playing' && <HUD />}
      {gameState === 'gameover' && <GameOver />}

      {/* 3D Canvas Layer */}
      <Canvas 
        shadows 
        camera={{ position: [0, 5, 10], fov: 60 }} 
        gl={{ antialias: false, powerPreference: "high-performance" }} 
      >
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
