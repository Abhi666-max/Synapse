import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import MainMenu from './components/UI/MainMenu';
import { useGameStore } from './store/gameStore';

function GameScene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#00f3ff" />
      <pointLight position={[-10, 5, -10]} intensity={2} color="#ff00ff" />
      <fog attach="fog" args={['#050505', 10, 50]} />

      {/* Placeholder for Physics World */}
      <Physics gravity={[0, -30, 0]}>
        {/* Placeholder for Player */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1, 1, 2]} />
          <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        
        {/* Ground */}
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[20, 1, 100]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
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
          offset={[0.002, 0.002]} 
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
    <div className="w-screen h-screen bg-darkBg overflow-hidden relative">
      {/* UI Layer */}
      {gameState === 'menu' && <MainMenu />}

      {/* 3D Canvas Layer */}
      <Canvas 
        shadows 
        camera={{ position: [0, 5, 10], fov: 60 }} 
        gl={{ antialias: false }} // Disabled for post-processing performance
      >
        <Suspense fallback={null}>
          {/* We always render the scene, but logic changes based on state inside components */}
          <GameScene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
