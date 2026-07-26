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

function GameScene() {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#00f3ff" />
      <pointLight position={[-10, 5, -10]} intensity={2} color="#ff00ff" />
      <fog attach="fog" args={['#050505', 10, 50]} />

      <Environment />

      {/* Physics World */}
      <Physics gravity={[0, -30, 0]} paused={gameState !== 'playing'}>
        <Player />
        <Obstacles />
      </Physics>
      
      {/* Post-Processing Effects for Premium Look */}
      <EffectComposer disableNormalPass multisampling={4}>
        <Bloom 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          height={300} 
          intensity={1.5} 
        />
        <ChromaticAberration 
          offset={[0.003, 0.003]} 
          blendFunction={BlendFunction.NORMAL} 
        />
        <Noise opacity={0.03} />
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
