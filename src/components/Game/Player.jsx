import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, vec3 } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

export default function Player() {
  const rigidBody = useRef();
  const playerMesh = useRef();
  const gameState = useGameStore((state) => state.gameState);
  const speed = useGameStore((state) => state.speed);
  const endGame = useGameStore((state) => state.endGame);

  // Setup basic keyboard controls via standard event listeners since we didn't setup KeyboardControls wrapper in App yet
  // We can just use zustand or a local ref for simple A/D or Left/Right input
  const keys = useRef({ left: false, right: false, space: false });

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = true;
      if (e.code === 'Space') keys.current.space = true;
    };
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = false;
      if (e.code === 'Space') keys.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (gameState !== 'playing' || !rigidBody.current) return;

    // Movement Logic
    const rbPosition = rigidBody.current.translation();
    const impulse = { x: 0, y: 0, z: 0 };
    
    // Side to side dodging
    const dodgeSpeed = 30 * delta;
    if (keys.current.left && rbPosition.x > -8) {
      impulse.x = -dodgeSpeed;
    } else if (keys.current.right && rbPosition.x < 8) {
      impulse.x = dodgeSpeed;
    }
    
    // Time dilation (Slow-mo) on Spacebar
    const targetDilation = keys.current.space ? 0.2 : 1.0;
    useGameStore.getState().setTimeDilation(
      THREE.MathUtils.lerp(useGameStore.getState().timeDilation, targetDilation, 0.1)
    );

    // Apply forces
    rigidBody.current.applyImpulse(impulse, true);

    // Subtle tilting effect based on movement
    if (playerMesh.current) {
      playerMesh.current.rotation.z = THREE.MathUtils.lerp(
        playerMesh.current.rotation.z,
        keys.current.left ? 0.3 : keys.current.right ? -0.3 : 0,
        0.1
      );
    }
  });

  return (
    <RigidBody 
      ref={rigidBody} 
      position={[0, 1, 0]} 
      colliders="cuboid"
      lockRotations
      onCollisionEnter={({ other }) => {
        // Simple Game Over collision logic
        if (other.rigidBodyObject?.name === 'obstacle') {
          endGame();
        }
      }}
    >
      <mesh ref={playerMesh} castShadow>
        {/* =========================================================
            WANT A REAL BMW M4? DO THIS:
            1. Download a BMW M4 model in .glb format (e.g., from Sketchfab).
            2. Put the downloaded file (e.g., 'bmw_m4.glb') in the 'public' folder.
            3. Import useGLTF from '@react-three/drei': 
               import { useGLTF } from '@react-three/drei';
            4. Load the model inside this component:
               const { scene } = useGLTF('/bmw_m4.glb');
            5. Replace this entire <mesh> block with:
               <primitive object={scene} scale={[0.5, 0.5, 0.5]} />
            ========================================================= */}
            
        {/* --- PROCEDURAL CYBER SPORTS CAR --- */}
        {/* Main Body (Sleek Wedge) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.4, 0.4, 3]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Cabin / Windows */}
        <mesh position={[0, 0.35, -0.2]}>
          <boxGeometry args={[1, 0.4, 1.5]} />
          <meshStandardMaterial color="#000000" metalness={1} roughness={0} />
        </mesh>

        {/* Neon Side Trims */}
        <mesh position={[-0.71, 0, 0]}>
          <boxGeometry args={[0.05, 0.1, 2.8]} />
          <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <mesh position={[0.71, 0, 0]}>
          <boxGeometry args={[0.05, 0.1, 2.8]} />
          <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={3} toneMapped={false} />
        </mesh>

        {/* Spoiler */}
        <mesh position={[0, 0.4, 1.4]}>
          <boxGeometry args={[1.4, 0.05, 0.3]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.8} />
        </mesh>
        <mesh position={[-0.6, 0.2, 1.4]}>
          <boxGeometry args={[0.05, 0.4, 0.2]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0.6, 0.2, 1.4]}>
          <boxGeometry args={[0.05, 0.4, 0.2]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>

        {/* Glowing Wheels (Cylinders) */}
        {/* Front Left */}
        <mesh position={[-0.8, -0.1, -1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        {/* Front Right */}
        <mesh position={[0.8, -0.1, -1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        {/* Back Left */}
        <mesh position={[-0.8, -0.1, 1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        {/* Back Right */}
        <mesh position={[0.8, -0.1, 1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} toneMapped={false} />
        </mesh>

        {/* Tail Lights (Engine Glows) */}
        <mesh position={[-0.5, 0, 1.51]}>
          <boxGeometry args={[0.4, 0.1, 0.05]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={5} toneMapped={false} />
        </mesh>
        <mesh position={[0.5, 0, 1.51]}>
          <boxGeometry args={[0.4, 0.1, 0.05]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={5} toneMapped={false} />
        </mesh>
      </mesh>
    </RigidBody>
  );
}
